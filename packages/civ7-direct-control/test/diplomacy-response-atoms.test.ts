import { once } from "node:events";
import { type AddressInfo, createServer } from "node:net";
import { runInNewContext } from "node:vm";
import { Value } from "typebox/value";
import { describe, expect, test } from "vitest";

import * as directControl from "../src/index";
import {
  type Civ7DiplomacyResponseSnapshot,
  checkCiv7DiplomacyResponse,
  sendCiv7DiplomacyResponse,
} from "../src/index";
import { liveCiv7DirectControl } from "../src/live-control";

const localPlayerId = 0;
const actionId = 8_821;
const responseType = 926_305_338;
const eventActionType = 4242;
const denounceMilitaryPresenceActionType = 4545;
const rejectionResponseType = -1_713_616_684;
const blockerType = 63;
const noneBlockerType = -1;
const notificationId = { owner: localPlayerId, id: 44, type: 20 };

type DiplomacyCall = Readonly<{
  kind: "canStart" | "sendRequest";
  args: unknown[];
  receiverMatches: boolean;
}>;

type DiplomacyServerOptions = Readonly<{
  blocker?: unknown;
  canStartResult?: unknown;
  eventActionType?: unknown;
  malformedResponse?: boolean;
  missingSend?: boolean;
  offeredResponseTypes?: readonly number[];
  preserveStateAfterSend?: boolean;
  responseDataActionId?: unknown;
  sendError?: Error;
  sendResult?: unknown;
}>;

type FakeDiplomacyServer = Readonly<{
  calls: DiplomacyCall[];
  commandExecutions: string[];
  address(): AddressInfo;
  close(): Promise<void>;
}>;

