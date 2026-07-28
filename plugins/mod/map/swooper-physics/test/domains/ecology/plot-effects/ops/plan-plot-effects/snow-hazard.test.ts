import { describe, expect, it } from "bun:test";
import ecology from "../../../../../../src/domain/ecology/router.js";
import { normalizeOperationSelectionForTest } from "@swooper/mapgen-core/testing";
import { TEST_MAP_SEED, TEST_MAP_SIZE } from "../../../../../setup.js";

// Deep-cold hazard: the snow channel emits abstract snow tier intent and co-places
// frostbite intent on the coldest selected tiles. Map projection owns Civ7 keys.
const { width, height } = TEST_MAP_SIZE.dimensions;
const size = width * height;

type SnowConfig = typeof ecology.plotEffects.ops.planPlotEffects.defaultConfig.config.snow;

const runSnowPlan = (snowConfig: Partial<SnowConfig>) => {
  const planSelection = normalizeOperationSelectionForTest(
    ecology.plotEffects.ops.planPlotEffects,
    {
      ...ecology.plotEffects.ops.planPlotEffects.defaultConfig,
      config: {
        ...ecology.plotEffects.ops.planPlotEffects.defaultConfig.config,
        snow: {
          ...ecology.plotEffects.ops.planPlotEffects.defaultConfig.config.snow,
          ...snowConfig,
        },
      },
    },
    { path: "/ops/planPlotEffects" }
  );

  // The entire preset is eligible; the first four tiles carry differentiated scores.
  const snowScore01 = new Float32Array(size).fill(0.5);
  snowScore01.set([0.92, 0.87, 0.84, 0.5]);
  const snowEligibleMask = new Uint8Array(size).fill(1);

  return ecology.plotEffects.ops.planPlotEffects.run(
    {
      width,
      height,
      seed: TEST_MAP_SEED,
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

    expect(snow.length).toBe(size);
    expect(frost.length).toBe(2);
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
