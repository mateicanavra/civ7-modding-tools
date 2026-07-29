import { once } from "node:events";
import { type AddressInfo, createServer } from "node:net";
import { runInNewContext } from "node:vm";
import { Value } from "typebox/value";
import { describe, expect, test } from "vitest";

import * as directControl from "../src/index";
import {
  type Civ7FirstMeetResponseInput,
  type Civ7FirstMeetResponseSnapshot,
  canStartCiv7PlayerOperation,
  checkCiv7FirstMeetResponse,
  requestCiv7PlayerOperation,
  sendCiv7FirstMeetResponse,
} from "../src/index";
import { liveCiv7DirectControl } from "../src/live-control";

const localPlayerId = 3;
const metPlayerId = 7;
const firstMeetBlocker = 523_279_636;
const noneBlockerType = -1;
const notificationId = { owner: 3, id: 44, type: 20 };
const responseTypes = {
  friendly: 101,
  neutral: 202,
  unfriendly: 303,
} as const;
const responseKeys = {
  friendly: "PLAYER_REALATIONSHIP_FIRSTMEET_FRIENDLY",
  neutral: "PLAYER_REALATIONSHIP_FIRSTMEET_NEUTRAL",
  unfriendly: "PLAYER_REALATIONSHIP_FIRSTMEET_UNFRIENDLY",
} as const;

type FirstMeetCall = Readonly<{
  kind: "canStart" | "sendRequest";
  args: unknown[];
  receiverMatches: boolean;
}>;

type FirstMeetServerOptions = Readonly<{
  blocker?: unknown;
  canStartResult?: unknown;
  localPlayerId?: unknown;
  malformedNotificationId?: boolean;
  malformedNotificationPlayer?: unknown;
  missingNotificationType?: boolean;
  malformedResponse?: boolean;
  missingActionPanel?: boolean;
  missingResponse?: Civ7FirstMeetResponseInput["response"];
  missingSend?: boolean;
  preserveStateAfterSend?: boolean;
  sendError?: Error;
  sendResult?: unknown;
  volatileOperationMethods?: boolean;
}>;

type FakeFirstMeetServer = Readonly<{
  calls: FirstMeetCall[];
  commandExecutions: string[];
  responseTypeReads: string[];
  address(): AddressInfo;
  close(): Promise<void>;
}>;

