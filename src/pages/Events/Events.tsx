import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Tag, X, Mail, Phone, UserCheck, GraduationCap, Info,
  Atom, Wifi, Printer, Zap, Languages, Calculator, HeartHandshake,
  Rocket, Camera, Sparkles, Mic, Target, ArrowRight, RotateCcw,
  MessageCircle, ExternalLink, CheckCircle2, Compass, Globe, BookOpen, Heart,
  Building2, Search, Cpu, Smartphone, Bot, SlidersHorizontal, Layers, Activity, Brain
} from 'lucide-react';
import SectionTitle from '@/components/SectionTitle/SectionTitle';
import { StaggerContainer, StaggerItem } from '@/components/AnimatedContainer/AnimatedContainer';
import AnimatedContainer from '@/components/AnimatedContainer/AnimatedContainer';
import { CLUBS_DATA } from '@/constants';
import type { Club } from '@/types';
import { useAuth } from '@/context/AuthContext';
import {
  getClubUserIdentifier,
  fetchClubLikes,
  fetchUserLikedClubs,
  toggleClubLikeInDb,
} from '@/services/clubService';

const CLUB_CATEGORY_COLORS: Record<string, string> = {
  Technical: '#3B82F6',
  Cultural: '#EC4899',
  Social: '#10B981',
  Creative: '#F59E0B',
  'Center of Excellence': '#8B5CF6',
};

const CLUB_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Atom,
  Wifi,
  Printer,
  Zap,
  Languages,
  Calculator,
  HeartHandshake,
  Rocket,
  Camera,
  Sparkles,
  Mic,
  BookOpen,
  Globe,
  Users,
  Cpu,
  Smartphone,
  Bot,
  Brain,
  Activity,
};

// ─── Inline Brand SVG Icons ──────────────────────────────────────────────────────
const InstagramIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const LinkedinIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const YoutubeIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <polygon points="10 15 15 12 10 9 10 15" fill="currentColor" />
  </svg>
);

// ─── Quiz Questions Data (Supporting Clubs, Centers, and Hybrid Matching) ───────
const QUIZ_QUESTIONS_ALL = [
  {
    id: 'domain',
    title: '1. What technology or activity domain excites you the most?',
    options: [
      { label: '🤖 AI, Machine Learning, Neural Networks & Data Science', clubIds: ['center_ai', 'center_data_science', 'wistem'] },
      { label: '⚡ Semiconductor VLSI, Microchip Architecture & Hardware', clubIds: ['center_semiconductor', 'steam'] },
      { label: '📱 Apple iOS, SwiftUI & Mobile Ecosystem', clubIds: ['center_apple_tech', 'techspark'] },
      { label: '🕶️ AR/VR, Metaverse, Spatial Computing & 3D Interactive Media', clubIds: ['center_ar_vr', 'mediastic'] },
      { label: '🔒 Cybersecurity, Ethical Hacking & Cryptography', clubIds: ['center_cybersecurity', 'techspark'] },
      { label: '🏥 Healthcare AI, RADAR Medical Diagnostics & Patient Care', clubIds: ['center_radar_healthcare', 'yrc'] },
      { label: '📡 IoT, Smart Automation & Embedded Sensors', clubIds: ['center_iot', 'steam'] },
      { label: '🚗 Electric Vehicles, Battery Systems & Autonomous Tech', clubIds: ['center_ev_energy', 'center_zf_transportation'] },
      { label: '☁️ Cloud Architecture, DevOps & Distributed Systems', clubIds: ['center_cloud_computing', 'techspark'] },
      { label: '🚀 Aerospace, Satellite Tech & Space Robotics', clubIds: ['center_space', 'steam'] },
      { label: '⚛️ Quantum Computing, Quantum Search & Grover Algorithms', clubIds: ['grover_center_quantum', 'infinitus'] },
      { label: '🎙️ Radio, Podcasting, Live Media & Content Creation', clubIds: ['podx', 'mediastic', 'helios'] },
      { label: '🤝 Community Service, Village Adoption & NSS Drives', clubIds: ['nss', 'unnat_bharat', 'rotaract'] },
      { label: '🎭 Cultural Arts, Dance, Music, Band & Drama', clubIds: ['artist_league', 'vaarithi', 'fusion'] },
    ],
  },
  {
    id: 'skill',
    title: '2. What practical skill do you want to master at RIT?',
    options: [
      { label: '📊 Predictive Analytics, Python ML Pipelines & Data Modeling', clubIds: ['center_data_science', 'center_ai', 'center_zf_transportation'] },
      { label: '💻 Microchip IC Layout, Verilog/VHDL & FPGA Prototyping', clubIds: ['center_semiconductor', 'steam'] },
      { label: '🍎 Native iOS SwiftUI Coding & macOS Enterprise Apps', clubIds: ['center_apple_tech', 'techspark'] },
      { label: '🥽 Unity 3D, Spatial Audio & Metaverse Experience Design', clubIds: ['center_ar_vr', 'mediastic'] },
      { label: '🛡️ Network Security Audit, Cyber Threat Defense & Ethical Hacking', clubIds: ['center_cybersecurity'] },
      { label: '🩺 Medical Signal Processing & AI Diagnosis Tools', clubIds: ['center_radar_healthcare', 'center_image_processing'] },
      { label: '🔌 Smart Sensors, ESP32/Arduino, Edge Computing & CAN Bus', clubIds: ['center_iot', 'center_ev_energy'] },
      { label: '🎙️ Voice Recording, Public Speaking & Event Management', clubIds: ['podx', 'yuva', 'artist_league'] },
      { label: '🌱 Sustainable Rural Development & Eco-System Restoration', clubIds: ['unnat_bharat', 'nss', 'rotaract'] },
    ],
  },
  {
    id: 'goal',
    title: '3. What is your primary career aspiration during college?',
    options: [
      { label: '🔬 Lead innovative research in a specialized Future Tech Center (CoE)', clubIds: ['center_ai', 'center_semiconductor', 'grover_center_quantum', 'center_apple_tech', 'center_space'] },
      { label: '🏆 Win technical hackathons & build product prototypes', clubIds: ['steam', 'wistem', 'techspark', 'center_data_science'] },
      { label: '🌟 Build a strong personal brand, public speaking & media portfolio', clubIds: ['podx', 'mediastic', 'helios'] },
      { label: '🤝 Drive impactful social initiatives & community leadership', clubIds: ['nss', 'rotaract', 'yuva', 'wec'] },
      { label: '💼 Connect with industry leaders, CII, and top startup networks', clubIds: ['yuva', 'wec', 'center_cloud_computing'] },
    ],
  },
];

