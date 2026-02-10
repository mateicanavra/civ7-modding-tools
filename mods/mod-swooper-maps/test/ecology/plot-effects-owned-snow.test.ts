import { describe, it, expect } from "bun:test";
import ecology from "@mapgen/domain/ecology/ops";
import { normalizeOpSelectionOrThrow } from "../support/compiler-helpers.js";

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
    const env = {
      seed: 0,
      dimensions: { width: input.width, height: input.height },
      latitudeBounds: { topLatitude: 0, bottomLatitude: 0 },
    };

    const scoreSnowSelection = normalizeOpSelectionOrThrow(
      ecology.ops.scorePlotEffectsSnow,
      {
        strategy: "default",
        config: {
          elevationStrategy: "percentile",
          elevationPercentileMin: 0,
          elevationPercentileMax: 1,
          elevationMin: 0,
          elevationMax: 3000,
          moistureMin: 0,
          moistureMax: 200,
          maxTemperature: 4,
          maxAridity: 0.85,
          freezeWeight: 1,
          elevationWeight: 1,
          moistureWeight: 1,
          scoreNormalization: 2,
          scoreBias: 0,
        },
      },
      { ctx: { env, knobs: {} }, path: "/ops/scorePlotEffectsSnow" }
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
        strategy: "default",
        config: {
          snow: {
            enabled: true,
            coveragePct: 100,
            lightThreshold: 0.1,
            mediumThreshold: 0.2,
            heavyThreshold: 0.3,
          },
          sand: { enabled: false },
          burned: { enabled: false },
        },
      },
      { ctx: { env, knobs: {} }, path: "/ops/planPlotEffects" }
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
      },
      planSelection
    );

    expect(result.placements.length).toBeGreaterThan(0);
    const anySnow = result.placements.some((placement) =>
      placement.plotEffect.startsWith("PLOTEFFECT_SNOW_")
    );
    expect(anySnow).toBe(true);
  });
});
