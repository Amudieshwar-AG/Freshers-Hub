import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight, BookOpen, Bot, GraduationCap,
  CheckCircle, Zap, Shield, Trophy, Award, Cpu, Users, MapPin, Sparkles
} from 'lucide-react';
import SectionTitle from '@/components/SectionTitle/SectionTitle';
import FeatureCard from '@/components/FeatureCard/FeatureCard';
import { StaggerContainer, StaggerItem } from '@/components/AnimatedContainer/AnimatedContainer';
import AnimatedContainer from '@/components/AnimatedContainer/AnimatedContainer';
import { FEATURES, CAMPUS_LOCATIONS } from '@/constants';
import * as LucideIcons from 'lucide-react';

import LazyVideoHero from '@/components/LazyVideoHero/LazyVideoHero';

export default function Home() {
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 450], [1, 0]);
  const heroY = useTransform(scrollY, [0, 450], [0, -60]);

  return (
    <div className="relative bg-[#FAFAFA] min-h-screen overflow-hidden">
      {/* ─── Hero Section with IntersectionObserver Lazy Video ─────────────────── */}
      <LazyVideoHero>
        <section className="relative pt-20 pb-24 z-10">
          <motion.div 
            className="container-custom relative z-20 flex flex-col items-center text-center px-4"
            style={{ opacity: heroOpacity, y: heroY }}
          >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFF7ED] border border-[#FED7AA] text-[#F97316] text-xs font-semibold shadow-2xs"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>OFFICIAL STUDENT PORTAL</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-white text-3xl md:text-4xl font-light mb-1"
            style={{ fontFamily: 'Playfair Display, serif', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}
          >
            Welcome to
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-5xl md:text-7xl font-black leading-tight mb-6 bg-gradient-to-r from-[#F97316] via-[#FB923C] to-[#F97316] bg-clip-text text-transparent"
            style={{ fontFamily: 'Playfair Display, serif', filter: 'drop-shadow(0 4px 12px rgba(249, 115, 22, 0.45))' }}
          >
            RIT Freshers Hub
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="max-w-2xl text-slate-200 text-base md:text-lg leading-relaxed mb-8"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Your centralized gateway to campus life at Rajalakshmi Institute of Technology — academic notes, AI assistant, bus routes, faculty directory, and campus navigation.
          </motion.p>

          {/* Call to Actions */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-4 mb-10"
          >
            <a href="#built-for-freshers">
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: '0 10px 30px -5px rgba(249,115,22,0.4)' }}
                whileTap={{ scale: 0.96 }}
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-white font-semibold text-sm cursor-pointer shadow-md"
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  background: 'linear-gradient(135deg, #F97316, #FB923C)',
                }}
              >
                <BookOpen className="w-4 h-4" />
                Explore Hub
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </a>

            <Link to="/ai-assistant">
              <motion.button
                whileHover={{ scale: 1.04, borderColor: '#F97316', backgroundColor: 'rgba(255,255,255,0.2)' }}
                whileTap={{ scale: 0.96 }}
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm border-2 border-white/30 text-white bg-white/10 backdrop-blur-md transition-all cursor-pointer shadow-2xs"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                <Bot className="w-4 h-4 text-[#F97316]" />
                Ask Assistant
              </motion.button>
            </Link>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-wrap justify-center gap-6 text-slate-300 border-t border-white/20 pt-6 max-w-lg w-full"
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
    </LazyVideoHero>

      {/* Sleek Stats Card Section */}
      <section className="relative z-30 -mt-6 px-4">
        <div className="container-custom max-w-5xl">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="rounded-3xl border border-[#E5E7EB] p-6 md:p-8 bg-white shadow-[0_20px_50px_-15px_rgba(0,0,0,0.06)]"
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 text-center">
              {[
                { value: '20+', label: 'SPORTS', icon: Trophy },
                { value: '100+', label: 'FACULTY', icon: GraduationCap },
                { value: '18', label: 'CLUBS', icon: Award },
                { value: '24/7', label: 'ASSISTANT', icon: Cpu },
                { value: '5000+', label: 'STUDENTS', icon: Users },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center justify-center p-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] flex items-center justify-center mb-2.5">
                    <stat.icon className="w-5 h-5 text-[#F97316]" />
                  </div>
                  <div 
                    className="text-2xl md:text-3xl font-black text-[#1E293B] mb-0.5"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    {stat.value}
                  </div>
                  <div 
                    className="text-[11px] font-bold tracking-wider text-[#94A3B8] uppercase"
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
      <section id="built-for-freshers" className="section-padding relative z-20">
        <div className="container-custom">
          <SectionTitle
            tag="Everything You Need"
            title="Built for"
            highlight="RIT Freshers"
            subtitle="From notes to AI assistance — we've got everything you need to navigate campus life with confidence."
          />

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature) => (
              <StaggerItem key={feature.id}>
                <FeatureCard feature={feature} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ─── Campus Quick Nav ─────────────────────────────────────────────────── */}
      <section className="section-padding relative z-20 bg-white border-y border-[#E5E7EB]">
        <div className="container-custom">
          <SectionTitle
            tag="Navigate Campus"
            title="Explore"
            highlight="RIT Campus"
            subtitle="Find your way around campus — departments, labs, library, and key locations."
          />

          <AnimatedContainer>
            <div className="bg-white rounded-3xl border border-[#E5E7EB] overflow-hidden shadow-sm">
              {/* Map Teaser Header */}
              <div
                className="h-52 flex items-center justify-center relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #1E293B, #0F172A)' }}
              >
                <div
                  className="absolute inset-0 opacity-15"
                  style={{
                    backgroundImage: 'linear-gradient(rgba(249,115,22,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.4) 1px, transparent 1px)',
                    backgroundSize: '28px 28px',
                  }}
                />
                
                <div className="relative z-10 text-center px-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#F97316]/20 border border-[#F97316]/30 flex items-center justify-center mx-auto mb-3">
                    <MapPin className="w-6 h-6 text-[#F97316]" />
                  </div>
                  <h3 className="text-white text-lg font-bold mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Interactive Campus Map
                  </h3>
                  <p className="text-slate-400 text-xs mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Locate all major campus blocks, labs, library & amenities.
                  </p>
                  <Link to="/campus">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-5 py-2 rounded-xl text-white text-xs font-semibold shadow-sm cursor-pointer"
                      style={{ background: 'linear-gradient(135deg, #F97316, #FB923C)', fontFamily: 'Poppins, sans-serif' }}
                    >
                      Open Full Map
                    </motion.button>
                  </Link>
                </div>
              </div>

              {/* Quick Nav Grid */}
              <div className="p-5 grid grid-cols-3 sm:grid-cols-7 gap-3 bg-[#FAFAFA]">
                {CAMPUS_LOCATIONS.map((loc) => {
                  const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[loc.icon];
                  return (
                    <Link to="/campus" key={loc.id}>
                      <motion.div
                        whileHover={{ y: -3, backgroundColor: '#FFF7ED' }}
                        className="flex flex-col items-center gap-2 p-3 rounded-xl cursor-pointer transition-all border border-transparent hover:border-[#FED7AA] bg-white shadow-2xs"
                      >
                        <div className="w-9 h-9 rounded-xl bg-[#FFF7ED] flex items-center justify-center">
                          {Icon && <Icon className="w-4.5 h-4.5 text-[#F97316]" />}
                        </div>
                        <span className="text-[11px] text-[#475569] text-center font-medium leading-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
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
    </div>
  );
}
