import type { StudioEventHubApi } from "../services/StudioEventHub.js";
import type { StudioRuntime } from "../runtime.js";
import {
  buildLiveGameErrorState,
  buildLiveGameState,
  liveGameStateKey,
  type LiveGameState,
  type LiveGameStatusBody,
} from "./model.js";
import { readLiveGameStatusBody } from "./statusRead.js";

export const LIVE_GAME_WATCH_INITIAL_DELAY_MS = 250;
export const LIVE_GAME_WATCH_INTERVAL_MS = 3_000;

export interface LiveGameWatcher {
  start(): void;
  stop(): void;
  tick(): Promise<void>;
}

export interface LiveGameWatcherOptions {
  initialDelayMs?: number;
  intervalMs?: number;
  now?: () => Date;
}

export interface LiveGameWatcherDeps {
  eventHub: Pick<StudioEventHubApi, "publish">;
  readLiveStatus(): Promise<LiveGameStatusBody>;
  options?: LiveGameWatcherOptions;
}

export function createRuntimeLiveGameWatcher(args: {
  runtime: StudioRuntime;
  eventHub: Pick<StudioEventHubApi, "publish">;
  options?: LiveGameWatcherOptions;
}): LiveGameWatcher {
  return createLiveGameWatcher({
    eventHub: args.eventHub,
    readLiveStatus: () => args.runtime.runPromise(readLiveGameStatusBody),
    options: args.options,
  });
}

export function createLiveGameWatcher(args: LiveGameWatcherDeps): LiveGameWatcher {
  const initialDelayMs = args.options?.initialDelayMs ?? LIVE_GAME_WATCH_INITIAL_DELAY_MS;
  const intervalMs = args.options?.intervalMs ?? LIVE_GAME_WATCH_INTERVAL_MS;
  const now = args.options?.now ?? (() => new Date());
  let timer: ReturnType<typeof setTimeout> | null = null;
  let running = false;
  let stopped = false;
  let started = false;
  let lastPublishedKey: string | null = null;
  let failureCount = 0;

  const schedule = (delayMs: number) => {
    if (stopped) return;
    if (timer !== null) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      void tick();
    }, delayMs);
  };

  const publishIfChanged = async (state: LiveGameState) => {
    const key = liveGameStateKey(state);
    if (key === lastPublishedKey) return;
    lastPublishedKey = key;
    await args.eventHub.publish({
      type: "live-game",
      state,
      observedAt: state.updatedAt ?? now().toISOString(),
    });
  };

  const tick = async () => {
    if (running || stopped) return;
    running = true;
    try {
      const body = await args.readLiveStatus();
      const baseState = buildLiveGameState({
        body,
        observedAtFallback: now().toISOString(),
        failureCount: 0,
      });
      failureCount = baseState.status === "ok" ? 0 : failureCount + 1;
      const state = {
        ...baseState,
        failureCount,
      };
      await publishIfChanged(state);
    } catch (err) {
      failureCount += 1;
      await publishIfChanged(
        buildLiveGameErrorState({
          error: err,
          observedAt: now().toISOString(),
          failureCount,
        }),
      );
    } finally {
      running = false;
      if (started && !stopped) schedule(intervalMs);
    }
  };

  return {
    start() {
      if (started) return;
      started = true;
      stopped = false;
      schedule(initialDelayMs);
    },
    stop() {
      stopped = true;
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
    },
    tick,
  };
}
