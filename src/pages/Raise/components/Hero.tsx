import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, Award } from 'lucide-react';
import raiseLogo from '@/assets/raise/Raiselogo.webp';
import collegeLogo from '@/assets/raise/college-logo.webp';

interface HeroProps {
  onScrollToSection: (sectionId: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onScrollToSection }) => {
  const letters = ['R', 'A', 'I', 'S', 'E'];
  
  // Track drag/hover status for each letter
  const [hoveredStates, setHoveredStates] = useState<boolean[]>([false, false, false, false, false]);
  const [isIntro, setIsIntro] = useState(true);
  const [entryCompleted, setEntryCompleted] = useState(false);
  const [hoverActive, setHoverActive] = useState(false);

  useEffect(() => {
    // Start entrance animation almost immediately after mount
    const entryTimer = setTimeout(() => {
      setEntryCompleted(true);
    }, 10);

    // Clear entrance delays for responsive hover events
    const hoverTimer = setTimeout(() => {
      setHoverActive(true);
    }, 300);

    // End intro state and introduce surrounding content
    const introTimer = setTimeout(() => {
      setIsIntro(false);
    }, 400);

    return () => {
      clearTimeout(entryTimer);
      clearTimeout(hoverTimer);
      clearTimeout(introTimer);
    };
  }, []);

  const handleMouseEnter = (index: number) => {
    if (!hoverActive) return; // disable hover actions during entry
    setHoveredStates(prev => {
      const next = [...prev];
      next[index] = true;
      return next;
    });
  };

  const handleMouseLeave = (index: number) => {
    setHoveredStates(prev => {
      const next = [...prev];
      next[index] = false;
      return next;
    });
  };


  return (
    <header className="relative min-h-screen w-full flex flex-col justify-between items-center px-6 md:px-12 py-6 overflow-hidden bg-white grid-bg">
      {/* Background Gradients for Premium Touch */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-brand-orange/5 to-brand-pink/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-brand-purple/5 to-brand-pink/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Glassmorphism Header */}
      <motion.nav 
        animate={{ opacity: isIntro ? 0 : 1, y: isIntro ? -20 : 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-7xl mx-auto flex items-center justify-between px-3.5 sm:px-6 py-3 sm:py-4 rounded-2xl glassmorphism shadow-premium z-50"
        style={{ pointerEvents: isIntro ? 'none' : 'auto' }}
      >
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onScrollToSection('hero')}>
          <div className="relative">
            <img src={raiseLogo} alt="RAISE Incubator Logo" className="h-9 sm:h-11 w-auto object-contain rounded-lg" />
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
          </div>
        </div>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-8">
          <button 
            onClick={() => onScrollToSection('about')} 
            className="font-sans text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            About
          </button>
          <button 
            onClick={() => onScrollToSection('process')} 
            className="font-sans text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            Incubation Pathway
          </button>
          <button 
            onClick={() => onScrollToSection('stats')} 
            className="font-sans text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            Our Impact
          </button>
          <button 
            onClick={() => onScrollToSection('portfolio')} 
            className="font-sans text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            Startups
          </button>
        </div>

        {/* Call to Action Button & RIT Logo */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => onScrollToSection('pitch')}
            className="relative px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-850 text-white font-sans text-xs sm:text-sm font-bold shadow-lg shadow-neutral-950/10 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
          >
            Pitch Your Idea
          </button>
          
          <div className="hidden sm:block h-8 w-px bg-neutral-200/80" />
          
          <a 
            href="https://ritchennai.org" 
            target="_blank" 
            rel="noopener noreferrer"
            className="transition-opacity hover:opacity-80 cursor-pointer flex items-center"
          >
            <img 
              src={collegeLogo} 
              alt="RIT College Logo" 
              className="h-8 sm:h-10 w-auto object-contain rounded-lg" 
              onError={(e) => {
                // Hide broken image frame if RIT logo is missing or placeholder is empty
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </a>
        </div>
      </motion.nav>

      {/* Hero Central Content */}
      <motion.div 
        layout
        className="flex-1 w-full max-w-5xl flex flex-col justify-center items-center text-center mt-12 md:mt-16 z-10"
      >
        {/* RIT Institution Badge */}
        {!isIntro && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-100/80 border border-neutral-200/50 mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-[#e91e63] animate-ping" />
            <span className="font-sans text-xs font-bold uppercase tracking-widest text-neutral-600">
              Rajalakshmi Institute of Technology
            </span>
          </motion.div>
        )}

        {/* Giant RAISE Text with stroke outline, slanted format, and staggered load */}
        <motion.div 
          layout
          className="flex select-none justify-center items-center gap-4 md:gap-8 mb-6 cursor-ew-resize"
        >
          {letters.map((letter, idx) => (
            <span
              key={letter + idx}
              onMouseEnter={() => handleMouseEnter(idx)}
              onMouseLeave={() => handleMouseLeave(idx)}
              onTouchStart={() => handleMouseEnter(idx)}
              onTouchEnd={() => handleMouseLeave(idx)}
              className="text-[18vw] md:text-[14vw] leading-none select-none inline-block"
              style={{
                fontFamily: '"Archivo Black", sans-serif',
                WebkitTextStroke: '4.5px #000000',
                WebkitTextFillColor: hoveredStates[idx] ? '#000000' : 'transparent',
                color: hoveredStates[idx] ? '#000000' : 'transparent',
                display: 'inline-block',
                opacity: entryCompleted ? 1 : 0,
                transform: !entryCompleted 
                  ? 'scale(0.3) skewX(0deg)'
                  : hoveredStates[idx] 
                    ? 'scale(1.08) translateY(-4px) skewX(-12deg)' 
                    : 'scale(1) skewX(-12deg)',
                transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                transitionDelay: hoverActive ? '0ms' : `${idx * 40}ms`,
                textShadow: hoveredStates[idx] ? '0 10px 30px rgba(0,0,0,0.05)' : 'none'
              }}
            >
              {letter}
            </span>
          ))}
        </motion.div>

        {/* Subtitle, Description, and Action Pills */}
        {!isIntro && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            <h2 className="font-heading text-lg md:text-xl lg:text-2xl font-bold text-neutral-800 max-w-4xl tracking-normal md:tracking-wide mb-6 uppercase">
              Rajalakshmi Accelerator & Incubator for Startup Enterprises Association
            </h2>

            <p className="font-sans text-sm md:text-base text-neutral-500 max-w-2xl leading-relaxed mb-12">
              A section 8 (not-for-profit) company inside the RIT campus. We empower student founders by providing continuous mentorship, infrastructure, and structured startup paths from ideation to seed funding.
            </p>

            <motion.div
              whileHover={{ scale: 1.03 }}
              className="inline-flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-neutral-900 to-neutral-800 text-white font-sans font-bold shadow-xl shadow-neutral-950/20 mb-8 border border-neutral-700/50"
            >
              <Award className="w-5 h-5 text-yellow-400" />
              <span className="text-sm tracking-wide">
                APPROVED UNIQUE IDEAS SECURE FUNDS UP TO <span className="text-yellow-400 underline decoration-2 underline-offset-4">₹20,000</span>
              </span>
            </motion.div>
          </motion.div>
        )}
      </motion.div>

      {/* Footer / Scroll Indicator */}
      <motion.div 
        animate={{ opacity: isIntro ? 0 : 1, y: isIntro ? 20 : 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full flex justify-between items-center max-w-7xl mx-auto z-10 py-4 border-t border-neutral-100"
        style={{ pointerEvents: isIntro ? 'none' : 'auto' }}
      >
        <div className="flex gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Active Batch 2026
          </div>
        </div>

        <motion.button 
          onClick={() => onScrollToSection('about')}
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-1 font-sans font-semibold text-xs text-neutral-400 hover:text-neutral-900 transition-colors uppercase tracking-wider cursor-pointer"
        >
          Scroll to explore
          <ArrowDown className="w-4 h-4" />
        </motion.button>

        <div className="text-xs font-semibold text-neutral-400">
          RIT Innovation Cell
        </div>
      </motion.div>
    </header>
  );
};
