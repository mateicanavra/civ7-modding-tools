import type {
  Civ7ControlOrpcDirectControlFacade,
  Civ7ControlOrpcDirectLifecycleFacade,
} from "@civ7/control-orpc/runtime";
import {
  liveCiv7ControlOrpcDirectControlFacade,
  liveCiv7ControlOrpcDirectLifecycleFacade,
} from "@civ7/control-orpc/runtime";
import type {
  Civ7AppUiSnapshotResult,
  Civ7CommandResult,
  Civ7MapSummaryResult,
  Civ7RuntimeProbe,
  Civ7SetupMapRowsResult,
  Civ7SetupSnapshotResult,
  Civ7TunerHealthResult,
} from "@civ7/direct-control";
import { Civ7DirectControlError, Civ7DirectControlSession } from "@civ7/direct-control";
import { Effect, Fiber, Layer, Match } from "effect";
import { describe, expect, test } from "vitest";

import type { StudioServerContext } from "../src/context.js";
import { Civ7WorkflowControl, Civ7WorkflowControlLive } from "../src/ports/Civ7WorkflowControl.js";
import type { RunInGameDeployment, RunInGamePreparedRequest } from "../src/ports/workflowTypes.js";
import { Civ7TunerSession, type Civ7TunerSessionApi } from "../src/services/Civ7TunerSession.js";
import { StudioConfig } from "../src/services/StudioConfig.js";

const fixture = {
  requestId: "run-lifecycle-port-test",
  mapScript: "{mod-swooper-studio-run}/maps/studio-run.js",
  targetModId: "mod-swooper-studio-run",
  mapSize: "MAPSIZE_SMALL",
  seed: 42,
} as const;
const { mapScript, mapSize, requestId, seed, targetModId } = fixture;

