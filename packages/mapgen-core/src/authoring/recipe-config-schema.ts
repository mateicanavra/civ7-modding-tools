import {
  IsArray,
  IsBoolean,
  IsCyclic,
  IsDeferred,
  IsEnum,
  IsInteger,
  IsIntersect,
  IsLiteral,
  IsNull,
  IsNumber,
  IsObject,
  IsOptional,
  IsRecord,
  IsRef,
  IsString,
  IsTemplateLiteral,
  IsTuple,
  IsUnion,
  ObjectOptions,
  RecordValue,
  type TObject,
  type TSchema,
  Type,
} from "typebox";
import { Guard } from "typebox/guard";
import { IsDefault } from "typebox/schema";

import type { StageContractAny } from "./types.js";

type StageStepLike = Readonly<{ contract: Readonly<{ id: string; schema: TSchema }> }>;
type StageLike = Pick<StageContractAny, "id" | "surfaceSchema" | "knobsSchema" | "steps"> &
  Readonly<{
    public?: unknown;
    authoring?: StageContractAny["authoring"];
    steps: readonly StageStepLike[];
  }>;

function isPortableScalar(schema: TSchema): boolean {
  return (
    IsBoolean(schema) ||
    IsEnum(schema) ||
    IsInteger(schema) ||
    IsNull(schema) ||
    IsNumber(schema) ||
    IsString(schema) ||
    IsTemplateLiteral(schema)
  );
}

function isEmptyObjectDefault(schema: TObject): boolean {
  return (
    Object.keys(schema.properties).length > 0 &&
    IsDefault(schema) &&
    Guard.IsObjectNotArray(schema.default) &&
    Guard.Keys(schema.default).length === 0
  );
}

export function assertCompleteRecipeConfigSchema(schema: TSchema, path: string): void {
  if (IsOptional(schema)) {
    throw new Error(`Complete recipe config schema at "${path}" is optional`);
  }

  if (IsObject(schema)) {
    if (ObjectOptions(schema).additionalProperties !== false) {
      throw new Error(`Complete recipe config object at "${path}" must be closed`);
    }
    if (isEmptyObjectDefault(schema)) {
      throw new Error(`Complete recipe config object at "${path}" uses a structural default`);
    }
    for (const [key, property] of Object.entries(schema.properties)) {
      assertCompleteRecipeConfigSchema(property, `${path}/${key}`);
    }
    return;
  }
  if (IsUnion(schema)) {
    schema.anyOf.forEach((member, index) =>
      assertCompleteRecipeConfigSchema(member, `${path}/union:${index}`)
    );
    return;
  }
  if (IsArray(schema)) {
    assertCompleteRecipeConfigSchema(schema.items, `${path}/items`);
    return;
  }
  if (IsTuple(schema)) {
    schema.items.forEach((item, index) =>
      assertCompleteRecipeConfigSchema(item, `${path}/tuple:${index}`)
    );
    return;
  }
  if (IsIntersect(schema)) {
    schema.allOf.forEach((member, index) =>
      assertCompleteRecipeConfigSchema(member, `${path}/intersect:${index}`)
    );
    return;
  }
  if (IsRecord(schema)) {
    assertCompleteRecipeConfigSchema(RecordValue(schema), `${path}/values`);
    return;
  }
  if (IsRef(schema)) {
    throw new Error(`Complete recipe config schema at "${path}" contains unresolved Ref`);
  }
  if (IsCyclic(schema)) {
    throw new Error(`Complete recipe config schema at "${path}" contains unresolved Cyclic`);
  }
  if (IsDeferred(schema)) {
    throw new Error(`Complete recipe config schema at "${path}" contains unresolved Deferred`);
  }
  if (IsLiteral(schema)) {
    if (typeof schema.const !== "bigint") return;
    throw new Error(`Complete recipe config schema at "${path}" contains a non-portable Literal`);
  }
  if (!isPortableScalar(schema)) {
    throw new Error(
      `Complete recipe config schema at "${path}" contains an unsupported, unresolved, or non-portable TypeBox kind`
    );
  }
}

function deriveStageSurfaceSchema(stage: StageLike): TObject {
  if (stage.authoring) return stage.authoring.config.schema;
  if (stage.public) return stage.surfaceSchema;

  const props: Record<string, TSchema> = {
    knobs: stage.knobsSchema,
  };
  for (const step of stage.steps) {
    props[step.contract.id] = step.contract.schema;
  }
  return Type.Object(props, { additionalProperties: false });
}

/**
 * Derive the top-level (surface) recipe config schema from stage definitions.
 *
 * Stages without an explicit `public` surface are expanded to include their internal step schemas.
 * Every stage and structural child remains required; native `Value.Create` recursively creates
 * these objects from their schema-defined leaf defaults.
 */
export function deriveRecipeConfigSchema(stages: readonly StageLike[]): TObject {
  const properties: Record<string, TSchema> = {};
  for (const stage of stages) {
    properties[stage.id] = deriveStageSurfaceSchema(stage);
  }
  const schema = Type.Object(properties, { additionalProperties: false });
  assertCompleteRecipeConfigSchema(schema, "recipe");
  return schema;
}
