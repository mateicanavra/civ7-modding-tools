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
  run: (context, config, _ops, deps) => {
    const lakePlan = deps.artifacts.lakePlan.read(context);
    const { width, height } = context.dimensions;

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

    // The adapter is the only engine boundary. Stamping plus readback stays there
    // so this stage records projection evidence without owning Civ7 terrain APIs.
    const projection = context.adapter.stampLakes(width, height, lakePlan.lakeMask);
    const physics = context.buffers.heightfield;
    const engineAfter = snapshotEngineHeightfield(context);
    if (engineAfter) {
      deps.artifacts.engineProjectionLakes.publish(context, {
        width,
        height,
        lakeMask: projection.stampedLakeMask,
        riverMask: new Uint8Array(width * height),
        sinkMismatchCount: projection.rejectedLakeTileCount,
        riverMismatchCount: 0,
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
        plannedLakeTileCount: projection.plannedLakeTileCount,
        stampedLakeTileCount: projection.stampedLakeTileCount,
        rejectedLakeTileCount: projection.rejectedLakeTileCount,
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
