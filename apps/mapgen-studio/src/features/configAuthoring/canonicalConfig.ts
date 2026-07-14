import {
  type MapConfigEnvelope,
  snapshotMapConfigEnvelope,
  snapshotPortableJsonValue,
} from "@civ7/studio-contract";
import type { PipelineConfig } from "@swooper/mapgen-studio-ui/types";
import { Errors, type XSchema } from "typebox/schema";
import { findRecipeArtifacts, getRecipeArtifacts } from "../../recipes/catalog";

export function isPlainObject(value: unknown): value is Readonly<Record<string, unknown>> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function isPipelineConfigSnapshot(value: unknown): value is PipelineConfig {
  return isPlainObject(value);
}

export type ConfigAdmissionResult =
  | Readonly<{ ok: true; value: PipelineConfig }>
  | Readonly<{
      ok: false;
      errors: ReadonlyArray<{ path: string; message: string }>;
    }>;

export function admitPipelineConfig(args: {
  schema: XSchema;
  config: unknown;
  label: string;
}): ConfigAdmissionResult {
  const jsonConfig = snapshotPortableJsonValue(args.config);
  if (jsonConfig === undefined || !isPipelineConfigSnapshot(jsonConfig)) {
    return {
      ok: false,
      errors: [{ path: `/config/${args.label}`, message: "Config must be plain JSON data." }],
    };
  }

  const [isValid, schemaErrors] = Errors(args.schema, jsonConfig);
  if (!isValid) {
    return {
      ok: false,
      errors: schemaErrors.map((error) => ({
        path: `/config/${args.label}${error.instancePath}`,
        message: error.message,
      })),
    };
  }
  return { ok: true, value: jsonConfig };
}

export function admitCanonicalConfig(value: unknown): MapConfigEnvelope | undefined {
  const canonicalConfig = snapshotMapConfigEnvelope(value);
  if (canonicalConfig === undefined) return undefined;
  const recipe = findRecipeArtifacts(canonicalConfig.recipe);
  if (recipe === null) return undefined;
  try {
    return recipe.admitCanonicalConfig(canonicalConfig) === canonicalConfig
      ? canonicalConfig
      : undefined;
  } catch {
    return undefined;
  }
}

export function replaceCanonicalConfig(
  current: MapConfigEnvelope,
  config: unknown
): MapConfigEnvelope | undefined {
  return admitCanonicalConfig({ ...current, config });
}

export function createNamedCanonicalConfig(args: {
  current: MapConfigEnvelope;
  id: string;
  name: string;
  description?: string;
}): MapConfigEnvelope | undefined {
  return admitCanonicalConfig({
    ...args.current,
    id: args.id,
    name: args.name,
    description: args.description ?? "Studio configuration.",
  });
}

export function getRecipeDefaultCanonicalConfig(recipeId: string): MapConfigEnvelope {
  return getRecipeArtifacts(recipeId).defaultCanonicalConfig;
}
