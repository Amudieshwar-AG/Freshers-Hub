import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { getBackendUrl } from '@/lib/utils';
import GoogleAuthModal from '@/components/Auth/GoogleAuthModal';
import { getStoredImsSession, clearImsSession, saveImsSession, loginWithIms, type StudentInfo } from '@/services/imsService';

// ──────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  pictureUrl?: string;
  verifiedStudent: boolean;
  role?: 'ROLE_STUDENT' | 'ROLE_TRANSPORT' | 'ROLE_COMMUNITY' | 'ROLE_CLUBS' | 'ROLE_CURRICULUM' | 'ROLE_SUPER_ADMIN' | 'ROLE_USER';
  regNumber?: string;
  department?: string;
}

export interface LoginCredentialsResult {
  success: boolean;
  message?: string;
  redirectTo?: string;
  role?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isVerifiedStudent: boolean;
  isAdmin: boolean;
  isTransportAdmin: boolean;
  isCommunityAdmin: boolean;
  isClubsAdmin: boolean;
  isCurriculumAdmin: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  loginWithGoogle: () => void;
  loginWithCredentials: (username: string, password: string) => Promise<LoginCredentialsResult>;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  logout: () => void;
}

// ──────────────────────────────────────────────────
// Google Client ID
// ──────────────────────────────────────────────────

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '81935488244-vmab5t8fipfof1n6l7di7eg4fve6k8lf.apps.googleusercontent.com';

// ──────────────────────────────────────────────────
// Context
// ──────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isVerifiedStudent: false,
  isAdmin: false,
  isTransportAdmin: false,
  isCommunityAdmin: false,
  isClubsAdmin: false,
  isCurriculumAdmin: false,
  isLoading: true,
  isAuthModalOpen: false,
  loginWithGoogle: () => {},
  loginWithCredentials: async () => ({ success: false }),
  openAuthModal: () => {},
  closeAuthModal: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

// ──────────────────────────────────────────────────
// Storage Keys
// ──────────────────────────────────────────────────

