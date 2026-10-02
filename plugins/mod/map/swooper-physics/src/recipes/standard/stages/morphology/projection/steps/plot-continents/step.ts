import { createStep } from "@swooper/mapgen-core/authoring";
import { defineStandardVizMeta } from "../../../../../viz.js";
import {
  assertWaterDriftWithinPolicy,
  deriveResolvedCoastProjection,
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
    const hydrography = deps.artifacts.hydrography.read();
    const topography = deps.artifacts.topography.read();
    const lakePlan = deps.artifacts.lakePlan.read();
    const shelf = deps.artifacts.shelf.read();
    const resolvedCoastline = deps.artifacts.resolvedCoastline.read();
    const { width, height } = context.setup.dimensions;
    const coastProjection = deriveResolvedCoastProjection({
      width,
      height,
      exposedLandMask: hydrography.exposedLandMask,
      externalWaterMask: topography.externalWaterMask,
      lakeMask: lakePlan.lakeMask,
      shelfMask: shelf.shelfMask,
      coastalWater: resolvedCoastline.coastalWater,
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
      hydrography.exposedLandMask,
      "map-morphology/plot-continents"
    );
    return { physicsLandMask: hydrography.exposedLandMask, engineLandMask };
  },
  viz: ({ observation, dimensions }) => [
    {
      kind: "grid",
      dataTypeKey: "map.morphology.continents.landMask",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "u8", values: observation.physicsLandMask },
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
      field: { format: "u8", values: observation.engineLandMask },
      meta: defineStandardVizMeta("map.morphology.continents.landMask", "category.distinct", {
        label: "Land Mask (Engine After Stamp Continents)",
        group: GROUP_MAP_MORPHOLOGY,
        role: "engine",
      }),
    },
  ],
});
