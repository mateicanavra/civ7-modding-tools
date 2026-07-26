import { createStep } from "@swooper/mapgen-core/authoring";
import { captureEngineHeightfield } from "../../../../current-engine-surface.js";
import { applyPlacementPlan } from "./apply.js";
import { config } from "./config.js";
import { projectPlacementCompletionViz } from "./viz.js";

/**
 * Closes placement by assembling all product outcomes and comparing physics
 * truth with engine readback into terminal state and parity evidence.
 */
export const PlacementStep = createStep(config, {
  run: (context, _stepConfig, _ops, deps) => {
    const naturalWonderPlacement = deps.artifacts.naturalWonderPlacement.read(context);
    const resourcePlacement = deps.artifacts.resourcePlacementOutcomes.read(context);
    const startAssignment = deps.artifacts.startAssignment.read(context);
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
      resourcePlacement,
      startAssignment,
      landmassRegionSlotByTile,
      topographyLandMask: topography.landMask,
    });
  },
  metrics: ({ result }) => ({
    "placement.completion": result.summary,
  }),
  viz: ({ result, dimensions }) => projectPlacementCompletionViz(result, dimensions),
});
