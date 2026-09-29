import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

export default defineStrategy({
  id: "legacy-snapshots",
  config: Type.Object({}, { additionalProperties: false }),
});
