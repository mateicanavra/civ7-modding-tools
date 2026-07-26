import type { TraceJsonObject } from "@swooper/mapgen-core";
import { createStep } from "@swooper/mapgen-core/authoring";
import {
  captureEngineHeightfield,
  engineLandMaskFromWaterMask,
} from "../../../../current-engine-surface.js";
import { logAsciiMap, logTerrainStats } from "../../log.js";
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
    const { width, height } = context.setup.dimensions;
    const emit = (payload: TraceJsonObject): void => {
      context.trace.event(() => payload);
    };
    emit({ type: "placement.start", message: "[SWOOPER_MOD] === placement summary ===" });
    emit({ type: "placement.start", message: `[SWOOPER_MOD] Map size: ${width}x${height}` });

    // Product artifacts are validated at publication. The terminal step
    // collates them without reopening their normalization or selection rules.
    const slotCounts = { none: 0, west: 0, east: 0 };
    for (const slot of landmassRegionSlotByTile.slotByTile) {
      if (slot === 1) slotCounts.west++;
      else if (slot === 2) slotCounts.east++;
      else slotCounts.none++;
    }
    const resourcesPlaced = resourcePlacement.summary.placedCount;
    const startsAssigned = startAssignment.assigned;
    logTerrainStats(context, "Final", currentEngineHeightfield);
    logAsciiMap(context, currentEngineHeightfield);

    // Compare the final Morphology land classification with the engine surface
    // after all placement product work has completed.
    const engineObservation = {
      terrain: currentEngineHeightfield.terrain,
      elevation: currentEngineHeightfield.elevation,
      landMask: engineLandMaskFromWaterMask(currentEngineHeightfield.waterMask),
    };
    let waterDriftCount = 0;
    const waterDrift = new Uint8Array(engineObservation.landMask.length);
    for (let i = 0; i < engineObservation.landMask.length; i++) {
      if ((engineObservation.landMask[i] ?? 0) === (topography.landMask[i] ?? 0)) continue;
      waterDriftCount++;
      // 1 = engine land where physics says water; 2 = engine water where physics says land.
      waterDrift[i] = (engineObservation.landMask[i] ?? 0) === 1 ? 1 : 2;
    }
    emit({
      type: "placement.parity",
      slotCounts,
      wondersPlanned: naturalWonderPlacement.plannedCount,
      wondersPlaced: naturalWonderPlacement.placedCount,
      resourcesAttempted: true,
      resourcesPlaced,
      waterDriftCount,
      starts: {
        primaryAssigned: startAssignment.primaryAssigned,
        islandClusterAssigned: startAssignment.islandClusterAssigned,
        marginalAssigned: startAssignment.marginalAssigned,
        noneAssigned: startAssignment.noneAssigned,
        rungCounts: startAssignment.rungCounts,
        status: startAssignment.status,
        candidateCount: startAssignment.candidateCount,
        tierCounts: startAssignment.tierCounts,
      },
    });

    return {
      engineObservation,
      waterDrift,
      summary: {
        slotCounts,
        naturalWondersCount: naturalWonderPlacement.placedCount,
        resourcesCount: resourcesPlaced,
        startsAssigned,
        waterDriftCount,
      },
    };
  },
  metrics: ({ result }) => ({
    "placement.completion": result.summary,
  }),
  viz: ({ result, dimensions }) => projectPlacementCompletionViz(result, dimensions),
});
