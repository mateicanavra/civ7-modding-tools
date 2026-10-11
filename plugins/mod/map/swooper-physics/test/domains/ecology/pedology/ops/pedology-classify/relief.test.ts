import { describe, expect, it } from "bun:test";
import ecology from "../../../../../../src/domain/ecology/router.js";
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
      precipitation: new Float32Array(size),
      surfaceWetness: new Float32Array(size),
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

  it("preserves the atmospheric fertility scale without clipping precipitation to the native codec", () => {
    const input = {
      width: 4,
      height: 1,
      landMask: Uint8Array.of(1, 1, 1, 0),
      elevation: new Int16Array(4),
      precipitation: Float32Array.of(180.5, 360.5, 600, 600),
      surfaceWetness: Float32Array.of(150 / 255, 0.5, 1, 1),
    };
    const before = structuredClone(input);
    const result = runAdmittedOperationForTest(classifyPedology, input, {
      strategy: "balanced",
      config: {
        climateWeight: 1, reliefWeight: 0, sedimentWeight: 0,
        bedrockWeight: 0, fertilityCeiling: 1,
      },
    });

    expect(result.fertility[0]).toBe(Math.fround((180.5 + 255 * input.surfaceWetness[0]!) / 510));
    expect(result.fertility[1]).toBe(Math.fround((360.5 + 255 * 0.5) / 510));
    expect(result.fertility[2]).toBe(1);
    expect(result.fertility[3]).toBe(0);
    expect(input).toEqual(before);
  });
});
