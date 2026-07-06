import { defineVizMeta } from "@swooper/mapgen-core";
import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";

import LandmassesStepContract from "./landmasses.contract.js";
import { validators as morphologyArtifactValidators } from "../../morphology/artifacts/index.js";

const GROUP_LANDMASSES = "Morphology / Landmasses";
const TILE_SPACE_ID = "tile.hexOddQ" as const;

export default createStep(LandmassesStepContract, {
  artifacts: implementArtifacts(LandmassesStepContract.artifacts!.provides!, {
    landmasses: {
      validate: morphologyArtifactValidators.landmasses,
    },
  }),
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
