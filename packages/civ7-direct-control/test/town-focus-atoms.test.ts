import { once } from "node:events";
import { type AddressInfo, createServer } from "node:net";
import { runInNewContext } from "node:vm";
import { Value } from "typebox/value";
import { describe, expect, test } from "vitest";

import * as directControl from "../src/index";
import {
  canStartCiv7CityCommand,
  canStartCiv7CityOperation,
  checkCiv7TownFocusChange,
  checkCiv7TownFocusReview,
  requestCiv7CityCommand,
  requestCiv7CityOperation,
  sendCiv7TownFocusChange,
  sendCiv7TownFocusReview,
} from "../src/index";
import { liveCiv7DirectControl } from "../src/live-control";

type TownFocusCall = Readonly<{
  kind: "canStart" | "changeSend" | "reviewSend";
  cityId: unknown;
  operationType: unknown;
  args: unknown;
  queue?: unknown;
}>;

type FakeTownFocusTunerServer = Readonly<{
  calls: TownFocusCall[];
  commandExecutions: string[];
  commandStateIds: string[];
  runtimeErrors: unknown[];
  address(): AddressInfo;
  close(): Promise<void>;
}>;

type TownFocusTunerOptions = Readonly<{
  canStartError?: Error;
  canStartResult?: unknown;
  changeSendError?: Error;
  changeSendResult?: unknown;
  commandResponseParts?: ReadonlyArray<string>;
  missingNotificationApis?: boolean;
  missingChangeCommandType?: "container" | "member";
  missingReviewOperationType?: "container" | "member";
  notificationTarget?: unknown;
  notificationType?: unknown;
  notificationTypeName?: unknown;
  observedCityId?: unknown;
  reviewSendError?: Error;
  reviewSendResult?: unknown;
}>;

const cityId = { owner: 0, id: 131_073, type: 1 };
const otherCityId = { owner: 0, id: 131_074, type: 1 };
const oldGrowthType = -284_569_333;
const oldProjectType = -548_685_232;
const nextGrowthType = 1_822_554_425;
const nextProjectType = 713_967_338;
const blockerType = 17;
const notificationType = 1_090_224_621;

