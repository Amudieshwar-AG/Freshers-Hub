import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { getBackendUrl } from '@/lib/utils';

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
  loginWithGoogle: () => void;
  logout: () => void;
}

// ──────────────────────────────────────────────────
// Google Client ID
// ──────────────────────────────────────────────────

// IMPORTANT: Replace this with your actual Google Cloud Console OAuth2 Client ID
// Create one at: https://console.cloud.google.com/apis/credentials
// Authorized origins: https://rit-services.in, http://localhost:5173
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

// ──────────────────────────────────────────────────
// Context
// ──────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isVerifiedStudent: false,
  isLoading: true,
  loginWithGoogle: () => {},
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
          .then(res => {
            if (!res.ok) {
              // Session expired, clear it
              localStorage.removeItem(STORAGE_KEY);
              setUser(null);
            } else {
              // Update with fresh data
              return res.json();
            }
          })
          .then(freshData => {
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

    // The GSI script may not have loaded yet (async), so poll briefly
    if (window.google) {
      initGSI();
    } else {
      const interval = setInterval(() => {
        if (window.google) {
          clearInterval(interval);
          initGSI();
        }
      }, 200);
      // Stop polling after 10 seconds
      setTimeout(() => clearInterval(interval), 10000);
    }
  }, [handleCredentialResponse]);

  const loginWithGoogle = useCallback(() => {
    if (!GOOGLE_CLIENT_ID) {
      console.warn('Google Client ID not configured. Set VITE_GOOGLE_CLIENT_ID in .env');
      return;
    }

    if (window.google) {
      // Trigger the One Tap prompt
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // If One Tap doesn't show (e.g. blocked by browser), fall back to button-based flow
          // Render a temporary popup button
          const popup = document.createElement('div');
          popup.id = 'google-signin-popup';
          popup.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:99999;background:white;padding:32px;border-radius:16px;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);';
          document.body.appendChild(popup);

          window.google!.accounts.id.renderButton(popup, {
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            shape: 'pill',
            width: 300,
          });

          // Remove after 30s or when clicked
          setTimeout(() => popup.remove(), 30000);
          const observer = new MutationObserver(() => {
            if (!document.getElementById('google-signin-popup')) {
              observer.disconnect();
            }
          });
          observer.observe(document.body, { childList: true });
        }
      });
    }
  }, []);

  const logout = useCallback(() => {
    if (user?.email && window.google) {
      window.google.accounts.id.revoke(user.email, () => {
        console.log('Google session revoked');
      });
    }
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isVerifiedStudent: !!user?.verifiedStudent,
        isLoading,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
