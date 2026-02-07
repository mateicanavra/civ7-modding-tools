import { computeSampleStep, ctxRandom, ctxRandomLabel, defineVizMeta, renderAsciiGrid } from "@swooper/mapgen-core";
import type { MapDimensions } from "@civ7/adapter";
import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";
import { clampFinite, clampInt16, roundHalfAwayFromZero } from "@swooper/mapgen-core/lib/math";
import LandmassPlatesStepContract from "./landmassPlates.contract.js";
import { MORPHOLOGY_SEA_LEVEL_TARGET_WATER_PERCENT_DELTA } from "@mapgen/domain/morphology/shared/knob-multipliers.js";
import type { MorphologySeaLevelKnob } from "@mapgen/domain/morphology/shared/knobs.js";

type ArtifactValidationIssue = Readonly<{ message: string }>;

const GROUP_TOPOGRAPHY = "Morphology / Topography";
const GROUP_SUBSTRATE = "Morphology / Substrate";
const GROUP_BELT_DRIVERS = "Morphology / Belt Drivers";
const TILE_SPACE_ID = "tile.hexOddR" as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function expectedSize(dimensions: MapDimensions): number {
  return Math.max(0, (dimensions.width | 0) * (dimensions.height | 0));
}

function validateTypedArray(
  errors: ArtifactValidationIssue[],
  label: string,
  value: unknown,
  ctor: { new (...args: any[]): { length: number } },
  expectedLength?: number
): value is { length: number } {
  if (!(value instanceof ctor)) {
    errors.push({ message: `Expected ${label} to be ${ctor.name}.` });
    return false;
  }
  if (expectedLength != null && value.length !== expectedLength) {
    errors.push({
      message: `Expected ${label} length ${expectedLength} (received ${value.length}).`,
    });
  }
  return true;
}

function validateHeightfieldBuffer(value: unknown, dimensions: MapDimensions): ArtifactValidationIssue[] {
  const errors: ArtifactValidationIssue[] = [];
  if (!isRecord(value)) {
    errors.push({ message: "Missing heightfield buffer." });
    return errors;
  }
  const size = expectedSize(dimensions);
  const candidate = value as {
    elevation?: unknown;
    seaLevel?: unknown;
    landMask?: unknown;
    bathymetry?: unknown;
  };
  validateTypedArray(errors, "topography.elevation", candidate.elevation, Int16Array, size);
  if (typeof candidate.seaLevel !== "number" || !Number.isFinite(candidate.seaLevel)) {
    errors.push({ message: "Expected topography.seaLevel to be a finite number." });
  }
  validateTypedArray(errors, "topography.landMask", candidate.landMask, Uint8Array, size);
  validateTypedArray(errors, "topography.bathymetry", candidate.bathymetry, Int16Array, size);
  return errors;
}

function validateSubstrateBuffer(value: unknown, dimensions: MapDimensions): ArtifactValidationIssue[] {
  const errors: ArtifactValidationIssue[] = [];
  if (!isRecord(value)) {
    errors.push({ message: "Missing substrate buffer." });
    return errors;
  }
  const size = expectedSize(dimensions);
  const candidate = value as { erodibilityK?: unknown; sedimentDepth?: unknown };
  validateTypedArray(errors, "substrate.erodibilityK", candidate.erodibilityK, Float32Array, size);
  validateTypedArray(errors, "substrate.sedimentDepth", candidate.sedimentDepth, Float32Array, size);
  return errors;
}

function validateBeltDriversBuffer(value: unknown, dimensions: MapDimensions): ArtifactValidationIssue[] {
  const errors: ArtifactValidationIssue[] = [];
  if (!isRecord(value)) {
    errors.push({ message: "Missing beltDrivers buffer." });
    return errors;
  }
  const size = expectedSize(dimensions);
  const candidate = value as {
    boundaryCloseness?: unknown;
    boundaryType?: unknown;
    upliftPotential?: unknown;
    riftPotential?: unknown;
    tectonicStress?: unknown;
    beltMask?: unknown;
    beltDistance?: unknown;
    beltNearestSeed?: unknown;
    beltComponents?: unknown;
  };
  validateTypedArray(errors, "beltDrivers.boundaryCloseness", candidate.boundaryCloseness, Uint8Array, size);
  validateTypedArray(errors, "beltDrivers.boundaryType", candidate.boundaryType, Uint8Array, size);
  validateTypedArray(errors, "beltDrivers.upliftPotential", candidate.upliftPotential, Uint8Array, size);
  validateTypedArray(errors, "beltDrivers.riftPotential", candidate.riftPotential, Uint8Array, size);
  validateTypedArray(errors, "beltDrivers.tectonicStress", candidate.tectonicStress, Uint8Array, size);
  validateTypedArray(errors, "beltDrivers.beltMask", candidate.beltMask, Uint8Array, size);
  validateTypedArray(errors, "beltDrivers.beltDistance", candidate.beltDistance, Uint8Array, size);
  validateTypedArray(errors, "beltDrivers.beltNearestSeed", candidate.beltNearestSeed, Int32Array, size);
  if (!Array.isArray(candidate.beltComponents)) {
    errors.push({ message: "Expected beltDrivers.beltComponents to be an array." });
  }
  return errors;
}

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
      validate: (value, context) => validateHeightfieldBuffer(value, context.dimensions),
    },
    substrate: {
      validate: (value, context) => validateSubstrateBuffer(value, context.dimensions),
    },
    beltDrivers: {
      validate: (value, context) => validateBeltDriversBuffer(value, context.dimensions),
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
              targetWaterPercent: clampFinite((config.seaLevel.config.targetWaterPercent ?? 0) + delta, 0, 100),
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
        rngSeed: ctxRandom(context, ctxRandomLabel(stepId, "morphology/compute-base-topography"), 2_147_483_647),
      },
      config.baseTopography
    );

    const seaLevel = ops.seaLevel(
      {
        width,
        height,
        elevation: baseTopography.elevation,
        crustType: crustTiles.type,
        boundaryCloseness: beltDrivers.boundaryCloseness,
        upliftPotential: beltDrivers.upliftPotential,
        rngSeed: ctxRandom(context, ctxRandomLabel(stepId, "morphology/compute-sea-level"), 2_147_483_647),
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
        crustType: crustTiles.type,
        crustBaseElevation: crustTiles.baseElevation,
        crustAge: crustTiles.age,
        provenanceOriginEra: provenanceTiles.originEra,
        provenanceDriftDistance: provenanceTiles.driftDistance,
        riftPotentialByEra: historyTiles.perEra.map((era) => era.riftPotential),
        fractureTotal: historyTiles.rollups.fractureTotal,
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