describe("exact native first-meet response atoms", () => {
  test("publishes the bounded diplomacy atoms and closed ambient-player schemas", () => {
    expect(directControl).toMatchObject({
      checkCiv7FirstMeetResponse: expect.any(Function),
      sendCiv7FirstMeetResponse: expect.any(Function),
      Civ7FirstMeetResponseInputSchema: expect.any(Object),
      Civ7FirstMeetResponseSnapshotSchema: expect.any(Object),
      Civ7FirstMeetResponseValidationResultSchema: expect.any(Object),
      Civ7FirstMeetResponseCheckResultSchema: expect.any(Object),
      Civ7FirstMeetResponseSendInputSchema: expect.any(Object),
      Civ7FirstMeetResponseSendResultSchema: expect.any(Object),
    });
    expect(liveCiv7DirectControl).toMatchObject({
      checkCiv7FirstMeetResponse,
      sendCiv7FirstMeetResponse,
    });

    expect(
      Value.Check(directControl.Civ7FirstMeetResponseInputSchema, {
        metPlayerId,
        response: "neutral",
      })
    ).toBe(true);
    expect(
      Value.Check(directControl.Civ7FirstMeetResponseInputSchema, {
        playerId: localPlayerId,
        metPlayerId,
        responseType: responseTypes.neutral,
      })
    ).toBe(false);
    expect(
      Value.Check(directControl.Civ7FirstMeetResponseInputSchema, {
        metPlayerId,
        response: "hostile",
      })
    ).toBe(false);
    expect(Value.Check(directControl.Civ7FirstMeetResponseSnapshotSchema, expectedSnapshot())).toBe(
      true
    );
  });

  test.each([
    ["friendly", "PLAYER_REALATIONSHIP_FIRSTMEET_FRIENDLY", responseTypes.friendly],
    ["neutral", "PLAYER_REALATIONSHIP_FIRSTMEET_NEUTRAL", responseTypes.neutral],
    ["unfriendly", "PLAYER_REALATIONSHIP_FIRSTMEET_UNFRIENDLY", responseTypes.unfriendly],
  ] as const)("maps %s through the native %s key and uses ambient local identity", async (response, key, responseType) => {
    const server = await startFirstMeetServer();
    try {
      const result = await checkCiv7FirstMeetResponse(
        { metPlayerId, response },
        tunerOptions(server)
      );

      expect(result).toEqual({
        valid: true,
        result: { Success: true },
        snapshot: expectedSnapshot({ response, responseType }),
      });
      expect(server.calls).toEqual([
        {
          kind: "canStart",
          args: [
            localPlayerId,
            "RESPOND_DIPLOMATIC_FIRST_MEET",
            {
              Player1: localPlayerId,
              Player2: metPlayerId,
              Type: responseType,
            },
            false,
          ],
          receiverMatches: true,
        },
      ]);
      expect(server.responseTypeReads).toEqual([key]);
      expect(server.commandExecutions[0]).not.toMatch(
        /Notifications\.activate|DiplomacyManager|LeaderModelManager|DisplayQueueManager|setTimeout/
      );
    } finally {
      await server.close();
    }
  });

  test("refuses any fresh snapshot drift before validation or dispatch", async () => {
    const server = await startFirstMeetServer();
    try {
      await expect(
        sendCiv7FirstMeetResponse(
          {
            metPlayerId,
            response: "neutral",
            expected: expectedSnapshot({
              canEndTurn: { ok: true, value: true },
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
    {
      label: "unavailable action-panel evidence",
      options: { missingActionPanel: true },
      expected: {
        canEndTurn: {
          ok: false,
          error: expect.stringContaining(".action-panel component is unavailable"),
        },
      },
    },
    {
      label: "malformed blocker evidence",
      options: { blocker: null },
      expected: {
        blocker: {
          ok: false,
          error: expect.stringContaining("unsupported blocker identity"),
        },
        blockingNotification: {
          ok: false,
          error: "Blocking notification is unavailable because the blocker read failed.",
        },
      },
    },
    {
      label: "malformed blocking-notification identity",
      options: { malformedNotificationPlayer: "7" },
      expected: {
        blockingNotification: {
          ok: false,
          error: expect.stringContaining("non-integer met-player identity"),
        },
      },
    },
    {
      label: "malformed blocking-notification component id",
      options: { malformedNotificationId: true },
      expected: {
        blockingNotification: {
          ok: false,
          error: expect.stringContaining("invalid ComponentID"),
        },
      },
    },
    {
      label: "missing blocking-notification type",
      options: { missingNotificationType: true },
      expected: {
        blockingNotification: {
          ok: false,
          error: expect.stringContaining("unsupported blocker identity"),
        },
      },
    },
  ])("keeps $label as raw unknown probe evidence", async ({ options, expected }) => {
    const server = await startFirstMeetServer(options);
    try {
      const result = await checkCiv7FirstMeetResponse(
        { metPlayerId, response: "neutral" },
        tunerOptions(server)
      );

      expect(result.valid).toBe(true);
      expect(result.snapshot).toMatchObject(expected);
    } finally {
      await server.close();
    }
  });

  test.each([
    false,
    undefined,
  ])("treats an invoked sendRequest returning %j as dispatched", async (sendResult) => {
    const server = await startFirstMeetServer({ sendResult });
    try {
      const result = await sendCiv7FirstMeetResponse(sendInput(), tunerOptions(server));

      expect(result).toEqual({
        sent: true,
        validation: { valid: true, result: { Success: true } },
        before: expectedSnapshot(),
        after: expectedSnapshot({
          canEndTurn: { ok: true, value: true },
          blocker: { ok: true, value: noneBlockerType },
          blockingNotification: { ok: true, value: null },
        }),
      });
      expect(server.calls.map((call) => call.kind)).toEqual(["canStart", "sendRequest"]);
      expect(server.calls[1]).toEqual({
        kind: "sendRequest",
        args: [
          localPlayerId,
          "RESPOND_DIPLOMATIC_FIRST_MEET",
          {
            Player1: localPlayerId,
            Player2: metPlayerId,
            Type: responseTypes.neutral,
          },
        ],
        receiverMatches: true,
      });
    } finally {
      await server.close();
    }
  });

  test("classifies failure before sender invocation as not dispatched", async () => {
    const server = await startFirstMeetServer({ missingSend: true });
    try {
      await expect(
        sendCiv7FirstMeetResponse(sendInput(), tunerOptions(server))
      ).rejects.toMatchObject({
        name: "Civ7DirectControlError",
        dispatchStatus: "not-dispatched",
        message: expect.stringContaining("sendRequest is unavailable"),
      });
      expect(server.calls.map((call) => call.kind)).toEqual(["canStart"]);
    } finally {
      await server.close();
    }
  });

  test("classifies a native invocation exception as dispatched", async () => {
    const server = await startFirstMeetServer({
      sendError: new Error("native first-meet send failed"),
    });
    try {
      await expect(
        sendCiv7FirstMeetResponse(sendInput(), tunerOptions(server))
      ).rejects.toMatchObject({
        name: "Civ7DirectControlError",
        dispatchStatus: "dispatched",
        message: "native first-meet send failed",
      });
      expect(server.calls.map((call) => call.kind)).toEqual(["canStart", "sendRequest"]);
    } finally {
      await server.close();
    }
  });

  test("keeps an undecodable send envelope dispatch-indeterminate", async () => {
    const server = await startFirstMeetServer({ malformedResponse: true });
    try {
      await expect(
        sendCiv7FirstMeetResponse(sendInput(), tunerOptions(server))
      ).rejects.toMatchObject({
        name: "Civ7DirectControlError",
        dispatchStatus: "indeterminate",
      });
      expect(server.calls.filter((call) => call.kind === "sendRequest")).toHaveLength(1);
    } finally {
      await server.close();
    }
  });

  test("caches volatile native methods and preserves their receivers at the call boundary", async () => {
    const server = await startFirstMeetServer({
      preserveStateAfterSend: true,
      volatileOperationMethods: true,
    });
    try {
      await expect(
        sendCiv7FirstMeetResponse(sendInput(), tunerOptions(server))
      ).resolves.toMatchObject({ sent: true });
      expect(server.calls).toEqual([
        {
          kind: "canStart",
          args: [
            localPlayerId,
            "RESPOND_DIPLOMATIC_FIRST_MEET",
            {
              Player1: localPlayerId,
              Player2: metPlayerId,
              Type: responseTypes.neutral,
            },
            false,
          ],
          receiverMatches: true,
        },
        {
          kind: "sendRequest",
          args: [
            localPlayerId,
            "RESPOND_DIPLOMATIC_FIRST_MEET",
            {
              Player1: localPlayerId,
              Player2: metPlayerId,
              Type: responseTypes.neutral,
            },
          ],
          receiverMatches: true,
        },
      ]);
      expect(server.responseTypeReads).toEqual([responseKeys.neutral, responseKeys.neutral]);
    } finally {
      await server.close();
    }
  });

  test("rejects the exact operation through generic player-operation paths", async () => {
    for (const operationType of [
      "RESPOND_DIPLOMATIC_FIRST_MEET",
      "PLAYEROPERATION_RESPOND_DIPLOMATIC_FIRST_MEET",
    ]) {
      for (const run of [canStartCiv7PlayerOperation, requestCiv7PlayerOperation]) {
        await expect(
          run(
            {
              playerId: localPlayerId,
              operationType,
              args: {
                Player1: localPlayerId,
                Player2: metPlayerId,
                Type: responseTypes.neutral,
              },
            },
            { host: "127.0.0.1", port: 1, timeoutMs: 10 }
          )
        ).rejects.toMatchObject({
          name: "Civ7DirectControlError",
          dispatchStatus: "not-dispatched",
          message: expect.stringContaining("exact first-meet response"),
        });
      }
    }
  });
});

async function startFirstMeetServer(
  options: FirstMeetServerOptions = {}
): Promise<FakeFirstMeetServer> {
  const calls: FirstMeetCall[] = [];
  const commandExecutions: string[] = [];
  const responseTypeReads: string[] = [];
  const runtime = {
    blocker: hasOwn(options, "blocker") ? options.blocker : firstMeetBlocker,
    canEndTurn: false,
    localPlayerId: hasOwn(options, "localPlayerId") ? options.localPlayerId : localPlayerId,
  };
  const actionPanelComponent = {
    canEndTurn() {
      return runtime.canEndTurn;
    },
  };
  const notification = {
    Player: hasOwn(options, "malformedNotificationPlayer")
      ? options.malformedNotificationPlayer
      : metPlayerId,
    Type: options.missingNotificationType ? undefined : firstMeetBlocker,
  };
  const operations: Record<string, unknown> = {};
  const canStart = function (this: unknown, ...args: unknown[]) {
    calls.push({
      kind: "canStart",
      args: jsonClone(args),
      receiverMatches: this === operations,
    });
    return hasOwn(options, "canStartResult") ? options.canStartResult : { Success: true };
  };
  const sendRequest = function (this: unknown, ...args: unknown[]) {
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
  if (options.volatileOperationMethods) {
    defineSingleReadMethod(operations, "canStart", canStart);
    if (!options.missingSend) {
      defineSingleReadMethod(operations, "sendRequest", sendRequest);
    }
  } else {
    operations.canStart = canStart;
    if (!options.missingSend) operations.sendRequest = sendRequest;
  }
  const diplomacyPlayerFirstMeets: Record<string, unknown> = {};
  for (const [response, key] of Object.entries(responseKeys)) {
    if (options.missingResponse === response) continue;
    Object.defineProperty(diplomacyPlayerFirstMeets, key, {
      get: () => {
        responseTypeReads.push(key);
        return responseTypes[response as keyof typeof responseTypes];
      },
    });
  }
  const globals = {
    DiplomacyPlayerFirstMeets: diplomacyPlayerFirstMeets,
    EndTurnBlockingTypes: {
      NONE: noneBlockerType,
    },
    GameContext: {
      get localPlayerID() {
        return runtime.localPlayerId;
      },
    },
    PlayerOperationTypes: {
      RESPOND_DIPLOMATIC_FIRST_MEET: "RESPOND_DIPLOMATIC_FIRST_MEET",
    },
    document: {
      querySelector: () =>
        options.missingActionPanel ? null : { maybeComponent: actionPanelComponent },
    },
    Game: {
      Notifications: {
        getEndTurnBlockingType: () => runtime.blocker,
        findEndTurnBlocking: () => {
          if (runtime.blocker === noneBlockerType) return null;
          return options.malformedNotificationId ? { owner: localPlayerId } : notificationId;
        },
        find: () => notification,
        getTypeName: () =>
          runtime.blocker === firstMeetBlocker ? "NOTIFICATION_PLAYER_MET" : null,
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
    responseTypeReads,
    address: () => server.address() as AddressInfo,
    close: async () => {
      server.close();
      await once(server, "close");
    },
  };
}

function sendInput() {
  return {
    metPlayerId,
    response: "neutral" as const,
    expected: expectedSnapshot(),
  };
}

function expectedSnapshot(
  overrides: Partial<Civ7FirstMeetResponseSnapshot> = {}
): Civ7FirstMeetResponseSnapshot {
  return {
    localPlayerId,
    metPlayerId,
    response: "neutral",
    responseType: responseTypes.neutral,
    noneBlockerType,
    canEndTurn: { ok: true, value: false },
    blocker: { ok: true, value: firstMeetBlocker },
    blockingNotification: {
      ok: true,
      value: {
        id: notificationId,
        type: firstMeetBlocker,
        typeName: "NOTIFICATION_PLAYER_MET",
        metPlayerId,
      },
    },
    ...overrides,
  };
}

function defineSingleReadMethod(
  target: Record<string, unknown>,
  key: string,
  method: (...args: unknown[]) => unknown
) {
  let reads = 0;
  Object.defineProperty(target, key, {
    get: () => {
      reads += 1;
      if (reads > 1) throw new Error(`${key} was read more than once`);
      return method;
    },
  });
}

function tunerOptions(server: FakeFirstMeetServer) {
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
