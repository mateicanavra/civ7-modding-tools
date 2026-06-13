import { Civ7DirectControlError } from "../direct-control-error.js";
import { getCiv7MapSummary } from "../play/map/reads.js";
import {
  appUiSnapshotFromCommandResult,
  buildAppUiSnapshotCommand,
  type Civ7AppUiSnapshot,
  type Civ7AppUiSnapshotResult,
} from "../runtime/app-ui-snapshot.js";
import {
  waitForCiv7TunerReadyWithSession,
  type Civ7TunerHealthResult,
} from "../runtime/tuner-health.js";
import { executeSessionCommandWithReconnect } from "../session/reconnect.js";
import { withCiv7DirectControlSession, type Civ7DirectControlSession } from "../session/session.js";
import { jsonPayloadFromCommandResult } from "../session/command-result.js";
import { validateIdentifier } from "../validation.js";
import {
  assertPreparedSetupMatches,
  normalizeSinglePlayerSetupInput,
  type Civ7SinglePlayerSetupInput,
} from "./prepare.js";
import {
  buildSetupSnapshotCommand,
  defaultSetupReadDependencies,
  type Civ7SetupSnapshotResult,
  type SetupReadDependencies,
} from "./reads.js";
import type { Civ7MapSummaryResult } from "../play/map/types.js";
import type { Civ7RuntimeProbe } from "../runtime/probe.js";
import { CIV7_BEGIN_GAME_COMMAND, CIV7_UI_LOADING_STATES } from "./constants.js";
import type {
  Civ7CommandResult,
  Civ7DirectControlOptions,
  Civ7TunerStateSelection,
} from "../session/types.js";

export type Civ7PreparedStartInput = Readonly<{
  expected: Civ7SinglePlayerSetupInput;
  waitForTuner?: boolean;
  waitTimeoutMs?: number;
  pollIntervalMs?: number;
}>;

export type Civ7SinglePlayerStartResult = Readonly<{
  command: Civ7CommandResult;
  begin?: Civ7CommandResult;
  beginAttempted: boolean;
  beginError?: string;
  before: Civ7SetupSnapshotResult;
  finalAppUi: Civ7AppUiSnapshotResult;
  tunerHealth?: Civ7TunerHealthResult;
  mapSummary?: Civ7MapSummaryResult;
  observations: ReadonlyArray<Civ7AppUiSnapshot>;
  verified: boolean;
}>;

