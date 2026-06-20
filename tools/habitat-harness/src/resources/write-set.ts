import { Context, Effect, Layer } from "effect";

export interface HabitatWriteSetService {
  readonly assertWritable: (path: string) => Effect.Effect<string>;
}

export class HabitatWriteSet extends Context.Tag("@internal/habitat-harness/HabitatWriteSet")<
  HabitatWriteSet,
  HabitatWriteSetService
>() {}

export const HabitatWriteSetLive = Layer.succeed(HabitatWriteSet, {
  assertWritable: (path) => Effect.succeed(path),
});
