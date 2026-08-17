import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight, BookOpen, Bot, GraduationCap,
  CheckCircle, Zap, Shield, Trophy, Award, Cpu, Users, Sparkles
} from 'lucide-react';
import SectionTitle from '@/components/SectionTitle/SectionTitle';
import FeatureCard from '@/components/FeatureCard/FeatureCard';
import { StaggerContainer, StaggerItem } from '@/components/AnimatedContainer/AnimatedContainer';
import { FEATURES } from '@/constants';

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
          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-5xl font-medium tracking-wide mb-2"
            style={{ color: '#FFFFFF', fontFamily: 'Plus Jakarta Sans, sans-serif', textShadow: '0 2px 14px rgba(0,0,0,0.95)' }}
          >
            Welcome to
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-6"
            style={{ color: '#FFFFFF', fontFamily: 'Plus Jakarta Sans, sans-serif', textShadow: '0 4px 24px rgba(0,0,0,0.95)' }}
          >
            RIT Freshers Hub
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="max-w-2xl text-slate-100 text-base md:text-lg font-medium leading-relaxed mb-8 drop-shadow-md"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Your centralized gateway to campus life at Rajalakshmi Institute of Technology — academic notes, AI assistant, bus routes, faculty directory, and campus navigation.
          </motion.p>

          {/* Call to Actions */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <a href="#built-for-freshers">
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: '0 10px 30px -5px rgba(255,107,0,0.4)' }}
                whileTap={{ scale: 0.96 }}
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-white font-bold text-sm cursor-pointer shadow-md"
                style={{
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  background: 'linear-gradient(135deg, #FF6B00, #F97316)',
                }}
              >
                <BookOpen className="w-4 h-4" />
                Explore Hub
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </a>

            <Link to="/ai-assistant">
              <motion.button
                whileHover={{ scale: 1.04, borderColor: '#FF6B00', backgroundColor: 'rgba(255,255,255,0.2)' }}
                whileTap={{ scale: 0.96 }}
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm border-2 border-white/40 text-white bg-black/30 backdrop-blur-md transition-all cursor-pointer shadow-2xs"
                style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              >
                <Bot className="w-4 h-4 text-[#FF6B00]" />
                Ask Assistant
              </motion.button>
            </Link>
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
            className="rounded-2xl border border-[#E9E5EE] p-6 md:p-8 bg-white shadow-[0_4px_20px_-4px_rgba(19,9,36,0.05)]"
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 text-center">
              {[
                { value: '20+', label: 'SPORTS', icon: Trophy },
                { value: '100+', label: 'FACULTY', icon: GraduationCap },
                { value: '33+', label: 'CLUBS & CENTERS', icon: Award },
                { value: '24/7', label: 'ASSISTANT', icon: Cpu },
                { value: '5000+', label: 'STUDENTS', icon: Users },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center justify-center p-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] flex items-center justify-center mb-2.5">
                    <stat.icon className="w-5 h-5 text-[#FF6B00]" />
                  </div>
                  <div 
                    className="text-2xl md:text-3xl font-extrabold text-[#1A0B2E] mb-0.5"
                    style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                  >
                    {stat.value}
                  </div>
                  <div 
                    className="text-[11px] font-bold tracking-wider text-[#9E91B6] uppercase"
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
    </div>
  );
}
