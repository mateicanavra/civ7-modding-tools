import type { MapContext } from "@mapgen/core/map-context.js";
import type { ExecutionPlan, RecipeV2 } from "@mapgen/engine/execution-plan.js";
import type { PlanTraceOptions } from "@mapgen/engine/observability.js";
import type { StepFacetSinks } from "@mapgen/engine/step-facets.js";
import type { ReadonlyDeep } from "type-fest";
import type { Static, TObject, TSchema } from "typebox";
import type {
  BasePhysicalInitialSetupDefinition,
  InitialSetupDefinition,
  InitialSetupInputOf,
  InitialSetupValueOf,
} from "../initial-setup/definition.js";
import type { OperationRegistry } from "../operation/bindings.js";
import type { ReservedStageKey } from "../stage/reserved-key.js";
import type { EmptyStageConfig, StageObservation, StageStepList } from "../stage/types.js";

type StepSchemaOf<TStep> = TStep extends { contract: { schema: infer Schema } } ? Schema : never;

type StepConfigRuntimeOf<TStep> =
  StepSchemaOf<TStep> extends TSchema ? Static<StepSchemaOf<TStep>> : unknown;

type StepIdOfStep<TStep> = TStep extends { contract: { id: infer Id } } ? Id & string : never;

type StepConfigKeys<TStep> = TStep extends unknown
  ? StepSchemaOf<TStep> extends TObject<infer Properties>
    ? keyof Properties
    : string
  : never;

type StepConfigsById<TSteps extends readonly unknown[]> = [StepConfigKeys<TSteps[number]>] extends [
  never,
]
  ? EmptyStageConfig
  : Readonly<{
      [S in TSteps[number] as StepIdOfStep<S> extends ReservedStageKey
        ? never
        : [StepConfigKeys<S>] extends [never]
          ? never
          : StepIdOfStep<S>]: StepConfigRuntimeOf<S>;
    }>;

/** Type-erased complete recipe configuration keyed by stage identity. */
export type RecipeConfig = Readonly<Record<string, Readonly<Record<string, unknown>>>>;

type StepsOfStage<S> = S extends { steps: infer Steps } ? Steps : never;

type StepIdUnionOfStage<S> =
  StepsOfStage<S> extends readonly (infer Step)[]
    ? Step extends { contract: { id: infer Id } }
      ? Id & string
      : never
    : never;

type StepConfigRuntimeById<S, K extends string> = StepConfigRuntimeOf<
  Extract<Extract<StepsOfStage<S>, readonly unknown[]>[number], { contract: { id: K } }>
>;

type StageIdOf<S> = S extends { id: infer Id } ? Id & string : never;

type StageStepsOf<S> = Extract<StepsOfStage<S>, StageStepList>;

type StageKnobsSchemaOf<S> = S extends { knobsSchema: infer KS } ? KS : never;

type StagePublicSchemaOf<S> = S extends { public: infer PS } ? PS : never;

type StageHasPublic<S> = S extends { public: TObject } ? true : false;

type StageHasCompile<S> = S extends { compile: (...args: never[]) => unknown } ? true : false;

type StageKnobsConfigOf<S> = S extends { knobsSchema: TObject }
  ? Readonly<{
      knobs: Static<Extract<StageKnobsSchemaOf<S>, TObject>>;
    }>
  : EmptyStageConfig;

type StageCompiledConfigOf<S> =
  StageHasPublic<S> extends true
    ? Static<Extract<StagePublicSchemaOf<S>, TObject>>
    : EmptyStageConfig;

type StagePublicConfigOf<S> = S extends { steps: readonly unknown[] }
  ? StageHasCompile<S> extends true
    ? S extends { knobsSchema: TObject }
      ? StageHasPublic<S> extends true
        ? StageKnobsConfigOf<S> & StageCompiledConfigOf<S>
        : StageKnobsConfigOf<S>
      : StageCompiledConfigOf<S>
    : S extends { knobsSchema: TObject }
      ? StageKnobsConfigOf<S> & StepConfigsById<StageStepsOf<S>>
      : StepConfigsById<StageStepsOf<S>>
  : never;

type StageUnion<TStages extends readonly unknown[]> = TStages[number];

/** Public recipe configuration inferred from each authored stage surface. */
export type RecipePublicConfigOf<TStages extends readonly unknown[]> = Readonly<{
  [S in StageUnion<TStages> as StageIdOf<S>]: StagePublicConfigOf<S>;
}>;

type CompiledStageConfigOf<S> = [StepIdUnionOfStage<S>] extends [never]
  ? EmptyStageConfig
  : Readonly<{
      [K in StepIdUnionOfStage<S>]: StepConfigRuntimeById<S, K>;
    }>;

/** Internal per-step recipe configuration inferred after stage compilation. */
export type CompiledRecipeConfigOf<TStages extends readonly unknown[]> = Readonly<{
  [S in StageUnion<TStages> as StageIdOf<S>]: CompiledStageConfigOf<S>;
}>;

type StageList = readonly StageObservation[];

