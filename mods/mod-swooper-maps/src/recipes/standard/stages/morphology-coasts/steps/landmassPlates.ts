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
const GROUP_DUAL_READ = "Morphology / Dual-Read";
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
    const plates = deps.artifacts.foundationPlates.read(context);
    const crustTiles = deps.artifacts.foundationCrustTiles.read(context);
    const { width, height } = context.dimensions;
    const stepId = `${LandmassPlatesStepContract.phase}/${LandmassPlatesStepContract.id}`;

    const substrate = ops.substrate(
      {
        width,
        height,
        upliftPotential: plates.upliftPotential,
        riftPotential: plates.riftPotential,
        boundaryCloseness: plates.boundaryCloseness,
        boundaryType: plates.boundaryType,
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
        boundaryCloseness: plates.boundaryCloseness,
        upliftPotential: plates.upliftPotential,
        riftPotential: plates.riftPotential,
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
        boundaryCloseness: plates.boundaryCloseness,
        upliftPotential: plates.upliftPotential,
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
        boundaryCloseness: plates.boundaryCloseness,
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

    const historyTiles = deps.artifacts.foundationTectonicHistoryTiles.read(context) as {
      eraCount?: number;
      perEra?: Array<{
        boundaryType?: Uint8Array;
        upliftPotential?: Uint8Array;
        riftPotential?: Uint8Array;
        shearStress?: Uint8Array;
        volcanism?: Uint8Array;
        fracture?: Uint8Array;
      }>;
      rollups?: {
        upliftTotal?: Uint8Array;
        fractureTotal?: Uint8Array;
        volcanismTotal?: Uint8Array;
        upliftRecentFraction?: Uint8Array;
        lastActiveEra?: Uint8Array;
      };
    };
    const provenanceTiles = deps.artifacts.foundationTectonicProvenanceTiles.read(context) as {
      originEra?: Uint8Array;
      originPlateId?: Int16Array;
      driftDistance?: Uint8Array;
      lastBoundaryEra?: Uint8Array;
      lastBoundaryType?: Uint8Array;
    };

    if (Array.isArray(historyTiles.perEra) && historyTiles.perEra.length > 0) {
      const size = expectedSize(context.dimensions);
      const eraIndex = Math.max(
        0,
        Math.min(historyTiles.perEra.length - 1, (historyTiles.eraCount ?? historyTiles.perEra.length) - 1)
      );
      const newest = historyTiles.perEra[eraIndex] ?? {};
      const historyBoundary = newest.boundaryType;
      const historyUplift = newest.upliftPotential;
      const historyRift = newest.riftPotential;
      const provenanceOriginEra = provenanceTiles.originEra;
      const provenanceLastBoundary = provenanceTiles.lastBoundaryType;

      if (
        historyBoundary instanceof Uint8Array &&
        historyBoundary.length === size &&
        historyUplift instanceof Uint8Array &&
        historyUplift.length === size
      ) {
        const boundaryDelta = new Uint8Array(size);
        const upliftDelta = new Uint8Array(size);
        const riftDelta = historyRift instanceof Uint8Array && historyRift.length === size ? new Uint8Array(size) : null;

        let boundaryMatches = 0;
        let upliftDiffSum = 0;
        let riftDiffSum = 0;
        let provenanceMatches = 0;

        for (let i = 0; i < size; i++) {
          const legacyBoundary = plates.boundaryType[i] ?? 0;
          const nextBoundary = historyBoundary[i] ?? 0;
          const legacyUplift = plates.upliftPotential[i] ?? 0;
          const nextUplift = historyUplift[i] ?? 0;

          if (legacyBoundary === nextBoundary) boundaryMatches += 1;
          boundaryDelta[i] = legacyBoundary === nextBoundary ? 0 : 255;

          const upliftDiff = Math.abs(legacyUplift - nextUplift);
          upliftDiffSum += upliftDiff;
          upliftDelta[i] = upliftDiff > 255 ? 255 : upliftDiff;

          if (riftDelta && historyRift) {
            const legacyRift = plates.riftPotential[i] ?? 0;
            const nextRift = historyRift[i] ?? 0;
            const riftDiff = Math.abs(legacyRift - nextRift);
            riftDiffSum += riftDiff;
            riftDelta[i] = riftDiff > 255 ? 255 : riftDiff;
          }

          if (provenanceLastBoundary && provenanceLastBoundary.length === size) {
            if (legacyBoundary === (provenanceLastBoundary[i] ?? 255)) provenanceMatches += 1;
          }
        }

        const total = Math.max(1, size);
        context.trace.event(() => ({
          kind: "morphology.dualRead.summary",
          eraIndex,
          boundaryMatchFraction: boundaryMatches / total,
          upliftMeanAbsDiff: upliftDiffSum / total,
          riftMeanAbsDiff: riftDelta ? riftDiffSum / total : null,
          provenanceBoundaryMatchFraction:
            provenanceLastBoundary && provenanceLastBoundary.length === size ? provenanceMatches / total : null,
        }));

        context.viz?.dumpGrid(context.trace, {
          dataTypeKey: "morphology.dualRead.legacy.boundaryType",
          spaceId: TILE_SPACE_ID,
          dims: { width, height },
          format: "u8",
          values: plates.boundaryType,
          meta: defineVizMeta("morphology.dualRead.legacy.boundaryType", {
            label: "Legacy Boundary Type",
            group: GROUP_DUAL_READ,
            visibility: "debug",
          }),
        });
        context.viz?.dumpGrid(context.trace, {
          dataTypeKey: "morphology.dualRead.history.boundaryType",
          spaceId: TILE_SPACE_ID,
          dims: { width, height },
          format: "u8",
          values: historyBoundary,
          meta: defineVizMeta("morphology.dualRead.history.boundaryType", {
            label: "History Boundary Type (Newest Era)",
            group: GROUP_DUAL_READ,
            visibility: "debug",
          }),
        });
        context.viz?.dumpGrid(context.trace, {
          dataTypeKey: "morphology.dualRead.delta.boundaryType",
          spaceId: TILE_SPACE_ID,
          dims: { width, height },
          format: "u8",
          values: boundaryDelta,
          meta: defineVizMeta("morphology.dualRead.delta.boundaryType", {
            label: "Boundary Type Delta (Legacy vs History)",
            group: GROUP_DUAL_READ,
            visibility: "debug",
          }),
        });
        context.viz?.dumpGrid(context.trace, {
          dataTypeKey: "morphology.dualRead.legacy.upliftPotential",
          spaceId: TILE_SPACE_ID,
          dims: { width, height },
          format: "u8",
          values: plates.upliftPotential,
          meta: defineVizMeta("morphology.dualRead.legacy.upliftPotential", {
            label: "Legacy Uplift Potential",
            group: GROUP_DUAL_READ,
            visibility: "debug",
          }),
        });
        context.viz?.dumpGrid(context.trace, {
          dataTypeKey: "morphology.dualRead.history.upliftPotential",
          spaceId: TILE_SPACE_ID,
          dims: { width, height },
          format: "u8",
          values: historyUplift,
          meta: defineVizMeta("morphology.dualRead.history.upliftPotential", {
            label: "History Uplift Potential (Newest Era)",
            group: GROUP_DUAL_READ,
            visibility: "debug",
          }),
        });
        context.viz?.dumpGrid(context.trace, {
          dataTypeKey: "morphology.dualRead.delta.upliftPotential",
          spaceId: TILE_SPACE_ID,
          dims: { width, height },
          format: "u8",
          values: upliftDelta,
          meta: defineVizMeta("morphology.dualRead.delta.upliftPotential", {
            label: "Uplift Delta (Legacy vs History)",
            group: GROUP_DUAL_READ,
            visibility: "debug",
          }),
        });

        if (historyRift instanceof Uint8Array && historyRift.length === size && riftDelta) {
          context.viz?.dumpGrid(context.trace, {
            dataTypeKey: "morphology.dualRead.legacy.riftPotential",
            spaceId: TILE_SPACE_ID,
            dims: { width, height },
            format: "u8",
            values: plates.riftPotential,
            meta: defineVizMeta("morphology.dualRead.legacy.riftPotential", {
              label: "Legacy Rift Potential",
              group: GROUP_DUAL_READ,
              visibility: "debug",
            }),
          });
          context.viz?.dumpGrid(context.trace, {
            dataTypeKey: "morphology.dualRead.history.riftPotential",
            spaceId: TILE_SPACE_ID,
            dims: { width, height },
            format: "u8",
            values: historyRift,
            meta: defineVizMeta("morphology.dualRead.history.riftPotential", {
              label: "History Rift Potential (Newest Era)",
              group: GROUP_DUAL_READ,
              visibility: "debug",
            }),
          });
          context.viz?.dumpGrid(context.trace, {
            dataTypeKey: "morphology.dualRead.delta.riftPotential",
            spaceId: TILE_SPACE_ID,
            dims: { width, height },
            format: "u8",
            values: riftDelta,
            meta: defineVizMeta("morphology.dualRead.delta.riftPotential", {
              label: "Rift Delta (Legacy vs History)",
              group: GROUP_DUAL_READ,
              visibility: "debug",
            }),
          });
        }

        if (provenanceOriginEra instanceof Uint8Array && provenanceOriginEra.length === size) {
          context.viz?.dumpGrid(context.trace, {
            dataTypeKey: "morphology.dualRead.provenance.originEra",
            spaceId: TILE_SPACE_ID,
            dims: { width, height },
            format: "u8",
            values: provenanceOriginEra,
            meta: defineVizMeta("morphology.dualRead.provenance.originEra", {
              label: "Provenance Origin Era",
              group: GROUP_DUAL_READ,
              visibility: "debug",
            }),
          });
        }
        if (provenanceLastBoundary instanceof Uint8Array && provenanceLastBoundary.length === size) {
          context.viz?.dumpGrid(context.trace, {
            dataTypeKey: "morphology.dualRead.provenance.lastBoundaryType",
            spaceId: TILE_SPACE_ID,
            dims: { width, height },
            format: "u8",
            values: provenanceLastBoundary,
            meta: defineVizMeta("morphology.dualRead.provenance.lastBoundaryType", {
              label: "Provenance Last Boundary Type",
              group: GROUP_DUAL_READ,
              visibility: "debug",
            }),
          });
        }
      }
    }

    deps.artifacts.topography.publish(context, topography);
    deps.artifacts.substrate.publish(context, substrate);
  },
});
