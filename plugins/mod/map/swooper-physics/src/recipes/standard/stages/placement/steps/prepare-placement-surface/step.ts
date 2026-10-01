import { deriveCiv7CoastProjection } from "@civ7/map-policy";
import { createStep } from "@swooper/mapgen-core/authoring";
import { projectStandardElevation } from "../../../../elevation-projection.js";
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
 * Validates terrain and restores coast and wet elevation requests while
 * retaining current dry heights, then rebuilds areas and water storage before
 * downstream placement reads Civ7. Snapshots diagnose this transaction only;
 * they do not claim final product parity.
 */
export const PreparePlacementSurfaceStep = createStep(config, {
  run: (context, _stepConfig, _ops, deps) => {
    const shelf = deps.artifacts.shelf.read();
    const topography = deps.artifacts.topography.read();
    const projectedLakes = deps.artifacts.projectedLakes.read();
    const elevationRequest = projectStandardElevation({
      elevation: topography.elevation,
      landMask: topography.landMask,
      seaLevel: topography.seaLevel,
      acceptedLakeMask: projectedLakes.lakeMask,
    });
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
    const currentElevation = deps.engine.readCurrentMapElevationSnapshot(context);
    if (currentElevation.status !== "available") {
      throw new Error("[PreparePlacementSurface] Current elevation snapshot is unavailable.");
    }
    if (
      currentElevation.width !== width ||
      currentElevation.height !== height ||
      currentElevation.values.length !== width * height
    ) {
      throw new Error(
        "[PreparePlacementSurface] Current elevation snapshot must match map dimensions and cardinality."
      );
    }
    // Wet readbacks can already be lowered; only dry native edits are replayed.
    for (let index = 0; index < elevationRequest.length; index += 1) {
      const isWater = deps.engine.isWater(context, index % width, Math.floor(index / width));
      const current = currentElevation.values[index]!;
      if (typeof isWater !== "boolean") {
        throw new Error(
          `[PreparePlacementSurface] Current water read is not boolean at plot ${index}.`
        );
      }
      if (!Number.isFinite(current)) {
        throw new Error(
          `[PreparePlacementSurface] Current elevation is not finite at plot ${index}.`
        );
      }
      if (!isWater) elevationRequest[index] = current;
    }
    deps.engine.setElevation(context, elevationRequest);
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
  viz: ({ observation, dimensions }) => projectPlacementSurfaceViz({ ...observation, dimensions }),
});
