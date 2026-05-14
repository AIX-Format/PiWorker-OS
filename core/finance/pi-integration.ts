import "server-only";
import { IDurableJournal, TreasuryStorageFactory } from './treasury-storage';
import { PiPaymentService, PiPayment } from '@axiom/pi';

export class PiIntegrationService {
  private static instance: PiIntegrationService;
  private paymentService: PiPaymentService;
  private journal: IDurableJournal;

  private constructor() {
    const apiKey = process.env.PI_API_KEY || '';
    this.paymentService = new PiPaymentService(apiKey);
    this.journal = TreasuryStorageFactory.getJournal();
  }

  public static getInstance(): PiIntegrationService {
    if (!PiIntegrationService.instance) {
      PiIntegrationService.instance = new PiIntegrationService();
    }
    return PiIntegrationService.instance;
  }

  /**
   * Approves a payment on the Pi Platform.
   */
  async approvePayment(paymentId: string): Promise<boolean> {
    const success = await this.paymentService.approvePayment(paymentId);
    if (success) {
      await this.journal.append('pi_payments', { paymentId, action: 'approved', ts: new Date() });
    }
    return success;
  }

  /**
   * Completes a payment on the Pi Platform after blockchain confirmation.
   */
  async completePayment(paymentId: string, txid: string): Promise<boolean> {
    const success = await this.paymentService.completePayment(paymentId, txid);
    if (success) {
      await this.journal.append('pi_payments', { paymentId, txid, action: 'completed', ts: new Date() });
      console.log(`[PI] Payment ${paymentId} completed. TXID: ${txid}`);
    }
    return success;
  }

  /**
   * Mock for fetching the user's KYC status and balance
   */
  async getSovereignBalance(): Promise<{ balance: number; kyc: boolean }> {
    return {
      balance: 177.0,
      kyc: true
    };
  }
}
