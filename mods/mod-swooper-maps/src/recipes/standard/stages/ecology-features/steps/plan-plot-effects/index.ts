import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";

import { artifacts as ecologyArtifacts } from "../../../ecology/artifacts/index.js";
import PlanPlotEffectsStepContract from "./contract.js";
import { logSnowEligibilitySummary } from "./diagnostics.js";
import { buildPlotEffectsInput } from "./inputs.js";

export default createStep(PlanPlotEffectsStepContract, {
  artifacts: implementArtifacts([ecologyArtifacts.plotEffectPlan], {
    plotEffectPlan: {},
  }),
  run: (context, config, ops, deps) => {
    const artifacts = {
      classification: deps.artifacts.biomeClassification.read(context),
      heightfield: context.buffers.heightfield,
    };
    const input = buildPlotEffectsInput(context, artifacts, PlanPlotEffectsStepContract.id);
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
    const scoreJungle = ops.scoreJungle(
      {
        width: input.width,
        height: input.height,
        landMask: input.landMask,
        biomeIndex: input.biomeIndex,
        vegetationDensity: input.vegetationDensity,
        effectiveMoisture: input.effectiveMoisture,
        surfaceTemperature: input.surfaceTemperature,
      },
      config.scoreJungle
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
        jungleScore01: scoreJungle.score01,
        jungleEligibleMask: scoreJungle.eligibleMask,
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

    deps.artifacts.plotEffectPlan.publish(context, result.placements);
  },
});
