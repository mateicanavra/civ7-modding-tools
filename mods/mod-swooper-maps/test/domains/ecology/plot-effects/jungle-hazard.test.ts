import { describe, expect, it } from "bun:test";
import ecology from "@mapgen/domain/ecology/ops";
import { normalizeOperationSelectionForTest } from "@swooper/mapgen-core/testing";

// Deep-rainforest hazard: the jungle channel emits only jungle-fever intent.
// Map projection owns the Civ7 plot-effect key.
const syntheticDimensions = { width: 2, height: 2 } as const;
const { width, height } = syntheticDimensions;
const size = width * height;

describe("plot effects (jungle / jungle fever hazard)", () => {
  it("places jungle-fever intent on eligible jungle tiles by top-coverage", () => {
    const planSelection = normalizeOperationSelectionForTest(
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
      { path: "/ops/planPlotEffects" }
    );

    const jungleScore01 = new Float32Array([0.9, 0.8, 0.7, 0.6]);
    const jungleEligibleMask = new Uint8Array(size).fill(1);

    const result = ecology.ops.planPlotEffects.run(
      {
        width,
        height,
        seed: 0,
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
