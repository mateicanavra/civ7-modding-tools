import { describe, expect, it } from "bun:test";

import computeCrust from "../../src/domain/foundation/ops/compute-crust/index.js";
import computeMesh from "../../src/domain/foundation/ops/compute-mesh/index.js";
import computeMantlePotential from "../../src/domain/foundation/ops/compute-mantle-potential/index.js";
import computeMantleForcing from "../../src/domain/foundation/ops/compute-mantle-forcing/index.js";
import computePlateGraph from "../../src/domain/foundation/ops/compute-plate-graph/index.js";
import computePlateMotion from "../../src/domain/foundation/ops/compute-plate-motion/index.js";
import computePlatesTensors from "../../src/domain/foundation/ops/compute-plates-tensors/index.js";
import computeTectonicHistory from "../../src/domain/foundation/ops/compute-tectonic-history/index.js";
import computeBaseTopography from "../../src/domain/morphology/ops/compute-base-topography/index.js";

function quantile(sorted: number[], q: number): number {
  if (sorted.length === 0) return 0;
  const clamped = Math.max(0, Math.min(1, q));
  const idx = Math.floor((sorted.length - 1) * clamped);
  return sorted[idx] ?? 0;
}

function derivePlateMotion(mesh: any, plateGraph: any, rngSeed: number) {
  const mantlePotential = computeMantlePotential.run({ mesh, rngSeed }, computeMantlePotential.defaultConfig)
    .mantlePotential;
  const mantleForcing = computeMantleForcing.run({ mesh, mantlePotential }, computeMantleForcing.defaultConfig)
    .mantleForcing;
  return computePlateMotion.run({ mesh, plateGraph, mantleForcing }, computePlateMotion.defaultConfig).plateMotion;
}

describe("m11 morphology baseline consumes crust isostasy prior", () => {
  it("still separates continents vs ocean when tectonic uplift/rift are zero", () => {
    const width = 60;
    const height = 40;
    const size = width * height;

    const ctx = { env: { dimensions: { width, height } }, knobs: {} };
    const meshConfig = computeMesh.normalize(
      {
        strategy: "default",
        config: { plateCount: 16, cellsPerPlate: 3, relaxationSteps: 2, referenceArea: 2400, plateScalePower: 0 },
      },
      ctx as any
    );

    const mesh = computeMesh.run({ width, height, rngSeed: 10 }, meshConfig).mesh;
    const mantlePotential = computeMantlePotential.run({ mesh, rngSeed: 11 }, computeMantlePotential.defaultConfig)
      .mantlePotential;
    const mantleForcing = computeMantleForcing.run({ mesh, mantlePotential }, computeMantleForcing.defaultConfig)
      .mantleForcing;
    const crust = computeCrust.run({ mesh, mantleForcing, rngSeed: 11 }, computeCrust.defaultConfig).crust;
    const plateGraph = computePlateGraph.run(
      { mesh, crust, rngSeed: 12 },
      { strategy: "default", config: { plateCount: 16, referenceArea: 2400, plateScalePower: 0 } }
    ).plateGraph;
    const plateMotion = derivePlateMotion(mesh, plateGraph, 13);
    const historyResult = computeTectonicHistory.run(
      { mesh, crust, mantleForcing, plateGraph, plateMotion },
      computeTectonicHistory.defaultConfig
    );
    const tectonicHistory = historyResult.tectonicHistory;
    const tectonics = historyResult.tectonics;
    const projection = computePlatesTensors.run(
      { width, height, mesh, crust, plateGraph, plateMotion, tectonics, tectonicHistory },
      computePlatesTensors.defaultConfig
    );
    const crustTiles = projection.crustTiles;

    const continentMask = new Uint8Array(size);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const inLatBand = y > height * 0.2 && y < height * 0.8;
        const inLonBand = x > width * 0.2 && x < width * 0.8;
        continentMask[idx] = inLatBand && inLonBand ? 1 : 0;
      }
    }

    const crustBaseElevation = new Float32Array(size);
    for (let i = 0; i < size; i++) {
      const base = crustTiles.baseElevation[i] ?? 0;
      crustBaseElevation[i] = continentMask[i] ? Math.min(1, base + 0.25) : base;
    }

    const elevation = computeBaseTopography.run(
      {
        width,
        height,
        crustBaseElevation,
        boundaryCloseness: new Uint8Array(size),
        upliftPotential: new Uint8Array(size),
        riftPotential: new Uint8Array(size),
        rngSeed: 123,
      },
      computeBaseTopography.defaultConfig
    ).elevation;

    const continental: number[] = [];
    const oceanic: number[] = [];
    for (let i = 0; i < size; i++) {
      const value = elevation[i] ?? 0;
      if (continentMask[i] === 1) continental.push(value);
      else oceanic.push(value);
    }
    continental.sort((a, b) => a - b);
    oceanic.sort((a, b) => a - b);

    if (continental.length > 0 && oceanic.length > 0) {
      expect(quantile(continental, 0.5)).toBeGreaterThan(quantile(oceanic, 0.5));
    }
  });
});
