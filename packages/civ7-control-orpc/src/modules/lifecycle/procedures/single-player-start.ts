import {
  type Civ7AppUiSnapshotResult,
  type Civ7RuntimeProbe,
  type Civ7SetupMapRowsResult,
  type Civ7SinglePlayerSetupValues,
} from "@civ7/direct-control";
import { CIV7_UI_LOADING_STATES } from "@civ7/direct-control/game-ui/loading-states";
import { Clock, Effect, Either, Match, Option, Predicate } from "effect";

import {
  civ7ControlOrpcErrorCorrelationData,
  civ7ControlOrpcFailureDetail,
} from "../../../model/correlation";
import { civ7ControlOrpcImplementer } from "../../../procedure";
import type {
  Civ7LifecycleSinglePlayerStartInput,
  Civ7LifecycleSinglePlayerStartResult,
} from "../contract";

const procedureKey = "lifecycle.singlePlayer.start" as const;
const source = "direct-control-facade" as const;
const DEFAULT_LIFECYCLE_POLL_MS = 1_000;
const DEFAULT_LIFECYCLE_SETUP_WAIT_MS = 30_000;
const DEFAULT_LIFECYCLE_START_WAIT_MS = 120_000;
const DEFAULT_LIFECYCLE_MAP_ROW_LIMIT = 20;

type PollResult<A> =
  | Readonly<{ kind: "matched"; value: A }>
  | Readonly<{ kind: "exhausted" }>
  | Readonly<{ kind: "invalid-observation" }>;

type PollState<A> = Readonly<{ kind: "polling"; attempts: number }> | PollResult<A>;

type FailedRuntimeProbeObservation = Readonly<{ ok: false; error: string }>;
type FiniteNumberProbeObservation = Readonly<{ ok: true; value: number }>;
type StringProbeObservation = Readonly<{ ok: true; value: string }>;
type BooleanProbeObservation = Readonly<{ ok: true; value: boolean }>;

class InvalidDependencyObservationError extends Error {
  override readonly name = "InvalidDependencyObservationError";

  constructor() {
    super("invalid-dependency-observation");
  }
}

class InvalidMutationResultError extends Error {
  override readonly name = "InvalidMutationResultError";

  constructor() {
    super("invalid-mutation-result");
  }
}

