import { Civ7DirectControlError, type Civ7DirectControlErrorCode } from "../direct-control-error.js";

import { DEFAULT_CIV7_TUNER_TIMEOUT_MS } from "../session/constants.js";
import { executeSessionCommandWithReconnect } from "../session/reconnect.js";
import { withCiv7DirectControlSession, type Civ7DirectControlSession } from "../session/session.js";
import type {
  Civ7CommandResult,
  Civ7DirectControlOptions,
  Civ7TunerStateSelection,
} from "../session/types.js";
import type { Civ7RuntimeProbe } from "./probe.js";

export type Civ7TunerHealthSnapshot = Readonly<{
  evalOk: number;
  ready: boolean;
  globals: Readonly<{
    Game: string;
    Autoplay: string;
    GameplayMap: string;
    Players: string;
    Network: string;
  }>;
  turn: Civ7RuntimeProbe<number>;
  turnDate: Civ7RuntimeProbe<string>;
  width: Civ7RuntimeProbe<number>;
  height: Civ7RuntimeProbe<number>;
  aliveIds: Civ7RuntimeProbe<ReadonlyArray<number>>;
  aliveHumanIds: Civ7RuntimeProbe<ReadonlyArray<number>>;
  autoplayActive: Civ7RuntimeProbe<boolean>;
}>;

export type Civ7TunerHealthResult = Readonly<{
  host: string;
  port: number;
  state: Civ7CommandResult["state"];
  ready: boolean;
  snapshot: Civ7TunerHealthSnapshot;
}>;

type TunerHealthSessionDependencies = Readonly<{
  executeSessionCommandWithReconnect: (
    session: Civ7DirectControlSession,
    options: Readonly<{
      command: string;
      state?: Civ7TunerStateSelection;
      timeoutMs?: number;
    }>,
    attempts?: number,
  ) => Promise<Civ7CommandResult>;
}>;

type TunerHealthDependencies = TunerHealthSessionDependencies & Readonly<{
  withSession: <T>(
    options: Civ7DirectControlOptions,
    run: (session: Civ7DirectControlSession) => Promise<T>,
  ) => Promise<T>;
}>;

export async function checkCiv7TunerHealth(
  options: Civ7DirectControlOptions = {},
  dependencies: TunerHealthDependencies = defaultTunerHealthDependencies,
): Promise<Civ7TunerHealthResult> {
  return await dependencies.withSession(options, async (session) =>
    await checkCiv7TunerHealthWithSession(session, options.timeoutMs, dependencies)
  );
}

export async function waitForCiv7TunerReady(
  options: Civ7DirectControlOptions & {
    waitTimeoutMs?: number;
    pollIntervalMs?: number;
  } = {},
  dependencies: TunerHealthDependencies = defaultTunerHealthDependencies,
): Promise<Civ7TunerHealthResult & { ready: true }> {
  return await dependencies.withSession(options, async (session) =>
    await waitForCiv7TunerReadyWithSession(session, options, dependencies)
  );
}

const defaultTunerHealthDependencies: TunerHealthDependencies = {
  withSession: withCiv7DirectControlSession,
  executeSessionCommandWithReconnect,
};

export function buildTunerHealthCommand(): string {
  return `(() => {
    const g = globalThis;
    const probe = (fn) => {
      try {
        return { ok: true, value: fn() };
      } catch (err) {
        return { ok: false, error: String(err) };
      }
    };
    const width = probe(() => g.GameplayMap.getGridWidth());
    const height = probe(() => g.GameplayMap.getGridHeight());
    const aliveIds = probe(() => g.Players.getAliveIds());
    const snapshot = {
      evalOk: 1 + 1,
      globals: {
        Game: typeof g.Game,
        Autoplay: typeof g.Autoplay,
        GameplayMap: typeof g.GameplayMap,
        Players: typeof g.Players,
        Network: typeof g.Network,
      },
      turn: probe(() => g.Game.turn),
      turnDate: probe(() => g.Game.getTurnDate()),
      width,
      height,
      aliveIds,
      aliveHumanIds: probe(() => g.Players.getAliveHumanIds()),
      autoplayActive: probe(() => g.Autoplay.isActive),
    };
    snapshot.ready =
      snapshot.evalOk === 2 &&
      snapshot.globals.Game === "object" &&
      snapshot.globals.GameplayMap === "object" &&
      snapshot.globals.Players === "object" &&
      width.ok &&
      width.value > 0 &&
      height.ok &&
      height.value > 0 &&
      aliveIds.ok &&
      Array.isArray(aliveIds.value);
    return JSON.stringify(snapshot);
  })()`;
}

export function tunerHealthFromCommandResult(result: Civ7CommandResult): Civ7TunerHealthResult {
  try {
    const snapshot = JSON.parse(result.output[0] ?? "{}") as Civ7TunerHealthSnapshot;
    return {
      host: result.host,
      port: result.port,
      state: result.state,
      ready: snapshot.ready,
      snapshot,
    };
  } catch (err) {
    throw new Civ7DirectControlError(
      "command-failed",
      `Civ7 Tuner health returned invalid JSON: ${result.output.join("\n") || "<empty>"}`,
      { cause: err, details: result },
    );
  }
}

export async function checkCiv7TunerHealthWithSession(
  session: Civ7DirectControlSession,
  timeoutMs: number | undefined,
  dependencies: TunerHealthSessionDependencies,
): Promise<Civ7TunerHealthResult> {
  return tunerHealthFromCommandResult(
    await dependencies.executeSessionCommandWithReconnect(session, {
      state: { role: "tuner" },
      command: buildTunerHealthCommand(),
      timeoutMs,
    }, 1),
  );
}

export async function waitForCiv7TunerReadyWithSession(
  session: Civ7DirectControlSession,
  options: {
    timeoutMs?: number;
    waitTimeoutMs?: number;
    pollIntervalMs?: number;
  } = {},
  dependencies: TunerHealthSessionDependencies,
): Promise<Civ7TunerHealthResult & { ready: true }> {
  const waitTimeoutMs = options.waitTimeoutMs ?? options.timeoutMs ?? DEFAULT_CIV7_TUNER_TIMEOUT_MS;
  const pollIntervalMs = options.pollIntervalMs ?? 500;
  const startedAt = Date.now();
  let lastHealth: Civ7TunerHealthResult | undefined;
  let lastError: Civ7DirectControlError | undefined;
  while (Date.now() - startedAt <= waitTimeoutMs) {
    try {
      const health = await checkCiv7TunerHealthWithSession(session, options.timeoutMs, dependencies);
      if (health.ready) return health as Civ7TunerHealthResult & { ready: true };
      lastHealth = health;
    } catch (err) {
      lastError = toDirectControlError(err, "command-failed");
      await session.close();
    }
    await sleep(pollIntervalMs);
  }
  throw new Civ7DirectControlError(
    "connection-timeout",
    `Timed out waiting for Civ7 Tuner readiness after ${waitTimeoutMs}ms`,
    { details: lastHealth ?? lastError },
  );
}

function toDirectControlError(err: unknown, fallbackCode: Civ7DirectControlErrorCode): Civ7DirectControlError {
  if (err instanceof Civ7DirectControlError) return err;
  return new Civ7DirectControlError(fallbackCode, errorMessage(err), { cause: err });
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
