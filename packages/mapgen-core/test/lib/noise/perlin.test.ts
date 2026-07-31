import { describe, expect, it } from "bun:test";
import { PerlinNoise } from "@mapgen/lib/noise/index.js";

const SAMPLE_POINTS = [
  [0.125, 0.25, 0.5],
  [1.25, -2.75, 4.5],
  [123.456, 78.9, -0.125],
] as const;

function fingerprint(noise: PerlinNoise): string {
  return SAMPLE_POINTS.map(([x, y, z]) => noise.noise3D(x, y, z).toPrecision(17)).join(":");
}

describe("lib/noise PerlinNoise", () => {
  it("preserves legacy constructor and setSeed golden output", () => {
    const noise = new PerlinNoise(42);
    expect(SAMPLE_POINTS.map(([x, y, z]) => noise.noise3D(x, y, z))).toEqual([
      -0.34277641773223877, 0.36168432235717773, 0.4882982703377743,
    ]);

    noise.setSeed(0);
    expect(SAMPLE_POINTS.map(([x, y, z]) => noise.noise3D(x, y, z))).toEqual([
      -0.08389873802661896, -0.10938167572021484, -0.569416567603205,
    ]);

    expect(fingerprint(new PerlinNoise(256))).toBe(fingerprint(new PerlinNoise(0)));
  });

  it("is deterministic and exposes explicit full-seed reseeding", () => {
    const first = PerlinNoise.fromFullSeed(0x12345678);
    const second = PerlinNoise.fromFullSeed(0x12345678);
    expect(fingerprint(first)).toBe(fingerprint(second));

    first.setFullSeed(0xabcdef01);
    expect(fingerprint(first)).toBe(fingerprint(PerlinNoise.fromFullSeed(0xabcdef01)));
    expect(fingerprint(first)).not.toBe(fingerprint(new PerlinNoise(0xabcdef01)));
  });

  it("includes seed bits above the legacy low byte", () => {
    const seed = 0x123456;
    expect(fingerprint(PerlinNoise.fromFullSeed(seed + 0x100))).not.toBe(
      fingerprint(PerlinNoise.fromFullSeed(seed))
    );
  });

  it("normalizes signed and unsigned representations of the same 32-bit pattern", () => {
    expect(fingerprint(PerlinNoise.fromFullSeed(-1))).toBe(
      fingerprint(PerlinNoise.fromFullSeed(0xffffffff))
    );
    expect(fingerprint(PerlinNoise.fromFullSeed(-0x80000000))).toBe(
      fingerprint(PerlinNoise.fromFullSeed(0x80000000))
    );
  });

  it("deterministically produces more than 256 distinct fingerprints", () => {
    const fingerprints = Array.from({ length: 512 }, (_, seed) =>
      fingerprint(PerlinNoise.fromFullSeed(seed))
    );
    const repeated = Array.from({ length: 512 }, (_, seed) =>
      fingerprint(PerlinNoise.fromFullSeed(seed))
    );

    expect(repeated).toEqual(fingerprints);
    expect(new Set(fingerprints).size).toBeGreaterThan(256);
  });
});
