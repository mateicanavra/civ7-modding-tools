import { describe, expect, test, vi } from "vitest";
import GamePlayNotificationsAdvisorWarning from "../../../../../src/commands/game/play/notifications/advisor-warning";
import { startPlayOperationTunerServer } from "../../../../support/play-operation-tuner-server";

describe("game play notifications advisor-warning command", () => {
  test("validates the advisor warning without sending an operation", async () => {
    const server = await startPlayOperationTunerServer();
    const log = vi
      .spyOn(GamePlayNotificationsAdvisorWarning.prototype, "log")
      .mockImplementation(() => {});
    try {
      const { port } = server.address();
      await GamePlayNotificationsAdvisorWarning.run([
        "--host",
        "127.0.0.1",
        "--port",
        String(port),
        "--player-id",
        "0",
        "--target",
        '{"owner":0,"id":12345,"type":99}',
        "--json",
      ]);

      expect(
        server.received.some((message) => message.includes('validateOperation("player-operation"'))
      ).toBe(true);
      expect(server.received.some((message) => message.includes("VIEWED_ADVISOR_WARNING"))).toBe(
        true
      );
      expect(
        server.received.some((message) =>
          message.includes('"Target":{"owner":0,"id":12345,"type":99}')
        )
      ).toBe(true);
      expect(server.received.some((message) => message.includes("sendOperation("))).toBe(false);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test("requires a player id for validation mode", async () => {
    await expect(
      GamePlayNotificationsAdvisorWarning.run([
        "--target",
        '{"owner":0,"id":12345,"type":99}',
        "--json",
      ])
    ).rejects.toThrow("--player-id is required when validating advisor-warning without --send");
  });

  test("routes acknowledgement through the notifications service", async () => {
    const server = await startPlayOperationTunerServer();
    const writes: string[] = [];
    const log = vi
      .spyOn(GamePlayNotificationsAdvisorWarning.prototype, "log")
      .mockImplementation((message?: string) => {
        if (message) writes.push(message);
      });
    try {
      const { port } = server.address();
      await GamePlayNotificationsAdvisorWarning.run([
        "--host",
        "127.0.0.1",
        "--port",
        String(port),
        "--target",
        '{"owner":0,"id":12345,"type":99}',
        "--send",
        "--json",
      ]);

      const payload = JSON.parse(writes.join("")) as {
        ok: true;
        result: {
          playerId: number;
          target: { owner: number; id: number; type: number };
          sent: boolean;
          status: string;
          postcondition: {
            classification: string;
            noRepeatAfterUnverified: boolean;
          };
        };
      };
      expect(payload.result).toMatchObject({
        playerId: 0,
        target: { owner: 0, id: 12345, type: 99 },
        sent: true,
        status: "sent-unverified",
        postcondition: {
          classification: "pending-runtime-proof",
          noRepeatAfterUnverified: true,
        },
      });
      expectSemanticAdvisorWarningOmitsRawRuntimeDetails(payload.result);
      expect(server.received.some((message) => message.includes("VIEWED_ADVISOR_WARNING"))).toBe(
        true
      );
      expect(
        server.received.some((message) =>
          message.includes('"Target":{"owner":0,"id":12345,"type":99}')
        )
      ).toBe(true);
      expect(
        server.received.some((message) => message.includes('sendOperation("player-operation"'))
      ).toBe(true);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });
});

function expectSemanticAdvisorWarningOmitsRawRuntimeDetails(result: unknown) {
  const serialized = JSON.stringify(result);
  expect(serialized).not.toContain("CMD");
  expect(serialized).not.toContain("sendOperation");
  expect(serialized).not.toContain('"host"');
  expect(serialized).not.toContain('"port"');
  expect(serialized).not.toContain('"state"');
  expect(serialized).not.toContain('"session"');
  expect(serialized).not.toContain('"rawCommand"');
  expect(serialized).not.toContain('"command"');
  expect(serialized).not.toContain('"operation"');
  expect(serialized).not.toContain('"operationType"');
  expect(serialized).not.toContain("VIEWED_ADVISOR_WARNING");
  expect(serialized).not.toContain('"Target"');
  expect(serialized).not.toContain('"result"');
  expect(serialized).not.toContain('"verified"');
  expect(serialized).not.toContain('"before"');
  expect(serialized).not.toContain('"after"');
}
