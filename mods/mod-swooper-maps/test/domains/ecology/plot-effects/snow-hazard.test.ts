import { describe, expect, it } from "bun:test";
import ecology from "@mapgen/domain/ecology/ops";
import { normalizeOperationSelectionForTest } from "@swooper/mapgen-core/testing";

// Deep-cold hazard: the snow channel emits abstract snow tier intent and co-places
// frostbite intent on the coldest selected tiles. Map projection owns Civ7 keys.
const syntheticDimensions = { width: 2, height: 2 } as const;
const { width, height } = syntheticDimensions;
const size = width * height;

const runSnowPlan = (snowConfig: Record<string, unknown>) => {
  const planSelection = normalizeOperationSelectionForTest(
    ecology.ops.planPlotEffects,
    {
      ...ecology.ops.planPlotEffects.defaultConfig,
      config: {
        ...ecology.ops.planPlotEffects.defaultConfig.config,
        snow: {
          ...ecology.ops.planPlotEffects.defaultConfig.config.snow,
          ...snowConfig,
        },
      },
    },
    { path: "/ops/planPlotEffects" }
  );

  // Two coldest tiles (>=0.85), two below the hazard threshold; all eligible.
  const snowScore01 = new Float32Array([0.92, 0.87, 0.84, 0.5]);
  const snowEligibleMask = new Uint8Array(size).fill(1);

  return ecology.ops.planPlotEffects.run(
    {
      width,
      height,
      seed: 0,
      snowScore01,
      snowEligibleMask,
      sandScore01: new Float32Array(size),
      sandEligibleMask: new Uint8Array(size),
      burnedScore01: new Float32Array(size),
      burnedEligibleMask: new Uint8Array(size),
      jungleScore01: new Float32Array(size),
      jungleEligibleMask: new Uint8Array(size),
    },
    planSelection
  );
};

describe("plot effects (snow / frostbite hazard)", () => {
  it("co-places frostbite intent only on tiles at/above hazardThreshold", () => {
    const result = runSnowPlan({
      enabled: true,
      coveragePct: 100,
      lightThreshold: 0.1,
      mediumThreshold: 0.6,
      heavyThreshold: 0.8,
      hazardThreshold: 0.85,
      hazardEnabled: true,
    });

    const snow = result.placements.filter((p) => p.plotEffect.startsWith("snow-"));
    const frost = result.placements.filter((p) => p.plotEffect === "frostbite");

    expect(snow.length).toBe(size); // all four eligible tiles get a cosmetic snow tier
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

    expect(result.placements.every((p) => p.plotEffect.startsWith("snow-"))).toBe(true);
  });
});
