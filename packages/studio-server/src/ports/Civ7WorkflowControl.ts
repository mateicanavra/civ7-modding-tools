import {
  type Civ7LifecycleSinglePlayerStartInput,
  createCiv7ControlOrpcServerClient,
} from "@civ7/control-orpc";
import {
  DEFAULT_CIV7_TUNER_TIMEOUT_MS,
  startCiv7Autoplay,
  stopCiv7Autoplay,
} from "@civ7/direct-control";
import { isDefinedError, safe } from "@orpc/client";
import {
  Context,
  Effect,
  Record as EffectRecord,
  Inspectable,
  Layer,
  Match,
  Option,
  Predicate,
} from "effect";

import type { StudioInputs, StudioServerContext } from "../context.js";
import {
  autoplayStartStopFailed,
  autoplayVerificationFailed,
  dependencyUnavailable,
  invalidRequest,
  materializationFailed,
  type StudioBoundedDiagnostics,
  type StudioBoundedDiagnosticValue,
  type StudioRuntimeFailure,
  verificationFailed,
} from "../errors/index.js";
import {
  Civ7TunerBackoffError,
  Civ7TunerSession,
  type Civ7TunerSessionApi,
} from "../services/Civ7TunerSession.js";
import { StudioConfig } from "../services/StudioConfig.js";
import type { RunInGameDeployment, RunInGamePreparedRequest } from "./workflowTypes.js";

const SCRIPTING_LOG_WAIT_TIMEOUT_MS = 90_000;

type StartSinglePlayerArgs = Readonly<{
  requestId: string;
  prepared: RunInGamePreparedRequest;
  deployment: RunInGameDeployment;
}>;

export type Civ7WorkflowControlApi = ReturnType<typeof makeCiv7WorkflowControlApi>;

export class Civ7WorkflowControl extends Context.Tag("@civ7/studio-server/Civ7WorkflowControl")<
  Civ7WorkflowControl,
  Civ7WorkflowControlApi
>() {}

export const Civ7WorkflowControlLive = Layer.effect(
  Civ7WorkflowControl,
  Effect.gen(function* () {
    const tuner = yield* Civ7TunerSession;
    const config = yield* StudioConfig;

    return makeCiv7WorkflowControlApi(tuner, config);
  })
);

function makeCiv7WorkflowControlApi(tuner: Civ7TunerSessionApi, config: StudioServerContext) {
  return {
    startSinglePlayer: (args: StartSinglePlayerArgs) =>
      Effect.gen(function* () {
        const demand = yield* lifecycleDemand(args);
        const client = createCiv7ControlOrpcServerClient({
          directControl: config.civ7Control.directControl,
          directLifecycle: config.civ7Control.directLifecycle,
          endpointDefaults: {
            timeoutMs: config.civ7Control.timeoutMs,
            session: tuner.session,
          },
          correlation: { correlationId: args.requestId },
        });
        const callResult = yield* Effect.acquireUseRelease(
          Effect.sync(() => openLifecycleCall(client, demand)),
          ({ pending }) => Effect.promise(() => pending),
          ({ controller, pending }) => {
            const drain = Effect.promise(() =>
              pending.then(
                () => undefined,
                () => undefined
              )
            );
            return Effect.sync(() => controller.abort()).pipe(Effect.zipRight(drain));
          }
        );
        const started = yield* settleLifecycleCall(callResult);
        return yield* verifyLifecycleCorrelation(started, args.requestId);
      }),

    runAutoplay: (input: StudioInputs["civ7"]["autoplay"]) => {
      const opts = {
        timeoutMs: DEFAULT_CIV7_TUNER_TIMEOUT_MS,
        waitTimeoutMs: SCRIPTING_LOG_WAIT_TIMEOUT_MS,
        pollIntervalMs: 1_000,
      };
      const runAutoplayAction = Match.value(input.action).pipe(
        Match.when("start", () => startCiv7Autoplay),
        Match.when("stop", () => stopCiv7Autoplay),
        Match.exhaustive
      );
      const failureReason = Match.value(input.action).pipe(
        Match.when("start", () => "start-failed" as const),
        Match.when("stop", () => "stop-failed" as const),
        Match.exhaustive
      );
      return tuner
        .use((options) => runAutoplayAction({ ...opts, ...options }))
        .pipe(
          Effect.mapError((err) =>
            autoplayStartStopFailed({
              message: `Civ7 autoplay ${input.action} failed`,
              reason: failureReason,
              diagnostics: boundedDiagnostics({
                code: `civ7-autoplay-${input.action}-failed`,
                action: input.action,
                cause: diagnosticString(err),
              }),
            })
          ),
          Effect.filterOrFail(
            (result) => result.verified,
            (result) =>
              autoplayVerificationFailed({
                message: `Civ7 autoplay ${input.action} verification failed`,
                diagnostics: boundedDiagnostics({
                  code: "civ7-autoplay-verification-failed",
                  action: input.action,
                  autoplay: result.after.autoplay,
                  game: result.after.game,
                  gameContext: result.after.gameContext,
                }),
              })
          ),
          Effect.map((result) => ({
            ok: true,
            action: input.action,
            autoplay: result.after.autoplay,
            game: result.after.game,
            gameContext: result.after.gameContext,
            result,
          }))
        );
    },
  };
}

