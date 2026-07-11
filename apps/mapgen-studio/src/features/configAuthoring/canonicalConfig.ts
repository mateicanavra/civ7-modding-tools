import { type MapConfigEnvelope, snapshotMapConfigEnvelope } from "@civ7/studio-contract";
import type { TSchema } from "@swooper/mapgen-core/authoring";
import { normalizeStrict } from "@swooper/mapgen-core/compiler/normalize";
import type { PipelineConfig } from "@swooper/mapgen-studio-ui/types";
import { Value } from "typebox/value";
import { DEFAULT_STUDIO_RECIPE_ID, getRecipeArtifacts } from "../../recipes/catalog";

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
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

function jsonClone(value: unknown): unknown {
  if (value === null || typeof value === "string" || typeof value === "boolean") {
    return value;
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error("number must be finite");
    return value;
  }
  if (Array.isArray(value)) return value.map(jsonClone);
  if (isPlainObject(value)) {
    const out: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value)) {
      const cloned = jsonClone(child);
      out[key] = cloned;
    }
    return out;
  }
  throw new Error("value must be JSON data");
}

function toJsonConfig(value: unknown): { ok: true; value: unknown } | { ok: false } {
  try {
    return { ok: true, value: jsonClone(value) };
  } catch {
    return { ok: false };
  }
}

export function materializePipelineConfig(args: {
  schema: TSchema;
  config: unknown;
  label: string;
}): PresetApplyResult {
  const { schema, config, label } = args;
  const jsonConfig = toJsonConfig(config);
  if (!jsonConfig.ok) {
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

  const { value, errors } = normalizeStrict<PipelineConfig>(
    schema,
    jsonConfig.value,
    `/config/${label}`
  );
  if (errors.length > 0) return { ok: false, errors };
  if (!Value.Equal(value, jsonConfig.value)) {
    return {
      ok: false,
      errors: [
        {
          path: `/config/${label}`,
          message:
            "Config must be the complete recipe config JSON produced by the current recipe artifacts.",
        },
      ],
    };
  }

  return { ok: true, value };
}

export function applyPresetConfig(args: {
  schema: TSchema;
  presetConfig: unknown;
  label: string;
}): PresetApplyResult {
  return materializePipelineConfig({
    schema: args.schema,
    config: args.presetConfig,
    label: args.label,
  });
}

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
      logPrefix?: string;
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
    logPrefix?: string;
  }> = args.metadata ?? STUDIO_EDITOR_CANONICAL_METADATA;
  const draft = {
    id: metadata.id,
    name: metadata.name,
    description: metadata.description,
    recipe: metadata.recipe,
    sortIndex: metadata.sortIndex,
    latitudeBounds: metadata.latitudeBounds,
    ...(metadata.logPrefix === undefined ? {} : { logPrefix: metadata.logPrefix }),
    config:
      args.config ?? getMaterializedRecipeDefaultConfig(DEFAULT_STUDIO_RECIPE_ID, "editor-default"),
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
