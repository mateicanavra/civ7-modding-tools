import type { StandardSchemaV1 } from "@standard-schema/spec";

export function standardSchemaAccepts(
  schema: StandardSchemaV1 | undefined,
  value: unknown
): boolean {
  if (schema == null) throw new Error("Expected an authored Standard Schema.");
  const result = schema["~standard"].validate(value);
  if (result instanceof Promise) {
    throw new Error("Expected synchronous contract validation.");
  }
  return !("issues" in result);
}