/** Owns lifecycle ordering while every provider call remains one wire operation. */
export const lifecycleSinglePlayerStartProcedure =
  civ7ControlOrpcImplementer.lifecycle.singlePlayer.start.effect(function* ({
    input,
    context,
    errors,
  }) {
    const errorData = {
      procedureKey,
      source,
      ...civ7ControlOrpcErrorCorrelationData(context),
    };
    const dependencyFailure = (step: string, detail: string) =>
      errors.LIFECYCLE_DEPENDENCY_UNAVAILABLE({ data: { ...errorData, step, detail } });
    const uncertainFailure = (step: string, detail: string) =>
      errors.LIFECYCLE_MUTATION_UNCERTAIN({
        data: { ...errorData, step, detail, noRepeat: true },
      });
    const verificationFailure = (step: string, detail: string) =>
      errors.LIFECYCLE_VERIFICATION_FAILED({
        data: { ...errorData, step, detail, noRepeat: true },
      });
    const classifyMutationFailure = (step: string, classifyRejected: boolean, cause: unknown) =>
      Match.value(cause).pipe(
        Match.when(
          (value: unknown) => classifyRejected && isExplicitVerificationFailure(value),
          (value) => verificationFailure(step, civ7ControlOrpcFailureDetail(value))
        ),
        Match.orElse((value) => uncertainFailure(step, civ7ControlOrpcFailureDetail(value)))
      );
    const classifyAdmissionFailure = (cause: unknown) =>
      Match.value(Option.fromNullable(refusedSetupPhase(cause))).pipe(
        Match.when(Option.isSome, (phase) =>
          errors.LIFECYCLE_STATE_REFUSED({
            data: {
              ...errorData,
              step: "admit-setup-phase",
              detail: civ7ControlOrpcFailureDetail(cause),
              initialPhase: phase.value,
            },
          })
        ),
        Match.orElse(() =>
          uncertainFailure("admit-setup-phase", civ7ControlOrpcFailureDetail(cause))
        )
      );
    const mutationResultCall = <A>(
      step: string,
      call: () => Promise<A>,
      isValid: (value: A) => boolean,
      classifyRejected = false
    ) =>
      Effect.tryPromise({
        try: call,
        catch: (cause) => cause,
      }).pipe(
        Effect.flatMap((result) =>
          validateObservation(isValid, result, () => new InvalidMutationResultError())
        ),
        Effect.mapError((cause) => classifyMutationFailure(step, classifyRejected, cause))
      );

    const directLifecycle = yield* Effect.fromNullable(context.directLifecycle).pipe(
      Effect.mapError(() =>
        dependencyFailure("inspect-setup-phase", "direct-lifecycle-facade-unavailable")
      )
    );

    yield* Effect.tryPromise({
      try: () => directLifecycle.getSetupSnapshot(context.endpointDefaults),
      catch: (cause) => cause,
    }).pipe(
      Effect.flatMap((result) =>
        validateObservation(
          isSetupSnapshotResult,
          result,
          () => new InvalidDependencyObservationError()
        )
      ),
      Effect.mapError((cause) =>
        dependencyFailure("inspect-setup-phase", civ7ControlOrpcFailureDetail(cause))
      )
    );

    const admission = yield* Effect.tryPromise({
      try: () => directLifecycle.admitSetupShell(input.activeGamePolicy, context.endpointDefaults),
      catch: (cause) => cause,
    }).pipe(
      Effect.flatMap((result) =>
        validateObservation(isAdmissionResult, result, () => new InvalidMutationResultError())
      ),
      Effect.mapError(classifyAdmissionFailure)
    );

    const initialPhase = admission.initial.snapshot.phase;
    const transition = yield* Effect.fromNullable(
      Match.value({ transition: admission.transition, initialPhase }).pipe(
        Match.when(
          { transition: "shell", initialPhase: "shell" },
          ({ initialPhase }) =>
            ({
              initialPhase,
              activeGameExit: "not-needed",
            }) satisfies Civ7LifecycleSinglePlayerStartResult["transition"]
        ),
        Match.when(
          { transition: "exit-sent", initialPhase: "running-game" },
          ({ initialPhase }) =>
            ({
              initialPhase,
              activeGameExit: "exited",
            }) satisfies Civ7LifecycleSinglePlayerStartResult["transition"]
        ),
        Match.orElse(() => null)
      )
    ).pipe(
      Effect.mapError(() =>
        verificationFailure("admit-setup-phase", "inconsistent-admission-result")
      )
    );

    const shellSnapshot = yield* Match.value(admission.transition).pipe(
      Match.when("exit-sent", () =>
        requireMatched(
          pollUntil({
            read: () => directLifecycle.getSetupSnapshot(context.endpointDefaults),
            matches: (result) => result.snapshot.phase === "shell",
            timeoutMs: DEFAULT_LIFECYCLE_SETUP_WAIT_MS,
            pollMs: DEFAULT_LIFECYCLE_POLL_MS,
          }),
          () => verificationFailure("wait-for-shell", "shell-not-observed-after-exit")
        )
      ),
      Match.orElse(() => Effect.succeed(admission.initial))
    );

    const postLoadSnapshot = yield* Option.fromNullable(input.savedConfig).pipe(
      Option.match({
        onNone: () => Effect.succeed(shellSnapshot),
        onSome: (savedConfig) =>
          Effect.gen(function* () {
            const request = yield* mutationResultCall(
              "request-saved-config-load",
              () => directLifecycle.requestSavedConfigLoad(savedConfig, context.endpointDefaults),
              isSavedConfigLoadRequestResult,
              true
            );
            yield* Effect.filterOrFail(
              Effect.succeed(request.accepted),
              (accepted) => accepted === true,
              () => verificationFailure("request-saved-config-load", "saved-config-load-rejected")
            );
            const beforeRevisionSource = Effect.fromNullable(
              finiteNumberProbeValue(request.before.snapshot.setup.revision)
            );
            const beforeRevision = yield* Effect.mapError(beforeRevisionSource, () =>
              verificationFailure("request-saved-config-load", "setup-revision-unavailable")
            );
            return yield* requireMatched(
              pollUntil({
                read: () => directLifecycle.getSetupSnapshot(context.endpointDefaults),
                matches: (result) => hasAdvancedSetupRevision(result, beforeRevision),
                timeoutMs: DEFAULT_LIFECYCLE_SETUP_WAIT_MS,
                pollMs: DEFAULT_LIFECYCLE_POLL_MS,
              }),
              () =>
                verificationFailure("wait-for-saved-config", "saved-config-readback-not-observed")
            );
          }),
      })
    );

    yield* Effect.filterOrFail(
      Effect.succeed(postLoadSnapshot),
      (snapshot) => snapshot.snapshot.phase === "shell",
      () => verificationFailure("verify-setup-shell", "setup-left-shell-before-application")
    );

    const targetMod = yield* mutationResultCall(
      "reconcile-target-mod",
      () => directLifecycle.reconcileRequiredTargetMod(input.targetModId, context.endpointDefaults),
      isTargetModResult,
      true
    );
    yield* Effect.filterOrFail(
      Effect.succeed(targetMod),
      (result) =>
        result.targetModId === input.targetModId &&
        result.refreshed === true &&
        result.verified === true,
      () => verificationFailure("reconcile-target-mod", "target-mod-not-active")
    );

    const initialRows = yield* requireMatched(
      pollUntil({
        read: () =>
          directLifecycle.getSetupMapRows(
            { file: input.mapScript, limit: DEFAULT_LIFECYCLE_MAP_ROW_LIMIT },
            context.endpointDefaults
          ),
        matches: hasStructurallyValidMapRows,
        timeoutMs: DEFAULT_LIFECYCLE_SETUP_WAIT_MS,
        pollMs: DEFAULT_LIFECYCLE_POLL_MS,
      }),
      () => verificationFailure("read-map-rows", "setup-map-rows-unavailable")
    );
    const mapRows = yield* Match.value(hasExactMapRow(initialRows, input.mapScript)).pipe(
      Match.when(true, () => Effect.succeed(initialRows)),
      Match.orElse(() =>
        Effect.gen(function* () {
          const reload = yield* mutationResultCall(
            "reload-setup-ui",
            () => directLifecycle.reloadSetupUiInShell(context.endpointDefaults),
            isReloadResult
          );
          yield* Effect.filterOrFail(
            Effect.succeed(reload),
            (result) => result.reloaded === true,
            () => verificationFailure("reload-setup-ui", "setup-ui-reload-rejected")
          );
          return yield* requireMatched(
            pollUntil({
              read: () =>
                directLifecycle.getSetupMapRows(
                  { file: input.mapScript, limit: DEFAULT_LIFECYCLE_MAP_ROW_LIMIT },
                  context.endpointDefaults
                ),
              matches: (result) => hasExactMapRow(result, input.mapScript),
              timeoutMs: DEFAULT_LIFECYCLE_SETUP_WAIT_MS,
              pollMs: DEFAULT_LIFECYCLE_POLL_MS,
            }),
            () => verificationFailure("wait-for-map-row", "setup-map-row-not-observed")
          );
        })
      )
    );
    yield* Effect.filterOrFail(
      Effect.succeed(mapRows),
      (result) => hasExactMapRow(result, input.mapScript),
      () => verificationFailure("verify-map-row", "setup-map-row-not-observed")
    );

    const setupValues = singlePlayerSetupValues(input);
    yield* mutationResultCall(
      "apply-setup",
      () => directLifecycle.applySinglePlayerSetup(setupValues, context.endpointDefaults),
      isAppliedSetupResult,
      true
    );

    yield* mutationResultCall(
      "host-game",
      () => directLifecycle.hostPreparedSinglePlayerGame(setupValues, context.endpointDefaults),
      isHostResult,
      true
    );

    const startObservation = yield* requireMatched(
      pollUntil({
        read: () => directLifecycle.getAppUiSnapshot(context.endpointDefaults),
        matches: (result) => isGameStarted(result) || isBeginReady(result),
        timeoutMs: DEFAULT_LIFECYCLE_START_WAIT_MS,
        pollMs: DEFAULT_LIFECYCLE_POLL_MS,
      }),
      () => verificationFailure("wait-for-begin-ready", "begin-ready-state-not-observed")
    );
    yield* Match.value(isGameStarted(startObservation)).pipe(
      Match.when(true, () => Effect.succeed(startObservation)),
      Match.orElse(() =>
        Effect.gen(function* () {
          const begin = yield* mutationResultCall(
            "begin-game",
            () => directLifecycle.beginGame(context.endpointDefaults),
            isBeginResult
          );
          yield* Effect.filterOrFail(
            Effect.succeed(begin),
            (result) => result.accepted,
            (result) =>
              verificationFailure("begin-game", `begin-game-refused:${beginRefusalReason(result)}`)
          );
          return yield* requireMatched(
            pollUntil({
              read: () => directLifecycle.getAppUiSnapshot(context.endpointDefaults),
              matches: isGameStarted,
              timeoutMs: DEFAULT_LIFECYCLE_START_WAIT_MS,
              pollMs: DEFAULT_LIFECYCLE_POLL_MS,
            }),
            () => verificationFailure("wait-for-game-started", "game-start-not-observed")
          );
        })
      )
    );
    yield* requireMatched(
      pollUntil({
        read: () => directLifecycle.checkTunerHealth(context.endpointDefaults),
        matches: isTunerReady,
        timeoutMs: DEFAULT_LIFECYCLE_START_WAIT_MS,
        pollMs: DEFAULT_LIFECYCLE_POLL_MS,
      }),
      () => verificationFailure("wait-for-tuner", "tuner-readiness-not-observed")
    );

    yield* requireMatched(
      pollUntil({
        read: () => directLifecycle.getMapSummary(context.endpointDefaults),
        matches: (result) => hasExactMapIdentity(result, input.seed, input.mapSize),
        timeoutMs: DEFAULT_LIFECYCLE_START_WAIT_MS,
        pollMs: DEFAULT_LIFECYCLE_POLL_MS,
      }),
      () => verificationFailure("verify-map", "runtime-map-identity-mismatch")
    );

    return {
      ...civ7ControlOrpcErrorCorrelationData(context),
      status: "started",
      transition,
    } satisfies Civ7LifecycleSinglePlayerStartResult;
  });

