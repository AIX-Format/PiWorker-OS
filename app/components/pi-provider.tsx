"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import Script from "next/script";

interface PiUser {
  username: string;
  uid: string;
}

interface PiContextType {
  piLoaded: boolean;
  user: PiUser | null;
  setUser: (user: PiUser | null) => void;
}

const PiContext = createContext<PiContextType | undefined>(undefined);

export const PiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [piLoaded, setPiLoaded] = useState(false);
  const [user, setUser] = useState<PiUser | null>(null);

  useEffect(() => {
    // Check if Pi is already in window (e.g. script loaded faster or cached)
    if ((window as any).Pi) {
      setPiLoaded(true);
      initializePi();
    }
  }, []);

  const initializePi = () => {
    try {
      window.Pi.init({ version: "2.0", sandbox: true });
      console.log("MAS-ZERO: Pi SDK Initialized (Sandbox Mode)");
    } catch (error) {
      console.error("MAS-ZERO: Pi SDK Initialization Failed", error);
    }
  };

  return (
    <PiContext.Provider value={{ piLoaded, user, setUser }}>
      <Script
        src="https://sdk.minepi.com/pi-sdk.js"
        strategy="afterInteractive"
        onLoad={() => {
          setPiLoaded(true);
          initializePi();
        }}
      />
      {children}
    </PiContext.Provider>
  );
};

export const usePi = () => {
  const context = useContext(PiContext);
  if (context === undefined) {
    throw new Error("usePi must be used within a PiProvider");
  }
  return context;
};