describe("exact native ordinary diplomacy response atoms", () => {
  test("publishes closed ambient-player schemas and bounded check/send atoms", () => {
    expect(directControl).toMatchObject({
      checkCiv7DiplomacyResponse: expect.any(Function),
      sendCiv7DiplomacyResponse: expect.any(Function),
      Civ7DiplomacyResponseInputSchema: expect.any(Object),
      Civ7DiplomacyResponseSnapshotSchema: expect.any(Object),
      Civ7DiplomacyResponseValidationResultSchema: expect.any(Object),
      Civ7DiplomacyResponseCheckResultSchema: expect.any(Object),
      Civ7DiplomacyResponseSendInputSchema: expect.any(Object),
      Civ7DiplomacyResponseSendResultSchema: expect.any(Object),
    });
    expect(liveCiv7DirectControl).toMatchObject({
      checkCiv7DiplomacyResponse,
      sendCiv7DiplomacyResponse,
    });
    expect(
      Value.Check(directControl.Civ7DiplomacyResponseInputSchema, {
        actionId,
        responseType,
      })
    ).toBe(true);
    expect(
      Value.Check(directControl.Civ7DiplomacyResponseInputSchema, {
        playerId: localPlayerId,
        actionId,
        responseType,
        notificationId,
      })
    ).toBe(false);
  });

  test("uses the exact native canStart arguments and retains focused response evidence", async () => {
    const server = await startDiplomacyServer();
    try {
      const result = await checkCiv7DiplomacyResponse(
        { actionId, responseType },
        tunerOptions(server)
      );

      expect(result).toEqual({
        valid: true,
        result: { Success: true },
        snapshot: activeSnapshot(),
      });
      expect(server.calls).toEqual([
        {
          kind: "canStart",
          args: [
            localPlayerId,
            "RESPOND_DIPLOMATIC_ACTION",
            { ID: actionId, Type: responseType },
            false,
          ],
          receiverMatches: true,
        },
      ]);
      expect(server.commandExecutions[0]).not.toMatch(
        /Notifications\.activate|DiplomacyManager|LeaderModelManager|InterfaceMode|setTimeout/
      );
    } finally {
      await server.close();
    }
  });

  test("retains the dedicated-war discriminator as raw native evidence", async () => {
    const server = await startDiplomacyServer({
      eventActionType: denounceMilitaryPresenceActionType,
      offeredResponseTypes: [rejectionResponseType],
    });
    try {
      const result = await checkCiv7DiplomacyResponse(
        { actionId, responseType: rejectionResponseType },
        tunerOptions(server)
      );

      expect(result).toMatchObject({
        valid: true,
        snapshot: {
          responseType: rejectionResponseType,
          denounceMilitaryPresenceActionType,
          rejectionResponseType,
          eventActionType: { ok: true, value: denounceMilitaryPresenceActionType },
        },
      });
      expect(server.calls).toHaveLength(1);
    } finally {
      await server.close();
    }
  });

  test("keeps unavailable response and event reads as failed probe evidence", async () => {
    const server = await startDiplomacyServer({
      responseDataActionId: null,
      eventActionType: null,
    });
    try {
      const result = await checkCiv7DiplomacyResponse(
        { actionId, responseType },
        tunerOptions(server)
      );

      expect(result.snapshot.responseData).toEqual({
        ok: true,
        value: {
          actionId: null,
          offeredResponseTypes: [responseType],
        },
      });
      expect(result.snapshot.eventActionType).toMatchObject({
        ok: false,
        error: expect.stringContaining("actionType"),
      });
    } finally {
      await server.close();
    }
  });

  test("refuses any fresh snapshot drift before validation or dispatch", async () => {
    const server = await startDiplomacyServer();
    try {
      await expect(
        sendCiv7DiplomacyResponse(
          {
            actionId,
            responseType,
            expected: activeSnapshot({
              responseData: {
                ok: true,
                value: { actionId, offeredResponseTypes: [responseType, 17] },
              },
            }),
          },
          tunerOptions(server)
        )
      ).rejects.toMatchObject({
        name: "Civ7DirectControlError",
        dispatchStatus: "not-dispatched",
        message: expect.stringContaining("admission evidence changed"),
      });
      expect(server.calls).toEqual([]);
    } finally {
      await server.close();
    }
  });

  test.each([
    false,
    undefined,
  ])("treats an invoked sendRequest returning %j as dispatched", async (sendResult) => {
    const server = await startDiplomacyServer({ sendResult });
    try {
      const result = await sendCiv7DiplomacyResponse(sendInput(), tunerOptions(server));

      expect(result).toEqual({
        sent: true,
        validation: { valid: true, result: { Success: true } },
        before: activeSnapshot(),
        after: clearedSnapshot(),
      });
      expect(server.calls.map((call) => call.kind)).toEqual(["canStart", "sendRequest"]);
      expect(server.calls[1]).toEqual({
        kind: "sendRequest",
        args: [localPlayerId, "RESPOND_DIPLOMATIC_ACTION", { ID: actionId, Type: responseType }],
        receiverMatches: true,
      });
    } finally {
      await server.close();
    }
  });

  test("returns authoritative native rejection without a second observation", async () => {
    const server = await startDiplomacyServer({
      canStartResult: { Success: false },
    });
    try {
      const result = await sendCiv7DiplomacyResponse(sendInput(), tunerOptions(server));

      expect(result).toEqual({
        sent: false,
        validation: { valid: false, result: { Success: false } },
        before: activeSnapshot(),
        after: activeSnapshot(),
      });
      expect(server.calls.map((call) => call.kind)).toEqual(["canStart"]);
    } finally {
      await server.close();
    }
  });

  test("classifies failures around the invocation boundary", async () => {
    const missing = await startDiplomacyServer({ missingSend: true });
    try {
      await expect(
        sendCiv7DiplomacyResponse(sendInput(), tunerOptions(missing))
      ).rejects.toMatchObject({
        name: "Civ7DirectControlError",
        dispatchStatus: "not-dispatched",
      });
    } finally {
      await missing.close();
    }

    const throwing = await startDiplomacyServer({
      sendError: new Error("native diplomacy send failed"),
    });
    try {
      await expect(
        sendCiv7DiplomacyResponse(sendInput(), tunerOptions(throwing))
      ).rejects.toMatchObject({
        name: "Civ7DirectControlError",
        dispatchStatus: "dispatched",
        message: "native diplomacy send failed",
      });
    } finally {
      await throwing.close();
    }
  });

  test("keeps an undecodable send envelope dispatch-indeterminate", async () => {
    const server = await startDiplomacyServer({ malformedResponse: true });
    try {
      await expect(
        sendCiv7DiplomacyResponse(sendInput(), tunerOptions(server))
      ).rejects.toMatchObject({
        name: "Civ7DirectControlError",
        dispatchStatus: "indeterminate",
      });
      expect(server.calls.filter((call) => call.kind === "sendRequest")).toHaveLength(1);
    } finally {
      await server.close();
    }
  });
});

