import { createStep } from "@swooper/mapgen-core/authoring";
import { defineVizMeta, snapshotEngineHeightfield } from "@swooper/mapgen-core";
import { getStandardRuntime } from "../../../runtime.js";
import LakesStepContract from "./lakes.contract.js";
import { HYDROLOGY_LAKEINESS_TILES_PER_LAKE_MULTIPLIER } from "@mapgen/domain/hydrology/shared/knob-multipliers.js";
import type { HydrologyLakeinessKnob } from "@mapgen/domain/hydrology/shared/knobs.js";

const GROUP_MAP_HYDROLOGY = "Map / Hydrology (Engine)";
const TILE_SPACE_ID = "tile.hexOddR" as const;

export default createStep(LakesStepContract, {
  normalize: (config, ctx) => {
    const { lakeiness = "normal" as HydrologyLakeinessKnob } = ctx.knobs as {
      lakeiness?: HydrologyLakeinessKnob;
    };
    const tilesPerLakeMultiplier =
      config.tilesPerLakeMultiplier * HYDROLOGY_LAKEINESS_TILES_PER_LAKE_MULTIPLIER[lakeiness];
    return tilesPerLakeMultiplier === config.tilesPerLakeMultiplier
      ? config
      : { ...config, tilesPerLakeMultiplier };
  },
  run: (context, config, _ops, deps) => {
    const hydrography = deps.artifacts.hydrography.read(context);
    const runtime = getStandardRuntime(context);
    const { width, height } = context.dimensions;
    const baseTilesPerLake = Math.max(10, (runtime.mapInfo.LakeGenerationFrequency ?? 5) * 2);
    const tilesPerLake = Math.max(10, Math.round(baseTilesPerLake * config.tilesPerLakeMultiplier));

    // Map-stage visualization: hydrology sink/outlet masks are inputs to engine lake generation (not 1:1 with engine results).
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "map.hydrology.lakes.sinkMask",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: hydrography.sinkMask,
      meta: defineVizMeta("map.hydrology.lakes.sinkMask", {
        label: "Lake Sinks (Hydrology)",
        group: GROUP_MAP_HYDROLOGY,
        palette: "categorical",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "map.hydrology.lakes.outletMask",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: hydrography.outletMask,
      meta: defineVizMeta("map.hydrology.lakes.outletMask", {
        label: "Lake Outlets (Hydrology)",
        group: GROUP_MAP_HYDROLOGY,
        palette: "categorical",
        visibility: "debug",
      }),
    });

    context.adapter.generateLakes(width, height, tilesPerLake);

    // Keep area topology in sync with post-lake terrain edits before any downstream validation.
    // Base-standard scripts always rebuild areas immediately after generateLakes().
    context.adapter.recalculateAreas();

    // Our pipeline projects lakes after buildElevation(), so refresh water caches explicitly.
    // This ensures GameplayMap.isWater and downstream eligibility reads include new lakes.
    context.adapter.storeWaterData();
    const physics = context.buffers.heightfield;
    const engine = snapshotEngineHeightfield(context);
    if (engine) {
      context.viz?.dumpGrid(context.trace, {
        dataTypeKey: "debug.heightfield.landMask",
        spaceId: TILE_SPACE_ID,
        dims: { width, height },
        format: "u8",
        values: physics.landMask,
        meta: defineVizMeta("debug.heightfield.landMask", {
          label: "Land Mask (Physics Truth)",
          group: GROUP_MAP_HYDROLOGY,
          palette: "categorical",
          role: "physics",
          visibility: "debug",
        }),
      });
      context.viz?.dumpGrid(context.trace, {
        dataTypeKey: "debug.heightfield.landMask",
        spaceId: TILE_SPACE_ID,
        dims: { width, height },
        format: "u8",
        values: engine.landMask,
        meta: defineVizMeta("debug.heightfield.landMask", {
          label: "Land Mask (Engine After Lakes)",
          group: GROUP_MAP_HYDROLOGY,
          palette: "categorical",
          role: "engine",
          visibility: "debug",
        }),
      });
    }
  },
});
