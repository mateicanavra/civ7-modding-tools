import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Keeps active belt extraction derived entirely from tectonic history and provenance evidence.
 * The empty authoring surface is intentional: boundary proximity, regime, age, and driver
 * intensities are correlated physics outputs, not independent tuning knobs for later landforms.
 */
export default defineStrategy({
  id: "history-derived",
  config: Type.Object(
    {},
    {
      additionalProperties: false,
      description:
        "Active boundary belts and their proximity, regime, age, uplift, rift, and stress fields are derived from tectonic history; no independent author overrides are admitted.",
    }
  ),
});
