import { once } from "node:events";
import { type AddressInfo, createServer } from "node:net";
import { describe, expect, test } from "vitest";

import { requestCiv7DiplomacyResponse } from "../src/index";

type ComponentId = { owner: number; id: number; type?: number };

type OperationCall = {
  phase: "wrapper-validation" | "closeout-validation" | "closeout-send";
  stateId: string;
  playerId: number;
  operationType: string;
  args: Record<string, number>;
  test?: boolean;
};

type NotificationCall = {
  kind: "activate";
  notificationId: ComponentId;
  actionId: number;
};

type UiCloseoutCall = {
  kind:
    | "LeaderModelManager.beginAcknowledgePlayerSequence"
    | "DiplomacyManager.closeCurrentDiplomacyProject"
    | "DiplomacyManager.hide";
  args: unknown[];
};

type DiplomacyResponseMode =
  | "turn-unblocked"
  | "stale"
  | "diplomacy-blocker-cleared"
  | "blocking-notification-changed"
  | "validation-changed"
  | "not-sent";

type FakeTunerServer = {
  received: string[];
  operationCalls: OperationCall[];
  notificationCalls: NotificationCall[];
  uiCloseoutCalls: UiCloseoutCall[];
  address(): AddressInfo;
  close(): Promise<void>;
};

