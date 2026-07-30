import type { CompletionId } from "@mapgen/engine/completion.js";
import type { Artifact } from "../artifact/contract.js";
import { assertStageIds } from "../stage/identity.js";
import type { StepDependencyList } from "../step/contract.js";
import { analyzeRecipeArtifactDependencies } from "./artifact-analysis.js";

/** JSON-safe identity for one artifact participating in a recipe dependency graph. */
export type RecipeDagArtifactRef = Readonly<{
  id: string;
  name: string;
}>;

/**
 * Contract-only projection of one authored step in deterministic recipe order.
 * Exact artifact selections define graph edges; completion ids remain descriptive metadata.
 */
export type RecipeDagStep = Readonly<{
  stageId: string;
  stepId: string;
  fullStepId: string;
  order: number;
  orderInStage: number;
  artifactRequires: readonly RecipeDagArtifactRef[];
  artifactProvides: readonly RecipeDagArtifactRef[];
  completionRequires: readonly CompletionId[];
  completionProvides: readonly CompletionId[];
}>;

/** Ordered stage projection with its aggregate artifact edges and unresolved diagnostic count. */
export type RecipeDagStage = Readonly<{
  stageId: string;
  order: number;
  steps: readonly RecipeDagStep[];
  artifactRequires: readonly RecipeDagArtifactRef[];
  artifactProvides: readonly RecipeDagArtifactRef[];
  inboundArtifactEdgeCount: number;
  outboundArtifactEdgeCount: number;
  internalArtifactEdgeCount: number;
  diagnosticCount: number;
}>;

/** Stable stage and step identity used at either end of a projected artifact edge. */
export type RecipeDagEndpoint = Readonly<{
  stageId: string;
  stepId: string;
  fullStepId: string;
}>;

/** Directed artifact dependency between two authored step endpoints. */
export type RecipeDagEdge = Readonly<{
  id: string;
  artifact: RecipeDagArtifactRef;
  from: RecipeDagEndpoint;
  to: RecipeDagEndpoint;
  internal: boolean;
}>;

/**
 * Unresolved artifact relationship retained for tooling instead of being repaired or hidden.
 * Diagnostics identify missing, duplicate, mismatched-authority, and unused provisions.
 */
export type RecipeDagDiagnostic = Readonly<
  | {
      kind: "artifact-provider-missing";
      artifact: RecipeDagArtifactRef;
      consumer: RecipeDagEndpoint;
    }
  | {
      kind: "artifact-provider-duplicate";
      artifact: RecipeDagArtifactRef;
      providers: readonly [RecipeDagEndpoint, RecipeDagEndpoint, ...RecipeDagEndpoint[]];
      consumers: readonly RecipeDagEndpoint[];
    }
  | {
      kind: "artifact-authority-mismatch";
      artifact: RecipeDagArtifactRef;
      providedArtifact: RecipeDagArtifactRef;
      provider: RecipeDagEndpoint;
      consumer: RecipeDagEndpoint;
    }
  | {
      kind: "artifact-consumer-missing";
      artifact: RecipeDagArtifactRef;
      provider: RecipeDagEndpoint;
    }
>;

/** JSON-safe, authored-order recipe graph projected solely from contract metadata. */
export type RecipeDag = Readonly<{
  recipeId: string;
  recipeKey: string;
  namespace?: string;
  title: string;
  stages: readonly RecipeDagStage[];
  edges: readonly RecipeDagEdge[];
  diagnostics: readonly RecipeDagDiagnostic[];
}>;

/**
 * Least contract metadata accepted for one DAG step projection.
 * Artifact authorities create edges; string completion ids are copied as metadata only.
 */
export type RecipeDagStepContractInput = Readonly<{
  id: string;
  requires: StepDependencyList;
  provides: StepDependencyList;
}>;

/** Authored stage identity and ordered contract-only step inputs accepted by DAG projection. */
export type RecipeDagStageInput = Readonly<{
  id: string;
  steps: readonly Readonly<{ contract: RecipeDagStepContractInput }>[];
}>;

/**
 * Complete recipe identity and authored stage order required to build a JSON-safe DAG.
 * Optional presentation identity never changes graph topology or diagnostic resolution.
 */
export type BuildRecipeDagInput = Readonly<{
  recipeId: string;
  namespace?: string;
  recipeKey?: string;
  title?: string;
  stages: readonly RecipeDagStageInput[];
}>;

type StageAccumulator = {
  stage: RecipeDagStage;
  inbound: number;
  outbound: number;
  internal: number;
  diagnostics: number;
};

/**
 * Projects an authored recipe into its exact stage/step dependency graph.
 * Authored order remains authoritative, artifact contracts alone create edges, and unresolved
 * relationships remain diagnostics rather than prompting inferred topology.
 */
