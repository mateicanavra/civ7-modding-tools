import { normalizeStrict } from "@swooper/mapgen-core/compiler/normalize";
import { stripSchemaMetadataRoot } from "@swooper/mapgen-core/authoring";

import type { StudioPresetExportFileV1 } from "@swooper/mapgen-core/authoring";
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

function formatErrors(errors: ReadonlyArray<{ path: string; message: string }>): ReadonlyArray<string> {
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

  const sanitized = stripSchemaMetadataRoot(presetFile.preset.config);
  const { value, errors } = normalizeStrict<Record<string, unknown>>(
    recipe.configSchema,
    sanitized,
    "/preset/import"
  );
  if (errors.length > 0) {
    return {
      ok: false,
      kind: "invalid-config",
      message: "Imported preset failed schema validation.",
      details: formatErrors(errors),
    };
  }

  return {
    ok: true,
    recipeId: presetFile.recipeId,
    label: presetFile.preset.label,
    description: presetFile.preset.description,
    config: value,
  };
}
