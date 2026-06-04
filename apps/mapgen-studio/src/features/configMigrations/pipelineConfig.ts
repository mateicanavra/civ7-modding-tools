import type { PipelineConfig } from "../../ui/types";

const LEGACY_FOUNDATION_SIZE_GROUPS = ["meshResolution", "platePartition"] as const;
const LEGACY_FOUNDATION_SIZE_KEYS = ["referenceArea", "plateScalePower"] as const;

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
  const cloned = cloneConfigValue(value);
  if (!isPlainObject(cloned)) return cloned;

  const foundation = cloned.foundation;
  if (!isPlainObject(foundation)) return cloned;

  for (const groupKey of LEGACY_FOUNDATION_SIZE_GROUPS) {
    const group = foundation[groupKey];
    if (!isPlainObject(group)) continue;
    for (const key of LEGACY_FOUNDATION_SIZE_KEYS) delete group[key];
  }

  return cloned;
}
