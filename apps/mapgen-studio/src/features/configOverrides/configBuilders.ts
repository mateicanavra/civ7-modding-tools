import type { TSchema } from "@swooper/mapgen-core/authoring";
import { normalizeStrict } from "@swooper/mapgen-core/compiler/normalize";
import type { PipelineConfig } from "@swooper/mapgen-studio-ui/types";
import { Value } from "typebox/value";
import type { PresetKey } from "../presets/types";

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

export type PresetApplyResult = Readonly<{
  ok: true;
  value: PipelineConfig;
}> | Readonly<{
  ok: false;
  errors: ReadonlyArray<{ path: string; message: string }>;
}>;

export type AppliedPresetSnapshot = Readonly<{
  key: PresetKey;
  config: unknown;
}>;

function jsonClone(value: unknown): unknown {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
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

export function validateExactPipelineConfig(args: {
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
  return validateExactPipelineConfig({
    schema: args.schema,
    config: args.presetConfig,
    label: args.label,
  });
}

export function formatPresetErrors(
  errors: ReadonlyArray<{ path: string; message: string }>
): ReadonlyArray<string> {
  return errors.map((e) => `${e.path}: ${e.message}`);
}
