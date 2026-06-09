import { once } from "node:events";
import { type AddressInfo, createServer } from "node:net";
import { describe, expect, test } from "vitest";

import { requestCiv7NarrativeChoice } from "../src/index";

type ComponentId = { owner: number; id: number; type?: number };

type FakeTunerServer = {
  received: string[];
  operationCalls: OperationCall[];
  narrativeChoiceRequests: NarrativeChoiceRequest[];
  address(): AddressInfo;
  close(): Promise<void>;
};

type OperationCall = {
  family: string;
  input: {
    playerId?: number;
    operationType?: string;
    args?: Record<string, unknown>;
  };
};

type NarrativeChoiceInput = {
  playerId: number;
  targetType: string;
  target: ComponentId;
  action: number;
};

type NarrativeChoiceMode =
  | "blocker-cleared"
  | "stale"
  | "panel-cleared-notification-changed"
  | "validation-changed"
  | "turn-unblocked"
  | "send-failed";

type NarrativeChoiceRequest = {
  input: NarrativeChoiceInput;
  playerOperation: {
    playerId: number;
    operationType: "CHOOSE_NARRATIVE_STORY_DIRECTION";
    args: {
      TargetType: string;
      Target: ComponentId;
      Action: number;
    };
  };
  sourceChecks: {
    buildsInputArgs: boolean;
    validatesWithPlayerOperation: boolean;
    sendsPlayerOperation: boolean;
    closesPopup: boolean;
    closesVisiblePanel: boolean;
  };
};

