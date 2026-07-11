import {
  type MapConfigEnvelope,
  snapshotMapConfigEnvelope,
  snapshotPortableJsonValue,
} from "@civ7/studio-contract";
import type { PipelineConfig } from "@swooper/mapgen-studio-ui/types";
import { Errors, type XSchema } from "typebox/schema";
import { DEFAULT_STUDIO_RECIPE_ID, getRecipeArtifacts } from "../../recipes/catalog";

export function isPlainObject(value: unknown): value is Readonly<Record<string, unknown>> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function isPipelineConfigSnapshot(value: unknown): value is PipelineConfig {
  return isPlainObject(value);
}

export type PresetApplyResult =
  | Readonly<{
      ok: true;
      value: PipelineConfig;
    }>
  | Readonly<{
      ok: false;
      errors: ReadonlyArray<{ path: string; message: string }>;
    }>;

export const STUDIO_EDITOR_CANONICAL_METADATA = {
  id: "studio-current",
  name: "Studio Current",
  description: "Current Studio editor configuration.",
  recipe: "standard",
  sortIndex: 9999,
  latitudeBounds: {
    topLatitude: 80,
    bottomLatitude: -80,
  },
} as const;

export function admitPipelineConfig(args: {
  schema: XSchema;
  config: unknown;
  label: string;
}): PresetApplyResult {
  const { schema, config, label } = args;
  const jsonConfig = snapshotPortableJsonValue(config);
  if (jsonConfig === undefined || !isPipelineConfigSnapshot(jsonConfig)) {
    return {
      ok: false,
      errors: [
        {
          path: `/config/${label}`,
          message: "Config must be plain JSON data.",
        },
      ],
    };
  }

  const [isValid, schemaErrors] = Errors(schema, jsonConfig);
  if (!isValid) {
    return {
      ok: false,
      errors: schemaErrors.map((error) => ({
        path: `/config/${label}${error.instancePath}`,
        message: error.message,
      })),
    };
  }

  return { ok: true, value: jsonConfig };
}

export function applyPresetConfig(args: {
  schema: XSchema;
  presetConfig: unknown;
  label: string;
}): PresetApplyResult {
  return admitPipelineConfig({
    schema: args.schema,
    config: args.presetConfig,
    label: args.label,
  });
}

export function getRecipeDefaultConfig(recipeId: string, label = "recipe-default"): PipelineConfig {
  const recipeArtifacts = getRecipeArtifacts(recipeId);
  const result = admitPipelineConfig({
    schema: recipeArtifacts.configSchema,
    config: recipeArtifacts.defaultConfig,
    label,
  });
  if (!result.ok) {
    throw new Error(`Recipe ${recipeId} default config failed recipe schema validation.`);
  }
  return result.value;
}

/** The only Studio editor-envelope constructor. */
export function createStudioEditorCanonicalConfig(
  args: {
    metadata?: Readonly<{
      id: string;
      name: string;
      description: string;
      recipe: "standard";
      sortIndex: number;
      latitudeBounds: Readonly<{ topLatitude: number; bottomLatitude: number }>;
    }>;
    config?: unknown;
  } = {}
): MapConfigEnvelope {
  const metadata: Readonly<{
    id: string;
    name: string;
    description: string;
    recipe: "standard";
    sortIndex: number;
    latitudeBounds: Readonly<{ topLatitude: number; bottomLatitude: number }>;
  }> = args.metadata ?? STUDIO_EDITOR_CANONICAL_METADATA;
  const draft = {
    id: metadata.id,
    name: metadata.name,
    description: metadata.description,
    recipe: metadata.recipe,
    sortIndex: metadata.sortIndex,
    latitudeBounds: metadata.latitudeBounds,
    config: args.config ?? getRecipeDefaultConfig(DEFAULT_STUDIO_RECIPE_ID, "editor-default"),
  };
  const snapshot = snapshotMapConfigEnvelope(draft);
  if (snapshot === undefined) {
    throw new TypeError("Studio editor config must be a complete portable JSON envelope.");
  }
  return snapshot;
}

export function formatPresetErrors(
  errors: ReadonlyArray<{ path: string; message: string }>
): ReadonlyArray<string> {
  return errors.map((e) => `${e.path}: ${e.message}`);
}
