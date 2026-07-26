import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Plans every canonical geological resource from admitted expectations and geology signals.
 * The canonical policy is fixed and exposes no authored controls.
 */
export default defineStrategy({
  id: "canonical-demand",
  config: Type.Object({}, { additionalProperties: false }),
});
