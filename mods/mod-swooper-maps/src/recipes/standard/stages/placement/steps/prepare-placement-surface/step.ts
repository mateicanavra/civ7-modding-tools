import { deriveCiv7CoastProjection } from "@civ7/map-policy";
import { createStep } from "@swooper/mapgen-core/authoring";
import { restoreProjectedCoastTerrain } from "../../../../water-surface-parity.js";
import { config } from "./config.js";
import { projectPlacementSurfaceViz } from "./viz.js";

type TerrainValidationBoundaryReadback = Readonly<{
  stage: string;
  terrain: Int32Array;
  waterMask: Uint8Array;
  lakeMask: Uint8Array;
  areaId: Int32Array;
}>;

/**
 * Executes the transactional terrain validation, coast restoration, water
 * storage, and area rebuild required before downstream placement products read
 * Civ7. Its snapshots diagnose this transaction only; they do not claim final
 * product parity.
 */
export const PreparePlacementSurfaceStep = createStep(config, {
  run: (context, _stepConfig, _ops, deps) => {
    const shelf = deps.artifacts.shelf.read();
    const topography = deps.artifacts.topography.read();
    const { width, height } = context.setup.dimensions;
    const dimensions = context.setup.dimensions;
    const coastProjection = deriveCiv7CoastProjection({
      width,
      height,
      landMask: topography.landMask,
      shelfMask: shelf.shelfMask,
      coastalWater: shelf.coastalWater,
    });
    const readTerrainValidationBoundary = (stage: string): TerrainValidationBoundaryReadback => ({
      stage,
      terrain: deps.engine.readCurrentMapTerrainTypes(context),
      waterMask: deps.engine.readCurrentMapWaterMask(context),
      lakeMask: deps.engine.readCurrentMapLakeMask(context),
      areaId: deps.engine.readCurrentMapAreaIds(context),
    });
    const beforeValidate = readTerrainValidationBoundary(
      "placement/prepare-surface/before-validate"
    );
    deps.engine.validateAndFixTerrain(context);
    restoreProjectedCoastTerrain(
      dimensions,
      context.trace,
      {
        getTerrainType: (x, y) => deps.engine.getTerrainType(context, x, y),
        setTerrainType: (x, y, terrainType) =>
          deps.engine.setTerrainType(context, x, y, terrainType),
        storeWaterData: () => deps.engine.storeWaterData(context),
      },
      coastProjection,
      "placement/prepare-surface/after-validate"
    );
    const afterValidate = readTerrainValidationBoundary("placement/prepare-surface/after-validate");
    deps.engine.recalculateAreas(context);
    deps.engine.storeWaterData(context);
    const afterMaintenance = readTerrainValidationBoundary(
      "placement/prepare-surface/after-maintenance"
    );

    return {
      beforeValidate,
      afterValidate,
      afterMaintenance,
    };
  },
  viz: ({ result, dimensions }) => projectPlacementSurfaceViz({ ...result, dimensions }),
});
