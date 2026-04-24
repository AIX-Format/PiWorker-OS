import { NextResponse } from "next/server";
import { MASOrchestrator } from "../../../core/engine/mas-orchestrator";

/**
 * POST /api/orchestrate
 * Sovereign Steerability Bridge: Converts intent to plan and executes.
 */
export async function POST(req: Request) {
  try {
    const { intent, budget } = await req.json();

    if (!intent) {
      return NextResponse.json({ success: false, error: "Intent is required." }, { status: 400 });
    }

    console.log(`[API_STEERABILITY] Received intent: "${intent}" | Budget: ${budget || 'Default'}`);

    const orchestrator = new MASOrchestrator();
    
    // Trigger the orchestrateGoal logic which handles Prompt -> Plan -> Action
    const result = await orchestrator.orchestrateGoal(intent);

    return NextResponse.json({
      success: true,
      data: { plan: result }
    });
  } catch (error: any) {
    console.error("[API_STEERABILITY] Fatal error in neural bridge:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Sovereign Failure" },
      { status: 500 }
    );
  }
}
