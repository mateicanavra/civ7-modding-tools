import { computeSampleStep, defineVizMeta, renderAsciiGrid } from "@swooper/mapgen-core";
import { createStep } from "@swooper/mapgen-core/authoring";
import { clampInt16 } from "@swooper/mapgen-core/lib/math";
import IslandsStepContract from "./islands.contract.js";
import { deriveStepSeed } from "@swooper/mapgen-core/lib/rng";

const GROUP_ISLANDS = "Morphology / Islands";
const TILE_SPACE_ID = "tile.hexOddQ" as const;

export default createStep(IslandsStepContract, {
  run: (context, config, ops, deps) => {
    const { width, height } = context.dimensions;
    const plates = deps.artifacts.foundationPlates.read(context);
    const topography = deps.artifacts.topography.read(context) as { seaLevel?: number; bathymetry?: Int16Array };
    const heightfield = context.buffers.heightfield;
    const seaLevelValue = typeof topography.seaLevel === "number" ? topography.seaLevel : 0;
    const landElevation = clampInt16(Math.floor(seaLevelValue) + 1);
    const bathymetry = topography.bathymetry;
    if (!(bathymetry instanceof Int16Array) || bathymetry.length !== heightfield.elevation.length) {
      throw new Error("Morphology topography bathymetry buffer missing or shape-mismatched.");
    }
    const rngSeed = deriveStepSeed(context.env.seed, "morphology:planIslandChains");

    const plan = ops.islands(
      {
        width,
        height,
        landMask: heightfield.landMask,
        boundaryCloseness: plates.boundaryCloseness,
        boundaryType: plates.boundaryType,
        volcanism: plates.volcanism,
        movementU: plates.movementU,
        movementV: plates.movementV,
        rngSeed,
      },
      config.islands
    );

    let appliedCoasts = 0;
    let appliedPeaks = 0;
    for (const edit of plan.edits) {
      const index = edit.index | 0;
      const y = (index / width) | 0;
      const x = index - y * width;
      if (x < 0 || x >= width || y < 0 || y >= height) continue;
      heightfield.landMask[index] = 1;
      if (heightfield.elevation[index] <= seaLevelValue) {
        heightfield.elevation[index] =
          edit.kind === "peak" ? clampInt16(landElevation + 2) : landElevation;
      }
      bathymetry[index] = 0;
      if (edit.kind === "peak") {
        appliedPeaks += 1;
      } else {
        appliedCoasts += 1;
      }
    }

    const size = Math.max(0, (width | 0) * (height | 0));
    const editMask = new Uint8Array(size);
    for (const edit of plan.edits) {
      const index = edit.index | 0;
      if (index < 0 || index >= size) continue;
      editMask[index] = edit.kind === "peak" ? 2 : 1;
    }

    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "morphology.islands.editMask",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: editMask,
      meta: defineVizMeta("morphology.islands.editMask", {
        label: "Island Edits",
        group: GROUP_ISLANDS,
        palette: "categorical",
      }),
    });

    context.trace.event(() => {
      let coasts = 0;
      let peaks = 0;
      let inBoundsCoasts = 0;
      let inBoundsPeaks = 0;
      for (const edit of plan.edits) {
        if (edit.kind === "peak") peaks += 1;
        else coasts += 1;
        const index = edit.index | 0;
        const y = (index / width) | 0;
        const x = index - y * width;
        if (x < 0 || x >= width || y < 0 || y >= height) continue;
        if (edit.kind === "peak") inBoundsPeaks += 1;
        else inBoundsCoasts += 1;
      }
      return {
        kind: "morphology.islands.summary",
        edits: plan.edits.length,
        coasts,
        peaks,
        inBoundsCoasts,
        inBoundsPeaks,
        appliedCoasts,
        appliedPeaks,
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
          const overlay = editMask[idx] === 2 ? "^" : editMask[idx] === 1 ? "i" : undefined;
          return { base, overlay };
        },
      });
      return {
        kind: "morphology.islands.ascii.edits",
        sampleStep,
        legend: ".=land ~=water i=coast-island ^=peak-island",
        rows,
      };
    });
  },
});
