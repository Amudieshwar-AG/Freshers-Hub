import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GoogleAuthModal({ isOpen, onClose }: GoogleAuthModalProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuth();

  // Close modal automatically if user gets authenticated
  useEffect(() => {
    if (isAuthenticated && isOpen) {
      onClose();
    }
  }, [isAuthenticated, isOpen, onClose]);

  // Render Google Button inside modal when open
  useEffect(() => {
    if (!isOpen) return;

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

    // Render immediately if script is loaded
    renderGoogleBtn();

    // Or poll briefly if script is loading
    const interval = setInterval(() => {
      if (window.google) {
        renderGoogleBtn();
        clearInterval(interval);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [isOpen]);

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
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', bounce: 0.2, duration: 0.3 }}
            className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-8 z-10 text-center overflow-hidden"
          >
            {/* Background Orbs */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-orange-500/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon Header */}
            <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-5">
              <Sparkles className="w-8 h-8 text-[#F97316]" />
            </div>

            {/* Title & Description */}
            <h2
              className="text-2xl font-bold text-white mb-2"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Sign In to Freshers Hub
            </h2>

            <p
              className="text-xs text-slate-300 mb-6 leading-relaxed"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Sign in with your Google account. Use your{' '}
              <strong className="text-[#F97316]">@ritchennai.edu.in</strong> college email to unlock the{' '}
              <strong className="text-emerald-400">Verified Student</strong> badge and post collaboration requests!
            </p>

            {/* Google Sign-In Button Container */}
            <div className="flex justify-center my-6 min-h-[44px]">
              <div ref={buttonRef} />
            </div>

            {/* Verified Student Callout */}
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Official RIT Student Verification via Google</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
