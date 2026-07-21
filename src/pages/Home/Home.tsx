import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Sparkles, BookOpen, Bot, GraduationCap,
  CheckCircle, Zap, Shield, Brain
} from 'lucide-react';
import SectionTitle from '@/components/SectionTitle/SectionTitle';
import StatsCard from '@/components/StatsCard/StatsCard';
import FeatureCard from '@/components/FeatureCard/FeatureCard';
import FloatingCard from '@/components/FloatingCard/FloatingCard';
import ChatPreview from '@/components/ChatPreview/ChatPreview';
import { StaggerContainer, StaggerItem } from '@/components/AnimatedContainer/AnimatedContainer';
import AnimatedContainer from '@/components/AnimatedContainer/AnimatedContainer';
import { STATS, FEATURES, CAMPUS_LOCATIONS } from '@/constants';
import * as LucideIcons from 'lucide-react';

export default function Home() {
  return (
    <div>
      {/* ─── Hero Section ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-12 pb-24" style={{ backgroundColor: '#FAFAFA' }}>
        {/* Background Decoration */}
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-[0.04] -translate-y-1/2 translate-x-1/3 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #F97316, transparent)' }}
        />
        <div
          className="absolute bottom-0 left-0 w-[350px] h-[350px] rounded-full opacity-[0.03] translate-y-1/2 -translate-x-1/3 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #F97316, transparent)' }}
        />

        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            {/* Left – Visual Section (RIT Events Hub Style) */}
            <div className="lg:col-span-6 relative flex justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7 }}
                className="relative w-full max-w-lg"
              >
                {/* Main campus image/graphic card */}
                <div
                  className="rounded-[24px] overflow-hidden bg-white border border-[#E5E7EB] relative aspect-[4/3] w-full"
                  style={{ boxShadow: '0 24px 60px -12px rgba(0,0,0,0.15)' }}
                >
                  {/* Inline Premium Vector SVG Illustration of RIT Campus Building & Canopy */}
                  <svg viewBox="0 0 800 600" className="w-full h-full select-none" preserveAspectRatio="xMidYMid slice">
                    <defs>
                      <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#1E3A8A" />
                        <stop offset="40%" stopColor="#3B82F6" />
                        <stop offset="100%" stopColor="#93C5FD" />
                      </linearGradient>
                      <linearGradient id="grassGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#059669" />
                        <stop offset="100%" stopColor="#065F46" />
                      </linearGradient>
                      <linearGradient id="pathGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#F1F5F9" />
                        <stop offset="100%" stopColor="#CBD5E1" />
                      </linearGradient>
                      <linearGradient id="buildGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#E2E8F0" />
                        <stop offset="100%" stopColor="#F8FAFC" />
                      </linearGradient>
                      <linearGradient id="canopyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#F97316" />
                        <stop offset="100%" stopColor="#EA580C" />
                      </linearGradient>
                      <filter id="glow">
                        <feGaussianBlur stdDeviation="15" result="coloredBlur"/>
                        <feMerge>
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>

                    {/* Sky */}
                    <rect width="800" height="600" fill="url(#skyGrad)" />

                    {/* Glowing Sun */}
                    <circle cx="700" cy="100" r="50" fill="#FEF08A" opacity="0.8" filter="url(#glow)" />

                    {/* Distant Hills / Tree Line */}
                    <path d="M0 450 Q150 420 300 440 T600 430 T800 450 L800 600 L0 600 Z" fill="#047857" opacity="0.7" />
                    <path d="M0 460 Q200 440 400 455 T800 460 L800 600 L0 600 Z" fill="url(#grassGrad)" />

                    {/* Academic Building Facade (Modern RIT Blocks) */}
                    <rect x="50" y="200" width="300" height="260" fill="url(#buildGrad)" rx="8" />
                    {/* Windows Grid */}
                    <g fill="#475569" opacity="0.3">
                      {/* Row 1 */}
                      <rect x="75" y="230" width="35" height="40" rx="3" />
                      <rect x="135" y="230" width="35" height="40" rx="3" />
                      <rect x="195" y="230" width="35" height="40" rx="3" />
                      <rect x="255" y="230" width="35" height="40" rx="3" />
                      {/* Row 2 */}
                      <rect x="75" y="300" width="35" height="40" rx="3" />
                      <rect x="135" y="300" width="35" height="40" rx="3" />
                      <rect x="195" y="300" width="35" height="40" rx="3" />
                      <rect x="255" y="300" width="35" height="40" rx="3" />
                      {/* Row 3 */}
                      <rect x="75" y="370" width="35" height="40" rx="3" />
                      <rect x="135" y="370" width="35" height="40" rx="3" />
                      <rect x="195" y="370" width="35" height="40" rx="3" />
                      <rect x="255" y="370" width="35" height="40" rx="3" />
                    </g>

                    {/* Main Entrance Pillars & Arch (RIT Architecture) */}
                    <rect x="380" y="150" width="380" height="310" fill="#F1F5F9" rx="16" opacity="0.95" />
                    <rect x="400" y="170" width="340" height="290" fill="#E2E8F0" rx="12" />

                    {/* Premium Canopy Truss Structure (RIT Event Canopy Representation) */}
                    <polygon points="360,150 780,120 780,180 360,210" fill="url(#canopyGrad)" opacity="0.9" />
                    <g stroke="white" strokeWidth="3" opacity="0.8">
                      <line x1="380" y1="155" x2="380" y2="200" />
                      <line x1="450" y1="150" x2="450" y2="195" />
                      <line x1="520" y1="145" x2="520" y2="190" />
                      <line x1="590" y1="140" x2="590" y2="185" />
                      <line x1="660" y1="135" x2="660" y2="180" />
                      <line x1="730" y1="130" x2="730" y2="175" />
                      
                      {/* Cross trusses */}
                      <line x1="380" y1="155" x2="450" y2="195" />
                      <line x1="450" y1="150" x2="520" y2="190" />
                      <line x1="520" y1="145" x2="590" y2="185" />
                      <line x1="590" y1="140" x2="660" y2="180" />
                      <line x1="660" y1="135" x2="730" y2="175" />
                    </g>

                    {/* Columns supporting Canopy */}
                    <rect x="400" y="195" width="25" height="265" fill="#64748B" rx="4" />
                    <rect x="520" y="190" width="25" height="270" fill="#64748B" rx="4" />
                    <rect x="640" y="180" width="25" height="280" fill="#64748B" rx="4" />
                    <rect x="730" y="175" width="25" height="285" fill="#64748B" rx="4" />

                    {/* Campus Pathway leading to building */}
                    <polygon points="350,460 550,460 700,600 100,600" fill="url(#pathGrad)" />
                    <line x1="400" y1="460" x2="250" y2="600" stroke="#CBD5E1" strokeWidth="4" />
                    <line x1="500" y1="460" x2="550" y2="600" stroke="#CBD5E1" strokeWidth="4" />

                    {/* Trees & Foliage in Foreground */}
                    <g fill="#059669">
                      <circle cx="80" cy="480" r="45" />
                      <circle cx="120" cy="510" r="35" />
                      <circle cx="720" cy="500" r="50" />
                      <circle cx="760" cy="480" r="40" />
                    </g>
                    <g fill="#10B981">
                      <circle cx="75" cy="465" r="35" />
                      <circle cx="715" cy="485" r="40" />
                    </g>
                  </svg>
                  {/* Subtle dark gradient overlay to ensure text contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 pointer-events-none" />
                  
                  {/* Text on top of the image (RIT Events Hub Style) */}
                  <div className="absolute bottom-6 left-6 z-10 text-left pointer-events-none">
                    <h2 className="text-white font-extrabold text-2xl tracking-wide leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
                      Rajalakshmi Institute
                    </h2>
                    <p className="text-orange-400 font-bold text-sm mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                      of Technology, Chennai
                    </p>
                    <div className="inline-flex items-center gap-1.5 mt-3.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">Est. 2008 • NBA & NAAC A+</span>
                    </div>
                  </div>
                </div>

                {/* Overlapping Dark Card (Innovation Card - Exact Match with Reference Image) */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="absolute -bottom-6 -right-4 md:-right-8 bg-[#1E293B] text-white p-6 rounded-2xl border border-white/10 max-w-[240px] z-20"
                  style={{ boxShadow: '0 12px 40px rgba(0,0,0,0.25)' }}
                >
                  <span className="text-[#F97316] text-[11px] font-bold tracking-wider uppercase mb-1.5 block" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    INNOVATION
                  </span>
                  <p className="text-[12px] text-slate-300 leading-relaxed font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Where engineering meets guidance. Fueling the academic journey of our freshers.
                  </p>
                </motion.div>
              </motion.div>
            </div>

            {/* Right – Text Content */}
            <div className="lg:col-span-6 flex flex-col justify-center">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-3"
              >
                <span className="text-[#F97316] text-xs font-bold uppercase tracking-widest" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  OUR LEGACY & FUTURE
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl md:text-5xl xl:text-6xl font-bold leading-[1.1] mb-6"
                style={{ fontFamily: 'Playfair Display, serif', color: '#1E293B' }}
              >
                Welcome to <br />
                <span className="font-serif italic text-[#F97316] font-medium block mt-1">
                  RIT Freshers Hub
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-base text-[#475569] leading-relaxed mb-8"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                The RIT Freshers Hub is your centralized gateway to campus life, designed to simplify how you discover and participate in academic and extracurricular activities. With seamless access to notes, PYQs, AI assistant, and bus routes, we ensure you have everything needed to succeed.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-wrap gap-4 mb-8"
              >
                <Link to="/notes">
                  <motion.button
                    whileHover={{ scale: 1.03, boxShadow: '0 8px 25px rgba(249,115,22,0.3)' }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm cursor-pointer"
                    style={{
                      fontFamily: 'Poppins, sans-serif',
                      background: 'linear-gradient(135deg, #F97316, #FB923C)',
                    }}
                  >
                    <BookOpen className="w-4 h-4" />
                    Explore Hub
                    <ArrowRight className="w-3.5 h-3.5" />
                  </motion.button>
                </Link>

                <Link to="/ai-assistant">
                  <motion.button
                    whileHover={{ scale: 1.03, borderColor: '#F97316', color: '#F97316', backgroundColor: '#FFF7ED' }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm border-2 border-[#E5E7EB] text-[#1E293B] bg-white transition-all cursor-pointer"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    <Bot className="w-4 h-4" />
                    Ask AI Assistant
                  </motion.button>
                </Link>
              </motion.div>

              {/* Badges positioned cleanly below buttons with more breathing room */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-wrap gap-6 text-[#94A3B8] border-t border-[#E5E7EB] pt-6"
              >
                {[
                  { icon: CheckCircle, text: 'Official Portal' },
                  { icon: Zap, text: 'Instant AI Support' },
                  { icon: Shield, text: 'Student Verified' },
                ].map((badge, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <badge.icon className="w-4 h-4 text-[#F97316]/70" />
                    <span>{badge.text}</span>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats Section ────────────────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {STATS.map((stat, i) => (
              <StaggerItem key={i}>
                <StatsCard stat={stat} delay={i * 0.05} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ─── Features Section ─────────────────────────────────────────────────── */}
      <section className="section-padding" style={{ backgroundColor: '#FAFAFA' }}>
        <div className="container-custom">
          <SectionTitle
            tag="Everything You Need"
            title="Built for"
            highlight="RIT Freshers"
            subtitle="From notes to AI assistance — we've got everything you need to navigate campus life with confidence."
          />

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((feature) => (
              <StaggerItem key={feature.id}>
                <FeatureCard feature={feature} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ─── AI Section ───────────────────────────────────────────────────────── */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left – Text */}
            <AnimatedContainer direction="left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5"
                style={{ backgroundColor: '#F5F3FF', border: '1px solid #DDD6FE' }}>
                <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
                <span className="text-xs font-semibold text-[#8B5CF6] uppercase tracking-wider" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  AI-Powered
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif', color: '#1E293B' }}>
                Your 24/7{' '}
                <span style={{ background: 'linear-gradient(135deg, #F97316, #FB923C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  Campus Guide
                </span>
              </h2>
              <p className="text-[#475569] leading-relaxed mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
                Ask anything about RIT — from admission documents to canteen timings. Our AI assistant, powered by Google Gemini with campus-specific knowledge, gives you instant, accurate answers.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { icon: 'Brain', label: 'Gemini AI', desc: 'State-of-the-art AI' },
                  { icon: 'Database', label: 'RAG System', desc: 'Campus knowledge base' },
                  { icon: 'Map', label: 'Campus Context', desc: 'RIT-specific answers' },
                  { icon: 'Zap', label: 'Instant Answers', desc: 'No wait time' },
                ].map((item, i) => {
                  const Icon = (LucideIcons as Record<string, React.ComponentType<{ className?: string }>>)[item.icon];
                  return (
                    <div key={i} className="flex items-start gap-3 p-4 rounded-xl border border-[#E5E7EB] bg-[#FAFAFA]">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#FFF7ED] shrink-0">
                        {Icon && <Icon className="w-4.5 h-4.5" style={{ color: '#F97316' } as React.CSSProperties} />}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-[#1E293B]" style={{ fontFamily: 'Poppins, sans-serif' }}>{item.label}</div>
                        <div className="text-xs text-[#94A3B8]" style={{ fontFamily: 'Inter, sans-serif' }}>{item.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Link to="/ai-assistant">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-white font-semibold"
                  style={{
                    fontFamily: 'Poppins, sans-serif',
                    background: 'linear-gradient(135deg, #F97316, #FB923C)',
                    boxShadow: '0 6px 20px rgba(249,115,22,0.35)',
                  }}
                >
                  <Bot className="w-4.5 h-4.5" />
                  Try AI Assistant
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>
            </AnimatedContainer>

            {/* Right – Chat Preview */}
            <AnimatedContainer direction="right" delay={0.2}>
              <ChatPreview />
            </AnimatedContainer>
          </div>
        </div>
      </section>

      {/* ─── Campus Quick Nav ─────────────────────────────────────────────────── */}
      <section className="section-padding" style={{ backgroundColor: '#FAFAFA' }}>
        <div className="container-custom">
          <SectionTitle
            tag="Navigate Campus"
            title="Explore"
            highlight="RIT Campus"
            subtitle="Find your way around campus — departments, labs, library, and all key locations."
          />

          <AnimatedContainer>
            <div className="bg-white rounded-3xl border border-[#E5E7EB] overflow-hidden" style={{ boxShadow: '0 8px 40px -8px rgba(0,0,0,0.1)' }}>
              {/* Map placeholder */}
              <div
                className="h-56 flex items-center justify-center relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #1E293B, #334155)' }}
              >
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: 'linear-gradient(rgba(249,115,22,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.5) 1px, transparent 1px)',
                    backgroundSize: '30px 30px',
                  }}
                />
                {/* Location pins */}
                {[
                  { label: 'CSE Block', x: '25%', y: '30%' },
                  { label: 'Library', x: '55%', y: '45%' },
                  { label: 'Canteen', x: '70%', y: '65%' },
                  { label: 'Hostel', x: '20%', y: '65%' },
                ].map((pin, i) => (
                  <motion.div
                    key={i}
                    className="absolute flex flex-col items-center gap-1 cursor-pointer group"
                    style={{ left: pin.x, top: pin.y, transform: 'translate(-50%, -50%)' }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <div className="w-6 h-6 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-all"
                      style={{ background: 'linear-gradient(135deg, #F97316, #FB923C)' }}>
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                    <span className="text-[10px] text-white font-medium bg-black/50 px-1.5 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {pin.label}
                    </span>
                  </motion.div>
                ))}
                <div className="relative z-10 text-center">
                  <div className="text-white/40 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>Interactive Campus Map</div>
                  <Link to="/campus">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      className="mt-2 px-5 py-2 rounded-xl text-white text-xs font-semibold"
                      style={{ background: 'rgba(249,115,22,0.8)', fontFamily: 'Poppins, sans-serif' }}
                    >
                      Open Full Map
                    </motion.button>
                  </Link>
                </div>
              </div>

              {/* Quick nav buttons */}
              <div className="p-5 grid grid-cols-4 sm:grid-cols-8 gap-3">
                {CAMPUS_LOCATIONS.map((loc) => {
                  const Icon = (LucideIcons as Record<string, React.ComponentType<{ className?: string }>>)[loc.icon];
                  return (
                    <Link to="/campus" key={loc.id}>
                      <motion.div
                        whileHover={{ y: -3, backgroundColor: '#FFF7ED' }}
                        className="flex flex-col items-center gap-2 p-3 rounded-xl cursor-pointer transition-all border border-transparent hover:border-[#FED7AA]"
                      >
                        <div className="w-9 h-9 rounded-xl bg-[#F8FAFC] flex items-center justify-center">
                          {Icon && <Icon className="w-4.5 h-4.5 text-[#F97316]" />}
                        </div>
                        <span className="text-[10px] text-[#475569] text-center leading-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {loc.name}
                        </span>
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </AnimatedContainer>
        </div>
      </section>

      {/* ─── Community Teaser ─────────────────────────────────────────────────── */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Q&A teaser */}
            <AnimatedContainer direction="left">
              <div className="rounded-3xl p-7 h-full border border-[#E5E7EB]"
                style={{ background: 'linear-gradient(135deg, #FAFAFA, #FFF7ED)', boxShadow: '0 4px 20px -4px rgba(0,0,0,0.07)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-[#FFF7ED]">
                    <LucideIcons.MessageCircle className="w-5 h-5 text-[#F97316]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1E293B]" style={{ fontFamily: 'Poppins, sans-serif' }}>Freshers Q&A</h3>
                    <p className="text-xs text-[#94A3B8]">Get answers from seniors</p>
                  </div>
                </div>
                <div className="space-y-3 mb-5">
                  {['How is hostel life at RIT?', 'Best clubs to join as a fresher?', 'Tips for first semester survival'].map((q, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-3 bg-white rounded-xl border border-[#E5E7EB]">
                      <span className="text-[#F97316] text-xs font-bold mt-0.5">Q</span>
                      <span className="text-xs text-[#475569]" style={{ fontFamily: 'Inter, sans-serif' }}>{q}</span>
                    </div>
                  ))}
                </div>
                <Link to="/community">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold text-[#F97316] border-2 border-[#F97316] hover:bg-[#FFF7ED] transition-all"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    Join the Discussion
                  </motion.button>
                </Link>
              </div>
            </AnimatedContainer>

            {/* Anonymous Confession Teaser */}
            <AnimatedContainer direction="right" delay={0.1}>
              <div className="rounded-3xl p-7 h-full border border-[#E5E7EB]"
                style={{ background: 'linear-gradient(135deg, #1E293B, #334155)', boxShadow: '0 4px 20px -4px rgba(0,0,0,0.15)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(249,115,22,0.2)' }}>
                    <LucideIcons.Heart className="w-5 h-5 text-[#F97316]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>Anonymous Confessions</h3>
                    <p className="text-xs text-slate-400">Share without revealing identity</p>
                  </div>
                </div>
                <div className="space-y-3 mb-5">
                  {[
                    { text: "I went to the wrong department on my first day 😅", reactions: 87 },
                    { text: "The library WiFi is faster than my home connection 😂", reactions: 134 },
                  ].map((c, i) => (
                    <div key={i} className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <p className="text-xs text-slate-300 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>{c.text}</p>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <LucideIcons.Heart className="w-3 h-3 text-[#F97316]" />
                        <span>{c.reactions}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 p-3 rounded-xl mb-4" style={{ backgroundColor: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)' }}>
                  <LucideIcons.Shield className="w-4 h-4 text-[#F97316] shrink-0" />
                  <span className="text-xs text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                    100% Anonymous. No tracking. No identity revealed.
                  </span>
                </div>
                <Link to="/community">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                    style={{ fontFamily: 'Poppins, sans-serif', background: 'linear-gradient(135deg, #F97316, #FB923C)' }}
                  >
                    Confess Anonymously
                  </motion.button>
                </Link>
              </div>
            </AnimatedContainer>
          </div>
        </div>
      </section>
    </div>
  );
}
