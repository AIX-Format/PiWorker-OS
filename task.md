# Task: Aligning TypeScript Bridge with Sovereign Engine Schema

## Goal
Synchronize the TypeScript orchestrator (`core/engine/sovereign-bridge.ts`) with the hardened Go Sovereign Engine schema to ensure seamless cross-language communication for financial and simulation tasks.

## Memory Context
- **Searched Patterns:** `sovereign-bridge.ts`, `PaymentResponse`, `CommitPayment`.
- **Relevant Namespaces:** frontend (TypeScript), backend (Go), protocol (gRPC/Proto).

## Why now
The Go engine now supports real Soroban transaction invocation and an expanded `PaymentResponse` schema. The TypeScript bridge must be updated to leverage these features and avoid runtime type errors.

## Scope
- `core/engine/sovereign-bridge.ts`

## Out of scope
- Changing the internal logic of the Go engine.
- Modifying the UI components (unless required for data display).

## Risks / Ambiguities / Fragility
- **HTTP Fallback**: Ensure the `callViaHttp` method correctly handles the new endpoints on Vercel.
- **Type Safety**: TypeScript interfaces must strictly match the `protoLoader` generated types.

## Plan
1. [ ] Step 1: Add `PaymentRequest` and `PaymentResponse` interfaces.
2. [ ] Step 2: Implement `commitPayment` method in `SovereignBridge`.
3. [ ] Step 3: Implement `verifyTransaction` method in `SovereignBridge`.
4. [ ] Step 4: Verify alignment via TypeScript type checking.
5. [ ] Step 5: Update `openmemory.md` with the synchronized schema details.

## Verification
- [x] 2x `search-memory` calls executed before coding
- [ ] typecheck (`npx tsc --noEmit`)
- [ ] targeted test (Simulation of bridge call)
- [ ] 1x `add-memory` call executed (with Git metadata)

## Done when
- `SovereignBridge` has methods for all gRPC services defined in `sovereign.proto`.
- `PaymentResponse` includes the `errorMessage` field.

## Commit format
`feat(bridge): align typescript interfaces and methods with sovereign schema`
