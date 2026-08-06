import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, ChevronRight, Menu, X, MapPin, Navigation, Compass, Radio } from 'lucide-react';
import BusCard from '@/components/BusCard/BusCard';
import BusRouteMap from '@/components/BusRouteMap/BusRouteMap';
import type { BusRoute } from '@/types';
import { getBackendUrl } from '@/lib/utils';
import { Link } from 'react-router-dom';

export default function BusRoutes() {
  const [busSearch, setBusSearch] = useState('');
  const [busRoutes, setBusRoutes] = useState<BusRoute[]>([]);
  const [loadingBus, setLoadingBus] = useState(true);
  const [selectedBusRoute, setSelectedBusRoute] = useState<BusRoute | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // 1. Instantly load static bus routes (0ms loading delay)
    fetch('/bus_routes.json')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setBusRoutes(data);
          setSelectedBusRoute(data[0]);
        }
      })
      .catch((err) => console.error('Local JSON load error:', err))
      .finally(() => setLoadingBus(false));

    // 2. Silently fetch live backend updates in background with a 2s timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    fetch(getBackendUrl('/api/bus-routes'), { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setBusRoutes(data);
        }
      })
      .catch(() => {})
      .finally(() => clearTimeout(timeoutId));
  }, []);

  const filteredRoutes = busRoutes.filter(
    (r) =>
      r.name.toLowerCase().includes(busSearch.toLowerCase()) ||
      r.from.toLowerCase().includes(busSearch.toLowerCase()) ||
      r.number.toLowerCase().includes(busSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950 text-white">
      {/* Sleek Dark Header */}
      <div className="bg-slate-900 border-b border-slate-800/80 py-4 px-4 sm:px-8 z-30 relative">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <Link to="/" className="hover:text-orange-400">Home</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-orange-400 font-semibold">Live Bus Tracking</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
                RIT Live Transport Map
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live GPS Sync
              </span>
            </div>
          </div>

          {/* Controls: Search + Toggle Drawer Button */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search route or bus no..."
                value={busSearch}
                onChange={(e) => setBusSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-colors"
                style={{ fontFamily: 'Inter, sans-serif' }}
              />
            </div>

            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                isSidebarOpen
                  ? 'bg-orange-500 text-white border-orange-400 shadow-lg shadow-orange-500/20'
                  : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
              }`}
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              <span className="hidden sm:inline">
                {isSidebarOpen ? 'Hide Routes' : `Routes List (${filteredRoutes.length})`}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Map Viewport */}
      <div className="relative h-[calc(100vh-120px)] min-h-[550px] w-full overflow-hidden">
        {loadingBus ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 z-30 gap-3">
            <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
            <p className="text-sm text-slate-400 font-semibold" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Initializing Live GPS Bus Tracking Map...
            </p>
          </div>
        ) : (
          <>
            {/* Quick Horizontal Route Chips Bar on top of Map */}
            <div className="absolute top-4 left-4 right-4 z-20 overflow-x-auto pb-2 scrollbar-none flex items-center gap-2">
              <button
                onClick={() => setSelectedBusRoute(null)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shadow-lg backdrop-blur-md transition-all border cursor-pointer ${
                  selectedBusRoute === null
                    ? 'bg-orange-500 text-white border-orange-400'
                    : 'bg-slate-900/80 text-slate-300 border-slate-700/80 hover:bg-slate-800'
                }`}
              >
                🌐 All Buses
              </button>

              {filteredRoutes.map((route) => {
                const isSelected = selectedBusRoute?.number === route.number;
                return (
                  <button
                    key={route.id}
                    onClick={() => setSelectedBusRoute(route)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shadow-lg backdrop-blur-md transition-all border flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-orange-500 text-white border-orange-400 scale-105'
                        : 'bg-slate-900/80 text-slate-300 border-slate-700/80 hover:bg-slate-800'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: route.color || '#F97316' }} />
                    {route.number}
                  </button>
                );
              })}
            </div>

            {/* The Fullscreen Map Component */}
            <BusRouteMap selectedRoute={selectedBusRoute} allRoutes={filteredRoutes} />

            {/* Sidebar / Bottom Sheet Overlay */}
            <AnimatePresence>
              {isSidebarOpen && (
                <>
                  {/* Backdrop on mobile */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsSidebarOpen(false)}
                    className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs z-30 lg:hidden"
                  />

                  {/* Drawer Panel: Floating Panel on Desktop, Bottom Sheet on Mobile */}
                  <motion.div
                    initial={{ x: '-100%', opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: '-100%', opacity: 0 }}
                    transition={{ type: 'spring', bounce: 0.1, duration: 0.3 }}
                    className="absolute top-0 left-0 bottom-0 z-40 w-full sm:w-[380px] bg-slate-900/95 border-r border-slate-800 backdrop-blur-xl shadow-2xl flex flex-col"
                  >
                    {/* Drawer Header */}
                    <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Navigation className="w-4 h-4 text-orange-400" />
                        <h2 className="text-sm font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          Select Bus Route ({filteredRoutes.length})
                        </h2>
                      </div>
                      <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Route List inside Drawer */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
                      {filteredRoutes.map((route) => (
                        <BusCard
                          key={route.id}
                          route={route}
                          isSelected={selectedBusRoute?.number === route.number}
                          onSelect={() => {
                            setSelectedBusRoute(route);
                            // Auto close sidebar on mobile for instant map view
                            if (window.innerWidth < 1024) {
                              setIsSidebarOpen(false);
                            }
                          }}
                        />
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
}
