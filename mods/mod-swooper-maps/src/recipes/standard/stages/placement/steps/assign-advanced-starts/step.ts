import type { TraceJsonObject } from "@swooper/mapgen-core";
import { createStep } from "@swooper/mapgen-core/authoring";
import { runPlacementProductStep } from "../../log.js";
import { AssignAdvancedStartsStepContract } from "./config.js";

/**
 * Recalculates fertility and delegates advanced-start regions to Civ7 after
 * discoveries, using effect ordering rather than read-and-discard artifacts.
 */
export const AssignAdvancedStartsStep = createStep(AssignAdvancedStartsStepContract, {
  run: (context, _config, _ops, deps) => {
    const emit = (payload: TraceJsonObject): void => {
      if (!context.trace?.isVerbose) return;
      context.trace.event(() => payload);
    };

    runPlacementProductStep("placement.fertility.recalculate", emit, () => {
      context.adapter.recalculateFertility();
      emit({ type: "placement.fertility.recalculated" });
    });
    runPlacementProductStep("placement.advancedStart.assign", emit, () => {
      context.adapter.assignAdvancedStartRegions();
    });
    deps.artifacts.advancedStartAssignment.publish(context, {
      fertilityRecalculated: true,
      advancedStartsAssigned: true,
    });
  },
});
