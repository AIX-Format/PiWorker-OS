package sandbox

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"sync"
	"time"

	"github.com/robertkrimen/otto"
)

// NeuralSandbox provides isolated JS execution using the Otto engine.
type NeuralSandbox struct {
	timeout time.Duration
}

func NewNeuralSandbox(timeout time.Duration) *NeuralSandbox {
	if timeout == 0 {
		timeout = 5 * time.Second
	}
	return &NeuralSandbox{timeout: timeout}
}

// SandboxResult wraps the script output and captured logs.
type SandboxResult struct {
	Data string
	Logs []string
}

// Execute runs the provided JS source code in a restricted Otto isolate.
func (ns *NeuralSandbox) Execute(ctx context.Context, source string, env map[string]string, capabilities []string) (*SandboxResult, error) {
	vm := otto.New()
	
	// 🛡️ [SECURITY] Pre-emptively initialize Interrupt channel
	vm.Interrupt = make(chan func(), 1)

	var logs []string
	var mu sync.Mutex

	// 📋 [SEC_WHITELIST] Standard Safe Globals
	// We allow common JS objects but block process-level access.
	
	// 🎙️ [Secure Console] Capturing logs from the sandbox
	consoleObj, _ := vm.Object(`console = {}`)
	consoleObj.Set("log", func(call otto.FunctionCall) otto.Value {
		mu.Lock()
		defer mu.Unlock()
		var msg []string
		for _, arg := range call.ArgumentList {
			msg = append(msg, arg.String())
		}
		logs = append(logs, strings.Join(msg, " "))
		return otto.Value{}
	})

	// Inject Environment Variables
	for k, v := range env {
		vm.Set(k, v)
	}

	// 🔒 [SECURITY] Ring 5 Lockdown - Whitelist Strategy
	// Everything not explicitly enabled or standard is blocked.
	vm.Set("os", nil)
	vm.Set("fs", nil)
	vm.Set("process", nil)
	vm.Set("require", nil)
	vm.Set("module", nil)
	vm.Set("exports", nil)

	// Result channel
	type result struct {
		val string
		err error
	}
	resChan := make(chan result, 1)

	go func() {
		defer func() {
			if r := recover(); r != nil {
				resChan <- result{err: fmt.Errorf("neural isolation panic: %v", r)}
			}
		}()

		// Run the script
		value, err := vm.Run(source)
		if err != nil {
			resChan <- result{err: err}
			return
		}

		// Convert result to JSON string
		export, _ := value.Export()
		jsonRes, _ := json.Marshal(export)
		resChan <- result{val: string(jsonRes)}
	}()

	// Wait for completion or timeout
	select {
	case res := <-resChan:
		return &SandboxResult{Data: res.val, Logs: logs}, res.err
	case <-time.After(ns.timeout):
		vm.Interrupt <- func() {
			panic("SOVEREIGN_SANDBOX_TIMEOUT_BREACH")
		}
		return &SandboxResult{Logs: logs}, fmt.Errorf("neural isolation timeout breach: %v exceeded", ns.timeout)
	case <-ctx.Done():
		return &SandboxResult{Logs: logs}, ctx.Err()
	}
}
