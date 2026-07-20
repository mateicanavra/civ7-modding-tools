import type { ExtendedMapContext } from "@mapgen/core/types.js";
import {
  ObjectOptions,
  type Static,
  type TObject,
  type TObjectOptions,
  type TSchema,
  Type,
} from "typebox";
import { assertCompleteRecipeConfigSchema } from "./recipe-config-schema.js";
import { applySchemaConventions } from "./schema.js";
import {
  RESERVED_STAGE_KEY,
  type StageAuthoringModel,
  type StageContract,
  type StageContractAny,
  type StageDef,
  type StageToInternalResult,
} from "./types.js";

function assertSchema(value: unknown, stepId?: string, stageId?: string): void {
  if (value == null) {
    const label = stepId ? `step "${stepId}"` : "step";
    const scope = stageId ? ` in stage "${stageId}"` : "";
    throw new Error(`createStage requires an explicit schema for ${label}${scope}`);
  }
}

const STEP_ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function assertKebabCaseStepIds(input: { stageId: string; stepIds: readonly string[] }): void {
  for (const id of input.stepIds) {
    if (!STEP_ID_RE.test(id)) {
      throw new Error(
        `stage("${input.stageId}") step id "${id}" must be kebab-case (e.g. "plot-vegetation")`
      );
    }
  }
}

function assertNoReservedStageKeys(input: {
  stageId: string;
  stepIds: readonly string[];
  publicSchema?: TObject | undefined;
}): void {
  if (input.stepIds.includes(RESERVED_STAGE_KEY)) {
    throw new Error(`stage("${input.stageId}") contains reserved step id "${RESERVED_STAGE_KEY}"`);
  }
  const props = input.publicSchema?.properties;
  if (props && Object.prototype.hasOwnProperty.call(props, RESERVED_STAGE_KEY)) {
    throw new Error(
      `stage("${input.stageId}") public schema contains reserved key "${RESERVED_STAGE_KEY}"`
    );
  }
}

function objectProperties(schema: TObject): Record<string, TSchema> {
  return schema.properties;
}

function buildInternalAsPublicSurfaceSchema(
  steps: readonly Readonly<{
    contract: Readonly<{
      id: string;
      schema: TSchema;
    }>;
  }>[],
  knobsSchema: TObject
): TObject {
  const properties: Record<string, TSchema> = {
    knobs: knobsSchema,
  };
  for (const step of steps) {
    if (step.contract.id === RESERVED_STAGE_KEY) continue;
    properties[step.contract.id] = step.contract.schema;
  }
  return Type.Object(properties, { additionalProperties: false });
}

function buildPublicSurfaceSchema(publicSchema: TObject, knobsSchema: TObject): TObject {
  const source = ObjectOptions(publicSchema);
  const annotations: TObjectOptions = {};
  if (typeof source.title === "string") annotations.title = source.title;
  if (typeof source.description === "string") annotations.description = source.description;
  if (typeof source.readOnly === "boolean") annotations.readOnly = source.readOnly;
  if (typeof source.writeOnly === "boolean") annotations.writeOnly = source.writeOnly;
  if (Object.prototype.hasOwnProperty.call(source, "gs")) annotations.gs = source.gs;
  return Type.Object(
    { knobs: knobsSchema, ...objectProperties(publicSchema) },
    {
      ...annotations,
      additionalProperties: false,
    }
  );
}

function buildStageAuthoringModel(args: {
  stageId: string;
  steps: readonly Readonly<{
    contract: Readonly<{
      id: string;
    }>;
  }>[];
  surfaceSchema: TObject;
  publicSchema?: TObject | undefined;
}): StageAuthoringModel {
  const publicProps = args.publicSchema ? objectProperties(args.publicSchema) : null;
  const focusPathsByStepId = Object.fromEntries(
    args.steps
      .filter((step) => step.contract.id !== RESERVED_STAGE_KEY)
      .map((step) => [
        step.contract.id,
        publicProps === null
          ? [step.contract.id]
          : Object.prototype.hasOwnProperty.call(publicProps, step.contract.id)
            ? [step.contract.id]
            : [],
      ])
  );
  return {
    stageId: args.stageId,
    config: {
      layer: args.publicSchema ? "semantic-public-config" : "internal-step-config",
      schema: args.surfaceSchema,
      focusPathsByStepId,
    },
    runtime: {
      steps: args.steps
        .filter((step) => step.contract.id !== RESERVED_STAGE_KEY)
        .map((step) => ({
          stepId: step.contract.id,
        })),
    },
  };
}

