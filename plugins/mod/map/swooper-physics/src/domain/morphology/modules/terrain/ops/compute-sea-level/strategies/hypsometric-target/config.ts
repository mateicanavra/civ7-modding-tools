import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Controls the hypsometric water target and soft requirements for tectonically meaningful emerged
 * land. Scalar and deterministic variance modify the requested water percentage first; the solver
 * may then move within its bounded search window to improve boundary and continental land shares.
 */
export default defineStrategy({
  id: "hypsometric-target",
  config: Type.Object(
    {
      /** Target global water coverage (0-100). */
      targetWaterPercent: Type.Number({
        description:
          "Target global water coverage (0-100). 55-65 mimics Earth; 70-75 drifts toward archipelago worlds.",
        default: 60,
        minimum: 0,
        maximum: 100,
      }),
      /**
       * Multiplier applied after targetWaterPercent (typically 0.75-1.25).
       * Clamped to 0.25-1.75 to prevent full ocean/land wipeouts.
       */
      targetScalar: Type.Number({
        description:
          "Controls map water coverage by multiplying targetWaterPercent after the base sea-level posture is chosen.",
        default: 1,
        minimum: 0.25,
        maximum: 1.75,
      }),
      /** Optional variance (0-100) applied to the target water percent per map. */
      variance: Type.Number({
        description:
          "Maximum deterministic jitter, in percentage points, added to or subtracted from the scaled water target for each map seed.",
        default: 0,
        minimum: 0,
        maximum: 100,
      }),
      /**
       * Soft backstop on the share of land inside the boundary closeness band (0..1).
       * The solver lowers threshold in 5-point steps until boundary share meets this target.
       */
      boundaryShareTarget: Type.Number({
        description:
          "Soft minimum share of emerged land required inside the high-closeness boundary band (0..1); the solver may adjust water coverage to reduce a shortfall.",
        default: 0.15,
        minimum: 0,
        maximum: 1,
      }),
      /** Desired share of continental crust when balancing land vs. ocean plates (0..1). */
      continentalFraction: Type.Number({
        default: 0.39,
        description:
          "Soft minimum share of emerged land required on continental crust (0..1), not a target for global crust composition.",
        minimum: 0,
        maximum: 1,
      }),
    },
    {
      additionalProperties: false,
      description:
        "Target water share, variance, and crust-composition adjustments used to select sea level from terrain hypsometry.",
    }
  ),
});
