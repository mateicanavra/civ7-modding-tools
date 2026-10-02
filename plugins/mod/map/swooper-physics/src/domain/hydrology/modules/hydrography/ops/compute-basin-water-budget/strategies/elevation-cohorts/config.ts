import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/** Parameter-free response law replacing submerged runoff with direct rainfall minus demand by complete elevation cohort. */
export default defineStrategy({
  id: "elevation-cohorts",
  config: Type.Object({}, { additionalProperties: false }),
});
