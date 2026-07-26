import type { MapSetup } from "@mapgen/core/map-setup.js";
import {
  IsObject,
  ObjectOptions,
  type TObject,
  type TObjectOptions,
  type TSchema,
  Type,
} from "typebox";
import { Value } from "typebox/value";
import { assertCompleteConfigSchema } from "../schema/config.js";
import { applySchemaConventions } from "../schema/conventions.js";
import { assertStageId } from "./identity.js";
import { RESERVED_STAGE_KEY } from "./reserved-key.js";
import {
  type EmptyStageConfig,
  type StageAuthoringModel,
  type StageContract,
  type StageDef,
  type StageObservation,
  type StageStepList,
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

const EMPTY_STAGE_SCHEMA = Type.Object({}, { additionalProperties: false });
const EMPTY_STAGE_VALUE: EmptyStageConfig = Object.freeze({});

function stageSurfaceDescription(stageId: string, propertyCount: number): string {
  return propertyCount === 0
    ? `The "${stageId}" recipe stage has no author-facing configuration.`
    : `Author-facing configuration for the "${stageId}" recipe stage.`;
}

function internalStepSurfaceDescription(stageId: string, stepId: string): string {
  return `Author-facing configuration for the "${stepId}" step in the "${stageId}" recipe stage.`;
}

function describeInternalStepSurface(stageId: string, stepId: string, schema: TSchema): TSchema {
  let description: unknown;
  if (IsObject(schema)) {
    description = ObjectOptions(schema).description;
  }
  return Type.With(schema, {
    description:
      typeof description === "string" && description.trim().length > 0
        ? description
        : internalStepSurfaceDescription(stageId, stepId),
  });
}

function buildInternalAsPublicSurfaceSchema(
  stageId: string,
  steps: readonly Readonly<{
    contract: Readonly<{
      id: string;
      schema: TSchema;
    }>;
  }>[],
  knobsSchema?: TObject
): TObject {
  const properties: Record<string, TSchema> = {};
  if (knobsSchema) properties.knobs = knobsSchema;
  for (const step of steps) {
    if (step.contract.id === RESERVED_STAGE_KEY || hasClosedEmptyStepConfig(step)) continue;
    properties[step.contract.id] = describeInternalStepSurface(
      stageId,
      step.contract.id,
      step.contract.schema
    );
  }
  const propertyCount = Object.keys(properties).length;
  return Type.Object(properties, {
    additionalProperties: false,
    description: stageSurfaceDescription(stageId, propertyCount),
  });
}

function buildPublicSurfaceSchema(
  stageId: string,
  publicSchema: TObject,
  knobsSchema?: TObject
): TObject {
  const source = ObjectOptions(publicSchema);
  const properties = {
    ...(knobsSchema ? { knobs: knobsSchema } : {}),
    ...objectProperties(publicSchema),
  };
  const annotations: TObjectOptions = {};
  if (typeof source.title === "string") annotations.title = source.title;
  annotations.description =
    typeof source.description === "string"
      ? source.description
      : stageSurfaceDescription(stageId, Object.keys(properties).length);
  if (typeof source.readOnly === "boolean") annotations.readOnly = source.readOnly;
  if (typeof source.writeOnly === "boolean") annotations.writeOnly = source.writeOnly;
  if (Object.prototype.hasOwnProperty.call(source, "gs")) annotations.gs = source.gs;
  return Type.Object(properties, {
    ...annotations,
    additionalProperties: false,
  });
}

function buildStageAuthoringModel(args: {
  stageId: string;
  steps: readonly Readonly<{
    contract: Readonly<{
      id: string;
    }>;
  }>[];
  surfaceSchema: TObject;
  compiled: boolean;
}): StageAuthoringModel {
  const surfaceProps = objectProperties(args.surfaceSchema);
  const focusPathsByStepId = Object.fromEntries(
    args.steps
      .filter((step) => step.contract.id !== RESERVED_STAGE_KEY)
      .map((step) => [
        step.contract.id,
        Object.prototype.hasOwnProperty.call(surfaceProps, step.contract.id)
          ? [step.contract.id]
          : [],
      ])
  );
  const hasInternalStepConfig =
    !args.compiled &&
    Object.keys(focusPathsByStepId).some((id) => focusPathsByStepId[id]!.length > 0);
  const layer =
    Object.keys(surfaceProps).length === 0
      ? "configurationless"
      : hasInternalStepConfig
        ? "internal-step-config"
        : "semantic-public-config";
  return {
    stageId: args.stageId,
    config: {
      layer,
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

type RuntimeStageDefinition = Readonly<{
  id: string;
  steps: StageStepList;
  knobsSchema?: TObject;
  public?: TObject;
  compile?: unknown;
}>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasClosedEmptyStepConfig(step: StageStepList[number]): boolean {
  const schema = step.contract.schema;
  const patternProperties = IsObject(schema) ? ObjectOptions(schema).patternProperties : undefined;
  return (
    IsObject(schema) &&
    ObjectOptions(schema).additionalProperties === false &&
    Object.keys(schema.properties).length === 0 &&
    (!patternProperties || Object.keys(patternProperties).length === 0) &&
    Value.Check(schema, EMPTY_STAGE_VALUE)
  );
}

function compileStage(
  compile: unknown,
  args: Readonly<{ setup: MapSetup; knobs: unknown; config: Record<string, unknown> }>
): Record<string, unknown> {
  if (typeof compile !== "function") {
    throw new Error("Compiled stage requires a compile function");
  }
  const result: unknown = compile(args);
  if (!isRecord(result)) throw new Error("Stage compile must return an object");
  return result;
}

/**
 * Defines a recipe stage and its declared step surface.
 *
 * A compile function marks one semantic authoring boundary. When every step has a closed empty
 * schema, the stage infers the same boundary and persists only its real knobs, if any, instead of
 * requiring a compile function that manufactures empty step objects. Omitted knobs stay absent
 * from authored configuration while compilation and normalization receive one frozen empty value.
 * Internal stages with authored step fields pass those fields through without another authority.
 */
export function createStage<
  const Id extends string,
  const TSteps extends StageStepList = StageStepList,
>(
  def: StageDef<Id, undefined, TSteps, undefined, false> & {
    knobsSchema?: undefined;
    public?: undefined;
    compile?: undefined;
  }
): StageContract<Id, undefined, TSteps, undefined, false>;

export function createStage<
  const Id extends string,
  const KnobsSchema extends TObject,
  const TSteps extends StageStepList = StageStepList,
>(
  def: StageDef<Id, KnobsSchema, TSteps, undefined, false> & {
    public?: undefined;
    compile?: undefined;
  }
): StageContract<Id, KnobsSchema, TSteps, undefined, false>;

export function createStage<
  const Id extends string,
  const TSteps extends StageStepList = StageStepList,
>(
  def: StageDef<Id, undefined, TSteps, undefined, true> & {
    knobsSchema?: undefined;
    public?: undefined;
  }
): StageContract<Id, undefined, TSteps, undefined, true>;

export function createStage<
  const Id extends string,
  const KnobsSchema extends TObject,
  const TSteps extends StageStepList = StageStepList,
>(
  def: StageDef<Id, KnobsSchema, TSteps, undefined, true> & {
    public?: undefined;
  }
): StageContract<Id, KnobsSchema, TSteps, undefined, true>;

export function createStage<
  const Id extends string,
  const KnobsSchema extends TObject,
  const PublicSchema extends TObject,
  const TSteps extends StageStepList = StageStepList,
>(
  def: StageDef<Id, KnobsSchema, TSteps, PublicSchema, true> & {
    public: PublicSchema;
  }
): StageContract<Id, KnobsSchema, TSteps, PublicSchema, true>;

export function createStage<
  const Id extends string,
  const PublicSchema extends TObject,
  const TSteps extends StageStepList = StageStepList,
>(
  def: StageDef<Id, undefined, TSteps, PublicSchema, true> & {
    knobsSchema?: undefined;
    public: PublicSchema;
  }
): StageContract<Id, undefined, TSteps, PublicSchema, true>;

export function createStage(def: RuntimeStageDefinition): StageObservation {
  const stageId = def.id;
  const isCompiled = typeof def.compile === "function";
  const compile = def.compile;
  const stepIds = def.steps.map((step) => step.contract.id);
  assertStageId(stageId);
  assertNoReservedStageKeys({ stageId, stepIds, publicSchema: def.public });
  assertKebabCaseStepIds({ stageId, stepIds });

  if (def.public && !isCompiled) {
    throw new Error(`stage("${stageId}") defines "public" but does not define "compile"`);
  }

  if (def.knobsSchema) applySchemaConventions(def.knobsSchema);
  if (def.public) applySchemaConventions(def.public);

  for (const step of def.steps) {
    assertSchema(step.contract.schema, step.contract.id, stageId);
  }

  const surfaceSchema = isCompiled
    ? buildPublicSurfaceSchema(stageId, def.public ?? EMPTY_STAGE_SCHEMA, def.knobsSchema)
    : buildInternalAsPublicSurfaceSchema(stageId, def.steps, def.knobsSchema);
  assertCompleteConfigSchema(surfaceSchema, `stage/${def.id}`);
  const authoring = buildStageAuthoringModel({
    stageId,
    steps: def.steps,
    surfaceSchema,
    compiled: isCompiled,
  });

  const toInternal = ({
    setup,
    stageConfig,
  }: {
    setup: MapSetup;
    stageConfig: unknown;
  }): StageToInternalResult<string, unknown> => {
    if (!isRecord(stageConfig)) throw new Error(`stage("${stageId}") config must be an object`);
    const { knobs: authoredKnobs, ...configPart } = stageConfig;
    const knobs = def.knobsSchema ? authoredKnobs : EMPTY_STAGE_VALUE;
    const config = def.public ? configPart : EMPTY_STAGE_VALUE;
    const rawSteps = isCompiled ? compileStage(compile, { setup, knobs, config }) : configPart;
    if (Object.prototype.hasOwnProperty.call(rawSteps, RESERVED_STAGE_KEY)) {
      throw new Error(`stage("${stageId}") compile returned reserved key "${RESERVED_STAGE_KEY}"`);
    }
    return { knobs, rawSteps };
  };

  return { ...def, surfaceSchema, authoring, toInternal } as StageObservation;
}

/**
 * Projects the stable authoring metadata attached when a stage is admitted.
 *
 * Consumers use this view to describe author-facing configuration without inspecting the stage's
 * compile function or rebuilding its step-to-config focus paths.
 */
export function deriveStageAuthoringModel<TStage extends Pick<StageObservation, "authoring">>(
  stage: TStage
): TStage["authoring"] {
  return stage.authoring;
}
