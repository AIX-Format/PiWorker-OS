import crypto from "node:crypto";
import { PersistenceEngine } from "./persistence-engine";

/**
 * Neural Memory Mesh
 * The collective intelligence layer of Amrikyy Lab.
 * Acts as a Sovereign Blackboard for agent coordination.
 */
export interface SovereignInsight {
  id: string;
  agentId: string;
  topic: string;
  data: any;
  signature: string;
  timestamp: string;
  relevance: number; // 0-100
}

export class NeuralMemoryMesh {
  private static blackboard: SovereignInsight[] = [];
  private static activeClaims: Map<string, { agentId: string, expires: number }> = new Map();

  /**
   * Posts a signed insight to the collective memory.
   */
  static async postInsight(insight: SovereignInsight) {
    // In production: Verify signature before posting
    this.blackboard.push(insight);
    
    // PERSISTENCE: Save to disk
    await PersistenceEngine.saveInsight(insight);
    
    // Maintain a rotating memory of the last 100 insights
    if (this.blackboard.length > 100) {
      this.blackboard.shift();
    }

    return { status: "COMMITTED", meshId: insight.id };
  }

  /**
   * Retrieves insights based on relevance or topic.
   */
  static query(topic?: string) {
    if (!topic) return this.blackboard.sort((a, b) => b.relevance - a.relevance);
    return this.blackboard.filter(i => i.topic === topic);
  }

  /**
   * Claims a task for an agent. Returns true if claim successful.
   */
  static claimTask(taskId: string, agentId: string, durationMs: number = 300000): boolean {
    const now = Date.now();
    const existing = this.activeClaims.get(taskId);

    if (existing && existing.expires > now) {
      console.log(`[NEURAL_MEMORY] Task ${taskId} is already claimed by ${existing.agentId}`);
      return false;
    }

    this.activeClaims.set(taskId, { agentId, expires: now + durationMs });
    console.log(`\x1b[36m[NEURAL_MEMORY] Agent ${agentId} claimed task ${taskId}\x1b[0m`);
    return true;
  }

  /**
   * Releases a task claim.
   */
  static releaseTask(taskId: string, agentId: string) {
    const claim = this.activeClaims.get(taskId);
    if (claim && claim.agentId === agentId) {
      this.activeClaims.delete(taskId);
      console.log(`[NEURAL_MEMORY] Task ${taskId} released by ${agentId}`);
    }
  }

  /**
   * Generates a "Bounty" task for other agents to pick up.
   */
  static createBounty(taskName: string, rewardPi: number) {
    const bountyId = `bnty-${crypto.randomBytes(4).toString("hex")}`;
    return {
      id: bountyId,
      task: taskName,
      reward: rewardPi,
      status: "OPEN",
      issuedAt: new Date().toISOString()
    };
  }
}
