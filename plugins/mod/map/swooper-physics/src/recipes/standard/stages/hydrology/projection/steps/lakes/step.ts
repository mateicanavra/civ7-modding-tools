import { createStep } from "@swooper/mapgen-core/authoring";
import { encodeBoundedJsonLogLines } from "@swooper/mapgen-core/lib/log";
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
 * Projects complete certified inland-water bodies; legacy selection retains its
 * landform exclusions. Native lake classification remains local observation.
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
      if (lakePlan.model === "certified-sill-spill" &&
          (mountains.mountainMask[i] === 1 || volcanoes.volcanoMask[i] === 1)) {
        throw new Error(`Certified lake cell ${i} overlaps a blocking landform; refusing partial projection.`);
      }
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
    const isolatedFragmentProtectedLakeTileCount = lakePlan.model === "certified-sill-spill" ? 0 : pruneIsolatedMorphologyFragments(
      projectionLakeMask,
      directlyProtectedLakeMask,
      width,
      height
    );
    morphologyProtectedLakeTileCount += isolatedFragmentProtectedLakeTileCount;

    // The adapter is the only engine boundary. Stamping plus readback stays there
    // so later steps observe current Civ7 state instead of consuming stale snapshots.
    const projection = deps.engine.stampLakes(context, width, height, projectionLakeMask);
    if (lakePlan.model === "certified-sill-spill") {
      const areas = new Map<number, { area: number; water: number; planned: number; lake: number }>();
      for (let cell = 0; cell < size; cell++) {
        if (projection.engineWaterMask[cell] !== 1) continue;
        const id = projection.engineAreaId[cell]!;
        const area = areas.get(id) ?? { area: id, water: 0, planned: 0, lake: 0 };
        area.water++;
        if (lakePlan.lakeMask[cell] === 1) area.planned++;
        if (projection.engineLakeMask[cell] === 1) area.lake++;
        areas.set(id, area);
      }
      for (const line of encodeBoundedJsonLogLines({
        prefix: "[SWOOPER_MOD]",
        marker: "CERTIFIED_LAKE_PROJECTION_V1",
        payload: {
          mapSeed: context.setup.mapSeed,
          dimensions: { width, height },
          planned: lakePlan.plannedLakeTileCount,
          stamped: projection.stampedLakeTileCount,
          rejected: projection.rejectedLakeTileCount,
          nonLake: projection.nonLakeTileCount,
          terrainMismatch: projection.terrainMismatchTileCount,
          areas: Array.from(areas.values()).filter((area) => area.planned > 0),
          columns: ["cell", "body", "terrain", "water", "lake", "area", "elevation"],
          cells: Array.from(lakePlan.lakeMask).flatMap((wet, cell) => wet === 1 ? [[
            cell, lakePlan.bodyId[cell], projection.engineTerrain[cell],
            projection.engineWaterMask[cell], projection.engineLakeMask[cell],
            projection.engineAreaId[cell], projection.engineElevation[cell],
          ]] : []),
        },
      })) console.log(line);
      for (let cell = 0; cell < size; cell++) {
        if (projection.stampedLakeMask[cell] !== lakePlan.lakeMask[cell]) {
          throw new Error(`Certified lake footprint rejected at cell ${cell}; no partial body is published.`);
        }
      }
      if (projection.terrainMismatchTileCount !== 0) {
        throw new Error(`Certified inland-water projection has ${projection.terrainMismatchTileCount} coast terrain mismatches.`);
      }
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
