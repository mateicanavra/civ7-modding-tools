import {
  beginMapContextExecutionInternal,
  enterMapContextStepInternal,
  finishMapContextExecutionInternal,
  leaveMapContextStepInternal,
  type MapContext,
} from "@mapgen/core/map-context.js";
import { classifyThenable, containThenable } from "@mapgen/lib/async/thenable.js";
import type { StepTrace } from "@mapgen/trace/index.js";
import { DIRECT_TEST_STEP_ID } from "./authority.js";

const TEST_STEP_TRACE: StepTrace = Object.freeze({ event: () => undefined });

type TestAction = (context: MapContext) => unknown;

type SynchronousAction<Action extends TestAction> = Action &
  (Extract<ReturnType<Action>, PromiseLike<unknown>> extends never ? unknown : never);

/**
 * Runs one synchronous test action through the same root-to-step capability transition used by the
 * production executor.
 *
 * Use this only for focused step and artifact tests that intentionally bypass a compiled recipe.
 * The action receives a revocable step context; the root remains observation-only. Both the step
 * capability and root execution become terminal when the action returns or throws.
 */
export function withMapContextExecutionForTest<Action extends TestAction>(
  context: MapContext,
  action: SynchronousAction<Action>
): ReturnType<Action> {
  beginMapContextExecutionInternal(context);
  try {
    const stepContext = enterMapContextStepInternal(context, DIRECT_TEST_STEP_ID, TEST_STEP_TRACE);
    try {
      const result = action(stepContext);
      const completion = classifyThenable(result);
      if (completion.kind !== "none") {
        containThenable(completion);
        throw new Error("MapContext test executions must be synchronous.");
      }
      return result as ReturnType<Action>;
    } finally {
      leaveMapContextStepInternal(context, stepContext);
    }
  } finally {
    finishMapContextExecutionInternal(context);
  }
}
