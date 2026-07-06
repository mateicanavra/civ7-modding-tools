import { describe, expect, it } from "bun:test";

import type { Artifact as TectonicEvents } from "../../src/domain/foundation/artifacts/tectonic-events.artifact.js";
import { EVENT_TYPE } from "../../src/domain/foundation/model/policy/tectonic-event-types.js";
import { buildEraFields } from "../../src/domain/foundation/ops/compute-era-tectonic-fields/rules/index.js";
import { computeTracerIndexByEra } from "../../src/domain/foundation/ops/compute-tracer-advection/rules/index.js";

function compassMesh() {
  return {
    cellCount: 5,
    wrapWidth: 100,
    siteX: new Float32Array([0, 0, 1, 0, -1]),
    siteY: new Float32Array([0, 1, 0, -1, 0]),
    neighborsOffsets: new Int32Array([0, 4, 4, 4, 4, 4]),
    neighbors: new Int32Array([1, 2, 3, 4]),
    areas: new Float32Array([1, 1, 1, 1, 1]),
    bbox: { xl: -1, xr: 1, yt: -1, yb: 1 },
  } as const;
}

function eraWithBoundaryDrift(driftU = 0, driftV = 0) {
  return {
    boundaryDriftU: new Int8Array([driftU, 0, 0, 0, 0]),
    boundaryDriftV: new Int8Array([driftV, 0, 0, 0, 0]),
  };
}

function mantleForcing(forcingU = 0, forcingV = 0) {
  return {
    version: 1,
    cellCount: 5,
    stress: new Float32Array(5),
    forcingU: new Float32Array([forcingU, 0, 0, 0, 0]),
    forcingV: new Float32Array([forcingV, 0, 0, 0, 0]),
    forcingMag: new Float32Array(5),
    upwellingClass: new Int8Array(5),
    divergence: new Float32Array(5),
  } as const;
}

const tightEmission = {
  radius: { uplift: 1, rift: 1, shear: 1, volcanism: 1, fracture: 1 },
  decay: { uplift: 10, rift: 10, shear: 10, volcanism: 10, fracture: 10 },
} as const;

function upliftEvent(input: { driftU: number; driftV: number }): TectonicEvents[number] {
  return {
    eventType: EVENT_TYPE.convergenceCollision,
    plateA: 0,
    plateB: 1,
    polarity: 0,
    intensityUplift: 100,
    intensityRift: 0,
    intensityShear: 0,
    intensityVolcanism: 0,
    intensityFracture: 0,
    driftU: input.driftU,
    driftV: input.driftV,
    seedCells: [0],
    originPlateId: 0,
  };
}

describe("foundation drift adapter migration", () => {
  it("tracer advection applies boundary drift with source-cell sign inversion and stable axes", () => {
    const traces = computeTracerIndexByEra({
      mesh: compassMesh(),
      mantleForcing: mantleForcing(),
      eras: Array.from({ length: 5 }, () => eraWithBoundaryDrift(127, 0)) as any,
      eraCount: 5,
    });

    expect(traces[1]![0]).toBe(4);
  });

  it("tracer advection falls back to quantized mantle drift with the same source-cell sign", () => {
    const traces = computeTracerIndexByEra({
      mesh: compassMesh(),
      mantleForcing: mantleForcing(0, 1),
      eras: Array.from({ length: 5 }, () => eraWithBoundaryDrift()) as any,
      eraCount: 5,
    });

    expect(traces[1]![0]).toBe(3);
  });

  it("era-field seed drift truncates signed bytes before selecting the positive projection", () => {
    const fields = buildEraFields({
      mesh: compassMesh(),
      events: [upliftEvent({ driftU: 127.9, driftV: 127.1 })],
      weight: 1,
      eraGain: 1,
      activityGain: 1,
      driftSteps: 1,
      emission: tightEmission,
    });

    expect(fields.upliftPotential[1]).toBe(100);
    expect(fields.upliftPotential[2]).toBe(0);
  });

  it("era-field seed drift keeps x/y axes aligned when selecting the positive projection", () => {
    const fields = buildEraFields({
      mesh: compassMesh(),
      events: [upliftEvent({ driftU: 127, driftV: 0 })],
      weight: 1,
      eraGain: 1,
      activityGain: 1,
      driftSteps: 1,
      emission: tightEmission,
    });

    expect(fields.upliftPotential[2]).toBe(100);
    expect(fields.upliftPotential[1]).toBe(0);
  });
});
