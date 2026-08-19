import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, Clock, MapPin, Users,
  Calendar, Building, ShieldCheck, 
  Sparkles, KeyRound, ArrowRight, LogOut,
  AlertCircle, User, HelpCircle, Compass, ChevronRight, ExternalLink,
  Award, CheckCircle2, AlertTriangle, FileText, Calculator, TrendingUp,
  Layers, BookOpen, Check, Mail, Phone, RefreshCw, Edit2, Save, FlaskConical, Search, RotateCw
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
  fetchImsSemesterResults,
  type StudentProfile,
  type WeeklySchedule,
  type AttendanceReport,
  type CatMarksReport,
  type SemesterResult
} from '@/services/imsService';

export default function StudentDashboard() {
  const { user, openAuthModal, logout } = useAuth();
  const [session, setSession] = useState<{ token: string; profile: StudentProfile } | null>(getStoredImsSession());

  // Navigation State
  const [activeTab, setActiveTab] = useState<'timetable' | 'attendance' | 'marks' | 'grades' | 'faculties'>('timetable');
  const [selectedDayFilter, setSelectedDayFilter] = useState<'all' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday'>('all');
  const [ttSearchQuery, setTtSearchQuery] = useState('');
  const [selectedSemFilter, setSelectedSemFilter] = useState<number>(0);

  // Loaded Data States
  const [profile, setProfile] = useState<StudentProfile | null>(session?.profile || null);
  const [timetable, setTimetable] = useState<WeeklySchedule | null>(null);
  const [attendance, setAttendance] = useState<AttendanceReport | null>(null);
  const [catMarks, setCatMarks] = useState<CatMarksReport | null>(null);
  const [gradesData, setGradesData] = useState<{ results: SemesterResult[]; cgpa: number; totalCredits: number; activeArrears: number } | null>(null);

  // Loading States
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [isTabLoading, setIsTabLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inline Name Editor State
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');

  // Login Form States
  const [regInput, setRegInput] = useState('');
  const [passInput, setPassInput] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Initial Load: Profile and Timetable only
  useEffect(() => {
    if (session?.token) {
      loadInitialData(session.token);
    }
  }, [session?.token]);

  const loadInitialData = async (token: string, force = false) => {
    setIsInitialLoading(true);
    setError(null);
    try {
      const reg = session?.profile?.registerNumber || '2117240070293';
      const p = await fetchImsProfile(token, reg, force);
      setProfile(p);
      const tt = await fetchImsTimetable(token, p.registerNumber, force);
    } catch (err: any) {
      console.error('Error loading initial IMS data:', err);
      setError(err.message || 'Failed to load timetable.');
    } finally {
      setIsInitialLoading(false);
    }
  };

  // ─── Lazy On-Demand Fetchers ────────────────────────────────────────

  const ensureAttendanceLoaded = async (force = false) => {
    if ((attendance && !force) || !session?.token || !profile) return;
    setIsTabLoading(true);
    try {
      const data = await fetchImsAttendance(session.token, profile.registerNumber, force);
      setAttendance(data);
    } catch (err) {
      console.warn('Attendance load notice:', err);
    } finally {
      setIsTabLoading(false);
    }
  };

  const ensureCatMarksLoaded = async (force = false) => {
    if ((catMarks && !force) || !session?.token || !profile) return;
    setIsTabLoading(true);
    try {
      const data = await fetchImsCatMarks(session.token, profile.registerNumber, force);
      setCatMarks(data);
    } catch (err) {
      console.warn('CAT marks load notice:', err);
    } finally {
      setIsTabLoading(false);
    }
  };

  const ensureGradesLoaded = async (force = false) => {
    if ((gradesData && !force) || !session?.token || !profile) return;
    setIsTabLoading(true);
    try {
      const data = await fetchImsSemesterResults(session.token, profile.registerNumber, profile.semester, force);
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regInput.trim() || !passInput.trim()) return;

    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const res = await loginWithIms(regInput.trim(), passInput.trim());
      if (res.success && res.token && res.profile) {
        setSession({ token: res.token, profile: res.profile });
        setProfile(res.profile);
      } else {
        setLoginError(res.message || 'Invalid Register Number or Password.');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Unable to connect to RIT IMS.');
    } finally {
      setIsLoggingIn(false);
    }
  };

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

  // Dynamically compute handling faculties for the logged-in student
  const getDynamicFaculties = () => {
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
  };

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
  // VIEW 1: UNAUTHENTICATED INVITATION SCREEN
  // ─────────────────────────────────────────────────────────────
  if (!session || !user) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#FAFAFA' }}>
        <div className="bg-white border-b border-[#E5E7EB] py-10">
          <div className="container-custom">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-2 text-xs text-[#94A3B8] mb-3">
                <Link to="/" className="hover:text-[#F97316]">Home</Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-[#F97316]">Student Dashboard</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-[#1E293B] mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Student{' '}
                <span style={{ background: 'linear-gradient(135deg, #F97316, #FB923C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  Dashboard
                </span>
              </h1>
              <p className="text-[#475569]">
                View your live daily timetable, course instructors, attendance breakdown, CAT marks, and semester GPA.
              </p>
            </motion.div>
          </div>
        </div>

        <div className="container-custom py-16 flex flex-col items-center justify-center text-center pb-32">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-white border border-[#E5E7EB] rounded-3xl p-8 sm:p-10 shadow-xl space-y-6"
          >
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#FF6B00] to-[#F97316] flex items-center justify-center shadow-xl shadow-orange-500/30 mx-auto">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-[#1E293B]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Student Sign In Required
              </h2>
              <p className="text-xs text-[#64748B] leading-relaxed max-w-sm mx-auto">
                Sign in with your RIT Register Number and IMS Password to access your live student profile, 7-period timetable, handling faculties, and academic grades.
              </p>
            </div>

            <button
              onClick={openAuthModal}
              className="w-full py-4 px-6 rounded-2xl text-white font-bold text-sm bg-gradient-to-r from-[#FF6B00] to-[#F97316] hover:opacity-95 shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              <span>Sign In to Student Dashboard</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // VIEW 2: AUTHENTICATED STUDENT DASHBOARD
  // ─────────────────────────────────────────────────────────────
  const filteredGrades = gradesData?.results ? (
    selectedSemFilter === 0
      ? gradesData.results
      : gradesData.results.filter(r => r.semester === selectedSemFilter)
  ) : [];

  const rawName = profile?.name;
  const displayName = (rawName && rawName.trim() && rawName.trim() !== 'Student' && !rawName.toLowerCase().startsWith('student ('))
    ? rawName 
    : (user?.name || `Student (${profile?.registerNumber || 'RIT'})`);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAFA' }}>
      {/* Header Profile Section */}
      <div className="bg-white border-b border-[#E5E7EB] py-8">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={profile?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(displayName)}`}
                alt={displayName}
                className="w-16 h-16 rounded-2xl bg-orange-50 border-2 border-orange-200 object-cover shadow-sm shrink-0"
              />

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  {isEditingName ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        placeholder="Enter your name"
                        className="bg-slate-50 border border-[#F97316] rounded-lg px-2.5 py-1 text-sm font-bold text-[#1E293B] outline-none"
                        autoFocus
                      />
                      <button
                        onClick={handleSaveName}
                        className="p-1.5 rounded-lg bg-[#F97316] text-white hover:opacity-90 cursor-pointer"
                        title="Save name"
                      >
                        <Save className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl sm:text-2xl font-extrabold text-[#1E293B]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                        {displayName}
                      </h1>
                      <button
                        onClick={() => {
                          setNameInput(displayName);
                          setIsEditingName(true);
                        }}
                        className="p-1 rounded-lg text-[#94A3B8] hover:text-[#F97316] hover:bg-orange-50 transition-colors cursor-pointer"
                        title="Edit Display Name"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-200 uppercase flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    Verified ({profile?.registerNumber})
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#64748B] font-medium">
                  <span>Branch: <strong className="text-[#1E293B]">{profile?.department}</strong></span>
                  <span>•</span>
                  <span>Year <strong className="text-[#1E293B]">{profile?.year}</strong>, Sem <strong className="text-[#1E293B]">{profile?.semester}</strong></span>
                  <span>•</span>
                  <span>Batch: <strong className="text-[#1E293B]">{profile?.batch}</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-start md:self-auto">
              <button
                onClick={handleForceRefresh}
                disabled={isInitialLoading || isTabLoading}
                title="Fetch latest updates from RIT IMS"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#1E293B] text-xs font-bold transition-all cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isInitialLoading || isTabLoading ? 'animate-spin text-[#F97316]' : 'text-[#64748B]'}`} />
                <span>Sync IMS</span>
              </button>
              <Link
                to="/toolkit?toolkit=gpa"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-90 text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-all cursor-pointer"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>GPA Calculator</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-rose-50 text-[#64748B] hover:text-rose-600 border border-[#E5E7EB] hover:border-rose-200 text-xs font-semibold transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
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
            <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E7EB] pb-4">
                <div>
                  <h2 className="text-xl font-extrabold text-[#1E293B]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    Academic Overview & Analytics
                  </h2>
                  <p className="text-xs text-[#64748B]">
                    Performance summary calculated per Anna University 2021 Regulations
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full self-start sm:self-auto flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Synced with Live IMS Records
                </span>
              </div>

              {/* Top Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* CGPA Card */}
                <div className="bg-slate-50 border border-[#E5E7EB] hover:border-emerald-200 rounded-2xl p-5 transition-all flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Cumulative CGPA</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-3xl font-extrabold text-emerald-600" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                        {cumulativeCgpa > 0 ? cumulativeCgpa.toFixed(2) : 'N/A'}
                      </span>
                      <span className="text-xs text-[#94A3B8] font-bold">/ 10.0</span>
                    </div>
                    <p className="text-[11px] text-[#64748B] mt-1">Cleared Credits: <strong className="text-[#1E293B]">{gradesData?.totalCredits || 0}</strong></p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                </div>

                {/* Attendance Card */}
                <div className="bg-slate-50 border border-[#E5E7EB] hover:border-blue-200 rounded-2xl p-5 transition-all flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Overall Attendance</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-3xl font-extrabold text-blue-600" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                        {overallAttendancePct > 0 ? `${overallAttendancePct}%` : 'N/A'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#64748B] mt-1">
                      {attendance?.totalPresent || 0} / {attendance?.totalConducted || 0} classes attended
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200">
                    <Calendar className="w-6 h-6" />
                  </div>
                </div>

                {/* Active Arrears Card */}
                <div className={`bg-slate-50 border rounded-2xl p-5 transition-all flex items-center justify-between ${
                  activeArrearsCount > 0 ? 'border-rose-300 bg-rose-50/30' : 'border-[#E5E7EB] hover:border-emerald-200'
                }`}>
                  <div>
                    <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Active Arrears</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className={`text-3xl font-extrabold ${activeArrearsCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`} style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                        {activeArrearsCount}
                      </span>
                      <span className="text-xs text-[#94A3B8] font-bold">Arrears</span>
                    </div>
                    <p className="text-[11px] text-[#64748B] mt-1">
                      {activeArrearsCount > 0 ? 'Pending re-appear exams' : 'All enrolled subjects cleared'}
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                    activeArrearsCount > 0 ? 'bg-rose-100 text-rose-600 border-rose-200' : 'bg-emerald-100 text-emerald-600 border-emerald-200'
                  }`}>
                    {activeArrearsCount > 0 ? <AlertTriangle className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
                  </div>
                </div>
              </div>

              {/* Analytics Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
                {/* GPA Trend Line Chart */}
                <div className="lg:col-span-2 bg-slate-50 border border-[#E5E7EB] rounded-2xl p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-sm font-extrabold text-[#1E293B]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                        GPA Trend Across Semesters
                      </h4>
                      <p className="text-[11px] text-[#64748B]">Semester GPA progression curve</p>
                    </div>
                    <TrendingUp className="w-4 h-4 text-[#F97316]" />
                  </div>

                  {gpaTrend.length > 0 ? (
                    <div className="w-full bg-white rounded-xl border border-[#E5E7EB] p-4 flex flex-col justify-center">
                      <svg className="w-full h-auto overflow-visible" viewBox="0 0 600 220" style={{ maxHeight: '200px' }}>
                        <defs>
                          <linearGradient id="gpaGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#F97316" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#F97316" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>

                        {/* Grid Lines */}
                        {[40, 80, 120, 160].map(y => (
                          <line key={y} x1="40" y1={y} x2="560" y2={y} stroke="#F1F5F9" strokeDasharray="4 4" strokeWidth="1.5" />
                        ))}

                        {/* Plot Data */}
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
                                  {/* GPA Badge Background */}
                                  <rect x={p.x - 22} y={p.y - 30} width="44" height="20" rx="6" fill="#1E293B" />
                                  <text x={p.x} y={p.y - 16} textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="bold" fontFamily="Plus Jakarta Sans, sans-serif">
                                    {p.gpa.toFixed(2)}
                                  </text>

                                  {/* Node Circle */}
                                  <circle cx={p.x} cy={p.y} r="6" fill="#FFFFFF" stroke="#F97316" strokeWidth="3" />

                                  {/* Semester Label */}
                                  <text x={p.x} y="198" textAnchor="middle" fill="#64748B" fontSize="12" fontWeight="bold" fontFamily="Plus Jakarta Sans, sans-serif">
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
                    <div className="py-10 text-center text-xs text-[#94A3B8] bg-white rounded-xl border border-[#E5E7EB]">
                      Click <button onClick={() => { setActiveTab('grades'); ensureGradesLoaded(); }} className="text-[#F97316] font-bold underline cursor-pointer">Academic Grades</button> tab to sync your GPA trend.
                    </div>
                  )}
                </div>

                {/* Grade Distribution Bar Chart */}
                <div className="bg-slate-50 border border-[#E5E7EB] rounded-2xl p-5 flex flex-col justify-between">
                  <div className="mb-3">
                    <h4 className="text-sm font-extrabold text-[#1E293B]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                      Grade Distribution
                    </h4>
                    <p className="text-[11px] text-[#64748B]">Letter grades across all subjects</p>
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
                          <span className="w-6 font-mono font-bold text-[#1E293B] text-[11px] text-right">{grade}</span>
                          <div className="flex-1 h-3.5 bg-white rounded-full border border-[#E5E7EB] overflow-hidden p-0.5">
                            <div className={`h-full ${barColor} rounded-full transition-all duration-500`} style={{ width: `${Math.max(cnt > 0 ? 8 : 0, pct)}%` }} />
                          </div>
                          <span className="w-5 font-bold text-[11px] text-[#64748B] text-right">{cnt}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Navigation Tabs with Hover Pre-Fetch */}
        <div className="flex items-center border-b border-[#E5E7EB] pb-4 overflow-x-auto gap-2">
          {[
            { id: 'timetable', label: 'Timetable', icon: Clock, onHover: () => {} },
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
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-[#FF6B00] to-[#F97316] text-white shadow-md shadow-orange-500/20'
                    : 'bg-white text-[#64748B] hover:text-[#1E293B] border border-[#E5E7EB] hover:bg-slate-50'
                }`}
                style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#94A3B8]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ─── 1. TIMETABLE TAB ─── */}
        {activeTab === 'timetable' && (
          <div className="space-y-6">
            {/* Header Title & Subtitle */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E5E7EB] shadow-sm">
              <div>
                <h2 className="text-2xl font-extrabold text-[#1E293B] tracking-tight">Class Time Table</h2>
                <p className="text-xs font-semibold text-[#64748B] mt-1">
                  Weekly class schedule for Class : <span className="text-[#1E293B] font-bold">{profile?.department || 'B.Tech. AI & DS'} / {profile?.semester || 5} / E</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  CLASS Class : {profile?.department || 'B.Tech. AI & DS'} / {profile?.semester || 5} / E
                </span>
              </div>
            </div>

            {/* Toolbar: Day Filter Pills, Search Bar, Refresh */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-sm">
              {/* Day Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                {[
                  { key: 'all', label: 'All Days' },
                  { key: 'monday', label: 'Mon' },
                  { key: 'tuesday', label: 'Tue' },
                  { key: 'wednesday', label: 'Wed' },
                  { key: 'thursday', label: 'Thu' },
                  { key: 'friday', label: 'Fri' },
                  { key: 'saturday', label: 'Sat' },
                ].map((day) => {
                  const isSelected = selectedDayFilter === day.key;
                  const currentDayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][new Date().getDay()];
                  const isToday = day.key === currentDayName;
                  return (
                    <button
                      key={day.key}
                      onClick={() => setSelectedDayFilter(day.key as any)}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#FF6B00] to-[#F97316] text-white shadow-md shadow-orange-500/20'
                          : 'bg-slate-100 hover:bg-slate-200 text-[#64748B]'
                      }`}
                    >
                      <span>{day.label}</span>
                      {isToday && (
                        <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-[#F97316]'}`} />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Right Toolbar Controls */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={ttSearchQuery}
                    onChange={(e) => setTtSearchQuery(e.target.value)}
                    placeholder="Search subject or faculty"
                    className="w-full sm:w-64 pl-9 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 border border-[#E5E7EB] focus:outline-none focus:border-[#F97316] text-gray-800 placeholder-gray-400 font-medium"
                  />
                </div>

                <button
                  onClick={() => session?.token && loadInitialData(session.token, true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-[#64748B] transition-all cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* Timetable Grid Matrix */}
            {isInitialLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white rounded-3xl border border-[#E5E7EB]">
                <div className="w-8 h-8 border-3 border-[#F97316] border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-[#64748B]">Fetching timetable from RIT IMS...</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-3xl border border-[#E5E7EB] bg-white shadow-sm">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-[#E5E7EB]">
                      <th className="py-4 px-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-36 border-r border-[#E5E7EB]">
                        Period
                      </th>
                      {(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const)
                        .filter(d => selectedDayFilter === 'all' || selectedDayFilter === d)
                        .map((dayKey) => {
                          const currentDayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][new Date().getDay()];
                          const isToday = dayKey === currentDayName;
                          return (
                            <th key={dayKey} className="py-4 px-4 text-center text-xs font-extrabold text-gray-800 capitalize border-r border-[#E5E7EB] last:border-r-0 min-w-[160px]">
                              <div className="flex items-center justify-center gap-1.5">
                                <span>{dayKey}</span>
                                {isToday && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500 text-white uppercase tracking-wider">
                                    TODAY
                                  </span>
                                )}
                              </div>
                            </th>
                          );
                        })}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#E5E7EB]">
                    {[1, 2, 3, 4, 5, 6, 7].map((pNum) => {
                      const timeSlots = [
                        '08:45 - 09:40',
                        '09:40 - 10:35',
                        '10:50 - 11:45',
                        '11:45 - 12:40',
                        '01:30 - 02:25',
                        '02:25 - 03:20',
                        '03:20 - 04:15',
                      ];
                      const slotTime = timeSlots[pNum - 1] || '';

                      const activeDays = (['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const)
                        .filter(d => selectedDayFilter === 'all' || selectedDayFilter === d);

                      return (
                        <tr key={pNum} className="hover:bg-slate-50/50 transition-colors">
                          {/* Period Column */}
                          <td className="py-4 px-3 text-center border-r border-[#E5E7EB] bg-slate-50/30 align-middle">
                            <div className="font-extrabold text-xs text-emerald-600">Period {pNum}</div>
                            <div className="text-[10px] font-medium text-gray-400 mt-0.5">{slotTime}</div>
                          </td>

                          {/* Days Columns */}
                          {activeDays.map((dayKey) => {
                            const daySched = timetable?.[dayKey];
                            const rawPeriods = daySched?.[pNum] || [];
                            const periods = rawPeriods.filter((p) => {
                              if (!ttSearchQuery) return true;
                              const q = ttSearchQuery.toLowerCase();
                              return (
                                p.subjectName.toLowerCase().includes(q) ||
                                p.subjectCode.toLowerCase().includes(q) ||
                                p.staffName.toLowerCase().includes(q)
                              );
                            });

                            return (
                              <td key={dayKey} className="p-2.5 border-r border-[#E5E7EB] last:border-r-0 align-top min-w-[170px]">
                                {periods.length > 0 ? (
                                  <div className="space-y-2">
                                    {periods.map((p, idx) => (
                                      <div
                                        key={idx}
                                        className="bg-[#F8FAFC] hover:bg-slate-100 p-3 rounded-2xl border border-[#E5E7EB] shadow-xs transition-all space-y-1"
                                      >
                                        <div className="font-bold text-xs text-gray-900 leading-tight">
                                          {p.subjectName}
                                        </div>
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                                            p.type === 'LAB'
                                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                          }`}>
                                            {p.subjectCode || p.type}
                                          </span>
                                        </div>
                                        {p.staffName && (
                                          <div className="text-[11px] font-medium text-gray-500 truncate">
                                            {p.staffName}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-center h-full min-h-[64px] text-gray-300 font-bold text-sm select-none">
                                    —
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ─── 2. ATTENDANCE TAB (LAZY LOADED) ─── */}
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            {isTabLoading && !attendance ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white rounded-3xl border border-[#E5E7EB]">
                <div className="w-8 h-8 border-3 border-[#F97316] border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-[#64748B]">Fetching attendance records on demand...</p>
              </div>
            ) : attendance ? (
              <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-lg font-extrabold text-[#1E293B]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                      Subject-wise Attendance Report
                    </h3>
                    <p className="text-xs text-[#64748B]">Official attendance data fetched from RIT Student IMS</p>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="text-[10px] text-emerald-700 uppercase font-bold">Overall Average</p>
                      <p className="text-sm font-extrabold text-emerald-800">
                        {attendance.overallPercentage}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {attendance.subjects.map((sub) => {
                    const isSafe = sub.percentage >= 75;
                    return (
                      <div key={sub.code} className="p-4 rounded-2xl bg-slate-50 border border-[#E5E7EB] space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-mono font-bold text-[#F97316] bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
                              {sub.code}
                            </span>
                            <h4 className="text-sm font-bold text-[#1E293B] mt-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                              {sub.name}
                            </h4>
                          </div>
                          <span className={`text-base font-extrabold px-2.5 py-1 rounded-xl text-xs ${
                            isSafe ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {sub.percentage}%
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isSafe ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${Math.min(100, sub.percentage)}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-xs text-[#64748B] pt-1">
                          <span>Conducted: <strong className="text-[#1E293B]">{sub.conducted} hrs</strong></span>
                          <span>Attended: <strong className="text-emerald-600">{sub.present} hrs</strong></span>
                          <span>Absent: <strong className="text-rose-600">{sub.absent} hrs</strong></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* ─── 3. CAT MARKS TAB (LAZY LOADED) ─── */}
        {activeTab === 'marks' && (
          <div className="space-y-6">
            {isTabLoading && !catMarks ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white rounded-3xl border border-[#E5E7EB]">
                <div className="w-8 h-8 border-3 border-[#F97316] border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-[#64748B]">Fetching CAT marks on demand...</p>
              </div>
            ) : catMarks ? (
              <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 shadow-sm">
                <div className="mb-6">
                  <h3 className="text-lg font-extrabold text-[#1E293B]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    Continuous Assessment Test (CAT) Marks
                  </h3>
                  <p className="text-xs text-[#64748B]">Internal examination scores synchronized with college records</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#E5E7EB] text-[#94A3B8] uppercase font-bold">
                        <th className="py-3 px-4">Subject Code</th>
                        <th className="py-3 px-4">Subject Title</th>
                        <th className="py-3 px-4">Handling Faculty</th>
                        <th className="py-3 px-4 text-center">CO 1</th>
                        <th className="py-3 px-4 text-center">CO 2</th>
                        <th className="py-3 px-4 text-center">Total</th>
                        <th className="py-3 px-4 text-center">Weightage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB]">
                      {catMarks.subjects.map((sub) => (
                        <tr key={sub.code} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-[#F97316]">{sub.code}</td>
                          <td className="py-3.5 px-4 font-semibold text-[#1E293B]">{sub.name}</td>
                          <td className="py-3.5 px-4 font-medium text-[#475569]">{sub.faculty || 'Faculty In-Charge'}</td>
                          <td className="py-3.5 px-4 text-center font-bold text-[#1E293B]">{sub.co1 ?? '-'}</td>
                          <td className="py-3.5 px-4 text-center font-bold text-[#1E293B]">{sub.co2 ?? '-'}</td>
                          <td className="py-3.5 px-4 text-center font-bold text-[#1E293B]">{sub.total ?? '-'}</td>
                          <td className="py-3.5 px-4 text-center font-bold text-emerald-600">{sub.weightage ?? '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* ─── 4. GRADES TAB (LAZY LOADED) ─── */}
        {activeTab === 'grades' && (
          <div className="space-y-6">
            {isTabLoading && !gradesData ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white rounded-3xl border border-[#E5E7EB]">
                <div className="w-8 h-8 border-3 border-[#F97316] border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-[#64748B]">Fetching semester grades & calculating CGPA on demand...</p>
              </div>
            ) : gradesData ? (
              <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-extrabold text-[#1E293B]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                      Official Semester Grades & Cumulative CGPA
                    </h3>
                    <p className="text-xs text-[#64748B]">Multi-semester performance and credit calculations</p>
                  </div>

                  <Link
                    to="/toolkit?toolkit=gpa"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#F97316] border border-orange-200 text-xs font-bold transition-all"
                  >
                    <Calculator className="w-4 h-4" />
                    <span>Simulate in GPA Calculator</span>
                  </Link>
                </div>

                {/* Banner */}
                <div className="p-6 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-orange-500/20">
                  <div>
                    <p className="text-xs font-semibold text-orange-100 uppercase tracking-wider">Cumulative CGPA</p>
                    <h2 className="text-3xl sm:text-4xl font-black mt-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                      {gradesData.cgpa.toFixed(2)} <span className="text-base font-normal text-orange-100">/ 10.00</span>
                    </h2>
                    <p className="text-xs text-orange-100 mt-1">
                      Total Earned Credits: <strong className="text-white">{gradesData.totalCredits} credits</strong>
                    </p>
                  </div>
                  <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm text-center">
                    <p className="text-[10px] uppercase font-bold text-orange-100">Degree Classification</p>
                    <p className="text-sm font-black mt-0.5">First Class with Distinction</p>
                  </div>
                </div>

                {/* Semester Tabs */}
                {gradesData.results.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    <button
                      onClick={() => setSelectedSemFilter(0)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedSemFilter === 0 ? 'bg-[#1E293B] text-white shadow-xs' : 'bg-slate-100 text-[#64748B]'
                      }`}
                    >
                      All Semesters ({gradesData.results.length})
                    </button>
                    {gradesData.results.map((sem) => (
                      <button
                        key={sem.semester}
                        onClick={() => setSelectedSemFilter(sem.semester)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          selectedSemFilter === sem.semester ? 'bg-[#F97316] text-white shadow-xs' : 'bg-slate-100 text-[#64748B]'
                        }`}
                      >
                        Semester {sem.semester} (SGPA: {sem.gpa.toFixed(2)})
                      </button>
                    ))}
                  </div>
                )}

                {/* Results Table */}
                {filteredGrades.map((semResult) => (
                  <div key={semResult.semester} className="space-y-3 pt-2">
                    <div className="flex items-center justify-between bg-slate-50 px-4 py-3 rounded-xl border border-[#E5E7EB]">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-[#F97316]" />
                        <h4 className="text-sm font-bold text-[#1E293B]">
                          Semester {semResult.semester} Results
                        </h4>
                      </div>
                      <div className="flex items-center gap-3 text-xs font-bold">
                        <span className="text-[#64748B]">Credits: <strong className="text-[#1E293B]">{semResult.totalCredits}</strong></span>
                        <span className="px-2.5 py-1 rounded-lg bg-orange-100 text-[#FF6B00]">
                          SGPA: {semResult.gpa.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-[#E5E7EB] text-[#94A3B8] uppercase font-bold">
                            <th className="py-3 px-4">Course Code</th>
                            <th className="py-3 px-4">Course Title</th>
                            <th className="py-3 px-4 text-center">Credits</th>
                            <th className="py-3 px-4 text-center">Letter Grade</th>
                            <th className="py-3 px-4 text-center">Result</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E5E7EB]">
                          {semResult.subjects.map((grade) => (
                            <tr key={grade.code} className="hover:bg-slate-50 transition-colors">
                              <td className="py-3.5 px-4 font-mono font-bold text-[#F97316]">{grade.code}</td>
                              <td className="py-3.5 px-4 font-semibold text-[#1E293B]">{grade.name}</td>
                              <td className="py-3.5 px-4 text-center font-bold text-[#1E293B]">{grade.credits}</td>
                              <td className="py-3.5 px-4 text-center">
                                <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-orange-100 text-[#FF6B00]">
                                  {grade.grade}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                                  grade.result === 'PASS'
                                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                    : 'bg-rose-50 text-rose-600 border border-rose-200'
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
            <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-5 h-5 text-[#F97316]" />
                    <h3 className="text-lg font-extrabold text-[#1E293B]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                      Subject Handling Faculties
                    </h3>
                  </div>
                  <p className="text-xs text-[#64748B]">
                    Enrolled course instructors and lab in-charges assigned to your batch ({profile?.department || 'AI&DS'}).
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-[#FF6B00] border border-orange-200 self-start sm:self-auto">
                  {getDynamicFaculties().length} Active Instructors
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getDynamicFaculties().map((fac) => {
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
                      className="bg-slate-50 border border-[#E5E7EB] hover:border-[#F97316]/40 rounded-2xl p-5 shadow-xs transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-orange-100 text-[#FF6B00] font-black text-sm flex items-center justify-center border border-orange-200 shrink-0 shadow-xs">
                              {fac.name.replace('DR.', '').trim().slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="text-sm font-extrabold text-[#1E293B] flex items-center gap-1.5">
                                {matched?.name || fac.name}
                              </h4>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-white border border-[#E5E7EB] text-[#64748B]">
                                  Staff ID: {fac.code}
                                </span>
                                {qualification && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-orange-50 text-[#FF6B00] border border-orange-200">
                                    {qualification}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <p className="text-[11px] font-medium text-[#64748B]">
                            {department}
                          </p>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                              {designation}
                            </span>
                            {experience && (
                              <span className="text-[10px] font-semibold text-slate-600 bg-white border border-[#E5E7EB] px-2 py-1 rounded-lg">
                                ⌛ {experience}
                              </span>
                            )}
                          </div>

                          {interest && (
                            <p className="text-[11px] text-[#475569] font-medium line-clamp-2 pt-1">
                              <strong className="text-[#1E293B]">Specialization:</strong> {interest}
                            </p>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#94A3B8]">
                            Handled Courses:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {fac.subjects.map((sub, sIdx) => (
                              <span
                                key={sIdx}
                                className="text-[11px] font-bold text-[#1E293B] bg-white border border-[#E5E7EB] px-2.5 py-1 rounded-xl shadow-2xs"
                              >
                                {sub}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 mt-4 border-t border-[#E5E7EB] flex items-center justify-between">
                        <a
                          href={`mailto:${email}`}
                          className="text-xs font-bold text-[#F97316] hover:underline flex items-center gap-1"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Email Instructor</span>
                        </a>

                        <Link
                          to={`/faculty?search=${encodeURIComponent((matched?.name || fac.name).replace(/^DR\.\s*/i, '').trim())}`}
                          className="text-[11px] font-bold text-[#F97316] hover:text-[#FF6B00] flex items-center gap-0.5"
                        >
                          <span>Faculty Profile</span>
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
