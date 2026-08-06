import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { getBackendUrl } from '@/lib/utils';
import GoogleAuthModal from '@/components/Auth/GoogleAuthModal';

// ──────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  pictureUrl?: string;
  verifiedStudent: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isVerifiedStudent: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  loginWithGoogle: () => void;
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
  isLoading: true,
  isAuthModalOpen: false,
  loginWithGoogle: () => {},
  openAuthModal: () => {},
  closeAuthModal: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

// ──────────────────────────────────────────────────
// Google GSI global type
// ──────────────────────────────────────────────────

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          prompt: (callback?: (notification: { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean }) => void) => void;
          renderButton: (element: HTMLElement, config: Record<string, unknown>) => void;
          revoke: (email: string, callback: () => void) => void;
        };
      };
    };
  }
}

// ──────────────────────────────────────────────────
// Provider
// ──────────────────────────────────────────────────

const STORAGE_KEY = 'rit_auth_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const openAuthModal = useCallback(() => setIsAuthModalOpen(true), []);
  const closeAuthModal = useCallback(() => setIsAuthModalOpen(false), []);

  // Handle the credential response from Google GSI
  const handleCredentialResponse = useCallback(async (response: { credential: string }) => {
    try {
      const res = await fetch(getBackendUrl('/api/auth/google'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      });

      if (!res.ok) {
        console.error('Auth failed:', res.status);
        return;
      }

      const userData: AuthUser = await res.json();
      setUser(userData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
      setIsAuthModalOpen(false);
    } catch (err) {
      console.error('Google auth error:', err);
    }
  }, []);

  // Initialize Google GSI
  useEffect(() => {
    // 1. Restore session from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as AuthUser;
        setUser(parsed);

        // Validate session is still valid against backend
        fetch(getBackendUrl(`/api/auth/me?email=${encodeURIComponent(parsed.email)}`))
          .then((res) => {
            if (!res.ok) {
              localStorage.removeItem(STORAGE_KEY);
              setUser(null);
            } else {
              return res.json();
            }
          })
          .then((freshData) => {
            if (freshData) {
              setUser(freshData);
              localStorage.setItem(STORAGE_KEY, JSON.stringify(freshData));
            }
          })
          .catch(() => {
            // Backend offline, keep cached session
          });
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);

    // 2. Initialize Google GSI when the script loads
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
    // Open the clean Google Sign-In modal directly
    setIsAuthModalOpen(true);

    // Also trigger One Tap prompt as a secondary background hint if supported
    if (window.google) {
      try {
        window.google.accounts.id.prompt();
      } catch {
        // Silently ignore if browser blocks One Tap
      }
    }
  }, []);

  const logout = useCallback(() => {
    if (user?.email && window.google) {
      try {
        window.google.accounts.id.revoke(user.email, () => {});
      } catch {}
    }
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    setIsAuthModalOpen(false);
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isVerifiedStudent: !!user?.verifiedStudent,
        isLoading,
        isAuthModalOpen,
        loginWithGoogle,
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
