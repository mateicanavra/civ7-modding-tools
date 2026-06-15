import { create } from "zustand";

import {
  type RunInGameClientSnapshot,
  type RunInGameSourceSnapshot,
} from "../features/runInGame/clientState";
import type { LastRunSnapshot } from "../features/runInGame/liveSource";

/**
 * `runStore` — tab-session RUN / SAVE presentation state.
 *
 * S2.1 moved operation recovery to daemon-owned `studio.operations.current`.
 * This store no longer reads or writes operation request ids, run snapshots, or
 * source snapshots through browser storage. The fields here are session-only aids
 * for the current tab's stale/current relation and Live Game preset display.
 */

type Updater<T> = T | ((prev: T) => T);

function resolve<T>(updater: Updater<T>, prev: T): T {
  return typeof updater === "function" ? (updater as (p: T) => T)(prev) : updater;
}

export type RunState = {
  runInGameSnapshot: RunInGameClientSnapshot | null;
  lastRunInGameSource: RunInGameSourceSnapshot | null;
  lastRunSnapshot: LastRunSnapshot | null;
  lastSaveDeployConfig: unknown;

  setRunInGameSnapshot: (next: Updater<RunInGameClientSnapshot | null>) => void;
  setLastRunInGameSource: (next: Updater<RunInGameSourceSnapshot | null>) => void;
  setLastRunSnapshot: (next: Updater<LastRunSnapshot | null>) => void;
  setLastSaveDeployConfig: (next: Updater<unknown>) => void;
};

export const useRunStore = create<RunState>()((set) => ({
  runInGameSnapshot: null,
  lastRunInGameSource: null,
  lastRunSnapshot: null,
  lastSaveDeployConfig: null,

  setRunInGameSnapshot: (next) =>
    set((s) => ({ runInGameSnapshot: resolve(next, s.runInGameSnapshot) })),
  setLastRunInGameSource: (next) =>
    set((s) => ({ lastRunInGameSource: resolve(next, s.lastRunInGameSource) })),
  setLastRunSnapshot: (next) => set((s) => ({ lastRunSnapshot: resolve(next, s.lastRunSnapshot) })),
  setLastSaveDeployConfig: (next) =>
    set((s) => ({ lastSaveDeployConfig: resolve(next, s.lastSaveDeployConfig) })),
}));
