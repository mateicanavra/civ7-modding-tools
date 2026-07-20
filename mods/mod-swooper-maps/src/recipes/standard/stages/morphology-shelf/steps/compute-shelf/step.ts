import { MORPHOLOGY_SHELF_WIDTH_MULTIPLIER } from "@mapgen/domain/morphology/model/policy/shelf-knob-policy.js";
import { createStep } from "@swooper/mapgen-core/authoring";
import { clampFinite } from "@swooper/mapgen-core/lib/math";
import {
  defineStandardVizCategoryMeta,
  defineStandardVizMeta,
  STANDARD_VIZ_COLORS,
} from "../../../../viz.js";
import type { MorphologyShelfWidthKnob } from "../../index.js";
import { ComputeShelfStepContract } from "./config.js";

const GROUP_SHELF = "Morphology / Shelf";
const TILE_SPACE_ID = "tile.hexOddQ" as const;

/**
 * Post-features continental-shelf stage. Reads the FINAL post-island land mask +
 * bathymetry, recomputes the coastline (so island peaks count), then runs the
 * cap-free local-gradient shelf classifier and publishes the shelf truth + post-island
 * coastline metrics + diagnostics. The carving step (morphology-coasts) owns only the
 * carved pre-island metrics that mountains consumes.
 */
