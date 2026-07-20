import { describe, expect, it } from "bun:test";
import ecology from "@mapgen/domain/ecology/ops";
import { normalizeOpSelectionOrThrow } from "../support/compiler-helpers.js";

// Deep-rainforest hazard: the jungle channel emits only jungle-fever intent.
// Map projection owns the Civ7 plot-effect key.
const WIDTH = 2;
const HEIGHT = 2;
const SIZE = WIDTH * HEIGHT;

const env = {
  seed: 0,
  dimensions: { width: WIDTH, height: HEIGHT },
  latitudeBounds: { topLatitude: 0, bottomLatitude: 0 },
};

describe("plot effects (jungle / jungle fever hazard)", () => {
  it("places jungle-fever intent on eligible jungle tiles by top-coverage", () => {
    const planSelection = normalizeOpSelectionOrThrow(
      ecology.ops.planPlotEffects,
      {
        ...ecology.ops.planPlotEffects.defaultConfig,
        config: {
          ...ecology.ops.planPlotEffects.defaultConfig.config,
          jungle: {
            ...ecology.ops.planPlotEffects.defaultConfig.config.jungle,
            enabled: true,
            coveragePct: 100,
          },
        },
      },
      { ctx: { env, knobs: {} }, path: "/ops/planPlotEffects" }
    );

    const jungleScore01 = new Float32Array([0.9, 0.8, 0.7, 0.6]);
    const jungleEligibleMask = new Uint8Array(SIZE).fill(1);

    const result = ecology.ops.planPlotEffects.run(
      {
        width: WIDTH,
        height: HEIGHT,
        seed: 0,
        snowScore01: new Float32Array(SIZE),
        snowEligibleMask: new Uint8Array(SIZE),
        sandScore01: new Float32Array(SIZE),
        sandEligibleMask: new Uint8Array(SIZE),
        burnedScore01: new Float32Array(SIZE),
        burnedEligibleMask: new Uint8Array(SIZE),
        jungleScore01,
        jungleEligibleMask,
      },
      planSelection
    );

    expect(result.placements.length).toBe(SIZE);
    expect(result.placements.every((p) => p.plotEffect === "jungle-fever")).toBe(true);
  });
});
