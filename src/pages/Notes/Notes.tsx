import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Download, Filter, BookOpen, FileText, ScrollText, BookMarked, ChevronRight } from 'lucide-react';
import SectionTitle from '@/components/SectionTitle/SectionTitle';
import { StaggerContainer, StaggerItem } from '@/components/AnimatedContainer/AnimatedContainer';
import { TOOLKIT_ITEMS, DEPARTMENTS } from '@/constants';

const SEMESTERS = ['All', '1st Sem', '2nd Sem'];

const SUBJECTS_BY_SEM: Record<number, string[]> = {
  1: [
    "Communicative English",
    "Matrices and Calculus",
    "Physics for Information Science",
    "Problem Solving and C Programming",
    "Basic Electrical and Electronics Engineering",
    "Heritage of Tamils",
    "Physics Laboratory",
    "Problem Solving and C Programming Laboratory",
    "Engineering Practices Laboratory"
  ],
  2: [
    "Professional English",
    "Engineering Chemistry",
    "Statistics and Numerical Methods",
    "Python for Data Science",
    "Tamils and Technology",
    "Engineering Graphics",
    "Data Structures Design",
    "Chemistry Laboratory",
    "Python for Data Science Laboratory",
    "Communication Laboratory"
  ]
};

const TYPE_COLORS: Record<string, { bg: string; text: string; icon: React.ComponentType<{ className?: string }> }> = {
  notes: { bg: '#EFF6FF', text: '#3B82F6', icon: BookOpen },
  pyq: { bg: '#FFF7ED', text: '#F97316', icon: FileText },
  syllabus: { bg: '#ECFDF5', text: '#10B981', icon: ScrollText },
  assignment: { bg: '#FDF2F8', text: '#EC4899', icon: BookMarked },
};

interface NoteItem {
  id: string;
  title: string;
  subject: string;
  department: string;
  semester: number;
  type: string;
  downloads: number;
  fileSize: string;
  uploadedAt: string;
  downloadUrl: string;
}

