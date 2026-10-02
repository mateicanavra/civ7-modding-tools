import { createStep } from "@swooper/mapgen-core/authoring";
import type { VizProjection } from "@swooper/mapgen-viz";
import { measureStandardLakeProjection } from "../../../../../metrics/families/hydrology/lake-projection.js";
import { defineStandardVizMeta } from "../../../../../viz.js";
import { landMaskFromWaterMask } from "../../../../../water-surface-parity.js";
import { config } from "./config.js";

const GROUP_MAP_HYDROLOGY = "Map / Hydrology (Engine)";
const TILE_SPACE_ID = "tile.hexOddQ" as const;

/**
 * Projects complete physical inland-water bodies. Native lake classification remains an observation.
 */
export const LakesStep = createStep(config, {
  run: (context, _stepConfig, _ops, deps) => {
    const lakePlan = deps.artifacts.lakePlan.read();
    const mountains = deps.artifacts.mountains.read();
    const volcanoes = deps.artifacts.volcanoes.read();
    const { width, height } = context.setup.dimensions;
    const size = width * height;
    const projectionLakeMask = Uint8Array.from(lakePlan.lakeMask);
    for (let cell = 0; cell < size; cell++) {
      if (lakePlan.lakeMask[cell] === 1 &&
          (mountains.mountainMask[cell] === 1 || volcanoes.volcanoMask[cell] === 1)) {
        throw new Error(`Physical lake cell ${cell} overlaps a blocking landform; refusing partial projection.`);
      }
    }


    // The adapter is the only engine boundary. Stamping plus readback stays there
    // so later steps observe current Civ7 state instead of consuming stale snapshots.
    const projection = deps.engine.stampLakes(context, width, height, projectionLakeMask);
    for (let cell = 0; cell < size; cell++) {
      if (projection.stampedLakeMask[cell] !== lakePlan.lakeMask[cell]) {
        throw new Error(`Certified lake footprint rejected at cell ${cell}; no partial body is published.`);
      }
    }
    if (projection.terrainMismatchTileCount !== 0) {
      throw new Error(`Certified inland-water projection has ${projection.terrainMismatchTileCount} coast terrain mismatches.`);
    }
    deps.artifacts.projectedLakes.publish({
      lakeMask: Uint8Array.from(projection.stampedLakeMask),
    });
    const engineLandMask = landMaskFromWaterMask(projection.engineWaterMask);

    context.trace.event(() => ({
      type: "map.hydrology.lakes.parity",
      plannedLakeTileCount: lakePlan.plannedLakeTileCount,
      projectedCandidateLakeTileCount: projection.plannedLakeTileCount,
      stampedLakeTileCount: projection.stampedLakeTileCount,
      rejectedLakeTileCount: projection.rejectedLakeTileCount,
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
    };
  },
  metrics: ({ observation, dimensions }) => ({
    "map.hydrology.lakeProjection": measureStandardLakeProjection({
      dimensions,
      projectedLakeMask: observation.projection.stampedLakeMask,
      plannedLakeTileCount: observation.projection.plannedLakeTileCount,
      stampedLakeTileCount: observation.projection.stampedLakeTileCount,
      rejectedLakeTileCount: observation.projection.rejectedLakeTileCount,
      nonLakeTileCount: observation.projection.nonLakeTileCount,
      terrainMismatchTileCount: observation.projection.terrainMismatchTileCount,
    }),
  }),
  viz: ({ observation, dimensions }) => {
    const projections: VizProjection[] = [
      {
        kind: "grid",
        dataTypeKey: "map.hydrology.lakes.plannedLakeMask",
        spaceId: TILE_SPACE_ID,
        dims: dimensions,
        field: { format: "u8", values: observation.plannedLakeMask },
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
        field: { format: "u8", values: observation.projection.engineLakeMask },
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
        field: { format: "u8", values: observation.projection.rejectedLakeMask },
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
      field: { format: "u8", values: observation.engineLandMask },
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
