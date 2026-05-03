import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Terminal,
  User,
  ShieldCheck,
  ChevronRight,
  Info,
  Map as MapIcon,
  Plus,
  Cpu,
  LayoutDashboard,
  Activity,
  Menu,
  X,
  Trash2,
  ExternalLink,
  Loader2,
  Circle,
  Hash,
  Database,
  Search,
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Civic from './Civic';
import Heatmap from './Heatmap';

/** Utility for Tailwind class merging */
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://election-buddy-ai-backend.onrender.com";

// ── Markdown Renderer ────────────────────────────────────────────────────────
const renderMarkdown = (text) => {
  let html = text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/^### (.+)$/gm, '###$1')
    .replace(/^## (.+)$/gm, '##$1')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>');

  html = html.replace(/((?:^|\n)[*\-] .+)+/gm, (block) => {
    const items = block.trim().split('\n')
      .map(l => `<li>${l.replace(/^[*\-] /, '')}</li>`).join('');
    return `<ul>${items}</ul>`;
  });

  html = html.replace(/((?:^|\n)\d+\. .+)+/gm, (block) => {
    const items = block.trim().split('\n')
      .map(l => `<li>${l.replace(/^\d+\. /, '')}</li>`).join('');
    return `<ol>${items}</ol>`;
  });

  html = html.replace(/^###(.+)$/gm, '<h3>$1</h3>')
    .replace(/^##(.+)$/gm, '<h2>$1</h2>');

  html = html.replace(/\n\n+/g, '</p><p>').replace(/\n/g, '<br/>');
  return <div className="markdown-content text-xs leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />;
};

// ── Components ───────────────────────────────────────────────────────────────

function NavItem({ label, active, onClick, icon: Icon }) {
  return (
    <div className={cn(
      "group flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-300 cursor-pointer",
      active
        ? "bg-[var(--card)] text-[var(--text)]"
        : "text-zinc-500 hover:text-[var(--text)] hover:bg-[var(--card-hover)]"
    )} onClick={onClick}>
      <Icon size={14} className={cn("transition-colors", active ? "text-[var(--text)]" : "text-zinc-600")} />
      <span className="text-[11px] font-medium tracking-tight truncate">{label}</span>
      {active && <div className="ml-auto w-1 h-1 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" />}
    </div>
  );
}

// ── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('chat');
  const [health, setHealth] = useState({ live_headlines: 0, active_sessions: 0 });
  const [ping, setPing] = useState(0);
  const [stability, setStability] = useState("Optimal");
  const [civicNews, setCivicNews] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    fetchSessions();
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const fetchSessions = async () => {
    try {
      const res = await axios.get(`${API_BASE}/sessions`);
      const newSessions = res.data.sessions || [];
      setSessions(newSessions);
      // Persist last 3 for history
      localStorage.setItem("chat_history", JSON.stringify(newSessions.slice(-3)));
    } catch (err) {
      console.error("Failed to fetch sessions", err);
      // Fallback to local storage if API fails
      const saved = JSON.parse(localStorage.getItem("chat_history")) || [];
      setSessions(saved);
    }
  };

  const fetchHealth = async () => {
    const start = performance.now();
    try {
      const res = await axios.get(`${API_BASE}/health`);
      const end = performance.now();
      setHealth(res.data);
      setPing(Math.round(end - start));
      setStability("Optimal");
      
      // Also fetch news for heatmap if on chat tab
      const newsRes = await axios.get(`${API_BASE}/civic/data`);
      setCivicNews(newsRes.data.news);
    } catch (err) {
      console.error("Failed to fetch health", err);
      setStability("Degraded");
      setPing(0);
    }
  };

  const loadSession = async (id) => {
    if (id === currentSessionId) return;
    try {
      const res = await axios.get(`${API_BASE}/session/${id}`);
      setCurrentSessionId(id);
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error("Failed to load session", err);
    }
  };

  const deleteSession = async (id) => {
    try {
      await axios.delete(`${API_BASE}/session/${id}`);
      if (id === currentSessionId) startNewChat();
      fetchSessions();
    } catch (err) {
      console.error("Failed to delete session", err);
    }
  };

  const startNewChat = () => {
    setCurrentSessionId(null);
    setMessages([]);
  };

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    const userMsg = { role: "user", content: trimmedInput, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/chat`, {
        message: trimmedInput,
        session_id: currentSessionId
      });

      setCurrentSessionId(res.data.session_id);
      if (res.data.history) {
        setMessages(res.data.history);
      } else {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: res.data.reply,
          timestamp: res.data.timestamp
        }]);
      }
      fetchSessions();
    } catch (err) {
      const errorMsg = err.response?.data?.detail || "ERR_PROTOCOL: CONNECTION_LOST";
      setMessages(prev => [...prev, {
        role: "assistant",
        content: errorMsg,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="min-h-[100dvh] animated-bg text-zinc-400 selection:bg-white/10 selection:text-white overflow-hidden font-jakarta relative"
    >
      {/* Subtle Grid */}
      <div className="fixed inset-0 grid-bg pointer-events-none opacity-[0.07] z-0" />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-14 z-50 bg-[var(--bg)]/80 backdrop-blur-xl border-b border-[var(--border)] flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-zinc-500 hover:text-[var(--text)] transition-all bg-[var(--card)] rounded-lg border border-[var(--border)]"
          >
            {isSidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-[var(--accent)] rounded flex items-center justify-center">
              <ShieldCheck size={14} className="text-[var(--bg)]" />
            </div>
            <span className="text-xs font-bold text-[var(--text)] tracking-tighter uppercase font-space hidden xs:block">
              Election_Buddy_AI
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-5 text-[9px] font-bold uppercase tracking-widest font-space text-zinc-500 relative">
            <span 
              onClick={() => setActiveTab('chat')}
              className={cn("cursor-pointer transition-colors py-1 relative", activeTab === 'chat' ? "text-[var(--text)]" : "hover:text-zinc-400")}
            >
              Chat
              {activeTab === 'chat' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent)]" />}
            </span>
            <span 
              onClick={() => setActiveTab('civic')}
              className={cn("cursor-pointer transition-colors py-1 relative", activeTab === 'civic' ? "text-[var(--text)]" : "hover:text-zinc-400")}
            >
              Civic
              {activeTab === 'civic' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent)]" />}
            </span>
          </nav>

          <div className="h-3 w-px bg-[var(--border)] hidden sm:block" />
          
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 hover:bg-[var(--card-hover)] rounded-lg transition-colors text-zinc-500 hover:text-[var(--text)]"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <button onClick={startNewChat} className="p-1.5 text-zinc-500 hover:text-[var(--text)] transition-all bg-[var(--card)] rounded border border-[var(--border)]">
            <Plus size={14} />
          </button>
        </div>
      </header>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[41] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside 
            initial={{ x: -260 }}
            animate={{ x: 0 }}
            exit={{ x: -260 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-0 top-14 bottom-0 w-64 border-r border-[var(--border)] z-[45] bg-[var(--bg)]/90 backdrop-blur-2xl flex flex-col p-4 shadow-2xl"
          >
            <div className="flex-1 overflow-y-auto space-y-6 custom-scrollbar">
              <section className="space-y-2">
                <div className="flex items-center justify-between px-2 mb-2">
                  <h3 className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest font-space">Historical_Nodes</h3>
                  <span className="text-[8px] font-mono text-zinc-800">{sessions.length}</span>
                </div>
                <div className="space-y-0.5">
                  {sessions.map(s => (
                    <NavItem
                      key={s.id}
                      label={s.title}
                      active={currentSessionId === s.id}
                      onClick={() => switchSession(s.id)}
                      icon={Hash}
                    />
                  ))}
                </div>
              </section>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className={cn(
        "pt-14 h-[100dvh] flex flex-col relative z-10 transition-all duration-300",
        isSidebarOpen ? "lg:ml-64" : "ml-0",
        "xl:mr-72"
      )}>
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8 custom-scrollbar">
          {activeTab === 'civic' ? (
            <Civic />
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-xl mx-auto space-y-6 p-4">
              <div className="w-12 h-12 rounded-lg bg-[var(--card)] border border-[var(--border)] flex items-center justify-center shadow-inner">
                <Terminal size={20} className="text-[var(--text)] opacity-30" />
              </div>
              <div className="space-y-2">
                <h1 className="text-xl md:text-2xl font-bold text-[var(--text)] font-space tracking-tight uppercase">ElectionBuddy_v2</h1>
                <p className="text-[10px] text-zinc-500 font-space uppercase tracking-[0.3em]">Protocol active. Awaiting input.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full pt-4">
                {[
                  { q: "How do I vote in India?", label: "VOTING_REQ" },
                  { q: "Who is eligible to vote?", label: "ELIGIBILITY" },
                  { q: "What's the status of 2026 elections?", label: "LIVE_STATUS" },
                  { q: "Explain NOTA in detail.", label: "NOTA_INFO" }
                ].map((chip, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(chip.q)}
                    className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-lg hover:bg-[var(--card-hover)] transition-all text-left group border-l-2 border-l-transparent hover:border-l-[var(--accent)]"
                  >
                    <div className="text-[8px] font-bold font-space text-zinc-600 group-hover:text-zinc-400 tracking-[0.2em] uppercase mb-1">{chip.label}</div>
                    <div className="text-[11px] text-zinc-500 group-hover:text-zinc-300 leading-tight">{chip.q}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex gap-3 md:gap-4 items-start max-w-4xl w-full mx-auto",
                    msg.role === 'user' ? "flex-row-reverse" : ""
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded border flex items-center justify-center shrink-0 transition-all",
                    msg.role === 'assistant'
                      ? "bg-[var(--accent)] border-[var(--accent)] text-[var(--bg)] shadow-[0_0_10px_var(--border)]"
                      : "bg-[var(--card)] border-[var(--border)] text-zinc-400"
                  )}>
                    {msg.role === 'assistant' ? <Cpu size={14} /> : <User size={14} />}
                  </div>
                  <div className={cn(
                    "flex-1 p-4 rounded-xl border relative min-w-[120px] shadow-sm",
                    msg.role === 'assistant'
                      ? "glass-card text-[var(--text)]"
                      : "bg-[var(--card-hover)] border-[var(--border)] text-[var(--text)]"
                  )}>
                    <div className={cn(
                      "text-[13px] leading-relaxed tracking-tight",
                      msg.role === 'user' ? "text-right" : "text-left"
                    )}>
                      {msg.role === 'assistant' ? renderMarkdown(msg.content) : msg.content}
                    </div>

                    <div className={cn(
                      "mt-3 text-[8px] font-bold text-zinc-600 uppercase tracking-widest font-space",
                      msg.role === 'user' ? "text-right" : "text-left"
                    )}>
                      {msg.role === 'user' ? 'Client' : 'System'} · {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <div className="flex gap-4 items-center pl-1">
                  <div className="w-8 h-8 rounded border bg-[var(--accent)] border-[var(--accent)] text-[var(--bg)] flex items-center justify-center shadow-[0_0_10px_var(--border)]">
                    <Cpu size={14} className="animate-pulse" />
                  </div>
                  <div className="flex gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-zinc-500 animate-bounce" />
                    <div className="w-1 h-1 rounded-full bg-zinc-500 animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1 h-1 rounded-full bg-zinc-500 animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </AnimatePresence>
          )}
        </div>

        {/* Minimal Input Bar */}
        {activeTab === 'chat' && (
          <div className="p-4 md:p-6 border-t border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-md sticky bottom-0">
            <div className="max-w-3xl mx-auto">
              <motion.div 
                className="relative flex items-center glass-card p-1 focus-within:border-[var(--text)] transition-all duration-500"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={isLoading ? "Neural process active..." : "Initiate command..."}
                  className="flex-1 bg-transparent border-none focus:ring-0 text-[var(--text)] placeholder-zinc-500 text-[13px] py-3 px-4 tracking-tight"
                  disabled={isLoading}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className={cn(
                    "p-2.5 rounded-lg transition-all duration-300 mr-1",
                    input.trim() && !isLoading
                      ? "text-[var(--bg)] bg-[var(--text)] hover:opacity-80"
                      : "text-zinc-500 cursor-not-allowed"
                  )}
                >
                  {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </motion.button>
              </motion.div>
              <div className="mt-3 text-center hidden sm:block">
                <span className="text-[7px] text-zinc-700 font-space font-bold uppercase tracking-[0.4em]">
                  Neural_Link · v2.6 · 2026_Cycle
                </span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Right Info Panel */}
      <aside className="hidden xl:flex w-72 fixed right-0 top-14 bottom-0 border-l border-[var(--border)] flex-col p-6 z-40 bg-[var(--bg)]/80 backdrop-blur-2xl overflow-y-auto">
        <div className="space-y-8">
          <section className="space-y-3">
            <h3 className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.3em] font-space flex items-center gap-2">
              <Activity size={12} />
              Network
            </h3>
            <div className="p-3 rounded-lg glass-card space-y-3 shadow-inner">
              <div className="flex justify-between items-center text-[9px] font-medium tracking-tight">
                <span className="text-zinc-500">Ping</span>
                <motion.span 
                  key={ping}
                  initial={{ y: -5, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-zinc-300"
                >
                  {ping > 0 ? `${ping}ms` : '---'}
                </motion.span>
              </div>
              <div className="flex justify-between items-center text-[9px] font-medium tracking-tight">
                <span className="text-zinc-500">Stability</span>
                <span className={cn(
                  "transition-colors duration-500",
                  stability === "Optimal" ? "text-green-500/80" : "text-amber-500/80"
                )}>{stability}</span>
              </div>
              <div className="h-px bg-white/[0.03]" />
              <div className="flex items-center gap-2">
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className={cn(
                    "w-1 h-1 rounded-full",
                    stability === "Optimal" ? "bg-green-500" : "bg-amber-500"
                  )} 
                />
                <span className={cn(
                  "text-[9px] font-bold uppercase tracking-widest font-space transition-all duration-500",
                  stability === "Optimal" ? "text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]" : "text-amber-500"
                )}>
                  {stability === "Optimal" ? "Active" : "Reconnecting"}
                </span>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <Heatmap news={civicNews} />
          </section>
        </div>

        <div className="mt-auto">
          <div className="p-3 rounded-lg glass-card">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={12} className="text-[var(--text)] opacity-70" />
              <span className="text-[8px] font-bold text-[var(--text)] opacity-60 uppercase tracking-widest font-space">Security</span>
            </div>
            <p className="text-[8px] text-[var(--text)] opacity-50 leading-relaxed uppercase tracking-widest">
              E2E Encryption active for all election protocols.
            </p>
          </div>
        </div>
      </aside>
    </motion.div>
  );
}