function lifecycleDemand(args: StartSinglePlayerArgs) {
  const materialization = args.deployment.materialization;
  return Effect.gen(function* () {
    const mapScript = yield* Effect.fromNullable(materialization?.mapScript).pipe(
      Effect.mapError(() =>
        materializationFailed({
          message: "Run in Game map script is missing before lifecycle start",
          diagnostics: boundedDiagnostics({
            code: "run-in-game-map-script-missing",
            requestId: args.requestId,
            materialization,
          }),
        })
      )
    );
    const seed = yield* Effect.fromNullable(
      numericLaunchSeed(args.prepared.launchEnvelope.seed)
    ).pipe(
      Effect.mapError(() =>
        invalidRequest({
          message: "Run in Game lifecycle seed is invalid",
          diagnostics: boundedDiagnostics({
            code: "run-in-game-lifecycle-seed-invalid",
            requestId: args.requestId,
            seed: args.prepared.launchEnvelope.seed,
          }),
        })
      )
    );
    const setup = args.prepared.launchEnvelope.setupConfig;
    const playerCount = Option.match(
      Option.fromNullable(args.prepared.launchEnvelope.worldSettings.playerCount),
      { onNone: () => ({}), onSome: (value) => ({ playerCount: value }) }
    );
    const savedConfig = Option.match(Option.fromNullable(setup.savedConfig), {
      onNone: () => ({}),
      onSome: (value) => ({ savedConfig: value }),
    });
    return {
      mapScript,
      mapSize: args.prepared.launchEnvelope.worldSettings.mapSize,
      seed,
      ...playerCount,
      targetModId: args.deployment.runDeployment.deployedModId,
      ...savedConfig,
      gameOptions: setup.gameOptions,
      playerOptions: mergePlayerOptionsById(setup.playerOptions),
      activeGamePolicy: "exit-active-game",
    } satisfies Civ7LifecycleSinglePlayerStartInput;
  });
}

function mergePlayerOptionsById(
  playerOptions: RunInGamePreparedRequest["launchEnvelope"]["setupConfig"]["playerOptions"]
): Civ7LifecycleSinglePlayerStartInput["playerOptions"] {
  return playerOptions.reduce<Civ7LifecycleSinglePlayerStartInput["playerOptions"]>(
    (byPlayer, player) => {
      const playerId = String(player.playerId);
      return {
        ...byPlayer,
        [playerId]: { ...byPlayer[playerId], ...player.options },
      };
    },
    {}
  );
}

type LifecycleClient = ReturnType<typeof createCiv7ControlOrpcServerClient>;

async function callLifecycleStart(
  client: LifecycleClient,
  demand: Civ7LifecycleSinglePlayerStartInput,
  signal: AbortSignal
) {
  return safe(client.lifecycle.singlePlayer.start(demand, { signal }));
}

