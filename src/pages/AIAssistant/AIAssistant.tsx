import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, Sparkles, RefreshCw, X, ChevronRight, MessageSquare, ShieldCheck, Zap } from 'lucide-react';
import { AI_SUGGESTED_PROMPTS } from '@/constants';
import type { ChatMessage } from '@/types';
import { getChatbotUrl } from '@/lib/utils';

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    role: 'assistant',
    content: "👋 Hi there! I'm your **RIT Assistant**. I have comprehensive knowledge about Rajalakshmi Institute of Technology — from admissions to campus facilities, bus routes, and academic details.\n\nHow can I help you today?",
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

    let responseText = '';
    try {
      const res = await fetch(getChatbotUrl('/api/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      if (res.ok) {
        const data = await res.json();
        responseText = data.answer;
      } else {
        throw new Error('API server returned error status');
      }
    } catch (error) {
      console.warn('Could not connect to Go chatbot service, using local mock responses:', error);
      
      const responses: Record<string, string> = {
        hostel: "**RIT Hostel Facilities:**\n\n• Separate hostels for boys and girls\n• Wi-Fi connectivity in all rooms\n• 24/7 security and CCTV\n• Hygienic canteen with vegetarian & non-vegetarian options\n• Common rooms with TV and recreation\n• In-house medical facility\n\nFor hostel admission, contact the hostel office.",
        bus: "**RIT Bus Routes:**\n\nRIT operates **29 bus routes** covering major areas of Chennai. For queries, contact Mr. Venkatesan at +91 63807 51700 or visit http://www.rittransport.com/.",
        library: "**RIT Library Information:**\n\n• **Timings:** Mon-Fri 8:00 AM – 5:00 PM, Saturday 10:00 AM – 2:00 PM\n• **Collection:** Over 18,328 volumes of textbooks and reference books\n• **Digital Access:** Computerized OPAC, 25 computer systems in Digital Library, and Wi-Fi enabled online access.",
      };

      const lower = text.toLowerCase();
      if (lower.includes('hostel')) {
        responseText = responses.hostel;
      } else if (lower.includes('bus') || lower.includes('route')) {
        responseText = responses.bus;
      } else if (lower.includes('library')) {
        responseText = responses.library;
      } else {
        responseText = `Thank you for your question about **"${text}"**!\n\nI couldn't reach the chatbot API server. Please make sure the Go service is running.`;
      }
    }

    setIsTyping(false);

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
    <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
      {/* Header */}
      <div className="bg-white border-b border-[#E5E7EB] py-4 relative z-10 shadow-xs">
        <div className="container-custom flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm" style={{ background: 'linear-gradient(135deg, #F97316, #FB923C)' }}>
              <Bot className="w-5.5 h-5.5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-[#1E293B] text-base" style={{ fontFamily: 'Poppins, sans-serif' }}>RIT Assistant</h1>
              <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Campus Knowledge Engine Online
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="https://t.me/Ritchatbot_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-white transition-all shadow-xs hover:brightness-105 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #0088cc, #24A1DE)',
                fontFamily: 'Inter, sans-serif'
              }}
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Telegram Bot</span>
            </a>
            <a
              href="https://discord.com/api/oauth2/authorize?client_id=1476942599167414506&permissions=8&scope=bot"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-white transition-all shadow-xs hover:brightness-105 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #5865F2, #7289DA)',
                fontFamily: 'Inter, sans-serif'
              }}
            >
              <Bot className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Discord Bot</span>
            </a>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={clearChat}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-[#64748B] hover:text-[#1E293B] hover:bg-slate-100 transition-all border border-[#E5E7EB] bg-white shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </motion.button>
          </div>
        </div>
      </div>

      <div className="flex-1 container-custom py-6 flex flex-col gap-4 max-w-4xl mx-auto w-full">
        {/* Sleek Badge Strip */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-2"
        >
          {[
            { icon: Zap, label: 'Instant Responses' },
            { icon: ShieldCheck, label: 'Verified Campus Info' },
            { icon: MessageSquare, label: '24/7 Assistance' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-[#E5E7EB] text-xs font-medium text-[#475569] shadow-2xs">
              <item.icon className="w-3.5 h-3.5 text-[#F97316]" />
              {item.label}
            </div>
          ))}
        </motion.div>

        {/* Chat Container */}
        <div
          className="flex-1 bg-white rounded-3xl border border-[#E5E7EB] p-4 sm:p-6 flex flex-col gap-4 overflow-y-auto"
          style={{ minHeight: '420px', maxHeight: '65vh', boxShadow: '0 8px 30px -6px rgba(0,0,0,0.04)' }}
        >
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-1 shadow-xs" style={{ background: 'linear-gradient(135deg, #F97316, #FB923C)' }}>
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div
                className="max-w-[85%] sm:max-w-[78%] px-4 py-3 text-sm leading-relaxed"
                style={{
                  background: msg.role === 'user' ? 'linear-gradient(135deg, #F97316, #EA580C)' : '#F8FAFC',
                  color: msg.role === 'user' ? 'white' : '#1E293B',
                  borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                  border: msg.role === 'assistant' ? '1px solid #E5E7EB' : 'none',
                  fontFamily: 'Inter, sans-serif',
                }}
                dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }}
              />
            </motion.div>
          ))}

          {/* Typing Indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex gap-3"
              >
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs" style={{ background: 'linear-gradient(135deg, #F97316, #FB923C)' }}>
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="flex items-center gap-1.5 px-4 py-3 bg-[#F8FAFC] rounded-2xl border border-[#E5E7EB]">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="w-2 h-2 bg-[#F97316] rounded-full"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
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
              whileHover={{ scale: 1.02, backgroundColor: '#FFF7ED', borderColor: '#FED7AA' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => sendMessage(prompt)}
              className="px-3.5 py-2 rounded-xl border border-[#E5E7EB] text-xs text-[#475569] bg-white transition-all hover:text-[#F97316] shadow-2xs font-medium"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {prompt}
            </motion.button>
          ))}
        </div>

        {/* Input Field */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-2.5 flex items-center gap-3 shadow-sm focus-within:border-[#F97316] transition-all">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about RIT campus, routes, hostel, or exams..."
            className="flex-1 text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none bg-transparent pl-2"
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
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => sendMessage(input)}
            disabled={!input.trim()}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all disabled:opacity-40 shadow-xs cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #F97316, #FB923C)' }}
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
        
        <p className="text-[11px] text-center text-[#94A3B8]" style={{ fontFamily: 'Inter, sans-serif' }}>
          RIT Assistant provides official campus guidance. For administrative requests, visit the department block.
        </p>
      </div>
    </div>
  );
}
