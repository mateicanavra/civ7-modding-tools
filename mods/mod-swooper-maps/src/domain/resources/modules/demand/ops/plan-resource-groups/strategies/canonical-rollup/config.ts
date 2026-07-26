import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Reconciles the four resource-family plans without repairing their evidence or ownership.
 * The canonical rollup is fixed and exposes no authored controls.
 */
export default defineStrategy({
  id: "canonical-rollup",
  config: Type.Object(
    {},
    {
      additionalProperties: false,
      description:
        "Fixed rollup policy that reconciles aquatic, cultivated, terrestrial, and geological demand evidence without re-authoring family plans.",
    }
  ),
});
