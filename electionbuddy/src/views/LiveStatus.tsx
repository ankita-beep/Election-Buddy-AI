import { motion } from 'motion/react';
import { Activity, Shield, Database, Wifi, Terminal, Zap, CheckCircle, BarChart3, MessageSquare } from 'lucide-react';
import { IMAGES } from '@/src/constants';
import { cn } from '@/src/lib/utils';

const ActivityLog = [
  { time: '14:20:01', type: 'INFO', msg: 'Establishing secure handshake with Node_4482...', color: 'text-white' },
  { time: '14:20:03', type: 'SYNC', msg: 'Voter ID database sharding complete.', color: 'text-slate-400' },
  { time: '14:20:05', type: 'AUTH', msg: 'User session validated (ID: 0x82f...a1).', color: 'text-white' },
  { time: '14:20:12', type: 'INFO', msg: 'Parsing query: "How to register in California?"', color: 'text-slate-400' },
  { time: '14:20:15', type: 'CORE', msg: 'AI model alpha_7 processing request...', color: 'text-slate-500' },
  { time: '14:20:16', type: 'SUCC', msg: 'Response delivered in 1.4s.', color: 'text-white' },
  { time: '14:20:20', type: 'WARN', msg: 'High traffic surge detected in Northeast sector.', color: 'text-white' },
  { time: '14:20:22', type: 'INFO', msg: 'Auto-scaling resources... OK.', color: 'text-slate-400' },
  { time: '14:20:25', type: 'CORE', msg: 'Refreshing live election datasets.', color: 'text-slate-500' },
  { time: '14:20:28', type: 'INFO', msg: 'Initializing voter turnout visualization nodes.', color: 'text-white' },
  { time: '14:20:31', type: 'SYNC', msg: 'Encryption layer rotation sequence start.', color: 'text-slate-400' },
  { time: '14:20:35', type: 'AUTH', msg: 'Blockchain audit trail verified.', color: 'text-white' },
];

export default function LiveStatus() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 uppercase tracking-tight">Node Network</h1>
          <p className="text-slate-500 max-w-2xl text-xs md:text-sm uppercase tracking-widest leading-relaxed">
            Real-time telemetry and synchronization status of the ElectionBuddy distributed voting intelligence network.
          </p>
        </div>
        <div className="flex items-center gap-2 glass-panel px-6 py-2 rounded-full border-white/20 hover:border-white transition-colors cursor-default">
          <span className="font-mono text-[9px] text-white uppercase tracking-[0.2em]">LATENCY_OPTIMAL: 14ms</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Holographic Stats Pane */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-8 relative overflow-hidden h-[550px] flex flex-col border-white/5">
          <div className="absolute inset-0 opacity-5 grayscale invert contrast-200 pointer-events-none">
            <img src={IMAGES.NETWORK_MAP} className="w-full h-full object-cover" alt="Network Map" />
          </div>
          
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex justify-between items-start mb-auto">
              <div>
                <span className="text-[10px] font-bold text-slate-500 tracking-[0.3em] font-space uppercase">Global Coverage</span>
                <div className="text-4xl font-bold text-white font-space mt-2">99.8%</div>
              </div>
              <div className="px-4 py-1.5 bg-white text-black font-mono text-[9px] font-bold tracking-[0.2em] uppercase">
                Active_Nodes: 14.2K
              </div>
            </div>

            {/* Central Visualizer */}
            <div className="flex-1 flex items-center justify-center">
              <div className="relative w-80 h-80">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-[0.5px] border-white/10 rounded-full"
                />
                <motion.div 
                  animate={{ rotate: -360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-6 border-[0.5px] border-dashed border-white/20 rounded-full"
                />
                <div className="absolute inset-12 border-[0.5px] border-white/5 rounded-full" />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                  <motion.div
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Wifi size={40} className="text-white" />
                  </motion.div>
                  <div className="text-sm font-bold text-white tracking-[0.5em] font-space">SYNCED</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-8 mt-auto">
              <div className="group cursor-default">
                <span className="block text-[8px] font-bold text-slate-500 font-space uppercase tracking-[0.3em] mb-2">Uptime</span>
                <span className="font-mono text-xs text-white group-hover:text-white transition-colors font-bold tracking-widest">99.99%</span>
              </div>
              <div className="group cursor-default">
                <span className="block text-[8px] font-bold text-slate-500 font-space uppercase tracking-[0.3em] mb-2">Data_Stream</span>
                <span className="font-mono text-xs text-white group-hover:text-white transition-colors font-bold tracking-widest">4.2 TB/S</span>
              </div>
              <div className="group cursor-default">
                <span className="block text-[8px] font-bold text-slate-500 font-space uppercase tracking-[0.3em] mb-2">Security</span>
                <span className="font-mono text-xs text-white group-hover:text-white transition-colors font-bold tracking-widest">L7_SHIELD</span>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Log */}
        <div className="glass-panel rounded-3xl overflow-hidden flex flex-col border-white/5 h-[550px]">
          <div className="px-6 py-5 border-b border-white/5 bg-slate-900/10 flex items-center justify-between">
            <h3 className="text-[10px] font-bold text-white uppercase tracking-[0.3em] font-space flex items-center gap-2">
              <Terminal size={14} className="text-slate-500" />
              Intelligence_Feed
            </h3>
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          </div>
          <div className="flex-1 p-6 font-mono text-[9px] leading-relaxed overflow-y-auto custom-scrollbar space-y-4">
            {ActivityLog.map((log, i) => (
              <div key={i} className="flex gap-3 items-start border-l border-white/5 pl-4 ml-1">
                <span className="text-slate-600 shrink-0">[{log.time}]</span>
                <div className="space-y-1">
                  <span className={cn("font-bold block tracking-widest", log.color)}>{log.type}:</span>
                  <span className="text-slate-500 block leading-normal">{log.msg}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-white/5 bg-black">
            <div className="flex items-center gap-3">
              <span className="text-white font-bold text-xs shrink-0">&gt;</span>
              <div className="w-1 h-3 bg-white animate-pulse shrink-0" />
              <span className="text-slate-600 font-mono text-[10px] truncate">Monitoring secure sectors...</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard icon={MessageSquare} label="Total_Queries" value="1.2M" trend="+12%" />
        <StatCard icon={Shield} label="Registered_Users" value="842K" trend="LIVE" />
        <StatCard icon={CheckCircle} label="AI_Confidence" value="HIGH" trend="99.2%" />
        <StatCard icon={BarChart3} label="Network_Load" value="OPTIMAL" trend="14%" />
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: any;
  label: string;
  value: string;
  trend: string;
}

function StatCard({ icon: Icon, label, value, trend }: StatCardProps) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="glass-panel p-8 rounded-3xl group transition-all duration-300 border-white/5 hover:border-white/20"
    >
      <div className="flex justify-between items-start mb-8">
        <div className="p-2.5 rounded-lg bg-white/5 text-white group-hover:bg-white group-hover:text-black transition-all">
          <Icon size={18} />
        </div>
        <span className="text-[10px] font-mono font-bold text-slate-500 group-hover:text-white transition-colors">{trend}</span>
      </div>
      <h4 className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.3em] font-space mb-2">{label}</h4>
      <div className="text-3xl font-bold text-white font-space tracking-tight">{value}</div>
    </motion.div>
  );
}
