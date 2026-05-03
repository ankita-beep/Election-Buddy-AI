import React from 'react';
import { Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

const STATES = [
  "Maharashtra", "Uttar Pradesh", "Delhi", "West Bengal", "Bihar", 
  "Tamil Nadu", "Karnataka", "Gujarat", "Rajasthan", "Kerala"
];

export default function Heatmap({ news }) {
  const getHeatData = () => {
    const counts = {};
    STATES.forEach(s => counts[s] = 0);
    
    if (news) {
      news.forEach(item => {
        const text = (item.title + " " + item.description).toLowerCase();
        STATES.forEach(state => {
          if (text.includes(state.toLowerCase())) {
            counts[state] += 1;
          }
        });
      });
    }
    
    return STATES.map(state => ({
      name: state,
      count: counts[state],
      level: counts[state] > 3 ? "High" : counts[state] > 0 ? "Medium" : "Low",
      color: counts[state] > 3 ? "text-red-500" : counts[state] > 0 ? "text-amber-500" : "text-green-500"
    })).sort((a, b) => b.count - a.count);
  };

  const data = getHeatData();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Activity size={12} className="text-zinc-500" />
        <h3 className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.3em] font-space">Political_Heatmap</h3>
        <motion.div 
          animate={{ opacity: [1, 0, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="flex items-center gap-1 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded ml-auto"
        >
          <div className="w-1 h-1 rounded-full bg-red-500" />
          <span className="text-[6px] font-bold text-red-500 uppercase tracking-widest font-space">Live</span>
        </motion.div>
      </div>

      <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
        <AnimatePresence>
          {data.map((item, i) => (
            <motion.div 
              key={item.name} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center justify-between p-2 rounded-lg bg-[var(--card)] border border-[var(--border)] group hover:border-[var(--accent)] hover:bg-[var(--card-hover)] transition-all relative overflow-hidden"
            >
              <span className="text-[9px] font-semibold text-[var(--text)] opacity-60 group-hover:opacity-100 transition-opacity truncate pr-1">{item.name}</span>
              <div className="flex items-center gap-1.5 shrink-0">
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor]",
                  item.level === "High" ? "bg-red-500 text-red-500" : 
                  item.level === "Medium" ? "bg-amber-500 text-amber-500" : "bg-green-500 text-green-500"
                )} />
                <span className={cn(
                  "text-[7px] font-bold uppercase tracking-tighter font-space",
                  item.level === "High" ? "text-red-500" : 
                  item.level === "Medium" ? "text-amber-500" : "text-green-500"
                )}>{item.level}</span>
              </div>
              {item.level === "High" && (
                <motion.div 
                  animate={{ opacity: [0, 0.05, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 bg-red-500 pointer-events-none"
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
