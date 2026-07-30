import { assertStepInitialSetupContextInternal } from "@mapgen/authoring/step/context.js";
import type { StepContext } from "@mapgen/authoring/step/types.js";
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
import type { StepInitialSetupOf, TestableStep } from "./step.js";

const TEST_STEP_TRACE: StepTrace = Object.freeze({ event: () => undefined });

type TestAction = (context: MapContext) => unknown;

type SynchronousAction<Action extends (...args: never[]) => unknown> = Action &
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
  return runTestExecution(context, false, action);
}

function runTestExecution<Action extends TestAction>(
  context: MapContext,
  projectsInitialSetup: boolean,
  action: SynchronousAction<Action>
): ReturnType<Action> {
  beginMapContextExecutionInternal(context);
  try {
    const stepContext = enterMapContextStepInternal(
      context,
      DIRECT_TEST_STEP_ID,
      TEST_STEP_TRACE,
      projectsInitialSetup
    );
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

type StepTestAction<TStep extends TestableStep> = (
  context: StepContext<StepInitialSetupOf<TStep>>
) => unknown;

/**
 * Runs one direct step test with the same exact initial-setup context selected by its contract.
 * The helper proves the existing admitted binding; it does not parse or construct setup state.
 */
export function withStepExecutionForTest<
  TStep extends TestableStep,
  Action extends StepTestAction<TStep>,
>(context: MapContext, step: TStep, action: SynchronousAction<Action>): ReturnType<Action>;
export function withStepExecutionForTest(
  context: MapContext,
  step: TestableStep,
  action: TestAction
): unknown {
  return runTestExecution(context, step.contract.initialSetup !== undefined, (stepContext) => {
    if (step.contract.initialSetup !== undefined) {
      assertStepInitialSetupContextInternal(stepContext, step.contract.initialSetup);
    }
    return action(stepContext);
  });
}
