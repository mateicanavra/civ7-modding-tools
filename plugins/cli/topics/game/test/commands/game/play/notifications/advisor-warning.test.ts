import { beforeEach, describe, expect, test, vi } from "vitest";

const target = { owner: 0, id: 12_345, type: 99 };
const { checkAdvisorWarning, createControlClient, requestAdvisorWarning } = vi.hoisted(() => ({
  checkAdvisorWarning: vi.fn(),
  createControlClient: vi.fn(),
  requestAdvisorWarning: vi.fn(),
}));

vi.mock("../../../../../src/adapters/control/service-client", () => ({
  createCiv7GameControlClient: createControlClient,
}));

import GamePlayNotificationsAdvisorWarning from "../../../../../src/commands/game/play/notifications/advisor-warning";

describe("game play notifications advisor-warning command", () => {
  beforeEach(() => {
    checkAdvisorWarning.mockReset();
    requestAdvisorWarning.mockReset();
    createControlClient.mockReset();
    createControlClient.mockReturnValue({
      notifications: {
        advisorWarning: {
          viewed: {
            check: checkAdvisorWarning,
            request: requestAdvisorWarning,
          },
        },
      },
    });
  });

  test("routes validation through the advisor-warning service check", async () => {
    checkAdvisorWarning.mockResolvedValue({
      target,
      available: true,
    });

    const payload = await runCommand([]);

    expect(createControlClient).toHaveBeenCalledWith({
      endpointDefaults: {
        host: "127.0.0.1",
        port: 4318,
        timeoutMs: 1_234,
      },
    });
    expect(checkAdvisorWarning).toHaveBeenCalledOnce();
    expect(checkAdvisorWarning).toHaveBeenCalledWith({ target });
    expect(requestAdvisorWarning).not.toHaveBeenCalled();
    expect(payload.result).toEqual({
      target,
      available: true,
    });
    expectSemanticAdvisorWarningOmitsRawRuntimeDetails(payload.result);
  });

  test("routes explicit sends through the advisor-warning service request", async () => {
    requestAdvisorWarning.mockResolvedValue({
      target,
      status: "sent-confirmed",
      postcondition: {
        classification: "advisor-warning-disappeared",
        reason: "The exact advisor warning disappeared after the request.",
        outcome: "cleared",
        confidence: "confirmed",
        confirmed: true,
        noRepeatAfterUnverified: false,
      },
      nextSteps: [
        {
          kind: "refresh-attention",
          source: "notifications.advisorWarning.viewed.request",
          label: "Refresh attention before the next action.",
        },
      ],
    });

    const payload = await runCommand(["--send"]);

    expect(requestAdvisorWarning).toHaveBeenCalledOnce();
    expect(requestAdvisorWarning).toHaveBeenCalledWith({ target });
    expect(checkAdvisorWarning).not.toHaveBeenCalled();
    expect(payload.result).toMatchObject({
      target,
      status: "sent-confirmed",
      postcondition: {
        classification: "advisor-warning-disappeared",
        outcome: "cleared",
        confidence: "confirmed",
        confirmed: true,
        noRepeatAfterUnverified: false,
      },
      nextSteps: [
        {
          kind: "refresh-attention",
          source: "notifications.advisorWarning.viewed.request",
        },
      ],
    });
    expectSemanticAdvisorWarningOmitsRawRuntimeDetails(payload.result);
  });

  test("has no caller-supplied player identity", () => {
    expect(GamePlayNotificationsAdvisorWarning.flags).not.toHaveProperty("player-id");
  });
});

async function runCommand(extraArgs: readonly string[]) {
  const writes: string[] = [];
  const log = vi
    .spyOn(GamePlayNotificationsAdvisorWarning.prototype, "log")
    .mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
  try {
    await GamePlayNotificationsAdvisorWarning.run([
      "--host",
      "127.0.0.1",
      "--port",
      "4318",
      "--timeout-ms",
      "1234",
      "--target",
      JSON.stringify(target),
      ...extraArgs,
      "--json",
    ]);
  } finally {
    log.mockRestore();
  }
  return JSON.parse(writes.join("")) as {
    ok: true;
    result: Record<string, unknown>;
  };
}

function expectSemanticAdvisorWarningOmitsRawRuntimeDetails(result: unknown) {
  const serialized = JSON.stringify(result);
  expect(serialized).not.toContain("CMD");
  expect(serialized).not.toContain("validateOperation");
  expect(serialized).not.toContain("sendOperation");
  expect(serialized).not.toContain('"playerId"');
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
