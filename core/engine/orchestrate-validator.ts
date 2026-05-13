/**
 * Validation logic for orchestration requests.
 * Separated from the route handler to allow for unit testing in isolation.
 */
export function validateOrchestrateRequest(body: any) {
  if (!body || !body.intent || typeof body.intent !== 'string' || body.intent.trim() === '') {
    return {
      isValid: false,
      error: 'Intent is required.',
    };
  }
  return {
    isValid: true,
    data: {
      intent: body.intent,
      budget: body.budget,
    },
  };
}
