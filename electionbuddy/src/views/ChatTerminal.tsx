import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Mic, Paperclip, Terminal, User, ShieldCheck, ChevronRight, Info, Map as MapIcon } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { IMAGES } from '@/src/constants';
import { cn } from '@/src/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  source?: string;
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function ChatTerminal() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Initializing neural interface... System Alpha is ready. I am your specialized election intelligence agent. How can I assist you with your civic duties today?',
      timestamp: new Date().toLocaleTimeString(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: Message = {
      role: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash-latest',
        contents: input,
        config: {
          systemInstruction: 'You are ElectionBuddy AI, a specialized election intelligence agent. Provide accurate, non-partisan information about voting, registration, and civic duties. Keep responses concise and technical in tone. Always cite sources if possible.'
        }
      });

      const aiMsg: Message = {
        role: 'assistant',
        content: response.text || 'Error processing request.',
        timestamp: new Date().toLocaleTimeString(),
        source: 'ElectionBuddy Core Intelligence'
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'System error. Unable to process command.',
        timestamp: new Date().toLocaleTimeString(),
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-140px)] gap-8">
      {/* Sidebar - Desktop */}
      <aside className="hidden 2xl:flex w-72 flex-col gap-8 shrink-0">
        <div className="glass-panel p-8 rounded-[2rem] space-y-6 border-white/5">
          <h3 className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.4em] font-space">Node_Archives</h3>
          <div className="space-y-1">
            <QuickLink label="REGISTRATION_DB" active />
            <QuickLink label="POLLING_GEOMETRY" />
            <QuickLink label="BALLOT_MEASURES" />
            <QuickLink label="DEADLINE_CORE" />
          </div>
        </div>

        <div className="glass-panel p-8 rounded-[2rem] bg-white/5 border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <Info size={14} className="text-white" />
            <span className="text-[9px] font-bold text-white uppercase tracking-[0.3em] font-space">Protocol_Tip</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed uppercase tracking-widest font-medium">
            Detailed voter ID requirements can be retrieved via state-specific query strings.
          </p>
        </div>

        <button className="mt-auto w-full py-5 bg-white text-black font-bold text-[9px] tracking-[0.4em] uppercase rounded-xl hover:bg-slate-200 transition-all font-space">
          NEW_PROTOCOL
        </button>
      </aside>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col glass-panel rounded-[3rem] relative overflow-hidden backdrop-blur-3xl border-white/5">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 md:p-12 space-y-10 custom-scrollbar">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex gap-6 items-start max-w-5xl",
                  msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border",
                  msg.role === 'assistant' 
                    ? "bg-white border-white text-black" 
                    : "bg-white/5 border-white/10 text-white"
                )}>
                  {msg.role === 'assistant' ? <Terminal size={18} /> : <User size={18} />}
                </div>
                <div className={cn(
                  "p-8 rounded-3xl backdrop-blur-xl border relative shadow-2xl",
                  msg.role === 'assistant' 
                    ? "bg-white/5 border-white/10 rounded-tl-none mr-20" 
                    : "bg-white/10 border-white/20 rounded-tr-none ml-20 text-right"
                )}>
                  <p className="text-white text-sm md:text-base leading-relaxed tracking-wider">
                    {msg.content}
                  </p>
                  
                  {msg.source && (
                    <div className="mt-6 p-4 rounded-xl bg-black/40 border border-white/5 flex items-center gap-3">
                      <ShieldCheck size={14} className="text-white" />
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.3em] font-space">
                        VERIFIED_BY: {msg.source}
                      </span>
                    </div>
                  )}
                  
                  <div className={cn(
                    "absolute -bottom-8 text-[9px] font-bold text-slate-700 uppercase tracking-[0.3em] font-mono",
                    msg.role === 'user' ? "right-0" : "left-0"
                  )}>
                    {msg.timestamp}
                  </div>
                </div>
              </motion.div>
            ))}

            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-4 items-center pl-4"
              >
                <div className="flex gap-2">
                  <motion.span animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-1.5 h-1.5 rounded-full bg-white" />
                  <motion.span animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.5 }} className="w-1.5 h-1.5 rounded-full bg-white" />
                  <motion.span animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1.5, delay: 1 }} className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input Bar */}
        <div className="p-8 md:p-10 border-t border-white/5 bg-black/60">
          <div className="max-w-4xl mx-auto relative group">
            <div className="relative glass-panel bg-white/5 rounded-[2.5rem] border-white/10 flex items-center p-4 gap-4 focus-within:border-white/30 transition-all">
              <button className="p-3 text-slate-600 hover:text-white rounded-2xl transition-all">
                <Paperclip size={18} />
              </button>
              <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                placeholder="TRANSMIT_COMMAND..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-slate-700 font-mono text-xs uppercase tracking-widest py-3 resize-none max-h-32"
                rows={1}
              />
              <div className="flex gap-3 items-center">
                <button className="p-3 text-slate-600 hover:text-white rounded-2xl transition-all hidden sm:flex">
                  <Mic size={18} />
                </button>
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className={cn(
                    "px-10 py-4 rounded-xl flex items-center gap-4 font-bold text-[9px] tracking-[0.4em] font-space transition-all active:scale-95 uppercase",
                    input.trim() && !isTyping 
                      ? "bg-white text-black hover:bg-slate-200" 
                      : "bg-white/5 text-slate-700 cursor-not-allowed"
                  )}
                >
                  SEND
                  <Send size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Context - Desktop */}
      <aside className="hidden 3xl:flex w-80 flex-col gap-8 shrink-0">
        <div className="glass-panel p-1 rounded-[2rem] overflow-hidden border-white/5">
          <div className="relative h-56 rounded-[1.8rem] overflow-hidden grayscale contrast-150 hover:contrast-100 transition-all duration-1000">
            <img src={IMAGES.SMALL_MAP} className="w-full h-full object-cover opacity-30 group-hover:opacity-60" alt="Geo-Sync" />
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black to-transparent">
              <span className="text-[9px] font-bold text-white uppercase tracking-[0.3em] font-space">GEO_LOC: AUSTIN_TX</span>
            </div>
          </div>
          <div className="p-8">
            <h4 className="text-xs font-bold text-white mb-3 font-space uppercase tracking-widest">Hub Terminal</h4>
            <p className="text-[10px] text-slate-500 leading-relaxed uppercase tracking-widest font-medium">TC_COMM_CENTER</p>
            <div className="flex items-center gap-2 mt-6">
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-[9px] font-bold text-white uppercase tracking-[0.3em] font-space">WAIT: 12_MIN</span>
            </div>
          </div>
        </div>

        <div className="glass-panel p-8 rounded-[2rem] border-white/5 space-y-6">
          <h3 className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.4em] font-space flex items-center gap-3">
            <MapIcon size={14} />
            NODE_MATRIX
          </h3>
          <div className="h-40 flex items-center justify-center border border-white/5 rounded-2xl bg-white/5">
            <span className="text-[8px] font-mono text-slate-700 uppercase tracking-[0.5em]">Sync_Pending</span>
          </div>
        </div>
      </aside>
    </div>
  );
}

function QuickLink({ label, active }: any) {
  return (
    <button className={cn(
      "w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-500 group font-space text-[10px] font-bold tracking-[0.3em] uppercase",
      active 
        ? "bg-white text-black" 
        : "text-slate-600 hover:text-white"
    )}>
      <ChevronRight size={14} className={cn("transition-transform", active ? "translate-x-0" : "-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100")} />
      <span>{label}</span>
      <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
        <ArrowRight size={14} />
      </span>
    </button>
  );
}

function ArrowRight(props: any) {
  return (
    <svg 
      {...props}
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor" 
      strokeWidth={2}
      className={cn("w-4 h-4", props.className)}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  );
}
