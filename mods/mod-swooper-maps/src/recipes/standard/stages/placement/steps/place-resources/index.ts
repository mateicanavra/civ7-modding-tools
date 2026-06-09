import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";

import { runPlacementProductStep } from "../product-runtime.js";
import {
  logResourcePlacementRuntimeTelemetry,
  placeResourcesWithTypedOutcomes,
} from "./materialize.js";
import { placementArtifacts } from "../../artifacts.js";
import PlaceResourcesStepContract from "./contract.js";

export default createStep(PlaceResourcesStepContract, {
  artifacts: implementArtifacts([placementArtifacts.resourcePlacementOutcomes], {
    resourcePlacementOutcomes: {},
  }),
  run: (context, _config, _ops, deps) => {
    const resources = deps.artifacts.resourcePlan.read(context);
    deps.artifacts.placementSurfacePreparation.read(context);
    const { width, height } = context.dimensions;
    const emit = (payload: Record<string, unknown>): void => {
      if (!context.trace?.isVerbose) return;
      context.trace.event(() => payload);
    };

    const outcomes = runPlacementProductStep("placement.resources", emit, () =>
      placeResourcesWithTypedOutcomes({ adapter: context.adapter, width, height, resources })
    );
    if (outcomes.assignment.spacingShortfallCount > 0) {
      // Spacing-preserving fallback (S1d): shortfalls are recorded, not forced.
      console.warn(
        `[Placement] Resource assignment recorded a spacing shortfall of ` +
          `${outcomes.assignment.spacingShortfallCount}/${outcomes.assignment.requestedPlannedCount} planned intents ` +
          `(authored minSpacingTiles=${outcomes.assignment.minSpacingTiles} preserved instead of decaying to 0).`
      );
      context.trace?.event(() => ({
        type: "placement.resources.spacingShortfall",
        level: "warn",
        spacingShortfallCount: outcomes.assignment.spacingShortfallCount,
        requestedPlannedCount: outcomes.assignment.requestedPlannedCount,
        assignedCount: outcomes.assignment.assignedCount,
        minSpacingTiles: outcomes.assignment.minSpacingTiles,
      }));
    }
    logResourcePlacementRuntimeTelemetry(
      outcomes.summary,
      outcomes.assignment,
      outcomes.outcomes,
      outcomes.assignmentTrace
    );
    deps.artifacts.resourcePlacementOutcomes.publish(context, outcomes);
  },
});
