import 'server-only';
import {
  SimulationRequestContract,
  SimulationResponseContract,
  EscrowRequestContract,
  EscrowResponseContract,
  VerifyTxRequestContract,
  VerifyTxResponseContract,
  PaymentRequestContract,
  PaymentResponseContract,
  EmbodiedIntentContract,
  IntentResponseContract,
  PluginRequestContract,
  PluginResponseContract,
  MemoryInsightContract,
  MemoryResponseContract,
  MemoryQueryContract,
  MemoryListContract,
  VortexRequestContract,
  VortexResponseContract,
  toProtoSimulationRequest,
  toProtoEscrowRequest,
  toProtoVerifyTxRequest,
  toProtoPaymentRequest,
  toProtoEmbodiedIntent,
  toProtoPluginRequest,
  toProtoStoreMemory,
  toProtoMemoryQuery,
  toProtoVortexRequest,
} from '../contracts/critical-contracts';

/**
 * SovereignClient - High-Performance, Zero-Dependency RPC Client
 * Logic: Implements the Connect-RPC (Lite) protocol using native fetch.
 * Pattern: Decoupled Brain-Muscle Communication.
 */

export class SovereignClient {
  private readonly baseUrl: string;
  private readonly authToken: string;

  constructor() {
    this.baseUrl = process.env.SOVEREIGN_ENGINE_URL || 'http://127.0.0.1:8080';
    this.authToken = process.env.SOVEREIGN_AUTH_TOKEN || 'SOVEREIGN_DEV_TOKEN';
  }

  /**
   * Universal RPC call handler.
   */
  private async call<TReq, TRes>(method: string, request: TReq): Promise<TRes> {
    const url = `${this.baseUrl}/sovereign.SovereignService/${method}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-sovereign-token': this.authToken,
        },
        body: JSON.stringify(request),
        // Important for Vercel/Edge: Ensure timeout is handled
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `[SOVEREIGN_RPC_ERROR] ${response.status} ${response.statusText}: ${errorText}`
        );
      }

      return (await response.json()) as TRes;
    } catch (err: any) {
      if (err.name === 'TimeoutError') {
        throw new Error(`[SOVEREIGN_TIMEOUT] Brain-Muscle sync timed out at ${url}`);
      }
      throw err;
    }
  }

  // --- RPC Methods (Mirrored from sovereign.proto) ---

  async requestSimulation(req: SimulationRequestContract) {
    return this.call<any, SimulationResponseContract>(
      'RequestSimulation',
      toProtoSimulationRequest(req)
    );
  }

  async lockEscrow(req: EscrowRequestContract) {
    return this.call<any, EscrowResponseContract>('LockEscrow', toProtoEscrowRequest(req));
  }

  async verifyTransaction(req: VerifyTxRequestContract) {
    return this.call<any, VerifyTxResponseContract>(
      'VerifyTransaction',
      toProtoVerifyTxRequest(req)
    );
  }

  async commitPayment(req: PaymentRequestContract) {
    return this.call<any, PaymentResponseContract>('CommitPayment', toProtoPaymentRequest(req));
  }

  async sendEmbodiedIntent(req: EmbodiedIntentContract) {
    return this.call<any, IntentResponseContract>('SendEmbodiedIntent', toProtoEmbodiedIntent(req));
  }

  async executePlugin(req: PluginRequestContract) {
    return this.call<any, PluginResponseContract>('ExecutePlugin', toProtoPluginRequest(req));
  }

  async storeMemory(req: MemoryInsightContract) {
    return this.call<any, MemoryResponseContract>('StoreMemory', toProtoStoreMemory(req));
  }

  async queryMemory(req: MemoryQueryContract) {
    return this.call<any, MemoryListContract>('QueryMemory', toProtoMemoryQuery(req));
  }

  async evaluateVortex(req: VortexRequestContract) {
    return this.call<any, VortexResponseContract>('EvaluateVortex', toProtoVortexRequest(req));
  }

  async approvePiPayment(paymentId: string) {
    return this.call<any, any>('ApprovePiPayment', { paymentId });
  }

  async completePiPayment(paymentId: string, txid: string) {
    return this.call<any, any>('CompletePiPayment', { paymentId, txid });
  }

  async getTreasury() {
    return this.call<any, any>('GetTreasury', {});
  }
}

// Singleton instance for global use
export const sovereignClient = new SovereignClient();
