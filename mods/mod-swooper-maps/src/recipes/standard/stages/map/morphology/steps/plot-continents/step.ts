import { deriveCiv7CoastProjection } from "@civ7/map-policy";
import { createStep } from "@swooper/mapgen-core/authoring";
import {
  captureEngineHeightfield,
  engineLandMaskFromWaterMask,
} from "../../../../../current-engine-surface.js";
import { defineStandardVizMeta } from "../../../../../viz.js";
import {
  assertWaterDriftWithinPolicy,
  restoreProjectedCoastTerrain,
} from "../../../../../water-surface-parity.js";
import { PlotContinentsStepContract } from "./config.js";

const GROUP_MAP_MORPHOLOGY = "Map / Morphology (Engine)";
const TILE_SPACE_ID = "tile.hexOddQ" as const;

/**
 * Validates continent terrain only after coast projection, preserving that
 * ordering through effect tags and checking the resulting engine surface.
 */
export const PlotContinentsStep = createStep(PlotContinentsStepContract, {
  run: (context, _config, _ops, deps) => {
    const topography = deps.artifacts.topography.read(context);
    const shelf = deps.artifacts.shelf.read(context);
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

    const engine = captureEngineHeightfield(context.setup.dimensions, {
      getTerrainType: (x, y) => deps.engine.getTerrainType(context, x, y),
      getElevation: (x, y) => deps.engine.getElevation(context, x, y),
      isWater: (x, y) => deps.engine.isWater(context, x, y),
    });
    const engineLandMask = engineLandMaskFromWaterMask(engine.waterMask);
    assertWaterDriftWithinPolicy(
      context.setup.dimensions,
      context.trace,
      engine.waterMask,
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