function singlePlayerSetupValues(
  input: Civ7LifecycleSinglePlayerStartInput
): Civ7SinglePlayerSetupValues {
  return {
    mapScript: input.mapScript,
    mapSize: input.mapSize,
    seed: input.seed,
    gameSeed: input.seed,
    ...Option.fromNullable(input.playerCount).pipe(
      Option.match({
        onNone: () => ({}),
        onSome: (playerCount) => ({ playerCount }),
      })
    ),
    options: input.gameOptions,
    playerOptions: Object.entries(input.playerOptions)
      .sort(([left], [right]) => Number(left) - Number(right))
      .map(([playerId, options]) => ({ playerId: Number(playerId), options })),
  };
}

function hasExactMapRow(result: Civ7SetupMapRowsResult, mapScript: string): boolean {
  return result.rows.some((row) => row.file === mapScript);
}

function hasStructurallyValidMapRows(result: Civ7SetupMapRowsResult): boolean {
  return Match.value(
    Array.isArray(result.rows) &&
      result.rows.every(
        (row) => row !== null && typeof row === "object" && typeof row.file === "string"
      )
  ).pipe(
    Match.when(true, () => true),
    Match.orElse(() => invalidObservation("Invalid setup map rows observation"))
  );
}

const setupPhases = new Set(["shell", "running-game", "loading", "begin-ready", "unavailable"]);

