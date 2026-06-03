import { once } from "node:events";
import { type AddressInfo, createServer } from "node:net";
import { describe, expect, test } from "vitest";
import {
  CIV7_RESTART_COMMAND,
  Civ7DirectControlError,
  restartCiv7GameAndBegin,
  restartCiv7Game,
} from "../src/index";

describe("Civ7 direct control", () => {
  test("can restart, begin, and wait for Tuner through one session", async () => {
    const server = await startTunerServer();
    try {
      const { port } = server.address();
      const result = await restartCiv7GameAndBegin({
        host: "127.0.0.1",
        port,
        waitForTuner: true,
        timeoutMs: 1_000,
        waitTimeoutMs: 5_000,
        pollIntervalMs: 10,
      });

      expect(result.restart.output).toEqual(["true"]);
      expect(result.begin?.output).toEqual(["null"]);
      expect(result.finalAppUi.snapshot.ui.loadingState).toEqual({ ok: true, value: 8 });
      expect(result.tunerHealth?.ready).toBe(true);
      expect(server.received).toContain(`CMD:65535:${CIV7_RESTART_COMMAND}`);
      expect(server.received).toContain("CMD:65535:UI.notifyUIReady()");
      expect(server.received.some((message) => message.startsWith("CMD:1:(() =>"))).toBe(true);
    } finally {
      await server.close();
    }
  });

  test("restart command requires true output", async () => {
    const server = await startTunerServer({ restartOutput: "false" });
    try {
      const { port } = server.address();
      await expect(
        restartCiv7Game({
          host: "127.0.0.1",
          port,
          timeoutMs: 1_000,
        })
      ).rejects.toBeInstanceOf(Civ7DirectControlError);
    } finally {
      await server.close();
    }
  });
});

