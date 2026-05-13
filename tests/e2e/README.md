# Sovereign E2E Suites

There are two clearly separated lanes. Keep them separate; never use a green
simulation run as a release-readiness signal.

## Lane 1: Simulation (fast, local)

`tests/e2e/sovereign-critical-path.e2e.test.mjs`

- Stands up an **in-process HTTP gateway** via `withHttpGateway`.
- Uses deterministic fixtures (`token-e2e-fixed`, `agent-secret-e2e-fixed`,
  fixed plugin/goal/tx IDs).
- Locks down the bridge client's wire shape, retry policy
  (`withTransientRetry` on 408/429/5xx), and auth/error handling.
- **Does not** call the real Go sidecar, real Pi Horizon, real Soroban RPC,
  or any deployed URL.

Run it with:

```bash
npm run test:e2e:simulation
```

What a green run here proves: the TypeScript/Node bridge code talks to *some*
HTTP server using the expected request/response shape and retries correctly.
It does not prove that staging is healthy, that the Go sidecar is reachable,
or that real Pi/Soroban calls succeed.

## Lane 2: Real (slow, against staging)

`tests/e2e/real/sovereign-critical-path.real.e2e.test.mjs`

- Hits a real deployed Sovereign Engine over the network.
- No in-process gateway, no hardcoded "fixed" tokens.
- Skips cleanly (exit 0) when the required env is missing, with a loud notice.

Required env:

| Variable | Purpose |
|----------|---------|
| `SOVEREIGN_STAGING_URL` | Base URL of the deployed engine (e.g. `https://staging.piworker.example`). `SOVEREIGN_ENGINE_URL` is accepted as a fallback. |
| `SOVEREIGN_AUTH_TOKEN`  | Real bearer token for the `X-Sovereign-Token` header in staging. |
| `AGENT_SYSTEM_SECRET`   | HMAC secret used to sign plugin source for `/api/sovereign/execute`. |

Optional:

| Variable | Default | Purpose |
|----------|---------|---------|
| `REAL_E2E_TIMEOUT_MS` | `15000` | Per-request timeout. |
| `REAL_E2E_RETRIES`    | `2`     | Retries on 408/429/5xx only. |
| `REAL_E2E_AGENT_ID`   | `agent-real-e2e` | Agent id for payment/escrow. |
| `REAL_E2E_AMOUNT_PI`  | `0.0001` | Pi amount for escrow scenario; keep tiny. |

Run it with:

```bash
SOVEREIGN_STAGING_URL=https://staging.piworker.example \
SOVEREIGN_AUTH_TOKEN=... \
AGENT_SYSTEM_SECRET=... \
npm run test:e2e:real
```

Scenarios exercised (one node:test test each):

1. `health` &mdash; `GET /health`
2. `status` &mdash; `GET /api/status` (must report ONLINE/OPERATIONAL)
3. `execute` &mdash; `POST /api/sovereign/execute` with a real HMAC signature
4. `simulate` &mdash; `POST /api/sovereign/simulate`
5. `lock-escrow` &mdash; `POST /api/sovereign/lock-escrow`
6. `events` &mdash; `GET /events` SSE reachability probe

Each scenario records `duration_ms`, `status`, `attempts`, and `outcome`.

## Artifacts and baseline

After every real-lane run, two files are written under
`tests/e2e/artifacts/`:

- `real-run-<ISO>.json` (immutable history, one per run)
- `real-latest.json` (overwritten each run)

Aggregate the historical artifacts into a single baseline with:

```bash
npm run test:e2e:baseline
```

This emits `tests/e2e/artifacts/baseline-metrics.json` containing per-scenario
p50/p95 duration, per-scenario success rate, and the top failing endpoint
across all recorded runs. Commit a `baseline-metrics.json` snapshot when you
declare a release candidate green so regressions are easy to spot.

## Recommended cadence

- **On PR**: `npm run test:e2e:simulation` (cheap, deterministic).
- **Nightly / pre-release**: `npm run test:e2e:real` against staging, then
  `npm run test:e2e:baseline`.
- **Do not** rely on `npm run test:tier4` as a quality gate; it is now a
  no-op that prints a deprecation notice.
