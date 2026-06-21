import type { MapDimensions } from "@civ7/adapter";
import type { MorphologyShelfWidthKnob } from "@mapgen/domain/morphology/config.js";
import { MORPHOLOGY_SHELF_WIDTH_MULTIPLIER } from "@mapgen/domain/morphology/config.js";
import { defineVizMeta } from "@swooper/mapgen-core";
import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";
import { clampFinite } from "@swooper/mapgen-core/lib/math";
import ComputeShelfStepContract from "./computeShelf.contract.js";

type ArtifactValidationIssue = Readonly<{ message: string }>;

const GROUP_SHELF = "Morphology / Shelf";
const TILE_SPACE_ID = "tile.hexOddQ" as const;

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
  expectedLength: number
): void {
  if (!(value instanceof ctor)) {
    errors.push({ message: `Expected ${label} to be ${ctor.name}.` });
    return;
  }
  if (value.length !== expectedLength) {
    errors.push({
      message: `Expected ${label} length ${expectedLength} (received ${value.length}).`,
    });
  }
}

function validateShelf(value: unknown, dimensions: MapDimensions): ArtifactValidationIssue[] {
  const errors: ArtifactValidationIssue[] = [];
  if (!isRecord(value)) {
    errors.push({ message: "Missing shelf artifact." });
    return errors;
  }
  const size = expectedSize(dimensions);
  const c = value as Record<string, unknown>;
  validateTypedArray(errors, "shelf.shelfMask", c.shelfMask, Uint8Array, size);
  validateTypedArray(errors, "shelf.coastalLand", c.coastalLand, Uint8Array, size);
  validateTypedArray(errors, "shelf.coastalWater", c.coastalWater, Uint8Array, size);
  validateTypedArray(errors, "shelf.distanceToCoast", c.distanceToCoast, Uint16Array, size);
  validateTypedArray(errors, "shelf.activeMarginMask", c.activeMarginMask, Uint8Array, size);
  validateTypedArray(errors, "shelf.depthGateMask", c.depthGateMask, Uint8Array, size);
  validateTypedArray(
    errors,
    "shelf.nearshoreCandidateMask",
    c.nearshoreCandidateMask,
    Uint8Array,
    size
  );
  validateTypedArray(
    errors,
    "shelf.shelfBreakDepthByTile",
    c.shelfBreakDepthByTile,
    Int16Array,
    size
  );
  if (!Number.isFinite(c.shallowCutoff) || (c.shallowCutoff as number) > 0) {
    errors.push({ message: "shelf.shallowCutoff must be a finite number <= 0." });
  }
  return errors;
}

/**
 * Post-features continental-shelf stage. Reads the FINAL post-island land mask +
 * bathymetry, recomputes the coastline (so island peaks count), then runs the
 * cap-free margin-aware shelf classifier and publishes the shelf truth + post-island
 * coastline metrics + diagnostics. The carving step (morphology-coasts) owns only the
 * carved pre-island metrics that mountains consumes.
 */
