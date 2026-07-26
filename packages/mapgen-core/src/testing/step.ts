import type {
  StepArtifactsDeclAny,
  StepContract,
  StepEngineDecl,
} from "@mapgen/authoring/step/contract.js";
import { buildDeclaredStepDependencies } from "@mapgen/authoring/step/dependencies.js";
import type { StepDeps } from "@mapgen/authoring/step/types.js";
import type { MapContext } from "@mapgen/core/map-context.js";
import { DIRECT_TEST_STEP_ID } from "./authority.js";

type TestableStep = Readonly<{
  contract: Readonly<{
    id: string;
    artifacts?: StepArtifactsDeclAny;
    engine?: StepEngineDecl;
  }>;
  run: (...args: never[]) => unknown;
}>;

type StepArtifactsOf<TStep extends TestableStep> =
  TStep["contract"] extends StepContract<any, any, any, infer Artifacts, any>
    ? Artifacts
    : TStep["contract"]["artifacts"];

type StepEngineOf<TStep extends TestableStep> =
  TStep["contract"] extends StepContract<any, any, any, any, infer Engine>
    ? Engine
    : TStep["contract"]["engine"];

type TestContextArgs<TStep extends TestableStep> =
  StepEngineOf<TStep> extends readonly [] | undefined
    ? readonly [context?: MapContext]
    : readonly [context: MapContext];

/** Derives the same occurrence-scoped artifact and engine capabilities used in recipe execution. */
export function buildStepTestDependencies<TStep extends TestableStep>(
  step: TStep,
  ...context: TestContextArgs<TStep>
): StepDeps<StepArtifactsOf<TStep>, StepEngineOf<TStep>> {
  return buildDeclaredStepDependencies(step, {
    consumerStepId: DIRECT_TEST_STEP_ID,
    owner: "mapgen-core/testing",
    context: context[0],
  }) as StepDeps<StepArtifactsOf<TStep>, StepEngineOf<TStep>>;
}
