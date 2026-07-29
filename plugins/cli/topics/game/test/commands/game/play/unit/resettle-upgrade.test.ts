import { describe, expect, test, vi } from "vitest";
import GamePlayUnitResettle from "../../../../../src/commands/game/play/unit/resettle";
import GamePlayUnitUpgrade from "../../../../../src/commands/game/play/unit/upgrade";
import { startPlayOperationTunerServer } from "../../../../support/play-operation-tuner-server";

describe("game play unit upgrade and resettle commands", () => {
  test("checks population resettle through the exact unit resettle procedure", async () => {
    const server = await startPlayOperationTunerServer();
    const writes: string[] = [];
    const log = vi
      .spyOn(GamePlayUnitResettle.prototype, "log")
      .mockImplementation((message?: string) => {
        if (message) writes.push(message);
      });
    try {
      const { port } = server.address();
      await GamePlayUnitResettle.run([
        "--host",
        "127.0.0.1",
        "--port",
        String(port),
        "--unit-id",
        '{"owner":0,"id":1703951,"type":26}',
        "--x",
        "17",
        "--y",
        "25",
        "--json",
      ]);

      const payload = JSON.parse(writes.join("")) as {
        ok: true;
        result: UnitCheckResult;
      };
      expect(payload.result).toEqual({
        action: {
          kind: "resettle",
          unitId: { owner: 0, id: 1703951, type: 26 },
          destination: { x: 17, y: 25 },
        },
        available: true,
      });
      expect(server.received.some((message) => message.includes("UNITCOMMAND_RESETTLE"))).toBe(
        true
      );
      expect(server.received.some((message) => message.includes('"X":17'))).toBe(true);
      expect(server.received.some((message) => message.includes('"Y":25'))).toBe(true);
      expect(unitCommandCalls(server.received, "checkUnitCommand")).toHaveLength(1);
      expect(unitCommandCalls(server.received, "sendUnitCommand")).toHaveLength(0);
      expect(genericUnitCommandCalls(server.received)).toHaveLength(0);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test("requests unit upgrade through the exact unit upgrade procedure", async () => {
    const server = await startPlayOperationTunerServer();
    const writes: string[] = [];
    const log = vi
      .spyOn(GamePlayUnitUpgrade.prototype, "log")
      .mockImplementation((message?: string) => {
        if (message) writes.push(message);
      });
    try {
      const { port } = server.address();
      await GamePlayUnitUpgrade.run([
        "--host",
        "127.0.0.1",
        "--port",
        String(port),
        "--unit-id",
        '{"owner":0,"id":1769488,"type":26}',
        "--send",
        "--json",
      ]);

      const payload = JSON.parse(writes.join("")) as {
        ok: true;
        result: UnitRequestResult;
      };
      expect(payload.result).toMatchObject({
        action: {
          kind: "upgrade",
          unitId: { owner: 0, id: 1769488, type: 26 },
        },
        status: "sent-confirmed",
        postcondition: {
          classification: "queue-advanced",
          outcome: "cleared",
          confidence: "confirmed",
          noRepeatAfterUnverified: false,
        },
        nextSteps: [
          {
            kind: "refresh-attention",
            source: "unit.upgrade.request",
          },
        ],
      });
      expectSemanticUnitRequestOmitsRawRuntimeDetails(payload.result);
      expect(server.received.some((message) => message.includes("UNITCOMMAND_UPGRADE"))).toBe(true);
      expect(unitCommandCalls(server.received, "checkUnitCommand")).toHaveLength(2);
      expect(unitCommandCalls(server.received, "sendUnitCommand")).toHaveLength(1);
      expect(genericUnitCommandCalls(server.received)).toHaveLength(0);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test("routes population resettle sends through the native unit resettle procedure", async () => {
    const server = await startPlayOperationTunerServer();
    const writes: string[] = [];
    const log = vi
      .spyOn(GamePlayUnitResettle.prototype, "log")
      .mockImplementation((message?: string) => {
        if (message) writes.push(message);
      });
    try {
      const { port } = server.address();
      await GamePlayUnitResettle.run([
        "--host",
        "127.0.0.1",
        "--port",
        String(port),
        "--unit-id",
        '{"owner":0,"id":1703951,"type":26}',
        "--x",
        "17",
        "--y",
        "25",
        "--send",
        "--json",
      ]);

      const payload = JSON.parse(writes.join("")) as {
        ok: true;
        result: UnitRequestResult;
      };
      expect(payload.result).toMatchObject({
        action: {
          kind: "resettle",
          unitId: { owner: 0, id: 1703951, type: 26 },
          destination: { x: 17, y: 25 },
        },
        status: "sent-confirmed",
        postcondition: {
          classification: "queue-advanced",
          confidence: "confirmed",
          noRepeatAfterUnverified: false,
        },
        nextSteps: [
          {
            kind: "refresh-attention",
            source: "unit.resettle.request",
          },
        ],
      });
      expectSemanticUnitRequestOmitsRawRuntimeDetails(payload.result);
      expect(server.received.some((message) => message.includes("UNITCOMMAND_RESETTLE"))).toBe(
        true
      );
      expect(server.received.some((message) => message.includes('"X":17'))).toBe(true);
      expect(server.received.some((message) => message.includes('"Y":25'))).toBe(true);
      expect(unitCommandCalls(server.received, "checkUnitCommand")).toHaveLength(2);
      expect(unitCommandCalls(server.received, "sendUnitCommand")).toHaveLength(1);
      expect(genericUnitCommandCalls(server.received)).toHaveLength(0);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });
});

type UnitCheckResult = {
  action: {
    kind: string;
    unitId: { owner: number; id: number; type: number };
    destination?: { x: number; y: number };
  };
  available: boolean;
};

type UnitRequestResult = {
  action: {
    kind: string;
    unitId: { owner: number; id: number; type: number };
    destination?: { x: number; y: number };
  };
  status: string;
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

function unitCommandCalls(
  messages: readonly string[],
  atom: "checkUnitCommand" | "sendUnitCommand"
) {
  return messages.filter((message) => message.includes(`return JSON.stringify(${atom}(`));
}

function genericUnitCommandCalls(messages: readonly string[]) {
  return messages.filter(
    (message) =>
      message.includes('return JSON.stringify(validateOperation("unit-command"') ||
      message.includes('return JSON.stringify(sendOperation("unit-command"')
  );
}

function expectSemanticUnitRequestOmitsRawRuntimeDetails(result: unknown) {
  const serialized = JSON.stringify(result);
  expect(serialized).not.toContain("CMD");
  expect(serialized).not.toContain("Game.UnitCommands");
  expect(serialized).not.toContain("Game.UnitOperations");
  expect(serialized).not.toContain('"host"');
  expect(serialized).not.toContain('"port"');
  expect(serialized).not.toContain('"state"');
  expect(serialized).not.toContain('"session"');
  expect(serialized).not.toContain('"rawCommand"');
  expect(serialized).not.toContain('"command"');
  expect(serialized).not.toContain('"operationType"');
  expect(serialized).not.toContain('"sendResult"');
  expect(serialized).not.toContain('"result"');
  expect(serialized).not.toContain('"verified"');
  expect(serialized).not.toContain('"before"');
  expect(serialized).not.toContain('"after"');
}