describe("Civ7WorkflowControlLive", () => {
  test("sends one exact lifecycle demand and merges duplicate player entries in order", async () => {
    const session = Civ7DirectControlSession.prototype;
    const calls: Array<Readonly<{ operation: string; options: unknown }>> = [];
    let appliedInput: unknown;
    let appReads = 0;
    const directLifecycle: Civ7ControlOrpcDirectLifecycleFacade = {
      ...liveCiv7ControlOrpcDirectLifecycleFacade,
      getSetupSnapshot: record("getSetupSnapshot", async () => setupSnapshot("shell")),
      admitSetupShell: record("admitSetupShell", async () => ({
        initial: setupSnapshot("shell"),
        transition: "shell" as const,
      })),
      reconcileRequiredTargetMod: record("reconcileRequiredTargetMod", async () => ({
        targetModId,
        before: setupSnapshot("shell"),
        refreshed: true,
        verified: true,
      })),
      getSetupMapRows: record("getSetupMapRows", async () => mapRows()),
      applySinglePlayerSetup: record("applySinglePlayerSetup", async (input) => {
        appliedInput = input;
        const before = setupSnapshot("shell");
        return {
          host: before.host,
          port: before.port,
          state: before.state,
          before,
          after: before,
          command: commandResult(),
          applied: {},
          verified: true as const,
        };
      }),
      hostPreparedSinglePlayerGame: record("hostPreparedSinglePlayerGame", async () => ({
        command: commandResult(),
        before: setupSnapshot("shell"),
        accepted: true as const,
      })),
      getAppUiSnapshot: record("getAppUiSnapshot", async () => {
        const phase = Match.value(appReads++).pipe(
          Match.when(0, () => "begin-ready" as const),
          Match.orElse(() => "started" as const)
        );
        return appUiSnapshot(phase);
      }),
      beginGame: record("beginGame", async () => ({
        command: commandResult(),
        accepted: true,
        loadingState: 6,
      })),
      checkTunerHealth: record("checkTunerHealth", async () => tunerHealth()),
      getMapSummary: record("getMapSummary", async () => mapSummary()),
    };

    const service = await makeService({ session, directLifecycle });
    const result = await Effect.runPromise(
      service.startSinglePlayer({
        requestId,
        prepared: preparedRequest(),
        deployment: deployment(),
      })
    );

    expect(appliedInput).toEqual({
      mapScript,
      mapSize,
      seed,
      gameSeed: seed,
      playerCount: 8,
      options: { GameDifficulty: "DIFFICULTY_PRINCE" },
      playerOptions: [
        {
          playerId: 0,
          options: {
            Leader: "LEADER_TEST",
            Difficulty: "DIFFICULTY_DEITY",
            Civilization: "CIVILIZATION_TEST",
          },
        },
        { playerId: 1, options: { Leader: "LEADER_OTHER" } },
      ],
    });
    expect(calls.map((call) => call.operation)).toEqual([
      "getSetupSnapshot",
      "admitSetupShell",
      "reconcileRequiredTargetMod",
      "getSetupMapRows",
      "applySinglePlayerSetup",
      "hostPreparedSinglePlayerGame",
      "getAppUiSnapshot",
      "beginGame",
      "getAppUiSnapshot",
      "checkTunerHealth",
      "getMapSummary",
    ]);
    expect(calls.every((call) => hasSession(call.options, session))).toBe(true);
    expect(result).toMatchObject({
      correlationId: requestId,
      status: "started",
      evidence: {
        setup: { mapScript, mapSize, mapSeed: seed, targetModId, mapRowFiles: [mapScript] },
        runtime: { seed, mapSize, width: 44, height: 26, plotCount: 1144 },
      },
    });

    function record<Args extends readonly unknown[], Result>(
      operation: string,
      run: (...args: Args) => Promise<Result>
    ): (...args: Args) => Promise<Result> {
      return async (...args) => {
        calls.push({ operation, options: args.at(-1) });
        return run(...args);
      };
    }
  });

  test("keeps typed pre-mutation state refusal retryable rather than uncertain", async () => {
    const session = Civ7DirectControlSession.prototype;
    const directLifecycle: Civ7ControlOrpcDirectLifecycleFacade = {
      ...liveCiv7ControlOrpcDirectLifecycleFacade,
      getSetupSnapshot: async () => setupSnapshot("shell"),
      admitSetupShell: async () => {
        throw new Civ7DirectControlError("setup-phase-refused", "setup is loading", {
          details: setupSnapshot("loading"),
        });
      },
    };
    const service = await makeService({ session, directLifecycle });
    const failedStart = Effect.flip(
      service.startSinglePlayer({
        requestId,
        prepared: preparedRequest(),
        deployment: deployment(),
      })
    );
    const failure = await Effect.runPromise(failedStart);

    expect(failure).toMatchObject({
      tag: "VerificationFailed",
      reason: "start-game-failed",
      recoveryActions: expect.arrayContaining(["retry-run"]),
      diagnostics: { code: "LIFECYCLE_STATE_REFUSED" },
    });
    expect(failure.diagnostics?.noRepeat).toBeUndefined();
  });

  test("drains an interrupted lifecycle mutation before releasing Effect ownership", async () => {
    const session = Civ7DirectControlSession.prototype;
    const entered = deferred<void>();
    const mutation =
      deferred<
        Awaited<ReturnType<Civ7ControlOrpcDirectLifecycleFacade["reconcileRequiredTargetMod"]>>
      >();
    let followingReads = 0;
    const directLifecycle: Civ7ControlOrpcDirectLifecycleFacade = {
      ...liveCiv7ControlOrpcDirectLifecycleFacade,
      getSetupSnapshot: async () => setupSnapshot("shell"),
      admitSetupShell: async () => ({
        initial: setupSnapshot("shell"),
        transition: "shell" as const,
      }),
      reconcileRequiredTargetMod: async () => {
        entered.resolve();
        return mutation.promise;
      },
      getSetupMapRows: async () => {
        followingReads += 1;
        return mapRows();
      },
    };
    const service = await makeService({ session, directLifecycle });
    const fiber = Effect.runFork(
      service.startSinglePlayer({
        requestId,
        prepared: preparedRequest(),
        deployment: deployment(),
      })
    );

    await entered.promise;
    const interruption = Effect.runPromise(Fiber.interrupt(fiber));
    let interrupted = false;
    void interruption.then(() => {
      interrupted = true;
    });
    await Promise.resolve();

    expect(interrupted).toBe(false);
    expect(followingReads).toBe(0);

    mutation.resolve({
      targetModId,
      before: setupSnapshot("shell"),
      refreshed: true,
      verified: true,
    });
    await interruption;
    expect(followingReads).toBe(0);
  });
});

