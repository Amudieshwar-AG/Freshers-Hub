import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Bell,
  Menu,
  Calendar,
  X,
  BookOpen,
  Bus,
  Users,
  Calendar as ClubIcon,
  Code2,
  Trophy,
  Bot,
  LayoutDashboard,
  Wrench,
  MapPin,
  MessageSquare,
  Rocket,
  GitBranch,
  LogIn,
  LogOut,
  ChevronRight,
  Grid,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { BUS_ROUTES, FACULTY_DATA, CLUBS_DATA } from '@/constants';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'academic' | 'dev' | 'campus' | 'bus';
}

interface NavItem {
  label: string;
  path: string;
  icon: any;
  desc?: string;
  highlight?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export default function Header({}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isVerifiedStudent, loginWithGoogle, logout } = useAuth();
  
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      title: 'Moodle Notes & PYQs Updated',
      message: '1st to 8th Semester notes and previous year question papers are published on Moodle.',
      time: '10m ago',
      read: false,
      type: 'academic',
    },
    {
      id: '2',
      title: 'Dev Collab Hub Open',
      message: 'Post open-source project ideas or find co-developers across departments.',
      time: '1h ago',
      read: false,
      type: 'dev',
    },
    {
      id: '3',
      title: 'LeetCode Campus Rankings Live',
      message: 'Monthly competitive programming leaderboard has been updated.',
      time: '3h ago',
      read: false,
      type: 'academic',
    },
    {
      id: '4',
      title: 'Campus Bus Schedule Confirmed',
      message: 'All 4 campus bus routes operating on 7:00 AM morning schedule.',
      time: '1d ago',
      read: true,
      type: 'bus',
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const navGroups: NavGroup[] = [
    {
      title: 'ACADEMICS & PORTAL',
      items: [
        { label: 'Dashboard', path: '/', icon: LayoutDashboard, desc: 'Campus Overview' },
        { label: 'Notes & PYQs', path: '/notes', icon: BookOpen, desc: 'Semester Study Materials' },
        { label: 'Student Toolkit', path: '/notes?section=toolkit', icon: Wrench, desc: 'Calculators & Tools' },
        { label: 'RIT Chatbot', path: '/ai-assistant', icon: Bot, desc: 'AI Campus Assistant' },
      ],
    },
    {
      title: 'CAMPUS & UTILITIES',
      items: [
        { label: 'Bus Tracker', path: '/bus-routes', icon: Bus, desc: 'Routes & Timings' },
        { label: 'Campus Map', path: '/campus', icon: MapPin, desc: '3D Campus Map' },
        { label: 'Faculty Directory', path: '/faculty', icon: Users, desc: 'Staff Contact Hours' },
        { label: 'Student Clubs', path: '/events', icon: ClubIcon, desc: 'Societies & Leads' },
      ],
    },
    {
      title: 'COMMUNITY & DEV',
      items: [
        { label: 'Freshers Q&A', path: '/community', icon: MessageSquare, desc: 'Peer Advice & Q&A' },
        { label: 'Dev Collab Hub', path: '/collab', icon: Code2, desc: 'Find Project Teammates', highlight: true },
        { label: 'LeetCode Board', path: '/leetcode', icon: Trophy, desc: 'Coding Leaderboard' },
        { label: 'RAISE Incubator', path: '/raise', icon: Rocket, desc: 'Startup Ventures' },
      ],
    },
  ];

  const checkIsActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path.split('?')[0]);
  };

  useEffect(() => {
    const now = new Date();
    const formatted = now.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    setCurrentDate(formatted);
  }, []);

  // Listen for ⌘K shortcut and Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setIsSearchOpen(false);
        setIsNotifOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto close mobile drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // Search indexing & results calculation
  const searchResults = (() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const results: { title: string; desc: string; path: string; icon: any; category: string }[] = [];

    // Check modules
    if ('notes pyqs moodle syllabus question paper'.includes(q)) {
      results.push({ title: 'Academic Notes & PYQs', desc: 'Semester course notes & past papers', path: '/notes', icon: BookOpen, category: 'Academics' });
    }
    if ('bus route timing transport travel pickup'.includes(q)) {
      results.push({ title: 'Campus Bus Routes', desc: 'Schedules and stops for all campus buses', path: '/bus-routes', icon: Bus, category: 'Utilities' });
    }
    if ('chatbot assistant question help contact rules'.includes(q)) {
      results.push({ title: 'Campus Chatbot', desc: 'Instant Q&A about campus life & rules', path: '/ai-assistant', icon: Bot, category: 'Academics' });
    }
    if ('collab dev project developer team coding github'.includes(q)) {
      results.push({ title: 'Dev Collab Hub', desc: 'Find co-developers & build projects', path: '/collab', icon: Code2, category: 'Dev' });
    }
    if ('leetcode ranking leaderboard coding rank'.includes(q)) {
      results.push({ title: 'LeetCode Leaderboard', desc: 'Campus competitive coding rankings', path: '/leetcode', icon: Trophy, category: 'Dev' });
    }

    // Search Bus Routes
    BUS_ROUTES.forEach((r) => {
      if (r.name.toLowerCase().includes(q) || r.number.toLowerCase().includes(q) || r.from.toLowerCase().includes(q)) {
        results.push({ title: `${r.number}: ${r.name}`, desc: `Departure: ${r.departureTime} from ${r.from}`, path: '/bus-routes', icon: Bus, category: 'Bus Route' });
      }
    });

    // Search Faculty
    FACULTY_DATA.forEach((f) => {
      if (f.name.toLowerCase().includes(q) || f.department.toLowerCase().includes(q) || (f.specialization && f.specialization.toLowerCase().includes(q))) {
        results.push({ title: f.name, desc: `${f.designation} — ${f.department}`, path: '/faculty', icon: Users, category: 'Faculty' });
      }
    });

    // Search Clubs
    CLUBS_DATA.forEach((c) => {
      if (c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)) {
        results.push({ title: c.name, desc: c.description, path: '/events', icon: ClubIcon, category: 'Club' });
      }
    });

    return results.slice(0, 6);
  })();

  const handleSelectResult = (path: string) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    navigate(path);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0F172A]/95 backdrop-blur-md border-b border-slate-800/80 px-3 sm:px-4 lg:px-8 py-2.5 shadow-md text-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          
          {/* Left Side: Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="p-1.5 rounded-xl bg-slate-950 border border-slate-800 shadow-sm shrink-0">
              <img
                src="/logo.png"
                alt="RIT Logo"
                className="w-7 h-7 object-contain rounded-full"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-white text-base sm:text-lg tracking-tight truncate leading-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
                RIT Portal
              </span>
              <span className="text-[9px] sm:text-[10px] text-orange-400 font-medium tracking-wider uppercase truncate" style={{ fontFamily: 'Inter, sans-serif' }}>
                Freshers Hub
              </span>
            </div>
          </Link>

          {/* Center: Desktop Top Navigation Links Strip */}
          <nav
            className="hidden lg:flex items-center gap-1 xl:gap-1.5 overflow-x-auto max-w-2xl shrink-0 [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {navGroups.flatMap(g => g.items).map((item) => {
              const isActive = checkIsActive(item.path);
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-[#C25E17] to-[#EA580C] text-white shadow-xs border border-orange-400/40'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
                  }`}
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-orange-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            
            {/* Global Search Input */}
            <div className="relative min-w-0 w-28 xs:w-36 sm:w-44 md:w-52" ref={searchRef}>
              <div
                onClick={() => setIsSearchOpen(true)}
                className="relative w-full cursor-text"
              >
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchOpen(true);
                  }}
                  onFocus={() => setIsSearchOpen(true)}
                  placeholder="Search..."
                  className="w-full pl-8 pr-6 sm:pr-10 py-1.5 text-xs font-medium bg-slate-900/90 hover:bg-slate-900 focus:bg-slate-950 border border-slate-800 focus:border-orange-500/60 rounded-xl text-white placeholder-slate-400 outline-none transition-all shadow-inner truncate"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
                <span className="hidden sm:inline-flex absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-semibold text-slate-300 bg-slate-800 border border-slate-700 px-1 py-0.5 rounded shadow-2xs">
                  ⌘K
                </span>
              </div>

              {/* Search Live Results Overlay */}
              {isSearchOpen && (
                <div className="absolute top-full right-0 mt-2 w-72 sm:w-[400px] bg-[#0F172A] rounded-2xl border border-slate-800 shadow-2xl overflow-hidden z-50 p-2 text-left">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      {searchQuery.trim() ? 'Search Results' : 'Quick Navigation'}
                    </span>
                    <button
                      onClick={() => setIsSearchOpen(false)}
                      className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="max-h-72 overflow-y-auto custom-scrollbar p-1 space-y-1">
                    {searchResults.length > 0 ? (
                      searchResults.map((res, i) => {
                        const Icon = res.icon;
                        return (
                          <div
                            key={i}
                            onClick={() => handleSelectResult(res.path)}
                            className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/80 cursor-pointer transition-colors group"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0 border border-orange-500/30">
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs font-bold text-white group-hover:text-orange-400 truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                  {res.title}
                                </span>
                                <span className="text-[11px] text-slate-400 truncate">{res.desc}</span>
                              </div>
                            </div>
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 shrink-0 border border-slate-700">
                              {res.category}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-4 text-center space-y-2">
                        <span className="text-xs text-slate-400 block">
                          {searchQuery.trim() ? `No matches found for "${searchQuery}"` : 'Type to search notes, faculty, routes & clubs'}
                        </span>
                        <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                          <button
                            onClick={() => handleSelectResult('/notes')}
                            className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 hover:text-white border border-slate-700"
                          >
                            Notes
                          </button>
                          <button
                            onClick={() => handleSelectResult('/bus-routes')}
                            className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 hover:text-white border border-slate-700"
                          >
                            Bus Routes
                          </button>
                          <button
                            onClick={() => handleSelectResult('/faculty')}
                            className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 hover:text-white border border-slate-700"
                          >
                            Faculty
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Date Display Badge */}
            <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 text-slate-300 text-xs font-medium border border-slate-800">
              <Calendar className="w-3.5 h-3.5 text-orange-400" />
              <span>{currentDate}</span>
            </div>

            {/* Notifications Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setIsNotifOpen((prev) => !prev)}
                className="relative p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-800"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500 ring-2 ring-[#0F172A]" />
                )}
              </button>

              {/* Notifications Dropdown Panel */}
              {isNotifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-[#0F172A] rounded-2xl border border-slate-800 shadow-2xl overflow-hidden z-50 p-3 text-left">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Notifications
                      </span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-600 text-white">
                          {unreadCount} new
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-[11px] font-semibold text-orange-400 hover:text-orange-300"
                        >
                          Mark all read
                        </button>
                      )}
                      {notifications.length > 0 && (
                        <button
                          onClick={clearNotifications}
                          className="text-[11px] font-semibold text-slate-400 hover:text-slate-300"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="max-h-72 overflow-y-auto custom-scrollbar pt-2 space-y-2">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-2.5 rounded-xl border transition-colors ${
                            n.read ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-900/90 border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-white leading-snug" style={{ fontFamily: 'Poppins, sans-serif' }}>
                              {n.title}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">{n.time}</span>
                          </div>
                          <p className="text-[11px] text-slate-300 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {n.message}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-xs text-slate-400">
                        No new notifications
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Auth Profile / Sign In */}
            {isAuthenticated && user ? (
              <div className="hidden sm:flex items-center gap-1.5 sm:gap-2 pl-1.5 sm:pl-2 border-l border-slate-800">
                {user.pictureUrl ? (
                  <img
                    src={user.pictureUrl}
                    alt={user.name}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-slate-700 object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#C25E17] text-white font-bold text-xs flex items-center justify-center border border-orange-500/40">
                    {user.name.charAt(0)}
                  </div>
                )}
                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={loginWithGoogle}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#C25E17] via-[#EA580C] to-[#F97316] hover:from-[#EA580C] hover:to-[#FB923C] border border-orange-500/40 text-white font-bold text-xs transition-all cursor-pointer shadow-md shrink-0"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                <LogIn className="w-3.5 h-3.5 shrink-0" />
                <span>Sign In</span>
              </button>
            )}
          <button
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="lg:hidden p-1.5 sm:p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Toggle Menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-4 h-4 text-orange-400" />
            ) : (
              <Grid className="w-4 h-4 text-orange-400" />
            )}
            <span className="text-xs font-bold text-slate-200">Menu</span>
          </button>
        </div>
      </div>

      {/* ─── SLEEK, MINIMAL & COMPACT TOP DROPDOWN MENU (MOBILE ONLY) ─── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
            />

            {/* Compact Top Dropdown Panel (Only ~220px High, No Screen Hogging!) */}
            <motion.div
              initial={{ opacity: 0, y: -10, scaleY: 0.96 }}
              animate={{ opacity: 1, y: 0, scaleY: 1 }}
              exit={{ opacity: 0, y: -10, scaleY: 0.96 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="absolute top-full inset-x-0 z-50 bg-[#0F172A]/98 backdrop-blur-2xl border-b border-slate-800 shadow-2xl p-3 rounded-b-2xl lg:hidden max-h-[65vh] overflow-y-auto custom-scrollbar"
            >
              <div className="max-w-4xl mx-auto space-y-2.5">
                
                {/* Header Category Header */}
                <div className="flex items-center justify-between px-1 pb-1 border-b border-slate-800/80">
                  <span className="text-[10px] font-extrabold text-orange-400 uppercase tracking-wider">
                    Quick Navigation Modules
                  </span>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-[10px] font-semibold text-slate-400 hover:text-white"
                  >
                    Close ✕
                  </button>
                </div>

                {/* Compact 2-Column Pill Grid */}
                <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-1.5">
                  {navGroups.flatMap(g => g.items).map((item) => {
                    const isActive = checkIsActive(item.path);
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-2 p-2 rounded-xl text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-gradient-to-r from-[#C25E17] to-[#EA580C] text-white font-bold shadow-xs border border-orange-400/40'
                            : 'bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-800'
                        }`}
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                      >
                        <div className={`p-1 rounded-lg shrink-0 ${isActive ? 'bg-white/20 text-white' : 'text-orange-400 bg-slate-800'}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="truncate">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>

                {/* Compact Footer CTA */}
                <div className="pt-1.5 flex items-center justify-between gap-2 border-t border-slate-800/80">
                  <Link
                    to="/collab"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-gradient-to-r from-[#C25E17] via-[#EA580C] to-[#F97316] text-white text-[11px] font-bold shadow-sm"
                  >
                    <GitBranch className="w-3.5 h-3.5" />
                    <span>Dev Collab Hub →</span>
                  </Link>

                  {!isAuthenticated && (
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        loginWithGoogle();
                      }}
                      className="py-1.5 px-3 rounded-xl bg-slate-800 text-slate-200 hover:text-white text-[11px] font-bold border border-slate-700"
                    >
                      Sign In
                    </button>
                  )}
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
