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
  Search
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Utility for Tailwind class merging */
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

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
        ? "bg-white/5 text-white"
        : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]"
    )} onClick={onClick}>
      <Icon size={14} className={cn("transition-colors", active ? "text-white" : "text-zinc-600")} />
      <span className="text-[11px] font-medium tracking-tight truncate">{label}</span>
      {active && <div className="ml-auto w-1 h-1 rounded-full bg-white shadow-[0_0_8px_white]" />}
    </div>
  );
}

// ── Main App ─────────────────────────────────────────────────────────────────

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const fetchSessions = async () => {
    try {
      const res = await axios.get(`${API_BASE}/sessions`);
      setSessions(res.data.sessions || []);
    } catch (err) {
      console.error("Failed to fetch sessions", err);
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
    if (!input.trim() || isLoading) return;

    const userMsg = { role: "user", content: input, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/chat`, {
        message: currentInput,
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
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "ERR_PROTOCOL: CONNECTION_LOST",
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#050505] text-zinc-400 selection:bg-white/10 selection:text-white overflow-hidden font-jakarta">
      {/* Subtle Grid */}
      <div className="fixed inset-0 grid-bg pointer-events-none opacity-[0.07] z-0" />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-14 z-50 bg-[#050505]/80 backdrop-blur-md border-b border-white/[0.03] flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-2 text-zinc-500 hover:text-white transition-all bg-white/[0.03] rounded border border-white/[0.05]"
          >
            {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-white rounded flex items-center justify-center">
              <Circle size={10} className="text-black fill-black" />
            </div>
            <span className="text-xs font-bold text-white tracking-tighter uppercase font-space hidden xs:block">
              ElectionBuddy
            </span>
          </div>
          <div className="h-3 w-px bg-white/10 mx-1 hidden xs:block" />
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
            <span className="text-[9px] font-bold uppercase text-zinc-500 tracking-widest font-space">
              Live
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-5 text-[9px] font-bold uppercase tracking-widest font-space text-zinc-500">
            <span className="text-white border-b border-white py-1">Chat</span>
            <span className="hover:text-zinc-300 cursor-pointer transition-colors">Archive</span>
            <span className="hover:text-zinc-300 cursor-pointer transition-colors">Civic</span>
          </nav>
          <div className="h-3 w-px bg-white/10 hidden sm:block" />
          <button onClick={startNewChat} className="p-1.5 text-zinc-500 hover:text-white transition-all bg-white/[0.03] rounded border border-white/[0.05]">
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
      <aside className={cn(
        "fixed left-0 top-14 bottom-0 w-64 border-r border-white/[0.03] z-[45] bg-[#050505] lg:bg-[#050505]/50 transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-4 flex flex-col h-full">
          <div className="mb-8 px-2">
            <h3 className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.3em] font-space mb-4">Historical_Nodes</h3>
            <div className="space-y-0.5 overflow-y-auto max-h-[60vh] custom-scrollbar pr-2">
              {sessions.length === 0 ? (
                <div className="py-4 text-[9px] text-zinc-700 italic px-2">No archived protocols</div>
              ) : (
                sessions.map(s => (
                  <NavItem
                    key={s.id}
                    label={s.title}
                    active={currentSessionId === s.id}
                    onClick={() => {
                      loadSession(s.id);
                      setIsSidebarOpen(false);
                    }}
                    icon={Hash}
                  />
                ))
              )}
            </div>
          </div>

          <div className="mt-auto space-y-4 px-2">
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.03]">
              <div className="flex items-center gap-2 mb-2">
                <Database size={10} className="text-zinc-500" />
                <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest font-space">Cache_Status</span>
              </div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-white/20 w-1/3" />
              </div>
            </div>
            <button
              onClick={() => {
                startNewChat();
                setIsSidebarOpen(false);
              }}
              className="w-full py-2.5 bg-white text-black font-space text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all rounded shadow-[0_0_15px_rgba(255,255,255,0.1)]"
            >
              New_Command
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 xl:mr-72 pt-14 h-[100dvh] flex flex-col relative z-10 transition-all duration-300">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-xl mx-auto space-y-6 p-4">
              <div className="w-12 h-12 rounded-lg bg-white/[0.02] border border-white/[0.05] flex items-center justify-center shadow-inner">
                <Terminal size={20} className="text-white/30" />
              </div>
              <div className="space-y-2">
                <h1 className="text-xl md:text-2xl font-bold text-white font-space tracking-tight uppercase">ElectionBuddy_v2</h1>
                <p className="text-[10px] text-zinc-600 font-space uppercase tracking-[0.3em]">Protocol active. Awaiting input.</p>
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
                    className="p-4 bg-white/[0.01] border border-white/[0.03] rounded-lg hover:bg-white/[0.03] transition-all text-left group border-l-2 border-l-transparent hover:border-l-white/20"
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
                      ? "bg-white border-white text-black shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                      : "bg-white/[0.03] border-white/[0.05] text-zinc-400"
                  )}>
                    {msg.role === 'assistant' ? <Cpu size={14} /> : <User size={14} />}
                  </div>
                  <div className={cn(
                    "flex-1 p-4 rounded-xl border relative min-w-[120px] shadow-sm",
                    msg.role === 'assistant'
                      ? "bg-white/[0.02] border-white/[0.03] text-zinc-200"
                      : "bg-white/[0.08] border-white/[0.1] text-white"
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
                  <div className="w-8 h-8 rounded border bg-white border-white text-black flex items-center justify-center shadow-[0_0_10px_rgba(255,255,255,0.2)]">
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
        <div className="p-4 md:p-6 border-t border-white/[0.03] bg-[#050505]/80 backdrop-blur-md sticky bottom-0">
          <div className="max-w-3xl mx-auto">
            <div className="relative flex items-center bg-white/[0.02] border border-white/[0.05] rounded-xl p-1 focus-within:border-white/20 transition-all duration-500 shadow-lg">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Transmit command..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-zinc-700 text-[13px] py-3 px-4 tracking-tight"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={cn(
                  "p-2.5 rounded-lg transition-all duration-300 mr-1",
                  input.trim() && !isLoading
                    ? "text-white bg-white/10 hover:bg-white/20"
                    : "text-zinc-700 cursor-not-allowed"
                )}
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
            <div className="mt-3 text-center hidden sm:block">
              <span className="text-[7px] text-zinc-700 font-space font-bold uppercase tracking-[0.4em]">
                Neural_Link · v2.6 · 2026_Cycle
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Right Info Panel */}
      <aside className="hidden xl:flex w-72 fixed right-0 top-14 bottom-0 border-l border-white/[0.03] flex-col p-6 z-40 bg-[#050505]/50 overflow-y-auto">
        <div className="space-y-8">
          <section className="space-y-3">
            <h3 className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.3em] font-space flex items-center gap-2">
              <Activity size={12} />
              Network
            </h3>
            <div className="p-3 rounded-lg bg-white/[0.01] border border-white/[0.03] space-y-3">
              <div className="flex justify-between items-center text-[9px] font-medium tracking-tight">
                <span className="text-zinc-500">Ping</span>
                <span className="text-zinc-300">8ms</span>
              </div>
              <div className="flex justify-between items-center text-[9px] font-medium tracking-tight">
                <span className="text-zinc-500">Stability</span>
                <span className="text-green-500/80">Optimal</span>
              </div>
              <div className="h-px bg-white/[0.03]" />
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[9px] font-bold text-white uppercase tracking-widest font-space">Active</span>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.3em] font-space flex items-center gap-2">
              <MapIcon size={12} />
              Matrix
            </h3>
            <div className="h-32 rounded-lg border border-white/[0.03] bg-white/[0.01] relative overflow-hidden group">
              <div className="absolute inset-0 grid-bg opacity-10" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border border-white/5 rounded-full flex items-center justify-center animate-ping">
                  <div className="w-1 h-1 bg-white/20 rounded-full" />
                </div>
              </div>
              <div className="absolute bottom-2 left-2">
                <span className="text-[7px] font-mono text-zinc-600 uppercase tracking-widest">Scanning...</span>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-auto">
          <div className="p-3 rounded-lg bg-white/[0.01] border border-white/[0.02]">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={12} className="text-zinc-600" />
              <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest font-space">Security</span>
            </div>
            <p className="text-[8px] text-zinc-700 leading-relaxed uppercase tracking-widest">
              E2E Encryption active for all election protocols.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
