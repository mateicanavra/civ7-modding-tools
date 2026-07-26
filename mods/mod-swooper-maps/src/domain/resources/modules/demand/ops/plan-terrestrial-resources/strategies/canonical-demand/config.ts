import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Plans every canonical terrestrial resource from admitted expectations and land-habitat signals.
 * The canonical policy is fixed and exposes no authored controls.
 */
export default defineStrategy({
  id: "canonical-demand",
  config: Type.Object({}, { additionalProperties: false }),
});
