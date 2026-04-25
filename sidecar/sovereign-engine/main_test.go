package main

import (
	"context"
	"testing"

	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"
)

func TestResolveSovereignAuthTokenFailsOutsideDev(t *testing.T) {
	t.Setenv("SOVEREIGN_AUTH_TOKEN", "")
	t.Setenv("APP_ENV", "production")
	t.Setenv("GO_ENV", "production")
	t.Setenv("NODE_ENV", "production")

	_, err := resolveSovereignAuthToken()
	if err == nil {
		t.Fatalf("expected missing token error")
	}
}

func TestResolveSovereignAuthTokenUsesFallbackInDev(t *testing.T) {
	t.Setenv("SOVEREIGN_AUTH_TOKEN", "")
	t.Setenv("APP_ENV", "development")

	token, err := resolveSovereignAuthToken()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if token != devSovereignTokenFallback {
		t.Fatalf("expected fallback token %q, got %q", devSovereignTokenFallback, token)
	}
}

func TestAuthUnaryInterceptorRejectsMissingToken(t *testing.T) {
	sovereignAuthToken = "expected-token"
	ctx := metadata.NewIncomingContext(context.Background(), metadata.MD{})

	_, err := authUnaryInterceptor(ctx, nil, &grpc.UnaryServerInfo{FullMethod: "/sovereign.Service/Foo"},
		func(ctx context.Context, req interface{}) (interface{}, error) {
			t.Fatalf("handler should not be called")
			return nil, nil
		})
	if err == nil {
		t.Fatalf("expected unauthenticated error")
	}
	st, _ := status.FromError(err)
	if st.Code() != codes.Unauthenticated {
		t.Fatalf("expected code %s, got %s", codes.Unauthenticated, st.Code())
	}
}

func TestAuthUnaryInterceptorRejectsInvalidToken(t *testing.T) {
	sovereignAuthToken = "expected-token"
	ctx := metadata.NewIncomingContext(context.Background(), metadata.Pairs("x-sovereign-token", "invalid-token"))

	_, err := authUnaryInterceptor(ctx, nil, &grpc.UnaryServerInfo{FullMethod: "/sovereign.Service/Foo"},
		func(ctx context.Context, req interface{}) (interface{}, error) {
			t.Fatalf("handler should not be called")
			return nil, nil
		})
	if err == nil {
		t.Fatalf("expected unauthenticated error")
	}
	st, _ := status.FromError(err)
	if st.Code() != codes.Unauthenticated {
		t.Fatalf("expected code %s, got %s", codes.Unauthenticated, st.Code())
	}
}

func TestAuthUnaryInterceptorAllowsValidToken(t *testing.T) {
	sovereignAuthToken = "expected-token"
	ctx := metadata.NewIncomingContext(context.Background(), metadata.Pairs("x-sovereign-token", "expected-token"))

	called := false
	_, err := authUnaryInterceptor(ctx, nil, &grpc.UnaryServerInfo{FullMethod: "/sovereign.Service/Foo"},
		func(ctx context.Context, req interface{}) (interface{}, error) {
			called = true
			return "ok", nil
		})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !called {
		t.Fatalf("expected handler to be called")
	}
}
