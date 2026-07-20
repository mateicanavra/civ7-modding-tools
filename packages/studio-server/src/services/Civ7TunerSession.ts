import { type Civ7DirectControlOptions, Civ7DirectControlSession } from "@civ7/direct-control";
import { Clock, Context, Data, Effect, Layer, Match, Option, Ref } from "effect";

/**
 * `Civ7TunerSession` — the ONE Effect-scoped owner of the shared FireTuner
 * connection (mapgen-studio-tuner-session workstream).
 *
 * Why: connect-per-request churn leaks descriptors inside the game process
 * until the tuner wedges (Bun-server workstream Phase 4 addendum: 187 leaked
 * fds, all reads timing out). The session protocol multiplexes concurrent
 * requests over one socket (listenerIds) and `connect()` is reuse-idempotent
 * (a dropped socket reconnects on the next request), so one instance serves
 * every polling consumer for the runtime's whole life:
 *
 * - acquisition/release: `Layer.scoped` owns the session and its shutdown
 *   finalizer. The session is created (not yet connected) when the layer
 *   builds; shutdown first closes admission, drains the same lease gate, then
 *   sends a graceful FIN when the host disposes the `ManagedRuntime`.
 * - `lease`: the one scoped admission lease for every read or lifecycle.
 *   The gate owns a consecutive admitted-lease timeout streak, derived from
 *   the session's monotonic total timeout count. A successful state query
 *   cannot erase a later command timeout from the same lease. Past the
 *   threshold, reads fail fast with `Civ7TunerBackoffError` for one cooldown,
 *   then half-open (the next read flows; success resets the streak, a timeout
 *   re-opens).
 * - `session`: exposed for host injection into the admitted control-oRPC
 *   lifecycle's `endpointDefaults.session` field. Admission stays HERE.
 *
 * Deliberately NOT a pool/RcRef: the instance self-heals and never needs
 * replacement (proportional complexity).
 */

export interface Civ7TunerSessionGateOptions {
  /** Consecutive admitted leases with response timeouts that open the gate. */
  readonly threshold?: number;
  /** How long reads fail fast before the gate half-opens. */
  readonly cooldownMs?: number;
}

export type Civ7TunerSessionOptions = Civ7DirectControlOptions & {
  readonly gate?: Civ7TunerSessionGateOptions;
};

export const CIV7_TUNER_GATE_THRESHOLD = 4;
export const CIV7_TUNER_GATE_COOLDOWN_MS = 15_000;

type TunerGateLeaseEvidence = Readonly<{
  halfOpen: boolean;
  totalResponseTimeouts: number;
}>;

type TunerGateState = Readonly<{
  consecutiveResponseTimeouts: number;
  openUntil: number;
}>;

const tunerGateStateAfterLease = (
  state: TunerGateState,
  evidence: TunerGateLeaseEvidence,
  totalResponseTimeouts: number,
  threshold: number,
  retryAtMs: number
): TunerGateState => {
  const observedTimeout = totalResponseTimeouts > evidence.totalResponseTimeouts;
  const consecutiveResponseTimeouts = Match.value(observedTimeout).pipe(
    Match.when(true, () => state.consecutiveResponseTimeouts + 1),
    Match.when(false, () => 0),
    Match.exhaustive
  );
  const openUntil = Match.value({
    halfOpen: evidence.halfOpen,
    observedTimeout,
    thresholdReached: consecutiveResponseTimeouts >= threshold,
  }).pipe(
    Match.when({ observedTimeout: true, halfOpen: true }, () => retryAtMs),
    Match.when({ observedTimeout: true, thresholdReached: true }, () => retryAtMs),
    Match.when({ halfOpen: true }, () => 0),
    Match.orElse(() => state.openUntil)
  );
  return { consecutiveResponseTimeouts, openUntil };
};

/** Fail-fast error while the backoff gate is open (tuner not answering). */
export class Civ7TunerBackoffError extends Data.TaggedError("Civ7TunerBackoffError")<{
  readonly consecutiveResponseTimeouts: number;
  readonly retryAtMs: number;
}> {
  override get message(): string {
    return (
      `Civ7 tuner is not answering (${this.consecutiveResponseTimeouts} consecutive timeouts); ` +
      `backing off until ${new Date(this.retryAtMs).toISOString()}`
    );
  }
}

/** Admission refused because the owning Studio runtime is closing. */
export class Civ7TunerClosingError extends Data.TaggedError("Civ7TunerClosingError")<{}> {
  override get message(): string {
    return "Civ7 tuner admission is closed because the Studio runtime is shutting down";
  }
}

export type Civ7TunerAdmissionError = Civ7TunerBackoffError | Civ7TunerClosingError;

