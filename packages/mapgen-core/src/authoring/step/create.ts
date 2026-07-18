import type { ExtendedMapContext } from "@mapgen/core/types.js";

import type { NormalizeContext } from "@mapgen/engine/index.js";
import type { Static } from "typebox";
import { implementArtifactModules } from "../artifact/runtime.js";
import type { StepDeps, StepModule } from "../types.js";
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
> = StepImplBase<TContext, TConfig, TOps, TDeps>;

/**
 * Binds executable step behavior to its admitted contract. Provider runtimes derive from the
 * contract's artifact modules, so an implementation cannot install a second contract or validator.
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
  if (Object.prototype.hasOwnProperty.call(impl, "artifacts")) {
    throw new Error(`step "${contract.id}" implementation cannot declare artifact modules`);
  }
  const modules = contract.artifacts?.provides;
  const artifacts =
    modules === undefined || modules.length === 0 ? undefined : implementArtifactModules(modules);

  return (artifacts === undefined
    ? { ...impl, contract }
    : { ...impl, artifacts, contract }) as unknown as StepModule<TContext, C>;
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
