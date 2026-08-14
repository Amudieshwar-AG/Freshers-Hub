import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  LogOut,
  LogIn,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  GitBranch,
  X
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavItem {
  label: string;
  path: string;
  icon: any;
  highlight?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export default function Sidebar({
  isOpen,
  onToggle,
  isCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  const location = useLocation();
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
        { label: 'RIT Chatbot', path: '/ai-assistant', icon: Bot },
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
        { label: 'Dev Collab Hub', path: '/collab', icon: Code2, highlight: true },
        { label: 'LeetCode Board', path: '/leetcode', icon: Trophy },
        { label: 'RAISE Incubator', path: '/raise', icon: Rocket },
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

      {/* Main Sidebar Container - Sleek Professional Deep Indigo */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen bg-[#0F172A] text-white transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${
          isCollapsed ? 'w-20' : 'w-64 xl:w-72'
        } flex flex-col justify-between border-r border-slate-800 shadow-[8px_0_30px_rgba(0,0,0,0.3)]`}
      >
        {/* Top Branding & Collapse Button */}
        <div className="p-4 sm:p-5 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group min-w-0">
              <div className="p-2 rounded-2xl bg-slate-950 border border-slate-800 shadow-sm shrink-0">
                <img
                  src="/logo.png"
                  alt="RIT Logo"
                  className="w-7 h-7 object-contain rounded-full"
                />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-white text-lg tracking-tight truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    RIT Portal
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase truncate" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Freshers Hub
                  </span>
                </div>
              )}
            </Link>

            {/* Mobile Close Button */}
            <button
              onClick={onToggle}
              className="lg:hidden p-1.5 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Desktop Collapse Toggle Button */}
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Quick Dev Collab Launch CTA inside Sidebar (Expanded only) */}
          {!isCollapsed && (
            <Link
              to="/collab"
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-[#C25E17] via-[#EA580C] to-[#F97316] hover:from-[#EA580C] hover:to-[#FB923C] border border-orange-500/40 text-white group transition-all duration-200 shadow-md shadow-slate-950/50"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
                  <GitBranch className="w-4 h-4" />
                </div>
                <div className="flex flex-col text-left min-w-0">
                  <span className="text-xs font-bold leading-tight truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Dev Collab Hub
                  </span>
                  <span className="text-[10px] text-orange-100/90 truncate">Co-Developer Projects</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-orange-100 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          )}

          {/* Navigation Groups */}
          <nav className="flex flex-col gap-5 overflow-y-auto max-h-[calc(100vh-320px)] custom-scrollbar pr-0.5">
            {navGroups.map((group) => (
              <div key={group.title} className="flex flex-col gap-1">
                {!isCollapsed && (
                  <span
                    className="px-3 text-[10px] font-bold text-slate-400/70 tracking-widest uppercase mb-1"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {group.title}
                  </span>
                )}

                {group.items.map((item) => {
                  const isActive = checkIsActive(item.path);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      title={isCollapsed ? item.label : undefined}
                      className={`relative flex items-center ${
                        isCollapsed ? 'justify-center px-0 py-3' : 'justify-between px-3 py-2.5'
                      } rounded-xl text-xs font-semibold transition-all duration-200 group ${
                        isActive
                          ? 'bg-gradient-to-r from-[#C25E17] to-[#EA580C] text-white shadow-sm border border-orange-500/50'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                      }`}
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                          }`}
                        />
                        {!isCollapsed && <span>{item.label}</span>}
                      </div>

                      {!isCollapsed && item.highlight && !isActive && (
                        <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Footer User Profile & Auth Section */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60">
          {isAuthenticated && user ? (
            <div className={`flex items-center ${isCollapsed ? 'justify-center p-2' : 'justify-between p-2.5'} rounded-2xl bg-white/5 border border-white/10`}>
              <div className="flex items-center gap-2.5 min-w-0">
                {user.pictureUrl ? (
                  <img
                    src={user.pictureUrl}
                    alt={user.name}
                    className="w-8 h-8 rounded-xl border border-orange-500/40 object-cover shrink-0"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-[#C25E17] text-white font-bold text-xs flex items-center justify-center shrink-0 border border-orange-500/40">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                {!isCollapsed && (
                  <div className="flex flex-col min-w-0 text-left">
                    <span className="text-xs font-bold text-white truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {user.name}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate">
                      {isVerifiedStudent ? 'Verified Student' : 'RIT Account'}
                    </span>
                  </div>
                )}
              </div>

              {!isCollapsed && (
                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={loginWithGoogle}
              title={isCollapsed ? 'Student Sign In' : undefined}
              className={`w-full flex items-center justify-center gap-2 ${
                isCollapsed ? 'p-2.5' : 'p-2.5'
              } rounded-xl bg-gradient-to-r from-[#C25E17] via-[#EA580C] to-[#F97316] hover:from-[#EA580C] hover:to-[#FB923C] border border-orange-500/40 text-white font-bold text-xs transition-all cursor-pointer shadow-md`}
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              <LogIn className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>Student Sign In</span>}
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
