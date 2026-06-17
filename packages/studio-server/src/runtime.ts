import { Layer, ManagedRuntime } from "effect";

import type { StudioServerContext } from "./context.js";
import {
  type LiveGameWatcherOptions,
  makeStudioLiveGameWatcherLayer,
  StudioLiveGameWatcher,
} from "./liveGame/watcher.js";
import {
  makeStudioOperationRuntimeLayer,
  StudioOperationRuntime,
} from "./operationRuntime/index.js";
import { Civ7TunerClient } from "./services/Civ7TunerClient.js";
import { Civ7TunerSession, Civ7TunerSessionLive } from "./services/Civ7TunerSession.js";
import { StudioConfig } from "./services/StudioConfig.js";
import { StudioEventHub, StudioEventHubLive } from "./services/StudioEventHub.js";

/**
 * Builds the `ManagedRuntime` backing the effect-orpc router for one host.
 *
 * `Civ7TunerSession` is the scoped owner of the daemon FireTuner connection.
 * D5/D10 keep ownership visible: this runtime names one top-level
 * `Civ7TunerSessionLive` layer, one top-level `Civ7TunerClient.Default`
 * layer, and one scoped `StudioEventHubLive` layer. The operation runtime and
 * live-game watcher consume that package-owned hub as an Effect service;
 * Promise/AsyncIterator adaptation stays at the oRPC edge. `Civ7WorkflowControlLive`
 * and `StudioLiveGameWatcher` depend on package services instead of constructing
 * or self-providing sessions. Live shared-socket proof remains a D12 game-door
 * closure item.
 * The operation runtime is a scoped package service owning daemon identity,
 * operation admission, registries, TTL/tombstones, background workers, events,
 * and disposal. `StudioConfig` carries only the remaining host seams.
 *
 * Lifecycle obligation: the host MUST call `runtime.dispose()` on shutdown —
 * that closes the runtime scope and runs the session's release finalizer
 * (graceful FIN to the game). `createStudioRpcHandler` exposes this as
 * `handle.dispose()`.
 */
type StudioRuntimeEnv =
  | Civ7TunerClient
  | Civ7TunerSession
  | StudioConfig
  | StudioEventHub
  | StudioLiveGameWatcher
  | StudioOperationRuntime;

export type StudioRuntime = ManagedRuntime.ManagedRuntime<unknown, never>;

export interface StudioRuntimeOptions {
  liveGameWatch?: LiveGameWatcherOptions;
}

export function makeStudioRuntime(
  context: StudioServerContext,
  options: StudioRuntimeOptions = {}
): StudioRuntime {
  const civ7TunerSessionLayer = Civ7TunerSessionLive;
  const civ7TunerClientLayer = Civ7TunerClient.Default;
  const eventHubLayer = StudioEventHubLive;
  const operationRuntimeLayer = makeStudioOperationRuntimeLayer({
    ports: context.operationRuntime,
  });
  const liveGameWatcherLayer =
    options.liveGameWatch === undefined
      ? Layer.empty
      : Layer.provideMerge(
          Layer.effectDiscard(StudioLiveGameWatcher),
          makeStudioLiveGameWatcherLayer({
            options: options.liveGameWatch,
          })
        ).pipe(Layer.provide(civ7TunerClientLayer));
  const eventHubOwnedLayer = Layer.provideMerge(
    Layer.mergeAll(liveGameWatcherLayer, operationRuntimeLayer),
    eventHubLayer
  );
  const layer = Layer.provideMerge(
    Layer.mergeAll(civ7TunerClientLayer, Layer.succeed(StudioConfig, context), eventHubOwnedLayer),
    civ7TunerSessionLayer
  );
  return ManagedRuntime.make(layer) as unknown as StudioRuntime;
}
