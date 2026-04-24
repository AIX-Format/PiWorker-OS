"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Zap, Cpu, ShieldCheck, ArrowRight, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface PlanStep {
  component: "robot" | "agent" | "finance";
  action: string;
  parameters?: Record<string, any>;
  status?: "pending" | "executing" | "completed" | "failed";
}

export function OmniTerminal() {
  const [intent, setIntent] = useState("");
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [plan, setPlan] = useState<PlanStep[] | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleOrchestrate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!intent || isOrchestrating) return;

    setIsOrchestrating(true);
    setPlan(null);
    setCurrentStepIndex(-1);
    setExecutionLogs([`[NEURAL_LINK] Analyzing intent: "${intent}"...`]);

    try {
      const response = await fetch("/api/orchestrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intent, budget: 100 }),
      });

      const result = await response.json();

      if (result.success) {
        const generatedPlan = result.data.plan;
        setPlan(generatedPlan.map((s: any) => ({ ...s, status: "pending" })));
        setExecutionLogs(prev => [...prev, `[PLAN_GENERATED] Strategy locked. ${generatedPlan.length} steps identified.`]);

        // Simulate execution sequence for visual effect
        for (let i = 0; i < generatedPlan.length; i++) {
          setCurrentStepIndex(i);
          setExecutionLogs(prev => [...prev, `[EXECUTION] Deploying ${generatedPlan[i].component}: ${generatedPlan[i].action}...`]);
          
          // In a real app, this would wait for the orchestrator to signal step completion
          await new Promise(r => setTimeout(r, 1500));
          
          setPlan(prev => {
            if (!prev) return null;
            const updated = [...prev];
            updated[i].status = "completed";
            return updated;
          });
        }
        
        setExecutionLogs(prev => [...prev, `[GOAL_REACHED] All sovereign actions completed successfully.`]);
      } else {
        setExecutionLogs(prev => [...prev, `[ERROR] Neural Bridge failure: ${result.error}`]);
      }
    } catch (error) {
      setExecutionLogs(prev => [...prev, `[FATAL] Connection to MAS-ZERO lost.`]);
    } finally {
      setIsOrchestrating(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="flex flex-col gap-4 w-full h-full">
      {/* Terminal Input */}
      <form onSubmit={handleOrchestrate} className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-neon-green">
          {isOrchestrating ? <Loader2 size={16} className="animate-spin" /> : <Terminal size={16} />}
        </div>
        <input
          type="text"
          value={intent}
          onChange={(e) => setIntent(e.target.value)}
          placeholder="Inject high-level goal (e.g. 'Audit DeFi and deploy robot')..."
          className="w-full bg-black/80 border border-white/10 p-4 pl-12 rounded-lg text-neon-green font-mono text-sm placeholder:text-white/10 outline-none focus:border-neon-green/50 transition-all shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]"
          disabled={isOrchestrating}
        />
        <button
          type="submit"
          disabled={isOrchestrating || !intent}
          className="absolute right-2 top-2 bottom-2 px-4 bg-neon-green text-black font-black uppercase text-[10px] tracking-tighter hover:bg-white transition-all disabled:opacity-50"
        >
          {isOrchestrating ? "Compiling..." : "Execute"}
        </button>
      </form>

      {/* Execution Timeline */}
      <div className="flex-1 overflow-hidden flex flex-col gap-4">
        {plan && (
          <div className="flex gap-2 justify-between items-center px-2 py-4 bg-white/5 border border-white/5 rounded-lg">
            {plan.map((step, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 relative">
                {idx < plan.length - 1 && (
                  <div className={`absolute top-4 left-[60%] right-[-40%] h-[2px] ${idx < currentStepIndex ? "bg-neon-green shadow-[0_0_8px_#39FF14]" : "bg-white/10"}`} />
                )}
                <motion.div
                  animate={idx === currentStepIndex ? { scale: [1, 1.2, 1], boxShadow: ["0 0 0px #39FF14", "0 0 15px #39FF14", "0 0 0px #39FF14"] } : {}}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className={`z-10 w-8 h-8 rounded-full flex items-center justify-center border ${
                    step.status === "completed" 
                      ? "bg-neon-green text-black border-neon-green" 
                      : idx === currentStepIndex 
                        ? "bg-black text-neon-green border-neon-green" 
                        : "bg-black text-white/20 border-white/10"
                  }`}
                >
                  {step.component === "robot" ? <Cpu size={14} /> : step.component === "agent" ? <Zap size={14} /> : <ShieldCheck size={14} />}
                </motion.div>
                <span className={`text-[8px] uppercase font-bold tracking-widest ${idx === currentStepIndex ? "text-neon-green" : "text-white/40"}`}>
                  {step.component}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Dynamic Logs */}
        <div className="flex-1 bg-black/60 border border-white/5 rounded-lg p-4 font-mono text-[10px] overflow-y-auto custom-scrollbar">
          <div className="flex flex-col gap-1">
            {executionLogs.map((log, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                className={log.includes("[ERROR]") || log.includes("[FATAL]") ? "text-red-500" : log.includes("[EXECUTION]") ? "text-pi-gold" : "text-neon-green/60"}
              >
                <span className="opacity-30 mr-2">[{new Date().toLocaleTimeString()}]</span>
                {log}
              </motion.div>
            ))}
            {isOrchestrating && (
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="text-neon-green"
              >
                _
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
