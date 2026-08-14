import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  GraduationCap, MapPin, Phone, Mail, ArrowRight, Sparkles,
  BookOpen, Bot, Map, Bus, UserCheck, Users, MessageCircle, Wrench, Code2, Trophy
} from 'lucide-react';

const exploreLinks = [
  { label: 'Notes & PYQs', path: '/notes', icon: BookOpen },
  { label: 'Student Toolkit', path: '/toolkit', icon: Wrench },
  { label: 'RIT Chatbot', path: '/ai-assistant', icon: Bot },
  { label: 'Faculty Directory', path: '/faculty', icon: UserCheck },
  { label: 'LeetCode Arena', path: '/leetcode', icon: Trophy },
];

const campusLinks = [
  { label: 'Campus Map', path: '/campus', icon: Map },
  { label: 'Bus Routes', path: '/bus-routes', icon: Bus },
  { label: 'Student Clubs', path: '/events', icon: Users },
  { label: 'Freshers Q&A', path: '/community', icon: MessageCircle },
  { label: 'Dev Collab Hub', path: '/collab', icon: Code2 },
];

export default function Footer() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="w-full relative z-20">
      {/* ─── 1. CTA Banner (Floating Overlay Box - Only on Home Page) ────────── */}
      {isHome && (
        <div className="container-custom relative z-20 -mb-20 lg:-mb-24 px-4">
          <motion.div
            whileHover={{ y: -3 }}
            transition={{ duration: 0.3 }}
            className="relative overflow-hidden rounded-3xl p-8 lg:p-12 shadow-2xl border border-orange-400/30"
            style={{
              background: 'linear-gradient(135deg, #EA580C 0%, #F97316 50%, #FB923C 100%)',
            }}
          >
            {/* Ambient Background Lighting */}
            <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-black/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider mb-3 border border-white/20">
                  <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                  <span>RIT Student Portal</span>
                </div>
                <h3
                  className="text-2xl lg:text-3xl xl:text-4xl font-extrabold text-white tracking-tight"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  Ready to explore RIT?
                </h3>
                <p
                  className="text-orange-100 text-sm lg:text-base mt-2 max-w-xl font-medium"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Everything a fresher needs — semester notes, campus map, chatbot, bus routes, and developer tools all in one place.
                </p>
              </div>

              <Link to="/ai-assistant" className="shrink-0">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 20px 30px -10px rgba(0,0,0,0.3)' }}
                  whileTap={{ scale: 0.96 }}
                  className="flex items-center gap-2.5 bg-white text-[#EA580C] px-7 py-3.5 rounded-2xl font-bold text-sm lg:text-base shadow-xl transition-all cursor-pointer group"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  <span>Ask Chatbot</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      )}

      {/* ─── 2. Main Footer Section (Deep Royal Dark Purple) ──────────── */}
      <footer className={`bg-[#130924] text-slate-300 relative z-10 pb-24 lg:pb-28 ${isHome ? 'pt-32 lg:pt-36' : 'pt-28 lg:pt-36'}`}>
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-12 xl:gap-14 items-start">
            {/* Column 1: Brand Info (xl:col-span-4) */}
            <div className="xl:col-span-4 flex flex-col gap-5">
              <Link to="/" className="flex items-center gap-3.5 group w-fit">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/25 group-hover:scale-105 transition-transform shrink-0">
                  <GraduationCap className="w-6.5 h-6.5 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-white text-xl tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    RIT Freshers Hub
                  </span>
                  <span className="text-xs font-semibold text-purple-300/80 uppercase tracking-wider mt-0.5">
                    Rajalakshmi Institute of Technology
                  </span>
                </div>
              </Link>

              <p className="text-slate-300/80 text-sm lg:text-base leading-relaxed max-w-md" style={{ fontFamily: 'Inter, sans-serif' }}>
                Your official student companion for RIT campus life. Access study resources, competitive coding ranks, project collaboration, and campus navigation.
              </p>

              <div className="flex items-center gap-2.5 mt-2 flex-wrap">
                <span className="px-3.5 py-1.5 rounded-xl bg-[#1E0C36] border border-[#3A1968] text-xs font-semibold text-orange-400">
                  Official Student Portal
                </span>
                <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-xs font-semibold text-emerald-400">
                  Active 24/7
                </span>
              </div>
            </div>

            {/* Column 2: Academics & Tools (xl:col-span-2) */}
            <div className="xl:col-span-2">
              <h4
                className="!text-white font-extrabold text-xs lg:text-sm uppercase tracking-widest mb-6 lg:mb-7 flex items-center gap-2.5"
                style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-xs shadow-orange-500/50" />
                Academics
              </h4>
              <ul className="space-y-4 lg:space-y-4.5">
                {exploreLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <li key={link.path}>
                      <Link
                        to={link.path}
                        className="text-slate-300/80 hover:text-orange-400 text-sm lg:text-base font-medium transition-colors inline-flex items-center gap-3 group py-1"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        <Icon className="w-4.5 h-4.5 text-purple-400/60 group-hover:text-orange-400 transition-colors shrink-0" />
                        <span>{link.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Column 3: Campus Life (xl:col-span-3) */}
            <div className="xl:col-span-3">
              <h4
                className="!text-white font-extrabold text-xs lg:text-sm uppercase tracking-widest mb-6 lg:mb-7 flex items-center gap-2.5"
                style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-xs shadow-orange-500/50" />
                Campus Life
              </h4>
              <ul className="space-y-4 lg:space-y-4.5">
                {campusLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <li key={link.path}>
                      <Link
                        to={link.path}
                        className="text-slate-300/80 hover:text-orange-400 text-sm lg:text-base font-medium transition-colors inline-flex items-center gap-3 group py-1"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        <Icon className="w-4.5 h-4.5 text-purple-400/60 group-hover:text-orange-400 transition-colors shrink-0" />
                        <span>{link.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Column 4: Reach Us (xl:col-span-3) */}
            <div className="xl:col-span-3">
              <h4
                className="!text-white font-extrabold text-xs lg:text-sm uppercase tracking-widest mb-6 lg:mb-7 flex items-center gap-2.5"
                style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-xs shadow-orange-500/50" />
                Reach Us
              </h4>
              <ul className="space-y-5 lg:space-y-6">
                <li className="flex items-start gap-4 text-slate-300 text-sm lg:text-base leading-relaxed">
                  <div className="w-9 h-9 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-4.5 h-4.5 text-orange-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-white">Rajalakshmi Institute of Technology</span>
                    <span className="text-slate-400 text-xs lg:text-sm mt-1">Kuthambakkam, Chennai - 600 124</span>
                  </div>
                </li>

                <li className="flex items-center gap-4 text-slate-300 text-sm lg:text-base">
                  <div className="w-9 h-9 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center shrink-0">
                    <Phone className="w-4.5 h-4.5 text-orange-400" />
                  </div>
                  <a href="tel:+914423422890" className="hover:text-orange-400 transition-colors font-medium">
                    +91 44 2342 2890
                  </a>
                </li>

                <li className="flex items-center gap-4 text-slate-300 text-sm lg:text-base">
                  <div className="w-9 h-9 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center shrink-0">
                    <Mail className="w-4.5 h-4.5 text-orange-400" />
                  </div>
                  <a href="mailto:info@rit.ac.in" className="hover:text-orange-400 transition-colors font-medium">
                    info@rit.ac.in
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="border-t border-[#2A104E] bg-[#090314] py-9 lg:py-10 px-4 mt-20">
          <div className="container-custom flex flex-col sm:flex-row items-center justify-between gap-5">
            <p className="text-purple-300/70 text-sm lg:text-base font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
              © {new Date().getFullYear()} RIT Freshers Hub. Built for Rajalakshmi Institute of Technology Students.
            </p>

            <div className="flex items-center gap-6 text-sm lg:text-base font-medium text-purple-300/70">
              <a href="#" className="hover:text-orange-400 transition-colors">
                Privacy Policy
              </a>
              <span className="text-purple-900">·</span>
              <a href="#" className="hover:text-orange-400 transition-colors">
                Terms of Use
              </a>
              <span className="text-purple-900">·</span>
              <a href="#" className="hover:text-orange-400 transition-colors">
                Accessibility
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

