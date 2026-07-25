import { ctxRandom, ctxRandomLabel } from "@swooper/mapgen-core";
import { createStep } from "@swooper/mapgen-core/authoring";
import { interleaveXY } from "@swooper/mapgen-viz";
import { defineStandardVizMeta } from "../../../../../viz.js";
import { config } from "./config.js";

const GROUP_MANTLE = "Foundation / Mantle";

/**
 * Establishes deterministic mantle source potential on the Foundation mesh,
 * separating authored source structure from its derived physical forcing.
 */
export const MantlePotentialStep = createStep(config, {
  run: (context, stepConfig, ops, deps) => {
    const mesh = deps.artifacts.foundationMesh.read(context);
    const stepId = `foundation/${config.id}`;
    const rngSeed = ctxRandom(
      context,
      ctxRandomLabel(stepId, "foundation/compute-mantle-potential"),
      2_147_483_647
    );

    const mantleResult = ops.computeMantlePotential(
      {
        mesh: {
          cellCount: mesh.cellCount,
          wrapWidth: mesh.wrapWidth,
          siteX: mesh.siteX,
          siteY: mesh.siteY,
          neighborsOffsets: mesh.neighborsOffsets,
          neighbors: mesh.neighbors,
        },
        rngSeed,
      },
      stepConfig.computeMantlePotential
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
      values: {
        format: "f32",
        values: mantlePotential.potential,
        valueSpec: {
          scale: "linear",
          domain: { kind: "explicit", min: -1, max: 1 },
        },
      },
      meta: defineStandardVizMeta("foundation.mantle.potential", "field.signed", {
        label: "Mantle Potential",
        group: GROUP_MANTLE,
      }),
    },
  ],
});
