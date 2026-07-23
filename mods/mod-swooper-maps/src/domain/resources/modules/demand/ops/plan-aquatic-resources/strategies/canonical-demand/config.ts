import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Plans every canonical aquatic resource from admitted expectations and water-habitat signals.
 * The canonical policy is fixed and exposes no authored controls.
 */
export default defineStrategy({
  id: "canonical-demand",
  config: Type.Object({}, { additionalProperties: false }),
});
