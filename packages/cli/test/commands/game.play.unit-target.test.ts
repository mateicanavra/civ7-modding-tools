import { describe, expect, test, vi } from "vitest";
import GamePlayUnitTarget from "../../src/commands/game/play/unit-target";
import { type FakeTunerServer, startFakeTunerServer } from "./fixtures/tuner-socket-server";

describe("game play unit target command", () => {
  test("resolves unit target actions without sending by default", async () => {
    const server = await startUnitTargetTunerServer();
    try {
      const { port } = server.address();
      await GamePlayUnitTarget.run([
        "--host",
        "127.0.0.1",
        "--port",
        String(port),
        "--unit-id",
        '{"owner":0,"id":65536,"type":26}',
        "--x",
        "23",
        "--y",
        "33",
        "--json",
      ]);

      expect(server.received.some((message) => message.includes("readUnitTargetAction"))).toBe(
        true
      );
      expect(
        server.received.some((message) =>
          message.includes("operationType.replace(/^UNITOPERATION_/")
        )
      ).toBe(true);
      expect(server.received.some((message) => message.includes('"send":true'))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test("surfaces sent unit-target no-ops as postcondition misses", async () => {
    const server = await startUnitTargetTunerServer({ unitTargetMode: "no-op-after-send" });
    const writes: string[] = [];
    const log = vi
      .spyOn(GamePlayUnitTarget.prototype, "log")
      .mockImplementation((message?: string) => {
        if (message) writes.push(message);
      });
    try {
      const { port } = server.address();
      await GamePlayUnitTarget.run([
        "--host",
        "127.0.0.1",
        "--port",
        String(port),
        "--unit-id",
        '{"owner":0,"id":65536,"type":26}',
        "--x",
        "23",
        "--y",
        "33",
        "--send",
        "--json",
      ]);

      const payload = JSON.parse(writes.join("")) as {
        ok: true;
        result: UnitTargetActionSendResult;
      };
      expect(payload.result.sent).toBe(true);
      expect(payload.result.status).toBe("sent-unverified");
      expect(payload.result.validation).toMatchObject({
        candidateCount: 1,
        acceptedCandidateCount: 1,
        selected: {
          family: "unit-operation",
          operationType: "UNITOPERATION_RANGE_ATTACK",
          valid: true,
          targetInReturnedPlots: true,
          rejectedReason: null,
        },
      });
      expect(payload.result.postcondition).toMatchObject({
        classification: "no-state-change",
        outcome: "no-state-change",
        confidence: "unverified",
        confirmed: false,
        noRepeatAfterUnverified: true,
      });
      expect(payload.result.nextSteps[0]).toMatchObject({
        kind: "do-not-repeat",
        source: "unit.target.action.request",
      });
      expectSemanticUnitTargetOmitsRawRuntimeDetails(payload.result);
      expect(server.received.some((message) => message.includes('"send":true'))).toBe(true);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test("stabilizes delayed unit-target postconditions before returning", async () => {
    const server = await startUnitTargetTunerServer({ unitTargetMode: "delayed-after-send" });
    const writes: string[] = [];
    const log = vi
      .spyOn(GamePlayUnitTarget.prototype, "log")
      .mockImplementation((message?: string) => {
        if (message) writes.push(message);
      });
    try {
      const { port } = server.address();
      await GamePlayUnitTarget.run([
        "--host",
        "127.0.0.1",
        "--port",
        String(port),
        "--unit-id",
        '{"owner":0,"id":65536,"type":26}',
        "--x",
        "23",
        "--y",
        "33",
        "--send",
        "--json",
      ]);

      const payload = JSON.parse(writes.join("")) as {
        ok: true;
        result: UnitTargetActionSendResult;
      };
      expect(payload.result.sent).toBe(true);
      expect(payload.result.status).toBe("sent-confirmed");
      expect(payload.result.postcondition).toMatchObject({
        classification: "unit-state-changed",
        outcome: "state-changed",
        confidence: "confirmed",
        confirmed: true,
        noRepeatAfterUnverified: false,
        source: "bounded-poll",
      });
      expect(payload.result.nextSteps[0]).toMatchObject({
        kind: "refresh-attention",
        source: "unit.target.action.request",
      });
      expectSemanticUnitTargetOmitsRawRuntimeDetails(payload.result);
      expect(
        server.received.filter((message) => message.includes("readUnitTargetAction")).length
      ).toBeGreaterThan(1);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test("classifies sent MOVE_TO short landings as path shortfalls", async () => {
    const server = await startUnitTargetTunerServer({ unitTargetMode: "path-shortfall" });
    const writes: string[] = [];
    const log = vi
      .spyOn(GamePlayUnitTarget.prototype, "log")
      .mockImplementation((message?: string) => {
        if (message) writes.push(message);
      });
    try {
      const { port } = server.address();
      await GamePlayUnitTarget.run([
        "--host",
        "127.0.0.1",
        "--port",
        String(port),
        "--unit-id",
        '{"owner":0,"id":65536,"type":26}',
        "--x",
        "23",
        "--y",
        "33",
        "--send",
        "--json",
      ]);

      const payload = JSON.parse(writes.join("")) as {
        ok: true;
        result: UnitTargetActionSendResult;
      };
      expect(payload.result.sent).toBe(true);
      expect(payload.result.status).toBe("sent-guarded");
      expect(payload.result.postcondition).toMatchObject({
        classification: "path-shortfall",
        outcome: "state-changed",
        confidence: "confirmed",
        confirmed: true,
        noRepeatAfterUnverified: true,
        destinationReached: false,
        requestedLocation: { x: 23, y: 33 },
        landedLocation: { x: 22, y: 34 },
      });
      expect(payload.result.nextSteps[0]).toMatchObject({
        kind: "do-not-repeat",
        source: "unit.target.action.request",
      });
      expectSemanticUnitTargetOmitsRawRuntimeDetails(payload.result);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });
});

type UnitTargetActionSendResult = {
  unitId: { owner: number; id: number; type: number };
  target: { x: number; y: number };
  sent: boolean;
  status: string;
  validation: {
    candidateCount: number;
    acceptedCandidateCount: number;
    selected: null | {
      family: string;
      operationType: string;
      valid: boolean;
      targetInReturnedPlots: boolean | null;
      rejectedReason: string | null;
    };
  };
  postcondition: {
    classification: string;
    outcome: string;
    confidence: string;
    confirmed: boolean;
    noRepeatAfterUnverified: boolean;
    destinationReached: boolean | null;
    requestedLocation: { x: number; y: number };
    landedLocation: { x: number; y: number } | null;
    source: string | null;
  };
  nextSteps: Array<{ kind: string; source: string; label: string }>;
};

function expectSemanticUnitTargetOmitsRawRuntimeDetails(result: unknown) {
  const serialized = JSON.stringify(result);
  expect(serialized).not.toContain('"host"');
  expect(serialized).not.toContain('"port"');
  expect(serialized).not.toContain('"state"');
  expect(serialized).not.toContain('"session"');
  expect(serialized).not.toContain('"rawCommand"');
  expect(serialized).not.toContain('"command"');
  expect(serialized).not.toContain('"sendResult"');
  expect(serialized).not.toContain('"result"');
  expect(serialized).not.toContain('"verified"');
  expect(serialized).not.toContain('"verification"');
  expect(serialized).not.toContain('"beforeUnit"');
  expect(serialized).not.toContain('"afterUnit"');
  expect(serialized).not.toContain('"beforeTargetUnits"');
  expect(serialized).not.toContain('"afterTargetUnits"');
  expect(serialized).not.toContain("Game.UnitOperations");
  expect(serialized).not.toContain("Game.UnitCommands");
}

async function startUnitTargetTunerServer(
  options: {
    unitTargetMode?: "verified" | "no-op-after-send" | "path-shortfall" | "delayed-after-send";
  } = {}
): Promise<FakeTunerServer> {
  let unitTargetSendObserved = false;
  return startFakeTunerServer({
    handle({ message }) {
      if (message.includes("Network.isInSession")) {
        return [JSON.stringify(appUiSnapshot())];
      }
      if (message.includes("evalOk") && message.includes("GameplayMap.getGridWidth")) {
        return [JSON.stringify(tunerHealthSnapshot())];
      }
      if (message.includes("readUnitTargetAction")) {
        const send = message.includes('"send":true');
        if (send) unitTargetSendObserved = true;
        const mode =
          options.unitTargetMode === "delayed-after-send" && unitTargetSendObserved && !send
            ? "delayed-observed"
            : options.unitTargetMode;
        return [JSON.stringify(unitTargetAction(send, mode))];
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

function unitTargetAction(
  send: boolean,
  mode:
    | "verified"
    | "no-op-after-send"
    | "path-shortfall"
    | "delayed-after-send"
    | "delayed-observed" = "verified"
) {
  const unitId = { owner: 0, id: 65536, type: 26 };
  const beforeUnit = {
    ok: true,
    value: {
      id: unitId,
      location: { x: 22, y: 33 },
      movementMovesRemaining: 2,
      attacksRemaining: 1,
    },
  };
  const delayedObservedUnit = {
    ok: true,
    value: {
      id: unitId,
      location: { x: 22, y: 33 },
      movementMovesRemaining: 2,
      attacksRemaining: 0,
    },
  };
  const beforeTargetUnits = { ok: true, value: [{ owner: 62, id: 123, type: 26 }] };
  const verified = send && mode === "verified";
  const pathShortfall = send && mode === "path-shortfall";
  const delayedObserved = !send && mode === "delayed-observed";
  const selected =
    mode === "path-shortfall"
      ? {
          family: "unit-operation",
          operationType: "MOVE_TO",
          args: { X: 23, Y: 33, Modifiers: 3 },
          valid: true,
          result: { Success: true, Plots: [1457] },
          targetInReturnedPlots: true,
        }
      : {
          family: "unit-operation",
          operationType: "UNITOPERATION_RANGE_ATTACK",
          args: { X: 23, Y: 33, Modifiers: 3 },
          valid: true,
          result: { Success: true, Plots: [1457] },
          targetInReturnedPlots: true,
        };
  return {
    unitId,
    target: { x: 23, y: 33, index: { ok: true, value: 1457 } },
    beforeUnit: delayedObserved ? delayedObservedUnit : beforeUnit,
    beforeTargetUnits,
    candidates: [selected],
    selected,
    sent: send,
    ...(send
      ? {
          sendResult: { accepted: true },
          afterUnit:
            verified || pathShortfall
              ? {
                  ok: true,
                  value: {
                    id: unitId,
                    location: pathShortfall ? { x: 22, y: 34 } : { x: 22, y: 33 },
                    movementMovesRemaining: pathShortfall ? 0 : 2,
                    attacksRemaining: verified ? 0 : 1,
                  },
                }
              : beforeUnit,
          afterTargetUnits: beforeTargetUnits,
          verified: verified || pathShortfall,
          verification: {
            status: verified || pathShortfall ? "verified" : "no-state-change",
            classification: pathShortfall
              ? "path-shortfall"
              : verified
                ? "unit-state-changed"
                : "no-state-change",
            unitChanged: verified || pathShortfall,
            targetUnitsChanged: false,
            destinationReached: pathShortfall ? false : null,
            requestedLocation: { x: 23, y: 33 },
            landedLocation: pathShortfall ? { x: 22, y: 34 } : { x: 22, y: 33 },
            reason: pathShortfall
              ? "unit moved, but landed short of the requested target tile; re-read before issuing a follow-up move"
              : verified
                ? "unit state changed after send"
                : "send returned but unit and target-plot probes did not change; re-read before repeating",
          },
        }
      : {
          verification: {
            status: "not-sent",
            classification: "not-sent",
            unitChanged: false,
            targetUnitsChanged: false,
            destinationReached: null,
            requestedLocation: { x: 23, y: 33 },
            landedLocation: { x: 22, y: 33 },
            reason: "read-only target resolution; use --send to mutate",
          },
        }),
    notes: ["Selection follows the official right-click WorldInput target order."],
  };
}
