import { createStep } from "@swooper/mapgen-core/authoring";
import type { VizProjection } from "@swooper/mapgen-viz";
import { measureStandardLakeProjection } from "../../../../../metrics/families/hydrology/lake-projection.js";
import { defineStandardVizMeta } from "../../../../../viz.js";
import { landMaskFromWaterMask } from "../../../../../water-surface-parity.js";
import { config } from "./config.js";

const GROUP_MAP_HYDROLOGY = "Map / Hydrology (Engine)";
const TILE_SPACE_ID = "tile.hexOddQ" as const;

/** Filters protected mountains at projection, then keeps mutable engine readback invocation-local. */
export const LakesStep = createStep(config, {
  run: (context, _stepConfig, _ops, deps) => {
    const lakePlan = deps.artifacts.lakePlan.read(context);
    const mountains = deps.artifacts.mountains.read(context);
    const { width, height } = context.setup.dimensions;
    const size = width * height;

    const projectionLakeMask = new Uint8Array(size);
    let morphologyProtectedLakeTileCount = 0;
    for (let i = 0; i < size; i++) {
      if (lakePlan.lakeMask[i] !== 1) continue;
      if (mountains.mountainMask[i] === 1) {
        morphologyProtectedLakeTileCount += 1;
        continue;
      }
      projectionLakeMask[i] = 1;
    }

    // The adapter is the only engine boundary. Stamping plus readback stays there
    // so later steps observe current Civ7 state instead of consuming stale snapshots.
    const projection = deps.engine.stampLakes(context, width, height, projectionLakeMask);
    deps.artifacts.projectedLakes.publish(context, {
      lakeMask: Uint8Array.from(projection.stampedLakeMask),
    });
    const engineLandMask = landMaskFromWaterMask(projection.engineWaterMask);

    context.trace.event(() => ({
      type: "map.hydrology.lakes.parity",
      plannedLakeTileCount: lakePlan.plannedLakeTileCount,
      projectedCandidateLakeTileCount: projection.plannedLakeTileCount,
      stampedLakeTileCount: projection.stampedLakeTileCount,
      rejectedLakeTileCount: projection.rejectedLakeTileCount,
      morphologyProtectedLakeTileCount,
      nonLakeTileCount: projection.nonLakeTileCount,
      terrainMismatchTileCount: projection.terrainMismatchTileCount,
      rejectedLakeShare: Number(
        (projection.rejectedLakeTileCount / Math.max(1, projection.plannedLakeTileCount)).toFixed(4)
      ),
    }));
    return {
      plannedLakeMask: lakePlan.lakeMask,
      projection,
      engineLandMask,
      morphologyProtectedLakeTileCount,
    };
  },
  metrics: ({ result, dimensions }) => ({
    "map.hydrology.lakeProjection": measureStandardLakeProjection({
      dimensions,
      projectedLakeMask: result.projection.stampedLakeMask,
      plannedLakeTileCount: result.projection.plannedLakeTileCount,
      morphologyProtectedLakeTileCount: result.morphologyProtectedLakeTileCount,
      stampedLakeTileCount: result.projection.stampedLakeTileCount,
      rejectedLakeTileCount: result.projection.rejectedLakeTileCount,
      nonLakeTileCount: result.projection.nonLakeTileCount,
      terrainMismatchTileCount: result.projection.terrainMismatchTileCount,
    }),
  }),
  viz: ({ result, dimensions }) => {
    const projections: VizProjection[] = [
      {
        kind: "grid",
        dataTypeKey: "map.hydrology.lakes.plannedLakeMask",
        spaceId: TILE_SPACE_ID,
        dims: dimensions,
        field: { format: "u8", values: result.plannedLakeMask },
        meta: defineStandardVizMeta("map.hydrology.lakes.plannedLakeMask", "category.distinct", {
          label: "Lake Mask (Planned)",
          group: GROUP_MAP_HYDROLOGY,
          role: "physics",
        }),
      },
    ];
    projections.push(
      {
        kind: "grid",
        dataTypeKey: "map.hydrology.lakes.engineLakeMask",
        spaceId: TILE_SPACE_ID,
        dims: dimensions,
        field: { format: "u8", values: result.projection.stampedLakeMask },
        meta: defineStandardVizMeta("map.hydrology.lakes.engineLakeMask", "category.distinct", {
          label: "Lake Mask (Engine)",
          group: GROUP_MAP_HYDROLOGY,
          role: "engine",
        }),
      },
      {
        kind: "grid",
        dataTypeKey: "map.hydrology.lakes.rejectedLakeMask",
        spaceId: TILE_SPACE_ID,
        dims: dimensions,
        field: { format: "u8", values: result.projection.rejectedLakeMask },
        meta: defineStandardVizMeta("map.hydrology.lakes.rejectedLakeMask", "category.distinct", {
          label: "Rejected Lake Mask",
          group: GROUP_MAP_HYDROLOGY,
          visibility: "debug",
        }),
      }
    );
    projections.push({
      kind: "grid",
      dataTypeKey: "map.hydrology.lakes.engineLandMask",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "u8", values: result.engineLandMask },
      meta: defineStandardVizMeta("map.hydrology.lakes.engineLandMask", "category.distinct", {
        label: "Land Mask (Engine After Lakes)",
        group: GROUP_MAP_HYDROLOGY,
        role: "engine",
        visibility: "debug",
      }),
    });
    return projections;
  },
});
