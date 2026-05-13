import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

const ARTIFACT_ROOT = path.join(process.cwd(), 'tests/e2e/artifacts');
const REQUIRED_ENV = [
  'SOVEREIGN_AUTH_TOKEN',
  'AGENT_SYSTEM_SECRET',
  'SOVEREIGN_ENGINE_URL',
  'SOVEREIGN_GATEWAY_URL',
  'E2E_EXPECTED_SYSTEM_STATUS',
  'E2E_EXPECTED_SYSTEM_REVISION'
];

const E2E_CONFIG = {
  goalId: process.env.E2E_GOAL_ID || 'goal-e2e-default',
  pluginId: process.env.E2E_PLUGIN_ID || 'plugin-e2e-default',
  paymentRecipientId: process.env.E2E_PAYMENT_RECIPIENT_ID || 'agent-e2e-default',
  escrowAgentId: process.env.E2E_ESCROW_AGENT_ID || 'agent-e2e-escrow-default',
  sourceCode: process.env.E2E_PLUGIN_SOURCE_CODE || 'export default async () => ({ ok: true });',
  requestTimeoutMs: Number(process.env.E2E_HTTP_TIMEOUT_MS || 10_000),
  retryMaxAttempts: Number(process.env.E2E_RETRY_MAX_ATTEMPTS || 4),
  retryBaseDelayMs: Number(process.env.E2E_RETRY_BASE_DELAY_MS || 250)
};

function assertObject(value, label) {
  assert.equal(typeof value, 'object', `${label} must be an object`);
  assert.notEqual(value, null, `${label} must not be null`);
}

function validateExecuteResponse(payload) {
  assertObject(payload, 'execute response');
  assert.equal(typeof payload.pluginId, 'string', 'execute response.pluginId must be string');
  assert.equal(typeof payload.success, 'boolean', 'execute response.success must be boolean');
  assert.equal(typeof payload.outputJson, 'string', 'execute response.outputJson must be string');
  assert.ok(Array.isArray(payload.logs), 'execute response.logs must be array');
}

function validateSimulationResponse(payload) {
  assertObject(payload, 'simulation response');
  for (const key of ['goalId', 'strategyRecommendation']) {
    assert.equal(typeof payload[key], 'string', `simulation response.${key} must be string`);
  }
  for (const key of ['predictedRoi', 'riskScore', 'estimatedRevenueUsd']) {
    assert.equal(typeof payload[key], 'number', `simulation response.${key} must be number`);
  }
  assertObject(payload.reasoning, 'simulation response.reasoning');
}

function validatePaymentResponse(payload) {
  assertObject(payload, 'payment response');
  assert.equal(payload.success, true, 'payment response.success must be true');
  assert.equal(typeof payload.txId, 'string', 'payment response.txId must be string');
  assert.equal(typeof payload.explorerUrl, 'string', 'payment response.explorerUrl must be string');
}

function validateEscrowResponse(payload) {
  assertObject(payload, 'escrow response');
  assert.equal(typeof payload.locked, 'boolean', 'escrow response.locked must be boolean');
}

function validateStatusResponse(payload) {
  assertObject(payload, 'status response');
  assert.equal(typeof payload.status, 'string', 'status response.status must be string');
  assert.equal(typeof payload.revision, 'string', 'status response.revision must be string');
}

function enforceEnvContract() {
  for (const key of REQUIRED_ENV) {
    assert.ok(process.env[key], `Missing required env var: ${key}`);
  }
}

function isTransientNetworkError(error) {
  const status = error?.status;
  return typeof status === 'number' && [408, 429, 500, 502, 503, 504].includes(status);
}

async function withTransientRetry(operation) {
  let attempt = 1;
  while (attempt <= E2E_CONFIG.retryMaxAttempts) {
    try {
      return await operation();
    } catch (error) {
      if (attempt >= E2E_CONFIG.retryMaxAttempts || !isTransientNetworkError(error)) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, E2E_CONFIG.retryBaseDelayMs * attempt));
      attempt += 1;
    }
  }
  throw new Error('retry loop exhausted unexpectedly');
}

