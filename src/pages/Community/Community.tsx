import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle, Heart, TrendingUp, ThumbsUp, Send,
  Shield, Lock, Smile, ChevronRight, Search, Plus, User
} from 'lucide-react';
import SectionTitle from '@/components/SectionTitle/SectionTitle';
import { StaggerContainer, StaggerItem } from '@/components/AnimatedContainer/AnimatedContainer';
import AnimatedContainer from '@/components/AnimatedContainer/AnimatedContainer';
import { CONFESSIONS_DATA } from '@/constants';

type Tab = 'qa' | 'confession';

const TRENDING_TAGS = ['hostel', 'academics', 'clubs', 'campus', 'canteen', 'sports', 'placement', 'library', 'cat exam', 'semester', 'labs', 'exams'];

const AVATARS: Record<string, string> = {
  'Priya S.': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80',
  'Ravi K.': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80',
  'Arun M.': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80',
};

const getAvatar = (author: string) => {
  return AVATARS[author] || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(author)}`;
};

const getRelativeTime = (dateString: string) => {
  if (!dateString) return 'just now';

  // Normalize microsecond timestamps (e.g. 2026-07-22T13:28:18.174367) to standard millisecond precision
  let normalized = dateString;
  const dotIndex = dateString.indexOf('.');
  if (dotIndex !== -1) {
    const mainPart = dateString.substring(0, dotIndex);
    let msPart = dateString.substring(dotIndex + 1);
    // Strip any trailing non-digits (like timezone offsets Z or +05:30) for truncation, then keep first 3 digits
    const nonDigitMatch = msPart.match(/\D/);
    let suffix = '';
    if (nonDigitMatch && nonDigitMatch.index !== undefined) {
      suffix = msPart.substring(nonDigitMatch.index);
      msPart = msPart.substring(0, nonDigitMatch.index);
    }
    normalized = `${mainPart}.${msPart.substring(0, 3)}${suffix}`;
  }

  const now = new Date().getTime(); // Dynamic local time
  const past = new Date(normalized).getTime();
  if (isNaN(past)) return 'just now';

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
  const PAGE_SIZE = 5;

  const [activeTab, setActiveTab] = useState<Tab>('qa');
  const [confessionText, setConfessionText] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [confessionPosted, setConfessionPosted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [expandedQuestionIds, setExpandedQuestionIds] = useState<Set<string>>(new Set());
  const [expandedBodyIds, setExpandedBodyIds] = useState<Set<string>>(new Set());
  const [sortFilter, setSortFilter] = useState<'recent' | 'liked' | 'answered' | 'unanswered'>('recent');
  // Client-side pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleAnswers = (id: string) => {
    setExpandedQuestionIds((prev) => {
      const next = new Set(prev);
      if (next.has(id.toString())) {
        next.delete(id.toString());
      } else {
        next.add(id.toString());
      }
      return next;
    });
  };

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/questions`);
      if (response.ok) {
        const data = await response.json();
        // Backend returns oldest-first, reverse to show newest first
        setQuestions(Array.isArray(data) ? [...data].reverse() : []);
      } else {
        setQuestions([]);
      }
    } catch {
      // Backend unavailable — show empty state
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedLikes = localStorage.getItem('qa-liked-ids');
    if (savedLikes) {
      try {
        setLikedIds(new Set(JSON.parse(savedLikes)));
      } catch (e) {
        console.error('Failed to parse liked IDs from localStorage', e);
      }
    }
    fetchQuestions();
  }, []);

  const getAnswersCount = (q: any) => {
    if (Array.isArray(q.answers)) return q.answers.length;
    if (typeof q.answers === 'number') return q.answers;
    return 0;
  };

  const getVotesCount = (q: any) => {
    const votesVal = typeof q.upvotes === 'number' ? q.upvotes : (typeof q.votes === 'number' ? q.votes : 0);
    return votesVal;
  };

  // Client-side filter and sorting derived state
  let processedQuestions = questions.filter((q) => {
    const titleVal = q.title || "";
    const tagsVal = q.tags || [];
    return titleVal.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tagsVal.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  if (sortFilter === 'recent') {
    processedQuestions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else if (sortFilter === 'liked') {
    processedQuestions.sort((a, b) => getVotesCount(b) - getVotesCount(a));
  } else if (sortFilter === 'answered') {
    processedQuestions.sort((a, b) => getAnswersCount(b) - getAnswersCount(a));
  } else if (sortFilter === 'unanswered') {
    processedQuestions = processedQuestions.filter(q => !q.isAnswered && getAnswersCount(q) === 0);
  }

  const filteredQuestions = processedQuestions;
  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / PAGE_SIZE));
  const paginatedQuestions = filteredQuestions.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  // Reset page when search or filter changes
  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery, sortFilter]);

  const handlePageChange = (newPage: number) => {
    setExpandedQuestionIds(new Set()); // collapse any open answers
    setExpandedBodyIds(new Set());     // collapse bodies too
    setCurrentPage(newPage);
    // Scroll back to the top of the questions list smoothly
    document.getElementById('qa-questions-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleConfess = () => {
    if (!confessionText.trim()) return;
    setConfessionPosted(true);
    setConfessionText('');
    setTimeout(() => setConfessionPosted(false), 3000);
  };

  const handleLike = async (id: string) => {
    let isLikedNow = false;
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        isLikedNow = false;
      } else {
        next.add(id);
        isLikedNow = true;
      }
      localStorage.setItem('qa-liked-ids', JSON.stringify(Array.from(next)));
      return next;
    });

    // Optimistically update count (+1 if liked, -1 if unliked)
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id.toString() === id) {
          const votesVal = typeof q.upvotes === 'number' ? q.upvotes : (typeof q.votes === 'number' ? q.votes : 0);
          return { ...q, upvotes: isLikedNow ? votesVal + 1 : Math.max(0, votesVal - 1) };
        }
        return q;
      })
    );

    try {
      if (isLikedNow) {
        await fetch(`http://localhost:8080/api/questions/${id}/upvote`, {
          method: 'POST'
        });
        fetchQuestions();
      }
    } catch (error) {
      console.log('Backend not available for upvote sync.', error);
    }
  };

  const handleCardClick = (id: string) => {
    const idStr = id.toString();
    setExpandedQuestionIds((prev) => {
      const next = new Set(prev);
      if (next.has(idStr)) next.delete(idStr); else next.add(idStr);
      return next;
    });
    setExpandedBodyIds((prev) => {
      const next = new Set(prev);
      if (next.has(idStr)) next.delete(idStr); else next.add(idStr);
      return next;
    });
  };

  const handlePostQuestion = async () => {
    if (!questionText.trim()) return;

    const displayAuthor = authorName.trim() || 'Anonymous';

    // Auto-detect hashtags based on question text content
    const detectedTags = TRENDING_TAGS.filter(tag =>
      questionText.toLowerCase().includes(tag.toLowerCase())
    );
    const finalTags = detectedTags.length > 0 ? detectedTags : ['fresher', 'general'];

    const newQuestion = {
      title: questionText.split('\n')[0].substring(0, 100) || "Q&A Question",
      body: questionText,
      author: displayAuthor,
      tags: finalTags,
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
          <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight" style={{ fontFamily: 'Playfair Display, serif', color: '#1E293B' }}>
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
                <div className="lg:col-span-2">                  {/* Ask Question Box */}
                  <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 mb-8" style={{ boxShadow: '0 2px 15px -3px rgba(0,0,0,0.07)' }}>
                    <h3 className="text-base font-semibold text-[#1E293B] mb-3 tracking-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>Ask a Question</h3>
                    <textarea
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      placeholder="What's on your mind? Ask your seniors anything about RIT..."
                      rows={3}
                      className="w-full border border-[#E5E7EB] rounded-2xl p-3.5 text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#F97316] focus:ring-4 focus:ring-orange-500/10 focus:bg-white bg-slate-50/30 resize-none transition-all mb-3.5"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    />
                    <input
                      type="text"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder="Your Name (optional)"
                      className="w-full md:w-64 border border-[#E5E7EB] rounded-2xl px-4 py-2.5 text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#F97316] focus:ring-4 focus:ring-orange-500/10 focus:bg-white bg-slate-50/30 transition-all mb-4"
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
                        className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl text-white text-[13px] font-semibold bg-[#F97316] hover:bg-[#EA580C] transition-colors cursor-pointer"
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                      >
                        <Plus className="w-4 h-4" />
                        Post Question
                      </motion.button>
                    </div>
                  </div>


                  {/* Search */}
                  <div className="relative mb-4">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search questions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#E5E7EB] bg-white text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 transition-colors"
                      style={{ fontFamily: 'Inter, sans-serif', boxShadow: '0 2px 15px -3px rgba(0,0,0,0.07)' }}
                    />
                  </div>

                  {/* Sort / Filter Bar */}
                  <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none flex-nowrap">
                    {[
                      { id: 'recent', label: 'Recent' },
                      { id: 'liked', label: 'Most Liked' },
                      { id: 'answered', label: 'Most Answered' },
                      { id: 'unanswered', label: 'Unanswered' }
                    ].map((chip) => {
                      const isActive = sortFilter === chip.id;
                      return (
                        <button
                          key={chip.id}
                          onClick={() => setSortFilter(chip.id as any)}
                          className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition-all border ${isActive
                              ? 'bg-[#F97316] text-white border-[#F97316] shadow-sm'
                              : 'bg-white hover:bg-slate-50 text-slate-600 border-[#E5E7EB]'
                            }`}
                          style={{ fontFamily: 'Poppins, sans-serif' }}
                        >
                          {chip.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Questions */}
                  <div id="qa-questions-list">
                    {loading ? (
                      <div className="flex flex-col gap-3">
                        {[...Array(PAGE_SIZE)].map((_, i) => (
                          <div key={i} className="bg-white rounded-xl border border-slate-200/50 p-5 animate-pulse">
                            <div className="flex items-start gap-4">
                              <div className="w-10 h-10 rounded-xl bg-slate-100 shrink-0" />
                              <div className="flex-1 space-y-2">
                                <div className="h-3 w-1/4 rounded bg-slate-100" />
                                <div className="h-4 w-2/3 rounded bg-slate-100" />
                                <div className="h-3 w-full rounded bg-slate-100" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : filteredQuestions.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                          <MessageCircle className="w-6 h-6 text-slate-400" />
                        </div>
                        <p className="text-sm font-semibold text-slate-700 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {searchQuery ? 'No questions match your search' : 'No questions yet'}
                        </p>
                        <p className="text-xs text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {searchQuery ? 'Try a different keyword' : 'Be the first to ask something!'}
                        </p>
                      </div>
                    ) : (
                      <StaggerContainer key={`${currentPage}-${filteredQuestions.length}`} className="flex flex-col gap-3">
                        {paginatedQuestions.map((q, idx) => {
                          const isFeatured = idx === 0 && searchQuery === '' && currentPage === 0;
                          const isLiked = likedIds.has(q.id.toString());
                          const ansCount = getAnswersCount(q);
                          const likesCount = getVotesCount(q);
                          const isTrending = (likesCount + ansCount) >= 5;
                          const isBodyExpanded = expandedBodyIds.has(q.id.toString());

                          return (
                            <StaggerItem key={q.id}>
                              <motion.div
                                whileHover={{ y: -2, boxShadow: '0 12px 30px -4px rgba(249,115,22,0.08)' }}
                                onClick={() => handleCardClick(q.id)}
                                transition={{ duration: 0.2 }}
                                className="bg-white border border-[#E5E7EB] border-l-4 border-l-transparent rounded-2xl p-4 transition-all duration-300 cursor-pointer hover:border-l-[#F97316]"
                                style={{ boxShadow: '0 2px 12px -3px rgba(0,0,0,0.05)' }}
                              >
                                <div className="flex items-start gap-3">
                                  {/* Avatar */}
                                  <img
                                    src={getAvatar(q.author)}
                                    alt={q.author}
                                    className="w-8 h-8 rounded-full object-cover bg-slate-50 border border-slate-100 shrink-0"
                                  />

                                  <div className="flex-1 min-w-0">
                                    {/* Header / Meta */}
                                    <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                                      <span className="text-xs font-bold text-[#1E293B]" style={{ fontFamily: 'Poppins, sans-serif' }}>{q.author}</span>
                                      <span className="text-[10px] text-slate-300">•</span>
                                      <span className="text-[10px] text-slate-400 font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>{getRelativeTime(q.createdAt)}</span>

                                      {/* Badges on Top Right */}
                                      <div className="ml-auto flex items-center gap-1 shrink-0">
                                        {isTrending && (
                                          <span className="bg-amber-50 text-amber-700 border border-amber-200/40 text-[9px] px-1.5 py-0.5 rounded font-semibold tracking-wide uppercase">★ Trending</span>
                                        )}
                                        {q.isAnswered || ansCount > 0 ? (
                                          <span className="bg-emerald-50 text-emerald-750 border border-emerald-200/40 text-[9px] px-1.5 py-0.5 rounded font-semibold tracking-wide uppercase">✓ Answered</span>
                                        ) : (
                                          <span className="bg-slate-50 text-slate-400 border border-slate-200/40 text-[9px] px-1.5 py-0.5 rounded font-semibold tracking-wide uppercase">Unanswered</span>
                                        )}
                                      </div>
                                    </div>

                                    <h3 className={`font-bold text-[#1E293B] mb-1 hover:text-[#F97316] transition-colors tracking-tight ${isFeatured ? 'text-base md:text-lg' : 'text-sm md:text-base'
                                      }`}
                                      style={{ fontFamily: 'Playfair Display, serif' }}>
                                      {q.title}
                                    </h3>

                                    {q.body && q.body.trim() !== q.title.trim() && (
                                      <p className={`text-[12.5px] text-slate-500 mb-3.5 leading-relaxed transition-all duration-300 ${isBodyExpanded ? '' : 'line-clamp-1'
                                        }`} style={{ fontFamily: 'Inter, sans-serif' }}>
                                        {q.body}
                                      </p>
                                    )}

                                    <div className="flex items-center justify-between flex-wrap gap-3 pt-2.5 border-t border-slate-100/60">
                                      {/* Left side: Replies & Likes & Tags inline */}
                                      <div className="flex items-center gap-4 flex-wrap text-[11px]">
                                        {/* Replies button */}
                                        <button
                                          onClick={(e) => { e.stopPropagation(); handleCardClick(q.id); }}
                                          className={`flex items-center gap-1 text-[11px] font-bold transition-all duration-200 cursor-pointer ${expandedQuestionIds.has(q.id.toString())
                                              ? 'text-[#F97316]'
                                              : 'text-slate-500 hover:text-slate-800'
                                            }`}
                                        >
                                          <MessageCircle className="w-3.5 h-3.5" />
                                          <span style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            {ansCount > 0 ? `${ansCount} ${ansCount === 1 ? 'reply' : 'replies'}` : '0 replies'}
                                          </span>
                                        </button>

                                        {/* Upvotes button */}
                                        <button
                                          onClick={(e) => { e.stopPropagation(); handleLike(q.id.toString()); }}
                                          className={`flex items-center gap-1 text-[11px] font-bold transition-all duration-200 cursor-pointer ${isLiked
                                              ? 'text-rose-600'
                                              : 'text-slate-500 hover:text-slate-850'
                                            }`}
                                        >
                                          <ThumbsUp className="w-3.5 h-3.5" fill={isLiked ? 'currentColor' : 'none'} />
                                          <span style={{ fontFamily: 'Poppins, sans-serif' }}>{likesCount}</span>
                                        </button>

                                        {/* Tags Inline */}
                                        <div className="flex items-center gap-1 flex-wrap pl-1 border-l border-slate-100">
                                          {(q.tags || []).map((tag) => (
                                            <span
                                              key={tag}
                                              onClick={(e) => { e.stopPropagation(); setSearchQuery(tag); }}
                                              className="px-1.5 py-0.5 rounded bg-slate-50 text-[10px] font-semibold text-slate-400 border border-slate-100 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                                              style={{ fontFamily: 'Inter, sans-serif' }}
                                            >
                                              #{tag}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Expandable Answers Section */}
                                    {expandedQuestionIds.has(q.id.toString()) && (
                                      <div className="mt-4 pt-4 border-t border-slate-150 flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center justify-between">
                                          <h4 className="text-[10px] font-bold text-slate-500 tracking-tight uppercase" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                            Replies ({ansCount})
                                          </h4>
                                        </div>
                                        {Array.isArray(q.answers) && q.answers.length > 0 ? (
                                          <div className="flex flex-col gap-3.5 max-h-80 overflow-y-auto pr-1">
                                            {q.answers.map((ans: any) => (
                                              <div key={ans.id} className="relative pl-6 flex items-start gap-2.5 group">
                                                {/* Thread connector line */}
                                                <div className="absolute left-[9px] top-[-16px] bottom-3 w-3 border-l border-b border-slate-200 rounded-bl-lg pointer-events-none" />

                                                {/* Senior Avatar */}
                                                <img
                                                  src={getAvatar(ans.author)}
                                                  alt={ans.author}
                                                  className="w-6 h-6 rounded-full object-cover bg-slate-50 border border-slate-100 shrink-0 relative z-10"
                                                />

                                                <div className="flex-1 min-w-0">
                                                  <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                                                    <span className="text-[11.5px] font-bold text-[#1E293B]" style={{ fontFamily: 'Poppins, sans-serif' }}>{ans.author}</span>
                                                    {/* Blue verified check icon for senior helpers */}
                                                    <span className="inline-flex text-blue-500" title="Verified Senior Helper">
                                                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                                        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                                      </svg>
                                                    </span>
                                                    <span className="text-[9px] text-slate-350">•</span>
                                                    <span className="text-[10px] text-slate-450 font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>{getRelativeTime(ans.createdAt)}</span>
                                                  </div>
                                                  <p className="text-[12.5px] text-slate-600 leading-relaxed font-normal" style={{ fontFamily: 'Inter, sans-serif' }}>
                                                    {ans.body}
                                                  </p>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        ) : null}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            </StaggerItem>
                          );
                        })}
                      </StaggerContainer>
                    )}

                    {/* Pagination — arrows only */}
                    {!loading && totalPages > 1 && (
                      <div className="flex items-center justify-between mt-6 px-1">
                        <motion.button
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 0 || loading}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-[12px] font-semibold transition-all duration-200 ${currentPage === 0
                              ? 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm cursor-pointer'
                            }`}
                          style={{ fontFamily: 'Poppins, sans-serif' }}
                        >
                          <ChevronRight className="w-4 h-4 rotate-180" />
                          Prev
                        </motion.button>

                        <span className="text-[11px] text-slate-405 font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                          Page {currentPage + 1} of {totalPages} &middot; {filteredQuestions.length} questions
                        </span>

                        <motion.button
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage >= totalPages - 1 || loading}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-[12px] font-semibold transition-all duration-200 ${currentPage >= totalPages - 1
                              ? 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm cursor-pointer'
                            }`}
                          style={{ fontFamily: 'Poppins, sans-serif' }}
                        >
                          Next
                          <ChevronRight className="w-4 h-4" />
                        </motion.button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sidebar */}
                <div className="flex flex-col gap-6">
                  {/* Trending */}
                  <AnimatedContainer direction="right" delay={0.1}>
                    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6" style={{ boxShadow: '0 2px 15px -3px rgba(0,0,0,0.07)' }}>
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

                  {/* Stats — real data from backend */}
                  <AnimatedContainer direction="right" delay={0.2}>
                    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6" style={{ boxShadow: '0 2px 15px -3px rgba(0,0,0,0.07)' }}>
                      {[
                        {
                          label: 'Total Questions',
                          value: questions.length.toString()
                        },
                        {
                          label: 'Answered',
                          value: questions.length > 0
                            ? `${Math.round((questions.filter(q => q.isAnswered).length / questions.length) * 100)}%`
                            : '0%'
                        },
                      ].map((stat, i) => (
                        <div key={i} className={`flex justify-between py-2.5 ${i < 1 ? 'border-b border-slate-100' : ''}`}>
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
                    className="rounded-2xl p-6 mb-6 border"
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
                      className="w-full rounded-2xl p-3.5 text-[13px] placeholder-slate-500 focus:outline-none resize-none mb-4 bg-white/5 border border-white/10 text-white"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                      }}
                    />

                    <div className="flex items-center gap-2.5 p-3 rounded-xl mb-4 bg-white/5 border border-white/10">
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
                        className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl text-white text-[13px] font-semibold bg-[#F97316] hover:bg-[#EA580C] transition-colors cursor-pointer"
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
                   {CONFESSIONS_DATA.length > 0 ? (
                     <StaggerContainer className="flex flex-col gap-4">
                       {CONFESSIONS_DATA.map((conf) => (
                         <StaggerItem key={conf.id}>
                           <motion.div
                             whileHover={{ y: -4, boxShadow: '0 20px 50px -12px rgba(0,0,0,0.12)', borderColor: '#CBD5E1' }}
                             transition={{ duration: 0.25 }}
                             className="bg-white rounded-2xl border border-[#E5E7EB] p-6 transition-all duration-300"
                             style={{ boxShadow: '0 2px 15px -3px rgba(0,0,0,0.07)' }}
                           >
                             <div className="flex items-start justify-between mb-3">
                               <div className="flex items-center gap-2.5">
                                 <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-50 border border-slate-100">
                                   <Shield className="w-4 h-4 text-slate-500" />
                                 </div>
                                 <div>
                                   <span className="text-xs font-bold text-slate-800" style={{ fontFamily: 'Poppins, sans-serif' }}>Anonymous</span>
                                   <p className="text-[10px] text-slate-400 font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>{getRelativeTime(conf.createdAt)}</p>
                                 </div>
                               </div>
                               {conf.category && (
                                 <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-50 text-slate-600 border border-slate-200/40" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                   {conf.category}
                                 </span>
                               )}
                             </div>
                             <p className="text-[13px] text-slate-755 leading-relaxed mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>{conf.content}</p>
                             <div className="flex items-center justify-between">
                               <button
                                 onClick={() => toggleLike(conf.id)}
                                 className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all duration-200 cursor-pointer border text-[10px] font-bold ${likedIds.has(conf.id)
                                     ? 'bg-rose-50 text-rose-600 border-rose-100/60 hover:bg-rose-100/60'
                                     : 'bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 border-slate-200/30'
                                   }`}
                               >
                                 <Heart
                                   className="w-3.5 h-3.5"
                                   fill={likedIds.has(conf.id) ? '#e11d48' : 'none'}
                                   color={likedIds.has(conf.id) ? '#e11d48' : 'currentColor'}
                                 />
                                 <span>{conf.reactions + (likedIds.has(conf.id) ? 1 : 0)}</span>
                               </button>
                             </div>
                           </motion.div>
                         </StaggerItem>
                       ))}
                     </StaggerContainer>
                   ) : (
                     <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8 text-center" style={{ boxShadow: '0 2px 15px -3px rgba(0,0,0,0.07)' }}>
                       <Shield className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                       <p className="text-sm font-semibold text-slate-700 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                         No Confessions Yet
                       </p>
                       <p className="text-xs text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                         Be the first to post a confession anonymously!
                       </p>
                     </div>
                   )}
                </div>

                {/* Sidebar */}
                <AnimatedContainer direction="right" delay={0.15}>
                  <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6" style={{ boxShadow: '0 2px 15px -3px rgba(0,0,0,0.07)' }}>
                    <h3 className="text-sm font-semibold text-[#1E293B] mb-4 flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
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
