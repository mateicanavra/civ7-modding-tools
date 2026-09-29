import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

export default defineStrategy({
  id: "phase-reduction",
  config: Type.Object({}, { additionalProperties: false }),
});
