// ============================================================================
// CONFIG UTILITIES
// ============================================================================
// Helper functions for working with pipeline configurations.
// ============================================================================

import type { ConfigPatch, PipelineConfig } from "@swooper/mapgen-studio-ui/types";

/**
 * Apply a config patch using shallow copies (efficient immutable update).
 * Only clones objects along the path, not the entire tree.
 */
export function applyConfigPatch(config: PipelineConfig, patch: ConfigPatch): PipelineConfig {
  const { path, value } = patch;

  if (path.length === 0) return config;

  const nextConfig = { ...config };
  let current: Record<string, unknown> = nextConfig;
  for (const key of path.slice(0, -1)) {
    const child = current[key];
    if (!isConfigRecord(child)) {
      throw new Error(`Config path does not exist: ${path.join(".")}`);
    }
    const nextChild = { ...child };
    current[key] = nextChild;
    current = nextChild;
  }

  const leaf = path[path.length - 1];
  if (!(leaf in current)) throw new Error(`Config path does not exist: ${path.join(".")}`);
  current[leaf] = value;
  return nextConfig;
}

function isConfigRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
