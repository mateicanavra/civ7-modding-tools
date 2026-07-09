import {
  type Civ7DirectControlSession,
  type Civ7PlayerSetupOptions,
  type Civ7SavedGameConfigurationRef,
  type Civ7SetupOptionValue,
  DEFAULT_CIV7_TUNER_TIMEOUT_MS,
  ensureCiv7SetupMapRowVisible,
  getCiv7PlayableStatus,
  getCiv7SetupMapRows,
  runCiv7SinglePlayerFromSetup,
  startCiv7Autoplay,
  stopCiv7Autoplay,
} from "@civ7/direct-control";
import { Context, Effect, Layer } from "effect";

import type { StudioInputs, StudioOutputs } from "../context.js";
import {
  autoplayStartStopFailed,
  autoplayVerificationFailed,
  dependencyUnavailable,
  invalidRequest,
  materializationFailed,
  proofFailed,
  type StudioBoundedDiagnostics,
  type StudioBoundedDiagnosticValue,
  type StudioRuntimeFailure,
} from "../errors/index.js";
import { Civ7TunerSession } from "../services/Civ7TunerSession.js";
import { classifyMapRowVisibilityFailure } from "./mapModVisibility.js";
import type {
  RunInGameDeployment,
  RunInGamePreparedRequest,
  RunInGameSetupPrepared,
  RunInGameStarted,
} from "./workflowTypes.js";

const SCRIPTING_LOG_WAIT_TIMEOUT_MS = 90_000;

export interface Civ7WorkflowControlApi {
  readonly checkPlayable: (
    args: Readonly<{
      requestId: string;
      prepared: RunInGamePreparedRequest;
      deployment: RunInGameDeployment;
    }>
  ) => Effect.Effect<void, StudioRuntimeFailure>;
  readonly prepareSetup: (
    args: Readonly<{
      requestId: string;
      prepared: RunInGamePreparedRequest;
      deployment: RunInGameDeployment;
    }>
  ) => Effect.Effect<RunInGameSetupPrepared, StudioRuntimeFailure>;
  readonly startGame: (
    args: Readonly<{
      requestId: string;
      prepared: RunInGamePreparedRequest;
      deployment: RunInGameDeployment;
      setup: RunInGameSetupPrepared;
    }>
  ) => Effect.Effect<RunInGameStarted, StudioRuntimeFailure>;
  readonly runAutoplay: (
    input: StudioInputs["civ7"]["autoplay"]
  ) => Effect.Effect<StudioOutputs["civ7"]["autoplay"], StudioRuntimeFailure>;
}

export class Civ7WorkflowControl extends Context.Tag("@civ7/studio-server/Civ7WorkflowControl")<
  Civ7WorkflowControl,
  Civ7WorkflowControlApi
>() {}

