import { describe, expect, it } from "bun:test";
import { RIVER_CLASS_MAJOR } from "@mapgen/domain/hydrology/modules/hydrography/model/policy/river-class.js";
import hydrology from "@mapgen/domain/hydrology/router";
import { TEST_MAP_SIZE } from "../../../../../setup.js";

const { refinePrecipitation } = hydrology.climate.ops;

function indexOf(x: number, y: number, width: number): number {
  return y * width + x;
}

function runRiverCorridor(source: number, adjacencyRadius: number) {
  const { width, height } = TEST_MAP_SIZE.dimensions;
  const size = width * height;
  const riverClass = new Uint8Array(size);
  riverClass[source] = RIVER_CLASS_MAJOR;

  return refinePrecipitation.run(
    {
      width,
      height,
      elevation: new Int16Array(size),
      landMask: new Uint8Array(size).fill(1),
      rainfall: new Uint8Array(size),
      humidity: new Uint8Array(size),
      riverClass,
    },
    {
      strategy: "riparian-basin-wetness",
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

describe("hydrology/refine-precipitation riparian and basin wetness", () => {
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

  it("adds basin wetness only to locally closed low ground and preserves the input vintage", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const size = width * height;
    const centerX = 4;
    const centerY = 4;
    const center = indexOf(centerX, centerY, width);
    const elevation = new Int16Array(size).fill(100);
    elevation[center] = 0;
    const rainfall = new Uint8Array(size).fill(20);
    const humidity = new Uint8Array(size).fill(25);
    const landMask = new Uint8Array(size).fill(1);
    landMask[0] = 0;

    const closed = refinePrecipitation.run(
      {
        width,
        height,
        elevation,
        landMask,
        rainfall,
        humidity,
        riverClass: new Uint8Array(size),
      },
      {
        strategy: "riparian-basin-wetness",
        config: {
          riverCorridor: {
            adjacencyRadius: 1,
            lowlandAdjacencyBonus: 0,
            highlandAdjacencyBonus: 0,
            lowlandElevationMax: 250,
          },
          lowBasin: {
            radius: 1,
            delta: 6,
            elevationMax: 200,
            openThresholdM: 20,
          },
        },
      }
    );

    expect(closed.rainfall).not.toBe(rainfall);
    expect(closed.humidity).not.toBe(humidity);
    expect(rainfall[center]).toBe(20);
    expect(humidity[center]).toBe(25);
    expect(closed.rainfall[center]).toBe(26);
    expect(closed.humidity[center]).toBe(33);
    expect(closed.rainfall[0]).toBe(20);
    expect(closed.humidity[0]).toBe(25);

    elevation[indexOf(centerX + 1, centerY, width)] = 10;
    const open = refinePrecipitation.run(
      {
        width,
        height,
        elevation,
        landMask,
        rainfall,
        humidity,
        riverClass: new Uint8Array(size),
      },
      {
        strategy: "riparian-basin-wetness",
        config: {
          riverCorridor: {
            adjacencyRadius: 1,
            lowlandAdjacencyBonus: 0,
            highlandAdjacencyBonus: 0,
            lowlandElevationMax: 250,
          },
          lowBasin: {
            radius: 1,
            delta: 6,
            elevationMax: 200,
            openThresholdM: 20,
          },
        },
      }
    );
    expect(open.rainfall[center]).toBe(20);
  });
});
