import { NextResponse } from 'next/server';
import { SovereignBridge } from '@/core/engine/sovereign-bridge';
import { AmrikyyTreasury } from '@/core/finance/treasury-vault';
import { fleetManager } from '@/core/agents/fleet-manager';

/**
 * AMRIKYY LAB :: SOVEREIGN STATE BRIDGE API
 * ROUTE: /api/sovereign/state
 * PURPOSE: Bridges the Dashboard (UI) to the internal core and Go engine.
 * VERIFIABILITY: NO MOCK DATA.
 */

export async function GET() {
  try {
    // 1. Fetch Real Treasury Data (Durable Storage)
    const treasuryStats = await AmrikyyTreasury.getStats();

    // 2. Fetch Real Fleet Metrics (Agent Registry)
    const fleetMetrics = await fleetManager.getMetrics();
    const allAgents = await fleetManager.getAllAgents();

    // 3. Heartbeat: Verify Go Engine Connectivity
    let engineStatus = 'ONLINE';
    let engineHealth: any = null;
    
    try {
      engineHealth = await SovereignBridge.getSystemStatus();
    } catch (err) {
      engineStatus = 'DEGRADED';
    }

    const sovereignState = {
      treasury: {
        reserves: treasuryStats.reserves.Pi || 0,
        otherReserves: treasuryStats.reserves,
        status: treasuryStats.status,
        lastAudit: treasuryStats.lastAudit,
      },
      fleet: {
        count: fleetMetrics.total,
        active: fleetMetrics.active,
        ready: fleetMetrics.ready,
        agents: allAgents.map(a => ({
          agentId: a.id,
          name: a.name,
          status: a.status.toUpperCase(),
          performance: a.dna.fitnessScore / 100,
          role: a.role
        })),
      },
      engine: {
        status: engineStatus,
        pi_balance: engineHealth?.pi_balance || 0,
        active_intents: engineHealth?.active_intents || 0,
      },
      isSimulated: false,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(sovereignState);
  } catch (err: any) {
    console.error("[API_BRIDGE_ERROR] Sovereign State Aggregation Failed:", err.message);
    return NextResponse.json(
      { error: "Sovereign State Error", message: err.message },
      { status: 500 }
    );
  }
}
