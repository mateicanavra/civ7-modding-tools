import { once } from "node:events";
import { type AddressInfo, createServer } from "node:net";
import { runInNewContext } from "node:vm";
import { Value } from "typebox/value";
import { describe, expect, test } from "vitest";

import * as directControl from "../src/index";
import {
  canStartCiv7PlayerOperation,
  checkCiv7CelebrationChoice,
  checkCiv7GovernmentChoice,
  requestCiv7PlayerOperation,
  sendCiv7CelebrationChoice,
  sendCiv7GovernmentChoice,
} from "../src/index";
import { liveCiv7DirectControl } from "../src/live-control";

type GovernmentCall = Readonly<{
  kind: "canStart" | "sendRequest";
  playerId: unknown;
  operationType: unknown;
  args: unknown;
  queue?: unknown;
}>;

type GovernmentServerOptions = Readonly<{
  blockerKind?: "government" | "celebration";
  canStartResult?: unknown;
  sendError?: Error;
  sendResult?: unknown;
}>;

type FakeGovernmentServer = Readonly<{
  calls: GovernmentCall[];
  blockerReads: number[];
  commandExecutions: string[];
  address(): AddressInfo;
  close(): Promise<void>;
}>;

const governmentType = 2;
const governmentTypeName = "GOVERNMENT_CLASSICAL_REPUBLIC";
const activateAction = -1_326_475_004;
const goldenAgeSourceChoice = 41;
const goldenAgeType = -340_825_966;
const goldenAgeTypeName = "GOLDEN_AGE_CLASSICAL_REPUBLIC_1";
const governmentBlocker = 732_288_881;
const celebrationBlocker = -1_503_342_402;
const notificationId = { owner: 0, id: 6, type: 20 };

