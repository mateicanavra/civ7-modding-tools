import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/** Fixed-shape annual water/energy balance; demand calibration belongs to baseline climate. */
export default defineStrategy({
  id: "annual-water-yield",
  config: Type.Object(
    {},
    {
      additionalProperties: false,
      description: "Approximates long-term dry-ground water yield with the fixed Turc-Pike partition; no extra infiltration, humidity loss, floor or scale.",
    }
  ),
});
