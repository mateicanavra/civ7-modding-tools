import { describe, expect, it } from "bun:test";
import ecology from "@mapgen/domain/ecology/router";
import { runAdmittedOperationForTest } from "@swooper/mapgen-core/testing";
import { TEST_MAP_SIZE } from "../../../../../setup.js";

const { classifyPedology } = ecology.pedology.ops;

describe("ecology/pedology/classify relief", () => {
  it("reduces fertility where a land tile rises sharply above its neighbors", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const size = width * height;
    const center = Math.floor(height / 2) * width + Math.floor(width / 2);
    const input = {
      width,
      height,
      landMask: new Uint8Array(size).fill(1),
      elevation: new Int16Array(size).fill(100),
      rainfall: new Uint8Array(size),
      humidity: new Uint8Array(size),
    };
    const reliefOnlySelection = {
      strategy: "balanced",
      config: {
        climateWeight: 0,
        reliefWeight: 1,
        sedimentWeight: 0,
        bedrockWeight: 0,
        fertilityCeiling: 1,
      },
    } as const;

    const flat = runAdmittedOperationForTest(classifyPedology, input, reliefOnlySelection);
    const cliff = runAdmittedOperationForTest(
      classifyPedology,
      {
        ...input,
        elevation: new Int16Array(input.elevation).fill(1_000, center, center + 1),
      },
      reliefOnlySelection
    );

    expect(cliff.fertility[center]).toBeLessThan(flat.fertility[center]!);
  });
});
