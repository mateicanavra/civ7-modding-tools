import { once } from "node:events";
import { type AddressInfo, createServer } from "node:net";
import { runInNewContext } from "node:vm";
import { describe, expect, test } from "vitest";

import * as directControl from "../src/index";
import {
  checkCiv7AttributePurchase,
  checkCiv7AttributeReview,
  checkCiv7ProgressionTreeChoice,
  checkCiv7ProgressionTreeTarget,
  checkCiv7TraditionChange,
  checkCiv7TraditionReview,
  clearCiv7ProgressionTreeTarget,
  observeCiv7AttributeNode,
  observeCiv7TraditionAssignments,
  sendCiv7AttributePurchase,
  sendCiv7AttributeReview,
  sendCiv7ProgressionTreeChoice,
  sendCiv7ProgressionTreeTarget,
  sendCiv7TraditionChange,
  sendCiv7TraditionReview,
} from "../src/index";
import { liveCiv7DirectControl } from "../src/live-control";

type PlayerOperationCall = Readonly<{
  kind: "canStart" | "sendRequest";
  playerId: unknown;
  operationType: unknown;
  args: unknown;
  queue?: unknown;
}>;

describe("provider-first progression atoms", () => {
  test("publishes the exact provider surface through the facade and live bundle", () => {
    const surface = {
      checkCiv7ProgressionTreeChoice,
      sendCiv7ProgressionTreeChoice,
      checkCiv7ProgressionTreeTarget,
      sendCiv7ProgressionTreeTarget,
      clearCiv7ProgressionTreeTarget,
      observeCiv7AttributeNode,
      checkCiv7AttributePurchase,
      sendCiv7AttributePurchase,
      checkCiv7AttributeReview,
      sendCiv7AttributeReview,
      observeCiv7TraditionAssignments,
      checkCiv7TraditionChange,
      sendCiv7TraditionChange,
      checkCiv7TraditionReview,
      sendCiv7TraditionReview,
    };
    expect(directControl).toMatchObject(surface);
    expect(liveCiv7DirectControl).toMatchObject(surface);
    expect(directControl).toMatchObject({
      Civ7ProgressionTreeNodeInputSchema: expect.any(Object),
      Civ7ProgressionTreeNodeSendInputSchema: expect.any(Object),
      Civ7ProgressionTreeClearTargetInputSchema: expect.any(Object),
      Civ7AttributePurchaseAtomInputSchema: expect.any(Object),
      Civ7AttributePurchaseAtomSendInputSchema: expect.any(Object),
      Civ7AttributeReviewAtomInputSchema: expect.any(Object),
      Civ7AttributeReviewSendInputSchema: expect.any(Object),
      Civ7TraditionChangeAtomInputSchema: expect.any(Object),
      Civ7TraditionChangeAtomSendInputSchema: expect.any(Object),
      Civ7TraditionReviewAtomInputSchema: expect.any(Object),
      Civ7TraditionReviewSendInputSchema: expect.any(Object),
    });
  });

  test("uses ambient player, strict native argument order, stale guards, and runtime NO_NODE", async () => {
    const server = await startProgressionServer();
    try {
      const options = tunerOptions(server);
      const choice = await checkCiv7ProgressionTreeChoice(
        { kind: "technology", node: 11 },
        options
      );
      expect(choice.valid).toBe(true);
      expect(choice.snapshot).toMatchObject({
        localPlayerId: 0,
        kind: "technology",
        currentNode: null,
        targetNode: 31,
        noNode: 777,
      });
      expect(server.calls.at(-1)).toEqual({
        kind: "canStart",
        playerId: 0,
        operationType: "SET_TECH_TREE_NODE",
        args: { ProgressionTreeNodeType: 11 },
        queue: false,
      });

      const sentChoice = await sendCiv7ProgressionTreeChoice(
        { kind: "technology", node: 11, expected: choice.snapshot },
        options
      );
      expect(sentChoice.sent).toBe(true);
      expect(sentChoice.after.currentNode).toBe(11);
      expect(server.calls.slice(-2)).toEqual([
        {
          kind: "canStart",
          playerId: 0,
          operationType: "SET_TECH_TREE_NODE",
          args: { ProgressionTreeNodeType: 11 },
          queue: false,
        },
        {
          kind: "sendRequest",
          playerId: 0,
          operationType: "SET_TECH_TREE_NODE",
          args: { ProgressionTreeNodeType: 11 },
        },
      ]);

      await expect(
        sendCiv7ProgressionTreeTarget(
          {
            kind: "technology",
            node: 41,
            expected: { ...sentChoice.after, currentNode: 99 },
          },
          options
        )
      ).rejects.toMatchObject({ dispatchStatus: "not-dispatched" });
      const callCountAfterStaleGuard = server.calls.length;

      const target = await checkCiv7ProgressionTreeTarget(
        { kind: "technology", node: 41 },
        options
      );
      const sentTarget = await sendCiv7ProgressionTreeTarget(
        { kind: "technology", node: 41, expected: target.snapshot },
        options
      );
      expect(sentTarget.after.targetNode).toBe(41);

      server.calls.length = 0;
      const cleared = await clearCiv7ProgressionTreeTarget(
        { kind: "technology", expected: sentTarget.after },
        options
      );
      expect(cleared.after.targetNode).toBe(777);
      expect(server.calls).toEqual([
        {
          kind: "sendRequest",
          playerId: 0,
          operationType: "SET_TECH_TREE_TARGET_NODE",
          args: { ProgressionTreeNodeType: 777 },
        },
      ]);
      expect(callCountAfterStaleGuard).toBeGreaterThan(0);
    } finally {
      await server.close();
    }
  });

  test("observes concrete attribute facts and keeps review sends honest", async () => {
    const server = await startProgressionServer();
    try {
      const options = tunerOptions(server);
      const observed = await observeCiv7AttributeNode({ node: 51 }, options);
      expect(observed).toEqual({
        localPlayerId: 0,
        node: 51,
        nodeState: 2,
        depthUnlocked: 1,
        repeatedDepth: 0,
        attributeType: "ATTRIBUTE_CULTURAL",
        availablePoints: 2,
        wildcardPoints: 1,
      });

      const checked = await checkCiv7AttributePurchase({ node: 51 }, options);
      const sent = await sendCiv7AttributePurchase(
        { node: 51, expected: checked.snapshot },
        options
      );
      expect(sent.sent).toBe(true);
      expect(sent.after).toMatchObject({ depthUnlocked: 2, availablePoints: 1 });
      expect(server.calls.slice(-2)).toEqual([
        {
          kind: "canStart",
          playerId: 0,
          operationType: "BUY_ATTRIBUTE_TREE_NODE",
          args: { ProgressionTreeNodeType: 51 },
          queue: false,
        },
        {
          kind: "sendRequest",
          playerId: 0,
          operationType: "BUY_ATTRIBUTE_TREE_NODE",
          args: { ProgressionTreeNodeType: 51 },
        },
      ]);

      const review = await checkCiv7AttributeReview({}, options);
      const reviewSend = await sendCiv7AttributeReview({ expected: review.snapshot }, options);
      expect(reviewSend).toMatchObject({ sent: true, before: review.snapshot });
      expect(reviewSend).not.toHaveProperty("after");
      expect(reviewSend).not.toHaveProperty("verified");
      expect(server.calls.slice(-2)).toEqual([
        {
          kind: "canStart",
          playerId: 0,
          operationType: "CONSIDER_ASSIGN_ATTRIBUTE",
          args: {},
          queue: false,
        },
        {
          kind: "sendRequest",
          playerId: 0,
          operationType: "CONSIDER_ASSIGN_ATTRIBUTE",
          args: {},
        },
      ]);
    } finally {
      await server.close();
    }
  });

  test("resolves semantic tradition actions internally and omits fake review proof", async () => {
    const server = await startProgressionServer();
    try {
      const options = tunerOptions(server);
      const before = await observeCiv7TraditionAssignments(options);
      expect(before).toEqual({ localPlayerId: 0, activeTraditions: [51, 61, 71] });

      const activate = await checkCiv7TraditionChange(
        { traditionType: 62, action: "activate" },
        options
      );
      const activated = await sendCiv7TraditionChange(
        {
          traditionType: 62,
          action: "activate",
          expected: activate.snapshot,
        },
        options
      );
      expect(activated.after.activeTraditions).toEqual([51, 61, 62, 71]);
      expect(server.calls.slice(-2)).toEqual([
        {
          kind: "canStart",
          playerId: 0,
          operationType: "CHANGE_TRADITION",
          args: { TraditionType: 62, Action: 701 },
          queue: false,
        },
        {
          kind: "sendRequest",
          playerId: 0,
          operationType: "CHANGE_TRADITION",
          args: { TraditionType: 62, Action: 701 },
        },
      ]);

      const deactivate = await checkCiv7TraditionChange(
        { traditionType: 61, action: "deactivate" },
        options
      );
      await sendCiv7TraditionChange(
        {
          traditionType: 61,
          action: "deactivate",
          expected: deactivate.snapshot,
        },
        options
      );
      expect(server.calls.at(-1)).toMatchObject({
        kind: "sendRequest",
        args: { TraditionType: 61, Action: 702 },
      });

      const review = await checkCiv7TraditionReview({}, options);
      const sentReview = await sendCiv7TraditionReview({ expected: review.snapshot }, options);
      expect(sentReview).toMatchObject({ sent: true, before: review.snapshot });
      expect(sentReview).not.toHaveProperty("after");
      expect(sentReview).not.toHaveProperty("verified");
    } finally {
      await server.close();
    }
  });

  test("requires the official Success boolean and treats nonthrowing sends as sent", async () => {
    const strictServer = await startProgressionServer({ canStartResult: { success: true } });
    try {
      await expect(
        checkCiv7ProgressionTreeChoice({ kind: "culture", node: 21 }, tunerOptions(strictServer))
      ).rejects.toMatchObject({ dispatchStatus: "dispatched" });
      expect(strictServer.calls.filter((call) => call.kind === "sendRequest")).toEqual([]);
    } finally {
      await strictServer.close();
    }

    const falseReturnServer = await startProgressionServer({ sendResult: false });
    try {
      const checked = await checkCiv7ProgressionTreeChoice(
        { kind: "culture", node: 21 },
        tunerOptions(falseReturnServer)
      );
      const sent = await sendCiv7ProgressionTreeChoice(
        { kind: "culture", node: 21, expected: checked.snapshot },
        tunerOptions(falseReturnServer)
      );
      expect(sent.sent).toBe(true);
    } finally {
      await falseReturnServer.close();
    }
  });
});

