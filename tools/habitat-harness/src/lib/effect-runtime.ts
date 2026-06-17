import { NodeContext } from "@effect/platform-node";
import { Effect } from "effect";

export type HabitatEffectRequirements = NodeContext.NodeContext;

/**
 * Single Effect runtime edge for Habitat adapter code.
 */
export function runHabitatEffect<A, E>(
  program: Effect.Effect<A, E, HabitatEffectRequirements>
): Promise<A> {
  return Effect.runPromise(Effect.provide(program, NodeContext.layer));
}
