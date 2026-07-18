import { defineVizMeta } from "@swooper/mapgen-core";
import { createStep } from "@swooper/mapgen-core/authoring";
import LandmassesStepContract from "./landmasses.contract.js";

const GROUP_LANDMASSES = "Morphology / Landmasses";
const TILE_SPACE_ID = "tile.hexOddQ" as const;

/**
 * Decomposes the final post-feature landmask into stable landmass identities
 * and bounds used later by region projection and placement fairness.
 */
export default createStep(LandmassesStepContract, {
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

    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "morphology.landmasses.landmassIdByTile",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "i32",
      values: snapshot.landmassIdByTile,
      meta: defineVizMeta("morphology.landmasses.landmassIdByTile", {
        label: "Landmass Id",
        group: GROUP_LANDMASSES,
        palette: "categorical",
      }),
    });

    deps.artifacts.landmasses.publish(context, snapshot);
  },
});
