import { deriveStepSeed } from "@swooper/mapgen-core";
import { createStep } from "@swooper/mapgen-core/authoring";
import { clampInt16 } from "@swooper/mapgen-core/lib/math";
import { defineStandardVizMeta } from "../../../../viz.js";
import { IslandsStepContract } from "./config.js";

const GROUP_ISLANDS = "Morphology / Islands";
const TILE_SPACE_ID = "tile.hexOddQ" as const;

/**
 * Plans tectonically informed island peaks, applies them to a producer-owned
 * topography copy, and publishes the canonical final Morphology topography.
 */
export const IslandsStep = createStep(IslandsStepContract, {
  run: (context, config, ops, deps) => {
    const { width, height } = context.setup.dimensions;
    const plates = deps.artifacts.foundationPlates.read(context);
    const topography = deps.artifacts.erodedTopography.read(context);
    const elevation = new Int16Array(topography.elevation);
    const landMask = new Uint8Array(topography.landMask);
    const bathymetry = new Int16Array(topography.bathymetry);
    const seaLevelValue = topography.seaLevel;
    const landElevation = clampInt16(Math.floor(seaLevelValue) + 1);
    const rngSeed = deriveStepSeed(context.setup.mapSeed, "morphology:planIslandChains");

    const plan = ops.islands(
      {
        width,
        height,
        landMask,
        boundaryCloseness: plates.boundaryCloseness,
        boundaryType: plates.boundaryType,
        volcanism: plates.volcanism,
        rngSeed,
      },
      config.islands
    );

    for (const edit of plan.edits) {
      const index = edit.index | 0;
      const y = (index / width) | 0;
      const x = index - y * width;
      if (x < 0 || x >= width || y < 0 || y >= height) continue;
      if (edit.kind === "peak") {
        landMask[index] = 1;
        if (elevation[index] <= seaLevelValue) {
          elevation[index] = landElevation;
        }
        bathymetry[index] = 0;
      }
    }

    const size = width * height;
    const editMask = new Uint8Array(size);
    for (const edit of plan.edits) {
      const index = edit.index | 0;
      if (index < 0 || index >= size) continue;
      editMask[index] = 1;
    }

    context.trace.event(() => {
      let peaks = 0;
      let inBoundsPeaks = 0;
      for (const edit of plan.edits) {
        if (edit.kind !== "peak") continue;
        peaks += 1;
        const index = edit.index | 0;
        const y = (index / width) | 0;
        const x = index - y * width;
        if (x < 0 || x >= width || y < 0 || y >= height) continue;
        inBoundsPeaks += 1;
      }
      return {
        kind: "morphology.islands.summary",
        edits: plan.edits.length,
        peaks,
        inBoundsPeaks,
      };
    });
    deps.artifacts.topography.publish(context, {
      elevation,
      seaLevel: seaLevelValue,
      landMask,
      bathymetry,
    });
    return editMask;
  },
  viz: ({ result: editMask, dimensions }) => [
    {
      kind: "grid",
      dataTypeKey: "morphology.islands.editMask",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "u8", values: editMask },
      meta: defineStandardVizMeta("morphology.islands.editMask", "category.distinct", {
        label: "Island Edits",
        group: GROUP_ISLANDS,
      }),
    },
  ],
});
