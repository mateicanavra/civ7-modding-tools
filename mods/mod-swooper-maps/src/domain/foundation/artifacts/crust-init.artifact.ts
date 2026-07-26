import {
  type ArtifactValidationIssue,
  appendArtifactTypedArrayIssues,
  defineArtifact,
  defineArtifactValidator,
  type Static,
} from "@swooper/mapgen-core/authoring/contracts";
import { CrustSchema } from "../model/schemas/crust.schema.js";

const CRUST_ARRAY_FIELDS = [
  ["maturity", Float32Array],
  ["thickness", Float32Array],
  ["thermalAge", Uint8Array],
  ["damage", Uint8Array],
  ["type", Uint8Array],
  ["age", Uint8Array],
  ["buoyancy", Float32Array],
  ["baseElevation", Float32Array],
  ["strength", Float32Array],
] as const;

/** Structural contract for the initially projected crust fields. */
export const Schema = CrustSchema;
/** Initial crust state published by Foundation before evolution. */
export type Artifact = Static<typeof Schema>;

/** Registers Foundation's initial crust artifact against its own identity. */
export const artifact = defineArtifact({
  name: "foundationCrustInit",
  id: "artifact:foundation.crustInit",
  schema: Schema,
});

function validateLocal(value: unknown): readonly ArtifactValidationIssue[] {
  const candidate = value as Record<string, unknown>;
  const maturity = candidate.maturity;
  const expectedLength = maturity instanceof Float32Array ? maturity.length : undefined;
  const issues: ArtifactValidationIssue[] = [];
  if (expectedLength === 0) issues.push({ message: "crust arrays must be nonempty" });
  for (const [key, constructor] of CRUST_ARRAY_FIELDS) {
    appendArtifactTypedArrayIssues(issues, key, candidate[key], constructor, expectedLength);
  }
  return issues;
}

/** Validates exact crust-array constructors, nonempty cardinality, and parallel lengths. */
export const validate = defineArtifactValidator(artifact, validateLocal);
