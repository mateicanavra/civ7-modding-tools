import { Effect } from "effect";
import { HabitatSubstrateLive } from "./layers.js";

/**
 * Host-edge bridge for Habitat programs that need live repository resources.
 *
 * Domain code should return `Effect` programs and receive capabilities through
 * services. CLI commands and tests use this bridge to
 * run those programs against the assembled live layer.
 */
export function runHabitatEffect<A, E, R>(program: Effect.Effect<A, E, R>): Promise<A> {
  const runnable = Effect.provide(program, HabitatSubstrateLive as never) as Effect.Effect<
    A,
    E,
    never
  >;
  return Effect.runPromise(runnable);
}
