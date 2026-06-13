// Adapters for repo-backed preset overrides: merge per-recipe overrides over the
// built-in preset list, and construct a built-in preset from a saved repo config.
// Extracted verbatim from `App.tsx` during the app-decomposition slice.
import type { BuiltInPreset } from "../../recipes/catalog";

export function mergeBuiltInPresets(
  base: ReadonlyArray<BuiltInPreset>,
  overrides: Readonly<Record<string, BuiltInPreset>>
): ReadonlyArray<BuiltInPreset> {
  const overrideIds = new Set(Object.keys(overrides));
  if (overrideIds.size === 0) return base;
  const merged = base.map((preset) => {
    const override = overrides[preset.id];
    if (!override) return preset;
    overrideIds.delete(preset.id);
    return override;
  });
  for (const id of overrideIds) {
    const override = overrides[id];
    if (override) merged.push(override);
  }
  return merged;
}

export function toRepoBackedPreset(args: {
  id: string;
  label: string;
  description?: string;
  sourcePath?: string;
  sortIndex?: number;
  latitudeBounds?: Readonly<{
    topLatitude: number;
    bottomLatitude: number;
  }>;
  config: unknown;
}): BuiltInPreset {
  return {
    id: args.id,
    label: args.label,
    description: args.description,
    sourcePath: args.sourcePath,
    sortIndex: args.sortIndex,
    latitudeBounds: args.latitudeBounds,
    config: args.config,
  };
}
