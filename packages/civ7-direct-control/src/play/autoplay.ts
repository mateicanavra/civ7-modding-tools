import { assertApproved, type Civ7ActionApproval } from "../action-approval.js";
import {
  appUiSnapshotFromCommandResult,
  buildAppUiSnapshotCommand,
} from "../runtime/app-ui-snapshot.js";
import { jsLiteral } from "../runtime/command-serialization.js";
import { executeCiv7AppUiCommand } from "../session/execute.js";
import { sleep } from "../timing.js";
import { boundedInteger, validatePlayerId } from "../validation.js";
import type {
  Civ7AppUiSnapshot,
  Civ7AppUiSnapshotResult,
} from "../runtime/app-ui-snapshot.js";
import type {
  Civ7CommandResult,
  Civ7DirectControlOptions,
  Civ7TunerState,
} from "../session/types.js";

export const DEFAULT_CIV7_AUTOPLAY_MAX_TURNS = 50;
export const DEFAULT_CIV7_AUTOPLAY_WAIT_MS = 5_000;
export const DEFAULT_CIV7_AUTOPLAY_STOP_WAIT_MS = 30_000;
export const DEFAULT_CIV7_AUTOPLAY_POLL_INTERVAL_MS = 250;
export const DEFAULT_CIV7_AUTOPLAY_STOP_STABILITY_MS = 10_000;

export type Civ7AutoplayStatusResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  autoplay: Civ7AppUiSnapshot["autoplay"];
  game: Civ7AppUiSnapshot["game"];
  gameContext: Civ7AppUiSnapshot["gameContext"];
}>;

export type Civ7AutoplayPollOptions = Civ7DirectControlOptions & Readonly<{
  waitTimeoutMs?: number;
  pollIntervalMs?: number;
  stabilityWindowMs?: number;
}>;

export type Civ7AutoplayOptions = Civ7AutoplayPollOptions & Readonly<{
  turns?: number;
  observeAsPlayer?: number;
  returnAsPlayer?: number;
  pause?: boolean;
  maxTurns?: number;
}>;

export type Civ7AutoplayActionResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  before: Civ7AutoplayStatusResult;
  after: Civ7AutoplayStatusResult;
  commands: ReadonlyArray<Civ7CommandResult>;
  verified: boolean;
}>;

type AutoplayDependencies = Readonly<{
  assertApproved: (approval: Civ7ActionApproval, action: string) => void;
  boundedInteger: (value: number, min: number, max: number, label: string) => number;
  defaultMaxTurns: number;
  defaultPollIntervalMs: number;
  defaultStopStabilityMs: number;
  defaultStopWaitMs: number;
  defaultWaitMs: number;
  executeAppUiCommand: (
    options: Civ7DirectControlOptions & Readonly<{ command: string }>,
  ) => Promise<Civ7CommandResult>;
  getAppUiSnapshot: (options: Civ7DirectControlOptions) => Promise<Civ7AppUiSnapshotResult>;
  jsLiteral: (value: unknown) => string;
  sleep: (ms: number) => Promise<void>;
  validatePlayerId: (playerId: number) => number;
}>;

export async function getCiv7AutoplayStatus(
  options: Civ7DirectControlOptions = {},
  dependencies: Pick<AutoplayDependencies, "getAppUiSnapshot"> = defaultAutoplayDependencies,
): Promise<Civ7AutoplayStatusResult> {
  const snapshot = await dependencies.getAppUiSnapshot(options);
  return {
    host: snapshot.host,
    port: snapshot.port,
    state: snapshot.state,
    autoplay: snapshot.snapshot.autoplay,
    game: snapshot.snapshot.game,
    gameContext: snapshot.snapshot.gameContext,
  };
}

