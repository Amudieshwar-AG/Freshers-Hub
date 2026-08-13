import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Bot,
  Bus,
  Users,
  Trophy,
  Rocket,
  Code2,
  MapPin,
  Sparkles,
  ArrowRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  FileText,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Bell,
  GraduationCap
} from 'lucide-react';
import { FEATURES, FACULTY_DATA, BUS_ROUTES } from '@/constants';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const dailyNotices = [
    {
      id: '1',
      title: 'Official Moodle Notes & PYQs Updated',
      date: 'Aug 12, 2026',
      category: 'Academics',
      desc: '1st to 8th semester course notes and previous year question papers are live on Moodle portal.',
      color: '#8B5CF6',
    },
    {
      id: '2',
      title: 'RAISE Incubator Pitching Registration Open',
      date: 'Aug 15, 2026',
      category: 'Innovation',
      desc: 'Submit your startup ideation proposals to win prototyping grants up to ₹2 Lakhs.',
      color: '#EC4899',
    },
    {
      id: '3',
      title: 'RIT Code Fest 24-Hour Hackathon',
      date: 'Aug 20, 2026',
      category: 'Events',
      desc: 'Annual coding hackathon hosted by CSE Department. Cash prizes & internship opportunities.',
      color: '#F97316',
    },
  ];

  return (
    <div className="space-y-8">
      {/* ─── 1. Welcome Hero Banner with Video Playback ─────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1E1B4B] via-[#2E1065] to-[#3B0764] p-6 sm:p-8 lg:p-10 text-white shadow-xl shadow-purple-950/20 border border-purple-500/20"
      >
        {/* Subtle Decorative Background Glows */}
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Text & CTAs */}
          <div className="lg:col-span-7 space-y-5 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-purple-200">
              <Clock className="w-3.5 h-3.5 text-purple-300" />
              <span>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold tracking-tight leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
              Welcome back,{' '}
              <span className="bg-gradient-to-r from-purple-200 via-pink-200 to-amber-200 bg-clip-text text-transparent">
                {isAuthenticated && user ? user.name.split(' ')[0] : 'Student'}!
              </span>
            </h1>

            <p className="text-sm sm:text-base text-purple-200/90 leading-relaxed max-w-xl" style={{ fontFamily: 'Inter, sans-serif' }}>
              Always stay updated with semester notes, live bus routes, AI chatbot assistant, community Q&A, and startup incubation pitching.
            </p>

            {/* Quick Action CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                to="/notes"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-purple-50 text-purple-950 font-bold text-xs shadow-lg transition-all cursor-pointer hover:scale-[1.02]"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                <BookOpen className="w-4 h-4 text-purple-700" />
                <span>Launch Moodle Notes</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <Link
                to="/ai-assistant"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs transition-all cursor-pointer"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                <Bot className="w-4 h-4 text-amber-300" />
                <span>Ask AI Chatbot</span>
              </Link>

              <Link
                to="/raise"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs shadow-md border border-white/20 transition-all cursor-pointer"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                <Rocket className="w-4 h-4 text-amber-200" />
                <span>RAISE Incubator</span>
              </Link>
            </div>
          </div>

          {/* Right Video Playback & Preview Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-black/40 group">
              <video
                ref={videoRef}
                src="/campus-video.mp4"
                autoPlay
                loop
                muted={isMuted}
                playsInline
                className="w-full h-48 sm:h-56 lg:h-64 object-cover"
              />

              {/* Video Overlay Controls */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-90 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-600/80 text-white border border-purple-400/40">
                    Campus Tour Video
                  </span>
                  <button
                    onClick={toggleMute}
                    className="p-1.5 rounded-lg bg-black/50 hover:bg-black/80 text-white transition-colors cursor-pointer"
                    title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      RIT Campus Infrastructure
                    </span>
                    <span className="text-[10px] text-slate-300">Official Rajalakshmi Institute of Technology Overview</span>
                  </div>

                  <button
                    onClick={togglePlay}
                    className="p-2.5 rounded-full bg-white/90 hover:bg-white text-purple-900 shadow-lg transition-transform hover:scale-110 cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ─── 2. Enterprise Quick Metrics Grid ────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between hover:border-purple-300 transition-all">
          <div className="space-y-1 text-left">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>
              Academic Notes
            </span>
            <div className="text-2xl font-extrabold text-slate-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
              1st – 8th Sem
            </div>
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Moodle Verified
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 border border-purple-200/60 flex items-center justify-center font-bold">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between hover:border-purple-300 transition-all">
          <div className="space-y-1 text-left">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>
              Bus Routes
            </span>
            <div className="text-2xl font-extrabold text-slate-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {BUS_ROUTES.length} Active Routes
            </div>
            <span className="text-[11px] text-blue-600 font-semibold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> 7:00 AM Departures
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200/60 flex items-center justify-center font-bold">
            <Bus className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between hover:border-purple-300 transition-all">
          <div className="space-y-1 text-left">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>
              AI Assistant
            </span>
            <div className="text-2xl font-extrabold text-slate-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
              24/7 Live
            </div>
            <span className="text-[11px] text-purple-600 font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Instant Answers
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 border border-purple-200/60 flex items-center justify-center font-bold">
            <Bot className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between hover:border-purple-300 transition-all">
          <div className="space-y-1 text-left">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>
              Community Q&A
            </span>
            <div className="text-2xl font-extrabold text-slate-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Senior Helpers
            </div>
            <span className="text-[11px] text-rose-600 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified Answers
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200/60 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ─── 3. Main Dashboard Layout (Two Columns: Courses Grid + Right Widgets) ────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
        {/* Left 8 Cols: Enrolled Modules / Quick Access */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Academic Modules & Tools
              </h2>
              <p className="text-xs text-slate-500">Quick access to all essential student portal tools</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {FEATURES.map((feature) => {
              return (
                <div
                  key={feature.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-purple-400/60 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold"
                        style={{ backgroundColor: feature.bgColor, color: feature.color }}
                      >
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        Official Module
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 group-hover:text-purple-700 transition-colors" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {feature.title}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {feature.description}
                    </p>
                  </div>

                  <Link
                    to={feature.path}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 group-hover:bg-purple-600 text-slate-700 group-hover:text-white text-xs font-bold transition-all cursor-pointer"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    <span>Launch Module</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 4 Cols: Faculty Spotlight & Daily Notices Widget */}
        <div className="lg:col-span-4 space-y-6">
          {/* Featured Instructors / Faculty */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Course Instructors
              </h3>
              <Link to="/faculty" className="text-xs font-bold text-purple-600 hover:text-purple-700">
                See all
              </Link>
            </div>

            <div className="space-y-3">
              {FACULTY_DATA.slice(0, 4).map((prof) => (
                <div key={prof.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {prof.name.replace('Dr. ', '').replace('Prof. ', '').charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {prof.name}
                    </h4>
                    <span className="text-[11px] text-slate-500 block truncate">{prof.department}</span>
                  </div>
                  <Link
                    to="/faculty"
                    className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-purple-100 hover:text-purple-700 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Notices & Announcements */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Daily Campus Notices
                </h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
                Live Feed
              </span>
            </div>

            <div className="space-y-4">
              {dailyNotices.map((notice) => (
                <div key={notice.id} className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/60 space-y-2 text-left">
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-md text-white"
                      style={{ backgroundColor: notice.color }}
                    >
                      {notice.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">{notice.date}</span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 leading-snug" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {notice.title}
                  </h4>

                  <p className="text-[11px] text-slate-600 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {notice.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
