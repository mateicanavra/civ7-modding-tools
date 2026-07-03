import {
  buildLiveGameErrorState,
  buildLiveGameState,
  type LiveGameState,
  type LiveGameStatusBody,
  liveGameStateKey,
} from "@civ7/studio-contract";
import { Context, Effect, Layer, Ref, type Scope } from "effect";
import { Civ7TunerClient } from "../services/Civ7TunerClient.js";
import { StudioEventHub, type StudioEventHubApi } from "../services/StudioEventHub.js";
import { readLiveGameStatusBody } from "./statusRead.js";

export const LIVE_GAME_WATCH_INITIAL_DELAY_MS = 250;
export const LIVE_GAME_WATCH_INTERVAL_MS = 3_000;

export interface LiveGameWatcher {
  tick: Effect.Effect<void>;
}

export class StudioLiveGameWatcher extends Context.Tag("@civ7/studio-server/StudioLiveGameWatcher")<
  StudioLiveGameWatcher,
  LiveGameWatcher
>() {}

export interface LiveGameWatcherOptions {
  initialDelayMs?: number;
  intervalMs?: number;
  now?: () => Date;
}

export interface LiveGameWatcherDeps {
  eventHub: Pick<StudioEventHubApi, "publish">;
  readLiveStatus: Effect.Effect<LiveGameStatusBody, unknown, never>;
  options?: LiveGameWatcherOptions;
}

export function makeStudioLiveGameWatcherLayer(args: {
  options?: LiveGameWatcherOptions;
}): Layer.Layer<StudioLiveGameWatcher, never, Civ7TunerClient | StudioEventHub> {
  return Layer.scoped(
    StudioLiveGameWatcher,
    Effect.gen(function* () {
      const tunerClient = yield* Civ7TunerClient;
      const eventHub = yield* StudioEventHub;
      return yield* makeLiveGameWatcher({
        eventHub,
        readLiveStatus: readLiveGameStatusBody.pipe(
          Effect.provideService(Civ7TunerClient, tunerClient)
        ),
        options: args.options,
      });
    })
  );
}

export function makeLiveGameWatcherLayer(
  args: LiveGameWatcherDeps
): Layer.Layer<StudioLiveGameWatcher, never> {
  return Layer.scoped(StudioLiveGameWatcher, makeLiveGameWatcher(args));
}

function makeLiveGameWatcher(
  args: LiveGameWatcherDeps
): Effect.Effect<LiveGameWatcher, never, Scope.Scope> {
  const initialDelayMs = args.options?.initialDelayMs ?? LIVE_GAME_WATCH_INITIAL_DELAY_MS;
  const intervalMs = args.options?.intervalMs ?? LIVE_GAME_WATCH_INTERVAL_MS;
  const now = args.options?.now ?? (() => new Date());

  return Effect.gen(function* () {
    const lastPublishedKey = yield* Ref.make<string | null>(null);
    const failureCount = yield* Ref.make(0);
    const tickGate = yield* Effect.makeSemaphore(1);
    const readLiveStatus = args.readLiveStatus;

    const publishIfChanged = (state: LiveGameState) =>
      Effect.gen(function* () {
        const key = liveGameStateKey(state);
        const lastKey = yield* Ref.get(lastPublishedKey);
        const shouldPublish = key !== lastKey;
        if (!shouldPublish) return;
        yield* args.eventHub
          .publish({
            type: "live-game",
            state,
            observedAt: state.updatedAt ?? now().toISOString(),
          })
          .pipe(
            Effect.tap(() => Ref.set(lastPublishedKey, key)),
            Effect.catchAll((error) =>
              Effect.sync(() => {
                console.error("[studio-server] failed to publish live-game event", error);
              })
            )
          );
      });

    const tick = tickGate.withPermits(1)(
      Effect.gen(function* () {
        const baseState = yield* readLiveStatus.pipe(
          Effect.map((body) =>
            buildLiveGameState({
              body,
              observedAtFallback: now().toISOString(),
              failureCount: 0,
            })
          ),
          Effect.catchAll((error) =>
            Effect.gen(function* () {
              const nextFailureCount = yield* Ref.updateAndGet(failureCount, (count) => count + 1);
              return buildLiveGameErrorState({
                error,
                observedAt: now().toISOString(),
                failureCount: nextFailureCount,
              });
            })
          )
        );
        const nextFailureCount =
          baseState.status === "ok"
            ? 0
            : baseState.failureCount === undefined || baseState.failureCount <= 0
              ? yield* Ref.updateAndGet(failureCount, (count) => count + 1)
              : baseState.failureCount;
        if (baseState.status === "ok") yield* Ref.set(failureCount, 0);
        yield* publishIfChanged({
          ...baseState,
          failureCount: nextFailureCount,
        });
      })
    );

    const loop = Effect.gen(function* () {
      if (initialDelayMs > 0) yield* Effect.sleep(initialDelayMs);
      while (true) {
        yield* tick;
        yield* Effect.sleep(intervalMs);
      }
    });

    yield* Effect.forkScoped(loop);

    return { tick };
  });
}
