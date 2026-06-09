import { create } from "zustand";
import { persist, type PersistStorage, type StorageValue } from "zustand/middleware";

import {
  parseRunInGameClientSnapshot,
  parseRunInGameSourceSnapshot,
  type RunInGameClientSnapshot,
  type RunInGameSourceSnapshot,
} from "../features/runInGame/clientState";
import {
  RUN_IN_GAME_LAST_REQUEST_KEY,
  RUN_IN_GAME_LAST_SNAPSHOT_KEY,
  RUN_IN_GAME_LAST_SOURCE_KEY,
} from "../features/runInGame/sourceSnapshotStorage";
import { MAP_CONFIG_SAVE_LAST_REQUEST_KEY } from "../features/mapConfigSave/api";
import type { LastRunSnapshot } from "../features/runInGame/liveSource";

/**
 * `runStore` — the single owner of RUN / SAVE correlation state (architecture/10 §3).
 *
 * It replaces the `StudioShell` run/save `useState`s and the scattered
 * `localStorage.setItem`/`getItem` calls that bridged the active request ids and the
 * last run-in-game snapshot/source across dev-server reloads.
 *
 * Two field classes:
 * - PERSISTED (the localStorage bridge): `runInGameRequestId`, `runInGameSnapshot`,
 *   `lastRunInGameSource`, `saveDeployRequestId`. These resume an in-flight operation's
 *   status poll after a reload.
 * - SESSION-ONLY (never persisted, exactly as before): `lastRunSnapshot`,
 *   `lastSaveDeployConfig` — transient authoring-session state.
 *
 * HARD-CORE PARITY (FRAME §4, architecture/10 §6, §7): the on-disk schema is a
 * contract. The persisted surface is NOT a single zustand blob — it is the SAME FOUR
 * independent localStorage keys the prior code wrote, with the SAME serializers
 * (`RUN_IN_GAME_LAST_REQUEST_KEY`/`MAP_CONFIG_SAVE_LAST_REQUEST_KEY` raw request-id
 * strings; `RUN_IN_GAME_LAST_SNAPSHOT_KEY`/`RUN_IN_GAME_LAST_SOURCE_KEY` JSON via the
 * existing `parse*Snapshot` readers). The `storage` adapter below fans the store's
 * persisted slice OUT to those four keys on write and reads them BACK on hydrate, so a
 * payload written before this change loads unchanged and the bytes are identical.
 */

type Updater<T> = T | ((prev: T) => T);

function resolve<T>(updater: Updater<T>, prev: T): T {
  return typeof updater === "function" ? (updater as (p: T) => T)(prev) : updater;
}

/** The persisted slice — what the four-key bridge round-trips. */
type RunPersistedData = {
  runInGameRequestId: string | null;
  runInGameSnapshot: RunInGameClientSnapshot | null;
  lastRunInGameSource: RunInGameSourceSnapshot | null;
  saveDeployRequestId: string | null;
};

export type RunState = RunPersistedData & {
  // Session-only (not persisted) — parity with the prior in-memory `useState`.
  lastRunSnapshot: LastRunSnapshot | null;
  lastSaveDeployConfig: unknown;

  setRunInGameRequestId: (next: Updater<string | null>) => void;
  setRunInGameSnapshot: (next: Updater<RunInGameClientSnapshot | null>) => void;
  setLastRunInGameSource: (next: Updater<RunInGameSourceSnapshot | null>) => void;
  setSaveDeployRequestId: (next: Updater<string | null>) => void;
  setLastRunSnapshot: (next: Updater<LastRunSnapshot | null>) => void;
  setLastSaveDeployConfig: (next: Updater<unknown>) => void;
};

