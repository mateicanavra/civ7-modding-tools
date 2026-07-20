import type { MapContext } from "@mapgen/core/map-context.js";

import type { ArtifactContract, ArtifactReadValueOf } from "../artifact/contract.js";
import type { ArtifactModule } from "../artifact/module.js";
import {
  ArtifactMissingError,
  type ProvidedArtifactRuntime,
  type RequiredArtifactRuntime,
} from "../artifact/runtime.js";
import type { StepDeps } from "../types.js";
import type { StepArtifactsDeclAny } from "./contract.js";

type DeclaredArtifactStep<Artifacts extends StepArtifactsDeclAny | undefined> = Readonly<{
  contract: Readonly<{ artifacts?: Artifacts }>;
  artifacts?: object;
}>;

function createRequiredArtifactRuntime<C extends ArtifactContract>(
  contract: C,
  consumerStepId: string
): RequiredArtifactRuntime<C> {
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
      return context.artifacts.get(contract.id) as ArtifactReadValueOf<C>;
    },
  };
}

function resolveProvidedArtifactRuntime(
  authored: DeclaredArtifactStep<StepArtifactsDeclAny | undefined>,
  contract: ArtifactContract,
  consumerStepId: string,
  owner: string
): ProvidedArtifactRuntime<any> {
  const runtimes = authored.artifacts as Readonly<Record<string, unknown>> | undefined;
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
    typeof (runtime as { publish?: unknown }).publish !== "function" ||
    typeof (runtime as { satisfies?: unknown }).satisfies !== "function"
  ) {
    throw new Error(
      `[${owner}] step "${consumerStepId}" has invalid artifact runtime for "${contract.name}"`
    );
  }
  return runtime as unknown as ProvidedArtifactRuntime<any>;
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
  if (!artifacts) return { artifacts: {} } as StepDeps<Artifacts>;

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
      resolveProvidedArtifactRuntime(authored, contract, input.consumerStepId, input.owner),
      input
    );
  }

  return { artifacts: bound } as StepDeps<Artifacts>;
}
