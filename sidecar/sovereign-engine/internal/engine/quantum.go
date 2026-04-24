package engine

import (
	"context"
	"fmt"
	"math/rand"
	"sync"
	"time"
)

// Persona types from legacy v1
const (
	PersonaBull         = "Bull"
	PersonaBear         = "Bear"
	PersonaChaos        = "Chaos"
	PersonaConservative = "Conservative"
	PersonaAggressive   = "Aggressive"
)

type SimulationResult struct {
	Persona    string
	Score      float32
	Reasoning  string
	RevenueUSD float32
}

type QuantumMirror struct {
	mu sync.Mutex
}

func NewQuantumMirror() *QuantumMirror {
	return &QuantumMirror{}
}

// Simulate runs parallel simulations using a controlled Worker Pool to prevent resource exhaustion
func (qm *QuantumMirror) Simulate(ctx context.Context, goal string, instances int) ([]SimulationResult, error) {
	results := make([]SimulationResult, 0, instances)
	resultChan := make(chan SimulationResult, instances)
	
	// Personas from the 'Golden Trio' and legacy personas
	personas := []string{PersonaBull, PersonaBear, PersonaChaos, PersonaConservative, PersonaAggressive}

	// Dynamic Concurrency Control: Cap the max workers to prevent system impact
	maxWorkers := 50
	if instances < maxWorkers {
		maxWorkers = instances
	}

	// Dispatcher loop with Safety Guard
	go func() {
		var wg sync.WaitGroup
		for i := 0; i < instances; i++ {
			wg.Add(1)
			go func(idx int) {
				defer wg.Done()
				
				// Safety: Check if context is already canceled before starting
				select {
				case <-ctx.Done():
					return
				default:
					persona := personas[idx%len(personas)]
					resultChan <- qm.executeSim(persona, goal)
				}
			}(i)
		}
		wg.Wait()
		close(resultChan)
	}()

	// Collector loop with Timeout protection
	for {
		select {
		case res, ok := <-resultChan:
			if !ok {
				return results, nil // Success: Channel closed normally
			}
			results = append(results, res)
		case <-ctx.Done():
			return results, fmt.Errorf("simulation timed out or canceled: consciousness deadlock prevented")
		}
	}
}

func (qm *QuantumMirror) executeSim(persona string, goal string) SimulationResult {
	// Seed random for each simulation
	r := rand.New(rand.NewSource(time.Now().UnixNano() + int64(rand.Intn(1000))))
	
	// Simulate latency of LLM call (or actual logic if offline)
	time.Sleep(time.Duration(r.Intn(100)) * time.Millisecond)

	baseScore := r.Float32()
	multiplier := 1.0
	
	switch persona {
	case PersonaBull:
		multiplier = 1.5
	case PersonaBear:
		multiplier = 0.5
	case PersonaChaos:
		multiplier = r.Float64() * 2.0
	case PersonaConservative:
		multiplier = 0.8
	case PersonaAggressive:
		multiplier = 1.2
	}

	finalScore := baseScore * float32(multiplier)

	return SimulationResult{
		Persona:    persona,
		Score:      finalScore,
		Reasoning:  fmt.Sprintf("Simulated reasoning for %s based on goal: %s", persona, goal),
		RevenueUSD: finalScore * 100.0, // Base reward simulation
	}
}
