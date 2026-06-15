import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";
import { placementArtifacts } from "../../artifacts.js";
import { runPlacementProductStep } from "../product-runtime.js";
import AssignAdvancedStartsStepContract from "./contract.js";
import { validateAdvancedStartAssignmentArtifact } from "./validate.js";

export default createStep(AssignAdvancedStartsStepContract, {
  artifacts: implementArtifacts([placementArtifacts.advancedStartAssignment], {
    advancedStartAssignment: {
      validate: (value) => validateAdvancedStartAssignmentArtifact(value),
    },
  }),
  run: (context, _config, _ops, deps) => {
    const emit = (payload: Record<string, unknown>): void => {
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
