import { IsArray, IsIntersect, IsObject, IsRecord, IsTuple, IsUnion, type TSchema } from "typebox";

type SchemaRecord = Record<PropertyKey, unknown>;

function isSchemaRecord(value: unknown): value is SchemaRecord & TSchema {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function schemaMembers(value: unknown): readonly TSchema[] {
  return Array.isArray(value) ? value.filter(isSchemaRecord) : [];
}

function propertySchemas(value: unknown): readonly TSchema[] {
  return isSchemaRecord(value) ? Object.values(value).filter(isSchemaRecord) : [];
}

function enforceSchemaConventions(schema: TSchema): void {
  const record = schema as SchemaRecord;
  if (IsObject(schema) || IsRecord(schema) || record.type === "object") {
    if (record.additionalProperties === undefined) {
      record.additionalProperties = false;
    }
  }

  if (IsObject(schema)) {
    for (const property of Object.values(schema.properties)) enforceSchemaConventions(property);
  } else {
    for (const property of propertySchemas(record.properties)) enforceSchemaConventions(property);
  }

  if (IsArray(schema)) {
    enforceSchemaConventions(schema.items);
  } else if (IsTuple(schema)) {
    for (const item of schema.items) enforceSchemaConventions(item);
  } else {
    const items = record.items;
    if (Array.isArray(items)) {
      for (const item of items.filter(isSchemaRecord)) enforceSchemaConventions(item);
    } else if (isSchemaRecord(items)) {
      enforceSchemaConventions(items);
    }
  }

  if (IsUnion(schema)) {
    for (const member of schema.anyOf) enforceSchemaConventions(member);
  } else {
    for (const member of schemaMembers(record.anyOf)) enforceSchemaConventions(member);
  }

  if (IsIntersect(schema)) {
    for (const member of schema.allOf) enforceSchemaConventions(member);
  } else {
    for (const member of schemaMembers(record.allOf)) enforceSchemaConventions(member);
  }

  for (const member of schemaMembers(record.oneOf)) enforceSchemaConventions(member);
  if (isSchemaRecord(record.not)) enforceSchemaConventions(record.not);
}

/**
 * Applies MapGen's closed-object convention recursively to an authored schema.
 *
 * TypeBox-native schema algebra is traversed through its guards. Raw `oneOf`, `not`, and compatible
 * JSON Schema containers remain supported because authored `TSchema` values may use `Type.Unsafe`.
 */
export function applySchemaConventions(schema: TSchema): TSchema {
  enforceSchemaConventions(schema);
  return schema;
}
