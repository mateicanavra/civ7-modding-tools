import type { ExtendedMapContext } from "@mapgen/core/types.js";

import type {
  Env,
  ExecutionPlan,
  NormalizeContext,
  RecipeV2,
  RunRequest,
} from "@mapgen/engine/index.js";
import type { StepFacetSinks, StepFacets } from "@mapgen/engine/step-facets.js";
import type { DependencyTagDefinition } from "@mapgen/engine/tags.js";
import type { TraceSession, TraceSink } from "@mapgen/trace/index.js";
import type { Static, TObject, TSchema } from "typebox";
import type { CompileOpsById } from "../compiler/recipe-compile.js";
import type { ArtifactContract } from "./artifact/contract.js";
import type { ArtifactModule } from "./artifact/module.js";
import type { ProvidedArtifactRuntime, RequiredArtifactRuntime } from "./artifact/runtime.js";
import type { DomainOpRuntimeAny, OpsById } from "./bindings.js";
import type { StepArtifactsDecl, StepArtifactsDeclAny, StepContract } from "./step/contract.js";

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

/** Provider runtimes keyed by the artifact names carried by a step's admitted modules. */
export type StepProvidedArtifactsRuntime<
  TContext extends ExtendedMapContext,
  TArtifacts extends StepArtifactsDeclAny | undefined,
> =
  TArtifacts extends StepArtifactsDecl<any, infer Provides>
    ? Provides extends readonly ArtifactModule[]
      ? {
          [K in ArtifactNameOf<ArtifactContractsOfModules<Provides>>]: ProvidedArtifactRuntime<
            ArtifactByName<ArtifactContractsOfModules<Provides>, K>,
            TContext
          >;
        }
      : {}
    : {};

/** Runtime publication surface derived by `createStep` from the author's artifact modules. */
export type StepArtifactRuntimes<
  TContext extends ExtendedMapContext,
  TArtifacts extends StepArtifactsDeclAny | undefined,
> =
  TArtifacts extends StepArtifactsDecl<any, infer Provides>
    ? [Provides] extends [undefined]
      ? Readonly<{ artifacts?: never }>
      : Provides extends readonly []
        ? Readonly<{ artifacts?: never }>
        : Provides extends readonly ArtifactModule[]
          ? number extends Provides["length"]
            ? Readonly<{
                artifacts?: StepProvidedArtifactsRuntime<TContext, TArtifacts>;
              }>
            : Readonly<{
                artifacts: StepProvidedArtifactsRuntime<TContext, TArtifacts>;
              }>
          : Readonly<{ artifacts?: never }>
    : Readonly<{ artifacts?: never }>;

type ArtifactListOrEmpty<T> = T extends readonly ArtifactContract[] ? T : readonly [];

type StepArtifactsSurface<
  TContext extends ExtendedMapContext,
  TArtifacts extends StepArtifactsDeclAny | undefined,
> =
  TArtifacts extends StepArtifactsDecl<infer Requires, infer Provides>
    ? {
        [K in ArtifactNameOf<ArtifactListOrEmpty<Requires>>]: RequiredArtifactRuntime<
          ArtifactByName<ArtifactListOrEmpty<Requires>, K>,
          TContext
        >;
      } & {
        [K in Provides extends readonly ArtifactModule[]
          ? ArtifactNameOf<ArtifactContractsOfModules<Provides>>
          : never]: ProvidedArtifactRuntime<
          ArtifactByName<
            Provides extends readonly ArtifactModule[]
              ? ArtifactContractsOfModules<Provides>
              : readonly [],
            K
          >,
          TContext
        >;
      }
    : {};

export type StepDeps<
  TContext extends ExtendedMapContext,
  TArtifacts extends StepArtifactsDeclAny | undefined,
> = Readonly<{
  /**
   * Canonical dependency surface for artifacts.
   *
   * Legacy mutable buffer aliases retire into explicit artifact vintages rather
   * than becoming a second dependency authority.
   */
  artifacts: StepArtifactsSurface<TContext, TArtifacts>;
}>;

type StepContractAny = StepContract<any, any, any, any>;

type StepConfigOfContract<C extends StepContractAny> = Static<C["schema"]>;

type StepArtifactsDeclOfContract<C extends StepContractAny> =
  C extends StepContract<any, any, any, infer A> ? A : undefined;

export type StepModule<
  TContext extends ExtendedMapContext = ExtendedMapContext,
  C extends StepContractAny = StepContractAny,
  TResult = unknown,
