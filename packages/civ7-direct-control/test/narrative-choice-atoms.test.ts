import { once } from "node:events";
import { type AddressInfo, createServer } from "node:net";
import { runInNewContext } from "node:vm";
import { Value } from "typebox/value";
import { describe, expect, test } from "vitest";

import * as directControl from "../src/index";
import {
  canStartCiv7PlayerOperation,
  checkCiv7NarrativeChoice,
  requestCiv7PlayerOperation,
  sendCiv7NarrativeChoice,
} from "../src/index";
import { liveCiv7DirectControl } from "../src/live-control";

type NarrativeCall = Readonly<{
  kind: "canStart" | "sendRequest";
  playerId: unknown;
  operationType: unknown;
  args: unknown;
  queue?: unknown;
}>;

type NarrativeServerOptions = Readonly<{
  canStartResult?: unknown;
  postSendBlocker?: unknown;
  preserveStateAfterSend?: boolean;
  sendError?: Error;
  sendResult?: unknown;
  zeroBlockerHasLiveId?: boolean;
}>;

type FakeNarrativeServer = Readonly<{
  calls: NarrativeCall[];
  blockerReads: unknown[];
  blockerQueries: Array<Readonly<{ playerId: unknown; blockerType: unknown }>>;
  commandExecutions: string[];
  address(): AddressInfo;
  close(): Promise<void>;
}>;

const targetType = "1042B";
const target = { owner: 0, id: 421, type: 24 };
const activateAction = -1_326_475_004;
const narrativeBlocker = 1_187_383_715;
const notificationId = { owner: 0, id: 128, type: 20 };

