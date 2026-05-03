import test from 'node:test';
import assert from 'node:assert/strict';
import { StructuredError, mapUnknownError } from '../core/utils/observability.ts';

test('StructuredError - correctly stores properties', () => {
  const error = new StructuredError('VALIDATION', 'Intent is required.', 400);
  assert.strictEqual(error.category, 'VALIDATION');
  assert.strictEqual(error.message, 'Intent is required.');
  assert.strictEqual(error.status, 400);
});

test('StructuredError - generates correct response body', () => {
  const error = new StructuredError('VALIDATION', 'Intent is required.', 400);
  const context = {
    requestId: 'req-1',
    correlationId: 'corr-1',
    authContext: 'ANONYMOUS'
  };
  const body = error.toResponseBody(context);
  assert.strictEqual(body.success, false);
  assert.strictEqual(body.category, 'VALIDATION');
  assert.strictEqual(body.requestId, 'req-1');
});

test('mapUnknownError - handles StructuredError', () => {
  const original = new StructuredError('VALIDATION', 'test', 400);
  const mapped = mapUnknownError(original);
  assert.strictEqual(mapped, original);
});

test('mapUnknownError - handles generic Error', () => {
  const original = new Error('some error');
  const mapped = mapUnknownError(original);
  assert.strictEqual(mapped.category, 'DEPENDENCY');
  assert.strictEqual(mapped.status, 500);
  assert.strictEqual(mapped.message, 'some error');
});
