import type { ArtifactValidationContext } from "@swooper/mapgen-core/authoring/contracts";
import {
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

function wrapValidation(
  value: unknown,
  context: ArtifactValidationContext | undefined
): readonly { message: string }[] {
  const schemaIssues = validateArtifactSchema(Schema, value);
  if (!context?.dimensions) return schemaIssues;
  try {
    validatePayload(value, context.dimensions);
    return schemaIssues;
  } catch (error) {
    return Object.freeze([
      ...schemaIssues,
      { message: error instanceof Error ? error.message : String(error) },
    ]);
  }
}

function validatePayload(
  value: unknown,
  dims: NonNullable<ArtifactValidationContext["dimensions"]>
): void {
  if (!(value instanceof Int32Array)) {
    throw new Error("[FoundationArtifact] Invalid foundation tileToCellIndex.");
  }

  const expectedLen = Math.max(0, (dims.width | 0) * (dims.height | 0));
  if (value.length !== expectedLen) {
    throw new Error("[FoundationArtifact] Invalid foundation tileToCellIndex tensor length.");
  }
  for (let i = 0; i < value.length; i++) {
    const v = value[i] | 0;
    if (v < 0) {
      throw new Error("[FoundationArtifact] Invalid foundation tileToCellIndex value.");
    }
  }
}

/** Requires a nonnegative Int32 mesh-cell index for every map tile. */
export function validate(
  value: unknown,
  context?: ArtifactValidationContext
): readonly { message: string }[] {
  return wrapValidation(value, context);
}
