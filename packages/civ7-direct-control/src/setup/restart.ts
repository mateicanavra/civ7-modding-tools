import { Civ7DirectControlError } from "../direct-control-error.js";
import {
  appUiSnapshotFromCommandResult,
  buildAppUiSnapshotCommand,
  type Civ7AppUiSnapshot,
  type Civ7AppUiSnapshotResult,
} from "../runtime/app-ui-snapshot.js";
import { probeValue } from "../runtime/probe.js";
import type { Civ7TunerHealthResult } from "../runtime/tuner-health.js";
import { waitForCiv7TunerReadyWithSession } from "../runtime/tuner-health.js";
import {
  jsonPayloadFromCommandResult,
  throwUnexpectedCommandPayloadStatus,
} from "../session/command-result.js";
import { executeCiv7AppUiCommand, executeCiv7Command } from "../session/execute.js";
import { executeSessionCommandWithReconnect } from "../session/reconnect.js";
import type { Civ7DirectControlSession } from "../session/session.js";
import { withCiv7DirectControlSession } from "../session/session.js";
import type {
  Civ7CommandResult,
  Civ7DirectControlOptions,
  Civ7TunerStateSelection,
} from "../session/types.js";
import {
  CIV7_BEGIN_GAME_COMMAND,
  CIV7_RESTART_COMMAND,
  CIV7_UI_LOADING_STATES,
} from "./constants.js";

export type Civ7RestartAndBeginResult = Readonly<{
  restart: Civ7CommandResult;
  begin?: Civ7CommandResult;
  finalAppUi: Civ7AppUiSnapshotResult;
  tunerHealth?: Civ7TunerHealthResult;
  observations: ReadonlyArray<Civ7AppUiSnapshot>;
}>;

export type Civ7BeginGameResult =
  | Readonly<{
      command: Civ7CommandResult;
      accepted: true;
      loadingState: number;
    }>
  | Readonly<{
      command: Civ7CommandResult;
      accepted: false;
      loadingState?: number;
      reason: "loading-state" | "notify-unavailable";
    }>;

type Civ7BeginGamePayload =
  | Readonly<{ status: "performed"; loadingState: number }>
  | Readonly<{
      status: "refused";
      loadingState?: number;
      reason: "loading-state" | "notify-unavailable";
    }>;

type RestartBeginDependencies = Readonly<{
  appUiState: Civ7TunerStateSelection;
  beginGameCommand: string;
  executeAppUiCommand: (
    options: Civ7DirectControlOptions & { command: string }
  ) => Promise<Civ7CommandResult>;
  executeCommand: (
    options: Civ7DirectControlOptions & {
      command: string;
      state?: Civ7TunerStateSelection;
    }
  ) => Promise<Civ7CommandResult>;
  executeSessionCommandWithReconnect: (
    session: Civ7DirectControlSession,
    options: Readonly<{
      command: string;
      state?: Civ7TunerStateSelection;
      timeoutMs?: number;
    }>,
    attempts?: number
  ) => Promise<Civ7CommandResult>;
  restartCommand: string;
  uiLoadingStates: Readonly<{
    WaitingForUIReady: number;
    WaitingToStart: number;
    GameStarted: number;
  }>;
  waitForTunerReadyWithSession: (
    session: Civ7DirectControlSession,
    options: {
      timeoutMs?: number;
      waitTimeoutMs?: number;
      pollIntervalMs?: number;
    }
  ) => Promise<Civ7TunerHealthResult & { ready: true }>;
  withSession: <T>(
    options: Civ7DirectControlOptions,
    run: (session: Civ7DirectControlSession) => Promise<T>
  ) => Promise<T>;
}>;

export async function beginCiv7Game(
  options: Civ7DirectControlOptions = {},
  dependencies: Pick<
    RestartBeginDependencies,
    "beginGameCommand" | "executeAppUiCommand" | "uiLoadingStates"
  > = defaultRestartBeginDependencies
): Promise<Civ7BeginGameResult> {
  const command = await dependencies.executeAppUiCommand({
    ...options,
    command: buildBeginGameCommand(dependencies),
  });
  return beginGameResultFromCommand(command);
}

export async function restartCiv7Game(
  options: Civ7DirectControlOptions & {
    state?: Civ7TunerStateSelection;
  } = {},
  dependencies: Pick<
    RestartBeginDependencies,
    "executeCommand" | "restartCommand"
  > = defaultRestartBeginDependencies
): Promise<Civ7CommandResult> {
  const result = await dependencies.executeCommand({
    ...options,
    state: options.state ?? { role: "app-ui" },
    command: dependencies.restartCommand,
  });
  assertRestartConfirmed(result);
  return result;
}

/**
 * @deprecated Multi-step lifecycle orchestration belongs in `@civ7/control-orpc`; this is a
 * compatibility helper for callers awaiting migration.
 */
