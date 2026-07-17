import { defineVizMeta, snapshotEngineHeightfield } from "@swooper/mapgen-core";
import { createStep } from "@swooper/mapgen-core/authoring";
import { artifactModules as mapHydrologyArtifactModules } from "../artifacts/index.js";
import LakesStepContract from "./lakes.contract.js";

const GROUP_MAP_HYDROLOGY = "Map / Hydrology (Engine)";
const TILE_SPACE_ID = "tile.hexOddQ" as const;

/**
 * Materializes planned lakes while respecting mountain truth, then publishes
 * accepted-water and terrain snapshots for downstream elevation and parity.
 */
export default createStep(LakesStepContract, {
  artifacts: [
    mapHydrologyArtifactModules.engineProjectionLakes,
    mapHydrologyArtifactModules.hydrologyLakesEngineTerrainSnapshot,
  ],
  run: (context, config, _ops, deps) => {
    const lakePlan = deps.artifacts.lakePlan.read(context);
    const mountains = deps.artifacts.mountains.read(context);
    const { width, height } = context.dimensions;
    const size = Math.max(0, width * height);

    // Map-stage visualization: planned lakes are Hydrology truth. This step only materializes and reads back.
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "map.hydrology.lakes.plannedLakeMask",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: lakePlan.lakeMask,
      meta: defineVizMeta("map.hydrology.lakes.plannedLakeMask", {
        label: "Lake Mask (Planned)",
        group: GROUP_MAP_HYDROLOGY,
        palette: "categorical",
        role: "physics",
      }),
    });

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
    const projection = context.adapter.stampLakes(width, height, projectionLakeMask);
    const physics = context.buffers.heightfield;
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

      if (config.projectionReadback) {
        context.viz?.dumpGrid(context.trace, {
          dataTypeKey: "map.hydrology.lakes.engineLakeMask",
          spaceId: TILE_SPACE_ID,
          dims: { width, height },
          format: "u8",
          values: projection.stampedLakeMask,
          meta: defineVizMeta("map.hydrology.lakes.engineLakeMask", {
            label: "Lake Mask (Engine)",
            group: GROUP_MAP_HYDROLOGY,
            palette: "categorical",
            role: "engine",
          }),
        });
        context.viz?.dumpGrid(context.trace, {
          dataTypeKey: "map.hydrology.lakes.rejectedLakeMask",
          spaceId: TILE_SPACE_ID,
          dims: { width, height },
          format: "u8",
          values: projection.rejectedLakeMask,
          meta: defineVizMeta("map.hydrology.lakes.rejectedLakeMask", {
            label: "Rejected Lake Mask",
            group: GROUP_MAP_HYDROLOGY,
            palette: "categorical",
            visibility: "debug",
          }),
        });
      }

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
        values: engineAfter.landMask,
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
