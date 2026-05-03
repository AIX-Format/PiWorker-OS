import test from 'node:test';
import assert from 'node:assert/strict';
import { validateOrchestrateRequest } from '../core/engine/orchestrate-validator.ts';

test('validateOrchestrateRequest - invalid cases', () => {
  const cases = [
    { body: {}, expectedError: 'Intent is required.' },
    { body: { intent: '' }, expectedError: 'Intent is required.' },
    { body: { intent: '   ' }, expectedError: 'Intent is required.' },
    { body: { budget: 100 }, expectedError: 'Intent is required.' },
    { body: null, expectedError: 'Intent is required.' },
  ];

  for (const c of cases) {
    const result = validateOrchestrateRequest(c.body);
    assert.strictEqual(result.isValid, false, `Expected invalid for ${JSON.stringify(c.body)}`);
    assert.strictEqual(result.error, c.expectedError);
  }
});

test('validateOrchestrateRequest - valid cases', () => {
  const body = { intent: 'Build a fleet', budget: 500 };
  const result = validateOrchestrateRequest(body);
  assert.strictEqual(result.isValid, true);
  assert.deepEqual(result.data, body);
});
