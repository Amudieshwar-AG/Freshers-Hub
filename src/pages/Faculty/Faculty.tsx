import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Users, Filter, ArrowUpDown, BookOpen, ChevronRight, Sparkles, X } from 'lucide-react';
import FacultyCard from '@/components/FacultyCard/FacultyCard';
import { StaggerContainer, StaggerItem } from '@/components/AnimatedContainer/AnimatedContainer';
import { FACULTY_DATA, DEPARTMENTS } from '@/constants';
import { Link, useSearchParams } from 'react-router-dom';
import { getBackendUrl } from '@/config/api';

const DEPT_MAP: Record<string, { abrv: string; full: string }> = {
  'Computer Science & Engineering': { abrv: 'CSE', full: 'Computer Science & Engineering' },
  'Computer Science & Business Systems': { abrv: 'CSBS', full: 'Computer Science & Business Systems' },
  'Artificial Intelligence & Machine Learning': { abrv: 'AIML', full: 'Artificial Intelligence & Machine Learning' },
  'Electronics & Communication Engineering': { abrv: 'ECE', full: 'Electronics & Communication Engineering' },
  'Mechanical Engineering': { abrv: 'MECH', full: 'Mechanical Engineering' },
  'Civil Engineering': { abrv: 'CIVIL', full: 'Civil Engineering' },
  'Artificial Intelligence & Data Science': { abrv: 'AI & DS', full: 'Artificial Intelligence & Data Science' },
  'Electrical & Electronics Engineering': { abrv: 'EEE', full: 'Electrical & Electronics Engineering' },
  'Communication and Computer Engineering': { abrv: 'CCE', full: 'Communication and Computer Engineering' },
  'Electronics Engineering VLSI (Design and Technology)': { abrv: 'EE VLSI (D&T)', full: 'Electronics Engineering VLSI (Design and Technology)' },
  'Humanities & Sciences': { abrv: 'H&S', full: 'Humanities & Sciences' },
  'M.Tech (Data Science)': { abrv: 'M.TECH-DS', full: 'M.Tech (Data Science)' },
  'Mathematics': { abrv: 'MATHS', full: 'Mathematics' },
  'M.E. (VLSI Design)': { abrv: 'MEVLSI', full: 'M.E. (VLSI Design)' },
};

function normalizeDepartmentName(input?: string | null): string | null {
  if (!input) return null;
  const cleaned = input.trim();
  
  // Exact match
  if (DEPARTMENTS.includes(cleaned)) return cleaned;

  // Search by abbreviation or substring
  const upper = cleaned.toUpperCase();
  for (const [full, info] of Object.entries(DEPT_MAP)) {
    if (info.abrv.toUpperCase() === upper || full.toUpperCase() === upper || full.toLowerCase().includes(cleaned.toLowerCase())) {
      return full;
    }
  }

  return null;
}

