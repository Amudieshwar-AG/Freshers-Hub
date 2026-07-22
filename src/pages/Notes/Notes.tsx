import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Download, Filter, BookOpen, FileText, ScrollText, BookMarked, ChevronRight } from 'lucide-react';
import SectionTitle from '@/components/SectionTitle/SectionTitle';
import { StaggerContainer, StaggerItem } from '@/components/AnimatedContainer/AnimatedContainer';
import { TOOLKIT_ITEMS, DEPARTMENTS } from '@/constants';

const SEMESTERS = ['All', '1st Sem', '2nd Sem', '3rd Sem', '4th Sem', '5th Sem', '6th Sem', '7th Sem', '8th Sem'];

const TYPE_COLORS: Record<string, { bg: string; text: string; icon: React.ComponentType<{ className?: string }> }> = {
  notes: { bg: '#EFF6FF', text: '#3B82F6', icon: BookOpen },
  pyq: { bg: '#FFF7ED', text: '#F97316', icon: FileText },
  syllabus: { bg: '#ECFDF5', text: '#10B981', icon: ScrollText },
  assignment: { bg: '#FDF2F8', text: '#EC4899', icon: BookMarked },
};

const NOTES_DATA = [
  { id: '1', title: 'Engineering Mathematics – Unit 1-5', subject: 'Mathematics', department: 'Computer Science & Engineering', semester: 1, type: 'notes', downloads: 348, fileSize: '4.2 MB', uploadedAt: '2025-06-01' },
  { id: '2', title: 'Physics PYQ 2020-2024', subject: 'Physics', department: 'Computer Science & Engineering', semester: 1, type: 'pyq', downloads: 512, fileSize: '8.1 MB', uploadedAt: '2025-06-10' },
  { id: '3', title: 'C Programming Complete Notes', subject: 'Programming', department: 'Computer Science & Engineering', semester: 1, type: 'notes', downloads: 734, fileSize: '6.3 MB', uploadedAt: '2025-06-15' },
  { id: '4', title: 'Data Structures PYQ 2019-2024', subject: 'Data Structures', department: 'Computer Science & Engineering', semester: 3, type: 'pyq', downloads: 621, fileSize: '10.2 MB', uploadedAt: '2025-07-01' },
  { id: '5', title: 'Circuit Theory Full Notes', subject: 'Circuit Theory', department: 'Electronics & Communication', semester: 2, type: 'notes', downloads: 289, fileSize: '5.7 MB', uploadedAt: '2025-06-20' },
  { id: '6', title: 'Anna University Syllabus 2021', subject: 'Syllabus', department: 'All Departments', semester: 1, type: 'syllabus', downloads: 890, fileSize: '2.1 MB', uploadedAt: '2025-05-01' },
  { id: '7', title: 'Thermodynamics Notes', subject: 'Thermodynamics', department: 'Mechanical Engineering', semester: 3, type: 'notes', downloads: 201, fileSize: '3.9 MB', uploadedAt: '2025-06-25' },
  { id: '8', title: 'Digital Electronics PYQ', subject: 'Digital Electronics', department: 'Electronics & Communication', semester: 4, type: 'pyq', downloads: 445, fileSize: '7.3 MB', uploadedAt: '2025-07-05' },
];