describe("exact native narrative-choice atoms", () => {
  test("publishes only bounded check/send atoms and raw schemas", () => {
    expect(directControl).toMatchObject({
      checkCiv7NarrativeChoice: expect.any(Function),
      sendCiv7NarrativeChoice: expect.any(Function),
      Civ7NarrativeChoiceInputSchema: expect.any(Object),
      Civ7NarrativeChoiceSendInputSchema: expect.any(Object),
      Civ7NarrativeChoiceValidationResultSchema: expect.any(Object),
      Civ7NarrativeChoiceCheckResultSchema: expect.any(Object),
      Civ7NarrativeChoiceSnapshotSchema: expect.any(Object),
      Civ7NarrativeChoiceSendResultSchema: expect.any(Object),
    });
    expect(liveCiv7DirectControl).toMatchObject({
      checkCiv7NarrativeChoice,
      sendCiv7NarrativeChoice,
    });
    expect("requestCiv7NarrativeChoice" in directControl).toBe(false);
    expect("narrativeChoiceProofPostcondition" in directControl).toBe(false);
    expect("createCiv7NarrativeChoiceTelemetryRecord" in directControl).toBe(false);

    expect(Value.Check(directControl.Civ7NarrativeChoiceInputSchema, { targetType, target })).toBe(
      true
    );
    expect(
      Value.Check(directControl.Civ7NarrativeChoiceInputSchema, {
        playerId: 0,
        targetType,
        target,
        action: activateAction,
      })
    ).toBe(false);
    expect(Value.Check(directControl.Civ7NarrativeChoiceSnapshotSchema, expectedSnapshot())).toBe(
      true
    );
    expect(
      Value.Check(directControl.Civ7NarrativeChoiceSnapshotSchema, {
        ...expectedSnapshot(),
        blocker: { ok: true, value: null },
      })
    ).toBe(false);
    expect(
      Value.Check(directControl.Civ7NarrativeChoiceSnapshotSchema, {
        ...expectedSnapshot(),
        blockingNotification: {
          ok: true,
          value: {
            id: notificationId,
            type: null,
            typeName: null,
            target,
          },
        },
      })
    ).toBe(true);
    expect(
      Value.Check(directControl.Civ7NarrativeChoiceSnapshotSchema, {
        ...expectedSnapshot(),
        notifications: [],
      })
    ).toBe(false);
  });

  test.each([
    "CHOOSE_NARRATIVE_STORY_DIRECTION",
    "PLAYEROPERATION_CHOOSE_NARRATIVE_STORY_DIRECTION",
  ])("refuses %s through generic player-operation paths before dispatch", async (operationType) => {
    for (const run of [canStartCiv7PlayerOperation, requestCiv7PlayerOperation]) {
      await expect(
        run(
          {
            playerId: 0,
            operationType,
            args: { TargetType: targetType, Target: target, Action: activateAction },
          },
          { host: "127.0.0.1", port: 1, timeoutMs: 10 }
        )
      ).rejects.toMatchObject({
        name: "Civ7DirectControlError",
        dispatchStatus: "not-dispatched",
      });
    }
  });

  test("checks the official local-player operation with fixed ambient Activate", async () => {
    const server = await startNarrativeServer();
    try {
      const result = await checkCiv7NarrativeChoice({ targetType, target }, tunerOptions(server));

      expect(result).toEqual({
        valid: true,
        result: { Success: true },
        snapshot: expectedSnapshot(),
      });
      expect(server.calls).toEqual([
        {
          kind: "canStart",
          playerId: 0,
          operationType: "CHOOSE_NARRATIVE_STORY_DIRECTION",
          args: { TargetType: targetType, Target: target, Action: activateAction },
          queue: false,
        },
      ]);
      expect(server.blockerReads).toEqual([narrativeBlocker]);
      expect(server.blockerQueries).toEqual([{ playerId: 0, blockerType: narrativeBlocker }]);
      expect(server.commandExecutions).toHaveLength(1);
      expect(server.commandExecutions[0]).not.toMatch(
        /document|NarrativePopupManager|closePopup|Notifications\.activate/
      );
    } finally {
      await server.close();
    }
  });

  test("returns strict native rejection without dispatch or policy classification", async () => {
    const server = await startNarrativeServer({
      canStartResult: { Success: false, FailureReasons: ["blocked"] },
    });
    try {
      const result = await sendCiv7NarrativeChoice(narrativeSendInput(), tunerOptions(server));

      expect(result).toEqual({
        sent: false,
        validation: {
          valid: false,
          result: { Success: false, FailureReasons: ["blocked"] },
        },
        before: expectedSnapshot(),
        after: expectedSnapshot(),
      });
      expect(result).not.toHaveProperty("verified");
      expect(result).not.toHaveProperty("postcondition");
      expect(server.calls.filter((call) => call.kind === "sendRequest")).toEqual([]);
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
    { canStart: true },
    { Success: 1 },
  ])("requires the exact object Success boolean from canStart: %j", async (canStartResult) => {
    const server = await startNarrativeServer({ canStartResult });
    try {
      await expect(
        sendCiv7NarrativeChoice(narrativeSendInput(), tunerOptions(server))
      ).rejects.toMatchObject({
        name: "Civ7DirectControlError",
        dispatchStatus: "not-dispatched",
      });
      expect(server.calls.filter((call) => call.kind === "sendRequest")).toEqual([]);
    } finally {
      await server.close();
    }
  });

  test("refuses dispatch when fresh admission evidence differs from expected", async () => {
    const server = await startNarrativeServer();
    try {
      await expect(
        sendCiv7NarrativeChoice(
          {
            targetType,
            target,
            expected: expectedSnapshot({ blocker: 0 }),
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

  test("does not treat postcondition-only canEndTurn drift as an admission mismatch", async () => {
    const server = await startNarrativeServer({ preserveStateAfterSend: true });
    try {
      const result = await sendCiv7NarrativeChoice(
        {
          targetType,
          target,
          expected: {
            ...expectedSnapshot(),
            canEndTurn: { ok: true, value: true },
          },
        },
        tunerOptions(server)
      );

      expect(result.sent).toBe(true);
      expect(server.calls.map((call) => call.kind)).toEqual(["canStart", "sendRequest"]);
    } finally {
      await server.close();
    }
  });

  test.each([
    false,
    undefined,
  ])("treats an invoked sendRequest returning %j as dispatched evidence", async (sendResult) => {
    const server = await startNarrativeServer({ sendResult });
    try {
      const result = await sendCiv7NarrativeChoice(narrativeSendInput(), tunerOptions(server));

      expect(result).toEqual({
        sent: true,
        validation: { valid: true, result: { Success: true } },
        before: expectedSnapshot(),
        after: expectedSnapshot({ blocker: 0, canEndTurn: true }),
      });
      expect(server.calls).toEqual([
        {
          kind: "canStart",
          playerId: 0,
          operationType: "CHOOSE_NARRATIVE_STORY_DIRECTION",
          args: { TargetType: targetType, Target: target, Action: activateAction },
          queue: false,
        },
        {
          kind: "sendRequest",
          playerId: 0,
          operationType: "CHOOSE_NARRATIVE_STORY_DIRECTION",
          args: { TargetType: targetType, Target: target, Action: activateAction },
        },
      ]);
      expect(server.blockerReads).toEqual([narrativeBlocker, 0]);
      expect(server.blockerQueries).toEqual([
        { playerId: 0, blockerType: narrativeBlocker },
        { playerId: 0, blockerType: 0 },
      ]);
    } finally {
      await server.close();
    }
  });

  test("preserves a live notification paired with blocker type zero", async () => {
    const server = await startNarrativeServer({ zeroBlockerHasLiveId: true });
    try {
      const result = await sendCiv7NarrativeChoice(narrativeSendInput(), tunerOptions(server));

      expect(result.after).toEqual({
        localPlayerId: 0,
        activateAction,
        canEndTurn: { ok: true, value: true },
        blocker: { ok: true, value: 0 },
        blockingNotification: {
          ok: true,
          value: {
            id: notificationId,
            type: 0,
            typeName: null,
            target,
          },
        },
      });
      expect(server.blockerQueries).toEqual([
        { playerId: 0, blockerType: narrativeBlocker },
        { playerId: 0, blockerType: 0 },
      ]);
    } finally {
      await server.close();
    }
  });

  test.each([
    null,
    {},
    "0",
    1.5,
  ])("keeps malformed post-send blocker evidence unresolved after dispatch: %j", async (postSendBlocker) => {
    const server = await startNarrativeServer({ postSendBlocker });
    try {
      const result = await sendCiv7NarrativeChoice(narrativeSendInput(), tunerOptions(server));

      expect(result).toMatchObject({
        sent: true,
        before: expectedSnapshot(),
        after: {
          canEndTurn: { ok: true, value: true },
          blocker: {
            ok: false,
            error: expect.stringContaining("unsupported blocker identity"),
          },
          blockingNotification: {
            ok: false,
            error: "Blocking notification is unavailable because the blocker read failed.",
          },
        },
      });
      expect(server.calls.filter((call) => call.kind === "sendRequest")).toHaveLength(1);
      expect(server.blockerReads).toEqual([narrativeBlocker, postSendBlocker]);
      expect(server.blockerQueries).toEqual([{ playerId: 0, blockerType: narrativeBlocker }]);
    } finally {
      await server.close();
    }
  });

  test("retains a supported live string blocker identity after dispatch", async () => {
    const postSendBlocker = "NOTIFICATION_CHOOSE_NARRATIVE_STORY_DIRECTION";
    const server = await startNarrativeServer({ postSendBlocker });
    try {
      const result = await sendCiv7NarrativeChoice(narrativeSendInput(), tunerOptions(server));

      expect(result.after).toMatchObject({
        blocker: { ok: true, value: postSendBlocker },
        blockingNotification: {
          ok: true,
          value: {
            id: notificationId,
            type: postSendBlocker,
            typeName: null,
            target,
          },
        },
      });
      expect(server.blockerQueries).toEqual([
        { playerId: 0, blockerType: narrativeBlocker },
        { playerId: 0, blockerType: postSendBlocker },
      ]);
    } finally {
      await server.close();
    }
  });

  test("classifies input failure before dispatch and send failure after invocation", async () => {
    await expect(
      sendCiv7NarrativeChoice(
        {
          targetType: "",
          target,
          expected: expectedSnapshot(),
        },
        { host: "127.0.0.1", port: 1, timeoutMs: 10 }
      )
    ).rejects.toMatchObject({
      name: "Civ7DirectControlError",
      dispatchStatus: "not-dispatched",
    });

    const server = await startNarrativeServer({
      sendError: new Error("narrative send failed"),
    });
    try {
      await expect(
        sendCiv7NarrativeChoice(narrativeSendInput(), tunerOptions(server))
      ).rejects.toMatchObject({
        name: "Civ7DirectControlError",
        dispatchStatus: "dispatched",
      });
      expect(server.calls.filter((call) => call.kind === "sendRequest")).toHaveLength(1);
    } finally {
      await server.close();
    }
  });
});

async function startNarrativeServer(
  options: NarrativeServerOptions = {}
): Promise<FakeNarrativeServer> {
  const calls: NarrativeCall[] = [];
  const blockerReads: unknown[] = [];
  const blockerQueries: Array<Readonly<{ playerId: unknown; blockerType: unknown }>> = [];
  const commandExecutions: string[] = [];
  const runtime = {
    blocker: narrativeBlocker as unknown,
    canEndTurn: false,
  };
  const globals = {
    GameContext: { localPlayerID: 0 },
    PlayerOperationParameters: { Activate: activateAction },
    PlayerOperationTypes: {
      CHOOSE_NARRATIVE_STORY_DIRECTION: "CHOOSE_NARRATIVE_STORY_DIRECTION",
    },
    canEndTurn: () => runtime.canEndTurn,
    Game: {
      Notifications: {
        getEndTurnBlockingType: () => {
          blockerReads.push(runtime.blocker);
          return runtime.blocker;
        },
        findEndTurnBlocking: (playerId: unknown, blockerType: unknown) => {
          blockerQueries.push({ playerId, blockerType });
          return blockerType === 0 && !options.zeroBlockerHasLiveId ? null : notificationId;
        },
        find: () => ({ Target: target }),
        getType: () => runtime.blocker,
        getTypeName: () =>
          runtime.blocker === narrativeBlocker
            ? "NOTIFICATION_CHOOSE_NARRATIVE_STORY_DIRECTION"
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
          if (!options.preserveStateAfterSend) {
            runtime.blocker = Object.prototype.hasOwnProperty.call(options, "postSendBlocker")
              ? options.postSendBlocker
              : 0;
            runtime.canEndTurn = true;
          }
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
    blockerQueries,
    commandExecutions,
    address: () => server.address() as AddressInfo,
    close: async () => {
      server.close();
      await once(server, "close");
    },
  };
}

function narrativeSendInput() {
  return {
    targetType,
    target,
    expected: expectedSnapshot(),
  };
}

function expectedSnapshot(input: Readonly<{ blocker?: number; canEndTurn?: boolean }> = {}) {
  const blocker = input.blocker ?? narrativeBlocker;
  return {
    localPlayerId: 0,
    activateAction,
    canEndTurn: { ok: true as const, value: input.canEndTurn ?? false },
    blocker: { ok: true as const, value: blocker },
    blockingNotification: {
      ok: true as const,
      value:
        blocker === 0
          ? null
          : {
              id: notificationId,
              type: blocker,
              typeName: "NOTIFICATION_CHOOSE_NARRATIVE_STORY_DIRECTION",
              target,
            },
    },
  };
}

function tunerOptions(server: FakeNarrativeServer) {
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
