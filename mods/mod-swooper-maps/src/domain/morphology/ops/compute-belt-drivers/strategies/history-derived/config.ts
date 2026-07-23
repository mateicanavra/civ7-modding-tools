import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/** Declares authored configuration for the `history-derived` implementation of `morphology/compute-belt-drivers`. */
export default defineStrategy({
  id: "history-derived",
  config: Type.Object(
    {},
    {
      additionalProperties: false,
      description:
        "Belt-driver derivation configuration. This op is intentionally config-light; derived fields are physics outputs.",
    }
  ),
});
