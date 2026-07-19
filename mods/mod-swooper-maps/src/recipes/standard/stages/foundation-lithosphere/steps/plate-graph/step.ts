import { ctxRandom, ctxRandomLabel } from "@swooper/mapgen-core";
import { createStep } from "@swooper/mapgen-core/authoring";
import { interleaveXY } from "@swooper/mapgen-viz";
import { defineStandardVizMeta } from "../../../../viz.js";
import { pointsFromPlateSeeds } from "../../../foundation/viz.js";
import { PlateGraphStepContract } from "./config.js";

const GROUP_PLATE_GRAPH = "Foundation / Plate Graph";

/**
 * Partitions the mesh and initial crust into the stable plate graph whose
 * identities are shared by motion and tectonic-history computation.
 */
export const PlateGraphStep = createStep(PlateGraphStepContract, {
  run: (context, config, ops, deps) => {
    const mesh = deps.artifacts.foundationMesh.read(context);
    const crust = deps.artifacts.foundationCrustInit.read(context);
    const stepId = `foundation/${PlateGraphStepContract.id}`;
    const rngSeed = ctxRandom(
      context,
      ctxRandomLabel(stepId, "foundation/compute-plate-graph"),
      2_147_483_647
    );

    const plateGraphResult = ops.computePlateGraph(
      {
        mesh,
        crust,
        rngSeed,
      },
      config.computePlateGraph
    );

    deps.artifacts.foundationPlateGraph.publish(context, plateGraphResult.plateGraph);
    return { mesh, plateGraph: plateGraphResult.plateGraph };
  },
  viz: ({ result: { mesh, plateGraph } }) => {
    const seeds = pointsFromPlateSeeds(plateGraph.plates);
    return [
      {
        kind: "points",
        dataTypeKey: "foundation.plateGraph.cellToPlate",
        spaceId: "world.xy",
        positions: interleaveXY(mesh.siteX, mesh.siteY),
        values: { format: "i16", values: plateGraph.cellToPlate },
        meta: defineStandardVizMeta("foundation.plateGraph.cellToPlate", "category.distinct", {
          label: "Cell Plate Id",
          group: GROUP_PLATE_GRAPH,
        }),
      },
      {
        kind: "points",
        dataTypeKey: "foundation.plateGraph.plateSeeds",
        spaceId: "world.xy",
        positions: seeds.positions,
        values: { format: "i16", values: seeds.ids },
        meta: defineStandardVizMeta("foundation.plateGraph.plateSeeds", "category.distinct", {
          label: "Plate Seeds",
          group: GROUP_PLATE_GRAPH,
        }),
      },
    ];
  },
});
