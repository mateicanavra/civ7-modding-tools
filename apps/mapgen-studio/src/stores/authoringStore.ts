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
  authoringRevision: number;
  setWorldSettings: (next: Updater<WorldSettings>) => void;
  setSeed: (next: Updater<string>) => void;
  setSetupConfig: (next: Updater<Civ7StudioSetupConfig>) => void;
  setCanonicalConfig: (next: Updater<MapConfigEnvelope>) => void;
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
    (set) => ({
      ...buildInitialAuthoringData(),
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
    }),
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
