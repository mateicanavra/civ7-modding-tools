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
 * `Civ7TunerSession` is the scoped owner of the ONE shared FireTuner
 * connection; `Civ7TunerClient` consumes it, and layer memoization guarantees
 * both graphs see the same instance (the SAME `Civ7TunerSessionLive`
 * reference appears in the merge and in the client's dependencies).
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
  const layer = Layer.mergeAll(
    Civ7TunerSessionLive,
    Civ7TunerClient.Default,
    Layer.succeed(StudioConfig, context),
    Layer.succeed(StudioEventHub, context.eventHub),
    makeStudioOperationRuntimeLayer({
      ports: context.operationRuntime,
      eventHub: context.eventHub,
    })
  );
  return ManagedRuntime.make(layer) as unknown as StudioRuntime;
}
