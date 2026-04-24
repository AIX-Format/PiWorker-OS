import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

const LEDGER_PATH = path.join(process.cwd(), "core/identity/sovereign-ledger.jsonl");

export async function GET() {
  try {
    const data = await fs.readFile(LEDGER_PATH, "utf-8");
    if (!data.trim()) return NextResponse.json([]);
    
    const lines = data.trim().split("\n");
    const entries = lines.map(line => {
      try {
        return JSON.parse(line);
      } catch (e) {
        return null;
      }
    }).filter(Boolean);
    
    return NextResponse.json(entries.slice(-20));
  } catch (error) {
    return NextResponse.json([]);
  }
}
