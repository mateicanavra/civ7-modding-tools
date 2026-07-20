import type { StepArtifactsDeclAny, StepContract } from "@mapgen/authoring/step/contract.js";
import { buildDeclaredStepDependencies } from "@mapgen/authoring/step/dependencies.js";
import type { StepDeps } from "@mapgen/authoring/types.js";

type TestableStep = Readonly<{
  contract: Readonly<{
    id: string;
    artifacts?: StepArtifactsDeclAny;
  }>;
  artifacts?: object;
  run: (...args: never[]) => unknown;
}>;

type StepArtifactsOf<TStep extends TestableStep> =
  TStep["contract"] extends StepContract<any, any, any, infer Artifacts>
    ? Artifacts
    : TStep["contract"]["artifacts"];

/** Derives the same declared artifact readers and publishers used by production recipe execution. */
export function buildStepTestDependencies<TStep extends TestableStep>(
  step: TStep
): StepDeps<StepArtifactsOf<TStep>> {
  return buildDeclaredStepDependencies(step, {
    consumerStepId: step.contract.id,
    owner: "mapgen-core/testing",
  }) as StepDeps<StepArtifactsOf<TStep>>;
}
