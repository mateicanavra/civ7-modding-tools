import type { StandardSchemaV1 } from "@standard-schema/spec";
import type { Static, TSchema } from "typebox";
import { Compile } from "typebox/compile";

const TYPEBOX_SCHEMA = Symbol.for("@habitat/cli/typebox-schema");

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
  Object.defineProperty(standardSchema, TYPEBOX_SCHEMA, { value: schema });
  return standardSchema;
}

export function typeboxInputSchemaFromContractProcedure<
  const Procedure extends OrpcContractProcedureWithSchemas,
>(procedure: Procedure): TSchema {
  return typeboxSchemaFromStandard(procedure["~orpc"].inputSchema, "input");
}

export function typeboxOutputSchemaFromContractProcedure<
  const Procedure extends OrpcContractProcedureWithSchemas,
>(procedure: Procedure): TSchema {
  return typeboxSchemaFromStandard(procedure["~orpc"].outputSchema, "output");
}

function typeboxSchemaFromStandard(value: unknown, label: string): TSchema {
  const schema = (value as { [TYPEBOX_SCHEMA]?: TSchema } | null)?.[TYPEBOX_SCHEMA];
  if (!schema) throw new Error(`Habitat service contract ${label} schema is not TypeBox-backed.`);
  return schema;
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
