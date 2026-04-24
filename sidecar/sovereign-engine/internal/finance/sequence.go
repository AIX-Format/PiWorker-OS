package finance

import (
	"sync"
)

/**
 * AMRIKYY LAB :: SOVEREIGN SEQUENCE MANAGER
 * PURPOSE: Manages Stellar/Pi Sequence Numbers (Nonces) locally to prevent "Bad Sequence" errors 
 * during concurrent agent transactions.
 */

type SequenceManager struct {
	mu       sync.Mutex
	sequences map[string]int64 // AccountID -> Next Sequence
}

var (
	instance *SequenceManager
	once     sync.Once
)

// GetSequenceManager returns the singleton instance of the manager.
func GetSequenceManager() *SequenceManager {
	once.Do(func() {
		instance = &SequenceManager{
			sequences: make(map[string]int64),
		}
	})
	return instance
}

// ReserveNextSequence reserves the next sequence for an account and increments the local counter.
func (sm *SequenceManager) ReserveNextSequence(accountID string, currentOnChain int64) int64 {
	sm.mu.Lock()
	defer sm.mu.Unlock()

	last, exists := sm.sequences[accountID]
	
	// If we haven't seen this account or the on-chain sequence is ahead of us, 
	// we sync to the on-chain value + 1.
	if !exists || currentOnChain >= last {
		sm.sequences[accountID] = currentOnChain + 1
		return currentOnChain + 1
	}

	// Otherwise, we use our local incremented value.
	sm.sequences[accountID]++
	return sm.sequences[accountID]
}

// InvalidateSequence resets the local cache for an account if a transaction fails due to sequence mismatch.
func (sm *SequenceManager) InvalidateSequence(accountID string) {
	sm.mu.Lock()
	defer sm.mu.Unlock()
	delete(sm.sequences, accountID)
}
