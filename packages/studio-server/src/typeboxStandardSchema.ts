import type { StandardSchemaV1 } from "@standard-schema/spec";
import { Compile } from "typebox/compile";
import type { Static, TSchema } from "typebox";

export function toStandardSchema<TypeSchema extends TSchema>(
  schema: TypeSchema,
): StandardSchemaV1<Static<TypeSchema>, Static<TypeSchema>> {
  const validator = Compile(schema);

  return {
    "~standard": {
      version: 1,
      vendor: "typebox",
      validate(value) {
        if (validator.Check(value)) return { value: value as Static<TypeSchema> };
        return {
          issues: [...validator.Errors(value)].map((error) => ({
            message: error.message,
            path: pathSegments(error.instancePath),
          })),
        };
      },
    },
  };
}

function pathSegments(path: string): StandardSchemaV1.PathSegment[] {
  if (path.length === 0) return [];
  return path.split("/").slice(1).map((segment) => ({ key: pathKey(segment) }));
}

function pathKey(segment: string): string | number {
  const decoded = segment.replace(/~1/g, "/").replace(/~0/g, "~");
  return /^\d+$/.test(decoded) ? Number(decoded) : decoded;
}
