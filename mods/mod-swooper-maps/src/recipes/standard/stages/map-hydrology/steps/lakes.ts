import { createStep } from "@swooper/mapgen-core/authoring";
import { defineVizMeta, syncHeightfield } from "@swooper/mapgen-core";
import { getStandardRuntime } from "../../../runtime.js";
import LakesStepContract from "./lakes.contract.js";
import { HYDROLOGY_LAKEINESS_TILES_PER_LAKE_MULTIPLIER } from "@mapgen/domain/hydrology/shared/knob-multipliers.js";
import type { HydrologyLakeinessKnob } from "@mapgen/domain/hydrology/shared/knobs.js";

const GROUP_MAP_HYDROLOGY = "Map / Hydrology (Projection)";
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

    // Projection-only visualization; engine lakes may differ from hydrology sink/outlet masks.
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "map.hydrology.lakes.sinkMask",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: hydrography.sinkMask,
      meta: defineVizMeta("map.hydrology.lakes.sinkMask", {
        label: "Lake Sinks (Projected)",
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
        label: "Lake Outlets (Projected)",
        group: GROUP_MAP_HYDROLOGY,
        palette: "categorical",
      }),
    });

    context.adapter.generateLakes(width, height, tilesPerLake);
    syncHeightfield(context);
  },
});
