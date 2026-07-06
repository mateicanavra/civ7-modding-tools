import type { Static } from "@swooper/mapgen-core/authoring/contracts";
import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { Value } from "typebox/value";

export const Schema = Type.Array(TypedArraySchemas.u32({ shape: null }));

export type Artifact = Static<typeof Schema>;

export const artifact = defineArtifact({
  name: "foundationTracerIndexByEra",
  id: "artifact:foundation.tracerIndexByEra",
  schema: Schema,
});

function issue(message: string): { message: string } {
  return { message };
}

export function validate(value: unknown): readonly { message: string }[] {
  const issues = Array.from(Value.Errors(Schema, value), (error) =>
    issue(
      `${(error as { path?: string; instancePath?: string }).path ?? (error as { instancePath?: string }).instancePath ?? "/"} ${error.message}`
    )
  );
  if (!Array.isArray(value) || value.length <= 0) {
    issues.push(issue("tracerIndexByEra must be a nonempty era list"));
  } else {
    const length = value.find((arr): arr is Uint32Array => arr instanceof Uint32Array)?.length ?? 0;
    value.forEach((arr, index) => {
      if (!(arr instanceof Uint32Array)) {
        issues.push(issue(`tracerIndexByEra[${index}] must be Uint32Array`));
      } else if (arr.length !== length) {
        issues.push(issue(`tracerIndexByEra[${index}] length must match prior eras`));
      }
    });
  }
  return Object.freeze(issues);
}
