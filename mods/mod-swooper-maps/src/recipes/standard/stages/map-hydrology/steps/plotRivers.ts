import {
  HILL_TERRAIN,
  MOUNTAIN_TERRAIN,
  NAVIGABLE_RIVER_TERRAIN,
  defineVizMeta,
  snapshotEngineHeightfield,
} from "@swooper/mapgen-core";
import { createStep } from "@swooper/mapgen-core/authoring";
import { clampInt } from "@swooper/mapgen-core/lib/math";
import PlotRiversStepContract from "./plotRivers.contract.js";
import {
  HYDROLOGY_RIVER_DENSITY_LENGTH_BOUNDS,
} from "@mapgen/domain/hydrology/shared/knob-multipliers.js";
import type { HydrologyRiverDensityKnob } from "@mapgen/domain/hydrology/shared/knobs.js";

const GROUP_MAP_HYDROLOGY = "Map / Hydrology (Engine)";
const TILE_SPACE_ID = "tile.hexOddR" as const;

export default createStep(PlotRiversStepContract, {
  normalize: (config, ctx) => {
    const { riverDensity = "normal" as HydrologyRiverDensityKnob } = ctx.knobs as {
      riverDensity?: HydrologyRiverDensityKnob;
    };
    const normalBounds = HYDROLOGY_RIVER_DENSITY_LENGTH_BOUNDS.normal;
    const bounds = HYDROLOGY_RIVER_DENSITY_LENGTH_BOUNDS[riverDensity];
    const minLengthDelta = bounds.minLength - normalBounds.minLength;
    const maxLengthDelta = bounds.maxLength - normalBounds.maxLength;

    const minLength = clampInt(config.minLength + minLengthDelta, 1, 40);
    let maxLength = clampInt(config.maxLength + maxLengthDelta, 1, 80);
    if (maxLength < minLength) maxLength = minLength;

    return {
      ...config,
      minLength,
      maxLength,
    };
  },
  run: (context, config, _ops, deps) => {
    const hydrography = deps.artifacts.hydrography.read(context);
    const { width, height } = context.dimensions;

    // Map-stage visualization: hydrology river fields are inputs to engine river modeling (not 1:1 with engine results).
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "map.hydrology.rivers.riverClass",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: hydrography.riverClass,
      meta: defineVizMeta("map.hydrology.rivers.riverClass", {
        label: "River Class (Hydrology)",
        group: GROUP_MAP_HYDROLOGY,
        palette: "categorical",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "map.hydrology.rivers.discharge",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "f32",
      values: hydrography.discharge,
      meta: defineVizMeta("map.hydrology.rivers.discharge", {
        label: "River Discharge (Hydrology)",
        group: GROUP_MAP_HYDROLOGY,
        visibility: "debug",
      }),
    });

    const logStats = (label: string) => {
      if (!context.trace.isVerbose) return;
      let flat = 0,
        hill = 0,
        mtn = 0,
        water = 0;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          if (context.adapter.isWater(x, y)) {
            water++;
            continue;
          }
          const t = context.adapter.getTerrainType(x, y);
          if (t === MOUNTAIN_TERRAIN) mtn++;
          else if (t === HILL_TERRAIN) hill++;
          else flat++;
        }
      }
      const total = width * height;
      const land = Math.max(1, flat + hill + mtn);
      context.trace.event(() => ({
        type: "rivers.terrainStats",
        label,
        totals: {
          land,
          water,
          landShare: Number(((land / total) * 100).toFixed(1)),
        },
        shares: {
          mountains: Number(((mtn / land) * 100).toFixed(1)),
          hills: Number(((hill / land) * 100).toFixed(1)),
          flat: Number(((flat / land) * 100).toFixed(1)),
        },
      }));
    };

    logStats("PRE-RIVERS");
    context.adapter.modelRivers(config.minLength, config.maxLength, NAVIGABLE_RIVER_TERRAIN);
    logStats("POST-MODELRIVERS");
    context.adapter.validateAndFixTerrain();
    logStats("POST-VALIDATE");
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
          label: "Land Mask (Engine After Rivers)",
          group: GROUP_MAP_HYDROLOGY,
          palette: "categorical",
          role: "engine",
          visibility: "debug",
        }),
      });
    }
    context.adapter.defineNamedRivers();
  },
});
