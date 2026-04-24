package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/exec"
	"os/signal"
	"sync"
	"syscall"
	"time"
)

/**
 * AMRIKYY LAB :: THE SOVEREIGN MAESTRO (dev.go)
 * PURPOSE: A high-fidelity, zero-trust process manager for local development.
 * It orchestrates Next.js, the Go Engine, and PocketBase as a "Parallel Environment".
 */

type Service struct {
	Name    string
	Command string
	Args    []string
	Dir     string
}

func main() {
	fmt.Println("🚀 [Maestro] Igniting Parallel Sovereign Environment...")

	services := []Service{
		{
			Name:    "BRAIN",
			Command: "npm",
			Args:    []string{"run", "dev"},
			Dir:     ".",
		},
		{
			Name:    "MUSCLE",
			Command: "go",
			Args:    []string{"run", "sidecar/sovereign-engine/main.go"},
			Dir:     ".",
		},
		{
			Name:    "DATA",
			Command: "pocketbase",
			Args:    []string{"serve"},
			Dir:     ".",
		},
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Handle OS Signals (Ctrl+C)
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		<-sigChan
		fmt.Println("\n🛑 [Maestro] Shutdown signal received. Terminating all services...")
		cancel()
	}()

	var wg sync.WaitGroup

	for _, s := range services {
		wg.Add(1)
		go func(svc Service) {
			defer wg.Done()
			for {
				select {
				case <-ctx.Done():
					return
				default:
					runService(ctx, svc)
					fmt.Printf("⚠️ [Maestro] %s service exited. Restarting in 2s...\n", svc.Name)
					time.Sleep(2 * time.Second)
				}
			}
		}(s)
	}

	wg.Wait()
	fmt.Println("✨ [Maestro] All services terminated. Sovereign state offline.")
}

func runService(ctx context.Context, svc Service) {
	fmt.Printf("⚡ [Maestro] Starting %s...\n", svc.Name)
	cmd := exec.CommandContext(ctx, svc.Command, svc.Args...)
	cmd.Dir = svc.Dir
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	// Set process group ID to ensure child processes are killed on exit
	cmd.SysProcAttr = &syscall.SysProcAttr{Setpgid: true}

	if err := cmd.Start(); err != nil {
		log.Printf("❌ [Maestro] Failed to start %s: %v", svc.Name, err)
		return
	}

	// Wait for process to finish
	err := cmd.Wait()
	if err != nil && ctx.Err() == nil {
		log.Printf("⚠️ [Maestro] %s exited with error: %v", svc.Name, err)
	}
}
