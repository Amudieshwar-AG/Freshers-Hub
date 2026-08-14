import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Layers, Box, TrendingUp, HelpCircle } from 'lucide-react';

interface Startup {
  name: string;
  stage: 'commercialization' | 'mvp' | 'prototype' | 'idea';
  domain: string;
  description: string;
  remarks: string;
  color: string;
}

export const PortfolioShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('all');

  const startups: Startup[] = [
    // Commercialisation
    {
      name: "Thrust.AI",
      stage: "commercialization",
      domain: "AI-based Systems",
      description: "Advanced artificial intelligence solutions for automated decision-making pipelines.",
      remarks: "Early users / revenue stage",
      color: "bg-emerald-500"
    },
    {
      name: "RIT Billbot",
      stage: "commercialization",
      domain: "Campus Solutions",
      description: "Smart billing and administration utilities designed to optimize institution expenses.",
      remarks: "Early users / revenue stage",
      color: "bg-emerald-500"
    },
    {
      name: "Machty",
      stage: "commercialization",
      domain: "Software Platform",
      description: "Developer-focused orchestration suite for managing high-performance service endpoints.",
      remarks: "Early users / revenue stage",
      color: "bg-emerald-500"
    },
    {
      name: "Num Thozhan Pvt Ltd",
      stage: "commercialization",
      domain: "Social Impact / SaaS",
      description: "A collaborative social platform linking local volunteers to regional community development goals.",
      remarks: "Early users / revenue stage",
      color: "bg-emerald-500"
    },
    
    // MVP
    {
      name: "Atomik Minds",
      stage: "mvp",
      domain: "AI-based Systems",
      description: "Cognitive educational platforms providing personalised student learning paths.",
      remarks: "Testing with users",
      color: "bg-[#C25E17]"
    },
    {
      name: "Innsole",
      stage: "mvp",
      domain: "Hardware & Health",
      description: "Smart footwear soles embedded with sensor arrays to monitor athletic gait and posture.",
      remarks: "Testing with users",
      color: "bg-[#C25E17]"
    },

    // Prototype
    {
      name: "HydrofarmIQ",
      stage: "prototype",
      domain: "Agri-Tech / IoT",
      description: "Automated hydroponics watering and nutritional delivery platform built with smart controllers.",
      remarks: "Hardware/software prototype development",
      color: "bg-amber-500"
    },
    {
      name: "Cropguard",
      stage: "prototype",
      domain: "Agri-Tech / AI",
      description: "Computer vision app scanning crop leaves to diagnose diseases and recommend treatments.",
      remarks: "Hardware/software prototype development",
      color: "bg-amber-500"
    },
    {
      name: "RIT Printbot",
      stage: "prototype",
      domain: "Hardware & Robotics",
      description: "High-resolution, cost-effective 3D printing robot tailored for mechanical labs.",
      remarks: "Hardware/software prototype development",
      color: "bg-amber-500"
    },
    {
      name: "Ecotrack",
      stage: "prototype",
      domain: "Social Impact / Ecology",
      description: "A carbon emission tracker helping organizations monitor and offset corporate footprints.",
      remarks: "Hardware/software prototype development",
      color: "bg-amber-500"
    },
    {
      name: "BeautifyNet",
      stage: "prototype",
      domain: "Software Platform",
      description: "A virtual makeup trial and booking assistant running on real-time neural models.",
      remarks: "Hardware/software prototype development",
      color: "bg-amber-500"
    },
    {
      name: "RIT Transport App",
      stage: "prototype",
      domain: "Campus Solutions",
      description: "Live shuttle and transport fleet tracker providing precise arrival estimates for RIT riders.",
      remarks: "Hardware/software prototype development",
      color: "bg-amber-500"
    },
    {
      name: "SafeHer Travels",
      stage: "prototype",
      domain: "Social Impact / Security",
      description: "An emergency response and location verification application dedicated to women travelers.",
      remarks: "Hardware/software prototype development",
      color: "bg-amber-500"
    },
    {
      name: "Elroi Automations Pvt Ltd",
      stage: "prototype",
      domain: "Hardware & Automation",
      description: "Smart switchboard relays enabling legacy appliance management via internet platforms.",
      remarks: "Hardware/software prototype development",
      color: "bg-amber-500"
    },
    {
      name: "Mishara",
      stage: "prototype",
      domain: "Software Platform",
      description: "A secure digital credentials safe for students, using robust cryptographic proofs.",
      remarks: "Hardware/software prototype development",
      color: "bg-amber-500"
    },
    {
      name: "AgriNed Technologies",
      stage: "prototype",
      domain: "Agri-Tech / Hardware",
      description: "A deployable field weather station analyzing soil moisture, humidity, and atmospheric data.",
      remarks: "Hardware/software prototype development",
      color: "bg-amber-500"
    },

    // Idea
    {
      name: "HirEd",
      stage: "idea",
      domain: "Software Platform / HR-tech",
      description: "A recruitment network matching student projects to corporate internships based on skill graphs.",
      remarks: "Problem validation in progress",
      color: "bg-purple-500"
    },
    {
      name: "Authenticate",
      stage: "idea",
      domain: "Cybersecurity / Blockchain",
      description: "Decentralized document validation system built to eliminate certificate counterfeiting.",
      remarks: "Problem validation in progress",
      color: "bg-purple-500"
    },
    {
      name: "Ivanus",
      stage: "idea",
      domain: "AI-based Systems",
      description: "Custom Large Language Model micro-agents trained to automate specialized backend tasks.",
      remarks: "Problem validation in progress",
      color: "bg-purple-500"
    },
    {
      name: "Customizer Consent",
      stage: "idea",
      domain: "Software Platform / Privacy",
      description: "A centralized user data privacy panel that handles cookie compliance and user consent.",
      remarks: "Problem validation in progress",
      color: "bg-purple-500"
    },
    {
      name: "Soundscape",
      stage: "idea",
      domain: "Social Impact / Audio",
      description: "Spatial audio generation software built to assist visually impaired individuals navigate campus.",
      remarks: "Problem validation in progress",
      color: "bg-purple-500"
    },
    {
      name: "Yoovan AI",
      stage: "idea",
      domain: "AI-based Systems / HR",
      description: "Personalized resume preparation and AI-assisted interview screening tool.",
      remarks: "Problem validation in progress",
      color: "bg-purple-500"
    }
  ];

  const filteredStartups = activeTab === 'all' 
    ? startups 
    : startups.filter(s => s.stage === activeTab);

  const getStageIcon = (stage: string) => {
    switch(stage) {
      case 'commercialization': return <TrendingUp className="w-4 h-4 text-emerald-600" />;
      case 'mvp': return <Box className="w-4 h-4 text-orange-600" />;
      case 'prototype': return <Layers className="w-4 h-4 text-amber-600" />;
      case 'idea': return <Sparkles className="w-4 h-4 text-purple-600" />;
      default: return <HelpCircle className="w-4 h-4" />;
    }
  };

  const getStageTitle = (stage: string) => {
    if (stage === 'mvp') return 'MVP Stage';
    return stage.charAt(0).toUpperCase() + stage.slice(1) + ' Stage';
  };

  return (
    <section 
      id="portfolio" 
      className="relative w-full py-24 md:py-32 px-6 md:px-12 bg-white flex flex-col items-center overflow-hidden"
    >
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-brand-orange/5 to-brand-pink/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="max-w-4xl text-center mb-16 z-10">
        <span className="font-sans text-xs font-bold uppercase tracking-widest text-neutral-500 border border-neutral-200 px-3.5 py-1.5 rounded-full bg-neutral-50">
          Startup Showcase
        </span>
        <h2 className="font-heading text-3xl md:text-5xl font-extrabold text-neutral-900 mt-4 mb-6 tracking-tight">
          Portfolio Directory
        </h2>
        <p className="font-sans text-sm md:text-base text-neutral-500 max-w-2xl mx-auto">
          Explore the 22 student-led ventures currently incubated at RAISE. See their development maturity, from problem-validation ideas to active commercialization.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="w-full max-w-4xl flex flex-wrap justify-center gap-2 md:gap-3 mb-16 z-10">
        {['all', 'commercialization', 'mvp', 'prototype', 'idea'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-xl font-sans text-xs md:text-sm font-semibold tracking-wide capitalize transition-all duration-300 ${
              activeTab === tab
                ? 'bg-neutral-950 text-white shadow-lg shadow-neutral-950/10 scale-[1.02]'
                : 'bg-neutral-100 hover:bg-neutral-200/60 text-neutral-600 hover:text-neutral-900'
            }`}
          >
            {tab === 'all' ? 'All Projects' : tab === 'mvp' ? 'MVP' : tab}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <motion.div 
        layout
        className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 z-10"
      >
        <AnimatePresence mode="popLayout">
          {filteredStartups.map((startup) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              key={startup.name}
              className="bg-neutral-50/40 rounded-2xl p-6 md:p-8 border border-neutral-200/60 shadow-premium shadow-premium-hover flex flex-col justify-between"
            >
              <div>
                {/* Stage Indicator Pill */}
                <div className="flex justify-between items-center mb-6">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider ${
                    startup.stage === 'commercialization' ? 'bg-emerald-100 text-emerald-800' :
                    startup.stage === 'mvp' ? 'bg-orange-100 text-orange-800' :
                    startup.stage === 'prototype' ? 'bg-amber-100 text-amber-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {getStageIcon(startup.stage)}
                    {getStageTitle(startup.stage)}
                  </span>
                  
                  {/* Status Indicator */}
                  <span className="w-2.5 h-2.5 rounded-full bg-neutral-200 relative">
                    <span className={`absolute inset-0 rounded-full ${startup.color} animate-ping opacity-75`} />
                    <span className={`absolute inset-0 rounded-full ${startup.color}`} />
                  </span>
                </div>

                <h3 className="font-heading text-xl font-bold text-neutral-900 mb-1">
                  {startup.name}
                </h3>
                
                <span className="font-sans text-[11px] md:text-xs font-semibold text-neutral-400 uppercase tracking-widest block mb-4">
                  {startup.domain}
                </span>

                <p className="font-sans text-xs md:text-sm text-neutral-500 leading-relaxed mb-6">
                  {startup.description}
                </p>
              </div>

              {/* Remarks Box */}
              <div className="border-t border-neutral-200/50 pt-4 mt-auto">
                <span className="font-sans text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                  Status Remarks
                </span>
                <span className="font-sans text-xs font-semibold text-neutral-800">
                  {startup.remarks}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </section>
  );
};
