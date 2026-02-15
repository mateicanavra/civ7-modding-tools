import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";
import { defineVizMeta, snapshotEngineHeightfield } from "@swooper/mapgen-core";
import LakesStepContract from "./lakes.contract.js";
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
  run: (context, _config, _ops, deps) => {
    const hydrography = deps.artifacts.hydrography.read(context);
    const lakePlan = deps.artifacts.lakePlan.read(context);
    const { width, height } = context.dimensions;
    const size = Math.max(0, width * height);
    if (lakePlan.lakeMask.length !== size) {
      throw new Error(
        `[SWOOPER_MOD] map-hydrology/lakes: lakePlan.lakeMask size mismatch (expected ${size}, got ${lakePlan.lakeMask.length}).`
      );
    }
    const coastTerrain = context.adapter.getTerrainTypeIndex("TERRAIN_COAST");
    if (coastTerrain < 0) {
      throw new Error("[SWOOPER_MOD] map-hydrology/lakes: TERRAIN_COAST not available in adapter.");
    }

    // Map-stage visualization: hydrology sink/outlet + deterministic lake plan are
    // the canonical physics inputs for map-stage terrain projection.
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
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "map.hydrology.lakes.lakePlanMask",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: lakePlan.lakeMask,
      meta: defineVizMeta("map.hydrology.lakes.lakePlanMask", {
        label: "Lake Plan Mask (Hydrology)",
        group: GROUP_MAP_HYDROLOGY,
        palette: "categorical",
        role: "physics",
      }),
    });

    for (let i = 0; i < size; i++) {
      if ((lakePlan.lakeMask[i] ?? 0) !== 1) continue;
      const x = i % width;
      const y = (i / width) | 0;
      context.adapter.setTerrainType(x, y, coastTerrain);
    }

    // Keep area topology in sync with deterministic post-lake terrain edits
    // before downstream validation/resources/start assignment.
    context.adapter.recalculateAreas();

    // Refresh cached water topology explicitly so downstream engine checks
    // consume the deterministic lake projection written above.
    context.adapter.storeWaterData();
    const physics = context.buffers.heightfield;
    const engine = snapshotEngineHeightfield(context);
    if (engine) {
      const lakeMask = new Uint8Array(size);
      const sinkMismatchMask = new Uint8Array(size);
      let sinkMismatchCount = 0;
      for (let i = 0; i < lakeMask.length; i++) {
        const isWater = (engine.landMask[i] ?? 1) === 0;
        lakeMask[i] = isWater ? 1 : 0;
        if ((lakePlan.lakeMask[i] ?? 0) === 1 && !isWater) {
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
        plannedLakeTileCount: lakePlan.plannedLakeTileCount,
        sinkLakeCount: lakePlan.sinkLakeCount,
        sinkMismatchCount,
        sinkMismatchShare: Number((sinkMismatchCount / Math.max(1, width * height)).toFixed(4)),
      }));

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
          label: "Lake Plan Mismatch Mask",
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
