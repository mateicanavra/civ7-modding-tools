import { DEFAULT_ELEVATION_SCALE } from "@mapgen/domain/morphology/model/policy/elevation-scale.js";
import { MORPHOLOGY_SEA_LEVEL_TARGET_WATER_PERCENT_DELTA } from "@mapgen/domain/morphology/modules/coasts/model/policy/sea-level-knob-policy.js";
// SINGLE SOURCE OF TRUTH for the absolute-elevation quantization scale: the same constant
// base topography quantizes with, imported so the margin sculpt derives its profile on the
// exact engine scale rather than mirroring it as a config field.
import { ctxRandom, ctxRandomLabel } from "@swooper/mapgen-core";
import { createStep } from "@swooper/mapgen-core/authoring";
import { clampFinite } from "@swooper/mapgen-core/lib/math";
import {
  defineStandardVizCategoryMeta,
  defineStandardVizMeta,
  STANDARD_VIZ_COLORS,
} from "../../../../../viz.js";
import type { MorphologySeaLevelKnob } from "../../index.js";
import { config } from "./config.js";

const GROUP_TOPOGRAPHY = "Morphology / Topography";
const GROUP_SUBSTRATE = "Morphology / Substrate";
const GROUP_BELT_DRIVERS = "Morphology / Belt Drivers";
const TILE_SPACE_ID = "tile.hexOddQ" as const;
const TARGET_WATER_PERCENT_CLAMP_MIN = 0;
const TARGET_WATER_PERCENT_CLAMP_MAX = 100;

function collectBaseTerrainStats(
  width: number,
  height: number,
  elevation: Int16Array,
  landMask: Uint8Array
): { landCount: number; waterCount: number; minElevation: number; maxElevation: number } {
  const size = width * height;
  let landCount = 0;
  let waterCount = 0;
  let minElevation = 0;
  let maxElevation = 0;

  for (let i = 0; i < size; i++) {
    const nextElevation = elevation[i] ?? 0;
    const isLand = landMask[i] === 1;

    if (isLand) landCount += 1;
    else waterCount += 1;

    if (i === 0 || nextElevation < minElevation) minElevation = nextElevation;
    if (i === 0 || nextElevation > maxElevation) maxElevation = nextElevation;
  }

  return { landCount, waterCount, minElevation, maxElevation };
}

/**
 * Converts projected Foundation crust and tectonic history into belt drivers,
 * substrate, relief, sea level, and the initial Morphology landmask.
 */
