import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

export default defineStrategy({
  id: "original-identity",
  config: Type.Object({}, { additionalProperties: false }),
});
