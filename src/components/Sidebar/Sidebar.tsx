import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  BookOpen,
  Wrench,
  Bot,
  MapPin,
  Bus,
  Users,
  Calendar,
  MessageSquare,
  Code2,
  Trophy,
  Rocket,
  ShieldAlert,
  LogOut,
  LogIn,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

interface NavItem {
  label: string;
  path: string;
  icon: any;
  badge?: string;
  highlight?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isVerifiedStudent, loginWithGoogle, logout } = useAuth();

  const checkIsActive = (linkPath: string) => {
    const [pathName, searchString] = linkPath.split('?');
    if (location.pathname !== pathName) return false;

    if (pathName === '/notes') {
      const params = new URLSearchParams(location.search);
      const hasToolkit = params.has('toolkit') || params.get('section') === 'toolkit';
      if (searchString) {
        return hasToolkit;
      } else {
        return !hasToolkit;
      }
    }

    return true;
  };

  const navGroups: NavGroup[] = [
    {
      title: 'ACADEMICS & PORTAL',
      items: [
        { label: 'Dashboard', path: '/', icon: LayoutDashboard },
        { label: 'Notes & PYQs', path: '/notes', icon: BookOpen },
        { label: 'Student Toolkit', path: '/notes?section=toolkit', icon: Wrench },
        { label: 'RIT AI Chatbot', path: '/ai-assistant', icon: Bot, badge: 'AI' },
      ],
    },
    {
      title: 'CAMPUS & UTILITIES',
      items: [
        { label: 'Bus Tracker', path: '/bus-routes', icon: Bus },
        { label: 'Campus Map', path: '/campus', icon: MapPin },
        { label: 'Faculty Directory', path: '/faculty', icon: Users },
        { label: 'Student Clubs', path: '/events', icon: Calendar },
      ],
    },
    {
      title: 'COMMUNITY & DEV',
      items: [
        { label: 'Freshers Q&A', path: '/community', icon: MessageSquare },
        { label: 'Dev Collab Hub', path: '/collab', icon: Code2 },
        { label: 'LeetCode Board', path: '/leetcode', icon: Trophy },
        { label: 'RAISE Incubator', path: '/raise', icon: Rocket, highlight: true },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Main Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-64 xl:w-72 bg-gradient-to-b from-[#1E1B4B] via-[#2E1065] to-[#3B0764] text-white transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col justify-between border-r border-white/10 shadow-[8px_0_32px_rgba(0,0,0,0.3)]`}
      >
        {/* Top Header & Branding */}
        <div className="p-6 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative p-2 rounded-2xl bg-gradient-to-br from-purple-500/30 to-indigo-500/20 border border-white/20 shadow-lg group-hover:scale-105 transition-transform">
                <img
                  src="/logo.png"
                  alt="RIT Logo"
                  className="w-8 h-8 object-contain rounded-full"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-white text-xl tracking-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    RIT Portal
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/30">
                    v2.0
                  </span>
                </div>
                <span className="text-[10px] font-medium text-purple-200/70 tracking-wider uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Rajalakshmi Tech
                </span>
              </div>
            </Link>

            <button
              onClick={onToggle}
              className="lg:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20 text-purple-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Pitch CTA inside Sidebar */}
          <Link
            to="/raise"
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 border border-purple-400/30 shadow-md shadow-purple-900/40 text-white group transition-all duration-200"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-amber-300">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold leading-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  RAISE Incubator
                </span>
                <span className="text-[10px] text-purple-200/80">Pitch Startup Idea</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-purple-200 group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Navigation Groups */}
          <nav className="flex flex-col gap-6 overflow-y-auto max-h-[calc(100vh-340px)] custom-scrollbar pr-1">
            {navGroups.map((group) => (
              <div key={group.title} className="flex flex-col gap-1">
                <span
                  className="px-3 text-[10px] font-bold text-purple-300/60 tracking-widest uppercase mb-1"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {group.title}
                </span>

                {group.items.map((item) => {
                  const isActive = checkIsActive(item.path);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group ${
                        isActive
                          ? 'bg-gradient-to-r from-purple-600/90 via-purple-700/80 to-indigo-800/90 text-white shadow-lg shadow-purple-950/50 border border-purple-400/30'
                          : 'text-purple-200/80 hover:text-white hover:bg-white/10'
                      }`}
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 transition-colors ${
                            isActive
                              ? 'text-white'
                              : 'text-purple-300/70 group-hover:text-purple-200'
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>

                      {item.badge && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-400/30">
                          {item.badge}
                        </span>
                      )}

                      {item.highlight && !isActive && (
                        <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Footer User Profile & Auth Section */}
        <div className="p-4 border-t border-white/10 bg-black/20 backdrop-blur-md">
          {isAuthenticated && user ? (
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-3 min-w-0">
                {user.pictureUrl ? (
                  <img
                    src={user.pictureUrl}
                    alt={user.name}
                    className="w-9 h-9 rounded-xl border border-purple-400/40 object-cover shrink-0"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-white truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {user.name}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] text-purple-200/70 truncate">
                    {isVerifiedStudent ? (
                      <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                        <ShieldCheck className="w-3 h-3" /> Verified Student
                      </span>
                    ) : (
                      <span>RIT Account</span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={logout}
                title="Sign Out"
                className="p-2 rounded-xl hover:bg-white/10 text-purple-300 hover:text-white transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={loginWithGoogle}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md border border-purple-400/30 transition-all cursor-pointer"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              <LogIn className="w-4 h-4" />
              <span>Student Sign In</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
