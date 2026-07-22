import { type ChildProcessByStdio, spawn } from "node:child_process";
import type { Readable } from "node:stream";
import { NodeStream } from "@effect/platform-node";
import { Data, Deferred, Duration, Effect, Match } from "effect";

const commandTerminationGraceMs = 250;
const commandKillSettleMs = 1_000;
const commandKillPollMs = 20;
const failedProcessPhase: OwnedProcessPhase = "failed";
const exitedProcessPhase: OwnedProcessPhase = "exited";

type OwnedChildProcess = ChildProcessByStdio<null, Readable, Readable>;
type OwnedProcessPhase = "starting" | "running" | "terminating" | "exited" | "failed";

interface OwnedProcessState {
  phase: OwnedProcessPhase;
}

interface OwnedCommandProcessRequest {
  readonly executable: string;
  readonly argv: readonly string[];
  readonly cwd: string;
  readonly env: Readonly<Record<string, string>>;
}

interface OwnedCommandExit {
  readonly code: number | null;
  readonly signal: NodeJS.Signals | null;
}

type OwnedProcessGroupSignalOutcome =
  | { readonly kind: "delivered"; readonly target: "group" | "child" }
  | { readonly kind: "not-found" }
  | {
      readonly kind: "failed";
      readonly groupCause: string;
      readonly fallbackCause: string;
    };

type OwnedProcessGroupAttemptOutcome =
  | { readonly kind: "delivered"; readonly target: "group" }
  | { readonly kind: "not-found" }
  | { readonly kind: "failed"; readonly cause: string };

type OwnedProcessGroupExitOutcome =
  | { readonly kind: "exited" }
  | { readonly kind: "deadline-exceeded" };

class OwnedCommandProcessReleaseIncomplete extends Data.TaggedError(
  "OwnedCommandProcessReleaseIncomplete"
)<{
  readonly message: string;
  readonly pid: number;
  readonly term: OwnedProcessGroupSignalOutcome;
  readonly kill: OwnedProcessGroupSignalOutcome;
}> {}

/**
 * Acquires one Darwin/Linux detached command group and registers its bounded release before
 * startup can be interrupted. Habitat owns this resource instead of the pinned platform executor
 * because that executor's release waits indefinitely after SIGTERM and can signal an already
 * completed group. Unsupported platforms are refused before process creation.
 */
export const acquireOwnedCommandProcess = Effect.fn("habitat.command.process.acquire")(function* (
  request: OwnedCommandProcessRequest
) {
  const started = yield* Deferred.make<void, Error>();
  const exited = yield* Deferred.make<OwnedCommandExit, Error>();
  const acquire = Effect.try({
    try: () => spawnOwnedCommandProcess(request, started, exited),
    catch: processError,
  });
  return yield* acquire.pipe(Effect.acquireRelease(terminateOwnedCommandProcess));
});

function spawnOwnedCommandProcess(
  request: OwnedCommandProcessRequest,
  started: Deferred.Deferred<void, Error>,
  exited: Deferred.Deferred<OwnedCommandExit, Error>
) {
  assertSupportedCommandProcessPlatform();
  const child = spawn(request.executable, request.argv, {
    cwd: request.cwd,
    detached: true,
    env: request.env,
    stdio: ["ignore", "pipe", "pipe"],
  });
  const state: OwnedProcessState = { phase: "starting" };

  child.once("spawn", () => {
    state.phase = "running";
    Deferred.unsafeDone(started, Effect.void);
  });
  child.once("error", (cause) => {
    const error = processError(cause);
    state.phase = Match.value(state.phase).pipe(
      Match.when("starting", () => failedProcessPhase),
      Match.orElse((phase) => phase)
    );
    Deferred.unsafeDone(started, Effect.fail(error));
    Deferred.unsafeDone(exited, Effect.fail(error));
  });
  child.once("exit", (code, signal) => {
    state.phase = Match.value(state.phase).pipe(
      Match.when("starting", () => exitedProcessPhase),
      Match.when("running", () => exitedProcessPhase),
      Match.orElse((phase) => phase)
    );
    Deferred.unsafeDone(started, Effect.void);
    Deferred.unsafeDone(exited, Effect.succeed({ code, signal }));
  });

  return {
    child,
    state,
    awaitStarted: Deferred.await(started),
    awaitExit: Deferred.await(exited),
    stdout: readableOutput(child.stdout, "stdout"),
    stderr: readableOutput(child.stderr, "stderr"),
  };
}

