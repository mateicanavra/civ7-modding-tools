import type { ExtendedMapContext } from "@swooper/mapgen-core";
import { type ArtifactContract, ArtifactMissingError } from "@swooper/mapgen-core/authoring";

type TestableStep = Readonly<{
  contract: Readonly<{
    id: string;
    artifacts?: Readonly<{
      requires?: readonly ArtifactContract[];
      provides?: readonly ArtifactContract[];
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
type StepContext<TStep> = Extract<StepArguments<TStep>[0], ExtendedMapContext>;
type StepArtifactDependencies<TStep> =
  StepDependencies<TStep> extends Readonly<{
    artifacts: infer TArtifacts;
  }>
    ? TArtifacts
    : never;

function createRequiredRuntime<TContext extends ExtendedMapContext>(
  contract: ArtifactContract,
  consumerStepId: string
) {
  return {
    contract,
    read: (context: TContext) => {
      if (!context.artifacts.has(contract.id)) {
        throw new ArtifactMissingError({
          artifactId: contract.id,
          artifactName: contract.name,
          consumerStepId,
        });
      }
      return context.artifacts.get(contract.id) as unknown;
    },
    tryRead: (context: TContext) => {
      if (!context.artifacts.has(contract.id)) return null;
      return context.artifacts.get(contract.id) as unknown;
    },
  };
}

export function buildTestDeps<TStep>(step: TStep & TestableStep): StepDependencies<TStep> {
  const artifacts = step.contract.artifacts;
  const depsArtifacts: Record<string, unknown> = {};
  const stepId = step.contract.id;

  for (const contract of artifacts?.requires ?? []) {
    depsArtifacts[contract.name] = createRequiredRuntime<StepContext<TStep>>(contract, stepId);
  }

  for (const contract of artifacts?.provides ?? []) {
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
    fields: {},
    effects: {},
  };
}
