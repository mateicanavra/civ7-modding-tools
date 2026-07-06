import { defineArtifact } from "@swooper/mapgen-core/authoring/contracts";
import { Schema as CrustSchema, validate as validateCrust } from "./crust.artifact.js";

export const Schema = CrustSchema;
export type { Artifact } from "./crust.artifact.js";

export const artifact = defineArtifact({
  name: "foundationCrustInit",
  id: "artifact:foundation.crustInit",
  schema: Schema,
});

export function validate(value: unknown): readonly { message: string }[] {
  return validateCrust(value);
}
