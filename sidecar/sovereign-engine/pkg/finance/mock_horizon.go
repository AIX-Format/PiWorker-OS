package finance

import (
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"time"
)

/**
 * AMRIKYY LAB :: MOCK HORIZON SERVER
 * PURPOSE: Mimics the Pi Network (Stellar) Horizon API for local development.
 * Allows testing agent financial logic offline without Docker.
 */

type MockHorizon struct {
	Port string
}

func NewMockHorizon(port string) *MockHorizon {
	return &MockHorizon{Port: port}
}

func (m *MockHorizon) Start() {
	mux := http.NewServeMux()

	// 👤 Mock Account Endpoint
	mux.HandleFunc("/accounts/", func(w http.ResponseWriter, r *http.Request) {
		accountID := r.URL.Path[len("/accounts/"):]
		log.Printf("🔍 [MockHorizon] Querying Account: %s", accountID)
		
		// ⏱️ Simulate Network Latency (500ms - 2500ms)
		latency := 500 + rand.Intn(2000)
		time.Sleep(time.Duration(latency) * time.Millisecond)

		response := map[string]interface{}{
			"id": accountID,
			"balances": []map[string]string{
				{"asset_type": "native", "balance": "125840.4200000"},
			},
			"sequence": "123456789",
		}
		json.NewEncoder(w).Encode(response)
	})

	// 💸 Mock Transaction Submission
	mux.HandleFunc("/transactions", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
			return
		}
		log.Printf("💸 [MockHorizon] Receiving Transaction Submission...")
		
		// ⏱️ Simulate Heavy Network Load (1000ms - 3000ms)
		latency := 1000 + rand.Intn(2000)
		time.Sleep(time.Duration(latency) * time.Millisecond)

		response := map[string]interface{}{
			"hash":   fmt.Sprintf("mock_hash_%d", time.Now().UnixNano()),
			"ledger": 99999,
			"result_xdr": "AAAAAAAAAGQAAAAAAAAAAQAAAAAAAAABAAAAAAAAAAA=",
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	})

	log.Printf("🧪 [MockHorizon] Pi Network Simulator online at :%s", m.Port)
	if err := http.ListenAndServe(":"+m.Port, mux); err != nil {
		log.Printf("❌ [MockHorizon] Failed: %v", err)
	}
}
