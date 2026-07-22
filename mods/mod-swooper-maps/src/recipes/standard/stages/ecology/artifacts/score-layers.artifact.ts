import { FEATURE_INTENT_KEYS } from "@mapgen/domain/ecology/model/schemas/index.js";
import {
  type ArtifactValidationContext,
  type ArtifactValidationIssue,
  appendArtifactTypedArrayIssues,
  artifactCellCount,
  defineArtifact,
  defineArtifactValidator,
  type Static,
  Type,
  TypedArraySchemas,
} from "@swooper/mapgen-core/authoring/contracts";

/**
 * Runtime contract for one map-sized normalized suitability raster per admitted Ecology feature
 * intent key, ensuring all family planners score the same tile field vintage.
 */
export const Schema = Type.Object({
  width: Type.Integer({ minimum: 1 }),
  height: Type.Integer({ minimum: 1 }),
  layers: Type.Object(
    Object.fromEntries(
      FEATURE_INTENT_KEYS.map((intentKey) => [
        intentKey,
        TypedArraySchemas.f32({ description: "Suitability score (0..1) per tile." }),
      ])
    )
  ),
});

export type ScoreLayersArtifact = Static<typeof Schema>;

/**
 * Registers one normalized per-tile suitability layer for every Ecology feature key plus the
 * shared dimensions. Ordered family planners consume the same score vintage while occupancy
 * alone resolves claims.
 */
export const artifact = defineArtifact({
  name: "scoreLayers",
  id: "artifact:ecology.scoreLayers",
  schema: Schema,
});

function validateLocal(
  input: unknown,
  context?: ArtifactValidationContext
): ArtifactValidationIssue[] {
  const value = input as Static<typeof Schema>;
  const errors: ArtifactValidationIssue[] = [];
  const dimensions = context?.dimensions;
  const size = artifactCellCount(context);
  if (dimensions && (value.width !== dimensions.width || value.height !== dimensions.height)) {
    errors.push({ message: "Score layers dimensions mismatch." });
  }
  for (const key of FEATURE_INTENT_KEYS) {
    appendArtifactTypedArrayIssues(errors, `layers.${key}`, value.layers[key], Float32Array, size);
  }
  return errors;
}

/**
 * Validates feature score layers against its closed schema and, when map dimensions are
 * supplied, verifies every tile field matches that width × height. It returns accumulated
 * issues so artifact admission can reject a structurally valid but spatially inconsistent
 * payload.
 */
export const validate = defineArtifactValidator(artifact, validateLocal);
