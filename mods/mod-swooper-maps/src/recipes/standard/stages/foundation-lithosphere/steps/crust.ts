import { ctxRandom, ctxRandomLabel, defineVizMeta } from "@swooper/mapgen-core";
import { createStep } from "@swooper/mapgen-core/authoring";
import { interleaveXY } from "../../foundation/viz.js";
import CrustStepContract from "./crust.contract.js";

const GROUP_CRUST = "Foundation / Crust";

/**
 * Computes initial crust from the shared mesh and mantle forcing before plate
 * partitioning, keeping bootstrap crust distinct from later tectonic evolution.
 */
export default createStep(CrustStepContract, {
  run: (context, config, ops, deps) => {
    const mesh = deps.artifacts.foundationMesh.read(context);
    const mantleForcing = deps.artifacts.foundationMantleForcing.read(context);
    const stepId = `${CrustStepContract.phase}/${CrustStepContract.id}`;
    const rngSeed = ctxRandom(
      context,
      ctxRandomLabel(stepId, "foundation/compute-crust"),
      2_147_483_647
    );

    const crustResult = ops.computeCrust(
      {
        mesh,
        mantleForcing,
        rngSeed,
      },
      config.computeCrust
    );

    deps.artifacts.foundationCrustInit.publish(context, crustResult.crust);

    const positions = interleaveXY(mesh.siteX, mesh.siteY);
    context.viz?.dumpPoints(context.trace, {
      dataTypeKey: "foundation.crustInit.cellType",
      spaceId: "world.xy",
      positions,
      values: crustResult.crust.type,
      valueFormat: "u8",
      meta: defineVizMeta("foundation.crustInit.cellType", {
        label: "Crust Cell Type (Init)",
        group: GROUP_CRUST,
      }),
    });
    context.viz?.dumpPoints(context.trace, {
      dataTypeKey: "foundation.crustInit.cellAge",
      spaceId: "world.xy",
      positions,
      values: crustResult.crust.age,
      valueFormat: "u8",
      meta: defineVizMeta("foundation.crustInit.cellAge", {
        label: "Crust Cell Age (Init)",
        group: GROUP_CRUST,
      }),
    });
    context.viz?.dumpPoints(context.trace, {
      dataTypeKey: "foundation.crustInit.cellBaseElevation",
      spaceId: "world.xy",
      positions,
      values: crustResult.crust.baseElevation,
      valueFormat: "f32",
      meta: defineVizMeta("foundation.crustInit.cellBaseElevation", {
        label: "Crust Cell Base Elevation (Init)",
        group: GROUP_CRUST,
      }),
    });
  },
});
