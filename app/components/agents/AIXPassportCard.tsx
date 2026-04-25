'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  User, 
  Globe, 
  Lock, 
  FileText, 
  BadgeCheck,
  Cpu,
  Fingerprint
} from 'lucide-react';
import { AIXPassport } from '@/core/contracts/critical-contracts';

interface AIXPassportCardProps {
  passport: AIXPassport;
  isVerifying?: boolean;
}

/**
 * AIXPassportCard
 * Design: High-security tactical credential.
 * Purpose: Display agent cryptographically signed identity.
 */
export function AIXPassportCard({ passport, isVerifying = false }: AIXPassportCardProps) {
  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="relative w-80 h-48 rounded-xl overflow-hidden border border-cyan-500/30 frosted-glass shadow-2xl"
      style={{
        boxShadow: '0 0 30px rgba(0, 229, 255, 0.1), inset 0 0 20px rgba(255, 255, 255, 0.02)'
      }}
    >
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-0 right-0 p-4">
          <Fingerprint size={120} className="text-cyan-400" />
        </div>
        <div className="absolute bottom-0 left-0 p-4">
          <Globe size={100} className="text-cyan-400" />
        </div>
      </div>

      {/* Holographic Overlays */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent animate-pulse" />
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent animate-pulse delay-700" />

      {/* Card Content */}
      <div className="relative z-10 p-4 h-full flex flex-col justify-between">
        {/* Top Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-cyan-500/20 rounded border border-cyan-500/40">
              <ShieldCheck size={18} className="text-cyan-400" />
            </div>
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-100">AIX Passport</h3>
              <p className="text-[8px] text-cyan-500/60 uppercase tracking-widest font-mono">SOVEREIGN IDENTITY v2.0</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-[8px] font-bold px-2 py-0.5 rounded border ${passport.kyc_status === 'VERIFIED' ? 'bg-green-500/10 border-green-500/40 text-green-400' : 'bg-yellow-500/10 border-yellow-500/40 text-yellow-400'} uppercase tracking-widest`}>
              {passport.kyc_status}
            </div>
          </div>
        </div>

        {/* Center: Agent Details */}
        <div className="flex gap-4 items-center">
          <div className="w-16 h-16 rounded border border-gray-700 bg-black/40 flex items-center justify-center overflow-hidden relative group">
            <User size={32} className="text-gray-600 group-hover:text-cyan-400 transition-colors" />
            <div className="absolute inset-0 bg-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            {/* Scanline effect over avatar */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent h-1/2 animate-bounce pointer-events-none" />
          </div>
          <div className="flex-1 space-y-1.5">
            <div>
              <label className="text-[7px] uppercase tracking-widest text-gray-500 block">Agent Identifier</label>
              <span className="text-[10px] font-mono font-bold text-gray-200">{passport.agent_id}</span>
            </div>
            <div>
              <label className="text-[7px] uppercase tracking-widest text-gray-500 block">Owner Pi UID</label>
              <span className="text-[10px] font-mono font-bold text-yellow-500/80">{passport.owner_pi_id}</span>
            </div>
          </div>
        </div>

        {/* Bottom Metadata */}
        <div className="flex justify-between items-end border-t border-white/5 pt-2">
          <div className="flex gap-4">
            <div>
              <label className="text-[6px] uppercase tracking-tighter text-gray-600 block">Issuance</label>
              <span className="text-[8px] font-mono text-gray-400">{passport.issuance_date}</span>
            </div>
            <div>
              <label className="text-[6px] uppercase tracking-tighter text-gray-600 block">Expiry</label>
              <span className="text-[8px] font-mono text-gray-400">{passport.expiry_date}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1">
              <Lock size={8} className="text-cyan-500" />
              <span className="text-[7px] font-mono text-cyan-500/40">SIG: {passport.signature.substring(0, 12)}...</span>
            </div>
            <div className="flex items-center gap-1 bg-cyan-500/10 px-1.5 py-0.5 rounded">
              <BadgeCheck size={10} className="text-cyan-400" />
              <span className="text-[8px] font-black text-cyan-400 uppercase tracking-widest">ZKP Secured</span>
            </div>
          </div>
        </div>
      </div>

      {/* Verifying Overlay */}
      {isVerifying && (
        <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center">
            <Loader2 size={24} className="text-cyan-400 animate-spin mx-auto mb-2" />
            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em] animate-pulse">Verifying Passport...</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function Loader2({ size, className }: { size: number, className: string }) {
  return <Cpu size={size} className={className} />;
}
