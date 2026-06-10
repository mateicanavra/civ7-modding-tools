import { Layer, ManagedRuntime } from "effect";

import type { StudioServerContext } from "./context.js";
import { Civ7TunerClient } from "./services/Civ7TunerClient.js";
import { StudioConfig } from "./services/StudioConfig.js";

/**
 * Builds the `ManagedRuntime` backing the effect-orpc router for one host.
 *
 * `Civ7TunerClient` is self-contained (wraps `@civ7/direct-control`). `StudioConfig`
 * carries the host-supplied {@link StudioServerContext} (process singletons +
 * catalog loader + stateful engine fns), so the runtime is constructed per host
 * with that context injected as a `Layer`.
 */
export type StudioRuntime = ManagedRuntime.ManagedRuntime<
  Civ7TunerClient | StudioConfig,
  never
>;

export function makeStudioRuntime(context: StudioServerContext): StudioRuntime {
  const layer = Layer.mergeAll(
    Civ7TunerClient.Default,
    Layer.succeed(StudioConfig, context),
  );
  return ManagedRuntime.make(layer);
}
