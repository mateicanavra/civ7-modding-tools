import type { TSchema } from "typebox";
import { Guard } from "typebox/guard";

export function schemaPropertyKeys(schema: TSchema): string[] {
  if (!("properties" in schema) || !Guard.IsObjectNotArray(schema.properties)) {
    throw new Error("Expected a TypeBox schema with object properties");
  }
  return Object.keys(schema.properties);
}
