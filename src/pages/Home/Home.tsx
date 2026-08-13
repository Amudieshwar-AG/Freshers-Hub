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
    <div className="relative overflow-hidden rounded-3xl min-h-[calc(100vh-100px)] flex flex-col justify-between p-5 sm:p-8 lg:p-10 text-white shadow-2xl border border-slate-800/80 bg-slate-950 group">
      {/* ─── High Clarity Background Video ───────────────────────────────────── */}
      <video
        src="/campus-video.mp4"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-transform duration-1000 scale-[1.01]"
        style={{
          filter: 'contrast(1.05) brightness(0.9) saturate(1.05)',
          imageRendering: 'crisp-edges',
        }}
      />

      {/* Ultra-sleek Gradient Overlay for Crisp Text Contrast */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{
          background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.45) 0%, rgba(15, 23, 42, 0.25) 45%, rgba(15, 23, 42, 0.75) 100%)',
        }}
      />

      {/* Top Branding Badge */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/40 border border-white/20 text-[11px] font-semibold text-white backdrop-blur-md shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Rajalakshmi Institute of Technology</span>
        </div>

        <Link
          to="/raise"
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-rose-500/80 to-pink-600/80 hover:from-rose-500 hover:to-pink-600 text-white text-xs font-bold border border-white/20 backdrop-blur-md transition-all shadow-md hover:scale-105"
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-200" />
          <span>RAISE Incubator</span>
        </Link>
      </div>

      {/* Center Main Hero Title */}
      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-4 my-auto py-10 sm:py-16">
        <h1
          className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-tight text-white"
          style={{ 
            fontFamily: 'Playfair Display, Georgia, serif', 
            color: '#FFFFFF', 
            textShadow: '0 4px 30px rgba(0,0,0,0.85), 0 2px 10px rgba(0,0,0,0.9)' 
          }}
        >
          RIT Freshers Hub
        </h1>
        <p
          className="text-sm sm:text-base md:text-lg text-slate-100 font-medium leading-relaxed max-w-2xl mx-auto"
          style={{ 
            fontFamily: 'Inter, sans-serif',
            textShadow: '0 2px 12px rgba(0,0,0,0.9)'
          }}
        >
          Your unified campus portal — academic notes, AI chatbot, live bus tracking, faculty directory & student developer hub.
        </p>
      </div>

      {/* Bottom Ultra-Compact Ultra-Transparent Quick Launch Bar */}
      <div className="relative z-10 pt-2">
        <div className="text-center mb-3">
          <span className="text-[10px] font-extrabold text-slate-200 uppercase tracking-widest bg-slate-950/50 px-3 py-1 rounded-full border border-white/15 backdrop-blur-md shadow-md inline-block">
            Quick Launch Portal Modules
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
          {quickLaunchModules.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                to={item.path}
                className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl bg-slate-950/30 hover:bg-slate-900/60 border border-white/15 hover:border-white/35 backdrop-blur-md text-white transition-all duration-200 cursor-pointer hover:scale-[1.03] shadow-lg group text-center"
              >
                <div className="w-8 h-8 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center mb-1.5 group-hover:bg-indigo-600 transition-colors shrink-0">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs font-bold truncate max-w-full leading-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {item.label}
                </span>
                <span className="text-[10px] text-slate-300/90 truncate max-w-full mt-0.5">
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
