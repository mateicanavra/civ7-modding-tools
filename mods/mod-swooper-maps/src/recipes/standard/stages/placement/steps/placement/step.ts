import { createStep } from "@swooper/mapgen-core/authoring";
import { applyPlacementPlan } from "./apply.js";
import { PlacementStepContract } from "./config.js";
import { projectPlacementCompletionViz } from "./viz.js";

/**
 * Closes placement by assembling all product outcomes and comparing physics
 * truth with engine readback into terminal state and parity evidence.
 */
export const PlacementStep = createStep(PlacementStepContract, {
  run: (context, _config, _ops, deps) => {
    const naturalWonderPlacement = deps.artifacts.naturalWonderPlacement.read(context);
    const surfacePreparation = deps.artifacts.placementSurfacePreparation.read(context);
    const resourcePlacement = deps.artifacts.resourcePlacementOutcomes.read(context);
    const startAssignment = deps.artifacts.startAssignment.read(context);
    const discoveryPlacement = deps.artifacts.discoveryPlacementOutcomes.read(context);
    const advancedStartAssignment = deps.artifacts.advancedStartAssignment.read(context);
    const landmassRegionSlotByTile = deps.artifacts.landmassRegionSlotByTile.read(context);
    const topography = deps.artifacts.topography.read(context);

    return applyPlacementPlan({
      context,
      naturalWonderPlacement,
      surfacePreparation,
      resourcePlacement,
      startAssignment,
      discoveryPlacement,
      advancedStartAssignment,
      landmassRegionSlotByTile,
      topographyLandMask: topography.landMask,
      publishOutputs: (outputs) => deps.artifacts.placementOutputs.publish(context, outputs),
      publishEngineState: (engineState) => deps.artifacts.engineState.publish(context, engineState),
      publishEngineTerrainSnapshot: (snapshot) =>
        deps.artifacts.placementEngineTerrainSnapshot.publish(context, snapshot),
    });
  },
  viz: ({ result, dimensions }) => projectPlacementCompletionViz(result, dimensions),
});
