package handler

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	pb "github.com/Moeabdelaziz007/PiWorker-OS/sidecar/sovereign-engine/pkg/pb"
	"github.com/Moeabdelaziz007/PiWorker-OS/sidecar/sovereign-engine/pkg/server"
)

const devAuthTokenFallback = "SOVEREIGN_DEV_TOKEN"

var (
	srv               *server.SovereignServer
	expectedAuthToken string
)

func init() {
	var err error
	srv, err = server.NewSovereignServer(nil) // Context will be passed per request
	if err != nil {
		log.Printf("❌ [Bridge] Failed to init Sovereign Server: %v", err)
	}

	expectedAuthToken, err = resolveAuthToken()
	if err != nil {
		log.Fatalf("❌ [Bridge] auth configuration error: %v", err)
	}
}

func isDevEnvironment() bool {
	env := strings.ToLower(strings.TrimSpace(os.Getenv("APP_ENV")))
	if env == "" {
		env = strings.ToLower(strings.TrimSpace(os.Getenv("NODE_ENV")))
	}

	switch env {
	case "", "dev", "development", "local", "test":
		return true
	default:
		return false
	}
}

func resolveAuthToken() (string, error) {
	if token := strings.TrimSpace(os.Getenv("SOVEREIGN_AUTH_TOKEN")); token != "" {
		return token, nil
	}

	if isDevEnvironment() {
		log.Printf("⚠️ [Bridge] SOVEREIGN_AUTH_TOKEN not set; using development fallback token")
		return devAuthTokenFallback, nil
	}

	return "", errors.New("SOVEREIGN_AUTH_TOKEN is required outside development")
}

// Handler is the entry point for Vercel Go Serverless Functions.
func Handler(w http.ResponseWriter, r *http.Request) {
	// 🛡️ [Steel Gate] Application-layer security
	token := strings.TrimSpace(r.Header.Get("X-Sovereign-Token"))
	if token == "" || token != expectedAuthToken {
		http.Error(w, "Unauthenticated", http.StatusUnauthorized)
		return
	}

	path := r.URL.Path
	log.Printf("📡 [Bridge] Received %s request to %s", r.Method, path)

	switch {
	case strings.HasSuffix(path, "/execute"):
		handleExecute(w, r)
	case strings.HasSuffix(path, "/simulate"):
		handleSimulate(w, r)
	default:
		w.WriteHeader(http.StatusNotFound)
		fmt.Fprintf(w, "Endpoint not found")
	}
}

func handleExecute(w http.ResponseWriter, r *http.Request) {
	var req pb.PluginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	res, err := srv.ExecutePlugin(r.Context(), &req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(res)
}

func handleSimulate(w http.ResponseWriter, r *http.Request) {
	var req pb.SimulationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	res, err := srv.RequestSimulation(r.Context(), &req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(res)
}