const GOOGLE_STORAGE_KEY = 'rit_auth_user';
const ADMIN_TOKEN_KEY = 'RIT_ADMIN_TOKEN';
const ADMIN_ROLE_KEY = 'RIT_ADMIN_ROLE';
const ADMIN_USER_KEY = 'RIT_ADMIN_USER';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const openAuthModal = useCallback(() => setIsAuthModalOpen(true), []);
  const closeAuthModal = useCallback(() => setIsAuthModalOpen(false), []);

  // Restore any active session on app load
  useEffect(() => {
    // 1. Check Admin Session
    const adminToken = localStorage.getItem(ADMIN_TOKEN_KEY);
    const adminRole = localStorage.getItem(ADMIN_ROLE_KEY);
    const adminUser = localStorage.getItem(ADMIN_USER_KEY);
    if (adminToken && adminRole) {
      setUser({
        id: 999999,
        name: adminUser || (adminRole === 'ROLE_TRANSPORT' ? 'Transport Admin' : 'Super Admin'),
        email: adminRole === 'ROLE_TRANSPORT' ? 'transport@ritchennai.edu.in' : 'admin@ritchennai.edu.in',
        verifiedStudent: false,
        role: adminRole as any,
      });
      setIsLoading(false);
      return;
    }

    // 2. Check IMS Student Session
    const imsSession = getStoredImsSession();
    if (imsSession?.student) {
      setUser({
        id: Number(imsSession.student.regNumber) || 1,
        name: imsSession.student.name,
        email: imsSession.student.email,
        regNumber: imsSession.student.regNumber,
        department: imsSession.student.department,
        verifiedStudent: true,
        role: 'ROLE_STUDENT',
      });
      setIsLoading(false);
      return;
    }

    // 3. Check Google Session
    const googleStored = localStorage.getItem(GOOGLE_STORAGE_KEY);
    if (googleStored) {
      try {
        const parsed = JSON.parse(googleStored) as AuthUser;
        setUser({ ...parsed, role: 'ROLE_USER' });
      } catch {
        localStorage.removeItem(GOOGLE_STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  // Handle Google OAuth GSI
  const handleCredentialResponse = useCallback(async (response: { credential: string }) => {
    try {
      const res = await fetch(getBackendUrl('/api/auth/google'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      });

      if (res.ok) {
        const userData: AuthUser = await res.json();
        const userObj: AuthUser = { ...userData, role: 'ROLE_USER' };
        setUser(userObj);
        localStorage.setItem(GOOGLE_STORAGE_KEY, JSON.stringify(userObj));
        setIsAuthModalOpen(false);
      }
    } catch (err) {
      console.error('Google auth error:', err);
    }
  }, []);

  // Initialize Google GSI
  useEffect(() => {
    const initGSI = () => {
      if (!window.google || !GOOGLE_CLIENT_ID) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });
    };

    if (window.google) {
      initGSI();
    } else {
      const interval = setInterval(() => {
        if (window.google) {
          clearInterval(interval);
          initGSI();
        }
      }, 200);
      setTimeout(() => clearInterval(interval), 10000);
    }
  }, [handleCredentialResponse]);

  const loginWithGoogle = useCallback(() => {
    setIsAuthModalOpen(true);
    if (window.google) {
      try {
        window.google.accounts.id.prompt();
      } catch {}
    }
  }, []);

  // ─────────────────────────────────────────────────────────────
  // UNIFIED CREDENTIALS SIGN-IN (Students & Admins)
  // ─────────────────────────────────────────────────────────────
  const loginWithCredentials = useCallback(async (username: string, password: string): Promise<LoginCredentialsResult> => {
    const cleanedUser = username.trim();
    const cleanedPass = password.trim();

    if (!cleanedUser || !cleanedPass) {
      return { success: false, message: 'Please enter both username/register number and password.' };
    }

    const isAdminUsername = [
      'admin', 'transport', 'transportadmin', 
      'community', 'communityadmin', 'qa', 'seniorqa', 
      'clubs', 'club', 'clubsadmin', 
      'curriculum', 'curriculumadmin', 'gpa', 'gpaadmin', 'academics',
      'ritadmin', 'superadmin'
    ].includes(cleanedUser.toLowerCase());

    // 1. First, check if credentials match Admin / Role Endpoints
    if (isAdminUsername) {
      try {
        const adminRes = await fetch(getBackendUrl('/api/admin/login'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: cleanedUser, password: cleanedPass }),
        });

        if (adminRes.ok) {
          const data = await adminRes.json();
          if (data.success && data.token && data.role) {
            localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
            localStorage.setItem(ADMIN_ROLE_KEY, data.role);
            localStorage.setItem(ADMIN_USER_KEY, data.username);

            const adminUserObj: AuthUser = {
              id: 999999,
              name: data.username,
              email: `${cleanedUser.toLowerCase()}@ritchennai.edu.in`,
              verifiedStudent: false,
              role: data.role,
            };
            setUser(adminUserObj);
            setIsAuthModalOpen(false);

            return {
              success: true,
              role: data.role,
              redirectTo: '/admin',
              message: `${data.username} logged in successfully`,
            };
          }
        }
      } catch {
        // If admin endpoint fails or is offline, check fallback
      }
    }

    const isStdPass = cleanedPass === 'RIT@2026' || cleanedPass === 'rit@2026';

    // Direct local check for Admin credentials fallbacks
    if (['transport', 'transportadmin'].includes(cleanedUser.toLowerCase()) && isStdPass) {
      const role = 'ROLE_TRANSPORT';
      localStorage.setItem(ADMIN_TOKEN_KEY, 'TRANSPORT_SESSION_TOKEN_RIT_2026');
      localStorage.setItem(ADMIN_ROLE_KEY, role);
      localStorage.setItem(ADMIN_USER_KEY, 'Transport Admin');
      setUser({
        id: 999999,
        name: 'Transport Admin',
        email: 'transport@ritchennai.edu.in',
        verifiedStudent: false,
        role,
      });
      setIsAuthModalOpen(false);
      return { success: true, role, redirectTo: '/admin' };
    }

    if (['community', 'qa', 'communityadmin', 'seniorqa'].includes(cleanedUser.toLowerCase()) && isStdPass) {
      const role = 'ROLE_COMMUNITY';
      localStorage.setItem(ADMIN_TOKEN_KEY, 'COMMUNITY_SESSION_TOKEN_RIT_2026');
      localStorage.setItem(ADMIN_ROLE_KEY, role);
      localStorage.setItem(ADMIN_USER_KEY, 'Community & Q&A Admin');
      setUser({
        id: 999999,
        name: 'Community & Q&A Admin',
        email: 'community@ritchennai.edu.in',
        verifiedStudent: false,
        role,
      });
      setIsAuthModalOpen(false);
      return { success: true, role, redirectTo: '/admin' };
    }

    if (['clubs', 'club', 'clubsadmin', 'clubadmin'].includes(cleanedUser.toLowerCase()) && isStdPass) {
      const role = 'ROLE_CLUBS';
      localStorage.setItem(ADMIN_TOKEN_KEY, 'CLUBS_SESSION_TOKEN_RIT_2026');
      localStorage.setItem(ADMIN_ROLE_KEY, role);
      localStorage.setItem(ADMIN_USER_KEY, 'Clubs & Centers Admin');
      setUser({
        id: 999999,
        name: 'Clubs & Centers Admin',
        email: 'clubs@ritchennai.edu.in',
        verifiedStudent: false,
        role,
      });
      setIsAuthModalOpen(false);
      return { success: true, role, redirectTo: '/admin' };
    }

    if (['curriculum', 'gpa', 'academics', 'gpaadmin', 'curriculumadmin'].includes(cleanedUser.toLowerCase()) && isStdPass) {
      const role = 'ROLE_CURRICULUM';
      localStorage.setItem(ADMIN_TOKEN_KEY, 'CURRICULUM_SESSION_TOKEN_RIT_2026');
      localStorage.setItem(ADMIN_ROLE_KEY, role);
      localStorage.setItem(ADMIN_USER_KEY, 'GPA Curriculum Admin');
      setUser({
        id: 999999,
        name: 'GPA Curriculum Admin',
        email: 'curriculum@ritchennai.edu.in',
        verifiedStudent: false,
        role,
      });
      setIsAuthModalOpen(false);
      return { success: true, role, redirectTo: '/admin' };
    }

    if (
      (['admin', 'superadmin'].includes(cleanedUser.toLowerCase()) && isStdPass) ||
      (cleanedUser.toLowerCase() === 'ritadmin' && (cleanedPass === 'ritadmin2026' || isStdPass))
    ) {
      const role = 'ROLE_SUPER_ADMIN';
      localStorage.setItem(ADMIN_TOKEN_KEY, 'ADMIN_SESSION_TOKEN_RIT_2026');
      localStorage.setItem(ADMIN_ROLE_KEY, role);
      localStorage.setItem(ADMIN_USER_KEY, 'Super Admin');
      setUser({
        id: 999999,
        name: 'Super Admin',
        email: 'admin@ritchennai.edu.in',
        verifiedStudent: false,
        role,
      });
      setIsAuthModalOpen(false);
      return { success: true, role, redirectTo: '/admin' };
    }

    // 2. Next, check IMS Student Login
    try {
      const imsResult = await loginWithIms(cleanedUser, cleanedPass);
      if (imsResult.success && imsResult.student) {
        const studentObj: AuthUser = {
          id: Number(imsResult.student.regNumber) || 1,
          name: imsResult.student.name,
          email: imsResult.student.email,
          regNumber: imsResult.student.regNumber,
          department: imsResult.student.department,
          verifiedStudent: true,
          role: 'ROLE_STUDENT',
        };
        setUser(studentObj);
        setIsAuthModalOpen(false);

        return {
          success: true,
          role: 'ROLE_STUDENT',
          redirectTo: '/dashboard',
          message: `Welcome ${imsResult.student.name}!`,
        };
      } else {
        return {
          success: false,
          message: imsResult.message || 'Authentication failed. Please check your credentials.',
        };
      }
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Network error while attempting login. Please try again.',
      };
    }
  }, []);

  const logout = useCallback(() => {
    if (user?.email && window.google) {
      try {
        window.google.accounts.id.revoke(user.email, () => {});
      } catch {}
    }
    setUser(null);
    localStorage.removeItem(GOOGLE_STORAGE_KEY);
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_ROLE_KEY);
    localStorage.removeItem(ADMIN_USER_KEY);
    clearImsSession();
    setIsAuthModalOpen(false);
  }, [user]);

  const isSuperAdmin = user?.role === 'ROLE_SUPER_ADMIN';
  const isTransportAdmin = user?.role === 'ROLE_TRANSPORT';
  const isCommunityAdmin = user?.role === 'ROLE_COMMUNITY';
  const isClubsAdmin = user?.role === 'ROLE_CLUBS';
  const isCurriculumAdmin = user?.role === 'ROLE_CURRICULUM';
  const isAdmin = isSuperAdmin || isTransportAdmin || isCommunityAdmin || isClubsAdmin || isCurriculumAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isVerifiedStudent: !!user?.verifiedStudent,
        isAdmin,
        isTransportAdmin,
        isCommunityAdmin,
        isClubsAdmin,
        isCurriculumAdmin,
        isLoading,
        isAuthModalOpen,
        loginWithGoogle,
        loginWithCredentials,
        openAuthModal,
        closeAuthModal,
        logout,
      }}
    >
      {children}
      <GoogleAuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
    </AuthContext.Provider>
  );
}
