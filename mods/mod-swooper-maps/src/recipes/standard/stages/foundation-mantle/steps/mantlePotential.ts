import { ctxRandom, ctxRandomLabel } from "@swooper/mapgen-core";
import { createStep } from "@swooper/mapgen-core/authoring";
import { defineVizMeta, interleaveXY } from "@swooper/mapgen-viz";
import MantlePotentialStepContract from "./mantlePotential.contract.js";

const GROUP_MANTLE = "Foundation / Mantle";

/**
 * Establishes deterministic mantle source potential on the Foundation mesh,
 * separating authored source structure from its derived physical forcing.
 */
export default createStep(MantlePotentialStepContract, {
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
    return { mesh, mantlePotential: mantleResult.mantlePotential };
  },
  viz: ({ result: { mesh, mantlePotential } }) => [
    {
      kind: "points",
      dataTypeKey: "foundation.mantle.potential",
      spaceId: "world.xy",
      positions: interleaveXY(mesh.siteX, mesh.siteY),
      values: { format: "f32", values: mantlePotential.potential },
      meta: defineVizMeta("foundation.mantle.potential", {
        label: "Mantle Potential",
        group: GROUP_MANTLE,
        palette: "continuous",
      }),
    },
  ],
});
