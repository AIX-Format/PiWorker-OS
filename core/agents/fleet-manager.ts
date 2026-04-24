import { AgentInstance, AgentSpecialization } from "./agent-spawner";
import { PersistenceEngine } from "../brain/persistence-engine";

class FleetManager {
  private fleet: Map<string, AgentInstance> = new Map();

  /**
   * Registers an agent and synchronizes state to disk.
   */
  async register(agent: AgentInstance) {
    this.fleet.set(agent.agentId, agent);
    console.log(`[FLEET_MANAGER] Tracking Agent: ${agent.agentId} (${agent.specialization})`);
    await this.syncToDisk();
  }

  /**
   * Updates an agent's status and syncs.
   */
  async updateStatus(agentId: string, status: "READY" | "BUSY" | "OFFLINE") {
    const agent = this.fleet.get(agentId);
    if (agent) {
      agent.status = status;
      await this.syncToDisk();
    }
  }

  private async syncToDisk() {
    await PersistenceEngine.saveFleetState(Array.from(this.fleet.values()));
  }

  /**
   * Loads the fleet state from disk during initialization.
   */
  async initialize() {
    console.log("[FLEET_MANAGER] Initializing Sovereign Fleet...");
    // Future: Load from PersistenceEngine.loadFleetState();
  }

  /**
   * Retrieves the healthiest agent for a specific specialization.
   */
  findExecutor(specialization: AgentSpecialization): AgentInstance | null {
    for (const agent of this.fleet.values()) {
      if (agent.specialization === specialization && agent.status === "READY") {
        return agent;
      }
    }
    return null;
  }

  /**
   * Returns current fleet metrics.
   */
  getMetrics() {
    const total = this.fleet.size;
    const active = Array.from(this.fleet.values()).filter(a => a.status === "BUSY").length;
    const ready = total - active;
    
    return { total, active, ready };
  }

  getAllAgents() {
    return Array.from(this.fleet.values());
  }
}

export const fleetManager = new FleetManager();
