import { describe, expect, it } from "bun:test";

import foundation from "@mapgen/domain/foundation/router";
import { deriveStepSeed } from "@swooper/mapgen-core";
import { TEST_MAP_SEED, TEST_MAP_SIZE } from "../../../../../setup.js";

const { computeMesh } = foundation.mesh.ops;
const { computePlateGraph } = foundation.lithosphere.ops;

function collectPlateCells(cellToPlate: Int16Array, plateId: number): number[] {
  const cells: number[] = [];
  for (let cellId = 0; cellId < cellToPlate.length; cellId++) {
    if (cellToPlate[cellId] === plateId) cells.push(cellId);
  }
  return cells;
}

function isContiguous(
  generatedMesh: Readonly<{ neighborsOffsets: Int32Array; neighbors: Int32Array }>,
  cells: readonly number[]
): boolean {
  if (cells.length <= 1) return true;
  const target = new Set(cells);
  const visited = new Set<number>();
  const queue = [cells[0]!];

  while (queue.length > 0) {
    const cellId = queue.pop()!;
    if (!target.has(cellId) || visited.has(cellId)) continue;
    visited.add(cellId);

    const start = generatedMesh.neighborsOffsets[cellId] ?? 0;
    const end = generatedMesh.neighborsOffsets[cellId + 1] ?? start;
    for (let neighborIndex = start; neighborIndex < end; neighborIndex++) {
      const neighborId = generatedMesh.neighbors[neighborIndex] ?? -1;
      if (target.has(neighborId) && !visited.has(neighborId)) {
        queue.push(neighborId);
      }
    }
  }

  return visited.size === cells.length;
}

function generatePlateInput(params: {
  plateCount: number;
  cellsPerPlate: number;
  seedLabel: string;
}) {
  const { width, height } = TEST_MAP_SIZE.dimensions;
  const generatedMesh = computeMesh.run(
    {
      width,
      height,
      rngSeed: deriveStepSeed(TEST_MAP_SEED, `${params.seedLabel}:mesh`),
    },
    computeMesh.normalize({
      strategy: "jittered-delaunay",
      config: {
        plateCount: params.plateCount,
        cellsPerPlate: params.cellsPerPlate,
        relaxationSteps: 2,
      },
    })
  ).mesh;
  const strength = new Float32Array(generatedMesh.cellCount);
  strength.fill(0.5);

  return {
    generatedMesh,
    crust: {
      maturity: new Float32Array(generatedMesh.cellCount),
      strength,
    },
    rngSeed: deriveStepSeed(TEST_MAP_SEED, `${params.seedLabel}:plate-graph`),
  };
}

describe("foundation/compute-plate-graph polar policy", () => {
  it("reserves one contiguous cap at each pole without implicit microplates", () => {
    const input = generatePlateInput({
      plateCount: 18,
      cellsPerPlate: 3,
      seedLabel: "test:foundation:polar-caps",
    });
    const plateGraph = computePlateGraph.run(
      {
        mesh: input.generatedMesh,
        crust: input.crust,
        rngSeed: input.rngSeed,
      },
      {
        ...computePlateGraph.defaultConfig,
        config: {
          ...computePlateGraph.defaultConfig.config,
          plateCount: 18,
          polarCaps: {
            ...computePlateGraph.defaultConfig.config.polarCaps,
            capFraction: 0.1,
            microplatesPerPole: 0,
          },
        },
      }
    ).plateGraph;

    const caps = plateGraph.plates.filter((plate) => plate.role === "polarCap");
    const microplates = plateGraph.plates.filter((plate) => plate.role === "polarMicroplate");
    expect(caps).toHaveLength(2);
    expect(microplates).toHaveLength(0);

    const midpointY = (input.generatedMesh.bbox.yt + input.generatedMesh.bbox.yb) * 0.5;
    expect(caps.filter((plate) => plate.seedY < midpointY)).toHaveLength(1);
    expect(caps.filter((plate) => plate.seedY > midpointY)).toHaveLength(1);

    for (const cap of caps) {
      const cells = collectPlateCells(plateGraph.cellToPlate, cap.id);
      expect(cells.length).toBeGreaterThan(Math.floor(input.generatedMesh.cellCount * 0.03));
      expect(isContiguous(input.generatedMesh, cells)).toBe(true);
    }
  });

  it("creates the configured microplates per pole without sub-minimum slivers", () => {
    const input = generatePlateInput({
      plateCount: 24,
      cellsPerPlate: 8,
      seedLabel: "test:foundation:polar-microplates",
    });
    const microplateMinAreaCells = 6;
    const plateGraph = computePlateGraph.run(
      {
        mesh: input.generatedMesh,
        crust: input.crust,
        rngSeed: input.rngSeed,
      },
      {
        ...computePlateGraph.defaultConfig,
        config: {
          ...computePlateGraph.defaultConfig.config,
          plateCount: 24,
          polarCaps: {
            ...computePlateGraph.defaultConfig.config.polarCaps,
            capFraction: 0.08,
            microplateBandFraction: 0.25,
            microplatesPerPole: 2,
            microplatesMinPlateCount: 0,
            microplateMinAreaCells,
          },
        },
      }
    ).plateGraph;

    const microplates = plateGraph.plates.filter((plate) => plate.role === "polarMicroplate");
    expect(microplates).toHaveLength(4);

    const midpointY = (input.generatedMesh.bbox.yt + input.generatedMesh.bbox.yb) * 0.5;
    expect(microplates.filter((plate) => plate.seedY < midpointY)).toHaveLength(2);
    expect(microplates.filter((plate) => plate.seedY > midpointY)).toHaveLength(2);

    for (const microplate of microplates) {
      const cells = collectPlateCells(plateGraph.cellToPlate, microplate.id);
      expect(cells.length).toBeGreaterThanOrEqual(microplateMinAreaCells);
      expect(isContiguous(input.generatedMesh, cells)).toBe(true);
    }
  });
});
