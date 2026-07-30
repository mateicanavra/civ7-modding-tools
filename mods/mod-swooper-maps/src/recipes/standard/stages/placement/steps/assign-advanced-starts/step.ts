import { createStep } from "@swooper/mapgen-core/authoring";
import { config } from "./config.js";

/**
 * Recalculates fertility and delegates advanced-start regions to Civ7 after
 * discoveries, using effect ordering rather than read-and-discard artifacts.
 */
export const AssignAdvancedStartsStep = createStep(config, {
  run: (context, _stepConfig, _ops, deps) => {
    deps.engine.recalculateFertility(context);
    deps.engine.assignAdvancedStartRegions(context);
  },
});
