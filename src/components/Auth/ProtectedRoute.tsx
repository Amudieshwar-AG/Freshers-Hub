import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, LogIn, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  title: string;
  description: string;
  requireVerifiedStudent?: boolean;
}

export default function ProtectedRoute({
  children,
  title,
  description,
  requireVerifiedStudent = false,
}: ProtectedRouteProps) {
  const { isAuthenticated, isVerifiedStudent, loginWithGoogle, user } = useAuth();

  // If user is authenticated (and meets verified student criteria if required), render the actual page!
  const isAllowed = isAuthenticated && (!requireVerifiedStudent || isVerifiedStudent);

  if (isAllowed) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 relative overflow-hidden bg-[#FAFAFA]">
      {/* Background ambient light */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl opacity-60" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-lg bg-white border border-[#E5E7EB] rounded-3xl shadow-xl p-8 sm:p-10 text-center"
      >
        {/* Lock / Shield Icon */}
        <div className="w-20 h-20 rounded-3xl bg-orange-50 border border-orange-200 flex items-center justify-center mx-auto mb-6 shadow-sm">
          {requireVerifiedStudent ? (
            <ShieldCheck className="w-10 h-10 text-[#F97316]" />
          ) : (
            <ShieldAlert className="w-10 h-10 text-[#F97316]" />
          )}
        </div>

        {/* Feature Title */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 text-[#F97316] text-xs font-semibold mb-3 border border-orange-200">
          <Sparkles className="w-3.5 h-3.5" /> Authentication Required
        </div>

        <h1
          className="text-2xl sm:text-3xl font-bold text-[#1E293B] mb-3"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          {title}
        </h1>

        <p
          className="text-slate-600 text-sm mb-8 leading-relaxed max-w-md mx-auto"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {!isAuthenticated ? (
            <>
              {description} Sign in with your Google account to access this feature.
            </>
          ) : (
            <>
              You are signed in as <strong>{user?.email}</strong>. This feature is restricted to verified students with a <strong className="text-[#F97316]">ritchennai.edu.in</strong> college email.
            </>
          )}
        </p>

        {/* Action Button */}
        <div className="space-y-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={loginWithGoogle}
            className="w-full flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl text-white font-semibold text-sm shadow-lg shadow-orange-500/25 cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #F97316, #FB923C)',
              fontFamily: 'Poppins, sans-serif',
            }}
          >
            <LogIn className="w-5 h-5" />
            {!isAuthenticated ? 'Sign In with Google to Unlock' : 'Switch to @ritchennai.edu.in Account'}
          </motion.button>

          <p className="text-[11px] text-slate-400">
            Sign-in is quick, secure, and preserves your student privacy.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
