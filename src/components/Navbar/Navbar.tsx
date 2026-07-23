import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
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
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-6xl transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.25)]"
        style={{
          background: 'linear-gradient(to right, rgba(15, 23, 42, 0.45) 0%, rgba(30, 41, 59, 0.35) 50%, rgba(15, 23, 42, 0.45) 100%)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div className="flex items-center justify-between px-5 py-2.5">
          {/* Logo - RIT Event Hub Style */}
          <a href="/" className="flex items-center gap-2 group">
            {/* Logo Image */}
            <motion.img
              whileHover={{ scale: 1.05 }}
              src="/logo.png"
              alt="RIT Logo"
              className="w-10 h-10 object-contain rounded-full shrink-0"
            />
            
            <div className="flex items-center">
              <span className="font-extrabold text-white text-2xl tracking-tighter" style={{ fontFamily: 'Poppins, sans-serif' }}>
                rit
              </span>
              <div className="h-7 w-[1px] bg-white/20 mx-2" />
              <div className="flex flex-col text-[8.5px] font-bold text-slate-200 leading-tight tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>
                <span>RAJALAKSHMI</span>
                <span>INSTITUTE OF</span>
                <span>TECHNOLOGY</span>
              </div>
            </div>
          </a>

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
                    color: isActive ? '#FFFFFF' : '#CBD5E1',
                  }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-xl"
                      style={{ background: 'linear-gradient(135deg, #F97316, #FB923C)' }}
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
            {/* Mobile Toggle */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-all"
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
              <div className="px-4 pb-4 pt-2 flex flex-col gap-1 border-t border-white/10">
                {NAV_LINKS.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className="px-4 py-3 rounded-xl text-sm font-medium transition-all"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        color: isActive ? '#FFFFFF' : '#CBD5E1',
                        backgroundColor: isActive ? '#F97316' : 'transparent',
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
