import { createStep } from "@swooper/mapgen-core/authoring";
import { measureStandardPlacementParity } from "../../../../metrics/families/placement-parity.js";
import { landMaskFromWaterMask } from "../../../../water-surface-parity.js";
import { logAsciiMap, logTerrainStats } from "../../log.js";
import { config } from "./config.js";
import { projectPlacementParityViz } from "./viz.js";

/**
 * Observes one terminal Civ7 surface after placement and compares its water and
 * lake classifications with immutable Morphology and Hydrology evidence.
 */
export const ObservePlacementParityStep = createStep(config, {
  run: (context, _stepConfig, _ops, deps) => {
    const topography = deps.artifacts.topography.read(context);
    const projectedLakes = deps.artifacts.projectedLakes.read(context);
    const { width, height } = context.setup.dimensions;
    const terminalSnapshot = {
      width,
      height,
      terrain: deps.engine.readCurrentMapTerrainTypes(context),
      elevation: deps.engine.readCurrentMapElevations(context),
      waterMask: deps.engine.readCurrentMapWaterMask(context),
      lakeMask: deps.engine.readCurrentMapLakeMask(context),
    };
    logTerrainStats(context, "Final", terminalSnapshot);
    logAsciiMap(context, terminalSnapshot);

    // Compare the final projected land classification with the engine surface
    // after all placement product work has completed. Accepted lakes are
    // intentionally water even though they began as Morphology land.
    const engineObservation = {
      terrain: terminalSnapshot.terrain,
      elevation: terminalSnapshot.elevation,
      landMask: landMaskFromWaterMask(terminalSnapshot.waterMask),
    };
    let waterDriftCount = 0;
    let acceptedLakeTileCount = 0;
    let finalLakeWaterDriftCount = 0;
    let finalLakeClassificationDriftCount = 0;
    const waterDrift = new Uint8Array(engineObservation.landMask.length);
    for (let i = 0; i < engineObservation.landMask.length; i++) {
      const acceptedLake = (projectedLakes.lakeMask[i] ?? 0) === 1;
      const expectedWater = (topography.landMask[i] ?? 0) !== 1 || acceptedLake;
      const engineWater = (terminalSnapshot.waterMask[i] ?? 0) === 1;
      if (engineWater !== expectedWater) {
        waterDriftCount++;
        // 1 = engine land where projection says water; 2 = engine water where projection says land.
        waterDrift[i] = engineWater ? 2 : 1;
      }
      if (!acceptedLake) continue;
      acceptedLakeTileCount++;
      if (!engineWater) finalLakeWaterDriftCount++;
      if ((terminalSnapshot.lakeMask[i] ?? 0) !== 1) finalLakeClassificationDriftCount++;
    }
    const placementParity = measureStandardPlacementParity({
      waterDriftCount,
      acceptedLakeTileCount,
      finalLakeWaterDriftCount,
      finalLakeClassificationDriftCount,
    });
    context.trace.event(() => ({
      type: "placement.parity",
      ...placementParity,
    }));
    console.log(`[SWOOPER_MOD] PLACEMENT_PARITY_V1 ${JSON.stringify(placementParity)}`);

    return {
      engineObservation,
      waterDrift,
      placementParity,
    };
  },
  metrics: ({ result }) => ({
    "placement.parity": result.placementParity,
  }),
  viz: ({ result, dimensions }) => projectPlacementParityViz(result, dimensions),
});
