import { createStep } from "@swooper/mapgen-core/authoring";
import { defineStandardVizMeta } from "../../../../../viz.js";
import { config } from "./config.js";

const GROUP_LANDMASSES = "Morphology / Landmasses";
const TILE_SPACE_ID = "tile.hexOddQ" as const;

/**
 * Decomposes resolved dry geography into stable landmass identities
 * and bounds used later by region projection and placement fairness.
 */
export const LandmassesStep = createStep(config, {
  run: (context, stepConfig, ops, deps) => {
    const hydrography = deps.artifacts.hydrography.read();
    const { width, height } = context.setup.dimensions;
    const snapshot = ops.landmasses(
      {
        width,
        height,
        landMask: hydrography.exposedLandMask,
      },
      stepConfig.landmasses
    );

    deps.artifacts.landmasses.publish(snapshot);
    return snapshot.landmassIdByTile;
  },
  viz: ({ observation: landmassIdByTile, dimensions }) => [
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
