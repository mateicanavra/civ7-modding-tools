import { create } from "zustand";
import { type PersistStorage, persist, type StorageValue } from "zustand/middleware";
import {
  type Civ7StudioSetupConfig,
  DEFAULT_CIV7_STUDIO_SETUP_CONFIG,
} from "../features/civ7Setup/setupConfig";
import { buildDefaultConfig } from "../features/configOverrides/configBuilders";
import {
  loadStudioAuthoringState,
  STUDIO_AUTHORING_STATE_KEY,
  type StudioAuthoringStateSnapshot,
  saveStudioAuthoringState,
} from "../features/studioState/persistence";
import type { BuiltInPreset } from "../recipes/catalog";
import { DEFAULT_STUDIO_RECIPE_ID, getRecipeArtifacts } from "../recipes/catalog";
import type { PipelineConfig, RecipeSettings, WorldSettings } from "../ui/types";

/**
 * `authoringStore` — the single persisted owner of AUTHORING state
 * (architecture/10 §3). It replaces the six `StudioShell` `useState`s
 * (`worldSettings`, `recipeSettings`, `setupConfig`, `pipelineConfig`,
 * `overridesDisabled`, `repoBackedPresetOverridesByRecipe`) and the manual
 * `saveStudioAuthoringState` persistence `useEffect`.
 *
 * HARD-CORE PARITY (FRAME §4, architecture/10 §6): the on-disk localStorage schema
 * is a contract. This store does NOT reimplement (de)serialization — it delegates
 * to the EXISTING reference impl in `features/studioState/persistence.ts`:
 * - hydration reads through `loadStudioAuthoringState()` (same parse, normalizers,
 *   migrations);
 * - writes go through `saveStudioAuthoringState()` (same `STUDIO_AUTHORING_STATE_KEY`,
 *   same `schemaVersion:1` + `savedAt` envelope, same normalizers/migrations).
 * The persist `storage` adapter below is a thin translation between zustand's
 * `StorageValue` envelope and that existing schema, so the bytes written to disk are
 * identical to before — only the WRITE TRIGGER moved from a `useEffect` to the store's
 * own persist hook.
 *
 * Setters mirror React's `useState` signature (value OR updater) so the migration off
 * scattered `setX((prev) => …)` call sites in `StudioShell` is a drop-in.
 */

type Updater<T> = T | ((prev: T) => T);

function resolve<T>(updater: Updater<T>, prev: T): T {
  return typeof updater === "function" ? (updater as (p: T) => T)(prev) : updater;
}

/** The persisted authoring fields (no actions) — the shape that round-trips to disk. */
type AuthoringData = {
  worldSettings: WorldSettings;
  recipeSettings: RecipeSettings;
  setupConfig: Civ7StudioSetupConfig;
  pipelineConfig: PipelineConfig;
  overridesDisabled: boolean;
  repoBackedPresetOverridesByRecipe: Record<string, Record<string, BuiltInPreset>>;
};

export type AuthoringState = AuthoringData & {
  setWorldSettings: (next: Updater<WorldSettings>) => void;
  setRecipeSettings: (next: Updater<RecipeSettings>) => void;
  setSetupConfig: (next: Updater<Civ7StudioSetupConfig>) => void;
  setPipelineConfig: (next: Updater<PipelineConfig>) => void;
  setOverridesDisabled: (next: Updater<boolean>) => void;
  setRepoBackedPresetOverridesByRecipe: (
    next: Updater<Record<string, Record<string, BuiltInPreset>>>
  ) => void;
};

/**
 * The initial authoring data — reproduces the prior `StudioShell` lazy `useState`
 * initializers EXACTLY (lines that read `initialAuthoringState?.<field> ?? <default>`),
 * including the recipe-derived `pipelineConfig` default (`buildDefaultConfig` from the
 * persisted/default recipe's artifacts) used when nothing is persisted.
 */
