import type { Artifact } from "../artifact/contract.js";
import type { StepDependencyList } from "../step/contract.js";

type RecipeArtifactEndpoint = Readonly<{
  stageId: string;
  stepId: string;
  fullStepId: string;
}>;

type ArtifactOccurrence = Readonly<{
  artifact: Artifact;
  endpoint: RecipeArtifactEndpoint;
}>;

type DuplicateArtifactProviders = readonly [
  ArtifactOccurrence,
  ArtifactOccurrence,
  ...ArtifactOccurrence[],
];

type RecipeArtifactStep = Readonly<{
  endpoint: RecipeArtifactEndpoint;
  order: number;
  orderInStage: number;
  requires: StepDependencyList;
  provides: StepDependencyList;
  artifactRequires: readonly Artifact[];
  artifactProvides: readonly Artifact[];
}>;

type RecipeArtifactEdge = Readonly<{
  artifact: Artifact;
  provider: RecipeArtifactEndpoint;
  consumer: RecipeArtifactEndpoint;
}>;

type RecipeArtifactIssue = Readonly<
  | {
      kind: "artifact-provider-missing";
      consumer: ArtifactOccurrence;
    }
  | {
      kind: "artifact-provider-duplicate";
      artifactId: string;
      providers: DuplicateArtifactProviders;
      consumers: readonly ArtifactOccurrence[];
    }
  | {
      kind: "artifact-authority-mismatch";
      provider: ArtifactOccurrence;
      consumer: ArtifactOccurrence;
    }
  | {
      kind: "artifact-consumer-missing";
      provider: ArtifactOccurrence;
    }
>;

type RecipeArtifactAnalysis = Readonly<{
  steps: readonly RecipeArtifactStep[];
  edges: readonly RecipeArtifactEdge[];
  issues: readonly RecipeArtifactIssue[];
}>;

type AnalyzeRecipeArtifactDependenciesInput = Readonly<{
  namespace?: string;
  recipeId: string;
  stages: readonly Readonly<{
    id: string;
    steps: readonly Readonly<{
      contract: Readonly<{
        id: string;
        requires: StepDependencyList;
        provides: StepDependencyList;
      }>;
    }>[];
  }>[];
}>;

/** Formats the stable runtime identity for one authored recipe step. */
export function formatRecipeStepId(input: {
  namespace?: string;
  recipeId: string;
  stageId: string;
  stepId: string;
}): string {
  const base = input.namespace ? `${input.namespace}.${input.recipeId}` : input.recipeId;
  return `${base}.${input.stageId}.${input.stepId}`;
}

function artifacts(dependencies: StepDependencyList): readonly Artifact[] {
  return dependencies.filter(
    (dependency): dependency is Artifact => typeof dependency !== "string"
  );
}

/**
 * Resolves one authored recipe's artifact graph without reducing exact artifact identity.
 * Missing, duplicate, mismatched, and unused relationships are returned as evidence so runtime
 * admission and JSON-safe tooling remain projections of the same analysis.
 */
export function analyzeRecipeArtifactDependencies(
  input: AnalyzeRecipeArtifactDependenciesInput
): RecipeArtifactAnalysis {
  const steps: RecipeArtifactStep[] = [];
  const providersById = new Map<string, ArtifactOccurrence[]>();
  const consumersById = new Map<string, ArtifactOccurrence[]>();
  let order = 0;

  input.stages.forEach((stage) => {
    stage.steps.forEach((step, orderInStage) => {
      const endpoint = {
        stageId: stage.id,
        stepId: step.contract.id,
        fullStepId: formatRecipeStepId({
          namespace: input.namespace,
          recipeId: input.recipeId,
          stageId: stage.id,
          stepId: step.contract.id,
        }),
      };
      const artifactRequires = artifacts(step.contract.requires);
      const artifactProvides = artifacts(step.contract.provides);
      steps.push({
        endpoint,
        order: order++,
        orderInStage,
        requires: step.contract.requires,
        provides: step.contract.provides,
        artifactRequires,
        artifactProvides,
      });

      for (const artifact of artifactProvides) {
        const providers = providersById.get(artifact.id) ?? [];
        providers.push({ artifact, endpoint });
        providersById.set(artifact.id, providers);
      }
      for (const artifact of artifactRequires) {
        const consumers = consumersById.get(artifact.id) ?? [];
        consumers.push({ artifact, endpoint });
        consumersById.set(artifact.id, consumers);
      }
    });
  });

  const edges: RecipeArtifactEdge[] = [];
  const issues: RecipeArtifactIssue[] = [];
  const emittedDuplicateIds = new Set<string>();

  for (const step of steps) {
    for (const artifact of step.artifactRequires) {
      const consumer = { artifact, endpoint: step.endpoint };
      const providers = providersById.get(artifact.id) ?? [];
      if (providers.length === 0) {
        issues.push({ kind: "artifact-provider-missing", consumer });
        continue;
      }
      if (providers.length > 1) {
        if (!emittedDuplicateIds.has(artifact.id)) {
          issues.push({
            kind: "artifact-provider-duplicate",
            artifactId: artifact.id,
            providers: [providers[0]!, providers[1]!, ...providers.slice(2)],
            consumers: [...(consumersById.get(artifact.id) ?? [])],
          });
          emittedDuplicateIds.add(artifact.id);
        }
        continue;
      }

      const provider = providers[0]!;
      if (provider.artifact !== artifact) {
        issues.push({ kind: "artifact-authority-mismatch", provider, consumer });
        continue;
      }
      edges.push({
        artifact,
        provider: provider.endpoint,
        consumer: step.endpoint,
      });
    }
  }

  for (const [artifactId, providers] of providersById) {
    if (providers.length > 1 && !emittedDuplicateIds.has(artifactId)) {
      issues.push({
        kind: "artifact-provider-duplicate",
        artifactId,
        providers: [providers[0]!, providers[1]!, ...providers.slice(2)],
        consumers: [],
      });
      continue;
    }
    if (providers.length !== 1 || consumersById.has(artifactId)) continue;
    issues.push({
      kind: "artifact-consumer-missing",
      provider: providers[0]!,
    });
  }

  return { steps, edges, issues };
}
