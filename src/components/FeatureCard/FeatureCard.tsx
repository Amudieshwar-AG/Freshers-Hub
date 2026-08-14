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
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className="bg-white border border-[#E9E5EE] rounded-2xl p-6 flex flex-col gap-4 group cursor-pointer shadow-[0_4px_20px_-4px_rgba(19,9,36,0.04)] hover:shadow-[0_12px_35px_-6px_rgba(19,9,36,0.08)] hover:border-[#FF6B00]/30"
    >
      {/* Icon */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105"
        style={{ backgroundColor: feature.bgColor, color: feature.color }}
      >
        {IconComponent && <IconComponent className="w-6 h-6" />}
      </div>

      {/* Content */}
      <div className="flex-1">
        <h3
          className="text-base font-bold text-[#1A0B2E] mb-1.5"
          style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        >
          {feature.title}
        </h3>
        <p className="text-sm text-[#4A3E5E] leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
          {feature.description}
        </p>
      </div>

      {/* Arrow */}
      <Link
        to={feature.path}
        className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-all duration-200 w-fit"
        style={{
          fontFamily: 'Plus Jakarta Sans, sans-serif',
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
