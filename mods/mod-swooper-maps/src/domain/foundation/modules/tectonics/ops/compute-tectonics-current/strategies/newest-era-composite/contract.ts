import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/** Closed configuration contract for composing present state from the newest era. */
export default defineStrategy({
  id: "newest-era-composite",
  config: Type.Object({}, { additionalProperties: false }),
});