async function startTunerServer(
  options: {
    restartOutput?: string;
    initialInShell?: boolean;
    closeOnSetupMutation?: boolean;
    closeOnBegin?: boolean;
    postStartSeedOverride?: number;
    hiddenMapScript?: string;
    revealHiddenMapRowOnShellExit?: boolean;
    appUiOnlyStates?: boolean;
    appUiSnapshotWithoutGameplayGlobals?: boolean;
    tunerReady?: boolean;
  } = {}
) {
  const received: string[] = [];
  let loadingState = 6;
  let inShell = options.initialInShell ?? true;
  let revealedCount = 10;
  let autoplayActive = false;
  let autoplayPaused = false;
  let autoplayStopPendingReads = 0;
  let setupMapScript = "{swooper-maps}/maps/swooper-earthlike.js";
  let setupMapSize = "MAPSIZE_STANDARD";
  let setupMapSeed = 111;
  let setupGameSeed = 112;
  let setupRevision = 19;
  let hiddenMapRowVisible = false;
  const visibleSetupRows = () => [
    {
      Domain: "StandardMaps",
      File: "{swooper-maps}/maps/swooper-earthlike.js",
      Value: "{swooper-maps}/maps/swooper-earthlike.js",
      Name: "LOC_MAP_SWOOPER_EARTHLIKE_NAME",
      Description: "LOC_MAP_SWOOPER_EARTHLIKE_DESCRIPTION",
      SortIndex: 501,
    },
    ...(hiddenMapRowVisible && options.hiddenMapScript
      ? [
          {
            Domain: "StandardMaps",
            File: options.hiddenMapScript,
            Value: options.hiddenMapScript,
            Name: "LOC_MAP_STUDIO_CURRENT_NAME",
            Description: "LOC_MAP_STUDIO_CURRENT_DESCRIPTION",
            SortIndex: 9999,
          },
        ]
      : []),
  ];
  const visibleMapRows = () => [
    {
      source: "setup-domain",
      file: "{swooper-maps}/maps/swooper-earthlike.js",
      value: "{swooper-maps}/maps/swooper-earthlike.js",
      name: "LOC_MAP_SWOOPER_EARTHLIKE_NAME",
      sortIndex: 501,
    },
    {
      source: "config-db",
      domain: "StandardMaps",
      file: "{swooper-maps}/maps/swooper-earthlike.js",
      value: "{swooper-maps}/maps/swooper-earthlike.js",
      name: "LOC_MAP_SWOOPER_EARTHLIKE_NAME",
      description: "LOC_MAP_SWOOPER_EARTHLIKE_DESCRIPTION",
      sortIndex: 501,
    },
    ...(hiddenMapRowVisible && options.hiddenMapScript
      ? [
          {
            source: "setup-domain",
            file: options.hiddenMapScript,
            value: options.hiddenMapScript,
            name: "LOC_MAP_STUDIO_CURRENT_NAME",
            sortIndex: 9999,
          },
          {
            source: "config-db",
            domain: "StandardMaps",
            file: options.hiddenMapScript,
            value: options.hiddenMapScript,
            name: "LOC_MAP_STUDIO_CURRENT_NAME",
            description: "LOC_MAP_STUDIO_CURRENT_DESCRIPTION",
            sortIndex: 9999,
          },
        ]
      : []),
  ];
  const setupSnapshot = () => ({
    phase: inShell ? "shell" : loadingState === 8 ? "running-game" : "loading",
    ui: {
      inGame: { ok: true, value: !inShell },
      inShell: { ok: true, value: inShell },
      inLoading: { ok: true, value: loadingState !== 8 && !inShell },
      loadingState: { ok: true, value: loadingState },
      loadingStateName: loadingState === 8 ? "GameStarted" : "WaitingForUIReady",
      canBeginGame: { ok: true, value: loadingState === 6 && !inShell },
    },
    setup: {
      revision: { ok: true, value: setupRevision },
      parameters: [
        {
          id: "Map",
          exists: true,
          value: setupMapScript,
          possibleValues: visibleSetupRows(),
        },
        {
          id: "MapSize",
          exists: true,
          value: setupMapSize,
          possibleValues: [{ value: "MAPSIZE_SMALL" }, { value: "MAPSIZE_STANDARD" }],
        },
        { id: "MapRandomSeed", exists: true, value: setupMapSeed, possibleValues: [] },
        { id: "GameRandomSeed", exists: true, value: setupGameSeed, possibleValues: [] },
      ],
    },
    selectedMapRow: {
      source: "setup-domain",
      file: setupMapScript,
      value: setupMapScript,
      name: "LOC_MAP_SWOOPER_EARTHLIKE_NAME",
      sortIndex: 501,
    },
    mapRows: visibleMapRows(),
    config: {
      mapScript: { ok: true, value: setupMapScript },
      mapSize: { ok: true, value: setupMapSize },
      mapSeed: { ok: true, value: setupMapSeed },
      gameSeed: { ok: true, value: setupGameSeed },
    },
  });
  const server = createServer((socket) => {
    let buffer = Buffer.alloc(0);
    socket.on("data", (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
      for (;;) {
        const frame = parseRequest(buffer);
        if (!frame) return;
        buffer = buffer.subarray(frame.bytesRead);
        received.push(frame.message);
        if (frame.message === "LSQ:") {
          socket.write(
            encodeResponse(
              frame.listenerId,
              options.appUiOnlyStates ? ["65535", "App UI"] : ["65535", "App UI", "1", "Tuner"]
            )
          );
        } else if (frame.message === `CMD:65535:${CIV7_RESTART_COMMAND}`) {
          loadingState = 6;
          inShell = false;
          socket.write(encodeResponse(frame.listenerId, [options.restartOutput ?? "true"]));
        } else if (frame.message === 'CMD:65535:engine.call("exitToMainMenu")') {
          inShell = true;
          loadingState = 8;
          if (options.revealHiddenMapRowOnShellExit) hiddenMapRowVisible = true;
          socket.write(encodeResponse(frame.listenerId, ["null"]));
        } else if (frame.message === "CMD:65535:UI.reloadUI()") {
          socket.write(encodeResponse(frame.listenerId, ["null"]));
        } else if (frame.message === "CMD:65535:UI.notifyUIReady()") {
          if (options.closeOnBegin) {
            socket.destroy();
            continue;
          }
          loadingState = 8;
          inShell = false;
          socket.write(encodeResponse(frame.listenerId, ["null"]));
        } else if (frame.message.includes("editMap.setScript")) {
          if (options.closeOnSetupMutation) {
            socket.destroy();
            continue;
          }
          setupMapScript = "{swooper-maps}/maps/swooper-earthlike.js";
          setupMapSize = frame.message.includes('"mapSize":"MAPSIZE_SMALL"')
            ? "MAPSIZE_SMALL"
            : "MAPSIZE_STANDARD";
          setupMapSeed = frame.message.includes('"seed":333')
            ? 333
            : frame.message.includes('"seed":444')
              ? 444
              : 222;
          setupGameSeed = frame.message.includes('"gameSeed":223') ? 223 : setupGameSeed;
          setupRevision += 1;
          socket.write(
            encodeResponse(frame.listenerId, [
              JSON.stringify({
                before: setupSnapshot(),
                after: setupSnapshot(),
                applied: {
                  Map: setupMapScript,
                  MapSize: setupMapSize,
                  MapRandomSeed: setupMapSeed,
                  ...(setupGameSeed === 223 ? { GameRandomSeed: setupGameSeed } : {}),
                },
              }),
            ])
          );
        } else if (frame.message.includes("Network.hostGame")) {
          inShell = false;
          loadingState = 6;
          socket.write(encodeResponse(frame.listenerId, ['{"ok":true,"serverType":0}']));
        } else if (frame.message.includes("const rows = readSetupMapRows")) {
          const requestedFile = frame.message.includes(
            '"file":"{swooper-maps}/maps/studio-current.js"'
          )
            ? "{swooper-maps}/maps/studio-current.js"
            : frame.message.includes('"file":"{swooper-maps}/maps/swooper-earthlike.js"')
              ? "{swooper-maps}/maps/swooper-earthlike.js"
              : undefined;
          const rows = setupSnapshot().mapRows.filter(
            (row) => !requestedFile || row.file === requestedFile
          );
          socket.write(
            encodeResponse(frame.listenerId, [
              JSON.stringify({
                rows,
                limit: 100,
                matchedFile: requestedFile,
              }),
            ])
          );
        } else if (frame.message.includes("readSetupSnapshot")) {
          socket.write(
            encodeResponse(frame.listenerId, [JSON.stringify({ snapshot: setupSnapshot() })])
          );
        } else if (frame.message.includes("Autoplay.setActive(true)")) {
          autoplayActive = true;
          autoplayPaused = frame.message.includes("Autoplay.setPause(true)");
          socket.write(
            encodeResponse(frame.listenerId, ['{"ok":true,"isActive":true,"turns":-1}'])
          );
        } else if (frame.message.includes("Autoplay.setActive(false)")) {
          autoplayStopPendingReads = 1;
          autoplayPaused = true;
          socket.write(
            encodeResponse(frame.listenerId, [
              '{"ok":true,"isActive":true,"turns":-1,"isPaused":true,"isPausedOrPending":true}',
            ])
          );
        } else if (frame.message.includes("Network.isInSession")) {
          const snapshotAutoplayActive = autoplayStopPendingReads > 0 ? true : autoplayActive;
          const snapshotAutoplayPaused = autoplayStopPendingReads > 0 ? true : autoplayPaused;
          if (autoplayStopPendingReads > 0) {
            autoplayStopPendingReads -= 1;
            if (autoplayStopPendingReads === 0) {
              autoplayActive = false;
            }
          }
          socket.write(
            encodeResponse(frame.listenerId, [
              JSON.stringify(
                options.appUiSnapshotWithoutGameplayGlobals
                  ? {
                      network: {
                        isInSession: { ok: true, value: false },
                        numPlayers: { ok: true, value: 0 },
                        hostPlayerId: { ok: true, value: -1 },
                        isConnectedToNetwork: { ok: true, value: true },
                        isAuthenticated: { ok: true, value: false },
                        isLoggedIn: { ok: true, value: true },
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
                        turn: -1,
                        age: -1,
                        maxTurns: 0,
                        turnDate: { ok: false, error: "ReferenceError: Game is not defined" },
                        hash: { ok: false, error: "ReferenceError: Game is not defined" },
                      },
                      ui: {
                        inGame: { ok: true, value: false },
                        inShell: { ok: true, value: true },
                        inLoading: { ok: true, value: false },
                        loadingState: { ok: true, value: 8 },
                        loadingStateName: "GameStarted",
                        canBeginGame: { ok: true, value: false },
                        canNotifyUIReady: "function",
                        skipStartButton: { ok: true, value: false },
                        automationActive: { ok: true, value: false },
                      },
                      gameContext: {
                        localPlayerID: -1,
                        localObserverID: -1,
                        hasRequestedPause: {
                          ok: false,
                          error: "ReferenceError: GameContext is not defined",
                        },
                      },
                      players: {
                        maxPlayers: 0,
                        aliveIds: { ok: false, error: "ReferenceError: Players is not defined" },
                        aliveHumanIds: {
                          ok: false,
                          error: "ReferenceError: Players is not defined",
                        },
                        numAliveHumans: {
                          ok: false,
                          error: "ReferenceError: Players is not defined",
                        },
                      },
                      map: {
                        width: { ok: false, error: "ReferenceError: GameplayMap is not defined" },
                        height: { ok: false, error: "ReferenceError: GameplayMap is not defined" },
                        plotCount: {
                          ok: false,
                          error: "ReferenceError: GameplayMap is not defined",
                        },
                        mapSize: { ok: false, error: "ReferenceError: GameplayMap is not defined" },
                        randomSeed: {
                          ok: false,
                          error: "ReferenceError: GameplayMap is not defined",
                        },
                      },
                    }
                  : {
                      network: {
                        isInSession: { ok: true, value: true },
                        numPlayers: { ok: true, value: 1 },
                        hostPlayerId: { ok: true, value: 0 },
                        isConnectedToNetwork: { ok: true, value: true },
                        isAuthenticated: { ok: true, value: false },
                        isLoggedIn: { ok: true, value: true },
                      },
                      autoplay: {
                        isActive: snapshotAutoplayActive,
                        turns: -1,
                        isPaused: snapshotAutoplayPaused,
                        isPausedOrPending: snapshotAutoplayPaused,
                        observeAsPlayer: -1,
                        returnAsPlayer: -1,
                      },
                      game: {
                        turn: 1,
                        age: 0,
                        maxTurns: 0,
                        turnDate: { ok: true, value: "4000 BCE" },
                        hash: { ok: true, value: 0 },
                      },
                      ui: {
                        inGame: { ok: true, value: !inShell },
                        inShell: { ok: true, value: inShell },
                        inLoading: { ok: true, value: loadingState !== 8 && !inShell },
                        loadingState: { ok: true, value: loadingState },
                        loadingStateName: loadingState === 8 ? "GameStarted" : "WaitingForUIReady",
                        canBeginGame: { ok: true, value: loadingState === 6 && !inShell },
                        canNotifyUIReady: "function",
                        skipStartButton: { ok: true, value: false },
                        automationActive: { ok: true, value: false },
                      },
                      gameContext: {
                        localPlayerID: 0,
                        localObserverID: 0,
                        hasRequestedPause: { ok: true, value: false },
                      },
                      players: {
                        maxPlayers: 64,
                        aliveIds: { ok: true, value: [0] },
                        aliveHumanIds: { ok: true, value: [0] },
                        numAliveHumans: { ok: true, value: 1 },
                      },
                      map: {
                        width: { ok: true, value: setupMapSize === "MAPSIZE_SMALL" ? 70 : 84 },
                        height: { ok: true, value: setupMapSize === "MAPSIZE_SMALL" ? 44 : 54 },
                        plotCount: {
                          ok: true,
                          value: setupMapSize === "MAPSIZE_SMALL" ? 3080 : 4536,
                        },
                        mapSize: { ok: true, value: 0 },
                        randomSeed: {
                          ok: true,
                          value: options.postStartSeedOverride ?? setupMapSeed,
                        },
                      },
                    }
              ),
            ])
          );
        } else if (frame.message.includes("evalOk: 1 + 1")) {
          const tunerReady = options.tunerReady !== false;
          socket.write(
            encodeResponse(frame.listenerId, [
              JSON.stringify({
                evalOk: 2,
                ready: tunerReady,
                globals: {
                  Game: tunerReady ? "object" : "undefined",
                  Autoplay: "object",
                  GameplayMap: tunerReady ? "object" : "undefined",
                  Players: tunerReady ? "object" : "undefined",
                  Network: "undefined",
                },
                turn: { ok: true, value: 1 },
                turnDate: { ok: true, value: "4000 BCE" },
                width: tunerReady
                  ? { ok: true, value: setupMapSize === "MAPSIZE_SMALL" ? 70 : 84 }
                  : { ok: false, error: "GameplayMap unavailable" },
                height: tunerReady
                  ? { ok: true, value: setupMapSize === "MAPSIZE_SMALL" ? 44 : 54 }
                  : { ok: false, error: "GameplayMap unavailable" },
                aliveIds: tunerReady
                  ? { ok: true, value: [0, 1] }
                  : { ok: false, error: "Players unavailable" },
                aliveHumanIds: tunerReady
                  ? { ok: true, value: [0] }
                  : { ok: false, error: "Players unavailable" },
                autoplayActive: { ok: true, value: false },
              }),
            ])
          );
        } else if (frame.message.includes("MapRegions") && frame.message.includes("randomSeed")) {
          socket.write(
            encodeResponse(frame.listenerId, [
              JSON.stringify({
                map: {
                  width: { ok: true, value: setupMapSize === "MAPSIZE_SMALL" ? 70 : 84 },
                  height: { ok: true, value: setupMapSize === "MAPSIZE_SMALL" ? 44 : 54 },
                  plotCount: { ok: true, value: setupMapSize === "MAPSIZE_SMALL" ? 3080 : 4536 },
                  mapSize: { ok: true, value: 0 },
                  randomSeed: { ok: true, value: options.postStartSeedOverride ?? setupMapSeed },
                },
                game: {
                  turn: { ok: true, value: 1 },
                  age: { ok: true, value: 0 },
                  maxTurns: { ok: true, value: 0 },
                  turnDate: { ok: true, value: "4000 BCE" },
                  hash: { ok: true, value: 0 },
                },
                areas: {
                  areaIds: { ok: true, value: [1, 2] },
                  regionIds: { ok: true, value: [7] },
                  truncated: false,
                },
              }),
            ])
          );
        } else if (frame.message.includes("locationsFromBounds")) {
          socket.write(
            encodeResponse(frame.listenerId, [
              JSON.stringify({
                bounds: { x: 0, y: 0, width: 10_000, height: 10_000 },
                fields: ["terrain"],
                plotCount: 100_000_000,
                omitted: 99_999_999,
                hiddenInfoPolicy: "not-player-scoped",
                map: { width: { ok: true, value: 84 }, height: { ok: true, value: 54 } },
                plots: [
                  {
                    location: { x: 0, y: 0, index: { ok: true, value: 0 } },
                    hiddenInfoPolicy: "not-player-scoped",
                    facts: { terrain: { ok: true, value: 4 } },
                  },
                ],
              }),
            ])
          );
        } else if (frame.message.includes("readPlotSnapshot")) {
          socket.write(
            encodeResponse(frame.listenerId, [
              JSON.stringify({
                location: { x: 3, y: 4, index: { ok: true, value: 339 } },
                revealedState: { ok: true, value: 1 },
                visible: { ok: true, value: true },
                hiddenInfoPolicy: "visibility-filtered",
                facts: {
                  terrain: { ok: true, value: 4 },
                  resource: { ok: true, value: -1 },
                  revealedState: { ok: true, value: 1 },
                  visible: { ok: true, value: true },
                },
              }),
            ])
          );
        } else if (frame.message === "CMD:1:Visibility.revealAllPlots(0)") {
          revealedCount = 20;
          socket.write(encodeResponse(frame.listenerId, ["true"]));
        } else if (frame.message.includes("getPlotsRevealedCount")) {
          socket.write(
            encodeResponse(frame.listenerId, [
              JSON.stringify({
                playerId: 0,
                numPlotsRevealed: { ok: true, value: revealedCount },
                numPlotsVisible: { ok: true, value: revealedCount },
                counts: { "1": 2 },
                grid: {
                  bounds: { x: 0, y: 0, width: 2, height: 1 },
                  plotCount: 2,
                  omitted: 0,
                  states: [
                    {
                      x: 0,
                      y: 0,
                      state: { ok: true, value: 1 },
                      visible: { ok: true, value: true },
                    },
                    {
                      x: 1,
                      y: 0,
                      state: { ok: true, value: 1 },
                      visible: { ok: true, value: true },
                    },
                  ],
                },
              }),
            ])
          );
        } else if (frame.message.includes("GameInfo[input.table]")) {
          socket.write(
            encodeResponse(frame.listenerId, [
              JSON.stringify({
                table: "Resources",
                source: "GameInfo",
                rows: [{ ResourceType: "RESOURCE_COTTON" }],
                limit: 2,
                offset: 0,
                total: { ok: true, value: 1 },
                omittedUnknown: false,
              }),
            ])
          );
        } else if (frame.message.startsWith("CMD:65535:(() =>")) {
          socket.write(
            encodeResponse(frame.listenerId, [
              JSON.stringify([
                {
                  name: "Network",
                  type: "object",
                  exists: true,
                  ownKeys: ["isInSession"],
                  prototypeKeys: ["restartGame"],
                  enumerableKeys: ["isInSession", "restartGame"],
                  methods: [
                    {
                      name: "restartGame",
                      owner: "prototype",
                      length: 0,
                      signature: "function restartGame() { [native code] }",
                    },
                  ],
                },
              ]),
            ])
          );
        } else {
          socket.write(encodeResponse(frame.listenerId, ["2"]));
        }
      }
    });
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  return {
    received,
    address: () => server.address() as AddressInfo,
    close: async () => {
      server.close();
      await once(server, "close");
    },
  };
}

function parseRequest(buffer: Buffer): {
  listenerId: number;
  message: string;
  bytesRead: number;
} | null {
  if (buffer.length < 8) return null;
  const messageLength = buffer.readUInt32LE(0);
  const bytesRead = 8 + messageLength;
  if (buffer.length < bytesRead) return null;
  return {
    listenerId: buffer.readUInt32LE(4),
    message: buffer.subarray(8, bytesRead).toString("utf8").replace(/\0$/, ""),
    bytesRead,
  };
}

function encodeResponse(listenerId: number, parts: string[]): Buffer {
  const messageBytes = Buffer.from(`${parts.join("\0")}\0`, "utf8");
  const frame = Buffer.alloc(8 + messageBytes.length);
  frame.writeUInt32LE(messageBytes.length, 0);
  frame.writeUInt32LE(listenerId, 4);
  messageBytes.copy(frame, 8);
  return frame;
}
