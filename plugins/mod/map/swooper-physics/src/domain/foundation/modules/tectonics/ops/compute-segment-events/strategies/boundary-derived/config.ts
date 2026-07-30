import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Declares a parameter-free event posture in which classified boundary segments and crust evidence
 * fully determine emission. Authored tuning belongs upstream in segment classification.
 */
export default defineStrategy({
  id: "boundary-derived",
  config: Type.Object(
    {},
    {
      additionalProperties: false,
      description:
        "Tectonic events derive directly from classified boundary segments and expose no authored parameters.",
    }
  ),
});
