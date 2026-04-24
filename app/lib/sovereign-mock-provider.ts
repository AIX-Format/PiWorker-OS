/**
 * SOVEREIGN MOCK PROVIDER
 * Self-Healing Data Layer with Real-Time Simulated Telemetry
 * 
 * Gracefully falls back to high-fidelity simulated data when API fails
 * or environment variables are missing. Zero downtime, continuous operation.
 */

export interface AgentNode {
  agentId: string;
  specialization: string;
  status: 'READY' | 'ACTIVE' | 'IDLE';
  reserve: number;
}

export interface FleetMetrics {
  count: number;
  active: number;
  ready: number;
  agents: AgentNode[];
}

export interface TreasuryData {
  reserves: number;
  status: 'OPERATIONAL' | 'OFFLINE' | 'WARNING';
}

export interface LogEntry {
  id: string;
  timestamp: string;
  agentId: string;
  topic: string;
}

export interface SovereignState {
  timestamp: string;
  treasury: TreasuryData;
  fleet: FleetMetrics;
  logs: LogEntry[];
}

// Simulated agent pool
const MOCK_AGENTS: AgentNode[] = [
  {
    agentId: 'ALPHA-001',
    specialization: 'Market Analysis',
    status: 'READY',
    reserve: 15420.75,
  },
  {
    agentId: 'BETA-002',
    specialization: 'Treasury Optimization',
    status: 'ACTIVE',
    reserve: 8932.50,
  },
  {
    agentId: 'GAMMA-003',
    specialization: 'Risk Management',
    status: 'READY',
    reserve: 12650.25,
  },
  {
    agentId: 'DELTA-004',
    specialization: 'Neural Swarm',
    status: 'ACTIVE',
    reserve: 6789.00,
  },
  {
    agentId: 'EPSILON-005',
    specialization: 'Cryptographic Security',
    status: 'READY',
    reserve: 19200.80,
  },
];

// Simulated log topics for realistic telemetry
const MOCK_TOPICS = [
  'API_CALL_SUCCESS',
  'TRANSACTION_SETTLED',
  'NEURAL_SYNC',
  'TREASURY_BALANCE_UPDATE',
  'AGENT_STATUS_CHANGE',
  'SECURITY_AUDIT',
  'MEMORY_FLUSH',
  'FLEET_COORDINATION',
];

// Realtime data generation with slight variance
let lastTreasuryReserve = 62341.50;
let lastFleetActive = 3;

export function generateMockSovereignState(): SovereignState {
  // Simulate treasury fluctuation (+/- 2%)
  const variance = (Math.random() - 0.5) * lastTreasuryReserve * 0.02;
  lastTreasuryReserve = Math.max(50000, lastTreasuryReserve + variance);

  // Simulate fleet activity changes (0-5 active agents)
  if (Math.random() > 0.7) {
    lastFleetActive = Math.max(0, Math.min(5, lastFleetActive + (Math.random() > 0.5 ? 1 : -1)));
  }

  // Generate realistic log entries (5-10 recent events)
  const logCount = Math.floor(Math.random() * 6) + 5;
  const logs: LogEntry[] = Array.from({ length: logCount }, (_, i) => {
    const now = new Date();
    const timestamp = new Date(now.getTime() - i * 3000).toISOString();
    return {
      id: `mock-log-${Date.now()}-${i}`,
      timestamp,
      agentId: MOCK_AGENTS[Math.floor(Math.random() * MOCK_AGENTS.length)].agentId,
      topic: MOCK_TOPICS[Math.floor(Math.random() * MOCK_TOPICS.length)],
    };
  });

  // Shuffle agents status slightly for realism
  const agents = MOCK_AGENTS.map((agent) => ({
    ...agent,
    status: Math.random() > 0.8 ? ('ACTIVE' as const) : ('READY' as const),
  }));

  return {
    timestamp: new Date().toISOString(),
    treasury: {
      reserves: Math.round(lastTreasuryReserve * 100) / 100,
      status: 'OPERATIONAL',
    },
    fleet: {
      count: agents.length,
      active: lastFleetActive,
      ready: agents.length - lastFleetActive,
      agents,
    },
    logs: logs.reverse(), // Most recent first
  };
}

/**
 * Fetch sovereign state with automatic fallback to mock data
 * Returns real data when API is available, simulated data when it fails
 */
export async function fetchSovereignStateWithFallback(): Promise<{
  data: SovereignState;
  isSimulated: boolean;
  error?: string;
}> {
  try {
    const response = await fetch('/api/sovereign-state', {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

    const json = await response.json();

    if (!json.success || !json.state) {
      throw new Error('Invalid API response structure');
    }

    return {
      data: json.state,
      isSimulated: false,
    };
  } catch (error) {
    console.warn(
      '[SovereignMockProvider] API failed, activating simulation mode:',
      error instanceof Error ? error.message : String(error)
    );

    // Return high-fidelity simulated data
    return {
      data: generateMockSovereignState(),
      isSimulated: true,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