export async function restartCiv7GameAndBegin(
  options: Civ7DirectControlOptions & {
    waitForTuner?: boolean;
    waitTimeoutMs?: number;
    pollIntervalMs?: number;
  } = {},
  dependencies: RestartBeginDependencies = defaultRestartBeginDependencies
): Promise<Civ7RestartAndBeginResult> {
  const waitTimeoutMs = options.waitTimeoutMs ?? options.timeoutMs ?? 120_000;
  const pollIntervalMs = options.pollIntervalMs ?? 1_000;
  const observations: Civ7AppUiSnapshot[] = [];
  return await dependencies.withSession(options, async (session) => {
    const restart = await dependencies.executeSessionCommandWithReconnect(
      session,
      {
        state: dependencies.appUiState,
        command: dependencies.restartCommand,
        timeoutMs: options.timeoutMs,
      },
      1
    );
    assertRestartConfirmed(restart);

    let begin: Civ7CommandResult | undefined;
    let beginAttempted = false;
    let beginError: string | undefined;
    let finalAppUi: Civ7AppUiSnapshotResult | undefined;
    const startedAt = Date.now();
    while (Date.now() - startedAt <= waitTimeoutMs) {
      try {
        const snapshotResult = appUiSnapshotFromCommandResult(
          await dependencies.executeSessionCommandWithReconnect(session, {
            state: dependencies.appUiState,
            command: buildAppUiSnapshotCommand(),
            timeoutMs: options.timeoutMs,
          })
        );
        observations.push(snapshotResult.snapshot);
        const loadingState = probeValue(snapshotResult.snapshot.ui.loadingState);
        if (
          !beginAttempted &&
          isCiv7BeginReadyLoadingState(loadingState, dependencies.uiLoadingStates)
        ) {
          beginAttempted = true;
          try {
            begin = await dependencies.executeSessionCommandWithReconnect(
              session,
              {
                state: dependencies.appUiState,
                command: buildBeginGameCommand(dependencies),
                timeoutMs: options.timeoutMs,
              },
              1
            );
            const beginResult = beginGameResultFromCommand(begin);
            if (!beginResult.accepted) {
              throw new Civ7DirectControlError(
                "setup-phase-refused",
                `Civ7 Begin refused: ${beginResult.reason}`,
                { details: beginResult }
              );
            }
          } catch (err) {
            beginError = errorMessage(err);
            throw err;
          }
        }
        if (
          loadingState === dependencies.uiLoadingStates.GameStarted &&
          probeValue(snapshotResult.snapshot.ui.inGame) === true
        ) {
          finalAppUi = snapshotResult;
          break;
        }
      } catch (err) {
        if (beginError) throw err;
        await session.close();
      }
      await sleep(pollIntervalMs);
    }

    if (!finalAppUi) {
      throw new Civ7DirectControlError(
        "connection-timeout",
        `Timed out waiting for Civ7 App UI to reach GameStarted after ${waitTimeoutMs}ms`,
        { details: { observations, beginAttempted, beginError } }
      );
    }

    const tunerHealth = options.waitForTuner
      ? await dependencies.waitForTunerReadyWithSession(session, {
          timeoutMs: options.timeoutMs,
          waitTimeoutMs,
          pollIntervalMs,
        })
      : undefined;

    return {
      restart,
      begin,
      finalAppUi,
      tunerHealth,
      observations,
    };
  });
}

export function buildBeginGameCommand(
  dependencies: Pick<RestartBeginDependencies, "beginGameCommand" | "uiLoadingStates">
): string {
  return `(() => {
    const loadingState = typeof UI !== "undefined" && UI && typeof UI.getGameLoadingState === "function"
      ? UI.getGameLoadingState()
      : undefined;
    if (typeof UI === "undefined" || !UI || typeof UI.notifyUIReady !== "function") {
      return JSON.stringify({ status: "refused", loadingState, reason: "notify-unavailable" });
    }
    if (loadingState !== ${dependencies.uiLoadingStates.WaitingForUIReady} && loadingState !== ${dependencies.uiLoadingStates.WaitingToStart}) {
      return JSON.stringify({ status: "refused", loadingState, reason: "loading-state" });
    }
    ${dependencies.beginGameCommand};
    return JSON.stringify({ status: "performed", loadingState });
  })()`;
}

export function beginGameResultFromCommand(command: Civ7CommandResult): Civ7BeginGameResult {
  const payload = jsonPayloadFromCommandResult<Civ7BeginGamePayload>(command, "Civ7 Begin");
  const status = payload.status;
  switch (status) {
    case "performed":
      return { command, accepted: true, loadingState: payload.loadingState };
    case "refused":
      return {
        command,
        accepted: false,
        ...(payload.loadingState === undefined ? {} : { loadingState: payload.loadingState }),
        reason: payload.reason,
      };
    default:
      return throwUnexpectedCommandPayloadStatus(command, "Civ7 Begin", status);
  }
}

function assertRestartConfirmed(result: Civ7CommandResult): void {
  if (result.output[0] !== "true") {
    throw new Civ7DirectControlError(
      "command-failed",
      `Civ7 restart returned: ${result.output.join("\n") || "<empty>"}`,
      { details: result }
    );
  }
}

function isCiv7BeginReadyLoadingState(
  state: number | undefined,
  loadingStates: Pick<
    RestartBeginDependencies["uiLoadingStates"],
    "WaitingForUIReady" | "WaitingToStart"
  >
): boolean {
  return state === loadingStates.WaitingForUIReady || state === loadingStates.WaitingToStart;
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const defaultRestartBeginDependencies: RestartBeginDependencies = {
  appUiState: { role: "app-ui" },
  beginGameCommand: CIV7_BEGIN_GAME_COMMAND,
  executeAppUiCommand: executeCiv7AppUiCommand,
  executeCommand: executeCiv7Command,
  executeSessionCommandWithReconnect,
  restartCommand: CIV7_RESTART_COMMAND,
  uiLoadingStates: CIV7_UI_LOADING_STATES,
  waitForTunerReadyWithSession: async (session, options) =>
    await waitForCiv7TunerReadyWithSession(session, options, {
      executeSessionCommandWithReconnect,
    }),
  withSession: withCiv7DirectControlSession,
};
