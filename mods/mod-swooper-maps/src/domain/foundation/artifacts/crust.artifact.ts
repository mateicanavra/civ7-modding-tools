import {
  type ArtifactValidationIssue,
  appendArtifactTypedArrayIssues,
  defineArtifact,
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

/** Structural contract for the parallel per-cell fields of the evolved crust model. */
const Schema = CrustSchema;

/** Evolved crust state published by Foundation. */
export type Artifact = Static<typeof Schema>;

/** Registers Foundation's evolved crust artifact. */
export const artifact = defineArtifact({
  name: "foundationCrust",
  id: "artifact:foundation.crust",
  schema: Schema,
  refine: validateLocal,
});

/** Validates exact crust-array constructors, nonempty cardinality, and parallel lengths. */
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
