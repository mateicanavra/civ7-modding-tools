import { describe, expect, it } from "bun:test";

import computeCrust from "../../src/domain/foundation/ops/compute-crust/index.js";
import computeMesh from "../../src/domain/foundation/ops/compute-mesh/index.js";
import computePlateGraph from "../../src/domain/foundation/ops/compute-plate-graph/index.js";

function makeMantleForcing(
  mesh: {
    cellCount: number;
    siteX: Float32Array;
    siteY: Float32Array;
    bbox: { xl: number; xr: number; yt: number; yb: number };
  },
  opts: {
    mode: "neutral" | "rift-band";
    bandFraction?: number;
  }
) {
  const cellCount = mesh.cellCount | 0;
  const stress = new Float32Array(cellCount);
  const forcingU = new Float32Array(cellCount);
  const forcingV = new Float32Array(cellCount);
  const forcingMag = new Float32Array(cellCount);
  const divergence = new Float32Array(cellCount);
  const upwellingClass = new Int8Array(cellCount);

  if (opts.mode === "rift-band") {
    const band = Math.max(0.02, Math.min(0.45, opts.bandFraction ?? 0.2));
    const spanX = Math.max(1e-6, (mesh.bbox.xr ?? 1) - (mesh.bbox.xl ?? 0));
    const spanY = Math.max(1e-6, (mesh.bbox.yb ?? 1) - (mesh.bbox.yt ?? 0));
    const cx = (mesh.bbox.xl ?? 0) + spanX * 0.15;
    const cy = (mesh.bbox.yt ?? 0) + spanY * 0.7;
    const rx = spanX * band;
    const ry = spanY * band * 1.2;

    for (let i = 0; i < cellCount; i++) {
      const x = mesh.siteX[i] ?? 0;
      const y = mesh.siteY[i] ?? 0;
      const dx = (x - cx) / Math.max(1e-6, rx);
      const dy = (y - cy) / Math.max(1e-6, ry);
      if (dx * dx + dy * dy > 1) continue;
      divergence[i] = 0.95;
      forcingMag[i] = 0.85;
      stress[i] = 0.8;
    }
  }

  return {
    version: 1,
    cellCount,
    stress,
    forcingU,
    forcingV,
    forcingMag,
    upwellingClass,
    divergence,
  };
}

function diffCount(a: Int16Array, b: Int16Array): number {
  const len = Math.min(a.length, b.length);
  let diff = 0;
  for (let i = 0; i < len; i++) {
    if ((a[i] | 0) !== (b[i] | 0)) diff++;
  }
  return diff;
}

describe("m11 plate graph resistance sensitivity", () => {
  it("is deterministic for identical resistance fields and responds to weak-zone bands", () => {
    const width = 140;
    const height = 90;
    const ctx = { env: { dimensions: { width, height } }, knobs: {} };
    const meshConfig = computeMesh.normalize(
      {
        strategy: "default",
        config: { plateCount: 26, cellsPerPlate: 10, relaxationSteps: 3, referenceArea: 12600, plateScalePower: 0 },
      },
      ctx as any
    );

    const mesh = computeMesh.run({ width, height, rngSeed: 221 }, meshConfig).mesh;
    const mantleNeutral = makeMantleForcing(mesh, { mode: "neutral" });
    const mantleRift = makeMantleForcing(mesh, { mode: "rift-band", bandFraction: 0.35 });

    const crustNeutral = computeCrust.run(
      { mesh, mantleForcing: mantleNeutral, rngSeed: 222 },
      computeCrust.defaultConfig
    ).crust;
    const crustRift = computeCrust.run(
      { mesh, mantleForcing: mantleRift, rngSeed: 222 },
      {
        ...computeCrust.defaultConfig,
        config: { ...computeCrust.defaultConfig.config, riftWeakening01: 1 },
      }
    ).crust;

    const plateGraphNeutralA = computePlateGraph.run(
      { mesh, crust: crustNeutral, rngSeed: 223 },
      {
        ...computePlateGraph.defaultConfig,
        config: {
          ...computePlateGraph.defaultConfig.config,
          plateCount: 26,
          referenceArea: width * height,
          plateScalePower: 0,
        },
      }
    ).plateGraph;
    const plateGraphNeutralB = computePlateGraph.run(
      { mesh, crust: crustNeutral, rngSeed: 223 },
      {
        ...computePlateGraph.defaultConfig,
        config: {
          ...computePlateGraph.defaultConfig.config,
          plateCount: 26,
          referenceArea: width * height,
          plateScalePower: 0,
        },
      }
    ).plateGraph;
    const plateGraphRift = computePlateGraph.run(
      { mesh, crust: crustRift, rngSeed: 223 },
      {
        ...computePlateGraph.defaultConfig,
        config: {
          ...computePlateGraph.defaultConfig.config,
          plateCount: 26,
          referenceArea: width * height,
          plateScalePower: 0,
        },
      }
    ).plateGraph;

    expect(Array.from(plateGraphNeutralA.cellToPlate)).toEqual(Array.from(plateGraphNeutralB.cellToPlate));

    const diffs = diffCount(plateGraphNeutralA.cellToPlate, plateGraphRift.cellToPlate);
    expect(diffs).toBeGreaterThan(Math.max(5, Math.floor(mesh.cellCount * 0.02)));
  });
});
