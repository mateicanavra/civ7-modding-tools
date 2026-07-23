import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/** Closed configuration contract for deriving events from classified boundary segments. */
export default defineStrategy({
  id: "boundary-derived",
  config: Type.Object({}, { additionalProperties: false }),
});
