import { defineVizMeta } from "@swooper/mapgen-core";
import { createStep } from "@swooper/mapgen-core/authoring";
import { buildPlotEffectsInput } from "./inputs.js";
import { applyPlotEffectPlacements } from "./apply.js";
import { logSnowEligibilitySummary } from "./diagnostics.js";
import PlotEffectsStepContract from "./contract.js";
import { PLOT_EFFECT_VIZ_CATEGORIES, plotEffectVizValueOrThrow } from "./viz.js";

const GROUP_MAP_ECOLOGY = "Map / Ecology (Engine)";

export default createStep(PlotEffectsStepContract, {
  run: (context, config, ops, deps) => {
    const artifacts = {
      classification: deps.artifacts.biomeClassification.read(context),
      heightfield: context.buffers.heightfield,
    };
    const input = buildPlotEffectsInput(context, artifacts);
    const scoreSnow = ops.scoreSnow(
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
      config.scoreSnow
    );
    const scoreSand = ops.scoreSand(
      {
        width: input.width,
        height: input.height,
        landMask: input.landMask,
        biomeIndex: input.biomeIndex,
        vegetationDensity: input.vegetationDensity,
        effectiveMoisture: input.effectiveMoisture,
        surfaceTemperature: input.surfaceTemperature,
        aridityIndex: input.aridityIndex,
        freezeIndex: input.freezeIndex,
      },
      config.scoreSand
    );
    const scoreBurned = ops.scoreBurned(
      {
        width: input.width,
        height: input.height,
        landMask: input.landMask,
        biomeIndex: input.biomeIndex,
        vegetationDensity: input.vegetationDensity,
        effectiveMoisture: input.effectiveMoisture,
        surfaceTemperature: input.surfaceTemperature,
        aridityIndex: input.aridityIndex,
        freezeIndex: input.freezeIndex,
      },
      config.scoreBurned
    );

    const result = ops.plotEffects(
      {
        width: input.width,
        height: input.height,
        seed: input.seed,
        snowScore01: scoreSnow.score01,
        snowEligibleMask: scoreSnow.eligibleMask,
        sandScore01: scoreSand.score01,
        sandEligibleMask: scoreSand.eligibleMask,
        burnedScore01: scoreBurned.score01,
        burnedEligibleMask: scoreBurned.eligibleMask,
      },
      config.plotEffects
    );

    if (context.trace.isVerbose) {
      logSnowEligibilitySummary(
        context.trace,
        input,
        config.scoreSnow.config,
        config.plotEffects.config.snow,
        result.placements,
        artifacts.heightfield.terrain
      );
    }

    if (result.placements.length > 0) {
      const positions = new Float32Array(result.placements.length * 2);
      const values = new Uint16Array(result.placements.length);
      for (let i = 0; i < result.placements.length; i++) {
        const placement = result.placements[i]!;
        positions[i * 2] = placement.x;
        positions[i * 2 + 1] = placement.y;

        values[i] = plotEffectVizValueOrThrow(placement.plotEffect);
      }

      context.viz?.dumpPoints(context.trace, {
        dataTypeKey: "map.ecology.plotEffects.plotEffect",
        spaceId: "tile.hexOddR",
        positions,
        values,
        valueFormat: "u16",
        meta: defineVizMeta("map.ecology.plotEffects.plotEffect", {
          label: "Plot Effects (Engine)",
          group: GROUP_MAP_ECOLOGY,
          categories: PLOT_EFFECT_VIZ_CATEGORIES,
        }),
      });
    }

    if (result.placements.length > 0) {
      applyPlotEffectPlacements(context, result.placements);
    }
  },
});