describe("exact town-focus wire atoms", () => {
  test("publishes the bounded atom schemas and removes the legacy request/proof facade", () => {
    expect(directControl).toMatchObject({
      checkCiv7TownFocusChange: expect.any(Function),
      sendCiv7TownFocusChange: expect.any(Function),
      checkCiv7TownFocusReview: expect.any(Function),
      sendCiv7TownFocusReview: expect.any(Function),
      Civ7TownFocusChangeInputSchema: expect.any(Object),
      Civ7TownFocusReviewInputSchema: expect.any(Object),
      Civ7TownFocusSnapshotSchema: expect.any(Object),
      Civ7TownFocusChangeValidationResultSchema: expect.any(Object),
      Civ7TownFocusChangeCheckResultSchema: expect.any(Object),
      Civ7TownFocusChangeSendResultSchema: expect.any(Object),
      Civ7TownFocusReviewCheckResultSchema: expect.any(Object),
      Civ7TownFocusReviewSendResultSchema: expect.any(Object),
    });
    expect(liveCiv7DirectControl).toMatchObject({
      checkCiv7TownFocusChange,
      sendCiv7TownFocusChange,
      checkCiv7TownFocusReview,
      sendCiv7TownFocusReview,
    });
    expect("requestCiv7TownFocus" in directControl).toBe(false);
    expect("requestCiv7TownFocusChange" in directControl).toBe(false);
    expect("requestCiv7TownFocusReviewCloseout" in directControl).toBe(false);
    expect("townFocusProofPostcondition" in directControl).toBe(false);

    expect(
      Value.Check(directControl.Civ7TownFocusChangeInputSchema, {
        cityId,
        growthType: nextGrowthType,
        projectType: nextProjectType,
      })
    ).toBe(true);
    expect(
      Value.Check(directControl.Civ7TownFocusChangeInputSchema, {
        cityId,
        growthType: 1.5,
        projectType: nextProjectType,
      })
    ).toBe(false);
    expect(
      Value.Check(directControl.Civ7TownFocusChangeInputSchema, {
        cityId,
        growthType: nextGrowthType,
        projectType: nextProjectType,
        city: cityId.id,
      })
    ).toBe(false);
    expect(Value.Check(directControl.Civ7TownFocusReviewInputSchema, { cityId })).toBe(true);
    expect(Value.Check(directControl.Civ7TownFocusSnapshotSchema, expectedSnapshot())).toBe(true);
  });

  test("refuses both exact operations through generic validation and send paths", async () => {
    const changeInput = {
      cityId,
      operationType: "CHANGE_GROWTH_MODE",
      args: {
        Type: nextGrowthType,
        ProjectType: nextProjectType,
        City: cityId.id,
      },
    };
    for (const run of [canStartCiv7CityCommand, requestCiv7CityCommand]) {
      const failure = await captureFailure(() =>
        run(changeInput, { host: "127.0.0.1", port: 1, timeoutMs: 10 })
      );
      expect(failure).toMatchObject({
        name: "Civ7DirectControlError",
        code: "command-failed",
        dispatchStatus: "not-dispatched",
      });
      expect((failure as Error).message).toContain("exact town focus change");
    }

    const reviewInput = {
      cityId,
      operationType: "CONSIDER_TOWN_PROJECT",
      args: {},
    };
    for (const run of [canStartCiv7CityOperation, requestCiv7CityOperation]) {
      const failure = await captureFailure(() =>
        run(reviewInput, { host: "127.0.0.1", port: 1, timeoutMs: 10 })
      );
      expect(failure).toMatchObject({
        name: "Civ7DirectControlError",
        code: "command-failed",
        dispatchStatus: "not-dispatched",
      });
      expect((failure as Error).message).toContain("exact town focus review");
    }
  });

  test("checks CHANGE_GROWTH_MODE once with official args and shared evidence", async () => {
    const server = await startTownFocusTunerServer();
    try {
      const result = await checkCiv7TownFocusChange(
        {
          cityId,
          growthType: nextGrowthType,
          projectType: nextProjectType,
        },
        tunerOptions(server)
      );

      expect(result).toEqual({
        valid: true,
        result: { Success: true },
        snapshot: expectedSnapshot(),
      });
      expect(server.calls).toEqual([
        {
          kind: "canStart",
          cityId,
          operationType: "CHANGE_GROWTH_MODE",
          args: {
            Type: nextGrowthType,
            ProjectType: nextProjectType,
            City: cityId.id,
          },
          queue: false,
        },
      ]);
      expect(server.commandExecutions).toHaveLength(1);
      expect(server.commandStateIds).toEqual(["65535"]);
    } finally {
      await server.close();
    }
  });

  test("freshly validates and sends one CHANGE_GROWTH_MODE request with before/after state", async () => {
    const server = await startTownFocusTunerServer();
    try {
      const result = await sendCiv7TownFocusChange(
        {
          cityId,
          growthType: nextGrowthType,
          projectType: nextProjectType,
        },
        tunerOptions(server)
      );

      expect(result).toEqual({
        sent: true,
        validation: {
          valid: true,
          result: { Success: true },
        },
        before: expectedSnapshot(),
        after: expectedSnapshot({
          growthType: nextGrowthType,
          projectType: nextProjectType,
          blocker: 0,
        }),
      });
      expect(server.calls).toEqual([
        {
          kind: "canStart",
          cityId,
          operationType: "CHANGE_GROWTH_MODE",
          args: {
            Type: nextGrowthType,
            ProjectType: nextProjectType,
            City: cityId.id,
          },
          queue: false,
        },
        {
          kind: "changeSend",
          cityId,
          operationType: "CHANGE_GROWTH_MODE",
          args: {
            Type: nextGrowthType,
            ProjectType: nextProjectType,
            City: cityId.id,
          },
        },
      ]);
      expect(server.commandExecutions).toHaveLength(1);
    } finally {
      await server.close();
    }
  });

  test("does not send a validator-blocked focus change", async () => {
    const server = await startTownFocusTunerServer({
      canStartResult: { Success: false, FailureReasons: ["blocked"] },
    });
    try {
      const result = await sendCiv7TownFocusChange(
        {
          cityId,
          growthType: nextGrowthType,
          projectType: nextProjectType,
        },
        tunerOptions(server)
      );

      expect(result).toMatchObject({
        sent: false,
        validation: {
          valid: false,
          result: { Success: false, FailureReasons: ["blocked"] },
        },
      });
      expect(result.after).toEqual(result.before);
      expect(server.calls).toHaveLength(1);
      expect(server.calls[0]?.kind).toBe("canStart");
    } finally {
      await server.close();
    }
  });

  test("counts a non-throwing false CHANGE_GROWTH_MODE return as sent", async () => {
    const server = await startTownFocusTunerServer({ changeSendResult: false });
    try {
      const result = await sendCiv7TownFocusChange(
        {
          cityId,
          growthType: nextGrowthType,
          projectType: nextProjectType,
        },
        tunerOptions(server)
      );

      expect(result.sent).toBe(true);
      expect(result.after).toEqual(result.before);
      expect(server.calls.filter((call) => call.kind === "changeSend")).toHaveLength(1);
    } finally {
      await server.close();
    }
  });

  test("keeps pre-send validation errors not-dispatched and send errors dispatched", async () => {
    const validationServer = await startTownFocusTunerServer({
      canStartError: new Error("validator failed"),
    });
    const sendServer = await startTownFocusTunerServer({
      changeSendError: new Error("send failed"),
    });
    try {
      const input = {
        cityId,
        growthType: nextGrowthType,
        projectType: nextProjectType,
      };
      await expect(
        sendCiv7TownFocusChange(input, tunerOptions(validationServer))
      ).rejects.toMatchObject({
        name: "Civ7DirectControlError",
        dispatchStatus: "not-dispatched",
      });
      expect(validationServer.calls.filter((call) => call.kind === "changeSend")).toEqual([]);

      await expect(sendCiv7TownFocusChange(input, tunerOptions(sendServer))).rejects.toMatchObject({
        name: "Civ7DirectControlError",
        dispatchStatus: "dispatched",
      });
      expect(sendServer.calls.filter((call) => call.kind === "changeSend")).toHaveLength(1);
    } finally {
      await validationServer.close();
      await sendServer.close();
    }
  });

  test.each([
    "container",
    "member",
  ] as const)("rejects a missing CHANGE_GROWTH_MODE %s before dispatch", async (missingChangeCommandType) => {
    const server = await startTownFocusTunerServer({ missingChangeCommandType });
    try {
      await expect(
        sendCiv7TownFocusChange(
          { cityId, growthType: nextGrowthType, projectType: nextProjectType },
          tunerOptions(server)
        )
      ).rejects.toMatchObject({
        name: "Civ7DirectControlError",
        dispatchStatus: "not-dispatched",
      });
      expect(server.calls.filter((call) => call.kind === "changeSend")).toEqual([]);
    } finally {
      await server.close();
    }
  });

  test.each([
    "container",
    "member",
  ] as const)("rejects a missing CONSIDER_TOWN_PROJECT %s before dispatch", async (missingReviewOperationType) => {
    const server = await startTownFocusTunerServer({ missingReviewOperationType });
    try {
      await expect(sendCiv7TownFocusReview({ cityId }, tunerOptions(server))).rejects.toMatchObject(
        {
          name: "Civ7DirectControlError",
          dispatchStatus: "not-dispatched",
        }
      );
      expect(server.calls.filter((call) => call.kind === "reviewSend")).toEqual([]);
    } finally {
      await server.close();
    }
  });

  test.each([
    ["growthType", { growthType: 1.5, projectType: nextProjectType }],
    ["projectType", { growthType: nextGrowthType, projectType: 1.5 }],
  ])("rejects a noninteger %s before executing App UI", async (_field, fields) => {
    const failure = await captureFailure(() =>
      sendCiv7TownFocusChange(
        {
          cityId,
          ...fields,
        },
        { host: "127.0.0.1", port: 1, timeoutMs: 10 }
      )
    );
    expect(failure).toMatchObject({
      name: "Civ7DirectControlError",
      dispatchStatus: "not-dispatched",
    });
  });

  test("reads review evidence without inventing CityOperations.canStart or sending", async () => {
    const server = await startTownFocusTunerServer();
    try {
      const result = await checkCiv7TownFocusReview({ cityId }, tunerOptions(server));

      expect(result).toEqual({
        snapshot: expectedSnapshot(),
      });
      expect(result).not.toHaveProperty("available");
      expect(server.calls).toEqual([]);
      expect(server.commandExecutions).toHaveLength(1);
      expect(server.commandExecutions[0]).not.toContain("CityOperations.canStart");
    } finally {
      await server.close();
    }
  });

  test("keeps unrelated blocker details raw for service-owned review eligibility", async () => {
    const server = await startTownFocusTunerServer({
      notificationTarget: otherCityId,
      notificationType: 88,
      notificationTypeName: "NOTIFICATION_UNRELATED_BLOCKER",
    });
    try {
      const result = await checkCiv7TownFocusReview({ cityId }, tunerOptions(server));

      expect(result.snapshot.blockingTownFocusNotification).toEqual({
        ok: true,
        value: {
          id: { owner: 0, id: 6, type: 20 },
          type: 88,
          typeName: "NOTIFICATION_UNRELATED_BLOCKER",
          target: otherCityId,
        },
      });
    } finally {
      await server.close();
    }
  });

  test("sends one direct CONSIDER_TOWN_PROJECT request with before/after state", async () => {
    const server = await startTownFocusTunerServer();
    try {
      const result = await sendCiv7TownFocusReview({ cityId }, tunerOptions(server));

      expect(result).toEqual({
        sent: true,
        before: expectedSnapshot(),
        after: expectedSnapshot({ blocker: 0 }),
      });
      expect(server.calls).toEqual([
        {
          kind: "reviewSend",
          cityId,
          operationType: "CONSIDER_TOWN_PROJECT",
          args: {},
        },
      ]);
      expect(server.commandExecutions).toHaveLength(1);
      expect(server.commandExecutions[0]).not.toContain("CityOperations.canStart");
    } finally {
      await server.close();
    }
  });

  test("counts a non-throwing undefined review return as sent", async () => {
    const server = await startTownFocusTunerServer({ reviewSendResult: undefined });
    try {
      const result = await sendCiv7TownFocusReview({ cityId }, tunerOptions(server));

      expect(result.sent).toBe(true);
      expect(server.calls.filter((call) => call.kind === "reviewSend")).toHaveLength(1);
    } finally {
      await server.close();
    }
  });

  test("marks a throwing review request dispatched after its sole invocation", async () => {
    const server = await startTownFocusTunerServer({
      reviewSendError: new Error("review send failed"),
    });
    try {
      await expect(sendCiv7TownFocusReview({ cityId }, tunerOptions(server))).rejects.toMatchObject(
        {
          name: "Civ7DirectControlError",
          code: "command-failed",
          dispatchStatus: "dispatched",
        }
      );
      expect(server.calls.filter((call) => call.kind === "reviewSend")).toHaveLength(1);
    } finally {
      await server.close();
    }
  });

  test("preserves unavailable blocker APIs as failed probes", async () => {
    const server = await startTownFocusTunerServer({ missingNotificationApis: true });
    try {
      const result = await checkCiv7TownFocusReview({ cityId }, tunerOptions(server));

      expect(result.snapshot.blocker).toMatchObject({ ok: false });
      expect(result.snapshot.blockingTownFocusNotification).toMatchObject({ ok: false });
    } finally {
      await server.close();
    }
  });
});

