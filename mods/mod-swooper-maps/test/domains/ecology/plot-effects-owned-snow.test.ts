import { describe, expect, it } from "bun:test";
import ecology from "@mapgen/domain/ecology/ops";
import { normalizeOpSelectionOrThrow } from "../../support/compiler-helpers.js";

const createInput = () => {
  const width = 2;
  const height = 2;
  const size = width * height;

  return {
    width,
    height,
    seed: 0,
    effectiveMoisture: new Float32Array(size).fill(120),
    surfaceTemperature: new Float32Array(size).fill(-6),
    aridityIndex: new Float32Array(size).fill(0.2),
    freezeIndex: new Float32Array(size).fill(0.95),
    elevation: new Int16Array(size).fill(2400),
    landMask: new Uint8Array(size).fill(1),
  };
};

describe("plot effects (owned)", () => {
  it("places permanent snow plot effects when thresholds pass", () => {
    const input = createInput();
    const scoreSnowSelection = normalizeOpSelectionOrThrow(
      ecology.ops.scorePlotEffectsSnow,
      ecology.ops.scorePlotEffectsSnow.defaultConfig,
      { path: "/ops/scorePlotEffectsSnow" }
    );

    const scoreSnowResult = ecology.ops.scorePlotEffectsSnow.run(
      {
        width: input.width,
        height: input.height,
        landMask: input.landMask,
        elevation: input.elevation,
        effectiveMoisture: input.effectiveMoisture,
        surfaceTemperature: input.surfaceTemperature,
        aridityIndex: input.aridityIndex,
        freezeIndex: input.freezeIndex,
      },
      scoreSnowSelection
    );

    const planSelection = normalizeOpSelectionOrThrow(
      ecology.ops.planPlotEffects,
      {
        ...ecology.ops.planPlotEffects.defaultConfig,
        config: {
          ...ecology.ops.planPlotEffects.defaultConfig.config,
          snow: {
            ...ecology.ops.planPlotEffects.defaultConfig.config.snow,
            enabled: true,
            coveragePct: 100,
            lightThreshold: 0.1,
            mediumThreshold: 0.2,
            heavyThreshold: 0.3,
          },
        },
      },
      { path: "/ops/planPlotEffects" }
    );

    const result = ecology.ops.planPlotEffects.run(
      {
        width: input.width,
        height: input.height,
        seed: input.seed,
        snowScore01: scoreSnowResult.score01,
        snowEligibleMask: scoreSnowResult.eligibleMask,
        sandScore01: new Float32Array(input.width * input.height),
        sandEligibleMask: new Uint8Array(input.width * input.height),
        burnedScore01: new Float32Array(input.width * input.height),
        burnedEligibleMask: new Uint8Array(input.width * input.height),
        jungleScore01: new Float32Array(input.width * input.height),
        jungleEligibleMask: new Uint8Array(input.width * input.height),
      },
      planSelection
    );

    expect(result.placements.length).toBeGreaterThan(0);
    const anySnow = result.placements.some((placement) => placement.plotEffect.startsWith("snow-"));
    expect(anySnow).toBe(true);
  });
});
