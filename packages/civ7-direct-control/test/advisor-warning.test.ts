import { once } from "node:events";
import { type AddressInfo, createServer } from "node:net";
import { runInNewContext } from "node:vm";
import { Value } from "typebox/value";
import { describe, expect, test } from "vitest";

import * as directControl from "../src/index";
import {
  type Civ7AdvisorWarningViewedSnapshot,
  checkCiv7AdvisorWarningViewed,
  requestCiv7PlayerOperation,
  sendCiv7AdvisorWarningViewed,
} from "../src/index";
import { liveCiv7DirectControl } from "../src/live-control";

const target = { owner: 0, id: 12345, type: 99 };
const advisorTypeName = "NOTIFICATION_ADVISOR_WARNING_SCIENCE";

type AdvisorWarningServerOptions = Readonly<{
  localPlayerId?: unknown;
  exists?: boolean;
  activeQueue?: boolean;
  typeName?: unknown;
  canStartResult?: unknown;
  postExists?: boolean;
  postActiveQueue?: boolean;
  missingSend?: boolean;
  malformedResponse?: boolean;
  sendError?: Error;
  volatileSend?: boolean;
}>;

type FakeAdvisorWarningServer = Readonly<{
  commandExecutions: string[];
  canStartArgs: unknown[][];
  sendArgs: unknown[][];
  address(): AddressInfo;
  close(): Promise<void>;
}>;

