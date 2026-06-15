import { Layer, ManagedRuntime } from "effect";

import type { StudioServerContext } from "./context.js";
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
 * `StudioConfig` carries the host-supplied {@link StudioServerContext}
 * (process singletons + catalog loader + stateful engine fns), so the runtime
 * is constructed per host with that context injected as a `Layer`.
 *
 * Lifecycle obligation: the host MUST call `runtime.dispose()` on shutdown —
 * that closes the runtime scope and runs the session's release finalizer
 * (graceful FIN to the game). `createStudioRpcHandler` exposes this as
 * `handle.dispose()`.
 */
export type StudioRuntime = ManagedRuntime.ManagedRuntime<
  Civ7TunerClient | Civ7TunerSession | StudioConfig | StudioEventHub,
  never
>;

export function makeStudioRuntime(context: StudioServerContext): StudioRuntime {
  const layer = Layer.mergeAll(
    Civ7TunerSessionLive,
    Civ7TunerClient.Default,
    Layer.succeed(StudioConfig, context),
    Layer.succeed(StudioEventHub, context.eventHub)
  );
  return ManagedRuntime.make(layer);
}
