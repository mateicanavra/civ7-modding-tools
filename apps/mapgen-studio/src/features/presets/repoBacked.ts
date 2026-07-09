import type { BuiltInPreset } from "../../recipes/catalog";

/**
 * Adds configs saved during the current Studio session to the preset list without
 * letting browser state replace recipe-owned built-ins. Canonical generated
 * recipe artifacts stay authoritative for any id they already define.
 */
export function mergeBuiltInPresetsWithSessionPresets(
  base: ReadonlyArray<BuiltInPreset>,
  sessionPresets: Readonly<Record<string, BuiltInPreset>>
): ReadonlyArray<BuiltInPreset> {
  const baseIds = new Set(base.map((preset) => preset.id));
  const additions = Object.values(sessionPresets).filter((preset) => !baseIds.has(preset.id));
  return additions.length === 0 ? base : [...base, ...additions];
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