describe("exact native advisor-warning viewed atoms", () => {
  test("publishes only target-bound check/send atoms and closed schemas", () => {
    expect(directControl).toMatchObject({
      checkCiv7AdvisorWarningViewed: expect.any(Function),
      sendCiv7AdvisorWarningViewed: expect.any(Function),
      Civ7AdvisorWarningViewedInputSchema: expect.any(Object),
      Civ7AdvisorWarningViewedSnapshotSchema: expect.any(Object),
      Civ7AdvisorWarningViewedCheckResultSchema: expect.any(Object),
      Civ7AdvisorWarningViewedSendInputSchema: expect.any(Object),
      Civ7AdvisorWarningViewedSendResultSchema: expect.any(Object),
    });
    expect(liveCiv7DirectControl).toMatchObject({
      checkCiv7AdvisorWarningViewed,
      sendCiv7AdvisorWarningViewed,
    });
    for (const retiredExport of [
      "requestCiv7AdvisorWarningViewed",
      "advisorWarningProofPostcondition",
      "Civ7AdvisorWarningViewedPostcondition",
      "Civ7AdvisorWarningViewedResult",
    ]) {
      expect(retiredExport in directControl).toBe(false);
    }

    const snapshot = expectedSnapshot();
    expect(Value.Check(directControl.Civ7AdvisorWarningViewedInputSchema, { target })).toBe(true);
    expect(
      Value.Check(directControl.Civ7AdvisorWarningViewedInputSchema, {
        target,
        playerId: 0,
      })
    ).toBe(false);
    expect(Value.Check(directControl.Civ7AdvisorWarningViewedSnapshotSchema, snapshot)).toBe(true);
    expect(
      Value.Check(directControl.Civ7AdvisorWarningViewedSendInputSchema, {
        target,
        expected: snapshot,
      })
    ).toBe(true);
  });

  test("checks the official local-player operation signature exactly once", async () => {
    const server = await startAdvisorWarningServer();
    try {
      const result = await checkCiv7AdvisorWarningViewed({ target }, tunerOptions(server));

      expect(result).toEqual({
        valid: true,
        result: { Success: true },
        snapshot: expectedSnapshot(),
      });
      expect(server.canStartArgs).toEqual([
        [0, "VIEWED_ADVISOR_WARNING", { Target: target }, false],
      ]);
      expect(server.sendArgs).toEqual([]);
      expect(server.commandExecutions).toHaveLength(1);
      expect(server.commandExecutions[0]).not.toMatch(
        /NotificationModel|super\.dismiss|Notifications\.dismiss|setTimeout|Date\.now/
      );
    } finally {
      await server.close();
    }
  });

  test("preserves strict native refusal without dispatch", async () => {
    const server = await startAdvisorWarningServer({ canStartResult: { Success: false } });
    try {
      const checked = await checkCiv7AdvisorWarningViewed({ target }, tunerOptions(server));
      const result = await sendCiv7AdvisorWarningViewed(
        { target, expected: checked.snapshot },
        tunerOptions(server)
      );

      expect(checked.valid).toBe(false);
      expect(result).toMatchObject({
        sent: false,
        validation: { valid: false, result: { Success: false } },
        before: expectedSnapshot(),
        after: expectedSnapshot(),
      });
      expect(server.sendArgs).toEqual([]);
    } finally {
      await server.close();
    }
  });

  test("guards exact admission evidence before dispatch", async () => {
    const server = await startAdvisorWarningServer();
    try {
      await expect(
        sendCiv7AdvisorWarningViewed(
          {
            target,
            expected: expectedSnapshot({ activeQueue: { ok: true, value: false } }),
          },
          tunerOptions(server)
        )
      ).rejects.toMatchObject({
        name: "Civ7DirectControlError",
        dispatchStatus: "not-dispatched",
      });
      expect(server.canStartArgs).toEqual([]);
      expect(server.sendArgs).toEqual([]);
    } finally {
      await server.close();
    }
  });

  test("sends exactly once and returns immediate raw target evidence", async () => {
    const server = await startAdvisorWarningServer({
      postExists: false,
      postActiveQueue: false,
    });
    try {
      const result = await sendCiv7AdvisorWarningViewed(
        { target, expected: expectedSnapshot() },
        tunerOptions(server)
      );

      expect(result).toEqual({
        sent: true,
        validation: { valid: true, result: { Success: true } },
        before: expectedSnapshot(),
        after: expectedSnapshot({
          exists: false,
          typeName: null,
          activeQueue: { ok: true, value: false },
        }),
      });
      expect(server.canStartArgs).toEqual([
        [0, "VIEWED_ADVISOR_WARNING", { Target: target }, false],
      ]);
      expect(server.sendArgs).toEqual([[0, "VIEWED_ADVISOR_WARNING", { Target: target }]]);
    } finally {
      await server.close();
    }
  });

  test("classifies failures by whether native dispatch was invoked", async () => {
    const missing = await startAdvisorWarningServer({ missingSend: true });
    try {
      await expect(
        sendCiv7AdvisorWarningViewed(
          { target, expected: expectedSnapshot() },
          tunerOptions(missing)
        )
      ).rejects.toMatchObject({
        name: "Civ7DirectControlError",
        dispatchStatus: "not-dispatched",
      });
    } finally {
      await missing.close();
    }

    const throwing = await startAdvisorWarningServer({
      sendError: new Error("native advisor acknowledgement failed"),
    });
    try {
      await expect(
        sendCiv7AdvisorWarningViewed(
          { target, expected: expectedSnapshot() },
          tunerOptions(throwing)
        )
      ).rejects.toMatchObject({
        name: "Civ7DirectControlError",
        dispatchStatus: "dispatched",
        message: "native advisor acknowledgement failed",
      });
      expect(throwing.sendArgs).toHaveLength(1);
    } finally {
      await throwing.close();
    }
  });

  test("keeps an undecodable post-send response dispatch-indeterminate", async () => {
    const server = await startAdvisorWarningServer({ malformedResponse: true });
    try {
      await expect(
        sendCiv7AdvisorWarningViewed({ target, expected: expectedSnapshot() }, tunerOptions(server))
      ).rejects.toMatchObject({
        name: "Civ7DirectControlError",
        dispatchStatus: "indeterminate",
      });
      expect(server.sendArgs).toHaveLength(1);
    } finally {
      await server.close();
    }
  });

  test("caches the native sender before marking dispatch", async () => {
    const server = await startAdvisorWarningServer({ volatileSend: true });
    try {
      await expect(
        sendCiv7AdvisorWarningViewed({ target, expected: expectedSnapshot() }, tunerOptions(server))
      ).resolves.toMatchObject({ sent: true });
      expect(server.sendArgs).toEqual([[0, "VIEWED_ADVISOR_WARNING", { Target: target }]]);
    } finally {
      await server.close();
    }
  });

  test("rejects advisor acknowledgement through the generic player-operation path", async () => {
    await expect(
      requestCiv7PlayerOperation(
        {
          playerId: 0,
          operationType: "VIEWED_ADVISOR_WARNING",
          args: { Target: target },
        },
        {},
        {
          executeTunerCommand: async () => {
            throw new Error("generic operation must not execute");
          },
          jsonPayloadFromCommandResult: () => {
            throw new Error("generic operation must not decode");
          },
          jsLiteral: JSON.stringify,
        }
      )
    ).rejects.toMatchObject({
      name: "Civ7DirectControlError",
      dispatchStatus: "not-dispatched",
      message: expect.stringContaining("exact advisor-warning viewed"),
    });
  });
});