export async function configureCiv7Autoplay(
  options: Civ7AutoplayOptions,
  approval: Civ7ActionApproval,
  dependencies: AutoplayDependencies = defaultAutoplayDependencies,
): Promise<Civ7AutoplayActionResult> {
  dependencies.assertApproved(approval, "configuring Civ7 autoplay");
  const maxTurns = options.maxTurns ?? dependencies.defaultMaxTurns;
  if (options.turns !== undefined) {
    dependencies.boundedInteger(options.turns, 1, maxTurns, "turns");
  }
  if (options.observeAsPlayer !== undefined) {
    dependencies.validatePlayerId(options.observeAsPlayer);
  }
  if (options.returnAsPlayer !== undefined) dependencies.validatePlayerId(options.returnAsPlayer);
  const before = await getCiv7AutoplayStatus(options, dependencies);
  const command = await dependencies.executeAppUiCommand({
    ...options,
    command: buildConfigureAutoplayCommand(options, dependencies),
  });
  const after = await waitForCiv7AutoplayStatus(
    options,
    (status) => autoplayConfigMatches(status, options),
    dependencies,
  );
  return {
    host: command.host,
    port: command.port,
    state: command.state,
    before,
    after,
    commands: [command],
    verified: autoplayConfigMatches(after, options),
  };
}

export async function startCiv7Autoplay(
  options: Civ7AutoplayOptions,
  approval: Civ7ActionApproval,
  dependencies: AutoplayDependencies = defaultAutoplayDependencies,
): Promise<Civ7AutoplayActionResult> {
  dependencies.assertApproved(approval, "starting Civ7 autoplay");
  const maxTurns = options.maxTurns ?? dependencies.defaultMaxTurns;
  if (options.turns !== undefined) {
    dependencies.boundedInteger(options.turns, 1, maxTurns, "turns");
  }
  const before = await getCiv7AutoplayStatus(options, dependencies);
  const commandOptions = {
    ...materializeAutoplayPlayerOptions(options, before),
    pause: options.pause ?? false,
  };
  const command = await dependencies.executeAppUiCommand({
    ...options,
    command: buildStartAutoplayCommand(commandOptions, dependencies),
  });
  const after = await waitForCiv7AutoplayStatus(
    options,
    (status) => status.autoplay.isActive === true,
    dependencies,
  );
  return {
    host: command.host,
    port: command.port,
    state: command.state,
    before,
    after,
    commands: [command],
    verified: after.autoplay.isActive === true,
  };
}

export async function stopCiv7Autoplay(
  options: Civ7AutoplayOptions = {},
  approval: Civ7ActionApproval,
  dependencies: AutoplayDependencies = defaultAutoplayDependencies,
): Promise<Civ7AutoplayActionResult> {
  dependencies.assertApproved(approval, "stopping Civ7 autoplay");
  const before = await getCiv7AutoplayStatus(options, dependencies);
  const commandOptions = materializeAutoplayPlayerOptions(options, before);
  const command = await dependencies.executeAppUiCommand({
    ...options,
    command: buildStopAutoplayCommand(commandOptions, dependencies),
  });
  const stopProof = await waitForCiv7AutoplayStop(options, commandOptions.returnAsPlayer, dependencies);
  return {
    host: command.host,
    port: command.port,
    state: command.state,
    before,
    after: stopProof.status,
    commands: [command],
    verified: stopProof.verified,
  };
}

function buildConfigureAutoplayCommand(
  options: Civ7AutoplayOptions,
  dependencies: Pick<AutoplayDependencies, "jsLiteral">,
): string {
  return `(() => {
    ${autoplaySetterSource(options, dependencies)}
    return JSON.stringify({ ok: true, isActive: Autoplay.isActive, turns: Autoplay.turns });
  })()`;
}

function buildStartAutoplayCommand(
  options: Civ7AutoplayOptions,
  dependencies: Pick<AutoplayDependencies, "jsLiteral">,
): string {
  return `(() => {
    ${autoplaySetterSource(options, dependencies)}
    Autoplay.setActive(true);
    return JSON.stringify({ ok: true, isActive: Autoplay.isActive, turns: Autoplay.turns });
  })()`;
}

