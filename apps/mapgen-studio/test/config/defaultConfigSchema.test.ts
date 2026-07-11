import {
  STANDARD_RECIPE_CONFIG,
  STANDARD_RECIPE_CONFIG_SCHEMA,
} from "mod-swooper-maps/recipes/standard-artifacts";
import { Guard } from "typebox/guard";
import {
  Check,
  IsAllOf,
  IsAnyOf,
  IsConst,
  IsItemsSized,
  IsItemsUnsized,
  IsMaximum,
  IsMinimum,
  IsProperties,
  IsSchemaObject,
  IsType,
  type XSchema,
} from "typebox/schema";
import { describe, expect, it } from "vitest";

function schemaChildren(schema: XSchema): readonly (readonly [string, XSchema])[] {
  if (!IsSchemaObject(schema)) return [];
  if (IsProperties(schema)) return Object.entries(schema.properties);
  if (IsItemsSized(schema)) {
    return schema.items.map((item, index) => [`items.${index}`, item] as const);
  }
  if (IsItemsUnsized(schema)) return [["items", schema.items]];
  if (IsAnyOf(schema)) {
    return schema.anyOf.map((member, index) => [`anyOf.${index}`, member] as const);
  }
  if (IsAllOf(schema)) {
    return schema.allOf.map((member, index) => [`allOf.${index}`, member] as const);
  }
  return [];
}

function collectMissingDescriptions(schema: XSchema, path: readonly string[] = []): string[] {
  if (!IsSchemaObject(schema)) return [];
  const missing =
    path.length > 0 &&
    !IsConst(schema) &&
    (!Guard.HasPropertyKey(schema, "description") || !Guard.IsString(schema.description))
      ? [path.join(".")]
      : [];

  for (const [segment, child] of schemaChildren(schema)) {
    missing.push(...collectMissingDescriptions(child, [...path, segment]));
  }
  return missing;
}

function collectNumericLeavesMissingRange(schema: XSchema, path: readonly string[] = []): string[] {
  if (!IsSchemaObject(schema)) return [];
  const missing =
    !IsConst(schema) &&
    IsType(schema) &&
    (schema.type === "number" || schema.type === "integer") &&
    (!IsMinimum(schema) || !IsMaximum(schema))
      ? [path.join(".")]
      : [];

  for (const [segment, child] of schemaChildren(schema)) {
    missing.push(...collectNumericLeavesMissingRange(child, [...path, segment]));
  }
  return missing;
}

describe("Studio default config", () => {
  it("validates against the generated recipe schema", () => {
    expect(Check(STANDARD_RECIPE_CONFIG_SCHEMA, STANDARD_RECIPE_CONFIG)).toBe(true);
  });

  it("keeps executable schema metadata complete", () => {
    if (
      !IsSchemaObject(STANDARD_RECIPE_CONFIG_SCHEMA) ||
      !IsProperties(STANDARD_RECIPE_CONFIG_SCHEMA)
    ) {
      throw new Error("Expected the recipe config schema to be an object");
    }
    const stageSchemas = Object.entries(STANDARD_RECIPE_CONFIG_SCHEMA.properties);
    expect(stageSchemas.length).toBeGreaterThan(0);

    for (const [stageId, stageSchema] of stageSchemas) {
      expect(collectMissingDescriptions(stageSchema, [stageId])).toEqual([]);
      expect(collectNumericLeavesMissingRange(stageSchema, [stageId])).toEqual([]);
    }
  });
});
