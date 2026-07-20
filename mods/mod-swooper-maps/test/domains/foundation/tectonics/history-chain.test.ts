import { describe, expect, it } from "bun:test";
import foundationOpsPublic from "@mapgen/domain/foundation/ops";
import { TEST_MAP_SIZE } from "../../../map-size.js";
import { deriveMantleForcing, derivePlateMotion } from "../fixtures/tectonic-operation-chain.js";
import { runTectonicHistoryChain } from "../fixtures/tectonics-history.js";

const { computeCrust, computeMesh, computePlateGraph, computeTectonicSegments } =
  foundationOpsPublic.ops;

describe("foundation tectonic operation history chain", () => {
  it("keeps crust, plate graph, segments, and history deterministic and internally consistent", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const meshConfig = computeMesh.normalize({
      strategy: "default",
      config: { plateCount: 9, cellsPerPlate: 2, relaxationSteps: 2 },
    });

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
});