describe("diplomacy response requests", () => {
  test("requests App UI diplomacy response closeout with semantic notification, operation, and UI closeout calls", async () => {
    const actionId = 8821;
    const responseType = -1713616684;
    const notificationId = { owner: 0, id: 44, type: 20 };
    const server = await startDiplomacyResponseTunerServer({
      actionId,
      responseType,
      notificationId,
    });

    try {
      const { port } = server.address();
      const request = await requestCiv7DiplomacyResponse(
        { playerId: 2, actionId, responseType, notificationId },
        { host: "127.0.0.1", port, timeoutMs: 1_000 }
      );

      expect(request.sent).toBe(true);
      expect(request.verified).toBe(true);
      expect(request.postcondition).toMatchObject({
        classification: "turn-unblocked",
        reason: "The response and UI closeout left the turn unblocked.",
      });
      expect(request.playerId).toBe(0);
      expect(request.before.localPlayerId).toBe(0);
      expect(request.before.notifications).toEqual([
        expect.objectContaining({
          id: notificationId,
          typeName: "NOTIFICATION_DIPLOMATIC_RESPONSE_REQUIRED",
          target: { id: actionId },
          isEndTurnBlocking: true,
        }),
      ]);
      expect(request.beforeValidation).toMatchObject({
        family: "player-operation",
        operationType: "RESPOND_DIPLOMATIC_ACTION",
        enumValue: "RESPOND_DIPLOMATIC_ACTION",
        target: { playerId: 0 },
        args: { ID: actionId, Type: responseType },
        valid: true,
        result: { Success: true },
      });
      expect(request.after.canEndTurn).toEqual({ ok: true, value: true });
      expect(request.payload).toMatchObject({
        localPlayerId: 0,
        playerId: 0,
        actionId,
        responseType,
        args: { ID: actionId, Type: responseType },
        notificationId,
        activated: true,
        activationResult: {
          ok: true,
          value: {
            found: true,
            target: { id: actionId },
            activated: true,
          },
        },
        canStart: { ok: true, value: { Success: true } },
        sent: true,
        sendResult: { ok: true, value: true },
        uiCloseout: {
          requested: true,
          acknowledgeStarted: { ok: true, value: true },
          closeCurrentDiplomacyProject: { ok: true, value: true },
          hide: { ok: true, value: true },
        },
      });

      expect(server.notificationCalls).toEqual([{ kind: "activate", notificationId, actionId }]);
      expect(server.operationCalls).toEqual([
        {
          phase: "wrapper-validation",
          stateId: "1",
          playerId: 0,
          operationType: "RESPOND_DIPLOMATIC_ACTION",
          args: { ID: actionId, Type: responseType },
          test: false,
        },
        {
          phase: "closeout-validation",
          stateId: "65535",
          playerId: 0,
          operationType: "RESPOND_DIPLOMATIC_ACTION",
          args: { ID: actionId, Type: responseType },
          test: false,
        },
        {
          phase: "closeout-send",
          stateId: "65535",
          playerId: 0,
          operationType: "RESPOND_DIPLOMATIC_ACTION",
          args: { ID: actionId, Type: responseType },
        },
        {
          phase: "wrapper-validation",
          stateId: "1",
          playerId: 0,
          operationType: "RESPOND_DIPLOMATIC_ACTION",
          args: { ID: actionId, Type: responseType },
          test: false,
        },
      ]);
      expect(server.uiCloseoutCalls).toEqual([
        { kind: "LeaderModelManager.beginAcknowledgePlayerSequence", args: [] },
        { kind: "DiplomacyManager.closeCurrentDiplomacyProject", args: [false] },
        { kind: "DiplomacyManager.hide", args: [false] },
      ]);
    } finally {
      await server.close();
    }
  });

  test("does not verify diplomacy responses when the same blocker remains live after send", async () => {
    const actionId = 8821;
    const responseType = -1713616684;
    const notificationId = { owner: 0, id: 44, type: 20 };
    const server = await startDiplomacyResponseTunerServer({
      actionId,
      responseType,
      notificationId,
      mode: "stale",
    });

    try {
      const { port } = server.address();
      const request = await requestCiv7DiplomacyResponse(
        { playerId: 0, actionId, responseType, notificationId },
        { host: "127.0.0.1", port, timeoutMs: 1_000 }
      );

      expect(request.sent).toBe(true);
      expect(request.verified).toBe(false);
      expect(request.postcondition).toMatchObject({
        classification: "no-state-change",
      });
      expect(request.postcondition.reason).toContain("notification, turn-blocking, and validator state did not change");
      expect(request.after.notifications).toEqual([
        expect.objectContaining({
          id: notificationId,
          typeName: "NOTIFICATION_DIPLOMATIC_RESPONSE_REQUIRED",
        }),
      ]);
    } finally {
      await server.close();
    }
  });

  test("classifies diplomacy blocker cleared when the matching blocker disappears but turn stays blocked", async () => {
    const actionId = 8821;
    const responseType = -1713616684;
    const notificationId = { owner: 0, id: 44, type: 20 };
    const server = await startDiplomacyResponseTunerServer({
      actionId,
      responseType,
      notificationId,
      mode: "diplomacy-blocker-cleared",
    });

    try {
      const { port } = server.address();
      const request = await requestCiv7DiplomacyResponse(
        { playerId: 0, actionId, responseType, notificationId },
        { host: "127.0.0.1", port, timeoutMs: 1_000 }
      );

      expect(request.sent).toBe(true);
      expect(request.verified).toBe(true);
      expect(request.postcondition).toMatchObject({
        classification: "diplomacy-blocker-cleared",
        reason: "The matching diplomatic-response notification is no longer present as a blocking decision.",
      });
      expect(request.after.canEndTurn).toEqual({ ok: true, value: false });
      expect(request.after.blockingNotificationId).toEqual({ ok: true, value: { owner: 0, id: 77, type: 20 } });
    } finally {
      await server.close();
    }
  });

  test("classifies blocking notification changed when the blocker remains but under a replacement notification id", async () => {
    const actionId = 8821;
    const responseType = -1713616684;
    const notificationId = { owner: 0, id: 44, type: 20 };
    const server = await startDiplomacyResponseTunerServer({
      actionId,
      responseType,
      notificationId,
      mode: "blocking-notification-changed",
    });

    try {
      const { port } = server.address();
      const request = await requestCiv7DiplomacyResponse(
        { playerId: 0, actionId, responseType, notificationId },
        { host: "127.0.0.1", port, timeoutMs: 1_000 }
      );

      expect(request.sent).toBe(true);
      expect(request.verified).toBe(true);
      expect(request.postcondition).toMatchObject({
        classification: "blocking-notification-changed",
        reason: "The end-turn blocking notification changed after the response closeout.",
      });
      expect(request.after.notifications).toEqual([
        expect.objectContaining({
          id: { owner: 0, id: 45, type: 20 },
          target: { id: actionId },
          typeName: "NOTIFICATION_DIPLOMATIC_RESPONSE_REQUIRED",
        }),
      ]);
    } finally {
      await server.close();
    }
  });

  test("classifies validation changed when the blocker stays live but the post-closeout validator drifts", async () => {
    const actionId = 8821;
    const responseType = -1713616684;
    const notificationId = { owner: 0, id: 44, type: 20 };
    const server = await startDiplomacyResponseTunerServer({
      actionId,
      responseType,
      notificationId,
      mode: "validation-changed",
    });

    try {
      const { port } = server.address();
      const request = await requestCiv7DiplomacyResponse(
        { playerId: 0, actionId, responseType, notificationId },
        { host: "127.0.0.1", port, timeoutMs: 1_000 }
      );

      expect(request.sent).toBe(true);
      expect(request.verified).toBe(true);
      expect(request.postcondition).toMatchObject({
        classification: "validation-changed",
        reason: "The response validator changed after the send, but the notification/turn state did not clearly clear.",
      });
      expect(request.after.canEndTurn).toEqual({ ok: true, value: false });
      expect(request.after.notifications).toEqual([
        expect.objectContaining({
          id: notificationId,
          typeName: "NOTIFICATION_DIPLOMATIC_RESPONSE_REQUIRED",
        }),
      ]);
      expect(request.afterValidation).toMatchObject({
        valid: false,
        result: { Success: false, FailureReasons: ["test post-closeout validator drift"] },
      });
    } finally {
      await server.close();
    }
  });

  test("does not verify diplomacy responses when closeout reaches sendRequest failure after pre-validation", async () => {
    const actionId = 8821;
    const responseType = -1713616684;
    const notificationId = { owner: 0, id: 44, type: 20 };
    const server = await startDiplomacyResponseTunerServer({
      actionId,
      responseType,
      notificationId,
      mode: "not-sent",
    });

    try {
      const { port } = server.address();
      const request = await requestCiv7DiplomacyResponse(
        { playerId: 0, actionId, responseType, notificationId },
        { host: "127.0.0.1", port, timeoutMs: 1_000 }
      );

      expect(request.sent).toBe(false);
      expect(request.verified).toBe(false);
      expect(request.payload).toMatchObject({
        sent: false,
        sendResult: {
          ok: false,
          error: "Game.PlayerOperations.sendRequest: test send failure",
        },
      });
      expect(request.postcondition).toMatchObject({
        classification: "not-sent",
        reason: "The diplomatic response was not sent, so no postcondition can be verified.",
      });
    } finally {
      await server.close();
    }
  });
});

