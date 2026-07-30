import { CIV7_BROWSER_TABLES_V0 } from "@civ7/map-policy";
import type { FeatureData } from "@civ7/types";
import { createStep } from "@swooper/mapgen-core/authoring";
import { assertNoWaterDrift } from "../../../../../water-surface-parity.js";
import { config } from "./config.js";

/**
 * Stamps the upstream volcano plan after continent terrain is stable and marks
 * projection completion only after exact engine readback closes every planned
 * terrain and feature mutation.
 */
export const PlotVolcanoesStep = createStep(config, {
  run: (context, _stepConfig, _ops, deps) => {
    const topography = deps.artifacts.topography.read(context);
    const plan = deps.artifacts.volcanoes.read(context);
    const { width } = context.setup.dimensions;

    for (const entry of plan.volcanoes) {
      const index = entry.tileIndex;
      const y = (index / width) | 0;
      const x = index - y * width;
      deps.engine.setTerrainType(
        context,
        x,
        y,
        CIV7_BROWSER_TABLES_V0.terrainTypeIndices.TERRAIN_MOUNTAIN
      );
      const featureData: FeatureData = {
        Feature: CIV7_BROWSER_TABLES_V0.featureTypes.FEATURE_VOLCANO,
        Direction: -1,
        Elevation: 0,
      };
      deps.engine.setFeatureType(context, x, y, featureData);
    }

    const terrainTypes = deps.engine.readCurrentMapTerrainTypes(context);
    const featureTypes = deps.engine.readCurrentMapFeatureTypes(context);
    let missingFeatureCount = 0;
    let wrongTerrainCount = 0;
    for (const entry of plan.volcanoes) {
      const index = entry.tileIndex;
      if (featureTypes[index] !== CIV7_BROWSER_TABLES_V0.featureTypes.FEATURE_VOLCANO) {
        missingFeatureCount += 1;
      }
      if (terrainTypes[index] !== CIV7_BROWSER_TABLES_V0.terrainTypeIndices.TERRAIN_MOUNTAIN) {
        wrongTerrainCount += 1;
      }
    }
    if (missingFeatureCount > 0 || wrongTerrainCount > 0) {
      throw new Error(
        `Volcano projection readback mismatch: ${missingFeatureCount} planned features missing, ${wrongTerrainCount} planned terrains not mountainous.`
      );
    }

    const engineWaterMask = deps.engine.readCurrentMapWaterMask(context);
    assertNoWaterDrift(
      context.setup.dimensions,
      engineWaterMask,
      topography.landMask,
      "map-morphology/plot-volcanoes"
    );
  },
});