export default function Notes() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSem, setSelectedSem] = useState('All');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [selectedType, setSelectedType] = useState('all');

  const filtered = NOTES_DATA.filter((note) => {
    const matchSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchSem = selectedSem === 'All' || note.semester === parseInt(selectedSem);
    const matchDept = selectedDept === 'All Departments' || note.department === selectedDept || note.department === 'All Departments';
    const matchType = selectedType === 'all' || note.type === selectedType;
    return matchSearch && matchSem && matchDept && matchType;
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAFA' }}>
      {/* Header */}
      <div className="bg-white border-b border-[#E5E7EB] py-10">
        <div className="container-custom">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center gap-2 text-xs text-[#94A3B8] mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
              <span>Home</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-[#F97316]">Notes & PYQs</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#1E293B] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
              Notes &{' '}
              <span style={{ background: 'linear-gradient(135deg, #F97316, #FB923C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                PYQs
              </span>
            </h1>
            <p className="text-[#475569]" style={{ fontFamily: 'Inter, sans-serif' }}>
              Access semester-wise notes, previous year question papers, and study materials.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container-custom py-10">
        {/* Search + Filters */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white rounded-2xl border border-[#E5E7EB] p-5 mb-8"
          style={{ boxShadow: '0 2px 15px -3px rgba(0,0,0,0.07)' }}
        >
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search notes, subjects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#E5E7EB] text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#F97316] transition-colors"
              style={{ fontFamily: 'Inter, sans-serif' }}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            {/* Type Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-[#94A3B8]" />
              {['all', 'notes', 'pyq', 'syllabus'].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all"
                  style={{
                    fontFamily: 'Poppins, sans-serif',
                    backgroundColor: selectedType === type ? '#F97316' : '#F8FAFC',
                    color: selectedType === type ? 'white' : '#475569',
                    border: `1px solid ${selectedType === type ? '#F97316' : '#E5E7EB'}`,
                  }}
                >
                  {type === 'all' ? 'All Types' : type.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Semester Filter */}
            <div className="flex gap-2 flex-wrap">
              {SEMESTERS.slice(0, 5).map((sem) => (
                <button
                  key={sem}
                  onClick={() => setSelectedSem(sem)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{
                    fontFamily: 'Poppins, sans-serif',
                    backgroundColor: selectedSem === sem ? '#1E293B' : '#F8FAFC',
                    color: selectedSem === sem ? 'white' : '#475569',
                    border: `1px solid ${selectedSem === sem ? '#1E293B' : '#E5E7EB'}`,
                  }}
                >
                  {sem}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Results */}
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-12">
          {filtered.map((note) => {
            const typeConfig = TYPE_COLORS[note.type];
            const TypeIcon = typeConfig.icon;
            return (
              <StaggerItem key={note.id}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-2xl border border-[#E5E7EB] p-5 flex flex-col gap-3"
                  style={{ boxShadow: '0 2px 15px -3px rgba(0,0,0,0.07)' }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: typeConfig.bg }}>
                      <TypeIcon className="w-5 h-5 text-orange-500" />
                    </div>
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"
                      style={{ backgroundColor: typeConfig.bg, color: typeConfig.text, fontFamily: 'Poppins, sans-serif' }}
                    >
                      {note.type}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#1E293B] leading-snug mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {note.title}
                    </h3>
                    <p className="text-xs text-[#94A3B8]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {note.subject} · Sem {note.semester}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#94A3B8] pt-2 border-t border-[#E5E7EB]">
                    <span style={{ fontFamily: 'Inter, sans-serif' }}>{note.downloads} downloads · {note.fileSize}</span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white"
                    style={{
                      fontFamily: 'Poppins, sans-serif',
                      background: 'linear-gradient(135deg, #F97316, #FB923C)',
                    }}
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </motion.button>
                </motion.div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        {/* Toolkit Section */}
        <SectionTitle tag="Useful Downloads" title="Student" highlight="Toolkit" align="left" />
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TOOLKIT_ITEMS.map((item) => (
            <StaggerItem key={item.id}>
              <motion.a
                href={item.url}
                whileHover={{ y: -3 }}
                className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-[#E5E7EB] cursor-pointer group"
                style={{ boxShadow: '0 2px 15px -3px rgba(0,0,0,0.07)' }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#FFF7ED] shrink-0">
                  <Download className="w-4.5 h-4.5 text-[#F97316]" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#1E293B] group-hover:text-[#F97316] transition-colors" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {item.title}
                  </div>
                  <div className="text-xs text-[#94A3B8]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {item.description}
                  </div>
                </div>
              </motion.a>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </div>
  );
}
