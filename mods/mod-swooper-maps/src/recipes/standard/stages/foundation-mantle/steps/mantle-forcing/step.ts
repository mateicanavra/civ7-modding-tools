import { createStep } from "@swooper/mapgen-core/authoring";
import { buildSampledVectorSegments, interleaveXY } from "@swooper/mapgen-viz";
import {
  defineStandardVizCategoryMeta,
  defineStandardVizMeta,
  STANDARD_VIZ_COLORS,
} from "../../../../viz.js";
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
        meta: defineStandardVizMeta("foundation.mantle.forcing", "field.intensity", {
          label: "Mantle Forcing (Magnitude)",
          group: GROUP_MANTLE,
          role: "magnitude",
        }),
      },
      {
        kind: "segments",
        dataTypeKey: "foundation.mantle.forcing",
        spaceId: "world.xy",
        segments,
        values: { format: "f32", values },
        meta: defineStandardVizMeta("foundation.mantle.forcing", "field.intensity", {
          label: "Mantle Forcing (Vectors)",
          group: GROUP_MANTLE,
          role: "vector",
          visibility: "debug",
        }),
      },
      {
        kind: "points",
        dataTypeKey: "foundation.mantle.stress",
        spaceId: "world.xy",
        positions,
        values: { format: "f32", values: mantleForcing.stress },
        meta: defineStandardVizMeta("foundation.mantle.stress", "field.intensity", {
          label: "Mantle Stress",
          group: GROUP_MANTLE,
          visibility: "debug",
        }),
      },
      {
        kind: "points",
        dataTypeKey: "foundation.mantle.upwellingClass",
        spaceId: "world.xy",
        positions,
        values: { format: "i8", values: mantleForcing.upwellingClass },
        meta: defineStandardVizCategoryMeta(
          "foundation.mantle.upwellingClass",
          [
            {
              value: -1,
              label: "Downwelling",
              color: STANDARD_VIZ_COLORS.field.negative,
            },
            {
              value: 0,
              label: "Neutral",
              color: STANDARD_VIZ_COLORS.field.neutral,
            },
            {
              value: 1,
              label: "Upwelling",
              color: STANDARD_VIZ_COLORS.field.positive,
            },
          ],
          {
            label: "Mantle Upwelling Class",
            group: GROUP_MANTLE,
            visibility: "debug",
          }
        ),
      },
    ];
  },
});
