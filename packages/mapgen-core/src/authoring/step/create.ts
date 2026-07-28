import type { NormalizeContext } from "@mapgen/engine/index.js";
import type { StepFacets } from "@mapgen/engine/step-facets.js";
import type { Static } from "typebox";
import type { InitialSetupDefinition } from "../initial-setup/definition.js";
import { assertCanonicalStepContractInternal, registerCanonicalStepInternal } from "./authority.js";
import type { StepContract } from "./contract.js";
import { assertNoStepStageIdentityAliases } from "./identity.js";
import type { StepRuntimeOps } from "./ops.js";
import type { StepContext, StepDeps, StepModule } from "./types.js";

type StepConfigOf<C extends StepContract<any, any, any, any, any, any, any>> = Static<C["schema"]>;
type StepOpsOf<C extends StepContract<any, any, any, any, any, any, any>> = StepRuntimeOps<
  NonNullable<C["ops"]>
>;

type RequiresOf<C extends StepContract<any, any, any, any, any, any, any>> =
  C extends StepContract<any, any, any, infer Requires, any, any, any> ? Requires : readonly [];

type ProvidesOf<C extends StepContract<any, any, any, any, any, any, any>> =
  C extends StepContract<any, any, any, any, infer Provides, any, any> ? Provides : readonly [];

type EngineOf<C extends StepContract<any, any, any, any, any, any, any>> =
  C extends StepContract<any, any, any, any, any, infer Engine, any> ? Engine : undefined;

type InitialSetupOf<C extends StepContract<any, any, any, any, any, any, any>> =
  C extends StepContract<any, any, any, any, any, any, infer InitialSetup>
    ? InitialSetup extends InitialSetupDefinition
      ? InitialSetup
      : undefined
    : undefined;

type StepImplBase<TContext, TConfig, TOps, TDeps, TObservation> = Readonly<{
  normalize?: (config: TConfig, ctx: NormalizeContext) => TConfig;
  run: (
    context: TContext,
    config: TConfig,
    ops: TOps,
    deps: TDeps
  ) => TObservation | Promise<TObservation>;
}> &
  StepFacets<TConfig, TObservation>;

type StepImpl<
  C extends StepContract<any, any, any, any, any, any, any>,
  TConfig,
  TOps,
  TDeps,
  TObservation,
> = StepImplBase<StepContext<InitialSetupOf<C>>, TConfig, TOps, TDeps, TObservation>;

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
 * Binds executable step behavior to its admitted contract. Artifact capabilities derive directly
 * from the contract during each occurrence, so implementations cannot install another authority.
 * The invocation-local observation is inferred once and becomes the typed input to optional
 * post-provides projectors; it is discarded after projection and never becomes pipeline state.
 */
export function createStep<
  const C extends StepContract<any, any, any, any, any, any, any>,
  TObservation = void,
>(
  contract: C,
  impl: StepImpl<
    C,
    StepConfigOf<C>,
    StepOpsOf<C>,
    StepDeps<RequiresOf<C>, ProvidesOf<C>, EngineOf<C>>,
    TObservation
  >
): StepModule<C, TObservation> {
  if ((typeof contract !== "object" && typeof contract !== "function") || contract === null) {
    throw new TypeError("createStep requires a contract created by defineStep");
  }
  assertCanonicalStepContractInternal(contract);
  const captured = captureStepImplementation(contract.id, impl);

  const step = Object.freeze({
    contract,
    run: captured.run,
    ...(captured.normalize === undefined ? {} : { normalize: captured.normalize }),
    ...(captured.metrics === undefined ? {} : { metrics: captured.metrics }),
    ...(captured.viz === undefined ? {} : { viz: captured.viz }),
  }) as unknown as StepModule<C, TObservation>;
  registerCanonicalStepInternal(step);
  return step;
}
