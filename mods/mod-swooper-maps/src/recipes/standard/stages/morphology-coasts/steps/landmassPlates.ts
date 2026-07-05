import { MORPHOLOGY_SEA_LEVEL_TARGET_WATER_PERCENT_DELTA } from "@mapgen/domain/morphology/model/policy/coast-knob-policy.js";
import { DEFAULT_ELEVATION_SCALE } from "@mapgen/domain/morphology/model/policy/elevation-scale.js";
// SINGLE SOURCE OF TRUTH for the absolute-elevation quantization scale: the same constant
// base topography quantizes with, imported so the margin sculpt derives its profile on the
// exact engine scale rather than mirroring it as a config field.
import {
  computeSampleStep,
  ctxRandom,
  ctxRandomLabel,
  defineVizMeta,
  renderAsciiGrid,
} from "@swooper/mapgen-core";
import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";
import { clampFinite, clampInt16, roundHalfAwayFromZero } from "@swooper/mapgen-core/lib/math";
import { validators as morphologyArtifactValidators } from "../../morphology/artifacts/index.js";
import type { MorphologySeaLevelKnob } from "../index.js";
import LandmassPlatesStepContract from "./landmassPlates.contract.js";

const GROUP_TOPOGRAPHY = "Morphology / Topography";
const GROUP_SUBSTRATE = "Morphology / Substrate";
const GROUP_BELT_DRIVERS = "Morphology / Belt Drivers";
const TILE_SPACE_ID = "tile.hexOddQ" as const;

function applyBaseTerrainBuffers(
  width: number,
  height: number,
  elevation: Int16Array,
  landMask: Uint8Array,
  heightfield: { elevation: Int16Array; landMask: Uint8Array }
): { landCount: number; waterCount: number; minElevation: number; maxElevation: number } {
  const size = Math.max(0, (width | 0) * (height | 0));
  let landCount = 0;
  let waterCount = 0;
  let minElevation = 0;
  let maxElevation = 0;

  for (let i = 0; i < size; i++) {
    const nextElevation = elevation[i] ?? 0;
    const isLand = landMask[i] === 1;

    heightfield.elevation[i] = nextElevation | 0;
    heightfield.landMask[i] = isLand ? 1 : 0;

    if (isLand) landCount += 1;
    else waterCount += 1;

    if (i === 0 || nextElevation < minElevation) minElevation = nextElevation;
    if (i === 0 || nextElevation > maxElevation) maxElevation = nextElevation;
  }

  return { landCount, waterCount, minElevation, maxElevation };
}

