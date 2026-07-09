import type {
  PipelineConfig,
  RecipeSettings,
  WorldSettings,
} from "@swooper/mapgen-studio-ui/types";
import { create } from "zustand";
import { type PersistStorage, persist, type StorageValue } from "zustand/middleware";
import {
  type Civ7StudioSetupConfig,
  DEFAULT_CIV7_STUDIO_SETUP_CONFIG,
} from "../features/civ7Setup/setupConfig";
import {
  loadStudioAuthoringState,
  STUDIO_AUTHORING_STATE_KEY,
  type StudioAuthoringStateSnapshot,
  saveStudioAuthoringState,
} from "../features/studioState/persistence";
import { getMaterializedRecipeDefaultConfig } from "../features/configOverrides/effectiveConfig";
import type { BuiltInPreset } from "../recipes/catalog";
import { DEFAULT_STUDIO_RECIPE_ID } from "../recipes/catalog";

/**
 * `authoringStore` — the single persisted owner of AUTHORING state
 * (world settings, recipe selection, setup config, current complete recipe
 * config, and the overrides-disabled flag).
 *
 * The on-disk localStorage envelope is parsed at the persistence boundary, where
 * the selected recipe config must validate and materialize through the current
 * recipe schema before it can hydrate live authoring state.
 *
 * The persist `storage` adapter below is a thin translation between zustand's
 * `StorageValue` envelope and `features/studioState/persistence.ts`. Session
 * repo-backed presets deliberately stay out of the disk schema: browser state may
 * recover authoring work, but it must not become an alternate built-in catalog.
 *
 * Setters mirror React's `useState` signature (value OR updater) so the migration off
 * scattered `setX((prev) => …)` call sites in `StudioShell` is a drop-in.
 */

type Updater<T> = T | ((prev: T) => T);

function resolve<T>(updater: Updater<T>, prev: T): T {
  return typeof updater === "function" ? (updater as (p: T) => T)(prev) : updater;
}

/** Live authoring data fields. `repoBackedSessionPresetsByRecipe` is session-only. */
type AuthoringData = {
  worldSettings: WorldSettings;
  recipeSettings: RecipeSettings;
  setupConfig: Civ7StudioSetupConfig;
  pipelineConfig: PipelineConfig;
  overridesDisabled: boolean;
  repoBackedSessionPresetsByRecipe: Record<string, Record<string, BuiltInPreset>>;
};

export type AuthoringState = AuthoringData & {
  setWorldSettings: (next: Updater<WorldSettings>) => void;
  setRecipeSettings: (next: Updater<RecipeSettings>) => void;
  setSetupConfig: (next: Updater<Civ7StudioSetupConfig>) => void;
  setPipelineConfig: (next: Updater<PipelineConfig>) => void;
  setOverridesDisabled: (next: Updater<boolean>) => void;
  setRepoBackedSessionPresetsByRecipe: (
    next: Updater<Record<string, Record<string, BuiltInPreset>>>
  ) => void;
};

/**
 * The initial authoring data — reproduces the prior `StudioShell` lazy `useState`
 * initializers EXACTLY (lines that read `initialAuthoringState?.<field> ?? <default>`),
 * including the recipe-derived `pipelineConfig` default from the persisted/default
 * recipe's artifacts used when nothing is persisted.
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
  const repoBackedSessionPresetsByRecipe: Record<string, Record<string, BuiltInPreset>> = {};
  const pipelineConfig: PipelineConfig = persisted?.pipelineConfig
    ? persisted.pipelineConfig
    : getMaterializedRecipeDefaultConfig(recipeSettings.recipe, "initial-authoring");
  return {
    worldSettings,
    recipeSettings,
    setupConfig,
    pipelineConfig,
    overridesDisabled,
    repoBackedSessionPresetsByRecipe,
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
      repoBackedSessionPresetsByRecipe: {},
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
      setRepoBackedSessionPresetsByRecipe: (next) =>
        set((s) => ({
          repoBackedSessionPresetsByRecipe: resolve(next, s.repoBackedSessionPresetsByRecipe),
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
        repoBackedSessionPresetsByRecipe: {},
      }),
    }
  )
);

export type { StudioAuthoringStateSnapshot };
