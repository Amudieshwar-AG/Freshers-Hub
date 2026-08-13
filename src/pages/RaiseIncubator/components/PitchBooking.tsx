import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, User, Mail, GraduationCap, FileText, CheckCircle, Clock } from 'lucide-react';

export const PitchBooking: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    projectTitle: '',
    uniqueness: '',
    slotDate: '',
    slotTime: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'slotDate' && value) {
      const date = new Date(value);
      const day = date.getUTCDay();
      if (day === 6 || day === 0) {
        setErrors(prev => ({ 
          ...prev, 
          slotDate: 'Sessions cannot be scheduled on weekends (Saturday/Sunday)' 
        }));
        setFormData(prev => ({ ...prev, slotDate: '' }));
        return;
      }
    }

    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'RIT student email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.projectTitle.trim()) newErrors.projectTitle = 'Project title is required';
    if (!formData.uniqueness.trim()) {
      newErrors.uniqueness = 'Please explain what makes your project unique';
    } else if (formData.uniqueness.trim().length < 20) {
      newErrors.uniqueness = 'Please provide a more detailed description (min 20 characters)';
    }
    if (!formData.slotDate) {
      newErrors.slotDate = 'Please select a date';
    } else {
      const date = new Date(formData.slotDate);
      const day = date.getUTCDay();
      if (day === 6 || day === 0) {
        newErrors.slotDate = 'Sessions cannot be scheduled on weekends (Saturday/Sunday)';
      }
    }
    if (!formData.slotTime) newErrors.slotTime = 'Please select a time slot';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      // Simulate API submit delay
      setTimeout(() => {
        setIsSubmitting(false);
        setIsSubmitted(true);
      }, 1500);
    }
  };

  const timeSlots = [
    "09:00 AM - 11:00 AM",
    "11:00 AM - 01:00 PM",
    "01:00 PM - 03:00 PM"
  ];

  return (
    <section 
      id="pitch" 
      className="relative w-full py-24 md:py-32 px-6 md:px-12 bg-neutral-50/50 border-t border-neutral-100 overflow-hidden flex flex-col items-center"
    >
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-brand-pink/5 to-brand-purple/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Header */}
      <div className="max-w-4xl text-center mb-16 z-10">
        <span className="font-sans text-xs font-bold uppercase tracking-widest text-[#e91e63] bg-[#e91e63]/10 px-3.5 py-1.5 rounded-full">
          Work With Us
        </span>
        <h2 className="font-heading text-3xl md:text-5xl font-extrabold text-neutral-900 mt-4 mb-6 tracking-tight">
          Pitch Your Startup Idea
        </h2>
        <p className="font-sans text-sm md:text-base text-neutral-500 max-w-2xl mx-auto leading-relaxed">
          Ready to present? Secure a time slot with our RAISE Incubation Manager, <span className="font-semibold text-neutral-800">Mr. B. Aravind</span>. Once approved, the project will be fast-tracked to college administration for seed grant checks up to <span className="font-bold text-neutral-800">₹20,000</span>.
        </p>
      </div>

      <div className="w-full max-w-3xl z-10">
        <AnimatePresence mode="wait">
          {!isSubmitted ? (
            <motion.form
              key="booking-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              onSubmit={handleSubmit}
              className="bg-white rounded-3xl p-6 md:p-10 border border-neutral-200/60 shadow-premium space-y-6 md:space-y-8"
            >
              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Founder Name */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="font-sans text-xs font-bold text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-4 h-4 text-neutral-400" /> Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                    className={`px-4 py-3 rounded-xl border font-sans text-sm outline-none transition-all ${
                      errors.name ? 'border-red-400 focus:border-red-500 bg-red-50/10' : 'border-neutral-200 focus:border-neutral-950'
                    }`}
                  />
                  {errors.name && <span className="font-sans text-xs text-red-500 font-semibold">{errors.name}</span>}
                </div>

                {/* Email Address */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="font-sans text-xs font-bold text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-neutral-400" /> RIT Student Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="studentname@ritchennai.edu.in"
                    className={`px-4 py-3 rounded-xl border font-sans text-sm outline-none transition-all ${
                      errors.email ? 'border-red-400 focus:border-red-500 bg-red-50/10' : 'border-neutral-200 focus:border-neutral-950'
                    }`}
                  />
                  {errors.email && <span className="font-sans text-xs text-red-500 font-semibold">{errors.email}</span>}
                </div>

                {/* Department */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="department" className="font-sans text-xs font-bold text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-neutral-400" /> Department
                  </label>
                  <select
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className={`px-4 py-3 rounded-xl border font-sans text-sm outline-none bg-white transition-all ${
                      errors.department ? 'border-red-400 focus:border-red-500 bg-red-50/10' : 'border-neutral-200 focus:border-neutral-950'
                    }`}
                  >
                    <option value="">Select your department</option>
                    <option value="Artificial Intelligence and Data Science">Artificial Intelligence and Data Science</option>
                    <option value="Computer Science and Engineering">Computer Science and Engineering</option>
                    <option value="Computer Science and Engineering (AI & ML)">Computer Science and Engineering (AI & ML)</option>
                    <option value="Computer Science and Business Systems">Computer Science and Business Systems</option>
                    <option value="Computer and Communication Engineering">Computer and Communication Engineering</option>
                    <option value="Electrical and Communication Engineering">Electrical and Communication Engineering</option>
                    <option value="EE(VLSI)">EE(VLSI)</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Biotechnology">Biotechnology</option>
                    <option value="Other / Interdisciplinary">Other / Interdisciplinary</option>
                  </select>
                  {errors.department && <span className="font-sans text-xs text-red-500 font-semibold">{errors.department}</span>}
                </div>

                {/* Project Title */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="projectTitle" className="font-sans text-xs font-bold text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-neutral-400" /> Project / Startup Title
                  </label>
                  <input
                    type="text"
                    id="projectTitle"
                    name="projectTitle"
                    value={formData.projectTitle}
                    onChange={handleInputChange}
                    placeholder="Enter project name"
                    className={`px-4 py-3 rounded-xl border font-sans text-sm outline-none transition-all ${
                      errors.projectTitle ? 'border-red-400 focus:border-red-500 bg-red-50/10' : 'border-neutral-200 focus:border-neutral-950'
                    }`}
                  />
                  {errors.projectTitle && <span className="font-sans text-xs text-red-500 font-semibold">{errors.projectTitle}</span>}
                </div>
              </div>

              {/* Uniqueness description */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="uniqueness" className="font-sans text-xs font-bold text-neutral-700 uppercase tracking-wider">
                    Uniqueness & Problem Solved
                  </label>
                  <span className="font-sans text-[10px] md:text-xs font-semibold text-neutral-400">
                    Required for Incubation Manager approval
                  </span>
                </div>
                <textarea
                  id="uniqueness"
                  name="uniqueness"
                  rows={4}
                  value={formData.uniqueness}
                  onChange={handleInputChange}
                  placeholder="Explain why your project idea is unique, what problem it solves, and how it is technically viable."
                  className={`px-4 py-3 rounded-xl border font-sans text-sm outline-none resize-y transition-all ${
                    errors.uniqueness ? 'border-red-400 focus:border-red-500 bg-red-50/10' : 'border-neutral-200 focus:border-neutral-950'
                  }`}
                />
                {errors.uniqueness && <span className="font-sans text-xs text-red-500 font-semibold">{errors.uniqueness}</span>}
              </div>

              {/* Slot Scheduling Title */}
              <div className="border-t border-neutral-100 pt-6">
                <h3 className="font-heading font-bold text-base text-neutral-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-neutral-600" /> Select Pitch Session Slot
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Date Input */}
                  <div className="flex flex-col gap-2">
                    <label htmlFor="slotDate" className="font-sans text-xs font-bold text-neutral-700 uppercase tracking-wider flex justify-between">
                      <span>Presentation Date</span>
                      <span className="text-neutral-400 font-semibold text-[10px] normal-case">Mon - Fri only</span>
                    </label>
                    <input
                      type="date"
                      id="slotDate"
                      name="slotDate"
                      value={formData.slotDate}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]} // limit to future dates
                      className={`px-4 py-3 rounded-xl border font-sans text-sm outline-none bg-white transition-all ${
                        errors.slotDate ? 'border-red-400 focus:border-red-500 bg-red-50/10' : 'border-neutral-200 focus:border-neutral-950'
                      }`}
                    />
                    {errors.slotDate && <span className="font-sans text-xs text-red-500 font-semibold">{errors.slotDate}</span>}
                  </div>

                  {/* Time slot buttons */}
                  <div className="flex flex-col gap-2">
                    <label className="font-sans text-xs font-bold text-neutral-700 uppercase tracking-wider flex justify-between">
                      <span>Time Slot</span>
                      <span className="text-neutral-400 font-semibold text-[10px] normal-case">9:00 AM - 3:00 PM</span>
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {timeSlots.map((slot) => (
                        <button
                          type="button"
                          key={slot}
                          onClick={() => handleInputChange({ target: { name: 'slotTime', value: slot } } as any)}
                          className={`px-4 py-2.5 rounded-xl border font-sans text-xs font-semibold text-left transition-all ${
                            formData.slotTime === slot
                              ? 'bg-neutral-950 border-neutral-950 text-white shadow-md'
                              : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-600 hover:text-neutral-900'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5" />
                            {slot}
                          </div>
                        </button>
                      ))}
                    </div>
                    {errors.slotTime && <span className="font-sans text-xs text-red-500 font-semibold">{errors.slotTime}</span>}
                  </div>
                </div>
              </div>

              {/* Submit Action */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full relative py-4 rounded-xl bg-neutral-950 hover:bg-neutral-850 text-white font-sans text-sm font-bold shadow-xl shadow-neutral-950/15 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                      Scheduling Session...
                    </>
                  ) : (
                    "Submit Pitch Request"
                  )}
                </button>
              </div>
            </motion.form>
          ) : (
            <motion.div
              key="booking-success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-3xl p-8 md:p-12 border border-neutral-200/60 shadow-premium text-center flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
                <CheckCircle className="w-10 h-10 text-emerald-600" />
              </div>

              <h3 className="font-heading text-2xl md:text-3xl font-extrabold text-neutral-900 mb-2">
                Showcase Session Scheduled!
              </h3>
              <p className="font-sans text-sm md:text-base text-neutral-500 max-w-md mb-8">
                Your pitch request has been successfully queued for review by the Incubation Manager. We have sent a confirmation email containing review guidelines to your mailbox.
              </p>

              {/* Summary Receipt */}
              <div className="w-full bg-neutral-50 rounded-2xl p-6 border border-neutral-200/40 text-left space-y-4 max-w-md mb-8">
                <div className="flex justify-between items-center text-xs border-b border-neutral-200/50 pb-2">
                  <span className="font-bold text-neutral-400 uppercase">Project</span>
                  <span className="font-bold text-neutral-800">{formData.projectTitle}</span>
                </div>
                <div className="flex justify-between items-center text-xs border-b border-neutral-200/50 pb-2">
                  <span className="font-bold text-neutral-400 uppercase">Founder</span>
                  <span className="font-semibold text-neutral-700">{formData.name}</span>
                </div>
                <div className="flex justify-between items-center text-xs border-b border-neutral-200/50 pb-2">
                  <span className="font-bold text-neutral-400 uppercase">Scheduled Date</span>
                  <span className="font-semibold text-neutral-700">{formData.slotDate}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-neutral-400 uppercase">Time Slot</span>
                  <span className="font-semibold text-neutral-700">{formData.slotTime}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setFormData({
                    name: '',
                    email: '',
                    department: '',
                    projectTitle: '',
                    uniqueness: '',
                    slotDate: '',
                    slotTime: ''
                  });
                  setIsSubmitted(false);
                }}
                className="px-6 py-3 rounded-xl border border-neutral-200 hover:border-neutral-400 font-sans text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                Schedule Another Pitch
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