export default createStep(LandmassPlatesStepContract, {
  artifacts: implementArtifacts(LandmassPlatesStepContract.artifacts!.provides!, {
    topography: {
      validate: morphologyArtifactValidators.topography,
    },
    substrate: {
      validate: morphologyArtifactValidators.substrate,
    },
    beltDrivers: {
      validate: morphologyArtifactValidators.beltDrivers,
    },
  }),
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
                (config.seaLevel.config.targetWaterPercent ?? 0) + delta,
                0,
                100
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
    const { width, height } = context.dimensions;
    const stepId = `${LandmassPlatesStepContract.phase}/${LandmassPlatesStepContract.id}`;

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
    // place — the same buffer compute-sea-level consumes — the datum is solved on the sculpted
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

    const stats = applyBaseTerrainBuffers(
      width,
      height,
      baseTopography.elevation,
      landmask.landMask,
      context.buffers.heightfield
    );
    // (Removed `relaxUndrivenInteriorDomes`: it artificially lowered undriven interior land to fake
    // relief on the old flat unimodal hump. With bimodal crust relief, undriven interiors are real
    // cratons that should ride high — the heuristic now double-counted and carved them back down.)

    const seaLevelValue = seaLevel.seaLevel;
    const waterElevation = clampInt16(Math.floor(seaLevelValue));
    const landElevation = clampInt16(Math.floor(seaLevelValue) + 1);
    for (let i = 0; i < context.buffers.heightfield.elevation.length; i++) {
      const isLand = context.buffers.heightfield.landMask[i] === 1;
      const current = context.buffers.heightfield.elevation[i] ?? 0;
      if (isLand) {
        if (current <= seaLevelValue) context.buffers.heightfield.elevation[i] = landElevation;
      } else {
        if (current > seaLevelValue) context.buffers.heightfield.elevation[i] = waterElevation;
      }
    }

    const bathymetry = new Int16Array(Math.max(0, (width | 0) * (height | 0)));
    for (let i = 0; i < bathymetry.length; i++) {
      const elevationMeters = context.buffers.heightfield.elevation[i] ?? 0;
      const isLand = context.buffers.heightfield.landMask[i] === 1;
      if (isLand) {
        bathymetry[i] = 0;
        continue;
      }
      const delta = Math.min(0, elevationMeters - seaLevelValue);
      bathymetry[i] = clampInt16(roundHalfAwayFromZero(delta));
    }

    const topography = {
      elevation: context.buffers.heightfield.elevation,
      seaLevel: seaLevelValue,
      landMask: context.buffers.heightfield.landMask,
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
    context.trace.event(() => {
      const sampleStep = computeSampleStep(width, height);
      const rows = renderAsciiGrid({
        width,
        height,
        sampleStep,
        cellFn: (x, y) => {
          const idx = y * width + x;
          const isLand = context.buffers.heightfield.landMask[idx] === 1;
          return { base: isLand ? "." : "~" };
        },
      });
      return {
        kind: "morphology.landmassPlates.ascii.landMask",
        sampleStep,
        legend: ".=land ~=water",
        rows,
      };
    });

    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "morphology.topography.elevation",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "i16",
      values: topography.elevation,
      meta: defineVizMeta("morphology.topography.elevation", {
        label: "Elevation (m)",
        group: GROUP_TOPOGRAPHY,
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "morphology.topography.landMask",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: topography.landMask,
      meta: defineVizMeta("morphology.topography.landMask", {
        label: "Land Mask",
        group: GROUP_TOPOGRAPHY,
        categories: [
          { value: 0, label: "Water", color: [37, 99, 235, 230] },
          { value: 1, label: "Land", color: [34, 197, 94, 230] },
        ],
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "morphology.topography.bathymetry",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "i16",
      values: topography.bathymetry,
      meta: defineVizMeta("morphology.topography.bathymetry", {
        label: "Bathymetry (m)",
        group: GROUP_TOPOGRAPHY,
        visibility: "debug",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "morphology.substrate.erodibilityK",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "f32",
      values: substrate.erodibilityK,
      meta: defineVizMeta("morphology.substrate.erodibilityK", {
        label: "Erodibility K",
        group: GROUP_SUBSTRATE,
        visibility: "debug",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "morphology.substrate.sedimentDepth",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "f32",
      values: substrate.sedimentDepth,
      meta: defineVizMeta("morphology.substrate.sedimentDepth", {
        label: "Sediment Depth",
        group: GROUP_SUBSTRATE,
      }),
    });

    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "morphology.belts.boundaryCloseness",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: beltDrivers.boundaryCloseness,
      meta: defineVizMeta("morphology.belts.boundaryCloseness", {
        label: "Belt Boundary Closeness",
        group: GROUP_BELT_DRIVERS,
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "morphology.belts.boundaryType",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: beltDrivers.boundaryType,
      meta: defineVizMeta("morphology.belts.boundaryType", {
        label: "Belt Boundary Type",
        group: GROUP_BELT_DRIVERS,
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "morphology.belts.upliftPotential",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: beltDrivers.upliftPotential,
      meta: defineVizMeta("morphology.belts.upliftPotential", {
        label: "Belt Uplift Potential",
        group: GROUP_BELT_DRIVERS,
        visibility: "debug",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "morphology.belts.riftPotential",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: beltDrivers.riftPotential,
      meta: defineVizMeta("morphology.belts.riftPotential", {
        label: "Belt Rift Potential",
        group: GROUP_BELT_DRIVERS,
        visibility: "debug",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "morphology.belts.tectonicStress",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: beltDrivers.tectonicStress,
      meta: defineVizMeta("morphology.belts.tectonicStress", {
        label: "Belt Tectonic Stress",
        group: GROUP_BELT_DRIVERS,
        visibility: "debug",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "morphology.belts.mask",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: beltDrivers.beltMask,
      meta: defineVizMeta("morphology.belts.mask", {
        label: "Belt Mask",
        group: GROUP_BELT_DRIVERS,
        visibility: "debug",
      }),
    });

    deps.artifacts.topography.publish(context, topography);
    deps.artifacts.substrate.publish(context, substrate);
    deps.artifacts.beltDrivers.publish(context, beltDrivers);
  },
});