function buildInitialAuthoringData(): AuthoringData {
  const persisted = loadStudioAuthoringState();
  const worldSettings = persisted?.worldSettings ?? {
    mapSize: "MAPSIZE_STANDARD",
    playerCount: 6,
    resources: "balanced",
  };
  const recipeSettings = persisted?.recipeSettings ?? {
    recipe: DEFAULT_STUDIO_RECIPE_ID,
    preset: "none",
    seed: "123",
  };
  const setupConfig = persisted?.setupConfig ?? DEFAULT_CIV7_STUDIO_SETUP_CONFIG;
  const overridesDisabled = persisted?.overridesDisabled ?? false;
  const repoBackedPresetOverridesByRecipe = persisted?.repoBackedPresetOverridesByRecipe ?? {};
  const pipelineConfig: PipelineConfig = persisted?.pipelineConfig
    ? persisted.pipelineConfig
    : (() => {
        const artifacts = getRecipeArtifacts(recipeSettings.recipe);
        return buildDefaultConfig(
          artifacts.configSchema,
          artifacts.uiMeta,
          artifacts.defaultConfig
        );
      })();
  return {
    worldSettings,
    recipeSettings,
    setupConfig,
    pipelineConfig,
    overridesDisabled,
    repoBackedPresetOverridesByRecipe,
  };
}

/**
 * zustand persist storage adapter delegating to the reference persistence impl, so the
 * disk schema stays byte-identical. `getItem` re-wraps the parsed snapshot in zustand's
 * `StorageValue` envelope (consumed by `partialize`/hydration); `setItem` unwraps it and
 * calls `saveStudioAuthoringState`, which writes the existing `schemaVersion:1` schema.
 */
const authoringPersistStorage: PersistStorage<AuthoringData> = {
  getItem: (_name): StorageValue<AuthoringData> | null => {
    const snapshot = loadStudioAuthoringState();
    if (!snapshot) return null;
    const state: AuthoringData = {
      worldSettings: snapshot.worldSettings,
      recipeSettings: snapshot.recipeSettings,
      setupConfig: snapshot.setupConfig,
      pipelineConfig: snapshot.pipelineConfig,
      overridesDisabled: snapshot.overridesDisabled,
      repoBackedPresetOverridesByRecipe: snapshot.repoBackedPresetOverridesByRecipe,
    };
    return { state };
  },
  setItem: (_name, value): void => {
    const s = value.state;
    saveStudioAuthoringState({
      worldSettings: s.worldSettings,
      recipeSettings: s.recipeSettings,
      setupConfig: s.setupConfig,
      pipelineConfig: s.pipelineConfig,
      overridesDisabled: s.overridesDisabled,
      repoBackedPresetOverridesByRecipe: s.repoBackedPresetOverridesByRecipe,
    });
  },
  removeItem: (_name): void => {
    // Authoring state is never explicitly removed; persistence is a refresh recovery
    // aid. Provided to satisfy the StorageValue contract.
    try {
      if (typeof window !== "undefined")
        window.localStorage?.removeItem(STUDIO_AUTHORING_STATE_KEY);
    } catch {
      // Removal is best-effort and must not break authoring.
    }
  },
};

export const useAuthoringStore = create<AuthoringState>()(
  persist(
    (set) => ({
      ...buildInitialAuthoringData(),

      setWorldSettings: (next) => set((s) => ({ worldSettings: resolve(next, s.worldSettings) })),
      setRecipeSettings: (next) =>
        set((s) => ({ recipeSettings: resolve(next, s.recipeSettings) })),
      setSetupConfig: (next) => set((s) => ({ setupConfig: resolve(next, s.setupConfig) })),
      setPipelineConfig: (next) =>
        set((s) => ({ pipelineConfig: resolve(next, s.pipelineConfig) })),
      setOverridesDisabled: (next) =>
        set((s) => ({ overridesDisabled: resolve(next, s.overridesDisabled) })),
      setRepoBackedPresetOverridesByRecipe: (next) =>
        set((s) => ({
          repoBackedPresetOverridesByRecipe: resolve(next, s.repoBackedPresetOverridesByRecipe),
        })),
    }),
    {
      name: STUDIO_AUTHORING_STATE_KEY,
      storage: authoringPersistStorage,
      // Persist only the data fields (the reference serializer normalizes them); actions
      // are never written to disk.
      partialize: (state): AuthoringData => ({
        worldSettings: state.worldSettings,
        recipeSettings: state.recipeSettings,
        setupConfig: state.setupConfig,
        pipelineConfig: state.pipelineConfig,
        overridesDisabled: state.overridesDisabled,
        repoBackedPresetOverridesByRecipe: state.repoBackedPresetOverridesByRecipe,
      }),
    }
  )
);

export type { StudioAuthoringStateSnapshot };