export const Civ7WorkflowControlLive: Layer.Layer<Civ7WorkflowControl, never, Civ7TunerSession> =
  Layer.effect(
    Civ7WorkflowControl,
    Effect.gen(function* () {
      const tuner = yield* Civ7TunerSession;
      const runTuner = <A>(
        action: (options: { readonly session: Civ7DirectControlSession }) => Promise<A>,
        toFailure: (err: unknown) => StudioRuntimeFailure
      ) => tuner.use((options) => action(options)).pipe(Effect.mapError((err) => toFailure(err)));

      const directControlUnavailable = (
        message: string,
        code: string,
        err: unknown,
        details: Record<string, unknown> = {}
      ) =>
        dependencyUnavailable({
          message,
          dependency: "direct-control",
          causeSummary: diagnosticString(err),
          diagnostics: boundedDiagnostics({
            code,
            ...details,
            cause: diagnosticString(err),
          }),
          recoveryActions: ["copy-diagnostics", "retry-status", "retry-run"],
        });

      return {
        checkPlayable: (args) =>
          runTuner(
            (options) =>
              getCiv7PlayableStatus({
                timeoutMs: DEFAULT_CIV7_TUNER_TIMEOUT_MS,
                ...options,
              }),
            (err) =>
              directControlUnavailable(
                "Civ7 direct-control status is unavailable",
                "direct-control-status-unavailable",
                err,
                { materialization: args.deployment.materialization }
              )
          ).pipe(Effect.asVoid),

        prepareSetup: (args) => {
          const materialization = args.deployment.materialization;
          const launchMapScript = materialization?.mapScript;
          if (!launchMapScript) {
            return Effect.fail(
              materializationFailed({
                message: "Run in Game map script is missing before setup preparation",
                diagnostics: boundedDiagnostics({
                  code: "run-in-game-map-script-missing",
                  requestId: args.requestId,
                  materialization,
                }),
              })
            );
          }
          return runTuner(
            (options) =>
              ensureCiv7SetupMapRowVisible(
                {
                  file: launchMapScript,
                  limit: 20,
                  reloadIfMissing:
                    args.prepared.request.materializationMode === "disposable"
                      ? "exit-to-shell"
                      : "none",
                  waitTimeoutMs: SCRIPTING_LOG_WAIT_TIMEOUT_MS,
                  pollIntervalMs: 1_000,
                },
                { timeoutMs: DEFAULT_CIV7_TUNER_TIMEOUT_MS, ...options }
              ),
            (err) =>
              directControlUnavailable(
                "Civ7 setup row visibility check is unavailable",
                "direct-control-setup-row-unavailable",
                err,
                { materialization }
              )
          ).pipe(
            Effect.flatMap((rowVisibility) => {
              const rowProof = rowVisibility.final;
              if (rowProof.rows.length === 0) {
                const reloadBoundary =
                  args.prepared.request.materializationMode === "disposable"
                    ? "process-restart-required"
                    : "setup-row-missing";
                // The map is materialized + deployed + registered (verified above)
                // yet Civ7 setup cannot see it. Read the FULL setup map list to tell
                // the two real causes apart: a disabled/unloaded map mod (NO sibling
                // maps from the mod visible) vs. a freshly-deployed disposable row
                // that has not been enumerated yet (siblings visible). This turns the
                // opaque `setup-map-row-not-visible` into the actionable, named
                // `map-mod-not-loaded` known error when the mod is disabled.
                const failFromVisibleRows = (
                  visibleMapRows: ReadonlyArray<{ readonly file: string }>
                ) => {
                  const classification = classifyMapRowVisibilityFailure({
                    launchMapScript,
                    visibleMapRows,
                    materializationMode: args.prepared.request.materializationMode,
                  });
                  return proofFailed({
                    message: classification.message,
                    reason: "setup-row-unavailable",
                    diagnostics: boundedDiagnostics({
                      code: classification.code,
                      ...(classification.modNamespace
                        ? { modNamespace: classification.modNamespace }
                        : {}),
                      siblingMapRowCount: classification.siblingMapRowCount,
                      visibleMapRowCount: classification.visibleMapRowCount,
                      recoveryHint: classification.recoveryHint,
                      reloadRequired: true,
                      reloadBoundary,
                      reloadAttempted: rowVisibility.refreshed,
                      mapScript: launchMapScript,
                      materialization,
                    }),
                  });
                };
                return runTuner(
                  (options) =>
                    getCiv7SetupMapRows(
                      {},
                      { timeoutMs: DEFAULT_CIV7_TUNER_TIMEOUT_MS, ...options }
                    ),
                  (err) =>
                    directControlUnavailable(
                      "Civ7 setup map list is unavailable",
                      "direct-control-setup-rows-unavailable",
                      err,
                      { materialization }
                    )
                ).pipe(
                  Effect.matchEffect({
                    // If the full-list read fails we do NOT guess "mod disabled":
                    // classify from the (empty) rows we already have, which the
                    // false-positive guard reports as `setup-map-row-not-visible`.
                    onFailure: () => Effect.fail(failFromVisibleRows(rowProof.rows)),
                    onSuccess: (allRows) => Effect.fail(failFromVisibleRows(allRows.rows)),
                  })
                );
              }
              return Effect.succeed({
                rowProof,
                rowVisibility,
                reloadRequired: rowVisibility.refreshed,
              });
            })
          );
        },

        startGame: (args) => {
          const materialization = args.deployment.materialization;
          const launchMapScript = materialization?.mapScript;
          const request = args.prepared.request;
          const mapSize = request.mapSize;
          const seed = request.seed;
          if (!launchMapScript || !mapSize || seed === undefined) {
            return Effect.fail(
              invalidRequest({
                message: "Run in Game start is missing map script, map size, or seed",
                diagnostics: boundedDiagnostics({
                  code: "run-in-game-start-input-missing",
                  requestId: args.requestId,
                  materialization,
                  mapSize,
                  seed,
                }),
              })
            );
          }
          return runTuner(
            (options) =>
              runCiv7SinglePlayerFromSetup(
                {
                  mapScript: launchMapScript,
                  mapSize,
                  seed,
                  gameSeed: seed,
                  ...(request.playerCount === undefined
                    ? {}
                    : { playerCount: request.playerCount }),
                  ...(readSavedConfig(request.setupConfig) === undefined
                    ? {}
                    : { savedConfig: readSavedConfig(request.setupConfig) }),
                  options: readGameOptions(request.setupConfig),
                  playerOptions: readPlayerOptions(request.setupConfig),
                  fromRunningGame: "exit-to-shell",
                  waitForTuner: true,
                  waitTimeoutMs: SCRIPTING_LOG_WAIT_TIMEOUT_MS,
                },
                { timeoutMs: DEFAULT_CIV7_TUNER_TIMEOUT_MS, ...options }
              ),
            (err) =>
              directControlUnavailable(
                "Civ7 direct-control start is unavailable",
                "direct-control-start-unavailable",
                err,
                { materialization }
              )
          ).pipe(Effect.map((start) => ({ start })));
        },

        runAutoplay: (input) => {
          const opts = {
            timeoutMs: DEFAULT_CIV7_TUNER_TIMEOUT_MS,
            waitTimeoutMs: SCRIPTING_LOG_WAIT_TIMEOUT_MS,
            pollIntervalMs: 1_000,
          };
          return runTuner(
            (options) =>
              input.action === "start"
                ? startCiv7Autoplay({ ...opts, ...options })
                : stopCiv7Autoplay({ ...opts, ...options }),
            (err) =>
              autoplayStartStopFailed({
                message: `Civ7 autoplay ${input.action} failed`,
                reason: input.action === "start" ? "start-failed" : "stop-failed",
                diagnostics: boundedDiagnostics({
                  code: `civ7-autoplay-${input.action}-failed`,
                  action: input.action,
                  cause: diagnosticString(err),
                }),
              })
          ).pipe(
            Effect.flatMap((result) => {
              if (result.verified) {
                return Effect.succeed({
                  ok: true,
                  action: input.action,
                  autoplay: result.after.autoplay,
                  game: result.after.game,
                  gameContext: result.after.gameContext,
                  result,
                });
              }
              return Effect.fail(
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
              );
            })
          );
        },
      } satisfies Civ7WorkflowControlApi;
    })
  );

