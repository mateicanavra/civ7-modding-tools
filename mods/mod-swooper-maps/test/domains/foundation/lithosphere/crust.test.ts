import { describe, expect, it } from "bun:test";
import foundation from "@mapgen/domain/foundation/router";
import { TEST_MAP_SIZE } from "../../../map-size.js";
import {
  deriveMantleForcing,
  derivePlateMotion,
} from "../tectonics/fixtures/tectonic-operation-chain.js";
import { runTectonicHistoryChain } from "../tectonics/fixtures/tectonics-history.js";

const { computeMesh } = foundation.mesh.ops;
const { computeCrust, computePlateGraph } = foundation.lithosphere.ops;
const { computePlatesTensors } = foundation.projection.ops;

describe("foundation crust", () => {
  it("refuses mesh-field cardinality mismatches at the operation boundary", () => {
    let refusal: unknown;
    try {
      computeCrust.run(
        {
          mesh: { cellCount: 2 },
          mantleForcing: {
            cellCount: 2,
            divergence: new Float32Array(2),
            forcingMag: new Float32Array(1),
            stress: new Float32Array(2),
          },
        },
        computeCrust.defaultConfig
      );
    } catch (error) {
      refusal = error;
    }

    expect(refusal).toMatchObject({
      opId: "foundation/compute-crust",
      issues: [
        {
          code: "typed-array-cardinality",
          path: "$.mantleForcing.forcingMag",
          cardinalityPaths: ["mesh.cellCount"],
          expectedLength: 2,
          observedLength: 1,
        },
      ],
    });
  });

  it("initializes a basaltic lid with bounded fields", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const meshConfig = computeMesh.normalize({
      strategy: "jittered-delaunay",
      config: { plateCount: 16, cellsPerPlate: 4, relaxationSteps: 2 },
    });

    const mesh = computeMesh.run(
      {
        width,
        height,
        rngSeed: 10,
      },
      meshConfig
    ).mesh;

    const mantleForcing = deriveMantleForcing(mesh, 11);
    const crust = computeCrust.run({ mesh, mantleForcing }, computeCrust.defaultConfig).crust;

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

  it("publishes an isostatic baseline and projects its basaltic lid to tiles", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const meshConfig = computeMesh.normalize({
      strategy: "jittered-delaunay",
      config: { plateCount: 16, cellsPerPlate: 3, relaxationSteps: 2 },
    });

    const mesh = computeMesh.run({ width, height, rngSeed: 10 }, meshConfig).mesh;
    const mantleForcing = deriveMantleForcing(mesh, 11);
    const crust = computeCrust.run({ mesh, mantleForcing }, computeCrust.defaultConfig).crust;
    const plateGraph = computePlateGraph.run(
      { mesh, crust, rngSeed: 12 },
      {
        ...computePlateGraph.defaultConfig,
        config: { ...computePlateGraph.defaultConfig.config, plateCount: 16 },
      }
    ).plateGraph;
    const plateMotion = derivePlateMotion(mesh, plateGraph, 13);
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
});
