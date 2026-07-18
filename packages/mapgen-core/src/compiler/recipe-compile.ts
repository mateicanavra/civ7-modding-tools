import type { TObject, TSchema } from "typebox";
import { Value } from "typebox/value";

import type { DomainOpCompileAny } from "../authoring/bindings.js";
import type { StepOpsDecl } from "../authoring/step/ops.js";
import type { CompiledRecipeConfigOf, RecipePublicConfigOf } from "../authoring/types.js";
import { admitMapSetup, type MapSetup, type MapSetupInput } from "../core/map-setup.js";
import type { NormalizeContext } from "../engine/types.js";
import { type CompileErrorItem, RecipeCompileError } from "./errors.js";
import {
  createPortableJsonSnapshot,
  normalizeOpsTopLevel,
  validateSchemaValue,
  validateStrict,
} from "./normalize.js";

export type { CompileErrorCode, CompileErrorItem } from "./errors.js";
export { RecipeCompileError } from "./errors.js";

export type CompileOpsById = Readonly<Record<string, DomainOpCompileAny>>;

export type StepContractAny = Readonly<{
  id: string;
  schema: TSchema;
  ops?: StepOpsDecl;
}>;

export type StepModuleAny = Readonly<{
  contract: StepContractAny;
  normalize?: (config: unknown, ctx: NormalizeContext) => unknown;
}>;

export type StageToInternalResult<StepId extends string = string, Knobs = unknown> = Readonly<{
  knobs: Knobs;
  rawSteps: Partial<Record<StepId, unknown>>;
}>;

export type StageContractAny = Readonly<{
  id: string;
  knobsSchema: TObject;
  public?: TObject;
  surfaceSchema: TSchema;
  authoring?: Readonly<{
    config: Readonly<{
      schema: TSchema;
    }>;
  }>;
  toInternal: (args: { setup: MapSetup; stageConfig: unknown }) => StageToInternalResult;
  steps: readonly StepModuleAny[];
}>;

const RESERVED_STAGE_KEY = "knobs";

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function materializeStageStepConfig<T>(
  schema: TSchema,
  stageOutput: unknown,
  path: string
): { value: T; errors: CompileErrorItem[] } {
  const materialized = Value.Default(
    schema,
    Value.Clone(stageOutput === undefined ? {} : stageOutput)
  );
  return validateStrict<T>(schema, materialized, path);
}

/**
 * Compiles public recipe configuration under one admitted physical setup.
 *
 * Raw setup input is admitted once before setup-dependent stage and step normalization. Domain
 * operations normalize configuration only. The returned config carries normalized values rather
 * than setup identity; execution-plan admission binds those values to the exact setup later
 * enforced against the runtime context.
 */
