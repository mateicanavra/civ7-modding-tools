import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/** Declares authored configuration for the `carved-coast-datum` implementation of `morphology/reconcile-heightfield-from-coast`. */
export default defineStrategy({
  id: "carved-coast-datum",
  config: Type.Object(
    {},
    {
      additionalProperties: false,
      description: "Parameter-free heightfield reconciliation from the carved coastline.",
    }
  ),
});