type LifecycleCallResult = Awaited<ReturnType<typeof callLifecycleStart>>;
type LifecycleCallSuccess = Extract<LifecycleCallResult, { isSuccess: true }>;
type LifecycleCallFailure = Extract<LifecycleCallResult, { isSuccess: false }>;
type LifecycleStartResult = LifecycleCallSuccess["data"];

/** Opens one abortable lifecycle call whose current mutation atom can be drained. */
function openLifecycleCall(client: LifecycleClient, demand: Civ7LifecycleSinglePlayerStartInput) {
  const controller = new AbortController();
  return {
    controller,
    pending: callLifecycleStart(client, demand, controller.signal),
  };
}

function lifecycleCallSucceeded(result: LifecycleCallResult): result is LifecycleCallSuccess {
  return result.isSuccess;
}

function lifecycleCallFailed(result: LifecycleCallResult): result is LifecycleCallFailure {
  return !result.isSuccess;
}

function settleLifecycleCall(result: LifecycleCallResult) {
  return Match.value(result).pipe(
    Match.when(lifecycleCallSucceeded, ({ data }) => Effect.succeed(data)),
    Match.when(lifecycleCallFailed, ({ error }) => Effect.fail(lifecycleFailure(error))),
    Match.exhaustive
  );
}

function verifyLifecycleCorrelation(result: LifecycleStartResult, requestId: string) {
  return Match.value(result.correlationId === requestId).pipe(
    Match.when(true, () => Effect.succeed(result)),
    Match.when(false, () =>
      Effect.fail(
        verificationFailed({
          message: "Civ7 lifecycle returned the wrong request correlation",
          reason: "start-game-failed",
          diagnostics: boundedDiagnostics({
            code: "civ7-lifecycle-correlation-mismatch",
            expectedCorrelationId: requestId,
            observedCorrelationId: result.correlationId,
            noRepeat: true,
          }),
          recoveryActions: ["retry-status", "copy-diagnostics"],
        })
      )
    ),
    Match.exhaustive
  );
}

type LifecycleError = NonNullable<Awaited<ReturnType<typeof callLifecycleStart>>["error"]>;
type DefinedLifecycleError = Extract<LifecycleError, { code: string }>;

function lifecycleErrorHasCode<Code extends DefinedLifecycleError["code"]>(code: Code) {
  return (error: DefinedLifecycleError): error is Extract<DefinedLifecycleError, { code: Code }> =>
    error.code === code;
}

function lifecycleFailure(err: LifecycleError): StudioRuntimeFailure {
  return Match.value(err).pipe(
    Match.when(isDefinedError, definedLifecycleFailure),
    Match.orElse(() => uncertainLifecycleFailure("unknown-lifecycle-failure", undefined))
  );
}

function definedLifecycleFailure(err: DefinedLifecycleError): StudioRuntimeFailure {
  return Match.value(err).pipe(
    Match.when(lifecycleErrorHasCode("LIFECYCLE_DEPENDENCY_UNAVAILABLE"), (error) =>
      dependencyUnavailable({
        message: "Civ7 lifecycle dependency is unavailable",
        dependency: "direct-control",
        directControlCode: error.code,
        ...Option.match(Option.fromNullable(error.data.detail), {
          onNone: () => ({}),
          onSome: (causeSummary) => ({ causeSummary }),
        }),
        diagnostics: lifecycleDiagnostics(error.code, error.data),
        recoveryActions: ["copy-diagnostics", "retry-status", "retry-run"],
      })
    ),
    Match.when(lifecycleErrorHasCode("LIFECYCLE_STATE_REFUSED"), (error) =>
      verificationFailed({
        message: "Civ7 is not in a state that admits a single-player start",
        reason: "start-game-failed",
        diagnostics: lifecycleDiagnostics(error.code, error.data),
        recoveryActions: ["retry-status", "retry-run", "copy-diagnostics"],
      })
    ),
    Match.when(lifecycleErrorHasCode("LIFECYCLE_MUTATION_UNCERTAIN"), (error) =>
      uncertainLifecycleFailure(error.code, lifecycleDiagnostics(error.code, error.data))
    ),
    Match.when(lifecycleErrorHasCode("LIFECYCLE_VERIFICATION_FAILED"), (error) =>
      verificationFailed({
        message: "Civ7 lifecycle start completed without sufficient verification",
        reason: "start-game-failed",
        diagnostics: lifecycleDiagnostics(error.code, error.data),
        recoveryActions: ["retry-status", "copy-diagnostics"],
      })
    ),
    Match.when(lifecycleErrorHasCode("CORRELATION_ID_INVALID"), (error) =>
      invalidRequest({
        message: "Run in Game lifecycle correlation is invalid",
        diagnostics: boundedDiagnostics({ code: error.code, reason: error.data.reason }),
      })
    ),
    Match.when(lifecycleErrorHasCode("CONTROLLER_CAPABILITY_UNAVAILABLE"), (error) =>
      dependencyUnavailable({
        message: "Civ7 lifecycle capability is unavailable",
        dependency: "direct-control",
        directControlCode: error.code,
        causeSummary: error.data.reason,
        diagnostics: boundedDiagnostics({
          code: error.code,
          procedureKey: error.data.procedureKey,
          reason: error.data.reason,
          ...Option.match(Option.fromNullable(error.data.correlationId), {
            onNone: () => ({}),
            onSome: (correlationId) => ({ correlationId }),
          }),
        }),
        recoveryActions: ["copy-diagnostics", "retry-status", "retry-run"],
      })
    ),
    Match.exhaustive
  );
}

