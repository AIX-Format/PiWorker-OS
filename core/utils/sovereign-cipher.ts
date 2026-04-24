import crypto from 'node:crypto';

/**
 * AMRIKYY LAB :: SOVEREIGN CIPHER (AES-256-GCM)
 * TS Implementation for Next.js Orchestrator.
 */

export class SovereignCipher {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly IV_LENGTH = 12; // Standard for GCM
  private static readonly AUTH_TAG_LENGTH = 16;

  /**
   * Encrypts a payload for secure transmission to the Go Engine.
   */
  public static encrypt(plaintext: string, secret: string): string {
    const key = Buffer.alloc(32);
    key.write(secret);

    const iv = crypto.randomBytes(this.IV_LENGTH);
    const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    const authTag = cipher.getAuthTag();

    // Protocol: [IV(12b)][AuthTag(16b)][Ciphertext]
    return Buffer.concat([
      iv,
      authTag,
      Buffer.from(encrypted, 'base64')
    ]).toString('base64');
  }

  /**
   * Decrypts a payload received from the Go Engine.
   */
  public static decrypt(encodedPayload: string, secret: string): string {
    const key = Buffer.alloc(32);
    key.write(secret);

    const data = Buffer.from(encodedPayload, 'base64');

    const iv = data.slice(0, this.IV_LENGTH);
    const authTag = data.slice(this.IV_LENGTH, this.IV_LENGTH + this.AUTH_TAG_LENGTH);
    const ciphertext = data.slice(this.IV_LENGTH + this.AUTH_TAG_LENGTH);

    const decipher = crypto.createDecipheriv(this.ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(ciphertext, undefined, 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
