import crypto from "node:crypto";

/**
 * Amrikyy Treasury Vault
 * The central financial authority of PiWorker-OS.
 * Manages the national wealth (175 Pi) and sovereign tax.
 */
export class AmrikyyTreasury {
  private static NATIONAL_RESERVE = 175.0; // Initial sovereign fund
  private static SOVEREIGN_TAX_RATE = 0.10; // 10% tax for Amrikyy Lab operations

  /**
   * Processes an agent's task profit and applies the sovereign tax.
   */
  static processInflow(agentId: string, grossProfit: number) {
    const taxAmount = grossProfit * this.SOVEREIGN_TAX_RATE;
    const netProfit = grossProfit - taxAmount;
    
    this.NATIONAL_RESERVE += taxAmount;

    return {
      txId: `tx-tax-${crypto.randomBytes(4).toString("hex")}`,
      agentId,
      grossProfit,
      taxAmount,
      netToAgent: netProfit,
      newNationalReserve: this.NATIONAL_RESERVE,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Returns the current state of the national wealth.
   */
  static getStats() {
    return {
      reserve: this.NATIONAL_RESERVE,
      taxRate: this.SOVEREIGN_TAX_RATE,
      currency: "Pi",
      status: "STABLE"
    };
  }
}
