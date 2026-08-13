import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { UserCheck, Award, FileSpreadsheet, Compass } from 'lucide-react';

export const ProcessSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track scroll progress of the container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Smooth out the scroll progress using a spring
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Map progress to height percent
  const lineHeight = useTransform(scaleY, [0, 0.7], ["0%", "100%"]);

  const steps = [
    {
      number: "01",
      icon: <Compass className="w-6 h-6 text-neutral-800" />,
      title: "Ideate & Approach Incubation Manager",
      description: "Students pitch their raw project ideas or initial prototypes directly to the Incubation Manager at the RAISE incubation cell. No complex business plan needed initially—just pure innovation.",
      highlight: "Open to all RIT students & departments"
    },
    {
      number: "02",
      icon: <UserCheck className="w-6 h-6 text-neutral-800" />,
      title: "Incubation Manager Approval",
      description: "The Incubation Manager reviews the project for originality, feasibility, and societal or commercial impact. If the concept is unique, it gets the formal approval for institution submission.",
      highlight: "Uniqueness evaluation & technical verification"
    },
    {
      number: "03",
      icon: <FileSpreadsheet className="w-6 h-6 text-neutral-800" />,
      title: "College Submission",
      description: "Approved projects are forwarded directly to the college governance system, backed by the incubation center's official recommendation for launch support.",
      highlight: "Formal institution backing"
    },
    {
      number: "04",
      icon: <Award className="w-6 h-6 text-yellow-600" />,
      title: "Funding & Execution",
      description: "Rajalakshmi Institute of Technology awards seed funding to the project, helping you build real prototypes and transition your student project into a fully fledged startup.",
      highlight: "Seed Funding up to ₹20,000",
      special: true
    }
  ];

  return (
    <section 
      id="process" 
      ref={containerRef}
      className="relative w-full py-24 md:py-32 px-6 md:px-12 bg-white flex flex-col items-center overflow-hidden"
    >
      {/* Decorative Grid Line */}
      <div className="absolute right-0 top-1/3 w-96 h-96 bg-brand-orange/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Title */}
      <div className="max-w-4xl text-center mb-20 z-10">
        <span className="font-sans text-xs font-bold uppercase tracking-widest text-[#e91e63] bg-[#e91e63]/10 px-3.5 py-1.5 rounded-full">
          The Incubation Pipeline
        </span>
        <h2 className="font-heading text-3xl md:text-5xl font-extrabold text-neutral-900 mt-4 mb-6 tracking-tight">
          How Your Idea Becomes Funded
        </h2>
        <p className="font-sans text-sm md:text-base text-neutral-500 max-w-2xl mx-auto leading-relaxed">
          From an initial thought to institutional backing—here is the exact journey RIT students take to lock down support, guidance, and financial grants for their project.
        </p>
      </div>

      {/* Scroll-telling Process Flow */}
      <div className="relative w-full max-w-4xl">
        {/* Central Vertical Connector Line (Desktop) */}
        <div className="absolute left-1/2 -translate-x-1/2 top-4 bottom-4 w-1 bg-neutral-100 hidden md:block">
          <motion.div 
            style={{ height: lineHeight }}
            className="w-full bg-gradient-to-b from-[#ff4e50] via-[#e91e63] to-[#9c27b0] origin-top rounded-full"
          />
        </div>

        {/* Timeline Items */}
        <div className="space-y-16 md:space-y-28 relative">
          {steps.map((step, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <div 
                key={idx}
                className={`flex flex-col md:flex-row items-center md:justify-between w-full relative ${
                  isEven ? 'md:flex-row-reverse' : ''
                }`}
              >
                {/* Visual Dot on Timeline (Desktop) */}
                <div className="absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white border-4 border-neutral-100 shadow-md flex items-center justify-center z-20 hidden md:flex">
                  <span className={`w-3.5 h-3.5 rounded-full ${step.special ? 'bg-yellow-500 animate-pulse' : 'bg-neutral-800'}`} />
                </div>

                {/* Left/Right Card */}
                <motion.div 
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className={`w-full md:w-[45%] rounded-2xl p-6 md:p-8 border transition-all duration-300 ${
                    step.special 
                      ? 'bg-neutral-900 border-neutral-800 text-white shadow-2xl shadow-neutral-900/10' 
                      : 'bg-neutral-50/50 border-neutral-200/60 hover:bg-neutral-50 hover:border-neutral-300/80 shadow-premium'
                  }`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className={`p-3.5 rounded-xl ${step.special ? 'bg-yellow-500/15' : 'bg-neutral-100'}`}>
                      {step.icon}
                    </div>
                    <span className={`font-heading font-extrabold text-3xl ${step.special ? 'text-yellow-400' : 'text-neutral-300'}`}>
                      {step.number}
                    </span>
                  </div>

                  <h3 className={`font-heading text-lg md:text-xl font-bold mb-3 ${step.special ? 'text-white' : 'text-neutral-900'}`}>
                    {step.title}
                  </h3>

                  <p className={`font-sans text-xs md:text-sm leading-relaxed mb-6 ${step.special ? 'text-neutral-400' : 'text-neutral-500'}`}>
                    {step.description}
                  </p>

                  <div className="flex items-center gap-2 mt-auto">
                    <span className={`w-2 h-2 rounded-full ${step.special ? 'bg-yellow-400' : 'bg-[#e91e63]'}`} />
                    <span className={`font-sans text-[11px] md:text-xs font-bold uppercase tracking-wider ${
                      step.special ? 'text-yellow-400' : 'text-neutral-700'
                    }`}>
                      {step.highlight}
                    </span>
                  </div>
                </motion.div>

                {/* Empty Spacer Column for Desktop Grid Alignment */}
                <div className="w-full md:w-[45%] hidden md:block" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