describe("exact native government-domain choice atoms", () => {
  test("publishes bounded check/send atoms and raw schemas only", () => {
    expect(directControl).toMatchObject({
      checkCiv7GovernmentChoice: expect.any(Function),
      sendCiv7GovernmentChoice: expect.any(Function),
      checkCiv7CelebrationChoice: expect.any(Function),
      sendCiv7CelebrationChoice: expect.any(Function),
      Civ7GovernmentChoiceInputSchema: expect.any(Object),
      Civ7GovernmentChoiceCheckResultSchema: expect.any(Object),
      Civ7GovernmentChoiceSendResultSchema: expect.any(Object),
      Civ7GovernmentChoiceSnapshotSchema: expect.any(Object),
      Civ7CelebrationChoiceInputSchema: expect.any(Object),
      Civ7CelebrationChoiceCheckResultSchema: expect.any(Object),
      Civ7CelebrationChoiceSendResultSchema: expect.any(Object),
      Civ7CelebrationChoiceSnapshotSchema: expect.any(Object),
    });
    expect(liveCiv7DirectControl).toMatchObject({
      checkCiv7GovernmentChoice,
      sendCiv7GovernmentChoice,
      checkCiv7CelebrationChoice,
      sendCiv7CelebrationChoice,
    });
    expect("requestCiv7GovernmentChoice" in directControl).toBe(false);
    expect("requestCiv7CelebrationChoice" in directControl).toBe(false);
    expect("requestCiv7GovernmentDomainChoice" in directControl).toBe(false);
    expect("governmentChoiceProofPostcondition" in directControl).toBe(false);
    expect(Value.Check(directControl.Civ7GovernmentChoiceInputSchema, { governmentType })).toBe(
      true
    );
    expect(
      Value.Check(directControl.Civ7GovernmentChoiceInputSchema, {
        playerId: 0,
        governmentType,
        action: activateAction,
      })
    ).toBe(false);
    expect(Value.Check(directControl.Civ7CelebrationChoiceInputSchema, { goldenAgeType })).toBe(
      true
    );
    expect(
      Value.Check(directControl.Civ7CelebrationChoiceInputSchema, {
        playerId: 0,
        goldenAgeType,
      })
    ).toBe(false);
  });

  test.each([
    "CHANGE_GOVERNMENT",
    "PLAYEROPERATION_CHANGE_GOVERNMENT",
    "CHOOSE_GOLDEN_AGE",
    "PLAYEROPERATION_CHOOSE_GOLDEN_AGE",
  ])("refuses %s through generic player-operation paths before dispatch", async (operationType) => {
    for (const run of [canStartCiv7PlayerOperation, requestCiv7PlayerOperation]) {
      await expect(
        run(
          {
            playerId: 0,
            operationType,
            args: operationType.includes("GOLDEN_AGE")
              ? { GoldenAgeType: goldenAgeType }
              : { GovernmentType: governmentType, Action: activateAction },
          },
          { host: "127.0.0.1", port: 1, timeoutMs: 10 }
        )
      ).rejects.toMatchObject({
        name: "Civ7DirectControlError",
        dispatchStatus: "not-dispatched",
      });
    }
  });

  test("checks government choice with official picker facts and fixed ambient Activate", async () => {
    const server = await startGovernmentServer({ blockerKind: "government" });
    try {
      const result = await checkCiv7GovernmentChoice({ governmentType }, tunerOptions(server));

      expect(result).toEqual({
        valid: true,
        result: { Success: true },
        snapshot: expectedGovernmentSnapshot({
          currentGovernmentType: -1,
          blocker: governmentBlocker,
          blockerTypeName: "NOTIFICATION_CHOOSE_GOVERNMENT",
        }),
      });
      expect(server.calls).toEqual([
        {
          kind: "canStart",
          playerId: 0,
          operationType: "CHANGE_GOVERNMENT",
          args: { GovernmentType: governmentType, Action: activateAction },
          queue: false,
        },
      ]);
      expect(server.blockerReads).toEqual([governmentBlocker]);
      expect(server.commandExecutions).toHaveLength(1);
    } finally {
      await server.close();
    }
  });

  test("freshly validates and sends government choice once with before/after observations", async () => {
    const server = await startGovernmentServer({ blockerKind: "government" });
    try {
      const result = await sendCiv7GovernmentChoice(
        governmentSendInput(governmentType),
        tunerOptions(server)
      );

      expect(result).toEqual({
        sent: true,
        validation: { valid: true, result: { Success: true } },
        before: expectedGovernmentSnapshot({
          currentGovernmentType: -1,
          blocker: governmentBlocker,
          blockerTypeName: "NOTIFICATION_CHOOSE_GOVERNMENT",
        }),
        after: expectedGovernmentSnapshot({
          currentGovernmentType: governmentType,
          blocker: 0,
          blockerTypeName: null,
        }),
      });
      expect(result).not.toHaveProperty("postcondition");
      expect(result).not.toHaveProperty("verified");
      expect(server.calls).toEqual([
        {
          kind: "canStart",
          playerId: 0,
          operationType: "CHANGE_GOVERNMENT",
          args: { GovernmentType: governmentType, Action: activateAction },
          queue: false,
        },
        {
          kind: "sendRequest",
          playerId: 0,
          operationType: "CHANGE_GOVERNMENT",
          args: { GovernmentType: governmentType, Action: activateAction },
        },
      ]);
    } finally {
      await server.close();
    }
  });

  test("checks and sends celebration choice through lookup/hash-derived availability", async () => {
    const server = await startGovernmentServer({ blockerKind: "celebration" });
    try {
      const checked = await checkCiv7CelebrationChoice({ goldenAgeType }, tunerOptions(server));
      expect(checked).toEqual({
        valid: true,
        result: { Success: true },
        snapshot: expectedCelebrationSnapshot({
          active: false,
          blocker: celebrationBlocker,
          blockerTypeName: "NOTIFICATION_CHOOSE_GOLDEN_AGE",
        }),
      });

      const sent = await sendCiv7CelebrationChoice(
        celebrationSendInput(goldenAgeType),
        tunerOptions(server)
      );
      expect(sent).toEqual({
        sent: true,
        validation: { valid: true, result: { Success: true } },
        before: expectedCelebrationSnapshot({
          active: false,
          blocker: celebrationBlocker,
          blockerTypeName: "NOTIFICATION_CHOOSE_GOLDEN_AGE",
        }),
        after: expectedCelebrationSnapshot({
          active: true,
          blocker: 0,
          blockerTypeName: null,
        }),
      });
      expect(server.calls).toEqual([
        {
          kind: "canStart",
          playerId: 0,
          operationType: "CHOOSE_GOLDEN_AGE",
          args: { GoldenAgeType: goldenAgeType },
          queue: false,
        },
        {
          kind: "canStart",
          playerId: 0,
          operationType: "CHOOSE_GOLDEN_AGE",
          args: { GoldenAgeType: goldenAgeType },
          queue: false,
        },
        {
          kind: "sendRequest",
          playerId: 0,
          operationType: "CHOOSE_GOLDEN_AGE",
          args: { GoldenAgeType: goldenAgeType },
        },
      ]);
    } finally {
      await server.close();
    }
  });

  test("uses exact native Success as authority while retaining options as observation", async () => {
    const invalidServer = await startGovernmentServer({
      blockerKind: "government",
      canStartResult: { Success: false, FailureReasons: ["blocked"] },
    });
    const unavailableServer = await startGovernmentServer({ blockerKind: "celebration" });
    try {
      const invalid = await sendCiv7GovernmentChoice(
        governmentSendInput(governmentType),
        tunerOptions(invalidServer)
      );
      const observedOnly = await sendCiv7CelebrationChoice(
        celebrationSendInput(123),
        tunerOptions(unavailableServer)
      );

      expect(invalid).toMatchObject({
        sent: false,
        validation: {
          valid: false,
          result: { Success: false, FailureReasons: ["blocked"] },
        },
      });
      expect(observedOnly).toMatchObject({
        sent: true,
        validation: { valid: true, result: { Success: true } },
      });
      expect(invalidServer.calls.filter((call) => call.kind === "sendRequest")).toEqual([]);
      expect(unavailableServer.calls.filter((call) => call.kind === "sendRequest")).toEqual([
        expect.objectContaining({
          args: { GoldenAgeType: 123 },
        }),
      ]);
    } finally {
      await invalidServer.close();
      await unavailableServer.close();
    }
  });

  test("refuses dispatch when fresh admission evidence differs from the expected snapshot", async () => {
    const server = await startGovernmentServer({ blockerKind: "government" });
    try {
      await expect(
        sendCiv7GovernmentChoice(
          {
            governmentType,
            expected: expectedGovernmentSnapshot({
              currentGovernmentType: -1,
              blocker: 0,
              blockerTypeName: null,
            }),
          },
          tunerOptions(server)
        )
      ).rejects.toMatchObject({
        name: "Civ7DirectControlError",
        dispatchStatus: "not-dispatched",
      });
      expect(server.calls).toEqual([]);
    } finally {
      await server.close();
    }
  });

  test.each([
    true,
    false,
    null,
    {},
    { success: true },
    { Success: 1 },
  ])("requires the official object Success boolean from canStart: %j", async (canStartResult) => {
    const server = await startGovernmentServer({ canStartResult });
    try {
      await expect(
        sendCiv7GovernmentChoice(governmentSendInput(governmentType), tunerOptions(server))
      ).rejects.toMatchObject({
        name: "Civ7DirectControlError",
        dispatchStatus: "not-dispatched",
      });
      expect(server.calls.filter((call) => call.kind === "sendRequest")).toEqual([]);
    } finally {
      await server.close();
    }
  });

  test("classifies input failure before dispatch and send failure after invocation", async () => {
    await expect(
      sendCiv7GovernmentChoice(governmentSendInput(1.5), {
        host: "127.0.0.1",
        port: 1,
        timeoutMs: 10,
      })
    ).rejects.toMatchObject({
      name: "Civ7DirectControlError",
      dispatchStatus: "not-dispatched",
    });

    const server = await startGovernmentServer({ sendError: new Error("government send failed") });
    try {
      await expect(
        sendCiv7GovernmentChoice(governmentSendInput(governmentType), tunerOptions(server))
      ).rejects.toMatchObject({
        name: "Civ7DirectControlError",
        dispatchStatus: "dispatched",
      });
      expect(server.calls.filter((call) => call.kind === "sendRequest")).toHaveLength(1);
    } finally {
      await server.close();
    }
  });

  test.each([
    false,
    undefined,
  ])("treats an invoked sendRequest returning %j as dispatched", async (sendResult) => {
    const server = await startGovernmentServer({ sendResult });
    try {
      const result = await sendCiv7GovernmentChoice(
        governmentSendInput(governmentType),
        tunerOptions(server)
      );
      expect(result.sent).toBe(true);
      expect(server.calls.filter((call) => call.kind === "sendRequest")).toHaveLength(1);
    } finally {
      await server.close();
    }
  });
});