> = Readonly<{
  contract: C;
  normalize?: (config: unknown, ctx: NormalizeContext) => unknown;
  run: (
    context: TContext,
    config: unknown,
    ops: unknown,
    deps: StepDeps<TContext, StepArtifactsDeclOfContract<C>>
  ) => TResult | Promise<TResult>;
}> &
  StepFacets<StepConfigOfContract<C>, TResult> &
  StepArtifactRuntimes<TContext, StepArtifactsDeclOfContract<C>>;

export type Step<
  TContext extends ExtendedMapContext = ExtendedMapContext,
  C extends StepContractAny = StepContractAny,
  TResult = unknown,
> = StepModule<TContext, C, TResult>;

export const RESERVED_STAGE_KEY = "knobs" as const;
export type ReservedStageKey = typeof RESERVED_STAGE_KEY;

type StepSurface = Readonly<{
  contract: Readonly<{
    id: string;
    schema: TSchema;
  }>;
}>;

type StepsArray<TContext extends ExtendedMapContext> = readonly StepSurface[];
type StepIdOf<TSteps extends StepsArray<any>> = TSteps[number]["contract"]["id"] & string;
type NonReservedStepIdOf<TSteps extends StepsArray<any>> = Exclude<
  StepIdOf<TSteps>,
  ReservedStageKey
>;

type StepSchemaOf<TStep> = TStep extends { contract: { schema: infer Schema } } ? Schema : never;

type StepConfigRuntimeOf<TStep> =
  StepSchemaOf<TStep> extends TSchema ? Static<StepSchemaOf<TStep>> : unknown;

type StepIdOfStep<TStep> = TStep extends { contract: { id: infer Id } } ? Id & string : never;

type StepConfigsById<TSteps extends readonly unknown[]> = Readonly<{
  [S in TSteps[number] as StepIdOfStep<S> extends ReservedStageKey
    ? never
    : StepIdOfStep<S>]: StepConfigRuntimeOf<S>;
}>;

export type StageToInternalResult<StepId extends string, Knobs> = Readonly<{
  knobs: Knobs;
  rawSteps: Partial<Record<StepId, unknown>>;
}>;

export type StageCompileFn<PublicSchema extends TObject, StepId extends string, Knobs> = (args: {
  env: unknown;
  knobs: Knobs;
  config: Static<PublicSchema>;
}) => Partial<Record<StepId, unknown>>;

export type StageAuthoringConfigLayer = "semantic-public-config" | "internal-step-config";

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
  TContext extends ExtendedMapContext,
  KnobsSchema extends TObject,
  Knobs,
  TSteps extends StepsArray<TContext>,
> = Readonly<{
  id: Id;
  steps: TSteps;
  knobsSchema: KnobsSchema;
}>;

type StageDefInternal<
  Id extends string,
  TContext extends ExtendedMapContext,
  KnobsSchema extends TObject,
  Knobs,
  TSteps extends StepsArray<TContext>,
> = StageDefBase<Id, TContext, KnobsSchema, Knobs, TSteps> &
  Readonly<{
    public?: undefined;
    compile?: undefined;
  }>;

type StageDefPublic<
  Id extends string,
  TContext extends ExtendedMapContext,
  KnobsSchema extends TObject,
  Knobs,
  TSteps extends StepsArray<TContext>,
  PublicSchema extends TObject,
> = StageDefBase<Id, TContext, KnobsSchema, Knobs, TSteps> &
  Readonly<{
    public: PublicSchema;
    compile: StageCompileFn<PublicSchema, NonReservedStepIdOf<TSteps>, Knobs>;
  }>;

export type StageDef<
  Id extends string,
  TContext extends ExtendedMapContext,
  KnobsSchema extends TObject,
  Knobs = Static<KnobsSchema>,
  TSteps extends StepsArray<TContext> = StepsArray<TContext>,
  PublicSchema extends TObject | undefined = undefined,
> = PublicSchema extends TObject
  ? StageDefPublic<Id, TContext, KnobsSchema, Knobs, TSteps, PublicSchema>
  : StageDefInternal<Id, TContext, KnobsSchema, Knobs, TSteps>;

export type StageContract<
  Id extends string,
  TContext extends ExtendedMapContext,
  KnobsSchema extends TObject,
  Knobs = Static<KnobsSchema>,
  TSteps extends StepsArray<TContext> = StepsArray<TContext>,
  PublicSchema extends TObject | undefined = undefined,
