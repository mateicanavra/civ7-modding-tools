import { once } from "node:events";
import { type AddressInfo, createServer } from "node:net";
import { runInNewContext } from "node:vm";
import { Value } from "typebox/value";
import { describe, expect, test } from "vitest";

import * as directControl from "../src/index";
import {
  type Civ7TurnCompletionSnapshot,
  checkCiv7TurnCompletion,
  sendCiv7TurnCompletion,
} from "../src/index";
import { liveCiv7DirectControl } from "../src/live-control";

type TurnCompletionServerOptions = Readonly<{
  localPlayerId?: unknown;
  turn?: unknown;
  hasSentTurnComplete?: unknown;
  canEndTurn?: unknown;
  postTurn?: unknown;
  postHasSentTurnComplete?: unknown;
  postCanEndTurn?: unknown;
  missingComponent?: boolean;
  missingCanEndTurn?: boolean;
  missingHasSentTurnComplete?: boolean;
  missingSendEndTurn?: boolean;
  canEndTurnError?: Error;
  sendEndTurnError?: Error;
  sendEndTurnResult?: unknown;
}>;

type FakeTurnCompletionServer = Readonly<{
  received: string[];
  selectors: string[];
  canEndTurnReceiverMatches: boolean[];
  sendEndTurnReceiverMatches: boolean[];
  commandExecutions: string[];
  sendEndTurnInvocations(): number;
  address(): AddressInfo;
  close(): Promise<void>;
}>;

