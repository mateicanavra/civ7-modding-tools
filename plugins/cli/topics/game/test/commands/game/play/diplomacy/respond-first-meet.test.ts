import { beforeEach, describe, expect, test, vi } from "vitest";

const { checkFirstMeetResponse, createControlClient, requestFirstMeetResponse } = vi.hoisted(
  () => ({
    checkFirstMeetResponse: vi.fn(),
    createControlClient: vi.fn(),
    requestFirstMeetResponse: vi.fn(),
  })
);

vi.mock("../../../../../src/adapters/control/service-client", () => ({
  createCiv7GameControlClient: createControlClient,
}));

import GamePlayDiplomacyRespondFirstMeet from "../../../../../src/commands/game/play/diplomacy/respond-first-meet";

const input = {
  metPlayerId: 2,
  response: "neutral",
} as const;

describe("game play diplomacy respond-first-meet command", () => {
  beforeEach(() => {
    checkFirstMeetResponse.mockReset();
    requestFirstMeetResponse.mockReset();
    createControlClient.mockReset();
    createControlClient.mockReturnValue({
      diplomacy: {
        firstMeet: {
          response: {
            check: checkFirstMeetResponse,
            request: requestFirstMeetResponse,
          },
        },
      },
    });
  });

  test("routes read-only availability through the first-meet service", async () => {
    checkFirstMeetResponse.mockResolvedValue({
      ...input,
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
    expect(checkFirstMeetResponse).toHaveBeenCalledOnce();
    expect(checkFirstMeetResponse).toHaveBeenCalledWith(input);
    expect(requestFirstMeetResponse).not.toHaveBeenCalled();
    expect(payload.result).toEqual({
      ...input,
      available: true,
    });
    expectSemanticFirstMeetResponseOmitsRawRuntimeDetails(payload.result);
  });

  test("routes explicit sends through the first-meet service", async () => {
    requestFirstMeetResponse.mockResolvedValue({
      ...input,
      status: "sent-confirmed",
      postcondition: {
        classification: "first-meet-cleared",
        reason: "The exact first-meet blocker cleared after dispatch.",
        outcome: "cleared",
        confidence: "confirmed",
        confirmed: true,
        noRepeatAfterUnverified: false,
      },
      nextSteps: [
        {
          kind: "refresh-attention",
          source: "diplomacy.firstMeet.response.request",
          label: "Refresh current attention before choosing the next player action.",
        },
      ],
    });

    const payload = await runCommand(["--send"]);

    expect(requestFirstMeetResponse).toHaveBeenCalledOnce();
    expect(requestFirstMeetResponse).toHaveBeenCalledWith(input);
    expect(checkFirstMeetResponse).not.toHaveBeenCalled();
    expect(payload.result).toMatchObject({
      ...input,
      status: "sent-confirmed",
      postcondition: {
        classification: "first-meet-cleared",
        outcome: "cleared",
        confidence: "confirmed",
        confirmed: true,
        noRepeatAfterUnverified: false,
      },
    });
    expectSemanticFirstMeetResponseOmitsRawRuntimeDetails(payload.result);
  });

  test("exposes only named responses and ambient player identity", () => {
    expect(GamePlayDiplomacyRespondFirstMeet.flags).not.toHaveProperty("player-id");
    expect(GamePlayDiplomacyRespondFirstMeet.flags).not.toHaveProperty("response-type");
    expect(GamePlayDiplomacyRespondFirstMeet.flags.response.options).toEqual([
      "friendly",
      "neutral",
      "unfriendly",
    ]);
  });
});

async function runCommand(extraArgs: readonly string[]) {
  const writes: string[] = [];
  const log = vi
    .spyOn(GamePlayDiplomacyRespondFirstMeet.prototype, "log")
    .mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
  try {
    await GamePlayDiplomacyRespondFirstMeet.run([
      "--host",
      "127.0.0.1",
      "--port",
      "4318",
      "--timeout-ms",
      "1234",
      "--met-player-id",
      String(input.metPlayerId),
      "--response",
      input.response,
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

function expectSemanticFirstMeetResponseOmitsRawRuntimeDetails(result: unknown) {
  const serialized = JSON.stringify(result);
  expect(serialized).not.toContain("CMD");
  expect(serialized).not.toContain("validateOperation");
  expect(serialized).not.toContain("sendOperation");
  expect(serialized).not.toContain('"playerId"');
  expect(serialized).not.toContain('"responseType"');
  expect(serialized).not.toContain('"host"');
  expect(serialized).not.toContain('"port"');
  expect(serialized).not.toContain('"state"');
  expect(serialized).not.toContain('"session"');
  expect(serialized).not.toContain('"rawCommand"');
  expect(serialized).not.toContain('"command"');
  expect(serialized).not.toContain('"operation"');
  expect(serialized).not.toContain('"operationType"');
  expect(serialized).not.toContain('"result"');
  expect(serialized).not.toContain('"verified"');
  expect(serialized).not.toContain('"before"');
  expect(serialized).not.toContain('"after"');
  expect(serialized).not.toContain("Game.PlayerOperations");
}