function buildStopAutoplayCommand(
  options: Civ7AutoplayOptions,
  dependencies: Pick<AutoplayDependencies, "jsLiteral">,
): string {
  return `(() => {
    ${autoplayRestoreSetterSource(options, dependencies)}
    Autoplay.setPause(true);
    Autoplay.setActive(false);
    return JSON.stringify({
      ok: true,
      isActive: Autoplay.isActive,
      turns: Autoplay.turns,
      isPaused: Autoplay.isPaused,
      isPausedOrPending: Autoplay.isPausedOrPending
    });
  })()`;
}

function autoplaySetterSource(
  options: Civ7AutoplayOptions,
  dependencies: Pick<AutoplayDependencies, "jsLiteral">,
): string {
  const statements: string[] = [];
  if (options.turns !== undefined) {
    statements.push(`Autoplay.setTurns(${dependencies.jsLiteral(options.turns)});`);
  }
  if (options.observeAsPlayer !== undefined) {
    statements.push(
      `Autoplay.setObserveAsPlayer(${dependencies.jsLiteral(options.observeAsPlayer)});`,
    );
  }
  if (options.returnAsPlayer !== undefined) {
    statements.push(
      `Autoplay.setReturnAsPlayer(${dependencies.jsLiteral(options.returnAsPlayer)});`,
    );
  }
  if (options.pause !== undefined) {
    statements.push(`Autoplay.setPause(${dependencies.jsLiteral(options.pause)});`);
  }
  return statements.join("\n    ");
}

function autoplayConfigMatches(
  status: Civ7AutoplayStatusResult,
  options: Civ7AutoplayOptions,
): boolean {
  if (options.turns !== undefined && status.autoplay.turns !== options.turns) return false;
  if (options.observeAsPlayer !== undefined && status.autoplay.observeAsPlayer !== options.observeAsPlayer) return false;
  if (options.returnAsPlayer !== undefined && status.autoplay.returnAsPlayer !== options.returnAsPlayer) return false;
  if (options.pause !== undefined && status.autoplay.isPaused !== options.pause) return false;
  return true;
}

function materializeAutoplayPlayerOptions(
  options: Civ7AutoplayOptions,
  before: Civ7AutoplayStatusResult,
): Civ7AutoplayOptions {
  const returnAsPlayer = options.returnAsPlayer ?? inferAutoplayReturnPlayer(before);
  const observeAsPlayer = options.observeAsPlayer ?? inferAutoplayObservePlayer(before, returnAsPlayer);
  return {
    ...options,
    ...(returnAsPlayer === undefined ? {} : { returnAsPlayer }),
    ...(observeAsPlayer === undefined ? {} : { observeAsPlayer }),
  };
}

function inferAutoplayReturnPlayer(status: Civ7AutoplayStatusResult): number | undefined {
  if (isConcretePlayerId(status.gameContext.localPlayerID)) return status.gameContext.localPlayerID;
  if (isConcretePlayerId(status.autoplay.returnAsPlayer)) return status.autoplay.returnAsPlayer;
  return undefined;
}

function inferAutoplayObservePlayer(
  status: Civ7AutoplayStatusResult,
  returnAsPlayer: number | undefined,
): number | undefined {
  if (isConcretePlayerId(status.gameContext.localObserverID)) return status.gameContext.localObserverID;
  return returnAsPlayer;
}

function isConcretePlayerId(value: number): boolean {
  return Number.isInteger(value) && value >= 0 && value < 1_000;
}

function autoplayRestoreSetterSource(
  options: Civ7AutoplayOptions,
  dependencies: Pick<AutoplayDependencies, "jsLiteral">,
): string {
  const statements: string[] = [];
  if (options.returnAsPlayer !== undefined) {
    statements.push(
      `Autoplay.setReturnAsPlayer(${dependencies.jsLiteral(options.returnAsPlayer)});`,
    );
  }
  if (options.observeAsPlayer !== undefined) {
    statements.push(
      `Autoplay.setObserveAsPlayer(${dependencies.jsLiteral(options.observeAsPlayer)});`,
    );
  }
  return statements.join("\n    ");
}

