import { describe, expect, it } from "bun:test";
import foundationOpsPublic from "@mapgen/domain/foundation/ops";
import { buildPlateTopology } from "@swooper/mapgen-core/lib/plates";
import { deriveMantleForcing, derivePlateMotion } from "../fixtures/tectonic-operation-chain.js";
import { runTectonicHistoryChain } from "../fixtures/tectonics-history.js";

const { computeCrust, computeMesh, computePlateGraph, computePlatesTensors } =
  foundationOpsPublic.ops;

function quantile(sorted: number[], q: number): number {
  if (sorted.length === 0) return 0;
  const clamped = Math.max(0, Math.min(1, q));
  const idx = Math.floor((sorted.length - 1) * clamped);
  return sorted[idx] ?? 0;
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < values.length; i++) sum += values[i] ?? 0;
  return sum / values.length;
}

function variance(values: number[]): number {
  if (values.length === 0) return 0;
  const average = mean(values);
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    const delta = (values[i] ?? 0) - average;
    sum += delta * delta;
  }
  return sum / values.length;
}

describe("foundation plate partition topology", () => {
  it("yields non-uniform areas and plausible adjacency degrees", () => {
    const syntheticDimensions = { width: 60, height: 40 } as const;
    const { width, height } = syntheticDimensions;
    const meshConfig = computeMesh.normalize({
      strategy: "default",
      config: { plateCount: 16, cellsPerPlate: 3, relaxationSteps: 2 },
    });

    const runCase = (seed: number) => {
      const mesh = computeMesh.run({ width, height, rngSeed: 1000 + seed }, meshConfig).mesh;
      const mantleForcing = deriveMantleForcing(mesh, 2000 + seed);
      const crust = computeCrust.run(
        { mesh, mantleForcing, rngSeed: 2000 + seed },
        computeCrust.defaultConfig
      ).crust;

      const plateGraph = computePlateGraph.run(
        { mesh, crust, rngSeed: 3000 + seed },
        {
          ...computePlateGraph.defaultConfig,
          config: { ...computePlateGraph.defaultConfig.config, plateCount: 16 },
        }
      ).plateGraph;

      const plateMotion = derivePlateMotion(mesh, plateGraph, 4000 + seed);
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
      const areas = topology.map((plate) => plate.area);
      const minArea = Math.min(...areas);

      const sortedAreas = [...areas].sort((a, b) => a - b);
      const p50 = quantile(sortedAreas, 0.5);
      const p90 = quantile(sortedAreas, 0.9);

      const degrees = topology.map((plate) => plate.neighbors.length);
      const meanDegree = mean(degrees);
      const degreeVar = variance(degrees);

      return { minArea, p50, p90, meanDegree, degreeVar };
    };

    const a = runCase(1);
    const b = runCase(2);

    for (const result of [a, b]) {
      expect(result.minArea).toBeGreaterThanOrEqual(8);
      expect(result.p50).toBeGreaterThan(0);
      expect(result.p90 / result.p50).toBeGreaterThanOrEqual(1.4);
      expect(result.meanDegree).toBeGreaterThanOrEqual(3);
      expect(result.meanDegree).toBeLessThanOrEqual(7);
      expect(result.degreeVar).toBeGreaterThan(0);
    }
  });
});
