import { clampInt, ctxRandom, ctxRandomLabel, defineVizMeta } from "@swooper/mapgen-core";
import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";
import { foundationArtifacts } from "../artifacts.js";
import PlateGraphStepContract from "./plateGraph.contract.js";
import { validatePlateGraphArtifact, wrapFoundationValidateNoDims } from "./validation.js";
import type { FoundationPlateCountKnob } from "@mapgen/domain/foundation/shared/knobs.js";
import { interleaveXY, pointsFromPlateSeeds } from "./viz.js";

const GROUP_PLATE_GRAPH = "Foundation / Plate Graph";

export default createStep(PlateGraphStepContract, {
  artifacts: implementArtifacts([foundationArtifacts.plateGraph], {
    foundationPlateGraph: {
      validate: (value) => wrapFoundationValidateNoDims(value, validatePlateGraphArtifact),
    },
  }),
  normalize: (config, ctx) => {
    const { plateCount } = ctx.knobs as Readonly<{ plateCount?: FoundationPlateCountKnob }>;
    const override =
      typeof plateCount === "number" && Number.isFinite(plateCount) ? plateCount : undefined;

    const computePlateGraph =
      config.computePlateGraph.strategy === "default" && override !== undefined
        ? {
            ...config.computePlateGraph,
	            config: {
	              ...config.computePlateGraph.config,
	              plateCount: clampInt(override, 2, 256),
	            },
	          }
	        : config.computePlateGraph;

    return { ...config, computePlateGraph };
  },
  run: (context, config, ops, deps) => {
    const mesh = deps.artifacts.foundationMesh.read(context);
    const crust = deps.artifacts.foundationCrustInit.read(context);
    const stepId = `${PlateGraphStepContract.phase}/${PlateGraphStepContract.id}`;
    const rngSeed = ctxRandom(context, ctxRandomLabel(stepId, "foundation/compute-plate-graph"), 2_147_483_647);

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
