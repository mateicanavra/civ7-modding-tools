import { CIV7_BROWSER_TABLES_V0 } from "@civ7/map-policy";
import { createStep } from "@swooper/mapgen-core/authoring";
import { assertNoWaterDrift } from "../../../../water-surface-parity.js";
import { PlotMountainsStepContract } from "./config.js";

/**
 * Stamps the authored mountain and hill masks after continents stabilize;
 * ridge and rough-land policy remain exclusively in Morphology truth.
 */
export const PlotMountainsStep = createStep(PlotMountainsStepContract, {
  run: (context, _config, _ops, deps) => {
    const topography = deps.artifacts.topography.read(context);
    const mountains = deps.artifacts.mountains.read(context);
    const { width, height } = context.setup.dimensions;

    // Projection-only: Morphology has already decided mountain/hill intent.
    // This map step only materializes that intent into Civ7 terrain and then
    // checks that engine terrain edits did not corrupt Morphology land/water truth.
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        if (topography.landMask[idx] !== 1) continue;
        if (mountains.mountainMask[idx] === 1) {
          context.adapter.setTerrainType(
            x,
            y,
            CIV7_BROWSER_TABLES_V0.terrainTypeIndices.TERRAIN_MOUNTAIN
          );
          continue;
        }
        if (mountains.hillMask[idx] === 1) {
          context.adapter.setTerrainType(
            x,
            y,
            CIV7_BROWSER_TABLES_V0.terrainTypeIndices.TERRAIN_HILL
          );
        }
      }
    }

    assertNoWaterDrift(context, topography.landMask, "map-morphology/plot-mountains");
  },
});
