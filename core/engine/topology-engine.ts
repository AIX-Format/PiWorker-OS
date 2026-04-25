import "server-only";
import { Agent } from "../types/agent";

/**
 * PiWorker-OS Topology Engine
 * Pattern 8: Topological Invariance & Manifold Orchestration
 * Purpose: Defines the spatial-logical relationship between agents, tasks, and robots.
 */

export interface TopologicalPoint {
  x: number;
  y: number;
  z: number;
  dimension: string;
}

export interface AdjacencyMatrix {
  [agentId: string]: {
    neighbors: string[];
    weight: number; // Trust/Efficiency bond
  };
}

export class TopologyEngine {
  private static instance: TopologyEngine;
  private manifold: Map<string, TopologicalPoint> = new Map();

  private constructor() {}

  public static getInstance(): TopologyEngine {
    if (!this.instance) {
      this.instance = new TopologyEngine();
    }
    return this.instance;
  }

  /**
   * Projects an agent into the Cognitive Manifold.
   * Logic: Uses DNA traits to calculate spatial coordinates.
   */
  public projectAgent(agent: Agent): TopologicalPoint {
    const dna = agent.dna;
    const point: TopologicalPoint = {
      x: dna.cognition,
      y: dna.greed,
      z: dna.riskAppetite,
      dimension: agent.role
    };
    
    this.manifold.set(agent.id, point);
    return point;
  }

  /**
   * Calculates the 'Topological Distance' between two sovereign entities.
   * Lower distance = Higher potential for seamless collaboration.
   */
  public calculateDistance(agentAId: string, agentBId: string): number {
    const pA = this.manifold.get(agentAId);
    const pB = this.manifold.get(agentBId);

    if (!pA || !pB) return Infinity;

    // Euclidean distance in 3D DNA space
    return Math.sqrt(
      Math.pow(pA.x - pB.x, 2) +
      Math.pow(pA.y - pB.y, 2) +
      Math.pow(pA.z - pB.z, 2)
    );
  }

  /**
   * Finds 'Topological Holes' in the current system state.
   * A hole represents a missing capability or a financial inefficiency.
   */
  public detectHoles(agents: Agent[]): string[] {
    const capabilities = new Set(agents.flatMap(a => a.capabilities));
    const requiredCapabilities = ["FINANCIAL_EXECUTION", "NEURAL_REASONING", "PHYSICAL_BRIDGE"];
    
    return requiredCapabilities.filter(c => !capabilities.has(c));
  }
}

export const topologyEngine = TopologyEngine.getInstance();
