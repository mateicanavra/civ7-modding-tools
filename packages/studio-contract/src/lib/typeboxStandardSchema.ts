import type { StandardSchemaV1 } from "@standard-schema/spec";
import type { Static, TSchema } from "typebox";
import { Compile } from "typebox/compile";
import { Value } from "typebox/value";

const TYPEBOX_SCHEMA = Symbol.for("@civ7/studio-server/typebox-schema");

type OrpcContractProcedureWithSchemas = Readonly<{
  "~orpc": Readonly<{
    inputSchema?: unknown;
    outputSchema?: unknown;
  }>;
}>;

export function toStandardSchema<TypeSchema extends TSchema>(
  schema: TypeSchema
): StandardSchemaV1<Static<TypeSchema>, Static<TypeSchema>> {
  const validator = Compile(schema);

  const standardSchema: StandardSchemaV1<Static<TypeSchema>, Static<TypeSchema>> = {
    "~standard": {
      version: 1,
      vendor: "typebox",
      validate(value) {
        const cleaned = Value.Clean(schema, value);
        try {
          return { value: Value.Parse(schema, cleaned) as Static<TypeSchema> };
        } catch {
          // Fall through to TypeBox's structural errors after cleanup so closed
          // object extras keep the existing Studio wire-surface strip behavior.
        }
        return {
          issues: [...validator.Errors(cleaned)].map((error) => ({
            message: error.message,
            path: pathSegments(error.instancePath),
          })),
        };
      },
    },
  };
  Object.defineProperty(standardSchema, TYPEBOX_SCHEMA, {
    value: schema,
  });
  return standardSchema;
}

export function typeboxSchemaFromStandardSchema(value: unknown, label = "schema"): TSchema {
  const schema = (value as { [TYPEBOX_SCHEMA]?: TSchema } | null)?.[TYPEBOX_SCHEMA];
  if (schema == null) {
    throw new Error(`Studio contract ${label} is not TypeBox-backed.`);
  }
  return schema;
}

export function typeboxInputSchemaFromContractProcedure<
  const Procedure extends OrpcContractProcedureWithSchemas,
>(procedure: Procedure): TSchema {
  return typeboxSchemaFromStandardSchema(procedure["~orpc"].inputSchema, "input schema");
}

export function typeboxOutputSchemaFromContractProcedure<
  const Procedure extends OrpcContractProcedureWithSchemas,
>(procedure: Procedure): TSchema {
  return typeboxSchemaFromStandardSchema(procedure["~orpc"].outputSchema, "output schema");
}

function pathSegments(path: string): StandardSchemaV1.PathSegment[] {
  if (path.length === 0) return [];
  return path
    .split("/")
    .slice(1)
    .map((segment) => ({ key: pathKey(segment) }));
}

function pathKey(segment: string): string | number {
  const decoded = segment.replace(/~1/g, "/").replace(/~0/g, "~");
  return /^\d+$/.test(decoded) ? Number(decoded) : decoded;
}
