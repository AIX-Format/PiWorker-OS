package handler

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	pb "github.com/Moeabdelaziz007/PiWorker-OS/sidecar/sovereign-engine/pkg/pb"
	"github.com/Moeabdelaziz007/PiWorker-OS/sidecar/sovereign-engine/pkg/server"
	"google.golang.org/grpc/metadata"
)

var srv *server.SovereignServer

func init() {
	var err error
	srv, err = server.NewSovereignServer(nil)
	if err != nil {
		log.Printf("❌ [Bridge] Failed to init Sovereign Server: %v", err)
	}
}

type bridgeLog struct {
	Timestamp     string `json:"timestamp"`
	Component     string `json:"component"`
	Operation     string `json:"operation"`
	AuthContext   string `json:"auth_context"`
	RequestID     string `json:"request_id"`
	CorrelationID string `json:"correlation_id"`
	ErrorCode     string `json:"error_code,omitempty"`
	Message       string `json:"message,omitempty"`
}

func emitBridgeLog(op, auth, reqID, corrID, message, errorCode string) {
	line, _ := json.Marshal(bridgeLog{
		Timestamp:     time.Now().UTC().Format(time.RFC3339Nano),
		Component:     "API_BRIDGE",
		Operation:     op,
		AuthContext:   auth,
		RequestID:     reqID,
		CorrelationID: corrID,
		ErrorCode:     errorCode,
		Message:       message,
	})
	log.Println(string(line))
}

func requestContext(r *http.Request) (context.Context, string, string, string) {
	requestID := r.Header.Get("X-Request-Id")
	if requestID == "" {
		requestID = fmt.Sprintf("http-%d", time.Now().UnixNano())
	}
	correlationID := r.Header.Get("X-Correlation-Id")
	if correlationID == "" {
		correlationID = requestID
	}
	auth := "ANONYMOUS"
	if r.Header.Get("X-Sovereign-Token") != "" {
		auth = "SOVEREIGN_TOKEN"
	}

	md := metadata.Pairs(
		"x-request-id", requestID,
		"x-correlation-id", correlationID,
		"x-sovereign-token", r.Header.Get("X-Sovereign-Token"),
	)

	ctx := metadata.NewIncomingContext(r.Context(), md)
	return ctx, requestID, correlationID, auth
}

func Handler(w http.ResponseWriter, r *http.Request) {
	ctx, requestID, correlationID, authContext := requestContext(r)
	w.Header().Set("X-Request-Id", requestID)
	w.Header().Set("X-Correlation-Id", correlationID)

	emitBridgeLog("router", authContext, requestID, correlationID, fmt.Sprintf("received %s %s", r.Method, r.URL.Path), "")

	path := r.URL.Path
	switch {
	case strings.HasSuffix(path, "/execute"):
		handleExecute(w, r.WithContext(ctx), requestID, correlationID, authContext)
	case strings.HasSuffix(path, "/simulate"):
		handleSimulate(w, r.WithContext(ctx), requestID, correlationID, authContext)
	default:
		emitBridgeLog("router", authContext, requestID, correlationID, "endpoint not found", "VALIDATION")
		w.WriteHeader(http.StatusNotFound)
		fmt.Fprintf(w, "Endpoint not found")
	}
}

func handleExecute(w http.ResponseWriter, r *http.Request, reqID, corrID, auth string) {
	var req pb.PluginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		emitBridgeLog("execute", auth, reqID, corrID, err.Error(), "VALIDATION")
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	res, err := srv.ExecutePlugin(r.Context(), &req)
	if err != nil {
		emitBridgeLog("execute", auth, reqID, corrID, err.Error(), "BUILD")
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(res)
}

func handleSimulate(w http.ResponseWriter, r *http.Request, reqID, corrID, auth string) {
	var req pb.SimulationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		emitBridgeLog("simulate", auth, reqID, corrID, err.Error(), "VALIDATION")
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	res, err := srv.RequestSimulation(r.Context(), &req)
	if err != nil {
		emitBridgeLog("simulate", auth, reqID, corrID, err.Error(), "DEPENDENCY")
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(res)
}
