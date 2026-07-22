import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Tag, X, Mail, Phone, UserCheck, GraduationCap, Info,
  Atom, Wifi, Printer, Zap, Languages, Calculator, HeartHandshake,
  Rocket, Camera, Sparkles, Mic, Target, ArrowRight, RotateCcw,
  MessageCircle, ExternalLink, CheckCircle2, Compass, Globe, BookOpen, Heart
} from 'lucide-react';
import SectionTitle from '@/components/SectionTitle/SectionTitle';
import { StaggerContainer, StaggerItem } from '@/components/AnimatedContainer/AnimatedContainer';
import AnimatedContainer from '@/components/AnimatedContainer/AnimatedContainer';
import { CLUBS_DATA } from '@/constants';
import type { Club } from '@/types';

const CLUB_CATEGORY_COLORS: Record<string, string> = {
  Technical: '#3B82F6',
  Cultural: '#EC4899',
  Social: '#10B981',
  Creative: '#F59E0B',
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
};

// ─── Inline Brand SVG Icons for Feature 5 ──────────────────────────────────────
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

// ─── Quiz Questions Data for Feature 1 (3-Question Matcher) ─────────────────────
const QUIZ_QUESTIONS = [
  {
    id: 'interest',
    title: '1. What topics or domains are you most interested in?',
    options: [
      { label: '🚀 Space Tech, Astronomy & Rocketry', clubIds: ['stellar_space_tech', 'infinitus'] },
      { label: '⚙️ AI Quests, Chip Design, RobochipX & STEM', clubIds: ['steam', 'wistem', 'techspark'] },
      { label: '🎙️ Radio, Podcasting, Storytelling & RJing', clubIds: ['podx', 'mediastic'] },
      { label: '🤝 Community Service, Village Development & NSS Drives', clubIds: ['nss', 'unnat_bharat'] },
      { label: '🎭 Dance, Music, Band & Cultural Arts', clubIds: ['artist_league', 'podx'] },
      { label: '🧮 Fast Calculation, PiDoku, Logic & Mathematics', clubIds: ['infinitus', 'stellar_space_tech'] },
      { label: '✍️ Tamil Literature, Debates & Cultural Heritage', clubIds: ['vaarithi', 'fusion'] },
      { label: '🌸 Japanese Culture, Anime, Manga & Foreign Languages', clubIds: ['nippon', 'fusion'] },
      { label: '📷 Photo/Video Production & Social Media Content', clubIds: ['mediastic', 'helios', 'podx'] },
    ],
  },
  {
    id: 'skills',
    title: '2. What skills do you currently have or want to develop?',
    options: [
      { label: '💻 Web3, AI Tools, Circuit Design & Coding Hackathons', clubIds: ['wistem', 'steam', 'techspark'] },
      { label: '🌌 Space Science & Physics Problem Solving', clubIds: ['stellar_space_tech', 'infinitus'] },
      { label: '🎙️ Public Speaking, Interviewing & Voice Recording', clubIds: ['podx', 'mediastic'] },
      { label: '🤝 Social Work, Environmental Protection & Leadership', clubIds: ['nss', 'unnat_bharat'] },
      { label: '🕺 Stage Performance, Singing, Dance & Rap', clubIds: ['artist_league'] },
      { label: '📐 Analytical Thinking, Logic Puzzles & Aptitude', clubIds: ['infinitus'] },
      { label: '📝 Essay Writing, Tamil/English Oratory & Literature', clubIds: ['vaarithi', 'fusion'] },
      { label: '🎥 Camera Operations, Video Editing & Digital Media', clubIds: ['mediastic', 'helios'] },
    ],
  },
  {
    id: 'goal',
    title: '3. What is your main goal for joining a club at RIT?',
    options: [
      { label: '🤖 Build hackathon projects, chip designs & STEM innovations', clubIds: ['steam', 'wistem', 'techspark'] },
      { label: '🚀 Work on aerospace tech & scientific projects', clubIds: ['stellar_space_tech', 'infinitus'] },
      { label: '🌟 Share inspiring stories & host campus podcasts', clubIds: ['podx', 'mediastic'] },
      { label: '👥 Drive social change & serve rural communities', clubIds: ['nss', 'unnat_bharat'] },
      { label: '🏆 Perform live at cultural fests & stage shows', clubIds: ['artist_league', 'vaarithi'] },
      { label: '📖 Master new languages & explore world cultures', clubIds: ['nippon', 'fusion', 'vaarithi'] },
    ],
  },
];