export default function Notes() {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSem, setSelectedSem] = useState('All');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');

  useEffect(() => {
    fetch('http://localhost:8080/api/notes')
      .then((res) => res.json())
      .then((data) => {
        const mapped = data.map((item: any) => ({
          id: item.id.toString(),
          title: item.title,
          subject: item.subject,
          department: item.department,
          semester: item.semester,
          type: item.fileType,
          downloads: item.downloadsCount,
          fileSize: item.fileSize,
          uploadedAt: item.uploadedAt ? item.uploadedAt.split('T')[0] : '',
          downloadUrl: item.downloadUrl,
        }));
        setNotes(mapped);
      })
      .catch((err) => console.error('Error fetching notes:', err));
  }, []);

  const handleDownload = async (note: NoteItem) => {
    // Open in new tab
    window.open(note.downloadUrl, '_blank');
    
    // Call backend to increment download count
    try {
      await fetch(`http://localhost:8080/api/notes/${note.id}/download`, {
        method: 'POST',
      });
      // Increment locally to update UI immediately
      setNotes((prevNotes) =>
        prevNotes.map((n) => (n.id === note.id ? { ...n, downloads: n.downloads + 1 } : n))
      );
    } catch (err) {
      console.error('Error incrementing download count:', err);
    }
  };

  const filtered = notes.filter((note) => {
    const matchSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchSem = selectedSem === 'All' || note.semester === parseInt(selectedSem);
    const matchDept = selectedDept === 'All Departments' || note.department === selectedDept || note.department === 'All Departments';
    const matchType = selectedType === 'all' || note.type === selectedType;
    const matchSubject = selectedSubject === 'All Subjects' || note.subject === selectedSubject;
    return matchSearch && matchSem && matchDept && matchType && matchSubject;
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
              {['all', 'notes', 'pyq', 'syllabus', 'assignment'].map((type) => (
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
              {SEMESTERS.map((sem) => (
                <button
                  key={sem}
                  onClick={() => {
                    setSelectedSem(sem);
                    setSelectedSubject('All Subjects');
                  }}
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

            {/* Subject Dropdown */}
            {selectedSem !== 'All' && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#64748B]" style={{ fontFamily: 'Poppins, sans-serif' }}>Subject:</span>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#F8FAFC] border border-[#E5E7EB] text-[#475569] focus:outline-none focus:border-[#F97316] transition-all cursor-pointer"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  <option value="All Subjects">All Subjects</option>
                  {SUBJECTS_BY_SEM[parseInt(selectedSem)].map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </motion.div>

        {/* Stats Summary Banner */}
        <div className="grid grid-cols-2 gap-4 bg-white border border-[#E5E7EB] rounded-2xl p-5 mb-8" style={{ boxShadow: '0 2px 15px -3px rgba(0,0,0,0.07)' }}>
          {/* Stat 1: Notes */}
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#FFF7ED] shrink-0">
              <FileText className="w-6 h-6 text-[#F97316]" />
            </div>
            <div className="text-left">
              <div className="text-xl md:text-2xl font-bold text-[#1E293B]">{notes.length}+</div>
              <div className="text-xs text-[#64748B] font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>Notes & Materials</div>
            </div>
          </div>
          
          {/* Stat 2: Subjects */}
          <div className="flex items-center justify-center gap-4 border-l border-[#E5E7EB]">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#EFF6FF] shrink-0">
              <BookOpen className="w-6 h-6 text-[#3B82F6]" />
            </div>
            <div className="text-left pl-4">
              <div className="text-xl md:text-2xl font-bold text-[#1E293B]">
                {Array.from(new Set(notes.map(n => n.subject))).length}
              </div>
              <div className="text-xs text-[#64748B] font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>Subjects</div>
            </div>
          </div>
        </div>

        {/* Results */}
        <StaggerContainer key={filtered.length} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-12">
          {filtered.map((note) => {
            const typeConfig = TYPE_COLORS[note.type];
            const TypeIcon = typeConfig.icon;
            return (
              <StaggerItem key={note.id}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-2xl border border-[#E5E7EB] p-5 flex flex-col justify-between gap-4"
                  style={{
                    borderLeft: `4px solid ${typeConfig.text}`,
                    boxShadow: '0 2px 15px -3px rgba(0,0,0,0.07)'
                  }}
                >
                  <div className="flex gap-4">
                    {/* Visual PDF Preview Icon */}
                    <div className="w-14 h-20 border border-slate-200 rounded-xl p-2 flex flex-col justify-between bg-[#F8FAFC] shrink-0 shadow-sm">
                      <div className="bg-[#EF4444] text-[8px] font-extrabold text-white px-1 py-0.5 rounded w-fit uppercase tracking-wider" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        PDF
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <div className="w-full h-1 bg-slate-200 rounded" />
                        <div className="w-5/6 h-1 bg-slate-200 rounded" />
                        <div className="w-2/3 h-1 bg-slate-200 rounded" />
                      </div>
                    </div>

                    {/* Text Details */}
                    <div className="flex flex-col justify-between flex-1 min-w-0">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: typeConfig.bg }}>
                            <TypeIcon className="w-3.5 h-3.5" style={{ color: typeConfig.text }} />
                          </div>
                          <span
                            className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
                            style={{ backgroundColor: typeConfig.bg, color: typeConfig.text, fontFamily: 'Poppins, sans-serif' }}
                          >
                            {note.type}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-[#1E293B] line-clamp-2 leading-tight mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {note.title}
                        </h3>
                        <p className="text-[11px] text-[#64748B] font-medium truncate" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {note.subject} • Sem {note.semester}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Metadata Line */}
                  <div className="flex items-center justify-between border-t border-[#F1F5F9] pt-3 text-[11px] text-[#64748B]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-800">{note.fileSize}</span>
                      <span className="px-1 py-0.2 bg-[#F1F5F9] rounded text-[9px] font-bold text-slate-600">PDF</span>
                    </div>
                    <span>{note.uploadedAt ? `Updated ${note.uploadedAt}` : 'Recently'}</span>
                  </div>

                  {/* Download Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleDownload(note)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer"
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
