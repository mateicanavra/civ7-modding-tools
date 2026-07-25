import {
  type ArtifactValidationContext,
  type ArtifactValidationIssue,
  appendArtifactTypedArrayIssues,
  artifactCellCount,
  defineArtifact,
  Type,
  TypedArraySchemas,
} from "@swooper/mapgen-core/authoring/contracts";
import { FEATURE_INTENT_KEYS, type FeatureIntentKey } from "../model/atoms/index.js";

type FeatureSuitability = Readonly<{
  width: number;
  height: number;
  layers: Readonly<Record<FeatureIntentKey, Float32Array>>;
}>;

/**
 * Registers one normalized per-tile suitability layer for every Ecology feature key plus the
 * shared dimensions. Ordered family planners consume the same scoring vintage and derive
 * transient claim masks from already-admitted upstream intents.
 */
export const artifact = defineArtifact({
  name: "featureSuitability",
  id: "artifact:ecology.featureSuitability",
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
    const value = input as FeatureSuitability;
    const errors: ArtifactValidationIssue[] = [];
    const dimensions = context?.dimensions;
    const size = artifactCellCount(context);
    if (dimensions && (value.width !== dimensions.width || value.height !== dimensions.height)) {
      errors.push({ message: "Feature suitability dimensions mismatch." });
    }
    for (const key of FEATURE_INTENT_KEYS) {
      appendArtifactTypedArrayIssues(
        errors,
        `layers.${key}`,
        value.layers[key],
        Float32Array,
        size
      );
    }
    return errors;
  },
});
