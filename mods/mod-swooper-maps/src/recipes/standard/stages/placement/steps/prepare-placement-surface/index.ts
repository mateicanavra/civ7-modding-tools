import { defineVizMeta, type ExtendedMapContext } from "@swooper/mapgen-core";
import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";
import { mapArtifacts } from "../../../../map-artifacts.js";
import { restoreProjectedCoastTerrain } from "../../../../projection-policies/coastProjectionParity.js";
import { placementArtifacts } from "../../artifacts.js";
import {
  PLACEMENT_TILE_SPACE_ID,
  PLACEMENT_VIZ_GROUP,
  transparentNoneCategory,
} from "../../viz.js";
import { runPlacementProductStep } from "../product-runtime.js";
import { logTerrainStats } from "../terrain-diagnostics.js";
import PreparePlacementSurfaceStepContract from "./contract.js";
import { readFinalLakeProjection } from "./lake-readback.js";
import { applyLandmassRegionSlots } from "./landmass-regions.js";
import {
  readTerrainValidationBoundarySnapshot,
  type TerrainValidationBoundarySnapshot,
} from "./terrain-validation-readback.js";
import {
  validatePlacementSurfacePreparationArtifact,
  validatePlacementSurfaceValidationBoundaryArtifact,
} from "./validate.js";

export default createStep(PreparePlacementSurfaceStepContract, {
  artifacts: implementArtifacts(
    [
      placementArtifacts.placementSurfacePreparation,
      mapArtifacts.placementSurfaceValidationBoundary,
    ],
    {
      placementSurfacePreparation: {
        validate: (value) => validatePlacementSurfacePreparationArtifact(value),
      },
      placementSurfaceValidationBoundary: {
        validate: (value) => validatePlacementSurfaceValidationBoundaryArtifact(value),
      },
    }
  ),
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

    // S7 (E4.2, debug evidence): per-tile drift surfaces behind the lake and
    // terrain drift counters this step already publishes as aggregates.
    emitSurfaceDriftViz(context, {
      acceptedLakeMask: engineProjectionLakes.lakeMask as Uint8Array,
      beforeValidate,
      afterMaintenance,
    });
  },
});

/**
 * Debug-visibility evidence layers for the surface maintenance boundary:
 * where engine validation/maintenance dried accepted lake tiles or changed
 * terrain/water classification (the per-tile data behind
 * finalLakeWaterDriftCount / finalLakeClassificationDriftCount).
 */
function emitSurfaceDriftViz(
  context: ExtendedMapContext,
  args: {
    acceptedLakeMask: Uint8Array;
    beforeValidate: TerrainValidationBoundarySnapshot;
    afterMaintenance: TerrainValidationBoundarySnapshot;
  }
): void {
  if (!context.viz) return;
  const { width, height } = context.dimensions;
  const size = Math.max(0, width * height);
  const { acceptedLakeMask, beforeValidate, afterMaintenance } = args;

  const lakeDrift = new Uint8Array(size);
  for (let i = 0; i < size; i++) {
    if (acceptedLakeMask[i] !== 1) continue;
    if (afterMaintenance.waterMask[i] !== 1) lakeDrift[i] = 2;
    else if (afterMaintenance.lakeMask[i] !== 1) lakeDrift[i] = 3;
    else lakeDrift[i] = 1;
  }
  context.viz.dumpGrid(context.trace, {
    dataTypeKey: "map.placement.surface.lakeDrift",
    spaceId: PLACEMENT_TILE_SPACE_ID,
    dims: { width, height },
    format: "u8",
    values: lakeDrift,
    meta: defineVizMeta("map.placement.surface.lakeDrift", {
      label: "Lake Drift (Surface Maintenance)",
      group: PLACEMENT_VIZ_GROUP,
      visibility: "debug",
      description:
        "Accepted lake tiles after final engine surface maintenance: stable, dried (no longer water), or declassified (water but not a Civ7 lake).",
      palette: "categorical",
      categories: [
        transparentNoneCategory("Not Accepted Lake"),
        { value: 1, label: "Lake Stable", color: [59, 130, 246, 200] },
        { value: 2, label: "Dried (Water Drift)", color: [239, 68, 68, 235] },
        { value: 3, label: "Declassified", color: [245, 158, 11, 235] },
      ],
    }),
  });

  const terrainDrift = new Uint8Array(size);
  for (let i = 0; i < size; i++) {
    const terrainChanged = beforeValidate.terrain[i] !== afterMaintenance.terrain[i];
    const waterChanged = beforeValidate.waterMask[i] !== afterMaintenance.waterMask[i];
    terrainDrift[i] =
      terrainChanged && waterChanged ? 3 : waterChanged ? 2 : terrainChanged ? 1 : 0;
  }
  context.viz.dumpGrid(context.trace, {
    dataTypeKey: "map.placement.surface.terrainValidationDrift",
    spaceId: PLACEMENT_TILE_SPACE_ID,
    dims: { width, height },
    format: "u8",
    values: terrainDrift,
    meta: defineVizMeta("map.placement.surface.terrainValidationDrift", {
      label: "Terrain Validation Drift",
      group: PLACEMENT_VIZ_GROUP,
      visibility: "debug",
      description:
        "Tiles the engine's validateAndFixTerrain/maintenance pass changed between the before-validate and after-maintenance snapshots (terrain type and/or water classification).",
      palette: "categorical",
      categories: [
        transparentNoneCategory("Unchanged"),
        { value: 1, label: "Terrain Changed", color: [245, 158, 11, 235] },
        { value: 2, label: "Water Changed", color: [59, 130, 246, 235] },
        { value: 3, label: "Both Changed", color: [239, 68, 68, 235] },
      ],
    }),
  });
}
