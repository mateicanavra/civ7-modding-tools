import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Plans every canonical cultivated resource from admitted expectations and agriculture signals.
 * The canonical policy is fixed and exposes no authored controls.
 */
export default defineStrategy({
  id: "canonical-demand",
  config: Type.Object(
    {},
    {
      additionalProperties: false,
      description:
        "Fixed cultivated-resource demand policy derived from canonical expectations and agriculture evidence; it exposes no authored controls.",
    }
  ),
});
