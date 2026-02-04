import { defineVizMeta } from "@swooper/mapgen-core";
import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";
import { foundationArtifacts } from "../artifacts.js";
import MantleForcingStepContract from "./mantleForcing.contract.js";
import { validateMantleForcingArtifact, wrapFoundationValidateNoDims } from "./validation.js";
import { interleaveXY } from "./viz.js";

const GROUP_MANTLE = "Foundation / Mantle";

function buildVectorSegments(params: {
  x: Float32Array;
  y: Float32Array;
  u: Float32Array;
  v: Float32Array;
  magnitudes: Float32Array;
}): { segments: Float32Array; values: Float32Array } {
  const cellCount = Math.min(params.x.length, params.y.length, params.u.length, params.v.length);
  let maxMag = 0;
  for (let i = 0; i < cellCount; i++) {
    const mag = params.magnitudes[i] ?? 0;
    if (mag > maxMag) maxMag = mag;
  }
  const scale = maxMag > 0 ? 0.8 / maxMag : 0;
  const sampleStep = Math.max(1, Math.round(Math.sqrt(cellCount / 400)));

  const segments: number[] = [];
  const values: number[] = [];
  for (let i = 0; i < cellCount; i += sampleStep) {
    const ux = params.u[i] ?? 0;
    const vy = params.v[i] ?? 0;
    const mag = params.magnitudes[i] ?? 0;
    if (!Number.isFinite(ux) || !Number.isFinite(vy) || mag <= 0) continue;
    const x0 = params.x[i] ?? 0;
    const y0 = params.y[i] ?? 0;
    segments.push(x0, y0, x0 + ux * scale, y0 + vy * scale);
    values.push(mag);
  }

  return {
    segments: new Float32Array(segments),
    values: new Float32Array(values),
  };
}

export default createStep(MantleForcingStepContract, {
  artifacts: implementArtifacts([foundationArtifacts.mantleForcing], {
    foundationMantleForcing: {
      validate: (value) => wrapFoundationValidateNoDims(value, validateMantleForcingArtifact),
    },
  }),
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

    const positions = interleaveXY(mesh.siteX, mesh.siteY);
    context.viz?.dumpPoints(context.trace, {
      dataTypeKey: "foundation.mantle.forcing",
      spaceId: "world.xy",
      positions,
      values: mantleResult.mantleForcing.forcingMag,
      valueFormat: "f32",
      meta: defineVizMeta("foundation.mantle.forcing", {
        label: "Mantle Forcing (Magnitude)",
        group: GROUP_MANTLE,
        role: "magnitude",
        palette: "continuous",
      }),
    });

    const { segments, values } = buildVectorSegments({
      x: mesh.siteX,
      y: mesh.siteY,
      u: mantleResult.mantleForcing.forcingU,
      v: mantleResult.mantleForcing.forcingV,
      magnitudes: mantleResult.mantleForcing.forcingMag,
    });

    context.viz?.dumpSegments(context.trace, {
      dataTypeKey: "foundation.mantle.forcing",
      spaceId: "world.xy",
      segments,
      values,
      valueFormat: "f32",
      meta: defineVizMeta("foundation.mantle.forcing", {
        label: "Mantle Forcing (Vectors)",
        group: GROUP_MANTLE,
        role: "vector",
        visibility: "debug",
        palette: "continuous",
      }),
    });

    context.viz?.dumpPoints(context.trace, {
      dataTypeKey: "foundation.mantle.stress",
      spaceId: "world.xy",
      positions,
      values: mantleResult.mantleForcing.stress,
      valueFormat: "f32",
      meta: defineVizMeta("foundation.mantle.stress", {
        label: "Mantle Stress",
        group: GROUP_MANTLE,
        visibility: "debug",
        palette: "continuous",
      }),
    });

    context.viz?.dumpPoints(context.trace, {
      dataTypeKey: "foundation.mantle.upwellingClass",
      spaceId: "world.xy",
      positions,
      values: mantleResult.mantleForcing.upwellingClass,
      valueFormat: "i8",
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
    });
  },
});
