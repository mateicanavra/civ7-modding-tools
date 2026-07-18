import { createStep } from "@swooper/mapgen-core/authoring";
import { restoreProjectedCoastTerrain } from "../../../../projection-policies/coastProjectionParity.js";
import { logTerrainStats, runPlacementProductStep } from "../../log.js";
import { PreparePlacementSurfaceStepContract } from "./config.js";
import { readFinalLakeProjection } from "./lake-readback.js";
import { applyLandmassRegionSlots } from "./landmass-regions.js";
import { readTerrainValidationBoundarySnapshot } from "./terrain-validation-readback.js";
import { projectPlacementSurfaceDriftViz } from "./viz.js";

/**
 * Executes the transactional terrain validation, coast restoration, water
 * storage, and region restamping required before placement products read Civ7.
 */
export const PreparePlacementSurfaceStep = createStep(PreparePlacementSurfaceStepContract, {
  run: (context, _config, _ops, deps) => {
    const engineProjectionLakes = deps.artifacts.engineProjectionLakes.read(context);
    const landmassRegionSlotByTile = deps.artifacts.landmassRegionSlotByTile.read(context);
    const coastClassification = deps.artifacts.coastClassification.read(context);
    const { adapter, trace } = context;
    const { width, height } = context.dimensions;
    const slotByTile = landmassRegionSlotByTile.slotByTile as Uint8Array;
    const emit = (payload: Record<string, unknown>): void => {
      if (!trace?.isVerbose) return;
      trace.event(() => payload);
    };

    logTerrainStats(trace, adapter, width, height, "Initial");

    const beforeValidate = readTerrainValidationBoundarySnapshot(
      adapter,
      width,
      height,
      "placement/prepare-surface/before-validate"
    );
    let afterValidate = beforeValidate;
    runPlacementProductStep("placement.terrain.validate", emit, () => {
      adapter.validateAndFixTerrain();
      restoreProjectedCoastTerrain(
        context,
        coastClassification,
        "placement/prepare-surface/after-validate"
      );
      afterValidate = readTerrainValidationBoundarySnapshot(
        adapter,
        width,
        height,
        "placement/prepare-surface/after-validate"
      );
      emit({ type: "placement.terrain.validated" });
      logTerrainStats(trace, adapter, width, height, "After validateAndFixTerrain");
    });
    runPlacementProductStep("placement.areas.recalculate", emit, () => {
      adapter.recalculateAreas();
      emit({ type: "placement.areas.recalculated" });
    });
    runPlacementProductStep("placement.water.store", emit, () => {
      adapter.storeWaterData();
      emit({ type: "placement.water.stored" });
    });
    runPlacementProductStep("placement.landmassRegion.restamp", emit, () => {
      applyLandmassRegionSlots(adapter, width, height, slotByTile);
      emit({ type: "placement.landmassRegion.restamped" });
    });
    const afterMaintenance = readTerrainValidationBoundarySnapshot(
      adapter,
      width,
      height,
      "placement/prepare-surface/after-maintenance"
    );
    const finalLakeReadback = readFinalLakeProjection(
      adapter,
      width,
      height,
      engineProjectionLakes.lakeMask
    );
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

    deps.artifacts.placementSurfaceValidationBoundary.publish(context, {
      width,
      height,
      beforeValidate,
      afterValidate,
      afterMaintenance,
    });

    deps.artifacts.placementSurfacePreparation.publish(context, {
      width,
      height,
      slotCounts,
      ...finalLakeReadback,
    });

    return {
      acceptedLakeMask: engineProjectionLakes.lakeMask as Uint8Array,
      beforeValidate,
      afterMaintenance,
    };
  },
  viz: ({ result, dimensions }) => projectPlacementSurfaceDriftViz({ ...result, dimensions }),
});
