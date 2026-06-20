import { Context, Effect, Layer } from "effect";

export interface WorkspaceLockService {
  readonly withLock: <A, E, R>(
    label: string,
    effect: Effect.Effect<A, E, R>
  ) => Effect.Effect<A, E, R>;
}

export class WorkspaceLock extends Context.Tag("@internal/habitat-harness/WorkspaceLock")<
  WorkspaceLock,
  WorkspaceLockService
>() {}

export const WorkspaceLockLive = Layer.succeed(WorkspaceLock, {
  withLock: (_label, effect) => effect,
});