> = StageDef<Id, TContext, KnobsSchema, Knobs, TSteps, PublicSchema> &
  Readonly<{
    surfaceSchema: TObject;
    authoring: StageAuthoringModel<Id, NonReservedStepIdOf<TSteps>>;
    toInternal: (args: {
      env: unknown;
      stageConfig: unknown;
    }) => StageToInternalResult<NonReservedStepIdOf<TSteps>, Knobs>;
  }>;

export type StageContractAny = StageContract<any, ExtendedMapContext, any, any, any, any>;

export type Stage<
  TContext extends ExtendedMapContext = ExtendedMapContext,
  TSteps extends StepsArray<TContext> = StepsArray<TContext>,
  KnobsSchema extends TObject = TObject,
  PublicSchema extends TObject | undefined = TObject | undefined,
> = StageContract<any, TContext, KnobsSchema, Static<KnobsSchema>, TSteps, PublicSchema>;

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

type StageStepsOf<S> = Extract<StepsOfStage<S>, StepsArray<any>>;

type StageKnobsSchemaOf<S> = S extends { knobsSchema: infer KS } ? KS : never;

type StagePublicSchemaOf<S> = S extends { public: infer PS } ? PS : never;

type StageHasPublic<S> = S extends { public: TObject } ? true : false;

type StagePublicConfigOf<S> = S extends {
  knobsSchema: TObject;
  steps: readonly unknown[];
}
  ? Readonly<{
      knobs: Static<Extract<StageKnobsSchemaOf<S>, TObject>>;
    }> &
      (StageHasPublic<S> extends true
        ? Static<Extract<StagePublicSchemaOf<S>, TObject>>
        : StepConfigsById<StageStepsOf<S>>)
  : never;

type StageUnion<TStages extends readonly unknown[]> = TStages[number];

export type RecipePublicConfigOf<TStages extends readonly unknown[]> = Readonly<{
  [S in StageUnion<TStages> as StageIdOf<S>]: StagePublicConfigOf<S>;
}>;

export type CompiledRecipeConfigOf<TStages extends readonly unknown[]> = Readonly<{
  [S in StageUnion<TStages> as StageIdOf<S>]: Readonly<{
    [K in StepIdUnionOfStage<S>]: StepConfigRuntimeById<S, K>;
  }>;
}>;

type StageListOf<TContext extends ExtendedMapContext> = readonly StageContract<
  any,
  TContext,
  any,
  any,
  any,
  any
>[];

export type RecipeDefinition<
  TContext extends ExtendedMapContext = ExtendedMapContext,
  TStages extends StageListOf<TContext> = StageListOf<TContext>,
> = Readonly<{
  id: string;
  namespace?: string;
  tagDefinitions: readonly DependencyTagDefinition<TContext>[];
  stages: TStages;
  compileOpsById: CompileOpsById;
  runtimeOpsById?: OpsById<DomainOpRuntimeAny>;
}>;

export type RecipeModule<
  TContext extends ExtendedMapContext = ExtendedMapContext,
  TPublicConfig = RecipeConfig,
  TConfigCompiled = RecipeConfig,
> = {
  readonly id: string;
  readonly recipe: RecipeV2;
  instantiate: (config: TConfigCompiled) => RecipeV2;
  compileConfig: (env: Env, config: TPublicConfig) => TConfigCompiled;
  runRequest: (env: Env, config: TConfigCompiled) => RunRequest;
  compile: (env: Env, config: TPublicConfig) => ExecutionPlan;
  run: (
    context: TContext,
    env: Env,
    config: TPublicConfig,
    options?: {
      trace?: TraceSession | null;
      traceSink?: TraceSink | null;
      /** Execution-owned consumers for optional post-provides step projections. */
      facets?: StepFacetSinks;
      log?: (message: string) => void;
    }
  ) => void;
  runAsync: (
    context: TContext,
    env: Env,
    config: TPublicConfig,
    options?: {
      trace?: TraceSession | null;
      traceSink?: TraceSink | null;
      /** Execution-owned consumers for optional post-provides step projections. */
      facets?: StepFacetSinks;
      log?: (message: string) => void;
      abortSignal?: { readonly aborted: boolean } | null;
      yieldToEventLoop?: boolean;
      yieldFn?: (() => Promise<void>) | null;
    }
  ) => Promise<void>;
};

export type StageModule<
  TContext extends ExtendedMapContext = ExtendedMapContext,
  Id extends string = string,
  KnobsSchema extends TObject = TObject,
  Knobs = Static<KnobsSchema>,
  TSteps extends StepsArray<TContext> = StepsArray<TContext>,
  PublicSchema extends TObject | undefined = undefined,
> = StageContract<Id, TContext, KnobsSchema, Knobs, TSteps, PublicSchema>;
