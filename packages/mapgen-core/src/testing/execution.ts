import {
  beginMapContextExecutionInternal,
  finishMapContextExecutionInternal,
  type MapContext,
} from "@mapgen/core/map-context.js";

function isThenable(value: unknown): value is PromiseLike<unknown> {
  return (
    (typeof value === "object" || typeof value === "function") &&
    value !== null &&
    "then" in value &&
    typeof value.then === "function"
  );
}

type SynchronousAction<Action extends () => unknown> = Action &
  (Extract<ReturnType<Action>, PromiseLike<unknown>> extends never ? unknown : never);

/**
 * Runs one synchronous test action inside the same one-shot MapContext lifecycle used by the
 * production executor.
 *
 * Use this only for focused step and artifact tests that intentionally bypass a compiled recipe.
 * The context always becomes terminal, including when the action throws, so tests cannot reuse a
 * context or leave an unclosed execution behind.
 */
export function withMapContextExecutionForTest<Action extends () => unknown>(
  context: MapContext,
  action: SynchronousAction<Action>
): ReturnType<Action> {
  beginMapContextExecutionInternal(context);
  try {
    const result = action();
    if (isThenable(result)) {
      void result.then(undefined, () => undefined);
      throw new Error("MapContext test executions must be synchronous.");
    }
    return result as ReturnType<Action>;
  } finally {
    finishMapContextExecutionInternal(context);
  }
}
