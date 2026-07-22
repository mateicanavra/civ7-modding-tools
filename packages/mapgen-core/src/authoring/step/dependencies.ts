import type { MapContext } from "@mapgen/core/map-context.js";
import {
  getActiveMapContextStepIdInternal,
  readMapContextArtifactInternal,
} from "@mapgen/core/map-context.js";

import type { ArtifactContract, ArtifactReadValueOf } from "../artifact/contract.js";
import type { ArtifactModule } from "../artifact/module.js";
import {
  ArtifactMissingError,
  type ImplementedArtifactRuntime,
  type ProvidedArtifactRuntime,
  type RequiredArtifactRuntime,
} from "../artifact/runtime.js";
import type { StepDeps } from "../types.js";
import type { StepArtifactsDeclAny } from "./contract.js";
import { readStepProviderRuntimesInternal } from "./provider-runtimes.js";

type DeclaredArtifactStep<Artifacts extends StepArtifactsDeclAny | undefined> = Readonly<{
  contract: Readonly<{ artifacts?: Artifacts }>;
}>;

function assertArtifactCapabilityOwner(context: MapContext, consumerStepId: string): void {
  if (getActiveMapContextStepIdInternal(context) !== consumerStepId) {
    throw new Error(
      `Artifact capability for step "${consumerStepId}" requires that step's exact active context.`
    );
  }
}

function createRequiredArtifactRuntime<C extends ArtifactContract>(
  contract: C,
  consumerStepId: string
): RequiredArtifactRuntime<C> {
  return Object.freeze({
    read: (context: MapContext) => {
      assertArtifactCapabilityOwner(context, consumerStepId);
      const observation = readMapContextArtifactInternal(context, contract);
      if (!observation.found) {
        throw new ArtifactMissingError({
          artifactId: contract.id,
          artifactName: contract.name,
          consumerStepId,
        });
      }
      return observation.value as ArtifactReadValueOf<C>;
    },
  });
}

/** @internal Resolves the complete provider binding retained by one admitted step module. */
export function resolveProvidedArtifactRuntimeInternal(
  authored: DeclaredArtifactStep<StepArtifactsDeclAny | undefined>,
  contract: ArtifactContract,
  consumerStepId: string,
  owner: string
): ImplementedArtifactRuntime<any> {
  const runtimes = readStepProviderRuntimesInternal(authored);
  if (!runtimes || !Object.hasOwn(runtimes, contract.name)) {
    throw new Error(
      `[${owner}] step "${consumerStepId}" missing artifact runtime for "${contract.name}"`
    );
  }
  const runtime = runtimes[contract.name];
  if (
    typeof runtime !== "object" ||
    runtime === null ||
    (runtime as { contract?: unknown }).contract !== contract ||
    typeof (runtime as { read?: unknown }).read !== "function" ||
    typeof (runtime as { publish?: unknown }).publish !== "function"
  ) {
    throw new Error(
      `[${owner}] step "${consumerStepId}" has invalid artifact runtime for "${contract.name}"`
    );
  }
  return runtime as unknown as ImplementedArtifactRuntime<any>;
}

function authorProvidedArtifactRuntime(
  runtime: ImplementedArtifactRuntime<any>,
  consumerStepId: string
): ProvidedArtifactRuntime<any> {
  return Object.freeze({
    publish: (context, value) => {
      assertArtifactCapabilityOwner(context, consumerStepId);
      return runtime.publish(context, value);
    },
  });
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
 * Binds a step's declared required readers and provided publishers to its authored artifact modules.
 * Production recipe execution and focused step tests share this exact dependency authority.
 */
export function buildDeclaredStepDependencies<Artifacts extends StepArtifactsDeclAny | undefined>(
  authored: DeclaredArtifactStep<Artifacts>,
  input: Readonly<{ consumerStepId: string; owner: string }>
): StepDeps<Artifacts> {
  const artifacts = authored.contract.artifacts;
  if (!artifacts) {
    return Object.freeze({ artifacts: Object.freeze({}) }) as StepDeps<Artifacts>;
  }

  const bound: Record<string, RequiredArtifactRuntime<any> | ProvidedArtifactRuntime<any>> = {};
  for (const contract of artifacts.requires ?? []) {
    bindArtifactDependency(
      bound,
      contract.name,
      createRequiredArtifactRuntime(contract, input.consumerStepId),
      input
    );
  }
  for (const module of (artifacts.provides ?? []) as readonly ArtifactModule[]) {
    const contract = module.artifact;
    bindArtifactDependency(
      bound,
      contract.name,
      authorProvidedArtifactRuntime(
        resolveProvidedArtifactRuntimeInternal(
          authored,
          contract,
          input.consumerStepId,
          input.owner
        ),
        input.consumerStepId
      ),
      input
    );
  }

  return Object.freeze({ artifacts: Object.freeze(bound) }) as StepDeps<Artifacts>;
}
