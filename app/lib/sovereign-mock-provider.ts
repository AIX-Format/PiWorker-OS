/**
 * AMRIKYY LAB :: SOVEREIGN MOCK PROVIDER
 * STATUS: TACTICAL FALLBACK ACTIVE
 * PURPOSE: Supply high-fidelity mock data when Sovereign Go Engine is disconnected.
 */

export interface SovereignState {
  treasury: {
    reserves: number;
    status: string;
  };
  fleet: {
    count: number;
    active: number;
    ready: number;
    agents: Array<{
      agentId: string;
      status: string;
      performance: number;
    }>;
  };
  logs: string[];
}

export const fetchSovereignStateWithFallback = async (): Promise<{ data: SovereignState; isSimulated: boolean }> => {
  // In a real scenario, this would try to fetch from the Go Sidecar API first.
  // For now, we provide high-fidelity tactical data.

  const mockData: SovereignState = {
    treasury: {
      reserves: 125840.42,
      status: 'SHIELDED',
    },
    fleet: {
      count: 32,
      active: 28,
      ready: 4,
      agents: [
        { agentId: 'AGENT-ZERO', status: 'EXECUTING', performance: 0.99 },
        { agentId: 'AGENT-PRIME', status: 'OBSERVING', performance: 0.94 },
        { agentId: 'AGENT-GOPHER', status: 'SYNCING', performance: 0.91 },
      ],
    },
    logs: [
      '[SYSTEM] Neural bridge established.',
      '[π0.7] Physical layer heartbeat detected.',
      '[GO] Sovereign engine compiled successfully.',
    ],
  };

  // Simulate a slight network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  return {
    data: mockData,
    isSimulated: true, // Mark as simulated until Go Bridge is live
  };
};
