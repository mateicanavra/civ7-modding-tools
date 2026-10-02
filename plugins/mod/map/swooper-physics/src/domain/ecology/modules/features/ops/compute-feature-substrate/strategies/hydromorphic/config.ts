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
        description:
          "Maximum land elevation minus seaLevel in quantized normalized model relief units treated as lowland wetland substrate; not meters. The legacy M key is retained.",
        default: 160,
        minimum: 0,
        maximum: 12000,
      }),
      intertidalMaxElevationAboveSeaM: Type.Integer({
        description:
          "Maximum coastal land elevation minus seaLevel in quantized normalized model relief units treated as intertidal substrate; not meters. The legacy M key is retained.",
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
        "Hydrography, coast-distance, elevation, and discharge thresholds used to derive reusable feature-habitat masks.",
    }
  ),
});