async function startTownFocusTunerServer(
  options: TownFocusTunerOptions = {}
): Promise<FakeTownFocusTunerServer> {
  const calls: TownFocusCall[] = [];
  const commandExecutions: string[] = [];
  const commandStateIds: string[] = [];
  const runtimeErrors: unknown[] = [];
  const runtime = {
    growthType: oldGrowthType,
    projectType: oldProjectType,
    blocker: blockerType,
  };
  const city = {
    id: options.observedCityId ?? cityId,
    owner: cityId.owner,
    isTown: true,
    Growth: {
      get growthType() {
        return runtime.growthType;
      },
      get projectType() {
        return runtime.projectType;
      },
    },
  };
  const notificationId = { owner: 0, id: 6, type: 20 };
  const notification = {
    Target: Object.prototype.hasOwnProperty.call(options, "notificationTarget")
      ? options.notificationTarget
      : cityId,
  };
  const globals = {
    Cities: {
      get: (requestedCityId: unknown) => (componentIdEqual(requestedCityId, cityId) ? city : null),
    },
    CityCommandTypes:
      options.missingChangeCommandType === "container"
        ? undefined
        : {
            CHANGE_GROWTH_MODE:
              options.missingChangeCommandType === "member" ? undefined : "CHANGE_GROWTH_MODE",
          },
    CityOperationTypes:
      options.missingReviewOperationType === "container"
        ? undefined
        : {
            CONSIDER_TOWN_PROJECT:
              options.missingReviewOperationType === "member" ? undefined : "CONSIDER_TOWN_PROJECT",
          },
    GameContext: {
      localPlayerID: 0,
    },
    Game: {
      Notifications: {
        getEndTurnBlockingType: options.missingNotificationApis ? undefined : () => runtime.blocker,
        findEndTurnBlocking: options.missingNotificationApis
          ? undefined
          : () => (runtime.blocker === 0 ? null : notificationId),
        find: () => notification,
        getType: () =>
          Object.prototype.hasOwnProperty.call(options, "notificationType")
            ? options.notificationType
            : notificationType,
        getTypeName: () =>
          Object.prototype.hasOwnProperty.call(options, "notificationTypeName")
            ? options.notificationTypeName
            : "NOTIFICATION_CHOOSE_TOWN_PROJECT",
      },
      CityCommands: {
        canStart: (
          requestedCityId: unknown,
          operationType: unknown,
          args: unknown,
          queue: unknown
        ) => {
          calls.push({
            kind: "canStart",
            cityId: jsonClone(requestedCityId),
            operationType,
            args: jsonClone(args),
            queue,
          });
          if (options.canStartError) throw options.canStartError;
          return Object.prototype.hasOwnProperty.call(options, "canStartResult")
            ? options.canStartResult
            : { Success: true };
        },
        sendRequest: (requestedCityId: unknown, operationType: unknown, args: unknown) => {
          calls.push({
            kind: "changeSend",
            cityId: jsonClone(requestedCityId),
            operationType,
            args: jsonClone(args),
          });
          if (options.changeSendError) throw options.changeSendError;
          if (options.changeSendResult === false) return false;
          const townFocusArgs = args as { Type: number; ProjectType: number };
          runtime.growthType = townFocusArgs.Type;
          runtime.projectType = townFocusArgs.ProjectType;
          runtime.blocker = 0;
          return options.changeSendResult;
        },
      },
      CityOperations: {
        sendRequest: (requestedCityId: unknown, operationType: unknown, args: unknown) => {
          calls.push({
            kind: "reviewSend",
            cityId: jsonClone(requestedCityId),
            operationType,
            args: jsonClone(args),
          });
          if (options.reviewSendError) throw options.reviewSendError;
          runtime.blocker = 0;
          return options.reviewSendResult;
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
        commandStateIds.push(commandMatch[1] ?? "");
        const command = commandMatch[2] ?? "";
        commandExecutions.push(command);
        if (options.commandResponseParts !== undefined) {
          socket.write(encodeResponse(frame.listenerId, options.commandResponseParts));
          continue;
        }
        try {
          const output = runInNewContext(command, globals);
          socket.write(encodeResponse(frame.listenerId, [String(output)]));
        } catch (error) {
          runtimeErrors.push(error);
          socket.write(encodeResponse(frame.listenerId, [String(error)]));
        }
      }
    });
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  return {
    calls,
    commandExecutions,
    commandStateIds,
    runtimeErrors,
    address: () => server.address() as AddressInfo,
    close: async () => {
      server.close();
      await once(server, "close");
    },
  };
}

function expectedSnapshot(
  input: Readonly<{
    blocker?: number;
    growthType?: number;
    projectType?: number;
  }> = {}
) {
  const blocker = input.blocker === undefined ? blockerType : input.blocker;
  return {
    cityId,
    city: {
      ok: true,
      value: {
        observedCityId: cityId,
        owner: cityId.owner,
        isTown: true,
        growthType: input.growthType ?? oldGrowthType,
        projectType: input.projectType ?? oldProjectType,
      },
    },
    blocker: {
      ok: true,
      value: blocker,
    },
    blockingTownFocusNotification: {
      ok: true,
      value:
        blocker === 0
          ? null
          : {
              id: { owner: 0, id: 6, type: 20 },
              type: notificationType,
              typeName: "NOTIFICATION_CHOOSE_TOWN_PROJECT",
              target: cityId,
            },
    },
  };
}

function tunerOptions(server: FakeTownFocusTunerServer) {
  return {
    host: "127.0.0.1",
    port: server.address().port,
    timeoutMs: 1_000,
  };
}

async function captureFailure(run: () => Promise<unknown>): Promise<unknown> {
  try {
    await run();
  } catch (error) {
    return error;
  }
  throw new Error("Expected exact town-focus atom to fail");
}

function componentIdEqual(left: unknown, right: typeof cityId): boolean {
  if (left == null || typeof left !== "object") return false;
  const value = left as Partial<typeof cityId>;
  return value.owner === right.owner && value.id === right.id && value.type === right.type;
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

function encodeResponse(listenerId: number, parts: ReadonlyArray<string>): Buffer {
  const messageBytes = Buffer.from(`${parts.join("\0")}\0`, "utf8");
  const frame = Buffer.alloc(8 + messageBytes.length);
  frame.writeUInt32LE(messageBytes.length, 0);
  frame.writeUInt32LE(listenerId, 4);
  messageBytes.copy(frame, 8);
  return frame;
}