describe("narrative choice requests", () => {
  test("requests narrative choices through player-operation validation and App UI narrative closeout", async () => {
    const server = await startNarrativeChoiceTunerServer();
    try {
      const { port } = server.address();
      const target = { owner: 0, id: 421, type: 24 };
      const request = await requestCiv7NarrativeChoice(
        { playerId: 2, targetType: "CLOSE", target, action: 1 },
        { host: "127.0.0.1", port, timeoutMs: 1_000 },
        { approved: true, reason: "test narrative choice send" }
      );

      expect(request.sent).toBe(true);
      expect(request.verified).toBe(true);
      expect(request.postcondition).toMatchObject({
        classification: "narrative-blocker-cleared",
      });
      expect(request.playerId).toBe(0);
      expect(request.payload).toMatchObject({
        localPlayerId: 0,
        playerId: 0,
        args: { TargetType: "CLOSE", Target: target, Action: 1 },
        canStart: { ok: true, value: { Success: true } },
        sent: true,
        sendResult: { ok: true, value: true },
        ui: {
          panelClose: { ok: true, value: { attempted: 1 } },
          popupClose: { ok: true, value: { available: true } },
        },
      });
      expect(server.operationCalls).toEqual([
        {
          family: "player-operation",
          input: {
            playerId: 0,
            operationType: "CHOOSE_NARRATIVE_STORY_DIRECTION",
            args: { TargetType: "CLOSE", Target: target, Action: 1 },
          },
        },
        {
          family: "player-operation",
          input: {
            playerId: 0,
            operationType: "CHOOSE_NARRATIVE_STORY_DIRECTION",
            args: { TargetType: "CLOSE", Target: target, Action: 1 },
          },
        },
      ]);
      expect(server.narrativeChoiceRequests).toEqual([
        {
          input: { playerId: 2, targetType: "CLOSE", target, action: 1 },
          playerOperation: {
            playerId: 0,
            operationType: "CHOOSE_NARRATIVE_STORY_DIRECTION",
            args: { TargetType: "CLOSE", Target: target, Action: 1 },
          },
          sourceChecks: {
            buildsInputArgs: true,
            validatesWithPlayerOperation: true,
            sendsPlayerOperation: true,
            closesPopup: true,
            closesVisiblePanel: true,
          },
        },
      ]);
      expect(
        server.received.some((message) => message.includes("return JSON.stringify(sendOperation"))
      ).toBe(false);
    } finally {
      await server.close();
    }
  });

  test("does not verify narrative choices when the same blocker remains live after send", async () => {
    const server = await startNarrativeChoiceTunerServer({ mode: "stale" });
    try {
      const { port } = server.address();
      const target = { owner: 0, id: 421, type: 24 };
      const request = await requestCiv7NarrativeChoice(
        { playerId: 0, targetType: "CLOSE", target, action: 1 },
        { host: "127.0.0.1", port, timeoutMs: 1_000 },
        { approved: true, reason: "test narrative stale blocker" }
      );

      expect(request.sent).toBe(true);
      expect(request.verified).toBe(false);
      expect(request.postcondition).toMatchObject({
        classification: "no-state-change",
      });
      expect(request.postcondition.reason).toContain("same narrative blocker remained live");
      expect(request.payload).toMatchObject({
        ui: {
          after: {
            matchingPanelCount: 1,
          },
        },
      });
    } finally {
      await server.close();
    }
  });

  test("classifies narrative panel closeout when panel clears but blocker identity changes", async () => {
    const server = await startNarrativeChoiceTunerServer({ mode: "panel-cleared-notification-changed" });
    try {
      const { port } = server.address();
      const target = { owner: 0, id: 421, type: 24 };
      const request = await requestCiv7NarrativeChoice(
        { playerId: 0, targetType: "CLOSE", target, action: 1 },
        { host: "127.0.0.1", port, timeoutMs: 1_000 },
        { approved: true, reason: "test narrative panel closeout" }
      );

      expect(request.sent).toBe(true);
      expect(request.verified).toBe(true);
      expect(request.postcondition).toMatchObject({
        classification: "narrative-panel-cleared",
        reason: "The visible narrative panel for the selected story target was closed after the choice.",
      });
      expect(request.after.notifications).toEqual([
        expect.objectContaining({
          id: { owner: 0, id: 902, type: 20 },
          typeName: "NOTIFICATION_CHOOSE_NARRATIVE_STORY_DIRECTION",
        }),
      ]);
      expect(request.payload).toMatchObject({
        ui: {
          after: {
            matchingPanelCount: 0,
          },
        },
      });
    } finally {
      await server.close();
    }
  });

  test("does not send narrative choices when the player-operation validator rejects them", async () => {
    const server = await startNarrativeChoiceTunerServer({ valid: false });
    try {
      const { port } = server.address();
      const target = { owner: 0, id: 421, type: 24 };
      const request = await requestCiv7NarrativeChoice(
        { playerId: 0, targetType: "8088B", target, action: 1 },
        { host: "127.0.0.1", port, timeoutMs: 1_000 },
        { approved: true, reason: "test invalid narrative choice" }
      );

      expect(request.sent).toBe(false);
      expect(request.verified).toBe(false);
      expect(request.postcondition).toMatchObject({
        classification: "not-sent",
        reason:
          "CHOOSE_NARRATIVE_STORY_DIRECTION did not validate, so no narrative choice was sent.",
      });
      expect(server.operationCalls).toEqual([
        {
          family: "player-operation",
          input: {
            playerId: 0,
            operationType: "CHOOSE_NARRATIVE_STORY_DIRECTION",
            args: { TargetType: "8088B", Target: target, Action: 1 },
          },
        },
      ]);
      expect(server.narrativeChoiceRequests).toEqual([]);
    } finally {
      await server.close();
    }
  });

  test("classifies validation changed when the blocker stays live but the post-closeout validator drifts", async () => {
    const server = await startNarrativeChoiceTunerServer({ mode: "validation-changed" });
    try {
      const { port } = server.address();
      const target = { owner: 0, id: 421, type: 24 };
      const request = await requestCiv7NarrativeChoice(
        { playerId: 0, targetType: "CLOSE", target, action: 1 },
        { host: "127.0.0.1", port, timeoutMs: 1_000 },
        { approved: true, reason: "test narrative validation drift" }
      );

      expect(request.sent).toBe(true);
      expect(request.verified).toBe(true);
      expect(request.postcondition).toMatchObject({
        classification: "validation-changed",
        reason:
          "The narrative choice validator changed after the send, but notification/turn state did not clearly clear.",
      });
      expect(request.beforeValidation).toMatchObject({
        valid: true,
      });
      expect(request.afterValidation).toMatchObject({
        valid: false,
        result: { Success: false, FailureReasons: ["post-send drift"] },
      });
    } finally {
      await server.close();
    }
  });

  test("classifies turn unblocked when the narrative choice leaves no blocking decision", async () => {
    const server = await startNarrativeChoiceTunerServer({ mode: "turn-unblocked" });
    try {
      const { port } = server.address();
      const target = { owner: 0, id: 421, type: 24 };
      const request = await requestCiv7NarrativeChoice(
        { playerId: 0, targetType: "CLOSE", target, action: 1 },
        { host: "127.0.0.1", port, timeoutMs: 1_000 },
        { approved: true, reason: "test narrative turn unblock" }
      );

      expect(request.sent).toBe(true);
      expect(request.verified).toBe(true);
      expect(request.postcondition).toMatchObject({
        classification: "turn-unblocked",
        reason: "The narrative choice and UI handling left the turn unblocked.",
      });
      expect(request.after.canEndTurn).toEqual({ ok: true, value: true });
      expect(request.after.notifications).toEqual([]);
    } finally {
      await server.close();
    }
  });

  test("does not verify narrative choices when App UI closeout reports no send after pre-validation", async () => {
    const server = await startNarrativeChoiceTunerServer({ mode: "send-failed" });
    try {
      const { port } = server.address();
      const target = { owner: 0, id: 421, type: 24 };
      const request = await requestCiv7NarrativeChoice(
        { playerId: 0, targetType: "CLOSE", target, action: 1 },
        { host: "127.0.0.1", port, timeoutMs: 1_000 },
        { approved: true, reason: "test narrative send failure" }
      );

      expect(request.sent).toBe(false);
      expect(request.verified).toBe(false);
      expect(request.beforeValidation).toMatchObject({
        valid: true,
      });
      expect(request.afterValidation).toMatchObject({
        valid: true,
      });
      expect(request.postcondition).toMatchObject({
        classification: "not-sent",
        reason:
          "The narrative choice was not sent, either because validation failed before send or the App UI closeout reported no send.",
      });
      expect(request.payload).toMatchObject({
        sent: false,
        sendResult: { ok: true, value: false },
      });
    } finally {
      await server.close();
    }
  });
});

