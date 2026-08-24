import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, Clock, MapPin, Users,
  Calendar, Building, ShieldCheck, 
  Sparkles, KeyRound, ArrowRight, LogOut,
  AlertCircle, User, HelpCircle, Compass, ChevronRight, ExternalLink,
  Award, CheckCircle2, AlertTriangle, FileText, Calculator, TrendingUp,
  Layers, BookOpen, Check, Mail, Phone, RefreshCw, Edit2, Save, FlaskConical,
  Star, Search, Filter, Grid, List, X, Copy, CheckCheck, Printer, Info
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { FACULTY_DATA } from '@/constants';
import { 
  getStoredImsSession,
  clearImsSession,
  saveImsSession,
  updateImsProfileName,
  loginWithIms,
  fetchImsProfile,
  fetchImsTimetable,
  fetchImsAttendance,
  fetchImsCatMarks,
  fetchImsAssignmentMarks,
  fetchImsLabMarks,
  fetchImsSemesterResults,
  type StudentProfile,
  type WeeklySchedule,
  type AttendanceReport,
  type CatMarksReport,
  type AssignmentMarkItem,
  type LabMarkItem,
  type SemesterResult
} from '@/services/imsService';

export default function StudentDashboard() {
  const { user, openAuthModal, logout } = useAuth();
  const [session, setSession] = useState<{ token: string; profile: StudentProfile } | null>(getStoredImsSession());

  // Navigation State
  const [activeTab, setActiveTab] = useState<'timetable' | 'attendance' | 'marks' | 'grades' | 'faculties'>('timetable');
  const [selectedDay, setSelectedDay] = useState<'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday'>('monday');
  const [selectedSemFilter, setSelectedSemFilter] = useState<number>(0);
  const [marksSubTab, setMarksSubTab] = useState<'cat' | 'assignment' | 'lab'>('cat');

  // Timetable Customization States (Matching Reference Agenda Layout)
  const [ttViewMode, setTtViewMode] = useState<'grid' | 'daily'>('grid');
  const [ttFilterType, setTtFilterType] = useState<'ALL' | 'LAB' | 'THEORY' | 'ELECTIVE' | 'FREE'>('ALL');
  const [ttSearchQuery, setTtSearchQuery] = useState('');
  const [copiedReg, setCopiedReg] = useState(false);
  const [starredPeriods, setStarredPeriods] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('rit_starred_periods');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [currentTimeMinutes, setCurrentTimeMinutes] = useState<number>(() => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTimeMinutes(now.getHours() * 60 + now.getMinutes());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const toggleStarPeriod = (key: string) => {
    setStarredPeriods(prev => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem('rit_starred_periods', JSON.stringify(next));
      } catch (err) {
        console.warn('Failed to save starred period:', err);
      }
      return next;
    });
  };

  // Agenda Timetable Helpers & Indicators
  const dayNamesMap: Record<number, 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday'> = {
    1: 'monday', 2: 'tuesday', 3: 'wednesday', 4: 'thursday', 5: 'friday'
  };
  const todayKey = dayNamesMap[new Date().getDay()] || null;

  const periodTimeRanges: Record<number, { start: number; end: number; timeLabel: string }> = {
    1: { start: 525, end: 580, timeLabel: '08:45 AM - 09:40 AM' },
    2: { start: 580, end: 635, timeLabel: '09:40 AM - 10:35 AM' },
    3: { start: 650, end: 705, timeLabel: '10:50 AM - 11:45 AM' },
    4: { start: 705, end: 760, timeLabel: '11:45 AM - 12:40 PM' },
    5: { start: 810, end: 865, timeLabel: '01:30 PM - 02:25 PM' },
    6: { start: 865, end: 920, timeLabel: '02:25 PM - 03:20 PM' },
    7: { start: 920, end: 975, timeLabel: '03:20 PM - 04:15 PM' },
  };

  const isPeriodLive = (dayKey: string, pNum: number) => {
    if (!todayKey || todayKey !== dayKey) return false;
    const r = periodTimeRanges[pNum];
    if (!r) return false;
    return currentTimeMinutes >= r.start && currentTimeMinutes < r.end;
  };

  const matchesFilter = (period: any) => {
    if (!period) return false;
    const query = ttSearchQuery.toLowerCase().trim();
    if (query) {
      const matchSub = (period.subjectName || '').toLowerCase().includes(query);
      const matchCode = (period.subjectCode || '').toLowerCase().includes(query);
      const matchStaff = (period.staffName || '').toLowerCase().includes(query);
      if (!matchSub && !matchCode && !matchStaff) return false;
    }

    if (ttFilterType === 'LAB') return period.type === 'LAB';
    if (ttFilterType === 'THEORY') return period.type === 'THEORY' && period.subjectCode !== 'FREE';
    if (ttFilterType === 'ELECTIVE') return (period.subjectCode || '').includes('V1') || (period.subjectName || '').toLowerCase().includes('elective');
    if (ttFilterType === 'FREE') return period.subjectCode === 'FREE';

    return true;
  };

  // Loaded Data States
  const [profile, setProfile] = useState<StudentProfile | null>(session?.profile || null);
  const [timetable, setTimetable] = useState<WeeklySchedule | null>(null);
  const [attendance, setAttendance] = useState<AttendanceReport | null>(null);
  const [catMarks, setCatMarks] = useState<CatMarksReport | null>(null);
  const [assignmentMarks, setAssignmentMarks] = useState<AssignmentMarkItem[] | null>(null);
  const [labMarks, setLabMarks] = useState<LabMarkItem[] | null>(null);
  const [gradesData, setGradesData] = useState<{ results: SemesterResult[]; cgpa: number; totalCredits: number; activeArrears: number } | null>(null);

  // Loading States
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [isTabLoading, setIsTabLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inline Name Editor State
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');

  // Initial Load: Profile and Timetable only
  useEffect(() => {
    if (session?.token) {
      loadInitialData(session.token);
    }
  }, [session?.token]);

  // Set default day to today (Mon-Fri)
  useEffect(() => {
    const dayNames: (keyof WeeklySchedule)[] = ['monday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'friday'];
    const today = dayNames[new Date().getDay()] || 'monday';
    setSelectedDay(today);
  }, []);

  const loadInitialData = async (token: string, force = false) => {
    setIsInitialLoading(true);
    setError(null);
    try {
      const reg = session?.profile?.registerNumber || '2117240070293';
      const p = await fetchImsProfile(token, reg, force);
      setProfile(p);
      const tt = await fetchImsTimetable(token, p.registerNumber, force);
      setTimetable(tt);

      const dayNames: (keyof WeeklySchedule)[] = ['monday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'friday'];
      const today = dayNames[new Date().getDay()] || 'monday';
      if (tt && tt[today] && tt[today].length > 0) {
        setSelectedDay(today);
      } else if (tt) {
        const firstActive = (['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const).find(
          d => tt[d] && tt[d].length > 0
        );
        if (firstActive) setSelectedDay(firstActive);
      }

      // Auto-load Attendance, Internal Marks, and Grades for immediate Overview KPI display
      const [attData, catData, assignData, labData, gData] = await Promise.all([
        fetchImsAttendance(token, p.registerNumber, force),
        fetchImsCatMarks(token, p.registerNumber, force),
        fetchImsAssignmentMarks(p.departmentCode || p.department, p.semester),
        fetchImsLabMarks(p.departmentCode || p.department, p.semester),
        fetchImsSemesterResults(token, p.registerNumber, p.semester, force)
      ]);
      setAttendance(attData);
      setCatMarks(catData);
      setAssignmentMarks(assignData);
      setLabMarks(labData);
      setGradesData(gData);
    } catch (err: any) {
      console.error('Error loading initial IMS data:', err);
      setError(err.message || 'Failed to load timetable.');
    } finally {
      setIsInitialLoading(false);
    }
  };

  // ─── Lazy On-Demand Fetchers ────────────────────────────────────────

  const ensureAttendanceLoaded = async (force = false) => {
    if ((attendance && attendance.subjects.length > 0 && !force) || !profile) return;
    setIsTabLoading(true);
    try {
      const data = await fetchImsAttendance(session?.token || '', profile.registerNumber, force);
      setAttendance(data);
    } catch (err) {
      console.warn('Attendance load notice:', err);
    } finally {
      setIsTabLoading(false);
    }
  };

  const ensureCatMarksLoaded = async (force = false) => {
    if ((catMarks && catMarks.subjects.length > 0 && assignmentMarks && labMarks && !force) || !profile) return;
    setIsTabLoading(true);
    try {
      const [cat, assign, lab] = await Promise.all([
        fetchImsCatMarks(session?.token || '', profile.registerNumber, force),
        fetchImsAssignmentMarks(profile.departmentCode || profile.department, profile.semester),
        fetchImsLabMarks(profile.departmentCode || profile.department, profile.semester),
      ]);
      setCatMarks(cat);
      setAssignmentMarks(assign);
      setLabMarks(lab);
    } catch (err) {
      console.warn('Marks load notice:', err);
    } finally {
      setIsTabLoading(false);
    }
  };

  const ensureGradesLoaded = async (force = false) => {
    if ((gradesData && gradesData.results.length > 0 && !force) || !profile) return;
    setIsTabLoading(true);
    try {
      const data = await fetchImsSemesterResults(session?.token || '', profile.registerNumber, profile.semester, force);
      setGradesData(data);
    } catch (err) {
      console.warn('Grades load notice:', err);
    } finally {
      setIsTabLoading(false);
    }
  };

  // Trigger lazy load on tab switch
  useEffect(() => {
    if (activeTab === 'attendance') {
      ensureAttendanceLoaded();
    } else if (activeTab === 'marks') {
      ensureCatMarksLoaded();
    } else if (activeTab === 'grades') {
      ensureGradesLoaded();
    }
  }, [activeTab, session?.token, profile]);

  const handleLogout = () => {
    clearImsSession();
    setSession(null);
    setProfile(null);
    setTimetable(null);
    setAttendance(null);
    setCatMarks(null);
    setGradesData(null);
    logout();
  };

  const handleSaveName = () => {
    if (!nameInput.trim()) return;
    const updated = updateImsProfileName(nameInput.trim());
    if (updated) {
      setProfile(updated);
      if (session) {
        setSession({ ...session, profile: updated });
      }
    }
    setIsEditingName(false);
  };

  const handleForceRefresh = () => {
    if (!session?.token) return;
    loadInitialData(session.token, true);
    if (activeTab === 'attendance') ensureAttendanceLoaded(true);
    if (activeTab === 'marks') ensureCatMarksLoaded(true);
    if (activeTab === 'grades') ensureGradesLoaded(true);
  };

  const handleCopyRegisterNumber = () => {
    if (profile?.registerNumber) {
      navigator.clipboard.writeText(profile.registerNumber);
      setCopiedReg(true);
      setTimeout(() => setCopiedReg(false), 2000);
    }
  };

  // Dynamically compute handling faculties for the logged-in student
  const dynamicFaculties = useMemo(() => {
    const staffMap = new Map<string, { name: string; code: string; subjects: Set<string> }>();

    // 1. Extract staff from live Timetable
    if (timetable) {
      Object.values(timetable).forEach(dayPeriods => {
        if (Array.isArray(dayPeriods)) {
          dayPeriods.forEach(p => {
            if (!p.staffName) return;
            const staffTokens = p.staffName.split(', ');
            staffTokens.forEach((token: string) => {
              const match = token.match(/^(.*?)\s*\(([^)]+)\)$/);
              let sName = token.trim();
              let sCode = '';
              if (match) {
                sName = match[1].trim();
                sCode = match[2].trim();
              }
              if (!sName || sName.toLowerCase().includes('in-charge') || sName.toLowerCase() === 'faculty') return;
              const key = sCode || sName.toLowerCase();
              if (!staffMap.has(key)) {
                staffMap.set(key, { name: sName, code: sCode || 'STAFF', subjects: new Set() });
              }
              if (p.subjectName) {
                staffMap.get(key)!.subjects.add(`${p.subjectName} ${p.subjectCode ? `(${p.subjectCode})` : ''}`);
              }
            });
          });
        }
      });
    }

    // 2. Extract staff from live CAT Marks
    if (catMarks?.subjects) {
      catMarks.subjects.forEach(c => {
        if (!c.faculty) return;
        const match = c.faculty.match(/^(.*?)\s*\(([^)]+)\)$/);
        let sName = c.faculty.trim();
        let sCode = '';
        if (match) {
          sName = match[1].trim();
          sCode = match[2].trim();
        }
        if (!sName || sName.toLowerCase().includes('in-charge')) return;
        const key = sCode || sName.toLowerCase();
        if (!staffMap.has(key)) {
          staffMap.set(key, { name: sName, code: sCode || 'STAFF', subjects: new Set() });
        }
        if (c.name) {
          staffMap.get(key)!.subjects.add(`${c.name} ${c.code ? `(${c.code})` : ''}`);
        }
      });
    }

    // Convert map to array and match against FACULTY_DATA
    const list = Array.from(staffMap.values()).map(fac => {
      const firstWord = fac.name.replace(/^DR\.\s*/i, '').trim().split(' ')[0].toLowerCase();
      const matched = FACULTY_DATA.find(f => 
        f.name.toLowerCase().includes(firstWord) || 
        (fac.code && fac.code.length > 2 && f.email && f.email.toLowerCase().includes(fac.code.toLowerCase()))
      );

      return {
        name: matched?.name || fac.name,
        code: fac.code,
        dept: matched?.department || profile?.department || 'Department Staff',
        role: matched?.designation || 'Handling Faculty In-Charge',
        subjects: Array.from(fac.subjects),
        fallbackEmail: matched?.email || `${fac.name.toLowerCase().replace(/[^a-z]/g, '')}@ritchennai.edu.in`,
        matched,
      };
    });

    if (list.length > 0) return list;

    // Fallback: search FACULTY_DATA for profile department
    const userDept = (profile?.department || '').toLowerCase();
    const deptFacs = FACULTY_DATA.filter(f => userDept && f.department.toLowerCase().includes(userDept.slice(0, 5)));
    const targetFacs = deptFacs.length > 0 ? deptFacs.slice(0, 6) : FACULTY_DATA.slice(0, 6);

    return targetFacs.map(f => ({
      name: f.name,
      code: f.id.toUpperCase(),
      dept: f.department,
      role: f.designation,
      subjects: [f.specialization || 'Academic Course Instructor'],
      fallbackEmail: f.email,
      matched: f,
    }));
  }, [timetable, catMarks, profile]);

  // Sync session with global auth state
  useEffect(() => {
    const activeIms = getStoredImsSession();
    if (activeIms?.token) {
      setSession(activeIms);
    } else {
      setSession(null);
    }
  }, [user]);

  // ─────────────────────────────────────────────────────────────
  // VIEW 1: UNAUTHENTICATED INVITATION SCREEN (PRO GRADE)
  // ─────────────────────────────────────────────────────────────
  if (!session || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50/50">
        {/* Top Breadcrumb Header */}
        <div className="border-b border-slate-200/80 bg-white/70 backdrop-blur-xl py-8">
          <div className="container-custom">
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2">
                <Link to="/" className="hover:text-orange-600 transition-colors">Home</Link>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-orange-600 font-bold">Student Dashboard</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                RIT Student{' '}
                <span className="bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 bg-clip-text text-transparent">
                  Portal & IMS Suite
                </span>
              </h1>
              <p className="text-sm text-slate-600 mt-1 max-w-2xl">
                Access your real-time 7-period timetable, course faculty, live attendance breakdown, CAT scores, and Anna University CGPA calculator.
              </p>
            </motion.div>
          </div>
        </div>

        <div className="container-custom py-16 flex flex-col items-center justify-center text-center pb-32">
          <motion.div 
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-xl bg-white/80 backdrop-blur-2xl border border-slate-200/90 rounded-3xl p-8 sm:p-12 shadow-2xl shadow-slate-200/50 space-y-8 relative overflow-hidden"
          >
            {/* Ambient Background Glow */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br from-orange-400/20 to-amber-300/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-gradient-to-tr from-orange-500/15 to-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-xl shadow-orange-500/30 mx-auto text-white">
                <GraduationCap className="w-10 h-10" />
              </div>
              <span className="absolute bottom-0 right-1/2 translate-x-7 translate-y-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-xs" />
            </div>

            <div className="space-y-3 relative">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Sign In with College Credentials
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                Securely authenticate using your RIT Register Number and IMS Portal Password to load your official academic records.
              </p>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-2 gap-3 text-left pt-2">
              <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">7-Period Timetable</h4>
                  <p className="text-[11px] text-slate-500">Live active period indicators</p>
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Live Attendance</h4>
                  <p className="text-[11px] text-slate-500">Real-time hour metrics & buffer</p>
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-start gap-2.5">
                <FileText className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">CAT & Lab Scores</h4>
                  <p className="text-[11px] text-slate-500">Official internal assessments</p>
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-start gap-2.5">
                <Award className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">GPA & CGPA Engine</h4>
                  <p className="text-[11px] text-slate-500">AU 2021 Regulation credits</p>
                </div>
              </div>
            </div>

            <button
              onClick={openAuthModal}
              className="w-full py-4 px-6 rounded-2xl text-white font-bold text-sm bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 hover:from-orange-700 hover:to-amber-600 shadow-xl shadow-orange-500/25 transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.99]"
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              <span>Launch Student Dashboard</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // VIEW 2: AUTHENTICATED STUDENT DASHBOARD (EXECUTIVE GRADE)
  // ─────────────────────────────────────────────────────────────
  const rawName = profile?.name;
  const displayName = (rawName && rawName.trim() && rawName.trim() !== 'Student' && !rawName.toLowerCase().startsWith('student ('))
    ? rawName 
    : (user?.name || `Student (${profile?.registerNumber || 'RIT'})`);

  const filteredGrades = gradesData?.results ? (
    selectedSemFilter === 0
      ? gradesData.results
      : gradesData.results.filter(r => r.semester === selectedSemFilter)
  ) : [];

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900">
      {/* ─── EXECUTIVE PROFILE HEADER BAR ─── */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/80 sticky top-0 z-30 transition-all">
        <div className="container-custom py-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Student Identity Section */}
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <img
                  src={profile?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(displayName)}`}
                  alt={displayName}
                  className="w-16 h-16 rounded-2xl bg-orange-50/80 border-2 border-orange-200/80 object-cover shadow-sm"
                />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white ring-2 ring-emerald-500/20" title="IMS Session Active" />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  {isEditingName ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        placeholder="Enter your name"
                        className="bg-slate-50 border-2 border-orange-500 rounded-xl px-3 py-1 text-sm font-bold text-slate-900 outline-none shadow-xs"
                        autoFocus
                      />
                      <button
                        onClick={handleSaveName}
                        className="p-2 rounded-xl bg-orange-600 text-white hover:bg-orange-700 transition-colors cursor-pointer shadow-sm"
                        title="Save name"
                      >
                        <Save className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                        {displayName}
                      </h1>
                      <button
                        onClick={() => {
                          setNameInput(displayName);
                          setIsEditingName(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-colors cursor-pointer"
                        title="Edit Display Name"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Register Number Badge with Click-to-Copy */}
                  <button
                    onClick={handleCopyRegisterNumber}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100/60 transition-colors cursor-pointer"
                    title="Click to copy Register Number"
                  >
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>{profile?.registerNumber}</span>
                    {copiedReg ? <CheckCheck className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-emerald-500 opacity-60" />}
                  </button>
                </div>

                {/* Metadata Pills */}
                <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-600">
                  <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 border border-slate-200/80 font-bold text-slate-800">
                    {profile?.department || 'AI & DS'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 border border-slate-200/80 font-semibold text-slate-700">
                    Year {profile?.year || '1'}, Sem {profile?.semester || '2'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 border border-slate-200/80 text-slate-600">
                    Batch: <strong className="text-slate-800 font-bold">{profile?.batch || '2024-2028'}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex items-center gap-2.5 self-start lg:self-auto flex-wrap">
              <button
                onClick={handleForceRefresh}
                disabled={isInitialLoading || isTabLoading}
                title="Fetch latest updates from RIT IMS"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs font-bold border border-slate-200/80 transition-all cursor-pointer shadow-2xs active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isInitialLoading || isTabLoading ? 'animate-spin text-orange-600' : 'text-slate-500'}`} />
                <span>Sync IMS</span>
              </button>

              <Link
                to="/toolkit?toolkit=gpa"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-all cursor-pointer active:scale-95"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>GPA Calculator</span>
              </Link>

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200/80 hover:border-rose-200 text-xs font-semibold transition-all cursor-pointer active:scale-95 shadow-2xs"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      <div className="container-custom py-8 pb-32 space-y-8">
        
        {/* ─── ACADEMIC OVERVIEW & ANALYTICS DASHBOARD ─── */}
        {(() => {
          const activeArrearsCount = gradesData?.activeArrears ?? 0;
          const cumulativeCgpa = gradesData?.cgpa ?? 0;
          const overallAttendancePct = attendance?.overallPercentage ?? 0;

          // Attendance margin calculation: >= 75% safe margin
          const totalPresent = attendance?.totalPresent ?? 0;
          const totalConducted = attendance?.totalConducted ?? 0;
          const safeMarginClasses = totalConducted > 0 
            ? Math.floor((totalPresent - 0.75 * totalConducted) / 0.75)
            : 0;

          const gradeCounts: Record<string, number> = { 'O': 0, 'A+': 0, 'A': 0, 'B+': 0, 'B': 0, 'C': 0, 'RA': 0 };
          let maxGradeCount = 1;
          if (gradesData?.results) {
            gradesData.results.forEach(sem => {
              sem.subjects.forEach(sub => {
                const g = sub.grade.toUpperCase();
                if (['RA', 'U', 'AB', 'SA', 'FAIL'].includes(g)) {
                  gradeCounts['RA'] = (gradeCounts['RA'] || 0) + 1;
                } else if (gradeCounts[g] !== undefined) {
                  gradeCounts[g] = (gradeCounts[g] || 0) + 1;
                }
              });
            });
            maxGradeCount = Math.max(1, ...Object.values(gradeCounts));
          }

          const gpaTrend = (gradesData?.results || []).map(r => ({
            sem: `Sem ${r.semester}`,
            gpa: r.gpa,
          }));

          return (
            <div className="bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              
              {/* Header Title */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-slate-900 tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                      Academic Analytics & Overview
                    </h2>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-orange-100 text-orange-700 font-bold">
                      AU 2021 Reg
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Live performance metrics synchronized directly with college academic databases
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full self-start sm:self-auto flex items-center gap-1.5 shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  Live Sync Active
                </span>
              </div>

              {/* 3 Main Executive KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* 1. CGPA Metric Card */}
                <div className="bg-gradient-to-br from-emerald-50/40 via-white to-slate-50/50 border border-emerald-100 hover:border-emerald-300 rounded-2xl p-5 transition-all shadow-xs flex flex-col justify-between group">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">Cumulative CGPA</span>
                      <div className="w-9 h-9 rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center border border-emerald-200/80 group-hover:scale-105 transition-transform">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="flex items-baseline gap-1.5 mt-2">
                      <span className="text-3xl sm:text-4xl font-black text-emerald-700 tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                        {cumulativeCgpa > 0 ? cumulativeCgpa.toFixed(2) : 'N/A'}
                      </span>
                      <span className="text-xs text-slate-400 font-bold">/ 10.00</span>
                    </div>
                  </div>
                  <div className="pt-3 mt-3 border-t border-emerald-100/60 flex items-center justify-between text-xs text-slate-600">
                    <span>Cleared Credits: <strong className="text-slate-900 font-bold">{gradesData?.totalCredits || 0}</strong></span>
                    <span className="font-semibold text-emerald-700">First Class</span>
                  </div>
                </div>

                {/* 2. Attendance Metric Card */}
                <div className="bg-gradient-to-br from-blue-50/40 via-white to-slate-50/50 border border-blue-100 hover:border-blue-300 rounded-2xl p-5 transition-all shadow-xs flex flex-col justify-between group">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">Overall Attendance</span>
                      <div className="w-9 h-9 rounded-xl bg-blue-100/80 text-blue-700 flex items-center justify-center border border-blue-200/80 group-hover:scale-105 transition-transform">
                        <Calendar className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="flex items-baseline gap-1.5 mt-2">
                      <span className="text-3xl sm:text-4xl font-black text-blue-700 tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                        {overallAttendancePct > 0 ? `${overallAttendancePct}%` : 'N/A'}
                      </span>
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                        overallAttendancePct >= 75 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {overallAttendancePct >= 75 ? 'ELIGIBLE' : 'CRITICAL'}
                      </span>
                    </div>
                  </div>
                  <div className="pt-3 mt-3 border-t border-blue-100/60 flex items-center justify-between text-xs text-slate-600">
                    <span>{attendance?.totalPresent || 0} / {attendance?.totalConducted || 0} hrs attended</span>
                    {safeMarginClasses > 0 ? (
                      <span className="text-emerald-700 font-bold">+{safeMarginClasses} hrs buffer</span>
                    ) : (
                      <span className="text-slate-500 font-medium">Req: 75%</span>
                    )}
                  </div>
                </div>

                {/* 3. Standing Arrears Metric Card */}
                <div className={`bg-gradient-to-br via-white to-slate-50/50 border rounded-2xl p-5 transition-all shadow-xs flex flex-col justify-between group ${
                  activeArrearsCount > 0 
                    ? 'from-rose-50/40 border-rose-200 hover:border-rose-300' 
                    : 'from-emerald-50/40 border-slate-200 hover:border-emerald-300'
                }`}>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">Standing Arrears</span>
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center border group-hover:scale-105 transition-transform ${
                        activeArrearsCount > 0 ? 'bg-rose-100 text-rose-700 border-rose-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                      }`}>
                        {activeArrearsCount > 0 ? <AlertTriangle className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                      </div>
                    </div>
                    <div className="flex items-baseline gap-1.5 mt-2">
                      <span className={`text-3xl sm:text-4xl font-black tracking-tight ${
                        activeArrearsCount > 0 ? 'text-rose-600' : 'text-emerald-700'
                      }`} style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                        {activeArrearsCount}
                      </span>
                      <span className="text-xs text-slate-400 font-bold">Active Backlogs</span>
                    </div>
                  </div>
                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <span className="truncate">
                      {activeArrearsCount > 0 ? 'Re-appear exams scheduled' : 'All enrolled subjects cleared'}
                    </span>
                    <span className={`font-bold ${activeArrearsCount > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                      {activeArrearsCount > 0 ? 'Action Needed' : 'All Clear'}
                    </span>
                  </div>
                </div>

              </div>

              {/* Analytics Graphs (GPA Progression Curve & Grade Distribution) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
                
                {/* GPA Trend Curve */}
                <div className="lg:col-span-2 bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-sm font-black text-slate-900 tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                        Semester GPA Progression Curve
                      </h4>
                      <p className="text-[11px] text-slate-500">Historical performance across semesters</p>
                    </div>
                    <div className="p-2 rounded-xl bg-orange-100 text-orange-600">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>

                  {gpaTrend.length > 0 ? (
                    <div className="w-full bg-white rounded-xl border border-slate-200/80 p-4 flex flex-col justify-center shadow-2xs">
                      <svg className="w-full h-auto overflow-visible" viewBox="0 0 600 220" style={{ maxHeight: '190px' }}>
                        <defs>
                          <linearGradient id="gpaGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#F97316" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#F97316" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>

                        {/* Horizontal Guides */}
                        {[40, 80, 120, 160].map(y => (
                          <line key={y} x1="40" y1={y} x2="560" y2={y} stroke="#F1F5F9" strokeDasharray="4 4" strokeWidth="1.5" />
                        ))}

                        {/* Curve & Nodes */}
                        {(() => {
                          const gpas = gpaTrend.map(t => t.gpa);
                          const minVal = Math.min(...gpas, 6) - 0.5;
                          const maxVal = Math.max(...gpas, 9.5) + 0.5;
                          const valRange = Math.max(0.1, maxVal - minVal);

                          const pts = gpaTrend.map((item, idx) => {
                            const x = 60 + (idx / Math.max(1, gpaTrend.length - 1)) * 480;
                            const y = 160 - ((item.gpa - minVal) / valRange) * 115;
                            return { x, y, gpa: item.gpa, sem: item.sem };
                          });

                          const dPath = pts.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
                          const areaPath = `${dPath} L ${pts[pts.length - 1].x} 170 L ${pts[0].x} 170 Z`;

                          return (
                            <>
                              <path d={areaPath} fill="url(#gpaGradient)" />
                              <path d={dPath} fill="none" stroke="#F97316" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                              {pts.map((p, idx) => (
                                <g key={idx}>
                                  <rect x={p.x - 22} y={p.y - 28} width="44" height="20" rx="6" fill="#1E293B" />
                                  <text x={p.x} y={p.y - 14} textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="bold" fontFamily="Plus Jakarta Sans, sans-serif">
                                    {p.gpa.toFixed(2)}
                                  </text>
                                  <circle cx={p.x} cy={p.y} r="6" fill="#FFFFFF" stroke="#F97316" strokeWidth="3.5" />
                                  <text x={p.x} y="196" textAnchor="middle" fill="#64748B" fontSize="11" fontWeight="bold" fontFamily="Plus Jakarta Sans, sans-serif">
                                    {p.sem}
                                  </text>
                                </g>
                              ))}
                            </>
                          );
                        })()}
                      </svg>
                    </div>
                  ) : (
                    <div className="py-10 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200/80">
                      Switch to <button onClick={() => { setActiveTab('grades'); ensureGradesLoaded(); }} className="text-orange-600 font-bold underline cursor-pointer">Academic Grades</button> to sync GPA progression.
                    </div>
                  )}
                </div>

                {/* Grade Distribution Bar Graph */}
                <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between">
                  <div className="mb-3">
                    <h4 className="text-sm font-black text-slate-900 tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                      Grade Distribution
                    </h4>
                    <p className="text-[11px] text-slate-500">Letter grade summary across courses</p>
                  </div>

                  <div className="space-y-2 py-1">
                    {Object.entries(gradeCounts).map(([grade, cnt]) => {
                      const pct = Math.round((cnt / maxGradeCount) * 100);
                      let barColor = 'bg-emerald-500';
                      if (grade === 'B+' || grade === 'B') barColor = 'bg-blue-500';
                      if (grade === 'C') barColor = 'bg-amber-500';
                      if (grade === 'RA') barColor = 'bg-rose-500';

                      return (
                        <div key={grade} className="flex items-center gap-2 text-xs">
                          <span className="w-6 font-mono font-bold text-slate-800 text-[11px] text-right">{grade}</span>
                          <div className="flex-1 h-3.5 bg-white rounded-full border border-slate-200 overflow-hidden p-0.5 shadow-inner">
                            <div className={`h-full ${barColor} rounded-full transition-all duration-500`} style={{ width: `${Math.max(cnt > 0 ? 8 : 0, pct)}%` }} />
                          </div>
                          <span className="w-5 font-bold text-[11px] text-slate-500 text-right">{cnt}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>
          );
        })()}

        {/* ─── NAVIGATION SEGMENTED TAB CONTROL ─── */}
        <div className="flex items-center border-b border-slate-200 pb-3 overflow-x-auto gap-2 no-scrollbar">
          {[
            { id: 'timetable', label: 'Timetable Matrix', icon: Clock, onHover: () => {} },
            { id: 'faculties', label: 'Handling Faculties', icon: Users, onHover: () => ensureAttendanceLoaded() },
            { id: 'attendance', label: 'Attendance Breakdown', icon: ShieldCheck, onHover: () => ensureAttendanceLoaded() },
            { id: 'marks', label: 'CAT & Internal Marks', icon: FileText, onHover: () => ensureCatMarksLoaded() },
            { id: 'grades', label: 'Academic Grades & CGPA', icon: Award, onHover: () => ensureGradesLoaded() },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                onMouseEnter={tab.onHover}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-md shadow-orange-500/20 scale-[1.02]'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/90 hover:bg-slate-50'
                }`}
                style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ─── 1. TIMETABLE MATRIX TAB (NEXT-GEN AGENDA UI) ─── */}
        {activeTab === 'timetable' && (
          <div className="space-y-6">
            
            {/* Top Toolbar: Filter Pills & Search & View Toggle */}
            <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                
                {/* Filter Pills */}
                <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar">
                  {[
                    { id: 'ALL', label: 'ALL PERIODS', color: 'bg-slate-900 text-white' },
                    { id: 'LAB', label: 'LABORATORY', color: 'bg-purple-600 text-white shadow-purple-500/20' },
                    { id: 'THEORY', label: 'THEORY', color: 'bg-blue-600 text-white shadow-blue-500/20' },
                    { id: 'ELECTIVE', label: 'ELECTIVES', color: 'bg-emerald-600 text-white shadow-emerald-500/20' },
                    { id: 'FREE', label: 'FREE PERIODS', color: 'bg-slate-500 text-white' },
                  ].map((filter) => {
                    const isSelected = ttFilterType === filter.id;
                    return (
                      <button
                        key={filter.id}
                        onClick={() => setTtFilterType(filter.id as any)}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-extrabold tracking-wide transition-all cursor-pointer ${
                          isSelected
                            ? `${filter.color} shadow-md scale-105`
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                        }`}
                      >
                        <span>{filter.label}</span>
                        {isSelected && filter.id !== 'ALL' && (
                          <X className="w-3 h-3 hover:opacity-75" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Right Side: Search & View Switcher */}
                <div className="flex items-center gap-3">
                  {/* Search Input */}
                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search subject or faculty..."
                      value={ttSearchQuery}
                      onChange={(e) => setTtSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-orange-500 transition-all font-medium"
                    />
                    {ttSearchQuery && (
                      <button onClick={() => setTtSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* View Mode Switcher */}
                  <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
                    <button
                      onClick={() => setTtViewMode('grid')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        ttViewMode === 'grid'
                          ? 'bg-white text-orange-600 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Grid className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Weekly Grid</span>
                    </button>
                    <button
                      onClick={() => setTtViewMode('daily')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        ttViewMode === 'daily'
                          ? 'bg-white text-orange-600 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <List className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Daily View</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {isInitialLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white rounded-3xl border border-slate-200/90">
                <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-slate-600 font-semibold">Fetching timetable from RIT IMS records...</p>
              </div>
            ) : ttViewMode === 'grid' ? (
              /* ─── WEEKLY MATRIX AGENDA VIEW ─── */
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <div className="min-w-[920px] p-6 space-y-4">
                    
                    {/* Matrix Header Row: Days of Week */}
                    <div className="grid grid-cols-6 gap-3 pb-3 border-b border-slate-200 text-xs font-extrabold tracking-wider">
                      <div className="text-slate-400 uppercase flex items-center justify-center font-mono">TIME</div>
                      {(['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const).map((dayKey) => {
                        const isToday = todayKey === dayKey;
                        return (
                          <div
                            key={dayKey}
                            className={`py-2 px-3 rounded-2xl text-center uppercase flex items-center justify-between ${
                              isToday
                                ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-md shadow-orange-500/20 font-black'
                                : 'bg-slate-50 text-slate-700 border border-slate-200 font-extrabold'
                            }`}
                          >
                            <span>{dayKey}</span>
                            {isToday && <span className="w-2 h-2 rounded-full bg-white animate-pulse" />}
                          </div>
                        );
                      })}
                    </div>

                    {/* Matrix Grid Periods (P1 to P7 with Gap Rows) */}
                    <div className="relative space-y-3">

                      {[
                        { type: 'period', pNum: 1, timeLabel: '08:45 AM' },
                        { type: 'period', pNum: 2, timeLabel: '09:40 AM' },
                        { type: 'gap', label: '15M TEA BREAK', timeLabel: '10:35 AM' },
                        { type: 'period', pNum: 3, timeLabel: '10:50 AM' },
                        { type: 'period', pNum: 4, timeLabel: '11:45 AM' },
                        { type: 'gap', label: '50M LUNCH BREAK', timeLabel: '12:40 PM' },
                        { type: 'period', pNum: 5, timeLabel: '01:30 PM' },
                        { type: 'period', pNum: 6, timeLabel: '02:25 PM' },
                        { type: 'period', pNum: 7, timeLabel: '03:20 PM' },
                      ].map((rowItem, rIdx) => {
                        if (rowItem.type === 'gap') {
                          return (
                            <div key={`gap-${rIdx}`} className="grid grid-cols-6 gap-3 items-center">
                              <div className="text-[11px] font-mono font-bold text-slate-400 text-center">
                                {rowItem.timeLabel}
                              </div>
                              <div className="col-span-5 py-2.5 px-4 rounded-2xl bg-slate-50/80 border border-dashed border-slate-300 text-center flex items-center justify-center gap-2 shadow-2xs">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                <span className="text-[11px] font-mono font-black tracking-widest text-slate-500 uppercase">
                                  {rowItem.label}
                                </span>
                              </div>
                            </div>
                          );
                        }

                        const pNum = rowItem.pNum!;
                        return (
                          <div key={`prow-${pNum}`} className="grid grid-cols-6 gap-3 items-stretch">
                            {/* Time Column Marker */}
                            <div className="flex flex-col justify-center items-center py-2 bg-slate-50 rounded-2xl border border-slate-200">
                              <span className="text-xs font-mono font-extrabold text-slate-700">{rowItem.timeLabel}</span>
                              <span className="text-[10px] font-bold text-orange-600">Period {pNum}</span>
                            </div>

                            {/* 5 Day Period Cells */}
                            {(['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const).map((dayKey) => {
                              const dayList = timetable?.[dayKey] || [];
                              const period = dayList.find((p) => p.periodNumber === pNum);

                              if (!period || !matchesFilter(period)) {
                                return (
                                  <div
                                    key={`${dayKey}-${pNum}`}
                                    className="p-3 rounded-2xl bg-slate-50/40 border border-slate-100 flex items-center justify-center opacity-40"
                                  >
                                    <span className="text-[10px] text-slate-400 font-mono">-</span>
                                  </div>
                                );
                              }

                              const starKey = `${dayKey}-${pNum}`;
                              const isStarred = starredPeriods[starKey];
                              const isLiveNow = isPeriodLive(dayKey, pNum);
                              const isFree = period.subjectCode === 'FREE';
                              const isLab = period.type === 'LAB';
                              const isElective = (period.subjectCode || '').includes('V1') || (period.subjectName || '').toLowerCase().includes('elective');

                              return (
                                <div
                                  key={`${dayKey}-${pNum}`}
                                  className={`relative p-3.5 rounded-2xl border transition-all flex flex-col justify-between group ${
                                    isLiveNow
                                      ? 'bg-orange-50/80 border-orange-400 ring-2 ring-orange-400/30 shadow-md'
                                      : isFree
                                      ? 'bg-slate-50/80 border-slate-200'
                                      : isLab
                                      ? 'bg-purple-50/60 border-purple-200 hover:border-purple-300'
                                      : isElective
                                      ? 'bg-emerald-50/60 border-emerald-200 hover:border-emerald-300'
                                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-sm'
                                  }`}
                                >
                                  {/* Live Now Pulsing Badge */}
                                  {isLiveNow && (
                                    <span className="absolute -top-2 right-3 px-2 py-0.5 rounded-full bg-red-600 text-white text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm animate-pulse">
                                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                                      LIVE
                                    </span>
                                  )}

                                  <div>
                                    {/* Subject Title */}
                                    <h4 className={`text-xs font-black line-clamp-2 ${
                                      isFree ? 'text-slate-400' : isLab ? 'text-purple-950' : isElective ? 'text-emerald-950' : 'text-slate-900'
                                    }`} style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                                      {period.subjectName}
                                    </h4>

                                    {/* Faculty Instructor */}
                                    {!isFree && (
                                      <p className="text-[10px] font-semibold text-slate-500 mt-1 line-clamp-1">
                                        {period.staffName || 'Faculty Instructor'}
                                      </p>
                                    )}
                                  </div>

                                  {/* Badges & Star Footer */}
                                  <div className="flex items-center justify-between gap-1 mt-2.5 pt-2 border-t border-slate-100">
                                    <div className="flex items-center gap-1 overflow-hidden">
                                      {period.subjectCode && !isFree && (
                                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                          {period.subjectCode}
                                        </span>
                                      )}
                                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                                        isLab ? 'bg-purple-100 text-purple-800' : isElective ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                                      }`}>
                                        {period.type}
                                      </span>
                                    </div>

                                    <button
                                      onClick={() => toggleStarPeriod(starKey)}
                                      className={`p-1 rounded-lg transition-all cursor-pointer ${
                                        isStarred ? 'text-amber-500 fill-amber-500 scale-110' : 'text-slate-300 hover:text-amber-400'
                                      }`}
                                      title={isStarred ? 'Unfavorite' : 'Favorite period'}
                                    >
                                      <Star className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}

                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* ─── DAILY CARD VIEW ─── */
              <div className="space-y-6">
                {/* Day Switcher */}
                <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar">
                    {(['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const).map((dayKey) => {
                      const count = timetable?.[dayKey]?.length || 0;
                      const isSelected = selectedDay === dayKey;
                      return (
                        <button
                          key={dayKey}
                          onClick={() => setSelectedDay(dayKey)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer capitalize ${
                            isSelected
                              ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-md shadow-orange-500/20'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                          }`}
                        >
                          <span>{dayKey}</span>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono ${isSelected ? 'bg-white/20 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(timetable?.[selectedDay] || []).filter(matchesFilter).map((period) => {
                    const starKey = `${selectedDay}-${period.periodNumber}`;
                    const isStarred = starredPeriods[starKey];
                    const isLiveNow = isPeriodLive(selectedDay, period.periodNumber);

                    return (
                      <motion.div
                        key={period.periodNumber}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`bg-white rounded-3xl p-5 border transition-all shadow-sm flex flex-col justify-between ${
                          isLiveNow ? 'border-orange-400 ring-2 ring-orange-400/20 bg-orange-50/30' : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-xl bg-slate-100 text-slate-900 font-black text-xs flex items-center justify-center border border-slate-200">
                              P{period.periodNumber}
                            </span>
                            <span className="text-xs font-bold text-slate-600 flex items-center gap-1 font-mono">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              {period.timeSlot}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {isLiveNow && (
                              <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[9px] font-black uppercase tracking-wider animate-pulse">
                                LIVE
                              </span>
                            )}
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 ${
                                period.type === 'LAB'
                                  ? 'bg-purple-100 text-purple-800 border border-purple-300'
                                  : 'bg-blue-100 text-blue-800 border border-blue-300'
                              }`}
                            >
                              {period.type === 'LAB' ? <FlaskConical className="w-3 h-3 text-purple-600" /> : <BookOpen className="w-3 h-3 text-blue-600" />}
                              {period.type}
                            </span>
                          </div>
                        </div>

                        {/* Subject Details */}
                        <div className="space-y-1.5 my-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-mono font-extrabold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
                              {period.subjectCode}
                            </span>
                            <button
                              onClick={() => toggleStarPeriod(starKey)}
                              className={`p-1 rounded-lg transition-all cursor-pointer ${
                                isStarred ? 'text-amber-500 fill-amber-500' : 'text-slate-300 hover:text-amber-400'
                              }`}
                            >
                              <Star className="w-4 h-4" />
                            </button>
                          </div>
                          <h3 className="text-base font-extrabold text-slate-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                            {period.subjectName}
                          </h3>
                        </div>

                        {/* Faculty Footer */}
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                          <span className="truncate pr-2 font-medium">{period.staffName || 'Faculty Instructor'}</span>
                          {period.staffCode && (
                            <span className="font-mono text-[10px] text-slate-400">{period.staffCode}</span>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── 2. ATTENDANCE BREAKDOWN TAB ─── */}
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            {isTabLoading && !attendance ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white rounded-3xl border border-slate-200">
                <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-slate-600 font-semibold">Fetching live attendance records from IMS...</p>
              </div>
            ) : attendance ? (
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                      Subject-Wise Attendance Breakdown
                    </h3>
                    <p className="text-xs text-slate-500">Real-time attendance hours, percentage thresholds, and safe margin calculator</p>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-2xs">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="text-[10px] text-emerald-700 uppercase font-black">Overall Average</p>
                      <p className="text-sm font-black text-emerald-800">
                        {attendance.overallPercentage}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {attendance.subjects.map((sub) => {
                    const isSafe = sub.percentage >= 75;
                    const canMissClasses = sub.conducted > 0 
                      ? Math.floor((sub.present - 0.75 * sub.conducted) / 0.75)
                      : 0;

                    return (
                      <div key={sub.code} className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-3 shadow-2xs hover:border-slate-300 transition-all">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-mono font-extrabold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
                              {sub.code}
                            </span>
                            <h4 className="text-sm font-bold text-slate-900 mt-1 line-clamp-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                              {sub.name}
                            </h4>
                          </div>
                          <span className={`text-sm font-black px-2.5 py-1 rounded-xl ${
                            isSafe ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {sub.percentage}%
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden shadow-inner">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isSafe ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${Math.min(100, sub.percentage)}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                          <span>Conducted: <strong className="text-slate-900 font-bold">{sub.conducted} hrs</strong></span>
                          <span>Attended: <strong className="text-emerald-700 font-bold">{sub.present} hrs</strong></span>
                          <span>Absent: <strong className="text-rose-600 font-bold">{sub.absent} hrs</strong></span>
                        </div>

                        {/* Buffer Guidance */}
                        <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                          {canMissClasses > 0 ? (
                            <span className="text-emerald-700 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Can safely skip up to {canMissClasses} hrs
                            </span>
                          ) : canMissClasses === 0 ? (
                            <span className="text-amber-700 font-semibold flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                              On threshold (Cannot miss upcoming classes)
                            </span>
                          ) : (
                            <span className="text-rose-700 font-bold flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                              Shortage: Attend next {Math.ceil((0.75 * sub.conducted - sub.present) / 0.25)} hrs
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* ─── 3. INTERNAL MARKS TAB (CAT, ASSIGNMENT & LAB MARKS) ─── */}
        {activeTab === 'marks' && (
          <div className="space-y-6">
            {/* Sub-Tab Selector */}
            <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm w-fit">
              <button
                onClick={() => setMarksSubTab('cat')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  marksSubTab === 'cat'
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                CAT Exams
              </button>

              <button
                onClick={() => setMarksSubTab('assignment')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  marksSubTab === 'assignment'
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Assignments
              </button>

              <button
                onClick={() => setMarksSubTab('lab')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  marksSubTab === 'lab'
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Lab Practical
              </button>
            </div>

            {isTabLoading && !catMarks ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white rounded-3xl border border-slate-200">
                <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-slate-600 font-semibold">Fetching internal marks on demand...</p>
              </div>
            ) : (
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm">
                
                {/* SUB TAB 1: CAT MARKS */}
                {marksSubTab === 'cat' && catMarks && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-black text-slate-900 tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                        Continuous Assessment Test (CAT) Scores
                      </h3>
                      <p className="text-xs text-slate-500">Official internal examination scores synchronized with college evaluation portal</p>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-slate-200">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase font-black tracking-wider">
                            <th className="py-3.5 px-4">Subject Code</th>
                            <th className="py-3.5 px-4">Course Title</th>
                            <th className="py-3.5 px-4">Handling Faculty</th>
                            <th className="py-3.5 px-4 text-center">CO 1</th>
                            <th className="py-3.5 px-4 text-center">CO 2</th>
                            <th className="py-3.5 px-4 text-center">Total</th>
                            <th className="py-3.5 px-4 text-center">Weightage</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {catMarks.subjects.map((sub) => (
                            <tr key={sub.code} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3.5 px-4 font-mono font-bold text-orange-600">{sub.code}</td>
                              <td className="py-3.5 px-4 font-semibold text-slate-900">{sub.name}</td>
                              <td className="py-3.5 px-4 font-medium text-slate-600">{sub.faculty || 'Faculty In-Charge'}</td>
                              <td className="py-3.5 px-4 text-center font-bold text-slate-900">{sub.co1 ?? '-'}</td>
                              <td className="py-3.5 px-4 text-center font-bold text-slate-900">{sub.co2 ?? '-'}</td>
                              <td className="py-3.5 px-4 text-center font-bold text-slate-900">{sub.total ?? '-'}</td>
                              <td className="py-3.5 px-4 text-center">
                                <span className="px-2 py-0.5 rounded-md font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  {sub.weightage ?? '-'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* SUB TAB 2: ASSIGNMENT MARKS */}
                {marksSubTab === 'assignment' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-black text-slate-900 tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                        Assignment Scores
                      </h3>
                      <p className="text-xs text-slate-500">Continuous assignment evaluations (10 Marks per assignment)</p>
                    </div>

                    {assignmentMarks && assignmentMarks.length > 0 ? (
                      <div className="overflow-x-auto rounded-2xl border border-slate-200">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase font-black tracking-wider">
                              <th className="py-3.5 px-4">Subject Code</th>
                              <th className="py-3.5 px-4">Course Title</th>
                              <th className="py-3.5 px-4">Handling Faculty</th>
                              <th className="py-3.5 px-3 text-center">A1</th>
                              <th className="py-3.5 px-3 text-center">A2</th>
                              <th className="py-3.5 px-3 text-center">A3</th>
                              <th className="py-3.5 px-3 text-center">A4</th>
                              <th className="py-3.5 px-3 text-center">A5</th>
                              <th className="py-3.5 px-4 text-center">Total (50)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {assignmentMarks.map((item, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                                <td className="py-3.5 px-4 font-mono font-bold text-orange-600">{item.subjectCode}</td>
                                <td className="py-3.5 px-4 font-semibold text-slate-900">{item.subjectName}</td>
                                <td className="py-3.5 px-4 font-medium text-slate-600">{item.facultyName || 'Faculty In-Charge'}</td>
                                <td className="py-3.5 px-3 text-center font-bold text-slate-900">{item.a1}</td>
                                <td className="py-3.5 px-3 text-center font-bold text-slate-900">{item.a2}</td>
                                <td className="py-3.5 px-3 text-center font-bold text-slate-900">{item.a3}</td>
                                <td className="py-3.5 px-3 text-center font-bold text-slate-900">{item.a4}</td>
                                <td className="py-3.5 px-3 text-center font-bold text-slate-900">{item.a5}</td>
                                <td className="py-3.5 px-4 text-center">
                                  <span className="px-2 py-0.5 rounded-md font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    {item.total}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="py-12 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
                        No Assignment marks posted yet for this semester.
                      </div>
                    )}
                  </div>
                )}

                {/* SUB TAB 3: LAB MARKS */}
                {marksSubTab === 'lab' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-black text-slate-900 tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                        Laboratory Practical Marks
                      </h3>
                      <p className="text-xs text-slate-500">Practical evaluations and lab experiment assessments</p>
                    </div>

                    {labMarks && labMarks.length > 0 ? (
                      <div className="overflow-x-auto rounded-2xl border border-slate-200">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase font-black tracking-wider">
                              <th className="py-3.5 px-4">Subject Code</th>
                              <th className="py-3.5 px-4">Subject Title</th>
                              <th className="py-3.5 px-4">Handling Faculty</th>
                              <th className="py-3.5 px-4 text-center">Marks</th>
                              <th className="py-3.5 px-4 text-center">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {labMarks.map((item, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                                <td className="py-3.5 px-4 font-mono font-bold text-orange-600">{item.subjectCode}</td>
                                <td className="py-3.5 px-4 font-semibold text-slate-900">{item.subjectName}</td>
                                <td className="py-3.5 px-4 font-medium text-slate-600">{item.facultyName || 'Faculty In-Charge'}</td>
                                <td className="py-3.5 px-4 text-center font-bold text-slate-900">{item.marks}</td>
                                <td className="py-3.5 px-4 text-center">
                                  <span className="px-2 py-0.5 rounded-md font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    {item.total}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="py-12 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
                        No Lab marks posted yet for this semester.
                      </div>
                    )}
                  </div>
                )}

              </div>
            )}
          </div>
        )}

        {/* ─── 4. ACADEMIC GRADES & CGPA TAB ─── */}
        {activeTab === 'grades' && (
          <div className="space-y-6">
            {isTabLoading && !gradesData ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white rounded-3xl border border-slate-200">
                <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-slate-600 font-semibold">Calculating Anna University CGPA & semester credits...</p>
              </div>
            ) : gradesData ? (
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                      Official Semester Results & CGPA
                    </h3>
                    <p className="text-xs text-slate-500">Credit calculations and letter grades according to Anna University Regulations</p>
                  </div>

                  <Link
                    to="/toolkit?toolkit=gpa"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200 text-xs font-bold transition-all shadow-2xs"
                  >
                    <Calculator className="w-4 h-4" />
                    <span>Simulate in GPA Calculator</span>
                  </Link>
                </div>

                {/* CGPA Banner */}
                <div className="p-6 rounded-2xl bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl shadow-orange-500/20">
                  <div>
                    <p className="text-xs font-bold text-orange-100 uppercase tracking-wider">Cumulative Grade Point Average</p>
                    <h2 className="text-3xl sm:text-4xl font-black mt-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                      {gradesData.cgpa.toFixed(2)} <span className="text-base font-normal text-orange-100">/ 10.00</span>
                    </h2>
                    <p className="text-xs text-orange-100 mt-1 font-medium">
                      Total Earned Credits: <strong className="text-white font-bold">{gradesData.totalCredits} credits</strong>
                    </p>
                  </div>
                  <div className="p-3.5 bg-white/15 rounded-xl backdrop-blur-md text-center border border-white/20">
                    <p className="text-[10px] uppercase font-black text-orange-100 tracking-wider">Degree Classification</p>
                    <p className="text-sm font-black mt-0.5 text-white">First Class with Distinction</p>
                  </div>
                </div>

                {/* Semester Switcher */}
                {gradesData.results.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                    <button
                      onClick={() => setSelectedSemFilter(0)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedSemFilter === 0 ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      All Semesters ({gradesData.results.length})
                    </button>
                    {gradesData.results.map((sem) => (
                      <button
                        key={sem.semester}
                        onClick={() => setSelectedSemFilter(sem.semester)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          selectedSemFilter === sem.semester ? 'bg-orange-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Semester {sem.semester} (SGPA: {sem.gpa.toFixed(2)})
                      </button>
                    ))}
                  </div>
                )}

                {/* Results Tables */}
                {filteredGrades.map((semResult) => (
                  <div key={semResult.semester} className="space-y-3 pt-2">
                    <div className="flex items-center justify-between bg-slate-50/80 px-4 py-3 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-orange-600" />
                        <h4 className="text-sm font-bold text-slate-900">
                          Semester {semResult.semester} Grade Sheet
                        </h4>
                      </div>
                      <div className="flex items-center gap-3 text-xs font-bold">
                        <span className="text-slate-600">Total Credits: <strong className="text-slate-900">{semResult.totalCredits}</strong></span>
                        <span className="px-2.5 py-1 rounded-lg bg-orange-100 text-orange-700">
                          SGPA: {semResult.gpa.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-slate-200">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase font-black tracking-wider">
                            <th className="py-3.5 px-4">Course Code</th>
                            <th className="py-3.5 px-4">Course Title</th>
                            <th className="py-3.5 px-4 text-center">Credits</th>
                            <th className="py-3.5 px-4 text-center">Letter Grade</th>
                            <th className="py-3.5 px-4 text-center">Result</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {semResult.subjects.map((grade) => (
                            <tr key={grade.code} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3.5 px-4 font-mono font-bold text-orange-600">{grade.code}</td>
                              <td className="py-3.5 px-4 font-semibold text-slate-900">{grade.name}</td>
                              <td className="py-3.5 px-4 text-center font-bold text-slate-900">{grade.credits}</td>
                              <td className="py-3.5 px-4 text-center">
                                <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-orange-100 text-orange-700">
                                  {grade.grade}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                                  grade.result === 'PASS'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                                }`}>
                                  {grade.result}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        )}

        {/* ─── 5. HANDLING FACULTIES TAB ─── */}
        {activeTab === 'faculties' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-5 h-5 text-orange-600" />
                    <h3 className="text-lg font-black text-slate-900 tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                      Course Instructors & Laboratory In-Charges
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500">
                    Faculty mentors and professors assigned to your department ({profile?.department || 'AI & DS'}).
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200 self-start sm:self-auto">
                  {dynamicFaculties.length} Active Instructors
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dynamicFaculties.map((fac) => {
                  const matched = fac.matched;
                  const designation = fac.role;
                  const department = fac.dept;
                  const email = fac.fallbackEmail;
                  const qualification = matched?.qualification;
                  const experience = matched?.experience;
                  const interest = matched?.interest;

                  return (
                    <motion.div
                      key={fac.code}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-slate-50/70 border border-slate-200/90 hover:border-orange-300 rounded-2xl p-5 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 text-orange-700 font-black text-sm flex items-center justify-center border border-orange-200 shrink-0 shadow-2xs">
                              {fac.name.replace('DR.', '').trim().slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                                {matched?.name || fac.name}
                              </h4>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                                  ID: {fac.code}
                                </span>
                                {qualification && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 border border-orange-200">
                                    {qualification}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <p className="text-[11px] font-semibold text-slate-600">
                            {department}
                          </p>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-lg">
                              {designation}
                            </span>
                            {experience && (
                              <span className="text-[10px] font-semibold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-lg">
                                ⌛ {experience}
                              </span>
                            )}
                          </div>

                          {interest && (
                            <p className="text-[11px] text-slate-600 font-medium line-clamp-2 pt-1">
                              <strong className="text-slate-800">Specialization:</strong> {interest}
                            </p>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">
                            Courses Handled:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {fac.subjects.map((sub, sIdx) => (
                              <span
                                key={sIdx}
                                className="text-[11px] font-bold text-slate-800 bg-white border border-slate-200/80 px-2.5 py-1 rounded-xl shadow-2xs"
                              >
                                {sub}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 mt-4 border-t border-slate-200/80 flex items-center justify-between">
                        <a
                          href={`mailto:${email}`}
                          className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Email Faculty</span>
                        </a>

                        <Link
                          to={`/faculty?search=${encodeURIComponent((matched?.name || fac.name).replace(/^DR\.\s*/i, '').trim())}`}
                          className="text-[11px] font-bold text-slate-600 hover:text-orange-600 flex items-center gap-0.5"
                        >
                          <span>Profile</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
