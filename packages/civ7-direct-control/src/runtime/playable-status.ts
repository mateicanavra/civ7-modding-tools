import type {
  Civ7AppUiSnapshotResult,
  Civ7DirectControlOptions,
  Civ7PlayableStatusResult,
  Civ7RuntimeProbe,
  Civ7TunerHealthResult,
} from "../index";

type PlayableStatusDependencies = Readonly<{
  checkTunerHealth: (options?: Civ7DirectControlOptions) => Promise<Civ7TunerHealthResult>;
  errorMessage: (err: unknown) => string;
  getAppUiSnapshot: (options?: Civ7DirectControlOptions) => Promise<Civ7AppUiSnapshotResult>;
}>;

export async function getCiv7PlayableStatus(
  options: Civ7DirectControlOptions = {},
  dependencies: PlayableStatusDependencies,
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

function probeValue<T>(probe: Civ7RuntimeProbe<T>): T | undefined {
  return probe.ok ? probe.value : undefined;
}