async function startNarrativeChoiceTunerServer(
  options: { valid?: boolean; mode?: NarrativeChoiceMode } = {}
): Promise<FakeTunerServer> {
  const received: string[] = [];
  const operationCalls: OperationCall[] = [];
  const narrativeChoiceRequests: NarrativeChoiceRequest[] = [];
  let narrativeChoiceSent = false;
  const valid = options.valid ?? true;
  const mode = options.mode ?? "blocker-cleared";
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

        const operationCall = parseOperationValidationCall(frame.message);
        const narrativeChoiceRequest = parseNarrativeChoiceRequest(frame.message);
        if (operationCall) operationCalls.push(operationCall);
        if (narrativeChoiceRequest) narrativeChoiceRequests.push(narrativeChoiceRequest);

        if (frame.message.includes("readPlayNotifications")) {
          socket.write(
            encodeResponse(frame.listenerId, [
              JSON.stringify(playNotificationView({ sent: narrativeChoiceSent, mode })),
            ])
          );
        } else if (operationCall) {
          const operationValid = operationValidationValid({ valid, mode, narrativeChoiceSent });
          socket.write(
            encodeResponse(frame.listenerId, [
              JSON.stringify(operationValidation(operationCall, operationValid, narrativeChoiceSent ? "post-send drift" : "test rejection")),
            ])
          );
        } else if (narrativeChoiceRequest) {
          narrativeChoiceSent = true;
          socket.write(
            encodeResponse(frame.listenerId, [
              JSON.stringify(narrativeChoicePayload(narrativeChoiceRequest, mode)),
            ])
          );
        } else {
          socket.write(encodeResponse(frame.listenerId, ["2"]));
        }
      }
    });
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  return {
    received,
    operationCalls,
    narrativeChoiceRequests,
    address: () => server.address() as AddressInfo,
    close: async () => {
      server.close();
      await once(server, "close");
    },
  };
}

