import { motion } from 'framer-motion';

interface SectionTitleProps {
  tag?: string;
  title: string;
  highlight?: string;
  subtitle?: string;
  align?: 'left' | 'center';
}

export default function SectionTitle({
  tag,
  title,
  highlight,
  subtitle,
  align = 'center',
}: SectionTitleProps) {
  const isCenter = align === 'center';

  return (
    <div className={`mb-12 ${isCenter ? 'text-center' : 'text-left'}`}>
      {tag && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className={`inline-flex items-center gap-2 mb-3 ${isCenter ? 'mx-auto' : ''}`}
        >
          <span
            className="px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase"
            style={{
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              backgroundColor: '#FFF7ED',
              color: '#FF6B00',
              border: '1px solid #FFEDD5',
            }}
          >
            {tag}
          </span>
        </motion.div>
      )}

      <motion.h2
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight"
        style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: '#1A0B2E' }}
      >
        {title}{' '}
        {highlight && (
          <span
            className="relative inline-block"
            style={{
              background: 'linear-gradient(135deg, #FF6B00, #F97316)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {highlight}
          </span>
        )}
      </motion.h2>

      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`mt-3 text-base text-[#4A3E5E] max-w-xl ${isCenter ? 'mx-auto' : ''}`}
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}