export function compileRecipeConfig<const TStages extends readonly StageContractAny[]>(args: {
  setup: MapSetup | MapSetupInput;
  recipe: Readonly<{ stages: TStages }>;
  config: RecipePublicConfigOf<TStages>;
  compileOpsById: CompileOpsById;
}): CompiledRecipeConfigOf<TStages> {
  const errors: CompileErrorItem[] = [];
  const out: Record<string, Record<string, unknown>> = {};

  const setup = admitMapSetup(args.setup);
  const recipe = args.recipe as Readonly<{ stages: readonly StageContractAny[] }>;
  const configSnapshot = createPortableJsonSnapshot(args.config, "/config");
  if (!configSnapshot.ok) {
    throw new RecipeCompileError([
      {
        code: "config.invalid",
        path: configSnapshot.path,
        message: configSnapshot.message,
      },
    ]);
  }
  const configValue = configSnapshot.value;
  if (!isRecord(configValue)) {
    throw new RecipeCompileError([
      {
        code: "config.invalid",
        path: "/config",
        message: "Expected object",
      },
    ]);
  }
  const config = configValue;
  const compileOpsById = args.compileOpsById;
  const declaredStageIds = new Set(recipe.stages.map((stage) => stage.id));

  for (const stageKey of Object.keys(config)) {
    if (declaredStageIds.has(stageKey)) continue;
    errors.push({
      code: "config.invalid",
      path: `/config/${stageKey}`,
      message: `Unknown stage id "${stageKey}"`,
    });
  }

  for (const stage of recipe.stages) {
    const stageId = stage.id;
    const stagePath = `/config/${stageId}`;
    const configSchema = stage.authoring?.config.schema ?? stage.surfaceSchema;

    const { value: stageConfig, errors: stageErrors } = validateSchemaValue(
      configSchema as TSchema,
      config[stageId],
      stagePath
    );
    if (stageErrors.length > 0) {
      errors.push(...stageErrors.map((e) => ({ ...e, stageId })));
      continue;
    }

    let internal: StageToInternalResult;
    try {
      internal = stage.toInternal({ setup, stageConfig });
    } catch (err) {
      errors.push({
        code: "stage.compile.failed",
        path: stagePath,
        message: err instanceof Error ? err.message : "stage.compile/toInternal failed",
        stageId,
      });
      continue;
    }

    const stageOut: Record<string, unknown> = {};
    const { knobs, rawSteps } = internal;

    if (stage.steps.some((step) => step.contract.id === RESERVED_STAGE_KEY)) {
      errors.push({
        code: "stage.unknown-step-id",
        path: `${stagePath}/${RESERVED_STAGE_KEY}`,
        message: `Step id "${RESERVED_STAGE_KEY}" is reserved; choose a different step id`,
        stageId,
        stepId: RESERVED_STAGE_KEY,
      });
      continue;
    }

    const declaredStepIds = new Set(
      stage.steps.map((step) => step.contract.id).filter((id) => id !== RESERVED_STAGE_KEY)
    );
    const unknownStepIds = Object.keys((rawSteps ?? {}) as Record<string, unknown>).filter(
      (id) => id !== RESERVED_STAGE_KEY && !declaredStepIds.has(id)
    );
    if (unknownStepIds.length > 0) {
      for (const id of unknownStepIds) {
        errors.push({
          code: "stage.unknown-step-id",
          path: `${stagePath}/${id}`,
          message: `Unknown step id "${id}" returned by stage.compile/toInternal (must be declared in stage.steps)`,
          stageId,
          stepId: id,
        });
      }
      continue;
    }

    for (const step of stage.steps) {
      const stepId = step.contract.id;
      const stepPath = `${stagePath}/${stepId}`;

      const { value: strict1, errors: strict1Errors } = materializeStageStepConfig(
        step.contract.schema as TSchema,
        (rawSteps as Record<string, unknown> | undefined)?.[stepId],
        stepPath
      );
      if (strict1Errors.length > 0) {
        errors.push(...strict1Errors.map((e) => ({ ...e, stageId, stepId })));
        continue;
      }

      let normalized: unknown = strict1;
      if (typeof step.normalize === "function") {
        let next: unknown;
        try {
          next = step.normalize(normalized, { setup, knobs });
        } catch (err) {
          errors.push({
            code: "step.normalize.failed",
            path: stepPath,
            message: err instanceof Error ? err.message : "step.normalize failed",
            stageId,
            stepId,
          });
          continue;
        }

        const { value: strict2, errors: strict2Errors } = validateStrict(
          step.contract.schema as TSchema,
          next,
          stepPath
        );
        if (strict2Errors.length > 0) {
          errors.push(...strict2Errors.map((e) => ({ ...e, stageId, stepId })));
          errors.push({
            code: "normalize.not.shape-preserving",
            path: stepPath,
            message:
              "step.normalize returned a value that does not validate against the step schema",
            stageId,
            stepId,
          });
          continue;
        }
        normalized = strict2;
      }

      const { value: opNormalized, errors: opNormErrors } = normalizeOpsTopLevel(
        step,
        normalized as Record<string, unknown>,
        compileOpsById,
        stepPath
      );
      if (opNormErrors.length > 0) {
        errors.push(...opNormErrors.map((e) => ({ ...e, stageId, stepId })));
        continue;
      }

      const { value: strict3, errors: strict3Errors } = validateStrict(
        step.contract.schema as TSchema,
        opNormalized,
        stepPath
      );
      if (strict3Errors.length > 0) {
        errors.push(...strict3Errors.map((e) => ({ ...e, stageId, stepId })));
        continue;
      }

      stageOut[stepId] = strict3;
    }

    out[stageId] = stageOut;
  }

  if (errors.length > 0) throw new RecipeCompileError(errors);
  return out as CompiledRecipeConfigOf<TStages>;
}
