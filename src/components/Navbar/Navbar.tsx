import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  LogIn,
  LogOut,
  ShieldCheck,
  ChevronDown,
  Map,
  Bus,
  UserCheck,
  MessageCircle,
  Rocket,
  BookOpen,
  Wrench,
  Bot,
  Users,
  Code2,
  Trophy,
  Ticket,
  Award,
  GraduationCap,
  LayoutDashboard,
  Home as HomeIcon,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface NavItem {
  label: string;
  path: string;
  icon?: any;
}

const PRIMARY_LINKS: NavItem[] = [
  { label: 'Home', path: '/', icon: HomeIcon },
  { label: 'Time table', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Notes', path: '/notes', icon: BookOpen },
  { label: 'Toolkit', path: '/toolkit', icon: Wrench },
  { label: 'Chatbot', path: '/ai-assistant', icon: Bot },
  { label: 'Clubs & Centers', path: '/events', icon: Users },
  { label: 'Campus Map', path: '/campus', icon: Map },
  { label: 'Bus Routes', path: '/bus-routes', icon: Bus },
  { label: 'Faculty Directory', path: '/faculty', icon: UserCheck },
  { label: 'Community', path: '/community', icon: MessageCircle },
];

const MORE_LINKS: NavItem[] = [
  { label: 'Dev Collab', path: '/collab', icon: Code2 },
  { label: 'LeetCode', path: '/leetcode', icon: Trophy },
  { label: 'Student Gate Pass', path: '/notes?portal=gatepass', icon: Ticket },
  { label: 'Student Proficiency', path: '/notes?portal=proficiency', icon: Award },
];

const ALL_MOBILE_LINKS: NavItem[] = [
  ...PRIMARY_LINKS,
  ...MORE_LINKS,
  { label: 'RAISE Incubator', path: '/raise', icon: Rocket },
];

export default function Navbar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, isVerifiedStudent, loginWithGoogle, logout } = useAuth();
  const profileRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMobileOpen(false);
    setIsMoreOpen(false);
  }, [location.pathname]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setIsMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const checkIsActive = (linkPath: string) => {
    if (linkPath === '/') return location.pathname === '/';
    if (linkPath === '/notes') return location.pathname === '/notes' && !location.search.includes('portal=');
    if (linkPath.includes('?')) {
      return location.pathname + location.search === linkPath;
    }
    return location.pathname.startsWith(linkPath);
  };

  const isMoreActive = false;

  return (
    <>
      {/* Unified Floating Navbar Container */}
      <header className="fixed top-3.5 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-[1440px] pointer-events-none">
        <motion.nav
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="relative pointer-events-auto flex items-center justify-between gap-2 lg:gap-4 px-3 sm:px-4 py-2 rounded-2xl bg-slate-950/90 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.35)] transition-all"
        >
          {/* Left: Logo & College Brand */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <motion.img
              whileHover={{ scale: 1.06 }}
              src="/logo.png"
              alt="RIT Logo"
              className="w-8 h-8 lg:w-9 lg:h-9 object-contain rounded-full shrink-0"
            />
            <div className="flex items-center">
              <span
                className="font-extrabold text-white text-lg lg:text-xl tracking-tight group-hover:text-[#FF6B00] transition-colors"
                style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              >
                rit
              </span>
              <div className="h-4 lg:h-5 w-[1px] bg-white/20 mx-2" />
              <div
                className="hidden xl:flex flex-col text-[7.5px] lg:text-[8px] font-bold text-slate-300 leading-[1.15] tracking-wider uppercase"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <span>Rajalakshmi</span>
                <span>Institute of</span>
                <span>Technology</span>
              </div>
            </div>
          </Link>

          {/* Center: Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-1.5 min-w-0">
            {PRIMARY_LINKS.map((link) => {
              const isActive = checkIsActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-2.5 xl:px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 whitespace-nowrap ${
                    isActive ? 'text-white' : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                  style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill-active"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#F97316] shadow-sm"
                      transition={{ type: 'spring', bounce: 0.15, duration: 0.35 }}
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </Link>
              );
            })}

            {/* "More" Dropdown Menu */}
            <div className="relative" ref={moreRef}>
              <button
                onClick={() => setIsMoreOpen(!isMoreOpen)}
                className={`relative flex items-center gap-1 px-2.5 xl:px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  isMoreActive ? 'text-white' : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
                style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              >
                {isMoreActive && (
                  <motion.div
                    layoutId="nav-pill-active"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#F97316] shadow-sm"
                    transition={{ type: 'spring', bounce: 0.15, duration: 0.35 }}
                  />
                )}
                <span className="relative z-10">More</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 relative z-10 transition-transform duration-200 ${
                    isMoreOpen ? 'rotate-180 text-white' : 'text-slate-400'
                  }`}
                />
              </button>

              <AnimatePresence>
                {isMoreOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-52 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-1.5 z-50 overflow-hidden"
                  >
                    {MORE_LINKS.map((item) => {
                      const IconComponent = item.icon;
                      const active = checkIsActive(item.path);
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setIsMoreOpen(false)}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                            active
                              ? 'bg-white/15 text-orange-400 font-semibold'
                              : 'text-slate-300 hover:text-white hover:bg-white/10'
                          }`}
                          style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                        >
                          {IconComponent && <IconComponent className={`w-4 h-4 shrink-0 ${active ? 'text-orange-400' : 'text-slate-300'}`} />}
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right: Auth Profile / Sign In */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            {isAuthenticated && user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-white/10 transition-all cursor-pointer"
                >
                  {user.pictureUrl ? (
                    <img
                      src={user.pictureUrl}
                      alt={user.name}
                      className="w-6 h-6 rounded-full border border-white/30 object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#F97316] flex items-center justify-center text-white font-bold text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span
                    className="text-white text-xs font-semibold max-w-[100px] truncate"
                    style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                  >
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Profile Dropdown */}
                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-64 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
                    >
                      <div className="p-4 border-b border-white/10">
                        <div className="flex items-center gap-3">
                          {user.pictureUrl ? (
                            <img
                              src={user.pictureUrl}
                              alt={user.name}
                              className="w-10 h-10 rounded-full border-2 border-orange-500/40 object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#F97316] flex items-center justify-center text-white font-bold text-lg">
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
                              Sign in with @ritchennai.edu.in
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-2 space-y-1">
                        <Link
                          to="/dashboard"
                          onClick={() => setIsProfileOpen(false)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-orange-500/15 hover:border-orange-500/20 text-xs font-semibold transition-all cursor-pointer"
                        >
                          <GraduationCap className="w-4 h-4 text-orange-400" />
                          My Time Table
                        </Link>
                        <button
                          onClick={() => {
                            logout();
                            setIsProfileOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-red-500/15 text-xs font-semibold transition-all cursor-pointer"
                        >
                          <LogOut className="w-4 h-4 text-red-400" />
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
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-white text-xs font-bold bg-white/10 hover:bg-white/15 border border-white/15 transition-all cursor-pointer"
                style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              >
                <LogIn className="w-3.5 h-3.5 text-[#FF6B00]" />
                <span>Sign In</span>
              </motion.button>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="lg:hidden flex items-center">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-200 hover:text-white bg-slate-800/80 border border-white/10 transition-all active:scale-95"
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
                className="absolute left-0 top-full mt-2 w-full overflow-hidden lg:hidden max-h-[82vh] overflow-y-auto z-50 rounded-2xl border border-white/10 bg-slate-950/95 backdrop-blur-2xl shadow-2xl"
              >
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    {ALL_MOBILE_LINKS.map((link) => {
                      const isActive = checkIsActive(link.path);
                      const isRaise = link.path === '/raise';
                      const IconComp = link.icon;
                      return (
                        <Link
                          key={link.path}
                          to={link.path}
                          onClick={() => setIsMobileOpen(false)}
                          className={`px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                            isRaise
                              ? 'bg-gradient-to-r from-[#EC4899] via-[#F43F5E] to-[#E11D48] text-white font-bold shadow-md shadow-pink-500/30 col-span-2 justify-center'
                              : isActive
                              ? 'bg-gradient-to-r from-[#FF6B00] to-[#F97316] text-white shadow-sm'
                              : 'bg-white/5 text-slate-200 hover:bg-white/10 border border-white/5'
                          }`}
                          style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                        >
                          {IconComp && <IconComp className="w-3.5 h-3.5 opacity-80" />}
                          <span className="truncate">{link.label}</span>
                        </Link>
                      );
                    })}
                  </div>

                  {/* Mobile Auth Button */}
                  <div className="pt-2 border-t border-white/10">
                    {!isAuthenticated ? (
                      <button
                        onClick={() => {
                          loginWithGoogle();
                          setIsMobileOpen(false);
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white text-xs font-semibold border border-orange-500/40 bg-orange-500/15 hover:bg-orange-500/25 transition-all cursor-pointer"
                        style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                      >
                        <LogIn className="w-4 h-4 text-orange-400" />
                        Sign In with Google
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          logout();
                          setIsMobileOpen(false);
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-red-400 text-xs font-semibold border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 transition-all cursor-pointer"
                        style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out ({user?.name.split(' ')[0]})
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating RAISE Incubator Button directly below right side of navbar */}
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut', delay: 0.1 }}
            className="absolute right-0 sm:right-1 lg:right-1 top-[calc(100%+8px)] pointer-events-auto hidden lg:block z-40"
          >
            <Link
              to="/raise"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold text-white transition-all shadow-lg hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-xl ${
                checkIsActive('/raise')
                  ? 'bg-gradient-to-r from-pink-600 via-rose-600 to-pink-700 ring-2 ring-pink-300 shadow-pink-500/50'
                  : 'bg-gradient-to-r from-[#EC4899] via-[#F43F5E] to-[#E11D48] hover:from-[#DB2777] hover:to-[#BE123C] shadow-pink-500/40 border border-pink-400/40'
              }`}
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              <Rocket className="w-4 h-4 text-white animate-pulse" />
              <span>RAISE Incubator</span>
            </Link>
          </motion.div>
        </motion.nav>
      </header>

      {/* Spacer to prevent content overlap */}
      <div className="h-20" />
    </>
  );
}
