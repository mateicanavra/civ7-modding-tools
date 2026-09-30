import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/** Parameter-free snapshot sampling whose two- or four-season count comes from the operation input. */
export default defineStrategy({
  id: "legacy-snapshots",
  config: Type.Object({}, {
    additionalProperties: false,
    description: "Parameter-free legacy seasonal snapshots with the observation count supplied by the operation input.",
  }),
});
