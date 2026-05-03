import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NewsList from './NewsList';
import AISummary from './AISummary';
import { Newspaper, TrendingUp, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://election-buddy-ai-backend.onrender.com";

export default function Civic() {
  const [news, setNews] = useState([]);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_BASE}/civic/data`);
      setNews(res.data.news);
      setLoading(false);
      
      // Fetch summary after news is loaded
      fetchSummary();
    } catch (err) {
      console.error("Failed to fetch civic data", err);
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await axios.post(`${API_BASE}/civic/summary`);
      setSummary(res.data.summary);
      setSummaryLoading(false);
    } catch (err) {
      console.error("Failed to fetch summary", err);
      setSummaryLoading(false);
    }
  };

  const getInsights = () => {
    if (!news || news.length === 0) return [];
    
    const keywords = ["BJP", "Congress", "Modi", "Rahul", "Polls", "AAP", "Election", "Supreme Court"];
    const counts = {};
    let positive = 0;
    let negative = 0;

    news.forEach(n => {
      const text = (n.title + " " + n.description).toLowerCase();
      keywords.forEach(k => {
        if (n.title.includes(k)) counts[k] = (counts[k] || 0) + 1;
      });
      
      // Basic sentiment detection
      if (text.includes("win") || text.includes("growth") || text.includes("victory") || text.includes("success")) positive++;
      if (text.includes("lose") || text.includes("crisis") || text.includes("protest") || text.includes("scam")) negative++;
    });
    
    const topTopic = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Politics";
    const sentiment = positive > negative ? "POSITIVE" : negative > positive ? "NEGATIVE" : "NEUTRAL";
    
    return [
      { label: "TRENDING_TOPIC", value: topTopic, icon: TrendingUp, action: "SEARCH" },
      { label: "SENTIMENT", value: sentiment, icon: Zap, action: "ANALYZE" },
      { label: "INTEL_NODES", value: news.length, icon: Zap, action: "REFRESH" }
    ];
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      <motion.section variants={itemVariants}>
        <AISummary summary={summary} loading={summaryLoading} />
      </motion.section>

      <motion.section variants={itemVariants} className="space-y-4">
        <div className="flex items-center gap-2 px-2">
          <Zap size={14} className="text-zinc-500" />
          <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] font-space">Quick_Insights</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {getInsights().map((insight, i) => (
            <motion.button 
              key={i} 
              whileHover={{ scale: 1.02, backgroundColor: "var(--card-hover)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (insight.action === "REFRESH") fetchData();
              }}
              className="p-3 glass-card flex flex-col gap-1 text-left group"
            >
              <div className="flex justify-between items-center w-full">
                <span className="text-[7px] font-bold text-zinc-600 uppercase tracking-widest font-space group-hover:text-zinc-400 transition-colors">{insight.label}</span>
                <insight.icon size={8} className="text-zinc-700" />
              </div>
              <span className="text-[11px] font-bold text-white uppercase tracking-tight">{insight.value}</span>
            </motion.button>
          ))}
        </div>
      </motion.section>

      <motion.section variants={itemVariants} className="space-y-4">
        <div className="flex items-center gap-2 px-2">
          <Newspaper size={14} className="text-zinc-500" />
          <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] font-space">Live_Intelligence_Feed</h3>
        </div>
        <NewsList news={news} loading={loading} />
      </motion.section>
    </motion.div>
  );
}
