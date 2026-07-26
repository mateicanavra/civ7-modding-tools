import { describe, expect, it } from "bun:test";
import ecology from "@mapgen/domain/ecology/router";
import { normalizeOperationSelectionForTest } from "@swooper/mapgen-core/testing";
import { TEST_MAP_SEED, TEST_MAP_SIZE } from "../../../../../setup.js";

function f32(size: number, value: number): Float32Array {
  return new Float32Array(size).fill(value);
}

describe("planReefs operation", () => {
  it("keeps diagonal-stride lotus intent on lake tiles", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const size = width * height;
    const selection = normalizeOperationSelectionForTest(ecology.features.ops.planReefs, {
      strategy: "diagonal-stride",
      config: { minConfidence01: 0.5, stride: 1 },
    });
    const input = {
      width,
      height,
      seed: TEST_MAP_SEED,
      scoreReef01: f32(size, 0),
      scoreColdReef01: f32(size, 0),
      scoreAtoll01: f32(size, 0),
      scoreLotus01: f32(size, 1),
      featureOccupancyMask: new Uint8Array(size),
      reserved: new Uint8Array(size),
    };

    const withoutLakes = ecology.features.ops.planReefs.run(
      { ...input, lakeMask: new Uint8Array(size) },
      selection
    );
    const withLakes = ecology.features.ops.planReefs.run(
      { ...input, lakeMask: new Uint8Array(size).fill(1) },
      selection
    );

    expect(withoutLakes.placements).toEqual([]);
    expect(withLakes.placements).toHaveLength(size);
    expect(withLakes.placements.every(({ feature }) => feature === "lotus")).toBe(true);
  });

  it("uses one authored stride for the diagonal pattern", () => {
    const syntheticDimensions = { width: 6, height: 1 } as const;
    const { width, height } = syntheticDimensions;
    const size = width * height;
    const result = ecology.features.ops.planReefs.run(
      {
        width,
        height,
        seed: TEST_MAP_SEED,
        scoreReef01: f32(size, 1),
        scoreColdReef01: f32(size, 0),
        scoreAtoll01: f32(size, 0),
        scoreLotus01: f32(size, 0),
        lakeMask: new Uint8Array(size),
        featureOccupancyMask: new Uint8Array(size),
        reserved: new Uint8Array(size),
      },
      normalizeOperationSelectionForTest(ecology.features.ops.planReefs, {
        strategy: "diagonal-stride",
        config: { minConfidence01: 0.5, stride: 2 },
      })
    );

    expect(result.placements.map(({ x }) => x)).toEqual([0, 2, 4]);
  });
});
