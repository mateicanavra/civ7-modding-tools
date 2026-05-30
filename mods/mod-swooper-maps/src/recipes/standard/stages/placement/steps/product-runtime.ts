function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Runs one placement product effect under the shared placement trace/error
 * policy.
 *
 * Product steps own the actual engine mutations now; this helper is deliberately
 * stage-local so those steps share the same abort semantics without importing
 * from the final summary step or reintroducing a placement monolith.
 */
export function runPlacementProductStep<T>(
  stepId: string,
  emit: (payload: Record<string, unknown>) => void,
  fn: () => T
): T {
  try {
    return fn();
  } catch (error) {
    const message = toErrorMessage(error);
    emit({ type: `${stepId}.error`, error: message });
    throw new Error(`[SWOOPER_MOD] Aborting placement: ${stepId} failed (${message}).`);
  }
}
