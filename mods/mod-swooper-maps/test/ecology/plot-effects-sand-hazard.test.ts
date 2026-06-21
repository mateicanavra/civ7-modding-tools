import { describe, expect, it } from "bun:test";
import ecology from "@mapgen/domain/ecology/ops";
import { normalizeOpSelectionOrThrow } from "../support/compiler-helpers.js";

// Deep-desert hazard: the sand channel places the cosmetic, art-backed PLOTEFFECT_SAND
// AND co-places the permanent damaging PLOTEFFECT_DESERT_HEAT on the SAME selected tiles
// (visible marker + per-turn attrition). This guards that co-placement wiring.
const WIDTH = 2;
const HEIGHT = 2;
const SIZE = WIDTH * HEIGHT;

const env = {
  seed: 0,
  dimensions: { width: WIDTH, height: HEIGHT },
  latitudeBounds: { topLatitude: 0, bottomLatitude: 0 },
};

const runSandPlan = (config: Record<string, unknown>) => {
  const planSelection = normalizeOpSelectionOrThrow(
    ecology.ops.planPlotEffects,
    { strategy: "default", config },
    { ctx: { env, knobs: {} }, path: "/ops/planPlotEffects" }
  );

  // All four tiles sand-eligible with descending scores.
  const sandScore01 = new Float32Array([0.9, 0.8, 0.7, 0.6]);
  const sandEligibleMask = new Uint8Array(SIZE).fill(1);

  return ecology.ops.planPlotEffects.run(
    {
      width: WIDTH,
      height: HEIGHT,
      seed: 0,
      snowScore01: new Float32Array(SIZE),
      snowEligibleMask: new Uint8Array(SIZE),
      sandScore01,
      sandEligibleMask,
      burnedScore01: new Float32Array(SIZE),
      burnedEligibleMask: new Uint8Array(SIZE),
      jungleScore01: new Float32Array(SIZE),
      jungleEligibleMask: new Uint8Array(SIZE),
    },
    planSelection
  );
};

describe("plot effects (sand hazard co-placement)", () => {
  it("co-places PLOTEFFECT_DESERT_HEAT on every sand tile when a hazard is configured", () => {
    const result = runSandPlan({
      snow: { enabled: false },
      sand: {
        enabled: true,
        coveragePct: 100,
        selector: { typeName: "PLOTEFFECT_SAND" },
        hazard: { typeName: "PLOTEFFECT_DESERT_HEAT" },
      },
      burned: { enabled: false },
    });

    const sand = result.placements.filter((p) => p.plotEffect === "PLOTEFFECT_SAND");
    const heat = result.placements.filter((p) => p.plotEffect === "PLOTEFFECT_DESERT_HEAT");

    // One SAND + one DESERT_HEAT per eligible tile, on identical coordinates.
    expect(sand.length).toBe(SIZE);
    expect(heat.length).toBe(SIZE);
    const key = (p: { x: number; y: number }) => `${p.x},${p.y}`;
    expect(new Set(heat.map(key))).toEqual(new Set(sand.map(key)));
  });

  it("places only cosmetic sand when no hazard is configured", () => {
    const result = runSandPlan({
      snow: { enabled: false },
      sand: { enabled: true, coveragePct: 100, selector: { typeName: "PLOTEFFECT_SAND" } },
      burned: { enabled: false },
    });

    expect(result.placements.every((p) => p.plotEffect === "PLOTEFFECT_SAND")).toBe(true);
    expect(result.placements.length).toBe(SIZE);
  });
});
