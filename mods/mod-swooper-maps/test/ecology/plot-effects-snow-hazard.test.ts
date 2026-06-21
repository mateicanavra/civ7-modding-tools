import { describe, expect, it } from "bun:test";
import ecology from "@mapgen/domain/ecology/ops";
import { normalizeOpSelectionOrThrow } from "../support/compiler-helpers.js";

// Deep-cold hazard: the snow channel places the cosmetic permanent-snow tier AND co-places
// the permanent damaging PLOTEFFECT_FROSTBITE on the COLDEST selected tiles
// (snowScore01 >= hazardThreshold). This guards the threshold-gated co-placement.
const WIDTH = 2;
const HEIGHT = 2;
const SIZE = WIDTH * HEIGHT;

const env = {
  seed: 0,
  dimensions: { width: WIDTH, height: HEIGHT },
  latitudeBounds: { topLatitude: 0, bottomLatitude: 0 },
};

const runSnowPlan = (snowConfig: Record<string, unknown>) => {
  const planSelection = normalizeOpSelectionOrThrow(
    ecology.ops.planPlotEffects,
    {
      strategy: "default",
      config: { snow: snowConfig, sand: { enabled: false }, burned: { enabled: false } },
    },
    { ctx: { env, knobs: {} }, path: "/ops/planPlotEffects" }
  );

  // Two coldest tiles (>=0.85), two below the hazard threshold; all eligible.
  const snowScore01 = new Float32Array([0.92, 0.87, 0.84, 0.5]);
  const snowEligibleMask = new Uint8Array(SIZE).fill(1);

  return ecology.ops.planPlotEffects.run(
    {
      width: WIDTH,
      height: HEIGHT,
      seed: 0,
      snowScore01,
      snowEligibleMask,
      sandScore01: new Float32Array(SIZE),
      sandEligibleMask: new Uint8Array(SIZE),
      burnedScore01: new Float32Array(SIZE),
      burnedEligibleMask: new Uint8Array(SIZE),
      jungleScore01: new Float32Array(SIZE),
      jungleEligibleMask: new Uint8Array(SIZE),
    },
    planSelection
  );
};

describe("plot effects (snow / frostbite hazard)", () => {
  it("co-places PLOTEFFECT_FROSTBITE only on tiles at/above hazardThreshold", () => {
    const result = runSnowPlan({
      enabled: true,
      coveragePct: 100,
      lightThreshold: 0.1,
      mediumThreshold: 0.6,
      heavyThreshold: 0.8,
      hazardThreshold: 0.85,
      hazard: { typeName: "PLOTEFFECT_FROSTBITE" },
    });

    const snow = result.placements.filter((p) => p.plotEffect.startsWith("PLOTEFFECT_SNOW_"));
    const frost = result.placements.filter((p) => p.plotEffect === "PLOTEFFECT_FROSTBITE");

    expect(snow.length).toBe(SIZE); // all four eligible tiles get a cosmetic snow tier
    expect(frost.length).toBe(2); // only the two with score >= 0.85
  });

  it("places only cosmetic snow when no hazard is configured", () => {
    const result = runSnowPlan({
      enabled: true,
      coveragePct: 100,
      lightThreshold: 0.1,
      mediumThreshold: 0.6,
      heavyThreshold: 0.8,
    });

    expect(result.placements.every((p) => p.plotEffect.startsWith("PLOTEFFECT_SNOW_"))).toBe(true);
  });
});
