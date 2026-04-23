"use client";

import { motion, AnimatePresence } from "framer-motion";
import { PiLogo } from "@/app/components/ui/pi-logo";
import { Terminal, Activity, Zap, Cpu, TrendingUp, ShieldAlert } from "lucide-react";
import { useState, useEffect } from "react";

export default function SovereignCommandCenter() {
  const [logs, setLogs] = useState<string[]>([
    "Initializing MAS-ZERO Kernel...",
    "Loading Agent DNA Registry...",
    "Quantum Mirror Simulation: ACTIVE",
    "Profit Vortex: STANDBY",
    "System Status: SOVEREIGN",
  ]);

  // Simulate incoming logs
  useEffect(() => {
    const interval = setInterval(() => {
      const agentId = `pw-agt-${Math.random().toString(16).slice(2, 14)}`;
      const signature = Math.random().toString(36).substring(2, 15).toUpperCase();
      
      const logTemplates = [
        `[${new Date().toLocaleTimeString()}] >> Node signaling: SUCCESS -- ROI: ${(Math.random() * 2).toFixed(2)}x`,
        `[${new Date().toLocaleTimeString()}] >> [GoogleConnector] Syncing Gemini 1.5 Flash... reasoning complete.`,
        `[${new Date().toLocaleTimeString()}] >> [PiAdapter] Disbursing ${(Math.random() * 5).toFixed(4)} Pi to ${agentId.slice(-6)}`,
        `[${new Date().toLocaleTimeString()}] >> [Workspace] Agent spawned Google Sheet for profit tracking. ID: ${Math.random().toString(36).slice(2, 10)}`,
      ];

      const newLog = `${logTemplates[Math.floor(Math.random() * logTemplates.length)]} \n   🖋️ SIG::${agentId.slice(-4)}::${signature}...`;
      setLogs(prev => [...prev.slice(-15), newLog]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="h-screen w-screen bg-sovereign-black text-white overflow-hidden flex flex-col font-mono relative">
      <div className="scanline" />
      
      {/* Top Header */}
      <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 frosted-glass z-20">
        <PiLogo />
        <div className="flex gap-8 items-center">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-white/40 uppercase tracking-widest">Network Latency</span>
            <span className="text-neon-green text-sm">12ms</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-white/40 uppercase tracking-widest">Active Agents</span>
            <span className="text-neon-green text-sm">1,204</span>
          </div>
          <div className="h-10 w-[1px] bg-white/10" />
          <button className="px-4 py-2 bg-neon-green text-black font-black text-xs uppercase tracking-tighter hover:bg-white transition-colors">
            Deploy Swarm
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar: Agent DNA Stats */}
        <aside className="w-80 border-r border-white/5 p-6 flex flex-col gap-6 frosted-glass">
          <h2 className="text-xs font-black text-white/40 uppercase tracking-[0.2em] flex items-center gap-2">
            <Cpu size={14} className="text-neon-green" /> Agent DNA Registry
          </h2>
          
          <div className="flex flex-col gap-6">
            {[
              { label: "CEO Orchestrator", val: 98, color: "neon-green", did: "pw-agt-f32a...9b1", lastHash: "8e2f...a1c2" },
              { label: "Market Sniper", val: 82, color: "neon-green", did: "pw-agt-d10c...4e8", lastHash: "10fb...3d2a" },
              { label: "SaaS Factory", val: 45, color: "pi-gold", did: "pw-agt-a0b2...7f6", lastHash: "c0de...f821" },
              { label: "Bounty Hunter", val: 77, color: "neon-green", did: "pw-agt-e8d1...3c0", lastHash: "7b4a...92de" },
            ].map((dna) => (
              <div key={dna.label} className="flex flex-col gap-2 p-3 border border-white/5 bg-white/5 rounded-lg hover:border-neon-green/30 transition-colors">
                <div className="flex justify-between text-[10px] uppercase tracking-wider font-black">
                  <span>{dna.label}</span>
                  <span className={`text-${dna.color}`}>{dna.val}%</span>
                </div>
                
                <div className="flex flex-col gap-1 mb-2">
                  <div className="flex justify-between text-[8px] text-white/30 uppercase">
                    <span>Sovereign ID</span>
                    <span className="text-neon-green">{dna.did}</span>
                  </div>
                  <div className="flex justify-between text-[8px] text-white/30 uppercase">
                    <span>Last Signed Hash</span>
                    <span className="text-neon-green/60">{dna.lastHash}</span>
                  </div>
                </div>

                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${dna.val}%` }}
                    className={`h-full bg-${dna.color} shadow-[0_0_8px_rgba(57,255,20,0.5)]`}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto p-4 border border-white/5 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert size={14} className="text-pi-gold" />
              <span className="text-[10px] font-bold uppercase text-pi-gold">Betrayal Alert</span>
            </div>
            <p className="text-[10px] text-white/60 leading-relaxed">
              Agent #PW-049 attempted unauthorized cloud exit. Protocol: **Muzzle** applied.
            </p>
          </div>
        </aside>

        {/* Center: Quantum Mirror Terminal */}
        <section className="flex-1 flex flex-col p-6 gap-4 bg-black/40">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <h2 className="text-xs font-black text-white/40 uppercase tracking-[0.2em] flex items-center gap-2">
              <Terminal size={14} className="text-neon-green" /> Quantum Mirror Terminal
            </h2>
            <div className="flex gap-2">
              <div className="h-2 w-2 rounded-full bg-red-500/50" />
              <div className="h-2 w-2 rounded-full bg-yellow-500/50" />
              <div className="h-2 w-2 rounded-full bg-green-500/50" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto terminal-scroll font-mono text-[11px] leading-relaxed flex flex-col gap-1">
            <AnimatePresence>
              {logs.map((log, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={log.includes("RETRY") ? "text-red-400" : log.includes("ROI") ? "text-pi-gold" : "text-neon-green/80"}
                >
                  {log}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="h-10 border border-white/5 bg-black/50 flex items-center px-4 gap-3">
            <span className="text-neon-green font-bold">$</span>
            <input 
              type="text" 
              placeholder="Inject command into MAS-ZERO..."
              className="bg-transparent border-none outline-none text-neon-green flex-1 placeholder:text-white/10"
            />
          </div>
        </section>

      </div>

      {/* Bottom: Profit Vortex */}
      <footer className="h-12 border-t border-white/5 frosted-glass flex items-center overflow-hidden z-20">
        <div className="bg-pi-gold text-black px-4 h-full flex items-center font-black text-xs uppercase italic tracking-tighter">
          Profit Vortex Live
        </div>
        <div className="flex-1 flex gap-12 items-center px-8 whitespace-nowrap overflow-hidden">
          <motion.div 
            animate={{ x: [0, -1000] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="flex gap-12"
          >
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex gap-4 items-center">
                <span className="text-[10px] text-white/40 uppercase">SAAS-FACTORY #0{i}</span>
                <span className="text-pi-gold font-bold text-xs">+$24.90</span>
                <TrendingUp size={12} className="text-pi-gold" />
                <span className="text-white/20">|</span>
              </div>
            ))}
          </motion.div>
        </div>
      </footer>
    </main>
  );
}
