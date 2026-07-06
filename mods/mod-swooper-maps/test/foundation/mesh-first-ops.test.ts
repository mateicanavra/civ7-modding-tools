import { describe, expect, it } from "bun:test";
import { buildPlateTopology } from "@swooper/mapgen-core/lib/plates";
import { runTectonicHistoryChain } from "../support/tectonics-history-runner.js";
import foundationOpsPublic from "@mapgen/domain/foundation/ops";

const { computeCrust, computeMantleForcing, computeMantlePotential, computeMesh, computePlateGraph, computePlateMotion, computePlatesTensors, computeTectonicSegments } = foundationOpsPublic.ops;
function neighborsFor(
  mesh: {
    neighborsOffsets: Int32Array;
    neighbors: Int32Array;
  },
  cellId: number
): Int32Array {
  const start = mesh.neighborsOffsets[cellId] | 0;
  const end = mesh.neighborsOffsets[cellId + 1] | 0;
  return mesh.neighbors.slice(start, end);
}

function sumAreas(areas: Float32Array): number {
  let total = 0;
  for (let i = 0; i < areas.length; i++) total += areas[i] ?? 0;
  return total;
}

function quantile(sorted: number[], q: number): number {
  if (sorted.length === 0) return 0;
  const clamped = Math.max(0, Math.min(1, q));
  const idx = Math.floor((sorted.length - 1) * clamped);
  return sorted[idx] ?? 0;
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  let s = 0;
  for (let i = 0; i < values.length; i++) s += values[i] ?? 0;
  return s / values.length;
}

function variance(values: number[]): number {
  if (values.length === 0) return 0;
  const m = mean(values);
  let s = 0;
  for (let i = 0; i < values.length; i++) {
    const d = (values[i] ?? 0) - m;
    s += d * d;
  }
  return s / values.length;
}

function derivePlateMotion(mesh: any, plateGraph: any, rngSeed: number) {
  const mantlePotential = computeMantlePotential.run(
    { mesh, rngSeed },
    computeMantlePotential.defaultConfig
  ).mantlePotential;
  const mantleForcing = computeMantleForcing.run(
    { mesh, mantlePotential },
    computeMantleForcing.defaultConfig
  ).mantleForcing;
  return computePlateMotion.run(
    { mesh, plateGraph, mantleForcing },
    computePlateMotion.defaultConfig
  ).plateMotion;
}

function deriveMantleForcing(mesh: any, rngSeed: number) {
  const mantlePotential = computeMantlePotential.run(
    { mesh, rngSeed },
    computeMantlePotential.defaultConfig
  ).mantlePotential;
  return computeMantleForcing.run({ mesh, mantlePotential }, computeMantleForcing.defaultConfig)
    .mantleForcing;
}

function truncateMantleForcing(mantleForcing: any, cellCount: number) {
  return {
    ...mantleForcing,
    cellCount,
    stress: mantleForcing.stress.slice(0, cellCount),
    forcingU: mantleForcing.forcingU.slice(0, cellCount),
    forcingV: mantleForcing.forcingV.slice(0, cellCount),
    forcingMag: mantleForcing.forcingMag.slice(0, cellCount),
    upwellingClass: mantleForcing.upwellingClass.slice(0, cellCount),
    divergence: mantleForcing.divergence.slice(0, cellCount),
  };
}

function truncateTectonicProvenance(tectonicProvenance: any, cellCount: number) {
  return {
    ...tectonicProvenance,
    cellCount,
    tracerIndex: tectonicProvenance.tracerIndex.map((tracer: Uint32Array) =>
      tracer.slice(0, cellCount)
    ),
    provenance: {
      originEra: tectonicProvenance.provenance.originEra.slice(0, cellCount),
      originPlateId: tectonicProvenance.provenance.originPlateId.slice(0, cellCount),
      lastBoundaryEra: tectonicProvenance.provenance.lastBoundaryEra.slice(0, cellCount),
      lastBoundaryType: tectonicProvenance.provenance.lastBoundaryType.slice(0, cellCount),
      lastBoundaryPolarity: tectonicProvenance.provenance.lastBoundaryPolarity.slice(0, cellCount),
      lastBoundaryIntensity: tectonicProvenance.provenance.lastBoundaryIntensity.slice(
        0,
        cellCount
      ),
      crustAge: tectonicProvenance.provenance.crustAge.slice(0, cellCount),
    },
  };
}