async function startDiplomacyResponseTunerServer(input: {
  actionId: number;
  responseType: number;
  notificationId: ComponentId;
  mode?: DiplomacyResponseMode;
}): Promise<FakeTunerServer> {
  const received: string[] = [];
  const operationCalls: OperationCall[] = [];
  const notificationCalls: NotificationCall[] = [];
  const uiCloseoutCalls: UiCloseoutCall[] = [];
  let notificationReadCount = 0;
  let closeoutObserved = false;
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
        const response = handleCommand(frame.message, {
          input,
          notificationReadCount,
          closeoutObserved,
          mode: input.mode ?? "turn-unblocked",
          operationCalls,
          notificationCalls,
          uiCloseoutCalls,
        });
        if (response.kind === "notification-view") notificationReadCount += 1;
        if (response.kind === "closeout") closeoutObserved = true;
        socket.write(encodeResponse(frame.listenerId, [response.output]));
      }
    });
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  return {
    received,
    operationCalls,
    notificationCalls,
    uiCloseoutCalls,
    address: () => server.address() as AddressInfo,
    close: async () => {
      server.close();
      await once(server, "close");
    },
  };
}

function handleCommand(
  message: string,
  state: {
    input: { actionId: number; responseType: number; notificationId: ComponentId };
    notificationReadCount: number;
    closeoutObserved: boolean;
    mode: DiplomacyResponseMode;
    operationCalls: OperationCall[];
    notificationCalls: NotificationCall[];
    uiCloseoutCalls: UiCloseoutCall[];
  }
): { kind: "notification-view" | "validation" | "closeout"; output: string } {
  const command = parseCommandMessage(message);
  if (command.script.includes("return JSON.stringify(readPlayNotifications(")) {
    return {
      kind: "notification-view",
      output: JSON.stringify(notificationViewPayload(state.input, state.notificationReadCount > 0, state.mode)),
    };
  }
  if (command.script.includes("return JSON.stringify(validateOperation(")) {
    const validation = parseValidationCommand(command.script);
    expect(validation).toEqual({
      family: "player-operation",
      input: {
        playerId: 0,
        operationType: "RESPOND_DIPLOMATIC_ACTION",
        args: { ID: state.input.actionId, Type: state.input.responseType },
      },
    });
    state.operationCalls.push({
      phase: "wrapper-validation",
      stateId: command.stateId,
      playerId: validation.input.playerId,
      operationType: validation.input.operationType,
      args: validation.input.args,
      test: false,
    });
    return {
      kind: "validation",
      output: JSON.stringify(operationValidationPayload(validation.input, state.mode, state.closeoutObserved)),
    };
  }
  if (command.script.includes("return JSON.stringify(sendDiplomacyResponseCloseout(")) {
    const closeout = parseDiplomacyCloseoutCommand(command.script);
    expect(closeout).toEqual({
      playerId: 0,
      actionId: state.input.actionId,
      responseType: state.input.responseType,
      notificationId: state.input.notificationId,
    });
    assertDiplomacyCloseoutSemantics(command.script);

    state.notificationCalls.push({
      kind: "activate",
      notificationId: closeout.notificationId,
      actionId: closeout.actionId,
    });
    state.operationCalls.push(
      {
        phase: "closeout-validation",
        stateId: command.stateId,
        playerId: 0,
        operationType: "RESPOND_DIPLOMATIC_ACTION",
        args: { ID: closeout.actionId, Type: closeout.responseType },
        test: false,
      },
      {
        phase: "closeout-send",
        stateId: command.stateId,
        playerId: 0,
        operationType: "RESPOND_DIPLOMATIC_ACTION",
        args: { ID: closeout.actionId, Type: closeout.responseType },
      }
    );
    state.uiCloseoutCalls.push(
      { kind: "LeaderModelManager.beginAcknowledgePlayerSequence", args: [] },
      { kind: "DiplomacyManager.closeCurrentDiplomacyProject", args: [false] },
      { kind: "DiplomacyManager.hide", args: [false] }
    );
    return {
      kind: "closeout",
      output: JSON.stringify(diplomacyCloseoutPayload(closeout, state.mode)),
    };
  }
  return {
    kind: "validation",
    output: JSON.stringify({
      ok: false,
      error: `unhandled fake tuner command: ${message.slice(0, 160)}`,
    }),
  };
}

