/**
 * MAS-ZERO :: SOVEREIGN PLUGIN GATEWAY
 * Mission: Securely discover, verify, and register agent tools.
 */

import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  costPerUse: number;
  entryPoint: string;
  signature: string;
  toolSchema: any; // Gemini-compatible JSON schema
}

export class PluginGateway {
  private static registry: Map<string, PluginManifest> = new Map();
  private static PLUGINS_DIR = path.join(process.cwd(), "plugins");

  /**
   * Scans and registers all signed plugins.
   */
  static async initialize() {
    console.log("\x1b[35m[GATEWAY] Scanning for Sovereign Plugins...\x1b[0m");
    
    try {
      await fs.mkdir(this.PLUGINS_DIR, { recursive: true });
      const entries = await fs.readdir(this.PLUGINS_DIR, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isDirectory()) {
          await this.loadPlugin(entry.name);
        }
      }
    } catch (error) {
      console.error("[GATEWAY] Scan failed:", error);
    }
  }

  private static async loadPlugin(pluginId: string) {
    const manifestPath = path.join(this.PLUGINS_DIR, pluginId, "manifest.json");
    
    try {
      const content = await fs.readFile(manifestPath, "utf-8");
      const manifest: PluginManifest = JSON.parse(content);

      // SECURITY: Signature Verification
      if (!this.verifyPluginSignature(manifest)) {
        console.warn(`\x1b[31m[SECURITY] Plugin ${pluginId} REJECTED: Invalid or missing signature.\x1b[0m`);
        return;
      }

      this.registry.set(pluginId, manifest);
      console.log(`\x1b[32m[GATEWAY] Registered: ${manifest.name} (v${manifest.version}) | Cost: ${manifest.costPerUse} Pi\x1b[0m`);
    } catch (error) {
      // Skip directories without manifests
    }
  }

  private static verifyPluginSignature(manifest: PluginManifest): boolean {
    // In production, this would use the Sovereign Root Key to verify the manifest hash
    // For now, we simulate a valid check for signed plugins
    return manifest.signature !== "UNSIGNED";
  }

  static getToolsForOracle() {
    return Array.from(this.registry.values()).map(p => p.toolSchema);
  }

  static getPlugin(id: string) {
    return this.registry.get(id);
  }
}
