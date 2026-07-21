import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { Stat } from '@/types';

interface StatsCardProps {
  stat: Stat;
  delay?: number;
}

function useCountUp(target: number, duration: number = 1800, start: boolean = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCount(Math.floor(ease * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);

  return count;
}

export default function StatsCard({ stat, delay = 0 }: StatsCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const count = useCountUp(stat.value, 1800, isVisible);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -3, boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}
      className="relative bg-white border border-[#E5E7EB] rounded-2xl p-6 py-8 flex flex-col items-center justify-center text-center group overflow-hidden"
      style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}
    >
      {/* Corner Bracket Decorations from Reference Image */}
      <div className="absolute top-4 right-4 w-3.5 h-3.5 border-t-2 border-r-2 border-[#F97316]/50 rounded-tr-[4px] transition-all duration-300 group-hover:scale-110 group-hover:border-[#F97316]" />
      <div className="absolute bottom-4 left-4 w-3.5 h-3.5 border-b-2 border-l-2 border-[#F97316]/50 rounded-bl-[4px] transition-all duration-300 group-hover:scale-110 group-hover:border-[#F97316]" />

      <div>
        <div
          className="text-3xl md:text-4xl font-extrabold text-[#1E293B] tracking-tight"
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          {count}
          {stat.suffix}
        </div>
        <div
          className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] mt-2"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {stat.label}
        </div>
      </div>
    </motion.div>
  );
}
