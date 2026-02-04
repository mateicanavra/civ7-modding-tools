import type { MapDimensions } from "@civ7/adapter";
import { computeSampleStep, defineVizMeta, renderAsciiGrid } from "@swooper/mapgen-core";
import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";
import RuggedCoastsStepContract from "./ruggedCoasts.contract.js";
import { deriveStepSeed } from "@swooper/mapgen-core/lib/rng";
import { forEachHexNeighborOddQ } from "@swooper/mapgen-core/lib/grid";
import { clampFinite, clampInt16, roundHalfAwayFromZero } from "@swooper/mapgen-core/lib/math";
import {
  MORPHOLOGY_COAST_RUGGEDNESS_MULTIPLIER,
  MORPHOLOGY_SHELF_WIDTH_MULTIPLIER,
} from "@mapgen/domain/morphology/shared/knob-multipliers.js";
import type {
  MorphologyCoastRuggednessKnob,
  MorphologyShelfWidthKnob,
} from "@mapgen/domain/morphology/shared/knobs.js";

type ArtifactValidationIssue = Readonly<{ message: string }>;

const GROUP_COASTLINES = "Morphology / Coastlines";
const GROUP_SHELF = "Morphology / Shelf";
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

function validateCoastlineMetrics(value: unknown, dimensions: MapDimensions): ArtifactValidationIssue[] {
  const errors: ArtifactValidationIssue[] = [];
  if (!isRecord(value)) {
    errors.push({ message: "Missing coastline metrics." });
    return errors;
  }
  const size = expectedSize(dimensions);
  const candidate = value as {
    coastalLand?: unknown;
    coastalWater?: unknown;
    shelfMask?: unknown;
    distanceToCoast?: unknown;
  };
  validateTypedArray(errors, "coastlineMetrics.coastalLand", candidate.coastalLand, Uint8Array, size);
  validateTypedArray(errors, "coastlineMetrics.coastalWater", candidate.coastalWater, Uint8Array, size);
  validateTypedArray(errors, "coastlineMetrics.shelfMask", candidate.shelfMask, Uint8Array, size);
  validateTypedArray(errors, "coastlineMetrics.distanceToCoast", candidate.distanceToCoast, Uint16Array, size);
  return errors;
}

function computeDistanceToCoast(width: number, height: number, coastal: Uint8Array): Uint16Array {
  const size = Math.max(0, (width | 0) * (height | 0));
  const distance = new Uint16Array(size);
  distance.fill(65535);

  const queue = new Int32Array(size);
  let head = 0;
  let tail = 0;

  for (let i = 0; i < size; i++) {
    if ((coastal[i] | 0) !== 1) continue;
    distance[i] = 0;
    queue[tail++] = i;
  }

  while (head < tail) {
    const idx = queue[head++]!;
    const y = (idx / width) | 0;
    const x = idx - y * width;
    const dist = distance[idx] ?? 0;

    forEachHexNeighborOddQ(x, y, width, height, (nx, ny) => {
      const ni = ny * width + nx;
      const next = (dist + 1) as number;
      if (distance[ni] <= next) return;
      distance[ni] = next;
      queue[tail++] = ni;
    });
  }

  return distance;
}

