import type { Static } from "@swooper/mapgen-core/authoring/contracts";
import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { Value } from "typebox/value";

export const Schema = Type.Array(TypedArraySchemas.i16({ shape: null }));

export type Artifact = Static<typeof Schema>;

export const artifact = defineArtifact({
  name: "foundationPlateIdByEra",
  id: "artifact:foundation.plateIdByEra",
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
    issues.push(issue("plateIdByEra must be a nonempty era list"));
  } else {
    const length = value.find((arr): arr is Int16Array => arr instanceof Int16Array)?.length ?? 0;
    value.forEach((arr, index) => {
      if (!(arr instanceof Int16Array))
        issues.push(issue(`plateIdByEra[${index}] must be Int16Array`));
      else if (arr.length !== length)
        issues.push(issue(`plateIdByEra[${index}] length must match prior eras`));
    });
  }
  return Object.freeze(issues);
}
