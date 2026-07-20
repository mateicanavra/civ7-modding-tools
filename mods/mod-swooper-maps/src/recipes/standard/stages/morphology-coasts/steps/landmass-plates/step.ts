import { MORPHOLOGY_SEA_LEVEL_TARGET_WATER_PERCENT_DELTA } from "@mapgen/domain/morphology/model/policy/coast-knob-policy.js";
import { DEFAULT_ELEVATION_SCALE } from "@mapgen/domain/morphology/model/policy/elevation-scale.js";
// SINGLE SOURCE OF TRUTH for the absolute-elevation quantization scale: the same constant
// base topography quantizes with, imported so the margin sculpt derives its profile on the
// exact engine scale rather than mirroring it as a config field.
import { ctxRandom, ctxRandomLabel } from "@swooper/mapgen-core";
import { createStep } from "@swooper/mapgen-core/authoring";
import { clampFinite, clampInt16, roundHalfAwayFromZero } from "@swooper/mapgen-core/lib/math";
import {
  defineStandardVizCategoryMeta,
  defineStandardVizMeta,
  STANDARD_VIZ_COLORS,
} from "../../../../viz.js";
import type { MorphologySeaLevelKnob } from "../../index.js";
import { LandmassPlatesStepContract } from "./config.js";

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
export const LandmassPlatesStep = createStep(LandmassPlatesStepContract, {
  normalize: (config, ctx) => {
    const { seaLevel } = ctx.knobs as Readonly<{ seaLevel?: MorphologySeaLevelKnob }>;
    const delta = MORPHOLOGY_SEA_LEVEL_TARGET_WATER_PERCENT_DELTA[seaLevel ?? "earthlike"] ?? 0;

    const seaLevelSelection =
      config.seaLevel.strategy === "default"
        ? {
            ...config.seaLevel,
            config: {
              ...config.seaLevel.config,
              targetWaterPercent: clampFinite(
                config.seaLevel.config.targetWaterPercent + delta,
                TARGET_WATER_PERCENT_CLAMP_MIN,
                TARGET_WATER_PERCENT_CLAMP_MAX
              ),
            },
          }
        : config.seaLevel;

    return { ...config, seaLevel: seaLevelSelection };
  },
  run: (context, config, ops, deps) => {
    const crustTiles = deps.artifacts.foundationCrustTiles.read(context);
    const historyTiles = deps.artifacts.foundationTectonicHistoryTiles.read(context);
    const provenanceTiles = deps.artifacts.foundationTectonicProvenanceTiles.read(context);
    const { width, height } = context.setup.dimensions;
    const stepId = `morphology/${LandmassPlatesStepContract.id}`;

    const beltDrivers = ops.beltDrivers(
      {
        width,
        height,
        historyTiles,
        provenanceTiles,
      },
      config.beltDrivers
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
      config.substrate
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
      config.baseTopography
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
        // (config.baseTopography.config) + the canonical elevation scale base topography quantizes
        // with, so the margin profile derives endpoints against THIS map's real relief, not a mirror.
        oceanicHeight: config.baseTopography.config.oceanicHeight,
        continentalHeight: config.baseTopography.config.continentalHeight,
        elevationScale: DEFAULT_ELEVATION_SCALE,
        elevation: baseTopography.elevation,
        crustType: crustTiles.type,
        crustAge: crustTiles.age,
        crustBuoyancy: crustTiles.buoyancy,
        boundaryCloseness: beltDrivers.boundaryCloseness,
        boundaryType: beltDrivers.boundaryType,
      },
      config.sculptContinentalMargin
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
      config.seaLevel
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
      config.landmask
    );

    const elevation = new Int16Array(baseTopography.elevation);
    const landMask = new Uint8Array(landmask.landMask);
    const stats = collectBaseTerrainStats(width, height, elevation, landMask);
    // (Removed `relaxUndrivenInteriorDomes`: it artificially lowered undriven interior land to fake
    // relief on the old flat unimodal hump. With bimodal crust relief, undriven interiors are real
    // cratons that should ride high — the heuristic now double-counted and carved them back down.)

    const seaLevelValue = seaLevel.seaLevel;
    const waterElevation = clampInt16(Math.floor(seaLevelValue));
    const landElevation = clampInt16(Math.floor(seaLevelValue) + 1);
    for (let i = 0; i < elevation.length; i++) {
      const isLand = landMask[i] === 1;
      const current = elevation[i] ?? 0;
      if (isLand) {
        if (current <= seaLevelValue) elevation[i] = landElevation;
      } else {
        if (current > seaLevelValue) elevation[i] = waterElevation;
      }
    }

    const bathymetry = new Int16Array(width * height);
    for (let i = 0; i < bathymetry.length; i++) {
      const elevationMeters = elevation[i] ?? 0;
      const isLand = landMask[i] === 1;
      if (isLand) {
        bathymetry[i] = 0;
        continue;
      }
      const delta = Math.min(0, elevationMeters - seaLevelValue);
      bathymetry[i] = clampInt16(roundHalfAwayFromZero(delta));
    }

    const topography = {
      elevation,
      seaLevel: seaLevelValue,
      landMask,
      bathymetry,
    };

    context.trace.event(() => ({
      kind: "morphology.landmassPlates.summary",
      landTiles: stats.landCount,
      waterTiles: stats.waterCount,
      elevationMin: stats.minElevation,
      elevationMax: stats.maxElevation,
      seaLevel: seaLevelValue,
    }));
    deps.artifacts.baseTopography.publish(context, topography);
    deps.artifacts.baseSubstrate.publish(context, substrate);
    deps.artifacts.beltDrivers.publish(context, beltDrivers);
    return { topography, substrate, beltDrivers };
  },
  viz: ({ result: { topography, substrate, beltDrivers }, dimensions }) => [
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
