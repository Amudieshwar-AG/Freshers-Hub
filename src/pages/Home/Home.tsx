import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Sparkles, BookOpen, Bot, GraduationCap,
  CheckCircle, Zap, Shield, Brain, Trophy, Award, Cpu, Users
} from 'lucide-react';
import SectionTitle from '@/components/SectionTitle/SectionTitle';
import FeatureCard from '@/components/FeatureCard/FeatureCard';
import FloatingCard from '@/components/FloatingCard/FloatingCard';
import ChatPreview from '@/components/ChatPreview/ChatPreview';
import { StaggerContainer, StaggerItem } from '@/components/AnimatedContainer/AnimatedContainer';
import AnimatedContainer from '@/components/AnimatedContainer/AnimatedContainer';
import { FEATURES, CAMPUS_LOCATIONS } from '@/constants';
import * as LucideIcons from 'lucide-react';

export default function Home() {
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 450], [1, 0]);
  const heroY = useTransform(scrollY, [0, 450], [0, -80]);

  return (
    <div className="relative">
      {/* Sticky Background Video */}
      <div className="fixed inset-0 w-full h-full z-0 pointer-events-none">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="w-full h-full object-cover"
          style={{ 
            filter: 'contrast(1.12) brightness(0.88) saturate(1.08)',
            transform: 'translate3d(0, 0, 0)',
            willChange: 'transform'
          }}
        >
          <source src="/video/RIT Video.mp4" type="video/mp4" />
        </video>
        {/* Dark Overlay (40-50%) */}
        <div 
          className="absolute inset-0" 
          style={{ background: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.4), rgba(15, 23, 42, 0.65))' }}
        />
      </div>

      {/* ─── Hero Section ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden min-h-screen flex flex-col justify-center pt-24 pb-32 z-10 bg-transparent">
        {/* Center Content */}
        <motion.div 
          className="container-custom relative z-20 flex flex-col items-center justify-center text-center px-4"
          style={{ opacity: heroOpacity, y: heroY }}
        >
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
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-white text-3xl md:text-4xl font-light mb-2"
            style={{ fontFamily: 'Playfair Display, serif', color: '#FFFFFF', textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)' }}
          >
            Welcome to
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 bg-gradient-to-r from-[#F97316] via-[#FB923C] to-[#F97316] bg-clip-text text-transparent"
            style={{ fontFamily: 'Playfair Display, serif', color: 'transparent', WebkitTextFillColor: 'transparent', filter: 'drop-shadow(0 4px 12px rgba(249, 115, 22, 0.45))' }}
          >
            RIT Freshers Hub
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="max-w-2xl text-slate-200 text-sm md:text-base leading-relaxed mb-8"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            The RIT Freshers Hub is your centralized gateway to campus life, academic resources, AI assistance, clubs, events, bus routes, notes, and student services.
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-4 mb-8"
          >
            <a href="#built-for-freshers">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 8px 25px rgba(249,115,22,0.4)' }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-white font-semibold text-sm cursor-pointer"
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  background: 'linear-gradient(135deg, #F97316, #FB923C)',
                }}
              >
                <BookOpen className="w-4 h-4" />
                Explore Hub
                <ArrowRight className="w-3.5 h-3.5" />
              </motion.button>
            </a>

            <Link to="/ai-assistant">
              <motion.button
                whileHover={{ scale: 1.05, borderColor: '#F97316', backgroundColor: 'rgba(255,255,255,0.15)' }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm border-2 border-white/20 text-white bg-white/10 backdrop-blur-md transition-all cursor-pointer"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                <Bot className="w-4 h-4" />
                Ask AI Assistant
              </motion.button>
            </Link>
          </motion.div>

          {/* Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-wrap justify-center gap-6 text-slate-300 border-t border-white/10 pt-6 max-w-lg w-full"
          >
            {[
              { icon: CheckCircle, text: 'Official Portal' },
              { icon: Zap, text: 'Instant AI Support' },
              { icon: Shield, text: 'Student Verified' },
            ].map((badge, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                <badge.icon className="w-4 h-4 text-[#F97316]" />
                <span>{badge.text}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Floating Glassmorphic Stats Section */}
      <section className="relative z-30 -mt-16 px-4">
        <div className="container-custom max-w-5xl">
          <style>{`
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-8px); }
            }
            .animate-float {
              animation: float 6s ease-in-out infinite;
            }
          `}</style>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="animate-float rounded-[24px] border border-white/10 p-6 md:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)]"
            style={{
              background: 'linear-gradient(135deg, rgba(11, 19, 43, 0.9) 0%, rgba(15, 23, 42, 0.8) 100%)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 text-center">
              {[
                { value: '20+', label: 'SPORTS', icon: Trophy },
                { value: '100+', label: 'FACULTY', icon: GraduationCap },
                { value: '18', label: 'CLUBS', icon: Award },
                { value: '24/7', label: 'AI ASSISTANT', icon: Cpu },
                { value: '5000+', label: 'STUDENTS', icon: Users },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center justify-center p-4">
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl bg-[#F97316]/10 flex items-center justify-center mb-3">
                    <stat.icon className="w-5 h-5 text-[#F97316]" />
                  </div>
                  {/* Value */}
                  <div 
                    className="text-2xl md:text-3xl font-extrabold text-white mb-1"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    {stat.value}
                  </div>
                  {/* Label */}
                  <div 
                    className="text-[10px] md:text-xs font-semibold tracking-wider text-slate-300 uppercase whitespace-nowrap"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Features Section ─────────────────────────────────────────────────── */}
      <section id="built-for-freshers" className="section-padding relative z-20" style={{ backgroundColor: '#FAFAFA' }}>
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
      <section className="section-padding bg-white relative z-20">
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
                  const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>>)[item.icon];
                  return (
                    <div key={i} className="flex items-start gap-3 p-4 rounded-xl border border-[#E5E7EB] bg-[#FAFAFA]">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#FFF7ED] shrink-0">
                        {Icon && <Icon className="w-4.5 h-4.5" style={{ color: '#F97316' }} />}
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
      <section className="section-padding relative z-20" style={{ backgroundColor: '#FAFAFA' }}>
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
              <div className="p-5 grid grid-cols-3 sm:grid-cols-7 gap-3">
                {CAMPUS_LOCATIONS.map((loc) => {
                  const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[loc.icon];
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
      <section className="section-padding bg-white relative z-20">
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
