import { type Civ7Tuner, Civ7TunerFailure, type Civ7TunerFailureOperation } from "@civ7/tuner";
import { Effect } from "effect";
import { type LocalSocketCiv7TunerOptions, resolveLocalSocketCiv7TunerConfig } from "./config.js";
import { LocalSocketCiv7TunerSession } from "./session.js";

export type { LocalSocketCiv7TunerOptions } from "./config.js";

/** Acquires one ready local-socket Tuner capability for the surrounding Effect scope. */
export function acquireLocalSocketCiv7Tuner(options: LocalSocketCiv7TunerOptions = {}) {
  const acquire = Effect.tryPromise({
    try: () => acquireSession(options),
    catch: (cause) => asFailure(cause, "acquire"),
  });

  return Effect.acquireRelease(acquire, (session) => Effect.promise(() => session.close())).pipe(
    Effect.map(
      (session): Civ7Tuner => ({
        inspect: () => session.inspect(),
        queryStates: (request) =>
          Effect.tryPromise({
            try: () => session.queryStates(request),
            catch: (cause) => asFailure(cause, "query-states"),
          }),
        execute: (request) =>
          Effect.tryPromise({
            try: () => session.execute(request),
            catch: (cause) => asFailure(cause, "execute"),
          }),
        reset: () =>
          Effect.tryPromise({
            try: () => session.reset(),
            catch: (cause) => asFailure(cause, "reset"),
          }),
      })
    )
  );
}

function asFailure(cause: unknown, operation: Civ7TunerFailureOperation): Civ7TunerFailure {
  if (isCiv7TunerFailure(cause)) return cause;
  return new Civ7TunerFailure({
    operation,
    reason: "connection-failed",
    message: failureMessage(cause),
    cause,
  });
}

async function acquireSession(
  options: LocalSocketCiv7TunerOptions
): Promise<LocalSocketCiv7TunerSession> {
  const session = new LocalSocketCiv7TunerSession(resolveLocalSocketCiv7TunerConfig(options));
  await session.connect();
  return session;
}

function isCiv7TunerFailure(cause: unknown): cause is Civ7TunerFailure {
  return (
    typeof cause === "object" &&
    cause !== null &&
    "_tag" in cause &&
    cause._tag === "Civ7TunerFailure"
  );
}

function failureMessage(cause: unknown): string {
  if (cause instanceof Error) return cause.message;
  return String(cause);
}
