import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Combines freeze persistence with absolute or percentile elevation and moisture into snow suitability.
 * It changes only authored controls; the shared operation remains the sole input and output authority.
 */
export default defineStrategy({
  id: "cold-elevation",
  config: Type.Object(
    {
      maxTemperature: Type.Number({
        default: 4,
        minimum: -100,
        maximum: 100,
        description: "Snow is eligible when surfaceTemperature <= maxTemperature (C).",
      }),
      maxAridity: Type.Number({
        default: 0.9,
        minimum: 0,
        maximum: 1,
        description: "Snow is eligible when aridityIndex <= maxAridity (0..1).",
      }),
      freezeWeight: Type.Number({
        default: 1,
        minimum: 0,
        maximum: 10,
        description: "Weight of freezeIndex contribution to the raw snow suitability score.",
      }),
      elevationWeight: Type.Number({
        default: 1,
        minimum: 0,
        maximum: 10,
        description: "Weight of elevation contribution to the raw snow suitability score.",
      }),
      moistureWeight: Type.Number({
        default: 1,
        minimum: 0,
        maximum: 10,
        description: "Weight of effectiveMoisture contribution to the raw snow suitability score.",
      }),
      scoreNormalization: Type.Number({
        default: 3,
        minimum: 0.0001,
        maximum: 100,
        description: "Divisor for raw score normalization before clamping to 0..1.",
      }),
      scoreBias: Type.Number({
        default: 0,
        minimum: -10,
        maximum: 10,
        description: "Additive bias applied to the raw snow score.",
      }),
      elevationStrategy: Type.Union([Type.Literal("absolute"), Type.Literal("percentile")], {
        description:
          "Elevation normalization strategy for snow scoring: absolute meters or percentile-based land elevation.",
        default: "absolute",
      }),
      elevationMin: Type.Number({
        default: 200,
        minimum: -12000,
        maximum: 12000,
        description: "Minimum elevation used for elevation normalization (m).",
      }),
      elevationMax: Type.Number({
        default: 2400,
        minimum: -12000,
        maximum: 12000,
        description: "Maximum elevation used for elevation normalization (m).",
      }),
      elevationPercentileMin: Type.Number({
        default: 0.7,
        minimum: 0,
        maximum: 1,
        description:
          "Minimum land elevation percentile used when elevationStrategy is percentile (0..1).",
      }),
      elevationPercentileMax: Type.Number({
        default: 0.98,
        minimum: 0,
        maximum: 1,
        description:
          "Maximum land elevation percentile used when elevationStrategy is percentile (0..1).",
      }),
      moistureMin: Type.Number({
        default: 40,
        minimum: 0,
        maximum: 1000,
        description: "Minimum effectiveMoisture used for normalization.",
      }),
      moistureMax: Type.Number({
        default: 160,
        minimum: 0,
        maximum: 1000,
        description: "Maximum effectiveMoisture used for normalization.",
      }),
    },
    {
      description:
        "Cold, elevation, and moisture controls used to score snow eligibility and intensity.",
    }
  ),
});