function isAutoplayStopStatus(
  status: Civ7AutoplayStatusResult,
  returnAsPlayer: number | undefined,
): boolean {
  if (status.autoplay.isActive !== false) return false;
  if (returnAsPlayer !== undefined && status.gameContext.localPlayerID !== returnAsPlayer) return false;
  return true;
}

async function waitForCiv7AutoplayStatus(
  options: Civ7AutoplayPollOptions,
  predicate: (status: Civ7AutoplayStatusResult) => boolean,
  dependencies: AutoplayDependencies,
): Promise<Civ7AutoplayStatusResult> {
  const waitTimeoutMs = options.waitTimeoutMs ?? dependencies.defaultWaitMs;
  const pollIntervalMs = options.pollIntervalMs ?? dependencies.defaultPollIntervalMs;
  const startedAt = Date.now();
  let lastStatus: Civ7AutoplayStatusResult | undefined;

  while (Date.now() - startedAt <= waitTimeoutMs) {
    const status = await getCiv7AutoplayStatus(options, dependencies);
    lastStatus = status;
    if (predicate(status)) return status;
    await dependencies.sleep(pollIntervalMs);
  }

  if (lastStatus) return lastStatus;
  return await getCiv7AutoplayStatus(options, dependencies);
}

async function waitForCiv7AutoplayStop(
  options: Civ7AutoplayPollOptions,
  returnAsPlayer: number | undefined,
  dependencies: AutoplayDependencies,
): Promise<{ status: Civ7AutoplayStatusResult; verified: boolean }> {
  const waitTimeoutMs = options.waitTimeoutMs ?? dependencies.defaultStopWaitMs;
  const pollIntervalMs = options.pollIntervalMs ?? dependencies.defaultPollIntervalMs;
  const stabilityWindowMs = options.stabilityWindowMs ?? dependencies.defaultStopStabilityMs;
  const startedAt = Date.now();
  let lastStatus: Civ7AutoplayStatusResult | undefined;

  while (Date.now() - startedAt <= waitTimeoutMs) {
    const status = await getCiv7AutoplayStatus(options, dependencies);
    lastStatus = status;
    if (isAutoplayStopStatus(status, returnAsPlayer)) {
      await dependencies.sleep(stabilityWindowMs);
      const stableStatus = await getCiv7AutoplayStatus(options, dependencies);
      lastStatus = stableStatus;
      if (
        isAutoplayStopStatus(stableStatus, returnAsPlayer) &&
        stableStatus.game.turn === status.game.turn
      ) {
        return { status: stableStatus, verified: true };
      }
    }
    await dependencies.sleep(pollIntervalMs);
  }

  const status = lastStatus ?? await getCiv7AutoplayStatus(options, dependencies);
  return { status, verified: false };
}

const defaultAutoplayDependencies: AutoplayDependencies = {
  assertApproved,
  boundedInteger,
  defaultMaxTurns: DEFAULT_CIV7_AUTOPLAY_MAX_TURNS,
  defaultPollIntervalMs: DEFAULT_CIV7_AUTOPLAY_POLL_INTERVAL_MS,
  defaultStopStabilityMs: DEFAULT_CIV7_AUTOPLAY_STOP_STABILITY_MS,
  defaultStopWaitMs: DEFAULT_CIV7_AUTOPLAY_STOP_WAIT_MS,
  defaultWaitMs: DEFAULT_CIV7_AUTOPLAY_WAIT_MS,
  executeAppUiCommand: executeCiv7AppUiCommand,
  getAppUiSnapshot: async (options) =>
    appUiSnapshotFromCommandResult(
      await executeCiv7AppUiCommand({
        ...options,
        command: buildAppUiSnapshotCommand(),
      }),
    ),
  jsLiteral,
  sleep,
  validatePlayerId,
};
