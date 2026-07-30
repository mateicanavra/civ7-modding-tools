import { describe, expect, it } from "bun:test";
import ecology from "../../../../../../src/domain/ecology/router.js";
import { normalizeOperationSelectionForTest } from "@swooper/mapgen-core/testing";
import { TEST_MAP_SEED, TEST_MAP_SIZE } from "../../../../../setup.js";

// Deep-rainforest hazard: the jungle channel emits only jungle-fever intent.
// Map projection owns the Civ7 plot-effect key.
const { width, height } = TEST_MAP_SIZE.dimensions;
const size = width * height;

describe("plot effects (jungle / jungle fever hazard)", () => {
  it("places jungle-fever intent on eligible jungle tiles by top-coverage", () => {
    const planSelection = normalizeOperationSelectionForTest(
      ecology.plotEffects.ops.planPlotEffects,
      {
        ...ecology.plotEffects.ops.planPlotEffects.defaultConfig,
        config: {
          ...ecology.plotEffects.ops.planPlotEffects.defaultConfig.config,
          jungle: {
            ...ecology.plotEffects.ops.planPlotEffects.defaultConfig.config.jungle,
            enabled: true,
            coveragePct: 100,
          },
        },
      },
      { path: "/ops/planPlotEffects" }
    );

    const jungleScore01 = new Float32Array(size).fill(0.6);
    jungleScore01.set([0.9, 0.8, 0.7, 0.6]);
    const jungleEligibleMask = new Uint8Array(size).fill(1);

    const result = ecology.plotEffects.ops.planPlotEffects.run(
      {
        width,
        height,
        seed: TEST_MAP_SEED,
        snowScore01: new Float32Array(size),
        snowEligibleMask: new Uint8Array(size),
        sandScore01: new Float32Array(size),
        sandEligibleMask: new Uint8Array(size),
        burnedScore01: new Float32Array(size),
        burnedEligibleMask: new Uint8Array(size),
        jungleScore01,
        jungleEligibleMask,
      },
      planSelection
    );

    expect(result.placements.length).toBe(size);
    expect(result.placements.every((p) => p.plotEffect === "jungle-fever")).toBe(true);
  });
});
