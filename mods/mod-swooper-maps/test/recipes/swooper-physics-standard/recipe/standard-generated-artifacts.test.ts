import { describe, expect, it } from "bun:test";
import { stableStringify } from "@swooper/mapgen-core";
import { deriveStageAuthoringModel } from "@swooper/mapgen-core/authoring";
import * as generatedRecipe from "mod-swooper-maps/recipes/standard";
import {
  STANDARD_RECIPE_CONFIG as generatedDefaults,
  STANDARD_RECIPE_CONFIG_SCHEMA as generatedSchema,
  studioRecipeUiMeta as generatedUiMeta,
} from "mod-swooper-maps/recipes/standard-artifacts";

import { deriveStandardRecipeArtifacts } from "../../../../src/recipes/standard/artifacts.js";
import standardRecipe, { STANDARD_STAGES } from "../../../../src/recipes/standard/recipe.js";

const EXPECTED_STANDARD_RECIPE_EXPORTS = [
  "STANDARD_STAGES",
  "default",
] as const satisfies readonly (keyof typeof generatedRecipe)[];
const declarationsHaveNoUnexpectedExports: Exclude<
  keyof typeof generatedRecipe,
  (typeof EXPECTED_STANDARD_RECIPE_EXPORTS)[number]
> extends never
  ? true
  : false = true;

function focusPathsForStep(
  focusPathsByStepId: Readonly<Partial<Record<string, readonly string[]>>>,
  stepId: string
): readonly string[] {
  return focusPathsByStepId[stepId] ?? [];
}

function projectGeneratedUiStructure() {
  return generatedUiMeta.stages.map((stage) => ({
    stageId: stage.stageId,
    steps: stage.steps.map((step) => ({
      stepId: step.stepId,
      fullStepId: step.fullStepId,
      configFocusPathWithinStage: step.configFocusPathWithinStage,
    })),
  }));
}

function deriveSourceUiStructure() {
  const runtimeStepIds = standardRecipe.recipe.steps.map((step) => step.id);
  let runtimeStepIndex = 0;
  const stages = STANDARD_STAGES.map((stage) => {
    const authoring = deriveStageAuthoringModel(stage);
    return {
      stageId: stage.id,
      steps: authoring.runtime.steps.map((step) => {
        const fullStepId = runtimeStepIds[runtimeStepIndex];
        runtimeStepIndex += 1;
        if (fullStepId === undefined) {
          throw new Error("Runtime recipe is missing a source-authored step");
        }
        return {
          stepId: step.stepId,
          fullStepId,
          configFocusPathWithinStage: focusPathsForStep(
            authoring.config.focusPathsByStepId,
            step.stepId
          ),
        };
      }),
    };
  });

  if (runtimeStepIndex !== runtimeStepIds.length) {
    throw new Error("Runtime recipe contains a step absent from the source authoring model");
  }
  return stages;
}

describe("standard generated recipe artifacts", () => {
  it("keeps runtime and declared recipe exports aligned", () => {
    expect(declarationsHaveNoUnexpectedExports).toBe(true);
    expect(Object.keys(generatedRecipe).sort()).toEqual(
      [...EXPECTED_STANDARD_RECIPE_EXPORTS].sort()
    );
  });

  it("matches the source recipe artifacts and authoring structure", () => {
    const sourceArtifacts = deriveStandardRecipeArtifacts();

    expect(stableStringify(generatedSchema)).toBe(stableStringify(sourceArtifacts.schema));
    expect(stableStringify(generatedDefaults)).toBe(stableStringify(sourceArtifacts.defaults));
    expect(projectGeneratedUiStructure()).toEqual(deriveSourceUiStructure());
  });
});
