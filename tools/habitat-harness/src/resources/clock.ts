import { Context, Effect, Layer } from "effect";

export interface HabitatClockService {
  readonly currentTimeMillis: Effect.Effect<number>;
  readonly currentDate: Effect.Effect<Date>;
}

export class HabitatClock extends Context.Tag("@internal/habitat-harness/HabitatClock")<
  HabitatClock,
  HabitatClockService
>() {}

export const HabitatClockLive = Layer.succeed(HabitatClock, {
  currentTimeMillis: Effect.sync(() => Date.now()),
  currentDate: Effect.sync(() => new Date()),
});

export function makeFakeHabitatClockLayer(startMs = 0) {
  return Layer.succeed(HabitatClock, {
    currentTimeMillis: Effect.succeed(startMs),
    currentDate: Effect.succeed(new Date(startMs)),
  });
}
