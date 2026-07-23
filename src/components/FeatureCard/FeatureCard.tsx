import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Feature } from '@/types';

interface FeatureCardProps {
  feature: Feature;
}

export default function FeatureCard({ feature }: FeatureCardProps) {
  const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>>)[feature.icon];

  return (
    <motion.div
      whileHover={{ y: -6, boxShadow: '0 20px 50px -12px rgba(0,0,0,0.15)' }}
      transition={{ duration: 0.25 }}
      className="bg-white border border-[#E5E7EB] rounded-2xl p-6 flex flex-col gap-4 group cursor-pointer"
      style={{ boxShadow: '0 2px 15px -3px rgba(0,0,0,0.07)' }}
    >
      {/* Icon */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
        style={{ backgroundColor: feature.bgColor, color: feature.color }}
      >
        {IconComponent && <IconComponent className="w-6 h-6" />}
      </div>

      {/* Content */}
      <div className="flex-1">
        <h3
          className="text-base font-semibold text-[#1E293B] mb-1.5"
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          {feature.title}
        </h3>
        <p className="text-sm text-[#94A3B8] leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
          {feature.description}
        </p>
      </div>

      {/* Arrow */}
      <Link
        to={feature.path}
        className="flex items-center gap-1.5 text-sm font-semibold transition-all duration-200 w-fit"
        style={{
          fontFamily: 'Poppins, sans-serif',
          color: feature.color,
        }}
        aria-label={`Explore ${feature.title}`}
      >
        Explore
        <motion.span
          className="inline-flex"
          animate={{ x: [0, 3, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ArrowRight className="w-4 h-4" />
        </motion.span>
      </Link>
    </motion.div>
  );
}
