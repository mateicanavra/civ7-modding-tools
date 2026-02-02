import { defineVizMeta, logElevationSummary, logLandmassAscii, snapshotEngineHeightfield } from "@swooper/mapgen-core";
import { createStep } from "@swooper/mapgen-core/authoring";
import BuildElevationStepContract from "./buildElevation.contract.js";
import { assertNoWaterDrift } from "./assertions.js";

const GROUP_MAP_MORPHOLOGY = "Map / Morphology (Engine)";
const TILE_SPACE_ID = "tile.hexOddR" as const;

export default createStep(BuildElevationStepContract, {
  run: (context, _config, _ops, deps) => {
    const topography = deps.artifacts.topography.read(context);
    const { width, height } = context.dimensions;

    // Align with base-standard posture: validate + stamp before buildElevation so
    // engine elevation/cliffs reflect the finalized terrain surface (incl. mountains/volcanoes).
    context.adapter.validateAndFixTerrain();
    context.adapter.recalculateAreas();
    context.adapter.stampContinents();
    context.adapter.recalculateAreas();
    context.adapter.buildElevation();
    context.adapter.recalculateAreas();

    const physics = context.buffers.heightfield;
    const engine = snapshotEngineHeightfield(context);
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "map.morphology.elevation.elevation",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "i16",
      values: physics.elevation,
      meta: defineVizMeta("map.morphology.elevation.elevation", {
        label: "Elevation (Physics Truth)",
        group: GROUP_MAP_MORPHOLOGY,
        role: "physics",
        visibility: "debug",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "map.morphology.elevation.landMask",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: physics.landMask,
      meta: defineVizMeta("map.morphology.elevation.landMask", {
        label: "Land Mask (Physics Truth)",
        group: GROUP_MAP_MORPHOLOGY,
        palette: "categorical",
        role: "physics",
        visibility: "debug",
      }),
    });
    if (engine) {
      context.viz?.dumpGrid(context.trace, {
        dataTypeKey: "map.morphology.elevation.elevation",
        spaceId: TILE_SPACE_ID,
        dims: { width, height },
        format: "i16",
      values: engine.elevation,
      meta: defineVizMeta("map.morphology.elevation.elevation", {
        label: "Elevation (Engine)",
        group: GROUP_MAP_MORPHOLOGY,
        role: "engine",
      }),
    });
      context.viz?.dumpGrid(context.trace, {
        dataTypeKey: "map.morphology.elevation.landMask",
        spaceId: TILE_SPACE_ID,
        dims: { width, height },
        format: "u8",
      values: engine.landMask,
      meta: defineVizMeta("map.morphology.elevation.landMask", {
        label: "Land Mask (Engine)",
        group: GROUP_MAP_MORPHOLOGY,
        palette: "categorical",
        role: "engine",
        visibility: "debug",
      }),
    });
    }

    logElevationSummary(context.trace, context.adapter, width, height, "map-morphology/build-elevation");
    logLandmassAscii(context.trace, context.adapter, width, height);
    assertNoWaterDrift(context, topography.landMask, "map-morphology/build-elevation");
  },
});
