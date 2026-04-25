'use server';

import { SovereignBridge, BridgeCallContext } from '@/core/engine/sovereign-bridge';
import { 
  IntentBountyRequest, 
  ResolveBountyRequest, 
  BountyQuery,
  KYARequest,
  VerifyKYARequest
} from '@/core/contracts/critical-contracts';

/**
 * Server Actions for Sovereign Engine Operations
 * This bridges the Client Components to the 'server-only' SovereignBridge.
 */

export async function createIntentBountyAction(req: IntentBountyRequest) {
  try {
    return await SovereignBridge.createIntentBounty(req);
  } catch (error) {
    console.error('Failed to create intent bounty:', error);
    throw new Error('Sovereign Engine rejected bounty creation');
  }
}

export async function resolveIntentBountyAction(req: ResolveBountyRequest) {
  try {
    return await SovereignBridge.resolveIntentBounty(req);
  } catch (error) {
    console.error('Failed to resolve intent bounty:', error);
    throw new Error('Sovereign Engine rejected bounty resolution');
  }
}

export async function getActiveBountiesAction(req: BountyQuery) {
  try {
    return await SovereignBridge.getActiveBounties(req);
  } catch (error) {
    console.error('Failed to fetch bounties:', error);
    return { bounties: [] };
  }
}

export async function issueAIXPassportAction(req: KYARequest) {
  try {
    return await SovereignBridge.issueAIXPassport(req);
  } catch (error) {
    console.error('Failed to issue AIX passport:', error);
    throw new Error('Sovereign Identity Layer failed to issue passport');
  }
}

export async function verifyAIXPassportAction(req: VerifyKYARequest) {
  try {
    return await SovereignBridge.verifyAIXPassport(req);
  } catch (error) {
    console.error('Failed to verify AIX passport:', error);
    throw new Error('Sovereign Identity Layer failed verification');
  }
}
