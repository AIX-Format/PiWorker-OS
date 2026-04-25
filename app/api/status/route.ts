import { NextResponse } from "next/server";
import { SovereignBridge } from "@/core/engine/sovereign-bridge";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const status = await SovereignBridge.getSystemStatus();
    return NextResponse.json(status);
  } catch (error: any) {
    console.error("[API] Status check failed:", error.message);
    return NextResponse.json({ 
      status: "OFFLINE", 
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
}
