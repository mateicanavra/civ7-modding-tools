import { Civ7DirectControlError } from "../direct-control-error";

import type {
  Civ7CommandResult,
  Civ7DirectControlOptions,
  Civ7DirectControlSession,
  Civ7TunerHealthResult,
  Civ7TunerHealthSnapshot,
  Civ7TunerStateSelection,
} from "../index";

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
  dependencies: TunerHealthDependencies,
): Promise<Civ7TunerHealthResult> {
  return await dependencies.withSession(options, async (session) =>
    await checkCiv7TunerHealthWithSession(session, options.timeoutMs, dependencies)
  );
}

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
