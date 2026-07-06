import {
  artifacts as foundationArtifacts,
  validators as foundationArtifactValidators,
} from "@mapgen/domain/foundation";
import { ctxRandom, ctxRandomLabel, defineVizMeta } from "@swooper/mapgen-core";
import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";
import { interleaveXY } from "../../foundation/viz.js";
import MantlePotentialStepContract from "./mantlePotential.contract.js";

const GROUP_MANTLE = "Foundation / Mantle";

export default createStep(MantlePotentialStepContract, {
  artifacts: implementArtifacts([foundationArtifacts.mantlePotential], {
    foundationMantlePotential: {
      validate: (value) => foundationArtifactValidators.mantlePotential(value),
    },
  }),
  run: (context, config, ops, deps) => {
    const mesh = deps.artifacts.foundationMesh.read(context);
    const stepId = `${MantlePotentialStepContract.phase}/${MantlePotentialStepContract.id}`;
    const rngSeed = ctxRandom(
      context,
      ctxRandomLabel(stepId, "foundation/compute-mantle-potential"),
      2_147_483_647
    );

    const mantleResult = ops.computeMantlePotential(
      {
        mesh,
        rngSeed,
      },
      config.computeMantlePotential
    );

    deps.artifacts.foundationMantlePotential.publish(context, mantleResult.mantlePotential);

    const positions = interleaveXY(mesh.siteX, mesh.siteY);
    context.viz?.dumpPoints(context.trace, {
      dataTypeKey: "foundation.mantle.potential",
      spaceId: "world.xy",
      positions,
      values: mantleResult.mantlePotential.potential,
      valueFormat: "f32",
      meta: defineVizMeta("foundation.mantle.potential", {
        label: "Mantle Potential",
        group: GROUP_MANTLE,
        palette: "continuous",
      }),
    });
  },
});