function readSetupConfigValue(value: unknown, key: string): unknown {
  if (!value || typeof value !== "object") return undefined;
  return (value as Record<string, unknown>)[key];
}

function readSavedConfig(value: unknown): Civ7SavedGameConfigurationRef | undefined {
  const savedConfig = readSetupConfigValue(value, "savedConfig");
  if (!savedConfig || typeof savedConfig !== "object") return undefined;
  const record = savedConfig as Record<string, unknown>;
  if (
    typeof record.id !== "string" ||
    typeof record.displayName !== "string" ||
    typeof record.fileName !== "string" ||
    typeof record.path !== "string"
  ) {
    return undefined;
  }
  return {
    id: record.id,
    displayName: record.displayName,
    fileName: record.fileName,
    path: record.path,
  };
}

function readGameOptions(
  value: unknown
): Readonly<Record<string, Civ7SetupOptionValue>> | undefined {
  const gameOptions = readSetupConfigValue(value, "gameOptions");
  return gameOptions && typeof gameOptions === "object"
    ? (gameOptions as Readonly<Record<string, Civ7SetupOptionValue>>)
    : undefined;
}

function readPlayerOptions(value: unknown): ReadonlyArray<Civ7PlayerSetupOptions> | undefined {
  const playerOptions = readSetupConfigValue(value, "playerOptions");
  return Array.isArray(playerOptions)
    ? (playerOptions as ReadonlyArray<Civ7PlayerSetupOptions>)
    : undefined;
}

function boundedDiagnostics(value: Record<string, unknown>): StudioBoundedDiagnostics {
  const out: Record<string, StudioBoundedDiagnosticValue> = {};
  for (const [key, entry] of Object.entries(value)) {
    out[key] = boundedDiagnosticValue(entry);
  }
  return out;
}

function boundedDiagnosticValue(value: unknown): StudioBoundedDiagnosticValue {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((entry) => diagnosticString(entry) ?? "");
  }
  return diagnosticString(value) ?? "";
}

function diagnosticString(value: unknown): string | undefined {
  if (value === undefined) return undefined;
  if (value instanceof Error && value.message) {
    const cause = errorCause(value);
    const causeMessage = cause === undefined ? undefined : diagnosticString(cause);
    if (!causeMessage) return value.message;
    return `${value.message}: ${causeMessage}`;
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function errorCause(value: Error): unknown {
  return (value as Error & { cause?: unknown }).cause;
}
