import type { PipelineConfig } from "@swooper/mapgen-studio-ui/types";
import { getRecipeArtifacts, type RecipeArtifacts } from "../../recipes/catalog";
import { validateExactPipelineConfig } from "./configBuilders";

export type EffectivePipelineConfigSource = Readonly<
  | {
      kind: "recipe-default";
      recipeArtifacts: RecipeArtifacts;
      config: PipelineConfig;
    }
  | {
      kind: "draft";
      recipeArtifacts: RecipeArtifacts;
      config: PipelineConfig;
    }
>;

export function getExactRecipeDefaultConfig(
  recipeId: string,
  label = "recipe-default"
): PipelineConfig {
  const recipeArtifacts = getRecipeArtifacts(recipeId);
  const result = validateExactPipelineConfig({
    schema: recipeArtifacts.configSchema,
    config: recipeArtifacts.defaultConfig,
    label,
  });
  if (!result.ok) {
    throw new Error(
      `Recipe ${recipeId} default config is not complete exact recipe JSON.`
    );
  }
  return result.value;
}

export function resolveEffectivePipelineConfig(args: {
  recipeId: string;
  pipelineConfig: PipelineConfig;
  overridesDisabled: boolean;
}): EffectivePipelineConfigSource {
  const recipeArtifacts = getRecipeArtifacts(args.recipeId);
  if (args.overridesDisabled) {
    const result = validateExactPipelineConfig({
      schema: recipeArtifacts.configSchema,
      config: recipeArtifacts.defaultConfig,
      label: "recipe-default",
    });
    if (!result.ok) {
      throw new Error(
        `Recipe ${args.recipeId} default config is not complete exact recipe JSON.`
      );
    }
    return {
      kind: "recipe-default",
      recipeArtifacts,
      config: result.value,
    };
  }
  return {
    kind: "draft",
    recipeArtifacts,
    config: args.pipelineConfig,
  };
}
