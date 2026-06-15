import type { ExtendedMapContext } from "@mapgen/core/types.js";
import { type Static, type TObject, type TSchema, Type } from "typebox";
import { applySchemaConventions, applySchemaDefaults } from "./schema.js";
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
  const props = (input.publicSchema as any)?.properties as Record<string, unknown> | undefined;
  if (props && Object.prototype.hasOwnProperty.call(props, RESERVED_STAGE_KEY)) {
    throw new Error(
      `stage("${input.stageId}") public schema contains reserved key "${RESERVED_STAGE_KEY}"`
    );
  }
}

function objectProperties(schema: TObject): Record<string, TSchema> {
  const props = (schema as any).properties as Record<string, TSchema> | undefined;
  return props ?? {};
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
    knobs: Type.Optional(knobsSchema),
  };
  for (const step of steps) {
    if (step.contract.id === RESERVED_STAGE_KEY) continue;
    properties[step.contract.id] = Type.Optional(step.contract.schema);
  }
  return Type.Object(properties, { additionalProperties: false });
}

function buildPublicSurfaceSchema(publicSchema: TObject, knobsSchema: TObject): TObject {
  const meta: Record<string, unknown> = {};
  const maybeTitle = (publicSchema as any).title;
  if (typeof maybeTitle === "string" && maybeTitle.trim().length > 0) meta.title = maybeTitle;
  const maybeDescription = (publicSchema as any).description;
  if (typeof maybeDescription === "string" && maybeDescription.trim().length > 0) {
    meta.description = maybeDescription;
  }
  const maybeGs = (publicSchema as any).gs;
  if (maybeGs && typeof maybeGs === "object") meta.gs = maybeGs;

  return Type.Object(
    { knobs: Type.Optional(knobsSchema), ...objectProperties(publicSchema) },
    { additionalProperties: false, ...meta }
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

export function createStage(def: any): any {
  const stepIds = (def.steps as ReadonlyArray<{ contract: { id: string } }>).map(
    (step) => step.contract.id
  );
  assertNoReservedStageKeys({ stageId: def.id, stepIds, publicSchema: def.public });
  assertKebabCaseStepIds({ stageId: def.id, stepIds });

  if (def.public && typeof (def as any).compile !== "function") {
    throw new Error(`stage("${def.id}") defines "public" but does not define "compile"`);
  }

  applySchemaConventions(def.knobsSchema, `stage:${def.id}.knobs`);
  if (def.public) applySchemaConventions(def.public, `stage:${def.id}.public`);

  for (const step of def.steps as ReadonlyArray<{ contract: { id: string; schema: unknown } }>) {
    assertSchema(step.contract.schema, step.contract.id, def.id);
  }

  const surfaceSchema = def.public
    ? buildPublicSurfaceSchema(def.public, def.knobsSchema)
    : buildInternalAsPublicSurfaceSchema(def.steps, def.knobsSchema);
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
    const { knobs, ...configPart } = stageConfig as Record<string, unknown>;
    const resolvedKnobs = applySchemaDefaults(def.knobsSchema, knobs);
    const rawSteps = def.public
      ? ((def as any).compile({ env, knobs: resolvedKnobs, config: configPart }) ?? {})
      : configPart;
    if (Object.prototype.hasOwnProperty.call(rawSteps, RESERVED_STAGE_KEY)) {
      throw new Error(`stage("${def.id}") compile returned reserved key "${RESERVED_STAGE_KEY}"`);
    }
    return { knobs: resolvedKnobs, rawSteps };
  };

  return { ...(def as any), surfaceSchema, authoring, toInternal };
}

export function deriveStageAuthoringModel<TStage extends Pick<StageContractAny, "authoring">>(
  stage: TStage
): TStage["authoring"] {
  return stage.authoring;
}
