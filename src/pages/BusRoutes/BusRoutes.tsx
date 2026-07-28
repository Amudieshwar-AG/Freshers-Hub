import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Loader2, ChevronRight } from 'lucide-react';
import BusCard from '@/components/BusCard/BusCard';
import BusRouteMap from '@/components/BusRouteMap/BusRouteMap';
import { StaggerContainer, StaggerItem } from '@/components/AnimatedContainer/AnimatedContainer';
import type { BusRoute } from '@/types';
import { getBackendUrl } from '@/lib/utils';
import { Link } from 'react-router-dom';

export default function BusRoutes() {
  const [busSearch, setBusSearch] = useState('');
  const [busRoutes, setBusRoutes] = useState<BusRoute[]>([]);
  const [loadingBus, setLoadingBus] = useState(true);
  const [selectedBusRoute, setSelectedBusRoute] = useState<BusRoute | null>(null);

  useEffect(() => {
    setLoadingBus(true);
    fetch(getBackendUrl('/api/bus-routes'))
      .then((res) => {
        if (!res.ok) throw new Error('Backend offline');
        return res.json();
      })
      .then((data) => {
        if (data && data.length > 0) {
          setBusRoutes(data);
          setSelectedBusRoute(data[0]);
        } else {
          throw new Error('Empty data');
        }
        setLoadingBus(false);
      })
      .catch(() => {
        fetch('/bus_routes.json')
          .then((res) => res.json())
          .then((data) => {
            setBusRoutes(data);
            setSelectedBusRoute(data[0]);
          })
          .catch((err) => console.error('Fallback fetch error:', err))
          .finally(() => {
            setLoadingBus(false);
          });
      });
  }, []);

  const filteredRoutes = busRoutes.filter((r) =>
    r.name.toLowerCase().includes(busSearch.toLowerCase()) ||
    r.from.toLowerCase().includes(busSearch.toLowerCase()) ||
    r.number.toLowerCase().includes(busSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#FAFAFA]">
      <div className="relative z-10">
        {/* Header */}
        <div className="bg-white border-b border-[#E5E7EB] py-10">
          <div className="container-custom">
            <div className="flex items-center gap-2 text-xs text-[#94A3B8] mb-3">
              <Link to="/" className="hover:text-[#F97316]">Home</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-[#F97316]">Bus Routes</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#1E293B] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
              RIT{' '}
              <span style={{ background: 'linear-gradient(135deg, #F97316, #FB923C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Bus Routes
              </span>
            </h1>
            <p className="text-[#475569] text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
              View all campus bus routes, timings, and pickup locations at a glance.
            </p>
          </div>
        </div>

        <div className="container-custom py-8">
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
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Routes List */}
              <div className="lg:col-span-5 max-h-[650px] overflow-y-auto pr-2 space-y-4 scrollbar-thin">
                <StaggerContainer>
                  {filteredRoutes.map((route) => (
                    <StaggerItem key={route.id} className="mb-4">
                      <BusCard 
                        route={route} 
                        isSelected={selectedBusRoute?.number === route.number}
                        onSelect={() => setSelectedBusRoute(route)}
                      />
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              </div>

              {/* Interactive Map */}
              <div className="lg:col-span-7 h-[450px] lg:h-[650px] sticky top-24">
                <BusRouteMap 
                  selectedRoute={selectedBusRoute} 
                  allRoutes={filteredRoutes} 
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
