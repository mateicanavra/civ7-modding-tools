import { describe, expect, it } from "bun:test";
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInteger,
  IsIntersect,
  IsLiteral,
  IsNumber,
  IsObject,
  IsRecord,
  IsString,
  IsTemplateLiteral,
  IsTuple,
  IsUnion,
  type TObject,
  type TSchema,
} from "typebox";
import { Guard } from "typebox/guard";
import { IsDefault } from "typebox/schema";
import { Value } from "typebox/value";

import {
  buildStandardRecipeDefaultConfig,
  STANDARD_RECIPE_CONFIG_SCHEMA,
} from "../../../../src/recipes/standard/artifacts.js";

function collectAuthorLeavesWithoutDefaults(
  schema: TSchema,
  path: readonly string[] = []
): string[] {
  if (IsLiteral(schema)) return [];
  if (IsObject(schema)) {
    return Object.entries(schema.properties).flatMap(([key, property]) =>
      collectAuthorLeavesWithoutDefaults(property, [...path, key])
    );
  }
  if (IsUnion(schema)) {
    return schema.anyOf.flatMap((member) => collectAuthorLeavesWithoutDefaults(member, path));
  }
  if (IsIntersect(schema)) {
    return schema.allOf.flatMap((member) => collectAuthorLeavesWithoutDefaults(member, path));
  }
  if (IsArray(schema) || IsTuple(schema) || IsRecord(schema)) {
    return IsDefault(schema) ? [] : [path.join(".")];
  }
  if (
    IsBoolean(schema) ||
    IsEnum(schema) ||
    IsInteger(schema) ||
    IsNumber(schema) ||
    IsString(schema) ||
    IsTemplateLiteral(schema)
  ) {
    return IsDefault(schema) ? [] : [path.join(".")];
  }
  return [];
}

function firstProperty(schema: TObject): string {
  const key = Object.keys(schema.properties)[0];
  if (key === undefined) throw new Error("Expected at least one recipe config property");
  return key;
}

function cloneConfig(): Record<PropertyKey, unknown> {
  const config: unknown = structuredClone(buildStandardRecipeDefaultConfig());
  if (!Guard.IsObjectNotArray(config)) throw new Error("Expected recipe config to be an object");
  return config;
}

describe("Standard complete config boundary", () => {
  it("creates and validates one complete config with native TypeBox APIs", () => {
    const config = buildStandardRecipeDefaultConfig();

    expect(() => Value.Assert(STANDARD_RECIPE_CONFIG_SCHEMA, config)).not.toThrow();
  });

  it("declares deliberate defaults for Standard author-controlled leaves", () => {
    expect(collectAuthorLeavesWithoutDefaults(STANDARD_RECIPE_CONFIG_SCHEMA)).toEqual([]);
  });

  it("rejects removal of a schema-selected required property", () => {
    if (!IsObject(STANDARD_RECIPE_CONFIG_SCHEMA)) {
      throw new Error("Expected the recipe config schema to be an object");
    }
    const config = cloneConfig();
    delete config[firstProperty(STANDARD_RECIPE_CONFIG_SCHEMA)];

    expect(Value.Check(STANDARD_RECIPE_CONFIG_SCHEMA, config)).toBe(false);
  });

  it("rejects an unknown property on the closed recipe config object", () => {
    const config = cloneConfig();
    let unknownKey = "test-unknown-property";
    while (Object.hasOwn(config, unknownKey)) unknownKey += "-next";
    config[unknownKey] = {};

    expect(Value.Check(STANDARD_RECIPE_CONFIG_SCHEMA, config)).toBe(false);
  });
});
