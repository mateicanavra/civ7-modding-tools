import { Civ7DirectControlError } from "../direct-control-error.js";
import {
  appUiSnapshotFromCommandResult,
  buildAppUiSnapshotCommand,
  type Civ7AppUiSnapshot,
  type Civ7AppUiSnapshotResult,
} from "../runtime/app-ui-snapshot.js";
import type { Civ7RuntimeProbe } from "../runtime/probe.js";
import type { Civ7TunerHealthResult } from "../runtime/tuner-health.js";
import type { Civ7DirectControlSession } from "../session/session.js";
import type {
  Civ7CommandResult,
  Civ7DirectControlOptions,
  Civ7TunerStateSelection,
} from "../session/types.js";

export type Civ7RestartAndBeginResult = Readonly<{
  restart: Civ7CommandResult;
  begin?: Civ7CommandResult;
  finalAppUi: Civ7AppUiSnapshotResult;
  tunerHealth?: Civ7TunerHealthResult;
  observations: ReadonlyArray<Civ7AppUiSnapshot>;
}>;

type RestartBeginDependencies = Readonly<{
  appUiState: Civ7TunerStateSelection;
  beginGameCommand: string;
  executeAppUiCommand: (options: Civ7DirectControlOptions & { command: string }) => Promise<Civ7CommandResult>;
  executeCommand: (
    options: Civ7DirectControlOptions & {
      command: string;
      state?: Civ7TunerStateSelection;
    },
  ) => Promise<Civ7CommandResult>;
  executeSessionCommandWithReconnect: (
    session: Civ7DirectControlSession,
    options: Readonly<{
      command: string;
      state?: Civ7TunerStateSelection;
      timeoutMs?: number;
    }>,
    attempts?: number,
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
    },
  ) => Promise<Civ7TunerHealthResult & { ready: true }>;
  withSession: <T>(
    options: Civ7DirectControlOptions,
    run: (session: Civ7DirectControlSession) => Promise<T>,
  ) => Promise<T>;
}>;

export async function beginCiv7Game(
  options: Civ7DirectControlOptions = {},
  dependencies: Pick<RestartBeginDependencies, "beginGameCommand" | "executeAppUiCommand">,
): Promise<Civ7CommandResult> {
  return await dependencies.executeAppUiCommand({
    ...options,
    command: dependencies.beginGameCommand,
  });
}

export async function restartCiv7Game(
  options: Civ7DirectControlOptions & {
    state?: Civ7TunerStateSelection;
  } = {},
  dependencies: Pick<RestartBeginDependencies, "executeCommand" | "restartCommand">,
): Promise<Civ7CommandResult> {
  const result = await dependencies.executeCommand({
    ...options,
    state: options.state ?? { role: "app-ui" },
    command: dependencies.restartCommand,
  });
  assertRestartConfirmed(result);
  return result;
}

export async function restartCiv7GameAndBegin(
  options: Civ7DirectControlOptions & {
    waitForTuner?: boolean;
    waitTimeoutMs?: number;
    pollIntervalMs?: number;
  } = {},
  dependencies: RestartBeginDependencies,
): Promise<Civ7RestartAndBeginResult> {
  const waitTimeoutMs = options.waitTimeoutMs ?? options.timeoutMs ?? 120_000;
  const pollIntervalMs = options.pollIntervalMs ?? 1_000;
  const observations: Civ7AppUiSnapshot[] = [];
  return await dependencies.withSession(options, async (session) => {
    const restart = await dependencies.executeSessionCommandWithReconnect(session, {
      state: dependencies.appUiState,
      command: dependencies.restartCommand,
      timeoutMs: options.timeoutMs,
    }, 1);
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
          }),
        );
        observations.push(snapshotResult.snapshot);
        const loadingState = probeValue(snapshotResult.snapshot.ui.loadingState);
        if (!beginAttempted && isCiv7BeginReadyLoadingState(loadingState, dependencies.uiLoadingStates)) {
          beginAttempted = true;
          try {
            begin = await dependencies.executeSessionCommandWithReconnect(session, {
              state: dependencies.appUiState,
              command: dependencies.beginGameCommand,
              timeoutMs: options.timeoutMs,
            }, 1);
          } catch (err) {
            beginError = errorMessage(err);
            throw err;
          }
        }
        if (
          loadingState === dependencies.uiLoadingStates.GameStarted &&
          snapshotResult.snapshot.ui.inGame.ok &&
          snapshotResult.snapshot.ui.inGame.value
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
        { details: { observations, beginAttempted, beginError } },
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

function assertRestartConfirmed(result: Civ7CommandResult): void {
  if (result.output[0] !== "true") {
    throw new Civ7DirectControlError(
      "command-failed",
      `Civ7 restart returned: ${result.output.join("\n") || "<empty>"}`,
      { details: result },
    );
  }
}

function isCiv7BeginReadyLoadingState(
  state: number | undefined,
  loadingStates: Pick<RestartBeginDependencies["uiLoadingStates"], "WaitingForUIReady" | "WaitingToStart">,
): boolean {
  return (
    state === loadingStates.WaitingForUIReady ||
    state === loadingStates.WaitingToStart
  );
}

function probeValue<T>(probe: Civ7RuntimeProbe<T>): T | undefined {
  return probe.ok ? probe.value : undefined;
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
