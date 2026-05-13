#!/usr/bin/env node
/**
 * Real E2E lane runner.
 *
 * - When SOVEREIGN_STAGING_URL is set, runs the real lane against staging.
 * - When it is unset, exits 0 with a clear "skipped" message so local
 *   developers and PR CI are not blocked, but the absence is loud.
 *
 * The simulation lane is run separately by `npm run test:e2e:simulation`
 * and must never be used as a release-readiness signal.
 */
import { spawn } from 'node:child_process';
import path from 'node:path';

const REAL_FILE = path.join('tests', 'e2e', 'real', 'sovereign-critical-path.real.e2e.test.mjs');

const stagingUrl = (process.env.SOVEREIGN_STAGING_URL || process.env.SOVEREIGN_ENGINE_URL || '').trim();
const authToken = (process.env.SOVEREIGN_AUTH_TOKEN || '').trim();
const agentSecret = (process.env.AGENT_SYSTEM_SECRET || '').trim();

if (!stagingUrl || !authToken || !agentSecret) {
  console.log('⏭️  [test:e2e:real] Skipped: real lane requires');
  console.log('    - SOVEREIGN_STAGING_URL (or SOVEREIGN_ENGINE_URL)');
  console.log('    - SOVEREIGN_AUTH_TOKEN');
  console.log('    - AGENT_SYSTEM_SECRET');
  console.log('    Set these and rerun to exercise the real lane.');
  console.log('    NOTE: the simulation lane (test:e2e:simulation) is NOT a substitute.');
  process.exit(0);
}

console.log(`🛰️  [test:e2e:real] Running real lane against ${stagingUrl}`);
const child = spawn('node', ['--test', REAL_FILE], { stdio: 'inherit', env: process.env });
child.on('exit', (code) => process.exit(code ?? 1));
