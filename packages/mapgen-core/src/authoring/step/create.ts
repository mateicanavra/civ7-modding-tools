import type { ExtendedMapContext } from "@mapgen/core/types.js";

import type { NormalizeContext } from "@mapgen/engine/index.js";
import type { Static } from "typebox";
import type { ArtifactContract } from "../artifact/contract.js";
import type { ArtifactModule } from "../artifact/module.js";
import { implementArtifactModules } from "../artifact/runtime.js";
import type { StepArtifactModulesInput, StepDeps, StepModule } from "../types.js";
import type { StepContract } from "./contract.js";
import type { StepRuntimeOps } from "./ops.js";

type StepConfigOf<C extends StepContract<any, any, any, any>> = Static<C["schema"]>;
type StepOpsOf<C extends StepContract<any, any, any, any>> = StepRuntimeOps<NonNullable<C["ops"]>>;

type ArtifactsOf<C extends StepContract<any, any, any, any>> =
  C extends StepContract<any, any, any, infer A> ? A : undefined;

type StepImplBase<TContext, TConfig, TOps, TDeps> = Readonly<{
  normalize?: (config: TConfig, ctx: NormalizeContext) => TConfig;
  run: (context: TContext, config: TConfig, ops: TOps, deps: TDeps) => void | Promise<void>;
}>;

type StepImpl<
  C extends StepContract<any, any, any, any>,
  TContext extends ExtendedMapContext,
  TConfig,
  TOps,
  TDeps,
> = StepImplBase<TContext, TConfig, TOps, TDeps> & StepArtifactModulesInput<ArtifactsOf<C>>;

function snapshotArtifactModule(stepId: string, value: unknown, index: number): ArtifactModule {
  if (value === null || typeof value !== "object") {
    throw new Error(`step "${stepId}" artifact module at index ${index} must be an object`);
  }

  const artifactDescriptor = Object.getOwnPropertyDescriptor(value, "artifact");
  const validateDescriptor = Object.getOwnPropertyDescriptor(value, "validate");
  if (!artifactDescriptor || !("value" in artifactDescriptor)) {
    throw new Error(`step "${stepId}" artifact modules must own artifact data properties`);
  }
  if (!validateDescriptor || !("value" in validateDescriptor)) {
    throw new Error(`step "${stepId}" artifact modules must own validate data properties`);
  }

  const artifact = artifactDescriptor.value as ArtifactContract | null | undefined;
  const validate = validateDescriptor.value as ArtifactModule["validate"] | undefined;
  if (artifact === null || typeof artifact !== "object" || typeof validate !== "function") {
    throw new Error(`step "${stepId}" artifact module at index ${index} is invalid`);
  }
  return Object.freeze({ artifact, validate });
}

function snapshotArtifactModuleList(stepId: string, value: unknown): readonly ArtifactModule[] {
  if (!Array.isArray(value)) {
    throw new Error(`step "${stepId}" artifact modules must be an array`);
  }

  const ownKeys = Reflect.ownKeys(value);
  if (ownKeys.length !== value.length + 1) {
    throw new Error(`step "${stepId}" artifact modules must be a dense array without extra keys`);
  }

  const modules: ArtifactModule[] = [];
  for (let index = 0; index < value.length; index += 1) {
    const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
    if (!descriptor || !("value" in descriptor) || !descriptor.enumerable) {
      throw new Error(`step "${stepId}" artifact module at index ${index} must be a data property`);
    }
    modules.push(snapshotArtifactModule(stepId, descriptor.value, index));
  }
  return Object.freeze(modules);
}

function resolveArtifactModules(
  contract: StepContract<any, any, any, any>,
  authoredModules: unknown
): readonly ArtifactModule[] | undefined {
  const declared = contract.artifacts?.provides as readonly ArtifactContract[] | undefined;

  if (declared === undefined) {
    if (authoredModules !== undefined) {
      throw new Error(`step "${contract.id}" declares no artifact providers but received modules`);
    }
    return undefined;
  }
  if (declared.length === 0) {
    if (authoredModules !== undefined) {
      throw new Error(`step "${contract.id}" declares no artifact providers but received modules`);
    }
    return undefined;
  }
  if (authoredModules === undefined) {
    throw new Error(`step "${contract.id}" requires modules for its artifact providers`);
  }

  const modules = snapshotArtifactModuleList(contract.id, authoredModules);
  if (modules.length !== declared.length) {
    throw new Error(`step "${contract.id}" artifact modules do not match declared providers`);
  }

  const declaredArtifacts = new Set(declared);
  const seenArtifacts = new Set<ArtifactContract>();
  for (const module of modules) {
    if (!declaredArtifacts.has(module.artifact) || seenArtifacts.has(module.artifact)) {
      throw new Error(`step "${contract.id}" artifact modules do not match declared providers`);
    }
    seenArtifacts.add(module.artifact);
  }
  return modules;
}

/**
 * Binds executable step behavior to its contract. Artifact modules are admitted only when they
 * exactly own the declared provider set; the returned module exposes runtimes derived from that
 * authority rather than the author's module tuple.
 */
export function createStep<
  const C extends StepContract<any, any, any, any>,
  TContext extends ExtendedMapContext = ExtendedMapContext,
>(
  contract: C,
  impl: StepImpl<C, TContext, StepConfigOf<C>, StepOpsOf<C>, StepDeps<TContext, ArtifactsOf<C>>>
): StepModule<TContext, C> {
  if (!contract?.schema) {
    const label = contract?.id ? `step "${contract.id}"` : "step";
    throw new Error(`createStep requires an explicit schema for ${label}`);
  }
  const { artifacts: authoredModules, ...implementation } = impl as StepImplBase<
    TContext,
    StepConfigOf<C>,
    StepOpsOf<C>,
    StepDeps<TContext, ArtifactsOf<C>>
  > & { artifacts?: unknown };
  const modules = resolveArtifactModules(contract, authoredModules);
  const artifacts = modules === undefined ? undefined : implementArtifactModules(modules);

  return (artifacts === undefined
    ? { ...implementation, contract }
    : { ...implementation, artifacts, contract }) as unknown as StepModule<TContext, C>;
}

/** Context-bound `createStep` signature that preserves each contract's exact authored types. */
export type CreateStepFor<TContext extends ExtendedMapContext> = <
  const C extends StepContract<any, any, any, any>,
>(
  contract: C,
  impl: StepImpl<C, TContext, StepConfigOf<C>, StepOpsOf<C>, StepDeps<TContext, ArtifactsOf<C>>>
) => StepModule<TContext, C>;

/** Creates a `createStep` function whose map context is fixed once for a domain authoring surface. */
export function createStepFor<TContext extends ExtendedMapContext>(): CreateStepFor<TContext> {
  return (contract, impl) => createStep(contract, impl);
}
