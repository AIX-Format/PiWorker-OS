import { NextResponse } from "next/server";
import { AmrikyyTreasury } from "@/core/finance/treasury-vault";
import { fleetManager } from "@/core/agents/fleet-manager";
import { PersistenceEngine } from "@/core/brain/persistence-engine";

/**
 * SOVEREIGN STATE API
 * Returns live data from Treasury, Fleet, and Neural Memory.
 */
export async function GET() {
  try {
    const treasury = AmrikyyTreasury.getStats();
    const fleet = fleetManager.getMetrics();
    const allAgents = fleetManager.getAllAgents();
    
    // Load last 5 insights from neural memory
    const insights = await PersistenceEngine.loadInsights();
    const lastLogs = insights.slice(-5).reverse();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      treasury: {
        reserve: treasury.reserve,
        status: treasury.reserve > 100 ? "PROSPEROUS" : "STABLE"
      },
      fleet: {
        count: fleet.total,
        active: fleet.active,
        ready: fleet.ready,
        agents: allAgents
      },
      logs: lastLogs
    });
  } catch (error) {
    console.error("[API_ERROR]", error);
    return NextResponse.json({ success: false, error: "Failed to fetch sovereign state" }, { status: 500 });
  }
}
