import { createStep } from "@swooper/mapgen-core/authoring";
import { defineStandardVizMeta } from "../../../../../viz.js";
import { config } from "./config.js";

const GROUP_LANDMASSES = "Morphology / Landmasses";
const TILE_SPACE_ID = "tile.hexOddQ" as const;

/**
 * Decomposes the final post-feature landmask into stable landmass identities
 * and bounds used later by region projection and placement fairness.
 */
export const LandmassesStep = createStep(config, {
  run: (context, stepConfig, ops, deps) => {
    const topography = deps.artifacts.topography.read(context);
    const { width, height } = context.setup.dimensions;
    const snapshot = ops.landmasses(
      {
        width,
        height,
        landMask: topography.landMask,
      },
      stepConfig.landmasses
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
