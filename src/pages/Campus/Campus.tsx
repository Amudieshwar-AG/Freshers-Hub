import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronRight, MapPin } from 'lucide-react';
import SectionTitle from '@/components/SectionTitle/SectionTitle';
import BusCard from '@/components/BusCard/BusCard';
import FacultyCard from '@/components/FacultyCard/FacultyCard';
import { StaggerContainer, StaggerItem } from '@/components/AnimatedContainer/AnimatedContainer';
import { BUS_ROUTES, FACULTY_DATA, CAMPUS_LOCATIONS, DEPARTMENTS } from '@/constants';
import * as LucideIcons from 'lucide-react';

type Tab = 'map' | 'bus' | 'faculty';

export default function Campus() {
  const [activeTab, setActiveTab] = useState<Tab>('map');
  const [searchFaculty, setSearchFaculty] = useState('');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [busSearch, setBusSearch] = useState('');

  const filteredFaculty = FACULTY_DATA.filter((f) => {
    const matchSearch = f.name.toLowerCase().includes(searchFaculty.toLowerCase()) ||
      f.department.toLowerCase().includes(searchFaculty.toLowerCase());
    const matchDept = selectedDept === 'All Departments' || f.department === selectedDept;
    return matchSearch && matchDept;
  });

  const filteredRoutes = BUS_ROUTES.filter((r) =>
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
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAFA' }}>
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
            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredRoutes.map((route) => (
                <StaggerItem key={route.id}>
                  <BusCard route={route} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </motion.div>
        )}

        {/* Faculty Tab */}
        {activeTab === 'faculty' && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#94A3B8]" />
                <input
                  type="text"
                  placeholder="Search faculty by name or department..."
                  value={searchFaculty}
                  onChange={(e) => setSearchFaculty(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#E5E7EB] bg-white text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#F97316] transition-colors"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
              </div>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="px-4 py-3 rounded-xl border border-[#E5E7EB] bg-white text-sm text-[#475569] focus:outline-none focus:border-[#F97316] transition-colors"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFaculty.map((faculty) => (
                <StaggerItem key={faculty.id}>
                  <FacultyCard faculty={faculty} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </motion.div>
        )}
      </div>
    </div>
  );
}
