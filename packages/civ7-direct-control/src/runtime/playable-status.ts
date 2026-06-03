import { errorMessage } from "../error-message.js";
import type {
  Civ7DirectControlOptions,
} from "../session/types.js";
import { getCiv7AppUiSnapshot, type Civ7AppUiSnapshotResult } from "./app-ui-snapshot.js";
import type { Civ7RuntimeProbe } from "./probe.js";
import { checkCiv7TunerHealth, type Civ7TunerHealthResult } from "./tuner-health.js";

export type Civ7PlayableStatusResult = Readonly<{
  host: string;
  port: number;
  playable: boolean;
  readiness:
    | "tuner-ready"
    | "app-ui-game"
    | "begin-ready"
    | "loading"
    | "shell"
    | "unavailable";
  appUi: Civ7AppUiSnapshotResult;
  tuner?: Civ7TunerHealthResult;
  errors: ReadonlyArray<string>;
}>;

type PlayableStatusDependencies = Readonly<{
  checkTunerHealth: (options?: Civ7DirectControlOptions) => Promise<Civ7TunerHealthResult>;
  errorMessage: (err: unknown) => string;
  getAppUiSnapshot: (options?: Civ7DirectControlOptions) => Promise<Civ7AppUiSnapshotResult>;
}>;

export async function getCiv7PlayableStatus(
  options: Civ7DirectControlOptions = {},
  dependencies: PlayableStatusDependencies = defaultPlayableStatusDependencies,
): Promise<Civ7PlayableStatusResult> {
  const appUi = await dependencies.getAppUiSnapshot(options);
  const errors: string[] = [];
  let tuner: Civ7TunerHealthResult | undefined;
  try {
    tuner = await dependencies.checkTunerHealth(options);
  } catch (err) {
    errors.push(dependencies.errorMessage(err));
  }

  const inGame = probeValue(appUi.snapshot.ui.inGame) === true;
  const inShell = probeValue(appUi.snapshot.ui.inShell) === true;
  const inLoading = probeValue(appUi.snapshot.ui.inLoading) === true;
  const canBegin = probeValue(appUi.snapshot.ui.canBeginGame) === true;
  const playable = tuner?.ready === true;
  const readiness = playable
    ? "tuner-ready"
    : inGame
      ? "app-ui-game"
      : canBegin
        ? "begin-ready"
        : inLoading
          ? "loading"
          : inShell
            ? "shell"
            : "unavailable";

  return {
    host: appUi.host,
    port: appUi.port,
    playable,
    readiness,
    appUi,
    tuner,
    errors,
  };
}

const defaultPlayableStatusDependencies: PlayableStatusDependencies = {
  checkTunerHealth: checkCiv7TunerHealth,
  errorMessage,
  getAppUiSnapshot: getCiv7AppUiSnapshot,
};

function probeValue<T>(probe: Civ7RuntimeProbe<T>): T | undefined {
  return probe.ok ? probe.value : undefined;
}
