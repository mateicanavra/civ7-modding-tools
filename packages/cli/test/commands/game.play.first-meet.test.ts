import { describe, expect, test, vi } from "vitest";
import GamePlayRespondFirstMeet from "../../src/commands/game/play/respond-first-meet";
import { type FakeTunerServer, startFakeTunerServer } from "./fixtures/tuner-socket-server";

describe("game play first-meet diplomacy command", () => {
  test("wraps first-meet diplomacy as RESPOND_DIPLOMATIC_FIRST_MEET", async () => {
    const server = await startFirstMeetTunerServer();
    try {
      const { port } = server.address();
      await runCommand(GamePlayRespondFirstMeet, [
        "--host",
        "127.0.0.1",
        "--port",
        String(port),
        "--player-id",
        "0",
        "--met-player-id",
        "2",
        "--response",
        "neutral",
        "--json",
      ]);

      expect(
        server.received.some((message) => message.includes("RESPOND_DIPLOMATIC_FIRST_MEET"))
      ).toBe(true);
      expect(server.received.some((message) => message.includes('"Player1":0'))).toBe(true);
      expect(server.received.some((message) => message.includes('"Player2":2'))).toBe(true);
      expect(server.received.some((message) => message.includes('"Type":673478009'))).toBe(true);
      expect(server.received.some((message) => message.includes("sendOperation("))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test("reports first-meet notification postconditions after send", async () => {
    const server = await startFirstMeetTunerServer();
    const writes: string[] = [];
    const log = vi
      .spyOn(GamePlayRespondFirstMeet.prototype, "log")
      .mockImplementation((message?: string) => {
        if (message) writes.push(message);
      });
    try {
      const { port } = server.address();
      await GamePlayRespondFirstMeet.run([
        "--host",
        "127.0.0.1",
        "--port",
        String(port),
        "--met-player-id",
        "2",
        "--response",
        "neutral",
        "--send",
        "--json",
      ]);

      const payload = JSON.parse(writes.join("")) as {
        ok: true;
        result: FirstMeetResponseSendResult;
      };
      expect(payload.result.sent).toBe(true);
      expect(payload.result.status).toBe("sent-confirmed");
      expect(payload.result.playerId).toBe(0);
      expect(payload.result.metPlayerId).toBe(2);
      expect(payload.result.responseType).toBe(673478009);
      expect(payload.result.validation).toEqual({ beforeValid: true, afterValid: true });
      expect(payload.result.postcondition.classification).toBe("first-meet-cleared");
      expect(payload.result.postcondition).toMatchObject({
        outcome: "cleared",
        confidence: "confirmed",
        confirmed: true,
        noRepeatAfterUnverified: false,
      });
      expect(payload.result.nextSteps[0]).toMatchObject({
        kind: "refresh-attention",
        source: "diplomacy.firstMeet.response.request",
      });
      expectSemanticFirstMeetResponseOmitsRawRuntimeDetails(payload.result);
      expect(
        server.received.some((message) => message.includes("RESPOND_DIPLOMATIC_FIRST_MEET"))
      ).toBe(true);
      expect(
        server.received.some((message) => message.includes('sendOperation("player-operation"'))
      ).toBe(true);
      expect(server.received.some((message) => message.includes("readPlayNotifications"))).toBe(
        true
      );
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test("does not verify first-meet sends while the same blocker remains live", async () => {
    const server = await startFirstMeetTunerServer({ firstMeetMode: "sticky" });
    const writes: string[] = [];
    const log = vi
      .spyOn(GamePlayRespondFirstMeet.prototype, "log")
      .mockImplementation((message?: string) => {
        if (message) writes.push(message);
      });
    try {
      const { port } = server.address();
      await GamePlayRespondFirstMeet.run([
        "--host",
        "127.0.0.1",
        "--port",
        String(port),
        "--met-player-id",
        "2",
        "--response",
        "neutral",
        "--send",
        "--timeout-ms",
        "1000",
        "--json",
      ]);

      const payload = JSON.parse(writes.join("")) as {
        ok: true;
        result: FirstMeetResponseSendResult;
      };
      expect(payload.result.sent).toBe(true);
      expect(payload.result.status).toBe("sent-unverified");
      expect(payload.result.postcondition.classification).toBe("first-meet-sticky-blocker");
      expect(payload.result.postcondition.confirmed).toBe(false);
      expect(payload.result.postcondition.noRepeatAfterUnverified).toBe(true);
      expect(payload.result.postcondition.reason).toContain(
        "same first-meet notification still blocks"
      );
      expect(payload.result.nextSteps).toEqual([
        {
          kind: "do-not-repeat",
          source: "diplomacy.firstMeet.response.request",
          label:
            "Do not repeat this first-meet response until fresh attention and first-meet evidence is read.",
        },
      ]);
      expect(
        server.received.some((message) => message.includes('sendOperation("player-operation"'))
      ).toBe(true);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });
});

type FirstMeetTunerServer = FakeTunerServer;

type CommandClass = {
  run(args: string[]): Promise<unknown>;
  prototype: { log(message?: string): void };
};

type FirstMeetResponseSendResult = {
  playerId: number;
  metPlayerId: number;
  responseType: number;
  sent: boolean;
  status: string;
  validation: { beforeValid: boolean; afterValid: boolean };
  postcondition: {
    classification: string;
    reason: string;
    outcome: string;
    confidence: string;
    confirmed: boolean;
    noRepeatAfterUnverified: boolean;
  };
  nextSteps: Array<{ kind: string; source: string; label: string }>;
};

function expectSemanticFirstMeetResponseOmitsRawRuntimeDetails(result: unknown) {
  const serialized = JSON.stringify(result);
  expect(serialized).not.toContain('"host"');
  expect(serialized).not.toContain('"port"');
  expect(serialized).not.toContain('"state"');
  expect(serialized).not.toContain('"session"');
  expect(serialized).not.toContain('"rawCommand"');
  expect(serialized).not.toContain('"command"');
  expect(serialized).not.toContain('"payload"');
  expect(serialized).not.toContain('"verified"');
  expect(serialized).not.toContain('"before"');
  expect(serialized).not.toContain('"after"');
  expect(serialized).not.toContain("Game.PlayerOperations");
}

async function runCommand(command: CommandClass, args: string[]) {
  const log = vi.spyOn(command.prototype, "log").mockImplementation(() => {});
  try {
    await command.run(args);
  } finally {
    log.mockRestore();
  }
}

async function startFirstMeetTunerServer(
  options: { firstMeetMode?: "cleared" | "sticky" } = {}
): Promise<FirstMeetTunerServer> {
  let firstMeetSent = false;
  return startFakeTunerServer({
    handle({ message }) {
      if (message.includes("Network.isInSession")) {
        return [JSON.stringify(appUiSnapshot())];
      }
      if (message.includes("evalOk") && message.includes("GameplayMap.getGridWidth")) {
        return [JSON.stringify(tunerHealthSnapshot())];
      }
      if (message.includes("readPlayNotifications")) {
        const mode =
          firstMeetSent && (options.firstMeetMode ?? "cleared") === "cleared"
            ? "ready-unit"
            : "first-meet";
        return [JSON.stringify(firstMeetNotificationView(mode))];
      }
      if (message.includes("DiplomacyPlayerFirstMeets")) {
        return [
          JSON.stringify({
            key: "PLAYER_REALATIONSHIP_FIRSTMEET_NEUTRAL",
            value: 673478009,
          }),
        ];
      }
      if (message.includes("return JSON.stringify(validateOperation")) {
        return [
          JSON.stringify({
            host: "127.0.0.1",
            port: 0,
            state: { id: "1", name: "Tuner", role: "tuner" },
            family: "player-operation",
            operationType: "RESPOND_DIPLOMATIC_FIRST_MEET",
            enumValue: "RESPOND_DIPLOMATIC_FIRST_MEET",
            target: { playerId: 0 },
            args: { Player1: 0, Player2: 2, Type: 673478009 },
            valid: true,
            result: { Success: true },
          }),
        ];
      }
      if (message.includes("return JSON.stringify(sendOperation")) {
        firstMeetSent = true;
        return [JSON.stringify({ sent: true })];
      }
      return undefined;
    },
  });
}

function appUiSnapshot() {
  return {
    network: {
      isInSession: { ok: true, value: true },
      numPlayers: { ok: true, value: 1 },
      hostPlayerId: { ok: true, value: 0 },
      isConnectedToNetwork: { ok: true, value: true },
      isAuthenticated: { ok: true, value: false },
      isLoggedIn: { ok: true, value: true },
    },
    autoplay: {
      isActive: false,
      turns: -1,
      isPaused: false,
      isPausedOrPending: false,
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
      inGame: { ok: true, value: true },
      inShell: { ok: true, value: false },
      inLoading: { ok: true, value: false },
      loadingState: { ok: true, value: 6 },
      loadingStateName: "WaitingForUIReady",
      canBeginGame: { ok: true, value: true },
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
      width: { ok: true, value: 84 },
      height: { ok: true, value: 54 },
      plotCount: { ok: true, value: 4536 },
      mapSize: { ok: true, value: 0 },
      randomSeed: { ok: true, value: 1 },
    },
  };
}

function tunerHealthSnapshot() {
  return {
    evalOk: 2,
    ready: true,
    globals: {
      Game: "object",
      Autoplay: "object",
      GameplayMap: "object",
      Players: "object",
      Network: "undefined",
    },
    turn: { ok: true, value: 1 },
    turnDate: { ok: true, value: "4000 BCE" },
    width: { ok: true, value: 84 },
    height: { ok: true, value: 54 },
    aliveIds: { ok: true, value: [0] },
    aliveHumanIds: { ok: true, value: [0] },
    autoplayActive: { ok: true, value: false },
  };
}

function firstMeetNotificationView(mode: "first-meet" | "ready-unit") {
  if (mode === "ready-unit") {
    return {
      localPlayerId: 0,
      turn: { ok: true, value: 27 },
      turnDate: { ok: true, value: "3350 BCE" },
      hasSentTurnComplete: { ok: true, value: false },
      canEndTurn: { ok: true, value: false },
      blocker: { ok: true, value: 0 },
      blockingNotificationId: { ok: true, value: null },
      selectedUnitId: { ok: true, value: null },
      selectedCityId: { ok: true, value: null },
      firstReadyUnitId: { ok: true, value: null },
      notifications: [],
      decisions: [],
      hud: { nextDecision: null, decisionQueue: [] },
      limits: { maxNotifications: 25, truncated: false },
    };
  }
  const decision = {
    category: "first-meet-diplomacy",
    operationFamily: "player-operation",
    operationType: "RESPOND_DIPLOMATIC_FIRST_MEET",
    argsShape: "{ Player1, Player2, Type }",
    cli: "game play respond-first-meet",
    requiredInputs: [
      { name: "Player1", source: "local player id", required: true },
      { name: "Player2", source: "met player id", required: true },
      { name: "Type", source: "chosen first-meet greeting", required: true },
    ],
    commonActions: [
      {
        label: "send neutral first-meet greeting",
        cli: "game play respond-first-meet --met-player-id 2 --response neutral --send",
        operationFamily: "player-operation",
        operationType: "RESPOND_DIPLOMATIC_FIRST_MEET",
        argsShape: "{ Player1, Player2, Type }",
        when: "after validating the greeting options from the live first-meet UI",
      },
    ],
    notes: ["First-meet greetings are real player operations, not notification dismissals."],
    details: {
      kind: "first-meet-diplomacy",
      player1: 0,
      player2: 2,
      responses: [
        {
          response: "neutral",
          type: { ok: true, value: 673478009 },
          args: { Player1: 0, Player2: 2, Type: 673478009 },
          validation: { ok: true, value: { Success: true } },
        },
      ],
      recommendedResponse: "neutral",
    },
  };
  const notification = {
    id: { owner: 0, id: 44, type: 20 },
    type: 44,
    typeName: "NOTIFICATION_PLAYER_MET",
    groupType: null,
    summary: "You have met Ashoka, World Renouncer of Mauryan Empire.",
    message: "You have met a new Civilization",
    target: { owner: -1, id: -1, type: 0 },
    location: { x: 4, y: 2 },
    player: 2,
    canUserDismiss: false,
    expired: false,
    dismissed: false,
    isEndTurnBlocking: true,
    decision,
    details: decision.details,
  };
  return {
    localPlayerId: 0,
    turn: { ok: true, value: 27 },
    turnDate: { ok: true, value: "3350 BCE" },
    hasSentTurnComplete: { ok: true, value: false },
    canEndTurn: { ok: true, value: false },
    blocker: { ok: true, value: 523279636 },
    blockingNotificationId: { ok: true, value: notification.id },
    selectedUnitId: { ok: true, value: null },
    selectedCityId: { ok: true, value: null },
    firstReadyUnitId: { ok: true, value: null },
    notifications: [notification],
    decisions: [decision],
    hud: {
      nextDecision: {
        notificationId: notification.id,
        isEndTurnBlocking: true,
        typeName: notification.typeName,
        summary: notification.summary,
        message: notification.message,
        target: notification.target,
        location: notification.location,
        player: notification.player,
        details: notification.details,
        ...decision,
      },
      decisionQueue: [
        {
          notificationId: notification.id,
          isEndTurnBlocking: true,
          typeName: notification.typeName,
          summary: notification.summary,
          message: notification.message,
          target: notification.target,
          location: notification.location,
          player: notification.player,
          details: notification.details,
          ...decision,
        },
      ],
    },
    limits: { maxNotifications: 25, truncated: false },
  };
}
