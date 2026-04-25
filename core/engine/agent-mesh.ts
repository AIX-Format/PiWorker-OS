import 'server-only';
import { Agent } from '../types/agent';
import { sovereignClient } from './sovereign-client';

export interface MeshMessage {
  from: string;
  to: string;
  payload: any;
  signature: string;
  timestamp: string;
}

/**
 * PiWorker-OS Neural Mesh
 * Pattern 8.1: Swarm Topology & Self-Healing
 */
export class AgentMesh {
  private static instance: AgentMesh;
  private nodes: Map<string, Agent> = new Map();
  private edges: Map<string, Set<string>> = new Map();

  private constructor() {}

  public static getInstance(): AgentMesh {
    if (!this.instance) {
      this.instance = new AgentMesh();
    }
    return this.instance;
  }

  public registerNode(agent: Agent) {
    this.nodes.set(agent.id, agent);
    if (!this.edges.has(agent.id)) {
      this.edges.set(agent.id, new Set());
    }
  }

  public establishLink(agentAId: string, agentBId: string) {
    if (this.nodes.has(agentAId) && this.nodes.has(agentBId)) {
      this.edges.get(agentAId)?.add(agentBId);
      this.edges.get(agentBId)?.add(agentAId);
      console.log(`[Mesh:Link] ${agentAId} <-> ${agentBId}`);
    }
  }

  public async directDispatch(message: MeshMessage) {
    const target = this.nodes.get(message.to);
    if (!target) throw new Error('[Mesh:Error] Target not found.');

    // Real Execution: Trigger the Sovereign Muscle (Go engine)
    await sovereignClient.sendEmbodiedIntent({
      intentId: `swarm-${Date.now()}`,
      agentId: message.from,
      subtaskLanguage: message.payload.intent || 'SWARM_HANDSHAKE',
      executionMetadata: { context: JSON.stringify(message.payload) },
      controlMode: 'MESH_DIRECT',
      visualSubgoals: [],
    });

    return { status: 'received', target: message.to };
  }

  /**
   * Breadth-First Search for pathfinding across the mesh.
   */
  public findAlternativePath(startId: string, endId: string): string[] | null {
    const visited = new Set<string>();
    const queue: [string, string[]][] = [[startId, [startId]]];

    while (queue.length > 0) {
      const [current, path] = queue.shift()!;
      if (current === endId) return path;

      if (!visited.has(current)) {
        visited.add(current);
        const neighbors = this.edges.get(current) || new Set();
        for (const neighbor of neighbors) {
          queue.push([neighbor, [...path, neighbor]]);
        }
      }
    }
    return null;
  }
}

export const agentMesh = AgentMesh.getInstance();
