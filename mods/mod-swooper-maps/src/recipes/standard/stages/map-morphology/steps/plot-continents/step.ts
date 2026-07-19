import { snapshotEngineHeightfield } from "@civ7/adapter/mapgen";
import { createStep } from "@swooper/mapgen-core/authoring";
import { defineStandardVizMeta } from "../../../../viz.js";
import { assertWaterDriftWithinPolicy } from "../../../../water-surface-parity.js";
import { restoreProjectedCoastTerrain } from "../../coast-terrain-restoration.js";
import { PlotContinentsStepContract } from "./config.js";

const GROUP_MAP_MORPHOLOGY = "Map / Morphology (Engine)";
const TILE_SPACE_ID = "tile.hexOddQ" as const;

/**
 * Validates continent terrain only after coast projection, preserving that
 * ordering through effect tags and capturing the resulting engine surface.
 */
export const PlotContinentsStep = createStep(PlotContinentsStepContract, {
  run: (context, _config, _ops, deps) => {
    const topography = deps.artifacts.topography.read(context);
    const coastClassification = deps.artifacts.coastClassification.read(context);
    const { width, height } = context.setup.dimensions;

    context.adapter.validateAndFixTerrain();
    context.adapter.recalculateAreas();
    context.adapter.stampContinents();
    restoreProjectedCoastTerrain(context, coastClassification, "map-morphology/plot-continents");

    const engine = snapshotEngineHeightfield(context.adapter);
    deps.artifacts.continentValidationTerrainSnapshot.publish(context, {
      stage: "map-morphology/plot-continents",
      width,
      height,
      landMask: engine.landMask,
      terrain: engine.terrain,
      elevation: engine.elevation,
    });

    assertWaterDriftWithinPolicy(context, topography.landMask, "map-morphology/plot-continents");
    return { physicsLandMask: topography.landMask, engineLandMask: engine.landMask };
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
