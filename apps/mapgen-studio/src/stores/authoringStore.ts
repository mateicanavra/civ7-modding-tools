import type { MapConfigEnvelope } from "@civ7/studio-contract";
import type { WorldSettings } from "@swooper/mapgen-studio-ui/types";
import { create } from "zustand";
import { type PersistStorage, persist, type StorageValue } from "zustand/middleware";
import {
  type Civ7StudioSetupConfig,
  createDefaultCiv7StudioSetupConfig,
} from "../features/civ7Setup/setupConfig";
import { getRecipeDefaultCanonicalConfig } from "../features/configAuthoring/canonicalConfig";
import {
  loadStudioAuthoringState,
  STUDIO_AUTHORING_STATE_KEY,
  type StudioAuthoringStateSnapshot,
  saveStudioAuthoringState,
} from "../features/studioState/persistence";
import { DEFAULT_STUDIO_RECIPE_ID } from "../recipes/catalog";

type Updater<T> = T | ((previous: T) => T);

function resolve<T>(updater: Updater<T>, previous: T): T {
  return typeof updater === "function" ? (updater as (value: T) => T)(previous) : updater;
}

type AuthoringData = {
  worldSettings: WorldSettings;
  seed: string;
  setupConfig: Civ7StudioSetupConfig;
  canonicalConfig: MapConfigEnvelope;
};

export type AuthoringState = AuthoringData & {
  /**
   * The loaded config's values — a snapshot of `canonicalConfig.config` taken
   * at every whole-envelope INSTALL (recipe select, config select, import)
   * or SAVE ADOPTION, and untouched by working edits. It is the baseline all
   * working-change UI keys on (RecipePanel drift/rollback). Not persisted:
   * on boot it starts at the persisted working values — working-change
   * tracking restarts each session. (Deliberate: an identity-based catalog
   * re-derivation was tried and reverted — after a save-to-current it
   * resolved the id back to PRE-save values, so "Discard Changes" would have
   * silently destroyed saved work. Carrying drift across reloads needs the
   * baseline in the versioned authoring snapshot, not a boot-time guess.)
   */
  baselineConfig: MapConfigEnvelope["config"];
  authoringRevision: number;
  setWorldSettings: (next: Updater<WorldSettings>) => void;
  setSeed: (next: Updater<string>) => void;
  setSetupConfig: (next: Updater<Civ7StudioSetupConfig>) => void;
  /**
   * Working-config updates (edits, path patches): the envelope changes, the
   * baseline does NOT. Whole-envelope installs go through
   * `installCanonicalConfig` instead — routing an install through this setter
   * would leave stale drift indicators against the previous config.
   */
  setCanonicalConfig: (next: Updater<MapConfigEnvelope>) => void;
  /**
   * Whole-envelope install (recipe select, config select, import, save-as-new
   * adoption): replaces the canonical config AND refreshes `baselineConfig`
   * to the installed values.
   */
  installCanonicalConfig: (next: MapConfigEnvelope) => void;
  /**
   * Save adoption WITHOUT an install: a successful save-to-current makes the
   * just-saved values the loaded baseline, but must not touch the canonical
   * config (edits made while the save was in flight stay) and must not bump
   * `authoringRevision` (nothing authored changed — a bump would flip the
   * run-dirty state and trigger a redundant auto-run).
   */
  adoptSavedBaseline: (saved: MapConfigEnvelope["config"]) => void;
};

function buildInitialAuthoringData(): AuthoringData {
  const persisted = loadStudioAuthoringState();
  return {
    worldSettings: persisted?.worldSettings ?? {
      mapSize: "MAPSIZE_STANDARD",
      playerCount: 6,
      resources: "balanced",
    },
    seed: persisted?.seed ?? "123",
    setupConfig: persisted?.setupConfig ?? createDefaultCiv7StudioSetupConfig(),
    canonicalConfig:
      persisted?.canonicalConfig ?? getRecipeDefaultCanonicalConfig(DEFAULT_STUDIO_RECIPE_ID),
  };
}

const authoringPersistStorage: PersistStorage<AuthoringData> = {
  getItem: (): StorageValue<AuthoringData> | null => {
    const snapshot = loadStudioAuthoringState();
    return snapshot === null
      ? null
      : {
          state: {
            worldSettings: snapshot.worldSettings,
            seed: snapshot.seed,
            setupConfig: snapshot.setupConfig,
            canonicalConfig: snapshot.canonicalConfig,
          },
        };
  },
  setItem: (_name, value): void => saveStudioAuthoringState(value.state),
  removeItem: (): void => {
    try {
      if (typeof window !== "undefined")
        window.localStorage?.removeItem(STUDIO_AUTHORING_STATE_KEY);
    } catch {
      // Removal is best effort.
    }
  },
};

export const useAuthoringStore = create<AuthoringState>()(
  persist(
    (set) => {
      const initial = buildInitialAuthoringData();
      return {
        ...initial,
        baselineConfig: initial.canonicalConfig.config,
        authoringRevision: 0,
        setWorldSettings: (next) =>
          set((state) => ({
            worldSettings: resolve(next, state.worldSettings),
            authoringRevision: state.authoringRevision + 1,
          })),
        setSeed: (next) =>
          set((state) => ({
            seed: resolve(next, state.seed),
            authoringRevision: state.authoringRevision + 1,
          })),
        setSetupConfig: (next) =>
          set((state) => ({
            setupConfig: resolve(next, state.setupConfig),
            authoringRevision: state.authoringRevision + 1,
          })),
        setCanonicalConfig: (next) =>
          set((state) => ({
            canonicalConfig: resolve(next, state.canonicalConfig),
            authoringRevision: state.authoringRevision + 1,
          })),
        installCanonicalConfig: (next) =>
          set((state) => ({
            canonicalConfig: next,
            baselineConfig: next.config,
            authoringRevision: state.authoringRevision + 1,
          })),
        adoptSavedBaseline: (saved) => set(() => ({ baselineConfig: saved })),
      };
    },
    {
      name: STUDIO_AUTHORING_STATE_KEY,
      storage: authoringPersistStorage,
      partialize: (state): AuthoringData => ({
        worldSettings: state.worldSettings,
        seed: state.seed,
        setupConfig: state.setupConfig,
        canonicalConfig: state.canonicalConfig,
      }),
    }
  )
);

export type { StudioAuthoringStateSnapshot };