async function startAdvisorWarningServer(
  options: AdvisorWarningServerOptions = {}
): Promise<FakeAdvisorWarningServer> {
  const commandExecutions: string[] = [];
  const canStartArgs: unknown[][] = [];
  const sendArgs: unknown[][] = [];
  const runtime = {
    localPlayerId: hasOwn(options, "localPlayerId") ? options.localPlayerId : 0,
    exists: options.exists ?? true,
    activeQueue: options.activeQueue ?? true,
  };
  const notifications = {
    find(candidate: unknown) {
      return runtime.exists && idsMatch(candidate, target) ? { Type: 811 } : null;
    },
    getType() {
      return 811;
    },
    getTypeName() {
      return hasOwn(options, "typeName") ? options.typeName : advisorTypeName;
    },
    getIdsForPlayer() {
      return runtime.activeQueue ? [{ ...target }] : [];
    },
  };
  const operations: Record<string, unknown> = {
    canStart(...args: unknown[]) {
      canStartArgs.push(args);
      return hasOwn(options, "canStartResult") ? options.canStartResult : { Success: true };
    },
  };
  if (!options.missingSend) {
    const sendRequest = (...args: unknown[]) => {
      sendArgs.push(args);
      if (options.sendError) throw options.sendError;
      runtime.exists = options.postExists ?? runtime.exists;
      runtime.activeQueue = options.postActiveQueue ?? runtime.activeQueue;
    };
    if (options.volatileSend) {
      let reads = 0;
      Object.defineProperty(operations, "sendRequest", {
        get: () => {
          reads += 1;
          if (reads > 1) throw new Error("sendRequest was read more than once");
          return sendRequest;
        },
      });
    } else {
      operations.sendRequest = sendRequest;
    }
  }
  const globals = {
    Game: {
      Notifications: notifications,
      PlayerOperations: operations,
    },
    GameContext: {
      get localPlayerID() {
        return runtime.localPlayerId;
      },
    },
    PlayerOperationTypes: {
      VIEWED_ADVISOR_WARNING: "VIEWED_ADVISOR_WARNING",
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
    commandExecutions,
    canStartArgs,
    sendArgs,
    address: () => server.address() as AddressInfo,
    close: async () => {
      server.close();
      await once(server, "close");
    },
  };
}

function expectedSnapshot(
  overrides: Partial<Civ7AdvisorWarningViewedSnapshot> = {}
): Civ7AdvisorWarningViewedSnapshot {
  return {
    target,
    localPlayerId: 0,
    exists: true,
    typeName: advisorTypeName,
    activeQueue: { ok: true, value: true },
    ...overrides,
  };
}

function tunerOptions(server: FakeAdvisorWarningServer) {
  const { port } = server.address();
  return { host: "127.0.0.1", port, timeoutMs: 1_000 };
}

function idsMatch(left: unknown, right: typeof target): boolean {
  if (!left || typeof left !== "object") return false;
  const candidate = left as { owner?: unknown; id?: unknown; type?: unknown };
  return (
    candidate.owner === right.owner && candidate.id === right.id && candidate.type === right.type
  );
}

function hasOwn(value: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
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