export interface Civ7TunerSessionHealth {
  /** Consecutive admitted leases that observed at least one response timeout. */
  readonly consecutiveResponseTimeouts: number;
  /** ISO timestamp while the gate is open, null otherwise. */
  readonly gateOpenUntil: string | null;
  /** Threshold crossed: the game process may be alive but the tuner silent. */
  readonly wedgeSuspected: boolean;
}

function makeCiv7TunerSessionService(options: Civ7TunerSessionOptions = {}) {
  const threshold = options.gate?.threshold ?? CIV7_TUNER_GATE_THRESHOLD;
  const cooldownMs = options.gate?.cooldownMs ?? CIV7_TUNER_GATE_COOLDOWN_MS;
  const { gate: _gate, ...directControlOptions } = options;
  const acquireSession = Effect.sync(() => new Civ7DirectControlSession(directControlOptions));
  return Effect.gen(function* () {
    const session = yield* acquireSession;
    const gate = yield* Ref.make<TunerGateState>({
      consecutiveResponseTimeouts: 0,
      openUntil: 0,
    });
    const closing = yield* Ref.make(false);
    const useGate = yield* Effect.makeSemaphore(1);
    const closeSession = useGate.withPermits(1)(Effect.promise(() => session.close()));
    const shutdown = Ref.set(closing, true).pipe(Effect.andThen(closeSession));
    yield* Effect.addFinalizer(() => shutdown);
    const releasePermit = Effect.addFinalizer(() => useGate.release(1));
    const permit = Effect.uninterruptibleMask((restore) =>
      restore(useGate.take(1)).pipe(Effect.andThen(releasePermit))
    );
    const admission = Effect.all({
      closing: Ref.get(closing),
      gate: Ref.get(gate),
      now: Clock.currentTimeMillis,
    });
    const updateGateAfterLease = (evidence: TunerGateLeaseEvidence) =>
      Clock.currentTimeMillis.pipe(
        Effect.flatMap((at) =>
          Ref.update(gate, (state) =>
            tunerGateStateAfterLease(
              state,
              evidence,
              session.stats.totalResponseTimeouts,
              threshold,
              at + cooldownMs
            )
          )
        )
      );
    const lease = permit.pipe(
      Effect.andThen(admission),
      Effect.filterOrFail(
        ({ closing: isClosing }) => !isClosing,
        () => new Civ7TunerClosingError()
      ),
      Effect.filterOrFail(
        ({ gate: state, now }) => now >= state.openUntil,
        ({ gate: state }) =>
          new Civ7TunerBackoffError({
            consecutiveResponseTimeouts: state.consecutiveResponseTimeouts,
            retryAtMs: state.openUntil,
          })
      ),
      Effect.map(({ gate: state }) => ({
        halfOpen: state.openUntil > 0,
        totalResponseTimeouts: session.stats.totalResponseTimeouts,
      })),
      Effect.tap((evidence) => Effect.addFinalizer(() => updateGateAfterLease(evidence))),
      Effect.map(() => session)
    );
    const use = <A>(run: (o: { readonly session: Civ7DirectControlSession }) => Promise<A>) => {
      const invoke = Effect.tryPromise({
        try: () => run({ session }),
        catch: (err) => err,
      }).pipe(Effect.uninterruptible);
      return lease.pipe(Effect.andThen(invoke), Effect.scoped);
    };
    function activeGateTimestamp(openUntil: number, now: number): string | null {
      return Option.liftPredicate(openUntil, (at) => at > now).pipe(
        Option.map((at) => new Date(at).toISOString()),
        Option.getOrNull
      );
    }
    function sessionHealth(state: TunerGateState, now: number): Civ7TunerSessionHealth {
      return {
        consecutiveResponseTimeouts: state.consecutiveResponseTimeouts,
        gateOpenUntil: activeGateTimestamp(state.openUntil, now),
        wedgeSuspected: state.consecutiveResponseTimeouts >= threshold,
      };
    }
    const health = Effect.all({
      gate: Ref.get(gate),
      now: Clock.currentTimeMillis,
    }).pipe(Effect.map(({ gate: state, now }) => sessionHealth(state, now)));
    return { session, lease, use, health };
  });
}

export interface Civ7TunerSessionApi
  extends Effect.Effect.Success<ReturnType<typeof makeCiv7TunerSessionService>> {}

export class Civ7TunerSession extends Context.Tag("@civ7/studio-server/Civ7TunerSession")<
  Civ7TunerSession,
  Civ7TunerSessionApi
>() {}

/** Parameterized layer (tests inject a fake tuner endpoint + short gate timings). */
export function makeCiv7TunerSessionLayer(options: Civ7TunerSessionOptions = {}) {
  return Layer.scoped(Civ7TunerSession, makeCiv7TunerSessionService(options));
}

/** Production layer: env-resolved endpoint, default gate policy. */
export const Civ7TunerSessionLive = makeCiv7TunerSessionLayer();