function readRawKey(key: string): string | null {
  try {
    if (typeof localStorage === "undefined") return null;
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeRawKey(key: string, value: string | null): void {
  try {
    if (typeof localStorage === "undefined") return;
    if (value === null) {
      localStorage.removeItem(key);
      return;
    }
    localStorage.setItem(key, value);
  } catch {
    // Server status remains authoritative while the dev server is alive — persistence
    // is a refresh recovery aid and must not break the run/save flow.
  }
}

/** Initial persisted slice — read from the existing four keys (same readers as the prior mount effect). */
function readInitialPersistedData(): RunPersistedData {
  return {
    runInGameRequestId: readRawKey(RUN_IN_GAME_LAST_REQUEST_KEY),
    runInGameSnapshot: parseRunInGameClientSnapshot(readRawKey(RUN_IN_GAME_LAST_SNAPSHOT_KEY)),
    lastRunInGameSource: parseRunInGameSourceSnapshot(readRawKey(RUN_IN_GAME_LAST_SOURCE_KEY)),
    saveDeployRequestId: readRawKey(MAP_CONFIG_SAVE_LAST_REQUEST_KEY),
  };
}

/**
 * Fan-out persist storage: maps the store's persisted slice onto the four legacy keys.
 * Only fields that have a defined value are written to their key; a `null` field clears
 * its key. JSON blobs use `JSON.stringify` (matching the prior `setItem` writes) and are
 * read back through the existing tolerant parsers.
 */
const runPersistStorage: PersistStorage<RunPersistedData> = {
  getItem: (_name): StorageValue<RunPersistedData> | null => {
    const state = readInitialPersistedData();
    if (
      state.runInGameRequestId === null &&
      state.runInGameSnapshot === null &&
      state.lastRunInGameSource === null &&
      state.saveDeployRequestId === null
    ) {
      return null;
    }
    return { state };
  },
  setItem: (_name, value): void => {
    const s = value.state;
    writeRawKey(RUN_IN_GAME_LAST_REQUEST_KEY, s.runInGameRequestId);
    writeRawKey(
      RUN_IN_GAME_LAST_SNAPSHOT_KEY,
      s.runInGameSnapshot ? JSON.stringify(s.runInGameSnapshot) : null,
    );
    writeRawKey(
      RUN_IN_GAME_LAST_SOURCE_KEY,
      s.lastRunInGameSource ? JSON.stringify(s.lastRunInGameSource) : null,
    );
    writeRawKey(MAP_CONFIG_SAVE_LAST_REQUEST_KEY, s.saveDeployRequestId);
  },
  removeItem: (_name): void => {
    writeRawKey(RUN_IN_GAME_LAST_REQUEST_KEY, null);
    writeRawKey(RUN_IN_GAME_LAST_SNAPSHOT_KEY, null);
    writeRawKey(RUN_IN_GAME_LAST_SOURCE_KEY, null);
    writeRawKey(MAP_CONFIG_SAVE_LAST_REQUEST_KEY, null);
  },
};

export const useRunStore = create<RunState>()(
  persist(
    (set) => ({
      ...readInitialPersistedData(),
      lastRunSnapshot: null,
      lastSaveDeployConfig: null,

      setRunInGameRequestId: (next) =>
        set((s) => ({ runInGameRequestId: resolve(next, s.runInGameRequestId) })),
      setRunInGameSnapshot: (next) =>
        set((s) => ({ runInGameSnapshot: resolve(next, s.runInGameSnapshot) })),
      setLastRunInGameSource: (next) =>
        set((s) => ({ lastRunInGameSource: resolve(next, s.lastRunInGameSource) })),
      setSaveDeployRequestId: (next) =>
        set((s) => ({ saveDeployRequestId: resolve(next, s.saveDeployRequestId) })),
      setLastRunSnapshot: (next) =>
        set((s) => ({ lastRunSnapshot: resolve(next, s.lastRunSnapshot) })),
      setLastSaveDeployConfig: (next) =>
        set((s) => ({ lastSaveDeployConfig: resolve(next, s.lastSaveDeployConfig) })),
    }),
    {
      // `name` is unused by the fan-out adapter (it addresses the four legacy keys
      // directly) but is required by the persist contract.
      name: "mapgen-studio.runStore.bridge.v1",
      storage: runPersistStorage,
      // Persist only the four-key bridge slice; session-only fields and actions never
      // touch disk (parity with the prior in-memory `useState`).
      partialize: (state): RunPersistedData => ({
        runInGameRequestId: state.runInGameRequestId,
        runInGameSnapshot: state.runInGameSnapshot,
        lastRunInGameSource: state.lastRunInGameSource,
        saveDeployRequestId: state.saveDeployRequestId,
      }),
    },
  ),
);
