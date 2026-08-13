import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Target, Sparkles, Milestone, Award, Lightbulb, Cpu, ShieldCheck } from 'lucide-react';

export const AboutSection: React.FC = () => {
  const offerings = [
    { icon: <Milestone className="w-5 h-5 text-neutral-800" />, name: "Guidance & Training" },
    { icon: <Cpu className="w-5 h-5 text-neutral-800" />, name: "Infrastructure support" },
    { icon: <Target className="w-5 h-5 text-neutral-800" />, name: "1-on-1 Mentorship" },
    { icon: <Award className="w-5 h-5 text-neutral-800" />, name: "Seed Funding Support" },
    { icon: <Sparkles className="w-5 h-5 text-neutral-800" />, name: "IPR & Patent Filing" },
    { icon: <ShieldCheck className="w-5 h-5 text-neutral-800" />, name: "Networking Events" }
  ];

  const curriculumPoints = [
    { title: "Academic Ideation", desc: "Formulate ideas with solid validation and engineering frameworks built into your college curriculum." },
    { title: "Business Model Design", desc: "Map your target market, construct unit economics, and define your revenue capture strategy." },
    { title: "IPR & Pitch Readiness", desc: "Gain legal structures, learn patent filing mechanics, and polish your investor-facing deck." }
  ];

  return (
    <section 
      id="about" 
      className="relative w-full py-24 md:py-32 px-6 md:px-12 bg-white overflow-hidden"
    >
      <div className="absolute top-0 right-1/3 w-96 h-96 bg-brand-orange/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto space-y-24 md:space-y-32">
        {/* Core Vision & Mission */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-5 space-y-6"
          >
            <span className="font-sans text-xs font-bold uppercase tracking-widest text-[#e91e63] bg-[#e91e63]/10 px-3.5 py-1.5 rounded-full">
              Who We Are
            </span>
            <h2 className="font-heading text-3xl md:text-5xl font-extrabold text-neutral-900 tracking-tight leading-none">
              Empowering Student Founders
            </h2>
            <p className="font-sans text-sm md:text-base text-neutral-500 leading-relaxed">
              RAISE Incubator is a dedicated Section 8 (not-for-profit) company situated directly within the Rajalakshmi Institute of Technology campus. We transform engineering ideas into market-viable products.
            </p>
            
            {/* Offerings Icons List */}
            <div className="pt-6">
              <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-neutral-400 mb-4">
                What We Provide
              </h4>
              <div className="grid grid-cols-2 gap-4">
                {offerings.map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="p-2 bg-neutral-50 border border-neutral-200/50 rounded-lg">
                      {item.icon}
                    </div>
                    <span className="font-sans text-xs font-bold text-neutral-700">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6"
          >
            {/* Vision Card */}
            <div className="bg-neutral-50 rounded-3xl p-6 md:p-8 border border-neutral-200/60 shadow-premium">
              <div className="w-12 h-12 rounded-xl bg-neutral-900 text-white flex items-center justify-center mb-6">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-xl font-bold text-neutral-900 mb-3">Our Vision</h3>
              <p className="font-sans text-xs md:text-sm text-neutral-500 leading-relaxed">
                To create a vibrant innovation and entrepreneurship ecosystem that transforms ideas into impactful startups, fosters industry-relevant technologies, and nurtures socially responsible innovators.
              </p>
            </div>

            {/* Mission Card */}
            <div className="bg-neutral-50 rounded-3xl p-6 md:p-8 border border-neutral-200/60 shadow-premium">
              <div className="w-12 h-12 rounded-xl bg-neutral-900 text-white flex items-center justify-center mb-6">
                <Lightbulb className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-xl font-bold text-neutral-900 mb-3">Our Mission</h3>
              <ul className="font-sans text-xs md:text-sm text-neutral-500 space-y-3 list-disc pl-4 leading-relaxed">
                <li>Promote entrepreneurial thinking among students & faculty through structured ideation.</li>
                <li>Facilitate industry partnerships, IP/Patent creation, and critical seed funding.</li>
                <li>Align initiatives with national missions for long-term societal and economic impact.</li>
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Unique Differentiator - Academic Course */}
        <div className="relative rounded-3xl bg-neutral-950 text-white p-8 md:p-16 border border-neutral-800 shadow-2xl overflow-hidden">
          {/* Subtle decoration */}
          <div className="absolute right-0 bottom-0 w-80 h-80 bg-brand-pink/10 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
            <div className="lg:col-span-5 space-y-6">
              <span className="font-sans text-xs font-bold uppercase tracking-widest text-yellow-400 bg-yellow-400/10 px-3.5 py-1.5 rounded-full border border-yellow-400/20">
                Unique Differentiator
              </span>
              <h2 className="font-heading text-3xl md:text-4xl font-extrabold tracking-tight leading-none">
                Not Just a Club. <br />An Academic Course.
              </h2>
              <p className="font-sans text-xs md:text-sm text-neutral-400 leading-relaxed">
                RAISE is different from regular university incubators. We integrate entrepreneurship as a structured academic course for RIT students.
              </p>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-neutral-800 rounded-xl">
                  <BookOpen className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <span className="font-heading font-bold text-sm block">Structured Syllabus</span>
                  <span className="font-sans text-xs text-neutral-400">Earn course credits while launching a company.</span>
                </div>
              </div>
            </div>

            {/* Differentiator Milestones */}
            <div className="lg:col-span-7 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {curriculumPoints.map((point, index) => (
                  <div key={index} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-3">
                    <span className="font-heading font-extrabold text-sm text-neutral-600">0{index + 1}</span>
                    <h4 className="font-heading font-bold text-sm text-white">{point.title}</h4>
                    <p className="font-sans text-xs text-neutral-400 leading-relaxed">{point.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
