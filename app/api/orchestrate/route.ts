import { NextResponse } from 'next/server';
import { MASOrchestrator } from '@/core/engine/mas-orchestrator';
import { validateOrchestrateRequest } from '@/core/engine/orchestrate-validator';
import {
  logStructured,
  mapUnknownError,
  resolveCorrelationContext,
  StructuredError,
  withCorrelationHeaders,
} from '@/core/utils/observability';

export async function POST(req: Request) {
  const context = resolveCorrelationContext(req.headers);

  try {
    const body = await req.json();
    const validation = validateOrchestrateRequest(body);

    if (!validation.isValid) {
      throw new StructuredError('VALIDATION', validation.error!, 400);
    }

    const { intent, budget } = validation.data!;

    logStructured({
      component: 'NEXT_API',
      operation: 'orchestrate_post',
      auth_context: context.authContext,
      request_id: context.requestId,
      correlation_id: context.correlationId,
      message: `Received intent with budget ${budget || 'Default'}`,
    });

    const orchestrator = new MASOrchestrator();
    const result = await orchestrator.orchestrateGoal(intent);

    return NextResponse.json({ success: true, data: { plan: result } }, withCorrelationHeaders(undefined, context));
  } catch (error: unknown) {
    const structured = mapUnknownError(error);

    logStructured({
      level: 'ERROR',
      component: 'NEXT_API',
      operation: 'orchestrate_post',
      auth_context: context.authContext,
      request_id: context.requestId,
      correlation_id: context.correlationId,
      error_code: structured.category,
      message: structured.message,
    });

    return NextResponse.json(structured.toResponseBody(context), withCorrelationHeaders({ status: structured.status }, context));
  }
}
