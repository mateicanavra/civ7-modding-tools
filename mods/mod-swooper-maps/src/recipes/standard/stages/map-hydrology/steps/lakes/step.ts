import { snapshotEngineHeightfield } from "@swooper/mapgen-core";
import { createStep } from "@swooper/mapgen-core/authoring";
import type { VizProjection } from "@swooper/mapgen-viz";
import { defineStandardVizMeta } from "../../../../viz.js";
import { LakesStepContract } from "./config.js";

const GROUP_MAP_HYDROLOGY = "Map / Hydrology (Engine)";
const TILE_SPACE_ID = "tile.hexOddQ" as const;

/**
 * Materializes planned lakes while respecting mountain truth, then publishes
 * accepted-water and terrain snapshots for downstream elevation and parity.
 */
export const LakesStep = createStep(LakesStepContract, {
  run: (context, _config, _ops, deps) => {
    const lakePlan = deps.artifacts.lakePlan.read(context);
    const mountains = deps.artifacts.mountains.read(context);
    const topography = deps.artifacts.topography.read(context);
    const { width, height } = context.dimensions;
    const size = Math.max(0, width * height);

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
    // so this stage records projection evidence without owning Civ7 terrain APIs.
    const topographyLandMask = topography.landMask;
    const projection = context.adapter.stampLakes(width, height, projectionLakeMask);
    const engineAfter = snapshotEngineHeightfield(context);
    if (engineAfter) {
      deps.artifacts.engineProjectionLakes.publish(context, {
        width,
        height,
        lakeMask: projection.stampedLakeMask,
        plannedLakeMask: lakePlan.lakeMask,
        engineWaterMask: projection.engineWaterMask,
        engineLakeMask: projection.engineLakeMask,
        engineTerrain: projection.engineTerrain,
        engineAreaId: projection.engineAreaId,
        engineElevation: projection.engineElevation,
        nonWaterMask: projection.nonWaterMask,
        nonLakeMask: projection.nonLakeMask,
        terrainMismatchMask: projection.terrainMismatchMask,
        sinkMismatchCount: projection.rejectedLakeTileCount,
        nonLakeTileCount: projection.nonLakeTileCount,
        terrainMismatchTileCount: projection.terrainMismatchTileCount,
        morphologyProtectedLakeTileCount,
      });

      deps.artifacts.hydrologyLakesEngineTerrainSnapshot.publish(context, {
        stage: "map-hydrology/lakes",
        width,
        height,
        landMask: engineAfter.landMask,
        terrain: engineAfter.terrain,
        elevation: engineAfter.elevation,
      });

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
          (projection.rejectedLakeTileCount / Math.max(1, projection.plannedLakeTileCount)).toFixed(
            4
          )
        ),
      }));
    }
    return {
      plannedLakeMask: lakePlan.lakeMask,
      topographyLandMask,
      projection,
      engineLandMask: engineAfter?.landMask,
    };
  },
  viz: ({ result, config, dimensions }) => {
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
    if (!result.engineLandMask) return projections;

    if (config.projectionReadback) {
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
    }
    projections.push(
      {
        kind: "grid",
        dataTypeKey: "morphology.topography.landMask",
        spaceId: TILE_SPACE_ID,
        dims: dimensions,
        field: { format: "u8", values: result.topographyLandMask },
        meta: defineStandardVizMeta("morphology.topography.landMask", "category.distinct", {
          label: "Land Mask (Final Morphology)",
          group: GROUP_MAP_HYDROLOGY,
          role: "physics",
          visibility: "debug",
        }),
      },
      {
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
      }
    );
    return projections;
  },
});
