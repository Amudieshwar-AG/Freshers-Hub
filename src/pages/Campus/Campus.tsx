import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronRight, MapPin, Users, BookOpen, Filter, ArrowUpDown, Loader2 } from 'lucide-react';
import SectionTitle from '@/components/SectionTitle/SectionTitle';
import BusCard from '@/components/BusCard/BusCard';
import FacultyCard from '@/components/FacultyCard/FacultyCard';
import { StaggerContainer, StaggerItem } from '@/components/AnimatedContainer/AnimatedContainer';
import { FACULTY_DATA, CAMPUS_LOCATIONS, DEPARTMENTS } from '@/constants';
import * as LucideIcons from 'lucide-react';
import { useLocation } from 'react-router-dom';
import type { BusRoute } from '@/types';

type Tab = 'map' | 'bus' | 'faculty';

export default function Campus() {
  const location = useLocation();
  const queryTab = new URLSearchParams(location.search).get('tab') as Tab;
  const [activeTab, setActiveTab] = useState<Tab>(
    queryTab === 'map' || queryTab === 'bus' || queryTab === 'faculty' ? queryTab : 'map'
  );
  const [searchFaculty, setSearchFaculty] = useState('');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [sortBy, setSortBy] = useState('Name A-Z');
  const [busSearch, setBusSearch] = useState('');
  const [busRoutes, setBusRoutes] = useState<BusRoute[]>([]);
  const [loadingBus, setLoadingBus] = useState(true);

  // Sync tab state when URL query parameter changes
  useEffect(() => {
    const qTab = new URLSearchParams(location.search).get('tab') as Tab;
    if (qTab === 'map' || qTab === 'bus' || qTab === 'faculty') {
      setActiveTab(qTab);
    }
  }, [location.search]);

  useEffect(() => {
    if (activeTab === 'bus' && busRoutes.length === 0) {
      setLoadingBus(true);
      fetch('http://localhost:8080/api/bus-routes')
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch');
          return res.json();
        })
        .then((data) => {
          setBusRoutes(data);
          setLoadingBus(false);
        })
        .catch((err) => {
          console.error('Error fetching bus routes:', err);
          setLoadingBus(false);
        });
    }
  }, [activeTab, busRoutes.length]);

  const filteredAndSortedFaculty = useMemo(() => {
    const filtered = FACULTY_DATA.filter((f) => {
      const searchLower = searchFaculty.trim().toLowerCase();
      const matchSearch = 
        f.name.toLowerCase().includes(searchLower) ||
        f.department.toLowerCase().includes(searchLower) ||
        f.designation.toLowerCase().includes(searchLower) ||
        (f.specialization && f.specialization.toLowerCase().includes(searchLower));
      
      const matchDept = selectedDept === 'All Departments' || f.department === selectedDept;
      return matchSearch && matchDept;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'Name A-Z') return a.name.localeCompare(b.name);
      if (sortBy === 'Department') return a.department.localeCompare(b.department);
      if (sortBy === 'Designation') return a.designation.localeCompare(b.designation);
      return 0;
    });
  }, [searchFaculty, selectedDept, sortBy]);

  const filteredRoutes = busRoutes.filter((r) =>
    r.name.toLowerCase().includes(busSearch.toLowerCase()) ||
    r.from.toLowerCase().includes(busSearch.toLowerCase()) ||
    r.number.toLowerCase().includes(busSearch.toLowerCase())
  );

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: 'map', label: 'Campus Map', icon: 'Map' },
    { id: 'bus', label: 'Bus Routes', icon: 'Bus' },
    { id: 'faculty', label: 'Faculty Directory', icon: 'Users' },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: activeTab === 'faculty' ? '#F8FAFC' : '#FAFAFA' }}>
      {/* Background decorations for Faculty tab */}
      {activeTab === 'faculty' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-white/80 to-transparent" />
          <div className="absolute top-20 -left-64 w-[500px] h-[500px] bg-purple-200/40 rounded-full blur-3xl opacity-50" />
          <div className="absolute top-40 -right-64 w-[600px] h-[600px] bg-orange-200/40 rounded-full blur-3xl opacity-40" />
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(148, 163, 184, 0.1) 2px, transparent 2px)', backgroundSize: '32px 32px' }} />
        </div>
      )}
      <div className="relative z-10">
        {/* Header */}
      <div className="bg-white border-b border-[#E5E7EB] py-10">
        <div className="container-custom">
          <div className="flex items-center gap-2 text-xs text-[#94A3B8] mb-3">
            <span>Home</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#F97316]">Campus</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#1E293B] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            Explore{' '}
            <span style={{ background: 'linear-gradient(135deg, #F97316, #FB923C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Campus
            </span>
          </h1>
          <p className="text-[#475569]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Navigate campus, find bus routes, and connect with faculty.
          </p>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Tabs */}
        <div className="flex gap-2 bg-white rounded-2xl p-2 border border-[#E5E7EB] mb-8 w-fit" style={{ boxShadow: '0 2px 15px -3px rgba(0,0,0,0.07)' }}>
          {TABS.map((tab) => {
            const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[tab.icon];
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  color: activeTab === tab.id ? 'white' : '#475569',
                }}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="campus-tab"
                    className="absolute inset-0 rounded-xl"
                    style={{ background: 'linear-gradient(135deg, #F97316, #FB923C)' }}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {Icon && <Icon className="w-4 h-4" />}
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Map Tab */}
        {activeTab === 'map' && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="bg-white rounded-3xl border border-[#E5E7EB] overflow-hidden mb-8" style={{ boxShadow: '0 4px 25px -5px rgba(0,0,0,0.1)' }}>
              <div
                className="h-96 flex items-center justify-center relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #1E293B, #334155)' }}
              >
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: 'linear-gradient(rgba(249,115,22,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.5) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                  }}
                />
                {/* Mock campus blocks */}
                {[
                  { label: 'CSE Block', x: '20%', y: '25%', w: '14%', h: '18%' },
                  { label: 'ECE Block', x: '38%', y: '25%', w: '12%', h: '18%' },
                  { label: 'Library', x: '58%', y: '30%', w: '16%', h: '14%' },
                  { label: 'Canteen', x: '65%', y: '58%', w: '12%', h: '12%' },
                  { label: 'Hostel', x: '18%', y: '58%', w: '14%', h: '20%' },
                  { label: 'Auditorium', x: '40%', y: '55%', w: '18%', h: '14%' },
                ].map((block, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.05 }}
                    className="absolute flex items-center justify-center rounded-lg cursor-pointer group"
                    style={{
                      left: block.x,
                      top: block.y,
                      width: block.w,
                      height: block.h,
                      backgroundColor: 'rgba(249,115,22,0.15)',
                      border: '1px solid rgba(249,115,22,0.4)',
                    }}
                  >
                    <span className="text-[10px] text-orange-300 font-medium text-center leading-tight px-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {block.label}
                    </span>
                  </motion.div>
                ))}

                {/* Pin */}
                <div className="relative z-10 text-center">
                  <div className="flex items-center gap-2 text-white/40 text-sm">
                    <MapPin className="w-4 h-4" />
                    <span>RIT Campus, Kuthambakkam, Chennai</span>
                  </div>
                </div>
              </div>

              {/* Quick Nav */}
              <div className="p-6 grid grid-cols-4 sm:grid-cols-8 gap-4">
                {CAMPUS_LOCATIONS.map((loc) => {
                  const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[loc.icon];
                  return (
                    <motion.button
                      key={loc.id}
                      whileHover={{ y: -3, backgroundColor: '#FFF7ED' }}
                      className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all hover:border-[#FED7AA] border border-transparent"
                    >
                      <div className="w-10 h-10 rounded-xl bg-[#F8FAFC] flex items-center justify-center">
                        {Icon && <Icon className="w-5 h-5 text-[#F97316]" />}
                      </div>
                      <span className="text-[11px] text-[#475569] text-center leading-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {loc.name}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Bus Routes Tab */}
        {activeTab === 'bus' && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="Search bus routes..."
                value={busSearch}
                onChange={(e) => setBusSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#E5E7EB] bg-white text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#F97316] transition-colors"
                style={{ fontFamily: 'Inter, sans-serif' }}
              />
            </div>
            
            {loadingBus ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="w-8 h-8 text-[#F97316] animate-spin" />
                <p className="text-sm text-[#94A3B8]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Loading live bus routes from RIT Transport...
                </p>
              </div>
            ) : filteredRoutes.length === 0 ? (
              <div className="text-center py-16 text-[#94A3B8]">
                <p className="text-sm font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  No bus routes found matching "{busSearch}"
                </p>
              </div>
            ) : (
              <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredRoutes.map((route) => (
                  <StaggerItem key={route.id}>
                    <BusCard route={route} />
                  </StaggerItem>
                ))}
              </StaggerContainer>
            )}
          </motion.div>
        )}

        {/* Faculty Tab */}
        {activeTab === 'faculty' && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-8">
            {/* Faculty Hero Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-5 bg-white rounded-3xl p-8 border border-[#E8ECF4] shadow-sm flex flex-col justify-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-full -z-10" />
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF7A00] to-[#FB923C] flex items-center justify-center text-white mb-6 shadow-md">
                  <Users className="w-7 h-7" />
                </div>
                <h2 className="text-3xl font-bold text-[#1E293B] mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Faculty Directory
                </h2>
                <p className="text-[#64748B] text-sm leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
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
                  ].map(d => {
                    const count = FACULTY_DATA.filter(f => f.department === d.full).length;
                    return (
                      <div key={d.abrv} className={`p-4 rounded-2xl bg-${d.color}-50 border border-${d.color}-100 flex flex-col gap-1 transition-transform hover:scale-105 cursor-default`}>
                        <div className="flex justify-between items-center">
                          <span className={`text-xs font-bold text-${d.color}-700`} style={{ fontFamily: 'Poppins, sans-serif' }}>{d.abrv}</span>
                          <BookOpen className={`w-3.5 h-3.5 text-${d.color}-400`} />
                        </div>
                        <span className="text-2xl font-bold text-[#1E293B]" style={{ fontFamily: 'Poppins, sans-serif' }}>{count}</span>
                      </div>
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
                  placeholder="Search by faculty name, department, designation or specialization..."
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
                    {DEPARTMENTS.map((dept) => {
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

            {/* Grid */}
            {filteredAndSortedFaculty.length > 0 ? (
              <StaggerContainer key={`${searchFaculty}-${selectedDept}-${sortBy}`} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                {filteredAndSortedFaculty.map((faculty) => (
                  <StaggerItem key={faculty.id}>
                    <FacultyCard faculty={faculty} />
                  </StaggerItem>
                ))}
              </StaggerContainer>
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
                className="px-6 py-3 bg-white/80 backdrop-blur-md border border-[#E8ECF4] shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-full flex items-center gap-2"
              >
                <span className="text-lg">👥</span>
                <span className="text-sm font-semibold text-[#1E293B]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Showing {filteredAndSortedFaculty.length} Faculty Members
                </span>
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>
      </div>
    </div>
  );
}
