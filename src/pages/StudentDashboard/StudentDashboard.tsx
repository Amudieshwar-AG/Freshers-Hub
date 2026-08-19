import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, Clock, MapPin, Users,
  Calendar, Building, ShieldCheck, 
  Sparkles, KeyRound, ArrowRight, LogOut,
  AlertCircle, User, HelpCircle, Compass, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  fetchStudentDashboard, 
  loginWithIms,
  fetchMockImsUsers,
  getStoredImsSession,
  clearImsSession,
  type StudentDashboardData,
  type MockUserCredential
} from '@/services/imsService';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'timetable' | 'location'>('timetable');

  // IMS Authentication Session State
  const [imsSession, setImsSession] = useState<{ token: string; student: any } | null>(getStoredImsSession());
  const [regNumberInput, setRegNumberInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [mockUsers, setMockUsers] = useState<MockUserCredential[]>([]);
  const [showDemoBox, setShowDemoBox] = useState(false);

  // Load available mock accounts for demo helper
  useEffect(() => {
    fetchMockImsUsers().then((users) => {
      setMockUsers(users);
      if (users.length > 0 && !regNumberInput) {
        setRegNumberInput(users[0].regNumber);
        setPasswordInput(users[0].defaultPassword);
      }
    });
  }, []);

  const loadDashboard = async () => {
    if (!imsSession?.student?.regNumber) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchStudentDashboard(imsSession.student.regNumber);
      setData(res);
    } catch (err: any) {
      console.error('Error loading student dashboard:', err);
      setError(err.message || 'Failed to fetch timetable and classroom location.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (imsSession) {
      loadDashboard();
    }
  }, [imsSession]);

  const handleImsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNumberInput.trim() || !passwordInput.trim()) return;

    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const session = await loginWithIms(regNumberInput.trim(), passwordInput.trim());
      setImsSession(session);
    } catch (err: any) {
      setLoginError(err.message || 'Invalid credentials or Register Number not found.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleQuickFillMock = (mock: MockUserCredential) => {
    setRegNumberInput(mock.regNumber);
    setPasswordInput(mock.defaultPassword);
  };

  const handleLogoutIms = () => {
    clearImsSession();
    setImsSession(null);
    setData(null);
  };

  // ─────────────────────────────────────────────────────────────
  // VIEW 1: IMS STUDENT LOGIN PORTAL (When not signed in to IMS)
  // ─────────────────────────────────────────────────────────────
  if (!imsSession) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#FAFAFA' }}>
        {/* Header */}
        <div className="bg-white border-b border-[#E5E7EB] py-10">
          <div className="container-custom">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="flex items-center gap-2 text-xs text-[#94A3B8] mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                <Link to="/" className="hover:text-[#F97316]">Home</Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-[#F97316]">Time Table</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-[#1E293B] mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                IMS Student{' '}
                <span style={{ background: 'linear-gradient(135deg, #F97316, #FB923C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  Portal
                </span>
              </h1>
              <p className="text-[#475569]" style={{ fontFamily: 'Inter, sans-serif' }}>
                Enter your official college Register Number and Password to access your timetable and assigned classroom venue.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Login Form Container */}
        <div className="container-custom py-12 flex items-center justify-center pb-28">
          <div className="w-full max-w-md space-y-6">
            
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF6B00] to-[#F97316] flex items-center justify-center shadow-xl shadow-orange-500/30 mx-auto">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-extrabold text-[#1E293B]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Sign In to Student Portal
              </h2>
              <p className="text-xs text-[#64748B] max-w-sm mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
                Enter your official college credentials below
              </p>
            </div>

            {/* Login Form Card */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-[#E5E7EB] rounded-3xl p-6 sm:p-8 shadow-xl space-y-5"
            >
              {loginError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700 font-medium">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleImsLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1.5 flex items-center gap-1.5" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    <User className="w-3.5 h-3.5 text-[#F97316]" />
                    Register Number / Roll No
                  </label>
                  <input
                    type="text"
                    value={regNumberInput}
                    onChange={(e) => setRegNumberInput(e.target.value)}
                    placeholder="e.g. 2114251001"
                    className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm text-[#1E293B] placeholder-[#94A3B8] outline-none focus:border-[#F97316] focus:bg-white transition-colors font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1.5 flex items-center gap-1.5" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    <KeyRound className="w-3.5 h-3.5 text-[#F97316]" />
                    IMS Password
                  </label>
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm text-[#1E293B] placeholder-[#94A3B8] outline-none focus:border-[#F97316] focus:bg-white transition-colors font-mono"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-3.5 px-4 rounded-xl text-white font-bold text-sm bg-gradient-to-r from-[#FF6B00] to-[#F97316] hover:opacity-95 shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                >
                  {isLoggingIn ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Sign In to Student Portal</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Expandable Demo Helper */}
              <div className="pt-3 border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => setShowDemoBox(!showDemoBox)}
                  className="w-full text-center text-xs font-bold text-[#F97316] hover:underline flex items-center justify-center gap-1 cursor-pointer"
                  style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {showDemoBox ? 'Hide Demo Accounts' : 'Testing / Demo Accounts'}
                </button>

                <AnimatePresence>
                  {showDemoBox && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden mt-3 space-y-2"
                    >
                      <p className="text-[11px] text-[#64748B] text-center" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Click any sample student below to auto-fill the login form:
                      </p>
                      <div className="space-y-1.5">
                        {mockUsers.map((mock) => (
                          <button
                            key={mock.regNumber}
                            type="button"
                            onClick={() => handleQuickFillMock(mock)}
                            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAFC] hover:bg-white border border-[#E5E7EB] text-left text-xs transition-colors cursor-pointer"
                          >
                            <div>
                              <p className="font-bold text-[#1E293B]">{mock.studentName}</p>
                              <p className="text-[10px] text-[#64748B]">Reg: {mock.regNumber} ({mock.department})</p>
                            </div>
                            <span className="text-[10px] text-[#F97316] font-mono font-bold">Fill Form</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // VIEW 2: LOGGED-IN STUDENT DASHBOARD
  // ─────────────────────────────────────────────────────────────
  const classInchargeMember = data?.facultyList.find((f) => f.isClassIncharge);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAFA' }}>
      {/* Header */}
      <div className="bg-white border-b border-[#E5E7EB] py-8">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF6B00] to-[#F97316] flex items-center justify-center shadow-lg shadow-orange-500/30 shrink-0">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-[#1E293B] tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    {data?.student.name || imsSession.student.name}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-200 uppercase">
                    Authenticated Student
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#64748B] font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <span>Reg No: <strong className="text-[#1E293B]">{data?.student.regNumber || imsSession.student.regNumber}</strong></span>
                  <span>•</span>
                  <span>{data?.student.degree} {data?.student.department}</span>
                  <span>•</span>
                  <span>Year {data?.student.year}, Sem {data?.student.semester} ({data?.student.section})</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-start md:self-auto">
              <button
                onClick={handleLogoutIms}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-rose-50 text-[#64748B] hover:text-rose-600 border border-[#E5E7EB] hover:border-rose-200 text-xs font-semibold transition-all cursor-pointer"
                style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-8 pb-32 space-y-8">
        {/* ─── Key Stats Quick Bar ─── */}
        {data && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 flex items-center gap-3.5 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#F97316] shrink-0">
                <Building className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">Assigned Room</p>
                <p className="text-sm sm:text-base font-extrabold text-[#1E293B] truncate" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{data.classLocation.roomNumber}</p>
                <p className="text-[10px] text-[#64748B] truncate">{data.classLocation.floor}</p>
              </div>
            </div>

            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 flex items-center gap-3.5 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">Class Incharge</p>
                <p className="text-sm sm:text-base font-extrabold text-[#1E293B] truncate" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  {classInchargeMember?.facultyName.split(' ')[0] || 'Assigned'}
                </p>
                <p className="text-[10px] text-[#64748B] truncate">
                  {classInchargeMember?.officeLocation || 'Staff Cabin'}
                </p>
              </div>
            </div>

            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 flex items-center gap-3.5 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">Branch & Section</p>
                <p className="text-sm sm:text-base font-extrabold text-[#1E293B] truncate" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{data.student.departmentCode} ({data.student.section})</p>
                <p className="text-[10px] text-[#64748B] truncate">Semester {data.student.semester}</p>
              </div>
            </div>

            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 flex items-center gap-3.5 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">Academic Batch</p>
                <p className="text-sm sm:text-base font-extrabold text-[#1E293B] truncate" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{data.student.batch}</p>
                <p className="text-[10px] text-[#64748B] truncate">{data.student.regulation}</p>
              </div>
            </div>
          </div>
        )}

        {/* ─── Navigation Tabs ─── */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4 overflow-x-auto gap-4">
          <div className="flex items-center gap-2">
            {[
              { id: 'timetable', label: "Today's Timetable", icon: Clock },
              { id: 'location', label: 'Class & Building Location', icon: MapPin },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-[#FF6B00] to-[#F97316] text-white shadow-md shadow-orange-500/20'
                      : 'bg-white hover:bg-slate-50 text-[#475569] hover:text-[#1E293B] border border-[#E5E7EB]'
                  }`}
                  style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {data && (
            <Link
              to={`/faculty?dept=${encodeURIComponent(data.student.department)}`}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-[#E5E7EB] text-xs font-bold text-[#475569] hover:text-[#1E293B] transition-all cursor-pointer whitespace-nowrap shrink-0"
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              <Users className="w-4 h-4 text-[#F97316]" />
              <span>View {data.student.departmentCode} Faculty Directory</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#94A3B8]" />
            </Link>
          )}
        </div>

        {/* ─── Main Content Tabs ─── */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-3 border-[#F97316] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-[#64748B] font-medium">Connecting to IMS services...</p>
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-200 rounded-3xl p-8 text-center space-y-3">
            <p className="text-rose-700 font-bold text-base">Error connecting to IMS Gateway</p>
            <p className="text-[#64748B] text-xs max-w-md mx-auto">{error}</p>
            <button
              onClick={() => loadDashboard()}
              className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition-colors"
            >
              Retry Connection
            </button>
          </div>
        ) : data ? (
          <div>
            {/* ─── 1. TIMETABLE TAB ─── */}
            {activeTab === 'timetable' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#F97316]" />
                    <span className="text-sm font-bold text-[#1E293B] tracking-wide" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                      {data.todaySchedule.dayOfWeek} SCHEDULE ({data.todaySchedule.date})
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1 text-emerald-600 font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Live Status Active
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.todaySchedule.periods.map((period) => {
                    const isOngoing = period.status === 'ONGOING';
                    const isCompleted = period.status === 'COMPLETED';

                    return (
                      <motion.div
                        key={period.periodNumber}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`relative rounded-2xl p-5 border transition-all ${
                          isOngoing
                            ? 'bg-gradient-to-b from-orange-500/10 via-white to-white border-[#F97316] shadow-md ring-1 ring-orange-400/30'
                            : isCompleted
                            ? 'bg-slate-50/80 border-[#E5E7EB] opacity-60'
                            : 'bg-white border-[#E5E7EB] hover:border-slate-300 shadow-sm'
                        }`}
                      >
                        {/* Header Badge */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-slate-100 text-[#1E293B] font-bold text-xs flex items-center justify-center">
                              P{period.periodNumber}
                            </span>
                            <span className="text-xs font-semibold text-[#64748B] flex items-center gap-1">
                              <Clock className="w-3 h-3 text-[#94A3B8]" />
                              {period.timeSlot}
                            </span>
                          </div>

                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                              isOngoing
                                ? 'bg-[#F97316] text-white animate-pulse'
                                : isCompleted
                                ? 'bg-slate-200 text-[#64748B]'
                                : 'bg-blue-50 text-blue-600 border border-blue-200'
                            }`}
                          >
                            {period.status}
                          </span>
                        </div>

                        {/* Subject Details */}
                        <div className="space-y-1.5 mb-4">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono font-bold text-[#F97316]">
                              {period.subjectCode}
                            </span>
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-100 text-[#475569] uppercase">
                              {period.type}
                            </span>
                          </div>
                          <h3 className="text-base font-extrabold text-[#1E293B] line-clamp-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                            {period.subjectName}
                          </h3>
                        </div>

                        {/* Footer / Instructor & Venue */}
                        <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-between text-xs text-[#475569]">
                          <span className="truncate pr-2 font-medium">{period.facultyName}</span>
                          <span className="shrink-0 font-bold text-[#1E293B] px-2 py-0.5 rounded-lg bg-slate-100 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#F97316]" />
                            {period.venue}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ─── 2. CLASS LOCATION TAB ─── */}
            {activeTab === 'location' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 space-y-6 shadow-sm">
                  <div>
                    <h3 className="text-lg font-extrabold text-[#1E293B] flex items-center gap-2 mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                      <Building className="w-5 h-5 text-[#F97316]" />
                      Classroom & Section Venue
                    </h3>
                    <p className="text-xs text-[#64748B]">
                      Official lecture hall allocation from Academic Registrar.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-[#E5E7EB] flex items-center justify-between">
                      <div>
                        <p className="text-xs text-[#64748B] uppercase font-semibold">Room Number</p>
                        <p className="text-2xl font-black text-[#1E293B]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{data.classLocation.roomNumber}</p>
                      </div>
                      <span className="px-3 py-1 bg-orange-50 text-[#F97316] border border-orange-200 rounded-xl text-xs font-bold">
                        {data.student.section} Section
                      </span>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between py-2 border-b border-[#E5E7EB]">
                        <span className="text-[#64748B]">Building Block:</span>
                        <span className="font-bold text-[#1E293B] text-right">{data.classLocation.buildingName}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-[#E5E7EB]">
                        <span className="text-[#64748B]">Floor & Wing:</span>
                        <span className="font-bold text-[#1E293B]">{data.classLocation.floor}, {data.classLocation.wing}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-[#64748B]">Landmark Directions:</span>
                        <span className="font-bold text-[#F97316] text-right max-w-xs">{data.classLocation.landmark}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-sm">
                  <div className="space-y-3">
                    <h3 className="text-lg font-extrabold text-[#1E293B] flex items-center gap-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                      <Compass className="w-5 h-5 text-[#F97316]" />
                      Academic Department Details
                    </h3>
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      Official department profile, curriculum regulation, and academic guidelines for batch {data.student.batch}.
                    </p>

                    <div className="grid grid-cols-2 gap-3 pt-3">
                      <div className="p-3 bg-slate-50 rounded-xl border border-[#E5E7EB]">
                        <p className="text-[10px] uppercase font-bold text-[#94A3B8]">Degree & Branch</p>
                        <p className="text-xs font-bold text-[#1E293B] mt-0.5">{data.student.degree} {data.student.departmentCode}</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-[#E5E7EB]">
                        <p className="text-[10px] uppercase font-bold text-[#94A3B8]">Regulation</p>
                        <p className="text-xs font-bold text-[#1E293B] mt-0.5">{data.student.regulation}</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-[#E5E7EB]">
                        <p className="text-[10px] uppercase font-bold text-[#94A3B8]">Academic Year</p>
                        <p className="text-xs font-bold text-[#1E293B] mt-0.5">Year {data.student.year} (Sem {data.student.semester})</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-[#E5E7EB]">
                        <p className="text-[10px] uppercase font-bold text-[#94A3B8]">Batch Cohort</p>
                        <p className="text-xs font-bold text-[#1E293B] mt-0.5">{data.student.batch}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-[#F97316] shrink-0" />
                    <p className="text-xs text-[#475569]">
                      Need classroom adjustment? Contact your Class Incharge or Head of Department.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
