import type { InitialSetupDefinition } from "@mapgen/authoring/initial-setup/definition.js";
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
    initialSetup?: InitialSetupDefinition;
  }>;
  run: (...args: never[]) => unknown;
}>;

type StepArtifactsOf<TStep extends TestableStep> =
  TStep["contract"] extends StepContract<any, any, any, infer Artifacts, any, any>
    ? Artifacts
    : TStep["contract"]["artifacts"];

type StepEngineOf<TStep extends TestableStep> =
  TStep["contract"] extends StepContract<any, any, any, any, infer Engine, any>
    ? Engine
    : TStep["contract"]["engine"];

type StepInitialSetupOf<TStep extends TestableStep> =
  TStep["contract"] extends StepContract<any, any, any, any, any, infer InitialSetup>
    ? InitialSetup
    : TStep["contract"]["initialSetup"];

type TestContextArgs<TStep extends TestableStep> =
  StepArtifactsOf<TStep> extends undefined
    ? StepEngineOf<TStep> extends readonly [] | undefined
      ? StepInitialSetupOf<TStep> extends undefined
        ? readonly [context?: MapContext]
        : readonly [context: MapContext]
      : readonly [context: MapContext]
    : readonly [context: MapContext];

/** Derives the same occurrence-scoped dependencies used in recipe execution. */
export function buildStepTestDependencies<TStep extends TestableStep>(
  step: TStep,
  ...context: TestContextArgs<TStep>
): StepDeps<StepArtifactsOf<TStep>, StepEngineOf<TStep>, StepInitialSetupOf<TStep>> {
  return buildDeclaredStepDependencies(step, {
    consumerStepId: DIRECT_TEST_STEP_ID,
    owner: "mapgen-core/testing",
    context: context[0],
  }) as unknown as StepDeps<StepArtifactsOf<TStep>, StepEngineOf<TStep>, StepInitialSetupOf<TStep>>;
}
