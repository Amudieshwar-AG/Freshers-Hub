import { motion } from 'framer-motion';
import { Bot, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AI_SUGGESTED_PROMPTS } from '@/constants';

const PREVIEW_MESSAGES = [
  { role: 'user', text: 'What documents do I need for the first day?' },
  { role: 'ai', text: 'For your first day at RIT, you\'ll need: Allotment order, 10th & 12th mark sheets, Transfer Certificate, Conduct Certificate, and 10 passport-size photos. Originals and 2 sets of photocopies are required. Would you like a complete checklist?' },
  { role: 'user', text: 'Yes, and what about hostel admission?' },
  { role: 'ai', text: 'For hostel admission, additionally bring your Aadhaar card, medical fitness certificate, and filled hostel application form. The hostel fee can be paid at the accounts office.' },
];

export default function ChatPreview() {
  return (
    <div className="bg-white rounded-3xl border border-[#E5E7EB] overflow-hidden" style={{ boxShadow: '0 8px 40px -8px rgba(0,0,0,0.12)' }}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #F97316, #FB923C)' }}
        >
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-sm font-semibold text-[#1E293B]" style={{ fontFamily: 'Poppins, sans-serif' }}>
            RIT AI Assistant
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
            Powered by Gemini AI
          </div>
        </div>
        <div className="ml-auto">
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#FFF7ED] text-[#F97316]" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Live
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="p-5 flex flex-col gap-3 min-h-[260px]">
        {PREVIEW_MESSAGES.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.15 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'ai' && (
              <div className="w-7 h-7 rounded-full flex items-center justify-center mr-2 shrink-0 mt-0.5"
                style={{ background: 'linear-gradient(135deg, #F97316, #FB923C)' }}>
                <Bot className="w-3.5 h-3.5 text-white" />
              </div>
            )}
            <div
              className="text-xs leading-relaxed max-w-[78%] px-3.5 py-2.5"
              style={{
                background: msg.role === 'user' ? 'linear-gradient(135deg, #F97316, #FB923C)' : '#F8FAFC',
                color: msg.role === 'user' ? 'white' : '#1E293B',
                borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                border: msg.role === 'ai' ? '1px solid #E5E7EB' : 'none',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {msg.text}
            </div>
          </motion.div>
        ))}

        {/* Typing indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex justify-start"
        >
          <div className="flex items-center gap-1 px-4 py-2.5 bg-[#F8FAFC] rounded-2xl border border-[#E5E7EB]">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="w-1.5 h-1.5 bg-[#94A3B8] rounded-full"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Suggested Prompts */}
      <div className="px-5 pb-2 flex flex-wrap gap-2">
        {AI_SUGGESTED_PROMPTS.slice(0, 3).map((prompt, i) => (
          <motion.span
            key={i}
            whileHover={{ scale: 1.03 }}
            className="text-xs px-3 py-1.5 rounded-full border border-[#E5E7EB] text-[#475569] cursor-pointer hover:border-[#F97316] hover:text-[#F97316] transition-all"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {prompt}
          </motion.span>
        ))}
      </div>

      {/* CTA */}
      <div className="p-5 pt-3">
        <Link to="/ai-assistant">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all"
            style={{
              fontFamily: 'Poppins, sans-serif',
              background: 'linear-gradient(135deg, #F97316, #FB923C)',
              boxShadow: '0 4px 15px rgba(249,115,22,0.35)',
            }}
          >
            <Sparkles className="w-4 h-4" />
            Ask Anything
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </Link>
      </div>
    </div>
  );
}
