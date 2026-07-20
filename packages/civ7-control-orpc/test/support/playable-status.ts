import type { Civ7ControlOrpcPlayableStatusResult } from "../../src/dependencies/direct-control";

type PlayableStatusFixtureOptions = Readonly<
  Partial<{
    playable: boolean;
    readiness: Civ7ControlOrpcPlayableStatusResult["readiness"];
    tunerReady: boolean | null;
    appUi: Readonly<
      Partial<{
        inGame: boolean | null;
        inShell: boolean | null;
        inLoading: boolean | null;
        canBeginGame: boolean | null;
      }>
    >;
    errors: readonly string[];
  }>
>;

export function playableStatusResult(
  options: PlayableStatusFixtureOptions = {}
): Civ7ControlOrpcPlayableStatusResult {
  const readiness = options.readiness ?? (options.playable === false ? "shell" : "tuner-ready");
  const playable = options.playable ?? readiness === "tuner-ready";
  const appUi = {
    ...appUiForReadiness(readiness),
    ...options.appUi,
  };
  const tunerReady = options.tunerReady === undefined ? playable : options.tunerReady;

  return {
    host: "127.0.0.1",
    port: 4318,
    playable,
    readiness,
    appUi: {
      host: "127.0.0.1",
      port: 4318,
      state: { id: "65535", name: "App UI" },
      snapshot: {
        network: {
          isInSession: probe(false),
          numPlayers: probe(1),
          hostPlayerId: probe(0),
          isConnectedToNetwork: probe(false),
          isAuthenticated: probe(false),
          isLoggedIn: probe(false),
        },
        autoplay: {
          isActive: false,
          turns: 0,
          isPaused: false,
          isPausedOrPending: false,
          observeAsPlayer: -1,
          returnAsPlayer: -1,
        },
        game: {
          turn: 1,
          age: 0,
          maxTurns: 500,
          turnDate: probe("4000 BCE"),
          hash: probe(1),
        },
        ui: {
          inGame: probe(appUi.inGame),
          inShell: probe(appUi.inShell),
          inLoading: probe(appUi.inLoading),
          loadingState: probe(0),
          loadingStateName: null,
          canBeginGame: probe(appUi.canBeginGame),
          canNotifyUIReady: "function",
          skipStartButton: probe(false),
          automationActive: probe(false),
          activeInputContext: probe(0),
          activeInputContextName: null,
        },
        gameContext: {
          localPlayerID: 0,
          localObserverID: -1,
          hasRequestedPause: probe(false),
        },
        players: {
          maxPlayers: 8,
          aliveIds: probe([0]),
          aliveHumanIds: probe([0]),
          numAliveHumans: probe(1),
        },
        map: {
          width: probe(84),
          height: probe(54),
          plotCount: probe(4_536),
          mapSize: probe(2),
          randomSeed: probe(1),
        },
      },
    },
    ...(tunerReady == null
      ? {}
      : {
          tuner: {
            host: "127.0.0.1",
            port: 4318,
            state: { id: "1", name: "Tuner" },
            ready: tunerReady,
            snapshot: {
              evalOk: tunerReady ? 2 : 0,
              ready: tunerReady,
              globals: {
                Game: "object",
                Autoplay: "object",
                GameplayMap: "object",
                Players: "object",
                Network: "object",
              },
              turn: probe(1),
              turnDate: probe("4000 BCE"),
              width: probe(84),
              height: probe(54),
              aliveIds: probe([0]),
              aliveHumanIds: probe([0]),
              autoplayActive: probe(false),
            },
          },
        }),
    errors: [...(options.errors ?? [])],
  };
}

function appUiForReadiness(readiness: Civ7ControlOrpcPlayableStatusResult["readiness"]): Readonly<{
  inGame: boolean;
  inShell: boolean;
  inLoading: boolean;
  canBeginGame: boolean;
}> {
  return {
    inGame: readiness === "tuner-ready" || readiness === "app-ui-game",
    inShell: readiness === "shell",
    inLoading: readiness === "loading",
    canBeginGame: readiness === "begin-ready",
  };
}

function probe<T>(
  value: T | null
): Readonly<{ ok: true; value: T } | { ok: false; error: string }> {
  return value == null ? { ok: false, error: "fixture-unavailable" } : { ok: true, value };
}
