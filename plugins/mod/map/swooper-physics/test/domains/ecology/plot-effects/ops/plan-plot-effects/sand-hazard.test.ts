import { describe, expect, it } from "bun:test";
import ecology from "../../../../../../src/domain/ecology/router.js";
import { normalizeOperationSelectionForTest } from "@swooper/mapgen-core/testing";
import { TEST_MAP_SEED, TEST_MAP_SIZE } from "../../../../../setup.js";

// Deep-desert hazard: the sand channel emits abstract sand intent and co-places
// desert-heat intent. Map projection owns Civ7 keys.
const { width, height } = TEST_MAP_SIZE.dimensions;
const size = width * height;

type SandConfig = typeof ecology.plotEffects.ops.planPlotEffects.defaultConfig.config.sand;

const runSandPlan = (sandConfig: Partial<SandConfig>) => {
  const planSelection = normalizeOperationSelectionForTest(
    ecology.plotEffects.ops.planPlotEffects,
    {
      ...ecology.plotEffects.ops.planPlotEffects.defaultConfig,
      config: {
        ...ecology.plotEffects.ops.planPlotEffects.defaultConfig.config,
        sand: {
          ...ecology.plotEffects.ops.planPlotEffects.defaultConfig.config.sand,
          ...sandConfig,
        },
      },
    },
    { path: "/ops/planPlotEffects" }
  );

  // The entire preset is eligible; the first four tiles carry differentiated scores.
  const sandScore01 = new Float32Array(size).fill(0.6);
  sandScore01.set([0.9, 0.8, 0.7, 0.6]);
  const sandEligibleMask = new Uint8Array(size).fill(1);

  return ecology.plotEffects.ops.planPlotEffects.run(
    {
      width,
      height,
      seed: TEST_MAP_SEED,
      snowScore01: new Float32Array(size),
      snowEligibleMask: new Uint8Array(size),
      sandScore01,
      sandEligibleMask,
      burnedScore01: new Float32Array(size),
      burnedEligibleMask: new Uint8Array(size),
      jungleScore01: new Float32Array(size),
      jungleEligibleMask: new Uint8Array(size),
    },
    planSelection
  );
};

describe("plot effects (sand hazard co-placement)", () => {
  it("co-places desert-heat intent on every sand tile when enabled", () => {
    const result = runSandPlan({
      enabled: true,
      coveragePct: 100,
      hazardEnabled: true,
    });

    const sand = result.placements.filter((p) => p.plotEffect === "sand");
    const heat = result.placements.filter((p) => p.plotEffect === "desert-heat");

    // One SAND + one DESERT_HEAT per eligible tile, on identical coordinates.
    expect(sand.length).toBe(size);
    expect(heat.length).toBe(size);
    const key = (p: { x: number; y: number }) => `${p.x},${p.y}`;
    expect(new Set(heat.map(key))).toEqual(new Set(sand.map(key)));
  });

  it("places only cosmetic sand when no hazard is configured", () => {
    const result = runSandPlan({ enabled: true, coveragePct: 100, hazardEnabled: false });

    expect(result.placements.every((p) => p.plotEffect === "sand")).toBe(true);
    expect(result.placements.length).toBe(size);
  });
});
