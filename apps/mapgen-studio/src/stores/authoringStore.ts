import type { RecipeSettings, WorldSettings } from "@swooper/mapgen-studio-ui/types";
import { create } from "zustand";
import { type PersistStorage, persist, type StorageValue } from "zustand/middleware";
import {
  type Civ7StudioSetupConfig,
  createDefaultCiv7StudioSetupConfig,
} from "../features/civ7Setup/setupConfig";
import { createStudioEditorCanonicalConfig } from "../features/configAuthoring/canonicalConfig";
import type { AuthoringConfigSource } from "../features/presets/types";
import {
  loadStudioAuthoringState,
  STUDIO_AUTHORING_STATE_KEY,
  type StudioAuthoringStateSnapshot,
  saveStudioAuthoringState,
} from "../features/studioState/persistence";
import { DEFAULT_STUDIO_RECIPE_ID } from "../recipes/catalog";

/** The single persisted owner of Studio authoring state and its active config source. */

type Updater<T> = T | ((prev: T) => T);

function resolve<T>(updater: Updater<T>, prev: T): T {
  return typeof updater === "function" ? (updater as (p: T) => T)(prev) : updater;
}

/** Live authoring data fields. */
type AuthoringData = {
  worldSettings: WorldSettings;
  recipeSettings: RecipeSettings;
  setupConfig: Civ7StudioSetupConfig;
  authoringConfigSource: AuthoringConfigSource;
  configEditingEnabled: boolean;
};

export type AuthoringState = AuthoringData & {
  authoringRevision: number;
  setWorldSettings: (next: Updater<WorldSettings>) => void;
  setRecipeSettings: (next: Updater<RecipeSettings>) => void;
  setSetupConfig: (next: Updater<Civ7StudioSetupConfig>) => void;
  setAuthoringConfigSource: (next: Updater<AuthoringConfigSource>) => void;
  setAuthoringSelection: (source: AuthoringConfigSource, settings: RecipeSettings) => void;
  setConfigEditingEnabled: (next: Updater<boolean>) => void;
};

/** Creates a deliberate editor default only when no persistence exists. */
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
  const setupConfig = persisted?.setupConfig ?? createDefaultCiv7StudioSetupConfig();
  const configEditingEnabled = persisted?.configEditingEnabled ?? true;
  const authoringConfigSource: AuthoringConfigSource = persisted?.authoringConfigSource ?? {
    kind: "editor",
    canonicalConfig: createStudioEditorCanonicalConfig(),
  };
  return {
    worldSettings,
    recipeSettings,
    setupConfig,
    authoringConfigSource,
    configEditingEnabled,
  };
}

/** Adapts the source-discriminated persistence schema to Zustand storage. */
const authoringPersistStorage: PersistStorage<AuthoringData> = {
  getItem: (_name): StorageValue<AuthoringData> | null => {
    const snapshot = loadStudioAuthoringState();
    if (!snapshot) return null;
    const state: AuthoringData = {
      worldSettings: snapshot.worldSettings,
      recipeSettings: snapshot.recipeSettings,
      setupConfig: snapshot.setupConfig,
      authoringConfigSource: snapshot.authoringConfigSource,
      configEditingEnabled: snapshot.configEditingEnabled,
    };
    return { state };
  },
  setItem: (_name, value): void => {
    const s = value.state;
    saveStudioAuthoringState({
      worldSettings: s.worldSettings,
      recipeSettings: s.recipeSettings,
      setupConfig: s.setupConfig,
      authoringConfigSource: s.authoringConfigSource,
      configEditingEnabled: s.configEditingEnabled,
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
      authoringRevision: 0,

      setWorldSettings: (next) =>
        set((s) => ({
          worldSettings: resolve(next, s.worldSettings),
          authoringRevision: s.authoringRevision + 1,
        })),
      setRecipeSettings: (next) =>
        set((s) => ({
          recipeSettings: resolve(next, s.recipeSettings),
          authoringRevision: s.authoringRevision + 1,
        })),
      setSetupConfig: (next) =>
        set((s) => ({
          setupConfig: resolve(next, s.setupConfig),
          authoringRevision: s.authoringRevision + 1,
        })),
      setAuthoringConfigSource: (next) =>
        set((s) => ({
          authoringConfigSource: resolve(next, s.authoringConfigSource),
          authoringRevision: s.authoringRevision + 1,
        })),
      setAuthoringSelection: (authoringConfigSource, recipeSettings) =>
        set((s) => ({
          authoringConfigSource,
          recipeSettings,
          authoringRevision: s.authoringRevision + 1,
        })),
      setConfigEditingEnabled: (next) =>
        set((s) => ({
          configEditingEnabled: resolve(next, s.configEditingEnabled),
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
        authoringConfigSource: state.authoringConfigSource,
        configEditingEnabled: state.configEditingEnabled,
      }),
    }
  )
);

export type { StudioAuthoringStateSnapshot };