/** Authorship input joining ordered stages with their canonical executable operation registry. */
export type RecipeDefinition<
  TStages extends StageList = StageList,
  TInitialSetup extends InitialSetupDefinition = BasePhysicalInitialSetupDefinition,
  TRecipeId extends string = string,
> = Readonly<{
  id: TRecipeId;
  namespace?: string;
  stages: TStages;
  operations: OperationRegistry;
}> &
  (TInitialSetup extends BasePhysicalInitialSetupDefinition
    ? Readonly<{ initialSetup?: TInitialSetup }>
    : Readonly<{ initialSetup: TInitialSetup }>);

/** Execution-only observers and logging accepted by synchronous recipe execution. */
export type RecipeExecutionOptions = Readonly<{
  trace?: PlanTraceOptions | null;
  /** Execution-owned consumers for optional post-provides step projections. */
  facets?: StepFacetSinks;
  log?: (message: string) => void;
}>;

/** Exact admitted identity retained by one authentic compiled recipe plan. */
export type RecipePlanEvidence<
  TInitialSetup extends InitialSetupDefinition = InitialSetupDefinition,
  TRecipeId extends string = string,
> = Readonly<{
  recipeId: TRecipeId;
  planFingerprint: string;
  initialSetup: Readonly<{
    definitionId: TInitialSetup["id"];
    value: InitialSetupValueOf<TInitialSetup>;
  }>;
}>;

/** Synchronous recipe execution options plus cooperative async scheduling controls. */
export type RecipeAsyncExecutionOptions = RecipeExecutionOptions &
  Readonly<{
    abortSignal?: { readonly aborted: boolean } | null;
    yieldToEventLoop?: boolean;
    yieldFn?: (() => Promise<void>) | null;
  }>;

/**
 * Compiled recipe capability exposed to SDK and runtime consumers.
 *
 * `compile` creates one frozen plan; `execute` consumes that exact plan without normalization or
 * recompilation. Convenience `run` methods compile once from `context.setup` and delegate to the
 * corresponding execution method. Trace and facet sinks are execution-only observers.
 */
export type RecipeModule<
  TPublicConfig = RecipeConfig,
  TConfigCompiled = RecipeConfig,
  TInitialSetup extends InitialSetupDefinition = BasePhysicalInitialSetupDefinition,
  TRecipeId extends string = string,
> = Readonly<{
  /** Stable recipe identity used in plans, traces, and generated runtime evidence. */
  readonly id: TRecipeId;
  /** Exact schema and physical projection authority owned by this recipe. */
  readonly initialSetup: TInitialSetup;
  /** Deep-readonly registered step graph snapshotted when the recipe is authored. */
  readonly recipe: ReadonlyDeep<RecipeV2>;
  /** Compiles public authoring config for inspection under one admitted physical setup snapshot. */
  compileConfig: (
    setup: InitialSetupInputOf<TInitialSetup>,
    config: TPublicConfig
  ) => TConfigCompiled;
  /** Compiles an immutable execution plan that retains its admitted setup identity. */
  compile: (setup: InitialSetupInputOf<TInitialSetup>, config: TPublicConfig) => ExecutionPlan;
  /** Observes the exact admitted setup and behavior fingerprint of this recipe's authentic plan. */
  inspectPlan: (plan: ExecutionPlan) => RecipePlanEvidence<TInitialSetup, TRecipeId>;
  /** Executes the exact supplied plan synchronously and refuses a different context setup identity. */
  execute: (context: MapContext, plan: ExecutionPlan, options?: RecipeExecutionOptions) => void;
  /** Compiles exactly once from `context.setup`, then delegates to `execute`. */
  run: (context: MapContext, config: TPublicConfig, options?: RecipeExecutionOptions) => void;
  /** Executes the exact supplied plan asynchronously and refuses a different setup identity. */
  executeAsync: (
    context: MapContext,
    plan: ExecutionPlan,
    options?: RecipeAsyncExecutionOptions
  ) => Promise<void>;
  /** Compiles exactly once from `context.setup`, then delegates to `executeAsync`. */
  runAsync: (
    context: MapContext,
    config: TPublicConfig,
    options?: RecipeAsyncExecutionOptions
  ) => Promise<void>;
}>;

/** Exact initial-setup authority retained by a recipe module. */
export type RecipeInitialSetupDefinitionOf<TRecipe> =
  TRecipe extends Readonly<{
    initialSetup: infer TInitialSetup extends InitialSetupDefinition;
  }>
    ? TInitialSetup
    : never;

/** Full per-run setup input inferred from a recipe module's schema authority. */
export type RecipeInitialSetupInputOf<TRecipe> =
  RecipeInitialSetupDefinitionOf<TRecipe> extends infer TInitialSetup extends InitialSetupDefinition
    ? InitialSetupInputOf<TInitialSetup>
    : never;

/** Deeply immutable setup value visible to steps that declare the recipe's exact authority. */
export type RecipeInitialSetupValueOf<TRecipe> =
  RecipeInitialSetupDefinitionOf<TRecipe> extends infer TInitialSetup extends InitialSetupDefinition
    ? InitialSetupValueOf<TInitialSetup>
    : never;