describe("exact native turn-completion atoms", () => {
  test("publishes only bounded check/send atoms and raw schemas", () => {
    expect(directControl).toMatchObject({
      checkCiv7TurnCompletion: expect.any(Function),
      sendCiv7TurnCompletion: expect.any(Function),
      Civ7TurnCompletionInputSchema: expect.any(Object),
      Civ7TurnCompletionSnapshotSchema: expect.any(Object),
      Civ7TurnCompletionCheckResultSchema: expect.any(Object),
      Civ7TurnCompletionSendInputSchema: expect.any(Object),
      Civ7TurnCompletionSendResultSchema: expect.any(Object),
    });
    expect(liveCiv7DirectControl).toMatchObject({
      checkCiv7TurnCompletion,
      sendCiv7TurnCompletion,
    });
    for (const retiredExport of [
      "getCiv7TurnCompletionStatus",
      "requestCiv7TurnComplete",
      "sendCiv7TurnComplete",
      "sendCiv7TurnUnready",
      "turnCompletionPostconditionConfirmed",
      "turnCompletionProofOutcome",
      "turnCompletionProofPostcondition",
    ]) {
      expect(retiredExport in directControl).toBe(false);
    }

    const snapshot = expectedSnapshot();
    expect(Value.Check(directControl.Civ7TurnCompletionInputSchema, {})).toBe(true);
    expect(Value.Check(directControl.Civ7TurnCompletionInputSchema, { host: "localhost" })).toBe(
      false
    );
    expect(Value.Check(directControl.Civ7TurnCompletionSnapshotSchema, snapshot)).toBe(true);
    expect(
      Value.Check(directControl.Civ7TurnCompletionSnapshotSchema, {
        ...snapshot,
        blocker: { ok: true, value: 0 },
      })
    ).toBe(false);
    expect(
      Value.Check(directControl.Civ7TurnCompletionSendInputSchema, { expected: snapshot })
    ).toBe(true);
    expect(
      Value.Check(directControl.Civ7TurnCompletionSendInputSchema, {
        expected: snapshot,
        force: true,
      })
    ).toBe(false);
  });

  test("checks one immutable snapshot through the official action-panel authority", async () => {
    const server = await startTurnCompletionServer();
    try {
      const result = await checkCiv7TurnCompletion({}, tunerOptions(server));

      expect(result).toEqual({ snapshot: expectedSnapshot() });
      expect(server.selectors).toEqual([".action-panel"]);
      expect(server.canEndTurnReceiverMatches).toEqual([true]);
      expect(server.commandExecutions).toHaveLength(1);
      expect(server.commandExecutions[0]).toContain('document.querySelector(".action-panel")');
      expect(server.commandExecutions[0]).toContain("component.canEndTurn()");
      expect(server.commandExecutions[0]).not.toMatch(
        /GameContext\.sendTurnComplete|sendUnreadyTurn|Notifications|firstReadyUnitId/
      );
      expect(server.commandExecutions[0]).not.toContain(
        'typeof canEndTurn === "function" ? canEndTurn() : false'
      );
    } finally {
      await server.close();
    }
  });

  test.each([
    {
      label: "missing action-panel component",
      options: { missingComponent: true },
      error: ".action-panel component is unavailable",
    },
    {
      label: "missing native canEndTurn method",
      options: { missingCanEndTurn: true },
      error: "canEndTurn method is unavailable",
    },
    {
      label: "non-boolean native canEndTurn result",
      options: { canEndTurn: null },
      error: "non-boolean",
    },
  ])("keeps $label unavailable instead of inventing false", async ({ options, error }) => {
    const server = await startTurnCompletionServer(options);
    try {
      const result = await checkCiv7TurnCompletion({}, tunerOptions(server));

      expect(result.snapshot.canEndTurn).toEqual({
        ok: false,
        error: expect.stringContaining(error),
      });
      expect(result.snapshot.canEndTurn).not.toEqual({ ok: true, value: false });
    } finally {
      await server.close();
    }
  });

  test("preserves a native false canEndTurn result as readable evidence", async () => {
    const server = await startTurnCompletionServer({ canEndTurn: false });
    try {
      const result = await checkCiv7TurnCompletion({}, tunerOptions(server));

      expect(result.snapshot.canEndTurn).toEqual({ ok: true, value: false });
    } finally {
      await server.close();
    }
  });

  test.each([
    false,
    undefined,
  ])("treats native sendEndTurn returning %j as dispatched", async (sendEndTurnResult) => {
    const server = await startTurnCompletionServer({ sendEndTurnResult });
    try {
      const result = await sendCiv7TurnCompletion(
        { expected: expectedSnapshot() },
        tunerOptions(server)
      );

      expect(result).toEqual({
        sent: true,
        before: expectedSnapshot(),
        after: expectedSnapshot({
          hasSentTurnComplete: { ok: true, value: true },
          canEndTurn: { ok: true, value: false },
        }),
      });
      expect(server.sendEndTurnInvocations()).toBe(1);
      expect(server.sendEndTurnReceiverMatches).toEqual([true]);
      expect(server.canEndTurnReceiverMatches).toEqual([true, true]);
      expect(server.selectors).toEqual([".action-panel", ".action-panel", ".action-panel"]);
      expect(server.commandExecutions).toHaveLength(1);
      expect(server.commandExecutions[0]).toContain("sendEndTurn.call(component)");
      expect(server.commandExecutions[0]).not.toMatch(
        /GameContext\.sendTurnComplete|sendUnreadyTurn|Notifications/
      );
    } finally {
      await server.close();
    }
  });

  test.each([
    {
      label: "local player drift",
      expected: expectedSnapshot({ localPlayerId: 1 }),
    },
    {
      label: "turn drift",
      expected: expectedSnapshot({ turn: { ok: true, value: 13 } }),
    },
    {
      label: "has-sent drift",
      expected: expectedSnapshot({ hasSentTurnComplete: { ok: true, value: true } }),
    },
    {
      label: "can-end drift",
      expected: expectedSnapshot({ canEndTurn: { ok: true, value: false } }),
    },
    {
      label: "unreadable expected turn",
      expected: expectedSnapshot({ turn: { ok: false, error: "unavailable" } }),
    },
  ])("refuses $label before native invocation", async ({ expected }) => {
    const server = await startTurnCompletionServer();
    try {
      await expect(
        sendCiv7TurnCompletion({ expected }, tunerOptions(server))
      ).rejects.toMatchObject({
        name: "Civ7DirectControlError",
        dispatchStatus: "not-dispatched",
      });
      expect(server.sendEndTurnInvocations()).toBe(0);
    } finally {
      await server.close();
    }
  });

  test.each([
    {
      label: "matching native canEndTurn false",
      options: { canEndTurn: false },
      expected: expectedSnapshot({ canEndTurn: { ok: true, value: false } }),
    },
    {
      label: "matching native hasSentTurnComplete true",
      options: { hasSentTurnComplete: true },
      expected: expectedSnapshot({
        hasSentTurnComplete: { ok: true, value: true },
      }),
    },
  ])("refuses $label before native invocation", async ({ options, expected }) => {
    const server = await startTurnCompletionServer(options);
    try {
      await expect(
        sendCiv7TurnCompletion({ expected }, tunerOptions(server))
      ).rejects.toMatchObject({
        name: "Civ7DirectControlError",
        dispatchStatus: "not-dispatched",
        message: expect.stringContaining("Native turn completion admission"),
      });
      expect(server.sendEndTurnInvocations()).toBe(0);
    } finally {
      await server.close();
    }
  });

  test.each([
    {
      label: "native canEndTurn",
      options: { missingCanEndTurn: true },
    },
    {
      label: "native hasSentTurnComplete",
      options: { missingHasSentTurnComplete: true },
    },
    {
      label: "native turn",
      options: { turn: null },
    },
  ])("fails closed when matching $label evidence remains unavailable", async ({ options }) => {
    const server = await startTurnCompletionServer(options);
    try {
      const { snapshot } = await checkCiv7TurnCompletion({}, tunerOptions(server));

      await expect(
        sendCiv7TurnCompletion({ expected: snapshot }, tunerOptions(server))
      ).rejects.toMatchObject({
        name: "Civ7DirectControlError",
        dispatchStatus: "not-dispatched",
      });
      expect(server.sendEndTurnInvocations()).toBe(0);
    } finally {
      await server.close();
    }
  });

  test("classifies a missing native send method before dispatch", async () => {
    const server = await startTurnCompletionServer({ missingSendEndTurn: true });
    try {
      await expect(
        sendCiv7TurnCompletion({ expected: expectedSnapshot() }, tunerOptions(server))
      ).rejects.toMatchObject({
        name: "Civ7DirectControlError",
        dispatchStatus: "not-dispatched",
      });
      expect(server.sendEndTurnInvocations()).toBe(0);
    } finally {
      await server.close();
    }
  });

  test("classifies any exception after native send invocation as dispatch-indeterminate", async () => {
    const server = await startTurnCompletionServer({
      sendEndTurnError: new Error("native send failed"),
    });
    try {
      await expect(
        sendCiv7TurnCompletion({ expected: expectedSnapshot() }, tunerOptions(server))
      ).rejects.toMatchObject({
        name: "Civ7DirectControlError",
        dispatchStatus: "dispatched",
        message: "native send failed",
      });
      expect(server.sendEndTurnInvocations()).toBe(1);
    } finally {
      await server.close();
    }
  });

  test("classifies invalid host inputs before opening a Tuner session", async () => {
    await expect(
      checkCiv7TurnCompletion(
        { rawCommand: "GameContext.sendTurnComplete()" } as never,
        unreachableTunerOptions
      )
    ).rejects.toMatchObject({
      name: "Civ7DirectControlError",
      dispatchStatus: "not-dispatched",
    });
    await expect(
      sendCiv7TurnCompletion({ expected: { ...expectedSnapshot(), extra: true } } as never, {
        ...unreachableTunerOptions,
      })
    ).rejects.toMatchObject({
      name: "Civ7DirectControlError",
      dispatchStatus: "not-dispatched",
    });
  });
});

