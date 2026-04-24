import { NextResponse } from "next/server";
import { fleetManager } from "@/core/agents/fleet-manager";

/**
 * GET /api/agents
 * Returns the current sovereign workforce and their metrics.
 */
export async function GET() {
  try {
    const agents = await fleetManager.getAllAgents();
    const metrics = await fleetManager.getMetrics();

    return NextResponse.json({
      success: true,
      data: {
        agents,
        metrics
      }
    });
  } catch (error) {
    console.error("[API_AGENTS] Fatal error fetching fleet:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve sovereign fleet." },
      { status: 500 }
    );
  }
}
