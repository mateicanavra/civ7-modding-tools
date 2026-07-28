import { deriveCiv7CoastProjection } from "@civ7/map-policy";
import { createStep } from "@swooper/mapgen-core/authoring";
import { defineStandardVizMeta } from "../../../../../viz.js";
import {
  assertWaterDriftWithinPolicy,
  landMaskFromWaterMask,
  restoreProjectedCoastTerrain,
} from "../../../../../water-surface-parity.js";
import { config } from "./config.js";

const GROUP_MAP_MORPHOLOGY = "Map / Morphology (Engine)";
const TILE_SPACE_ID = "tile.hexOddQ" as const;

/**
 * Validates continent terrain only after coast projection, preserving that
 * transaction boundary through completion dependencies and checking the
 * resulting engine surface.
 */
export const PlotContinentsStep = createStep(config, {
  run: (context, _stepConfig, _ops, deps) => {
    const topography = deps.artifacts.topography.read();
    const shelf = deps.artifacts.shelf.read();
    const { width, height } = context.setup.dimensions;
    const coastProjection = deriveCiv7CoastProjection({
      width,
      height,
      landMask: topography.landMask,
      shelfMask: shelf.shelfMask,
      coastalWater: shelf.coastalWater,
    });

    deps.engine.validateAndFixTerrain(context);
    deps.engine.recalculateAreas(context);
    deps.engine.stampContinents(context);
    restoreProjectedCoastTerrain(
      context.setup.dimensions,
      context.trace,
      {
        getTerrainType: (x, y) => deps.engine.getTerrainType(context, x, y),
        setTerrainType: (x, y, terrainType) =>
          deps.engine.setTerrainType(context, x, y, terrainType),
        storeWaterData: () => deps.engine.storeWaterData(context),
      },
      coastProjection,
      "map-morphology/plot-continents"
    );

    const engineWaterMask = deps.engine.readCurrentMapWaterMask(context);
    const engineLandMask = landMaskFromWaterMask(engineWaterMask);
    assertWaterDriftWithinPolicy(
      context.setup.dimensions,
      context.trace,
      engineWaterMask,
      topography.landMask,
      "map-morphology/plot-continents"
    );
    return { physicsLandMask: topography.landMask, engineLandMask };
  },
  viz: ({ result, dimensions }) => [
    {
      kind: "grid",
      dataTypeKey: "map.morphology.continents.landMask",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "u8", values: result.physicsLandMask },
      meta: defineStandardVizMeta("map.morphology.continents.landMask", "category.distinct", {
        label: "Land Mask (Physics Truth)",
        group: GROUP_MAP_MORPHOLOGY,
        role: "physics",
      }),
    },
    {
      kind: "grid",
      dataTypeKey: "map.morphology.continents.landMask",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "u8", values: result.engineLandMask },
      meta: defineStandardVizMeta("map.morphology.continents.landMask", "category.distinct", {
        label: "Land Mask (Engine After Stamp Continents)",
        group: GROUP_MAP_MORPHOLOGY,
        role: "engine",
      }),
    },
  ],
});
