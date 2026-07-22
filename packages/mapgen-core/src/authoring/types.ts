import type { AuthoredEngineAdapterKey, EngineAdapter } from "@civ7/adapter";
import type { MapContext } from "@mapgen/core/map-context.js";

import type {
  ExecutionPlan,
  MapSetup,
  MapSetupInput,
  NormalizeContext,
  RecipeV2,
} from "@mapgen/engine/index.js";
import type { PlanTraceOptions } from "@mapgen/engine/observability.js";
import type { StepFacetSinks, StepFacets } from "@mapgen/engine/step-facets.js";
import type { DependencyTagDefinition } from "@mapgen/engine/tags.js";
import type { EmptyObject, ReadonlyDeep } from "type-fest";
import type { Static, TObject, TSchema } from "typebox";
import type { CompileOpsById } from "../compiler/recipe-compile.js";
import type { ArtifactContract } from "./artifact/contract.js";
import type { ArtifactModule } from "./artifact/module.js";
import type { ProvidedArtifactRuntime, RequiredArtifactRuntime } from "./artifact/runtime.js";
import type { DomainOpRuntimeAny, OpsById } from "./bindings.js";
import type {
  StepArtifactsDecl,
  StepArtifactsDeclAny,
  StepContract,
  StepEngineDecl,
} from "./step/contract.js";
import type { StepOpsDecl } from "./step/ops.js";

type ArtifactsByName<T extends readonly ArtifactContract[]> = {
  [Name in T[number]["name"] & string]: Extract<T[number], { name: Name }>;
};

type ArtifactNameOf<T extends readonly ArtifactContract[]> = Extract<
  keyof ArtifactsByName<T>,
  string
>;

type ArtifactByName<T extends readonly ArtifactContract[], K extends string> = Extract<
  T[number],
  { name: K }
>;

type ArtifactContractsOfModules<T extends readonly ArtifactModule[]> = {
  readonly [K in keyof T]: T[K] extends ArtifactModule<infer C> ? C : never;
};

type ArtifactListOrEmpty<T> = T extends readonly ArtifactContract[] ? T : readonly [];

type StepArtifactsSurface<TArtifacts extends StepArtifactsDeclAny | undefined> =
  TArtifacts extends StepArtifactsDecl<infer Requires, infer Provides>
    ? {
        readonly [K in ArtifactNameOf<ArtifactListOrEmpty<Requires>>]: RequiredArtifactRuntime<
          ArtifactByName<ArtifactListOrEmpty<Requires>, K>
        >;
      } & {
        readonly [K in Provides extends readonly ArtifactModule[]
          ? ArtifactNameOf<ArtifactContractsOfModules<Provides>>
          : never]: ProvidedArtifactRuntime<
          ArtifactByName<
            Provides extends readonly ArtifactModule[]
              ? ArtifactContractsOfModules<Provides>
              : readonly [],
            K
          >
        >;
      }
    : {};

type ContextFirstEngineMethod<K extends AuthoredEngineAdapterKey> = EngineAdapter[K] extends (
  ...args: infer Args
) => infer Result
  ? (context: MapContext, ...args: Args) => Result
  : never;

type StepEngineSurface<Engine extends StepEngineDecl | undefined> = Engine extends StepEngineDecl
  ? Readonly<{
      [K in Engine[number]]: ContextFirstEngineMethod<K>;
    }>
  : Readonly<Record<never, never>>;

export type StepDeps<
  TArtifacts extends StepArtifactsDeclAny | undefined,
  TEngine extends StepEngineDecl | undefined = undefined,
> = Readonly<{
  /**
   * Canonical dependency surface for artifacts.
   *
   * Legacy mutable buffer aliases retire into explicit artifact vintages rather
   * than becoming a second dependency authority.
   */
  artifacts: Readonly<StepArtifactsSurface<TArtifacts>>;
  /** Exact occurrence-scoped engine methods declared by the step contract. */
  engine: StepEngineSurface<TEngine>;
}>;

type StepContractAny = StepContract<any, any, any, any, any>;

type StepConfigOfContract<C extends StepContractAny> = Static<C["schema"]>;

type StepArtifactsDeclOfContract<C extends StepContractAny> =
  C extends StepContract<any, any, any, infer A, any> ? A : undefined;

type StepEngineDeclOfContract<C extends StepContractAny> =
  C extends StepContract<any, any, any, any, infer Engine> ? Engine : undefined;

/** Authored step behavior bound to one contract and the canonical map execution context. */
export type StepModule<C extends StepContractAny = StepContractAny, TResult = unknown> = Readonly<{
  contract: C;
  normalize?: (config: unknown, ctx: NormalizeContext) => unknown;
  run: (
    context: MapContext,
    config: unknown,
    ops: unknown,
    deps: StepDeps<StepArtifactsDeclOfContract<C>, StepEngineDeclOfContract<C>>
  ) => TResult | Promise<TResult>;
}> &
  StepFacets<StepConfigOfContract<C>, TResult>;

/** Canonical authored step module accepted by stage composition. */
export type Step<C extends StepContractAny = StepContractAny, TResult = unknown> = StepModule<
  C,
  TResult
