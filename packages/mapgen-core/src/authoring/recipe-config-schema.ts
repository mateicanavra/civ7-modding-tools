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
  type TObject,
  type TSchema,
  Type,
} from "typebox";
import { Guard } from "typebox/guard";
import { IsDefault } from "typebox/schema";

import type { StageObservation } from "./types.js";

type StageLike = Pick<StageObservation, "id" | "surfaceSchema">;

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

  if (IsRecord(schema)) {
    throw new Error(
      `Complete recipe config object at "${path}" must use statically named properties`
    );
  }

  if (IsObject(schema)) {
    const options = ObjectOptions(schema);
    if (options.additionalProperties !== false) {
      throw new Error(`Complete recipe config object at "${path}" must be closed`);
    }
    if (options.patternProperties && Object.keys(options.patternProperties).length > 0) {
      throw new Error(
        `Complete recipe config object at "${path}" must use statically named properties`
      );
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
  return stage.surfaceSchema;
}

/**
 * Derive the top-level (surface) recipe config schema from stage definitions.
 *
 * Each stage contract owns its exact closed surface. Every top-level stage remains required;
 * native `Value.Create` recursively creates configuration from schema-defined leaf defaults.
 */
export function deriveRecipeConfigSchema<const TStage extends StageLike>(
  stages: readonly TStage[]
): TObject {
  const properties: Record<string, TSchema> = {};
  for (const stage of stages) {
    properties[stage.id] = deriveStageSurfaceSchema(stage);
  }
  const schema = Type.Object(properties, { additionalProperties: false });
  assertCompleteRecipeConfigSchema(schema, "recipe");
  return schema;
}
