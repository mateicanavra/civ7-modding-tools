import type { ArtifactValidationIssue, Static } from "@swooper/mapgen-core/authoring/contracts";
import {
  appendArtifactTypedArrayIssues,
  defineArtifact,
  Type,
  TypedArraySchemas,
} from "@swooper/mapgen-core/authoring/contracts";

/** Structural contract for plate membership arrays ordered by tectonic era. */
const Schema = Type.Array(TypedArraySchemas.i16({ cardinality: null }));

/** Per-era plate membership state published by Foundation. */
export type Artifact = Static<typeof Schema>;

/** Registers Foundation's per-era plate-membership artifact. */
export const artifact = defineArtifact({
  name: "foundationPlateIdByEra",
  id: "artifact:foundation.plateIdByEra",
  schema: Schema,
  refine: validateLocal,
});

/** Validates a nonempty era list with exact constructors and consistent cell cardinality. */
function validateLocal(value: unknown): readonly ArtifactValidationIssue[] {
  const eras = value as Artifact;
  const length = eras.find((era): era is Int16Array => era instanceof Int16Array)?.length ?? 0;
  const issues: ArtifactValidationIssue[] = [];

  if (eras.length <= 0) issues.push({ message: "plateIdByEra must be a nonempty era list" });
  eras.forEach((era, index) => {
    appendArtifactTypedArrayIssues(issues, `plateIdByEra[${index}]`, era, Int16Array, length);
  });
  return issues;
}
