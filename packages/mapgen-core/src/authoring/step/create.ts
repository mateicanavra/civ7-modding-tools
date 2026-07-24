import type { MapContext } from "@mapgen/core/map-context.js";

import type { NormalizeContext } from "@mapgen/engine/index.js";
import type { StepFacets } from "@mapgen/engine/step-facets.js";
import type { Static } from "typebox";
import { implementArtifacts } from "../artifact/runtime.js";
import { assertCanonicalStepContractInternal, registerCanonicalStepInternal } from "./authority.js";
import type { StepContract } from "./contract.js";
import { assertNoStepStageIdentityAliases } from "./identity.js";
import type { StepRuntimeOps } from "./ops.js";
import { registerStepProviderRuntimesInternal } from "./provider-runtimes.js";
import type { StepDeps, StepModule } from "./types.js";

type StepConfigOf<C extends StepContract<any, any, any, any, any>> = Static<C["schema"]>;
type StepOpsOf<C extends StepContract<any, any, any, any, any>> = StepRuntimeOps<
  NonNullable<C["ops"]>
>;

type ArtifactsOf<C extends StepContract<any, any, any, any, any>> =
  C extends StepContract<any, any, any, infer A, any> ? A : undefined;

type EngineOf<C extends StepContract<any, any, any, any, any>> =
  C extends StepContract<any, any, any, any, infer Engine> ? Engine : undefined;

type StepImplBase<TContext, TConfig, TOps, TDeps, TResult> = Readonly<{
  normalize?: (config: TConfig, ctx: NormalizeContext) => TConfig;
  run: (context: TContext, config: TConfig, ops: TOps, deps: TDeps) => TResult | Promise<TResult>;
}> &
  StepFacets<TConfig, TResult>;

type StepImpl<
  C extends StepContract<any, any, any, any, any>,
  TConfig,
  TOps,
  TDeps,
  TResult,
> = StepImplBase<MapContext, TConfig, TOps, TDeps, TResult>;

type CapturedImplementationFunction = (...args: never[]) => unknown;

type CapturedStepImplementation = Readonly<{
  run: CapturedImplementationFunction;
  normalize?: CapturedImplementationFunction;
  metrics?: CapturedImplementationFunction;
  viz?: CapturedImplementationFunction;
}>;

function readImplementationFunction(
  impl: object,
  stepId: string,
  key: "run" | "normalize" | "metrics" | "viz",
  required: boolean
): CapturedImplementationFunction | undefined {
  const descriptor = Object.getOwnPropertyDescriptor(impl, key);
  if (!descriptor) {
    if (required) throw new TypeError(`step "${stepId}" implementation must own ${key}`);
    return undefined;
  }
  if (!descriptor.enumerable || !("value" in descriptor)) {
    throw new TypeError(
      `step "${stepId}" implementation ${key} must be an own enumerable data property`
    );
  }
  if (descriptor.value === undefined && !required) return undefined;
  if (typeof descriptor.value !== "function") {
    throw new TypeError(`step "${stepId}" implementation ${key} must be a function`);
  }
  return descriptor.value as CapturedImplementationFunction;
}

function captureStepImplementation(stepId: string, impl: unknown): CapturedStepImplementation {
  if ((typeof impl !== "object" && typeof impl !== "function") || impl === null) {
    throw new TypeError(`step "${stepId}" implementation must be an object`);
  }
  if (Object.prototype.hasOwnProperty.call(impl, "artifacts")) {
    throw new Error(`step "${stepId}" implementation cannot redeclare artifacts`);
  }
  assertNoStepStageIdentityAliases(impl, `step "${stepId}" implementation`);

  const run = readImplementationFunction(impl, stepId, "run", true)!;
  const normalize = readImplementationFunction(impl, stepId, "normalize", false);
  const metrics = readImplementationFunction(impl, stepId, "metrics", false);
  const viz = readImplementationFunction(impl, stepId, "viz", false);
  return Object.freeze({ run, normalize, metrics, viz });
}

/**
 * Binds executable step behavior to its admitted contract. Provider runtimes derive from the
 * contract's artifact authorities, so an implementation cannot install a second validator.
 * The run result is inferred once and becomes the typed input to optional post-provides projectors.
 */
export function createStep<const C extends StepContract<any, any, any, any, any>, TResult = void>(
  contract: C,
  impl: StepImpl<C, StepConfigOf<C>, StepOpsOf<C>, StepDeps<ArtifactsOf<C>, EngineOf<C>>, TResult>
): StepModule<C, TResult> {
  if ((typeof contract !== "object" && typeof contract !== "function") || contract === null) {
    throw new TypeError("createStep requires a contract created by defineStep");
  }
  assertCanonicalStepContractInternal(contract);
  const captured = captureStepImplementation(contract.id, impl);
  const providedArtifacts = contract.artifacts?.provides;
  const artifacts =
    providedArtifacts === undefined || providedArtifacts.length === 0
      ? undefined
      : implementArtifacts(providedArtifacts);

  const step = Object.freeze({
    contract,
    run: captured.run,
    ...(captured.normalize === undefined ? {} : { normalize: captured.normalize }),
    ...(captured.metrics === undefined ? {} : { metrics: captured.metrics }),
    ...(captured.viz === undefined ? {} : { viz: captured.viz }),
  }) as unknown as StepModule<C, TResult>;
  if (artifacts !== undefined) registerStepProviderRuntimesInternal(step, artifacts);
  registerCanonicalStepInternal(step);
  return step;
}
