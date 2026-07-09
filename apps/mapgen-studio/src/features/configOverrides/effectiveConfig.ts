import type { PipelineConfig } from "@swooper/mapgen-studio-ui/types";
import { getRecipeArtifacts, type RecipeArtifacts } from "../../recipes/catalog";
import { materializePipelineConfig } from "./configBuilders";

export type EffectivePipelineConfigSource = Readonly<
  {
    kind: "draft";
    recipeArtifacts: RecipeArtifacts;
    config: PipelineConfig;
  }
>;

export function getMaterializedRecipeDefaultConfig(
  recipeId: string,
  label = "recipe-default"
): PipelineConfig {
  const recipeArtifacts = getRecipeArtifacts(recipeId);
  const result = materializePipelineConfig({
    schema: recipeArtifacts.configSchema,
    config: recipeArtifacts.defaultConfig,
    label,
  });
  if (!result.ok) {
    throw new Error(`Recipe ${recipeId} default config failed recipe schema validation.`);
  }
  return result.value;
}

export function resolveEffectivePipelineConfig(args: {
  recipeId: string;
  pipelineConfig: PipelineConfig;
  overridesDisabled: boolean;
}): EffectivePipelineConfigSource {
  const recipeArtifacts = getRecipeArtifacts(args.recipeId);
  void args.overridesDisabled;
  return {
    kind: "draft",
    recipeArtifacts,
    config: args.pipelineConfig,
  };
}
