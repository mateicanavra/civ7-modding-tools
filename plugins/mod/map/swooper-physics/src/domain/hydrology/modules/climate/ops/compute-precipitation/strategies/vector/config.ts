import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Defines the base humidity, texture, and coastal controls plus uplift and convergence weights for
 * the default precipitation posture. Defaults retain the scalar rainfall backbone while adding
 * moderate vector-aware terrain response.
 */
export default defineStrategy({
  id: "vector",
  config: Type.Object(
    {
      /** Scales humidity into rainfall (0..200 clamp happens at output). */
      rainfallScale: Type.Number({
        default: 180,
        minimum: 0,
        maximum: 400,
        description: "Scales humidity into rainfall (0..200 clamp happens at output).",
      }),
      /** Non-linear scaling applied to humidity before rainfall mapping. */
      humidityExponent: Type.Number({
        default: 1,
        minimum: 0.1,
        maximum: 6,
        description: "Non-linear scaling applied to humidity before rainfall mapping.",
      }),
      /** Perlin noise amplitude added to baseline rainfall. */
      noiseAmplitude: Type.Number({
        default: 6,
        minimum: 0,
        maximum: 40,
        description: "Perlin noise amplitude added to baseline rainfall.",
      }),
      /** Perlin noise frequency for rainfall texture. */
      noiseScale: Type.Number({
        default: 0.12,
        minimum: 0.01,
        maximum: 1,
        description: "Perlin noise frequency for rainfall texture.",
      }),
      /** Continental effect (distance from ocean impacts humidity/precip). */
      waterGradient: Type.Object(
        {
          /** How far inland to apply coastal moisture/precip bonus (tiles). */
          radius: Type.Integer({
            default: 5,
            minimum: 1,
            maximum: 20,
            description: "How far inland to apply coastal moisture/precip bonus (tiles).",
          }),
          /** Bonus rainfall per ring closer to water. */
          perRingBonus: Type.Number({
            default: 4,
            minimum: 0,
            maximum: 40,
            description: "Bonus rainfall per ring closer to water.",
          }),
          /** Extra rainfall bonus for low-elevation coastal land. */
          lowlandBonus: Type.Number({
            default: 2,
            minimum: 0,
            maximum: 40,
            description: "Extra rainfall bonus for low-elevation coastal land.",
          }),
          /** Maximum elevation to qualify for lowlandBonus. */
          lowlandElevationMax: Type.Integer({
            default: 150,
            minimum: -2000,
            maximum: 8000,
            description: "Maximum elevation to qualify for lowlandBonus.",
          }),
        },
        {
          additionalProperties: false,
          description:
            "Adds near-coast rainfall that decays by inland ring, with a separate bonus for low coastal terrain.",
        }
      ),
      /** Strength of windward uplift rainfall boost derived from ∇elevation · wind. */
      upliftStrength: Type.Number({
        default: 22,
        minimum: 0,
        maximum: 200,
        description: "Strength of windward uplift rainfall boost derived from ∇elevation · wind.",
      }),
      /** Strength of convergence rainfall boost derived from negative divergence (convergence). */
      convergenceStrength: Type.Number({
        default: 16,
        minimum: 0,
        maximum: 200,
        description:
          "Strength of convergence rainfall boost derived from negative divergence (convergence).",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Maps humidity to rainfall, then combines seeded and coastal texture with wind-aware uplift and convergence effects.",
    }
  ),
});
