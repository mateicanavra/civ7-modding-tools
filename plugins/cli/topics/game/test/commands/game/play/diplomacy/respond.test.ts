import { beforeEach, describe, expect, test, vi } from "vitest";

const { checkResponse, createControlClient, requestResponse } = vi.hoisted(() => ({
  checkResponse: vi.fn(),
  createControlClient: vi.fn(),
  requestResponse: vi.fn(),
}));

vi.mock("../../../../../src/adapters/control/service-client", () => ({
  createCiv7GameControlClient: createControlClient,
}));

import GamePlayDiplomacyRespond from "../../../../../src/commands/game/play/diplomacy/respond";

const input = {
  actionId: 8_821,
  responseType: 926_305_338,
} as const;

describe("game play diplomacy respond command", () => {
  beforeEach(() => {
    checkResponse.mockReset();
    requestResponse.mockReset();
    createControlClient.mockReset();
    createControlClient.mockReturnValue({
      diplomacy: {
        response: {
          check: checkResponse,
          request: requestResponse,
        },
      },
    });
  });

  test("routes read-only availability through the ordinary diplomacy service", async () => {
    checkResponse.mockResolvedValue({
      ...input,
      available: true,
      classification: "ordinary-response",
    });

    const payload = await runCommand([]);

    expect(createControlClient).toHaveBeenCalledWith({
      endpointDefaults: {
        host: "127.0.0.1",
        port: 4318,
        timeoutMs: 1_234,
      },
    });
    expect(checkResponse).toHaveBeenCalledOnce();
    expect(checkResponse).toHaveBeenCalledWith(input);
    expect(requestResponse).not.toHaveBeenCalled();
    expect(payload.result).toEqual({
      ...input,
      available: true,
      classification: "ordinary-response",
    });
    expectSemanticDiplomacyResponseOmitsRawRuntimeDetails(payload.result);
  });

  test("routes explicit sends through the ordinary diplomacy service", async () => {
    requestResponse.mockResolvedValue({
      ...input,
      status: "sent-confirmed",
      postcondition: {
        classification: "diplomacy-response-cleared",
        reason: "The exact diplomacy-response blocker cleared after dispatch.",
        outcome: "cleared",
        confidence: "confirmed",
        confirmed: true,
        noRepeatAfterUnverified: false,
      },
      nextSteps: [
        {
          kind: "refresh-attention",
          source: "diplomacy.response.request",
          label: "Refresh current attention before choosing the next player action.",
        },
      ],
    });

    const payload = await runCommand(["--send"]);

    expect(requestResponse).toHaveBeenCalledOnce();
    expect(requestResponse).toHaveBeenCalledWith(input);
    expect(checkResponse).not.toHaveBeenCalled();
    expect(payload.result).toMatchObject({
      ...input,
      status: "sent-confirmed",
      postcondition: {
        classification: "diplomacy-response-cleared",
        outcome: "cleared",
        confidence: "confirmed",
      },
    });
    expectSemanticDiplomacyResponseOmitsRawRuntimeDetails(payload.result);
  });

  test("exposes ambient player identity and no UI-activation input", () => {
    expect(GamePlayDiplomacyRespond.flags).not.toHaveProperty("player-id");
    expect(GamePlayDiplomacyRespond.flags).not.toHaveProperty("notification-id");
  });
});

async function runCommand(extraArgs: readonly string[]) {
  const writes: string[] = [];
  const log = vi
    .spyOn(GamePlayDiplomacyRespond.prototype, "log")
    .mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
  try {
    await GamePlayDiplomacyRespond.run([
      "--host",
      "127.0.0.1",
      "--port",
      "4318",
      "--timeout-ms",
      "1234",
      "--action-id",
      String(input.actionId),
      "--response-type",
      String(input.responseType),
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

function expectSemanticDiplomacyResponseOmitsRawRuntimeDetails(result: unknown) {
  const serialized = JSON.stringify(result);
  expect(serialized).not.toContain("CMD");
  expect(serialized).not.toContain("validateOperation");
  expect(serialized).not.toContain("sendOperation");
  expect(serialized).not.toContain('"playerId"');
  expect(serialized).not.toContain('"notificationId"');
  expect(serialized).not.toContain('"host"');
  expect(serialized).not.toContain('"port"');
  expect(serialized).not.toContain('"state"');
  expect(serialized).not.toContain('"session"');
  expect(serialized).not.toContain('"rawCommand"');
  expect(serialized).not.toContain('"command"');
  expect(serialized).not.toContain('"operationType"');
  expect(serialized).not.toContain('"verified"');
  expect(serialized).not.toContain('"before"');
  expect(serialized).not.toContain('"after"');
  expect(serialized).not.toContain("Game.PlayerOperations");
}
