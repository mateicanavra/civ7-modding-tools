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

export type TypeBoxStandardSchemaOptions = Readonly<{
  cleanUnknownProperties?: boolean;
  /** Runs before TypeBox inspects input that needs runtime-only admission. */
  precheck?: (value: unknown) => string | undefined;
}>;

export function toStandardSchema<TypeSchema extends TSchema>(
  schema: TypeSchema,
  options: TypeBoxStandardSchemaOptions = {}
): StandardSchemaV1<Static<TypeSchema>, Static<TypeSchema>> {
  const validator = Compile(schema);
  const cleanUnknownProperties = options.cleanUnknownProperties ?? true;

  const standardSchema: StandardSchemaV1<Static<TypeSchema>, Static<TypeSchema>> = {
    "~standard": {
      version: 1,
      vendor: "typebox",
      validate(value) {
        try {
          const precheckIssue = options.precheck?.(value);
          if (precheckIssue !== undefined) {
            return {
              issues: [{ message: precheckIssue }],
            };
          }

          // TypeBox 1.3 Clean mutates its argument. Clone first so Standard
          // Schema validation never edits caller-owned input.
          const checked = cleanUnknownProperties ? Value.Clean(schema, Value.Clone(value)) : value;
          if (!cleanUnknownProperties && !validator.Check(checked)) {
            return {
              issues: [...validator.Errors(checked)].map((error) => ({
                message: error.message,
                path: pathSegments(error.instancePath),
              })),
            };
          }
          try {
            // TypeBox 1.3 Parse returns an already-valid value unchanged; it is
            // validation here, not an ownership or immutability boundary.
            return { value: Value.Parse(schema, checked) as Static<TypeSchema> };
          } catch {
            return {
              issues: [...validator.Errors(checked)].map((error) => ({
                message: error.message,
                path: pathSegments(error.instancePath),
              })),
            };
          }
        } catch {
          // Descriptor and Proxy traps are invalid boundary values. Standard
          // Schema adapters report admission issues rather than throwing.
          return {
            issues: [{ message: "Studio contract input could not be inspected safely." }],
          };
        }
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
