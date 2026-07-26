import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/** Latitude bands provide deterministic zonal currents when wind-and-gyre projection is not selected. */
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
      description: "Ocean surface current parameters for the latitude strategy.",
    }
  ),
});
