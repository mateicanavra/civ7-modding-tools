import { describe, expect, test, vi } from "vitest";
import GamePlayResettleUnit from "../../../../src/commands/game/play/resettle-unit";
import GamePlayUpgradeUnit from "../../../../src/commands/game/play/upgrade-unit";
import { startPlayOperationTunerServer } from "../../../support/play-operation-tuner-server";

describe("game play operation wrapper commands", () => {
  test("wraps population resettle as a unit command with target coordinates", async () => {
    const server = await startPlayOperationTunerServer();
    try {
      const { port } = server.address();
      await runCommand(GamePlayResettleUnit, [
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

      expect(
        server.received.some((message) => message.includes('validateOperation("unit-command"'))
      ).toBe(true);
      expect(server.received.some((message) => message.includes("UNITCOMMAND_RESETTLE"))).toBe(
        true
      );
      expect(server.received.some((message) => message.includes('"X":17'))).toBe(true);
      expect(server.received.some((message) => message.includes('"Y":25'))).toBe(true);
      expect(server.received.some((message) => message.includes("sendOperation("))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test("wraps unit upgrade as an unit command", async () => {
    const server = await startPlayOperationTunerServer();
    const writes: string[] = [];
    const log = vi
      .spyOn(GamePlayUpgradeUnit.prototype, "log")
      .mockImplementation((message?: string) => {
        if (message) writes.push(message);
      });
    try {
      const { port } = server.address();
      await GamePlayUpgradeUnit.run([
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
        sent: true,
        status: "sent-confirmed",
        validation: {
          beforeValid: true,
          afterValid: true,
        },
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
      expect(
        server.received.some((message) => message.includes('sendOperation("unit-command"'))
      ).toBe(true);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test("routes population resettle sends through the native unit resettle procedure", async () => {
    const server = await startPlayOperationTunerServer();
    const writes: string[] = [];
    const log = vi
      .spyOn(GamePlayResettleUnit.prototype, "log")
      .mockImplementation((message?: string) => {
        if (message) writes.push(message);
      });
    try {
      const { port } = server.address();
      await GamePlayResettleUnit.run([
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
        sent: true,
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
    } finally {
      log.mockRestore();
      await server.close();
    }
  });
});

type UnitRequestResult = {
  action: {
    kind: string;
    unitId: { owner: number; id: number; type: number };
    destination?: { x: number; y: number };
  };
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

type CommandClass = {
  run(args: string[]): Promise<unknown>;
  prototype: { log(message?: string): void };
};

async function runCommand(command: CommandClass, args: string[]) {
  const log = vi.spyOn(command.prototype, "log").mockImplementation(() => {});
  try {
    await command.run(args);
  } finally {
    log.mockRestore();
  }
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
