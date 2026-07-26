import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/** Closed configuration contract for deriving events from classified boundary segments. */
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
