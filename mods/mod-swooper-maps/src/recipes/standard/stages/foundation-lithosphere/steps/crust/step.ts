import { ctxRandom, ctxRandomLabel } from "@swooper/mapgen-core";
import { createStep } from "@swooper/mapgen-core/authoring";
import { interleaveXY } from "@swooper/mapgen-viz";
import { defineStandardVizMeta } from "../../../../viz.js";
import { CrustStepContract } from "./config.js";

const GROUP_CRUST = "Foundation / Crust";

/**
 * Computes initial crust from the shared mesh and mantle forcing before plate
 * partitioning, keeping bootstrap crust distinct from later tectonic evolution.
 */
export const CrustStep = createStep(CrustStepContract, {
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
    return { mesh, crust: crustResult.crust };
  },
  viz: ({ result: { mesh, crust } }) => {
    const positions = interleaveXY(mesh.siteX, mesh.siteY);
    return [
      {
        kind: "points",
        dataTypeKey: "foundation.crustInit.cellType",
        spaceId: "world.xy",
        positions,
        values: { format: "u8", values: crust.type },
        meta: defineStandardVizMeta("foundation.crustInit.cellType", "category.distinct", {
          label: "Crust Cell Type (Init)",
          group: GROUP_CRUST,
        }),
      },
      {
        kind: "points",
        dataTypeKey: "foundation.crustInit.cellAge",
        spaceId: "world.xy",
        positions,
        values: { format: "u8", values: crust.age },
        meta: defineStandardVizMeta("foundation.crustInit.cellAge", "field.intensity", {
          label: "Crust Cell Age (Init)",
          group: GROUP_CRUST,
        }),
      },
      {
        kind: "points",
        dataTypeKey: "foundation.crustInit.cellBaseElevation",
        spaceId: "world.xy",
        positions,
        values: { format: "f32", values: crust.baseElevation },
        meta: defineStandardVizMeta("foundation.crustInit.cellBaseElevation", "terrain.elevation", {
          label: "Crust Cell Base Elevation (Init)",
          group: GROUP_CRUST,
        }),
      },
    ];
  },
});
