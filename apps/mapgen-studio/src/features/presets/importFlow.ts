import type { StudioPresetExportFileV1 } from "@swooper/mapgen-core/authoring";
import { validateExactPipelineConfig } from "../configOverrides/configBuilders";
import type { RecipeArtifacts } from "../../recipes/catalog";

export type ImportPresetResult =
  | Readonly<{
      ok: true;
      recipeId: string;
      label: string;
      description?: string;
      config: Record<string, unknown>;
    }>
  | Readonly<{
      ok: false;
      kind: "unknown-recipe" | "invalid-config";
      message: string;
      details?: ReadonlyArray<string>;
    }>;

function formatErrors(
  errors: ReadonlyArray<{ path: string; message: string }>
): ReadonlyArray<string> {
  return errors.map((e) => `${e.path}: ${e.message}`);
}

export function resolveImportedPreset(args: {
  presetFile: StudioPresetExportFileV1;
  findRecipeArtifacts: (recipeId: string) => RecipeArtifacts | null;
}): ImportPresetResult {
  const { presetFile, findRecipeArtifacts } = args;
  const recipe = findRecipeArtifacts(presetFile.recipeId);
  if (!recipe) {
    return {
      ok: false,
      kind: "unknown-recipe",
      message: `This Studio build does not include recipe ${presetFile.recipeId}.`,
    };
  }

  const validated = validateExactPipelineConfig({
    schema: recipe.configSchema,
    config: presetFile.preset.config,
    label: "import",
  });
  if (!validated.ok) {
    return {
      ok: false,
      kind: "invalid-config",
      message: "Imported preset failed schema validation.",
      details: formatErrors(validated.errors),
    };
  }

  return {
    ok: true,
    recipeId: presetFile.recipeId,
    label: presetFile.preset.label,
    description: presetFile.preset.description,
    config: validated.value as Record<string, unknown>,
  };
}