async function startGovernmentServer(
  options: GovernmentServerOptions = {}
): Promise<FakeGovernmentServer> {
  const calls: GovernmentCall[] = [];
  const blockerReads: number[] = [];
  const commandExecutions: string[] = [];
  const runtime = {
    currentGovernmentType: -1,
    currentGoldenAge: null as number | null,
    goldenAgeTurnsLeft: null as number | null,
    blocker: options.blockerKind === "celebration" ? celebrationBlocker : governmentBlocker,
  };
  const globals = {
    Database: {
      makeHash: (typeName: unknown) => (typeName === goldenAgeTypeName ? goldenAgeType : 0),
    },
    GameContext: { localPlayerID: 0 },
    GameInfo: {
      StartingGovernments: [{ GovernmentType: governmentTypeName }],
      Governments: {
        lookup: (typeName: unknown) =>
          typeName === governmentTypeName
            ? { $index: governmentType, GovernmentType: governmentTypeName }
            : null,
      },
      GoldenAges: {
        lookup: (choice: unknown) =>
          choice === goldenAgeSourceChoice ? { GoldenAgeType: goldenAgeTypeName } : null,
      },
    },
    PlayerOperationParameters: { Activate: activateAction },
    PlayerOperationTypes: {
      CHANGE_GOVERNMENT: "CHANGE_GOVERNMENT",
      CHOOSE_GOLDEN_AGE: "CHOOSE_GOLDEN_AGE",
    },
    Players: {
      get: (playerId: unknown) =>
        playerId === 0
          ? {
              Culture: {
                getGovernmentType: () => runtime.currentGovernmentType,
                getGoldenAgeChoices: () =>
                  runtime.currentGoldenAge === null ? [goldenAgeSourceChoice] : [],
              },
              Happiness: {
                isInGoldenAge: () => runtime.currentGoldenAge !== null,
                getCurrentGoldenAge: () => runtime.currentGoldenAge,
                getGoldenAgeTurnsLeft: () => runtime.goldenAgeTurnsLeft,
              },
            }
          : null,
    },
    Game: {
      Notifications: {
        getEndTurnBlockingType: () => {
          blockerReads.push(runtime.blocker);
          return runtime.blocker;
        },
        findEndTurnBlocking: () => (runtime.blocker === 0 ? null : notificationId),
        find: () => ({ Target: null }),
        getType: () => runtime.blocker,
        getTypeName: () =>
          runtime.blocker === governmentBlocker
            ? "NOTIFICATION_CHOOSE_GOVERNMENT"
            : runtime.blocker === celebrationBlocker
              ? "NOTIFICATION_CHOOSE_GOLDEN_AGE"
              : null,
      },
      PlayerOperations: {
        canStart: (playerId: unknown, operationType: unknown, args: unknown, queue: unknown) => {
          calls.push({
            kind: "canStart",
            playerId,
            operationType,
            args: jsonClone(args),
            queue,
          });
          return Object.prototype.hasOwnProperty.call(options, "canStartResult")
            ? options.canStartResult
            : { Success: true };
        },
        sendRequest: (playerId: unknown, operationType: unknown, args: unknown) => {
          calls.push({
            kind: "sendRequest",
            playerId,
            operationType,
            args: jsonClone(args),
          });
          if (options.sendError) throw options.sendError;
          if (operationType === "CHANGE_GOVERNMENT") {
            runtime.currentGovernmentType = governmentType;
          } else {
            runtime.currentGoldenAge = goldenAgeSourceChoice;
            runtime.goldenAgeTurnsLeft = 10;
          }
          runtime.blocker = 0;
          return options.sendResult;
        },
      },
    },
  };
  const server = createServer((socket) => {
    let buffer = Buffer.alloc(0);
    socket.on("data", (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
      for (;;) {
        const frame = parseRequest(buffer);
        if (!frame) return;
        buffer = buffer.subarray(frame.bytesRead);
        if (frame.message === "LSQ:") {
          socket.write(encodeResponse(frame.listenerId, ["65535", "App UI", "1", "Tuner"]));
          continue;
        }
        const commandMatch = frame.message.match(/^CMD:([^:]+):(.*)$/s);
        if (!commandMatch) continue;
        const command = commandMatch[2] ?? "";
        commandExecutions.push(command);
        try {
          const output = runInNewContext(command, globals);
          socket.write(encodeResponse(frame.listenerId, [String(output)]));
        } catch (error) {
          socket.write(encodeResponse(frame.listenerId, [String(error)]));
        }
      }
    });
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  return {
    calls,
    blockerReads,
    commandExecutions,
    address: () => server.address() as AddressInfo,
    close: async () => {
      server.close();
      await once(server, "close");
    },
  };
}

function expectedGovernmentSnapshot(input: {
  currentGovernmentType: number;
  blocker: number;
  blockerTypeName: string | null;
}) {
  return {
    localPlayerId: 0,
    currentGovernmentType: input.currentGovernmentType,
    availableGovernments: [{ governmentType, governmentTypeName }],
    activateAction,
    ...blockerEvidence(input.blocker, input.blockerTypeName),
  };
}

function expectedCelebrationSnapshot(input: {
  active: boolean;
  blocker: number;
  blockerTypeName: string | null;
}) {
  return {
    localPlayerId: 0,
    currentGovernmentType: -1,
    availableGoldenAges: input.active
      ? []
      : [{ sourceChoice: goldenAgeSourceChoice, goldenAgeType, goldenAgeTypeName }],
    isInGoldenAge: input.active,
    currentGoldenAgeType: input.active ? goldenAgeType : null,
    goldenAgeTurnsLeft: input.active ? 10 : null,
    ...blockerEvidence(input.blocker, input.blockerTypeName),
  };
}

function governmentSendInput(target: number) {
  return {
    governmentType: target,
    expected: expectedGovernmentSnapshot({
      currentGovernmentType: -1,
      blocker: governmentBlocker,
      blockerTypeName: "NOTIFICATION_CHOOSE_GOVERNMENT",
    }),
  };
}

function celebrationSendInput(target: number) {
  return {
    goldenAgeType: target,
    expected: expectedCelebrationSnapshot({
      active: false,
      blocker: celebrationBlocker,
      blockerTypeName: "NOTIFICATION_CHOOSE_GOLDEN_AGE",
    }),
  };
}

function blockerEvidence(blocker: number, blockerTypeName: string | null) {
  return {
    blocker: { ok: true as const, value: blocker },
    blockingNotification: {
      ok: true as const,
      value:
        blockerTypeName === null
          ? null
          : {
              id: notificationId,
              type: blocker,
              typeName: blockerTypeName,
              target: null,
            },
    },
  };
}

function tunerOptions(server: FakeGovernmentServer) {
  const { port } = server.address();
  return { host: "127.0.0.1", port, timeoutMs: 1_000 };
}

function jsonClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function parseRequest(buffer: Buffer): {
  listenerId: number;
  message: string;
  bytesRead: number;
} | null {
  if (buffer.length < 8) return null;
  const messageLength = buffer.readUInt32LE(0);
  const bytesRead = 8 + messageLength;
  if (buffer.length < bytesRead) return null;
  return {
    listenerId: buffer.readUInt32LE(4),
    message: buffer.subarray(8, bytesRead).toString("utf8").replace(/\0$/, ""),
    bytesRead,
  };
}

function encodeResponse(listenerId: number, parts: readonly string[]): Buffer {
  const messageBytes = Buffer.from(`${parts.join("\0")}\0`, "utf8");
  const frame = Buffer.alloc(8 + messageBytes.length);
  frame.writeUInt32LE(messageBytes.length, 0);
  frame.writeUInt32LE(listenerId, 4);
  messageBytes.copy(frame, 8);
  return frame;
}