function parseCommandMessage(message: string): { stateId: string; script: string } {
  const match = /^CMD:([^:]+):([\s\S]*)$/.exec(message);
  if (!match) throw new Error(`Expected CMD tuner message, received: ${message}`);
  return { stateId: match[1], script: match[2] };
}

function parseValidationCommand(script: string): {
  family: string;
  input: { playerId: number; operationType: string; args: Record<string, number> };
} {
  const familyMatch = /return JSON\.stringify\(validateOperation\("([^"]+)"/.exec(script);
  if (!familyMatch) throw new Error("Could not parse operation validation family");
  return {
    family: familyMatch[1],
    input: JSON.parse(extractJsonObjectAfter(script, "return JSON.stringify(validateOperation(")),
  };
}

function parseDiplomacyCloseoutCommand(script: string): {
  playerId: number;
  actionId: number;
  responseType: number;
  notificationId: ComponentId;
} {
  return JSON.parse(
    extractJsonObjectAfter(script, "return JSON.stringify(sendDiplomacyResponseCloseout(")
  );
}

function assertDiplomacyCloseoutSemantics(script: string): void {
  expect(script).toContain("Game.Diplomacy.getResponseDataForUI(notification.Target.id)");
  expect(script).toContain(
    "Game.PlayerOperations.canStart(\n        playerId,\n        PlayerOperationTypes.RESPOND_DIPLOMATIC_ACTION,\n        args,\n        false"
  );
  expect(script).toContain(
    "Game.PlayerOperations.sendRequest(\n          playerId,\n          PlayerOperationTypes.RESPOND_DIPLOMATIC_ACTION,\n          args"
  );
  expect(script).toContain("LeaderModelManager.beginAcknowledgePlayerSequence");
  expect(script).toContain("DiplomacyManager.closeCurrentDiplomacyProject");
  expect(script).toContain("DiplomacyManager.hide");
}

