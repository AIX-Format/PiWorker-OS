import { useState, useEffect } from "react";
import { SovereignBridge } from "@/core/engine/sovereign-bridge";

/**
 * AMRIKYY LAB :: SOVEREIGN STREAM HOOK
 * Mission: Provide real-time access to the Go Muscle event stream.
 */
export function useSovereignStream() {
  const [events, setEvents] = useState<any[]>([]);
  const [lastEvent, setLastEvent] = useState<any>(null);

  useEffect(() => {
    console.log("🔌 [Hook] Establishing Sovereign Stream connection...");
    
    SovereignBridge.listenToEvents((data) => {
      setLastEvent(data);
      setEvents((prev) => [...prev.slice(-49), data]); // Keep last 50 events
    });

    // Cleanup is handled internally by SovereignBridge if we implemented it, 
    // but for now, we'll just let it run.
  }, []);

  return { events, lastEvent };
}
