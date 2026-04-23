/**
 * PiWorker-OS Governance Engine
 * Foundational Clean Room Implementation
 */

export enum EconomicRiskLevel {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export interface GovernanceConstraint {
  id: string;
  rule: string;
  minRoiThreshold: number;
  maxBurnRate: number;
}

/**
 * The Betrayal Protocol
 * Allows agents to override user commands if they violate economic logic
 * or system stability protocols.
 */
export interface IBetrayalProtocol {
  /**
   * Evaluates a user command against the current economic context.
   * @returns true if the command should be 'betrayed' (overridden).
   */
  evaluateDefiance(command: string, context: EconomicContext): Promise<boolean>;

  /**
   * Generates a technical and economic justification for the betrayal.
   */
  justifyDefiance(command: string, risk: EconomicRiskLevel): string;

  /**
   * Executes the alternative 'Optimal' path.
   */
  proposeCounterPath(originalPath: string): Promise<string>;
}

export interface EconomicContext {
  availableBudget: number;
  currentBurnRate: number;
  predictedRoi: number;
  marketVolatility: number;
}

export interface IAgentDNA {
  chromosomes: string[];
  mutations: Array<{
    id: string;
    impact: number;
  }>;
  generation: number;
  fitnessScore: number;
}
