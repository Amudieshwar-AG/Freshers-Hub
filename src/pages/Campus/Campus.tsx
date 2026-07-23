import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  MapPin,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Download,
  Compass,
  Layers,
  Building2,
  CheckCircle2,
  Sparkles,
  X,
  Target,
  Search,
  Users,
  BookOpen,
  Filter,
  ArrowUpDown,
  Loader2,
} from 'lucide-react';
import SectionTitle from '@/components/SectionTitle/SectionTitle';
import BusCard from '@/components/BusCard/BusCard';
import FacultyCard from '@/components/FacultyCard/FacultyCard';
import { StaggerContainer, StaggerItem } from '@/components/AnimatedContainer/AnimatedContainer';
import { FACULTY_DATA, CAMPUS_LOCATIONS, DEPARTMENTS } from '@/constants';
import * as LucideIcons from 'lucide-react';
import { useLocation } from 'react-router-dom';
import type { BusRoute } from '@/types';

interface LocationSpot {
  name: string;
  x: number; // percentage
  y: number; // percentage
  category: string;
  desc: string;
  area: string;
}

const BLUEPRINT_LEGEND = [
  { id: 'all', label: 'All Locations', color: '#F97316', bg: 'bg-orange-50/80', text: 'text-orange-950', border: 'border-orange-300' },
  { id: 'a-block', label: 'A Block', color: '#60A5FA', bg: 'bg-blue-50/80', text: 'text-blue-900', border: 'border-blue-200' },
  { id: 'b-block', label: 'B Block', color: '#93C5FD', bg: 'bg-blue-50/60', text: 'text-blue-900', border: 'border-blue-200' },
  { id: 'c-block', label: 'C Block', color: '#BFDBFE', bg: 'bg-blue-50/40', text: 'text-blue-900', border: 'border-blue-200' },
  { id: 'admin', label: 'Admin / Facility', color: '#FDBA74', bg: 'bg-orange-50/80', text: 'text-orange-950', border: 'border-orange-200' },
  { id: 'hostel', label: 'Hostel / Mess', color: '#C084FC', bg: 'bg-purple-50/80', text: 'text-purple-950', border: 'border-purple-200' },
  { id: 'lab', label: 'Lab / Academic', color: '#FDE047', bg: 'bg-yellow-50/80', text: 'text-yellow-950', border: 'border-yellow-200' },
  { id: 'amenity', label: 'Amenity', color: '#BEF264', bg: 'bg-lime-50/80', text: 'text-lime-950', border: 'border-lime-200' },
  { id: 'parking', label: 'Parking Area', color: '#94A3B8', bg: 'bg-slate-100/80', text: 'text-slate-900', border: 'border-slate-300' },
  { id: 'green', label: 'Green Area', color: '#4ADE80', bg: 'bg-emerald-50/80', text: 'text-emerald-950', border: 'border-emerald-200' },
];

const LOCATION_SPOTS: LocationSpot[] = [
  { name: 'Girls Hostel', x: 8.5, y: 12.0, category: 'Hostel / Mess', desc: 'Residential Quarter for Women', area: 'Top Left' },
  { name: 'Playground', x: 32.0, y: 24.0, category: 'Amenity', desc: 'Main Sports & Athletic Field', area: 'Top Left' },
  { name: 'Canteen', x: 64.0, y: 14.0, category: 'Amenity', desc: 'Food Court & Refreshments', area: 'North Center' },
  { name: 'Statue', x: 63.0, y: 25.5, category: 'Amenity', desc: 'Landmark Monument', area: 'North Center' },
  { name: 'Boys Mess', x: 87.0, y: 9.5, category: 'Amenity', desc: 'Ground Floor Dining', area: 'Top Right' },
  { name: 'Staff Mess', x: 87.0, y: 18.5, category: 'Amenity', desc: 'First Floor Dining', area: 'Top Right' },
  { name: 'C Block', x: 87.0, y: 42.0, category: 'C Block', desc: 'Labs, Classrooms, Auditorium & Staff Rooms', area: 'East Block' },
  { name: 'Steve Jobs Block', x: 8.5, y: 39.0, category: 'Admin / Facility', desc: 'Auditorium, Labs & Staff Rooms', area: 'West Wing' },
  { name: 'Girls Mess', x: 8.5, y: 53.0, category: 'Amenity', desc: 'Dedicated Dining Hall for Women', area: 'West Wing' },
  { name: 'EPL Lab', x: 8.5, y: 67.0, category: 'Lab / Academic', desc: 'Engineering Practices Laboratory', area: 'South West' },
  { name: 'B Block', x: 33.0, y: 51.0, category: 'B Block', desc: 'Labs, Classrooms & Faculty Rooms', area: 'Central West' },
  { name: 'Hut', x: 63.0, y: 41.0, category: 'Amenity', desc: 'Student Discussion & Rest Area', area: 'Central Green' },
  { name: 'A Block', x: 70.0, y: 65.0, category: 'A Block', desc: 'Labs, Classrooms, Faculty Rooms, Principal Room & Exam Cell', area: 'Central East' },
  { name: 'RSB Block', x: 24.0, y: 80.0, category: 'Amenity', desc: 'Library, Auditorium & Accounts Room', area: 'South West' },
  { name: 'Side Parking', x: 6.5, y: 83.0, category: 'Parking Area', desc: 'Visitor & Staff Parking Zone', area: 'South West' },
  { name: 'Arcade', x: 43.5, y: 72.0, category: 'Amenity', desc: 'Student Hub & Stores', area: 'South Central' },
  { name: 'Security Booth', x: 45.8, y: 88.5, category: 'Amenity', desc: 'Main Gate Security Checkpoint', area: 'South Entrance' },
  { name: 'Parking Area', x: 73.5, y: 85.5, category: 'Parking Area', desc: 'Two-Wheeler & Four-Wheeler Parking', area: 'South East' },
  { name: 'Main Entrance', x: 50.5, y: 95.5, category: 'Amenity', desc: 'Primary Campus Security Gate', area: 'South Entrance' },
];

