import React from 'react';
import { ExternalLink, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NewsList({ news, loading }) {
  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-32 bg-[var(--card)] border border-[var(--border)] rounded-xl animate-pulse" />
      ))}
    </div>
  );

  if (!news || news.length === 0) return (
    <div className="p-8 text-center border border-[var(--border)] rounded-xl bg-[var(--card)]">
      <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-space">No election intel detected in current scan cycle.</p>
    </div>
  );

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      {news.map((n, i) => (
        <motion.a 
          key={i} 
          variants={item}
          whileHover={{ 
            scale: 1.02, 
            backgroundColor: "var(--card-hover)",
            borderColor: "var(--border)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
          }}
          whileTap={{ scale: 0.98 }}
          href={n.link} 
          target="_blank" 
          rel="noopener noreferrer"
          className="group p-4 glass-card flex flex-col gap-2"
        >
          <div className="flex justify-between items-start">
            <span className="text-[8px] font-bold text-[var(--text)] opacity-40 uppercase tracking-[0.2em] font-space">{n.source}</span>
            <ExternalLink size={10} className="text-zinc-600 group-hover:text-[var(--text)] transition-colors" />
          </div>
          <h4 className="text-[12px] font-bold text-[var(--text)] opacity-80 group-hover:opacity-100 leading-tight transition-opacity line-clamp-2">{n.title}</h4>
          <p className="text-[10px] text-[var(--text)] opacity-60 line-clamp-2 leading-relaxed">{n.description}</p>
          <div className="mt-auto pt-2 flex items-center gap-1.5 text-zinc-600">
            <Clock size={8} />
            <span className="text-[8px] font-bold uppercase tracking-widest font-space">{n.published ? new Date(n.published).toLocaleDateString() : 'RECENT'}</span>
          </div>
        </motion.a>
      ))}
    </motion.div>
  );
}
