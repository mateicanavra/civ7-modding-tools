import { MORPHOLOGY_SHELF_WIDTH_MULTIPLIER } from "@mapgen/domain/morphology/model/policy/shelf-knob-policy.js";
import { defineVizMeta } from "@swooper/mapgen-core";
import { createStep } from "@swooper/mapgen-core/authoring";
import { clampFinite } from "@swooper/mapgen-core/lib/math";
import { artifactModules as morphologyArtifactModules } from "../../morphology/artifacts/index.js";
import type { MorphologyShelfWidthKnob } from "../index.js";
import ComputeShelfStepContract from "./computeShelf.contract.js";

const GROUP_SHELF = "Morphology / Shelf";
const TILE_SPACE_ID = "tile.hexOddQ" as const;

/**
 * Post-features continental-shelf stage. Reads the FINAL post-island land mask +
 * bathymetry, recomputes the coastline (so island peaks count), then runs the
 * cap-free local-gradient shelf classifier and publishes the shelf truth + post-island
 * coastline metrics + diagnostics. The carving step (morphology-coasts) owns only the
 * carved pre-island metrics that mountains consumes.
 */
export default createStep(ComputeShelfStepContract, {
  artifacts: [morphologyArtifactModules.shelf],
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
    const { width, height } = context.dimensions;
    const size = Math.max(0, (width | 0) * (height | 0));
    const beltDrivers = deps.artifacts.beltDrivers.read(context);
    const topography = deps.artifacts.topography.read(context);

    // POST-island truth: topography.landMask/bathymetry are publish-once handles that
    // morphology-features mutated in place (islands inject land + set bathymetry 0).
    const landMask = topography.landMask;
    const bathymetry = topography.bathymetry;

    // Diagnostic: the exact bathymetry/landMask the shelf classifier reads (post-erosion AND
    // post-island). Paired with the pre-erosion snapshot (morphology-coasts) it isolates how
    // much erosion vs island injection drives shelf width.
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "morphology.shelf.bathymetryInput",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "i16",
      values: bathymetry,
      meta: defineVizMeta("morphology.shelf.bathymetryInput", {
        label: "Bathymetry (Shelf Input, Post-island)",
        group: GROUP_SHELF,
        visibility: "debug",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "morphology.shelf.landMaskInput",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: landMask,
      meta: defineVizMeta("morphology.shelf.landMaskInput", {
        label: "Land Mask (Shelf Input, Post-island)",
        group: GROUP_SHELF,
        visibility: "debug",
      }),
    });

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
        config: shelfConfig
          ? {
              breakGradient: shelfConfig.breakGradient,
              breakGradientScale: shelfConfig.breakGradientScale,
              activeClosenessThreshold: shelfConfig.activeClosenessThreshold,
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
          "Diagnostic overlay for water near convergent or transform boundaries with high boundary closeness; it does not affect shelf membership.",
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
          "Diagnostic steepest-neighbor bathymetry where the local-gradient gate rejects water; 0 where no break is recorded.",
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
        label: "Shoreline Connectivity Seeds",
        group: GROUP_SHELF,
        visibility: "debug",
        description:
          "Shoreline-adjacent water tiles that seed connectivity across the gentle pre-break apron.",
        role: "membership",
        palette: "categorical",
        categories: [
          { value: 0, label: "Not A Seed", color: [0, 0, 0, 0] },
          { value: 1, label: "Shoreline Seed", color: [14, 165, 233, 230] },
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
        label: "Gentle-Gradient Admission",
        group: GROUP_SHELF,
        visibility: "debug",
        description:
          "Water admitted by the gentle local-gradient gate; shoreline seeds are admitted even when their immediate seaward gradient is steep.",
        role: "membership",
        palette: "categorical",
        categories: [
          { value: 0, label: "Rejected At Break", color: [37, 99, 235, 220] },
          { value: 1, label: "Admitted Pre-Break", color: [56, 189, 248, 230] },
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