function extractJsonObjectAfter(script: string, marker: string): string {
  const markerIndex = script.indexOf(marker);
  if (markerIndex < 0) throw new Error(`Missing marker: ${marker}`);
  const start = script.indexOf("{", markerIndex);
  if (start < 0) throw new Error(`Missing JSON object after marker: ${marker}`);
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let index = start; index < script.length; index += 1) {
    const char = script[index];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === "\\") {
      escaped = inString;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) return script.slice(start, index + 1);
    }
  }
  throw new Error(`Unterminated JSON object after marker: ${marker}`);
}

function operationValidationPayload(input: {
  playerId: number;
  operationType: string;
  args: Record<string, number>;
}, mode: DiplomacyResponseMode, closeoutObserved: boolean) {
  if (mode === "validation-changed" && closeoutObserved) {
    return {
      family: "player-operation",
      operationType: input.operationType,
      enumValue: input.operationType,
      target: { playerId: input.playerId },
      args: input.args,
      valid: false,
      result: { Success: false, FailureReasons: ["test post-closeout validator drift"] },
    };
  }
  return {
    family: "player-operation",
    operationType: input.operationType,
    enumValue: input.operationType,
    target: { playerId: input.playerId },
    args: input.args,
    valid: true,
    result: { Success: true },
  };
}

function diplomacyCloseoutPayload(input: {
  actionId: number;
  responseType: number;
  notificationId: ComponentId;
}, mode: DiplomacyResponseMode) {
  return {
    localPlayerId: 0,
    playerId: 0,
    actionId: input.actionId,
    responseType: input.responseType,
    args: { ID: input.actionId, Type: input.responseType },
    notificationId: input.notificationId,
    discoveredNotification: { ok: true, value: input.notificationId },
    activated: true,
    activationResult: {
      ok: true,
      value: {
        found: true,
        target: { id: input.actionId },
        activated: true,
        currentProjectReactionDataActionID: input.actionId,
        currentProjectReactionRequestActionID: null,
      },
    },
    canStart: { ok: true, value: { Success: true } },
    sent: mode !== "not-sent",
    sendResult: mode === "not-sent"
      ? { ok: false, error: "Game.PlayerOperations.sendRequest: test send failure" }
      : { ok: true, value: true },
    uiCloseout: {
      requested: true,
      acknowledgeStarted: { ok: true, value: true },
      closeCurrentDiplomacyProject: { ok: true, value: true },
      hide: { ok: true, value: true },
    },
    diplomacyState: {
      before: { currentProjectReactionDataActionID: input.actionId },
      after: { currentProjectReactionDataActionID: null },
    },
    notes: [
      "This follows the official response-panel path more closely than a raw player-operation send: optional notification activation, RESPOND_DIPLOMATIC_ACTION, leader acknowledgement, and diplomacy UI closeout.",
      "If postcondition remains no-state-change, inspect notification expiry/target state before retrying another response.",
    ],
  };
}

