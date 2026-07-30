import { createStep } from "@swooper/mapgen-core/authoring";
import { config } from "./config.js";

/**
 * Recalculates fertility and delegates advanced-start regions to Civ7 after
 * the selected plan has admitted major-start evidence and discovery completion.
 */
export const AssignAdvancedStartsStep = createStep(config, {
  run: (context, _stepConfig, _ops, deps) => {
    deps.engine.recalculateFertility(context);
    deps.engine.assignAdvancedStartRegions(context);
  },
});
