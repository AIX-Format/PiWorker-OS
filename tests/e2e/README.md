# Critical E2E Scenarios

This suite stabilizes the highest-priority sovereign flows with deterministic fixtures and explicit environment contracts.

## Scenarios

1. Sandbox plugin execution (happy path + invalid token)
2. Simulation request flow (gRPC available + HTTP fallback)
3. Payment/escrow critical path
4. Health/status endpoints and recovery behavior

## Determinism

All tests use fixed IDs and payloads from `DETERMINISTIC` constants in `sovereign-critical-path.e2e.test.mjs`.

## Real-environment prerequisites

`npm run test:e2e:real` (and `npm run test:tier4`) now run a real e2e runner that fails fast if required environment variables are missing.

Set **all** of the following before running:

- `SOVEREIGN_BASE_URL`: Base URL for sovereign HTTP APIs (for example `https://sovereign.example.com`)
- `SOVEREIGN_ENGINE_URL`: Base URL/endpoint for sovereign engine calls
- `SIDECAR_ENDPOINT`: Sidecar service endpoint used by the real stack
- `SOVEREIGN_AUTH_TOKEN`: Auth token sent to sovereign endpoints
- `AGENT_SYSTEM_SECRET`: Agent system secret used in secured flows

Example:

```bash
export SOVEREIGN_BASE_URL="https://sovereign.example.com"
export SOVEREIGN_ENGINE_URL="https://engine.example.com"
export SIDECAR_ENDPOINT="https://sidecar.example.com"
export SOVEREIGN_AUTH_TOKEN="<token>"
export AGENT_SYSTEM_SECRET="<secret>"
npm run test:e2e:real
```

## Commands

- `npm run test:e2e:real`: Runs real e2e tests in `tests/e2e/` via Node's test runner.
- `npm run test:tier4`: Alias to the same real e2e runner for CI tiered checks.

## Retry policy

Retries are allowed only through `withTransientRetry`, which retries network/transient failures only:

- statuses: `408`, `429`, `500`, `502`, `503`, `504`
- network codes: `ECONNRESET`, `ECONNREFUSED`, `ENOTFOUND`, `ETIMEDOUT`

Invalid-token/auth failures are intentionally **not retried**.

## Artifacts

Each scenario writes a JSON artifact under `tests/e2e/artifacts/` containing:

- deterministic data snapshot
- event timeline
- scenario start/end timestamps
