import type { StudioPresetExportFileV1 } from "@swooper/mapgen-core/authoring";

const PRESET_EXPORT_SCHEMA_URL =
  "https://civ7.tools/schemas/mapgen-studio/studio-preset-export.v1.schema.json";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value == null || typeof value !== "object" || Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

export type PresetExportPayload = Readonly<{
  label: string;
  description?: string;
  config: unknown;
}>;

export type PresetExportBuild = Readonly<{
  file: StudioPresetExportFileV1;
  filename: string;
  json: string;
}>;

export type PresetExportParseResult =
  | Readonly<{ ok: true; value: StudioPresetExportFileV1 }>
  | Readonly<{ ok: false; message: string; details?: ReadonlyArray<string> }>;

export function buildPresetExportFile(args: {
  recipeId: string;
  preset: PresetExportPayload;
}): PresetExportBuild {
  const { recipeId, preset } = args;
  const file: StudioPresetExportFileV1 = {
    $schema: PRESET_EXPORT_SCHEMA_URL,
    version: 1,
    recipeId,
    preset: {
      label: preset.label,
      ...(preset.description ? { description: preset.description } : {}),
      config: preset.config,
    },
  };
  const labelSlug = slugifyLabel(preset.label || "preset");
  const filename = `${recipeId.replace(/\//g, "__")}__${labelSlug}__studio-preset.json`;
  const json = JSON.stringify(file, null, 2);
  return { file, filename, json };
}

export function parsePresetExportFile(text: string): PresetExportParseResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text) as unknown;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid JSON";
    return { ok: false, message: "Invalid preset file JSON", details: [message] };
  }

  if (!isPlainObject(parsed)) {
    return { ok: false, message: "Preset file must be a JSON object" };
  }

  const errors: string[] = [];

  if (parsed.$schema !== undefined && typeof parsed.$schema !== "string") {
    errors.push("$schema must be a string when provided");
  }
  if (parsed.version !== 1) {
    errors.push("version must be 1");
  }
  if (typeof parsed.recipeId !== "string") {
    errors.push("recipeId must be a string");
  }
  if (!isPlainObject(parsed.preset)) {
    errors.push("preset must be an object");
  }

  if (errors.length > 0) {
    return { ok: false, message: "Preset file is missing required fields", details: errors };
  }

  const preset = parsed.preset as Record<string, unknown>;
  const presetErrors: string[] = [];
  if (typeof preset.label !== "string") presetErrors.push("preset.label must be a string");
  if (preset.description !== undefined && typeof preset.description !== "string") {
    presetErrors.push("preset.description must be a string when provided");
  }
  if (!("config" in preset)) presetErrors.push("preset.config is required");
  if (preset.config !== undefined && !isPlainObject(preset.config)) {
    presetErrors.push("preset.config must be a JSON object");
  }

  if (presetErrors.length > 0) {
    return { ok: false, message: "Preset file payload is invalid", details: presetErrors };
  }

  return { ok: true, value: parsed as StudioPresetExportFileV1 };
}

export function slugifyLabel(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export function downloadPresetFile(filename: string, text: string): void {
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
