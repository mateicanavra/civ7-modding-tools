import { Civ7DirectControlError } from "../direct-control-error.js";
import { executeCiv7AppUiCommand } from "../session/execute.js";
import { boundedInteger, validateIdentifier } from "../validation.js";
import {
  normalizeSinglePlayerSetupInput,
  prepareCiv7SinglePlayerSetup,
  type Civ7PreparedSetupResult,
  type Civ7SinglePlayerSetupInput,
} from "./prepare.js";
import type {
  Civ7SetupPhase,
  Civ7SetupSnapshotResult,
} from "./reads.js";
import {
  getCiv7SetupSnapshot,
  waitForCiv7SetupPhase,
} from "./reads.js";
import type {
  Civ7PreparedStartInput,
  Civ7SinglePlayerStartResult,
} from "./start.js";
import { startPreparedCiv7SinglePlayerGame } from "./start.js";
import { CIV7_EXIT_TO_MAIN_MENU_COMMAND } from "./constants.js";

import type {
  Civ7CommandResult,
  Civ7DirectControlOptions,
} from "../session/types.js";

export type Civ7SinglePlayerRunInput = Civ7SinglePlayerSetupInput & Readonly<{
  fromRunningGame?: "reject" | "exit-to-shell";
  waitForTuner?: boolean;
  waitTimeoutMs?: number;
  pollIntervalMs?: number;
}>;

export type Civ7SinglePlayerRunResult = Readonly<{
  shellExit?: Civ7CommandResult;
  prepare: Civ7PreparedSetupResult;
  start: Civ7SinglePlayerStartResult;
  verified: boolean;
}>;

type SetupRunDependencies = Readonly<{
  boundedInteger: (value: number, min: number, max: number, label: string) => number;
  executeAppUiCommand: (options: Civ7DirectControlOptions & { command: string }) => Promise<Civ7CommandResult>;
  exitToMainMenuCommand: string;
  getSetupSnapshot: (options: Civ7DirectControlOptions) => Promise<Civ7SetupSnapshotResult>;
  prepareSetup: (
    input: Civ7SinglePlayerSetupInput,
    options: Civ7DirectControlOptions,
  ) => Promise<Civ7PreparedSetupResult>;
  startPreparedGame: (
    input: Civ7PreparedStartInput,
    options: Civ7DirectControlOptions,
  ) => Promise<Civ7SinglePlayerStartResult>;
  validateIdentifier: (value: string, label: string) => string;
  waitForSetupPhase: (
    phase: Civ7SetupPhase,
    options: Civ7DirectControlOptions,
    waitOptions: Readonly<{
      waitTimeoutMs: number;
      pollIntervalMs: number;
    }>,
  ) => Promise<Civ7SetupSnapshotResult>;
}>;

export async function runCiv7SinglePlayerFromSetup(
  input: Civ7SinglePlayerRunInput,
  options: Civ7DirectControlOptions = {},
  dependencies: SetupRunDependencies = defaultSetupRunDependencies,
): Promise<Civ7SinglePlayerRunResult> {
  const normalized = normalizeSinglePlayerSetupInput(input, dependencies);
  let shellExit: Civ7CommandResult | undefined;
  const initial = await dependencies.getSetupSnapshot(options);
  if (initial.snapshot.phase !== "shell") {
    if (input.fromRunningGame !== "exit-to-shell") {
      throw new Civ7DirectControlError(
        "setup-phase-invalid",
        `Civ7 is ${initial.snapshot.phase}; pass fromRunningGame: "exit-to-shell" to leave the current game`,
        { details: initial },
      );
    }
    shellExit = await dependencies.executeAppUiCommand({
      ...options,
      command: dependencies.exitToMainMenuCommand,
    });
    await dependencies.waitForSetupPhase("shell", options, {
      waitTimeoutMs: input.waitTimeoutMs ?? 120_000,
      pollIntervalMs: input.pollIntervalMs ?? 1_000,
    });
  }
  const prepare = await dependencies.prepareSetup(
    { ...normalized, requireShell: true },
    options,
  );
  const start = await dependencies.startPreparedGame(
    {
      expected: normalized,
      waitForTuner: input.waitForTuner,
      waitTimeoutMs: input.waitTimeoutMs,
      pollIntervalMs: input.pollIntervalMs,
    },
    options,
  );
  return {
    shellExit,
    prepare,
    start,
    verified: prepare.verified && start.verified,
  };
}

const defaultSetupRunDependencies: SetupRunDependencies = {
  boundedInteger,
  executeAppUiCommand: executeCiv7AppUiCommand,
  exitToMainMenuCommand: CIV7_EXIT_TO_MAIN_MENU_COMMAND,
  getSetupSnapshot: getCiv7SetupSnapshot,
  prepareSetup: prepareCiv7SinglePlayerSetup,
  startPreparedGame: startPreparedCiv7SinglePlayerGame,
  validateIdentifier,
  waitForSetupPhase: waitForCiv7SetupPhase,
};
