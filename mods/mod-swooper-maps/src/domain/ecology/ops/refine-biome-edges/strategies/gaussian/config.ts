import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Applies bounded Gaussian neighborhood voting for an authored number of passes.
 * It changes only authored controls; the shared operation remains the sole input and output authority.
 */
export default defineStrategy({
  id: "gaussian",
  config: Type.Object({
    radius: Type.Integer({ minimum: 1, maximum: 5, default: 1 }),
    iterations: Type.Integer({ minimum: 1, maximum: 4, default: 1 }),
  }),
});
