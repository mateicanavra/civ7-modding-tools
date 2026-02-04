import { ctxRandom, ctxRandomLabel, defineVizMeta } from "@swooper/mapgen-core";
import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";
import { foundationArtifacts } from "../artifacts.js";
import MantlePotentialStepContract from "./mantlePotential.contract.js";
import { validateMantlePotentialArtifact, wrapFoundationValidateNoDims } from "./validation.js";
import { interleaveXY } from "./viz.js";

const GROUP_MANTLE = "Foundation / Mantle";

export default createStep(MantlePotentialStepContract, {
  artifacts: implementArtifacts([foundationArtifacts.mantlePotential], {
    foundationMantlePotential: {
      validate: (value) => wrapFoundationValidateNoDims(value, validateMantlePotentialArtifact),
    },
  }),
  run: (context, config, ops, deps) => {
    const mesh = deps.artifacts.foundationMesh.read(context);
    const stepId = `${MantlePotentialStepContract.phase}/${MantlePotentialStepContract.id}`;
    const rngSeed = ctxRandom(context, ctxRandomLabel(stepId, "foundation/compute-mantle-potential"), 2_147_483_647);

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
