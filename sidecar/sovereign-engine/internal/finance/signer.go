package finance

import (
	"crypto/ed25519"
	"fmt"
)

/**
 * AMRIKYY LAB :: ISOLATED SIGNER (RING 5)
 * PURPOSE: Performs cryptographic signing of transactions in an isolated unit.
 * Private keys should only exist within this scope.
 */

type IsolatedSigner struct {
	publicKey  ed25519.PublicKey
	privateKey ed25519.PrivateKey
}

// NewIsolatedSigner creates a new signer from a raw seed.
// In production, this seed should be loaded from an air-gapped vault or secure ENV.
func NewIsolatedSigner(seed []byte) (*IsolatedSigner, error) {
	if len(seed) != ed25519.SeedSize {
		return nil, fmt.Errorf("invalid seed size: expected %d bytes", ed25519.SeedSize)
	}

	priv := ed25519.NewKeyFromSeed(seed)
	pub := priv.Public().(ed25519.PublicKey)

	return &IsolatedSigner{
		publicKey:  pub,
		privateKey: priv,
	}, nil
}

// SignTransaction signs the raw transaction payload.
// It does not know about the internet or the node URL.
func (s *IsolatedSigner) SignTransaction(payload []byte) []byte {
	// 🛡️ [Steel Gate] Cold-signing implementation
	return ed25519.Sign(s.privateKey, payload)
}

// GetPublicKey returns the public key for account verification.
func (s *IsolatedSigner) GetPublicKey() ed25519.PublicKey {
	return s.publicKey
}