async function startTurnCompletionServer(
  options: TurnCompletionServerOptions = {}
): Promise<FakeTurnCompletionServer> {
  const received: string[] = [];
  const selectors: string[] = [];
  const canEndTurnReceiverMatches: boolean[] = [];
  const sendEndTurnReceiverMatches: boolean[] = [];
  const commandExecutions: string[] = [];
  let sendEndTurnInvocations = 0;
  const runtime = {
    hasSentTurnComplete: hasOwn(options, "hasSentTurnComplete")
      ? options.hasSentTurnComplete
      : false,
    canEndTurn: hasOwn(options, "canEndTurn") ? options.canEndTurn : true,
  };
  const game = {
    turn: hasOwn(options, "turn") ? options.turn : 12,
  };
  const gameContext: Record<string, unknown> = {
    localPlayerID: hasOwn(options, "localPlayerId") ? options.localPlayerId : 0,
  };
  if (!options.missingHasSentTurnComplete) {
    gameContext.hasSentTurnComplete = function (this: unknown) {
      return runtime.hasSentTurnComplete;
    };
  }
  const component: Record<string, unknown> = {};
  if (!options.missingCanEndTurn) {
    component.canEndTurn = function (this: unknown) {
      canEndTurnReceiverMatches.push(this === component);
      if (options.canEndTurnError) throw options.canEndTurnError;
      return runtime.canEndTurn;
    };
  }
  if (!options.missingSendEndTurn) {
    component.sendEndTurn = function (this: unknown) {
      sendEndTurnInvocations += 1;
      sendEndTurnReceiverMatches.push(this === component);
      if (options.sendEndTurnError) throw options.sendEndTurnError;
      runtime.hasSentTurnComplete = hasOwn(options, "postHasSentTurnComplete")
        ? options.postHasSentTurnComplete
        : true;
      runtime.canEndTurn = hasOwn(options, "postCanEndTurn") ? options.postCanEndTurn : false;
      if (hasOwn(options, "postTurn")) game.turn = options.postTurn;
      return options.sendEndTurnResult;
    };
  }
  const globals = {
    Game: game,
    GameContext: gameContext,
    document: {
      querySelector: (selector: string) => {
        selectors.push(selector);
        return options.missingComponent ? null : { maybeComponent: component };
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
        received.push(frame.message);
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
    received,
    selectors,
    canEndTurnReceiverMatches,
    sendEndTurnReceiverMatches,
    commandExecutions,
    sendEndTurnInvocations: () => sendEndTurnInvocations,
    address: () => server.address() as AddressInfo,
    close: async () => {
      server.close();
      await once(server, "close");
    },
  };
}

function expectedSnapshot(
  overrides: Partial<Civ7TurnCompletionSnapshot> = {}
): Civ7TurnCompletionSnapshot {
  return {
    localPlayerId: 0,
    turn: { ok: true, value: 12 },
    hasSentTurnComplete: { ok: true, value: false },
    canEndTurn: { ok: true, value: true },
    ...overrides,
  };
}

function tunerOptions(server: FakeTurnCompletionServer) {
  const { port } = server.address();
  return { host: "127.0.0.1", port, timeoutMs: 1_000 };
}

const unreachableTunerOptions = {
  host: "127.0.0.1",
  port: 1,
  timeoutMs: 10,
};

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

function encodeResponse(listenerId: number, parts: string[]): Buffer {
  const messageBytes = Buffer.from(`${parts.join("\0")}\0`, "utf8");
  const frame = Buffer.alloc(8 + messageBytes.length);
  frame.writeUInt32LE(messageBytes.length, 0);
  frame.writeUInt32LE(listenerId, 4);
  messageBytes.copy(frame, 8);
  return frame;
}
