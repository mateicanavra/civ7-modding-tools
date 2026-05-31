import { defineVizMeta } from "@swooper/mapgen-core";
import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";
import { wrapDeltaPeriodic } from "@swooper/mapgen-core/lib/math";

import { foundationArtifacts } from "../artifacts.js";
import PlateMotionStepContract from "./plateMotion.contract.js";
import { validatePlateMotionArtifact, wrapFoundationValidateNoDims } from "./validation.js";

const GROUP_PLATE_MOTION = "Foundation / Plate Motion";
const WORLD_SPACE_ID = "world.xy" as const;

function velocityAtPoint(params: {
  plateId: number;
  plateMotion: {
    plateCenterX: Float32Array;
    plateCenterY: Float32Array;
    plateVelocityX: Float32Array;
    plateVelocityY: Float32Array;
    plateOmega: Float32Array;
  };
  x: number;
  y: number;
  wrapWidth: number;
}): { vx: number; vy: number } {
  const plateId = params.plateId | 0;
  const vx = params.plateMotion.plateVelocityX[plateId] ?? 0;
  const vy = params.plateMotion.plateVelocityY[plateId] ?? 0;
  const omega = params.plateMotion.plateOmega[plateId] ?? 0;
  if (!omega) return { vx, vy };

  const cx = params.plateMotion.plateCenterX[plateId] ?? 0;
  const cy = params.plateMotion.plateCenterY[plateId] ?? 0;
  const dx = wrapDeltaPeriodic(params.x - cx, params.wrapWidth);
  const dy = params.y - cy;
  return { vx: vx + -dy * omega, vy: vy + dx * omega };
}

function buildVectorSegments(params: {
  siteX: Float32Array;
  siteY: Float32Array;
  plateIdByCell: Int16Array;
  plateMotion: {
    plateCenterX: Float32Array;
    plateCenterY: Float32Array;
    plateVelocityX: Float32Array;
    plateVelocityY: Float32Array;
    plateOmega: Float32Array;
  };
  wrapWidth: number;
}): { segments: Float32Array; values: Float32Array } {
  const cellCount = Math.min(params.siteX.length, params.siteY.length, params.plateIdByCell.length);
  let maxMag = 0;
  for (let i = 0; i < cellCount; i++) {
    const plateId = params.plateIdByCell[i] ?? 0;
    const v = velocityAtPoint({
      plateId,
      plateMotion: params.plateMotion,
      x: params.siteX[i] ?? 0,
      y: params.siteY[i] ?? 0,
      wrapWidth: params.wrapWidth,
    });
    const mag = Math.hypot(v.vx, v.vy);
    if (mag > maxMag) maxMag = mag;
  }
  const scale = maxMag > 0 ? 0.8 / maxMag : 0;
  const sampleStep = Math.max(1, Math.round(Math.sqrt(cellCount / 400)));

  const segments: number[] = [];
  const values: number[] = [];
  for (let i = 0; i < cellCount; i += sampleStep) {
    const plateId = params.plateIdByCell[i] ?? 0;
    const x0 = params.siteX[i] ?? 0;
    const y0 = params.siteY[i] ?? 0;
    const v = velocityAtPoint({
      plateId,
      plateMotion: params.plateMotion,
      x: x0,
      y: y0,
      wrapWidth: params.wrapWidth,
    });
    const mag = Math.hypot(v.vx, v.vy);
    if (!Number.isFinite(mag) || mag <= 0) continue;
    segments.push(x0, y0, x0 + v.vx * scale, y0 + v.vy * scale);
    values.push(mag);
  }

  return {
    segments: new Float32Array(segments),
    values: new Float32Array(values),
  };
}

export default createStep(PlateMotionStepContract, {
  artifacts: implementArtifacts([foundationArtifacts.plateMotion], {
    foundationPlateMotion: {
      validate: (value) => wrapFoundationValidateNoDims(value, validatePlateMotionArtifact),
    },
  }),
  run: (context, config, ops, deps) => {
    const mesh = deps.artifacts.foundationMesh.read(context);
    const plateGraph = deps.artifacts.foundationPlateGraph.read(context);
    const mantleForcing = deps.artifacts.foundationMantleForcing.read(context);

    const plateMotionResult = ops.computePlateMotion(
      {
        mesh,
        plateGraph,
        mantleForcing,
      },
      config.computePlateMotion
    );

    deps.artifacts.foundationPlateMotion.publish(context, plateMotionResult.plateMotion);

    const { segments, values } = buildVectorSegments({
      siteX: mesh.siteX,
      siteY: mesh.siteY,
      plateIdByCell: plateGraph.cellToPlate,
      plateMotion: plateMotionResult.plateMotion,
      wrapWidth: mesh.wrapWidth,
    });

    context.viz?.dumpSegments(context.trace, {
      dataTypeKey: "foundation.plateMotion.motion",
      spaceId: WORLD_SPACE_ID,
      segments,
      values,
      valueFormat: "f32",
      meta: defineVizMeta("foundation.plateMotion.motion", {
        label: "Plate Motion (Vectors)",
        group: GROUP_PLATE_MOTION,
        role: "vector",
        visibility: "debug",
        palette: "continuous",
      }),
    });
  },
});