function appendPlateMotionPlate(plateMotion: any) {
  const plateCount = (plateMotion.plateCount | 0) + 1;
  const extendFloat = (values: Float32Array) => {
    const next = new Float32Array(plateCount);
    next.set(values);
    return next;
  };
  const extendQuality = (values: Uint8Array) => {
    const next = new Uint8Array(plateCount);
    next.set(values);
    return next;
  };

  return {
    ...plateMotion,
    plateCount,
    plateCenterX: extendFloat(plateMotion.plateCenterX),
    plateCenterY: extendFloat(plateMotion.plateCenterY),
    plateVelocityX: extendFloat(plateMotion.plateVelocityX),
    plateVelocityY: extendFloat(plateMotion.plateVelocityY),
    plateOmega: extendFloat(plateMotion.plateOmega),
    plateFitRms: extendFloat(plateMotion.plateFitRms),
    plateFitP90: extendFloat(plateMotion.plateFitP90),
    plateQuality: extendQuality(plateMotion.plateQuality),
  };
}

describe("foundation mesh-first ops (slice 2)", () => {
  it("compute-mesh is deterministic and shape-correct", () => {
    const width = 40;
    const height = 20;

    const ctx = { env: { dimensions: { width, height } }, knobs: {} };
    const meshConfig = computeMesh.normalize(
      {
        strategy: "default",
        config: { plateCount: 9, cellsPerPlate: 2, relaxationSteps: 2 },
      },
      ctx as any
    );

    const first = computeMesh.run(
      {
        width,
        height,
        rngSeed: 1,
      },
      meshConfig
    );

    const second = computeMesh.run(
      {
        width,
        height,
        rngSeed: 1,
      },
      meshConfig
    );

    expect(first.mesh.cellCount).toBeGreaterThan(0);
    expect(first.mesh.siteX.length).toBe(first.mesh.cellCount);
    expect(first.mesh.siteY.length).toBe(first.mesh.cellCount);
    expect(first.mesh.areas.length).toBe(first.mesh.cellCount);
    expect(first.mesh.neighborsOffsets.length).toBe(first.mesh.cellCount + 1);

    expect(first.mesh.wrapWidth).toBeGreaterThan(0);
    expect(Array.from(first.mesh.siteX)).toEqual(Array.from(second.mesh.siteX));
    expect(Array.from(first.mesh.siteY)).toEqual(Array.from(second.mesh.siteY));
    expect(Array.from(first.mesh.areas)).toEqual(Array.from(second.mesh.areas));
    expect(Array.from(first.mesh.neighborsOffsets)).toEqual(
      Array.from(second.mesh.neighborsOffsets)
    );
    expect(Array.from(first.mesh.neighbors)).toEqual(Array.from(second.mesh.neighbors));

    const expectedArea =
      (first.mesh.bbox.xr - first.mesh.bbox.xl) * (first.mesh.bbox.yb - first.mesh.bbox.yt);
    const totalArea = sumAreas(first.mesh.areas);
    expect(Math.abs(totalArea - expectedArea)).toBeLessThan(expectedArea * 0.05);

    let hasSeamNeighbor = false;
    for (let i = 0; i < first.mesh.cellCount; i++) {
      const neighbors = neighborsFor(first.mesh, i);
      for (let j = 0; j < neighbors.length; j++) {
        const n = neighbors[j]!;
        const back = neighborsFor(first.mesh, n);
        expect(Array.from(back)).toContain(i);
        if (
          Math.abs((first.mesh.siteX[n] ?? 0) - (first.mesh.siteX[i] ?? 0)) >
          first.mesh.wrapWidth * 0.5
        ) {
          hasSeamNeighbor = true;
        }
      }
    }

    expect(hasSeamNeighbor).toBe(true);
  });

  it("compute-crust/compute-plate-graph/compute-tectonics are deterministic and internally consistent", () => {
    const width = 40;
    const height = 20;

    const ctx = { env: { dimensions: { width, height } }, knobs: {} };
    const meshConfig = computeMesh.normalize(
      {
        strategy: "default",
        config: { plateCount: 9, cellsPerPlate: 2, relaxationSteps: 2 },
      },
      ctx as any
    );

    const mesh = computeMesh.run(
      {
        width,
        height,
        rngSeed: 2,
      },
      meshConfig
    ).mesh;

    const mantleForcing = deriveMantleForcing(mesh, 3);
    const crustA = computeCrust.run(
      {
        mesh,
        mantleForcing,
        rngSeed: 3,
      },
      computeCrust.defaultConfig
    ).crust;

    const crustB = computeCrust.run(
      {
        mesh,
        mantleForcing,
        rngSeed: 3,
      },
      computeCrust.defaultConfig
    ).crust;

    expect(Array.from(crustA.type)).toEqual(Array.from(crustB.type));
    expect(Array.from(crustA.age)).toEqual(Array.from(crustB.age));
    expect(Array.from(crustA.maturity)).toEqual(Array.from(crustB.maturity));
    expect(Array.from(crustA.thickness)).toEqual(Array.from(crustB.thickness));
    expect(Array.from(crustA.thermalAge)).toEqual(Array.from(crustB.thermalAge));
    expect(Array.from(crustA.damage)).toEqual(Array.from(crustB.damage));
    expect(crustA.type.length).toBe(mesh.cellCount);
    expect(crustA.age.length).toBe(mesh.cellCount);
    expect(crustA.maturity.length).toBe(mesh.cellCount);
    expect(crustA.thickness.length).toBe(mesh.cellCount);
    expect(crustA.thermalAge.length).toBe(mesh.cellCount);
    expect(crustA.damage.length).toBe(mesh.cellCount);

    const graphA = computePlateGraph.run(
      {
        mesh,
        crust: crustA,
        rngSeed: 4,
      },
      computePlateGraph.defaultConfig
    ).plateGraph;

    const graphB = computePlateGraph.run(
      {
        mesh,
        crust: crustA,
        rngSeed: 4,
      },
      computePlateGraph.defaultConfig
    ).plateGraph;

    expect(Array.from(graphA.cellToPlate)).toEqual(Array.from(graphB.cellToPlate));
    expect(graphA.cellToPlate.length).toBe(mesh.cellCount);
    expect(graphA.plates.length).toBeGreaterThan(1);

    const plateMotion = derivePlateMotion(mesh, graphA, 5);
    const segA = computeTectonicSegments.run(
      {
        mesh,
        crust: crustA,
        plateGraph: graphA,
        plateMotion,
      },
      computeTectonicSegments.defaultConfig
    ).segments;

    const segB = computeTectonicSegments.run(
      {
        mesh,
        crust: crustA,
        plateGraph: graphA,
        plateMotion,
      },
      computeTectonicSegments.defaultConfig
    ).segments;

    expect(segA.segmentCount).toBe(segB.segmentCount);
    expect(Array.from(segA.aCell)).toEqual(Array.from(segB.aCell));
    expect(Array.from(segA.bCell)).toEqual(Array.from(segB.bCell));
    expect(Array.from(segA.regime)).toEqual(Array.from(segB.regime));

    const histA = runTectonicHistoryChain({
      mesh,
      crust: crustA,
      mantleForcing,
      plateGraph: graphA,
      plateMotion,
    });
    const histB = runTectonicHistoryChain({
      mesh,
      crust: crustA,
      mantleForcing,
      plateGraph: graphA,
      plateMotion,
    });

    expect(Array.from(histA.tectonics.boundaryType)).toEqual(
      Array.from(histB.tectonics.boundaryType)
    );
    expect(histA.tectonics.boundaryType.length).toBe(mesh.cellCount);
    expect(histA.tectonics.upliftPotential.length).toBe(mesh.cellCount);
    expect(histA.tectonics.riftPotential.length).toBe(mesh.cellCount);
    expect(histA.tectonics.shearStress.length).toBe(mesh.cellCount);
    expect(histA.tectonics.volcanism.length).toBe(mesh.cellCount);
    expect(histA.tectonics.fracture.length).toBe(mesh.cellCount);
    expect(histA.tectonics.cumulativeUplift.length).toBe(mesh.cellCount);
  });

  it("plate partition yields non-uniform areas and plausible adjacency degrees (topology metrics)", () => {
    const width = 60;
    const height = 40;

    const ctx = { env: { dimensions: { width, height } }, knobs: {} };
    const meshConfig = computeMesh.normalize(
      {
        strategy: "default",
        config: { plateCount: 16, cellsPerPlate: 3, relaxationSteps: 2 },
      },
      ctx as any
    );

    const runCase = (seed: number) => {
      const mesh = computeMesh.run({ width, height, rngSeed: 1000 + seed }, meshConfig).mesh;
      const mantleForcing = deriveMantleForcing(mesh, 2000 + seed);
      const crust = computeCrust.run(
        { mesh, mantleForcing, rngSeed: 2000 + seed },
        computeCrust.defaultConfig
      ).crust;

      const plateGraph = computePlateGraph.run(
        { mesh, crust, rngSeed: 3000 + seed },
        { strategy: "default", config: { plateCount: 16 } }
      ).plateGraph;

      const plateMotion = derivePlateMotion(mesh, plateGraph, 4000 + seed);
      const segments = computeTectonicSegments.run(
        { mesh, crust, plateGraph, plateMotion },
        computeTectonicSegments.defaultConfig
      ).segments;
      const historyResult = runTectonicHistoryChain({
        mesh,
        crust,
        mantleForcing,
        plateGraph,
        plateMotion,
      });

      const platesTensors = computePlatesTensors.run(
        {
          width,
          height,
          mesh,
          crust,
          plateGraph,
          plateMotion,
          tectonics: historyResult.tectonics,
          tectonicHistory: historyResult.tectonicHistory,
        },
        computePlatesTensors.defaultConfig
      );

      const tilePlateIds = platesTensors.plates.id;
      let maxId = -1;
      for (let i = 0; i < tilePlateIds.length; i++) maxId = Math.max(maxId, tilePlateIds[i] | 0);
      const plateCount = maxId + 1;
      expect(plateCount).toBe(16);

      const topology = buildPlateTopology(tilePlateIds, width, height, plateCount);
      const areas = topology.map((p) => p.area);
      const minArea = Math.min(...areas);

      const sortedAreas = [...areas].sort((a, b) => a - b);
      const p50 = quantile(sortedAreas, 0.5);
      const p90 = quantile(sortedAreas, 0.9);

      const degrees = topology.map((p) => p.neighbors.length);
      const meanDegree = mean(degrees);
      const degreeVar = variance(degrees);

      return { minArea, p50, p90, meanDegree, degreeVar };
    };

    const a = runCase(1);
    const b = runCase(2);

    for (const c of [a, b]) {
      expect(c.minArea).toBeGreaterThanOrEqual(8);
      expect(c.p50).toBeGreaterThan(0);
      expect(c.p90 / c.p50).toBeGreaterThanOrEqual(1.4);
      expect(c.meanDegree).toBeGreaterThanOrEqual(3);
      expect(c.meanDegree).toBeLessThanOrEqual(7);
      expect(c.degreeVar).toBeGreaterThan(0);
    }
  });

  it("compute-crust initializes a basaltic lid with bounded truth fields", () => {
    const width = 60;
    const height = 30;

    const ctx = { env: { dimensions: { width, height } }, knobs: {} };
    const meshConfig = computeMesh.normalize(
      {
        strategy: "default",
        config: { plateCount: 16, cellsPerPlate: 4, relaxationSteps: 2 },
      },
      ctx as any
    );

    const mesh = computeMesh.run(
      {
        width,
        height,
        rngSeed: 10,
      },
      meshConfig
    ).mesh;

    const mantleForcing = deriveMantleForcing(mesh, 11);
    const crust = computeCrust.run(
      { mesh, mantleForcing, rngSeed: 11 },
      computeCrust.defaultConfig
    ).crust;

    let minStrength = Number.POSITIVE_INFINITY;
    let maxStrength = Number.NEGATIVE_INFINITY;

    let minDamage = Number.POSITIVE_INFINITY;
    let maxDamage = Number.NEGATIVE_INFINITY;

    for (let i = 0; i < mesh.cellCount; i++) {
      expect(crust.type[i]).toBe(0);
      expect(crust.maturity[i]).toBeGreaterThanOrEqual(0);
      expect(crust.maturity[i]).toBeLessThanOrEqual(0.25 + 1e-6);
      expect(crust.thermalAge[i]).toBe(0);
      expect(crust.damage[i]).toBeGreaterThanOrEqual(0);
      expect(crust.damage[i]).toBeLessThanOrEqual(255);
      expect(crust.age[i]).toBe(crust.thermalAge[i]);

      const strength = crust.strength[i] ?? 0;
      minStrength = Math.min(minStrength, strength);
      maxStrength = Math.max(maxStrength, strength);
      expect(strength).toBeGreaterThanOrEqual(0);
      expect(strength).toBeLessThanOrEqual(1);

      const damage = crust.damage[i] ?? 0;
      minDamage = Math.min(minDamage, damage);
      maxDamage = Math.max(maxDamage, damage);
    }

    expect(maxStrength - minStrength).toBeGreaterThanOrEqual(0);
    expect(maxDamage - minDamage).toBeGreaterThanOrEqual(0);
  });

  it("compute-crust rejects mantle forcing from a different mesh cell count", () => {
    const width = 32;
    const height = 20;

    const ctx = { env: { dimensions: { width, height } }, knobs: {} };
    const meshConfig = computeMesh.normalize(
      {
        strategy: "default",
        config: { plateCount: 8, cellsPerPlate: 3, relaxationSteps: 2 },
      },
      ctx as any
    );

    const mesh = computeMesh.run({ width, height, rngSeed: 50 }, meshConfig).mesh;
    const mantleForcing = deriveMantleForcing(mesh, 51);
    const shorterMantleForcing = truncateMantleForcing(mantleForcing, mesh.cellCount - 1);

    expect(() =>
      computeCrust.run(
        { mesh, mantleForcing: shorterMantleForcing, rngSeed: 51 },
        computeCrust.defaultConfig
      )
    ).toThrow(/mantleForcing\.cellCount/);
  });

  it("crust publishes an isostatic baseline and projects it to tiles (basaltic lid)", () => {
    const width = 60;
    const height = 40;

    const ctx = { env: { dimensions: { width, height } }, knobs: {} };
    const meshConfig = computeMesh.normalize(
      {
        strategy: "default",
        config: { plateCount: 16, cellsPerPlate: 3, relaxationSteps: 2 },
      },
      ctx as any
    );

    const mesh = computeMesh.run({ width, height, rngSeed: 10 }, meshConfig).mesh;
    const mantleForcing = deriveMantleForcing(mesh, 11);
    const crust = computeCrust.run(
      { mesh, mantleForcing, rngSeed: 11 },
      computeCrust.defaultConfig
    ).crust;
    const plateGraph = computePlateGraph.run(
      { mesh, crust, rngSeed: 12 },
      { strategy: "default", config: { plateCount: 16 } }
    ).plateGraph;
    const plateMotion = derivePlateMotion(mesh, plateGraph, 13);
    const segments = computeTectonicSegments.run(
      { mesh, crust, plateGraph, plateMotion },
      computeTectonicSegments.defaultConfig
    ).segments;
    const historyResult = runTectonicHistoryChain({
      mesh,
      crust,
      mantleForcing,
      plateGraph,
      plateMotion,
    });
    const projection = computePlatesTensors.run(
      {
        width,
        height,
        mesh,
        crust,
        plateGraph,
        plateMotion,
        tectonics: historyResult.tectonics,
        tectonicHistory: historyResult.tectonicHistory,
      },
      computePlatesTensors.defaultConfig
    );
    const crustTiles = projection.crustTiles;

    let maxDelta = 0;
    for (let i = 0; i < crustTiles.baseElevation.length; i += 13) {
      const cell = projection.tileToCellIndex[i] ?? 0;
      const delta = Math.abs((crustTiles.baseElevation[i] ?? 0) - (crust.baseElevation[cell] ?? 0));
      if (delta > maxDelta) maxDelta = delta;
      expect(crustTiles.type[i]).toBe(0);
    }
    expect(maxDelta).toBeLessThan(1e-6);
  });

  it("compute-plates-tensors rejects truthy provenance and plate motion incompatible with projection inputs", () => {
    const width = 36;
    const height = 24;

    const ctx = { env: { dimensions: { width, height } }, knobs: {} };
    const meshConfig = computeMesh.normalize(
      {
        strategy: "default",
        config: { plateCount: 10, cellsPerPlate: 3, relaxationSteps: 2 },
      },
      ctx as any
    );

    const mesh = computeMesh.run({ width, height, rngSeed: 60 }, meshConfig).mesh;
    const mantleForcing = deriveMantleForcing(mesh, 61);
    const crust = computeCrust.run(
      { mesh, mantleForcing, rngSeed: 61 },
      computeCrust.defaultConfig
    ).crust;
    const plateGraph = computePlateGraph.run(
      { mesh, crust, rngSeed: 62 },
      { strategy: "default", config: { plateCount: 10 } }
    ).plateGraph;
    const plateMotion = derivePlateMotion(mesh, plateGraph, 63);
    const historyResult = runTectonicHistoryChain({
      mesh,
      crust,
      mantleForcing,
      plateGraph,
      plateMotion,
    });

    const baseInput = {
      width,
      height,
      mesh,
      crust,
      plateGraph,
      plateMotion,
      tectonics: historyResult.tectonics,
      tectonicHistory: historyResult.tectonicHistory,
    };

    expect(() =>
      computePlatesTensors.run(
        {
          ...baseInput,
          tectonicProvenance: truncateTectonicProvenance(
            historyResult.tectonicProvenance,
            mesh.cellCount - 1
          ),
        },
        computePlatesTensors.defaultConfig
      )
    ).toThrow(/tectonicProvenance\.cellCount/);

    expect(() =>
      computePlatesTensors.run(
        {
          ...baseInput,
          plateMotion: appendPlateMotionPlate(plateMotion),
          tectonicProvenance: historyResult.tectonicProvenance,
        },
        computePlatesTensors.defaultConfig
      )
    ).toThrow(/plateMotion\.plateCount/);
  });
});
