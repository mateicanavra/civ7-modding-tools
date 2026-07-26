import type { MapSetup } from "@mapgen/core/map-setup.js";
import type { NormalizeContext } from "@mapgen/engine/types.js";
import type { EmptyObject } from "type-fest";
import type { Static, TObject, TSchema } from "typebox";

import type { StepArtifactsDeclAny } from "../step/contract.js";
import type { StepOpsDecl } from "../step/ops.js";
import type { ReservedStageKey } from "./reserved-key.js";

/** Minimal step contract observed by stage composition and recipe config projection. */
type StageStepSurface = Readonly<{
  contract: Readonly<{
    id: string;
    schema: TSchema;
  }>;
}>;

/** @internal Ordered authored steps admitted by a stage definition. */
export type StageStepList = readonly StageStepSurface[];

type StepIdOf<TSteps extends StageStepList> = TSteps[number]["contract"]["id"] & string;
type NonReservedStepIdOf<TSteps extends StageStepList> = Exclude<
  StepIdOf<TSteps>,
  ReservedStageKey
>;

/** Compile-time marker for a stage with no authored configuration at this boundary. */
export type EmptyStageConfig = Readonly<EmptyObject>;

type StageRawSteps<StepId extends string> = [StepId] extends [never]
  ? EmptyStageConfig
  : Partial<Record<StepId, unknown>>;

/** Internal stage compilation result containing admitted knobs and raw per-step configuration. */
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

/** Maps one stage's authored surface into its internal step configuration boundary. */
type StageCompileFn<
  PublicSchema extends TObject | undefined,
  StepId extends string,
  KnobsSchema extends TObject | undefined,
> = (args: {
  setup: MapSetup;
  knobs: StageKnobsOf<KnobsSchema>;
  config: StageConfigOf<PublicSchema>;
}) => [StepId] extends [never] ? EmptyStageConfig : Partial<Record<StepId, unknown>>;

/** Author-facing configuration layer exposed by one stage. */
export type StageAuthoringConfigLayer =
  | "configurationless"
  | "semantic-public-config"
  | "internal-step-config";

/** Runtime step identity projected into generated stage-authoring metadata. */
export type StageAuthoringRuntimeStep<StepId extends string = string> = Readonly<{
  stepId: StepId;
}>;

/** Stable metadata describing one stage's authoring surface and runtime step order. */
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
  TSteps extends StageStepList,
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
  TSteps extends StageStepList,
> = StageDefBase<Id, KnobsSchema, TSteps> &
  Readonly<{
    public?: undefined;
    compile?: undefined;
  }>;

type StageDefCompiled<
  Id extends string,
  KnobsSchema extends TObject | undefined,
  TSteps extends StageStepList,
> = StageDefBase<Id, KnobsSchema, TSteps> &
  Readonly<{
    public?: undefined;
    compile: StageCompileFn<undefined, NonReservedStepIdOf<TSteps>, KnobsSchema>;
  }>;

type StageDefPublic<
  Id extends string,
  KnobsSchema extends TObject | undefined,
  TSteps extends StageStepList,
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
  TSteps extends StageStepList = StageStepList,
  PublicSchema extends TObject | undefined = undefined,
  Compiled extends boolean = PublicSchema extends TObject ? true : false,
> = PublicSchema extends TObject
  ? StageDefPublic<Id, KnobsSchema, TSteps, PublicSchema>
  : Compiled extends true
    ? StageDefCompiled<Id, KnobsSchema, TSteps>
    : StageDefInternal<Id, KnobsSchema, TSteps>;

type StageRuntimeView<Id extends string, TSteps extends StageStepList, Knobs> = Readonly<{
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
  TSteps extends StageStepList = StageStepList,
  PublicSchema extends TObject | undefined = undefined,
  Compiled extends boolean = PublicSchema extends TObject ? true : false,
> = StageDef<Id, KnobsSchema, TSteps, PublicSchema, Compiled> &
  StageRuntimeView<Id, TSteps, StageKnobsOf<KnobsSchema>>;

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

/** Normalized stage observation accepted by recipe composition regardless of authoring shape. */
export type StageObservation<
  TSteps extends readonly RecipeStepObservation[] = readonly RecipeStepObservation[],
> = StageRuntimeView<string, TSteps, unknown>;
