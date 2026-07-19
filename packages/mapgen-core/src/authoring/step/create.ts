import type { MapContext } from "@mapgen/core/map-context.js";

import type { NormalizeContext } from "@mapgen/engine/index.js";
import type { StepFacets } from "@mapgen/engine/step-facets.js";
import type { Static } from "typebox";
import { implementArtifactModules } from "../artifact/runtime.js";
import type { StepDeps, StepModule } from "../types.js";
import type { StepContract } from "./contract.js";
import { assertNoStepStageIdentityAliases } from "./identity.js";
import type { StepRuntimeOps } from "./ops.js";

type StepConfigOf<C extends StepContract<any, any, any, any>> = Static<C["schema"]>;
type StepOpsOf<C extends StepContract<any, any, any, any>> = StepRuntimeOps<NonNullable<C["ops"]>>;

type ArtifactsOf<C extends StepContract<any, any, any, any>> =
  C extends StepContract<any, any, any, infer A> ? A : undefined;

type StepImplBase<TContext, TConfig, TOps, TDeps, TResult> = Readonly<{
  normalize?: (config: TConfig, ctx: NormalizeContext) => TConfig;
  run: (context: TContext, config: TConfig, ops: TOps, deps: TDeps) => TResult | Promise<TResult>;
}> &
  StepFacets<TConfig, TResult>;

type StepImpl<
  C extends StepContract<any, any, any, any>,
  TConfig,
  TOps,
  TDeps,
  TResult,
> = StepImplBase<MapContext, TConfig, TOps, TDeps, TResult>;

/**
 * Binds executable step behavior to its admitted contract. Provider runtimes derive from the
 * contract's artifact modules, so an implementation cannot install a second contract or validator.
 * The run result is inferred once and becomes the typed input to optional post-provides projectors.
 */
export function createStep<const C extends StepContract<any, any, any, any>, TResult = void>(
  contract: C,
  impl: StepImpl<C, StepConfigOf<C>, StepOpsOf<C>, StepDeps<ArtifactsOf<C>>, TResult>
): StepModule<C, TResult> {
  if (!contract?.schema) {
    const label = contract?.id ? `step "${contract.id}"` : "step";
    throw new Error(`createStep requires an explicit schema for ${label}`);
  }
  if (Object.prototype.hasOwnProperty.call(impl, "artifacts")) {
    throw new Error(`step "${contract.id}" implementation cannot declare artifact modules`);
  }
  assertNoStepStageIdentityAliases(impl, `step "${contract.id}" implementation`);
  const modules = contract.artifacts?.provides;
  const artifacts =
    modules === undefined || modules.length === 0 ? undefined : implementArtifactModules(modules);

  return Object.freeze({
    contract,
    run: impl.run,
    ...(impl.normalize === undefined ? {} : { normalize: impl.normalize }),
    ...(impl.metrics === undefined ? {} : { metrics: impl.metrics }),
    ...(impl.viz === undefined ? {} : { viz: impl.viz }),
    ...(artifacts === undefined ? {} : { artifacts }),
  }) as unknown as StepModule<C, TResult>;
}
