import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

export default defineStrategy({
  id: "elevation-cohorts",
  config: Type.Object({}, { additionalProperties: false }),
});