>;

export const RESERVED_STAGE_KEY = "knobs" as const;
export type ReservedStageKey = typeof RESERVED_STAGE_KEY;

type StepSurface = Readonly<{
  contract: Readonly<{
    id: string;
    schema: TSchema;
  }>;
}>;

type StepsArray = readonly StepSurface[];
type StepIdOf<TSteps extends StepsArray> = TSteps[number]["contract"]["id"] & string;
type NonReservedStepIdOf<TSteps extends StepsArray> = Exclude<StepIdOf<TSteps>, ReservedStageKey>;

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

/** Compile-time marker for a stage with no authored configuration at this boundary. */
export type EmptyStageConfig = Readonly<EmptyObject>;

type StageRawSteps<StepId extends string> = [StepId] extends [never]
  ? EmptyStageConfig
  : Partial<Record<StepId, unknown>>;

export type StageToInternalResult<StepId extends string, Knobs> = Readonly<{
  knobs: Knobs;
  rawSteps: StageRawSteps<StepId>;
}>;

type StageKnobsOf<KnobsSchema extends TObject | undefined> = KnobsSchema extends TObject
  ? Static<KnobsSchema>
  : EmptyStageConfig;

type StageConfigOf<PublicSchema extends TObject | undefined> = PublicSchema extends TObject
  ? Static<PublicSchema>
  : EmptyStageConfig;

export type StageCompileFn<
  PublicSchema extends TObject | undefined,
  StepId extends string,
  KnobsSchema extends TObject | undefined,
> = (args: {
  setup: MapSetup;
  knobs: StageKnobsOf<KnobsSchema>;
  config: StageConfigOf<PublicSchema>;
}) => [StepId] extends [never] ? EmptyStageConfig : Partial<Record<StepId, unknown>>;

export type StageAuthoringConfigLayer =
  | "configurationless"
  | "semantic-public-config"
  | "internal-step-config";

export type StageAuthoringRuntimeStep<StepId extends string = string> = Readonly<{
  stepId: StepId;
}>;

export type StageAuthoringModel<
  StageId extends string = string,
  StepId extends string = string,
> = Readonly<{
  stageId: StageId;
  config: Readonly<{
    layer: StageAuthoringConfigLayer;
    schema: TObject;
    focusPathsByStepId: Readonly<Partial<Record<StepId, readonly string[]>>>;
  }>;
  runtime: Readonly<{
    steps: readonly StageAuthoringRuntimeStep<StepId>[];
  }>;
}>;

type StageDefBase<
  Id extends string,
  KnobsSchema extends TObject | undefined,
  TSteps extends StepsArray,
> = Readonly<{
  id: Id;
  steps: TSteps;
}> &
  (KnobsSchema extends TObject
    ? Readonly<{ knobsSchema: KnobsSchema }>
    : Readonly<{ knobsSchema?: undefined }>);

type StageDefInternal<
  Id extends string,
  KnobsSchema extends TObject | undefined,
  TSteps extends StepsArray,
> = StageDefBase<Id, KnobsSchema, TSteps> &
  Readonly<{
    public?: undefined;
    compile?: undefined;
  }>;

type StageDefCompiled<
  Id extends string,
  KnobsSchema extends TObject | undefined,
  TSteps extends StepsArray,
> = StageDefBase<Id, KnobsSchema, TSteps> &
  Readonly<{
    public?: undefined;
    compile: StageCompileFn<undefined, NonReservedStepIdOf<TSteps>, KnobsSchema>;
  }>;

type StageDefPublic<
  Id extends string,
  KnobsSchema extends TObject | undefined,
  TSteps extends StepsArray,
  PublicSchema extends TObject,
> = StageDefBase<Id, KnobsSchema, TSteps> &
  Readonly<{
    public: PublicSchema;
    compile: StageCompileFn<PublicSchema, NonReservedStepIdOf<TSteps>, KnobsSchema>;
  }>;

/** Authorship input for one stage's ordered steps and configuration boundary. */
export type StageDef<
  Id extends string,
  KnobsSchema extends TObject | undefined,
  TSteps extends StepsArray = StepsArray,
  PublicSchema extends TObject | undefined = undefined,
  Compiled extends boolean = PublicSchema extends TObject ? true : false,
> = PublicSchema extends TObject
  ? StageDefPublic<Id, KnobsSchema, TSteps, PublicSchema>
  : Compiled extends true
    ? StageDefCompiled<Id, KnobsSchema, TSteps>
    : StageDefInternal<Id, KnobsSchema, TSteps>;

type StageRuntimeView<Id extends string, TSteps extends StepsArray, Knobs> = Readonly<{
  id: Id;
  steps: TSteps;
  surfaceSchema: TObject;
  authoring: StageAuthoringModel<Id, NonReservedStepIdOf<TSteps>>;
  toInternal: (args: {
    setup: MapSetup;
    stageConfig: unknown;
  }) => StageToInternalResult<NonReservedStepIdOf<TSteps>, Knobs>;
}>;

