'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Wallet, Cpu, Zap, ShieldCheck } from 'lucide-react';

export function WalletStatus() {
  const [status, setStatus] = useState({
    balance: '...',
    address: 'GD5B...36MZ',
    geminiStatus: 'Active',
    network: 'Pi Testnet',
    lastSync: new Date().toLocaleTimeString('ar-EG'),
  });

  // محاكاة الاتصال بالمحرك الخلفي (Go Sidecar)
  useEffect(() => {
    const timer = setInterval(() => {
      setStatus(prev => ({
        ...prev,
        lastSync: new Date().toLocaleTimeString('ar-EG'),
      }));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 dir-rtl">
      {/* بطاقة محفظة Pi */}
      <Card className="bg-black/40 border-purple-500/30 backdrop-blur-md hover:border-purple-500/60 transition-all group">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-purple-200">محفظة Pi</CardTitle>
          <Wallet className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white font-mono">{status.balance} PI</div>
          <p className="text-xs text-purple-400/70 mt-1 truncate">{status.address}</p>
          <Badge variant="outline" className="mt-2 border-green-500/50 text-green-400 bg-green-500/10">
            {status.network}
          </Badge>
        </CardContent>
      </Card>

      {/* بطاقة ذكاء Gemini */}
      <Card className="bg-black/40 border-cyan-500/30 backdrop-blur-md hover:border-cyan-500/60 transition-all group">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-cyan-200">محرك Gemini 1.5</CardTitle>
          <Cpu className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">Flash Free</div>
          <p className="text-xs text-cyan-400/70 mt-1">الحالة: {status.geminiStatus}</p>
          <div className="flex items-center gap-1 mt-2">
            <Zap className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            <span className="text-[10px] text-yellow-400 font-bold uppercase tracking-wider">Free Tier Ready</span>
          </div>
        </CardContent>
      </Card>

      {/* بطاقة الأمن السيادي */}
      <Card className="bg-black/40 border-emerald-500/30 backdrop-blur-md hover:border-emerald-500/60 transition-all group">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-emerald-200">الأمن السيادي</CardTitle>
          <ShieldCheck className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
        </CardHeader>
        <CardContent>
          <div className="text-sm font-bold text-white">Local Lockdown</div>
          <p className="text-xs text-emerald-400/70 mt-1">AES-256-GCM Active</p>
          <p className="text-[10px] text-emerald-500/50 mt-2 font-mono italic">Secure Seed Encrypted</p>
        </CardContent>
      </Card>

      {/* بطاقة المزامنة */}
      <Card className="bg-black/40 border-amber-500/30 backdrop-blur-md hover:border-amber-500/60 transition-all group">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-amber-200">آخر مزامنة</CardTitle>
          <Zap className="w-4 h-4 text-amber-400 group-hover:animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white font-mono">{status.lastSync}</div>
          <p className="text-xs text-amber-400/70 mt-1">تحديث حي من الخادم</p>
        </CardContent>
      </Card>
    </div>
  );
}
