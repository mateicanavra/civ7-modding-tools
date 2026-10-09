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

  it("preserves explicit precipitation/255 and normalized wetness fertility without a byte round-trip", () => {
    const input = {
      width: 4, height: 1, landMask: new Uint8Array(4).fill(1), elevation: new Int16Array(4),
      precipitation: new Float32Array([51.125, 300.5, 600.25, 0]),
      surfaceWetness: new Float32Array([0.12345, 0.23456, 1, 0]),
    };
    const selection = {
      strategy: "balanced", config: { climateWeight: 1, reliefWeight: 0, sedimentWeight: 0, bedrockWeight: 0, fertilityCeiling: 1 },
    } as const;
    const before = structuredClone(input);
    const result = runAdmittedOperationForTest(classifyPedology, input, selection);
    for (let i = 0; i < 4; i++) {
      const moisture = 0.5 * (input.precipitation[i]! / 255 + input.surfaceWetness[i]!);
      expect(result.fertility[i]).toBe(Math.fround(Math.max(0, Math.min(1, moisture))));
    }
    expect(result.fertility[1]).toBeGreaterThan(0.5);
    expect(result.fertility[2]).toBe(1);
    expect(input).toEqual(before);
    for (const precipitation of [NaN, Infinity, -0.25]) {
      const malformed = structuredClone(input);
      malformed.precipitation[0] = precipitation;
      expect(() => runAdmittedOperationForTest(classifyPedology, malformed, selection)).toThrow("precipitation");
    }
    for (const wetness of [NaN, -0.01, 1.01]) {
      const malformed = structuredClone(input);
      malformed.surfaceWetness[0] = wetness;
      expect(() => runAdmittedOperationForTest(classifyPedology, malformed, selection)).toThrow("surface wetness");
    }
  });
});
