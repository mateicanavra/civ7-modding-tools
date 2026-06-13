// Deterministic config construction for the Studio authoring model.
//
// These helpers are pure (no React, no I/O): they build the per-recipe pipeline
// config skeleton, merge schema defaults and presets deterministically, and
// normalize the result through the recipe schema. They were extracted verbatim
// from `App.tsx` during the app-decomposition slice — behavior is unchanged.
import { normalizeStrict } from "@swooper/mapgen-core/compiler/normalize";
import { stripSchemaMetadataRoot, type TSchema } from "@swooper/mapgen-core/authoring";

import { migratePipelineConfigUnknown } from "../configMigrations/pipelineConfig";
import type { PipelineConfig } from "../../ui/types";
import type { StudioRecipeUiMeta } from "../../recipes/catalog";
import type { PresetKey } from "../presets/types";

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isNumericPathSegment(segment: string): boolean {
  return /^[0-9]+$/.test(segment);
}

const FORBIDDEN_MERGE_KEYS = new Set(["__proto__", "prototype", "constructor"]);

export function mergeDeterministic(base: unknown, overrides: unknown): unknown {
  if (overrides === undefined) return base;
  if (!isPlainObject(base) || !isPlainObject(overrides)) return overrides;

  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const key of Object.keys(overrides)) {
    if (FORBIDDEN_MERGE_KEYS.has(key)) continue;
    out[key] = mergeDeterministic((base as Record<string, unknown>)[key], overrides[key]);
  }
  return out;
}

export function setAtPath(
  root: Record<string, unknown>,
  path: readonly string[],
  value: unknown
): void {
  let current: unknown = root;
  for (let i = 0; i < path.length; i += 1) {
    const key = path[i];
    const isLast = i === path.length - 1;
    const nextKey = path[i + 1];
    const wantsArray = typeof nextKey === "string" && isNumericPathSegment(nextKey);

    if (Array.isArray(current) && isNumericPathSegment(key)) {
      const idx = Number(key);
      if (isLast) {
        if (current[idx] === undefined) current[idx] = value;
        return;
      }
      const next = current[idx];
      if (!isPlainObject(next) && !Array.isArray(next)) {
        current[idx] = wantsArray ? [] : {};
      }
      current = current[idx];
      continue;
    }

    if (!isPlainObject(current) && !Array.isArray(current)) {
      return;
    }
    const record = current as Record<string, unknown>;
    if (isLast) {
      if (record[key] === undefined) record[key] = value;
      return;
    }
    const existing = record[key];
    if (!isPlainObject(existing) && !Array.isArray(existing)) {
      record[key] = wantsArray ? [] : {};
    }
    current = record[key];
  }
}

export function buildConfigSkeleton(uiMeta: StudioRecipeUiMeta): PipelineConfig {
  const skeleton: PipelineConfig = {};
  for (const stage of uiMeta.stages) {
    const stageConfig: Record<string, unknown> = { knobs: {} };
    for (const step of stage.steps) {
      setAtPath(stageConfig, step.configFocusPathWithinStage, {});
    }
    skeleton[stage.stageId] = stageConfig;
  }
  return skeleton;
}

export function buildDefaultConfig(
  schema: TSchema,
  uiMeta: StudioRecipeUiMeta,
  defaultConfig: unknown
): PipelineConfig {
  const skeleton = buildConfigSkeleton(uiMeta);
  const merged = mergeDeterministic(skeleton, stripSchemaMetadataRoot(defaultConfig));
  const { value, errors } = normalizeStrict<PipelineConfig>(schema, merged, "/defaultConfig");
  if (errors.length > 0) {
    console.error("[mapgen-studio] invalid recipe config schema defaults", errors);
    return skeleton;
  }
  return value;
}

export type PresetApplyResult = Readonly<{
  value: PipelineConfig | null;
  errors: ReadonlyArray<{ path: string; message: string }>;
}>;

export type AppliedPresetSnapshot = Readonly<{
  key: PresetKey;
  config: unknown;
}>;

export function applyPresetConfig(args: {
  schema: TSchema;
  uiMeta: StudioRecipeUiMeta;
  presetConfig: unknown;
  label: string;
}): PresetApplyResult {
  const { schema, uiMeta, presetConfig, label } = args;
  const skeleton = buildConfigSkeleton(uiMeta);
  const migratedPresetConfig = migratePipelineConfigUnknown(stripSchemaMetadataRoot(presetConfig));
  const merged = mergeDeterministic(skeleton, migratedPresetConfig);
  const { value, errors } = normalizeStrict<PipelineConfig>(schema, merged, `/preset/${label}`);
  if (errors.length > 0) return { value: null, errors };
  return { value, errors: [] };
}

export function formatPresetErrors(
  errors: ReadonlyArray<{ path: string; message: string }>
): ReadonlyArray<string> {
  return errors.map((e) => `${e.path}: ${e.message}`);
}
