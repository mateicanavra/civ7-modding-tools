import {
  type Civ7PlayerSetupOptions,
  type Civ7SavedGameConfigurationRef,
  type Civ7SetupOptionValue,
  DEFAULT_CIV7_TUNER_TIMEOUT_MS,
  getCiv7PlayableStatus,
  prepareCiv7SinglePlayerSetup,
  startPreparedCiv7SinglePlayerGame,
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
  type StudioRecoveryAction,
  type StudioRuntimeFailure,
} from "../errors/index.js";
import { setupFailureReasonFromDirectControlCode } from "../runInGameSetupFailureTaxonomy.js";
import {
  Civ7TunerBackoffError,
  Civ7TunerSession,
  type Civ7TunerSessionApi,
} from "../services/Civ7TunerSession.js";
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
        action: (options: { readonly session: Civ7TunerSessionApi["session"] }) => Promise<A>,
        toFailure: (err: unknown) => StudioRuntimeFailure
      ) => tuner.use((options) => action(options)).pipe(Effect.mapError((err) => toFailure(err)));

      const directControlUnavailable = (
        message: string,
        code: string,
        err: unknown,
        details: Record<string, unknown> = {}
      ) => {
        const directControlCode = directControlErrorCode(err);
        const setupFailureReason = setupFailureReasonFromDirectControlCode(directControlCode);
        return dependencyUnavailable({
          message,
          dependency: "direct-control",
          directControlCode,
          causeSummary: diagnosticString(err),
          diagnostics: boundedDiagnostics({
            code: setupFailureReason,
            priorCode: code,
            setupFailureReason,
            directControlCode,
            ...details,
            cause: diagnosticString(err),
            directControlDetails: directControlErrorDetails(err),
          }),
          recoveryActions: ["copy-diagnostics", "retry-status", "retry-run"],
        });
      };
      const setupPreparationFailure = (
        err: unknown,
        args: Readonly<{
          launchMapScript: string;
          materialization: unknown;
          materializationMode: string;
          targetModId: string;
        }>
      ): StudioRuntimeFailure => {
        const directControlCode = directControlErrorCode(err);
        const setupFailureReason = setupFailureReasonFromDirectControlCode(directControlCode);
        if (
          setupFailureReason !== "setup-map-row-not-visible" &&
          setupFailureReason !== "generated-map-mod-not-enabled"
        ) {
          return directControlUnavailable(
            "Civ7 setup preparation is unavailable",
            "direct-control-setup-preparation-unavailable",
            err,
            { materialization: args.materialization, mapScript: args.launchMapScript }
          );
        }
        const details = directControlErrorDetails(err);
        const activeReadback = activeTargetModSetReadback(readActiveTargetModSet(details));
        const targetModReconciliation = targetModReconciliationReadback(
          readTargetModReconciliation(details)
        );
        const rowVisibility = readRowVisibility(details);
        const visibleRows = rowVisibility?.final?.rows ?? [];
        const classification = classifyMapRowVisibilityFailure({
          launchMapScript: args.launchMapScript,
          visibleMapRows: visibleRows,
          materializationMode: args.materializationMode,
          targetModId: args.targetModId,
          activeTargetModSet: activeReadback,
          targetModReconciliation,
        });
        return proofFailed({
          message: classification.message,
          reason: "setup-row-unavailable",
          recoveryActions: setupRowRecoveryActions(classification.code),
          diagnostics: boundedDiagnostics({
            code: classification.code,
            setupFailureReason: classification.code,
            directControlCode,
            ...(classification.modNamespace ? { modNamespace: classification.modNamespace } : {}),
            targetModId: classification.targetModId,
            siblingMapRowCount: classification.siblingMapRowCount,
            visibleMapRowCount: classification.visibleMapRowCount,
            activeTargetModSet: classification.activeTargetModSet,
            targetModReconciliation: classification.targetModReconciliation,
            activeTargetModSetReadbackLimitation: activeTargetModSetReadbackLimitation(activeReadback),
            recoveryHint: classification.recoveryHint,
            reloadAttempted: rowVisibility?.refreshed ?? false,
            mapScript: args.launchMapScript,
            materialization: args.materialization,
            cause: diagnosticString(err),
            directControlDetails: details,
          }),
        });
      };

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
          const request = args.prepared.request;
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
          const mapSize = request.mapSize;
          const seed = request.seed;
          const launchSetupConfig = { ...request.setupConfig, mapScript: launchMapScript };
          const savedConfig = readSavedConfig(launchSetupConfig);
          if (!mapSize || seed === undefined) {
            return Effect.fail(
              invalidRequest({
                message: "Run in Game setup is missing map size or seed",
                diagnostics: boundedDiagnostics({
                  code: "run-in-game-setup-input-missing",
                  requestId: args.requestId,
                  materialization,
                  mapSize,
                  seed,
                }),
              })
            );
          }
          return runTuner(
            async (options) => {
              const prepared = await prepareCiv7SinglePlayerSetup(
                {
                  mapScript: launchMapScript,
                  mapSize,
                  seed,
                  gameSeed: seed,
                  ...(request.playerCount === undefined ? {} : { playerCount: request.playerCount }),
                  requiredActiveTargetModId: args.deployment.runDeployment.deployedModId,
                  ...(savedConfig === undefined ? {} : { savedConfig }),
                  options: readGameOptions(launchSetupConfig),
                  playerOptions: readPlayerOptions(launchSetupConfig),
                  fromRunningGame: "exit-to-shell",
                  requireShell: true,
                },
                { timeoutMs: DEFAULT_CIV7_TUNER_TIMEOUT_MS, ...options }
              );
              if (!prepared.targetModReconciliation) {
                throw new Error("Direct-control setup did not return target mod reconciliation");
              }
              return {
                kind: "run-in-game-prepared-setup",
                requestId: args.requestId,
                correlationDigest: args.prepared.correlationDigest,
                deploymentRequestId: args.deployment.runDeployment.requestId,
                deployedModId: args.deployment.runDeployment.deployedModId,
                targetModId: args.deployment.runDeployment.deployedModId,
                launchMapScript,
                seed: request.seed,
                mapSize,
                ...(request.playerCount === undefined ? {} : { playerCount: request.playerCount }),
                rowProof: prepared.rowVisibility.final,
                rowVisibility: prepared.rowVisibility,
                targetModReconciliation: prepared.targetModReconciliation,
                savedConfigLoad: prepared.savedConfigLoad,
                setupSnapshot: prepared.after.snapshot,
                softRefreshPerformed: prepared.rowVisibility.refreshed,
              };
            },
            (err) =>
              setupPreparationFailure(err, {
                launchMapScript,
                materialization,
                materializationMode: args.prepared.request.materializationMode,
                targetModId: args.deployment.runDeployment.deployedModId,
              })
          );
        },

        startGame: (args) => {
          const materialization = args.deployment.materialization;
          const launchMapScript = materialization?.mapScript;
          const request = args.prepared.request;
          const mapSize = request.mapSize;
          const seed = request.seed;
          const launchSetupConfig = { ...request.setupConfig, mapScript: launchMapScript };
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
          const setupValidation = validatePreparedSetupToken({
            requestId: args.requestId,
            prepared: args.prepared,
            deployment: args.deployment,
            setup: args.setup,
            launchMapScript,
            seed,
            mapSize,
            playerCount: request.playerCount,
          });
          if (!setupValidation.ok) {
            return Effect.fail(
              invalidRequest({
                message: setupValidation.message,
                diagnostics: boundedDiagnostics({
                  code: "run-in-game-prepared-setup-mismatch",
                  requestId: args.requestId,
                  expected: setupValidation.expected,
                  actual: setupValidation.actual,
                }),
              })
            );
          }
          return runTuner(
            (options) =>
              startPreparedCiv7SinglePlayerGame(
                {
                  expected: {
                    mapScript: launchMapScript,
                    mapSize,
                    seed,
                    gameSeed: seed,
                    requiredActiveTargetModId: args.deployment.runDeployment.deployedModId,
                    ...(request.playerCount === undefined
                      ? {}
                      : { playerCount: request.playerCount }),
                    ...(readSavedConfig(launchSetupConfig) === undefined
                      ? {}
                      : { savedConfig: readSavedConfig(launchSetupConfig) }),
                    options: readGameOptions(launchSetupConfig),
                    playerOptions: readPlayerOptions(launchSetupConfig),
                  },
                  waitForTuner: true,
                  waitTimeoutMs: SCRIPTING_LOG_WAIT_TIMEOUT_MS,
                  pollIntervalMs: 1_000,
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
          ).pipe(Effect.map((start) => ({ setup: args.setup, start })));
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

function setupRowRecoveryActions(code: string): readonly StudioRecoveryAction[] {
  if (code === "setup-map-row-not-visible") {
    return ["restart-civ-process-and-retry", "retry-run", "copy-diagnostics"];
  }
  return ["retry-run", "copy-diagnostics"];
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

function validatePreparedSetupToken(args: Readonly<{
  requestId: string;
  prepared: RunInGamePreparedRequest;
  deployment: RunInGameDeployment;
  setup: RunInGameSetupPrepared;
  launchMapScript: string;
  seed: number;
  mapSize: string;
  playerCount?: number;
}>):
  | Readonly<{ ok: true }>
  | Readonly<{
      ok: false;
      message: string;
      expected: Record<string, unknown>;
      actual: Record<string, unknown>;
    }> {
  const expected = {
    kind: "run-in-game-prepared-setup",
    requestId: args.requestId,
    correlationDigest: args.prepared.correlationDigest,
    deploymentRequestId: args.deployment.runDeployment.requestId,
    deployedModId: args.deployment.runDeployment.deployedModId,
    targetModId: args.deployment.runDeployment.deployedModId,
    launchMapScript: args.launchMapScript,
    seed: args.seed,
    mapSize: args.mapSize,
    ...(args.playerCount === undefined ? {} : { playerCount: args.playerCount }),
  };
  const actual = {
    kind: args.setup.kind,
    requestId: args.setup.requestId,
    correlationDigest: args.setup.correlationDigest,
    deploymentRequestId: args.setup.deploymentRequestId,
    deployedModId: args.setup.deployedModId,
    targetModId: args.setup.targetModId,
    launchMapScript: args.setup.launchMapScript,
    seed: args.setup.seed,
    mapSize: args.setup.mapSize,
    ...(args.setup.playerCount === undefined ? {} : { playerCount: args.setup.playerCount }),
  };
  const actualByKey: Record<string, unknown> = actual;
  for (const [key, value] of Object.entries(expected)) {
    if (actualByKey[key] !== value) {
      return {
        ok: false,
        message: `Run in Game prepared setup token does not match start request (${key})`,
        expected,
        actual,
      };
    }
  }
  if (!args.setup.targetModReconciliation.verified) {
    return {
      ok: false,
      message: "Run in Game prepared setup token has unverified target mod reconciliation",
      expected: { targetModVerified: true },
      actual: { targetModVerified: args.setup.targetModReconciliation.verified },
    };
  }
  if (!args.setup.rowVisibility.verified) {
    return {
      ok: false,
      message: "Run in Game prepared setup token has unverified row visibility",
      expected: { rowVisibilityVerified: true },
      actual: { rowVisibilityVerified: args.setup.rowVisibility.verified },
    };
  }
  return { ok: true };
}

function directControlErrorCode(err: unknown): string | undefined {
  if (err instanceof Civ7TunerBackoffError) return "civ7-tuner-backoff";
  return err != null &&
    typeof err === "object" &&
    "code" in err &&
    typeof (err as { code?: unknown }).code === "string"
    ? (err as { code: string }).code
    : undefined;
}

function directControlErrorDetails(err: unknown): unknown {
  return err != null && typeof err === "object" && "details" in err
    ? (err as { details?: unknown }).details
    : undefined;
}

function readActiveTargetModSet(details: unknown): unknown {
  if (!details || typeof details !== "object" || Array.isArray(details)) return details;
  return (details as { activeTargetModSet?: unknown }).activeTargetModSet ?? details;
}

function readTargetModReconciliation(details: unknown): unknown {
  if (!details || typeof details !== "object" || Array.isArray(details)) return undefined;
  return (details as { targetModReconciliation?: unknown }).targetModReconciliation;
}

function readRowVisibility(details: unknown):
  | {
      final?: { rows?: ReadonlyArray<{ readonly file: string }> };
      refreshed?: boolean;
    }
  | undefined {
  if (!details || typeof details !== "object" || Array.isArray(details)) return undefined;
  const candidate =
    (details as { rowVisibility?: unknown }).rowVisibility ??
    (details as { final?: unknown; refreshed?: unknown });
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) return undefined;
  const final = (candidate as { final?: unknown }).final;
  const refreshed = (candidate as { refreshed?: unknown }).refreshed;
  const filteredRows =
    final && typeof final === "object" && !Array.isArray(final)
      ? (final as { rows?: unknown }).rows
      : undefined;
  const allRows = (details as { allRows?: { rows?: unknown } }).allRows?.rows;
  const rows = normalizeMapRowVisibilityRows(Array.isArray(allRows) ? allRows : filteredRows);
  return {
    ...(rows === undefined ? {} : { final: { rows } }),
    ...(typeof refreshed === "boolean" ? { refreshed } : {}),
  };
}

function normalizeMapRowVisibilityRows(rows: unknown): ReadonlyArray<{ readonly file: string }> | undefined {
  if (!Array.isArray(rows)) return undefined;
  const normalized = rows.flatMap((row) => {
    if (!row || typeof row !== "object" || Array.isArray(row)) return [];
    const record = row as Record<string, unknown>;
    const file = record.file ?? record.File ?? record.value ?? record.Value ?? record.mapScript;
    return typeof file === "string" ? [{ file }] : [];
  });
  return normalized;
}

function targetModReconciliationReadback(value: unknown):
  | {
      targetModId?: string;
      verified?: boolean;
      result?: {
        targetActive?: boolean;
        enabledModsMetaContainsTarget?: boolean;
      };
    }
  | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const record = value as Record<string, unknown>;
  const result = record.result;
  const normalizedResult =
    result && typeof result === "object" && !Array.isArray(result)
      ? {
          ...(typeof (result as { targetActive?: unknown }).targetActive === "boolean"
            ? { targetActive: (result as { targetActive: boolean }).targetActive }
            : {}),
          ...(typeof (result as { enabledModsMetaContainsTarget?: unknown })
            .enabledModsMetaContainsTarget === "boolean"
            ? {
                enabledModsMetaContainsTarget: (result as {
                  enabledModsMetaContainsTarget: boolean;
                }).enabledModsMetaContainsTarget,
              }
            : {}),
        }
      : undefined;
  const out = {
    ...(typeof record.targetModId === "string" ? { targetModId: record.targetModId } : {}),
    ...(typeof record.verified === "boolean" ? { verified: record.verified } : {}),
    ...(normalizedResult && Object.keys(normalizedResult).length > 0
      ? { result: normalizedResult }
      : {}),
  };
  return Object.keys(out).length === 0 ? undefined : out;
}

function activeTargetModSetReadbackLimitation(
  readback:
    | {
      readonly available: boolean;
      readonly identityAvailable: boolean;
      readonly truncated?: boolean;
      readonly readbacks?: ReadonlyArray<Readonly<{ truncated?: boolean }>>;
    }
    | undefined
): string | undefined {
  if (!readback) return undefined;
  if (!readback.available) {
    return "active target mod-set readback did not expose a supported active-mod API";
  }
  if (!readback.identityAvailable) {
    return "active target mod-set readback did not expose comparable mod identity";
  }
  if (readback.truncated === true) return "active target mod-set readback was truncated";
  if (readback.readbacks?.some((entry) => entry.truncated === true)) {
    return "active target mod-set readback was truncated";
  }
  return undefined;
}

function activeTargetModSetReadback(value: unknown):
  | {
      available: boolean;
      identityAvailable: boolean;
      mods: ReadonlyArray<{
        id?: string;
        packageId?: string;
        name?: string;
        title?: string;
        handle?: string | number;
        enabled?: boolean;
        source?: string;
      }>;
      truncated: boolean;
      readbacks?: ReadonlyArray<
        Readonly<{
          source?: string;
          available?: boolean;
          identityReadable?: boolean;
          count?: number;
          identityCount?: number;
          truncated?: boolean;
          error?: string;
        }>
      >;
    }
  | undefined {
  if (
    value == null ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    !("available" in value) ||
    !("mods" in value) ||
    typeof (value as { available?: unknown }).available !== "boolean" ||
    typeof (value as { identityAvailable?: unknown }).identityAvailable !== "boolean" ||
    typeof (value as { truncated?: unknown }).truncated !== "boolean" ||
    !Array.isArray((value as { mods?: unknown }).mods)
  ) {
    return undefined;
  }
  const candidate = value as {
    available: boolean;
    identityAvailable: boolean;
    mods: unknown[];
    truncated: boolean;
    readbacks?: unknown;
  };
  const mods = candidate.mods.flatMap((entry) => {
    if (entry == null || typeof entry !== "object" || Array.isArray(entry)) return [];
    const record = entry as Record<string, unknown>;
    const mod = {
      ...(typeof record.id === "string" ? { id: record.id } : {}),
      ...(typeof record.packageId === "string" ? { packageId: record.packageId } : {}),
      ...(typeof record.name === "string" ? { name: record.name } : {}),
      ...(typeof record.title === "string" ? { title: record.title } : {}),
      ...(typeof record.handle === "string" || typeof record.handle === "number"
        ? { handle: record.handle }
        : {}),
      ...(typeof record.enabled === "boolean" ? { enabled: record.enabled } : {}),
      ...(typeof record.source === "string" ? { source: record.source } : {}),
    };
    return Object.keys(mod).length === 0 ? [] : [mod];
  });
  const readbacks = Array.isArray(candidate.readbacks)
    ? candidate.readbacks.flatMap((entry) => {
        if (entry == null || typeof entry !== "object" || Array.isArray(entry)) return [];
        const record = entry as Record<string, unknown>;
        const readback = {
          ...(typeof record.source === "string" ? { source: record.source } : {}),
          ...(typeof record.available === "boolean" ? { available: record.available } : {}),
          ...(typeof record.identityReadable === "boolean"
            ? { identityReadable: record.identityReadable }
            : {}),
          ...(typeof record.count === "number" ? { count: record.count } : {}),
          ...(typeof record.identityCount === "number" ? { identityCount: record.identityCount } : {}),
          ...(typeof record.truncated === "boolean" ? { truncated: record.truncated } : {}),
          ...(typeof record.error === "string" ? { error: record.error } : {}),
        };
        return Object.keys(readback).length === 0 ? [] : [readback];
      })
    : undefined;
  return {
    available: candidate.available,
    identityAvailable: candidate.identityAvailable,
    mods,
    truncated: candidate.truncated,
    ...(readbacks === undefined ? {} : { readbacks }),
  };
}
