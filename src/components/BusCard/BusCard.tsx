import { motion } from 'framer-motion';
import { Clock, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import type { BusRoute } from '@/types';

interface BusCardProps {
  route: BusRoute;
}

export default function BusCard({ route }: BusCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      layout
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden"
      style={{ boxShadow: '0 2px 15px -3px rgba(0,0,0,0.07)' }}
    >
      {/* Color Strip */}
      <div className="h-1.5" style={{ backgroundColor: route.color }} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="px-2.5 py-0.5 rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: route.color, fontFamily: 'Poppins, sans-serif' }}
              >
                {route.number}
              </span>
            </div>
            <h3 className="font-semibold text-[#1E293B] text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {route.name}
            </h3>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#94A3B8] shrink-0">
            <Clock className="w-3.5 h-3.5" />
            <span style={{ fontFamily: 'Inter, sans-serif' }}>{route.departureTime}</span>
          </div>
        </div>

        {/* Route Summary */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex flex-col items-center gap-1">
            <div className="w-2 h-2 rounded-full border-2" style={{ borderColor: route.color }} />
            <div className="w-0.5 h-8 bg-[#E5E7EB]" />
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: route.color }} />
          </div>
          <div className="flex flex-col justify-between h-12">
            <span className="text-xs font-medium text-[#475569]" style={{ fontFamily: 'Inter, sans-serif' }}>
              {route.from}
            </span>
            <span className="text-xs font-medium text-[#475569]" style={{ fontFamily: 'Inter, sans-serif' }}>
              {route.to}
            </span>
          </div>
        </div>

        {/* Arrival */}
        <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-3">
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            <span style={{ fontFamily: 'Inter, sans-serif' }}>{route.stops.length} stops</span>
          </div>
          <span style={{ fontFamily: 'Inter, sans-serif' }}>Arrives: {route.arrivalTime}</span>
        </div>

        {/* Toggle Stops */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all"
          style={{
            fontFamily: 'Poppins, sans-serif',
            color: route.color,
            backgroundColor: `${route.color}12`,
          }}
        >
          {expanded ? 'Hide Stops' : 'View Stops'}
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {/* Stops Expanded */}
        <motion.div
          initial={false}
          animate={{ height: expanded ? 'auto' : 0, opacity: expanded ? 1 : 0 }}
          transition={{ duration: 0.25 }}
          className="overflow-hidden"
        >
          <div className="mt-3 flex flex-col gap-2 pl-1">
            {route.stops.map((stop, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex flex-col items-center gap-0.5">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: i === 0 || i === route.stops.length - 1 ? route.color : '#E5E7EB' }}
                  />
                  {i < route.stops.length - 1 && <div className="w-0.5 h-4 bg-[#E5E7EB]" />}
                </div>
                <div className="flex items-center justify-between flex-1">
                  <span className="text-xs text-[#475569]" style={{ fontFamily: 'Inter, sans-serif' }}>{stop.name}</span>
                  <span className="text-xs text-[#94A3B8]" style={{ fontFamily: 'Inter, sans-serif' }}>{stop.time}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
