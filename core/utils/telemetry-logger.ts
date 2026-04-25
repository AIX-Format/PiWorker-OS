/**
 * Telemetry Logger
 * A sovereign data-logging engine for PiWorker-OS.
 * Stores all system events in a structured JSONL format (Data Moat).
 * [BROWSER SAFE] Automatically detects environment and performs no-op in browser.
 */
export class TelemetryLogger {
  private static getLogPath(): string | null {
    if (typeof window !== "undefined") return null;
    // We use a dynamic require or import here if needed, but path.join is standard in Node.
    // However, to satisfy Webpack, we must ensure this is only called on server.
    return require("node:path").join(process.cwd(), "telemetry.jsonl");
  }

  /**
   * Logs a sovereign event to the telemetry moat.
   */
  static log(level: "INFO" | "WARN" | "ERROR" | "CRITICAL", topic: string, data: any) {
    if (typeof window !== "undefined") {
      // Optional: console output in browser for visibility
      // console.log(`[TELEMETRY_CLIENT] ${level}: ${topic}`, data);
      return;
    }

    const entry = {
      timestamp: new Date().toISOString(),
      level,
      topic,
      ...data
    };

    const line = JSON.stringify(entry) + "\n";

    try {
      const fs = require("node:fs");
      const logPath = this.getLogPath();
      if (logPath) {
        fs.appendFileSync(logPath, line);
      }
    } catch (error) {
      console.error(`[TELEMETRY_FATAL] Failed to write to moat: ${error}`);
    }
  }

  /**
   * Specifically logs an orchestration event.
   */
  static logOrchestration(intent: string, plan: any, success: boolean, error?: string) {
    this.log(success ? "INFO" : "ERROR", "GOAL_ORCHESTRATION", {
      intent,
      planCount: plan?.length || 0,
      success,
      error
    });
  }

  /**
   * Specifically logs a fiscal event.
   */
  static logFiscal(type: "ESCROW_LOCK" | "ESCROW_RELEASE" | "TAX_INFLOW", details: any) {
    this.log("INFO", "FISCAL_EVENT", {
      type,
      ...details
    });
  }

  /**
   * Logs physical kinematic data for robotic execution.
   */
  static logKinematics(robotId: string, action: string, joints: number[], confidence: number) {
    let integrityHash = "UNAVAILABLE_ON_CLIENT";
    if (typeof window === "undefined") {
        try {
            const crypto = require("node:crypto");
            integrityHash = crypto.createHash("sha256").update(JSON.stringify(joints)).digest("hex");
        } catch (e) {
            // Fallback
        }
    }

    this.log("INFO", "ROBOT_KINEMATICS", {
      robotId,
      action,
      joints,
      confidence,
      integrityHash
    });
  }
}
