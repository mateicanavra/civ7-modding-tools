import {
  GritProvider,
  GritProviderLive,
} from "@internal/habitat-harness/adapters/grit/provider/index";
import { HabitatSubstrateLive } from "@internal/habitat-harness/substrate/runtime/index";
import { Effect, Layer } from "effect";

export function runGritAdapterEffect<A, E, R>(
  program: Effect.Effect<A, E, R>,
  providerLayer?: Layer.Layer<GritProvider>
): Promise<A> {
  const layer = providerLayer
    ? Layer.mergeAll(HabitatSubstrateLive, providerLayer)
    : GritAdapterLive;
  const runnable = Effect.provide(program, layer as never) as Effect.Effect<A, E, never>;
  return Effect.runPromise(runnable);
}

const GritAdapterLive = Layer.mergeAll(HabitatSubstrateLive, GritProviderLive);
