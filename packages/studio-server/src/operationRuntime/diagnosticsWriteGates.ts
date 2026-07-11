import { Effect } from "effect";

type DiagnosticsWriteGateEntry = {
  readonly gate: Effect.Semaphore;
  users: number;
};

export type RequestDiagnosticsWriteGateRegistry = Readonly<{
  withGate<A, E, R>(requestId: string, effect: Effect.Effect<A, E, R>): Effect.Effect<A, E, R>;
  readonly size: Effect.Effect<number>;
}>;

/**
 * Serializes diagnostics writes per request while bounding gate lifetime. A
 * registry lease is counted before a writer queues on the request semaphore, so
 * queued and active writers share one gate and the entry cannot disappear until
 * the last writer releases its lease.
 */
export function makeRequestDiagnosticsWriteGateRegistry(): Effect.Effect<RequestDiagnosticsWriteGateRegistry> {
  return Effect.gen(function* () {
    const entries = new Map<string, DiagnosticsWriteGateEntry>();
    const registryLock = yield* Effect.makeSemaphore(1);

    const acquire = (requestId: string): Effect.Effect<DiagnosticsWriteGateEntry> =>
      registryLock.withPermits(1)(
        Effect.gen(function* () {
          let entry = entries.get(requestId);
          if (entry === undefined) {
            entry = { gate: yield* Effect.makeSemaphore(1), users: 0 };
            entries.set(requestId, entry);
          }
          entry.users += 1;
          return entry;
        })
      );

    const release = (requestId: string, entry: DiagnosticsWriteGateEntry): Effect.Effect<void> =>
      registryLock.withPermits(1)(
        Effect.sync(() => {
          entry.users -= 1;
          if (entry.users === 0 && entries.get(requestId) === entry) {
            entries.delete(requestId);
          }
        })
      );

    return {
      withGate: (requestId, effect) =>
        Effect.acquireUseRelease(
          acquire(requestId),
          (entry) => entry.gate.withPermits(1)(effect),
          (entry) => release(requestId, entry)
        ),
      size: registryLock.withPermits(1)(Effect.sync(() => entries.size)),
    };
  });
}
