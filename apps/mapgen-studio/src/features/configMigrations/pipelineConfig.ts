import type { PipelineConfig } from "../../ui/types";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value == null || typeof value !== "object" || Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function cloneConfigValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(cloneConfigValue);
  if (!isPlainObject(value)) return value;
  const out: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value)) {
    out[key] = cloneConfigValue(child);
  }
  return out;
}

export function migratePipelineConfig(value: PipelineConfig): PipelineConfig {
  return migratePipelineConfigUnknown(value) as PipelineConfig;
}

export function migratePipelineConfigUnknown(value: unknown): unknown {
  return cloneConfigValue(value);
}
