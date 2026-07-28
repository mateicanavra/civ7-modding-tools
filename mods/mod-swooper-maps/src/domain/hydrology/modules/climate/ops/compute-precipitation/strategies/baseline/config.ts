import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Defines humidity mapping, seeded texture, coastal bonuses, and rain-shadow controls for the
 * scalar baseline alternative. Defaults favor broadly humidity-driven rainfall with modest local
 * texture and a four-tile orographic search.
 */
export default defineStrategy({
  id: "baseline",
  config: Type.Object(
    {
      /**
       * Scales humidity into rainfall (0..200 clamp happens at output).
       *
       * Practical guidance:
       * - If the world is globally too wet/dry: adjust this (or prefer the `dryness` knob upstream).
       */
      rainfallScale: Type.Number({
        default: 180,
        minimum: 0,
        maximum: 400,
        description: "Scales humidity into rainfall (0..200 clamp happens at output).",
      }),
      /**
       * Non-linear scaling applied to humidity before rainfall mapping.
       *
       * Practical guidance:
       * - Higher values concentrate rainfall into fewer “wet cores” (sharper gradients).
       * - Lower values spread rainfall more evenly (flatter gradients).
       */
      humidityExponent: Type.Number({
        default: 1,
        minimum: 0.1,
        maximum: 6,
        description: "Non-linear scaling applied to humidity before rainfall mapping.",
      }),
      /**
       * Perlin noise amplitude added to baseline rainfall.
       *
       * Practical guidance:
       * - Increase for more local rainfall texture (more patchiness).
       * - Decrease for smoother, more banded rainfall.
       */
      noiseAmplitude: Type.Number({
        default: 6,
        minimum: 0,
        maximum: 40,
        description: "Perlin noise amplitude added to baseline rainfall.",
      }),
      /**
       * Perlin noise frequency for rainfall texture.
       *
       * Practical guidance:
       * - Increase for smaller-scale texture.
       * - Decrease for larger-scale blobs/bands.
       */
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
      /** Orographic rain shadow simulation (leeward drying effect). */
      orographic: Type.Object(
        {
          /** How far upwind to scan for blocking terrain (tiles). */
          steps: Type.Integer({
            default: 4,
            minimum: 1,
            maximum: 16,
            description: "How far upwind to scan for blocking terrain (tiles).",
          }),
          /** Base rainfall reduction when a barrier exists upwind. */
          reductionBase: Type.Number({
            default: 8,
            minimum: 0,
            maximum: 80,
            description: "Base rainfall reduction when a barrier exists upwind.",
          }),
          /** Additional reduction per upwind barrier step. */
          reductionPerStep: Type.Number({
            default: 6,
            minimum: 0,
            maximum: 80,
            description: "Additional reduction per upwind barrier step.",
          }),
          /** Elevation threshold treated as a barrier if terrain is not mountainous. */
          barrierElevationM: Type.Integer({
            default: 500,
            minimum: 0,
            maximum: 9000,
            description: "Elevation threshold treated as a barrier if terrain is not mountainous.",
          }),
        },
        {
          additionalProperties: false,
          description:
            "Orographic rain shadow parameters (windward uplift and leeward drying proxy).",
        }
      ),
    },
    {
      additionalProperties: false,
      description:
        "Maps humidity to scalar rainfall, then adds seeded texture, coastal moisture, and bounded orographic drying.",
    }
  ),
});
