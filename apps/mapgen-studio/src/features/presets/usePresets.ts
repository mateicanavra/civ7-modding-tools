import type { SelectOption } from "@swooper/mapgen-studio-ui/types";
import { useCallback, useMemo } from "react";
import type { BuiltInPreset } from "../../recipes/catalog";
import { parsePresetKey, type ResolvedPreset } from "./types";

export type UsePresetsResult = Readonly<{
  options: ReadonlyArray<SelectOption>;
  resolvePreset: (key: string) => ResolvedPreset | null;
}>;

export function usePresets(args: {
  recipeId: string;
  builtIns: ReadonlyArray<BuiltInPreset>;
}): UsePresetsResult {
  const { builtIns } = args;
  const options = useMemo(() => {
    const base: SelectOption[] = [{ value: "none", label: "None" }];
    const builtInOptions = builtIns.map((preset) => ({
      value: `builtin:${preset.canonicalConfig.id}`,
      label: `Config / ${preset.canonicalConfig.name}`,
    }));
    return [...base, ...builtInOptions];
  }, [builtIns]);

  const resolvePreset = useCallback(
    (key: string): ResolvedPreset | null => {
      const parsed = parsePresetKey(key);
      if (parsed.kind === "builtin") {
        const preset = builtIns.find((p) => p.canonicalConfig.id === parsed.id);
        return preset
          ? {
              source: "builtin",
              id: preset.canonicalConfig.id,
              label: preset.canonicalConfig.name,
              description: preset.canonicalConfig.description,
              sourcePath: preset.sourcePath,
              canonicalConfig: preset.canonicalConfig,
            }
          : null;
      }
      return null;
    },
    [builtIns]
  );
  return { options, resolvePreset };
}
