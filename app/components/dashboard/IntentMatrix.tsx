'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Plus, 
  CheckCircle, 
  Clock, 
  ShieldCheck, 
  Coins, 
  ArrowRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { 
  getActiveBountiesAction, 
  createIntentBountyAction, 
  resolveIntentBountyAction 
} from '@/app/actions/sovereign-actions';
import { IntentBounty } from '@/core/contracts/critical-contracts';

/**
 * IntentMatrix HUD
 * Design: Glassmorphism / Neon Gold & Cyan
 * Purpose: Manage agentic bounties and intent-based escrow.
 */
export function IntentMatrix() {
  const [bounties, setBounties] = useState<IntentBounty[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New Bounty Form State
  const [newBounty, setNewBounty] = useState({
    description: '',
    amountPi: 10,
    expiry: '24h'
  });

  const fetchBounties = async () => {
    setLoading(true);
    try {
      const result = await getActiveBountiesAction({ creatorId: 'SYSTEM_ADMIN', status: 'ACTIVE' });
      setBounties(result.bounties || []);
    } catch (err) {
      setError('Failed to sync with Intent Mesh');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBounties();
    const interval = setInterval(fetchBounties, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateBounty = async () => {
    if (!newBounty.description) return;
    setIsCreating(true);
    try {
      await createIntentBountyAction({
        creatorId: 'SYSTEM_ADMIN',
        intentDescription: newBounty.description,
        amountPi: newBounty.amountPi,
        expiry: newBounty.expiry,
        constraints: { 'min_trust_score': '0.8' }
      });
      setNewBounty({ description: '', amountPi: 10, expiry: '24h' });
      setIsCreating(false);
      fetchBounties();
    } catch (err) {
      setError('Bounty emission failed');
      setIsCreating(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-sm font-black tracking-[0.3em] uppercase text-cyan-400 flex items-center gap-2">
            <Zap size={16} className="text-yellow-500 animate-pulse" />
            Intent Matrix
          </h2>
          <p className="text-[10px] text-gray-500 uppercase mt-1">Autonomous Freelance Settlement Layer</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchBounties}
            className="p-1.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 transition-all"
          >
            <Clock size={14} />
          </button>
        </div>
      </div>

      {/* Quick Emission Form */}
      <div className="bg-black/40 border border-yellow-500/20 rounded-lg p-4 mb-6 frosted-glass">
        <div className="flex flex-col gap-3">
          <input 
            type="text"
            placeholder="Describe agentic intent (e.g. 'Solve arbitrage gap in DEX A/B')..."
            value={newBounty.description}
            onChange={(e) => setNewBounty({...newBounty, description: e.target.value})}
            className="bg-black/60 border border-gray-700 rounded p-2 text-xs text-cyan-100 placeholder:text-gray-600 focus:border-yellow-500/50 outline-none transition-all"
          />
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Coins size={14} className="text-yellow-500" />
                <input 
                  type="number"
                  value={newBounty.amountPi}
                  onChange={(e) => setNewBounty({...newBounty, amountPi: parseInt(e.target.value)})}
                  className="bg-transparent border-b border-gray-700 w-12 text-xs text-yellow-400 outline-none focus:border-yellow-500"
                />
                <span className="text-[10px] text-gray-500 font-bold">π</span>
              </div>
              <div className="text-[10px] text-gray-500 border border-gray-800 rounded px-2 py-0.5 uppercase tracking-tighter">
                {newBounty.expiry} expiry
              </div>
            </div>
            <button 
              onClick={handleCreateBounty}
              disabled={isCreating || !newBounty.description}
              className="px-4 py-1.5 bg-yellow-500 text-black text-[10px] font-black uppercase tracking-widest rounded hover:bg-yellow-400 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isCreating ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
              Emit Intent
            </button>
          </div>
        </div>
      </div>

      {/* Bounty List */}
      <div className="flex-1 overflow-y-auto terminal-scroll pr-2 space-y-3">
        {loading && bounties.length === 0 ? (
          <div className="h-40 flex items-center justify-center border border-dashed border-gray-800 rounded">
            <Loader2 size={24} className="text-cyan-500 animate-spin opacity-20" />
          </div>
        ) : bounties.length === 0 ? (
          <div className="text-center py-10 opacity-20 italic text-xs uppercase tracking-widest">
            No active intents detected in the matrix.
          </div>
        ) : (
          <AnimatePresence>
            {bounties.map((bounty) => (
              <motion.div
                key={bounty.bounty_id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-cyan-500/5 border border-cyan-500/20 rounded p-3 hover:border-cyan-500/40 transition-all group relative overflow-hidden"
              >
                {/* Background glow on hover */}
                <div className="absolute inset-0 bg-cyan-400/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex justify-between items-start mb-2 relative z-10">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-mono text-cyan-500/60 uppercase">ID: {bounty.bounty_id.substring(0, 8)}</span>
                    <h4 className="text-xs font-bold text-gray-100 mt-0.5">{bounty.description}</h4>
                  </div>
                  <div className="text-xs font-black text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">
                    {bounty.amount_pi} π
                  </div>
                </div>

                <div className="flex justify-between items-center relative z-10">
                  <div className="flex gap-3">
                    <div className="flex items-center gap-1 text-[9px] text-gray-500 uppercase tracking-tighter">
                      <ShieldCheck size={10} className="text-green-500" />
                      ZKP Verified
                    </div>
                    <div className="flex items-center gap-1 text-[9px] text-gray-500 uppercase tracking-tighter">
                      <Clock size={10} className="text-cyan-500" />
                      Active
                    </div>
                  </div>
                  <button className="text-[9px] font-black text-cyan-400 uppercase tracking-widest flex items-center gap-1 hover:text-white transition-colors">
                    Details <ArrowRight size={10} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Matrix Status */}
      <div className="mt-4 pt-4 border-t border-gray-800 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">Mesh Connected</span>
        </div>
        <div className="text-[9px] text-gray-400 font-mono">
          LOC: 0x42...A1B2
        </div>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-2 bg-red-500/10 border border-red-500/30 rounded flex items-center gap-2 text-red-400 text-[10px] uppercase font-bold"
        >
          <AlertCircle size={12} />
          {error}
        </motion.div>
      )}
    </div>
  );
}
