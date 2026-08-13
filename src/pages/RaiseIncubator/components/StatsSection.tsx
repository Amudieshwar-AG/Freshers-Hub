import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Rocket, GraduationCap, Users, Layers } from 'lucide-react';

interface CounterProps {
  value: number;
  duration?: number;
  suffix?: string;
}

const AnimatedCounter: React.FC<CounterProps> = ({ value, duration = 1.2, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (inView) {
      let start = 0;
      const end = value;
      if (start === end) {
        setCount(end);
        return;
      }

      const totalMiliseconds = duration * 1000;
      const steps = Math.min(end, 50); // limit steps to keep it smooth
      const increment = Math.ceil(end / steps);
      const stepTime = totalMiliseconds / steps;

      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          clearInterval(timer);
          setCount(end);
        } else {
          setCount(start);
        }
      }, stepTime);

      return () => clearInterval(timer);
    }
  }, [inView, value, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
};

export const StatsSection: React.FC = () => {
  const stats = [
    {
      icon: <Rocket className="w-6 h-6 text-neutral-800" />,
      value: 22,
      suffix: "",
      label: "Active Incubated Startups",
      description: "Ambitious companies in various stages from idea validation to commercial revenue."
    },
    {
      icon: <GraduationCap className="w-6 h-6 text-neutral-800" />,
      value: 100,
      suffix: "%",
      label: "Student Founders",
      description: "Driven completely by the entrepreneurial spirit of RIT's student community."
    },
    {
      icon: <Users className="w-6 h-6 text-neutral-800" />,
      value: 20,
      suffix: "+",
      label: "Mentors Enabled",
      description: "Expert guidance from industry leaders and academics across engineering domains."
    },
    {
      icon: <Layers className="w-6 h-6 text-neutral-800" />,
      value: 8,
      suffix: "",
      label: "Sectors Represented",
      description: "Diverse projects across software, AI, hardware, campus tools, and social impact."
    }
  ];

  return (
    <section 
      id="stats" 
      className="relative w-full py-20 md:py-28 px-6 md:px-12 bg-neutral-50 border-y border-neutral-100 overflow-hidden"
    >
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-brand-purple/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <div className="text-center mb-16 md:mb-20">
          <span className="font-sans text-xs font-bold uppercase tracking-widest text-neutral-500 border border-neutral-200 px-3.5 py-1.5 rounded-full bg-white">
            Incubator Performance
          </span>
          <h2 className="font-heading text-3xl md:text-5xl font-extrabold text-neutral-900 mt-4 mb-4 tracking-tight">
            Our Metrics In Action
          </h2>
          <p className="font-sans text-sm md:text-base text-neutral-500 max-w-xl mx-auto">
            A snapshot of the growth and ecosystem metrics recorded for the year 2026.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-2xl p-6 md:p-8 border border-neutral-200/50 shadow-premium shadow-premium-hover flex flex-col justify-between"
            >
              <div>
                <div className="p-3 bg-neutral-50 rounded-xl w-fit mb-6">
                  {stat.icon}
                </div>
                
                <h3 className="font-heading font-extrabold text-5xl md:text-6xl text-neutral-900 tracking-tight mb-2">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </h3>
                
                <h4 className="font-heading font-bold text-sm text-neutral-800 uppercase tracking-wide mb-3">
                  {stat.label}
                </h4>
              </div>

              <p className="font-sans text-xs text-neutral-400 leading-relaxed mt-2">
                {stat.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
