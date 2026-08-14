import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, Building2, User, X, BookOpen, ChevronRight, Monitor, Command, GraduationCap, Briefcase, Microscope, Clock } from 'lucide-react';
import type { Faculty } from '@/types';

interface FacultyCardProps {
  faculty: Faculty;
}

const AVATAR_COLORS = [
  ['#F97316', '#FB923C'],
  ['#8B5CF6', '#A78BFA'],
  ['#10B981', '#34D399'],
  ['#3B82F6', '#60A5FA'],
  ['#EC4899', '#F472B6'],
  ['#F59E0B', '#FCD34D'],
];

export default function FacultyCard({ faculty }: FacultyCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [showEmailOptions, setShowEmailOptions] = useState(false);
  
  const colorIndex = parseInt(faculty.id) % AVATAR_COLORS.length;
  const [from, to] = AVATAR_COLORS[colorIndex];
  const initials = faculty.name
    .split(' ')
    .filter((_, i) => i === 0 || i === faculty.name.split(' ').length - 1)
    .map((n) => n[0])
    .join('');

  const mailOptions = [
    { name: 'Default Mail App', url: `mailto:${faculty.email}`, icon: Monitor, color: 'text-gray-700', bg: 'bg-gray-100' },
    { name: 'Gmail', url: `https://mail.google.com/mail/?view=cm&fs=1&to=${faculty.email}`, icon: Mail, color: 'text-red-500', bg: 'bg-red-50' },
    { name: 'Outlook', url: `https://outlook.office.com/mail/deeplink/compose?to=${faculty.email}`, icon: Mail, color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'Yahoo Mail', url: `https://compose.mail.yahoo.com/?to=${faculty.email}`, icon: Mail, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <>
      <motion.div
        whileHover={{ y: -6, boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)' }}
        transition={{ duration: 0.3 }}
        className="bg-white border border-[#E8ECF4] rounded-[20px] p-5 flex flex-col gap-4 relative"
        style={{ boxShadow: '0 2px 15px -3px rgba(0,0,0,0.07)' }}
      >
        {/* Avatar + Name */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-sm"
              style={{ background: `linear-gradient(135deg, ${from}, ${to})`, fontFamily: 'Poppins, sans-serif' }}
            >
              {initials}
            </div>
            {/* Online Indicator */}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#22C55E] border-2 border-white rounded-full z-10 shadow-sm" />
          </div>
          <div>
            <h3 className="font-semibold text-[#1E293B] text-sm leading-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {faculty.name}
            </h3>
            <p className="text-xs text-[#FF7A00] font-medium mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>
              {faculty.designation}
            </p>
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs text-[#475569]">
            <Building2 className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
            <span style={{ fontFamily: 'Inter, sans-serif' }}>{faculty.department}</span>
          </div>
        </div>

        {/* Contact & Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-[#E5E7EB] mt-auto">
          <button
            onClick={() => setShowEmailOptions(true)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium text-[#475569] transition-all hover:bg-gray-50 border border-transparent hover:border-gray-200"
            style={{ fontFamily: 'Poppins, sans-serif' }}
            aria-label={`Email ${faculty.name}`}
          >
            <Mail className="w-3.5 h-3.5" />
            Email
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all hover:bg-[#FFF7ED]"
            style={{ color: '#F97316', fontFamily: 'Poppins, sans-serif' }}
          >
            View Profile
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>

      {/* Profile Modal */}
      {createPortal(
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.4, bounce: 0.2 }}
              className="relative w-full max-w-5xl bg-[#F8FAFC] shadow-2xl overflow-y-auto"
              style={{ maxHeight: '90vh', borderRadius: '24px' }}
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 p-2 bg-white hover:bg-gray-100 rounded-full transition-colors z-50 shadow-sm border border-gray-200"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full p-4 sm:p-8 relative">
                {/* LEFT PANEL */}
                <div className="lg:col-span-4 h-full relative">
                  <div 
                    className="rounded-[20px] shadow-sm border p-8 flex flex-col items-center relative lg:sticky lg:top-0"
                    style={{ 
                      background: `linear-gradient(135deg, ${from}10, ${to}10)`,
                      borderColor: `${from}20`
                    }}
                  >
                    <div
                      className="w-32 h-32 rounded-full flex items-center justify-center text-white font-bold text-5xl mb-5 shadow-lg"
                      style={{ background: `linear-gradient(135deg, ${from}, ${to})`, fontFamily: 'Poppins, sans-serif' }}
                    >
                      {initials}
                    </div>
                    <h2 className="text-2xl font-bold text-center text-[#1E293B] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {faculty.name}
                    </h2>
                    <p className="text-base font-semibold text-[#FF7A00] text-center" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {faculty.designation}
                    </p>
                    <p className="text-xs font-semibold text-[#64748B] text-center mt-2 uppercase tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {faculty.department}
                    </p>
                    
                    <hr className="w-full my-6" style={{ borderColor: `${from}20` }} />

                    <div className="w-full flex flex-col gap-3">
                      <button 
                        onClick={() => setShowEmailOptions(true)} 
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/80 transition-colors border group text-left w-full"
                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.6)', borderColor: `${from}15` }}
                      >
                        <div className="w-10 h-10 rounded-full bg-[#FFF7ED] flex items-center justify-center group-hover:bg-[#F97316] transition-colors shrink-0">
                          <Mail className="w-4 h-4 text-[#F97316] group-hover:text-white transition-colors" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>Email Address</p>
                          <p className="text-sm font-semibold text-[#1E293B] truncate" style={{ fontFamily: 'Inter, sans-serif' }}>{faculty.email}</p>
                        </div>
                      </button>
                      
                      {faculty.phone && (
                        <a 
                          href={`tel:${faculty.phone}`} 
                          className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/80 transition-colors border group w-full"
                          style={{ backgroundColor: 'rgba(255, 255, 255, 0.6)', borderColor: `${from}15` }}
                        >
                          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-500 transition-colors shrink-0">
                            <Phone className="w-4 h-4 text-blue-500 group-hover:text-white transition-colors" />
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>Phone Number</p>
                            <p className="text-sm font-semibold text-[#1E293B] truncate" style={{ fontFamily: 'Inter, sans-serif' }}>{faculty.phone}</p>
                          </div>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* RIGHT PANEL */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                  {/* Section 1: Professional Details */}
                  <div className="bg-white rounded-[20px] shadow-sm border border-[#E8ECF4] p-6 sm:p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 text-[#FF7A00]" />
                      </div>
                      <h3 className="text-lg font-bold text-[#1E293B]" style={{ fontFamily: 'Poppins, sans-serif' }}>Professional Details</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-gray-50/80 border border-gray-100 transition-colors hover:bg-gray-50">
                        <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Department</p>
                        <p className="text-sm font-semibold text-[#1E293B]" style={{ fontFamily: 'Inter, sans-serif' }}>{faculty.department}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-gray-50/80 border border-gray-100 transition-colors hover:bg-gray-50">
                        <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Specialization</p>
                        <p className="text-sm font-semibold text-[#1E293B]" style={{ fontFamily: 'Inter, sans-serif' }}>{faculty.specialization || 'Not specified'}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-gray-50/80 border border-gray-100 transition-colors hover:bg-gray-50">
                        <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Qualification</p>
                        <p className="text-sm font-semibold text-[#1E293B]" style={{ fontFamily: 'Inter, sans-serif' }}>{faculty.qualification || 'Not specified'}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-gray-50/80 border border-gray-100 transition-colors hover:bg-gray-50">
                        <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Experience</p>
                        <p className="text-sm font-semibold text-[#1E293B]" style={{ fontFamily: 'Inter, sans-serif' }}>{faculty.experience || 'Not specified'}</p>
                      </div>
                      {faculty.joinedInstitution && (
                        <div className="p-4 rounded-xl bg-gray-50/80 border border-gray-100 transition-colors hover:bg-gray-50 md:col-span-2">
                          <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Joined Institution</p>
                          <p className="text-sm font-semibold text-[#1E293B]" style={{ fontFamily: 'Inter, sans-serif' }}>{faculty.joinedInstitution}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Section 2: Academic Info */}
                  <div className="bg-white rounded-[20px] shadow-sm border border-[#E8ECF4] p-6 sm:p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                        <BookOpen className="w-5 h-5 text-indigo-500" />
                      </div>
                      <h3 className="text-lg font-bold text-[#1E293B]" style={{ fontFamily: 'Poppins, sans-serif' }}>Academic Information</h3>
                    </div>
                    <div className="flex flex-col gap-4">
                      <div className="p-5 rounded-xl bg-indigo-50/30 border border-indigo-100/50">
                        <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Subjects Handling</p>
                        <p className="text-sm font-medium text-[#1E293B]" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}>{faculty.subjectsHandling || 'Not specified'}</p>
                      </div>
                      <div className="p-5 rounded-xl bg-teal-50/30 border border-teal-100/50">
                        <p className="text-xs font-bold text-teal-500 uppercase tracking-wider mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Research Areas</p>
                        <p className="text-sm font-medium text-[#1E293B]" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}>{faculty.researchAreas || 'Not specified'}</p>
                      </div>
                      {faculty.studentsGuided && (
                        <div className="p-5 rounded-xl bg-blue-50/30 border border-blue-100/50">
                          <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>Students Guided</p>
                          <div className="flex gap-8">
                            <div className="flex flex-col">
                              <span className="text-2xl font-bold text-[#1E293B]">{faculty.studentsGuided.ug}</span> 
                              <span className="text-xs font-semibold text-[#64748B]">UG</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-2xl font-bold text-[#1E293B]">{faculty.studentsGuided.pg}</span> 
                              <span className="text-xs font-semibold text-[#64748B]">PG</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-2xl font-bold text-[#1E293B]">{faculty.studentsGuided.phd}</span> 
                              <span className="text-xs font-semibold text-[#64748B]">Ph.D.</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Section 3: Achievements (Render only if present) */}
                  {(faculty.achievements || faculty.publications) && (
                    <div className="bg-white rounded-[20px] shadow-sm border border-[#E8ECF4] p-6 sm:p-8">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center shrink-0">
                          <GraduationCap className="w-5 h-5 text-pink-500" />
                        </div>
                        <h3 className="text-lg font-bold text-[#1E293B]" style={{ fontFamily: 'Poppins, sans-serif' }}>Achievements</h3>
                      </div>
                      <div className="flex flex-col gap-6">
                        {faculty.achievements && faculty.achievements.length > 0 && (
                          <div>
                            <p className="text-xs font-bold text-pink-400 uppercase tracking-wider mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>Awards & Certifications</p>
                            <ul className="list-disc list-inside space-y-2">
                              {faculty.achievements.map((ach, i) => (
                                <li key={i} className="text-sm font-medium text-[#1E293B]" style={{ fontFamily: 'Inter, sans-serif' }}>{ach}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {faculty.publications && faculty.publications.length > 0 && (
                          <div>
                            <p className="text-xs font-bold text-pink-400 uppercase tracking-wider mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>Recent Publications</p>
                            <ul className="list-disc list-inside space-y-2">
                              {faculty.publications.map((pub, i) => (
                                <li key={i} className="text-sm font-medium text-[#1E293B]" style={{ fontFamily: 'Inter, sans-serif' }}>{pub}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Section 4: Office Info */}
                  <div className="bg-white rounded-[20px] shadow-sm border border-[#E8ECF4] p-6 sm:p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                        <Clock className="w-5 h-5 text-emerald-500" />
                      </div>
                      <h3 className="text-lg font-bold text-[#1E293B]" style={{ fontFamily: 'Poppins, sans-serif' }}>Office Information</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-5 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-start gap-4">
                        <Clock className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Office Hours</p>
                          <p className="text-sm font-medium text-[#1E293B]" style={{ fontFamily: 'Inter, sans-serif' }}>{faculty.officeHours || 'Not specified'}</p>
                        </div>
                      </div>
                      <div className="p-5 rounded-xl bg-blue-50/30 border border-blue-100/50 flex items-start gap-4">
                        <Building2 className="w-6 h-6 text-blue-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Office Location</p>
                          <p className="text-sm font-medium text-[#1E293B]" style={{ fontFamily: 'Inter, sans-serif' }}>{faculty.office || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
        </AnimatePresence>,
        document.body
      )}

      {/* Email Options Modal */}
      {createPortal(
        <AnimatePresence>
          {showEmailOptions && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEmailOptions(false)}
              className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.4, bounce: 0.2 }}
              className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 flex flex-col gap-5"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-[#1E293B]" style={{ fontFamily: 'Poppins, sans-serif' }}>Choose Mail App</h3>
                  <p className="text-xs text-[#64748B] mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>Compose email to {faculty.name}</p>
                </div>
                <button onClick={() => setShowEmailOptions(false)} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <X className="w-5 h-5 text-[#94A3B8]" />
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {mailOptions.map((option, idx) => (
                  <a
                    key={idx}
                    href={option.url}
                    target={option.name !== 'Default Mail App' ? '_blank' : undefined}
                    rel={option.name !== 'Default Mail App' ? 'noopener noreferrer' : undefined}
                    onClick={() => setShowEmailOptions(false)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 border border-gray-100 transition-all group hover:border-gray-200"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${option.bg}`}>
                      <option.icon className={`w-4 h-4 ${option.color}`} />
                    </div>
                    <span className="text-sm font-semibold text-[#1E293B] group-hover:text-black" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {option.name}
                    </span>
                  </a>
                ))}
              </div>
            </motion.div>
          </div>
        )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