function operationValidationValid(input: {
  valid: boolean;
  mode: NarrativeChoiceMode;
  narrativeChoiceSent: boolean;
}) {
  if (!input.valid) return false;
  if (!input.narrativeChoiceSent) return true;
  if (input.mode === "validation-changed") return false;
  return true;
}

function parseOperationValidationCall(message: string): OperationCall | undefined {
  const match = message.match(
    /return JSON\.stringify\(validateOperation\(("(?:\\.|[^"\\])*"), (\{.*\})\)\);/s
  );
  if (!match) return undefined;
  return {
    family: JSON.parse(match[1]),
    input: JSON.parse(match[2]),
  };
}

function parseNarrativeChoiceRequest(message: string): NarrativeChoiceRequest | undefined {
  if (!message.startsWith("CMD:65535:")) return undefined;
  const input = parseSingleJsonArgument(message, "sendNarrativeChoice");
  if (!isNarrativeChoiceInput(input)) return undefined;
  return {
    input,
    playerOperation: {
      playerId: 0,
      operationType: "CHOOSE_NARRATIVE_STORY_DIRECTION",
      args: {
        TargetType: input.targetType,
        Target: input.target,
        Action: input.action,
      },
    },
    sourceChecks: {
      buildsInputArgs:
        /const args = \{ TargetType: input\.targetType, Target: input\.target, Action: input\.action \};/.test(
          message
        ),
      validatesWithPlayerOperation:
        /Game\.PlayerOperations\.canStart\(\s*playerId,\s*PlayerOperationTypes\.CHOOSE_NARRATIVE_STORY_DIRECTION,\s*args,\s*false,\s*\)/s.test(
          message
        ),
      sendsPlayerOperation:
        /Game\.PlayerOperations\.sendRequest\(\s*playerId,\s*PlayerOperationTypes\.CHOOSE_NARRATIVE_STORY_DIRECTION,\s*args,\s*\)/s.test(
          message
        ),
      closesPopup: /NarrativePopupManager\.closePopup/.test(message),
      closesVisiblePanel: /component\.close\(method\);/.test(message),
    },
  };
}

function parseSingleJsonArgument(message: string, callName: string): unknown {
  const marker = `${callName}(`;
  const start = message.lastIndexOf(marker);
  if (start === -1) return undefined;
  const jsonStart = start + marker.length;
  const jsonEnd = findBalancedJsonEnd(message, jsonStart);
  if (jsonEnd === -1) return undefined;
  return JSON.parse(message.slice(jsonStart, jsonEnd + 1));
}

function findBalancedJsonEnd(value: string, start: number): number {
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let index = start; index < value.length; index += 1) {
    const char = value[index];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }
    if (char === '"') {
      inString = true;
    } else if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  return -1;
}

function isNarrativeChoiceInput(value: unknown): value is NarrativeChoiceInput {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<NarrativeChoiceInput>;
  return (
    typeof candidate.playerId === "number" &&
    typeof candidate.targetType === "string" &&
    isComponentId(candidate.target) &&
    typeof candidate.action === "number"
  );
}

function isComponentId(value: unknown): value is ComponentId {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<ComponentId>;
  return (
    typeof candidate.owner === "number" &&
    typeof candidate.id === "number" &&
    (candidate.type === undefined || typeof candidate.type === "number")
  );
}

