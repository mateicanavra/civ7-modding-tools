import { deriveCiv7CoastProjection } from "@civ7/map-policy";
import type { TraceJsonObject } from "@swooper/mapgen-core";
import { createStep } from "@swooper/mapgen-core/authoring";
import { captureEngineTerrainClassification } from "../../../../current-engine-surface.js";
import { measureStandardPlacementSurface } from "../../../../metrics/families/placement-surface.js";
import { restoreProjectedCoastTerrain } from "../../../../water-surface-parity.js";
import { logTerrainStats, runPlacementProductStep } from "../../log.js";
import { config } from "./config.js";
import { readFinalLakeProjection } from "./lake-readback.js";
import { applyLandmassRegionSlots } from "./landmass-regions.js";
import { readTerrainValidationBoundary } from "./terrain-validation-readback.js";
import { projectPlacementSurfaceViz } from "./viz.js";

/**
 * Executes the transactional terrain validation, coast restoration, water
 * storage, and region restamping required before placement products read Civ7.
 */
export const PreparePlacementSurfaceStep = createStep(config, {
  run: (context, _stepConfig, _ops, deps) => {
    const projectedLakes = deps.artifacts.projectedLakes.read(context);
    const landmassRegionSlotByTile = deps.artifacts.landmassRegionSlotByTile.read(context);
    const shelf = deps.artifacts.shelf.read(context);
    const topography = deps.artifacts.topography.read(context);
    const { width, height } = context.setup.dimensions;
    const dimensions = context.setup.dimensions;
    const coastProjection = deriveCiv7CoastProjection({
      width,
      height,
      landMask: topography.landMask,
      shelfMask: shelf.shelfMask,
      coastalWater: shelf.coastalWater,
    });
    const slotByTile = landmassRegionSlotByTile.slotByTile as Uint8Array;
    const emit = (payload: TraceJsonObject): void => {
      context.trace.event(() => payload);
    };

    const readCurrentTerrainClassification = () =>
      captureEngineTerrainClassification(dimensions, {
        getTerrainType: (x, y) => deps.engine.getTerrainType(context, x, y),
        isWater: (x, y) => deps.engine.isWater(context, x, y),
        isLake: (x, y) => deps.engine.isLake(context, x, y),
      });
    const readAreaId = (x: number, y: number) => deps.engine.getAreaId(context, x, y);
    const initialSurface = readCurrentTerrainClassification();
    const acceptedLakeMask = projectedLakes.lakeMask;
    logTerrainStats(context, "Initial", initialSurface);

    const beforeValidate = readTerrainValidationBoundary(
      initialSurface,
      readAreaId,
      "placement/prepare-surface/before-validate"
    );
    const afterValidate = runPlacementProductStep("placement.terrain.validate", emit, () => {
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
      const afterValidateSurface = readCurrentTerrainClassification();
      emit({ type: "placement.terrain.validated" });
      logTerrainStats(context, "After validateAndFixTerrain", afterValidateSurface);
      return readTerrainValidationBoundary(
        afterValidateSurface,
        readAreaId,
        "placement/prepare-surface/after-validate"
      );
    });
    runPlacementProductStep("placement.areas.recalculate", emit, () => {
      deps.engine.recalculateAreas(context);
      emit({ type: "placement.areas.recalculated" });
    });
    runPlacementProductStep("placement.water.store", emit, () => {
      deps.engine.storeWaterData(context);
      emit({ type: "placement.water.stored" });
    });
    runPlacementProductStep("placement.landmassRegion.restamp", emit, () => {
      applyLandmassRegionSlots(
        {
          getLandmassId: (name) => deps.engine.getLandmassId(context, name),
          setLandmassRegionId: (x, y, regionId) =>
            deps.engine.setLandmassRegionId(context, x, y, regionId),
        },
        width,
        height,
        slotByTile
      );
      emit({ type: "placement.landmassRegion.restamped" });
    });
    const afterMaintenanceSurface = readCurrentTerrainClassification();
    const afterMaintenance = readTerrainValidationBoundary(
      afterMaintenanceSurface,
      readAreaId,
      "placement/prepare-surface/after-maintenance"
    );
    const finalLakeReadback = readFinalLakeProjection(afterMaintenanceSurface, acceptedLakeMask);
    emit({ type: "placement.lakes.finalReadback", ...finalLakeReadback });
    console.log(
      `[SWOOPER_MOD] PLACEMENT_SURFACE_PREPARATION_V1 ${JSON.stringify(finalLakeReadback)}`
    );

    const slotCounts = { none: 0, west: 0, east: 0 };
    for (let i = 0; i < slotByTile.length; i++) {
      const slot = slotByTile[i] ?? 0;
      if (slot === 1) slotCounts.west += 1;
      else if (slot === 2) slotCounts.east += 1;
      else slotCounts.none += 1;
    }

    return {
      acceptedLakeMask,
      beforeValidate,
      afterValidate,
      afterMaintenance,
      slotCounts,
      finalLakeReadback,
    };
  },
  metrics: ({ result }) => ({
    "placement.surfacePreparation": measureStandardPlacementSurface({
      slotCounts: result.slotCounts,
      ...result.finalLakeReadback,
    }),
  }),
  viz: ({ result, dimensions }) => projectPlacementSurfaceViz({ ...result, dimensions }),
});
