import { describe, expect, test, vi } from "vitest";
import GamePlayChooseCelebration from "../../../../src/commands/game/play/choose-celebration";
import GamePlayChooseGovernment from "../../../../src/commands/game/play/choose-government";
import { type FakeTunerServer, startFakeTunerServer } from "../../../support/tuner-socket-server";

const governmentType = 7;
const governmentTypeName = "GOVERNMENT_CLASSICAL_REPUBLIC";
const activateAction = -1_326_475_004;
const sourceChoice = 101;
const goldenAgeType = -340_825_966;
const goldenAgeTypeName = "GOLDEN_AGE_CLASSICAL_REPUBLIC_1";

describe("game play celebration and government commands", () => {
  test("checks celebration availability through government.celebration.choice.check", async () => {
    const server = await startCelebrationGovernmentTunerServer();
    try {
      const payload = await runJsonCommand(GamePlayChooseCelebration, [
        ...endpointArgs(server),
        "--golden-age-type",
        String(goldenAgeType),
        "--json",
      ]);

      expect(payload.result).toEqual({
        goldenAgeType,
        available: true,
      });
      expect(
        server.received.some((message) =>
          message.includes("return JSON.stringify(checkCelebrationChoice(")
        )
      ).toBe(true);
      expect(
        server.received.some((message) =>
          message.includes("return JSON.stringify(sendCelebrationChoiceEnvelope(")
        )
      ).toBe(false);
      expect(server.received.some((message) => message.includes("validateOperation("))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test("requests celebration through government.celebration.choice.request", async () => {
    const server = await startCelebrationGovernmentTunerServer();
    try {
      const payload = await runJsonCommand(GamePlayChooseCelebration, [
        ...endpointArgs(server),
        "--golden-age-type",
        String(goldenAgeType),
        "--send",
        "--json",
      ]);

      expect(payload.result).toMatchObject({
        goldenAgeType,
        status: "sent-confirmed",
        postcondition: {
          classification: "celebration-selected",
          outcome: "selected",
          confidence: "confirmed",
          confirmed: true,
          noRepeatAfterUnverified: false,
        },
        nextSteps: [
          {
            kind: "refresh-attention",
            source: "government.celebration.choice.request",
          },
        ],
      });
      expectSemanticResultOmitsRuntimeAtoms(payload.result);
      const sendMessage = server.received.find((message) =>
        message.includes("return JSON.stringify(sendCelebrationChoiceEnvelope(")
      );
      expect(sendMessage).toContain('"expected":');
      expect(server.received.some((message) => message.includes('"playerId":'))).toBe(false);
      expect(server.received.some((message) => message.includes("validateOperation("))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test("checks government availability through government.choice.check", async () => {
    const server = await startCelebrationGovernmentTunerServer();
    try {
      const payload = await runJsonCommand(GamePlayChooseGovernment, [
        ...endpointArgs(server),
        "--government-type",
        String(governmentType),
        "--json",
      ]);

      expect(payload.result).toEqual({
        governmentType,
        available: true,
      });
      expect(
        server.received.some((message) =>
          message.includes("return JSON.stringify(checkGovernmentChoice(")
        )
      ).toBe(true);
      expect(
        server.received.some((message) =>
          message.includes("return JSON.stringify(sendGovernmentChoiceEnvelope(")
        )
      ).toBe(false);
      expect(server.received.some((message) => message.includes("validateOperation("))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test("requests government through government.choice.request with native Activate ownership", async () => {
    const server = await startCelebrationGovernmentTunerServer();
    try {
      const payload = await runJsonCommand(GamePlayChooseGovernment, [
        ...endpointArgs(server),
        "--government-type",
        String(governmentType),
        "--send",
        "--json",
      ]);

      expect(payload.result).toMatchObject({
        governmentType,
        status: "sent-confirmed",
        postcondition: {
          classification: "government-selected",
          outcome: "selected",
          confidence: "confirmed",
          confirmed: true,
          noRepeatAfterUnverified: false,
        },
        nextSteps: [
          {
            kind: "refresh-attention",
            source: "government.choice.request",
          },
        ],
      });
      expectSemanticResultOmitsRuntimeAtoms(payload.result);
      const sendMessage = server.received.find((message) =>
        message.includes("return JSON.stringify(sendGovernmentChoiceEnvelope(")
      );
      expect(sendMessage).toContain('"expected":');
      expect(server.received.some((message) => message.includes('"playerId":'))).toBe(false);
      expect(server.received.some((message) => message.includes('"action":'))).toBe(false);
      expect(server.received.some((message) => message.includes("validateOperation("))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test("does not expose caller-owned player, action, or legacy options flags", () => {
    expect(GamePlayChooseGovernment.flags).not.toHaveProperty("player-id");
    expect(GamePlayChooseGovernment.flags).not.toHaveProperty("action");
    expect(GamePlayChooseGovernment.flags).not.toHaveProperty("options");
    expect(GamePlayChooseCelebration.flags).not.toHaveProperty("player-id");
    expect(GamePlayChooseCelebration.flags).not.toHaveProperty("options");
  });
});

type CommandClass = {
  run(args: string[]): Promise<unknown>;
  prototype: { log(message?: string): void };
};

async function runJsonCommand(
  command: CommandClass,
  args: string[]
): Promise<{ ok: true; result: Record<string, unknown> }> {
  const writes: string[] = [];
  const log = vi.spyOn(command.prototype, "log").mockImplementation((message?: string) => {
    if (message) writes.push(message);
  });
  try {
    await command.run(args);
    return JSON.parse(writes.join("")) as { ok: true; result: Record<string, unknown> };
  } finally {
    log.mockRestore();
  }
}

function endpointArgs(server: FakeTunerServer): string[] {
  return ["--host", "127.0.0.1", "--port", String(server.address().port)];
}

async function startCelebrationGovernmentTunerServer(): Promise<FakeTunerServer> {
  let currentGovernmentType: number | null = null;
  let inGoldenAge = false;
  let currentGoldenAgeType: number | null = null;
  let goldenAgeTurnsLeft: number | null = null;
  let blockerLive = true;

  return startFakeTunerServer({
    handle({ message }) {
      if (message.includes("Network.isInSession")) {
        return [JSON.stringify(appUiSnapshot())];
      }
      if (message.includes("evalOk") && message.includes("GameplayMap.getGridWidth")) {
        return [JSON.stringify(tunerHealthSnapshot())];
      }
      if (message.includes("return JSON.stringify(sendGovernmentChoiceEnvelope(")) {
        const before = governmentSnapshot(currentGovernmentType, blockerLive);
        currentGovernmentType = governmentType;
        blockerLive = false;
        return [
          JSON.stringify({
            ok: true,
            value: {
              sent: true,
              validation: { valid: true, result: { Success: true } },
              before,
              after: governmentSnapshot(currentGovernmentType, blockerLive),
            },
          }),
        ];
      }
      if (message.includes("return JSON.stringify(checkGovernmentChoice(")) {
        return [
          JSON.stringify({
            valid: true,
            result: { Success: true },
            snapshot: governmentSnapshot(currentGovernmentType, blockerLive),
          }),
        ];
      }
      if (message.includes("return JSON.stringify(sendCelebrationChoiceEnvelope(")) {
        const before = celebrationSnapshot(
          inGoldenAge,
          currentGoldenAgeType,
          goldenAgeTurnsLeft,
          blockerLive
        );
        inGoldenAge = true;
        currentGoldenAgeType = goldenAgeType;
        goldenAgeTurnsLeft = 10;
        blockerLive = false;
        return [
          JSON.stringify({
            ok: true,
            value: {
              sent: true,
              validation: { valid: true, result: { Success: true } },
              before,
              after: celebrationSnapshot(
                inGoldenAge,
                currentGoldenAgeType,
                goldenAgeTurnsLeft,
                blockerLive
              ),
            },
          }),
        ];
      }
      if (message.includes("return JSON.stringify(checkCelebrationChoice(")) {
        return [
          JSON.stringify({
            valid: true,
            result: { Success: true },
            snapshot: celebrationSnapshot(
              inGoldenAge,
              currentGoldenAgeType,
              goldenAgeTurnsLeft,
              blockerLive
            ),
          }),
        ];
      }
      return undefined;
    },
  });
}

function governmentSnapshot(current: number | null, blockerLive: boolean) {
  return {
    localPlayerId: 0,
    currentGovernmentType: current,
    availableGovernments: [{ governmentType, governmentTypeName }],
    activateAction,
    ...blockerSnapshot(blockerLive, "NOTIFICATION_CHOOSE_GOVERNMENT"),
  };
}

function celebrationSnapshot(
  isInGoldenAge: boolean,
  currentGoldenAgeType: number | null,
  goldenAgeTurnsLeft: number | null,
  blockerLive: boolean
) {
  return {
    localPlayerId: 0,
    currentGovernmentType: null,
    availableGoldenAges: [{ sourceChoice, goldenAgeType, goldenAgeTypeName }],
    isInGoldenAge,
    currentGoldenAgeType,
    goldenAgeTurnsLeft,
    ...blockerSnapshot(blockerLive, "NOTIFICATION_CHOOSE_GOLDEN_AGE"),
  };
}

function blockerSnapshot(
  live: boolean,
  typeName: "NOTIFICATION_CHOOSE_GOVERNMENT" | "NOTIFICATION_CHOOSE_GOLDEN_AGE"
) {
  return {
    blocker: { ok: true, value: live ? 111 : 0 },
    blockingNotification: {
      ok: true,
      value: live
        ? {
            id: { owner: 0, id: 40, type: 20 },
            type: 111,
            typeName,
            target: { owner: -1, id: -1, type: 0 },
          }
        : null,
    },
  };
}

function appUiSnapshot() {
  return {
    state: { id: "65535", name: "App UI" },
    schemaVersion: "civ7-app-ui-snapshot.v1",
    gameContext: {
      localPlayerID: 0,
      localObserverID: 0,
      hasRequestedPause: { ok: true, value: false },
    },
    ui: {
      inGame: { ok: true, value: true },
      inShell: { ok: true, value: false },
      inLoading: { ok: true, value: false },
      canBeginGame: { ok: true, value: false },
    },
    errors: [],
  };
}

function tunerHealthSnapshot() {
  return {
    evalOk: 2,
    ready: true,
    globals: {
      hasGame: true,
      hasPlayers: true,
      hasGameInfo: true,
      hasUI: true,
      hasNetwork: true,
      hasGameplayMap: true,
      hasPlayerOperations: true,
      hasUnitCommands: true,
      hasCityCommands: true,
      gridWidth: { ok: true, value: 80 },
    },
  };
}

function expectSemanticResultOmitsRuntimeAtoms(result: unknown) {
  const serialized = JSON.stringify(result);
  expect(serialized).not.toContain('"localPlayerId"');
  expect(serialized).not.toContain('"activateAction"');
  expect(serialized).not.toContain('"availableGovernments"');
  expect(serialized).not.toContain('"availableGoldenAges"');
  expect(serialized).not.toContain('"blockingNotification"');
  expect(serialized).not.toContain('"validation"');
  expect(serialized).not.toContain('"before"');
  expect(serialized).not.toContain('"after"');
}
