package pi402

import (
	"crypto/ed25519"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
)

/**
 * AMRIKYY LAB :: PI-402 SUB-WALLET DERIVATION
 * PURPOSE: Derive agent-specific session keys from a master KYC'd seed.
 */

type AgentSubWallet struct {
	AgentID    string
	PublicKey  ed25519.PublicKey
	privateKey ed25519.PrivateKey
}

// DeriveAgentKey generates a deterministic Ed25519 key for a specific agent.
func DeriveAgentKey(masterSeed []byte, agentID string) (*AgentSubWallet, error) {
	if len(masterSeed) < 32 {
		return nil, fmt.Errorf("master seed too short: need at least 32 bytes")
	}

	// 🔐 [Sovereign Derivation] Use HMAC-SHA256 to derive a child seed
	h := hmac.New(sha256.New, masterSeed)
	h.Write([]byte("pi-402-session-key:"))
	h.Write([]byte(agentID))
	childSeed := h.Sum(nil)

	// ed25519.NewKeyFromSeed expects exactly 32 bytes
	priv := ed25519.NewKeyFromSeed(childSeed[:32])
	pub := priv.Public().(ed25519.PublicKey)

	return &AgentSubWallet{
		AgentID:    agentID,
		PublicKey:  pub,
		privateKey: priv,
	}, nil
}

// Sign signs a message using the agent's private session key.
func (sw *AgentSubWallet) Sign(message []byte) []byte {
	return ed25519.Sign(sw.privateKey, message)
}

// GetAddress returns a hex representation of the public key (or a Stellar address format)
func (sw *AgentSubWallet) GetAddress() string {
	return hex.EncodeToString(sw.PublicKey)
}
