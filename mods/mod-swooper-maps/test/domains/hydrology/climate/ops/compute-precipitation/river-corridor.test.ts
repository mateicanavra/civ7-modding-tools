import { describe, expect, it } from "bun:test";
import { RIVER_CLASS_MAJOR } from "@mapgen/domain/hydrology/modules/hydrography/model/policy/river-class.js";
import hydrology from "@mapgen/domain/hydrology/router";
import { TEST_MAP_SEED, TEST_MAP_SIZE } from "../../../../../setup.js";

const { computePrecipitation } = hydrology.climate.ops;

function indexOf(x: number, y: number, width: number): number {
  return y * width + x;
}

function runRiverCorridor(source: number, adjacencyRadius: number) {
  const { width, height } = TEST_MAP_SIZE.dimensions;
  const size = width * height;
  const riverClass = new Uint8Array(size);
  riverClass[source] = RIVER_CLASS_MAJOR;

  return computePrecipitation.run(
    {
      width,
      height,
      latitudeByRow: new Float32Array(height),
      elevation: new Int16Array(size),
      landMask: new Uint8Array(size).fill(1),
      windU: new Int8Array(size),
      windV: new Int8Array(size),
      humidityF32: new Float32Array(size),
      rainfallIn: new Uint8Array(size),
      humidityIn: new Uint8Array(size),
      riverClass,
      perlinSeed: TEST_MAP_SEED,
    },
    {
      strategy: "refine",
      config: {
        riverCorridor: {
          adjacencyRadius,
          lowlandAdjacencyBonus: 14,
          highlandAdjacencyBonus: 10,
          lowlandElevationMax: 250,
        },
        lowBasin: {
          radius: 2,
          delta: 0,
          elevationMax: 200,
          openThresholdM: 20,
        },
      },
    }
  );
}

describe("hydrology/compute-precipitation river corridor", () => {
  it("applies the authored bonus exactly across the wrapped Civ7 hex radius", () => {
    const { width } = TEST_MAP_SIZE.dimensions;
    const source = indexOf(0, 2, width);
    const result = runRiverCorridor(source, 1);

    const expectedFootprint = [
      indexOf(0, 2, width),
      indexOf(width - 1, 2, width),
      indexOf(1, 2, width),
      indexOf(0, 1, width),
      indexOf(0, 3, width),
      indexOf(width - 1, 1, width),
      indexOf(width - 1, 3, width),
    ];
    for (const tileIndex of expectedFootprint) {
      expect(result.rainfall[tileIndex]).toBe(14);
    }
    expect(result.rainfall[indexOf(1, 1, width)]).toBe(0);
    expect(result.rainfall[indexOf(1, 3, width)]).toBe(0);
    expect(result.rainfall[indexOf(width - 1, 2, width)]).toBe(14);
  });

  it("honors a wider authored radius while clipping the corridor at the polar edges", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const result = runRiverCorridor(indexOf(0, 0, width), 2);

    expect(result.rainfall[indexOf(2, 0, width)]).toBe(14);
    expect(result.rainfall[indexOf(width - 2, 0, width)]).toBe(14);
    expect(result.rainfall[indexOf(3, 0, width)]).toBe(0);
    expect(result.rainfall[indexOf(width - 3, 0, width)]).toBe(0);
    expect(result.rainfall[indexOf(0, 2, width)]).toBe(14);
    expect(result.rainfall[indexOf(0, 3, width)]).toBe(0);
    expect(result.rainfall[indexOf(0, height - 1, width)]).toBe(0);
  });
});
