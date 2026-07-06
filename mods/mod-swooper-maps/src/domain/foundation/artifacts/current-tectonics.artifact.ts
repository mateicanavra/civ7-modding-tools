import type { Static } from "@swooper/mapgen-core/authoring/contracts";
import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { Value } from "typebox/value";

export const Schema = Type.Object(
  {
    boundaryType: TypedArraySchemas.u8({ shape: null }),
    upliftPotential: TypedArraySchemas.u8({ shape: null }),
    riftPotential: TypedArraySchemas.u8({ shape: null }),
    shearStress: TypedArraySchemas.u8({ shape: null }),
    volcanism: TypedArraySchemas.u8({ shape: null }),
    fracture: TypedArraySchemas.u8({ shape: null }),
    cumulativeUplift: TypedArraySchemas.u8({ shape: null }),
  },
  { additionalProperties: false }
);

export type Artifact = Static<typeof Schema>;

export const artifact = defineArtifact({
  name: "foundationTectonics",
  id: "artifact:foundation.tectonics",
  schema: Schema,
});

function issue(message: string): { message: string } {
  return { message };
}

function typedArrayIssue(value: unknown, key: string, length: number): { message: string } | null {
  if (!(value instanceof Uint8Array)) return issue(`${key} must be Uint8Array`);
  if (value.length !== length) return issue(`${key} length must match current tectonics arrays`);
  return null;
}

export function validate(value: unknown): readonly { message: string }[] {
  const issues = Array.from(Value.Errors(Schema, value), (error) =>
    issue(
      `${(error as { path?: string; instancePath?: string }).path ?? (error as { instancePath?: string }).instancePath ?? "/"} ${error.message}`
    )
  );
  if (value && typeof value === "object") {
    const tectonics = value as Record<string, unknown>;
    const arrays = [
      tectonics.boundaryType,
      tectonics.upliftPotential,
      tectonics.riftPotential,
      tectonics.shearStress,
      tectonics.volcanism,
      tectonics.fracture,
      tectonics.cumulativeUplift,
    ].filter((candidate): candidate is Uint8Array => candidate instanceof Uint8Array);
    const length = arrays[0]?.length ?? 0;
    if (length <= 0) issues.push(issue("current tectonics arrays must be nonempty"));
    for (const candidate of [
      typedArrayIssue(tectonics.boundaryType, "boundaryType", length),
      typedArrayIssue(tectonics.upliftPotential, "upliftPotential", length),
      typedArrayIssue(tectonics.riftPotential, "riftPotential", length),
      typedArrayIssue(tectonics.shearStress, "shearStress", length),
      typedArrayIssue(tectonics.volcanism, "volcanism", length),
      typedArrayIssue(tectonics.fracture, "fracture", length),
      typedArrayIssue(tectonics.cumulativeUplift, "cumulativeUplift", length),
    ]) {
      if (candidate) issues.push(candidate);
    }
  }
  return Object.freeze(issues);
}
