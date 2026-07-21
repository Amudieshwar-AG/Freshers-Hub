import { motion } from 'framer-motion';
import { Mail, Phone, Building2, User } from 'lucide-react';
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
  const colorIndex = parseInt(faculty.id) % AVATAR_COLORS.length;
  const [from, to] = AVATAR_COLORS[colorIndex];
  const initials = faculty.name
    .split(' ')
    .filter((_, i) => i === 0 || i === faculty.name.split(' ').length - 1)
    .map((n) => n[0])
    .join('');

  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: '0 16px 40px -8px rgba(0,0,0,0.12)' }}
      transition={{ duration: 0.25 }}
      className="bg-white border border-[#E5E7EB] rounded-2xl p-5 flex flex-col gap-4"
      style={{ boxShadow: '0 2px 15px -3px rgba(0,0,0,0.07)' }}
    >
      {/* Avatar + Name */}
      <div className="flex items-center gap-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg shrink-0"
          style={{ background: `linear-gradient(135deg, ${from}, ${to})`, fontFamily: 'Poppins, sans-serif' }}
        >
          {initials}
        </div>
        <div>
          <h3 className="font-semibold text-[#1E293B] text-sm leading-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {faculty.name}
          </h3>
          <p className="text-xs text-[#F97316] font-medium mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>
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
        {faculty.office && (
          <div className="flex items-center gap-2 text-xs text-[#475569]">
            <User className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
            <span style={{ fontFamily: 'Inter, sans-serif' }}>{faculty.office}</span>
          </div>
        )}
        {faculty.specialization && (
          <div className="text-xs text-[#94A3B8] pl-5" style={{ fontFamily: 'Inter, sans-serif' }}>
            {faculty.specialization}
          </div>
        )}
      </div>

      {/* Contact */}
      <div className="flex items-center gap-2 pt-2 border-t border-[#E5E7EB]">
        <a
          href={`mailto:${faculty.email}`}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all hover:bg-[#FFF7ED]"
          style={{ color: '#F97316', fontFamily: 'Poppins, sans-serif' }}
          aria-label={`Email ${faculty.name}`}
        >
          <Mail className="w-3.5 h-3.5" />
          Email
        </a>
        {faculty.phone && (
          <a
            href={`tel:${faculty.phone}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium text-[#475569] transition-all hover:bg-gray-50"
            style={{ fontFamily: 'Poppins, sans-serif' }}
            aria-label={`Call ${faculty.name}`}
          >
            <Phone className="w-3.5 h-3.5" />
            Call
          </a>
        )}
      </div>
    </motion.div>
  );
}
