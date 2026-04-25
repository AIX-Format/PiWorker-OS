'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import Script from 'next/script';

interface User {
  username: string;
  uid: string;
}

interface PiContextType {
  isInitialized: boolean;
  error: string | null;
  user: User | null;
  setUser: (user: User | null) => void;
  authenticate: () => Promise<User | null>;
  createPayment: (amount: number, memo: string, metadata: object) => Promise<string>;
}

const PiContext = createContext<PiContextType | undefined>(undefined);

export const PiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const initPi = () => {
    try {
      if (typeof window !== 'undefined' && (window as any).Pi) {
        const isProduction = window.location.hostname === 'axiomid.app';
        console.log(`[PI_SDK] 🌍 Current Origin: ${window.location.origin} | Production: ${isProduction}`);
        
        (window as any).Pi.init({ 
          version: '2.0', 
          sandbox: !isProduction 
        });
        
        setIsInitialized(true);
        console.log(
          `%c[PI_SDK] Sovereign Initialization Complete (${isProduction ? 'PRODUCTION' : 'SANDBOX'} Mode)`,
          `color: ${isProduction ? '#00E5FF' : '#39FF14'}; font-weight: bold;`
        );
      }
    } catch (err: any) {
      setError(err.message);
      console.error('[PI_SDK] Initialization Failed:', err);
    }
  };

  const authenticate = async (): Promise<User | null> => {
    if (!isInitialized || !(window as any).Pi) {
      throw new Error('Pi SDK not initialized');
    }

    try {
      const scopes = ['payments', 'username'];
      const auth = await (window as any).Pi.authenticate(scopes, async (payment: any) => {
        console.warn('[PI_SDK] ⚠️ Incomplete payment detected during auth:', payment);
        
        // AUTO-RESOLVE: Call backend to finalize the hanging payment
        try {
          await fetch('/api/sovereign/payment/incomplete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ payment }),
          });
          console.log('[PI_SDK] ✅ Incomplete payment resolved automatically.');
        } catch (err) {
          console.error('[PI_SDK] ❌ Failed to resolve incomplete payment:', err);
        }
      });

      setUser(auth.user);
      console.log('[PI_SDK] User Authenticated:', auth.user.username);
      return auth.user;
    } catch (err: any) {
      console.error('[PI_SDK] Auth failed:', err);
      setError(err.message);
      return null;
    }
  };

  const createPayment = async (amount: number, memo: string, metadata: object): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!isInitialized || !(window as any).Pi) {
        return reject(new Error('Pi SDK not initialized'));
      }

      (window as any).Pi.createPayment(
        {
          amount,
          memo,
          metadata,
        },
        {
          onReadyForServerApproval: (paymentId: string) => {
            console.log('[PI_SDK] Payment ready for server approval:', paymentId);
            // Call backend to approve
            fetch('/api/sovereign/payment/approve', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId }),
            }).catch((err) => console.error('Approval failed', err));
          },
          onReadyForServerCompletion: (paymentId: string, txid: string) => {
            console.log('[PI_SDK] Payment ready for server completion:', paymentId, txid);
            // Call backend to complete
            fetch('/api/sovereign/payment/complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId, txid }),
            })
              .then(() => resolve(txid))
              .catch((err) => reject(err));
          },
          onCancel: (paymentId: string) => {
            console.log('[PI_SDK] Payment cancelled:', paymentId);
            reject(new Error('PAYMENT_CANCELLED'));
          },
          onError: (error: any, payment?: any) => {
            console.error('[PI_SDK] Payment error:', error, payment);
            reject(error);
          },
        }
      );
    });
  };

  return (
    <PiContext.Provider
      value={{ isInitialized, error, user, setUser, authenticate, createPayment }}
    >
      <Script
        src="https://sdk.minepi.com/pi-sdk.js"
        onLoad={initPi}
        onError={() => setError('Failed to load Pi SDK script')}
      />
      {children}
    </PiContext.Provider>
  );
};

export const usePi = () => {
  const context = useContext(PiContext);
  if (context === undefined) {
    throw new Error('usePi must be used within a PiProvider');
  }
  return context;
};
