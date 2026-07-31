import { createStep } from "@swooper/mapgen-core/authoring";
import {
  collectMaskComponentsOddQ,
  getHexNeighborIndicesOddQ,
} from "@swooper/mapgen-core/lib/grid";
import type { VizProjection } from "@swooper/mapgen-viz";
import { measureStandardLakeProjection } from "../../../../../metrics/families/hydrology/lake-projection.js";
import { defineStandardVizMeta } from "../../../../../viz.js";
import { landMaskFromWaterMask } from "../../../../../water-surface-parity.js";
import { config } from "./config.js";

const GROUP_MAP_HYDROLOGY = "Map / Hydrology (Engine)";
const TILE_SPACE_ID = "tile.hexOddQ" as const;

function pruneIsolatedMorphologyFragments(
  projectionLakeMask: Uint8Array,
  directlyProtectedLakeMask: Uint8Array,
  width: number,
  height: number
): number {
  let protectedCount = 0;
  for (const component of collectMaskComponentsOddQ({
    mask: projectionLakeMask,
    width,
    height,
  })) {
    if (component.size !== 1) continue;
    const tileIndex = component.indices[0];
    if (tileIndex === undefined) continue;
    const x = tileIndex % width;
    const y = Math.floor(tileIndex / width);
    if (
      !getHexNeighborIndicesOddQ(x, y, width, height).some(
        (neighbor) => directlyProtectedLakeMask[neighbor] === 1
      )
    ) {
      continue;
    }
    projectionLakeMask[tileIndex] = 0;
    protectedCount += 1;
  }
  return protectedCount;
}

/**
 * Withholds final Morphology landforms and their isolated one-tile lake remnants
 * from projection, then keeps mutable engine readback invocation-local.
 */
export const LakesStep = createStep(config, {
  run: (context, _stepConfig, _ops, deps) => {
    const lakePlan = deps.artifacts.lakePlan.read();
    const mountains = deps.artifacts.mountains.read();
    const volcanoes = deps.artifacts.volcanoes.read();
    const { width, height } = context.setup.dimensions;
    const size = width * height;

    const projectionLakeMask = new Uint8Array(size);
    const directlyProtectedLakeMask = new Uint8Array(size);
    let morphologyProtectedLakeTileCount = 0;
    let mountainProtectedLakeTileCount = 0;
    let volcanoProtectedLakeTileCount = 0;
    for (let i = 0; i < size; i++) {
      if (lakePlan.lakeMask[i] !== 1) continue;
      if (mountains.mountainMask[i] === 1) {
        morphologyProtectedLakeTileCount += 1;
        mountainProtectedLakeTileCount += 1;
        directlyProtectedLakeMask[i] = 1;
        continue;
      }
      if (volcanoes.volcanoMask[i] === 1) {
        morphologyProtectedLakeTileCount += 1;
        volcanoProtectedLakeTileCount += 1;
        directlyProtectedLakeMask[i] = 1;
        continue;
      }
      projectionLakeMask[i] = 1;
    }
    const isolatedFragmentProtectedLakeTileCount = pruneIsolatedMorphologyFragments(
      projectionLakeMask,
      directlyProtectedLakeMask,
      width,
      height
    );
    morphologyProtectedLakeTileCount += isolatedFragmentProtectedLakeTileCount;

    // The adapter is the only engine boundary. Stamping plus readback stays there
    // so later steps observe current Civ7 state instead of consuming stale snapshots.
    const projection = deps.engine.stampLakes(context, width, height, projectionLakeMask);
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
      morphologyProtectedLakeTileCount,
      mountainProtectedLakeTileCount,
      volcanoProtectedLakeTileCount,
      isolatedFragmentProtectedLakeTileCount,
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
      isolatedFragmentProtectedLakeTileCount,
    };
  },
  metrics: ({ observation, dimensions }) => ({
    "map.hydrology.lakeProjection": measureStandardLakeProjection({
      dimensions,
      projectedLakeMask: observation.projection.stampedLakeMask,
      plannedLakeTileCount: observation.projection.plannedLakeTileCount,
      morphologyProtectedLakeTileCount: observation.morphologyProtectedLakeTileCount,
      isolatedFragmentProtectedLakeTileCount:
        observation.isolatedFragmentProtectedLakeTileCount,
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
        field: { format: "u8", values: observation.projection.stampedLakeMask },
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
