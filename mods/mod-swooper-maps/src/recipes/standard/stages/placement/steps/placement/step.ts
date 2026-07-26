import { createStep } from "@swooper/mapgen-core/authoring";
import { captureEngineHeightfield } from "../../../../current-engine-surface.js";
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
    const currentEngineHeightfield = captureEngineHeightfield(context.setup.dimensions, {
      getTerrainType: (x, y) => deps.engine.getTerrainType(context, x, y),
      getElevation: (x, y) => deps.engine.getElevation(context, x, y),
      isWater: (x, y) => deps.engine.isWater(context, x, y),
    });

    return applyPlacementPlan({
      context,
      currentEngineHeightfield,
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
