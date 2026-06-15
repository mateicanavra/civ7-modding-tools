import { Layer, ManagedRuntime } from "effect";

import type { StudioServerContext } from "./context.js";
import { makeStudioOperationRuntimeLayer, StudioOperationRuntime } from "./operationRuntime/index.js";
import { Civ7TunerClient } from "./services/Civ7TunerClient.js";
import { Civ7TunerSession, Civ7TunerSessionLive } from "./services/Civ7TunerSession.js";
import { StudioConfig } from "./services/StudioConfig.js";
import { StudioEventHub } from "./services/StudioEventHub.js";

/**
 * Builds the `ManagedRuntime` backing the effect-orpc router for one host.
 *
 * `Civ7TunerSession` is the scoped owner of the daemon FireTuner connection.
 * D5 keeps ownership visible: this runtime names one top-level
 * `Civ7TunerSessionLive` layer and provides that same layer reference into the
 * operation runtime graph, while `Civ7WorkflowControlLive` depends on
 * `Civ7TunerSession` instead of constructing or self-providing a session.
 * Live shared-socket proof remains a D12 game-door closure item.
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
  | StudioOperationRuntime;

export type StudioRuntime = ManagedRuntime.ManagedRuntime<unknown, never>;

export function makeStudioRuntime(context: StudioServerContext): StudioRuntime {
  const civ7TunerSessionLayer = Civ7TunerSessionLive;
  const operationRuntimeLayer = makeStudioOperationRuntimeLayer({
    ports: context.operationRuntime,
    eventHub: context.eventHub,
  }).pipe(Layer.provide(civ7TunerSessionLayer));
  const layer = Layer.mergeAll(
    civ7TunerSessionLayer,
    Civ7TunerClient.Default,
    Layer.succeed(StudioConfig, context),
    Layer.succeed(StudioEventHub, context.eventHub),
    operationRuntimeLayer
  );
  return ManagedRuntime.make(layer) as unknown as StudioRuntime;
}
