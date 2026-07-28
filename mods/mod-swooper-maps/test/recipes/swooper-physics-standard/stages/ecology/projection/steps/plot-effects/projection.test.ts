import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import { artifacts as plotEffectArtifacts } from "@mapgen/domain/ecology/modules/plot-effects/artifacts/index.js";
import { PLOT_EFFECT_INTENT_KEYS } from "@mapgen/domain/ecology/modules/plot-effects/model/atoms/index.js";
import { admitMapSetup, createMapContext } from "@swooper/mapgen-core";
import {
  buildStepTestDependencies,
  publishTestArtifact,
  withMapContextExecutionForTest,
} from "@swooper/mapgen-core/testing";
import {
  CUSTOM_PLOT_EFFECT_HAZARD_PROJECTIONS,
  PLOT_EFFECT_PROJECTION_POLICY,
} from "../../../../../../../../src/recipes/standard/stages/ecology/projection/model/policy/plot-effect-projection.js";
import { PlotEffectsStep as plotEffectsStep } from "../../../../../../../../src/recipes/standard/stages/ecology/projection/steps/plot-effects/step.js";
import {
  TEST_MAP_LATITUDE_BOUNDS,
  TEST_MAP_SEED,
  TEST_MAP_SIZE,
} from "../../../../../../../setup.js";
import { STANDARD_RECIPE_TEST_PLOT_EFFECT_TYPES } from "../../../../../fixtures/standard-recipe.js";

describe("plot-effect projection policy", () => {
  it("projects every Ecology intent through the stage-owned Civ7 engine binding", () => {
    expect(Object.keys(PLOT_EFFECT_PROJECTION_POLICY).sort()).toEqual(
      [...PLOT_EFFECT_INTENT_KEYS].sort()
    );

    const { width, height } = TEST_MAP_SIZE.dimensions;
    const setup = admitMapSetup({
      mapSeed: TEST_MAP_SEED,
      dimensions: TEST_MAP_SIZE.dimensions,
      latitudeBounds: TEST_MAP_LATITUDE_BOUNDS,
    });
    const adapter = createMockAdapter({
      width,
      height,
      mapInfo: TEST_MAP_SIZE.mapInfo,
      plotEffectTypes: STANDARD_RECIPE_TEST_PLOT_EFFECT_TYPES,
    });
    const context = createMapContext({ setup, adapter });
    const placements = PLOT_EFFECT_INTENT_KEYS.map((plotEffect, x) => ({
      x,
      y: 0,
      plotEffect,
    }));

    const result = withMapContextExecutionForTest(context, (stepContext) => {
      publishTestArtifact(stepContext, plotEffectArtifacts.plotEffectPlan, placements);
      const stepResult = plotEffectsStep.run(
        stepContext,
        {},
        {},
        buildStepTestDependencies(plotEffectsStep, stepContext)
      );
      if (stepResult instanceof Promise) {
        throw new Error("The plot-effects step must remain synchronous.");
      }
      return stepResult;
    });

    expect(result).toEqual(placements);
    expect(adapter.calls.addPlotEffect).toEqual(
      placements.map((placement) => ({
        x: placement.x,
        y: placement.y,
        plotEffectType: adapter.getPlotEffectTypeIndex(
          PLOT_EFFECT_PROJECTION_POLICY[placement.plotEffect].engineKey
        ),
      }))
    );
  });

  it("defines every custom hazard as permanent land-only attrition", () => {
    expect(CUSTOM_PLOT_EFFECT_HAZARD_PROJECTIONS).toEqual([
      {
        engineKey: "PLOTEFFECT_DESERT_HEAT",
        customHazard: {
          localizationTag: "LOC_PLOTEFFECT_DESERT_HEAT_NAME",
          localizationText: "Deep Desert Heat",
          timeDecay: false,
          unoccupiedDecay: false,
          timeValue: 1,
          damage: 11,
          defense: 0,
          allowOnWater: false,
        },
      },
      {
        engineKey: "PLOTEFFECT_FROSTBITE",
        customHazard: {
          localizationTag: "LOC_PLOTEFFECT_FROSTBITE_NAME",
          localizationText: "Killing Frost",
          timeDecay: false,
          unoccupiedDecay: false,
          timeValue: 1,
          damage: 11,
          defense: 0,
          allowOnWater: false,
        },
      },
      {
        engineKey: "PLOTEFFECT_JUNGLE_FEVER",
        customHazard: {
          localizationTag: "LOC_PLOTEFFECT_JUNGLE_FEVER_NAME",
          localizationText: "Jungle Fever",
          timeDecay: false,
          unoccupiedDecay: false,
          timeValue: 1,
          damage: 11,
          defense: 0,
          allowOnWater: false,
        },
      },
    ]);
  });
});
