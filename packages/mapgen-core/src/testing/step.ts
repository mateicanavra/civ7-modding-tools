import type { Artifact } from "@mapgen/authoring/artifact/contract.js";
import type { InitialSetupDefinition } from "@mapgen/authoring/initial-setup/definition.js";
import type {
  StepContract,
  StepDependencyList,
  StepEngineDecl,
} from "@mapgen/authoring/step/contract.js";
import { buildDeclaredStepDependencies } from "@mapgen/authoring/step/dependencies.js";
import type { StepDeps } from "@mapgen/authoring/step/types.js";
import type { MapContext } from "@mapgen/core/map-context.js";
import { DIRECT_TEST_STEP_ID } from "./authority.js";

type TestableStep = Readonly<{
  contract: Readonly<{
    id: string;
    requires: StepDependencyList;
    provides: StepDependencyList;
    engine?: StepEngineDecl;
    initialSetup?: InitialSetupDefinition;
  }>;
  run: (...args: never[]) => unknown;
}>;

type StepRequiresOf<TStep extends TestableStep> =
  TStep["contract"] extends StepContract<any, any, any, infer Requires, any, any, any>
    ? Requires
    : TStep["contract"]["requires"];

type StepProvidesOf<TStep extends TestableStep> =
  TStep["contract"] extends StepContract<any, any, any, any, infer Provides, any, any>
    ? Provides
    : TStep["contract"]["provides"];

type StepEngineOf<TStep extends TestableStep> =
  TStep["contract"] extends StepContract<any, any, any, any, any, infer Engine, any>
    ? Engine
    : TStep["contract"]["engine"];

type StepInitialSetupOf<TStep extends TestableStep> =
  TStep["contract"] extends StepContract<any, any, any, any, any, any, infer InitialSetup>
    ? InitialSetup
    : TStep["contract"]["initialSetup"];

type TestContextArgs<TStep extends TestableStep> =
  Extract<StepRequiresOf<TStep>[number] | StepProvidesOf<TStep>[number], Artifact> extends never
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
): StepDeps<
  StepRequiresOf<TStep>,
  StepProvidesOf<TStep>,
  StepEngineOf<TStep>,
  StepInitialSetupOf<TStep>
> {
  return buildDeclaredStepDependencies(step, {
    consumerStepId: DIRECT_TEST_STEP_ID,
    owner: "mapgen-core/testing",
    context: context[0],
  }) as unknown as StepDeps<
    StepRequiresOf<TStep>,
    StepProvidesOf<TStep>,
    StepEngineOf<TStep>,
    StepInitialSetupOf<TStep>
  >;
}
