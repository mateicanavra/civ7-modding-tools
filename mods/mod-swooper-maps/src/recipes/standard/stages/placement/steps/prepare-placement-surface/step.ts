import { deriveCiv7CoastProjection } from "@civ7/map-policy";
import type { TraceJsonObject } from "@swooper/mapgen-core";
import { createStep } from "@swooper/mapgen-core/authoring";
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

/**
 * Counts accepted lake tiles dried or declassified by Civ7 maintenance. Lake
 * truth remains owned by Hydrology; this is only final boundary readback.
 */
function readFinalLakeProjection(
  dimensions: Readonly<{ width: number; height: number }>,
  waterMask: Uint8Array,
  lakeMask: Uint8Array,
  acceptedLakeMask: Uint8Array
): Readonly<{
  acceptedLakeTileCount: number;
  finalLakeWaterDriftCount: number;
  finalLakeClassificationDriftCount: number;
}> {
  const { width, height } = dimensions;
  const size = width * height;
  let acceptedLakeTileCount = 0;
  let finalLakeWaterDriftCount = 0;
  let finalLakeClassificationDriftCount = 0;
  for (let i = 0; i < size; i++) {
    if (acceptedLakeMask[i] !== 1) continue;
    acceptedLakeTileCount++;
    if (waterMask[i] !== 1) finalLakeWaterDriftCount++;
    if (lakeMask[i] !== 1) finalLakeClassificationDriftCount++;
  }
  return {
    acceptedLakeTileCount,
    finalLakeWaterDriftCount,
    finalLakeClassificationDriftCount,
  };
}

/**
 * Executes the transactional terrain validation, coast restoration, water
 * storage, and final lake readback required before placement products read Civ7.
 */
export const PreparePlacementSurfaceStep = createStep(config, {
  run: (context, _stepConfig, _ops, deps) => {
    const projectedLakes = deps.artifacts.projectedLakes.read(context);
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
    const emit = (payload: TraceJsonObject): void => {
      context.trace.event(() => payload);
    };
    const readTerrainValidationBoundary = (stage: string): TerrainValidationBoundaryReadback => ({
      stage,
      terrain: deps.engine.readCurrentMapTerrainTypes(context),
      waterMask: deps.engine.readCurrentMapWaterMask(context),
      lakeMask: deps.engine.readCurrentMapLakeMask(context),
      areaId: deps.engine.readCurrentMapAreaIds(context),
    });
    const acceptedLakeMask = projectedLakes.lakeMask;
    const beforeValidate = readTerrainValidationBoundary(
      "placement/prepare-surface/before-validate"
    );
    logTerrainStats(context, "Initial", beforeValidate);
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
      emit({ type: "placement.terrain.validated" });
      const boundary = readTerrainValidationBoundary("placement/prepare-surface/after-validate");
      logTerrainStats(context, "After validateAndFixTerrain", boundary);
      return boundary;
    });
    runPlacementProductStep("placement.areas.recalculate", emit, () => {
      deps.engine.recalculateAreas(context);
      emit({ type: "placement.areas.recalculated" });
    });
    runPlacementProductStep("placement.water.store", emit, () => {
      deps.engine.storeWaterData(context);
      emit({ type: "placement.water.stored" });
    });
    const afterMaintenance = readTerrainValidationBoundary(
      "placement/prepare-surface/after-maintenance"
    );
    const finalLakeReadback = readFinalLakeProjection(
      dimensions,
      afterMaintenance.waterMask,
      afterMaintenance.lakeMask,
      acceptedLakeMask
    );
    emit({ type: "placement.lakes.finalReadback", ...finalLakeReadback });
    console.log(
      `[SWOOPER_MOD] PLACEMENT_SURFACE_PREPARATION_V1 ${JSON.stringify(finalLakeReadback)}`
    );

    return {
      acceptedLakeMask,
      beforeValidate,
      afterValidate,
      afterMaintenance,
      finalLakeReadback,
    };
  },
  metrics: ({ result }) => ({
    "placement.surfacePreparation": measureStandardPlacementSurface(result.finalLakeReadback),
  }),
  viz: ({ result, dimensions }) => projectPlacementSurfaceViz({ ...result, dimensions }),
});
