import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

export default defineStrategy({
  id: "certified-sill-spill",
  config: Type.Object({}, {
    additionalProperties: false,
    description: "Resolves certified open basins and downstream spill flow without a closed-basin fallback.",
  }),
});
