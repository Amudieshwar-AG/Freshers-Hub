import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  GraduationCap, Clock, MapPin,
  Calendar, Building, ArrowRight, LogOut,
  HelpCircle, Compass, ExternalLink, LogIn
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  fetchStudentDashboard, 
  getStoredImsSession,
  clearImsSession,
  type StudentDashboardData
} from '@/services/imsService';

export default function StudentDashboard() {
  const { user, openAuthModal, logout } = useAuth();
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'timetable' | 'location'>('timetable');

  const imsSession = getStoredImsSession();
  const effectiveRegNumber = user?.regNumber || imsSession?.student?.regNumber;

  const loadDashboard = async () => {
    if (!effectiveRegNumber) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchStudentDashboard(effectiveRegNumber, user?.email);
      setData(result);
    } catch (err: any) {
      console.error('Error loading student dashboard:', err);
      setError(err?.message || 'Unable to fetch student records from IMS.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (effectiveRegNumber) {
      loadDashboard();
    } else {
      setData(null);
    }
  }, [effectiveRegNumber, user]);

  const handleLogout = () => {
    clearImsSession();
    logout();
    setData(null);
  };

  // ─────────────────────────────────────────────────────────────
  // VIEW 1: UNAUTHENTICATED INVITATION SCREEN
  // ─────────────────────────────────────────────────────────────
  if (!effectiveRegNumber) {
    return (
      <div className="min-h-[80vh] bg-[#0a0f1d] text-slate-100 flex items-center justify-center py-12 px-4 sm:px-6">
        <div className="w-full max-w-md space-y-6 text-center">
          
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#FF6B00] to-[#F97316] p-0.5 shadow-2xl shadow-orange-500/25 mx-auto">
            <div className="w-full h-full bg-slate-950/70 rounded-[22px] flex items-center justify-center backdrop-blur-sm">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Student Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
              Sign in with your student credentials to view your live daily timetable, assigned classroom, and department info.
            </p>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4"
          >
            <button
              type="button"
              onClick={openAuthModal}
              className="w-full py-3.5 px-4 rounded-xl text-white font-bold text-sm bg-gradient-to-r from-[#FF6B00] to-[#F97316] hover:opacity-95 shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In to Access Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-[11px] text-slate-500">
              Works with Register Number (e.g. <code>2114251001</code> / <code>rit@2026</code>)
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // VIEW 2: LOGGED-IN STUDENT DASHBOARD
  // ─────────────────────────────────────────────────────────────
  const classInchargeMember = data?.facultyList.find((f) => f.isClassIncharge);

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-slate-100 pt-6 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* ─── Top Banner ─── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF6B00] to-[#F97316] p-0.5 shadow-lg shadow-orange-500/20 shrink-0">
              <div className="w-full h-full bg-slate-950/40 rounded-[14px] flex items-center justify-center backdrop-blur-sm">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  {data?.student.name || user?.name || imsSession?.student?.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                  Authenticated Student
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 font-medium">
                <span>Reg No: <strong className="text-white">{data?.student.regNumber || effectiveRegNumber}</strong></span>
                <span>•</span>
                <span>{data?.student.degree || 'B.E.'} {data?.student.department || user?.department || 'Engineering'}</span>
                {data?.student.year && (
                  <>
                    <span>•</span>
                    <span>Year {data.student.year}, Sem {data.student.semester} ({data.student.section})</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-2.5 self-start md:self-auto">
            <Link
              to={`/faculty?dept=${encodeURIComponent(data?.student.department || '')}`}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 text-orange-400 border border-orange-500/30 text-xs font-bold transition-all cursor-pointer"
            >
              <span>Faculty Directory</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-rose-500/15 text-slate-300 hover:text-rose-400 border border-white/10 hover:border-rose-500/30 text-xs font-semibold transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* ─── Key Stats Quick Bar ─── */}
        {data && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-4 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
                <Building className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Assigned Room</p>
                <p className="text-sm sm:text-base font-bold text-white truncate">{data.classLocation.roomNumber}</p>
                <p className="text-[10px] text-slate-400 truncate">{data.classLocation.floor}</p>
              </div>
            </div>

            <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-4 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                <Building className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Class Incharge</p>
                <p className="text-sm sm:text-base font-bold text-white truncate">
                  {classInchargeMember?.facultyName.split(' ')[0] || 'Assigned'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {classInchargeMember?.officeLocation || 'Staff Cabin'}
                </p>
              </div>
            </div>

            <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-4 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Branch & Section</p>
                <p className="text-sm sm:text-base font-bold text-white truncate">{data.student.departmentCode} ({data.student.section})</p>
                <p className="text-[10px] text-slate-400 truncate">Semester {data.student.semester}</p>
              </div>
            </div>

            <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-4 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Academic Batch</p>
                <p className="text-sm sm:text-base font-bold text-white truncate">{data.student.batch}</p>
                <p className="text-[10px] text-slate-400 truncate">{data.student.regulation}</p>
              </div>
            </div>
          </div>
        )}

        {/* ─── Navigation Tabs ─── */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 overflow-x-auto gap-4">
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
                      : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10'
                  }`}
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
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs font-bold text-slate-200 hover:text-white transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>View {data.student.departmentCode} Faculty Directory</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          )}
        </div>

        {/* ─── Main Content Tabs ─── */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-400 font-medium">Connecting to IMS services...</p>
          </div>
        ) : error ? (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-3xl p-8 text-center space-y-3">
            <p className="text-rose-400 font-bold text-base">Error connecting to IMS Gateway</p>
            <p className="text-slate-400 text-xs max-w-md mx-auto">{error}</p>
            <button
              onClick={() => loadDashboard()}
              className="px-4 py-2 bg-rose-500 text-white rounded-xl text-xs font-bold hover:bg-rose-600 transition-colors cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        ) : data ? (
          <div>
            {/* ─── 1. TIMETABLE TAB ─── */}
            {activeTab === 'timetable' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/40 p-4 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-orange-400" />
                    <span className="text-sm font-bold text-white tracking-wide">
                      {data.todaySchedule.dayOfWeek} SCHEDULE ({data.todaySchedule.date})
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
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
                            ? 'bg-gradient-to-b from-orange-500/15 to-slate-900 border-orange-500/50 shadow-xl shadow-orange-500/10 ring-1 ring-orange-500/40'
                            : isCompleted
                            ? 'bg-slate-950/40 border-white/5 opacity-60'
                            : 'bg-slate-900/50 border-white/10 hover:border-white/20'
                        }`}
                      >
                        {/* Header Badge */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-white/10 text-white font-bold text-xs flex items-center justify-center">
                              P{period.periodNumber}
                            </span>
                            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {period.timeSlot}
                            </span>
                          </div>

                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                              isOngoing
                                ? 'bg-orange-500 text-white animate-pulse'
                                : isCompleted
                                ? 'bg-slate-800 text-slate-400'
                                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            }`}
                          >
                            {period.status}
                          </span>
                        </div>

                        {/* Subject Details */}
                        <div className="space-y-1.5 mb-4">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono font-bold text-orange-400">
                              {period.subjectCode}
                            </span>
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-white/10 text-slate-300 uppercase">
                              {period.type}
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-white line-clamp-1">
                            {period.subjectName}
                          </h3>
                        </div>

                        {/* Footer / Instructor & Venue */}
                        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
                          <span className="truncate pr-2">{period.facultyName}</span>
                          <span className="shrink-0 font-bold text-white px-2 py-0.5 rounded-lg bg-white/10 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-orange-400" />
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
                <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
                      <Building className="w-5 h-5 text-orange-400" />
                      Classroom & Section Venue
                    </h3>
                    <p className="text-xs text-slate-400">
                      Official lecture hall allocation from Academic Registrar.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-400 uppercase font-semibold">Room Number</p>
                        <p className="text-2xl font-black text-white">{data.classLocation.roomNumber}</p>
                      </div>
                      <span className="px-3 py-1 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-xl text-xs font-bold">
                        {data.student.section} Section
                      </span>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between py-2 border-b border-white/10">
                        <span className="text-slate-400">Building Block:</span>
                        <span className="font-bold text-white text-right">{data.classLocation.buildingName}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-white/10">
                        <span className="text-slate-400">Floor & Wing:</span>
                        <span className="font-bold text-white">{data.classLocation.floor}, {data.classLocation.wing}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-slate-400">Landmark Directions:</span>
                        <span className="font-bold text-orange-400 text-right max-w-xs">{data.classLocation.landmark}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 flex flex-col justify-between space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Compass className="w-5 h-5 text-orange-400" />
                      Academic Department Details
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Official department profile, curriculum regulation, and academic guidelines for batch {data.student.batch}.
                    </p>

                    <div className="grid grid-cols-2 gap-3 pt-3">
                      <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Degree & Branch</p>
                        <p className="text-xs font-bold text-white mt-0.5">{data.student.degree} {data.student.departmentCode}</p>
                      </div>
                      <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Regulation</p>
                        <p className="text-xs font-bold text-white mt-0.5">{data.student.regulation}</p>
                      </div>
                      <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Academic Year</p>
                        <p className="text-xs font-bold text-white mt-0.5">Year {data.student.year} (Sem {data.student.semester})</p>
                      </div>
                      <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Batch Cohort</p>
                        <p className="text-xs font-bold text-white mt-0.5">{data.student.batch}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 to-indigo-500/10 border border-white/10 flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-orange-400 shrink-0" />
                    <p className="text-xs text-slate-300">
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
