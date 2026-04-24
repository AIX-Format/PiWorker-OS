import { NextResponse } from "next/server";
import { AixFoundry } from "@/core/engine/aix-foundry";

export async function GET() {
  try {
    const assets = await AixFoundry.listAssets();
    return NextResponse.json({ success: true, assets });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to load marketplace" }, { status: 500 });
  }
}
