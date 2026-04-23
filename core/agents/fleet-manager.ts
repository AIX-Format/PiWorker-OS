/**
 * MAS-ZERO FLEET MANAGER
 * Mission: Monitor, Load-Balance, and Orchestrate the Micro-SaaS Fleet.
 */

import { AgentInstance, AgentSpecialization } from "./agent-spawner";

class FleetManager {
  private fleet: Map<string, AgentInstance> = new Map();

  /**
   * Registers an agent into the active fleet tracking system.
   */
  register(agent: AgentInstance) {
    this.fleet.set(agent.agentId, agent);
    console.log(`[FLEET_MANAGER] Tracking Agent: ${agent.agentId} (${agent.specialization})`);
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
