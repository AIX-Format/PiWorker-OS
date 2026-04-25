package main

import (
	"context"
	"errors"
	"log"
	"net"
	"os"
	"strings"

	pb "github.com/Moeabdelaziz007/PiWorker-OS/sidecar/sovereign-engine/pkg/pb"
	"github.com/Moeabdelaziz007/PiWorker-OS/sidecar/sovereign-engine/pkg/server"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/reflection"
	"google.golang.org/grpc/status"
)

const devSovereignTokenFallback = "SOVEREIGN_DEV_TOKEN"

var sovereignAuthToken string

func isDevEnvironment() bool {
	env := strings.ToLower(strings.TrimSpace(os.Getenv("APP_ENV")))
	if env == "" {
		env = strings.ToLower(strings.TrimSpace(os.Getenv("GO_ENV")))
	}
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

func resolveSovereignAuthToken() (string, error) {
	if token := strings.TrimSpace(os.Getenv("SOVEREIGN_AUTH_TOKEN")); token != "" {
		return token, nil
	}
	if isDevEnvironment() {
		log.Printf("⚠️ [SEC_WARN] SOVEREIGN_AUTH_TOKEN is unset; using dev fallback token")
		return devSovereignTokenFallback, nil
	}
	return "", errors.New("SOVEREIGN_AUTH_TOKEN is required outside development")
}

func authUnaryInterceptor(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interface{}, error) {
	if strings.TrimSpace(sovereignAuthToken) == "" {
		return nil, status.Errorf(codes.Internal, "[SEC_ERROR] Server auth token is not configured")
	}

	md, ok := metadata.FromIncomingContext(ctx)
	if !ok {
		return nil, status.Errorf(codes.Unauthenticated, "Unauthenticated")
	}

	tokens := md["x-sovereign-token"]
	token := ""
	if len(tokens) > 0 {
		token = strings.TrimSpace(tokens[0])
	}
	if token == "" || token != sovereignAuthToken {
		log.Printf("⚠️ [SEC_ALERT] Unauthorized access attempt to %s", info.FullMethod)
		return nil, status.Errorf(codes.Unauthenticated, "Unauthenticated")
	}

	return handler(ctx, req)
}

func main() {
	ctx := context.Background()
	log.Println("🦾 Sovereign Engine Muscle starting...")

	token, err := resolveSovereignAuthToken()
	if err != nil {
		log.Fatalf("❌ [SEC_ERROR] %v", err)
	}
	sovereignAuthToken = token

	srv, err := server.NewSovereignServer(ctx)
	if err != nil {
		log.Fatalf("failed to init server: %v", err)
	}

	lis, err := net.Listen("tcp", ":50051")
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}

	s := grpc.NewServer(
		grpc.UnaryInterceptor(authUnaryInterceptor),
	)
	pb.RegisterSovereignServiceServer(s, srv)
	reflection.Register(s)

	log.Printf("📡 gRPC Server listening at %v", lis.Addr())
	if err := s.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}
