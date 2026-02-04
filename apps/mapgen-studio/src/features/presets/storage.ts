export type LocalPresetV1 = Readonly<{
  id: string;
  label: string;
  description?: string;
  config: unknown;
  createdAtIso: string;
  updatedAtIso: string;
}>;

export type StudioPresetStoreV1 = Readonly<{
  version: 1;
  presetsByRecipeId: Readonly<Record<string, ReadonlyArray<LocalPresetV1>>>;
}>;

export type PresetStoreLoadResult = Readonly<{
  store: StudioPresetStoreV1;
  warning?: string;
}>;

export const STUDIO_PRESET_STORE_KEY = "mapgen-studio.presets";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value == null || typeof value !== "object" || Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function isLocalPreset(value: unknown): value is LocalPresetV1 {
  if (!isPlainObject(value)) return false;
  if (typeof value.id !== "string") return false;
  if (typeof value.label !== "string") return false;
  if (value.description !== undefined && typeof value.description !== "string") return false;
  if (!("config" in value)) return false;
  if (typeof value.createdAtIso !== "string") return false;
  if (typeof value.updatedAtIso !== "string") return false;
  return true;
}

function isValidStore(value: unknown): value is StudioPresetStoreV1 {
  if (!isPlainObject(value)) return false;
  if (value.version !== 1) return false;
  if (!isPlainObject(value.presetsByRecipeId)) return false;
  for (const presets of Object.values(value.presetsByRecipeId)) {
    if (!Array.isArray(presets)) return false;
    if (!presets.every(isLocalPreset)) return false;
  }
  return true;
}

function getLocalStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage ?? null;
  } catch {
    return null;
  }
}

export function createEmptyStore(): StudioPresetStoreV1 {
  return { version: 1, presetsByRecipeId: {} };
}

export function loadPresetStore(): PresetStoreLoadResult {
  const storage = getLocalStorage();
  if (!storage) return { store: createEmptyStore(), warning: "Local storage unavailable." };

  const raw = storage.getItem(STUDIO_PRESET_STORE_KEY);
  if (!raw) return { store: createEmptyStore() };

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!isValidStore(parsed)) {
      return { store: createEmptyStore(), warning: "Preset storage invalid; reset to defaults." };
    }
    return { store: parsed };
  } catch {
    return { store: createEmptyStore(), warning: "Preset storage corrupt; reset to defaults." };
  }
}

export function persistPresetStore(store: StudioPresetStoreV1): { ok: true } | { ok: false; error: string } {
  const storage = getLocalStorage();
  if (!storage) return { ok: false, error: "Local storage unavailable." };
  try {
    storage.setItem(STUDIO_PRESET_STORE_KEY, JSON.stringify(store));
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to persist presets";
    return { ok: false, error: message };
  }
}

export function upsertLocalPreset(args: {
  store: StudioPresetStoreV1;
  recipeId: string;
  preset: LocalPresetV1;
}): StudioPresetStoreV1 {
  const { store, recipeId, preset } = args;
  const existing = store.presetsByRecipeId[recipeId] ?? [];
  const next = existing.some((p) => p.id === preset.id)
    ? existing.map((p) => (p.id === preset.id ? preset : p))
    : [...existing, preset];
  return {
    version: 1,
    presetsByRecipeId: {
      ...store.presetsByRecipeId,
      [recipeId]: next,
    },
  };
}

export function removeLocalPreset(args: {
  store: StudioPresetStoreV1;
  recipeId: string;
  presetId: string;
}): StudioPresetStoreV1 {
  const { store, recipeId, presetId } = args;
  const existing = store.presetsByRecipeId[recipeId] ?? [];
  const next = existing.filter((p) => p.id !== presetId);
  return {
    version: 1,
    presetsByRecipeId: {
      ...store.presetsByRecipeId,
      [recipeId]: next,
    },
  };
}