export default function Events() {
  const { user } = useAuth();
  const userIdentifier = useMemo(() => getClubUserIdentifier(user?.email), [user?.email]);

  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<'All' | 'Club' | 'Center'>('All');

  // Compute counts dynamically
  const { totalCount, centersCount, clubsCount } = useMemo(() => {
    let centers = 0;
    let clubs = 0;
    CLUBS_DATA.forEach((item) => {
      const isCenter =
        item.type === 'Center' ||
        item.category === 'Center of Excellence' ||
        item.id.startsWith('center_') ||
        item.id.includes('grover_center');
      if (isCenter) centers++;
      else clubs++;
    });
    return { totalCount: CLUBS_DATA.length, centersCount: centers, clubsCount: clubs };
  }, []);

  // ─── Database-Backed Interactive Like System ─────────────────────────────
  const [likedClubs, setLikedClubs] = useState<Set<string>>(() => {
    try {
      localStorage.removeItem('rit_freshers_liked_clubs');
      const saved = localStorage.getItem('rit_freshers_liked_clubs_v3');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const [likesMap, setLikesMap] = useState<Record<string, number>>(() => {
    const initialMap: Record<string, number> = {};
    CLUBS_DATA.forEach((c) => {
      initialMap[c.id] = 0;
    });
    return initialMap;
  });

  // Sync likes with database backend on mount and when user identity changes
  useEffect(() => {
    let isMounted = true;

    async function syncWithDatabase() {
      // Fetch total like counts for all clubs from database
      const dbLikesMap = await fetchClubLikes();
      if (isMounted && Object.keys(dbLikesMap).length > 0) {
        setLikesMap((prev) => {
          const merged = { ...prev };
          Object.entries(dbLikesMap).forEach(([id, count]) => {
            merged[id] = count;
          });
          return merged;
        });
      }

      // Fetch user's liked clubs from database
      const userLikedList = await fetchUserLikedClubs(userIdentifier);
      if (isMounted && userLikedList.length > 0) {
        setLikedClubs(new Set(userLikedList));
        try {
          localStorage.setItem('rit_freshers_liked_clubs_v3', JSON.stringify(userLikedList));
        } catch {}
      }
    }

    syncWithDatabase();

    return () => {
      isMounted = false;
    };
  }, [userIdentifier]);

  const toggleLike = async (clubId: string) => {
    const isCurrentlyLiked = likedClubs.has(clubId);
    const next = new Set(likedClubs);

    // Optimistic UI update
    if (isCurrentlyLiked) {
      next.delete(clubId);
      setLikesMap((l) => ({ ...l, [clubId]: Math.max(0, (l[clubId] || 1) - 1) }));
    } else {
      next.add(clubId);
      setLikesMap((l) => ({ ...l, [clubId]: (l[clubId] || 0) + 1 }));
    }

    setLikedClubs(next);
    try {
      localStorage.setItem('rit_freshers_liked_clubs_v3', JSON.stringify(Array.from(next)));
    } catch {}

    // Persist like directly in PostgreSQL database backend
    const dbResult = await toggleClubLikeInDb(clubId, userIdentifier);
    if (dbResult) {
      setLikesMap((l) => ({ ...l, [clubId]: dbResult.count }));
      if (dbResult.liked) {
        setLikedClubs((prev) => new Set([...prev, clubId]));
      } else {
        setLikedClubs((prev) => {
          const updated = new Set(prev);
          updated.delete(clubId);
          return updated;
        });
      }
    }
  };


  // ─── Quiz Matcher State ──────────────────────────────────────────────────
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [matcherTarget, setMatcherTarget] = useState<'All' | 'Club' | 'Center'>('All');
  const [quizStep, setQuizStep] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [quizResults, setQuizResults] = useState<{ club: Club; score: number }[] | null>(null);

  const handleSelectOption = (optionIdx: number) => {
    const updated = [...selectedAnswers];
    updated[quizStep] = optionIdx;
    setSelectedAnswers(updated);

    if (quizStep < QUIZ_QUESTIONS_ALL.length - 1) {
      setQuizStep(quizStep + 1);
    } else {
      calculateQuizResults(updated);
    }
  };

  const calculateQuizResults = (answers: number[]) => {
    const scoreMap: Record<string, number> = {};
    CLUBS_DATA.forEach((c) => (scoreMap[c.id] = 0));

    answers.forEach((ansIdx, qIdx) => {
      const option = QUIZ_QUESTIONS_ALL[qIdx].options[ansIdx];
      if (option && option.clubIds) {
        option.clubIds.forEach((clubId, idx) => {
          scoreMap[clubId] = (scoreMap[clubId] || 0) + (5 - idx);
        });
      }
    });

    const pool = CLUBS_DATA.filter((c) => {
      const isCenter =
        c.type === 'Center' ||
        c.category === 'Center of Excellence' ||
        c.id.startsWith('center_') ||
        c.id.includes('grover_center');
      if (matcherTarget === 'Club') return !isCenter;
      if (matcherTarget === 'Center') return isCenter;
      return true;
    });

    const ranked = pool
      .map((club) => ({
        club,
        score: scoreMap[club.id] || 0,
      }))
      .sort((a, b) => b.score - a.score);

    setQuizResults(ranked.slice(0, 3));
  };

  const resetQuiz = () => {
    setQuizStep(0);
    setSelectedAnswers([]);
    setQuizResults(null);
  };

  // ─── Filter Selection Handlers ───────────────────────────────────────────
  const handleTypeSelect = (type: 'All' | 'Club' | 'Center') => {
    setSelectedType(type);
    setSelectedCategory('All');
  };

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    if (cat === 'Center of Excellence') {
      setSelectedType('Center');
    } else if (cat !== 'All') {
      setSelectedType('Club');
    } else {
      setSelectedType('All');
    }
  };

  // ─── Robust Filter Logic ──────────────────────────────────────────────────
  const filteredData = useMemo(() => {
    return CLUBS_DATA.filter((item) => {
      const isCenter =
        item.type === 'Center' ||
        item.category === 'Center of Excellence' ||
        item.id.startsWith('center_') ||
        item.id.includes('grover_center');

      // 1. Type Filter check
      if (selectedType === 'Club' && isCenter) return false;
      if (selectedType === 'Center' && !isCenter) return false;

      // 2. Category Filter check
      if (selectedCategory !== 'All') {
        if (selectedCategory === 'Center of Excellence' && !isCenter) return false;
        if (selectedCategory !== 'Center of Excellence' && item.category.toLowerCase() !== selectedCategory.toLowerCase()) return false;
      }

      // 3. Search Query check
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchesSearch =
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          (item.details && item.details.toLowerCase().includes(q)) ||
          (item.presidentName && item.presidentName.toLowerCase().includes(q)) ||
          (item.coordinatorName && item.coordinatorName.toLowerCase().includes(q));
        if (!matchesSearch) return false;
      }

      return true;
    });
  }, [searchQuery, selectedCategory, selectedType]);

  const categoriesList = ['All', 'Center of Excellence', 'Technical', 'Social', 'Creative'];

  return (
    <div className="min-h-screen bg-[#FAF9FC]">
      {/* Header */}
      <div className="bg-white border-b border-[#E9E5EE] py-10">
        <div className="container-custom">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-[#F97316] text-xs font-bold uppercase tracking-wider mb-3">
            <Building2 className="w-3.5 h-3.5" />
            <span>RIT Official Directory</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#1E293B] mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Student Clubs &{' '}
            <span style={{ background: 'linear-gradient(135deg, #F97316, #FB923C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Centers of Excellence
            </span>
          </h1>
          <p className="text-[#475569] max-w-3xl text-sm md:text-base" style={{ fontFamily: 'Inter, sans-serif' }}>
            Explore official RIT student clubs, societies, and 15 Future Tech Centers of Excellence (CoEs), including faculty coordinators, research domains, and contact channels.
          </p>
        </div>
      </div>

      <div className="container-custom pt-8 pb-20 md:pb-28">

        {/* ─── Interactive Matcher Banner ─────────────────────────────────── */}
        <AnimatedContainer className="mb-10">
          <div
            className="rounded-2xl p-6 md:p-8 text-white relative overflow-hidden border border-[#3A1968] flex flex-col md:flex-row items-center justify-between gap-6"
            style={{ background: 'linear-gradient(135deg, #130924, #1E0C36)' }}
          >
            {/* Background Glow */}
            <div
              className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-20 pointer-events-none"
              style={{ background: 'radial-gradient(circle, #FF6B00, transparent)' }}
            />

            <div className="relative z-10 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-semibold mb-3 border border-orange-500/30">
                <Target className="w-3.5 h-3.5" />
                <span>AI-Powered Matcher Quiz</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Find Your Ideal Club or Future Tech Center!
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                Take our 3-step Matcher quiz to discover which of the 18 Student Clubs or 15 Future Tech Centers best match your skills, technology interests, and career goals!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 relative z-10 w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => { setMatcherTarget('Center'); resetQuiz(); setIsQuizOpen(true); }}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer border border-purple-400/40"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                <Cpu className="w-4 h-4" />
                Match Centers (CoEs)
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => { setMatcherTarget('All'); resetQuiz(); setIsQuizOpen(true); }}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #F97316, #FB923C)', fontFamily: 'Poppins, sans-serif' }}
              >
                <Sparkles className="w-4 h-4" />
                Match All Directory
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </AnimatedContainer>

        {/* ─── Search & Category Filters Bar ───────────────────────────────── */}
        <div className="mb-10 space-y-5">
          <SectionTitle tag="Official Directory" title="Clubs &" highlight="Centers" subtitle="Browse or search 18 official RIT clubs and 15 Future Tech Centers of Excellence. Click any card for faculty lead and details." />

          {/* Search & Type Toggle Controls */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search name, faculty lead, domain..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#F97316] transition-colors"
                style={{ fontFamily: 'Inter, sans-serif' }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Type Pills Toggle (All / Clubs / Centers) */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
              {[
                { label: `All (${totalCount})`, value: 'All' },
                { label: `Clubs (${clubsCount})`, value: 'Club' },
                { label: `Centers of Excellence (${centersCount})`, value: 'Center' },
              ].map((t) => (
                <button
                  key={t.value}
                  onClick={() => handleTypeSelect(t.value as any)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedType === t.value
                      ? 'bg-white text-[#1E293B] shadow-2xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 shrink-0 pr-1">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Filter:
            </span>
            {categoriesList.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategorySelect(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                  selectedCategory === cat
                    ? 'bg-[#1E293B] text-white border-[#1E293B] shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ─── Directory Grid ──────────────────────────────────────────────── */}
        {filteredData.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center my-8">
            <Layers className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-700">No matching items found</h3>
            <p className="text-xs text-slate-400 mt-1 mb-4">Try adjusting your search terms or filter selections.</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setSelectedType('All'); }}
              className="px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold hover:bg-orange-600 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <StaggerContainer key={`${selectedType}-${selectedCategory}-${searchQuery}`} className="pb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
              {filteredData.map((club) => {
                const IconComponent = (club.icon && CLUB_ICON_MAP[club.icon]) || Atom;
                const isCenter =
                  club.type === 'Center' ||
                  club.category === 'Center of Excellence' ||
                  club.id.startsWith('center_') ||
                  club.id.includes('grover_center');
                const categoryColor = CLUB_CATEGORY_COLORS[club.category] || (isCenter ? '#8B5CF6' : '#F97316');
                const isLiked = likedClubs.has(club.id);
                const likesCount = likesMap[club.id] || 0;

                return (
                  <StaggerItem key={club.id} className="w-full h-full">
                    <motion.div
                      whileHover={{ y: -4 }}
                      onClick={() => setSelectedClub(club)}
                      className="bg-white rounded-2xl border border-[#E5E7EB] p-5 cursor-pointer hover:border-[#F97316] transition-all flex flex-col justify-between h-full group relative overflow-hidden"
                      style={{ boxShadow: '0 2px 15px -3px rgba(0,0,0,0.07)' }}
                    >
                      <div>
                        {/* Top Row: Icon/Logo + Badge + Heart Like Button */}
                        <div className="flex items-center justify-between mb-3">
                          {club.logoUrl ? (
                            <div className="w-12 h-12 rounded-full border border-slate-100 p-0.5 shadow-sm bg-white overflow-hidden shrink-0 transition-transform group-hover:scale-105">
                              <img src={club.logoUrl} alt={club.name} className="w-full h-full object-cover rounded-full" />
                            </div>
                          ) : (
                            <div
                              className="w-11 h-11 rounded-full flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105"
                              style={{
                                background: isCenter
                                  ? 'linear-gradient(135deg, #8B5CF6, #6366F1)'
                                  : `linear-gradient(135deg, ${categoryColor}, ${categoryColor}DD)`,
                              }}
                            >
                              <IconComponent className="w-5 h-5 text-white" />
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            {/* Type Badge */}
                            {isCenter ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200">
                                CENTER OF EXCELLENCE
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
                                CLUB
                              </span>
                            )}

                            {/* Like Button */}
                            <motion.button
                              whileHover={{ scale: 1.08 }}
                              whileTap={{ scale: 0.85 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleLike(club.id);
                              }}
                              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                                isLiked
                                  ? 'bg-rose-50 border-rose-200 text-rose-600 shadow-2xs'
                                  : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-rose-300 hover:text-rose-500'
                              }`}
                            >
                              <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                              <span>{likesCount}</span>
                            </motion.button>
                          </div>
                        </div>

                        {/* Title & Description */}
                        <h3 className="font-semibold text-[#1E293B] mb-1 group-hover:text-[#F97316] transition-colors line-clamp-2 text-sm md:text-base" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {club.name}
                        </h3>
                        <p className="text-xs text-[#64748B] mb-3 line-clamp-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {club.description}
                        </p>
                      </div>

                      {/* Bottom Row: Category/Coordinator Tag & View Details Button */}
                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
                        <span className="flex items-center gap-1 text-xs font-medium truncate max-w-[60%]" style={{ color: categoryColor }}>
                          {isCenter ? <GraduationCap className="w-3.5 h-3.5 shrink-0 text-purple-600" /> : <Tag className="w-3 h-3 shrink-0" />}
                          <span className="truncate">{isCenter && club.coordinatorName ? club.coordinatorName : club.category}</span>
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.04 }}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white flex items-center gap-1 cursor-pointer shrink-0"
                          style={{ fontFamily: 'Poppins, sans-serif', background: isCenter ? 'linear-gradient(135deg, #8B5CF6, #6366F1)' : 'linear-gradient(135deg, #F97316, #FB923C)' }}
                        >
                          View Details
                        </motion.button>
                      </div>
                    </motion.div>
                  </StaggerItem>
                );
              })}
            </div>
          </StaggerContainer>
        )}
      </div>

      {/* ─── Matcher Quiz Modal ────────────────────────────────────────────── */}
      <AnimatePresence>
        {isQuizOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-[#E5E7EB] max-w-xl w-full p-6 md:p-8 relative shadow-2xl overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsQuizOpen(false)}
                className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {!quizResults ? (
                <div>
                  {/* Quiz Target Selector Header */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-2 text-[#F97316]">
                      <Compass className="w-5 h-5" />
                      <span className="text-xs font-bold uppercase tracking-wider">
                        {matcherTarget === 'Center' ? 'Future Tech Center Matcher' : matcherTarget === 'Club' ? 'Student Club Matcher' : 'Interactive Directory Matcher'}
                      </span>
                    </div>
                  </div>

                  {/* Quiz Progress */}
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-medium">
                    <span>Question {quizStep + 1} of {QUIZ_QUESTIONS_ALL.length}</span>
                    <span>Step {quizStep + 1} / {QUIZ_QUESTIONS_ALL.length}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full mb-6 overflow-hidden">
                    <div
                      className="h-full bg-[#F97316] transition-all duration-300 rounded-full"
                      style={{ width: `${((quizStep + 1) / QUIZ_QUESTIONS_ALL.length) * 100}%` }}
                    />
                  </div>

                  {/* Question Header */}
                  <h3 className="text-xl font-extrabold text-[#1E293B] mb-5" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    {QUIZ_QUESTIONS_ALL[quizStep].title}
                  </h3>

                  {/* Options List */}
                  <div className="space-y-2.5 mb-6 max-h-[50vh] overflow-y-auto pr-1">
                    {QUIZ_QUESTIONS_ALL[quizStep].options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(idx)}
                        className="w-full text-left p-3.5 rounded-2xl border border-slate-200 hover:border-[#F97316] hover:bg-orange-50/50 transition-all flex items-center justify-between text-xs sm:text-sm font-medium text-slate-700 cursor-pointer group"
                      >
                        <span>{opt.label}</span>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#F97316] group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                      </button>
                    ))}
                  </div>

                  {quizStep > 0 && (
                    <button
                      onClick={() => setQuizStep(quizStep - 1)}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                    >
                      ← Previous Question
                    </button>
                  )}
                </div>
              ) : (
                /* Results Screen */
                <div>
                  <div className="text-center mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-orange-100 text-[#F97316] flex items-center justify-center mx-auto mb-3">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-extrabold text-[#1E293B]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                      Your Recommended Matches!
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Based on your selections, here are your top recommended RIT entities:</p>
                  </div>

                  {/* Top 3 Matches */}
                  <div className="space-y-3 mb-6">
                    {quizResults.map((item, i) => {
                      const IconComponent = (item.club.icon && CLUB_ICON_MAP[item.club.icon]) || Atom;
                      const isCenter =
                        item.club.type === 'Center' ||
                        item.club.category === 'Center of Excellence' ||
                        item.club.id.startsWith('center_') ||
                        item.club.id.includes('grover_center');
                      const catColor = CLUB_CATEGORY_COLORS[item.club.category] || (isCenter ? '#8B5CF6' : '#F97316');
                      const matchPercent = i === 0 ? '98%' : i === 1 ? '92%' : '85%';

                      return (
                        <div
                          key={item.club.id}
                          onClick={() => {
                            setIsQuizOpen(false);
                            setSelectedClub(item.club);
                          }}
                          className="p-4 rounded-2xl border border-slate-200 hover:border-[#F97316] bg-slate-50 hover:bg-white cursor-pointer transition-all flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {item.club.logoUrl ? (
                              <div className="w-10 h-10 rounded-full border border-slate-100 p-0.5 shadow-sm bg-white overflow-hidden shrink-0">
                                <img src={item.club.logoUrl} alt={item.club.name} className="w-full h-full object-cover rounded-full" />
                              </div>
                            ) : (
                              <div
                                className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0"
                                style={{ background: isCenter ? 'linear-gradient(135deg, #8B5CF6, #6366F1)' : `linear-gradient(135deg, ${catColor}, ${catColor}DD)` }}
                              >
                                <IconComponent className="w-5 h-5 text-white" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs sm:text-sm text-[#1E293B] truncate">{item.club.name}</span>
                                {i === 0 && <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-700 shrink-0">Top Match 🏆</span>}
                              </div>
                              <span className="text-[11px] text-slate-500 truncate block">
                                {isCenter ? (item.club.coordinatorName ? `CoE Lead: ${item.club.coordinatorName}` : 'Center of Excellence') : `${item.club.category} Club`}
                              </span>
                            </div>
                          </div>
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 shrink-0">
                            {matchPercent}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={resetQuiz}
                      className="flex-1 py-3 rounded-xl border border-slate-300 text-slate-600 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-50 transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Retake Quiz
                    </button>
                    <button
                      onClick={() => setIsQuizOpen(false)}
                      className="flex-1 py-3 rounded-xl text-white font-semibold text-xs bg-[#F97316] hover:bg-[#EA580C] transition-all cursor-pointer"
                    >
                      Explore Directory
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── Detailed View Modal ───────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedClub && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-[#E5E7EB] max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 relative"
              style={{ boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedClub(null)}
                className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              {(() => {
                const IconComponent = (selectedClub.icon && CLUB_ICON_MAP[selectedClub.icon]) || Atom;
                const isCenter =
                  selectedClub.type === 'Center' ||
                  selectedClub.category === 'Center of Excellence' ||
                  selectedClub.id.startsWith('center_') ||
                  selectedClub.id.includes('grover_center');
                const categoryColor = CLUB_CATEGORY_COLORS[selectedClub.category] || (isCenter ? '#8B5CF6' : '#F97316');
                const isLiked = likedClubs.has(selectedClub.id);
                const likesCount = likesMap[selectedClub.id] || 0;

                return (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                      {selectedClub.logoUrl ? (
                        <div className="w-16 h-16 rounded-full border-2 border-slate-100 p-1 shadow-md bg-white overflow-hidden shrink-0">
                          <img src={selectedClub.logoUrl} alt={selectedClub.name} className="w-full h-full object-cover rounded-full" />
                        </div>
                      ) : (
                        <div
                          className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-sm shrink-0"
                          style={{ background: isCenter ? 'linear-gradient(135deg, #8B5CF6, #6366F1)' : `linear-gradient(135deg, ${categoryColor}, ${categoryColor}DD)` }}
                        >
                          <IconComponent className="w-7 h-7 text-white" />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                            style={{ backgroundColor: `${categoryColor}15`, color: categoryColor, fontFamily: 'Poppins, sans-serif' }}
                          >
                            {selectedClub.category}
                          </span>
                          {isCenter && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200">
                              CENTER OF EXCELLENCE
                            </span>
                          )}
                        </div>
                        <h2 className="text-2xl font-extrabold text-[#1E293B]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                          {selectedClub.name}
                        </h2>
                      </div>
                    </div>

                    {/* Interactive Like Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => toggleLike(selectedClub.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs border shrink-0 ${
                        isLiked
                          ? 'bg-rose-500 text-white border-rose-600 shadow-rose-200'
                          : 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-white' : 'text-rose-500'}`} />
                      <span>{isLiked ? 'Liked' : 'Like'} ({likesCount})</span>
                    </motion.button>
                  </div>
                );
              })()}

              {/* Detailed Description */}
              <div className="mb-5 bg-gradient-to-r from-orange-50/70 via-amber-50/40 to-slate-50 border border-orange-200/80 rounded-2xl p-4.5">
                <div className="flex items-center gap-2 text-xs font-bold text-[#F97316] uppercase tracking-wider mb-2">
                  <Info className="w-4 h-4 text-[#F97316]" />
                  <span>About {selectedClub.type === 'Center' || selectedClub.category === 'Center of Excellence' ? 'the Center of Excellence' : 'the Club'}</span>
                </div>
                <p className="text-slate-700 text-sm leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {selectedClub.details || selectedClub.description}
                </p>
              </div>

              {/* Leadership & Contact Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
                {/* Faculty Coordinator Card */}
                {selectedClub.coordinatorName && (
                  <div className="bg-amber-50/80 border border-amber-100 hover:border-amber-300 transition-colors rounded-2xl p-3.5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-xs shadow-amber-200 shrink-0">
                      <GraduationCap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <span className="text-[11px] text-amber-600 font-semibold block">
                        {selectedClub.type === 'Center' || selectedClub.category === 'Center of Excellence' ? 'Faculty Co-ordinator' : 'Faculty Coordinator'}
                      </span>
                      <span className="text-sm font-bold text-amber-950">{selectedClub.coordinatorName}</span>
                    </div>
                  </div>
                )}

                {/* President / Student Lead Card */}
                {selectedClub.presidentName && (
                  <div className="bg-indigo-50/80 border border-indigo-100 hover:border-indigo-300 transition-colors rounded-2xl p-3.5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white flex items-center justify-center shadow-xs shadow-indigo-200 shrink-0">
                      <UserCheck className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <span className="text-[11px] text-indigo-500 font-semibold block">
                        {selectedClub.type === 'Center' || selectedClub.category === 'Center of Excellence' ? 'Research / Student Lead' : 'President / Student Lead'}
                      </span>
                      <span className="text-sm font-bold text-indigo-950">{selectedClub.presidentName}</span>
                    </div>
                  </div>
                )}

                {/* Vice President Card */}
                {selectedClub.vicePresidentName && (
                  <div className="bg-violet-50/80 border border-violet-100 hover:border-violet-300 transition-colors rounded-2xl p-3.5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 text-white flex items-center justify-center shadow-xs shadow-violet-200 shrink-0">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <span className="text-[11px] text-violet-500 font-semibold block">Vice President</span>
                      <span className="text-sm font-bold text-violet-950">{selectedClub.vicePresidentName}</span>
                    </div>
                  </div>
                )}

                {/* Contact Email */}
                {selectedClub.contactEmail && (
                  <div className="bg-emerald-50/80 border border-emerald-100 hover:border-emerald-300 transition-colors rounded-2xl p-3.5 flex items-center gap-3 col-span-1 sm:col-span-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center shadow-xs shadow-emerald-200 shrink-0">
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] text-emerald-500 font-semibold block">Contact Email</span>
                      <a href={`mailto:${selectedClub.contactEmail}`} className="text-sm font-bold text-emerald-700 hover:text-emerald-800 hover:underline truncate block">
                        {selectedClub.contactEmail}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Social & Community Links */}
              {Boolean(
                selectedClub.socialLinks?.instagram ||
                selectedClub.socialLinks?.linkedin ||
                selectedClub.socialLinks?.whatsapp ||
                selectedClub.socialLinks?.youtube ||
                selectedClub.socialLinks?.website
              ) && (
                <div className="mb-6 bg-orange-50/60 border border-orange-200/80 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#F97316] uppercase tracking-wider">
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Social & Community Links</span>
                    </div>
                    <span className="text-[10px] text-emerald-600 font-medium">✓ Verified RIT Entity</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {selectedClub.socialLinks?.website && (
                      <Link
                        to={selectedClub.socialLinks.website}
                        onClick={() => setSelectedClub(null)}
                        className="flex items-center gap-2 p-2.5 rounded-xl bg-gradient-to-r from-[#EC4899] via-[#F43F5E] to-[#E11D48] text-white hover:from-pink-600 hover:to-rose-600 transition-all text-xs font-bold shadow-xs col-span-2 justify-center"
                      >
                        <Rocket className="w-4 h-4 text-white shrink-0 animate-pulse" />
                        <span>Launch RAISE Incubator Portal →</span>
                      </Link>
                    )}

                  {selectedClub.socialLinks?.instagram && (
                    <a
                      href={selectedClub.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200 hover:border-pink-500 hover:text-pink-600 transition-all text-xs font-medium text-slate-700"
                    >
                      <InstagramIcon className="w-4 h-4 text-pink-500 shrink-0" />
                      <span className="truncate">Instagram</span>
                    </a>
                  )}

                  {selectedClub.socialLinks?.linkedin && (
                    <a
                      href={selectedClub.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200 hover:border-blue-600 hover:text-blue-600 transition-all text-xs font-medium text-slate-700"
                    >
                      <LinkedinIcon className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="truncate">LinkedIn</span>
                    </a>
                  )}

                  {selectedClub.socialLinks?.whatsapp && (
                    <a
                      href={selectedClub.socialLinks.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 hover:text-emerald-600 transition-all text-xs font-medium text-slate-700"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="truncate">WhatsApp Group</span>
                    </a>
                  )}

                  {selectedClub.socialLinks?.youtube && (
                    <a
                      href={selectedClub.socialLinks.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200 hover:border-red-600 hover:text-red-600 transition-all text-xs font-medium text-slate-700"
                    >
                      <YoutubeIcon className="w-4 h-4 text-red-600 shrink-0" />
                      <span className="truncate">YouTube Channel</span>
                    </a>
                  )}
                </div>
              </div>
              )}

              {/* Close Button */}
              <div>
                <button
                  onClick={() => setSelectedClub(null)}
                  className="w-full py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-100 transition-all cursor-pointer"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
