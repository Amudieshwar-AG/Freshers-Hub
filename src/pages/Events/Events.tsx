import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Clock, Users, ChevronLeft, ChevronRight, Tag, ExternalLink } from 'lucide-react';
import SectionTitle from '@/components/SectionTitle/SectionTitle';
import { StaggerContainer, StaggerItem } from '@/components/AnimatedContainer/AnimatedContainer';
import AnimatedContainer from '@/components/AnimatedContainer/AnimatedContainer';
import { EVENTS_DATA, CLUBS_DATA } from '@/constants';

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  technical: { bg: '#EFF6FF', text: '#3B82F6', border: '#BFDBFE' },
  cultural: { bg: '#FDF2F8', text: '#EC4899', border: '#FBCFE8' },
  sports: { bg: '#ECFDF5', text: '#10B981', border: '#A7F3D0' },
  seminar: { bg: '#FFF7ED', text: '#F97316', border: '#FED7AA' },
  workshop: { bg: '#F5F3FF', text: '#8B5CF6', border: '#DDD6FE' },
};

const CLUB_CATEGORY_COLORS: Record<string, string> = {
  Technical: '#3B82F6',
  Cultural: '#EC4899',
  Social: '#10B981',
  Creative: '#F59E0B',
};

export default function Events() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Technical', 'Cultural', 'Seminar', 'Workshop'];

  const filteredEvents = EVENTS_DATA.filter((e) =>
    selectedCategory === 'All' || e.category === selectedCategory.toLowerCase()
  );

  const prev = () => setCurrentIdx((i) => (i === 0 ? EVENTS_DATA.length - 1 : i - 1));
  const next = () => setCurrentIdx((i) => (i === EVENTS_DATA.length - 1 ? 0 : i + 1));

  const featured = EVENTS_DATA[currentIdx];
  const featCfg = CATEGORY_COLORS[featured.category] || CATEGORY_COLORS.seminar;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAFA' }}>
      {/* Header */}
      <div className="bg-white border-b border-[#E5E7EB] py-10">
        <div className="container-custom">
          <h1 className="text-3xl md:text-4xl font-bold text-[#1E293B] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            Clubs &{' '}
            <span style={{ background: 'linear-gradient(135deg, #F97316, #FB923C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Events
            </span>
          </h1>
          <p className="text-[#475569]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Discover events, join clubs, and be part of the RIT community.
          </p>
        </div>
      </div>

      <div className="container-custom py-10">
        {/* Featured Event Carousel */}
        <SectionTitle tag="Upcoming" title="Featured" highlight="Events" />

        <AnimatedContainer className="relative mb-14">
          <div className="bg-white rounded-3xl border border-[#E5E7EB] overflow-hidden" style={{ boxShadow: '0 8px 40px -8px rgba(0,0,0,0.1)' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={featured.id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col md:flex-row"
              >
                {/* Image placeholder */}
                <div
                  className="w-full md:w-2/5 h-56 md:h-auto flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #1E293B, #334155)' }}
                >
                  <div className="text-center">
                    <div className="text-5xl mb-2">
                      {featured.category === 'technical' ? '💻' : featured.category === 'cultural' ? '🎭' : featured.category === 'seminar' ? '🎤' : '📅'}
                    </div>
                    <div className="text-white/60 text-sm">{featured.venue}</div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-8">
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-semibold capitalize"
                      style={{ backgroundColor: featCfg.bg, color: featCfg.text, border: `1px solid ${featCfg.border}`, fontFamily: 'Poppins, sans-serif' }}
                    >
                      {featured.category}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Upcoming
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-[#1E293B] mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {featured.title}
                  </h3>
                  <p className="text-[#475569] text-sm leading-relaxed mb-5" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {featured.description}
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {[
                      { icon: Calendar, label: new Date(featured.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) },
                      { icon: Clock, label: featured.time },
                      { icon: MapPin, label: featured.venue },
                      { icon: Users, label: featured.organizer },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-[#475569]">
                        <item.icon className="w-4 h-4 text-[#F97316] shrink-0" />
                        <span style={{ fontFamily: 'Inter, sans-serif' }}>{item.label}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-3">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold"
                      style={{ fontFamily: 'Poppins, sans-serif', background: 'linear-gradient(135deg, #F97316, #FB923C)' }}
                    >
                      Register Now
                      <ExternalLink className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      className="px-5 py-2.5 rounded-xl text-sm font-semibold border-2 border-[#E5E7EB] text-[#475569] hover:border-[#F97316] hover:text-[#F97316] transition-all"
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                      More Details
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Carousel Controls */}
          <div className="flex items-center justify-center gap-3 mt-4">
            <button onClick={prev} className="w-9 h-9 rounded-xl border border-[#E5E7EB] bg-white flex items-center justify-center text-[#475569] hover:border-[#F97316] hover:text-[#F97316] transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
            {EVENTS_DATA.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIdx(i)}
                className="transition-all rounded-full"
                style={{ width: i === currentIdx ? '24px' : '8px', height: '8px', backgroundColor: i === currentIdx ? '#F97316' : '#E5E7EB' }}
              />
            ))}
            <button onClick={next} className="w-9 h-9 rounded-xl border border-[#E5E7EB] bg-white flex items-center justify-center text-[#475569] hover:border-[#F97316] hover:text-[#F97316] transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </AnimatedContainer>

        {/* All Events Grid */}
        <div className="mb-14">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <h2 className="text-xl font-bold text-[#1E293B]" style={{ fontFamily: 'Playfair Display, serif' }}>All Events</h2>
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all"
                  style={{
                    fontFamily: 'Poppins, sans-serif',
                    backgroundColor: selectedCategory === cat ? '#F97316' : '#F8FAFC',
                    color: selectedCategory === cat ? 'white' : '#475569',
                    border: `1px solid ${selectedCategory === cat ? '#F97316' : '#E5E7EB'}`,
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
            {filteredEvents.map((event) => {
              const cfg = CATEGORY_COLORS[event.category] || CATEGORY_COLORS.seminar;
              return (
                <StaggerItem key={event.id}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="bg-white rounded-2xl border border-[#E5E7EB] p-5 flex gap-4"
                    style={{ boxShadow: '0 2px 15px -3px rgba(0,0,0,0.07)' }}
                  >
                    <div className="w-14 h-14 rounded-xl flex flex-col items-center justify-center shrink-0" style={{ backgroundColor: cfg.bg }}>
                      <span className="text-xs font-bold" style={{ color: cfg.text, fontFamily: 'Poppins, sans-serif' }}>
                        {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric' })}
                      </span>
                      <span className="text-[10px]" style={{ color: cfg.text }}>
                        {new Date(event.date).toLocaleDateString('en-IN', { month: 'short' })}
                      </span>
                    </div>
                    <div className="flex-1">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize" style={{ backgroundColor: cfg.bg, color: cfg.text, fontFamily: 'Poppins, sans-serif' }}>
                        {event.category}
                      </span>
                      <h3 className="text-sm font-semibold text-[#1E293B] mt-1.5 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>{event.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-[#94A3B8]">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{event.time}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{event.venue}</span>
                      </div>
                    </div>
                  </motion.div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>

        {/* Clubs Section */}
        <SectionTitle tag="Join a Club" title="Student" highlight="Clubs" subtitle="Explore clubs and societies at RIT. Find your passion and connect with like-minded peers." />
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CLUBS_DATA.map((club) => (
            <StaggerItem key={club.id}>
              <motion.div
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl border border-[#E5E7EB] p-5"
                style={{ boxShadow: '0 2px 15px -3px rgba(0,0,0,0.07)' }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                    style={{ background: `linear-gradient(135deg, ${CLUB_CATEGORY_COLORS[club.category] || '#F97316'}, ${CLUB_CATEGORY_COLORS[club.category] || '#F97316'}CC)`, fontFamily: 'Poppins, sans-serif' }}
                  >
                    {club.name[0]}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-[#94A3B8]">
                    <Users className="w-3.5 h-3.5" />
                    <span>{club.members} members</span>
                  </div>
                </div>
                <h3 className="font-semibold text-[#1E293B] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>{club.name}</h3>
                <p className="text-xs text-[#94A3B8] mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>{club.description}</p>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-xs" style={{ color: CLUB_CATEGORY_COLORS[club.category] || '#F97316' }}>
                    <Tag className="w-3 h-3" />
                    {club.category}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white"
                    style={{ fontFamily: 'Poppins, sans-serif', background: 'linear-gradient(135deg, #F97316, #FB923C)' }}
                  >
                    Join Club
                  </motion.button>
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </div>
  );
}
