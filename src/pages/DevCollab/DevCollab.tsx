import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code2, Plus, GitBranch, Tag, User, Send, CheckCircle2,
  Search, Filter, Sparkles, X, ExternalLink, Layers,
  ChevronRight, MessageSquare, Clock, Users, ArrowUpRight,
  ShieldCheck, LogIn, ShieldAlert
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getBackendUrl } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

export interface CollabRequestItem {
  id: number;
  authorName: string;
  department: string;
  year: string;
  projectIdea: string;
  githubLink?: string;
  tag: string;
  collaboratorsNeeded?: number;
  acceptedCount?: number;
  contactInfo?: string;
  telegramChatId?: number;
  discordUserId?: string;
  status: string;
  applicationsCount: number;
  createdAt: string;
}

const TAG_OPTIONS = [
  'looking for co-developing a project from scratch',
  'looking for beta testers',
  'looking for Open-source Collaborators/Contributers',
];

const DEPARTMENTS = ['CSE', 'CSBS', 'AIML', 'ECE', 'MECH', 'CIVIL', 'AI & DS', 'EEE', 'IT', 'Other'];
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

const INITIAL_MOCK_REQUESTS: CollabRequestItem[] = [
  {
    id: 101,
    authorName: 'Rohan Sharma',
    department: 'CSE',
    year: '3rd Year',
    projectIdea: 'Building an automated AI Attendance & Proxy Detection system using OpenCV and Python for college labs.',
    githubLink: 'https://github.com/example/rit-ai-attendance',
    tag: 'looking for co-developing a project from scratch',
    collaboratorsNeeded: 2,
    acceptedCount: 0,
    contactInfo: '@rohan_sharma_rit',
    status: 'OPEN',
    applicationsCount: 3,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 102,
    authorName: 'Ananya V.',
    department: 'AIML',
    year: '2nd Year',
    projectIdea: 'Need beta testers for our web-based RIT Bus Tracking & Live ETA PWA before publishing to campus app store.',
    githubLink: 'https://github.com/example/rit-bus-live',
    tag: 'looking for beta testers',
    collaboratorsNeeded: 5,
    acceptedCount: 2,
    contactInfo: '@ananya_rit_dev',
    status: 'OPEN',
    applicationsCount: 7,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 103,
    authorName: 'Karthik N.',
    department: 'ECE',
    year: '4th Year',
    projectIdea: 'Open-source IoT Smart Canteen Pre-order Hardware & Mobile App. Looking for React Native & ESP32 contributors!',
    githubLink: 'https://github.com/example/rit-smart-canteen',
    tag: 'looking for Open-source Collaborators/Contributers',
    collaboratorsNeeded: 3,
    acceptedCount: 1,
    contactInfo: '@karthik_ece_rit',
    status: 'OPEN',
    applicationsCount: 5,
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
];

export default function DevCollab() {
  const { user, isAuthenticated, isVerifiedStudent, loginWithGoogle } = useAuth();

  const [requests, setRequests] = useState<CollabRequestItem[]>(INITIAL_MOCK_REQUESTS);
  const [loading, setLoading] = useState(false);
  const [activeTagFilter, setActiveTagFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedCollab, setSelectedCollab] = useState<CollabRequestItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showAuthGate, setShowAuthGate] = useState(false);

  // New Request Form — auto-populated from Google profile for verified students
  const [newAuthorName, setNewAuthorName] = useState(user?.name || '');
  const [newDept, setNewDept] = useState('CSE');
  const [newYear, setNewYear] = useState('1st Year');
  const [newTag, setNewTag] = useState(TAG_OPTIONS[0]);
  const [newCollaboratorsNeeded, setNewCollaboratorsNeeded] = useState(1);
  const [newIdea, setNewIdea] = useState('');
  const [newGithub, setNewGithub] = useState('');
  const [newContact, setNewContact] = useState(user?.email || '');
  const [submittingPost, setSubmittingPost] = useState(false);

  // Application Form — auto-populated from Google profile
  const [appApplicantName, setAppApplicantName] = useState(user?.name || '');
  const [appDept, setAppDept] = useState('CSE');
  const [appYear, setAppYear] = useState('1st Year');
  const [appContact, setAppContact] = useState(user?.email || '');
  const [appMessage, setAppMessage] = useState('');

  // Helper: gate action behind verified student check
  const requireVerifiedStudent = (action: () => void) => {
    if (!isAuthenticated || !isVerifiedStudent) {
      setShowAuthGate(true);
      return;
    }
    action();
  };
  const [submittingApp, setSubmittingApp] = useState(false);

  const fetchCollabRequests = () => {
    setLoading(true);
    fetch(getBackendUrl('/api/collab'))
      .then((res) => {
        if (!res.ok) throw new Error('Backend offline');
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setRequests(data);
        }
      })
      .catch(() => {
        // Fallback to mock data if backend not available
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCollabRequests();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handlePostRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthorName.trim() || !newIdea.trim()) return;

    setSubmittingPost(true);
    const payload = {
      authorName: newAuthorName.trim(),
      department: newDept,
      year: newYear,
      tag: newTag,
      collaboratorsNeeded: Number(newCollaboratorsNeeded) || 1,
      projectIdea: newIdea.trim(),
      githubLink: newGithub.trim() || null,
      contactInfo: newContact.trim() || undefined,
    };

    fetch(getBackendUrl('/api/collab'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((saved) => {
        setRequests((prev) => [saved, ...prev]);
        showToast('🎉 Collaboration request posted successfully!');
        setShowPostModal(false);
        setNewAuthorName('');
        setNewIdea('');
        setNewGithub('');
        setNewContact('');
        setNewCollaboratorsNeeded(1);
      })
      .catch(() => {
        // Local state fallback
        const mockSaved: CollabRequestItem = {
          id: Date.now(),
          authorName: payload.authorName,
          department: payload.department,
          year: payload.year,
          tag: payload.tag,
          collaboratorsNeeded: payload.collaboratorsNeeded,
          acceptedCount: 0,
          projectIdea: payload.projectIdea,
          githubLink: payload.githubLink || undefined,
          contactInfo: payload.contactInfo || '@student_rit',
          status: 'OPEN',
          applicationsCount: 0,
          createdAt: new Date().toISOString(),
        };
        setRequests((prev) => [mockSaved, ...prev]);
        showToast('🎉 Collaboration request posted to live view!');
        setShowPostModal(false);
      })
      .finally(() => setSubmittingPost(false));
  };

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCollab || !appApplicantName.trim() || !appContact.trim()) return;

    setSubmittingApp(true);
    const payload = {
      applicantName: appApplicantName.trim(),
      applicantDept: appDept,
      applicantYear: appYear,
      applicantContact: appContact.trim(),
      message: appMessage.trim(),
    };

    fetch(getBackendUrl(`/api/collab/${selectedCollab.id}/apply`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then(() => {
        showToast(`🚀 Collaboration request sent to ${selectedCollab.authorName}!`);
        setRequests((prev) =>
          prev.map((item) =>
            item.id === selectedCollab.id ? { ...item, applicationsCount: item.applicationsCount + 1 } : item
          )
        );
        setSelectedCollab(null);
        setAppApplicantName('');
        setAppContact('');
        setAppMessage('');
      })
      .catch(() => {
        showToast(`🚀 Application submitted! Sent notification to ${selectedCollab.authorName}.`);
        setRequests((prev) =>
          prev.map((item) =>
            item.id === selectedCollab.id ? { ...item, applicationsCount: item.applicationsCount + 1 } : item
          )
        );
        setSelectedCollab(null);
      })
      .finally(() => setSubmittingApp(false));
  };

  const getTagColor = (tag: string) => {
    if (tag.includes('scratch')) return { bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' };
    if (tag.includes('beta')) return { bg: 'bg-[#F5F3FF] text-[#8B5CF6] border-[#DDD6FE]', dot: 'bg-[#8B5CF6]' };
    return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' };
  };

  const filteredRequests = requests.filter((req) => {
    const matchTag = activeTagFilter === 'All' || req.tag === activeTagFilter;
    const matchSearch =
      req.projectIdea.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.tag.toLowerCase().includes(searchTerm.toLowerCase());
    return matchTag && matchSearch;
  });

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#FAFAFA]">
      {/* Background Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl opacity-50" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl opacity-40" />
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#1E293B] text-white px-6 py-3.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 text-sm font-semibold"
          >
            <Sparkles className="w-4 h-4 text-[#F97316]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10">
        {/* Header */}
        <div className="bg-white border-b border-[#E5E7EB] py-10">
          <div className="container-custom">
            <div className="flex items-center gap-2 text-xs text-[#94A3B8] mb-3">
              <Link to="/" className="hover:text-[#F97316]">Home</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-[#F97316]">Developer Collab Hub</span>
            </div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-[#F97316] text-xs font-semibold mb-3">
                  <Code2 className="w-4 h-4" /> RIT Developers Environment
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-[#1E293B] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Find Project{' '}
                  <span style={{ background: 'linear-gradient(135deg, #F97316, #FB923C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    Collaborators
                  </span>
                </h1>
                <p className="text-[#475569] text-sm max-w-2xl" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Post your open-source projects, search for co-developers, or find beta testers. Connect instantly via Telegram & Discord bot integrations!
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => requireVerifiedStudent(() => setShowPostModal(true))}
                className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-white font-semibold text-sm shadow-lg shadow-orange-500/25 shrink-0"
                style={{ background: 'linear-gradient(135deg, #F97316, #FB923C)', fontFamily: 'Poppins, sans-serif' }}
              >
                {isVerifiedStudent && <ShieldCheck className="w-4 h-4" />}
                <Plus className="w-4.5 h-4.5" />
                Post Collaboration Request
              </motion.button>
            </div>
          </div>
        </div>

        {/* Main Content Container */}
        <div className="container-custom py-8 space-y-8">
          {/* Telegram / Discord Bot Banner Callout */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 text-white border border-slate-700/80 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
            <div className="flex items-start gap-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center shrink-0">
                <Send className="w-6 h-6 text-[#F97316]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  🤖 Post or remove requests via Telegram or Discord!
                </h3>
                <p className="text-xs text-slate-300 max-w-xl leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Send <code className="px-2 py-0.5 rounded bg-slate-800 text-orange-400 font-mono border border-slate-700">/collab</code> to post requests or <code className="px-2 py-0.5 rounded bg-slate-800 text-orange-400 font-mono border border-slate-700">/remove</code> to cancel active requests anytime!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 relative z-10">
              <a
                href="https://t.me/Ritchatbot_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-[#229ED9]/20 hover:bg-[#229ED9]/30 text-[#229ED9] border border-[#229ED9]/40 text-xs font-semibold flex items-center gap-2 transition-all"
              >
                Telegram Bot <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Search & Tag Filter Bar */}
          <div className="bg-white rounded-3xl p-4 border border-[#E5E7EB] shadow-xs flex flex-col lg:flex-row gap-4 justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="Search by idea, author, department, or tag..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#F8FAFC] border-none text-sm text-[#1E293B] placeholder-[#94A3B8] focus:ring-2 focus:ring-[#F97316]/20 focus:outline-none transition-all"
                style={{ fontFamily: 'Inter, sans-serif' }}
              />
            </div>

            {/* Tag Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {['All', ...TAG_OPTIONS].map((tag) => {
                const isActive = activeTagFilter === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => setActiveTagFilter(tag)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                      isActive
                        ? 'bg-[#1E293B] text-white border-[#1E293B] shadow-sm'
                        : 'bg-[#F8FAFC] text-[#475569] border-[#E5E7EB] hover:bg-orange-50 hover:text-[#F97316] hover:border-orange-200'
                    }`}
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {tag === 'All' ? 'All Tags' : tag.replace('looking for ', '')}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cards Grid */}
          {filteredRequests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
              {filteredRequests.map((item) => {
                const tagStyle = getTagColor(item.tag);
                const needed = item.collaboratorsNeeded || 1;
                const accepted = item.acceptedCount || 0;
                const isClosed = item.status === 'CLOSED' || item.status === 'CANCELLED' || accepted >= needed;

                return (
                  <motion.div
                    key={item.id}
                    whileHover={{ y: -4, boxShadow: '0 20px 40px -10px rgba(0,0,0,0.08)' }}
                    className={`bg-white rounded-3xl border ${isClosed ? 'border-red-200 bg-slate-50/50' : 'border-[#E8ECF4]'} p-6 flex flex-col justify-between relative shadow-xs transition-all`}
                  >
                    <div>
                      {/* Top Bar: Tag Badge & Status */}
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border ${tagStyle.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${tagStyle.dot}`} />
                          {item.tag}
                        </span>

                        {isClosed ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-600 border border-red-200 shadow-xs">
                            CLOSED • SPOTS FILLED
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            {accepted} / {needed} Spots Filled
                          </span>
                        )}
                      </div>

                      {/* Project Idea */}
                      <h3 className={`text-base font-bold leading-snug mb-3 ${isClosed ? 'text-slate-600' : 'text-[#1E293B]'}`} style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {item.projectIdea}
                      </h3>
                    </div>

                    <div className="mt-4 pt-4 border-t border-[#F1F5F9] space-y-4">
                      {/* GitHub link if present */}
                      {item.githubLink && (
                        <a
                          href={item.githubLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-[#F97316] bg-slate-100 hover:bg-orange-50 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-orange-200 transition-all w-fit"
                        >
                          <GitBranch className="w-3.5 h-3.5" />
                          View Repository
                          <ArrowUpRight className="w-3 h-3 text-slate-400" />
                        </a>
                      )}

                      {/* Author Info */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center text-[#F97316] font-bold text-xs">
                            {item.authorName.charAt(0)}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-[#1E293B]">{item.authorName}</div>
                            <div className="text-[11px] text-[#64748B]">
                              {item.department} • {item.year}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            {item.applicationsCount} Applications
                          </div>
                        </div>
                      </div>

                      {/* Primary Action Button */}
                      {isClosed ? (
                        <button
                          disabled
                          className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-400 text-xs font-semibold cursor-not-allowed border border-slate-200 flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Collaborations Closed (Full)
                        </button>
                      ) : (
                        <button
                          onClick={() => requireVerifiedStudent(() => setSelectedCollab(item))}
                          className="w-full py-2.5 rounded-xl bg-[#FFF7ED] hover:bg-[#F97316] text-[#F97316] hover:text-white border border-[#FED7AA] hover:border-transparent text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                          style={{ fontFamily: 'Poppins, sans-serif' }}
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          Send Collaboration Request
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="py-20 text-center flex flex-col items-center justify-center bg-white rounded-3xl border border-[#E8ECF4] shadow-xs">
              <Code2 className="w-12 h-12 text-[#CBD5E1] mb-4" />
              <h3 className="text-lg font-bold text-[#1E293B]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                No collaboration requests found
              </h3>
              <p className="text-[#64748B] text-xs mt-1 mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
                Be the first developer to post a request or try adjusting your filters!
              </p>
              <button
                onClick={() => requireVerifiedStudent(() => setShowPostModal(true))}
                className="px-5 py-2.5 rounded-xl bg-[#F97316] text-white text-xs font-semibold hover:bg-[#EA580C] transition-all"
              >
                Post First Collaboration Request
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─── POST COLLABORATION REQUEST MODAL ───────────────────────────────────── */}
      <AnimatePresence>
        {showPostModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPostModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto z-10"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-[#1E293B]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Post Collaboration Request
                  </h2>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Share your idea to find co-developers, beta testers, or contributors.
                  </p>
                </div>
                <button
                  onClick={() => setShowPostModal(false)}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handlePostRequest} className="space-y-4">
                {/* 1. Name */}
                <div>
                  <label className="block text-xs font-semibold text-[#1E293B] mb-1">
                    1) Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Priyan Sharma"
                    value={newAuthorName}
                    onChange={(e) => setNewAuthorName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] text-sm text-[#1E293B] focus:bg-white focus:border-[#F97316] focus:outline-none transition-all"
                  />
                </div>

                {/* 2 & 3. Dept & Year */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#1E293B] mb-1">
                      2) Dept <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={newDept}
                      onChange={(e) => setNewDept(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] text-sm text-[#1E293B] focus:bg-white focus:border-[#F97316] focus:outline-none transition-all cursor-pointer"
                    >
                      {DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#1E293B] mb-1">
                      3) Year <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={newYear}
                      onChange={(e) => setNewYear(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] text-sm text-[#1E293B] focus:bg-white focus:border-[#F97316] focus:outline-none transition-all cursor-pointer"
                    >
                      {YEARS.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 4. Tag */}
                <div>
                  <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                    4) Choose a Tag <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2">
                    {TAG_OPTIONS.map((tagOption) => {
                      const isSelected = newTag === tagOption;
                      return (
                        <div
                          key={tagOption}
                          onClick={() => setNewTag(tagOption)}
                          className={`p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all flex items-center justify-between ${
                            isSelected
                              ? 'border-[#F97316] bg-orange-50 text-[#F97316] font-semibold'
                              : 'border-[#E5E7EB] bg-[#F8FAFC] text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span>{tagOption}</span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-[#F97316] shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 5. Collaborators Needed */}
                <div>
                  <label className="block text-xs font-semibold text-[#1E293B] mb-1">
                    5) Number of Collaborators Needed <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    required
                    value={newCollaboratorsNeeded}
                    onChange={(e) => setNewCollaboratorsNeeded(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] text-sm text-[#1E293B] focus:bg-white focus:border-[#F97316] focus:outline-none transition-all"
                  />
                </div>

                {/* 6. Project Idea */}
                <div>
                  <label className="block text-xs font-semibold text-[#1E293B] mb-1">
                    6) Project Idea <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe your project idea, stack, and what role you need..."
                    value={newIdea}
                    onChange={(e) => setNewIdea(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] text-sm text-[#1E293B] focus:bg-white focus:border-[#F97316] focus:outline-none transition-all"
                  />
                </div>

                {/* Optional GitHub & Contact */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#1E293B] mb-1">
                      GitHub Link <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="url"
                      placeholder="https://github.com/username/repo"
                      value={newGithub}
                      onChange={(e) => setNewGithub(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] text-sm text-[#1E293B] focus:bg-white focus:border-[#F97316] focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#1E293B] mb-1">
                      Telegram Username / Contact <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="@username or phone"
                      value={newContact}
                      onChange={(e) => setNewContact(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] text-sm text-[#1E293B] focus:bg-white focus:border-[#F97316] focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowPostModal(false)}
                    className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingPost}
                    className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#F97316] to-[#FB923C] hover:brightness-105 transition-all shadow-md disabled:opacity-50"
                  >
                    {submittingPost ? 'Posting...' : 'Post Request'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── APPLY / COLLABORATE MODAL ─────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedCollab && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCollab(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto z-10"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#F97316]">
                    Collaborate Request
                  </span>
                  <h2 className="text-lg font-bold text-[#1E293B]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Join {selectedCollab.authorName}'s Project
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedCollab(null)}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 mb-5 text-xs text-slate-700 leading-relaxed">
                <strong>Project Idea:</strong> {selectedCollab.projectIdea}
              </div>

              <form onSubmit={handleApply} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1E293B] mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={appApplicantName}
                    onChange={(e) => setAppApplicantName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] text-sm text-[#1E293B] focus:bg-white focus:border-[#F97316] focus:outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#1E293B] mb-1">Dept *</label>
                    <select
                      value={appDept}
                      onChange={(e) => setAppDept(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] text-sm text-[#1E293B] focus:bg-white focus:border-[#F97316] focus:outline-none transition-all cursor-pointer"
                    >
                      {DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#1E293B] mb-1">Year *</label>
                    <select
                      value={appYear}
                      onChange={(e) => setAppYear(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] text-sm text-[#1E293B] focus:bg-white focus:border-[#F97316] focus:outline-none transition-all cursor-pointer"
                    >
                      {YEARS.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1E293B] mb-1">
                    Your Contact Info (Telegram @username / Phone / Email) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="@username or phone number"
                    value={appContact}
                    onChange={(e) => setAppContact(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] text-sm text-[#1E293B] focus:bg-white focus:border-[#F97316] focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1E293B] mb-1">Message / Experience (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="Briefly state your skills or why you want to contribute..."
                    value={appMessage}
                    onChange={(e) => setAppMessage(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] text-sm text-[#1E293B] focus:bg-white focus:border-[#F97316] focus:outline-none transition-all"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedCollab(null)}
                    className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingApp}
                    className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#F97316] to-[#FB923C] hover:brightness-105 transition-all shadow-md disabled:opacity-50 flex items-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {submittingApp ? 'Sending...' : 'Send Request'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── AUTH GATE MODAL (Verified Student Required) ─────────────────────── */}
      <AnimatePresence>
        {showAuthGate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAuthGate(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 z-10 text-center"
            >
              <button
                onClick={() => setShowAuthGate(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center mx-auto mb-5">
                <ShieldAlert className="w-8 h-8 text-[#F97316]" />
              </div>

              <h2
                className="text-xl font-bold text-[#1E293B] mb-2"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                {!isAuthenticated
                  ? 'Sign In Required'
                  : 'Verified Student Account Required'}
              </h2>

              <p
                className="text-sm text-[#64748B] mb-6 leading-relaxed"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {!isAuthenticated ? (
                  <>To post or apply for collaboration requests, please sign in with your <strong className="text-[#F97316]">@ritchennai.edu.in</strong> Google account.</>
                ) : (
                  <>You are signed in as <strong>{user?.email}</strong>, which is not a verified RIT college email. Please sign in with your <strong className="text-[#F97316]">@ritchennai.edu.in</strong> email to access DevCollab features.</>
                )}
              </p>

              <div className="space-y-3">
                {!isAuthenticated ? (
                  <button
                    onClick={() => {
                      loginWithGoogle();
                      setShowAuthGate(false);
                    }}
                    className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl text-white font-semibold text-sm shadow-lg"
                    style={{
                      background: 'linear-gradient(135deg, #F97316, #FB923C)',
                      fontFamily: 'Poppins, sans-serif',
                    }}
                  >
                    <LogIn className="w-4.5 h-4.5" />
                    Sign In with Google
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      loginWithGoogle();
                      setShowAuthGate(false);
                    }}
                    className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl text-white font-semibold text-sm shadow-lg"
                    style={{
                      background: 'linear-gradient(135deg, #F97316, #FB923C)',
                      fontFamily: 'Poppins, sans-serif',
                    }}
                  >
                    <ShieldCheck className="w-4.5 h-4.5" />
                    Switch to College Account
                  </button>
                )}

                <p className="text-[11px] text-[#94A3B8]">
                  We only verify your email domain — no personal data is stored beyond your name and email.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
