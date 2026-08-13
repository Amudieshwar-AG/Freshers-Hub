import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Menu, Sparkles, User, Calendar, ShieldCheck, LogIn } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const navigate = useNavigate();
  const { user, isAuthenticated, isVerifiedStudent, loginWithGoogle } = useAuth();

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const q = searchQuery.toLowerCase();
    if (q.includes('note') || q.includes('pyq') || q.includes('syllabus')) {
      navigate('/notes');
    } else if (q.includes('bus') || q.includes('route')) {
      navigate('/bus-routes');
    } else if (q.includes('faculty') || q.includes('teacher') || q.includes('prof')) {
      navigate('/faculty');
    } else if (q.includes('club') || q.includes('event')) {
      navigate('/events');
    } else if (q.includes('ai') || q.includes('chat') || q.includes('bot')) {
      navigate('/ai-assistant');
    } else if (q.includes('community') || q.includes('qa') || q.includes('question')) {
      navigate('/community');
    } else if (q.includes('collab') || q.includes('dev')) {
      navigate('/collab');
    } else if (q.includes('raise') || q.includes('incubator') || q.includes('pitch')) {
      navigate('/raise');
    } else {
      navigate(`/notes?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 py-3 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-4">
        {/* Mobile Toggle */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <form onSubmit={handleSearch} className="relative w-64 sm:w-80 md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes, faculty, bus routes, clubs..."
            className="w-full pl-10 pr-12 py-2 text-xs font-medium bg-slate-100/90 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-purple-500/40 rounded-xl text-slate-800 placeholder-slate-400 outline-none transition-all shadow-inner"
            style={{ fontFamily: 'Inter, sans-serif' }}
          />
          <span className="hidden sm:inline-flex absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded-md shadow-2xs">
            ⌘K
          </span>
        </form>
      </div>

      {/* Right Header Status Bar */}
      <div className="flex items-center gap-3">
        {/* Date Display Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200/60">
          <Calendar className="w-3.5 h-3.5 text-purple-600" />
          <span>{currentDate}</span>
        </div>

        {/* Notifications Icon */}
        <button
          className="relative p-2 rounded-xl bg-slate-100 hover:bg-purple-50 text-slate-600 hover:text-purple-600 transition-colors cursor-pointer border border-slate-200/60"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-purple-600 ring-2 ring-white" />
        </button>

        {/* User Auth Quick Badge */}
        {isAuthenticated && user ? (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            {user.pictureUrl ? (
              <img
                src={user.pictureUrl}
                alt={user.name}
                className="w-8 h-8 rounded-full border border-purple-300 object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center">
                {user.name.charAt(0)}
              </div>
            )}
            <div className="hidden xl:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-800 leading-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {user.name}
              </span>
              <span className="text-[10px] text-purple-600 font-semibold">
                {isVerifiedStudent ? 'Verified Student' : 'RIT Account'}
              </span>
            </div>
          </div>
        ) : (
          <button
            onClick={loginWithGoogle}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
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
