import { useCallback, useMemo, useState } from "react";
import type { SelectOption } from "../../ui/types";
import type { BuiltInPreset } from "../../recipes/catalog";
import {
  loadPresetStore,
  persistPresetStore,
  removeLocalPreset,
  upsertLocalPreset,
  type LocalPresetV1,
  type StudioPresetStoreV1,
} from "./storage";
import { parsePresetKey, type PresetKey, type ResolvedPreset } from "./types";

export type PresetActions = Readonly<{
  saveAsNew: (args: {
    recipeId: string;
    label: string;
    description?: string;
    config: unknown;
  }) => { preset: LocalPresetV1; persistenceError?: string };
  saveToCurrent: (args: {
    recipeId: string;
    presetId: string;
    config: unknown;
  }) => { preset?: LocalPresetV1; error?: string; persistenceError?: string };
  deleteLocal: (args: { recipeId: string; presetId: string }) => { deleted: boolean; persistenceError?: string };
}>;

export type UsePresetsResult = Readonly<{
  options: ReadonlyArray<SelectOption>;
  resolvePreset: (key: PresetKey) => ResolvedPreset | null;
  localPresets: ReadonlyArray<LocalPresetV1>;
  actions: PresetActions;
  loadWarning?: string;
}>;

function createLocalPresetId(existing: ReadonlyArray<LocalPresetV1>): string {
  const used = new Set(existing.map((p) => p.id));
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    let id = crypto.randomUUID();
    while (used.has(id)) id = crypto.randomUUID();
    return id;
  }
  let id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  while (used.has(id)) {
    id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
  return id;
}

export function usePresets(args: {
  recipeId: string;
  builtIns: ReadonlyArray<BuiltInPreset>;
}): UsePresetsResult {
  const { recipeId, builtIns } = args;
  const [{ store, warning }, setStoreState] = useState(() => {
    const result = loadPresetStore();
    return { store: result.store, warning: result.warning };
  });

  const localPresets = useMemo(() => store.presetsByRecipeId[recipeId] ?? [], [store, recipeId]);

  const options = useMemo(() => {
    const base: SelectOption[] = [{ value: "none", label: "None" }];
    const builtInOptions = builtIns.map((preset) => ({
      value: `builtin:${preset.id}`,
      label: `Built-in / ${preset.label}`,
    }));
    const localOptions = localPresets.map((preset) => ({
      value: `local:${preset.id}`,
      label: `Local / ${preset.label}`,
    }));
    return [...base, ...builtInOptions, ...localOptions];
  }, [builtIns, localPresets]);

  const resolvePreset = useCallback((key: PresetKey): ResolvedPreset | null => {
    const parsed = parsePresetKey(key);
    if (parsed.kind === "builtin") {
      const preset = builtIns.find((p) => p.id === parsed.id);
      return preset
        ? { source: "builtin", id: preset.id, label: preset.label, description: preset.description, config: preset.config }
        : null;
    }
    if (parsed.kind === "local") {
      const preset = localPresets.find((p) => p.id === parsed.id);
      return preset
        ? { source: "local", id: preset.id, label: preset.label, description: preset.description, config: preset.config }
        : null;
    }
    return null;
  }, [builtIns, localPresets]);

  const setStore = useCallback((next: StudioPresetStoreV1): string | undefined => {
    setStoreState((prev) => ({ store: next, warning: prev.warning }));
    const result = persistPresetStore(next);
    if (!result.ok) return result.error;
    return undefined;
  }, []);

  const actions: PresetActions = useMemo(() => ({
    saveAsNew: ({ recipeId: targetRecipeId, label, description, config }) => {
      const now = new Date().toISOString();
      const existing = store.presetsByRecipeId[targetRecipeId] ?? [];
      const preset: LocalPresetV1 = {
        id: createLocalPresetId(existing),
        label,
        description,
        config,
        createdAtIso: now,
        updatedAtIso: now,
      };
      const nextStore = upsertLocalPreset({ store, recipeId: targetRecipeId, preset });
      const persistenceError = setStore(nextStore);
      return { preset, persistenceError };
    },
    saveToCurrent: ({ recipeId: targetRecipeId, presetId, config }) => {
      const existing = store.presetsByRecipeId[targetRecipeId] ?? [];
      const current = existing.find((p) => p.id === presetId);
      if (!current) return { error: "Preset not found" };
      const preset: LocalPresetV1 = {
        ...current,
        config,
        updatedAtIso: new Date().toISOString(),
      };
      const nextStore = upsertLocalPreset({ store, recipeId: targetRecipeId, preset });
      const persistenceError = setStore(nextStore);
      return { preset, persistenceError };
    },
    deleteLocal: ({ recipeId: targetRecipeId, presetId }) => {
      const nextStore = removeLocalPreset({ store, recipeId: targetRecipeId, presetId });
      const persistenceError = setStore(nextStore);
      const deleted = (store.presetsByRecipeId[targetRecipeId] ?? []).some((p) => p.id === presetId);
      return { deleted, persistenceError };
    },
  }), [setStore, store]);

  return { options, resolvePreset, localPresets, actions, loadWarning: warning };
}