function isSetupSnapshotResult(value: unknown): boolean {
  return (
    isRecord(value) &&
    isRecord(value.snapshot) &&
    Predicate.isString(value.snapshot.phase) &&
    setupPhases.has(value.snapshot.phase)
  );
}

function isAdmissionResult(value: unknown): boolean {
  return (
    isRecord(value) &&
    (value.transition === "shell" || value.transition === "exit-sent") &&
    isSetupSnapshotResult(value.initial)
  );
}

function isSavedConfigLoadRequestResult(value: unknown): boolean {
  return (
    isRecord(value) &&
    Predicate.isBoolean(value.accepted) &&
    isRecord(value.before) &&
    isRecord(value.before.snapshot) &&
    isRecord(value.before.snapshot.setup) &&
    isNumberRuntimeProbe(value.before.snapshot.setup.revision)
  );
}

function isTargetModResult(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.targetModId === "string" &&
    Predicate.isBoolean(value.refreshed) &&
    Predicate.isBoolean(value.verified)
  );
}

function isReloadResult(value: unknown): boolean {
  return isRecord(value) && Predicate.isBoolean(value.reloaded);
}

function isAppliedSetupResult(value: unknown): boolean {
  return isRecord(value) && value.verified === true;
}

function isHostResult(value: unknown): boolean {
  return isRecord(value) && value.accepted === true;
}

