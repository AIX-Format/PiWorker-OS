/**
 * AMRIKYY LAB :: SOVEREIGN FINANCE
 * Pi Network Authentication Kernel
 */

export interface PiUser {
  uid: string;
  username: string;
  accessToken: string;
}

/**
 * Initiates the sovereign wallet authentication flow.
 * Scopes: payments, username
 */
export async function authenticateSovereignWallet(): Promise<PiUser> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !(window as any).Pi) {
      reject(new Error("Pi SDK not loaded. Ensure you are in the Pi Browser or Sandbox."));
      return;
    }

    const Pi = (window as any).Pi;

    Pi.authenticate(['payments', 'username'], onIncompletePaymentFound)
      .then((auth: any) => {
        // AMRIKYY_SECURITY: We return the user data for in-memory processing.
        // DO NOT store the accessToken in plain text.
        resolve({
          uid: auth.user.uid,
          username: auth.user.username,
          accessToken: auth.accessToken
        });
      })
      .catch((err: any) => {
        console.error("[PI_AUTH] Sovereign Failure:", err);
        reject(err);
      });
  });
}

/**
 * Handle incomplete payments to ensure financial integrity.
 */
function onIncompletePaymentFound(payment: any) {
  console.warn("[PI_FINANCE] Incomplete payment detected for tx:", payment.identifier);
  // Future implementation: Resolve via backend check.
}
