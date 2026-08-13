import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  Menu,
  Calendar,
  LogIn,
  Check,
  X,
  BookOpen,
  Bus,
  Users,
  Calendar as ClubIcon,
  Code2,
  Trophy,
  Bot,
  Rocket,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { BUS_ROUTES, FACULTY_DATA, CLUBS_DATA } from '@/constants';

interface HeaderProps {
  onToggleSidebar: () => void;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'academic' | 'dev' | 'campus' | 'bus';
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState('');
  const navigate = useNavigate();
  const { user, isAuthenticated, isVerifiedStudent, loginWithGoogle } = useAuth();
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

  // Listen for ⌘K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
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
    <header className="sticky top-0 z-30 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 py-3 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-4">
        {/* Mobile Toggle */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Interactive Search Input Container */}
        <div className="relative" ref={searchRef}>
          <div
            onClick={() => setIsSearchOpen(true)}
            className="relative w-64 sm:w-80 md:w-96 cursor-text"
          >
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Search notes, faculty, bus routes, clubs..."
              className="w-full pl-10 pr-12 py-2 text-xs font-medium bg-slate-100/90 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-indigo-500/40 rounded-xl text-slate-800 placeholder-slate-400 outline-none transition-all shadow-inner"
              style={{ fontFamily: 'Inter, sans-serif' }}
            />
            <span className="hidden sm:inline-flex absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded-md shadow-2xs">
              ⌘K
            </span>
          </div>

          {/* Search Live Results Dropdown Overlay */}
          {isSearchOpen && (
            <div className="absolute top-full left-0 mt-2 w-full sm:w-[420px] bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden z-50 p-2 text-left">
              <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {searchQuery.trim() ? 'Search Results' : 'Quick Navigation'}
                </span>
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
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
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-indigo-50/70 cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-700 truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>
                              {res.title}
                            </span>
                            <span className="text-[11px] text-slate-500 truncate">{res.desc}</span>
                          </div>
                        </div>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 shrink-0">
                          {res.category}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 text-center space-y-2">
                    <span className="text-xs text-slate-500 block">
                      {searchQuery.trim() ? `No matches found for "${searchQuery}"` : 'Type to search notes, faculty, routes & clubs'}
                    </span>
                    <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                      <button
                        onClick={() => handleSelectResult('/notes')}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium hover:bg-indigo-50 hover:text-indigo-600"
                      >
                        Notes
                      </button>
                      <button
                        onClick={() => handleSelectResult('/bus-routes')}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium hover:bg-indigo-50 hover:text-indigo-600"
                      >
                        Bus Routes
                      </button>
                      <button
                        onClick={() => handleSelectResult('/faculty')}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium hover:bg-indigo-50 hover:text-indigo-600"
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
      </div>

      {/* Right Header Status Bar */}
      <div className="flex items-center gap-3">
        {/* Date Display Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200/60">
          <Calendar className="w-3.5 h-3.5 text-indigo-600" />
          <span>{currentDate}</span>
        </div>

        {/* Functional Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen((prev) => !prev)}
            className="relative p-2 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer border border-slate-200/60"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white" />
            )}
          </button>

          {/* Notifications Panel Dropdown */}
          {isNotifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden z-50 p-3 text-left">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                      {unreadCount} new
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      Mark all read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={clearNotifications}
                      className="text-[11px] font-semibold text-slate-400 hover:text-slate-600"
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
                        n.read ? 'bg-slate-50/60 border-slate-100' : 'bg-indigo-50/40 border-indigo-100'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-900 leading-snug" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {n.title}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
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

        {/* User Auth Quick Badge */}
        {isAuthenticated && user ? (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            {user.pictureUrl ? (
              <img
                src={user.pictureUrl}
                alt={user.name}
                className="w-8 h-8 rounded-full border border-indigo-300 object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                {user.name.charAt(0)}
              </div>
            )}
            <div className="hidden xl:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-800 leading-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {user.name}
              </span>
              <span className="text-[10px] text-indigo-600 font-semibold">
                {isVerifiedStudent ? 'Verified Student' : 'RIT Account'}
              </span>
            </div>
          </div>
        ) : (
          <button
            onClick={loginWithGoogle}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}
