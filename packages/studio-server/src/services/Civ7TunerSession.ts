import {
  Civ7DirectControlSession,
  type Civ7DirectControlOptions,
} from "@civ7/direct-control";
import { Clock, Context, Data, Effect, Layer, Ref, type Scope } from "effect";
import type { UnknownException } from "effect/Cause";

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
 * - acquisition/release: `Layer.scoped` + `Effect.acquireRelease` — the
 *   session is created (not yet connected) when the layer builds and closed
 *   with a graceful FIN when the host disposes the `ManagedRuntime`.
 * - `use(run)`: gated execution. The gate keys on the session's OWN
 *   consecutive-response-timeout counter (`session.stats` — it observes all
 *   traffic on the shared socket, including the control-oRPC mount's), so a
 *   busy/wedged tuner stops being hammered: past the threshold, reads fail
 *   fast with `Civ7TunerBackoffError` for one cooldown, then half-open (the
 *   next read flows; success resets the counter, a timeout re-opens).
 * - `session`: exposed for host injection into non-Effect consumers (the
 *   control-oRPC `endpointDefaults.session` field). Lifecycle stays HERE.
 *
 * Deliberately NOT a pool/RcRef: the instance self-heals and never needs
 * replacement (proportional complexity).
 */

export interface Civ7TunerSessionGateOptions {
  /** Consecutive response-timeouts that open the gate. */
  readonly threshold?: number;
  /** How long reads fail fast before the gate half-opens. */
  readonly cooldownMs?: number;
}

export type Civ7TunerSessionOptions = Civ7DirectControlOptions & {
  readonly gate?: Civ7TunerSessionGateOptions;
};

export const CIV7_TUNER_GATE_THRESHOLD = 4;
export const CIV7_TUNER_GATE_COOLDOWN_MS = 15_000;

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

export interface Civ7TunerSessionHealth {
  readonly consecutiveResponseTimeouts: number;
  /** ISO timestamp while the gate is open, null otherwise. */
  readonly gateOpenUntil: string | null;
  /** Threshold crossed: the game process may be alive but the tuner silent. */
  readonly wedgeSuspected: boolean;
}

export interface Civ7TunerSessionApi {
  /** The shared session, for host injection into `Civ7DirectControlOptions.session`. */
  readonly session: Civ7DirectControlSession;
  /** Run a direct-control promise against the shared session, behind the gate. */
  readonly use: <A>(
    run: (options: { readonly session: Civ7DirectControlSession }) => Promise<A>,
  ) => Effect.Effect<A, Civ7TunerBackoffError | UnknownException>;
  readonly health: Effect.Effect<Civ7TunerSessionHealth>;
}

export class Civ7TunerSession extends Context.Tag("@civ7/studio-server/Civ7TunerSession")<
  Civ7TunerSession,
  Civ7TunerSessionApi
>() {}

const make = (
  options: Civ7TunerSessionOptions,
): Effect.Effect<Civ7TunerSessionApi, never, Scope.Scope> =>
  Effect.gen(function* () {
    const threshold = options.gate?.threshold ?? CIV7_TUNER_GATE_THRESHOLD;
    const cooldownMs = options.gate?.cooldownMs ?? CIV7_TUNER_GATE_COOLDOWN_MS;
    const { gate: _gate, ...directControlOptions } = options;

    const session = yield* Effect.acquireRelease(
      Effect.sync(() => new Civ7DirectControlSession(directControlOptions)),
      (s) => Effect.promise(() => s.close()),
    );
    const gateOpenUntil = yield* Ref.make(0);

    const use = <A>(
      run: (o: { readonly session: Civ7DirectControlSession }) => Promise<A>,
    ) =>
      Effect.gen(function* () {
        const now = yield* Clock.currentTimeMillis;
        const openUntil = yield* Ref.get(gateOpenUntil);
        if (now < openUntil) {
          return yield* new Civ7TunerBackoffError({
            consecutiveResponseTimeouts: session.stats.consecutiveResponseTimeouts,
            retryAtMs: openUntil,
          });
        }
        return yield* Effect.tryPromise(() => run({ session })).pipe(
          Effect.tapError(() =>
            // The session's counter only moves on response-timeouts (the
            // wedge/busy signature) — connection-refused (game not running)
            // stays un-gated so readiness keeps reporting fast.
            session.stats.consecutiveResponseTimeouts >= threshold
              ? Effect.flatMap(Clock.currentTimeMillis, (at) =>
                  Ref.set(gateOpenUntil, at + cooldownMs),
                )
              : Effect.void,
          ),
        );
      });

    const health = Effect.gen(function* () {
      const openUntil = yield* Ref.get(gateOpenUntil);
      const now = yield* Clock.currentTimeMillis;
      const stats = session.stats;
      return {
        consecutiveResponseTimeouts: stats.consecutiveResponseTimeouts,
        gateOpenUntil: openUntil > now ? new Date(openUntil).toISOString() : null,
        wedgeSuspected: stats.consecutiveResponseTimeouts >= threshold,
      } satisfies Civ7TunerSessionHealth;
    });

    return { session, use, health };
  });

/** Parameterized layer (tests inject a fake tuner endpoint + short gate timings). */
export function makeCiv7TunerSessionLayer(
  options: Civ7TunerSessionOptions = {},
): Layer.Layer<Civ7TunerSession> {
  return Layer.scoped(Civ7TunerSession, make(options));
}

/** Production layer: env-resolved endpoint, default gate policy. */
export const Civ7TunerSessionLive: Layer.Layer<Civ7TunerSession> =
  makeCiv7TunerSessionLayer();
