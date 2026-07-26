import type { AuthoredEngineAdapterKey } from "@civ7/adapter";
import type { MapContext } from "@mapgen/core/map-context.js";
import {
  getActiveMapContextStepIdInternal,
  invokeMapContextAdapterMethodInternal,
  readMapContextArtifactInternal,
} from "@mapgen/core/map-context.js";

import type { Artifact, ArtifactReadValueOf } from "../artifact/contract.js";
import {
  ArtifactMissingError,
  type ImplementedArtifactRuntime,
  type ProvidedArtifactRuntime,
  type RequiredArtifactRuntime,
} from "../artifact/runtime.js";
import type { StepDeps } from "../types.js";
import type { StepArtifactsDeclAny, StepEngineDecl } from "./contract.js";
import { readStepProviderRuntimesInternal } from "./provider-runtimes.js";

type DeclaredStep<
  Artifacts extends StepArtifactsDeclAny | undefined,
  Engine extends StepEngineDecl | undefined,
> = Readonly<{
  contract: Readonly<{ artifacts?: Artifacts; engine?: Engine }>;
}>;

function assertArtifactCapabilityOwner(
  context: MapContext,
  consumerStepId: string,
  boundContext?: MapContext
): void {
  if (
    (boundContext !== undefined && context !== boundContext) ||
    getActiveMapContextStepIdInternal(context) !== consumerStepId
  ) {
    throw new Error(
      `Artifact capability for step "${consumerStepId}" requires that step's exact active context.`
    );
  }
}

function createRequiredArtifactRuntime<A extends Artifact>(
  artifact: A,
  consumerStepId: string,
  boundContext?: MapContext
): RequiredArtifactRuntime<A> {
  return Object.freeze({
    read: (context: MapContext) => {
      assertArtifactCapabilityOwner(context, consumerStepId, boundContext);
      const observation = readMapContextArtifactInternal(context, artifact);
      if (!observation.found) {
        throw new ArtifactMissingError({
          artifactId: artifact.id,
          artifactName: artifact.name,
          consumerStepId,
        });
      }
      return observation.value as ArtifactReadValueOf<A>;
    },
  });
}

/** @internal Resolves the complete provider binding retained by one admitted step module. */
export function resolveProvidedArtifactRuntimeInternal(
  authored: DeclaredStep<StepArtifactsDeclAny | undefined, StepEngineDecl | undefined>,
  artifact: Artifact,
  consumerStepId: string,
  owner: string
): ImplementedArtifactRuntime<any> {
  const runtimes = readStepProviderRuntimesInternal(authored);
  if (!runtimes || !Object.hasOwn(runtimes, artifact.name)) {
    throw new Error(
      `[${owner}] step "${consumerStepId}" missing artifact runtime for "${artifact.name}"`
    );
  }
  const runtime = runtimes[artifact.name];
  if (
    typeof runtime !== "object" ||
    runtime === null ||
    (runtime as { artifact?: unknown }).artifact !== artifact ||
    typeof (runtime as { read?: unknown }).read !== "function" ||
    typeof (runtime as { publish?: unknown }).publish !== "function"
  ) {
    throw new Error(
      `[${owner}] step "${consumerStepId}" has invalid artifact runtime for "${artifact.name}"`
    );
  }
  return runtime as unknown as ImplementedArtifactRuntime<any>;
}

function authorProvidedArtifactRuntime(
  runtime: ImplementedArtifactRuntime<any>,
  consumerStepId: string,
  boundContext?: MapContext
): ProvidedArtifactRuntime<any> {
  return Object.freeze({
    publish: (context, value) => {
      assertArtifactCapabilityOwner(context, consumerStepId, boundContext);
      return runtime.publish(context, value);
    },
  });
}

function bindEngineDependencies(
  engine: StepEngineDecl | undefined,
  context: MapContext | undefined,
  consumerStepId: string
): Readonly<Record<string, (context: MapContext, ...args: unknown[]) => unknown>> {
  if (!engine || engine.length === 0) return Object.freeze({});
  if (!context) {
    throw new Error(
      `Engine dependencies for step "${consumerStepId}" require the exact active step context.`
    );
  }
  const bound: Record<string, (context: MapContext, ...args: unknown[]) => unknown> = {};
  for (const key of engine) {
    bound[key] = (invocationContext, ...args) =>
      invokeMapContextAdapterMethodInternal(
        invocationContext,
        context,
        consumerStepId,
        key as AuthoredEngineAdapterKey,
        args
      );
  }
  return Object.freeze(bound);
}

function bindArtifactDependency(
  bound: Record<string, RequiredArtifactRuntime<any> | ProvidedArtifactRuntime<any>>,
  name: string,
  runtime: RequiredArtifactRuntime<any> | ProvidedArtifactRuntime<any>,
  input: Readonly<{ consumerStepId: string; owner: string }>
): void {
  if (Object.hasOwn(bound, name)) {
    throw new Error(
      `[${input.owner}] step "${input.consumerStepId}" declares duplicate artifact binding "${name}"`
    );
  }
  bound[name] = runtime;
}

/**
 * Binds a step's declared required readers and provided publishers to its artifact authorities.
 * Production recipe execution and focused step tests share this exact dependency authority.
 */
export function buildDeclaredStepDependencies<
  Artifacts extends StepArtifactsDeclAny | undefined,
  Engine extends StepEngineDecl | undefined,
>(
  authored: DeclaredStep<Artifacts, Engine>,
  input: Readonly<{ consumerStepId: string; owner: string; context?: MapContext }>
): StepDeps<Artifacts, Engine> {
  const artifacts = authored.contract.artifacts;
  const engine = bindEngineDependencies(
    authored.contract.engine,
    input.context,
    input.consumerStepId
  );
  if (!artifacts) {
    return Object.freeze({ artifacts: Object.freeze({}), engine }) as StepDeps<Artifacts, Engine>;
  }

  const bound: Record<string, RequiredArtifactRuntime<any> | ProvidedArtifactRuntime<any>> = {};
  for (const artifact of artifacts.requires ?? []) {
    bindArtifactDependency(
      bound,
      artifact.name,
      createRequiredArtifactRuntime(artifact, input.consumerStepId, input.context),
      input
    );
  }
  for (const artifact of artifacts.provides ?? []) {
    bindArtifactDependency(
      bound,
      artifact.name,
      authorProvidedArtifactRuntime(
        resolveProvidedArtifactRuntimeInternal(
          authored,
          artifact,
          input.consumerStepId,
          input.owner
        ),
        input.consumerStepId,
        input.context
      ),
      input
    );
  }

  return Object.freeze({ artifacts: Object.freeze(bound), engine }) as StepDeps<Artifacts, Engine>;
}
