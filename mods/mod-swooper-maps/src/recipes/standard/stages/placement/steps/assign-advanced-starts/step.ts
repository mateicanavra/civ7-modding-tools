import type { TraceJsonObject } from "@swooper/mapgen-core";
import { createStep } from "@swooper/mapgen-core/authoring";
import { runPlacementProductStep } from "../../log.js";
import { config } from "./config.js";

/**
 * Recalculates fertility and delegates advanced-start regions to Civ7 after
 * discoveries, using effect ordering rather than read-and-discard artifacts.
 */
export const AssignAdvancedStartsStep = createStep(config, {
  run: (context, _stepConfig, _ops, deps) => {
    const emit = (payload: TraceJsonObject): void => {
      context.trace.event(() => payload);
    };

    runPlacementProductStep("placement.fertility.recalculate", emit, () => {
      deps.engine.recalculateFertility(context);
      emit({ type: "placement.fertility.recalculated" });
    });
    runPlacementProductStep("placement.advancedStart.assign", emit, () => {
      deps.engine.assignAdvancedStartRegions(context);
    });
  },
});