function operationValidation(call: OperationCall, valid: boolean, failureReason: string) {
  return {
    family: call.family,
    operationType: call.input.operationType,
    enumValue: call.input.operationType,
    target: { playerId: call.input.playerId },
    args: call.input.args,
    valid,
    result: valid ? { Success: true } : { Success: false, FailureReasons: [failureReason] },
  };
}

function narrativeChoicePayload(request: NarrativeChoiceRequest, mode: NarrativeChoiceMode) {
  const after =
    mode === "stale" || mode === "validation-changed" || mode === "send-failed"
      ? {
          panelCount: 1,
          matchingPanelCount: 1,
          matchingPanels: [
            { targetStoryId: request.input.target, choiceKeys: [request.input.targetType] },
          ],
          popupShowing: { ok: true, value: true },
        }
      : {
          panelCount: 0,
          matchingPanelCount: 0,
          matchingPanels: [],
          popupShowing: { ok: true, value: false },
        };
  return {
    localPlayerId: 0,
    playerId: request.playerOperation.playerId,
    args: request.playerOperation.args,
    canStart: { ok: true, value: { Success: true } },
    sent: mode !== "send-failed",
    sendResult: { ok: true, value: mode !== "send-failed" },
    ui: {
      before: {
        panelCount: 1,
        matchingPanelCount: 1,
        matchingPanels: [
          { targetStoryId: request.input.target, choiceKeys: [request.input.targetType] },
        ],
        popupShowing: { ok: true, value: true },
      },
      after,
      panelClose: {
        ok: true,
        value: { attempted: 1, results: [{ panelType: "SMALL-NARRATIVE-EVENT", closed: mode !== "stale" }] },
      },
      popupClose: { ok: true, value: { available: true } },
    },
    notes: [
      "This mirrors the official narrative button handler: CHOOSE_NARRATIVE_STORY_DIRECTION, NarrativePopupManager.closePopup, and visible narrative panel close.",
    ],
  };
}

function playNotificationView(input: { sent: boolean; mode: NarrativeChoiceMode }) {
  const notification = narrativeNotification(input.sent ? input.mode : "stale");
  const decisionQueue = notification ? [notification] : [];
  return {
    localPlayerId: 0,
    turn: { ok: true, value: 17 },
    turnDate: { ok: true, value: "3750 BCE" },
    hasSentTurnComplete: { ok: true, value: false },
    canEndTurn: { ok: true, value: input.sent && input.mode === "turn-unblocked" },
    blocker: { ok: true, value: notification?.id.id ?? 0 },
    blockingNotificationId: { ok: true, value: notification?.id ?? null },
    selectedUnitId: { ok: true, value: null },
    selectedCityId: { ok: true, value: null },
    firstReadyUnitId: { ok: true, value: null },
    notifications: notification ? [notification] : [],
    decisions: [],
    hud: {
      nextDecision: decisionQueue[0] ?? null,
      decisionQueue,
    },
    limits: { maxNotifications: 25, truncated: false },
  };
}

function narrativeNotification(mode: NarrativeChoiceMode) {
  if (mode === "blocker-cleared" || mode === "turn-unblocked") return undefined;
  const id = mode === "panel-cleared-notification-changed"
    ? { owner: 0, id: 902, type: 20 }
    : mode === "validation-changed"
      ? { owner: 0, id: 903, type: 20 }
      : { owner: 0, id: 901, type: 20 };
  return {
    id,
    type: 2345,
    typeName: "NOTIFICATION_CHOOSE_NARRATIVE_STORY_DIRECTION",
    summary: "Choose narrative direction",
    message: "Select a story branch.",
    target: { owner: 0, id: 421, type: 24 },
    location: null,
    canUserDismiss: false,
    expired: false,
    dismissed: false,
    isEndTurnBlocking: true,
    decision: {
      category: "narrative-choice-options",
      operationFamily: "player-operation",
      operationType: "CHOOSE_NARRATIVE_STORY_DIRECTION",
      argsShape: "{ TargetType, Target, Action }",
      requiredInputs: [],
      commonActions: [],
      notes: [],
    },
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
