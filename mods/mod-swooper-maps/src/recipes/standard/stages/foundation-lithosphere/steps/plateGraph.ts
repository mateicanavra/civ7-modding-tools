import { ctxRandom, ctxRandomLabel, defineVizMeta } from "@swooper/mapgen-core";
import { createStep } from "@swooper/mapgen-core/authoring";
import { interleaveXY } from "@swooper/mapgen-viz";
import { pointsFromPlateSeeds } from "../../foundation/viz.js";
import PlateGraphStepContract from "./plateGraph.contract.js";

const GROUP_PLATE_GRAPH = "Foundation / Plate Graph";

/**
 * Partitions the mesh and initial crust into the stable plate graph whose
 * identities are shared by motion and tectonic-history computation.
 */
export default createStep(PlateGraphStepContract, {
  run: (context, config, ops, deps) => {
    const mesh = deps.artifacts.foundationMesh.read(context);
    const crust = deps.artifacts.foundationCrustInit.read(context);
    const stepId = `${PlateGraphStepContract.phase}/${PlateGraphStepContract.id}`;
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

    const positions = interleaveXY(mesh.siteX, mesh.siteY);
    context.viz?.dumpPoints(context.trace, {
      dataTypeKey: "foundation.plateGraph.cellToPlate",
      spaceId: "world.xy",
      positions,
      values: plateGraphResult.plateGraph.cellToPlate,
      valueFormat: "i16",
      meta: defineVizMeta("foundation.plateGraph.cellToPlate", {
        label: "Cell Plate Id",
        group: GROUP_PLATE_GRAPH,
        palette: "categorical",
      }),
    });

    const seeds = pointsFromPlateSeeds(plateGraphResult.plateGraph.plates);
    context.viz?.dumpPoints(context.trace, {
      dataTypeKey: "foundation.plateGraph.plateSeeds",
      spaceId: "world.xy",
      positions: seeds.positions,
      values: seeds.ids,
      valueFormat: "i16",
      meta: defineVizMeta("foundation.plateGraph.plateSeeds", {
        label: "Plate Seeds",
        group: GROUP_PLATE_GRAPH,
        palette: "categorical",
      }),
    });
  },
});
