"use client";

import { motion } from "framer-motion";

const MotionDiv = motion.div as any;

export const PiLogo = ({ size = "md", status = "Sovereign" }: { size?: "sm" | "md" | "lg", status?: string }) => {
  const dimensions = {
    sm: "w-10 h-10 text-xl",
    md: "w-16 h-16 text-3xl",
    lg: "w-24 h-24 text-5xl",
  }[size];

  return (
    <div className="flex items-center gap-4">
      <div className={`relative ${dimensions} flex items-center justify-center`}>
        {/* Outer Quantum Orb - Rotating */}
        <MotionDiv
          className="absolute inset-0 border-2 border-neon-green/30 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Inner Glowing Ring - Pulsing */}
        <MotionDiv
          className="absolute inset-2 border border-neon-green rounded-full shadow-[0_0_15px_rgba(57,255,20,0.5)]"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Central Pi Symbol */}
        <span className="relative z-10 font-bold text-neon-green filter drop-shadow-[0_0_8px_rgba(57,255,20,0.8)]">
          π
        </span>
      </div>

      <div className="flex flex-col">
        <span className="text-white font-black tracking-tighter text-xl leading-none">
          PIWORKER<span className="text-neon-green">-OS</span>
        </span>
        <span className="text-[10px] uppercase tracking-[0.3em] text-neon-green/60 font-mono">
          System: <span className="text-neon-green">{status}</span>
        </span>
      </div>
    </div>
  );
};
