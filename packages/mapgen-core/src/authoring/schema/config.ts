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
} from "typebox";
import { Guard } from "typebox/guard";
import { IsDefault } from "typebox/schema";

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

function assertExplicitDefault(schema: TSchema, path: string): void {
  if (!IsDefault(schema)) {
    throw new Error(`Complete authored config value at "${path}" must declare a default`);
  }
}

function isEmptyObjectDefault(schema: TObject): boolean {
  return (
    Object.keys(schema.properties).length > 0 &&
    IsDefault(schema) &&
    Guard.IsObjectNotArray(schema.default) &&
    Guard.Keys(schema.default).length === 0
  );
}

/**
 * Refuses incomplete or non-portable authored configuration before `Value.Create` is authoritative.
 * Every nested key must be statically named, required, closed, and represented by supported
 * TypeBox algebra. Author-selected scalars and collections declare explicit defaults; literal and
 * null values are self-defining. A union or collection default owns that complete choice/value
 * while its members remain structurally checked. This keeps generated defaults and serialized
 * configuration in the same deliberate shape instead of accepting TypeBox's implicit values.
 */
export function assertCompleteConfigSchema(schema: TSchema, path: string): void {
  assertCompleteConfigNode(schema, path, true);
}

function assertCompleteConfigNode(schema: TSchema, path: string, requiresDefault: boolean): void {
  if (IsOptional(schema)) {
    throw new Error(`Complete authored config schema at "${path}" is optional`);
  }

  if (IsRecord(schema)) {
    throw new Error(
      `Complete authored config object at "${path}" must use statically named properties`
    );
  }

  if (IsObject(schema)) {
    const options = ObjectOptions(schema);
    if (options.additionalProperties !== false) {
      throw new Error(`Complete authored config object at "${path}" must be closed`);
    }
    if (options.patternProperties && Object.keys(options.patternProperties).length > 0) {
      throw new Error(
        `Complete authored config object at "${path}" must use statically named properties`
      );
    }
    if (isEmptyObjectDefault(schema)) {
      throw new Error(`Complete authored config object at "${path}" uses a structural default`);
    }
    for (const [key, property] of Object.entries(schema.properties)) {
      assertCompleteConfigNode(property, `${path}/${key}`, requiresDefault);
    }
    return;
  }
  if (IsUnion(schema)) {
    if (requiresDefault) assertExplicitDefault(schema, path);
    schema.anyOf.forEach((member, index) =>
      assertCompleteConfigNode(member, `${path}/union:${index}`, false)
    );
    return;
  }
  if (IsArray(schema)) {
    if (requiresDefault) assertExplicitDefault(schema, path);
    assertCompleteConfigNode(schema.items, `${path}/items`, false);
    return;
  }
  if (IsTuple(schema)) {
    if (requiresDefault) assertExplicitDefault(schema, path);
    schema.items.forEach((item, index) =>
      assertCompleteConfigNode(item, `${path}/tuple:${index}`, false)
    );
    return;
  }
  if (IsIntersect(schema)) {
    schema.allOf.forEach((member, index) =>
      assertCompleteConfigNode(member, `${path}/intersect:${index}`, requiresDefault)
    );
    return;
  }
  if (IsRef(schema)) {
    throw new Error(`Complete authored config schema at "${path}" contains unresolved Ref`);
  }
  if (IsCyclic(schema)) {
    throw new Error(`Complete authored config schema at "${path}" contains unresolved Cyclic`);
  }
  if (IsDeferred(schema)) {
    throw new Error(`Complete authored config schema at "${path}" contains unresolved Deferred`);
  }
  if (IsLiteral(schema)) {
    if (typeof schema.const !== "bigint") return;
    throw new Error(`Complete authored config schema at "${path}" contains a non-portable Literal`);
  }
  if (!isPortableScalar(schema)) {
    throw new Error(
      `Complete authored config schema at "${path}" contains an unsupported, unresolved, or non-portable TypeBox kind`
    );
  }
  if (requiresDefault && !IsNull(schema)) assertExplicitDefault(schema, path);
}