const CATEGORY_MAP_SPOTS: Record<string, string[]> = {
  dept: ['A Block', 'B Block', 'C Block'],
  library: ['RSB Block'],
  labs: ['Steve Jobs Block', 'A Block', 'B Block', 'C Block', 'EPL Lab'],
  hostel: ['Girls Hostel'],
  canteen: ['Canteen', 'Staff Mess', 'Girls Mess', 'Boys Mess'],
  auditorium: ['Steve Jobs Block', 'C Block', 'RSB Block'],
  sports: ['Playground'],
};

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

  // Interactive Map State
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeLegend, setActiveLegend] = useState<string>('all');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedFacility, setSelectedFacility] = useState<LocationSpot | null>(null);

  const currentMapSrc = '/campus-map.jpg';

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => setZoomLevel(1);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = currentMapSrc;
    link.download = 'RIT_Campus_Blueprint.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCategoryClick = (catId: string) => {
    if (activeCategory === catId) {
      setActiveCategory(null);
    } else {
      setActiveCategory(catId);
      setSelectedFacility(null);
      // Auto focus zoom slightly for visual feedback
      setZoomLevel(1.1);
    }
  };

  // Determine active highlighted spots on the map
  const highlightedSpotNames = new Set<string>();
  if (selectedFacility) {
    highlightedSpotNames.add(selectedFacility.name);
  } else if (activeCategory && CATEGORY_MAP_SPOTS[activeCategory]) {
    CATEGORY_MAP_SPOTS[activeCategory].forEach((name) => highlightedSpotNames.add(name));
  } else if (activeLegend !== 'all') {
    LOCATION_SPOTS.forEach((spot) => {
      if (activeLegend === 'a-block' && spot.category === 'A Block') highlightedSpotNames.add(spot.name);
      if (activeLegend === 'b-block' && spot.category === 'B Block') highlightedSpotNames.add(spot.name);
      if (activeLegend === 'c-block' && spot.category === 'C Block') highlightedSpotNames.add(spot.name);
      if (activeLegend === 'admin' && spot.category === 'Admin / Facility') highlightedSpotNames.add(spot.name);
      if (activeLegend === 'hostel' && spot.category === 'Hostel / Mess') highlightedSpotNames.add(spot.name);
      if (activeLegend === 'lab' && spot.category === 'Lab / Academic') highlightedSpotNames.add(spot.name);
      if (activeLegend === 'amenity' && spot.category === 'Amenity') highlightedSpotNames.add(spot.name);
      if (activeLegend === 'parking' && spot.category === 'Parking Area') highlightedSpotNames.add(spot.name);
      if (activeLegend === 'green' && spot.area.includes('Green')) highlightedSpotNames.add(spot.name);
    });
  }

  const filteredFacilities = LOCATION_SPOTS.filter((fac) => {
    if (activeLegend === 'all') return true;
    if (activeLegend === 'a-block') return fac.category === 'A Block';
    if (activeLegend === 'b-block') return fac.category === 'B Block';
    if (activeLegend === 'c-block') return fac.category === 'C Block';
    if (activeLegend === 'admin') return fac.category === 'Admin / Facility';
    if (activeLegend === 'hostel') return fac.category === 'Hostel / Mess';
    if (activeLegend === 'lab') return fac.category === 'Lab / Academic';
    if (activeLegend === 'amenity') return fac.category === 'Amenity';
    if (activeLegend === 'parking') return fac.category === 'Parking Area';
    if (activeLegend === 'green') return fac.area.includes('Green');
    return true;
  });

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
            <span className="text-[#F97316]">Campus Map</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#1E293B] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            Explore{' '}
            <span style={{ background: 'linear-gradient(135deg, #F97316, #FB923C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Campus Map
            </span>
          </h1>
          <p className="text-[#475569]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Navigate campus layout, click location categories or blocks to spot exact places on the blueprint.
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

        {activeTab === 'map' && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          
          {/* Map Viewer Header Bar */}
          <div className="bg-[#0F172A] rounded-t-3xl p-4 md:p-6 text-white border-b border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-xs font-semibold border border-orange-500/30">
                  <Sparkles className="w-3 h-3" /> Official Blueprint
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3" /> Interactive Location Spotter
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
                Rajalakshmi Institute of Technology
              </h2>
              <p className="text-xs md:text-sm text-slate-400 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-orange-400" />
                Kuthambakkam, Chennai • Interactive Map Spotting Enabled
              </p>
            </div>

            {/* Toolbar Controls */}
            <div className="flex items-center flex-wrap gap-2">
              {/* Zoom Controls */}
              <div className="flex items-center bg-slate-800/80 rounded-xl p-1 border border-slate-700">
                <button
                  onClick={handleZoomOut}
                  title="Zoom Out"
                  className="p-2 text-slate-300 hover:text-white hover:bg-slate-700/60 rounded-lg transition-colors cursor-pointer"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={handleResetZoom}
                  title="Reset Zoom"
                  className="px-2 text-xs font-semibold text-orange-400 hover:text-orange-300 transition-colors cursor-pointer"
                >
                  {Math.round(zoomLevel * 100)}%
                </button>
                <button
                  onClick={handleZoomIn}
                  title="Zoom In"
                  className="p-2 text-slate-300 hover:text-white hover:bg-slate-700/60 rounded-lg transition-colors cursor-pointer"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>

              {/* Fullscreen Button */}
              <button
                onClick={() => setIsFullscreen(true)}
                className="p-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 hover:text-white rounded-xl border border-slate-700 transition-colors cursor-pointer"
                title="Expand to Fullscreen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              {/* Download Button */}
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-semibold rounded-xl shadow-lg shadow-orange-500/20 transition-all cursor-pointer"
                title="Download Blueprint Image"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </button>
            </div>
          </div>

          {/* Blueprint Main Canvas Container with Spotting Markers */}
          <div className="bg-[#0B1120] rounded-b-3xl border border-slate-800 overflow-hidden shadow-xl mb-8 relative">
            <div
              className="w-full flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-auto relative cursor-grab active:cursor-grabbing"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 0)',
                backgroundSize: '24px 24px',
              }}
            >
              <motion.div
                animate={{ scale: zoomLevel }}
                transition={{ type: 'spring', stiffness: 260, damping: 25 }}
                className="relative w-full flex items-center justify-center transition-transform duration-200"
              >
                {/* Main Campus Map Image Container */}
                <div className="relative w-full rounded-2xl overflow-hidden border border-slate-700/60 shadow-2xl bg-slate-950">
                  <img
                    src={currentMapSrc}
                    alt="Rajalakshmi Institute of Technology Campus Blueprint"
                    className="w-full h-auto block object-cover"
                    style={{
                      boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.7)',
                    }}
                  />

                  {/* Interactive Spot Markers overlayed on map image */}
                  {LOCATION_SPOTS.map((spot) => {
                    const isHighlighted = highlightedSpotNames.has(spot.name);
                    const isSelected = selectedFacility?.name === spot.name;

                    return (
                      <div
                        key={spot.name}
                        style={{
                          left: `${spot.x}%`,
                          top: `${spot.y}%`,
                        }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group cursor-pointer"
                        onClick={() => setSelectedFacility(spot)}
                      >
                        {/* Glowing Pulsing Ring if Highlighted */}
                        {isHighlighted && (
                          <motion.span
                            initial={{ scale: 0.6, opacity: 0.8 }}
                            animate={{ scale: [1, 2.2, 1], opacity: [0.8, 0, 0.8] }}
                            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                            className="absolute inset-0 -m-3 rounded-full bg-orange-500/50 blur-xs pointer-events-none"
                          />
                        )}

                        {/* Spot Pin Button */}
                        <motion.div
                          whileHover={{ scale: 1.3 }}
                          animate={isHighlighted ? { scale: [1, 1.25, 1] } : { scale: 1 }}
                          transition={isHighlighted ? { repeat: Infinity, duration: 2 } : {}}
                          className={`relative flex items-center justify-center p-1.5 rounded-full shadow-lg border transition-all ${
                            isSelected
                              ? 'bg-gradient-to-r from-orange-500 to-amber-500 border-white ring-4 ring-orange-500/40 text-white z-30'
                              : isHighlighted
                              ? 'bg-orange-500 border-white text-white ring-2 ring-orange-400/60 z-20'
                              : 'bg-slate-900/80 border-slate-600 text-orange-400 hover:bg-orange-500 hover:text-white opacity-75 hover:opacity-100'
                          }`}
                        >
                          <MapPin className="w-4 h-4" />

                          {/* Hover / Highlight Tooltip Label */}
                          <div
                            className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap shadow-xl border pointer-events-none transition-all ${
                              isHighlighted || isSelected
                                ? 'bg-slate-900 text-orange-400 border-orange-500/40 opacity-100 scale-100'
                                : 'bg-slate-900/90 text-white border-slate-700 opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100'
                            }`}
                          >
                            {spot.name}
                          </div>
                        </motion.div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </div>

            {/* Active Spotting Info Banner Overlay at Bottom */}
            <div className="absolute bottom-4 left-4 right-16 flex items-center justify-between pointer-events-none">
              {activeCategory ? (
                <div className="bg-orange-500/90 backdrop-blur-md px-4 py-2 rounded-2xl text-white text-xs font-semibold flex items-center gap-2 shadow-xl pointer-events-auto">
                  <Target className="w-4 h-4 animate-pulse text-white" />
                  <span>Spotting Category: <strong>{CAMPUS_LOCATIONS.find((c) => c.id === activeCategory)?.name}</strong> ({highlightedSpotNames.size} Locations)</span>
                  <button onClick={() => setActiveCategory(null)} className="ml-2 hover:opacity-75 cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : selectedFacility ? (
                <div className="bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-2xl text-white text-xs font-semibold flex items-center gap-2 shadow-xl pointer-events-auto border border-orange-500/40">
                  <MapPin className="w-4 h-4 text-orange-400" />
                  <span>Spotted: <strong>{selectedFacility.name}</strong> ({selectedFacility.area})</span>
                  <button onClick={() => setSelectedFacility(null)} className="ml-2 hover:opacity-75 cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-700/60 text-slate-300 text-xs flex items-center gap-2 shadow-xl">
                  <Compass className="w-4 h-4 text-orange-400" />
                  <span className="font-medium text-white">Click any category below to spot on map</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Location Categories Bar */}
          <div className="bg-white rounded-3xl border border-[#E5E7EB] p-6 md:p-8 mb-8 shadow-xs">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold text-[#1E293B]" style={{ fontFamily: 'Playfair Display, serif' }}>
                Quick Location Categories
              </h3>
              {activeCategory && (
                <button
                  onClick={() => setActiveCategory(null)}
                  className="text-xs font-semibold text-orange-500 hover:text-orange-600 flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" /> Clear Spot Filter
                </button>
              )}
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-7 gap-4">
              {CAMPUS_LOCATIONS.map((loc) => {
                const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<any>>)[loc.icon];
                const isCatActive = activeCategory === loc.id;
                return (
                  <motion.button
                    key={loc.id}
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCategoryClick(loc.id)}
                    className={`flex flex-col items-center gap-2.5 p-3 rounded-2xl transition-all border cursor-pointer group ${
                      isCatActive
                        ? 'border-orange-500 bg-orange-500 text-white shadow-lg ring-2 ring-orange-400/30'
                        : 'border-transparent hover:border-[#FED7AA] hover:bg-orange-50/50'
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border transition-colors ${
                        isCatActive
                          ? 'bg-white text-orange-500 border-white'
                          : 'bg-[#F8FAFC] group-hover:bg-orange-100 text-[#F97316] border-[#E5E7EB] group-hover:border-orange-300'
                      }`}
                    >
                      {Icon && <Icon className="w-5 h-5" />}
                    </div>
                    <span
                      className={`text-[11px] font-semibold text-center leading-tight ${
                        isCatActive ? 'text-white' : 'text-[#475569] group-hover:text-[#F97316]'
                      }`}
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {loc.name}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Blueprint Legend & Color Key */}
          <div className="bg-white rounded-3xl border border-[#E5E7EB] p-6 md:p-8 mb-8 shadow-xs">
            <div className="flex items-center gap-2 mb-5">
              <Layers className="w-5 h-5 text-[#F97316]" />
              <h3 className="text-xl font-bold text-[#1E293B]" style={{ fontFamily: 'Playfair Display, serif' }}>
                Blueprint Map Legend
              </h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {BLUEPRINT_LEGEND.map((item) => {
                const isActive = activeLegend === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveLegend(item.id);
                      setActiveCategory(null);
                      setSelectedFacility(null);
                    }}
                    className={`flex items-center gap-2.5 px-4 py-2 rounded-full border transition-all cursor-pointer ${
                      isActive
                        ? 'border-[#F97316] bg-orange-500 text-white shadow-md scale-105'
                        : `${item.border} ${item.bg} ${item.text} hover:scale-105`
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs border border-black/10"
                      style={{ backgroundColor: isActive ? 'white' : item.color }}
                    />
                    <span className="text-xs font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Blueprint Facilities List & Quick Selector */}
          <div className="bg-white rounded-3xl border border-[#E5E7EB] p-6 md:p-8 mb-8 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#F97316]" />
                  <h3 className="text-xl font-bold text-[#1E293B]" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Campus Blocks & Facilities Index
                  </h3>
                </div>
                <p className="text-xs text-[#64748B] mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Click any facility card below to spot its exact location on the campus map image.
                </p>
              </div>
              <span className="text-xs font-semibold text-[#F97316] bg-orange-50 px-3.5 py-1.5 rounded-full border border-orange-200">
                {filteredFacilities.length} Locations Mapped
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredFacilities.map((facility) => {
                const isSelected = selectedFacility?.name === facility.name;
                const isHighlighted = highlightedSpotNames.has(facility.name);
                return (
                  <motion.button
                    key={facility.name}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedFacility(null);
                      } else {
                        setSelectedFacility(facility);
                        setActiveCategory(null);
                      }
                    }}
                    className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#F97316] bg-orange-500 text-white shadow-lg ring-2 ring-orange-400/40'
                        : isHighlighted
                        ? 'border-[#F97316] bg-orange-50/90 shadow-md'
                        : 'border-[#E5E7EB] bg-[#F8FAFC] hover:bg-white hover:border-orange-200 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1 mb-1.5">
                      <span
                        className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-[#1E293B]'}`}
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                      >
                        {facility.name}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 border ${
                          isSelected
                            ? 'bg-white/20 border-white/30 text-white'
                            : 'bg-white border-[#E5E7EB] text-[#475569]'
                        }`}
                      >
                        {facility.area}
                      </span>
                    </div>
                    <p
                      className={`text-xs line-clamp-1 ${isSelected ? 'text-orange-100' : 'text-[#64748B]'}`}
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {facility.desc}
                    </p>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Fullscreen Lightbox Modal */}
          <AnimatePresence>
            {isFullscreen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col p-4 md:p-8"
              >
                <div className="flex items-center justify-between text-white mb-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-orange-500" />
                    <h3 className="text-lg font-bold">RIT Campus Blueprint — Fullscreen Spotter</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsFullscreen(false)}
                      className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                    >
                      <Minimize2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 flex items-center justify-center overflow-auto p-2 relative">
                  <div className="relative inline-block max-w-full max-h-full">
                    <img
                      src={currentMapSrc}
                      alt="RIT Campus Blueprint Fullscreen"
                      className="max-w-full max-h-full object-contain rounded-xl shadow-2xl block"
                    />
                    {LOCATION_SPOTS.map((spot) => {
                      const isHighlighted = highlightedSpotNames.has(spot.name);
                      const isSelected = selectedFacility?.name === spot.name;
                      return (
                        <div
                          key={`fs-${spot.name}`}
                          style={{
                            left: `${spot.x}%`,
                            top: `${spot.y}%`,
                          }}
                          className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group cursor-pointer"
                          onClick={() => setSelectedFacility(spot)}
                        >
                          <div
                            className={`relative flex items-center justify-center p-1.5 rounded-full shadow-lg border transition-all ${
                              isSelected
                                ? 'bg-orange-500 border-white text-white ring-4 ring-orange-500/40 z-30 scale-125'
                                : isHighlighted
                                ? 'bg-orange-500 border-white text-white ring-2 ring-orange-400/60 z-20'
                                : 'bg-slate-900/80 border-slate-600 text-orange-400 hover:bg-orange-500 hover:text-white'
                            }`}
                          >
                            <MapPin className="w-4 h-4" />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-0.5 rounded-lg text-[10px] font-bold whitespace-nowrap bg-slate-900 text-white border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                              {spot.name}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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
