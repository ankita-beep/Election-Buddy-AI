import { motion } from 'motion/react';
import { Search, ArrowRight, ExternalLink, ShieldCheck, BadgeInfo, Vote, Scale, Info, Users } from 'lucide-react';
import { IMAGES } from '@/src/constants';
import { cn } from '@/src/lib/utils';

export default function CivicDashboard() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="relative">
        <div className="absolute -top-24 -left-20 w-80 h-80 bg-white/5 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 relative z-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-12 h-[1px] bg-white" />
              <span className="text-white font-bold uppercase tracking-[0.4em] text-[10px] font-space">INTELLIGENCE_LAYER</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white font-space tracking-tighter uppercase italic">Repository</h1>
            <p className="text-slate-500 max-w-xl text-xs md:text-sm uppercase tracking-widest leading-relaxed">
              Real-time synchronization of voting protocols, authentication standards, and civic participation data architectures.
            </p>
          </div>
          
          <div className="w-full md:w-96">
            <div className="relative group">
              <div className="absolute inset-0 bg-white rounded-2xl blur opacity-0 group-focus-within:opacity-10 transition-opacity" />
              <div className="relative flex items-center bg-black border border-white/10 rounded-2xl px-6 py-4 hover:border-white/30 transition-all">
                <Search size={16} className="text-slate-600 mr-4" />
                <input 
                  type="text" 
                  placeholder="QUERY_DIRECTORY..." 
                  className="bg-transparent border-none focus:ring-0 text-[10px] text-white placeholder-slate-700 w-full font-mono uppercase tracking-widest"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Featured Card */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="lg:col-span-2 glass-panel p-10 rounded-[3rem] flex flex-col md:flex-row gap-10 relative overflow-hidden group border-white/5 hover:border-white/20 transition-all duration-500"
        >
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.05),transparent_70%)] pointer-events-none" />
          
          <div className="flex-1 z-10 flex flex-col h-full">
            <div className="inline-flex items-center px-4 py-1 bg-white text-black text-[9px] font-bold tracking-[0.3em] uppercase font-space mb-10 w-fit">
              Priority_A1
            </div>
            <h2 className="text-3xl font-bold text-white mb-6 font-space uppercase">Voting Mechanics</h2>
            <p className="text-slate-500 mb-10 leading-relaxed text-xs md:text-sm uppercase tracking-widest">
              Comprehensive procedure for regional and national voting cycles, including registration deadlines, precinct location protocols, and digital authentication.
            </p>
            <button className="mt-auto group/btn flex items-center gap-4 text-white font-bold uppercase tracking-[0.4em] text-[10px] font-space hover:gap-6 transition-all w-fit">
              ACCESS_DEEP_DATA 
              <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="w-full md:w-2/5 aspect-[4/3] md:aspect-auto rounded-3xl overflow-hidden z-10 relative border border-white/10 grayscale contrast-125 group-hover:grayscale-0 transition-all duration-1000">
            <img 
              src={IMAGES.TECH_INTERFACE} 
              alt="Digital interface" 
              className="w-full h-full object-cover opacity-40 group-hover:opacity-80 transition-all" 
            />
          </div>
        </motion.div>

        {/* Regular Topic Cards */}
        <TopicCard 
          icon={Users} 
          title="Eligibility" 
          desc="Verify legal requirements and age-based participation metrics for the current cycle."
          protocol="E_7_ALPHA"
        />
        <TopicCard 
          icon={BadgeInfo} 
          title="Credentialing" 
          desc="Digital and physical identification protocols for secure identity verification at the polls."
          protocol="VERIFY_4.0"
        />
        <TopicCard 
          icon={Vote} 
          title="Schema" 
          desc="Categorizing general, primary, and special elections in the legislative framework."
          protocol="TYPE_S_SEC"
        />

        {/* Info Box */}
        <div className="glass-panel p-10 rounded-[2.5rem] bg-white/5 border-white/5 flex flex-col justify-between group hover:bg-white/10 transition-colors">
          <div>
            <Info size={32} className="text-slate-600 mb-8 group-hover:text-white transition-colors" />
            <h4 className="text-[10px] font-bold text-white uppercase tracking-[0.3em] font-space mb-4">Uplink Status</h4>
            <p className="text-[10px] text-slate-500 leading-relaxed uppercase tracking-widest">
              Direct connection to civic assistance officers is <span className="text-white font-bold">TERMINAL_READY</span>. 
            </p>
          </div>
          <button className="mt-10 text-[9px] font-bold text-white uppercase tracking-[0.4em] font-space hover:underline text-left">
            SYNC_INTERFACE
          </button>
        </div>

        <TopicCard 
          icon={Scale} 
          title="Protocols" 
          desc="Comprehensive documentation of voter protection laws and electoral code of conduct."
          protocol="LAW_R_09"
        />
      </div>

      {/* Footer Banner */}
      <div className="mt-20 p-10 rounded-[3.5rem] bg-white/5 border border-white/5 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10 group hover:border-white/20 transition-all duration-700">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,white,transparent_70%)] group-hover:opacity-20 transition-opacity" />
        
        <div className="flex items-center gap-8 relative z-10">
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center border border-white shadow-[0_0_30px_rgba(255,255,255,0.1)]">
            <ShieldCheck size={32} className="text-black" />
          </div>
          <div>
            <h5 className="text-xl font-bold text-white font-space mb-2 uppercase tracking-tight">Encryption Standards</h5>
            <p className="text-xs text-slate-500 uppercase tracking-widest">All civic intelligence is verified through multisig authentication.</p>
          </div>
        </div>

        <div className="flex gap-4 relative z-10 w-full md:w-auto">
          <button className="flex-1 md:flex-none px-10 py-4 rounded-xl bg-white text-black text-[9px] font-bold uppercase tracking-[0.4em] transition-all font-space hover:bg-slate-200">
            EXPORT_RAW
          </button>
          <button className="flex-1 md:flex-none px-10 py-4 rounded-xl border border-white text-white text-[9px] font-bold uppercase tracking-[0.4em] transition-all font-space hover:bg-white/10">
            SYSTEM_SYNC
          </button>
        </div>
      </div>
    </div>
  );
}

function TopicCard({ icon: Icon, title, desc, protocol }: any) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="glass-panel p-10 rounded-[2.5rem] group border-white/5 hover:border-white transition-all duration-700"
    >
      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 text-slate-500 flex items-center justify-center mb-8 transition-all duration-500 group-hover:bg-white group-hover:text-black">
        <Icon size={24} />
      </div>
      <h3 className="text-2xl font-bold text-white mb-4 font-space uppercase tracking-tight">{title}</h3>
      <p className="text-slate-500 text-[11px] mb-10 leading-relaxed uppercase tracking-widest">{desc}</p>
      
      <div className="flex items-center justify-between mt-auto">
        <span className="text-[10px] font-bold text-slate-700 uppercase tracking-[0.4em] font-mono">{protocol}</span>
        <button className="p-2 text-slate-700 group-hover:text-white transition-colors">
          <ExternalLink size={16} />
        </button>
      </div>
    </motion.div>
  );
}
