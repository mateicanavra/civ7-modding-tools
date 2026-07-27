import type { MapContext } from "@mapgen/core/map-context.js";
import { invokeMapContextAdapterMethodInternal } from "@mapgen/core/map-context.js";

import type { Artifact } from "../artifact/contract.js";
import { publishArtifactValueInternal, readArtifactValueInternal } from "../artifact/runtime.js";
import {
  type InitialSetupDefinition,
  readInitialSetupValueInternal,
} from "../initial-setup/definition.js";
import type { StepArtifactsDeclAny, StepEngineDecl } from "./contract.js";
import type { ArtifactPublisher, ArtifactReader, StepDeps } from "./types.js";

type DeclaredStep<
  Artifacts extends StepArtifactsDeclAny | undefined,
  Engine extends StepEngineDecl | undefined,
  InitialSetup extends InitialSetupDefinition | undefined = InitialSetupDefinition | undefined,
> = Readonly<{
  contract: Readonly<{
    artifacts?: Artifacts;
    engine?: Engine;
    initialSetup?: InitialSetup;
  }>;
}>;

function createArtifactReader<A extends Artifact>(
  artifact: A,
  consumerStepId: string,
  context: MapContext
): ArtifactReader<A> {
  return Object.freeze({
    read: () => readArtifactValueInternal(context, artifact, consumerStepId),
  });
}

function createArtifactPublisher<A extends Artifact>(
  artifact: A,
  consumerStepId: string,
  context: MapContext
): ArtifactPublisher<A> {
  return Object.freeze({
    publish: (value) => publishArtifactValueInternal(context, artifact, value, consumerStepId),
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
      invokeMapContextAdapterMethodInternal(invocationContext, context, consumerStepId, key, args);
  }
  return Object.freeze(bound);
}

function bindArtifactDependency(
  bound: Record<string, ArtifactReader<any> | ArtifactPublisher<any>>,
  name: string,
  capability: ArtifactReader<any> | ArtifactPublisher<any>,
  input: Readonly<{ consumerStepId: string; owner: string }>
): void {
  if (Object.hasOwn(bound, name)) {
    throw new Error(
      `[${input.owner}] step "${input.consumerStepId}" declares duplicate artifact binding "${name}"`
    );
  }
  bound[name] = capability;
}

function requireArtifactContext(
  context: MapContext | undefined,
  consumerStepId: string
): MapContext {
  if (context !== undefined) return context;
  throw new Error(
    `Artifact dependencies for step "${consumerStepId}" require the exact active step context.`
  );
}

/**
 * Binds a step's declared required readers and provided publishers to its artifact authorities.
 * Production recipe execution and focused step tests share this exact dependency authority.
 */
export function buildDeclaredStepDependencies<
  Artifacts extends StepArtifactsDeclAny | undefined,
  Engine extends StepEngineDecl | undefined,
  InitialSetup extends InitialSetupDefinition | undefined,
>(
  authored: DeclaredStep<Artifacts, Engine, InitialSetup>,
  input: Readonly<{ consumerStepId: string; owner: string; context?: MapContext }>
): StepDeps<Artifacts, Engine, InitialSetup> {
  const artifacts = authored.contract.artifacts;
  const engine = bindEngineDependencies(
    authored.contract.engine,
    input.context,
    input.consumerStepId
  );
  const initialSetup =
    authored.contract.initialSetup === undefined
      ? Object.freeze({})
      : input.context === undefined
        ? rejectMissingInitialSetupContext(input.consumerStepId)
        : Object.freeze({
            initialSetup: readInitialSetupValueInternal(
              input.context.setup,
              authored.contract.initialSetup
            ),
          });
  if (!artifacts) {
    return Object.freeze({
      artifacts: Object.freeze({}),
      engine,
      ...initialSetup,
    }) as StepDeps<Artifacts, Engine, InitialSetup>;
  }

  const requires = artifacts.requires ?? [];
  const provides = artifacts.provides ?? [];
  if (requires.length === 0 && provides.length === 0) {
    return Object.freeze({
      artifacts: Object.freeze({}),
      engine,
      ...initialSetup,
    }) as StepDeps<Artifacts, Engine, InitialSetup>;
  }

  const context = requireArtifactContext(input.context, input.consumerStepId);
  const bound: Record<string, ArtifactReader<any> | ArtifactPublisher<any>> = {};
  for (const artifact of requires) {
    bindArtifactDependency(
      bound,
      artifact.name,
      createArtifactReader(artifact, input.consumerStepId, context),
      input
    );
  }
  for (const artifact of provides) {
    bindArtifactDependency(
      bound,
      artifact.name,
      createArtifactPublisher(artifact, input.consumerStepId, context),
      input
    );
  }

  return Object.freeze({
    artifacts: Object.freeze(bound),
    engine,
    ...initialSetup,
  }) as StepDeps<Artifacts, Engine, InitialSetup>;
}

function rejectMissingInitialSetupContext(stepId: string): never {
  throw new Error(
    `Initial setup dependency for step "${stepId}" requires an admitted map context.`
  );
}