export const LandmassPlatesStep = createStep(config, {
  normalize: (stepConfig, ctx) => {
    const { seaLevel } = ctx.knobs as Readonly<{ seaLevel?: MorphologySeaLevelKnob }>;
    const delta = MORPHOLOGY_SEA_LEVEL_TARGET_WATER_PERCENT_DELTA[seaLevel ?? "earthlike"] ?? 0;

    const seaLevelSelection =
      stepConfig.seaLevel.strategy === "hypsometric-target"
        ? {
            ...stepConfig.seaLevel,
            config: {
              ...stepConfig.seaLevel.config,
              targetWaterPercent: clampFinite(
                stepConfig.seaLevel.config.targetWaterPercent + delta,
                TARGET_WATER_PERCENT_CLAMP_MIN,
                TARGET_WATER_PERCENT_CLAMP_MAX
              ),
            },
          }
        : stepConfig.seaLevel;

    return { ...stepConfig, seaLevel: seaLevelSelection };
  },
  run: (context, stepConfig, ops, deps) => {
    const crustTiles = deps.artifacts.crustTiles.read();
    const historyTiles = deps.artifacts.tectonicHistoryTiles.read();
    const provenanceTiles = deps.artifacts.tectonicProvenanceTiles.read();
    const { width, height } = context.setup.dimensions;
    const stepId = `morphology/${config.id}`;

    const beltDrivers = ops.beltDrivers(
      {
        width,
        height,
        historyTiles: {
          perEra: historyTiles.perEra.map((era) => ({
            boundaryType: era.boundaryType,
            upliftPotential: era.upliftPotential,
            collisionPotential: era.collisionPotential,
            subductionPotential: era.subductionPotential,
            riftPotential: era.riftPotential,
            shearStress: era.shearStress,
          })),
          rollups: {
            upliftTotal: historyTiles.rollups.upliftTotal,
            collisionTotal: historyTiles.rollups.collisionTotal,
            subductionTotal: historyTiles.rollups.subductionTotal,
            upliftRecentFraction: historyTiles.rollups.upliftRecentFraction,
            collisionRecentFraction: historyTiles.rollups.collisionRecentFraction,
            subductionRecentFraction: historyTiles.rollups.subductionRecentFraction,
            lastActiveEra: historyTiles.rollups.lastActiveEra,
          },
        },
        provenanceTiles: {
          originEra: provenanceTiles.originEra,
          originPlateId: provenanceTiles.originPlateId,
          lastBoundaryType: provenanceTiles.lastBoundaryType,
        },
      },
      stepConfig.beltDrivers
    );

    const substrate = ops.substrate(
      {
        width,
        height,
        upliftPotential: beltDrivers.upliftPotential,
        riftPotential: beltDrivers.riftPotential,
        boundaryCloseness: beltDrivers.boundaryCloseness,
        boundaryType: beltDrivers.boundaryType,
        crustType: crustTiles.type,
        crustAge: crustTiles.age,
      },
      stepConfig.substrate
    );

    const baseTopography = ops.baseTopography(
      {
        width,
        height,
        crustBaseElevation: crustTiles.baseElevation,
        boundaryCloseness: beltDrivers.boundaryCloseness,
        upliftPotential: beltDrivers.upliftPotential,
        riftPotential: beltDrivers.riftPotential,
        rngSeed: ctxRandom(
          context,
          ctxRandomLabel(stepId, "morphology/compute-base-topography"),
          2_147_483_647
        ),
      },
      stepConfig.baseTopography
    );

    // Sculpt continental-margin morphology (apron -> break -> slope -> abyss) directly into
    // ABSOLUTE elevation, datum-free, BEFORE sea level is solved. This GENERATES the real
    // margin the shelf classifier later reads. Because it rewrites baseTopography.elevation in
    // place — the same producer-owned elevation copy compute-sea-level consumes — the datum is solved on the sculpted
    // histogram (the one real coupling), held in check by the targetWaterPercent intent (see
    // normalize). marginHopDistance/apronLengthScale are exposed for diagnostics only.
    const margin = ops.sculptContinentalMargin(
      {
        width,
        height,
        // Relief datums SINGLE-SOURCED from the same base-topography config the op above consumed
        // (stepConfig.baseTopography.config) + the canonical elevation scale base topography quantizes
        // with, so the margin profile derives endpoints against THIS map's real relief, not a mirror.
        oceanicHeight: stepConfig.baseTopography.config.oceanicHeight,
        continentalHeight: stepConfig.baseTopography.config.continentalHeight,
        elevationScale: DEFAULT_ELEVATION_SCALE,
        elevation: baseTopography.elevation,
        crustType: crustTiles.type,
        crustAge: crustTiles.age,
        crustBuoyancy: crustTiles.buoyancy,
        boundaryCloseness: beltDrivers.boundaryCloseness,
        boundaryType: beltDrivers.boundaryType,
      },
      stepConfig.sculptContinentalMargin
    );
    baseTopography.elevation.set(margin.elevation);

    const seaLevel = ops.seaLevel(
      {
        width,
        height,
        elevation: baseTopography.elevation,
        crustType: crustTiles.type,
        boundaryCloseness: beltDrivers.boundaryCloseness,
        upliftPotential: beltDrivers.upliftPotential,
        rngSeed: ctxRandom(
          context,
          ctxRandomLabel(stepId, "morphology/compute-sea-level"),
          2_147_483_647
        ),
      },
      stepConfig.seaLevel
    );

    const landmask = ops.landmask(
      {
        width,
        height,
        elevation: baseTopography.elevation,
        seaLevel: seaLevel.seaLevel,
        boundaryCloseness: beltDrivers.boundaryCloseness,
        boundaryType: beltDrivers.boundaryType,
        upliftPotential: beltDrivers.upliftPotential,
        riftPotential: beltDrivers.riftPotential,
        tectonicStress: beltDrivers.tectonicStress,
        crustType: crustTiles.type,
        crustMaturity: crustTiles.maturity,
        crustThickness: crustTiles.thickness,
        crustDamage: crustTiles.damage,
        crustBaseElevation: crustTiles.baseElevation,
        crustStrength: crustTiles.strength,
        crustAge: crustTiles.age,
        provenanceOriginEra: provenanceTiles.originEra,
        provenanceDriftDistance: provenanceTiles.driftDistance,
        riftPotentialByEra: historyTiles.perEra.map((era) => era.riftPotential),
        fractureTotal: historyTiles.rollups.fractureTotal,
        upliftTotal: historyTiles.rollups.upliftTotal,
        volcanismTotal: historyTiles.rollups.volcanismTotal,
        upliftRecentFraction: historyTiles.rollups.upliftRecentFraction,
        lastActiveEra: historyTiles.rollups.lastActiveEra,
        movementU: historyTiles.rollups.movementU,
        movementV: historyTiles.rollups.movementV,
      },
      stepConfig.landmask
    );

    // (Removed `relaxUndrivenInteriorDomes`: it artificially lowered undriven interior land to fake
    // relief on the old flat unimodal hump. With bimodal crust relief, undriven interiors are real
    // cratons that should ride high — the heuristic now double-counted and carved them back down.)

    const topography = {
      elevation: landmask.elevation,
      seaLevel: landmask.seaLevel,
      landMask: landmask.landMask,
      bathymetry: landmask.bathymetry,
    };
    const stats = collectBaseTerrainStats(width, height, topography.elevation, topography.landMask);

    context.trace.event(() => ({
      kind: "morphology.landmassPlates.summary",
      landTiles: stats.landCount,
      waterTiles: stats.waterCount,
      elevationMin: stats.minElevation,
      elevationMax: stats.maxElevation,
      seaLevel: topography.seaLevel,
    }));
    const beltDriverFields = {
      boundaryCloseness: beltDrivers.boundaryCloseness,
      boundaryType: beltDrivers.boundaryType,
      upliftPotential: beltDrivers.upliftPotential,
      collisionPotential: beltDrivers.collisionPotential,
      subductionPotential: beltDrivers.subductionPotential,
      riftPotential: beltDrivers.riftPotential,
      tectonicStress: beltDrivers.tectonicStress,
      beltAge: beltDrivers.beltAge,
      dominantEra: beltDrivers.dominantEra,
      beltMask: beltDrivers.beltMask,
      beltDistance: beltDrivers.beltDistance,
      beltNearestSeed: beltDrivers.beltNearestSeed,
    };
    deps.artifacts.baseTopography.publish(topography);
    deps.artifacts.baseSubstrate.publish(substrate);
    deps.artifacts.beltDrivers.publish(beltDriverFields);
    return { topography, substrate, beltDrivers: beltDriverFields };
  },
  viz: ({ observation: { topography, substrate, beltDrivers }, dimensions }) => [
    {
      kind: "grid",
      dataTypeKey: "morphology.topography.elevation",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "i16", values: topography.elevation },
      meta: defineStandardVizMeta("morphology.topography.elevation", "terrain.elevation", {
        label: "Elevation (m)",
        group: GROUP_TOPOGRAPHY,
      }),
    },
    {
      kind: "grid",
      dataTypeKey: "morphology.topography.landMask",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "u8", values: topography.landMask },
      meta: defineStandardVizCategoryMeta(
        "morphology.topography.landMask",
        [
          { value: 0, label: "Water", color: STANDARD_VIZ_COLORS.water.ocean },
          { value: 1, label: "Land", color: STANDARD_VIZ_COLORS.land },
        ],
        {
          label: "Land Mask",
          group: GROUP_TOPOGRAPHY,
        }
      ),
    },
    {
      kind: "grid",
      dataTypeKey: "morphology.topography.bathymetry",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "i16", values: topography.bathymetry },
      meta: defineStandardVizMeta("morphology.topography.bathymetry", "water.depth", {
        label: "Bathymetry (m)",
        group: GROUP_TOPOGRAPHY,
        visibility: "debug",
      }),
    },
    ...(
      [
        ["morphology.substrate.erodibilityK", "Erodibility K", substrate.erodibilityK, "debug"],
        [
          "morphology.substrate.sedimentDepth",
          "Sediment Depth",
          substrate.sedimentDepth,
          "default",
        ],
      ] as const
    ).map(([dataTypeKey, label, values, visibility]) => ({
      kind: "grid" as const,
      dataTypeKey,
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "f32" as const, values },
      meta: defineStandardVizMeta(dataTypeKey, "field.intensity", {
        label,
        group: GROUP_SUBSTRATE,
        visibility,
      }),
    })),
    ...(
      [
        [
          "morphology.belts.boundaryCloseness",
          "Belt Boundary Closeness",
          beltDrivers.boundaryCloseness,
          "default",
          "field.intensity",
        ],
        [
          "morphology.belts.boundaryType",
          "Belt Boundary Type",
          beltDrivers.boundaryType,
          "default",
          "category.distinct",
        ],
        [
          "morphology.belts.upliftPotential",
          "Belt Uplift Potential",
          beltDrivers.upliftPotential,
          "debug",
          "field.intensity",
        ],
        [
          "morphology.belts.riftPotential",
          "Belt Rift Potential",
          beltDrivers.riftPotential,
          "debug",
          "field.intensity",
        ],
        [
          "morphology.belts.tectonicStress",
          "Belt Tectonic Stress",
          beltDrivers.tectonicStress,
          "debug",
          "field.intensity",
        ],
        ["morphology.belts.mask", "Belt Mask", beltDrivers.beltMask, "debug", "category.distinct"],
      ] as const
    ).map(([dataTypeKey, label, values, visibility, style]) => ({
      kind: "grid" as const,
      dataTypeKey,
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "u8" as const, values },
      meta: defineStandardVizMeta(dataTypeKey, style, {
        label,
        group: GROUP_BELT_DRIVERS,
        visibility,
      }),
    })),
  ],
});