type SpawnedOwnedCommandProcess = ReturnType<typeof spawnOwnedCommandProcess>;

function readableOutput(readable: Readable, channel: "stdout" | "stderr") {
  return NodeStream.fromReadable(
    () => readable,
    (cause) => new Error(`Command ${channel} failed: ${processError(cause).message}`)
  );
}

const terminateOwnedCommandProcess = Effect.fn("habitat.command.process.release")(function* (
  owned: SpawnedOwnedCommandProcess
) {
  return yield* terminateOwnedCommandProcessGroup(owned);
});

const terminateOwnedCommandProcessGroup = Effect.fn("habitat.command.process.terminate")(function* (
  owned: SpawnedOwnedCommandProcess
) {
  return yield* Match.value(owned.child.pid).pipe(
    Match.when(Match.undefined, () => terminateOwnedCommandProcessWithoutGroup(owned)),
    Match.orElse((pid) => terminateOwnedCommandProcessGroupIfAlive(owned, pid))
  );
});

function terminateOwnedCommandProcessWithoutGroup(owned: SpawnedOwnedCommandProcess) {
  return Match.value(owned.state.phase).pipe(
    Match.when("failed", () => Effect.void),
    Match.when("exited", () => Effect.void),
    Match.orElse(() =>
      Effect.sync(() => {
        owned.child.kill("SIGKILL");
      })
    )
  );
}

const terminateOwnedCommandProcessGroupIfAlive = Effect.fn(
  "habitat.command.process.terminateIfAlive"
)(function* (owned: SpawnedOwnedCommandProcess, pid: number) {
  const groupIsAlive = yield* ownedProcessGroupIsAlive(pid);
  return yield* Effect.when(terminateKnownCommandProcessGroup(owned, pid), () => groupIsAlive);
});

const terminateKnownCommandProcessGroup = Effect.fn("habitat.command.process.terminateKnown")(
  function* (owned: SpawnedOwnedCommandProcess, pid: number) {
    owned.state.phase = "terminating";
    const term = yield* signalOwnedProcessGroup(owned.child, pid, "SIGTERM");
    return yield* Match.value(term).pipe(
      Match.when({ kind: "not-found" }, () => Effect.void),
      Match.orElse(() => terminateOwnedCommandProcessGroupAfterTerm(owned, pid, term))
    );
  }
);

const terminateOwnedCommandProcessGroupAfterTerm = Effect.fn(
  "habitat.command.process.terminateAfterTerm"
)(function* (owned: SpawnedOwnedCommandProcess, pid: number, term: OwnedProcessGroupSignalOutcome) {
  const termExit = yield* waitForOwnedProcessGroupExit(pid, commandTerminationGraceMs);
  return yield* Match.value(termExit).pipe(
    Match.when({ kind: "exited" }, () => Effect.void),
    Match.when({ kind: "deadline-exceeded" }, () =>
      forceOwnedCommandProcessGroupExit(owned, pid, term)
    ),
    Match.exhaustive
  );
});

const forceOwnedCommandProcessGroupExit = Effect.fn("habitat.command.process.forceExit")(function* (
  owned: SpawnedOwnedCommandProcess,
  pid: number,
  term: OwnedProcessGroupSignalOutcome
) {
  const kill = yield* signalOwnedProcessGroup(owned.child, pid, "SIGKILL");
  const exit = yield* waitForOwnedProcessGroupExit(pid, commandKillSettleMs);
  return yield* Effect.succeed(exit).pipe(
    Effect.filterOrDie(
      (outcome) => outcome.kind === "exited",
      () =>
        new OwnedCommandProcessReleaseIncomplete({
          message: `Habitat could not release owned command process group ${pid} within ${commandKillSettleMs}ms.`,
          pid,
          term,
          kill,
        })
    ),
    Effect.asVoid
  );
});

const signalOwnedProcessGroup = Effect.fn("habitat.command.process.signal")(function* (
  child: OwnedChildProcess,
  pid: number,
  signal: "SIGTERM" | "SIGKILL"
) {
  return yield* signalPosixProcessGroup(child, pid, signal);
});

