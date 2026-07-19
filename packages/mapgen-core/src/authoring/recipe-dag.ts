import type { ArtifactContract } from "./artifact/contract.js";
import type { ArtifactModule } from "./artifact/module.js";
import { assertStageIds } from "./stage.js";

export type RecipeDagArtifactRef = Readonly<{
  id: string;
  name: string;
}>;

export type RecipeDagStep = Readonly<{
  stageId: string;
  stepId: string;
  fullStepId: string;
  order: number;
  orderInStage: number;
  artifactRequires: readonly RecipeDagArtifactRef[];
  artifactProvides: readonly RecipeDagArtifactRef[];
  tagRequires: readonly string[];
  tagProvides: readonly string[];
}>;

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

export type RecipeDagEndpoint = Readonly<{
  stageId: string;
  stepId: string;
  fullStepId: string;
}>;

export type RecipeDagEdge = Readonly<{
  id: string;
  artifact: RecipeDagArtifactRef;
  from: RecipeDagEndpoint;
  to: RecipeDagEndpoint;
  internal: boolean;
}>;

export type RecipeDagDiagnostic = Readonly<
  | {
      kind: "artifact-provider-missing";
      artifact: RecipeDagArtifactRef;
      consumer: RecipeDagEndpoint;
    }
  | {
      kind: "artifact-provider-duplicate";
      artifact: RecipeDagArtifactRef;
      providers: readonly RecipeDagEndpoint[];
      consumer?: RecipeDagEndpoint;
    }
  | {
      kind: "artifact-consumer-missing";
      artifact: RecipeDagArtifactRef;
      provider: RecipeDagEndpoint;
    }
>;

export type RecipeDag = Readonly<{
  recipeId: string;
  recipeKey: string;
  namespace?: string;
  title: string;
  stages: readonly RecipeDagStage[];
  edges: readonly RecipeDagEdge[];
  diagnostics: readonly RecipeDagDiagnostic[];
}>;

export type RecipeDagStepContractInput = Readonly<{
  id: string;
  requires: readonly string[];
  provides: readonly string[];
  artifacts?: Readonly<{
    requires?: readonly ArtifactContract[];
    provides?: readonly ArtifactModule[];
  }>;
}>;

export type RecipeDagStageInput = Readonly<{
  id: string;
  steps: readonly Readonly<{ contract: RecipeDagStepContractInput }>[];
}>;

export type BuildRecipeDagInput = Readonly<{
  recipeId: string;
  namespace?: string;
  recipeKey?: string;
  title?: string;
  stages: readonly RecipeDagStageInput[];
}>;

type ArtifactProvider = Readonly<{
  artifact: RecipeDagArtifactRef;
  endpoint: RecipeDagEndpoint;
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
 * Stage identity comes only from recipe composition; artifact diagnostics describe the same graph.
 */
export function buildRecipeDag(input: BuildRecipeDagInput): RecipeDag {
  assertStageIds(input.stages.map((stage) => stage.id));
  const recipeKey =
    input.recipeKey ?? (input.namespace ? `${input.namespace}/${input.recipeId}` : input.recipeId);
  const providers = new Map<string, ArtifactProvider[]>();
  const consumerArtifactIds = new Set<string>();
  const steps: RecipeDagStep[] = [];
  const stageAccumulators = new Map<string, StageAccumulator>();
  let stepOrder = 0;
  input.stages.forEach((stage, stageIndex) => {
    const stageSteps: RecipeDagStep[] = [];
    stage.steps.forEach((step, stepIndex: number) => {
      const fullStepId = computeFullStepId({
        namespace: input.namespace,
        recipeId: input.recipeId,
        stageId: stage.id,
        stepId: step.contract.id,
      });
      const artifactRequires = artifactRefs(step.contract.artifacts?.requires);
      const artifactProvides = artifactModuleRefs(step.contract.artifacts?.provides);
      const dagStep: RecipeDagStep = {
        stageId: stage.id,
        stepId: step.contract.id,
        fullStepId,
        order: stepOrder++,
        orderInStage: stepIndex,
        artifactRequires,
        artifactProvides,
        tagRequires: [...step.contract.requires],
        tagProvides: [...step.contract.provides],
      };

      steps.push(dagStep);
      stageSteps.push(dagStep);

      for (const artifact of artifactProvides) {
        const list = providers.get(artifact.id) ?? [];
        list.push({
          artifact,
          endpoint: {
            stageId: stage.id,
            stepId: step.contract.id,
            fullStepId,
          },
        });
        providers.set(artifact.id, list);
      }
    });

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

  const edges: RecipeDagEdge[] = [];
  const diagnostics: RecipeDagDiagnostic[] = [];
  const duplicateProviderDiagnostics = new Set<string>();

  for (const step of steps) {
    for (const artifact of step.artifactRequires) {
      consumerArtifactIds.add(artifact.id);
      const artifactProviders = providers.get(artifact.id) ?? [];
      const consumer: RecipeDagEndpoint = {
        stageId: step.stageId,
        stepId: step.stepId,
        fullStepId: step.fullStepId,
      };

      if (artifactProviders.length === 0) {
        diagnostics.push({ kind: "artifact-provider-missing", artifact, consumer });
        incrementDiagnostic(stageAccumulators, step.stageId);
        continue;
      }

      if (artifactProviders.length > 1) {
        const key = `duplicate:${artifact.id}`;
        if (!duplicateProviderDiagnostics.has(key)) {
          diagnostics.push({
            kind: "artifact-provider-duplicate",
            artifact,
            providers: artifactProviders.map((provider) => provider.endpoint),
            consumer,
          });
          duplicateProviderDiagnostics.add(key);
          for (const provider of artifactProviders)
            incrementDiagnostic(stageAccumulators, provider.endpoint.stageId);
        }
        incrementDiagnostic(stageAccumulators, step.stageId);
        continue;
      }

      const provider = artifactProviders[0]!;
      const internal = provider.endpoint.stageId === step.stageId;
      edges.push({
        id: `${provider.endpoint.fullStepId}->${step.fullStepId}:${artifact.id}`,
        artifact,
        from: provider.endpoint,
        to: consumer,
        internal,
      });
      if (internal) {
        incrementInternal(stageAccumulators, step.stageId);
      } else {
        incrementOutbound(stageAccumulators, provider.endpoint.stageId);
        incrementInbound(stageAccumulators, step.stageId);
      }
    }
  }

  for (const artifactProviders of providers.values()) {
    if (artifactProviders.length !== 1) continue;
    const provider = artifactProviders[0]!;
    if (consumerArtifactIds.has(provider.artifact.id)) continue;
    diagnostics.push({
      kind: "artifact-consumer-missing",
      artifact: provider.artifact,
      provider: provider.endpoint,
    });
    incrementDiagnostic(stageAccumulators, provider.endpoint.stageId);
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

function computeFullStepId(input: {
  namespace?: string;
  recipeId: string;
  stageId: string;
  stepId: string;
}): string {
  const base = input.namespace ? `${input.namespace}.${input.recipeId}` : input.recipeId;
  return `${base}.${input.stageId}.${input.stepId}`;
}

function artifactRefs(artifacts: readonly ArtifactContract[] | undefined): RecipeDagArtifactRef[] {
  return (artifacts ?? []).map((artifact) => ({ id: artifact.id, name: artifact.name }));
}

function artifactModuleRefs(
  modules: readonly ArtifactModule[] | undefined
): RecipeDagArtifactRef[] {
  return artifactRefs(modules?.map((module) => module.artifact));
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
