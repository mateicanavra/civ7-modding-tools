import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";
import { defineVizMeta, snapshotEngineHeightfield } from "@swooper/mapgen-core";
import { getStandardRuntime } from "../../../runtime.js";
import LakesStepContract from "./lakes.contract.js";
import { HYDROLOGY_LAKEINESS_TILES_PER_LAKE_MULTIPLIER } from "@mapgen/domain/hydrology/shared/knob-multipliers.js";
import type { HydrologyLakeinessKnob } from "@mapgen/domain/hydrology/shared/knobs.js";
import { hydrologyHydrographyArtifacts } from "../../hydrology-hydrography/artifacts.js";
import { mapArtifacts } from "../../../map-artifacts.js";

const GROUP_MAP_HYDROLOGY = "Map / Hydrology (Engine)";
const TILE_SPACE_ID = "tile.hexOddR" as const;

export default createStep(LakesStepContract, {
  artifacts: implementArtifacts(
    [
      hydrologyHydrographyArtifacts.engineProjectionLakes,
      mapArtifacts.hydrologyLakesEngineTerrainSnapshot,
    ],
    {
      engineProjectionLakes: {},
      hydrologyLakesEngineTerrainSnapshot: {},
    }
  ),
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
      const lakeMask = new Uint8Array(width * height);
      const sinkMismatchMask = new Uint8Array(width * height);
      let sinkMismatchCount = 0;
      for (let i = 0; i < lakeMask.length; i++) {
        const isWater = (engine.landMask[i] ?? 1) === 0;
        lakeMask[i] = isWater ? 1 : 0;
        if ((hydrography.sinkMask[i] ?? 0) === 1 && !isWater) {
          sinkMismatchMask[i] = 1;
          sinkMismatchCount += 1;
        }
      }

      deps.artifacts.engineProjectionLakes.publish(context, {
        width,
        height,
        lakeMask,
        riverMask: new Uint8Array(width * height),
        sinkMismatchCount,
        riverMismatchCount: 0,
      });

      deps.artifacts.hydrologyLakesEngineTerrainSnapshot.publish(context, {
        stage: "map-hydrology/lakes",
        width,
        height,
        landMask: engine.landMask,
        terrain: engine.terrain,
        elevation: engine.elevation,
      });

      context.trace.event(() => ({
        type: "map.hydrology.lakes.parity",
        sinkMismatchCount,
        sinkMismatchShare: Number((sinkMismatchCount / Math.max(1, width * height)).toFixed(4)),
      }));

      if (sinkMismatchCount > 0) {
        throw new Error(
          `[SWOOPER_MOD] map-hydrology/lakes parity drift: ${sinkMismatchCount} planned lake tiles are not water in engine projection.`
        );
      }

      context.viz?.dumpGrid(context.trace, {
        dataTypeKey: "map.hydrology.lakes.engineLakeMask",
        spaceId: TILE_SPACE_ID,
        dims: { width, height },
        format: "u8",
        values: lakeMask,
        meta: defineVizMeta("map.hydrology.lakes.engineLakeMask", {
          label: "Lake Mask (Engine)",
          group: GROUP_MAP_HYDROLOGY,
          palette: "categorical",
          role: "engine",
        }),
      });
      context.viz?.dumpGrid(context.trace, {
        dataTypeKey: "map.hydrology.lakes.sinkMismatchMask",
        spaceId: TILE_SPACE_ID,
        dims: { width, height },
        format: "u8",
        values: sinkMismatchMask,
        meta: defineVizMeta("map.hydrology.lakes.sinkMismatchMask", {
          label: "Sink Mismatch Mask",
          group: GROUP_MAP_HYDROLOGY,
          palette: "categorical",
          visibility: "debug",
        }),
      });

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
