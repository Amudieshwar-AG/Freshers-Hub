import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ShieldCheck, Sparkles, User, KeyRound, 
  ArrowRight, AlertCircle, GraduationCap, Bus, Shield
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GoogleAuthModal({ isOpen, onClose }: GoogleAuthModalProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { isAuthenticated, loginWithCredentials } = useAuth();

  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<'credentials' | 'google'>('credentials');

  // Close modal automatically if user gets authenticated
  useEffect(() => {
    if (isAuthenticated && isOpen) {
      onClose();
    }
  }, [isAuthenticated, isOpen, onClose]);

  // Render Google Button inside modal when open
  useEffect(() => {
    if (!isOpen || activeMode !== 'google') return;

    const renderGoogleBtn = () => {
      if (window.google && buttonRef.current) {
        buttonRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(buttonRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'pill',
          logo_alignment: 'left',
          width: 280,
        });
      }
    };

    renderGoogleBtn();
    const interval = setInterval(() => {
      if (window.google) {
        renderGoogleBtn();
        clearInterval(interval);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [isOpen, activeMode]);

  const handleSubmitCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim() || !passwordInput.trim()) {
      setErrorMessage('Please enter both username/register number and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await loginWithCredentials(usernameInput.trim(), passwordInput.trim());
      if (result.success) {
        onClose();
        if (result.redirectTo) {
          navigate(result.redirectTo);
        }
      } else {
        setErrorMessage(result.message || 'Invalid credentials.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Authentication error.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (user: string, pass: string) => {
    setUsernameInput(user);
    setPasswordInput(pass);
    setErrorMessage(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 15 }}
            transition={{ type: 'spring', bounce: 0.18, duration: 0.3 }}
            className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl shadow-2xl p-6 sm:p-7 z-10 text-slate-100 overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute -top-20 -right-20 w-44 h-44 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF6B00] to-[#F97316] p-0.5 shadow-lg shadow-orange-500/20 mx-auto mb-3">
                <div className="w-full h-full bg-slate-950/60 rounded-[14px] flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </div>

              <h2 className="text-xl font-extrabold text-white tracking-tight">
                Sign In to Freshers Hub
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter your student register number or admin credentials.
              </p>
            </div>

            {/* Tab Selector */}
            <div className="flex rounded-xl bg-slate-950/80 p-1 border border-white/5 mb-5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveMode('credentials')}
                className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                  activeMode === 'credentials'
                    ? 'bg-gradient-to-r from-[#FF6B00] to-[#F97316] text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Credentials (Student / Admin)
              </button>
              <button
                type="button"
                onClick={() => setActiveMode('google')}
                className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                  activeMode === 'google'
                    ? 'bg-gradient-to-r from-[#FF6B00] to-[#F97316] text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Google Sign In
              </button>
            </div>

            {/* ERROR MESSAGE */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-2 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 1. CREDENTIALS SIGN IN FORM */}
            {activeMode === 'credentials' && (
              <form onSubmit={handleSubmitCredentials} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-orange-400" />
                    Register Number / Username
                  </label>
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="e.g. 2114251001 or Transport or Admin"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-orange-500 transition-colors font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-orange-400" />
                    Password
                  </label>
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-orange-500 transition-colors font-mono"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl text-white font-bold text-xs bg-gradient-to-r from-[#FF6B00] to-[#F97316] hover:opacity-95 shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Quick Demo Fill Buttons for Admins */}
                <div className="pt-3 border-t border-white/10 space-y-1.5">
                  <span className="text-[10px] text-slate-400 font-semibold block text-center uppercase tracking-wider">
                    Official Admin Portals:
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                    <button
                      type="button"
                      onClick={() => handleQuickFill('Transport', 'RIT@2026')}
                      className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-950 border border-white/5 text-left flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span className="truncate">🚌 Transport Admin</span>
                      <span className="text-[9px] text-blue-400 font-mono">Select</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickFill('Admin', 'RIT@2026')}
                      className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-950 border border-white/5 text-left flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span className="truncate">⚡ Super Admin</span>
                      <span className="text-[9px] text-emerald-400 font-mono">Select</span>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* 2. GOOGLE SIGN IN */}
            {activeMode === 'google' && (
              <div className="space-y-4 py-2 text-center">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Sign in with your Google account. Use your{' '}
                  <strong className="text-orange-400">@ritchennai.edu.in</strong> email for automatic student verification.
                </p>

                <div className="flex justify-center my-4 min-h-[44px]">
                  <div ref={buttonRef} />
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Google OAuth 2.0 Single Sign-On</span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