function isBeginResult(value: unknown): boolean {
  return (
    isRecord(value) &&
    ((value.accepted === true &&
      (value.loadingState === CIV7_UI_LOADING_STATES.WaitingForUIReady ||
        value.loadingState === CIV7_UI_LOADING_STATES.WaitingToStart)) ||
      (value.accepted === false &&
        (value.reason === "loading-state" || value.reason === "notify-unavailable") &&
        (value.loadingState === undefined || typeof value.loadingState === "number")))
  );
}

function beginRefusalReason(value: unknown): string {
  return Match.value(value).pipe(
    Match.when(isBeginRefusal, (refusal) => refusal.reason),
    Match.orElse(() => "unknown")
  );
}

function isBeginRefusal(value: unknown): value is Readonly<{ accepted: false; reason: string }> {
  return isRecord(value) && value.accepted === false && Predicate.isString(value.reason);
}

function isNumberRuntimeProbe(value: unknown): boolean {
  return isFiniteNumberProbe(value) || isFailedRuntimeProbe(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object";
}

function isBeginReady(result: Civ7AppUiSnapshotResult): boolean {
  const state = appUiLoadingState(result);
  return (
    state === CIV7_UI_LOADING_STATES.WaitingForUIReady ||
    state === CIV7_UI_LOADING_STATES.WaitingToStart
  );
}

function isGameStarted(result: Civ7AppUiSnapshotResult): boolean {
  return (
    appUiLoadingState(result) === CIV7_UI_LOADING_STATES.GameStarted && appUiInGame(result) === true
  );
}

function hasAdvancedSetupRevision(result: unknown, beforeRevision: number): boolean {
  const observation = recordObservation(result, "Invalid setup revision observation");
  const snapshot = recordObservation(observation.snapshot, "Invalid setup revision observation");
  const phase = setupPhaseObservation(snapshot.phase);
  const setup = recordObservation(snapshot.setup, "Invalid setup revision observation");
  const revision = finiteNumberProbeValue(setup.revision);
  return phase === "shell" && revision !== undefined && revision !== beforeRevision;
}

function setupPhaseObservation(value: unknown): string {
  return Match.value(value).pipe(
    Match.when(
      (phase: unknown): phase is string => Predicate.isString(phase) && setupPhases.has(phase),
      (phase) => phase
    ),
    Match.orElse(() => invalidObservation("Invalid setup revision observation"))
  );
}

function isTunerReady(result: unknown): boolean {
  const observation = recordObservation(result, "Invalid tuner readiness observation");
  return Match.value(observation.ready).pipe(
    Match.when(Predicate.isBoolean, (ready) => ready),
    Match.orElse(() => invalidObservation("Invalid tuner readiness observation"))
  );
}

function hasExactMapIdentity(result: unknown, seed: number, mapSize: string): boolean {
  const observation = recordObservation(result, "Invalid runtime map identity observation");
  const map = recordObservation(observation.map, "Invalid runtime map identity observation");
  return (
    finiteNumberProbeValue(map.randomSeed) === seed && stringProbeValue(map.mapSizeType) === mapSize
  );
}

function appUiLoadingState(result: unknown): number | undefined {
  const ui = appUiSnapshotUi(result);
  return finiteNumberProbeValue(ui.loadingState);
}

function appUiInGame(result: unknown): boolean | undefined {
  const ui = appUiSnapshotUi(result);
  return booleanProbeValue(ui.inGame);
}

function appUiSnapshotUi(result: unknown): Record<string, unknown> {
  const observation = recordObservation(result, "Invalid App UI observation");
  const snapshot = recordObservation(observation.snapshot, "Invalid App UI observation");
  return recordObservation(snapshot.ui, "Invalid App UI observation");
}

function finiteNumberProbeValue(probe: unknown): number | undefined {
  return Match.value(probe).pipe(
    Match.when(isFailedRuntimeProbe, () => undefined),
    Match.when(isFiniteNumberProbe, (result) => result.value),
    Match.orElse(() => invalidObservation("Invalid numeric runtime probe"))
  );
}

function stringProbeValue(probe: unknown): string | undefined {
  return Match.value(probe).pipe(
    Match.when(isFailedRuntimeProbe, () => undefined),
    Match.when(isStringProbe, (result) => result.value),
    Match.orElse(() => invalidObservation("Invalid string runtime probe"))
  );
}

function booleanProbeValue(probe: unknown): boolean | undefined {
  return Match.value(probe).pipe(
    Match.when(isFailedRuntimeProbe, () => undefined),
    Match.when(isBooleanProbe, (result) => result.value),
    Match.orElse(() => invalidObservation("Invalid boolean runtime probe"))
  );
}

function isFailedRuntimeProbe(value: unknown): value is FailedRuntimeProbeObservation {
  return isRecord(value) && value.ok === false && Predicate.isString(value.error);
}

function isFiniteNumberProbe(value: unknown): value is FiniteNumberProbeObservation {
  return (
    isRecord(value) &&
    value.ok === true &&
    Predicate.isNumber(value.value) &&
    Number.isFinite(value.value)
  );
}

function isStringProbe(value: unknown): value is StringProbeObservation {
  return isRecord(value) && value.ok === true && Predicate.isString(value.value);
}

function isBooleanProbe(value: unknown): value is BooleanProbeObservation {
  return isRecord(value) && value.ok === true && Predicate.isBoolean(value.value);
}

function refusedSetupPhase(cause: unknown): "loading" | "begin-ready" | "unavailable" | undefined {
  return Match.value(cause).pipe(
    Match.when(hasSetupPhaseRefusalDetails, (refusal) =>
      admittedRefusedSetupPhase(refusal.details.snapshot.phase)
    ),
    Match.orElse(() => undefined)
  );
}

function hasSetupPhaseRefusalDetails(
  value: unknown
): value is object & {
  code: string;
  details: Record<string, unknown> & { snapshot: Record<string, unknown> };
} {
  return (
    hasDirectControlCode(value, "setup-phase-refused") &&
    "details" in value &&
    isRecord(value.details) &&
    isRecord(value.details.snapshot)
  );
}

function admittedRefusedSetupPhase(
  value: unknown
): "loading" | "begin-ready" | "unavailable" | undefined {
  return Match.value(value).pipe(
    Match.when("loading", (phase) => phase),
    Match.when("begin-ready", (phase) => phase),
    Match.when("unavailable", (phase) => phase),
    Match.orElse(() => undefined)
  );
}

function isExplicitVerificationFailure(cause: unknown): boolean {
  return [
    "setup-config-evidence-missing",
    "setup-config-load-failed",
    "setup-host-rejected",
    "setup-map-row-missing",
    "setup-parameter-invalid",
    "setup-phase-refused",
    "setup-readback-mismatch",
  ].some((code) => hasDirectControlCode(cause, code));
}

function hasDirectControlCode(cause: unknown, code: string): cause is object & { code: string } {
  return (
    cause !== null &&
    typeof cause === "object" &&
    "name" in cause &&
    cause.name === "Civ7DirectControlError" &&
    "code" in cause &&
    cause.code === code
  );
}

function requireMatched<A, E>(effect: ReturnType<typeof pollUntil<A>>, onExhausted: () => E) {
  return effect.pipe(
    Effect.filterOrFail(
      (result): result is Readonly<{ kind: "matched"; value: A }> => result.kind === "matched",
      onExhausted
    ),
    Effect.map((result) => result.value)
  );
}

function invalidObservation(message: string): never {
  throw new TypeError(message);
}

function recordObservation(value: unknown, message: string): Record<string, unknown> {
  return Match.value(value).pipe(
    Match.when(isRecord, (record) => record),
    Match.orElse(() => invalidObservation(message))
  );
}

function pollUntil<A>(
  options: Readonly<{
    read: () => Promise<A>;
    matches: (value: A) => boolean;
    timeoutMs: number;
    pollMs: number;
  }>
) {
  return Effect.gen(function* () {
    const startedAt = yield* Clock.currentTimeMillis;
    const deadline = startedAt + options.timeoutMs;
    const initial: PollState<A> = { kind: "polling", attempts: 0 };
    const state = yield* Effect.iterate<PollState<A>, never, never>(initial, {
      while: (current) => current.kind === "polling",
      body: (current) => pollIteration<A>(options, deadline, current),
    });
    const terminal = Option.liftPredicate(state, isPollResult);
    return Option.getOrElse(terminal, () => ({ kind: "exhausted" }) satisfies PollResult<A>);
  });
}

function pollIteration<A>(
  options: Readonly<{
    read: () => Promise<A>;
    matches: (value: A) => boolean;
    timeoutMs: number;
    pollMs: number;
  }>,
  deadline: number,
  current: PollState<A>
) {
  const polling = Option.liftPredicate(
    current,
    (state): state is Readonly<{ kind: "polling"; attempts: number }> =>
      state.kind === "polling"
  );
  return Option.match(polling, {
    onNone: () => Effect.succeed(current),
    onSome: (active) => pollStep<A>(options, deadline, active),
  });
}

function isPollResult<A>(state: PollState<A>): state is PollResult<A> {
  return state.kind !== "polling";
}

function pollStep<A>(
  options: Readonly<{
    read: () => Promise<A>;
    matches: (value: A) => boolean;
    timeoutMs: number;
    pollMs: number;
  }>,
  deadline: number,
  current: Readonly<{ kind: "polling"; attempts: number }>
) {
  return Effect.gen(function* () {
    const beforeDelay = yield* Clock.currentTimeMillis;
    const delayMs = Match.value(current.attempts).pipe(
      Match.when(0, () => 0),
      Match.orElse(() => Math.min(options.pollMs, deadline - beforeDelay))
    );
    const delay = Effect.sleep(delayMs);
    const shouldDelay = () => delayMs > 0;
    yield* Effect.when(delay, shouldDelay);
    const beforeRead = yield* Clock.currentTimeMillis;
    const remainingMs = deadline - beforeRead;
    const continuation = Match.value(remainingMs <= 0).pipe(
      Match.when(true, () => Effect.succeed({ kind: "exhausted" } satisfies PollState<A>)),
      Match.orElse(() => pollObservation<A>(options, deadline, remainingMs, current))
    );
    return yield* continuation;
  });
}

function pollObservation<A>(
  options: Readonly<{
    read: () => Promise<A>;
    matches: (value: A) => boolean;
    timeoutMs: number;
    pollMs: number;
  }>,
  deadline: number,
  remainingMs: number,
  current: Readonly<{ kind: "polling"; attempts: number }>
) {
  return Effect.gen(function* () {
    const observed = yield* Effect.tryPromise({
      try: options.read,
      catch: (cause) => cause,
    }).pipe(Effect.either, Effect.timeoutOption(remainingMs));
    const completedAt = yield* Clock.currentTimeMillis;
    const value: Option.Option<A> = Option.flatMap(
      Option.filter(observed, () => completedAt < deadline),
      Either.getRight
    );
    return yield* Option.match(value, {
      onNone: () => Effect.succeed(unmatchedPollState<A>(completedAt, deadline, observed, current)),
      onSome: (result) => pollObservedValue<A>(options.matches, result, current),
    });
  });
}

function pollObservedValue<A>(
  matches: (value: A) => boolean,
  value: A,
  current: Readonly<{ kind: "polling"; attempts: number }>
) {
  return matchesObservation(matches, value).pipe(
    Effect.option,
    Effect.map((matched) =>
      Option.match(matched, {
        onNone: () => ({ kind: "invalid-observation" }) satisfies PollState<A>,
        onSome: (didMatch) => matchedPollState(didMatch, value, current),
      })
    )
  );
}

function matchedPollState<A>(
  didMatch: boolean,
  value: A,
  current: Readonly<{ kind: "polling"; attempts: number }>
): PollState<A> {
  return Match.value(didMatch).pipe(
    Match.when(true, () => ({ kind: "matched", value }) satisfies PollState<A>),
    Match.orElse(
      () => ({ kind: "polling", attempts: current.attempts + 1 }) satisfies PollState<A>
    )
  );
}

function unmatchedPollState<A>(
  completedAt: number,
  deadline: number,
  observed: Option.Option<unknown>,
  current: Readonly<{ kind: "polling"; attempts: number }>
): PollState<A> {
  return Match.value(completedAt >= deadline || Option.isNone(observed)).pipe(
    Match.when(true, () => ({ kind: "exhausted" }) satisfies PollState<A>),
    Match.orElse(
      () => ({ kind: "polling", attempts: current.attempts + 1 }) satisfies PollState<A>
    )
  );
}

function matchesObservation<A>(matches: (value: A) => boolean, value: A) {
  return Effect.try({
    try: () => matches(value),
    catch: (cause) => cause,
  });
}

function validateObservation<A, E>(matches: (value: A) => boolean, value: A, onInvalid: () => E) {
  return matchesObservation(matches, value).pipe(
    Effect.mapError(onInvalid),
    Effect.filterOrFail((matched) => matched, onInvalid),
    Effect.map(() => value)
  );
}
