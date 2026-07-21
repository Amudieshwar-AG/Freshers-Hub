import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, Sparkles, RefreshCw, Mic, X, ChevronRight } from 'lucide-react';
import { AI_SUGGESTED_PROMPTS } from '@/constants';
import type { ChatMessage } from '@/types';

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    role: 'assistant',
    content: "👋 Hi there! I'm your **RIT AI Assistant**, powered by Google Gemini. I have comprehensive knowledge about Rajalakshmi Institute of Technology — from admission procedures to campus facilities.\n\nHow can I help you today?",
    timestamp: new Date().toISOString(),
  },
];

function formatContent(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    await new Promise((r) => setTimeout(r, 1500));
    setIsTyping(false);

    const responses: Record<string, string> = {
      hostel: "**RIT Hostel Facilities:**\n\n• Separate hostels for boys and girls\n• Wi-Fi connectivity in all rooms\n• 24/7 security and CCTV\n• Hygienic canteen with vegetarian & non-vegetarian options\n• Common rooms with TV and recreation\n• In-house medical facility\n\nFor hostel admission, contact the hostel office with your Aadhaar card, medical certificate, and filled hostel application form.",
      bus: "**RIT Bus Routes:**\n\nRIT operates **15+ bus routes** covering major areas of Chennai:\n\n• Route 01: Chennai Central → Koyambedu → Porur → RIT (7:00 AM)\n• Route 02: Tambaram → Chrompet → Pallavaram → RIT (7:15 AM)\n• Route 03: Anna Nagar → Vadapalani → RIT (7:20 AM)\n\nAll buses depart from respective stops by 7:30 AM. Return buses leave RIT at 4:30 PM and 6:00 PM.",
      library: "**RIT Library Information:**\n\n• **Timings:** Mon-Sat 8:00 AM – 8:00 PM, Sunday 10:00 AM – 5:00 PM\n• **Collection:** Over 50,000 books, 200+ journals\n• **Digital Access:** IEEE Xplore, ACM Digital Library, Scopus\n• **Services:** Book borrowing (4 books, 14 days), Reference, Photocopying\n• **Wi-Fi:** Available throughout the library\n\nYou'll need your student ID card to access the library.",
    };

    const lower = text.toLowerCase();
    let responseText = '';

    if (lower.includes('hostel')) responseText = responses.hostel;
    else if (lower.includes('bus') || lower.includes('route')) responseText = responses.bus;
    else if (lower.includes('library')) responseText = responses.library;
    else {
      responseText = `Thank you for your question about **"${text}"**!\n\nI'm connected to RIT's knowledge base and can help you with:\n\n• 📚 Academic information & syllabus\n• 🏠 Hostel & accommodation\n• 🚌 Bus routes & timings\n• 📋 Admission procedures\n• 🏛️ Campus facilities\n• 👩‍🏫 Faculty information\n• 🎉 Events & clubs\n\nCould you be more specific about what you'd like to know? I'll give you the most accurate information!`;
    }

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: responseText,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, aiMsg]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => {
    setMessages(INITIAL_MESSAGES);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#FAFAFA' }}>
      {/* Header */}
      <div className="bg-white border-b border-[#E5E7EB] py-4 sticky top-16 z-40">
        <div className="container-custom flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #F97316, #FB923C)' }}>
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-[#1E293B] text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>RIT AI Assistant</h1>
              <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Powered by Gemini AI · Campus Knowledge Enabled
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearChat}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-[#94A3B8] hover:text-[#475569] hover:bg-gray-100 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              New Chat
            </motion.button>
          </div>
        </div>
      </div>

      <div className="flex-1 container-custom py-6 flex flex-col gap-4 max-w-4xl mx-auto w-full">
        {/* Features strip */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-2"
        >
          {[
            { icon: Sparkles, label: 'Gemini AI' },
            { icon: Bot, label: 'RAG Enabled' },
            { icon: ChevronRight, label: 'Campus Knowledge' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E5E7EB] text-xs text-[#475569]">
              <item.icon className="w-3.5 h-3.5 text-[#F97316]" />
              {item.label}
            </div>
          ))}
        </motion.div>

        {/* Messages */}
        <div
          className="flex-1 bg-white rounded-3xl border border-[#E5E7EB] p-6 flex flex-col gap-4 overflow-y-auto"
          style={{ minHeight: '400px', maxHeight: '65vh', boxShadow: '0 4px 25px -5px rgba(0,0,0,0.08)' }}
        >
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-1" style={{ background: 'linear-gradient(135deg, #F97316, #FB923C)' }}>
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div
                className="max-w-[80%] px-4 py-3 text-sm leading-relaxed"
                style={{
                  background: msg.role === 'user' ? 'linear-gradient(135deg, #F97316, #FB923C)' : '#F8FAFC',
                  color: msg.role === 'user' ? 'white' : '#1E293B',
                  borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                  border: msg.role === 'ai' ? '1px solid #E5E7EB' : 'none',
                  fontFamily: 'Inter, sans-serif',
                }}
                dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }}
              />
            </motion.div>
          ))}

          {/* Typing */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex gap-3"
              >
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #F97316, #FB923C)' }}>
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="flex items-center gap-1 px-4 py-3 bg-[#F8FAFC] rounded-2xl border border-[#E5E7EB]">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="w-2 h-2 bg-[#94A3B8] rounded-full"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts */}
        <div className="flex flex-wrap gap-2">
          {AI_SUGGESTED_PROMPTS.slice(0, 4).map((prompt, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.02, backgroundColor: '#FFF7ED' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => sendMessage(prompt)}
              className="px-3.5 py-2 rounded-xl border border-[#E5E7EB] text-xs text-[#475569] bg-white transition-all hover:border-[#F97316] hover:text-[#F97316]"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {prompt}
            </motion.button>
          ))}
        </div>

        {/* Input */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-3 flex items-center gap-3" style={{ boxShadow: '0 4px 20px -4px rgba(0,0,0,0.08)' }}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about RIT..."
            className="flex-1 text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none bg-transparent"
            style={{ fontFamily: 'Inter, sans-serif' }}
          />
          {input && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setInput('')}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-[#94A3B8] hover:bg-gray-100 transition-all"
            >
              <X className="w-4 h-4" />
            </motion.button>
          )}
          <button className="w-9 h-9 rounded-xl flex items-center justify-center text-[#94A3B8] hover:bg-gray-100 transition-all">
            <Mic className="w-4.5 h-4.5" />
          </button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => sendMessage(input)}
            disabled={!input.trim()}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #F97316, #FB923C)' }}
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
