import type { ArtifactValidationContext } from "@swooper/mapgen-core/authoring/contracts";
import {
  appendArtifactTypedArrayIssues,
  artifactCellCount,
  defineArtifact,
  TypedArraySchemas,
  validateArtifactSchema,
} from "@swooper/mapgen-core/authoring/contracts";

/** Nearest mesh cellIndex per tileIndex (canonical mesh to tile projection mapping). */
export const Schema = TypedArraySchemas.i32({
  shape: null,
  description: "Nearest mesh cellIndex per tileIndex (canonical mesh to tile projection mapping).",
});

/**
 * Registers the canonical row-major tile-to-nearest-mesh-cell mapping used by
 * all Foundation tile-space projections.
 */
export const artifact = defineArtifact({
  name: "foundationTileToCellIndex",
  id: "artifact:map.foundationTileToCellIndex",
  schema: Schema,
});

/** Requires a nonnegative Int32 mesh-cell index for every map tile. */
export function validate(
  value: unknown,
  context?: ArtifactValidationContext
): readonly { message: string }[] {
  const issues = [...validateArtifactSchema(Schema, value)];
  if (
    appendArtifactTypedArrayIssues(
      issues,
      "tileToCellIndex",
      value,
      Int32Array,
      artifactCellCount(context)
    )
  ) {
    for (const cellIndex of value) {
      if (cellIndex < 0) {
        issues.push({ message: "[FoundationArtifact] Invalid foundation tileToCellIndex value." });
        break;
      }
    }
  }
  return Object.freeze(issues);
}