export default createStep(ComputeShelfStepContract, {
  artifacts: implementArtifacts(ComputeShelfStepContract.artifacts!.provides!, {
    shelf: {
      validate: (value, context) => validateShelf(value, context.dimensions),
    },
  }),
  normalize: (config, ctx) => {
    const { shelfWidth } = ctx.knobs as Readonly<{ shelfWidth?: MorphologyShelfWidthKnob }>;
    const shelfMultiplier = MORPHOLOGY_SHELF_WIDTH_MULTIPLIER[shelfWidth ?? "normal"] ?? 1.0;

    const shelfMaskSelection =
      config.shelfMask.strategy === "default"
        ? {
            ...config.shelfMask,
            config: {
              ...config.shelfMask.config,
              // The shelfWidth knob drives the cap-free break-depth scale: narrow (<1) =>
              // shallower break => narrower shelf; wide (>1) => deeper => wider. No caps.
              breakDepthScale: clampFinite(
                config.shelfMask.config.breakDepthScale * shelfMultiplier,
                0
              ),
            },
          }
        : config.shelfMask;

    return { ...config, shelfMask: shelfMaskSelection };
  },
  run: (context, config, ops, deps) => {
    const { width, height } = context.dimensions;
    const size = Math.max(0, (width | 0) * (height | 0));
    const beltDrivers = deps.artifacts.beltDrivers.read(context);
    const topography = deps.artifacts.topography.read(context);

    // POST-island truth: topography.landMask/bathymetry are publish-once handles that
    // morphology-features mutated in place (islands inject land + set bathymetry 0).
    const landMask = topography.landMask;
    const bathymetry = topography.bathymetry;

    // 1) Post-island shoreline adjacency (island peaks now count).
    const { coastalLand, coastalWater } = ops.coastalAdjacency(
      { width, height, landMask },
      config.coastalAdjacency
    );

    // 2) Post-island distance to coast (windows the shelf-break sample).
    const coastal = new Uint8Array(size);
    for (let i = 0; i < size; i++) {
      coastal[i] = coastalLand[i] === 1 || coastalWater[i] === 1 ? 1 : 0;
    }
    const { distanceToCoast } = ops.distanceToCoast(
      { width, height, coastal },
      config.distanceToCoast
    );

    // 3) Cap-free margin-aware shelf over post-island geography.
    const shelfResult = ops.shelfMask(
      {
        width,
        height,
        landMask,
        bathymetry,
        distanceToCoast,
        boundaryCloseness: beltDrivers.boundaryCloseness,
        boundaryType: beltDrivers.boundaryType,
      },
      config.shelfMask
    );
    const {
      shelfMask,
      activeMarginMask,
      shelfBreakDepthByTile,
      nearshoreCandidateMask,
      depthGateMask,
      shallowCutoff,
    } = shelfResult as unknown as {
      shelfMask: Uint8Array;
      activeMarginMask: Uint8Array;
      shelfBreakDepthByTile: Int16Array;
      nearshoreCandidateMask: Uint8Array;
      depthGateMask: Uint8Array;
      shallowCutoff: number;
    };

    context.trace.event(() => {
      let activeMarginTiles = 0;
      let nearshoreCandidates = 0;
      let depthGatedTiles = 0;
      let shelfTiles = 0;
      let shelfTilesBeyondShore = 0;
      let activeShelfTiles = 0;
      let passiveShelfTiles = 0;
      let deepestShelfBreak = 0;

      for (let i = 0; i < size; i++) {
        if ((activeMarginMask[i] | 0) === 1) activeMarginTiles += 1;
        if ((nearshoreCandidateMask[i] | 0) === 1) nearshoreCandidates += 1;
        if ((depthGateMask[i] | 0) === 1) depthGatedTiles += 1;

        const breakDepth = shelfBreakDepthByTile[i] | 0;
        if (breakDepth < deepestShelfBreak) deepestShelfBreak = breakDepth;

        if ((shelfMask[i] | 0) !== 1) continue;
        shelfTiles += 1;
        if ((activeMarginMask[i] | 0) === 1) activeShelfTiles += 1;
        else passiveShelfTiles += 1;

        const dist = distanceToCoast[i] | 0;
        if ((coastalWater[i] | 0) === 0 && dist >= 2) shelfTilesBeyondShore += 1;
      }

      const selection = config.shelfMask;
      const shelfConfig = selection.strategy === "default" ? (selection.config as any) : undefined;
      return {
        kind: "morphology.shelf.summary",
        shallowCutoff,
        deepestShelfBreak,
        nearshoreCandidates,
        depthGatedTiles,
        shelfTiles,
        shelfTilesBeyondShore,
        activeMarginTiles,
        activeShelfTiles,
        passiveShelfTiles,
        strategy: selection.strategy,
        config: shelfConfig
          ? {
              shallowQuantile: shelfConfig.shallowQuantile,
              breakDepthSampleRadius: shelfConfig.breakDepthSampleRadius,
              activeClosenessThreshold: shelfConfig.activeClosenessThreshold,
              activeBreakDepthFactor: shelfConfig.activeBreakDepthFactor,
              passiveBreakDepthFactor: shelfConfig.passiveBreakDepthFactor,
              absoluteMaxShelfDepth: shelfConfig.absoluteMaxShelfDepth,
              breakDepthScale: shelfConfig.breakDepthScale,
            }
          : undefined,
      };
    });

    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "morphology.shelf.shelfMask",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: shelfMask,
      meta: defineVizMeta("morphology.shelf.shelfMask", {
        label: "Shelf Mask",
        group: GROUP_SHELF,
        description:
          "Post-island continental-shelf water mask used to project TERRAIN_COAST beyond the shoreline ring.",
        role: "membership",
        palette: "categorical",
        categories: [
          { value: 0, label: "Deep Water", color: [37, 99, 235, 220] },
          { value: 1, label: "Shelf Water", color: [56, 189, 248, 230] },
        ],
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "morphology.shelf.coastalWater",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: coastalWater,
      meta: defineVizMeta("morphology.shelf.coastalWater", {
        label: "Coastal Water (Post-island)",
        group: GROUP_SHELF,
        visibility: "debug",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "morphology.shelf.distanceToCoast",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u16",
      values: distanceToCoast,
      meta: defineVizMeta("morphology.shelf.distanceToCoast", {
        label: "Distance To Coast (Post-island)",
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
        description:
          "Tiles treated as active margins (convergent/transform with high boundary closeness).",
        role: "membership",
        palette: "categorical",
        categories: [
          { value: 0, label: "Passive/Other", color: [37, 99, 235, 80] },
          { value: 1, label: "Active Margin", color: [220, 38, 38, 230] },
        ],
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "morphology.shelf.breakDepth",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "i16",
      values: shelfBreakDepthByTile,
      meta: defineVizMeta("morphology.shelf.breakDepth", {
        label: "Shelf Break Depth",
        group: GROUP_SHELF,
        description:
          "Per-tile, margin-modulated shelf-break depth (engine elevation units, <=0). Active margins shallower (narrower shelf); passive deeper (wider).",
        role: "scalar",
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
        description:
          "Water tiles within breakDepthSampleRadius, used to sample bathymetry for the shelf-break cutoff.",
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
        description: "Water tiles where bathymetry >= the per-tile shelf-break depth.",
        role: "membership",
        palette: "categorical",
        categories: [
          { value: 0, label: "Too Deep", color: [37, 99, 235, 220] },
          { value: 1, label: "Shallow Enough", color: [56, 189, 248, 230] },
        ],
      }),
    });

    deps.artifacts.shelf.publish(context, {
      shelfMask,
      coastalLand,
      coastalWater,
      distanceToCoast,
      activeMarginMask,
      depthGateMask,
      nearshoreCandidateMask,
      shelfBreakDepthByTile,
      shallowCutoff,
    });
  },
});