type SetupStartDependencies = SetupReadDependencies &
  Readonly<{
    appUiState: Civ7TunerStateSelection;
    beginGameCommand: string;
    executeSessionCommandWithReconnect: (
      session: Civ7DirectControlSession,
      options: Readonly<{
        command: string;
        state?: Civ7TunerStateSelection;
        timeoutMs?: number;
      }>,
      attempts?: number
    ) => Promise<Civ7CommandResult>;
    getMapSummary: (options: Civ7DirectControlOptions) => Promise<Civ7MapSummaryResult>;
    parseStartPayload: (result: Civ7CommandResult, label: string) => { ok: unknown };
    uiLoadingStates: Readonly<{
      WaitingForUIReady: number;
      WaitingToStart: number;
      GameStarted: number;
    }>;
    validateIdentifier: (value: string, label: string) => string;
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

export async function startPreparedCiv7SinglePlayerGame(
  input: Civ7PreparedStartInput,
  options: Civ7DirectControlOptions = {},
  dependencies: SetupStartDependencies = defaultSetupStartDependencies
): Promise<Civ7SinglePlayerStartResult> {
  const expected = normalizeSinglePlayerSetupInput(input.expected, dependencies);
  const before = await dependencies.parseSetupSnapshot(
    await dependencies.executeAppUiCommand({
      ...options,
      command: buildSetupSnapshotCommand(dependencies),
    }),
    "Civ7 setup snapshot"
  );
  assertPreparedSetupMatches(expected, before.snapshot);

  const waitTimeoutMs = input.waitTimeoutMs ?? options.timeoutMs ?? 120_000;
  const pollIntervalMs = input.pollIntervalMs ?? 1_000;
  const observations: Civ7AppUiSnapshot[] = [];
  return await dependencies.withSession(options, async (session) => {
    const command = await session.executeCommand({
      state: dependencies.appUiState,
      command: buildStartPreparedSinglePlayerCommand(),
      timeoutMs: options.timeoutMs,
    });
    const startPayload = dependencies.parseStartPayload(
      command,
      "Civ7 prepared single-player start"
    );
    if (startPayload.ok === false) {
      throw new Civ7DirectControlError("command-failed", "Civ7 Network.hostGame returned false", {
        details: { command, startPayload },
      });
    }

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
                command: dependencies.beginGameCommand,
                timeoutMs: options.timeoutMs,
              },
              1
            );
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
        "setup-start-timeout",
        `Timed out waiting for Civ7 to start prepared single-player game after ${waitTimeoutMs}ms`,
        { details: { before, observations, beginAttempted, beginError } }
      );
    }

    const tunerHealth = input.waitForTuner
      ? await dependencies.waitForTunerReadyWithSession(session, {
          timeoutMs: options.timeoutMs,
          waitTimeoutMs,
          pollIntervalMs,
        })
      : undefined;
    const mapSummary = input.waitForTuner
      ? await dependencies.getMapSummary({ ...options, timeoutMs: options.timeoutMs })
      : undefined;
    if (mapSummary) assertPostStartMatches(expected, mapSummary);

    return {
      command,
      begin,
      beginAttempted,
      beginError,
      before,
      finalAppUi,
      tunerHealth,
      mapSummary,
      observations,
      verified: mapSummary
        ? true
        : finalAppUi.snapshot.ui.inGame.ok && finalAppUi.snapshot.ui.inGame.value,
    };
  });
}

export function buildStartPreparedSinglePlayerCommand(): string {
  return `(() => {
    const serverType = typeof ServerType !== "undefined" && ServerType && ServerType.SERVER_TYPE_NONE !== undefined
      ? ServerType.SERVER_TYPE_NONE
      : 0;
    return JSON.stringify({
      ok: Network.hostGame(serverType),
      serverType,
    });
  })()`;
}

function assertPostStartMatches(
  input: Civ7SinglePlayerSetupInput,
  summary: Civ7MapSummaryResult
): void {
  const seed = probeValue(summary.map.randomSeed);
  if (seed !== undefined && seed !== input.seed) {
    throw new Civ7DirectControlError(
      "setup-seed-mismatch",
      `Civ7 runtime map seed ${seed} did not match ${input.seed}`,
      {
        details: { input, summary },
      }
    );
  }
}

function isCiv7BeginReadyLoadingState(
  state: number | undefined,
  loadingStates: Pick<
    SetupStartDependencies["uiLoadingStates"],
    "WaitingForUIReady" | "WaitingToStart"
  >
): boolean {
  return state === loadingStates.WaitingForUIReady || state === loadingStates.WaitingToStart;
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

const defaultSetupStartDependencies: SetupStartDependencies = {
  ...defaultSetupReadDependencies,
  appUiState: { role: "app-ui" },
  beginGameCommand: CIV7_BEGIN_GAME_COMMAND,
  executeSessionCommandWithReconnect,
  getMapSummary: getCiv7MapSummary,
  parseStartPayload: (result, label) =>
    jsonPayloadFromCommandResult<{ ok: unknown }>(result, label),
  uiLoadingStates: CIV7_UI_LOADING_STATES,
  validateIdentifier,
  waitForTunerReadyWithSession: async (session, options) =>
    await waitForCiv7TunerReadyWithSession(session, options, {
      executeSessionCommandWithReconnect,
    }),
  withSession: withCiv7DirectControlSession,
};
