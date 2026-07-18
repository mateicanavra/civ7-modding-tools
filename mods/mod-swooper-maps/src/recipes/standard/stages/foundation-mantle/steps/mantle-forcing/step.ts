import { createStep } from "@swooper/mapgen-core/authoring";
import { buildSampledVectorSegments, defineVizMeta, interleaveXY } from "@swooper/mapgen-viz";
import { MantleForcingStepContract } from "./config.js";

const GROUP_MANTLE = "Foundation / Mantle";

/**
 * Converts mantle potential into the velocity, stress, and vertical forcing
 * vintage shared by lithosphere and tectonic consumers.
 */
export const MantleForcingStep = createStep(MantleForcingStepContract, {
  run: (context, config, ops, deps) => {
    const mesh = deps.artifacts.foundationMesh.read(context);
    const mantlePotential = deps.artifacts.foundationMantlePotential.read(context);

    const mantleResult = ops.computeMantleForcing(
      {
        mesh,
        mantlePotential,
      },
      config.computeMantleForcing
    );

    deps.artifacts.foundationMantleForcing.publish(context, mantleResult.mantleForcing);
    return { mesh, mantleForcing: mantleResult.mantleForcing };
  },
  viz: ({ result: { mesh, mantleForcing } }) => {
    const positions = interleaveXY(mesh.siteX, mesh.siteY);
    const { segments, values } = buildSampledVectorSegments({
      x: mesh.siteX,
      y: mesh.siteY,
      u: mantleForcing.forcingU,
      v: mantleForcing.forcingV,
      magnitudes: mantleForcing.forcingMag,
    });

    return [
      {
        kind: "points",
        dataTypeKey: "foundation.mantle.forcing",
        spaceId: "world.xy",
        positions,
        values: { format: "f32", values: mantleForcing.forcingMag },
        meta: defineVizMeta("foundation.mantle.forcing", {
          label: "Mantle Forcing (Magnitude)",
          group: GROUP_MANTLE,
          role: "magnitude",
          palette: "continuous",
        }),
      },
      {
        kind: "segments",
        dataTypeKey: "foundation.mantle.forcing",
        spaceId: "world.xy",
        segments,
        values: { format: "f32", values },
        meta: defineVizMeta("foundation.mantle.forcing", {
          label: "Mantle Forcing (Vectors)",
          group: GROUP_MANTLE,
          role: "vector",
          visibility: "debug",
          palette: "continuous",
        }),
      },
      {
        kind: "points",
        dataTypeKey: "foundation.mantle.stress",
        spaceId: "world.xy",
        positions,
        values: { format: "f32", values: mantleForcing.stress },
        meta: defineVizMeta("foundation.mantle.stress", {
          label: "Mantle Stress",
          group: GROUP_MANTLE,
          visibility: "debug",
          palette: "continuous",
        }),
      },
      {
        kind: "points",
        dataTypeKey: "foundation.mantle.upwellingClass",
        spaceId: "world.xy",
        positions,
        values: { format: "i8", values: mantleForcing.upwellingClass },
        meta: defineVizMeta("foundation.mantle.upwellingClass", {
          label: "Mantle Upwelling Class",
          group: GROUP_MANTLE,
          visibility: "debug",
          palette: "categorical",
          categories: [
            { value: -1, label: "Downwelling", color: [59, 130, 246, 230] },
            { value: 0, label: "Neutral", color: [107, 114, 128, 230] },
            { value: 1, label: "Upwelling", color: [239, 68, 68, 230] },
          ],
        }),
      },
    ];
  },
});