/** Stage contract validated at construction and snapshotted when admitted into a recipe. */
export type StageContract<
  Id extends string,
  KnobsSchema extends TObject | undefined,
  TSteps extends StepsArray = StepsArray,
  PublicSchema extends TObject | undefined = undefined,
  Compiled extends boolean = PublicSchema extends TObject ? true : false,
> = StageDef<Id, KnobsSchema, TSteps, PublicSchema, Compiled> &
  StageRuntimeView<Id, TSteps, StageKnobsOf<KnobsSchema>>;

type LegacyStageCompileFn<PublicSchema extends TObject, StepId extends string, Knobs> = (args: {
  setup: MapSetup;
  knobs: Knobs;
  config: Static<PublicSchema>;
}) => Partial<Record<StepId, unknown>>;

type LegacyStageContract<
  Id extends string,
  KnobsSchema extends TObject,
  Knobs,
  TSteps extends StepsArray,
  PublicSchema extends TObject | undefined,
> = Readonly<{
  id: Id;
  steps: TSteps;
  knobsSchema: KnobsSchema;
}> &
  (PublicSchema extends TObject
    ? Readonly<{
        public: PublicSchema;
        compile: LegacyStageCompileFn<PublicSchema, NonReservedStepIdOf<TSteps>, Knobs>;
      }>
    : Readonly<{
        public?: undefined;
        compile?: undefined;
      }>) &
  StageRuntimeView<Id, TSteps, Knobs>;

type RecipeStepObservation = Readonly<{
  contract: Readonly<{
    id: string;
    schema: TSchema;
    requires: readonly string[];
    provides: readonly string[];
    artifacts?: StepArtifactsDeclAny;
    ops?: StepOpsDecl;
  }>;
  normalize?: (config: unknown, ctx: NormalizeContext) => unknown;
  run: (...args: never[]) => unknown;
  metrics?: (...args: never[]) => unknown;
  viz?: (...args: never[]) => unknown;
}>;

/** Backward-compatible authored stage contract surface retained for SDK consumers. */
export type StageContractAny = LegacyStageContract<any, any, any, any, any>;

/** Normalized stage observation accepted by recipe composition regardless of authoring shape. */
export type StageObservation<
  TSteps extends readonly RecipeStepObservation[] = readonly RecipeStepObservation[],
> = StageRuntimeView<string, TSteps, unknown>;

/** Backward-compatible authored stage alias with its established generic positions. */
export type Stage<
  TSteps extends StepsArray = StepsArray,
  KnobsSchema extends TObject = TObject,
  PublicSchema extends TObject | undefined = TObject | undefined,
> = LegacyStageContract<any, KnobsSchema, Static<KnobsSchema>, TSteps, PublicSchema>;

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

type StageStepsOf<S> = Extract<StepsOfStage<S>, StepsArray>;

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

export type RecipePublicConfigOf<TStages extends readonly unknown[]> = Readonly<{
  [S in StageUnion<TStages> as StageIdOf<S>]: StagePublicConfigOf<S>;
}>;

type CompiledStageConfigOf<S> = [StepIdUnionOfStage<S>] extends [never]
  ? EmptyStageConfig
  : Readonly<{
      [K in StepIdUnionOfStage<S>]: StepConfigRuntimeById<S, K>;
    }>;

export type CompiledRecipeConfigOf<TStages extends readonly unknown[]> = Readonly<{
  [S in StageUnion<TStages> as StageIdOf<S>]: CompiledStageConfigOf<S>;
}>;

type StageList = readonly StageObservation[];

export type RecipeDefinition<TStages extends StageList = StageList> = Readonly<{
  id: string;
  namespace?: string;
  tagDefinitions: readonly DependencyTagDefinition[];
  stages: TStages;
  compileOpsById: CompileOpsById;
  runtimeOpsById?: OpsById<DomainOpRuntimeAny>;
}>;

/** Execution-only observers and logging accepted by synchronous recipe execution. */
export type RecipeExecutionOptions = Readonly<{
  trace?: PlanTraceOptions | null;
  /** Execution-owned consumers for optional post-provides step projections. */
  facets?: StepFacetSinks;
  log?: (message: string) => void;
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
export type RecipeModule<TPublicConfig = RecipeConfig, TConfigCompiled = RecipeConfig> = Readonly<{
  /** Stable recipe identity used in plans, traces, and generated runtime evidence. */
  readonly id: string;
  /** Deep-readonly registered step graph snapshotted when the recipe is authored. */
  readonly recipe: ReadonlyDeep<RecipeV2>;
  /** Compiles public authoring config for inspection under one admitted physical setup snapshot. */
  compileConfig: (setup: MapSetup | MapSetupInput, config: TPublicConfig) => TConfigCompiled;
  /** Compiles an immutable execution plan that retains its admitted setup identity. */
  compile: (setup: MapSetup | MapSetupInput, config: TPublicConfig) => ExecutionPlan;
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

export type StageModule<
  Id extends string = string,
  KnobsSchema extends TObject = TObject,
  Knobs = Static<KnobsSchema>,
  TSteps extends StepsArray = StepsArray,
  PublicSchema extends TObject | undefined = undefined,
> = LegacyStageContract<Id, KnobsSchema, Knobs, TSteps, PublicSchema>;
