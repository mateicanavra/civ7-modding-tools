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
 * TypeBox algebra so generated defaults and serialized configuration retain the same shape.
 */
export function assertCompleteConfigSchema(schema: TSchema, path: string): void {
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
      assertCompleteConfigSchema(property, `${path}/${key}`);
    }
    return;
  }
  if (IsUnion(schema)) {
    schema.anyOf.forEach((member, index) =>
      assertCompleteConfigSchema(member, `${path}/union:${index}`)
    );
    return;
  }
  if (IsArray(schema)) {
    assertCompleteConfigSchema(schema.items, `${path}/items`);
    return;
  }
  if (IsTuple(schema)) {
    schema.items.forEach((item, index) =>
      assertCompleteConfigSchema(item, `${path}/tuple:${index}`)
    );
    return;
  }
  if (IsIntersect(schema)) {
    schema.allOf.forEach((member, index) =>
      assertCompleteConfigSchema(member, `${path}/intersect:${index}`)
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
}
