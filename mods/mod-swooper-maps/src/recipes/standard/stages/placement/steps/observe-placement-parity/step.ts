import { createStep } from "@swooper/mapgen-core/authoring";
import { landMaskFromWaterMask } from "../../../../water-surface-parity.js";
import { logAsciiMap, logTerrainStats } from "../../log.js";
import { config } from "./config.js";
import { projectPlacementParityViz } from "./viz.js";

/**
 * Observes Civ7 after placement and compares its final water classification
 * with the immutable projected map surface.
 */
export const ObservePlacementParityStep = createStep(config, {
  run: (context, _stepConfig, _ops, deps) => {
    const topography = deps.artifacts.topography.read(context);
    const projectedLakes = deps.artifacts.projectedLakes.read(context);
    const { width, height } = context.setup.dimensions;
    const currentEngineHeightfield = {
      width,
      height,
      terrain: deps.engine.readCurrentMapTerrainTypes(context),
      elevation: deps.engine.readCurrentMapElevations(context),
      waterMask: deps.engine.readCurrentMapWaterMask(context),
    };
    logTerrainStats(context, "Final", currentEngineHeightfield);
    logAsciiMap(context, currentEngineHeightfield);

    // Compare the final projected land classification with the engine surface
    // after all placement product work has completed. Accepted lakes are
    // intentionally water even though they began as Morphology land.
    const engineObservation = {
      terrain: currentEngineHeightfield.terrain,
      elevation: currentEngineHeightfield.elevation,
      landMask: landMaskFromWaterMask(currentEngineHeightfield.waterMask),
    };
    let waterDriftCount = 0;
    const waterDrift = new Uint8Array(engineObservation.landMask.length);
    for (let i = 0; i < engineObservation.landMask.length; i++) {
      const expectedLand =
        (topography.landMask[i] ?? 0) === 1 && (projectedLakes.lakeMask[i] ?? 0) !== 1 ? 1 : 0;
      if ((engineObservation.landMask[i] ?? 0) === expectedLand) continue;
      waterDriftCount++;
      // 1 = engine land where projection says water; 2 = engine water where projection says land.
      waterDrift[i] = (engineObservation.landMask[i] ?? 0) === 1 ? 1 : 2;
    }
    context.trace.event(() => ({
      type: "placement.parity",
      waterDriftCount,
    }));

    return {
      engineObservation,
      waterDrift,
    };
  },
  viz: ({ result, dimensions }) => projectPlacementParityViz(result, dimensions),
});
