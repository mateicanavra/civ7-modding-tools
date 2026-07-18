import { describe, expect, it } from "bun:test";
import ecology from "@mapgen/domain/ecology/ops";
import { normalizeOpSelectionOrThrow } from "../../support/compiler-helpers.js";

// Deep-desert hazard: the sand channel emits abstract sand intent and co-places
// desert-heat intent. Map projection owns Civ7 keys.
const WIDTH = 2;
const HEIGHT = 2;
const SIZE = WIDTH * HEIGHT;

const runSandPlan = (sandConfig: Record<string, unknown>) => {
  const planSelection = normalizeOpSelectionOrThrow(
    ecology.ops.planPlotEffects,
    {
      ...ecology.ops.planPlotEffects.defaultConfig,
      config: {
        ...ecology.ops.planPlotEffects.defaultConfig.config,
        sand: {
          ...ecology.ops.planPlotEffects.defaultConfig.config.sand,
          ...sandConfig,
        },
      },
    },
    { path: "/ops/planPlotEffects" }
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
  it("co-places desert-heat intent on every sand tile when enabled", () => {
    const result = runSandPlan({
      enabled: true,
      coveragePct: 100,
      hazardEnabled: true,
    });

    const sand = result.placements.filter((p) => p.plotEffect === "sand");
    const heat = result.placements.filter((p) => p.plotEffect === "desert-heat");

    // One SAND + one DESERT_HEAT per eligible tile, on identical coordinates.
    expect(sand.length).toBe(SIZE);
    expect(heat.length).toBe(SIZE);
    const key = (p: { x: number; y: number }) => `${p.x},${p.y}`;
    expect(new Set(heat.map(key))).toEqual(new Set(sand.map(key)));
  });

  it("places only cosmetic sand when no hazard is configured", () => {
    const result = runSandPlan({ enabled: true, coveragePct: 100, hazardEnabled: false });

    expect(result.placements.every((p) => p.plotEffect === "sand")).toBe(true);
    expect(result.placements.length).toBe(SIZE);
  });
});