function notificationViewPayload(
  input: { actionId: number; notificationId: ComponentId },
  afterSend: boolean,
  mode: DiplomacyResponseMode,
) {
  const notification = {
    id: input.notificationId,
    type: "NOTIFICATION_DIPLOMATIC_RESPONSE_REQUIRED",
    typeName: "NOTIFICATION_DIPLOMATIC_RESPONSE_REQUIRED",
    groupType: null,
    player: null,
    summary: "LOC_NOTIFICATION_DIPLOMATIC_RESPONSE_REQUIRED",
    message: "LOC_NOTIFICATION_DIPLOMATIC_RESPONSE_REQUIRED",
    target: { id: input.actionId },
    location: null,
    canUserDismiss: false,
    expired: false,
    dismissed: afterSend,
    isEndTurnBlocking: !afterSend,
    decision: {
      category: "diplomacy-response",
      operationFamily: "player-operation",
      operationType: "RESPOND_DIPLOMATIC_ACTION",
      argsShape: "{ ID, Type }",
      cli: "game play respond-diplomacy",
      requiredInputs: [],
      commonActions: [],
      notes: [],
    },
    details: {
      actionId: input.actionId,
      responseOptions: [{ responseType: -1713616684, enabled: true }],
    },
  };
  const afterNotification = mode === "blocking-notification-changed"
    ? {
        ...notification,
        id: { owner: 0, id: 45, type: 20 },
      }
    : notification;
  const otherBlockingNotification = {
    id: { owner: 0, id: 77, type: 20 },
    type: "NOTIFICATION_CHOOSE_TECH",
    typeName: "NOTIFICATION_CHOOSE_TECH",
    groupType: null,
    player: null,
    summary: "LOC_NOTIFICATION_CHOOSE_TECH",
    message: "LOC_NOTIFICATION_CHOOSE_TECH",
    target: { id: 999 },
    location: null,
    canUserDismiss: false,
    expired: false,
    dismissed: false,
    isEndTurnBlocking: true,
    decision: {
      category: "technology-choice",
      operationFamily: "player-operation",
      operationType: "SET_TECH_TREE_NODE",
      argsShape: "{ ProgressionTreeNodeType }",
      cli: "game play choose-technology",
      requiredInputs: [],
      commonActions: [],
      notes: [],
    },
    details: {
      node: 12,
    },
  };
  const notifications = !afterSend
    ? [notification]
    : mode === "stale" || mode === "validation-changed" || mode === "not-sent"
      ? [notification]
      : mode === "diplomacy-blocker-cleared"
        ? [otherBlockingNotification]
        : mode === "blocking-notification-changed"
          ? [afterNotification]
          : [];
  return {
    localPlayerId: 0,
    turn: { ok: true, value: 43 },
    turnDate: { ok: true, value: "test-turn" },
    hasSentTurnComplete: { ok: true, value: false },
    canEndTurn: { ok: true, value: afterSend && mode === "turn-unblocked" },
    blocker: { ok: true, value: notifications[0]?.typeName ?? null },
    blockingNotificationId: { ok: true, value: notifications[0]?.id ?? null },
    selectedUnitId: { ok: true, value: null },
    selectedCityId: { ok: true, value: null },
    firstReadyUnitId: { ok: true, value: null },
    notifications,
    decisions: notifications.map((item) => item.decision),
    hud: {
      nextDecision: notifications[0] ?? null,
      decisionQueue: notifications,
    },
    limits: { maxNotifications: 25, truncated: false },
  };
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
