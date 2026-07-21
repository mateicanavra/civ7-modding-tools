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
import {
  DEFAULT_STUDIO_RECIPE_ID,
  findCatalogConfig,
  findRecipeArtifacts,
} from "../recipes/catalog";

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
   * at every whole-envelope INSTALL (recipe select, config select, import,
   * save adoption) and untouched by working edits. It is the baseline all
   * working-change UI keys on (RecipePanel drift/rollback). Not persisted:
   * on boot it re-derives from the catalog by the envelope's identity, and an
   * unresolvable identity falls back to the persisted working values.
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
   * Whole-envelope install (recipe select, config select, import, save
   * adoption): replaces the canonical config AND refreshes `baselineConfig`
   * to the installed values — the one place the baseline moves.
   */
  installCanonicalConfig: (next: MapConfigEnvelope) => void;
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

/**
 * Boot-time baseline: the loaded config's ORIGINAL values, re-derived from
 * the catalog by the persisted envelope's identity (the baseline itself is
 * deliberately not persisted). Identities the catalog can't resolve —
 * imported files, repo-saved configs — fall back to the persisted working
 * values: working-change tracking then restarts from the reloaded state.
 */
function deriveBaselineConfig(canonical: MapConfigEnvelope): MapConfigEnvelope["config"] {
  const catalogMatch = findCatalogConfig(canonical.recipe, canonical.id);
  if (catalogMatch !== null) return catalogMatch.config;
  const recipeDefault = findRecipeArtifacts(canonical.recipe)?.defaultCanonicalConfig;
  if (recipeDefault !== undefined && recipeDefault.id === canonical.id) return recipeDefault.config;
  return canonical.config;
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
        baselineConfig: deriveBaselineConfig(initial.canonicalConfig),
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
