import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User, Mail, Phone, GraduationCap, BookOpen,
  Settings, LogOut, Edit3, Camera, Bell,
  Shield, Star, Calendar, ChevronRight
} from 'lucide-react';
import AnimatedContainer from '@/components/AnimatedContainer/AnimatedContainer';
import { StaggerContainer, StaggerItem } from '@/components/AnimatedContainer/AnimatedContainer';

const MOCK_USER = {
  name: 'Arjun Kumar',
  rollNo: 'CB.EN.U4CSE25001',
  department: 'Computer Science & Engineering',
  semester: '1st Semester',
  email: 'arjun.kumar@rit.ac.in',
  phone: '+91 98765 43210',
  joinedDate: 'August 2025',
  batch: '2025-2029',
};

const ACTIVITY = [
  { label: 'Notes Downloaded', value: '12', icon: BookOpen, color: '#F97316' },
  { label: 'Questions Asked', value: '3', icon: Star, color: '#8B5CF6' },
  { label: 'Events Registered', value: '2', icon: Calendar, color: '#10B981' },
  { label: 'AI Queries', value: '48', icon: Shield, color: '#3B82F6' },
];

const MENU_ITEMS = [
  { icon: Bell, label: 'Notifications', badge: '3' },
  { icon: BookOpen, label: 'My Downloads', badge: null },
  { icon: Star, label: 'Bookmarks', badge: null },
  { icon: Settings, label: 'Settings', badge: null },
  { icon: Shield, label: 'Privacy & Security', badge: null },
];

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAFA' }}>
      {/* Header */}
      <div
        className="py-16 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)' }}
      >
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'radial-gradient(circle, #F97316 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="container-custom relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-bold text-white cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #F97316, #FB923C)',
                  fontFamily: 'Poppins, sans-serif',
                  boxShadow: '0 8px 30px rgba(249,115,22,0.4)',
                }}
              >
                AK
              </motion.div>
              <button
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl flex items-center justify-center text-white"
                style={{ background: 'linear-gradient(135deg, #F97316, #FB923C)' }}
                aria-label="Change photo"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                {MOCK_USER.name}
              </h1>
              <p className="text-orange-300 text-sm mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                {MOCK_USER.rollNo}
              </p>
              <p className="text-slate-400 text-sm mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                {MOCK_USER.department} · {MOCK_USER.batch}
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-300 border border-orange-500/30" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {MOCK_USER.semester}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Active Student
                </span>
              </div>
            </div>

            {/* Edit button */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold border border-white/20 hover:bg-white/10 transition-all"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              <Edit3 className="w-4 h-4" />
              Edit Profile
            </motion.button>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Activity Stats */}
            <AnimatedContainer>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {ACTIVITY.map((item, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: -3 }}
                    className="bg-white rounded-2xl border border-[#E5E7EB] p-4 text-center"
                    style={{ boxShadow: '0 2px 15px -3px rgba(0,0,0,0.07)' }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2"
                      style={{ backgroundColor: `${item.color}15` }}
                    >
                      <item.icon className="w-5 h-5" style={{ color: item.color } as React.CSSProperties} />
                    </div>
                    <div className="text-xl font-bold mb-0.5" style={{ color: item.color, fontFamily: 'Poppins, sans-serif' }}>
                      {item.value}
                    </div>
                    <div className="text-[10px] text-[#94A3B8]" style={{ fontFamily: 'Inter, sans-serif' }}>{item.label}</div>
                  </motion.div>
                ))}
              </div>
            </AnimatedContainer>

            {/* Personal Details */}
            <AnimatedContainer delay={0.1}>
              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6" style={{ boxShadow: '0 2px 15px -3px rgba(0,0,0,0.07)' }}>
                <h3 className="text-sm font-semibold text-[#1E293B] mb-5" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {[
                    { icon: User, label: 'Full Name', value: MOCK_USER.name },
                    { icon: GraduationCap, label: 'Roll Number', value: MOCK_USER.rollNo },
                    { icon: Mail, label: 'Email', value: MOCK_USER.email },
                    { icon: Phone, label: 'Phone', value: MOCK_USER.phone },
                    { icon: BookOpen, label: 'Department', value: MOCK_USER.department },
                    { icon: Calendar, label: 'Joined', value: MOCK_USER.joinedDate },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB]">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#FFF7ED] shrink-0">
                        <item.icon className="w-4.5 h-4.5 text-[#F97316]" />
                      </div>
                      <div>
                        <div className="text-[10px] text-[#94A3B8] uppercase tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>{item.label}</div>
                        <div className="text-sm font-medium text-[#1E293B]" style={{ fontFamily: 'Inter, sans-serif' }}>{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedContainer>
          </div>

          {/* Right Sidebar */}
          <div className="flex flex-col gap-5">
            {/* Menu */}
            <AnimatedContainer direction="right" delay={0.1}>
              <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden" style={{ boxShadow: '0 2px 15px -3px rgba(0,0,0,0.07)' }}>
                {MENU_ITEMS.map((item, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ backgroundColor: '#FFF7ED', x: 2 }}
                    className="w-full flex items-center justify-between px-5 py-3.5 border-b border-[#E5E7EB] last:border-0 transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-4 h-4 text-[#94A3B8]" />
                      <span className="text-sm text-[#475569]" style={{ fontFamily: 'Inter, sans-serif' }}>{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white font-bold"
                          style={{ backgroundColor: '#F97316', fontFamily: 'Poppins, sans-serif' }}>
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
                    </div>
                  </motion.button>
                ))}
              </div>
            </AnimatedContainer>

            {/* Logout */}
            <AnimatedContainer direction="right" delay={0.2}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-red-100 text-red-400 hover:bg-red-50 text-sm font-semibold transition-all"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </motion.button>
            </AnimatedContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
