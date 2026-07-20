import type { MapContext } from "@swooper/mapgen-core";
import {
  type ArtifactContract,
  ArtifactMissingError,
  type ArtifactModule,
  type ArtifactValueOf,
  implementArtifactModules,
} from "@swooper/mapgen-core/authoring";

export { withMapContextExecutionForTest } from "@swooper/mapgen-core/testing";

type TestableStep = Readonly<{
  contract: Readonly<{
    id: string;
    artifacts?: Readonly<{
      requires?: readonly ArtifactContract[];
      provides?: readonly ArtifactModule[];
    }>;
  }>;
  artifacts?: Readonly<Record<string, unknown>>;
}>;

type StepArguments<TStep> = TStep extends {
  run: (...args: infer TArguments) => unknown;
}
  ? TArguments
  : never;

type StepDependencies<TStep> = StepArguments<TStep>[3];
type StepArtifactDependencies<TStep> =
  StepDependencies<TStep> extends Readonly<{
    artifacts: infer TArtifacts;
  }>
    ? TArtifacts
    : never;

function createRequiredRuntime(contract: ArtifactContract, consumerStepId: string) {
  return {
    contract,
    read: (context: MapContext) => {
      if (!context.artifacts.has(contract.id)) {
        throw new ArtifactMissingError({
          artifactId: contract.id,
          artifactName: contract.name,
          consumerStepId,
        });
      }
      return context.artifacts.get(contract.id) as unknown;
    },
  };
}

function isArtifactPublisher<C extends ArtifactContract>(
  candidate: unknown,
  contract: C
): candidate is Readonly<{
  contract: C;
  publish: (context: MapContext, value: ArtifactValueOf<C>) => unknown;
}> {
  return (
    typeof candidate === "object" &&
    candidate !== null &&
    "contract" in candidate &&
    candidate.contract === contract &&
    "publish" in candidate &&
    typeof candidate.publish === "function"
  );
}

export function buildTestDeps<TStep>(step: TStep & TestableStep): StepDependencies<TStep> {
  const artifacts = step.contract.artifacts;
  const depsArtifacts: Record<string, unknown> = {};
  const stepId = step.contract.id;

  for (const contract of artifacts?.requires ?? []) {
    depsArtifacts[contract.name] = createRequiredRuntime(contract, stepId);
  }

  for (const { artifact: contract } of artifacts?.provides ?? []) {
    const runtime = step.artifacts?.[contract.name as keyof typeof step.artifacts];
    if (!runtime) {
      throw new Error(
        `Test deps missing artifact runtime for "${contract.name}" in step "${stepId}"`
      );
    }
    depsArtifacts[contract.name] = runtime;
  }

  return {
    // Runtime keys come from the same literal contracts that define the static dependency surface.
    artifacts: depsArtifacts as StepArtifactDependencies<TStep>,
  };
}

/** Publishes test setup through the declared module's production validation and write-once path. */
export function publishTestArtifact<C extends ArtifactContract>(
  context: MapContext,
  module: ArtifactModule<C>,
  value: ArtifactValueOf<C>
): void {
  const runtimes = implementArtifactModules([module] as const);
  const runtime = Object.values(runtimes).find((candidate) =>
    isArtifactPublisher(candidate, module.artifact)
  );
  if (!runtime) {
    throw new Error(`Missing test artifact runtime for "${module.artifact.name}".`);
  }
  runtime.publish(context, value);
}
