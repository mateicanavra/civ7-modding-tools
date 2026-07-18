import { createStep } from "@swooper/mapgen-core/authoring";
import { defineStandardVizMeta } from "../../../../viz.js";
import { LandmassesStepContract } from "./config.js";

const GROUP_LANDMASSES = "Morphology / Landmasses";
const TILE_SPACE_ID = "tile.hexOddQ" as const;

/**
 * Decomposes the final post-feature landmask into stable landmass identities
 * and bounds used later by region projection and placement fairness.
 */
export const LandmassesStep = createStep(LandmassesStepContract, {
  run: (context, config, ops, deps) => {
    const topography = deps.artifacts.topography.read(context);
    const { width, height } = context.dimensions;
    const snapshot = ops.landmasses(
      {
        width,
        height,
        landMask: topography.landMask,
      },
      config.landmasses
    );

    deps.artifacts.landmasses.publish(context, snapshot);
    return snapshot.landmassIdByTile;
  },
  viz: ({ result: landmassIdByTile, dimensions }) => [
    {
      kind: "grid",
      dataTypeKey: "morphology.landmasses.landmassIdByTile",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "i32", values: landmassIdByTile },
      meta: defineStandardVizMeta("morphology.landmasses.landmassIdByTile", "category.distinct", {
        label: "Landmass Id",
        group: GROUP_LANDMASSES,
      }),
    },
  ],
});
