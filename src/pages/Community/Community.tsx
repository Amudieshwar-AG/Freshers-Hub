import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle, Heart, TrendingUp, ThumbsUp, Send,
  Shield, Lock, Smile, ChevronRight, Search, Plus
} from 'lucide-react';
import SectionTitle from '@/components/SectionTitle/SectionTitle';
import { StaggerContainer, StaggerItem } from '@/components/AnimatedContainer/AnimatedContainer';
import AnimatedContainer from '@/components/AnimatedContainer/AnimatedContainer';
import { QUESTIONS_DATA, CONFESSIONS_DATA } from '@/constants';
import { formatDate } from '@/lib/utils';

type Tab = 'qa' | 'confession';

const TRENDING_TAGS = ['hostel', 'academics', 'clubs', 'campus', 'canteen', 'sports', 'placement', 'library'];

export default function Community() {
  const [activeTab, setActiveTab] = useState<Tab>('qa');
  const [confessionText, setConfessionText] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [confessionPosted, setConfessionPosted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  const filteredQuestions = QUESTIONS_DATA.filter((q) =>
    q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.tags.some((t) => t.includes(searchQuery.toLowerCase()))
  );

  const handleConfess = () => {
    if (!confessionText.trim()) return;
    setConfessionPosted(true);
    setConfessionText('');
    setTimeout(() => setConfessionPosted(false), 3000);
  };

  const toggleLike = (id: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAFA' }}>
      {/* Header */}
      <div className="bg-white border-b border-[#E5E7EB] py-10">
        <div className="container-custom">
          <h1 className="text-3xl md:text-4xl font-bold text-[#1E293B] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            RIT{' '}
            <span style={{ background: 'linear-gradient(135deg, #F97316, #FB923C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Community
            </span>
          </h1>
          <p className="text-[#475569]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Ask questions, share confessions, and connect with fellow RIT students.
          </p>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Tabs */}
        <div className="flex gap-2 bg-white rounded-2xl p-2 border border-[#E5E7EB] mb-8 w-fit" style={{ boxShadow: '0 2px 15px -3px rgba(0,0,0,0.07)' }}>
          {[
            { id: 'qa' as Tab, label: 'Freshers Q&A', icon: MessageCircle },
            { id: 'confession' as Tab, label: 'Confessions', icon: Heart },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{ fontFamily: 'Poppins, sans-serif', color: activeTab === tab.id ? 'white' : '#475569' }}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="community-tab"
                  className="absolute inset-0 rounded-xl"
                  style={{ background: 'linear-gradient(135deg, #F97316, #FB923C)' }}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <tab.icon className="w-4 h-4" />
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
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  {/* Ask Question Box */}
                  <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 mb-6" style={{ boxShadow: '0 2px 15px -3px rgba(0,0,0,0.07)' }}>
                    <h3 className="text-sm font-semibold text-[#1E293B] mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>Ask a Question</h3>
                    <textarea
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      placeholder="What's on your mind? Ask your seniors anything about RIT..."
                      rows={3}
                      className="w-full border border-[#E5E7EB] rounded-xl p-3 text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#F97316] resize-none transition-colors mb-3"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#94A3B8]" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Your question will be visible to all students
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold"
                        style={{ fontFamily: 'Poppins, sans-serif', background: 'linear-gradient(135deg, #F97316, #FB923C)' }}
                      >
                        <Plus className="w-4 h-4" />
                        Post Question
                      </motion.button>
                    </div>
                  </div>

                  {/* Search */}
                  <div className="relative mb-5">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                    <input
                      type="text"
                      placeholder="Search questions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-white text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#F97316] transition-colors"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    />
                  </div>

                  {/* Questions */}
                  <StaggerContainer className="flex flex-col gap-4">
                    {filteredQuestions.map((q) => (
                      <StaggerItem key={q.id}>
                        <motion.div
                          whileHover={{ y: -2 }}
                          className="bg-white rounded-2xl border border-[#E5E7EB] p-5"
                          style={{ boxShadow: '0 2px 15px -3px rgba(0,0,0,0.07)' }}
                        >
                          <div className="flex items-start gap-4">
                            {/* Votes */}
                            <div className="flex flex-col items-center gap-1 shrink-0">
                              <button
                                onClick={() => toggleLike(q.id)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                                style={{ backgroundColor: likedIds.has(q.id) ? '#FFF7ED' : '#F8FAFC' }}
                              >
                                <ThumbsUp className="w-4 h-4" style={{ color: likedIds.has(q.id) ? '#F97316' : '#94A3B8' }} />
                              </button>
                              <span className="text-xs font-semibold text-[#475569]">{q.votes + (likedIds.has(q.id) ? 1 : 0)}</span>
                            </div>

                            <div className="flex-1">
                              <h3 className="text-sm font-semibold text-[#1E293B] mb-1.5 hover:text-[#F97316] cursor-pointer transition-colors"
                                style={{ fontFamily: 'Poppins, sans-serif' }}>
                                {q.title}
                              </h3>
                              <p className="text-xs text-[#94A3B8] mb-3 line-clamp-2" style={{ fontFamily: 'Inter, sans-serif' }}>{q.body}</p>
                              <div className="flex items-center justify-between flex-wrap gap-2">
                                <div className="flex flex-wrap gap-1.5">
                                  {q.tags.map((tag) => (
                                    <span
                                      key={tag}
                                      className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F8FAFC] text-[#94A3B8] border border-[#E5E7EB]"
                                      style={{ fontFamily: 'Inter, sans-serif' }}
                                    >
                                      #{tag}
                                    </span>
                                  ))}
                                </div>
                                <div className="flex items-center gap-3 text-xs text-[#94A3B8]">
                                  <span className="flex items-center gap-1">
                                    <MessageCircle className="w-3.5 h-3.5" />
                                    {q.answers} answers
                                  </span>
                                  {q.isAnswered && (
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-semibold">✓ Answered</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </StaggerItem>
                    ))}
                  </StaggerContainer>
                </div>

                {/* Sidebar */}
                <div className="flex flex-col gap-5">
                  {/* Trending */}
                  <AnimatedContainer direction="right" delay={0.1}>
                    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5" style={{ boxShadow: '0 2px 15px -3px rgba(0,0,0,0.07)' }}>
                      <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="w-4.5 h-4.5 text-[#F97316]" />
                        <h3 className="text-sm font-semibold text-[#1E293B]" style={{ fontFamily: 'Poppins, sans-serif' }}>Trending Topics</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {TRENDING_TAGS.map((tag) => (
                          <button
                            key={tag}
                            onClick={() => setSearchQuery(tag)}
                            className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#FFF7ED] text-[#F97316] hover:bg-[#F97316] hover:text-white transition-all border border-[#FED7AA]"
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
                    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5" style={{ boxShadow: '0 2px 15px -3px rgba(0,0,0,0.07)' }}>
                      {[
                        { label: 'Total Questions', value: '124' },
                        { label: 'Answered', value: '98%' },
                        { label: 'Active Students', value: '340+' },
                      ].map((stat, i) => (
                        <div key={i} className={`flex justify-between py-2.5 ${i < 2 ? 'border-b border-[#E5E7EB]' : ''}`}>
                          <span className="text-xs text-[#94A3B8]" style={{ fontFamily: 'Inter, sans-serif' }}>{stat.label}</span>
                          <span className="text-xs font-bold text-[#F97316]" style={{ fontFamily: 'Poppins, sans-serif' }}>{stat.value}</span>
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
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  {/* Post confession */}
                  <div
                    className="rounded-3xl p-6 mb-8 border"
                    style={{ background: 'linear-gradient(135deg, #1E293B, #334155)', borderColor: 'rgba(255,255,255,0.1)' }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(249,115,22,0.2)' }}>
                        <Lock className="w-5 h-5 text-[#F97316]" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>Share Anonymously</h3>
                        <p className="text-slate-400 text-xs">Your identity is never revealed</p>
                      </div>
                    </div>

                    <textarea
                      value={confessionText}
                      onChange={(e) => setConfessionText(e.target.value)}
                      placeholder="Share your thoughts, stories, crushes, or anything on your mind... It's completely anonymous 🤫"
                      rows={4}
                      className="w-full rounded-xl p-4 text-sm placeholder-slate-500 focus:outline-none resize-none mb-4"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        backgroundColor: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'white',
                      }}
                    />

                    <div className="flex items-center gap-3 p-3 rounded-xl mb-4" style={{ backgroundColor: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)' }}>
                      <Shield className="w-4 h-4 text-[#F97316] shrink-0" />
                      <span className="text-xs text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                        No IP tracking. No username. 100% anonymous posting.
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleConfess}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-semibold"
                        style={{ fontFamily: 'Poppins, sans-serif', background: 'linear-gradient(135deg, #F97316, #FB923C)' }}
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
                          whileHover={{ y: -2 }}
                          className="bg-white rounded-2xl border border-[#E5E7EB] p-5"
                          style={{ boxShadow: '0 2px 15px -3px rgba(0,0,0,0.07)' }}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#FFF7ED]">
                                <Shield className="w-4 h-4 text-[#F97316]" />
                              </div>
                              <div>
                                <span className="text-xs font-semibold text-[#1E293B]" style={{ fontFamily: 'Poppins, sans-serif' }}>Anonymous</span>
                                <p className="text-[10px] text-[#94A3B8]">{formatDate(conf.createdAt)}</p>
                              </div>
                            </div>
                            {conf.category && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#FFF7ED] text-[#F97316] border border-[#FED7AA]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                {conf.category}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-[#475569] leading-relaxed mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>{conf.content}</p>
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => toggleLike(conf.id)}
                              className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all"
                              style={{ backgroundColor: likedIds.has(conf.id) ? '#FFF7ED' : '#F8FAFC' }}
                            >
                              <Heart
                                className="w-3.5 h-3.5"
                                style={{ color: likedIds.has(conf.id) ? '#F97316' : '#94A3B8' }}
                                fill={likedIds.has(conf.id) ? '#F97316' : 'none'}
                              />
                              <span className="text-xs text-[#94A3B8]">{conf.reactions + (likedIds.has(conf.id) ? 1 : 0)}</span>
                            </button>
                          </div>
                        </motion.div>
                      </StaggerItem>
                    ))}
                  </StaggerContainer>
                </div>

                {/* Sidebar */}
                <AnimatedContainer direction="right" delay={0.15}>
                  <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5" style={{ boxShadow: '0 2px 15px -3px rgba(0,0,0,0.07)' }}>
                    <h3 className="text-sm font-semibold text-[#1E293B] mb-4 flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <Shield className="w-4 h-4 text-[#F97316]" />
                      Community Rules
                    </h3>
                    {[
                      'Be respectful and kind',
                      'No hate speech or bullying',
                      'No personal information',
                      'Keep it relevant to campus life',
                      'Confessions are 100% anonymous',
                    ].map((rule, i) => (
                      <div key={i} className="flex items-start gap-2.5 py-2.5 border-b border-[#E5E7EB] last:border-0">
                        <ChevronRight className="w-3.5 h-3.5 text-[#F97316] mt-0.5 shrink-0" />
                        <span className="text-xs text-[#475569]" style={{ fontFamily: 'Inter, sans-serif' }}>{rule}</span>
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