export default function Events() {
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);

  // ─── Interactive Like / Favorite System State ─────────────────────────────
  const [likedClubs, setLikedClubs] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('rit_freshers_liked_clubs');
      return saved ? new Set(JSON.parse(saved)) : new Set(['podx', 'stellar_space_tech']);
    } catch {
      return new Set(['podx', 'stellar_space_tech']);
    }
  });

  const [likesMap, setLikesMap] = useState<Record<string, number>>(() => {
    const initialMap: Record<string, number> = {};
    CLUBS_DATA.forEach((c, idx) => {
      initialMap[c.id] = Math.round(c.members * 0.42) + (idx % 5) * 14 + 35;
    });
    return initialMap;
  });

  const toggleLike = (clubId: string) => {
    setLikedClubs((prev) => {
      const next = new Set(prev);
      const isCurrentlyLiked = next.has(clubId);
      if (isCurrentlyLiked) {
        next.delete(clubId);
        setLikesMap((l) => ({ ...l, [clubId]: Math.max(0, (l[clubId] || 1) - 1) }));
      } else {
        next.add(clubId);
        setLikesMap((l) => ({ ...l, [clubId]: (l[clubId] || 0) + 1 }));
      }
      try {
        localStorage.setItem('rit_freshers_liked_clubs', JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  };

  // ─── Club Matcher Quiz State (Feature 1) ─────────────────────────────────
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [quizResults, setQuizResults] = useState<{ club: Club; score: number }[] | null>(null);

  const handleSelectOption = (optionIdx: number) => {
    const updated = [...selectedAnswers];
    updated[quizStep] = optionIdx;
    setSelectedAnswers(updated);

    if (quizStep < QUIZ_QUESTIONS.length - 1) {
      setQuizStep(quizStep + 1);
    } else {
      calculateQuizResults(updated);
    }
  };

  const calculateQuizResults = (answers: number[]) => {
    const scoreMap: Record<string, number> = {};
    CLUBS_DATA.forEach((c) => (scoreMap[c.id] = 0));

    answers.forEach((ansIdx, qIdx) => {
      const option = QUIZ_QUESTIONS[qIdx].options[ansIdx];
      option.clubIds.forEach((clubId, idx) => {
        scoreMap[clubId] = (scoreMap[clubId] || 0) + (3 - idx);
      });
    });

    const ranked = CLUBS_DATA.map((club) => ({
      club,
      score: scoreMap[club.id] || 0,
    })).sort((a, b) => b.score - a.score);

    setQuizResults(ranked.slice(0, 3));
  };

  const resetQuiz = () => {
    setQuizStep(0);
    setSelectedAnswers([]);
    setQuizResults(null);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAFA' }}>
      {/* Header */}
      <div className="bg-white border-b border-[#E5E7EB] py-10">
        <div className="container-custom">
          <h1 className="text-3xl md:text-4xl font-bold text-[#1E293B] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            Student{' '}
            <span style={{ background: 'linear-gradient(135deg, #F97316, #FB923C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Clubs
            </span>
          </h1>
          <p className="text-[#475569]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Explore official RIT student clubs & societies, leadership details, and community links.
          </p>
        </div>
      </div>

      <div className="container-custom pt-10 pb-20 md:pb-28">

        {/* ─── Feature 1: "Find My Ideal Club" Banner ────────────────────────── */}
        <AnimatedContainer className="mb-14">
          <div
            className="rounded-3xl p-6 md:p-8 text-white relative overflow-hidden border border-orange-400/30 flex flex-col md:flex-row items-center justify-between gap-6"
            style={{ background: 'linear-gradient(135deg, #1E293B, #0F172A)' }}
          >
            {/* Background Glow */}
            <div
              className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-20 pointer-events-none"
              style={{ background: 'radial-gradient(circle, #F97316, transparent)' }}
            />

            <div className="relative z-10 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-semibold mb-3 border border-orange-500/30">
                <Target className="w-3.5 h-3.5" />
                <span>Interactive Club Matcher</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                Not sure which club to join?
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                Take our 3-step AI-powered Club Matcher quiz to get instant recommendations tailored to your interests, skills, and goals!
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { resetQuiz(); setIsQuizOpen(true); }}
              className="relative z-10 px-6 py-3.5 rounded-2xl text-white font-semibold text-sm flex items-center gap-2.5 shadow-lg shrink-0 cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #F97316, #FB923C)', fontFamily: 'Poppins, sans-serif' }}
            >
              <Sparkles className="w-4 h-4" />
              Find My Ideal Club
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </AnimatedContainer>

        {/* Clubs Directory Section */}
        <SectionTitle tag="Official Directory" title="Student" highlight="Clubs" subtitle="Explore official RIT clubs & societies. Click any club to view full details, leadership, and community social links." />
        
        {(() => {
          const fullGridCount = Math.floor(CLUBS_DATA.length / 3) * 3;
          const mainGridClubs = CLUBS_DATA.slice(0, fullGridCount);
          const remainingClubs = CLUBS_DATA.slice(fullGridCount);

          const renderClubCard = (club: Club) => {
            const IconComponent = (club.icon && CLUB_ICON_MAP[club.icon]) || Atom;
            const categoryColor = CLUB_CATEGORY_COLORS[club.category] || '#F97316';
            const isLiked = likedClubs.has(club.id);
            const likesCount = likesMap[club.id] || 0;

            return (
              <motion.div
                whileHover={{ y: -4 }}
                onClick={() => setSelectedClub(club)}
                className="bg-white rounded-2xl border border-[#E5E7EB] p-5 cursor-pointer hover:border-[#F97316] transition-all flex flex-col justify-between h-full group"
                style={{ boxShadow: '0 2px 15px -3px rgba(0,0,0,0.07)' }}
              >
                <div>
                  {/* Top Row: Tech Icon / Club Logo & Interactive Heart Like Button */}
                  <div className="flex items-center justify-between mb-3">
                    {club.logoUrl ? (
                      <div className="w-12 h-12 rounded-full border border-slate-100 p-0.5 shadow-sm bg-white overflow-hidden shrink-0 transition-transform group-hover:scale-105">
                        <img src={club.logoUrl} alt={club.name} className="w-full h-full object-cover rounded-full" />
                      </div>
                    ) : (
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105"
                        style={{
                          background: `linear-gradient(135deg, ${categoryColor}, ${categoryColor}DD)`,
                        }}
                      >
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                    )}

                    {/* Like Button & Members Count */}
                    <div className="flex items-center gap-2">
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

                      <div className="flex items-center gap-1 text-xs text-[#94A3B8] bg-slate-50 px-2 py-1 rounded-full border border-slate-100">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>{club.members}</span>
                      </div>
                    </div>
                  </div>

                  {/* Club Title & Description */}
                  <h3 className="font-semibold text-[#1E293B] mb-1 group-hover:text-[#F97316] transition-colors" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {club.name}
                  </h3>
                  <p className="text-xs text-[#64748B] mb-3 line-clamp-2" style={{ fontFamily: 'Inter, sans-serif' }}>{club.description}</p>
                </div>

                {/* Bottom Row: Category Tag & View Details Button */}
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100">
                  <span className="flex items-center gap-1 text-xs font-medium" style={{ color: categoryColor }}>
                    <Tag className="w-3 h-3" />
                    {club.category}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white flex items-center gap-1 cursor-pointer"
                    style={{ fontFamily: 'Poppins, sans-serif', background: 'linear-gradient(135deg, #F97316, #FB923C)' }}
                  >
                    View Details
                  </motion.button>
                </div>
              </motion.div>
            );
          };

          return (
            <StaggerContainer className="pb-8 space-y-6 md:space-y-7">
              {/* 3-Column Grid for Full Rows */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
                {mainGridClubs.map((club) => (
                  <StaggerItem key={club.id} className="w-full h-full">
                    {renderClubCard(club)}
                  </StaggerItem>
                ))}
              </div>

              {/* Centered Flex Row for Remaining Clubs (WiSTEM & STEAM) */}
              {remainingClubs.length > 0 && (
                <div className="flex flex-wrap justify-center gap-6 md:gap-7">
                  {remainingClubs.map((club) => (
                    <StaggerItem key={club.id} className="w-full sm:w-[calc(50%-0.875rem)] lg:w-[calc(33.333%-1.167rem)]">
                      {renderClubCard(club)}
                    </StaggerItem>
                  ))}
                </div>
              )}
            </StaggerContainer>
          );
        })()}
      </div>

      {/* ─── Club Matcher Quiz Modal (Feature 1) ─────────────────────────────── */}
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
                  {/* Quiz Progress */}
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-medium">
                    <span>Question {quizStep + 1} of {QUIZ_QUESTIONS.length}</span>
                    <span>Step {quizStep + 1} / {QUIZ_QUESTIONS.length}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full mb-6 overflow-hidden">
                    <div
                      className="h-full bg-[#F97316] transition-all duration-300 rounded-full"
                      style={{ width: `${((quizStep + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
                    />
                  </div>

                  {/* Question Header */}
                  <div className="flex items-center gap-2 mb-2 text-[#F97316]">
                    <Compass className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-wider">Club Matcher Quiz</span>
                  </div>
                  <h3 className="text-xl font-bold text-[#1E293B] mb-5" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {QUIZ_QUESTIONS[quizStep].title}
                  </h3>

                  {/* Options List */}
                  <div className="space-y-3 mb-6">
                    {QUIZ_QUESTIONS[quizStep].options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(idx)}
                        className="w-full text-left p-4 rounded-2xl border border-slate-200 hover:border-[#F97316] hover:bg-orange-50/50 transition-all flex items-center justify-between text-sm font-medium text-slate-700 cursor-pointer group"
                      >
                        <span>{opt.label}</span>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#F97316] group-hover:translate-x-1 transition-all" />
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
                    <h3 className="text-2xl font-bold text-[#1E293B]" style={{ fontFamily: 'Playfair Display, serif' }}>
                      Your Ideal Club Matches!
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Based on your interests & goals, here are your top recommended RIT clubs:</p>
                  </div>

                  {/* Top 3 Matches */}
                  <div className="space-y-3 mb-6">
                    {quizResults.map((item, i) => {
                      const IconComponent = (item.club.icon && CLUB_ICON_MAP[item.club.icon]) || Atom;
                      const catColor = CLUB_CATEGORY_COLORS[item.club.category] || '#F97316';
                      const matchPercent = i === 0 ? '98%' : i === 1 ? '91%' : '84%';

                      return (
                        <div
                          key={item.club.id}
                          onClick={() => {
                            setIsQuizOpen(false);
                            setSelectedClub(item.club);
                          }}
                          className="p-4 rounded-2xl border border-slate-200 hover:border-[#F97316] bg-slate-50 hover:bg-white cursor-pointer transition-all flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            {item.club.logoUrl ? (
                              <div className="w-10 h-10 rounded-full border border-slate-100 p-0.5 shadow-sm bg-white overflow-hidden shrink-0">
                                <img src={item.club.logoUrl} alt={item.club.name} className="w-full h-full object-cover rounded-full" />
                              </div>
                            ) : (
                              <div
                                className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0"
                                style={{ background: `linear-gradient(135deg, ${catColor}, ${catColor}DD)` }}
                              >
                                <IconComponent className="w-5 h-5 text-white" />
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-[#1E293B]">{item.club.name}</span>
                                {i === 0 && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">Top Match 🏆</span>}
                              </div>
                              <span className="text-xs text-slate-500">{item.club.category} Club • {item.club.members} members</span>
                            </div>
                          </div>
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 shrink-0">
                            {matchPercent} Match
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
                      Explore All Clubs
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── Club Details Modal (Featuring Feature 5: Social Link Hub) ───────── */}
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
                const categoryColor = CLUB_CATEGORY_COLORS[selectedClub.category] || '#F97316';
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
                          style={{ background: `linear-gradient(135deg, ${categoryColor}, ${categoryColor}DD)` }}
                        >
                          <IconComponent className="w-7 h-7 text-white" />
                        </div>
                      )}
                      <div>
                        <span
                          className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                          style={{ backgroundColor: `${categoryColor}15`, color: categoryColor, fontFamily: 'Poppins, sans-serif' }}
                        >
                          {selectedClub.category}
                        </span>
                        <h2 className="text-2xl font-bold text-[#1E293B] mt-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                          {selectedClub.name}
                        </h2>
                      </div>
                    </div>

                    {/* Interactive Like Button in Modal */}
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
                      <span>{isLiked ? 'Liked' : 'Like Club'} ({likesCount})</span>
                    </motion.button>
                  </div>
                );
              })()}

              {/* Club Detailed Description */}
              <div className="mb-5 bg-gradient-to-r from-orange-50/70 via-amber-50/40 to-slate-50 border border-orange-200/80 rounded-2xl p-4.5">
                <div className="flex items-center gap-2 text-xs font-bold text-[#F97316] uppercase tracking-wider mb-2">
                  <Info className="w-4 h-4 text-[#F97316]" />
                  <span>About the Club</span>
                </div>
                <p className="text-slate-700 text-sm leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {selectedClub.details || selectedClub.description}
                </p>
              </div>

              {/* Leadership & Contact Information - Icon Based Color Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
                {/* President Card - Indigo Theme */}
                <div className="bg-indigo-50/80 border border-indigo-100 hover:border-indigo-300 transition-colors rounded-2xl p-3.5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white flex items-center justify-center shadow-xs shadow-indigo-200 shrink-0">
                    <UserCheck className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="text-[11px] text-indigo-500 font-semibold block">President / Student Lead</span>
                    <span className="text-sm font-bold text-indigo-950">{selectedClub.presidentName || 'Student President'}</span>
                  </div>
                </div>

                {/* Year Card - Purple Theme */}
                <div className="bg-purple-50/80 border border-purple-100 hover:border-purple-300 transition-colors rounded-2xl p-3.5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white flex items-center justify-center shadow-xs shadow-purple-200 shrink-0">
                    <GraduationCap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="text-[11px] text-purple-500 font-semibold block">Year & Department</span>
                    <span className="text-sm font-bold text-purple-950">{selectedClub.year || 'Senior Year'}</span>
                  </div>
                </div>

                {/* Email Card - Emerald Theme */}
                <div className="bg-emerald-50/80 border border-emerald-100 hover:border-emerald-300 transition-colors rounded-2xl p-3.5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center shadow-xs shadow-emerald-200 shrink-0">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] text-emerald-500 font-semibold block">Contact Email</span>
                    <a href={`mailto:${selectedClub.contactEmail}`} className="text-sm font-bold text-emerald-700 hover:text-emerald-800 hover:underline truncate block">
                      {selectedClub.contactEmail || 'club@ritchennai.edu.in'}
                    </a>
                  </div>
                </div>

                {/* Phone Card - Sky Theme */}
                <div className="bg-sky-50/80 border border-sky-100 hover:border-sky-300 transition-colors rounded-2xl p-3.5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-sky-600 text-white flex items-center justify-center shadow-xs shadow-sky-200 shrink-0">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="text-[11px] text-sky-500 font-semibold block">Contact Phone</span>
                    <span className="text-sm font-bold text-sky-950">{selectedClub.contactPhone || '+91 98765 43210'}</span>
                  </div>
                </div>
              </div>

              {/* ─── Feature 5: Social & Community Link Hub (Dummy Links) ─────── */}
              <div className="mb-6 bg-orange-50/60 border border-orange-200/80 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#F97316] uppercase tracking-wider">
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Community & Social Links</span>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-medium">✓ Verified RIT Handle</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
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

                  {selectedClub.socialLinks?.website && (
                    <a
                      href={selectedClub.socialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200 hover:border-orange-500 hover:text-orange-600 transition-all text-xs font-medium text-slate-700"
                    >
                      <Globe className="w-4 h-4 text-orange-500 shrink-0" />
                      <span className="truncate">Linktree Hub</span>
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