async function makeService(args: {
  session: Civ7DirectControlSession;
  directLifecycle: Civ7ControlOrpcDirectLifecycleFacade;
}) {
  const directControl: Civ7ControlOrpcDirectControlFacade = {
    ...liveCiv7ControlOrpcDirectControlFacade,
    getCiv7PlayableStatus: async () =>
      ({ playable: true, readiness: "playable" }) as Awaited<
        ReturnType<Civ7ControlOrpcDirectControlFacade["getCiv7PlayableStatus"]>
      >,
  };
  const tuner: Civ7TunerSessionApi = {
    session: args.session,
    use: (run) => Effect.promise(() => run({ session: args.session })),
    health: Effect.succeed({
      consecutiveResponseTimeouts: 0,
      gateOpenUntil: null,
      wedgeSuspected: false,
    }),
  };
  const config = {
    civ7Control: {
      directControl,
      directLifecycle: args.directLifecycle,
      timeoutMs: 1_000,
    },
  } as StudioServerContext;
  const dependencies = Layer.merge(
    Layer.succeed(Civ7TunerSession, tuner),
    Layer.succeed(StudioConfig, config)
  );
  const workflowLayer = Civ7WorkflowControlLive.pipe(Layer.provide(dependencies));
  const service = Effect.gen(function* () {
    return yield* Civ7WorkflowControl;
  }).pipe(Effect.provide(workflowLayer));
  return Effect.runPromise(service);
}

function preparedRequest(): RunInGamePreparedRequest {
  const canonicalConfig = {
    id: "studio-current",
    name: "Studio Current",
    description: "Lifecycle port fixture.",
    recipe: "standard" as const,
    sortIndex: 1,
    latitudeBounds: { topLatitude: 80, bottomLatitude: -80 },
    config: {},
  };
  const setupConfig = {
    mapScript,
    gameOptions: { GameDifficulty: "DIFFICULTY_PRINCE" },
    playerOptions: [
      {
        playerId: 0,
        options: {
          Leader: "LEADER_TEST",
          Difficulty: "DIFFICULTY_PRINCE",
        },
      },
      { playerId: 1, options: { Leader: "LEADER_OTHER" } },
      {
        playerId: 0,
        options: {
          Difficulty: "DIFFICULTY_DEITY",
          Civilization: "CIVILIZATION_TEST",
        },
      },
    ],
  };
  return {
    request: { recipeId: "standard", seed, mapSize, playerCount: 8, setupConfig },
    launchEnvelope: {
      seed,
      worldSettings: { mapSize, playerCount: 8 },
      setupConfig,
      canonicalConfig,
    },
    canonicalConfigDigest: "canonical-config-digest",
    launchEnvelopeDigest: "launch-envelope-digest",
  };
}

function deployment(): RunInGameDeployment {
  return {
    materialization: { mapScript },
    runDeployment: {
      requestId,
      deployedModId: targetModId,
      generatedModRoot: "/tmp/generated-mod",
      generatedModDigest: "generated-mod-digest",
      targetRoot: "/tmp/Civ7/Mods/mod-swooper-studio-run",
      startedAt: "2026-07-14T00:00:00.000Z",
      completedAt: "2026-07-14T00:00:01.000Z",
      filesCopied: 1,
    },
    deployedSnapshot: {
      requestId,
      deployedModId: targetModId,
      targetRoot: "/tmp/Civ7/Mods/mod-swooper-studio-run",
      observedAt: "2026-07-14T00:00:01.000Z",
      fileCount: 1,
      digest: "generated-mod-digest",
      files: [{ path: "maps/studio-run.js", sha256: "sha256", sizeBytes: 1 }],
    },
  };
}

const state = { id: "app-ui", name: "AppUI" } as const;

function probe<T>(value: T): Civ7RuntimeProbe<T> {
  return { ok: true, value };
}

function commandResult(): Civ7CommandResult {
  return { host: "127.0.0.1", port: 4318, state, output: ["null"] };
}

function setupSnapshot(phase: "shell" | "loading"): Civ7SetupSnapshotResult {
  const row = { source: "setup-domain" as const, file: mapScript };
  const loading = Match.value(phase).pipe(
    Match.when("shell", () => ({ state: 0, name: "NotStarted" as const })),
    Match.when("loading", () => ({ state: 4, name: "Loading" as const })),
    Match.exhaustive
  );
  return {
    host: "127.0.0.1",
    port: 4318,
    state,
    snapshot: {
      phase,
      ui: {
        inGame: probe(false),
        inShell: probe(phase === "shell"),
        inLoading: probe(phase === "loading"),
        loadingState: probe(loading.state),
        loadingStateName: loading.name,
        canBeginGame: probe(false),
      },
      setup: {
        revision: probe(1),
        parameters: [],
        playerParameters: [],
        localPlayerId: probe(0),
      },
      selectedMapRow: row,
      mapRows: [row],
      config: {
        mapScript: probe(mapScript),
        mapSize: probe(mapSize),
        mapSizeType: probe(mapSize),
        mapSeed: probe(seed),
        gameSeed: probe(seed),
        playerCount: probe(8),
      },
    },
  };
}