export function buildRecipeDag(input: BuildRecipeDagInput): RecipeDag {
  assertStageIds(input.stages.map((stage) => stage.id));
  const recipeKey =
    input.recipeKey ?? (input.namespace ? `${input.namespace}/${input.recipeId}` : input.recipeId);
  const analysis = analyzeRecipeArtifactDependencies(input);
  const steps = analysis.steps.map(
    (step): RecipeDagStep => ({
      stageId: step.endpoint.stageId,
      stepId: step.endpoint.stepId,
      fullStepId: step.endpoint.fullStepId,
      order: step.order,
      orderInStage: step.orderInStage,
      artifactRequires: artifactRefs(step.artifactRequires),
      artifactProvides: artifactRefs(step.artifactProvides),
      completionRequires: completionIds(step.requires),
      completionProvides: completionIds(step.provides),
    })
  );
  const stepsByStage = new Map<string, RecipeDagStep[]>();
  for (const step of steps) {
    const stageSteps = stepsByStage.get(step.stageId) ?? [];
    stageSteps.push(step);
    stepsByStage.set(step.stageId, stageSteps);
  }

  const stageAccumulators = new Map<string, StageAccumulator>();
  input.stages.forEach((stage, stageIndex) => {
    const stageSteps = stepsByStage.get(stage.id) ?? [];
    stageAccumulators.set(stage.id, {
      stage: {
        stageId: stage.id,
        order: stageIndex,
        steps: stageSteps,
        artifactRequires: uniqueArtifacts(stageSteps.flatMap((step) => step.artifactRequires)),
        artifactProvides: uniqueArtifacts(stageSteps.flatMap((step) => step.artifactProvides)),
        inboundArtifactEdgeCount: 0,
        outboundArtifactEdgeCount: 0,
        internalArtifactEdgeCount: 0,
        diagnosticCount: 0,
      },
      inbound: 0,
      outbound: 0,
      internal: 0,
      diagnostics: 0,
    });
  });

  const edges = analysis.edges.map((edge): RecipeDagEdge => {
    const internal = edge.provider.stageId === edge.consumer.stageId;
    if (internal) {
      incrementInternal(stageAccumulators, edge.consumer.stageId);
    } else {
      incrementOutbound(stageAccumulators, edge.provider.stageId);
      incrementInbound(stageAccumulators, edge.consumer.stageId);
    }
    return {
      id: `${edge.provider.fullStepId}->${edge.consumer.fullStepId}:${edge.artifact.id}`,
      artifact: artifactRef(edge.artifact),
      from: edge.provider,
      to: edge.consumer,
      internal,
    };
  });

  const diagnostics: RecipeDagDiagnostic[] = [];
  for (const issue of analysis.issues) {
    switch (issue.kind) {
      case "artifact-provider-missing":
        diagnostics.push({
          kind: issue.kind,
          artifact: artifactRef(issue.consumer.artifact),
          consumer: issue.consumer.endpoint,
        });
        incrementDiagnostic(stageAccumulators, issue.consumer.endpoint.stageId);
        break;
      case "artifact-provider-duplicate": {
        const artifact = issue.consumers[0]?.artifact ?? issue.providers[0].artifact;
        const [firstProvider, secondProvider, ...additionalProviders] = issue.providers;
        diagnostics.push({
          kind: issue.kind,
          artifact: artifactRef(artifact),
          providers: [
            firstProvider.endpoint,
            secondProvider.endpoint,
            ...additionalProviders.map((provider) => provider.endpoint),
          ],
          consumers: issue.consumers.map((consumer) => consumer.endpoint),
        });
        for (const provider of issue.providers) {
          incrementDiagnostic(stageAccumulators, provider.endpoint.stageId);
        }
        for (const consumer of issue.consumers) {
          incrementDiagnostic(stageAccumulators, consumer.endpoint.stageId);
        }
        break;
      }
      case "artifact-authority-mismatch":
        diagnostics.push({
          kind: issue.kind,
          artifact: artifactRef(issue.consumer.artifact),
          providedArtifact: artifactRef(issue.provider.artifact),
          provider: issue.provider.endpoint,
          consumer: issue.consumer.endpoint,
        });
        incrementDiagnostic(stageAccumulators, issue.provider.endpoint.stageId);
        incrementDiagnostic(stageAccumulators, issue.consumer.endpoint.stageId);
        break;
      case "artifact-consumer-missing":
        diagnostics.push({
          kind: issue.kind,
          artifact: artifactRef(issue.provider.artifact),
          provider: issue.provider.endpoint,
        });
        incrementDiagnostic(stageAccumulators, issue.provider.endpoint.stageId);
        break;
    }
  }

  return {
    recipeId: input.recipeId,
    recipeKey,
    ...(input.namespace ? { namespace: input.namespace } : {}),
    title: input.title ?? recipeKey,
    stages: Array.from(stageAccumulators.values()).map((entry) => ({
      ...entry.stage,
      inboundArtifactEdgeCount: entry.inbound,
      outboundArtifactEdgeCount: entry.outbound,
      internalArtifactEdgeCount: entry.internal,
      diagnosticCount: entry.diagnostics,
    })),
    edges,
    diagnostics,
  };
}

function artifactRef(artifact: Artifact): RecipeDagArtifactRef {
  return { id: artifact.id, name: artifact.name };
}

function artifactRefs(artifacts: readonly Artifact[]): RecipeDagArtifactRef[] {
  return artifacts.map(artifactRef);
}

function completionIds(dependencies: StepDependencyList): CompletionId[] {
  return dependencies.filter(
    (dependency): dependency is CompletionId => typeof dependency === "string"
  );
}

function uniqueArtifacts(artifacts: readonly RecipeDagArtifactRef[]): RecipeDagArtifactRef[] {
  const seen = new Map<string, RecipeDagArtifactRef>();
  for (const artifact of artifacts) {
    if (!seen.has(artifact.id)) seen.set(artifact.id, artifact);
  }
  return Array.from(seen.values());
}

function incrementInbound(stages: Map<string, StageAccumulator>, stageId: string): void {
  const stage = stages.get(stageId);
  if (stage) stage.inbound += 1;
}

function incrementOutbound(stages: Map<string, StageAccumulator>, stageId: string): void {
  const stage = stages.get(stageId);
  if (stage) stage.outbound += 1;
}

function incrementInternal(stages: Map<string, StageAccumulator>, stageId: string): void {
  const stage = stages.get(stageId);
  if (stage) stage.internal += 1;
}

function incrementDiagnostic(stages: Map<string, StageAccumulator>, stageId: string): void {
  const stage = stages.get(stageId);
  if (stage) stage.diagnostics += 1;
}
