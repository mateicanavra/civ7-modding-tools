import { beforeEach, describe, expect, test, vi } from "vitest";

const { checkTarget, createControlClient, requestTarget } = vi.hoisted(() => ({
  checkTarget: vi.fn(),
  createControlClient: vi.fn(),
  requestTarget: vi.fn(),
}));

vi.mock("../../../../../src/adapters/control/service-client", () => ({
  createCiv7GameControlClient: createControlClient,
}));

import GamePlayUnitTarget from "../../../../../src/commands/game/play/unit/target";

const input = {
  unitId: { owner: 0, id: 65_536, type: 26 },
  x: 23,
  y: 33,
} as const;

describe("game play unit target command", () => {
  beforeEach(() => {
    checkTarget.mockReset();
    requestTarget.mockReset();
    createControlClient.mockReset();
    createControlClient.mockReturnValue({
      unit: {
        target: {
          action: {
            check: checkTarget,
            request: requestTarget,
          },
        },
      },
    });
  });

  test("routes read-only action resolution through the unit service", async () => {
    checkTarget.mockResolvedValue({
      unitId: input.unitId,
      target: { x: input.x, y: input.y },
      available: true,
      classification: "action-available",
      selectedAction: "ranged-attack",
    });

    const payload = await runCommand([]);

    expect(createControlClient).toHaveBeenCalledWith({
      endpointDefaults: {
        host: "127.0.0.1",
        port: 4318,
        timeoutMs: 1_234,
      },
    });
    expect(checkTarget).toHaveBeenCalledOnce();
    expect(checkTarget).toHaveBeenCalledWith(input);
    expect(requestTarget).not.toHaveBeenCalled();
    expect(payload.result).toMatchObject({
      available: true,
      classification: "action-available",
      selectedAction: "ranged-attack",
    });
    expectSemanticResult(payload.result);
  });

  test("routes explicit sends through the unit service", async () => {
    requestTarget.mockResolvedValue({
      unitId: input.unitId,
      target: { x: input.x, y: input.y },
      selectedAction: "move-to",
      status: "sent-confirmed",
      postcondition: {
        classification: "target-reached",
        reason: "The acting unit reached the requested target plot.",
        outcome: "target-reached",
        confidence: "confirmed",
        confirmed: true,
        noRepeatAfterUnverified: false,
      },
      nextSteps: [
        {
          kind: "refresh-attention",
          source: "unit.target.action.request",
          label: "Refresh current attention before choosing the next player action.",
        },
      ],
    });

    const payload = await runCommand(["--send"]);

    expect(requestTarget).toHaveBeenCalledOnce();
    expect(requestTarget).toHaveBeenCalledWith(input);
    expect(checkTarget).not.toHaveBeenCalled();
    expect(payload.result).toMatchObject({
      selectedAction: "move-to",
      status: "sent-confirmed",
      postcondition: {
        classification: "target-reached",
        confidence: "confirmed",
      },
    });
    expectSemanticResult(payload.result);
  });
});

async function runCommand(extraArgs: readonly string[]) {
  const writes: string[] = [];
  const log = vi
    .spyOn(GamePlayUnitTarget.prototype, "log")
    .mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
  try {
    await GamePlayUnitTarget.run([
      "--host",
      "127.0.0.1",
      "--port",
      "4318",
      "--timeout-ms",
      "1234",
      "--unit-id",
      JSON.stringify(input.unitId),
      "--x",
      String(input.x),
      "--y",
      String(input.y),
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

function expectSemanticResult(result: unknown) {
  const serialized = JSON.stringify(result);
  expect(serialized).not.toContain("CMD");
  expect(serialized).not.toContain('"host"');
  expect(serialized).not.toContain('"port"');
  expect(serialized).not.toContain('"rawCommand"');
  expect(serialized).not.toContain('"operationType"');
  expect(serialized).not.toContain('"validation"');
  expect(serialized).not.toContain('"before"');
  expect(serialized).not.toContain('"after"');
  expect(serialized).not.toContain("Game.UnitOperations");
  expect(serialized).not.toContain("Game.UnitCommands");
}