type StepsArray<TContext extends ExtendedMapContext> = readonly Readonly<{
  contract: Readonly<{
    id: string;
    schema: TSchema;
  }>;
}>[];

type RuntimeStageDefinition = Readonly<{
  id: string;
  steps: StepsArray<ExtendedMapContext>;
  knobsSchema: TObject;
  public?: TObject;
  compile?: unknown;
}>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function compilePublicStage(
  compile: unknown,
  args: Readonly<{ env: unknown; knobs: unknown; config: Record<string, unknown> }>
): Record<string, unknown> {
  if (typeof compile !== "function") {
    throw new Error("Public stage requires a compile function");
  }
  const result: unknown = compile(args);
  if (!isRecord(result)) throw new Error("Public stage compile must return an object");
  return result;
}

export function createStage<
  const Id extends string,
  TContext extends ExtendedMapContext,
  const KnobsSchema extends TObject,
  const TSteps extends StepsArray<TContext> = StepsArray<TContext>,
  Knobs = Static<KnobsSchema>,
>(
  def: StageDef<Id, TContext, KnobsSchema, Knobs, TSteps, undefined> & {
    public?: undefined;
    compile?: undefined;
  }
): StageContract<Id, TContext, KnobsSchema, Knobs, TSteps, undefined>;

export function createStage<
  const Id extends string,
  TContext extends ExtendedMapContext,
  const KnobsSchema extends TObject,
  const PublicSchema extends TObject,
  const TSteps extends StepsArray<TContext> = StepsArray<TContext>,
  Knobs = Static<KnobsSchema>,
>(
  def: StageDef<Id, TContext, KnobsSchema, Knobs, TSteps, PublicSchema> & {
    public: PublicSchema;
  }
): StageContract<Id, TContext, KnobsSchema, Knobs, TSteps, PublicSchema>;

export function createStage(def: RuntimeStageDefinition): StageContractAny {
  const stepIds = def.steps.map((step) => step.contract.id);
  assertNoReservedStageKeys({ stageId: def.id, stepIds, publicSchema: def.public });
  assertKebabCaseStepIds({ stageId: def.id, stepIds });

  if (def.public && typeof def.compile !== "function") {
    throw new Error(`stage("${def.id}") defines "public" but does not define "compile"`);
  }

  applySchemaConventions(def.knobsSchema, `stage:${def.id}.knobs`);
  if (def.public) applySchemaConventions(def.public, `stage:${def.id}.public`);

  for (const step of def.steps) {
    assertSchema(step.contract.schema, step.contract.id, def.id);
  }

  const surfaceSchema = def.public
    ? buildPublicSurfaceSchema(def.public, def.knobsSchema)
    : buildInternalAsPublicSurfaceSchema(def.steps, def.knobsSchema);
  assertCompleteRecipeConfigSchema(surfaceSchema, `stage/${def.id}`);
  const authoring = buildStageAuthoringModel({
    stageId: def.id,
    steps: def.steps,
    surfaceSchema,
    publicSchema: def.public,
  });

  const toInternal = ({
    env,
    stageConfig,
  }: {
    env: unknown;
    stageConfig: unknown;
  }): StageToInternalResult<string, unknown> => {
    if (!isRecord(stageConfig)) throw new Error(`stage("${def.id}") config must be an object`);
    const { knobs, ...configPart } = stageConfig;
    const rawSteps = def.public
      ? compilePublicStage(def.compile, { env, knobs, config: configPart })
      : configPart;
    if (Object.prototype.hasOwnProperty.call(rawSteps, RESERVED_STAGE_KEY)) {
      throw new Error(`stage("${def.id}") compile returned reserved key "${RESERVED_STAGE_KEY}"`);
    }
    return { knobs, rawSteps };
  };

  return { ...def, surfaceSchema, authoring, toInternal } as StageContractAny;
}

export function deriveStageAuthoringModel<TStage extends Pick<StageContractAny, "authoring">>(
  stage: TStage
): TStage["authoring"] {
  return stage.authoring;
}