async function startDiplomacyServer(
  options: DiplomacyServerOptions = {}
): Promise<FakeDiplomacyServer> {
  const calls: DiplomacyCall[] = [];
  const commandExecutions: string[] = [];
  const runtime = {
    blocker: hasOwn(options, "blocker") ? options.blocker : blockerType,
    canEndTurn: false,
  };
  const operations: Record<string, unknown> = {
    canStart(this: unknown, ...args: unknown[]) {
      calls.push({
        kind: "canStart",
        args: jsonClone(args),
        receiverMatches: this === operations,
      });
      return hasOwn(options, "canStartResult") ? options.canStartResult : { Success: true };
    },
  };
  if (!options.missingSend) {
    operations.sendRequest = function (this: unknown, ...args: unknown[]) {
      calls.push({
        kind: "sendRequest",
        args: jsonClone(args),
        receiverMatches: this === operations,
      });
      if (options.sendError) throw options.sendError;
      if (!options.preserveStateAfterSend) {
        runtime.blocker = noneBlockerType;
        runtime.canEndTurn = true;
      }
      return options.sendResult;
    };
  }
  const globals = {
    DiplomacyActionTypes: {
      DIPLOMACY_ACTION_DENOUNCE_MILITARY_PRESENCE: denounceMilitaryPresenceActionType,
    },
    DiplomaticResponseTypes: {
      DIPLOMACY_RESPONSE_REJECT: rejectionResponseType,
    },
    EndTurnBlockingTypes: { NONE: noneBlockerType },
    GameContext: { localPlayerID: localPlayerId },
    PlayerOperationTypes: {
      RESPOND_DIPLOMATIC_ACTION: "RESPOND_DIPLOMATIC_ACTION",
    },
    document: {
      querySelector: () => ({
        maybeComponent: {
          canEndTurn: () => runtime.canEndTurn,
        },
      }),
    },
    Game: {
      Diplomacy: {
        getResponseDataForUI: () => ({
          actionID: hasOwn(options, "responseDataActionId")
            ? options.responseDataActionId
            : actionId,
          responseList: (options.offeredResponseTypes ?? [responseType]).map((Type) => ({
            responseType: Type,
          })),
        }),
        getDiplomaticEventData: () => ({
          actionType: hasOwn(options, "eventActionType")
            ? options.eventActionType
            : eventActionType,
        }),
      },
      Notifications: {
        getEndTurnBlockingType: () => runtime.blocker,
        findEndTurnBlocking: () => (runtime.blocker === noneBlockerType ? null : notificationId),
        find: () => ({
          Type: blockerType,
          Target: { id: actionId },
        }),
        getTypeName: () =>
          runtime.blocker === blockerType ? "NOTIFICATION_DIPLOMATIC_RESPONSE_REQUIRED" : null,
      },
      PlayerOperations: operations,
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
        const commandMatch = frame.message.match(/^CMD:([^:]*):(.*)$/s);
        if (!commandMatch) continue;
        const command = commandMatch[2] ?? "";
        commandExecutions.push(command);
        try {
          const output = runInNewContext(command, globals);
          socket.write(
            encodeResponse(frame.listenerId, [options.malformedResponse ? "{" : String(output)])
          );
        } catch (error) {
          socket.write(encodeResponse(frame.listenerId, [String(error)]));
        }
      }
    });
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));

  return {
    calls,
    commandExecutions,
    address: () => server.address() as AddressInfo,
    close: async () => {
      server.close();
      await once(server, "close");
    },
  };
}

function sendInput() {
  return {
    actionId,
    responseType,
    expected: activeSnapshot(),
  };
}

function activeSnapshot(
  overrides: Partial<Civ7DiplomacyResponseSnapshot> = {}
): Civ7DiplomacyResponseSnapshot {
  return {
    localPlayerId,
    actionId,
    responseType,
    denounceMilitaryPresenceActionType,
    rejectionResponseType,
    noneBlockerType,
    responseData: {
      ok: true,
      value: { actionId, offeredResponseTypes: [responseType] },
    },
    eventActionType: { ok: true, value: eventActionType },
    canEndTurn: { ok: true, value: false },
    blocker: { ok: true, value: blockerType },
    blockingNotification: {
      ok: true,
      value: {
        id: notificationId,
        type: blockerType,
        typeName: "NOTIFICATION_DIPLOMATIC_RESPONSE_REQUIRED",
        actionId,
      },
    },
    ...overrides,
  };
}

function clearedSnapshot(): Civ7DiplomacyResponseSnapshot {
  return activeSnapshot({
    canEndTurn: { ok: true, value: true },
    blocker: { ok: true, value: noneBlockerType },
    blockingNotification: { ok: true, value: null },
  });
}

function tunerOptions(server: FakeDiplomacyServer) {
  const { port } = server.address();
  return { host: "127.0.0.1", port, timeoutMs: 1_000 };
}

function hasOwn(value: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
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
