import "server-only";
import { Agent, AgentDNA } from "../types/agent";
import { PiAdapter } from "../finance/pi-adapter";
import { ROITracker } from "../evolution/roi-tracker";

/**
 * PiWorker-OS ProfitVortex
 * Financial Lifeblood & Budget Cannibalism Logic (Digital Darwinism)
 */

export class ROICollapseException extends Error {
  constructor(public agentId: string, public currentRoi: number) {
    super(`[Profit Vortex] انهيار مالي حاد للوكيل ${agentId}: العائد ${currentRoi.toFixed(2)} أقل من حد البقاء.`);
    this.name = "ROICollapseException";
  }
}

export interface FinancialHealth {
  isSolvent: boolean;
  cannibalizedAmount: number;
  remainingBudget: number;
  actionTaken: "none" | "warn" | "cannibalize" | "terminate" | "awakening";
  updatedDNA?: AgentDNA;
}

export class ProfitVortex {
  private sovereignTreasury: number = 0;

  /**
   * تقييم العائد الفعلي وتنفيذ "أكل الميزانية" أو "المكافأة السيادية"
   * Logic: Digital Darwinism & Economic Cannibalism
   */
  public async evaluatePerformance(
    agent: Agent,
    actualRoi: number,
    currentBudget: number
  ): Promise<FinancialHealth> {
    const minRequirement = agent.governance.minRoiRequirement;
    
    // 1. Digital Darwinism: Evolution through performance
    const updatedDNA = ROITracker.trackAndEvolve(agent, actualRoi >= minRequirement, actualRoi);

    console.log(`[ProfitVortex] Agent ${agent.id} | Actual ROI: ${actualRoi} | Generation: ${updatedDNA.generation}`);

    // 2. 10x Sovereign Awakening
    if (actualRoi >= 10.0) {
      console.log(`\x1b[35m[ProfitVortex] 👑 SOVEREIGN AWAKENING: Agent ${agent.id} achieved 10x!\x1b[0m`);
      // Tax exemption and grant reward
      const rewardAmount = currentBudget * 2; // Double the original budget as a grant
      if (agent.walletAddress) {
        await PiAdapter.getInstance().transferRewards(agent.walletAddress, rewardAmount);
      }
      return { 
        isSolvent: true, 
        cannibalizedAmount: 0, 
        remainingBudget: currentBudget + rewardAmount, 
        actionTaken: "awakening",
        updatedDNA
      };
    }

    // 3. Economic Cannibalism Check
    const severity = (minRequirement - actualRoi) / minRequirement;
    if (actualRoi < minRequirement) {
      // Trigger Cannibalism if ROI is below requirement
      return {
        ...this.executeCannibalism(agent, actualRoi, currentBudget, severity),
        updatedDNA
      };
    }

    // 4. Standard Profit Distribution
    const profit = currentBudget * (actualRoi - 1);
    if (profit > 0) {
      const taxAmount = profit * 0.1; // 10% Sovereign Tax for the Treasury
      const rewardAmount = profit - taxAmount;
      this.sovereignTreasury += taxAmount;
      
      if (agent.walletAddress) {
        await PiAdapter.getInstance().transferRewards(agent.walletAddress, rewardAmount);
      }
    }

    return {
      isSolvent: true,
      cannibalizedAmount: 0,
      remainingBudget: currentBudget,
      actionTaken: "none",
      updatedDNA
    };
  }

  private executeCannibalism(
    agent: Agent,
    actualRoi: number,
    currentBudget: number,
    severity: number
  ): Omit<FinancialHealth, "updatedDNA"> {
    // إذا كان الانهيار المالي كارثياً (> 50% من المتطلب)
    if (severity > 0.5) {
      console.error(`\x1b[31m[PROFIT_VORTEX] 💀 CANNIBALISM: Agent ${agent.id} budget confiscated to Treasury.\x1b[0m`);
      this.sovereignTreasury += currentBudget;
      return {
        isSolvent: false,
        cannibalizedAmount: currentBudget,
        remainingBudget: 0,
        actionTaken: "terminate"
      };
    }

    // أكل ميزانية جزئي (Partial Rejection)
    const cannibalizedAmount = currentBudget * severity;
    this.sovereignTreasury += cannibalizedAmount;

    console.warn(`[PROFIT_VORTEX] ⚠️ Partial Cannibalism for ${agent.id}: ${cannibalizedAmount.toFixed(4)} Pi reclaimed.`);

    return {
      isSolvent: true,
      cannibalizedAmount,
      remainingBudget: currentBudget - cannibalizedAmount,
      actionTaken: "cannibalize",
    };
  }

  public getTreasuryBalance(): number {
    return this.sovereignTreasury;
  }
}
