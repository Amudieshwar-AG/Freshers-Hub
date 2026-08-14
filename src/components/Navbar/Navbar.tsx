import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogIn, LogOut, ShieldCheck, ChevronDown, Rocket, Sparkles } from 'lucide-react';
import { NAV_LINKS } from '@/constants';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, isVerifiedStudent, loginWithGoogle, logout } = useAuth();
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const checkIsActive = (linkPath: string) => {
    const [pathName] = linkPath.split('?');
    return location.pathname === pathName;
  };

  return (
    <>
      {/* Fixed Header Layout Wrapper */}
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[96%] xl:w-[97%] max-w-[1560px] flex items-start justify-between gap-2.5 lg:gap-3.5 pointer-events-none px-1 lg:px-2">
        {/* Grey Rectangular Capsule Container (Logo + Links ending with LeetCode) */}
        <motion.nav
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="pointer-events-auto flex items-center justify-between flex-1 min-w-0 pl-2.5 pr-4 lg:pl-3.5 lg:pr-5 py-2 transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.25)]"
          style={{
            background: 'linear-gradient(to right, rgba(19, 9, 36, 0.88) 0%, rgba(30, 12, 54, 0.82) 50%, rgba(19, 9, 36, 0.88) 100%)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.12)',
          }}
        >
          {/* Logo - RIT Event Hub Style */}
          <a href="/" className="flex items-center gap-1.5 lg:gap-2 group shrink-0">
            {/* Logo Image */}
            <motion.img
              whileHover={{ scale: 1.05 }}
              src="/logo.png"
              alt="RIT Logo"
              className="w-8 h-8 lg:w-9 lg:h-9 object-contain rounded-full shrink-0"
            />
            
            <div className="flex items-center">
              <span className="font-extrabold text-white text-lg lg:text-xl xl:text-2xl tracking-tighter" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                rit
              </span>
              <div className="h-5 lg:h-6 w-[1px] bg-white/20 mx-1 lg:mx-1.5" />
              <div className="hidden sm:flex flex-col text-[7.5px] lg:text-[8px] xl:text-[8.5px] font-bold text-slate-200 leading-tight tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>
                <span>RAJALAKSHMI</span>
                <span>INSTITUTE OF</span>
                <span>TECHNOLOGY</span>
              </div>
            </div>
          </a>

          {/* Desktop Nav - Ends with LeetCode */}
          <div className="hidden md:flex items-center gap-0.5 lg:gap-0.5 xl:gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = checkIsActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className="relative px-1 lg:px-1.5 xl:px-2 2xl:px-2.5 py-1.5 rounded-lg text-[8.5px] lg:text-[9px] xl:text-[10px] 2xl:text-[11px] font-semibold uppercase tracking-wider transition-all duration-200 whitespace-nowrap shrink-0"
                  style={{
                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                    color: isActive ? '#FFFFFF' : '#CBD5E1',
                  }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-xl"
                      style={{ background: 'linear-gradient(135deg, #FF6B00, #F97316)' }}
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden flex items-center">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-200 hover:text-white bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50 transition-all active:scale-95"
              aria-label="Toggle menu"
            >
              {isMobileOpen ? <X className="w-5 h-5 stroke-[2.5]" /> : <Menu className="w-5 h-5 stroke-[2.5]" />}
            </motion.button>
          </div>

          {/* Mobile Menu Dropdown */}
          <AnimatePresence>
            {isMobileOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="absolute left-0 top-full mt-2 w-full overflow-hidden md:hidden max-h-[80vh] overflow-y-auto z-50"
              >
                <div className="px-4 pb-5 pt-3 grid grid-cols-2 gap-2 border border-white/10 bg-slate-950/95 backdrop-blur-2xl rounded-2xl shadow-2xl">
                  {NAV_LINKS.map((link) => {
                    const isActive = checkIsActive(link.path);
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setIsMobileOpen(false)}
                        className="px-3.5 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center text-center transition-all min-h-[44px]"
                        style={{
                          fontFamily: 'Poppins, sans-serif',
                          color: isActive ? '#FFFFFF' : '#CBD5E1',
                          backgroundColor: isActive ? '#F97316' : 'rgba(255, 255, 255, 0.05)',
                          border: isActive ? '1px solid #FB923C' : '1px solid rgba(255, 255, 255, 0.08)',
                        }}
                      >
                        {link.label}
                      </Link>
                    );
                  })}

                  {/* Mobile RAISE Button */}
                  <Link
                    to="/raise"
                    onClick={() => setIsMobileOpen(false)}
                    className="col-span-2 mt-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white text-xs font-bold bg-gradient-to-r from-rose-500 to-pink-600 border border-rose-400/40 shadow-md shadow-rose-500/20 transition-all active:scale-95"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    <Sparkles className="w-4 h-4 text-amber-200" />
                    Pitch your Idea - RAISE Incubator
                  </Link>

                  {/* Mobile Auth Button */}
                  {!isAuthenticated ? (
                    <button
                      onClick={() => {
                        loginWithGoogle();
                        setIsMobileOpen(false);
                      }}
                      className="col-span-2 mt-2 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white text-xs font-semibold border border-orange-500/40 bg-orange-500/10 hover:bg-orange-500/20 transition-all cursor-pointer"
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                      <LogIn className="w-4 h-4" />
                      Sign In with Google
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        logout();
                        setIsMobileOpen(false);
                      }}
                      className="col-span-2 mt-2 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-red-400 text-xs font-semibold border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 transition-all cursor-pointer"
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out ({user?.name.split(' ')[0]})
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>

        {/* Separate Top Right Section: Sign In on Top, RAISE Incubator Below */}
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.05 }}
          className="hidden md:flex flex-col items-center gap-2 pointer-events-auto shrink-0"
        >
          {/* Sign Option (Top Right, Centered) */}
          {isAuthenticated && user ? (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 hover:border-orange-500/50 hover:bg-slate-800/95 shadow-lg transition-all cursor-pointer min-w-[120px]"
              >
                {user.pictureUrl ? (
                  <img
                    src={user.pictureUrl}
                    alt={user.name}
                    className="w-6 h-6 rounded-full border border-white/30 object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-white text-xs lg:text-sm font-semibold max-w-[100px] truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {user.name.split(' ')[0]}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {/* Profile Dropdown */}
              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-slate-700/60">
                      <div className="flex items-center gap-3">
                        {user.pictureUrl ? (
                          <img
                            src={user.pictureUrl}
                            alt={user.name}
                            className="w-10 h-10 rounded-full border-2 border-orange-500/40 object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-lg">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-bold truncate">{user.name}</p>
                          <p className="text-slate-400 text-[11px] truncate">{user.email}</p>
                        </div>
                      </div>
                      {isVerifiedStudent ? (
                        <div className="mt-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/25">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-[11px] font-bold text-emerald-400">Verified RIT Student</span>
                        </div>
                      ) : (
                        <div className="mt-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/25">
                          <span className="text-[11px] font-semibold text-amber-400">
                            Sign in with @ritchennai.edu.in for verified badge
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <button
                        onClick={() => {
                          logout();
                          setIsProfileOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-red-500/15 text-xs font-semibold transition-all cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={loginWithGoogle}
              className="flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-white text-xs lg:text-sm font-bold bg-slate-900/90 backdrop-blur-md border border-slate-700/80 hover:border-orange-500/60 hover:bg-slate-800/95 shadow-lg shadow-black/30 transition-all cursor-pointer min-w-[120px]"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              <LogIn className="w-4 h-4 text-orange-400" />
              <span className="text-white">Sign In</span>
            </motion.button>
          )}

          {/* RAISE Incubator Module (Below Sign Option) */}
          <Link
            to="/raise"
            className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 lg:px-4 lg:py-2 rounded-xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-600 text-white text-[10.5px] lg:text-[11.5px] font-bold shadow-lg shadow-rose-500/25 border border-white/20 transition-all duration-200 hover:scale-[1.03] active:scale-95 whitespace-nowrap"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-200 shrink-0" />
            <span>Pitch your Idea - RAISE Incubator</span>
          </Link>
        </motion.div>
      </div>

      {/* Spacer */}
      <div className="h-24" />
    </>
  );
}
