import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle, Heart, TrendingUp, ThumbsUp, Send,
  Shield, Lock, Smile, ChevronRight, Search, Plus, User
} from 'lucide-react';
import SectionTitle from '@/components/SectionTitle/SectionTitle';
import { StaggerContainer, StaggerItem } from '@/components/AnimatedContainer/AnimatedContainer';
import AnimatedContainer from '@/components/AnimatedContainer/AnimatedContainer';
import { QUESTIONS_DATA, CONFESSIONS_DATA } from '@/constants';

type Tab = 'qa' | 'confession';

const TRENDING_TAGS = ['hostel', 'academics', 'clubs', 'campus', 'canteen', 'sports', 'placement', 'library'];

const AVATARS: Record<string, string> = {
  'Priya S.': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80',
  'Ravi K.': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80',
  'Arun M.': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80',
};

const getAvatar = (author: string) => {
  return AVATARS[author] || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(author)}`;
};

const getRelativeTime = (dateString: string) => {
  const now = new Date('2026-07-22T11:56:24+05:30').getTime(); // Current local time from metadata
  const past = new Date(dateString).getTime();
  const msPerMinute = 60 * 1000;
  const msPerHour = msPerMinute * 60;
  const msPerDay = msPerHour * 24;
  const elapsed = now - past;

  if (elapsed < msPerMinute) {
    return 'just now';
  } else if (elapsed < msPerHour) {
    return Math.round(elapsed / msPerMinute) + 'm ago';
  } else if (elapsed < msPerDay) {
    return Math.round(elapsed / msPerHour) + 'h ago';
  } else {
    const days = Math.round(elapsed / msPerDay);
    return days === 1 ? 'yesterday' : `${days}d ago`;
  }
};

export default function Community() {
  const [activeTab, setActiveTab] = useState<Tab>('qa');
  const [confessionText, setConfessionText] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [confessionPosted, setConfessionPosted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [questions, setQuestions] = useState<any[]>(QUESTIONS_DATA);

  const fetchQuestions = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/questions');
      if (response.ok) {
        const data = await response.json();
        if (data) {
          // Merge database questions with static mock data, matching IDs to prevent duplicates
          const backendIds = new Set(data.map((q: any) => q.id.toString()));
          const uniqueMocks = QUESTIONS_DATA.filter(q => !backendIds.has(q.id.toString()));
          // Sort backend questions newest first, then append mock questions
          setQuestions([...[...data].reverse(), ...uniqueMocks]);
        }
      }
    } catch (error) {
      console.log('Backend not available. Falling back to local static questions data.', error);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const filteredQuestions = questions.filter((q) =>
    q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (q.tags && q.tags.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const handleConfess = () => {
    if (!confessionText.trim()) return;
    setConfessionPosted(true);
    setConfessionText('');
    setTimeout(() => setConfessionPosted(false), 3000);
  };

  const toggleLike = async (id: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });

    try {
      await fetch(`http://localhost:8080/api/questions/${id}/upvote`, {
        method: 'POST'
      });
      fetchQuestions();
    } catch (error) {
      console.log('Backend not available for upvote sync.', error);
    }
  };

  const handlePostQuestion = async () => {
    if (!questionText.trim()) return;
    
    const displayAuthor = authorName.trim() || 'Anonymous';
    
    const newQuestion = {
      title: questionText.split('\n')[0].substring(0, 100) || "Q&A Question",
      body: questionText,
      author: displayAuthor,
      tags: ['fresher', 'general'],
      upvotes: 0,
      isAnswered: false,
      createdAt: new Date().toISOString(),
      answers: []
    };

    try {
      const response = await fetch('http://localhost:8080/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newQuestion.title,
          body: newQuestion.body,
          author: newQuestion.author,
          tags: newQuestion.tags
        })
      });

      if (response.ok) {
        const saved = await response.json();
        setQuestions(prev => {
          // Prepend saved question and filter out duplicate placeholders
          const filtered = prev.filter(q => q.id.toString() !== saved.id.toString());
          return [saved, ...filtered];
        });
        setQuestionText('');
        setAuthorName('');
      } else {
        setQuestions(prev => [{ ...newQuestion, id: String(Date.now()) }, ...prev]);
        setQuestionText('');
        setAuthorName('');
      }
    } catch (error) {
      console.error("Error saving question:", error);
      setQuestions(prev => [{ ...newQuestion, id: String(Date.now()) }, ...prev]);
      setQuestionText('');
      setAuthorName('');
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFBFD' }}>
      {/* Header */}
      <div className="bg-white border-b border-slate-100 py-12">
        <div className="container-custom">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2 tracking-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
            RIT Community
          </h1>
          <p className="text-slate-500 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
            Ask questions, share confessions, and connect with fellow RIT students.
          </p>
        </div>
      </div>

      <div className="container-custom py-10">
        {/* Tabs */}
        <div className="flex gap-1.5 bg-slate-100 rounded-xl p-1.5 border border-slate-200/40 mb-8 w-fit">
          {[
            { id: 'qa' as Tab, label: 'Freshers Q&A', icon: MessageCircle },
            { id: 'confession' as Tab, label: 'Confessions', icon: Heart },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-all cursor-pointer"
              style={{ fontFamily: 'Poppins, sans-serif', color: activeTab === tab.id ? '#ffffff' : '#64748B' }}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="community-tab"
                  className="absolute inset-0 rounded-lg bg-slate-950"
                  transition={{ type: 'spring', bounce: 0.15, duration: 0.35 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Q&A Tab */}
          {activeTab === 'qa' && (
            <motion.div
              key="qa"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  {/* Ask Question Box */}
                  <div className="bg-white rounded-xl border border-slate-200/80 p-5 mb-8 shadow-xs">
                    <h3 className="text-sm font-semibold text-slate-900 mb-3 tracking-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>Ask a Question</h3>
                    <textarea
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      placeholder="What's on your mind? Ask your seniors anything about RIT..."
                      rows={3}
                      className="w-full border border-slate-200 rounded-xl p-3 text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white bg-slate-50/30 resize-none transition-all mb-3"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    />
                    <input
                      type="text"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder="Your Name (optional)"
                      className="w-full md:w-64 border border-slate-200 rounded-xl px-3 py-2 text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white bg-slate-50/30 transition-all mb-4"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Your question will be visible to all students
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={handlePostQuestion}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-[13px] font-semibold bg-[#F97316] hover:bg-[#EA580C] transition-colors cursor-pointer"
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                      >
                        <Plus className="w-4 h-4" />
                        Post Question
                      </motion.button>
                    </div>
                  </div>

                  {/* Search */}
                  <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search questions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 transition-colors"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    />
                  </div>

                  {/* Questions */}
                  <StaggerContainer className="flex flex-col gap-4">
                    {filteredQuestions.map((q, idx) => {
                      const isFeatured = idx === 0 && searchQuery === '';
                      return (
                        <StaggerItem key={q.id}>
                          <motion.div
                            whileHover={{ y: -1 }}
                            className={`bg-white rounded-xl border p-5 transition-all shadow-xs ${
                              isFeatured
                                ? 'border-l-4 border-l-slate-900 border-slate-200'
                                : 'border-slate-200/80'
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              {/* Avatar */}
                              <img
                                src={getAvatar(q.author)}
                                alt={q.author}
                                className="w-9 h-9 rounded-lg object-cover bg-slate-100 border border-slate-100 shrink-0"
                              />

                              <div className="flex-1 min-w-0">
                                {/* Header / Meta */}
                                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                  <span className="text-xs font-semibold text-slate-800">{q.author}</span>
                                  <span className="text-[10px] text-slate-300">•</span>
                                  <span className="text-[11px] text-slate-400">{getRelativeTime(q.createdAt)}</span>
                                  {isFeatured && (
                                    <span className="ml-auto px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-white tracking-wider uppercase">★ Popular</span>
                                  )}
                                </div>

                                <h3 className={`font-bold text-slate-950 mb-1 hover:text-slate-700 cursor-pointer transition-colors tracking-tight ${
                                  isFeatured ? 'text-base md:text-lg' : 'text-sm md:text-base'
                                }`}
                                  style={{ fontFamily: 'Poppins, sans-serif' }}>
                                  {q.title}
                                </h3>
                                <p className="text-[13px] text-slate-600 mb-4 leading-relaxed line-clamp-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                                  {q.body}
                                </p>

                                <div className="flex items-center justify-between flex-wrap gap-3 pt-1 border-t border-slate-100">
                                  <div className="flex flex-wrap gap-1.5">
                                    {q.tags.map((tag) => (
                                      <span
                                        key={tag}
                                        className="px-2.5 py-0.5 rounded-lg text-[10px] font-medium bg-slate-100 text-slate-600"
                                        style={{ fontFamily: 'Inter, sans-serif' }}
                                      >
                                        #{tag}
                                      </span>
                                    ))}
                                  </div>

                                  <div className="flex items-center gap-4 text-[11px] text-slate-400">
                                    <span className="flex items-center gap-1.5">
                                      <MessageCircle className="w-3.5 h-3.5 text-slate-400" />
                                      {q.answers} answers
                                    </span>
                                    {q.isAnswered && (
                                      <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 font-semibold text-[10px]">✓ Answered</span>
                                    )}

                                    {/* Like/Vote Button inside bottom bar */}
                                    <button
                                      onClick={() => toggleLike(q.id)}
                                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                                        likedIds.has(q.id)
                                          ? 'bg-slate-900 text-white font-semibold'
                                          : 'bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800'
                                      }`}
                                    >
                                      <ThumbsUp className="w-3 h-3" />
                                      <span>{q.votes + (likedIds.has(q.id) ? 1 : 0)}</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        </StaggerItem>
                      );
                    })}
                  </StaggerContainer>
                </div>

                {/* Sidebar */}
                <div className="flex flex-col gap-6">
                  {/* Trending */}
                  <AnimatedContainer direction="right" delay={0.1}>
                    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
                      <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="w-4 h-4 text-slate-600" />
                        <h3 className="text-sm font-semibold text-slate-850 tracking-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>Trending Topics</h3>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {TRENDING_TAGS.map((tag) => (
                          <button
                            key={tag}
                            onClick={() => setSearchQuery(tag)}
                            className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-all border-0 cursor-pointer"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                          >
                            #{tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  </AnimatedContainer>

                  {/* Stats */}
                  <AnimatedContainer direction="right" delay={0.2}>
                    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
                      {[
                        { label: 'Total Questions', value: '124' },
                        { label: 'Answered', value: '98%' },
                        { label: 'Active Students', value: '340+' },
                      ].map((stat, i) => (
                        <div key={i} className={`flex justify-between py-2.5 ${i < 2 ? 'border-b border-slate-100' : ''}`}>
                          <span className="text-xs text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>{stat.label}</span>
                          <span className="text-xs font-bold text-slate-900" style={{ fontFamily: 'Poppins, sans-serif' }}>{stat.value}</span>
                        </div>
                      ))}
                    </div>
                  </AnimatedContainer>
                </div>
              </div>
            </motion.div>
          )}

          {/* Confessions Tab */}
          {activeTab === 'confession' && (
            <motion.div
              key="confession"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  {/* Post confession */}
                  <div
                    className="rounded-xl p-5 mb-6 border"
                    style={{ background: '#0F172A', borderColor: 'rgba(255,255,255,0.05)' }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-slate-800">
                        <Lock className="w-4.5 h-4.5 text-slate-300" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-sm tracking-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>Share Anonymously</h3>
                        <p className="text-slate-400 text-[11px]">Your identity is never revealed</p>
                      </div>
                    </div>

                    <textarea
                      value={confessionText}
                      onChange={(e) => setConfessionText(e.target.value)}
                      placeholder="Share your thoughts, stories, crushes, or anything on your mind... It's completely anonymous 🤫"
                      rows={4}
                      className="w-full rounded-xl p-3 text-[13px] placeholder-slate-500 focus:outline-none resize-none mb-4 bg-white/5 border border-white/10 text-white"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                      }}
                    />

                    <div className="flex items-center gap-2.5 p-3 rounded-lg mb-4 bg-white/5 border border-white/10">
                      <Shield className="w-4 h-4 text-slate-300 shrink-0" />
                      <span className="text-[11px] text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                        No IP tracking. No username. 100% anonymous posting.
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={handleConfess}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-[13px] font-semibold bg-[#F97316] hover:bg-[#EA580C] transition-colors cursor-pointer"
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                      >
                        <Smile className="w-4 h-4" />
                        Post Anonymously
                      </motion.button>

                      <AnimatePresence>
                        {confessionPosted && (
                          <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0 }}
                            className="text-xs text-emerald-400"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                          >
                            ✓ Posted successfully!
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Confessions Feed */}
                  <StaggerContainer className="flex flex-col gap-4">
                    {CONFESSIONS_DATA.map((conf) => (
                      <StaggerItem key={conf.id}>
                        <motion.div
                          whileHover={{ y: -1 }}
                          className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-50 border border-slate-100">
                                <Shield className="w-4 h-4 text-slate-500" />
                              </div>
                              <div>
                                <span className="text-xs font-semibold text-slate-800" style={{ fontFamily: 'Poppins, sans-serif' }}>Anonymous</span>
                                <p className="text-[10px] text-slate-400">{getRelativeTime(conf.createdAt)}</p>
                              </div>
                            </div>
                            {conf.category && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-50 text-slate-650 border border-slate-200/40" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                {conf.category}
                              </span>
                            )}
                          </div>
                          <p className="text-[13px] text-slate-700 leading-relaxed mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>{conf.content}</p>
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => toggleLike(conf.id)}
                              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                                likedIds.has(conf.id)
                                  ? 'bg-slate-900 text-white'
                                  : 'bg-slate-50 hover:bg-slate-100 text-slate-500'
                              }`}
                            >
                              <Heart
                                className="w-3.5 h-3.5"
                                fill={likedIds.has(conf.id) ? '#ffffff' : 'none'}
                              />
                              <span className="text-xs">{conf.reactions + (likedIds.has(conf.id) ? 1 : 0)}</span>
                            </button>
                          </div>
                        </motion.div>
                      </StaggerItem>
                    ))}
                  </StaggerContainer>
                </div>

                {/* Sidebar */}
                <AnimatedContainer direction="right" delay={0.15}>
                  <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
                    <h3 className="text-sm font-semibold text-slate-850 mb-4 flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <Shield className="w-4 h-4 text-slate-500" />
                      Community Rules
                    </h3>
                    {[
                      'Be respectful and kind',
                      'No hate speech or bullying',
                      'No personal information',
                      'Keep it relevant to campus life',
                      'Confessions are 100% anonymous',
                    ].map((rule, i) => (
                      <div key={i} className="flex items-start gap-2.5 py-2.5 border-b border-slate-100 last:border-0">
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                        <span className="text-xs text-slate-650" style={{ fontFamily: 'Inter, sans-serif' }}>{rule}</span>
                      </div>
                    ))}
                  </div>
                </AnimatedContainer>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
