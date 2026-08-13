import { Link } from 'react-router-dom';
import {
  BookOpen,
  Bot,
  Bus,
  Calendar,
  Code2,
  Trophy
} from 'lucide-react';

export default function Home() {
  const quickLaunchModules = [
    { label: 'Bus Routes', path: '/bus-routes', icon: Bus, desc: 'Schedules & Stops' },
    { label: 'Notes & PYQs', path: '/notes', icon: BookOpen, desc: 'Moodle Materials' },
    { label: 'Campus Chatbot', path: '/ai-assistant', icon: Bot, desc: 'Instant Q&A' },
    { label: 'Student Clubs', path: '/events', icon: Calendar, desc: 'Clubs & Events' },
    { label: 'LeetCode Ranking', path: '/leetcode', icon: Trophy, desc: 'Coder Leaderboard' },
    { label: 'Dev Collab', path: '/collab', icon: Code2, desc: 'Co-Developers' },
  ];

  return (
    <div className="relative overflow-hidden rounded-3xl h-[calc(100vh-120px)] min-h-[500px] flex flex-col justify-between p-6 sm:p-10 text-white shadow-2xl border border-slate-800 bg-[#0F172A]">
      {/* Background Video (Low Bitrate & AutoPlay Muted) */}
      <video
        src="/campus-video.mp4"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />

      {/* Clean Dark Vignette Overlay */}
      <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-[1px]" />

      {/* Top Branding Badge */}
      <div className="relative z-10 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 border border-white/20 text-xs font-semibold text-white backdrop-blur-md">
          <span>Rajalakshmi Institute of Technology</span>
        </div>
      </div>

      {/* Center Main Hero Title */}
      <div className="relative z-10 max-w-3xl mx-auto text-center space-y-4 my-auto py-4">
        <h1
          className="text-4xl sm:text-6xl font-black tracking-tight leading-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]"
          style={{ fontFamily: 'Playfair Display, serif', color: '#FFFFFF', textShadow: '0 4px 24px rgba(0,0,0,0.95)' }}
        >
          RIT Freshers Hub
        </h1>
        <p
          className="text-sm sm:text-base text-slate-100 font-medium leading-relaxed max-w-2xl mx-auto drop-shadow-md"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Centralized campus portal — academic notes, chatbot, bus routes, faculty directory & student developer tools.
        </p>
      </div>

      {/* Bottom Transparent Glassmorphic Quick Launch Bar */}
      <div className="relative z-10 pt-2">
        <div className="text-center mb-3">
          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-widest bg-black/50 px-3.5 py-1.5 rounded-full border border-white/15 backdrop-blur-md">
            Quick Launch Portal Modules
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {quickLaunchModules.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                to={item.path}
                className="flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl bg-white/10 hover:bg-white/25 border border-white/20 backdrop-blur-md text-white transition-all cursor-pointer hover:scale-[1.04] shadow-lg group text-center"
              >
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center mb-2 group-hover:bg-indigo-600 transition-colors">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs sm:text-sm font-bold truncate max-w-full" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {item.label}
                </span>
                <span className="text-[10px] sm:text-[11px] text-slate-300 truncate max-w-full">
                  {item.desc}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