async function startProgressionServer(
  options: Readonly<{ canStartResult?: unknown; sendResult?: unknown }> = {}
) {
  const calls: PlayerOperationCall[] = [];
  const runtime = {
    techCurrent: null as number | null,
    techTarget: 31,
    cultureCurrent: null as number | null,
    cultureTarget: 32,
    attributeDepth: 1,
    attributePoints: 2,
    activeTraditions: [61],
  };
  const globals = {
    GameContext: { localPlayerID: 0 },
    CultureSlotTypes: {
      POLICY_CULTURE_SLOT: 801,
      TRADITION_CULTURE_SLOT: 802,
      CRISIS_CULTURE_SLOT: 803,
    },
    ProgressionTreeNodeTypes: { NO_NODE: 777 },
    PlayerOperationParameters: { Activate: 701, Deactivate: 702 },
    PlayerOperationTypes: {
      SET_TECH_TREE_NODE: "SET_TECH_TREE_NODE",
      SET_CULTURE_TREE_NODE: "SET_CULTURE_TREE_NODE",
      SET_TECH_TREE_TARGET_NODE: "SET_TECH_TREE_TARGET_NODE",
      SET_CULTURE_TREE_TARGET_NODE: "SET_CULTURE_TREE_TARGET_NODE",
      BUY_ATTRIBUTE_TREE_NODE: "BUY_ATTRIBUTE_TREE_NODE",
      CONSIDER_ASSIGN_ATTRIBUTE: "CONSIDER_ASSIGN_ATTRIBUTE",
      CHANGE_TRADITION: "CHANGE_TRADITION",
      CONSIDER_ASSIGN_TRADITIONS: "CONSIDER_ASSIGN_TRADITIONS",
    },
    GameInfo: {
      ProgressionTreeNodes: {
        lookup: (node: unknown) =>
          node === 51 ? { ProgressionTree: "TREE_ATTRIBUTE_CULTURAL" } : null,
      },
      Attributes: [
        {
          AttributeType: "ATTRIBUTE_CULTURAL",
          ProgressionTreeType: "TREE_ATTRIBUTE_CULTURAL",
        },
      ],
    },
    Players: {
      get: (playerId: unknown) =>
        playerId === 0
          ? {
              Techs: {
                getResearching: () => runtime.techCurrent,
                getTargetNode: () => runtime.techTarget,
              },
              Culture: {
                getActiveTree: () => 91,
                getTargetNode: () => runtime.cultureTarget,
                getActiveTraditions: (slotType: unknown) =>
                  slotType === 801
                    ? [51]
                    : slotType === 802
                      ? [...runtime.activeTraditions]
                      : slotType === 803
                        ? [71]
                        : [],
              },
              Identity: {
                getAvailableAttributePoints: () => runtime.attributePoints,
                getWildcardPoints: () => 1,
              },
            }
          : null,
    },
    Game: {
      Notifications: {
        getEndTurnBlockingType: () => 0,
        findEndTurnBlocking: () => null,
      },
      ProgressionTrees: {
        getTree: () => ({
          activeNodeIndex: runtime.cultureCurrent === null ? -1 : 0,
          nodes: runtime.cultureCurrent === null ? [] : [{ nodeType: runtime.cultureCurrent }],
        }),
        getNodeState: () => 2,
        getNode: () => ({
          nodeType: 51,
          depthUnlocked: runtime.attributeDepth,
          repeatedDepth: 0,
        }),
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
          const values = args as Record<string, number>;
          if (operationType === "SET_TECH_TREE_NODE") {
            runtime.techCurrent = values.ProgressionTreeNodeType ?? null;
          } else if (operationType === "SET_CULTURE_TREE_NODE") {
            runtime.cultureCurrent = values.ProgressionTreeNodeType ?? null;
          } else if (operationType === "SET_TECH_TREE_TARGET_NODE") {
            runtime.techTarget = values.ProgressionTreeNodeType ?? runtime.techTarget;
          } else if (operationType === "SET_CULTURE_TREE_TARGET_NODE") {
            runtime.cultureTarget = values.ProgressionTreeNodeType ?? runtime.cultureTarget;
          } else if (operationType === "BUY_ATTRIBUTE_TREE_NODE") {
            runtime.attributeDepth += 1;
            runtime.attributePoints -= 1;
          } else if (operationType === "CHANGE_TRADITION") {
            const tradition = values.TraditionType;
            if (values.Action === 701 && !runtime.activeTraditions.includes(tradition)) {
              runtime.activeTraditions.push(tradition);
            } else if (values.Action === 702) {
              runtime.activeTraditions = runtime.activeTraditions.filter(
                (active) => active !== tradition
              );
            }
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
        const match = frame.message.match(/^CMD:([^:]+):(.*)$/s);
        if (!match) continue;
        try {
          socket.write(
            encodeResponse(frame.listenerId, [String(runInNewContext(match[2] ?? "", globals))])
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
    address: () => server.address() as AddressInfo,
    close: async () => {
      server.close();
      await once(server, "close");
    },
  };
}

function tunerOptions(server: { address(): AddressInfo }) {
  return {
    host: "127.0.0.1",
    port: server.address().port,
    timeoutMs: 1_000,
  };
}

function jsonClone(value: unknown): unknown {
  return JSON.parse(JSON.stringify(value));
}

function parseRequest(buffer: Buffer) {
  if (buffer.length < 8) return null;
  const messageLength = buffer.readUInt32LE(0);
  const bytesRead = 8 + messageLength;
  if (buffer.length < bytesRead) return null;
  return {
    bytesRead,
    listenerId: buffer.readUInt32LE(4),
    message: buffer.subarray(8, bytesRead).toString("utf8").replace(/\0$/, ""),
  };
}

function encodeResponse(listenerId: number, values: string[]): Buffer {
  const payload = Buffer.from(`${values.join("\0")}\0`, "utf8");
  const frame = Buffer.alloc(8 + payload.length);
  frame.writeUInt32LE(payload.length, 0);
  frame.writeUInt32LE(listenerId, 4);
  payload.copy(frame, 8);
  return frame;
}