export const ComputeShelfStep = createStep(ComputeShelfStepContract, {
  normalize: (config, ctx) => {
    const { shelfWidth } = ctx.knobs as Readonly<{ shelfWidth?: MorphologyShelfWidthKnob }>;
    const shelfMultiplier = MORPHOLOGY_SHELF_WIDTH_MULTIPLIER[shelfWidth ?? "normal"] ?? 1.0;

    const shelfMaskSelection =
      config.shelfMask.strategy === "default"
        ? {
            ...config.shelfMask,
            config: {
              ...config.shelfMask.config,
              // The shelfWidth knob drives the cap-free break-GRADIENT scale: narrow (<1) =>
              // stricter gradient => the gentle apron yields to the slope sooner => narrower
              // shelf; wide (>1) => more permissive => wider. No caps; reads the sculpted break.
              breakGradientScale: clampFinite(
                config.shelfMask.config.breakGradientScale * shelfMultiplier,
                0
              ),
            },
          }
        : config.shelfMask;

    return { ...config, shelfMask: shelfMaskSelection };
  },
  run: (context, config, ops, deps) => {
    const { width, height } = context.setup.dimensions;
    const size = width * height;
    const beltDrivers = deps.artifacts.beltDrivers.read(context);
    const topography = deps.artifacts.topography.read(context);

    // Final topography includes island injection and is immutable after publication.
    const landMask = topography.landMask;
    const bathymetry = topography.bathymetry;

    // 1) Post-island shoreline adjacency (island peaks now count).
    const { coastalLand, coastalWater } = ops.coastalAdjacency(
      { width, height, landMask },
      config.coastalAdjacency
    );

    // 2) Post-island distance to coast for the published coastline diagnostic. Shelf
    //    membership is determined only by local gradient and shoreline connectivity.
    const coastal = new Uint8Array(size);
    for (let i = 0; i < size; i++) {
      coastal[i] = coastalLand[i] === 1 || coastalWater[i] === 1 ? 1 : 0;
    }
    const { distanceToCoast } = ops.distanceToCoast(
      { width, height, coastal },
      config.distanceToCoast
    );

    // 3) Cap-free local-gradient shelf over post-island geography. Boundary posture is
    //    supplied only for the active-margin diagnostic overlay.
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
        ...(shelfConfig
          ? {
              config: {
                breakGradient: shelfConfig.breakGradient,
                breakGradientScale: shelfConfig.breakGradientScale,
                activeClosenessThreshold: shelfConfig.activeClosenessThreshold,
              },
            }
          : {}),
      };
    });

    const shelf = {
      shelfMask,
      coastalLand,
      coastalWater,
      distanceToCoast,
      activeMarginMask,
      depthGateMask,
      nearshoreCandidateMask,
      shelfBreakDepthByTile,
      shallowCutoff,
    };
    deps.artifacts.shelf.publish(context, shelf);
    return { bathymetry, landMask, shelf };
  },
  viz: ({ result: { bathymetry, landMask, shelf }, dimensions }) => [
    {
      kind: "grid",
      dataTypeKey: "morphology.shelf.bathymetryInput",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "i16", values: bathymetry },
      meta: defineStandardVizMeta("morphology.shelf.bathymetryInput", "water.depth", {
        label: "Bathymetry (Shelf Input, Post-island)",
        group: GROUP_SHELF,
        visibility: "debug",
      }),
    },
    {
      kind: "grid",
      dataTypeKey: "morphology.shelf.landMaskInput",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "u8", values: landMask },
      meta: defineStandardVizMeta("morphology.shelf.landMaskInput", "category.distinct", {
        label: "Land Mask (Shelf Input, Post-island)",
        group: GROUP_SHELF,
        visibility: "debug",
      }),
    },
    {
      kind: "grid",
      dataTypeKey: "morphology.shelf.shelfMask",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "u8", values: shelf.shelfMask },
      meta: defineStandardVizCategoryMeta(
        "morphology.shelf.shelfMask",
        [
          { value: 0, label: "Deep Water", color: STANDARD_VIZ_COLORS.water.ocean },
          { value: 1, label: "Shelf Water", color: STANDARD_VIZ_COLORS.water.coast },
        ],
        {
          label: "Shelf Mask",
          group: GROUP_SHELF,
          description:
            "Post-island continental-shelf water mask used to project TERRAIN_COAST beyond the shoreline ring.",
          role: "membership",
        }
      ),
    },
    {
      kind: "grid",
      dataTypeKey: "morphology.shelf.coastalWater",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "u8", values: shelf.coastalWater },
      meta: defineStandardVizMeta("morphology.shelf.coastalWater", "category.distinct", {
        label: "Coastal Water (Post-island)",
        group: GROUP_SHELF,
        visibility: "debug",
      }),
    },
    {
      kind: "grid",
      dataTypeKey: "morphology.shelf.distanceToCoast",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "u16", values: shelf.distanceToCoast },
      meta: defineStandardVizMeta("morphology.shelf.distanceToCoast", "field.intensity", {
        label: "Distance To Coast (Post-island)",
        group: GROUP_SHELF,
        visibility: "debug",
      }),
    },
    {
      kind: "grid",
      dataTypeKey: "morphology.shelf.activeMarginMask",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "u8", values: shelf.activeMarginMask },
      meta: defineStandardVizCategoryMeta(
        "morphology.shelf.activeMarginMask",
        [
          { value: 0, label: "Passive/Other", color: [37, 99, 235, 80] },
          { value: 1, label: "Active Margin", color: [220, 38, 38, 230] },
        ],
        {
          label: "Active Margin Mask",
          group: GROUP_SHELF,
          description:
            "Diagnostic overlay for water near convergent or transform boundaries with high boundary closeness; it does not affect shelf membership.",
          role: "membership",
        }
      ),
    },
    {
      kind: "grid",
      dataTypeKey: "morphology.shelf.breakDepth",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "i16", values: shelf.shelfBreakDepthByTile },
      meta: defineStandardVizMeta("morphology.shelf.breakDepth", "water.depth", {
        label: "Shelf Break Depth",
        group: GROUP_SHELF,
        description:
          "Diagnostic steepest-neighbor bathymetry where the local-gradient gate rejects water; 0 where no break is recorded.",
        role: "scalar",
      }),
    },
    {
      kind: "grid",
      dataTypeKey: "morphology.shelf.nearshoreCandidateMask",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "u8", values: shelf.nearshoreCandidateMask },
      meta: defineStandardVizCategoryMeta(
        "morphology.shelf.nearshoreCandidateMask",
        [
          { value: 0, label: "Not A Seed", color: STANDARD_VIZ_COLORS.absent },
          { value: 1, label: "Shoreline Seed", color: STANDARD_VIZ_COLORS.water.coast },
        ],
        {
          label: "Shoreline Connectivity Seeds",
          group: GROUP_SHELF,
          visibility: "debug",
          description:
            "Shoreline-adjacent water tiles that seed connectivity across the gentle pre-break apron.",
          role: "membership",
        }
      ),
    },
    {
      kind: "grid",
      dataTypeKey: "morphology.shelf.depthGateMask",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "u8", values: shelf.depthGateMask },
      meta: defineStandardVizCategoryMeta(
        "morphology.shelf.depthGateMask",
        [
          { value: 0, label: "Rejected At Break", color: STANDARD_VIZ_COLORS.water.ocean },
          { value: 1, label: "Admitted Pre-Break", color: STANDARD_VIZ_COLORS.water.coast },
        ],
        {
          label: "Gentle-Gradient Admission",
          group: GROUP_SHELF,
          visibility: "debug",
          description:
            "Water admitted by the gentle local-gradient gate; shoreline seeds are admitted even when their immediate seaward gradient is steep.",
          role: "membership",
        }
      ),
    },
  ],
});
