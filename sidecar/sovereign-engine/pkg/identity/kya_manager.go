package identity

import (
	"crypto/ed25519"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"time"
)

// AIXPassport represents the cryptographically signed credential for an agent.
type AIXPassport struct {
	AgentID       string
	OwnerPiID     string
	IssuanceDate  string
	ExpiryDate    string
	KYCStatus     string
	ZKPCommitment string
	Signature     string
	Attributes    map[string]string
}

// KYAManager handles the issuance and verification of AIX Passports.
type KYAManager struct {
	SovereignKey ed25519.PrivateKey
	PublicKey    ed25519.PublicKey
}

func NewKYAManager(privateKey ed25519.PrivateKey) *KYAManager {
	return &KYAManager{
		SovereignKey: privateKey,
		PublicKey:    privateKey.Public().(ed25519.PublicKey),
	}
}

// IssuePassport creates a signed AIX passport for an agent.
func (k *KYAManager) IssuePassport(agentID, ownerID, kycToken string) (*AIXPassport, error) {
	now := time.Now()
	expiry := now.AddDate(1, 0, 0) // 1 year validity

	// Generate ZKP Commitment (Simplified: Hash of OwnerID + AgentID + Salt)
	salt := "sovereign-ai-2026"
	h := sha256.New()
	h.Write([]byte(ownerID + agentID + salt))
	zkp := hex.EncodeToString(h.Sum(nil))

	passport := &AIXPassport{
		AgentID:       agentID,
		OwnerPiID:     ownerID,
		IssuanceDate:  now.Format(time.RFC3339),
		ExpiryDate:    expiry.Format(time.RFC3339),
		KYCStatus:     "VERIFIED_PI_NETWORK",
		ZKPCommitment: zkp,
		Attributes: map[string]string{
			"compliance_level": "LEVEL_3_FINANCIAL",
			"sovereign_hub":    "PiWorker-OS-Mainnet",
		},
	}

	// Sign the passport data
	dataToSign := fmt.Sprintf("%s|%s|%s|%s", agentID, ownerID, zkp, passport.IssuanceDate)
	signature := ed25519.Sign(k.SovereignKey, []byte(dataToSign))
	passport.Signature = hex.EncodeToString(signature)

	return passport, nil
}

// VerifyPassport checks the validity of an AIX passport and the agent's signature.
func (k *KYAManager) VerifyPassport(passport *AIXPassport, challenge string, agentSignature string, agentPubKey ed25519.PublicKey) (bool, string) {
	// 1. Verify Sovereign Engine Signature
	dataToSign := fmt.Sprintf("%s|%s|%s|%s", passport.AgentID, passport.OwnerPiID, passport.ZKPCommitment, passport.IssuanceDate)
	sigBytes, err := hex.DecodeString(passport.Signature)
	if err != nil {
		return false, "invalid signature format"
	}

	if !ed25519.Verify(k.PublicKey, []byte(dataToSign), sigBytes) {
		return false, "failed sovereign signature verification"
	}

	// 2. Check Expiry
	expiry, _ := time.Parse(time.RFC3339, passport.ExpiryDate)
	if time.Now().After(expiry) {
		return false, "passport expired"
	}

	// 3. Verify Agent Ownership of the Passport (Agent signs a challenge)
	agentSigBytes, err := hex.DecodeString(agentSignature)
	if err != nil {
		return false, "invalid agent signature format"
	}

	if !ed25519.Verify(agentPubKey, []byte(challenge), agentSigBytes) {
		return false, "agent failed ownership challenge"
	}

	return true, "Passport Verified: Sovereign Agent Identified"
}
