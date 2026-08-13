import { Link } from 'react-router-dom';
import {
  BookOpen,
  Bot,
  Bus,
  Calendar,
  Code2,
  Trophy,
  Sparkles,
  ChevronRight
} from 'lucide-react';

export default function Home() {
  const quickLaunchModules = [
    { label: 'Bus Routes', path: '/bus-routes', icon: Bus, desc: 'Schedules & GPS' },
    { label: 'Notes & PYQs', path: '/notes', icon: BookOpen, desc: 'Moodle Material' },
    { label: 'Campus Chatbot', path: '/ai-assistant', icon: Bot, desc: 'AI Instant Q&A' },
    { label: 'Student Clubs', path: '/events', icon: Calendar, desc: 'Clubs & Events' },
    { label: 'LeetCode Board', path: '/leetcode', icon: Trophy, desc: 'Top RIT Coders' },
    { label: 'Dev Collab', path: '/collab', icon: Code2, desc: 'Co-Developers' },
  ];

  return (
    <div className="relative w-full min-h-[calc(100vh-90px)] flex flex-col justify-between p-2 sm:p-6 lg:p-8 text-white group">
      {/* ─── Fixed Full-Screen Background Video (Spans Entire Laptop/Phone Frame) ─── */}
      <video
        src="/campus-video.mp4"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="fixed inset-0 w-full h-full object-cover pointer-events-none z-0"
        style={{
          filter: 'contrast(1.05) brightness(0.85) saturate(1.05)',
          imageRendering: 'crisp-edges',
        }}
      />

      {/* Fixed High-Contrast Dark Gradient Overlay across full viewport */}
      <div 
        className="fixed inset-0 pointer-events-none z-0" 
        style={{
          background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.5) 0%, rgba(15, 23, 42, 0.3) 45%, rgba(11, 15, 25, 0.85) 100%)',
        }}
      />

      {/* Top Branding Badge */}
      <div className="relative z-10 flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-slate-950/60 border border-white/20 text-[10px] sm:text-xs font-semibold text-white backdrop-blur-md shadow-xl truncate">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span className="truncate">Rajalakshmi Institute of Technology</span>
        </div>

        <Link
          to="/raise"
          className="inline-flex items-center gap-1 sm:gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-gradient-to-r from-rose-500/90 to-pink-600/90 hover:from-rose-500 hover:to-pink-600 text-white text-[10px] sm:text-xs font-bold border border-white/25 backdrop-blur-md transition-all shadow-lg hover:scale-105 shrink-0"
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-200" />
          <span>RAISE Incubator</span>
        </Link>
      </div>

      {/* Center Main Hero Title */}
      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-3 sm:space-y-4 my-auto py-8 sm:py-16">
        <h1
          className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-tight text-white"
          style={{ 
            fontFamily: 'Playfair Display, Georgia, serif', 
            color: '#FFFFFF', 
            textShadow: '0 4px 35px rgba(0,0,0,0.9), 0 2px 12px rgba(0,0,0,0.95)' 
          }}
        >
          RIT Freshers Hub
        </h1>
        <p
          className="text-xs sm:text-base md:text-lg text-slate-100 font-medium leading-relaxed max-w-2xl mx-auto px-2"
          style={{ 
            fontFamily: 'Inter, sans-serif',
            textShadow: '0 2px 14px rgba(0,0,0,0.95)'
          }}
        >
          Your unified campus portal — academic notes, AI chatbot, live bus tracking, faculty directory & student developer hub.
        </p>
      </div>

      {/* Bottom Ultra-Compact Ultra-Transparent Quick Launch Bar */}
      <div className="relative z-10 pt-2 sm:pt-4">
        <div className="text-center mb-2 sm:mb-3">
          <span className="text-[9px] sm:text-[10px] font-extrabold text-slate-200 uppercase tracking-widest bg-slate-950/70 px-3 py-1 rounded-full border border-white/20 backdrop-blur-md shadow-lg inline-block">
            Quick Launch Portal Modules
          </span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 sm:gap-3">
          {quickLaunchModules.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                to={item.path}
                className="flex flex-col items-center justify-center p-2 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-950/50 hover:bg-slate-900/80 border border-white/20 hover:border-white/40 backdrop-blur-md text-white transition-all duration-200 cursor-pointer hover:scale-[1.04] shadow-xl group text-center"
              >
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-white/15 border border-white/25 flex items-center justify-center mb-1 sm:mb-1.5 group-hover:bg-[#1E1B4B] transition-colors shrink-0">
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                </div>
                <span className="text-[10px] sm:text-xs font-bold truncate max-w-full leading-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {item.label}
                </span>
                <span className="hidden sm:block text-[10px] text-slate-300/90 truncate max-w-full mt-0.5">
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
