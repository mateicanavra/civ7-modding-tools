import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Declares a parameter-free present-state posture: the newest reconstructed era supplies current
 * boundary fields while admitted history supplies cumulative uplift.
 */
export default defineStrategy({
  id: "newest-era-composite",
  config: Type.Object(
    {},
    {
      additionalProperties: false,
      description:
        "Present tectonic state is composed from the newest admitted era and exposes no authored parameters.",
    }
  ),
});
