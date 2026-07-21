import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, GraduationCap, Bell } from 'lucide-react';
import { NAV_LINKS } from '@/constants';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-6xl transition-all duration-300 ${
          isScrolled
            ? 'shadow-[0_8px_32px_rgba(0,0,0,0.12)] bg-white/90'
            : 'bg-white/80'
        }`}
        style={{
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: '20px',
          border: '1px solid rgba(229,231,235,0.8)',
        }}
      >
        <div className="flex items-center justify-between px-5 py-2.5">
          {/* Logo - RIT Event Hub Style */}
          <Link to="/" className="flex items-center gap-2 group">
            {/* Blue Circular Tree Icon */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, #1E40AF, #3B82F6)' }}
            >
              <svg viewBox="0 0 100 100" className="w-6.5 h-6.5 text-white" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round">
                {/* Minimalist Tree Branch Representation */}
                <path d="M50 85 V40" />
                <path d="M50 65 Q65 55 75 60" />
                <path d="M50 55 Q35 45 25 50" />
                <path d="M50 45 Q70 30 65 15" />
                <path d="M50 45 Q30 30 35 15" />
                <circle cx="50" cy="38" r="8" fill="white" stroke="none" />
                <circle cx="65" cy="15" r="5" fill="white" stroke="none" />
                <circle cx="35" cy="15" r="5" fill="white" stroke="none" />
                <circle cx="75" cy="60" r="5" fill="white" stroke="none" />
                <circle cx="25" cy="50" r="5" fill="white" stroke="none" />
              </svg>
            </motion.div>
            
            <div className="flex items-center">
              <span className="font-extrabold text-[#1E293B] text-2xl tracking-tighter" style={{ fontFamily: 'Poppins, sans-serif' }}>
                rit
              </span>
              <div className="h-7 w-[1px] bg-gray-300 mx-2" />
              <div className="flex flex-col text-[8.5px] font-bold text-[#475569] leading-tight tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>
                <span>RAJALAKSHMI</span>
                <span>INSTITUTE OF</span>
                <span>TECHNOLOGY</span>
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className="relative px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200"
                  style={{
                    fontFamily: 'Poppins, sans-serif',
                    color: isActive ? '#F97316' : '#475569',
                  }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-xl"
                      style={{ backgroundColor: '#FFF7ED' }}
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="hidden md:flex w-9 h-9 rounded-xl items-center justify-center text-[#94A3B8] hover:text-[#F97316] hover:bg-[#FFF7ED] transition-all"
              aria-label="Notifications"
            >
              <Bell className="w-4.5 h-4.5" />
            </motion.button>

            {/* Profile styled as an orange LOG OUT pill button from Reference Image */}
            <Link to="/profile" className="hidden md:block">
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: '0 4px 15px rgba(249,115,22,0.3)' }}
                whileTap={{ scale: 0.97 }}
                className="px-5 py-2 rounded-full text-white font-bold text-[10.5px] tracking-wider uppercase transition-all"
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  background: 'linear-gradient(135deg, #F97316, #FB923C)',
                }}
              >
                Profile
              </motion.button>
            </Link>

            {/* Mobile Toggle */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-[#475569] hover:bg-gray-100 transition-all"
              aria-label="Toggle menu"
            >
              {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden md:hidden"
            >
              <div className="px-4 pb-4 pt-2 flex flex-col gap-1 border-t border-gray-100">
                {NAV_LINKS.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className="px-4 py-3 rounded-xl text-sm font-medium transition-all"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        color: isActive ? '#F97316' : '#475569',
                        backgroundColor: isActive ? '#FFF7ED' : 'transparent',
                      }}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Spacer */}
      <div className="h-20" />
    </>
  );
}
