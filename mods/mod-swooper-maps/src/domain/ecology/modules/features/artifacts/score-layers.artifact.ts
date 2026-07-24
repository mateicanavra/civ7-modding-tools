import {
  type ArtifactValidationContext,
  type ArtifactValidationIssue,
  appendArtifactTypedArrayIssues,
  artifactCellCount,
  defineArtifact,
  Type,
  TypedArraySchemas,
} from "@swooper/mapgen-core/authoring/contracts";
import { type FeatureIntentKey, FEATURE_INTENT_KEYS } from "../model/atoms/index.js";

type ScoreLayers = Readonly<{
  width: number;
  height: number;
  layers: Readonly<Record<FeatureIntentKey, Float32Array>>;
}>;

/**
 * Registers one normalized per-tile suitability layer for every Ecology feature key plus the
 * shared dimensions. Ordered family planners consume the same score vintage while occupancy
 * alone resolves claims.
 */
export const artifact = defineArtifact({
  name: "scoreLayers",
  id: "artifact:ecology.scoreLayers",
  schema: Type.Object(
    {
      width: Type.Integer({ minimum: 1, description: "Map-grid width represented by each layer." }),
      height: Type.Integer({
        minimum: 1,
        description: "Map-grid height represented by each layer.",
      }),
      layers: Type.Object(
        Object.fromEntries(
          FEATURE_INTENT_KEYS.map((intentKey) => [
            intentKey,
            TypedArraySchemas.f32({
              description: `Normalized suitability for ${intentKey} intent per tile (0..1).`,
            }),
          ])
        ),
        {
          additionalProperties: false,
          description: "One normalized suitability raster for every admitted feature intent.",
        }
      ),
    },
    {
      additionalProperties: false,
      description: "Map-sized Ecology feature suitability fields from one scoring vintage.",
    }
  ),
  refine: (
    input: unknown,
    context?: ArtifactValidationContext
  ): readonly ArtifactValidationIssue[] => {
    const value = input as ScoreLayers;
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
  },
});
