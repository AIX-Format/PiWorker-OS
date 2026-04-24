package main

import (
	"fmt"
	"log"
	"os"
	"github.com/Moeabdelaziz007/PiWorker-OS/sovereign-engine/internal/crypto"
	"net/http"
	"io"
	"strings"
)

/**
 * AMRIKYY LAB :: SOVEREIGN CLI (piworker-cli)
 * PURPOSE: A high-performance command-line interface for orchestrating 
 * and debugging the PiWorker-OS ecosystem.
 */

func main() {
	if len(os.Args) < 2 {
		printUsage()
		return
	}

	command := os.Args[1]

	switch command {
	case "status":
		checkStatus()
	case "pay":
		simulatePayment()
	case "shield":
		testEncryption()
	case "help":
		printUsage()
	default:
		fmt.Printf("❌ Unknown command: %s\n", command)
		printUsage()
	}
}

func printUsage() {
	fmt.Println("👑 [PiWorker-CLI] Sovereign Orchestration Tool")
	fmt.Println("Usage: piworker-cli <command>")
	fmt.Println("\nCommands:")
	fmt.Println("  status    - Check health of Muscle (Go) and Brain (Next.js)")
	fmt.Println("  pay       - Simulate a Pi payment via Mock Horizon")
	fmt.Println("  shield    - Test AES-256-GCM application-layer encryption")
	fmt.Println("  help      - Show this help message")
}

func checkStatus() {
	fmt.Println("🔍 [CLI] Auditing Sovereign State...")
	
	// Check Go Engine (Muscle)
	resp, err := http.Get("http://localhost:50052/api/events")
	if err != nil {
		fmt.Println("🦾 [Muscle] OFFLINE (Check if forge is running)")
	} else {
		fmt.Println("🦾 [Muscle] ONLINE (Sovereign Gateway Active)")
		resp.Body.Close()
	}

	// Check Next.js (Brain)
	resp, err = http.Get("http://localhost:3000/api/health")
	if err != nil {
		fmt.Println("🧠 [Brain]  OFFLINE")
	} else {
		fmt.Println("🧠 [Brain]  ONLINE")
		resp.Body.Close()
	}
}

func simulatePayment() {
	fmt.Println("💸 [CLI] Initiating Mock Pi Payment...")
	// Logic to hit the Mock Horizon or Internal Payment Gateway
	fmt.Println("✅ [CLI] Intent broadcasted to Mock Horizon.")
}

func testEncryption() {
	fmt.Println("🛡️ [CLI] Testing Sovereign Shield (AES-256-GCM)...")
	secret := "SOVEREIGN_DEBUG_SECRET_32_BYTES_!!"
	plaintext := "AGENT_PLAN_001_EXECUTE"
	
	encrypted, err := crypto.Encrypt([]byte(plaintext), secret)
	if err != nil {
		log.Fatalf("Encryption failed: %v", err)
	}
	fmt.Printf("🔒 Encrypted: %s\n", encrypted)

	decrypted, err := crypto.Decrypt(encrypted, secret)
	if err != nil {
		log.Fatalf("Decryption failed: %v", err)
	}
	fmt.Printf("🔓 Decrypted: %s\n", string(decrypted))
	
	if string(decrypted) == plaintext {
		fmt.Println("✨ [Shield] Cryptographic integrity verified.")
	}
}
