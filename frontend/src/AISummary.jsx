import React from 'react';
import { Cpu, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AISummary({ summary, loading }) {
  const [displayedText, setDisplayedText] = React.useState("");
  
  React.useEffect(() => {
    if (!loading && summary) {
      let i = 0;
      setDisplayedText("");
      const interval = setInterval(() => {
        setDisplayedText(summary.slice(0, i));
        i++;
        if (i > summary.length) clearInterval(interval);
      }, 15);
      return () => clearInterval(interval);
    }
  }, [summary, loading]);

  return (
    <div className="p-6 glass-card relative overflow-hidden group shadow-2xl">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Cpu size={60} className="text-[var(--text)]" />
      </div>
      
      <div className="flex items-center gap-2 mb-4">
        <motion.div 
          animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" 
        />
        <h3 className="text-[10px] font-bold text-[var(--text)] uppercase tracking-[0.3em] font-space">Neural_Briefing</h3>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3 py-2"
          >
            <div className="flex items-center gap-3">
              <Loader2 size={14} className="animate-spin text-zinc-600" />
              <span className="text-[10px] text-zinc-600 font-space uppercase tracking-widest animate-pulse">Scanning political signals...</span>
            </div>
            <div className="space-y-2">
              <div className="h-2 w-full bg-[var(--border)] rounded skeleton-shimmer" />
              <div className="h-2 w-3/4 bg-[var(--border)] rounded skeleton-shimmer" />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative"
          >
            <p className="text-[13px] text-[var(--text)] opacity-90 leading-relaxed font-medium italic border-l-2 border-[var(--border)] pl-4 py-1">
              {displayedText}
              <span className="inline-block w-1 h-3 bg-[var(--text)] ml-1 cursor-blink" />
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
