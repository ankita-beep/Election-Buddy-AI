import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, ShieldCheck, Activity, UserCircle, Settings, Menu, X, Cpu } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'Chat Terminal', path: '/chat', icon: MessageSquare },
    { name: 'Civic Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Voter ID Guide', path: '/voter-id', icon: ShieldCheck },
    { name: 'Live Status', path: '/live', icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-deep-void text-on-surface selection:bg-white/20 selection:text-white">
      <div className="fixed inset-0 grid-bg pointer-events-none opacity-20" />

      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 z-50 glass-panel border-b border-white/5 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <span className="text-xl font-bold text-white tracking-tight font-space">
            ElectionBuddy
          </span>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
            <div className="w-1.5 h-1.5 rounded-full bg-white status-pulse" />
            <span className="text-[10px] font-bold uppercase text-white tracking-widest font-space">
              Live Terminal
            </span>
            <span className="text-[10px] text-slate-400 font-mono ml-2">ID: EB-772</span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "relative py-1 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors font-space",
                  isActive ? "text-white" : "text-slate-500 hover:text-white"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {item.name}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute -bottom-1 left-0 right-0 h-[1px] bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-all">
            <UserCircle size={18} />
          </button>
          <button className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-all">
            <Settings size={18} />
          </button>
          <button 
            className="md:hidden p-2 text-slate-400 hover:text-white"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Sidebar (Desktop) */}
      <aside className={cn(
        "fixed left-0 top-16 bottom-0 w-64 glass-panel border-r border-white/5 hidden lg:flex flex-col py-8 z-40 transition-all duration-300",
        "bg-black"
      )}>
        <div className="px-6 mb-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.1)]">
              <Cpu size={20} className="text-black" />
            </div>
            <div>
              <h2 className="font-space text-[12px] font-bold tracking-tight text-white uppercase">System Alpha</h2>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest font-space font-medium">Voter Intelligence</p>
            </div>
          </div>
        </div>

        <nav className="flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-4 px-6 py-4 transition-all uppercase tracking-widest font-space text-[10px] font-bold border-l-2",
                  isActive 
                    ? "bg-white/5 text-white border-white" 
                    : "text-slate-500 border-transparent hover:bg-white/5 hover:text-white"
                )
              }
            >
              <item.icon size={16} />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-6 mt-auto">
          <button className="w-full py-4 bg-white text-black font-space text-[9px] font-bold uppercase tracking-[0.3em] hover:bg-white/90 transition-all">
            Secure Sync
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 min-h-screen relative overflow-hidden bg-black">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="p-6 md:p-10 max-w-7xl mx-auto"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>

        {/* Mobile Bottom Nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 glass-panel border-t border-white/5 flex justify-around items-center px-4 z-50">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-1 transition-all",
                  isActive ? "text-white" : "text-slate-500"
                )
              }
            >
              <item.icon size={18} />
              <span className="text-[8px] font-bold font-space uppercase tracking-widest">{item.name.split(' ')[0]}</span>
            </NavLink>
          ))}
        </nav>
      </main>
    </div>
  );
}