function signalPosixProcessGroup(
  child: OwnedChildProcess,
  pid: number,
  signal: "SIGTERM" | "SIGKILL"
) {
  const signalGroup = Effect.try({
    try: () => process.kill(-pid, signal),
    catch: processError,
  });
  const groupOutcome = signalGroup.pipe(
    Effect.match({
      onFailure: processGroupSignalFailure,
      onSuccess: () =>
        ({ kind: "delivered", target: "group" }) satisfies OwnedProcessGroupAttemptOutcome,
    })
  );
  return groupOutcome.pipe(
    Effect.flatMap((outcome) => selectSignalFallback(outcome, child, signal))
  );
}

function processGroupSignalFailure(cause: unknown): OwnedProcessGroupAttemptOutcome {
  return Match.value(errorHasCode(cause, "ESRCH")).pipe(
    Match.when(true, () => ({ kind: "not-found" }) satisfies OwnedProcessGroupAttemptOutcome),
    Match.orElse(
      () =>
        ({
          kind: "failed",
          cause: processError(cause).message,
        }) satisfies OwnedProcessGroupAttemptOutcome
    )
  );
}

function selectSignalFallback(
  outcome: OwnedProcessGroupAttemptOutcome,
  child: OwnedChildProcess,
  signal: "SIGTERM" | "SIGKILL"
) {
  return Match.value(outcome).pipe(
    Match.when({ kind: "failed" }, ({ cause }) => fallbackOwnedProcessSignal(child, signal, cause)),
    Match.orElse((settled) => Effect.succeed(settled))
  );
}

function fallbackOwnedProcessSignal(
  child: OwnedChildProcess,
  signal: "SIGTERM" | "SIGKILL",
  groupCause: string
) {
  const fallback = Effect.try({
    try: () => {
      if (!child.kill(signal)) throw new Error(`Direct child refused ${signal}.`);
    },
    catch: processError,
  }).pipe(
    Effect.match({
      onFailure: (cause) =>
        ({
          kind: "failed",
          groupCause,
          fallbackCause: processError(cause).message,
        }) satisfies OwnedProcessGroupSignalOutcome,
      onSuccess: () =>
        ({ kind: "delivered", target: "child" }) satisfies OwnedProcessGroupSignalOutcome,
    })
  );
  return fallback;
}

const waitForOwnedProcessGroupExit = Effect.fn("habitat.command.process.awaitTermination")(
  function* (pid: number, timeoutMs: number) {
    const deadline = Date.now() + timeoutMs;
    let alive = yield* ownedProcessGroupIsAlive(pid);
    while (alive && Date.now() < deadline) {
      yield* Effect.sleep(Duration.millis(commandKillPollMs));
      alive = yield* ownedProcessGroupIsAlive(pid);
    }
    return Match.value(alive).pipe(
      Match.when(
        true,
        () => ({ kind: "deadline-exceeded" }) satisfies OwnedProcessGroupExitOutcome
      ),
      Match.orElse(() => ({ kind: "exited" }) satisfies OwnedProcessGroupExitOutcome)
    ) satisfies OwnedProcessGroupExitOutcome;
  }
);

function ownedProcessGroupIsAlive(pid: number) {
  return Effect.try({
    try: () => process.kill(-pid, 0),
    catch: processError,
  }).pipe(
    Effect.match({
      onFailure: (cause) => !errorHasCode(cause, "ESRCH"),
      onSuccess: () => true,
    })
  );
}

function assertSupportedCommandProcessPlatform(): void {
  return Match.value(process.platform).pipe(
    Match.when("darwin", () => undefined),
    Match.when("linux", () => undefined),
    Match.orElse((platform) => {
      throw new Error(
        `Habitat command process ownership supports only Darwin and Linux; received ${platform}.`
      );
    })
  );
}

function errorHasCode(cause: unknown, code: string): boolean {
  return cause instanceof Error && "code" in cause && cause.code === code;
}

function processError(cause: unknown): Error {
  return Match.value(cause).pipe(
    Match.when(Match.instanceOf(Error), (error) => error),
    Match.orElse((unknownCause) => new Error(String(unknownCause)))
  );
}
