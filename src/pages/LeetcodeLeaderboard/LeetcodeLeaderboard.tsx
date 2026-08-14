import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Search, Plus, RefreshCw, ExternalLink, Code2,
  Sparkles, Flame, Award, CheckCircle2, Shield, User, Filter, X, Clock
} from 'lucide-react';
import { getBackendUrl } from '@/lib/utils';

interface LeetcodeProfile {
  id: number;
  studentName: String;
  leetcodeUsername: string;
  department: string;
  year: string;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  ranking: number;
  reputation: number;
  lastUpdated: string;
}

const DEPARTMENTS = ['All', 'CSE', 'IT', 'AI&DS', 'ECE', 'EEE', 'MECH', 'CIVIL', 'CSBS'];
const YEARS = ['All', '1st Year', '2nd Year', '3rd Year', '4th Year'];

export default function LeetcodeLeaderboard() {
  const [profiles, setProfiles] = useState<LeetcodeProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [studentName, setStudentName] = useState('');
  const [leetcodeUsername, setLeetcodeUsername] = useState('');
  const [department, setDepartment] = useState('CSE');
  const [year, setYear] = useState('1st Year');

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await fetch(getBackendUrl('/api/leetcode/leaderboard'));
      if (res.ok) {
        const data = await res.json();
        setProfiles(data);
      }
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !leetcodeUsername.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(getBackendUrl('/api/leetcode/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName,
          leetcodeUsername,
          department,
          year
        }),
      });

      if (res.ok) {
        setToastMessage('✅ Profile added successfully! Fetched latest LeetCode stats.');
        setShowModal(false);
        setStudentName('');
        setLeetcodeUsername('');
        fetchLeaderboard();
      } else {
        const errData = await res.json();
        setToastMessage(`❌ ${errData.error || 'Failed to add profile'}`);
      }
    } catch (err) {
      setToastMessage('❌ Error connecting to server');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const handleTriggerSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch(getBackendUrl('/api/leetcode/sync'), {
        method: 'POST'
      });
      if (res.ok) {
        setToastMessage('⚡ 24h background sync started! Requests are spaced out by 3s to prevent rate limits.');
      }
    } catch (err) {
      setToastMessage('❌ Failed to trigger sync');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setToastMessage(null), 5000);
    }
  };

  const filteredProfiles = profiles.filter((p) => {
    const matchesSearch =
      p.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.leetcodeUsername.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === 'All' || p.department === selectedDept;
    const matchesYear = selectedYear === 'All' || p.year === selectedYear;
    return matchesSearch && matchesDept && matchesYear;
  });

  const totalCampusSolved = profiles.reduce((acc, curr) => acc + (curr.totalSolved || 0), 0);
  const topProfile = profiles.length > 0 ? profiles[0] : null;

  return (
    <div className="min-h-screen pt-24 pb-16 bg-[#FAF9FC] text-[#1A0B2E] px-4 sm:px-6 lg:px-8">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 px-5 py-3 rounded-xl bg-white border border-[#E9E5EE] backdrop-blur-md text-[#1A0B2E] font-bold shadow-2xl flex items-center gap-2"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Banner Header */}
        <div className="relative overflow-hidden rounded-2xl bg-white border border-[#E9E5EE] p-8 shadow-[0_4px_20px_-4px_rgba(19,9,36,0.04)]">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-[#FF6B00] text-xs font-bold uppercase tracking-wider mb-4">
                <Flame className="w-4 h-4 text-[#FF6B00] animate-pulse" />
                RIT LeetCode Arena
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#1A0B2E]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Campus <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF6B00] to-[#F97316]">LeetCode Leaderboard</span>
              </h1>
              <p className="mt-2 text-[#4A3E5E] max-w-2xl text-sm sm:text-base font-medium">
                Track top problem solvers across departments. Automatically updated every 24 hours with rate-limited, spaced background sync.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#F97316] hover:from-[#EA580C] hover:to-[#FF6B00] text-white font-bold text-sm shadow-lg shadow-orange-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              >
                <Plus className="w-5 h-5 stroke-[2.5]" />
                Register Handle
              </button>
              <button
                onClick={handleTriggerSync}
                disabled={isSyncing}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#FAF9FC] hover:bg-purple-50/50 text-[#1A0B2E] border border-[#E9E5EE] font-semibold text-sm transition-all cursor-pointer"
                style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-[#FF6B00]' : ''}`} />
                24h Spaced Sync
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-[#E5E7EB]">
            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-[#F97316]" /> #1 Top Solver
              </span>
              <p className="text-lg font-bold text-[#1E293B] mt-1 truncate">
                {topProfile ? `${topProfile.studentName}` : 'N/A'}
              </p>
              <p className="text-xs text-[#F97316] font-medium">
                {topProfile ? `${topProfile.totalSolved} Problems Solved` : ''}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-emerald-500" /> Total Campus Solved
              </span>
              <p className="text-xl font-bold text-[#1E293B] mt-1">
                {totalCampusSolved.toLocaleString()}
              </p>
              <p className="text-xs text-slate-400">Problems across all coders</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <User className="w-4 h-4 text-indigo-500" /> Active Coders
              </span>
              <p className="text-xl font-bold text-[#1E293B] mt-1">
                {profiles.length}
              </p>
              <p className="text-xs text-slate-400">Registered RIT coders</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-500" /> Sync Frequency
              </span>
              <p className="text-base font-bold text-[#1E293B] mt-1">
                Every 24 Hours
              </p>
              <p className="text-[11px] text-[#F97316] font-mono">3s spaced rate-limiting</p>
            </div>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white border border-[#E5E7EB] p-4 rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)]">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student name or handle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-sm text-[#1E293B] placeholder-slate-400 focus:outline-none focus:border-[#F97316] transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-[#F97316]"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    Dept: {d}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-[#F97316]"
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  Year: {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_4px_25px_-4px_rgba(0,0,0,0.05)]">
          {loading ? (
            <div className="p-16 text-center text-slate-400 flex flex-col items-center gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-[#F97316]" />
              <p className="text-sm font-medium">Fetching LeetCode rankings...</p>
            </div>
          ) : filteredProfiles.length === 0 ? (
            <div className="p-16 text-center text-slate-400 space-y-3">
              <Trophy className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-base font-semibold text-slate-800">No coders found</p>
              <p className="text-xs text-slate-500">Be the first to register your LeetCode handle!</p>
              <button
                onClick={() => setShowModal(true)}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#F97316] to-[#FB923C] text-white font-bold text-xs shadow-md shadow-[#F97316]/10 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Register Profile
              </button>
            </div>
          ) : (
            <>
              {/* Mobile Card View (Small Screens) */}
              <div className="block md:hidden divide-y divide-[#E5E7EB]">
                {filteredProfiles.map((p, index) => {
                  const rank = index + 1;
                  const total = p.totalSolved || 1;
                  const easyPct = Math.round(((p.easySolved || 0) / total) * 100);
                  const medPct = Math.round(((p.mediumSolved || 0) / total) * 100);
                  const hardPct = Math.round(((p.hardSolved || 0) / total) * 100);

                  return (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="p-4 space-y-3 bg-white"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {rank === 1 ? (
                            <span className="text-2xl" title="Rank 1 Gold">🥇</span>
                          ) : rank === 2 ? (
                            <span className="text-2xl" title="Rank 2 Silver">🥈</span>
                          ) : rank === 3 ? (
                            <span className="text-2xl" title="Rank 3 Bronze">🥉</span>
                          ) : (
                            <span className="text-xs font-mono font-extrabold px-2 py-1 rounded bg-[#F1F5F9] text-slate-500">
                              #{rank}
                            </span>
                          )}

                          <div>
                            <p className="font-bold text-[#1E293B] text-base leading-tight">{p.studentName}</p>
                            <p className="text-xs text-slate-400 font-mono">@{p.leetcodeUsername}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-xl font-black text-[#F97316] font-mono leading-none">{p.totalSolved}</p>
                          <p className="text-[10px] text-slate-400 font-medium">Solved</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-[#F1F5F9] border border-[#E2E8F0] text-[11px] font-medium text-slate-600">
                            {p.department}
                          </span>
                          <span className="text-[11px] text-slate-400">{p.year}</span>
                        </div>

                        <a
                          href={`https://leetcode.com/u/${p.leetcodeUsername}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-[#F97316] hover:underline font-semibold"
                        >
                          LeetCode Profile <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1 pt-1">
                        <div className="flex justify-between text-[10px] font-mono text-slate-500">
                          <span className="text-emerald-600">Easy: {p.easySolved}</span>
                          <span className="text-amber-500">Med: {p.mediumSolved}</span>
                          <span className="text-rose-500">Hard: {p.hardSolved}</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[#E2E8F0] overflow-hidden flex">
                          <div style={{ width: `${easyPct}%` }} className="bg-emerald-500 h-full" />
                          <div style={{ width: `${medPct}%` }} className="bg-amber-500 h-full" />
                          <div style={{ width: `${hardPct}%` }} className="bg-rose-500 h-full" />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Desktop Table View (Medium Screens & Up) */}
              <div className="hidden md:block overflow-x-auto rounded-2xl border border-[#E9E5EE] shadow-[0_4px_20px_-4px_rgba(19,9,36,0.04)] bg-white">
                <table className="w-full text-left text-[#4A3E5E] border-collapse">
                  <thead>
                    <tr className="border-b border-[#3A1968] bg-[#130924] text-[11px] font-extrabold uppercase tracking-wider text-white">
                      <th className="py-4 px-6 text-center w-16">Rank</th>
                      <th className="py-4 px-6">Student</th>
                      <th className="py-4 px-6">Dept & Year</th>
                      <th className="py-4 px-6 text-center">Total Solved</th>
                      <th className="py-4 px-6 min-w-[200px]">Problems Breakdown</th>
                      <th className="py-4 px-6 text-right">LeetCode Rank</th>
                      <th className="py-4 px-6 text-center w-24">Profile</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB] text-sm">
                    {filteredProfiles.map((p, index) => {
                      const rank = index + 1;
                      const total = p.totalSolved || 1;
                      const easyPct = Math.round(((p.easySolved || 0) / total) * 100);
                      const medPct = Math.round(((p.mediumSolved || 0) / total) * 100);
                      const hardPct = Math.round(((p.hardSolved || 0) / total) * 100);

                      return (
                        <motion.tr
                          key={p.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="hover:bg-[#FFF7ED]/50 transition-colors group"
                        >
                          {/* Rank */}
                          <td className="py-4 px-6 text-center font-extrabold">
                            {rank === 1 ? (
                              <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center justify-center mx-auto text-base shadow-sm">
                                🥇
                              </div>
                            ) : rank === 2 ? (
                              <div className="w-8 h-8 rounded-full bg-slate-300/10 text-slate-600 border border-slate-300/20 flex items-center justify-center mx-auto text-base">
                                🥈
                              </div>
                            ) : rank === 3 ? (
                              <div className="w-8 h-8 rounded-full bg-amber-700/10 text-amber-700 border border-amber-700/20 flex items-center justify-center mx-auto text-base">
                                🥉
                              </div>
                            ) : (
                              <span className="text-slate-400 font-mono">#{rank}</span>
                            )}
                          </td>

                          {/* Student Info */}
                          <td className="py-4 px-6">
                            <div>
                              <p className="font-bold text-[#1E293B] group-hover:text-[#F97316] transition-colors">
                                {p.studentName}
                              </p>
                              <p className="text-xs text-slate-400 font-mono">
                                @{p.leetcodeUsername}
                              </p>
                            </div>
                          </td>

                          {/* Dept & Year */}
                          <td className="py-4 px-6 text-xs text-slate-500">
                            <span className="px-2.5 py-1 rounded-md bg-[#F1F5F9] border border-[#E2E8F0] text-slate-600 font-medium mr-1.5">
                              {p.department}
                            </span>
                            <span className="text-slate-400">{p.year}</span>
                          </td>

                          {/* Total Solved */}
                          <td className="py-4 px-6 text-center">
                            <span className="text-lg font-black text-[#F97316] font-mono">
                              {p.totalSolved}
                            </span>
                          </td>

                          {/* Problem Breakdown Bars */}
                          <td className="py-4 px-6">
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                                <span className="text-emerald-600">Easy: {p.easySolved}</span>
                                <span className="text-amber-500">Med: {p.mediumSolved}</span>
                                <span className="text-rose-500">Hard: {p.hardSolved}</span>
                              </div>
                              <div className="w-full h-2 rounded-full bg-[#E2E8F0] overflow-hidden flex">
                                <div
                                  style={{ width: `${easyPct}%` }}
                                  className="bg-emerald-500 h-full"
                                  title={`Easy: ${p.easySolved}`}
                                />
                                <div
                                  style={{ width: `${medPct}%` }}
                                  className="bg-amber-500 h-full"
                                  title={`Medium: ${p.mediumSolved}`}
                                />
                                <div
                                  style={{ width: `${hardPct}%` }}
                                  className="bg-rose-500 h-full"
                                  title={`Hard: ${p.hardSolved}`}
                                />
                              </div>
                            </div>
                          </td>

                          {/* LeetCode Global Rank */}
                          <td className="py-4 px-6 text-right font-mono text-xs">
                            {p.ranking > 0 ? (
                              <span className="text-[#1E293B] font-medium">
                                #{p.ranking.toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>

                          {/* Profile Link */}
                          <td className="py-4 px-6 text-center">
                            <a
                              href={`https://leetcode.com/u/${p.leetcodeUsername}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#F8FAFC] hover:bg-[#FFF7ED] text-slate-500 hover:text-[#F97316] border border-[#E2E8F0] transition-colors"
                              title="View on LeetCode"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Registration Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white border border-[#E5E7EB] rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#F97316]">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1E293B]">Register LeetCode Handle</h3>
                  <p className="text-xs text-slate-400">Join the RIT campus coding rankings</p>
                </div>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shanmuga Sundaram"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-sm text-[#1E293B] focus:outline-none focus:border-[#F97316]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    LeetCode Username (Exact)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. neal_wu"
                    value={leetcodeUsername}
                    onChange={(e) => setLeetcodeUsername(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-sm text-[#1E293B] focus:outline-none focus:border-[#F97316]"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">We will immediately fetch your problem stats from LeetCode.</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Department
                    </label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-sm text-[#1E293B] focus:outline-none focus:border-[#F97316]"
                    >
                      {DEPARTMENTS.filter(d => d !== 'All').map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Year
                    </label>
                    <select
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-sm text-[#1E293B] focus:outline-none focus:border-[#F97316]"
                    >
                      {YEARS.filter(y => y !== 'All').map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-[#F1F5F9] text-slate-600 text-xs font-semibold hover:bg-[#E2E8F0] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#F97316] to-[#FB923C] hover:from-[#EA580C] hover:to-[#F97316] text-white text-xs font-bold transition-all shadow-md shadow-orange-500/10 cursor-pointer"
                  >
                    {isSubmitting ? 'Fetching Stats...' : 'Register Profile'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
