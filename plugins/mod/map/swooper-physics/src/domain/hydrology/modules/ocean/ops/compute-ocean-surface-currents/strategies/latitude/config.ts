import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Exposes one global strength control for the latitude-band current fallback. Its neutral default
 * preserves the deterministic band profile, while zero removes ocean-current coupling entirely.
 */
export default defineStrategy({
  id: "latitude",
  config: Type.Object(
    {
      /**
       * Global current strength multiplier.
       *
       * Practical guidance:
       * - Increase for stronger ocean coupling (more coastal moisture/temperature moderation).
       * - Decrease toward 0 to fade out ocean influence.
       */
      strength: Type.Number({
        default: 1,
        minimum: 0,
        maximum: 4,
        description: "Global current strength multiplier.",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Scales deterministic latitude-band currents while deliberately ignoring wind, basin, and coastline evidence as a stable fallback.",
    }
  ),
});
