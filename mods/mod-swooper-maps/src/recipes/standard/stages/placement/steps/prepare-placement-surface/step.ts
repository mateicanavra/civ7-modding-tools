import { deriveCiv7CoastProjection } from "@civ7/map-policy";
import type { TraceJsonObject } from "@swooper/mapgen-core";
import { createStep } from "@swooper/mapgen-core/authoring";
import {
  type CurrentEngineTerrainClassification,
  captureEngineTerrainClassification,
} from "../../../../current-engine-surface.js";
import { measureStandardPlacementSurface } from "../../../../metrics/families/placement-surface.js";
import { restoreProjectedCoastTerrain } from "../../../../water-surface-parity.js";
import { logTerrainStats, runPlacementProductStep } from "../../log.js";
import { config } from "./config.js";
import { projectPlacementSurfaceViz } from "./viz.js";

type TerrainValidationBoundaryReadback = Readonly<{
  stage: string;
  terrain: Int32Array;
  waterMask: Uint8Array;
  lakeMask: Uint8Array;
  areaId: Int32Array;
}>;

type RegionSlot = 0 | 1 | 2;

/**
 * Records exact engine terrain and classification around one maintenance
 * boundary. The detached snapshot is diagnostic evidence, not causal state.
 */
function readTerrainValidationBoundary(
  currentSurface: CurrentEngineTerrainClassification,
  readAreaId: (x: number, y: number) => number,
  stage: string
): TerrainValidationBoundaryReadback {
  const { width, height } = currentSurface;
  const areaId = new Int32Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      areaId[y * width + x] = readAreaId(x, y) | 0;
    }
  }
  return {
    stage,
    terrain: Int32Array.from(currentSurface.terrain),
    waterMask: Uint8Array.from(currentSurface.waterMask),
    lakeMask: Uint8Array.from(currentSurface.lakeMask),
    areaId,
  };
}

/**
 * Counts accepted lake tiles dried or declassified by Civ7 maintenance. Lake
 * truth remains owned by Hydrology; this is only final boundary readback.
 */
function readFinalLakeProjection(
  currentSurface: CurrentEngineTerrainClassification,
  acceptedLakeMask: Uint8Array
): Readonly<{
  acceptedLakeTileCount: number;
  finalLakeWaterDriftCount: number;
  finalLakeClassificationDriftCount: number;
}> {
  const { width, height } = currentSurface;
  const size = width * height;
  let acceptedLakeTileCount = 0;
  let finalLakeWaterDriftCount = 0;
  let finalLakeClassificationDriftCount = 0;
  for (let i = 0; i < size; i++) {
    if (acceptedLakeMask[i] !== 1) continue;
    acceptedLakeTileCount++;
    if (currentSurface.waterMask[i] !== 1) finalLakeWaterDriftCount++;
    if (currentSurface.lakeMask[i] !== 1) finalLakeClassificationDriftCount++;
  }
  return {
    acceptedLakeTileCount,
    finalLakeWaterDriftCount,
    finalLakeClassificationDriftCount,
  };
}

/**
 * Restamps abstract placement-region slots after area recalculation rewrites
 * Civ7's region bookkeeping.
 */
function applyLandmassRegionSlots(
  engine: Readonly<{
    getLandmassId: (name: "NONE" | "WEST" | "EAST") => number;
    setLandmassRegionId: (x: number, y: number, regionId: number) => void;
  }>,
  width: number,
  height: number,
  slotByTile: Uint8Array
): void {
  const size = width * height;
  const westRegionId = engine.getLandmassId("WEST");
  const eastRegionId = engine.getLandmassId("EAST");
  const noneRegionId = engine.getLandmassId("NONE");
  for (let i = 0; i < size; i++) {
    const y = (i / width) | 0;
    const x = i - y * width;
    const slot = (slotByTile[i] ?? 0) as RegionSlot;
    const regionId = slot === 1 ? westRegionId : slot === 2 ? eastRegionId : noneRegionId;
    engine.setLandmassRegionId(x, y, regionId);
  }
}

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
    for (const slot of slotByTile) {
      if (slot === 1) slotCounts.west++;
      else if (slot === 2) slotCounts.east++;
      else slotCounts.none++;
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