function createBridgeClient(gatewayUrl) {
  const getAuthToken = () => process.env.SOVEREIGN_AUTH_TOKEN;

  async function requestJson(method, endpoint, data) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), E2E_CONFIG.requestTimeoutMs);

    try {
      const response = await fetch(`${gatewayUrl}${endpoint}`, {
        method,
        headers: {
          'X-Sovereign-Token': getAuthToken(),
          'Content-Type': 'application/json'
        },
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal
      });

      if (!response.ok) {
        const err = new Error(`HTTP ${response.status} for ${endpoint}`);
        err.status = response.status;
        err.body = await response.text();
        throw err;
      }

      return response.json();
    } catch (error) {
      if (error?.name === 'AbortError') {
        const timeoutError = new Error(`Request timeout after ${E2E_CONFIG.requestTimeoutMs}ms: ${endpoint}`);
        timeoutError.status = 408;
        throw timeoutError;
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  return {
    executePlugin(req) {
      return requestJson('POST', '/api/sovereign/execute', req);
    },
    requestSimulation(req) {
      return requestJson('POST', '/api/sovereign/simulate', req);
    },
    lockEscrow(agentId, amountPi) {
      const txId = process.env.E2E_ESCROW_TX_ID || `escrow-${Date.now()}`;
      return requestJson('POST', '/api/sovereign/lock-escrow', { txId, amountPi, targetWallet: agentId });
    },
    commitPayment(req) {
      return requestJson('POST', '/api/sovereign/payment', req);
    },
    getSystemStatus() {
      return requestJson('GET', '/api/status');
    }
  };
}

async function writeArtifact(fileName, payload) {
  await fs.mkdir(ARTIFACT_ROOT, { recursive: true });
  await fs.writeFile(path.join(ARTIFACT_ROOT, fileName), JSON.stringify(payload, null, 2), 'utf8');
}

test.beforeEach(() => {
  enforceEnvContract();
});

test('1) sandbox plugin execution against real gateway', async () => {
  const startedAt = new Date().toISOString();
  const bridge = createBridgeClient(process.env.SOVEREIGN_GATEWAY_URL);

  const happy = await withTransientRetry(() => bridge.executePlugin({
    pluginId: E2E_CONFIG.pluginId,
    sourceCode: E2E_CONFIG.sourceCode,
    envVars: { SAFE_MODE: 'true' },
    allowedCapabilities: ['math', 'json']
  }));

  validateExecuteResponse(happy);
  assert.equal(happy.success, true);

  await writeArtifact('01-sandbox-plugin.json', {
    scenario: 'sandbox_plugin_execution', startedAt, endedAt: new Date().toISOString(), config: E2E_CONFIG, result: happy
  });
});

test('2) simulation request flow against real gateway', async () => {
  const startedAt = new Date().toISOString();
  const bridge = createBridgeClient(process.env.SOVEREIGN_GATEWAY_URL);

  const simulation = await withTransientRetry(() =>
    bridge.requestSimulation({ goalId: E2E_CONFIG.goalId, parallelInstances: 3, modelVersion: 'gemini-1.5-pro' })
  );

  validateSimulationResponse(simulation);
  assert.equal(simulation.goalId, E2E_CONFIG.goalId);

  await writeArtifact('02-simulation-flow.json', {
    scenario: 'simulation_real_gateway', startedAt, endedAt: new Date().toISOString(), config: E2E_CONFIG, result: simulation
  });
});

test('3) payment/escrow critical path against real gateway', async () => {
  const startedAt = new Date().toISOString();
  const bridge = createBridgeClient(process.env.SOVEREIGN_GATEWAY_URL);

  const escrow = await withTransientRetry(() => bridge.lockEscrow(E2E_CONFIG.escrowAgentId, 7.5));
  validateEscrowResponse(escrow);
  assert.equal(escrow.locked, true);

  const payment = await withTransientRetry(() => bridge.commitPayment({
    recipientId: E2E_CONFIG.paymentRecipientId,
    amountPi: 7.5,
    agentAuthToken: process.env.AGENT_SYSTEM_SECRET,
    priority: 'HIGH'
  }));

  validatePaymentResponse(payment);

  await writeArtifact('03-payment-escrow.json', {
    scenario: 'payment_escrow_critical_path', startedAt, endedAt: new Date().toISOString(), config: E2E_CONFIG, escrow, payment
  });
});

test('4) health/status endpoint strict validation', async () => {
  const startedAt = new Date().toISOString();
  const bridge = createBridgeClient(process.env.SOVEREIGN_GATEWAY_URL);

  const status = await withTransientRetry(() => bridge.getSystemStatus());
  validateStatusResponse(status);
  assert.equal(status.status, process.env.E2E_EXPECTED_SYSTEM_STATUS);
  assert.equal(status.revision, process.env.E2E_EXPECTED_SYSTEM_REVISION);

  await writeArtifact('04-health-status-recovery.json', {
    scenario: 'health_status_strict_validation', startedAt, endedAt: new Date().toISOString(), status
  });
});