export default function Faculty() {
  const [searchParams] = useSearchParams();
  const [searchFaculty, setSearchFaculty] = useState('');
  const [sortBy, setSortBy] = useState('Name A-Z');

  // Initial department detection (from URL query string or logged-in IMS student session)
  const initialDepartment = useMemo(() => {
    const queryDept = searchParams.get('dept');
    const matchedQuery = normalizeDepartmentName(queryDept);
    if (matchedQuery) return matchedQuery;

    const session = getStoredImsSession();
    if (session?.student?.department) {
      const matchedSession = normalizeDepartmentName(session.student.department);
      if (matchedSession) return matchedSession;
    }

    return 'All Departments';
  }, [searchParams]);

  const [selectedDept, setSelectedDept] = useState<string>(initialDepartment);

  // Update selectedDept if URL parameter changes
  useEffect(() => {
    setSelectedDept(initialDepartment);
  }, [initialDepartment]);

  const studentSession = useMemo(() => getStoredImsSession(), []);
  const isStudentDeptAutoFiltered = selectedDept !== 'All Departments' && (
    selectedDept === studentSession?.student?.department || 
    searchParams.has('dept')
  );

  const [facultyList, setFacultyList] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('RIT_LOCAL_FACULTY');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return FACULTY_DATA;
  });

  useEffect(() => {
    fetch(getBackendUrl('/api/faculty'))
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setFacultyList(data);
          localStorage.setItem('RIT_LOCAL_FACULTY', JSON.stringify(data));
        }
      })
      .catch(() => {});
  }, []);

  const filteredAndSortedFaculty = useMemo(() => {
    const filtered = facultyList.filter((f) => {
      const searchLower = searchFaculty.trim().toLowerCase();
      const matchSearch = 
        (f.name && f.name.toLowerCase().includes(searchLower)) ||
        (f.department && f.department.toLowerCase().includes(searchLower)) ||
        (f.designation && f.designation.toLowerCase().includes(searchLower)) ||
        (f.specialization && f.specialization.toLowerCase().includes(searchLower)) ||
        (f.interest && f.interest.toLowerCase().includes(searchLower));
      
      const matchDept = selectedDept === 'All Departments' || f.department === selectedDept;
      return matchSearch && matchDept;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'Name A-Z') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'Department') return (a.department || '').localeCompare(b.department || '');
      if (sortBy === 'Designation') return (a.designation || '').localeCompare(b.designation || '');
      return 0;
    });
  }, [facultyList, searchFaculty, selectedDept, sortBy]);

  const groupedFaculty = useMemo(() => {
    const groups: Record<string, typeof filteredAndSortedFaculty> = {};
    filteredAndSortedFaculty.forEach((faculty) => {
      if (!groups[faculty.department]) {
        groups[faculty.department] = [];
      }
      groups[faculty.department].push(faculty);
    });
    return groups;
  }, [filteredAndSortedFaculty]);

  const departmentOrder = useMemo(() => {
    const presentDepts = Object.keys(groupedFaculty);
    const sorted = DEPARTMENTS.filter(d => d !== 'All Departments');
    presentDepts.forEach(d => {
      if (!sorted.includes(d)) sorted.push(d);
    });
    return sorted;
  }, [groupedFaculty]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#F8FAFC]">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-white/80 to-transparent" />
        <div className="absolute top-20 -left-64 w-[500px] h-[500px] bg-purple-200/40 rounded-full blur-3xl opacity-50" />
        <div className="absolute top-40 -right-64 w-[600px] h-[600px] bg-orange-200/40 rounded-full blur-3xl opacity-40" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(148, 163, 184, 0.1) 2px, transparent 2px)', backgroundSize: '32px 32px' }} />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="bg-white border-b border-[#E9E5EE] py-10">
          <div className="container-custom">
            <div className="flex items-center gap-2 text-xs text-[#9E91B6] mb-3">
              <Link to="/" className="hover:text-[#FF6B00]">Home</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-[#FF6B00] font-semibold">Faculty Directory</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#1A0B2E] mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Faculty{' '}
              <span style={{ background: 'linear-gradient(135deg, #FF6B00, #F97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Directory
              </span>
            </h1>
            <p className="text-[#4A3E5E] text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
              Browse and connect with experienced faculty members across all departments.
            </p>
          </div>
        </div>

        <div className="container-custom pt-8 pb-20 md:pb-28 space-y-6">
          
          {/* Active Student Department Filter Badge */}
          {isStudentDeptAutoFiltered && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-center justify-between gap-3 text-orange-950 shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-[#FF6B00]" />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-orange-700">Student Department Auto-Filter</div>
                  <div className="text-xs font-medium text-orange-950">
                    Showing faculty for your department: <strong>{selectedDept}</strong>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedDept('All Departments')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-orange-300 text-xs font-bold text-orange-800 hover:bg-orange-100 transition-colors cursor-pointer shrink-0"
              >
                <span>View All Departments</span>
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}


          {/* Faculty Hero Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-5 bg-white rounded-2xl p-8 border border-[#E9E5EE] shadow-[0_4px_20px_-4px_rgba(19,9,36,0.04)] flex flex-col justify-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-full -z-10" />
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF6B00] to-[#F97316] flex items-center justify-center text-white mb-6 shadow-md shadow-orange-500/20">
                <Users className="w-7 h-7" />
              </div>
              <h2 className="text-3xl font-extrabold text-[#1A0B2E] mb-3" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Faculty Directory
              </h2>
              <p className="text-[#4A3E5E] text-xs leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                Browse and connect with experienced faculty members. Search by name, department, or specialization.
              </p>
            </div>

            <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-[#E8ECF4] shadow-sm">
              <h3 className="text-sm font-semibold text-[#1E293B] mb-4 uppercase tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>Department Overview</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { abrv: 'CSE', full: 'Computer Science & Engineering', color: 'blue' },
                  { abrv: 'CSBS', full: 'Computer Science & Business Systems', color: 'indigo' },
                  { abrv: 'AIML', full: 'Artificial Intelligence & Machine Learning', color: 'sky' },
                  { abrv: 'ECE', full: 'Electronics & Communication Engineering', color: 'purple' },
                  { abrv: 'MECH', full: 'Mechanical Engineering', color: 'orange' },
                  { abrv: 'CIVIL', full: 'Civil Engineering', color: 'emerald' },
                  { abrv: 'AI & DS', full: 'Artificial Intelligence & Data Science', color: 'pink' },
                  { abrv: 'EEE', full: 'Electrical & Electronics Engineering', color: 'yellow' },
                  { abrv: 'CCE', full: 'Communication and Computer Engineering', color: 'rose' },
                  { abrv: 'EE VLSI (D&T)', full: 'Electronics Engineering VLSI (Design and Technology)', color: 'teal' },
                  { abrv: 'H&S', full: 'Humanities & Sciences', color: 'indigo' },
                  { abrv: 'M.TECH-DS', full: 'M.Tech (Data Science)', color: 'fuchsia' },
                  { abrv: 'MATHS', full: 'Mathematics', color: 'blue' },
                  { abrv: 'MEVLSI', full: 'M.E. (VLSI Design)', color: 'rose' },
                ].filter(d => FACULTY_DATA.filter(f => f.department === d.full).length > 0).map(d => {
                  const count = FACULTY_DATA.filter(f => f.department === d.full).length;
                  const isSelected = selectedDept === d.full;
                  return (
                    <button
                      key={d.abrv}
                      onClick={() => setSelectedDept(d.full)}
                      className={`p-4 rounded-2xl border flex flex-col gap-1 transition-all text-left cursor-pointer ${
                        isSelected 
                          ? 'bg-[#FF6B00] text-white border-[#FF6B00] shadow-md' 
                          : `bg-${d.color}-50 border-${d.color}-100 hover:scale-102`
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className={`text-xs font-bold ${isSelected ? 'text-white' : `text-${d.color}-700`}`} style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{d.abrv}</span>
                        <BookOpen className={`w-3.5 h-3.5 ${isSelected ? 'text-white/80' : `text-${d.color}-400`}`} />
                      </div>
                      <span className={`text-2xl font-bold ${isSelected ? 'text-white' : 'text-[#1E293B]'}`} style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Search Section */}
          <div className="bg-white rounded-3xl p-4 border border-[#E8ECF4] shadow-sm flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="Search by faculty name, department, designation or interest..."
                value={searchFaculty}
                onChange={(e) => setSearchFaculty(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-[#F8FAFC] border-none text-sm text-[#1E293B] placeholder-[#94A3B8] focus:ring-2 focus:ring-[#FF7A00]/20 focus:outline-none transition-all"
                style={{ fontFamily: 'Inter, sans-serif' }}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] pointer-events-none" />
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="h-full pl-10 pr-10 py-3.5 rounded-2xl bg-[#F8FAFC] border-none text-sm font-medium text-[#475569] focus:ring-2 focus:ring-[#FF7A00]/20 focus:outline-none transition-all appearance-none cursor-pointer min-w-[200px]"
                  style={{ fontFamily: 'Inter, sans-serif', backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394A3B8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '0.65rem auto' }}
                >
                  {DEPARTMENTS.filter(dept => dept === 'All Departments' || FACULTY_DATA.filter((f) => f.department === dept).length > 0).map((dept) => {
                    const count = dept === 'All Departments' ? FACULTY_DATA.length : FACULTY_DATA.filter((f) => f.department === dept).length;
                    return <option key={dept} value={dept}>{dept} ({count})</option>;
                  })}
                </select>
              </div>
              <div className="relative">
                <ArrowUpDown className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] pointer-events-none" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-full pl-10 pr-10 py-3.5 rounded-2xl bg-[#F8FAFC] border-none text-sm font-medium text-[#475569] focus:ring-2 focus:ring-[#FF7A00]/20 focus:outline-none transition-all appearance-none cursor-pointer"
                  style={{ fontFamily: 'Inter, sans-serif', backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394A3B8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '0.65rem auto' }}
                >
                  <option value="Name A-Z">Sort: Name A-Z</option>
                  <option value="Department">Sort: Department</option>
                  <option value="Designation">Sort: Designation</option>
                </select>
              </div>
            </div>
          </div>

          {/* Grouped Grid */}
          {filteredAndSortedFaculty.length > 0 ? (
            <div className="space-y-12 pb-20">
              {departmentOrder.map((deptName) => {
                const facultyInDept = groupedFaculty[deptName];
                if (!facultyInDept || facultyInDept.length === 0) return null;
                const deptInfo = DEPT_MAP[deptName] || { abrv: deptName, full: deptName };

                return (
                  <div key={deptName} className="space-y-6">
                    {/* Department Header */}
                    <div className="border-l-4 border-[#FF6B00] pl-4 py-1">
                      <h2 className="text-xl font-bold text-[#1A0B2E]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                        {deptInfo.abrv}
                      </h2>
                      <p className="text-xs text-[#9E91B6] font-semibold mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {deptInfo.full}
                      </p>
                    </div>

                    {/* Department Grid */}
                    <StaggerContainer key={`${deptName}-${searchFaculty}-${selectedDept}-${sortBy}`} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {facultyInDept.map((faculty) => (
                        <StaggerItem key={faculty.id}>
                          <FacultyCard faculty={faculty} />
                        </StaggerItem>
                      ))}
                    </StaggerContainer>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-20 text-center flex flex-col items-center justify-center bg-white rounded-3xl border border-[#E8ECF4] shadow-sm">
              <Users className="w-12 h-12 text-[#CBD5E1] mb-4" />
              <h3 className="text-lg font-bold text-[#1E293B]" style={{ fontFamily: 'Poppins, sans-serif' }}>No faculty found</h3>
              <p className="text-[#64748B] text-sm mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>Try adjusting your search or filters.</p>
            </div>
          )}

          {/* Bottom Status */}
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="px-6 py-3 bg-white/80 backdrop-blur-md border border-[#E8ECF4] shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-full flex items-center gap-2 pointer-events-auto"
            >
              <span className="text-lg">👥</span>
              <span className="text-sm font-semibold text-[#1E293B]" style={{ fontFamily: 'Inter, sans-serif' }}>
                Showing {filteredAndSortedFaculty.length} Faculty Members
              </span>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