export default createStep(RuggedCoastsStepContract, {
  artifacts: implementArtifacts(RuggedCoastsStepContract.artifacts!.provides!, {
    coastlineMetrics: {
      validate: (value, context) => validateCoastlineMetrics(value, context.dimensions),
    },
  }),
  normalize: (config, ctx) => {
    const { coastRuggedness, shelfWidth } = ctx.knobs as Readonly<{
      coastRuggedness?: MorphologyCoastRuggednessKnob;
      shelfWidth?: MorphologyShelfWidthKnob;
    }>;
    const multiplier = MORPHOLOGY_COAST_RUGGEDNESS_MULTIPLIER[coastRuggedness ?? "normal"] ?? 1.0;
    const shelfMultiplier = MORPHOLOGY_SHELF_WIDTH_MULTIPLIER[shelfWidth ?? "normal"] ?? 1.0;

    const coastlinesSelection =
      config.coastlines.strategy === "default"
        ? {
            ...config.coastlines,
            config: {
              ...config.coastlines.config,
              coast: {
                ...config.coastlines.config.coast,
                plateBias: {
                  ...config.coastlines.config.coast.plateBias,
                  bayWeight: clampFinite(config.coastlines.config.coast.plateBias.bayWeight * multiplier, 0),
                  bayNoiseBonus: clampFinite(config.coastlines.config.coast.plateBias.bayNoiseBonus * multiplier, 0),
                  fjordWeight: clampFinite(config.coastlines.config.coast.plateBias.fjordWeight * multiplier, 0),
                },
              },
            },
          }
        : config.coastlines;

    const shelfMaskSelection =
      config.shelfMask.strategy === "default"
        ? {
            ...config.shelfMask,
            config: {
              ...config.shelfMask.config,
              capTilesActive: Math.max(
                0,
                Math.min(
                  config.shelfMask.config.capTilesMax,
                  Math.round(config.shelfMask.config.capTilesActive * shelfMultiplier)
                )
              ),
              capTilesPassive: Math.max(
                0,
                Math.min(
                  config.shelfMask.config.capTilesMax,
                  Math.round(config.shelfMask.config.capTilesPassive * shelfMultiplier)
                )
              ),
            },
          }
        : config.shelfMask;

    return { ...config, coastlines: coastlinesSelection, shelfMask: shelfMaskSelection };
  },
  run: (context, config, ops, deps) => {
    const { width, height } = context.dimensions;
    const plates = deps.artifacts.foundationPlates.read(context);
    const topography = deps.artifacts.topography.read(context) as { seaLevel?: number; bathymetry?: Int16Array };
    const heightfield = context.buffers.heightfield;
    const rngSeed = deriveStepSeed(context.env.seed, "morphology:computeCoastlineMetrics");

    const result = ops.coastlines(
      {
        width,
        height,
        landMask: heightfield.landMask,
        boundaryCloseness: plates.boundaryCloseness,
        boundaryType: plates.boundaryType,
        rngSeed,
      },
      config.coastlines
    );

    const updatedLandMask = result.landMask;
    const coastMask = result.coastMask;

    const seaLevelValue = typeof topography.seaLevel === "number" ? topography.seaLevel : 0;
    const bathymetry = topography.bathymetry;
    if (!(bathymetry instanceof Int16Array) || bathymetry.length !== heightfield.elevation.length) {
      throw new Error("Morphology topography bathymetry buffer missing or shape-mismatched.");
    }

    const waterElevation = clampInt16(Math.floor(seaLevelValue));
    const landElevation = clampInt16(Math.floor(seaLevelValue) + 1);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = y * width + x;
        const desiredLand = coastMask[i] === 1 ? 0 : updatedLandMask[i] === 1 ? 1 : 0;
        if (coastMask[i] === 1) {
          heightfield.landMask[i] = 0;
        } else {
          heightfield.landMask[i] = updatedLandMask[i] === 1 ? 1 : 0;
        }

        const elevation = heightfield.elevation[i] ?? 0;
        if (desiredLand === 1) {
          if (elevation <= seaLevelValue) heightfield.elevation[i] = landElevation;
          bathymetry[i] = 0;
        } else {
          if (elevation > seaLevelValue) heightfield.elevation[i] = waterElevation;
          const delta = Math.min(0, (heightfield.elevation[i] ?? 0) - seaLevelValue);
          bathymetry[i] = clampInt16(roundHalfAwayFromZero(delta));
        }
      }
    }

    context.trace.event(() => {
      const size = Math.max(0, (width | 0) * (height | 0));
      let coastTiles = 0;
      let landTiles = 0;
      for (let i = 0; i < size; i++) {
        if (coastMask[i] === 1) coastTiles += 1;
        if (heightfield.landMask[i] === 1) landTiles += 1;
      }
      return {
        kind: "morphology.coastlines.summary",
        coastTiles,
        landTiles,
        waterTiles: Math.max(0, size - landTiles),
      };
    });
    context.trace.event(() => {
      const sampleStep = computeSampleStep(width, height);
      const rows = renderAsciiGrid({
        width,
        height,
        sampleStep,
        cellFn: (x, y) => {
          const idx = y * width + x;
          const base = heightfield.landMask[idx] === 1 ? "." : "~";
          const overlay = coastMask[idx] === 1 ? "," : undefined;
          return { base, overlay };
        },
      });
      return {
        kind: "morphology.coastlines.ascii.coastMask",
        sampleStep,
        legend: ".=land ~=water ,=coast",
        rows,
      };
    });

    const coastal = new Uint8Array(Math.max(0, (width | 0) * (height | 0)));
    for (let i = 0; i < coastal.length; i++) {
      coastal[i] = result.coastalLand[i] === 1 || result.coastalWater[i] === 1 ? 1 : 0;
    }
    const distanceToCoast = computeDistanceToCoast(width, height, coastal);

    const shelfResult = ops.shelfMask(
      {
        width,
        height,
        landMask: heightfield.landMask,
        bathymetry,
        distanceToCoast,
        boundaryCloseness: plates.boundaryCloseness,
        boundaryType: plates.boundaryType,
      },
      config.shelfMask
    );
    const {
      shelfMask,
      activeMarginMask,
      capTilesByTile,
      nearshoreCandidateMask,
      depthGateMask,
      shallowCutoff,
    } = shelfResult as unknown as {
      shelfMask: unknown;
      activeMarginMask: unknown;
      capTilesByTile: unknown;
      nearshoreCandidateMask: unknown;
      depthGateMask: unknown;
      shallowCutoff: unknown;
    };
    if (!(shelfMask instanceof Uint8Array) || shelfMask.length !== coastal.length) {
      throw new Error("Computed shelfMask missing or shape-mismatched.");
    }
    if (!(activeMarginMask instanceof Uint8Array) || activeMarginMask.length !== coastal.length) {
      throw new Error("Computed activeMarginMask missing or shape-mismatched.");
    }
    if (!(capTilesByTile instanceof Uint8Array) || capTilesByTile.length !== coastal.length) {
      throw new Error("Computed capTilesByTile missing or shape-mismatched.");
    }
    if (!(nearshoreCandidateMask instanceof Uint8Array) || nearshoreCandidateMask.length !== coastal.length) {
      throw new Error("Computed nearshoreCandidateMask missing or shape-mismatched.");
    }
    if (!(depthGateMask instanceof Uint8Array) || depthGateMask.length !== coastal.length) {
      throw new Error("Computed depthGateMask missing or shape-mismatched.");
    }
    if (!Number.isFinite(shallowCutoff) || (shallowCutoff as number) > 0) {
      throw new Error("Computed shallowCutoff missing or invalid (expected finite number <= 0).");
    }

    context.trace.event(() => {
      const size = Math.max(0, (width | 0) * (height | 0));
      let activeMarginTiles = 0;
      let nearshoreCandidates = 0;
      let depthGatedTiles = 0;
      let shelfTiles = 0;
      let shelfTilesBeyondShore = 0;
      let activeShelfTiles = 0;
      let passiveShelfTiles = 0;
      let maxCapTiles = 0;

      for (let i = 0; i < size; i++) {
        if ((activeMarginMask[i] | 0) === 1) activeMarginTiles += 1;
        if ((nearshoreCandidateMask[i] | 0) === 1) nearshoreCandidates += 1;
        if ((depthGateMask[i] | 0) === 1) depthGatedTiles += 1;

        const cap = capTilesByTile[i] | 0;
        if (cap > maxCapTiles) maxCapTiles = cap;

        if ((shelfMask[i] | 0) !== 1) continue;
        shelfTiles += 1;
        if ((activeMarginMask[i] | 0) === 1) activeShelfTiles += 1;
        else passiveShelfTiles += 1;

        const dist = distanceToCoast[i] | 0;
        if ((result.coastalWater[i] | 0) === 0 && dist >= 2) shelfTilesBeyondShore += 1;
      }

      const selection = config.shelfMask;
      const shelfConfig = selection.strategy === "default" ? (selection.config as any) : undefined;
      return {
        kind: "morphology.shelf.summary",
        shallowCutoff: shallowCutoff as number,
        nearshoreCandidates,
        depthGatedTiles,
        shelfTiles,
        shelfTilesBeyondShore,
        activeMarginTiles,
        activeShelfTiles,
        passiveShelfTiles,
        maxCapTiles,
        strategy: selection.strategy,
        config: shelfConfig
          ? {
              nearshoreDistance: shelfConfig.nearshoreDistance,
              shallowQuantile: shelfConfig.shallowQuantile,
              activeClosenessThreshold: shelfConfig.activeClosenessThreshold,
              capTilesActive: shelfConfig.capTilesActive,
              capTilesPassive: shelfConfig.capTilesPassive,
              capTilesMax: shelfConfig.capTilesMax,
            }
          : undefined,
      };
    });

    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "morphology.coastlineMetrics.coastalLand",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: result.coastalLand,
      meta: defineVizMeta("morphology.coastlineMetrics.coastalLand", {
        label: "Coastal Land",
        group: GROUP_COASTLINES,
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "morphology.coastlineMetrics.coastalWater",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: result.coastalWater,
      meta: defineVizMeta("morphology.coastlineMetrics.coastalWater", {
        label: "Coastal Water",
        group: GROUP_COASTLINES,
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "morphology.coastlineMetrics.shelfMask",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: shelfMask,
      meta: defineVizMeta("morphology.coastlineMetrics.shelfMask", {
        label: "Shelf Mask",
        group: GROUP_SHELF,
        description:
          "Deterministic shallow-shelf water mask used to project TERRAIN_COAST beyond the guaranteed shoreline ring.",
        role: "membership",
        palette: "categorical",
        categories: [
          { value: 0, label: "Deep Water", color: [37, 99, 235, 220] },
          { value: 1, label: "Shelf Water", color: [56, 189, 248, 230] },
        ],
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "morphology.coastlineMetrics.distanceToCoast",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u16",
      values: distanceToCoast,
      meta: defineVizMeta("morphology.coastlineMetrics.distanceToCoast", {
        label: "Distance To Coast (Tiles)",
        group: GROUP_SHELF,
        visibility: "debug",
      }),
    });

    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "morphology.shelf.activeMarginMask",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: activeMarginMask,
      meta: defineVizMeta("morphology.shelf.activeMarginMask", {
        label: "Active Margin Mask",
        group: GROUP_SHELF,
        description: "Tiles treated as active margins (convergent/transform with high boundary closeness).",
        role: "membership",
        palette: "categorical",
        categories: [
          { value: 0, label: "Passive/Other", color: [37, 99, 235, 80] },
          { value: 1, label: "Active Margin", color: [220, 38, 38, 230] },
        ],
      }),
    });

    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "morphology.shelf.capTiles",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: capTilesByTile,
      meta: defineVizMeta("morphology.shelf.capTiles", {
        label: "Shelf Distance Cap (Tiles)",
        group: GROUP_SHELF,
        description: "Per-tile max distance to coast used by the shelf classifier (active margins narrower).",
        role: "membership",
        palette: "continuous",
      }),
    });

    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "morphology.shelf.nearshoreCandidateMask",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: nearshoreCandidateMask,
      meta: defineVizMeta("morphology.shelf.nearshoreCandidateMask", {
        label: "Nearshore Candidates",
        group: GROUP_SHELF,
        visibility: "debug",
        description: "Water tiles within nearshoreDistance, used to sample bathymetry for shallowCutoff.",
        role: "membership",
        palette: "categorical",
        categories: [
          { value: 0, label: "Not Sampled", color: [0, 0, 0, 0] },
          { value: 1, label: "Sampled", color: [14, 165, 233, 230] },
        ],
      }),
    });

    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "morphology.shelf.depthGateMask",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: depthGateMask,
      meta: defineVizMeta("morphology.shelf.depthGateMask", {
        label: "Depth Gate (Shallow Enough)",
        group: GROUP_SHELF,
        visibility: "debug",
        description: "Water tiles where bathymetry >= shallowCutoff (shallower than the selected cutoff).",
        role: "membership",
        palette: "categorical",
        categories: [
          { value: 0, label: "Too Deep", color: [37, 99, 235, 220] },
          { value: 1, label: "Shallow Enough", color: [56, 189, 248, 230] },
        ],
      }),
    });

    deps.artifacts.coastlineMetrics.publish(context, {
      coastalLand: result.coastalLand,
      coastalWater: result.coastalWater,
      shelfMask,
      distanceToCoast,
    });
  },
});
