import { create } from "zustand";

import type { RunInGameClientSnapshot } from "../features/runInGame/clientState";
import type { BrowserRunSnapshot } from "../features/runInGame/liveSource";

/** Session-only snapshots of browser runs and browser-submitted Run in Game requests. */

type Updater<T> = T | ((prev: T) => T);

function resolve<T>(updater: Updater<T>, prev: T): T {
  return typeof updater === "function" ? (updater as (p: T) => T)(prev) : updater;
}

export type RunState = {
  runInGameSnapshot: RunInGameClientSnapshot | null;
  lastRunSnapshot: BrowserRunSnapshot | null;

  setRunInGameSnapshot: (next: Updater<RunInGameClientSnapshot | null>) => void;
  setLastRunSnapshot: (next: Updater<BrowserRunSnapshot | null>) => void;
};

export const useRunStore = create<RunState>()((set) => ({
  runInGameSnapshot: null,
  lastRunSnapshot: null,

  setRunInGameSnapshot: (next) =>
    set((s) => ({ runInGameSnapshot: resolve(next, s.runInGameSnapshot) })),
  setLastRunSnapshot: (next) => set((s) => ({ lastRunSnapshot: resolve(next, s.lastRunSnapshot) })),
}));
