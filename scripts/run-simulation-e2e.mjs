#!/usr/bin/env node
/**
 * Simulation lane runner.
 *
 * Runs the in-process harness in `tests/e2e/sovereign-critical-path.e2e.test.mjs`.
 * This is NOT a real end-to-end test against a deployed environment; it
 * exists to lock down the bridge client's wire shape, retry policy, and
 * auth handling against deterministic fixtures.
 *
 * For release readiness, use `npm run test:e2e:real` against a deployed
 * staging URL instead.
 */
import { spawn } from 'node:child_process';
import path from 'node:path';

const SIM_FILE = path.join('tests', 'e2e', 'sovereign-critical-path.e2e.test.mjs');

// Deterministic fixtures: keep parity with the in-file defaults so the harness
// works the same way whether the developer ran `npm run test:e2e:simulation`
// or invoked node --test by hand.
process.env.SOVEREIGN_AUTH_TOKEN = process.env.SOVEREIGN_AUTH_TOKEN || 'token-e2e-fixed';
process.env.AGENT_SYSTEM_SECRET = process.env.AGENT_SYSTEM_SECRET || 'agent-secret-e2e-fixed';
process.env.SOVEREIGN_ENGINE_URL = process.env.SOVEREIGN_ENGINE_URL || 'http://127.0.0.1:50051';

console.log('🧪 [test:e2e:simulation] Running in-process simulation harness');
console.log('    (deterministic fixtures; NOT a release-readiness signal)');
const child = spawn('node', ['--test', SIM_FILE], { stdio: 'inherit', env: process.env });
child.on('exit', (code) => process.exit(code ?? 1));
