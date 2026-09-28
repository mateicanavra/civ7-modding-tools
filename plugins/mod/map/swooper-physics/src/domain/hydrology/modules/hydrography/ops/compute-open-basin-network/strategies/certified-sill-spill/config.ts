import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

export default defineStrategy({
  id: "certified-sill-spill",
  config: Type.Object({}, { additionalProperties: false }),
});