function mapRows(): Civ7SetupMapRowsResult {
  return {
    host: "127.0.0.1",
    port: 4318,
    state,
    rows: [{ source: "setup-domain", file: mapScript }],
    limit: 20,
    matchedFile: mapScript,
  };
}

function appUiSnapshot(kind: "begin-ready" | "started"): Civ7AppUiSnapshotResult {
  const runtime = Match.value(kind).pipe(
    Match.when("begin-ready", () => ({
      started: false,
      numPlayers: 0,
      loadingState: 6,
      loadingStateName: "WaitingForUIReady" as const,
    })),
    Match.when("started", () => ({
      started: true,
      numPlayers: 1,
      loadingState: 8,
      loadingStateName: "GameStarted" as const,
    })),
    Match.exhaustive
  );
  return {
    host: "127.0.0.1",
    port: 4318,
    state,
    snapshot: {
      network: {
        isInSession: probe(runtime.started),
        numPlayers: probe(runtime.numPlayers),
        hostPlayerId: probe(0),
        isConnectedToNetwork: probe(runtime.started),
        isAuthenticated: probe(true),
        isLoggedIn: probe(true),
      },
      autoplay: {
        isActive: false,
        turns: 0,
        isPaused: false,
        isPausedOrPending: false,
        observeAsPlayer: -1,
        returnAsPlayer: -1,
      },
      game: { turn: 1, age: 0, maxTurns: 500, turnDate: probe("4000 BCE"), hash: probe(1) },
      ui: {
        inGame: probe(runtime.started),
        inShell: probe(false),
        inLoading: probe(!runtime.started),
        loadingState: probe(runtime.loadingState),
        loadingStateName: runtime.loadingStateName,
        canBeginGame: probe(!runtime.started),
        canNotifyUIReady: "function",
        skipStartButton: probe(false),
        automationActive: probe(false),
        activeInputContext: probe(0),
        activeInputContextName: null,
      },
      gameContext: { localPlayerID: 0, localObserverID: -1, hasRequestedPause: probe(false) },
      players: {
        maxPlayers: 8,
        aliveIds: probe([0]),
        aliveHumanIds: probe([0]),
        numAliveHumans: probe(1),
      },
      map: {
        width: probe(44),
        height: probe(26),
        plotCount: probe(1144),
        mapSize: probe(0),
        randomSeed: probe(seed),
      },
    },
  };
}

function tunerHealth(): Civ7TunerHealthResult {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "tuner", name: "Tuner" },
    ready: true,
    snapshot: {
      evalOk: 2,
      ready: true,
      globals: {
        Game: "object",
        Autoplay: "object",
        GameplayMap: "object",
        Players: "object",
        Network: "object",
      },
      turn: probe(1),
      turnDate: probe("4000 BCE"),
      width: probe(44),
      height: probe(26),
      aliveIds: probe([0]),
      aliveHumanIds: probe([0]),
      autoplayActive: probe(false),
    },
  };
}

function mapSummary(): Civ7MapSummaryResult {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "tuner", name: "Tuner" },
    map: {
      width: probe(44),
      height: probe(26),
      plotCount: probe(1144),
      mapSize: probe(0),
      mapSizeType: probe(mapSize),
      randomSeed: probe(seed),
    },
    game: {
      turn: probe(1),
      age: probe(0),
      maxTurns: probe(500),
      turnDate: probe("4000 BCE"),
      hash: probe(1),
    },
  };
}

function deferred<T>() {
  let resolve: (value: T | PromiseLike<T>) => void = () => undefined;
  let reject: (reason?: unknown) => void = () => undefined;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

function hasSession(options: unknown, session: Civ7DirectControlSession): boolean {
  return (
    typeof options === "object" &&
    options !== null &&
    "session" in options &&
    options.session === session
  );
}