function lifecycleDiagnostics(
  code: string,
  data: Readonly<{
    procedureKey: string;
    source: string;
    step?: string;
    detail?: string;
    correlationId?: string;
    noRepeat?: true;
  }>
): StudioBoundedDiagnostics {
  return boundedDiagnostics({
    code,
    procedureKey: data.procedureKey,
    source: data.source,
    step: data.step,
    detail: data.detail,
    correlationId: data.correlationId,
    noRepeat: data.noRepeat,
  });
}

function uncertainLifecycleFailure(
  code: string,
  diagnostics: StudioBoundedDiagnostics | undefined
): StudioRuntimeFailure {
  return verificationFailed({
    message: "Civ7 lifecycle mutation outcome is uncertain; do not repeat the run",
    reason: "timeout-uncertain",
    diagnostics: diagnostics ?? boundedDiagnostics({ code, noRepeat: true }),
    recoveryActions: ["retry-status", "copy-diagnostics"],
  });
}

function numericLaunchSeed(value: number | string): number | undefined {
  const seed = Match.value(value).pipe(
    Match.when(Predicate.isNumber, (number) => number),
    Match.orElse(Number)
  );
  return Match.value(Number.isInteger(seed) && seed >= -0x8000_0000 && seed <= 0x7fff_ffff).pipe(
    Match.when(true, () => seed),
    Match.orElse(() => undefined)
  );
}

function boundedDiagnostics(value: Record<string, unknown>): StudioBoundedDiagnostics {
  return EffectRecord.filterMap(value, (entry) =>
    Match.value(entry).pipe(
      Match.when(Predicate.isUndefined, () => Option.none()),
      Match.orElse((defined) => Option.some(boundedDiagnosticValue(defined)))
    )
  );
}

function boundedDiagnosticValue(value: unknown): StudioBoundedDiagnosticValue {
  return Match.value(value).pipe(
    Match.when(isBoundedDiagnosticPrimitive, (primitive) => primitive),
    Match.when(Array.isArray, (entries) => entries.map((entry) => diagnosticString(entry) ?? "")),
    Match.orElse((other) => diagnosticString(other) ?? "")
  );
}

function diagnosticString(value: unknown): string | undefined {
  return Match.value(value).pipe(
    Match.when(Predicate.isUndefined, () => undefined),
    Match.when(
      (candidate: unknown): candidate is Civ7TunerBackoffError =>
        candidate instanceof Civ7TunerBackoffError,
      ({ message }) => message
    ),
    Match.when(
      (candidate: unknown): candidate is Error =>
        candidate instanceof Error && candidate.message.length > 0,
      ({ message }) => message
    ),
    Match.orElse((other) => Inspectable.toStringUnknown(other))
  );
}

function isBoundedDiagnosticPrimitive(value: unknown): value is string | number | boolean | null {
  return (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  );
}
