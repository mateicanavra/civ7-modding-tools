import type { ArtifactValidationIssue, Static } from "@swooper/mapgen-core/authoring/contracts";
import {
  appendArtifactTypedArrayIssues,
  defineArtifact,
  Type,
  TypedArraySchemas,
} from "@swooper/mapgen-core/authoring/contracts";

/** Structural contract for tracer-index arrays ordered by tectonic era. */
const Schema = Type.Array(TypedArraySchemas.u32({ cardinality: null }));

/** Per-era tracer-index state published by Foundation. */
export type Artifact = Static<typeof Schema>;

/** Registers Foundation's per-era tracer-index artifact. */
export const artifact = defineArtifact({
  name: "foundationTracerIndexByEra",
  id: "artifact:foundation.tracerIndexByEra",
  schema: Schema,
  refine: validateLocal,
});

/** Validates a nonempty era list with exact constructors and consistent cell cardinality. */
function validateLocal(value: unknown): readonly ArtifactValidationIssue[] {
  const eras = value as Artifact;
  const length = eras.find((era): era is Uint32Array => era instanceof Uint32Array)?.length ?? 0;
  const issues: ArtifactValidationIssue[] = [];

  if (eras.length <= 0) issues.push({ message: "tracerIndexByEra must be a nonempty era list" });
  eras.forEach((era, index) => {
    appendArtifactTypedArrayIssues(issues, `tracerIndexByEra[${index}]`, era, Uint32Array, length);
  });
  return issues;
}
