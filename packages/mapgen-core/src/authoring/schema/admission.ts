import type { TSchema } from "typebox";
import { Compile } from "typebox/compile";

const NO_SCHEMA_ADMISSION_ISSUES = Object.freeze([]);

/** One deterministic TypeBox structural-admission refusal. */
export type SchemaAdmissionIssue = Readonly<{
  code: "schema";
  keyword: string;
  path: string;
  message: string;
}>;

/** Schema-owned structural admission compiled once and reused without cloning its input. */
export type SchemaAdmission = (value: unknown) => readonly SchemaAdmissionIssue[];

/**
 * Compiles one TypeBox structural-admission boundary.
 *
 * The schema's owning factory is responsible for detaching and retaining its immutable admission
 * authority. This compiler consumes that authority directly rather than creating another schema
 * state.
 *
 * The returned function preserves caller ownership: it checks the supplied value in place, applies
 * no defaults or cleaning, and returns deterministic issues rather than leaking validator errors.
 */
export function compileSchemaAdmission(schema: TSchema): SchemaAdmission {
  const validator = Compile(schema);
  return Object.freeze((value: unknown): readonly SchemaAdmissionIssue[] => {
    try {
      if (validator.Check(value)) return NO_SCHEMA_ADMISSION_ISSUES;
      const errors = validator.Errors(value);
      if (errors.length === 0) {
        return schemaInspectionFailure("Schema validation refused input without diagnostics.");
      }
      return Object.freeze(
        errors.map((error) =>
          Object.freeze({
            code: "schema" as const,
            keyword: error.keyword,
            path: error.instancePath || "/",
            message: error.message,
          })
        )
      );
    } catch {
      return schemaInspectionFailure("Schema validation failed safely.");
    }
  });
}

function schemaInspectionFailure(message: string): readonly SchemaAdmissionIssue[] {
  return Object.freeze([
    Object.freeze({
      code: "schema" as const,
      keyword: "inspection",
      path: "/",
      message,
    }),
  ]);
}
