import { defineVizMeta } from "@swooper/mapgen-core";
import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";

import { foundationArtifacts } from "../artifacts.js";
import CrustEvolutionStepContract from "./crustEvolution.contract.js";
import { validateCrustArtifact, wrapFoundationValidateNoDims } from "./validation.js";
import { interleaveXY } from "./viz.js";

const GROUP_CRUST = "Foundation / Crust";

export default createStep(CrustEvolutionStepContract, {
  artifacts: implementArtifacts([foundationArtifacts.crust], {
    foundationCrust: {
      validate: (value) => wrapFoundationValidateNoDims(value, validateCrustArtifact),
    },
  }),
  run: (context, config, ops, deps) => {
    const mesh = deps.artifacts.foundationMesh.read(context);
    const crustInit = deps.artifacts.foundationCrustInit.read(context);
    const tectonics = deps.artifacts.foundationTectonics.read(context);
    const tectonicHistory = deps.artifacts.foundationTectonicHistory.read(context);

    const crustResult = ops.computeCrustEvolution(
      {
        mesh,
        crustInit,
        tectonics,
        tectonicHistory,
      },
      config.computeCrustEvolution
    );

    deps.artifacts.foundationCrust.publish(context, crustResult.crust);

    const positions = interleaveXY(mesh.siteX, mesh.siteY);
    context.viz?.dumpPoints(context.trace, {
      dataTypeKey: "foundation.crust.cellType",
      spaceId: "world.xy",
      positions,
      values: crustResult.crust.type,
      valueFormat: "u8",
      meta: defineVizMeta("foundation.crust.cellType", {
        label: "Crust Cell Type",
        group: GROUP_CRUST,
      }),
    });
    context.viz?.dumpPoints(context.trace, {
      dataTypeKey: "foundation.crust.cellAge",
      spaceId: "world.xy",
      positions,
      values: crustResult.crust.age,
      valueFormat: "u8",
      meta: defineVizMeta("foundation.crust.cellAge", {
        label: "Crust Thermal Age",
        group: GROUP_CRUST,
      }),
    });
    context.viz?.dumpPoints(context.trace, {
      dataTypeKey: "foundation.crust.maturity",
      spaceId: "world.xy",
      positions,
      values: crustResult.crust.maturity,
      valueFormat: "f32",
      meta: defineVizMeta("foundation.crust.maturity", {
        label: "Crust Maturity",
        group: GROUP_CRUST,
      }),
    });
    context.viz?.dumpPoints(context.trace, {
      dataTypeKey: "foundation.crust.thickness",
      spaceId: "world.xy",
      positions,
      values: crustResult.crust.thickness,
      valueFormat: "f32",
      meta: defineVizMeta("foundation.crust.thickness", {
        label: "Crust Thickness",
        group: GROUP_CRUST,
        visibility: "debug",
      }),
    });
    context.viz?.dumpPoints(context.trace, {
      dataTypeKey: "foundation.crust.strength",
      spaceId: "world.xy",
      positions,
      values: crustResult.crust.strength,
      valueFormat: "f32",
      meta: defineVizMeta("foundation.crust.strength", {
        label: "Crust Strength",
        group: GROUP_CRUST,
        visibility: "debug",
      }),
    });
    context.viz?.dumpPoints(context.trace, {
      dataTypeKey: "foundation.crust.cellBaseElevation",
      spaceId: "world.xy",
      positions,
      values: crustResult.crust.baseElevation,
      valueFormat: "f32",
      meta: defineVizMeta("foundation.crust.cellBaseElevation", {
        label: "Crust Cell Base Elevation",
        group: GROUP_CRUST,
      }),
    });
  },
});
