import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Builds hydromorphic and coastal eligibility masks from admitted hydrography and elevation evidence.
 * It changes only authored controls; the shared operation remains the sole input and output authority.
 */
export default defineStrategy({
  id: "hydromorphic",
  config: Type.Object(
    {
      nearRiverRadius: Type.Integer({
        description: "Square-radius used to compute near-river adjacency mask.",
        default: 2,
        minimum: 0,
        maximum: 64,
      }),
      isolatedRiverRadius: Type.Integer({
        description: "Square-radius used to compute isolated-river adjacency mask.",
        default: 1,
        minimum: 0,
        maximum: 64,
      }),
      coastalAdjacencyRadius: Type.Integer({
        description: "Square-radius used to compute coastal land adjacency mask.",
        default: 1,
        minimum: 0,
        maximum: 64,
      }),
      lowlandMaxElevationAboveSeaM: Type.Integer({
        description: "Maximum land elevation above sea level treated as lowland wetland substrate.",
        default: 160,
        minimum: 0,
        maximum: 12000,
      }),
      intertidalMaxElevationAboveSeaM: Type.Integer({
        description:
          "Maximum coastal land elevation above sea level treated as intertidal substrate.",
        default: 40,
        minimum: 0,
        maximum: 12000,
      }),
      floodplainDischargeMin: Type.Number({
        description: "Minimum nearby discharge treated as meaningful floodplain water exchange.",
        default: 0,
        minimum: 0,
        maximum: 1000000,
      }),
    },
    {
      additionalProperties: false,
      description:
        "Shared compute substrate tuning for feature planning masks. This should stay small and reusable.",
    }
  ),
});
