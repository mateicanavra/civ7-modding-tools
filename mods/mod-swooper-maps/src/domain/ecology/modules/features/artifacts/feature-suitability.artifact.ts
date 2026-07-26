import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { FEATURE_INTENT_KEYS } from "../model/atoms/index.js";

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
              cardinality: "map-grid",
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
  refine: (value, { dimensions, issues }) => {
    if (value.width !== dimensions.width || value.height !== dimensions.height) {
      issues.add("Feature suitability dimensions mismatch.");
    }
  },
});
