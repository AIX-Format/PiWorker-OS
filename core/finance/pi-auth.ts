/**
 * MAS-ZERO FINANCE CORE: Sovereign Wallet Authentication
 * Clean Room Protocol: Encapsulated logic for Pi Network Sovereign Authentication.
 */

export interface SovereignAuthResult {
  accessToken: string;
  user: {
    uid: string;
    username: string;
  };
}

/**
 * Authenticates the Sovereign Wallet via Pi SDK.
 * Handles graceful degradation if not inside Pi Browser.
 */
export async function authenticateSovereignWallet(): Promise<SovereignAuthResult | null> {
  if (typeof window === "undefined" || !window.Pi) {
    console.warn("MAS-ZERO: Pi SDK not found. Authentication aborted.");
    return null;
  }

  try {
    const scopes = ["payments", "username"];
    
    // onIncompletePaymentFound is required for Pi SDK v2
    const onIncompletePaymentFound = (payment: any) => {
      console.warn("MAS-ZERO: Incomplete payment found:", payment);
    };

    const auth = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
    
    console.log("MAS-ZERO: Sovereign Wallet Authenticated Success");
    
    // Security Protocol: Access tokens are handled in memory.
    // Encrypting or passing to Sidecar would happen here or in the caller.
    
    return {
      accessToken: auth.accessToken,
      user: {
        uid: auth.user.uid,
        username: auth.user.username,
      },
    };
  } catch (error: any) {
    console.error("MAS-ZERO: Pi Authentication Failed", error);
    return null;
  }
}
