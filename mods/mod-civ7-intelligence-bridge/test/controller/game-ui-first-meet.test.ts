import { describe, expect, test } from "vitest";

import {
  type Civ7GameUiFirstMeetTarget,
  checkCiv7GameUiFirstMeetResponse,
  civ7GameUiFirstMeetResponseCheckAvailable,
  civ7GameUiFirstMeetResponseSendAvailable,
  sendCiv7GameUiFirstMeetResponse,
} from "../../src/controller/game-ui/first-meet";

const localPlayerId = 0;
const metPlayerId = 3;
const blockerType = 523_279_636;
const noneBlockerType = -1;
const notificationId = { owner: 0, id: 71, type: 20 };
const responseTypes = {
  friendly: 11,
  neutral: 22,
  unfriendly: 33,
} as const;
const responseRuntimeKeys = {
  friendly: "PLAYER_REALATIONSHIP_FIRSTMEET_FRIENDLY",
  neutral: "PLAYER_REALATIONSHIP_FIRSTMEET_NEUTRAL",
  unfriendly: "PLAYER_REALATIONSHIP_FIRSTMEET_UNFRIENDLY",
} as const;

type ResponseName = keyof typeof responseTypes;
type FirstMeetSnapshot = Awaited<ReturnType<typeof checkCiv7GameUiFirstMeetResponse>>["snapshot"];

describe("game UI first-meet response atoms", () => {
  test("advertises exact check and send capabilities independently", () => {
    const complete = firstMeetRuntime();
    const readOnly = firstMeetRuntime({ sendRequest: undefined });
    const missingActionPanel = firstMeetRuntime({ actionPanel: false });
    const missingBlockerRead = firstMeetRuntime({ blockerRead: false });
    const missingBlockerLookup = firstMeetRuntime({ blockerLookup: false });
    const missingNoneBlockerType = firstMeetRuntime({ noneBlockerType: null });
    const missingNotificationFind = firstMeetRuntime({ notificationFind: false });
    const missingTypeNameRead = firstMeetRuntime({ typeNameRead: false });

    expect(civ7GameUiFirstMeetResponseCheckAvailable(complete.target)).toBe(true);
    expect(civ7GameUiFirstMeetResponseSendAvailable(complete.target)).toBe(true);
    expect(civ7GameUiFirstMeetResponseCheckAvailable(readOnly.target)).toBe(true);
    expect(civ7GameUiFirstMeetResponseSendAvailable(readOnly.target)).toBe(false);
    expect(civ7GameUiFirstMeetResponseCheckAvailable(missingActionPanel.target)).toBe(true);
    expect(civ7GameUiFirstMeetResponseCheckAvailable(missingBlockerRead.target)).toBe(true);
    expect(civ7GameUiFirstMeetResponseCheckAvailable(missingBlockerLookup.target)).toBe(true);
    expect(civ7GameUiFirstMeetResponseCheckAvailable(missingNoneBlockerType.target)).toBe(false);
    expect(civ7GameUiFirstMeetResponseCheckAvailable(missingNotificationFind.target)).toBe(true);
    expect(civ7GameUiFirstMeetResponseCheckAvailable(missingTypeNameRead.target)).toBe(true);
  });

  test.each([
    ["friendly", responseTypes.friendly],
    ["neutral", responseTypes.neutral],
    ["unfriendly", responseTypes.unfriendly],
  ] as const)("maps %s through its exact runtime enum and native operation args", async (response, responseType) => {
    const runtime = firstMeetRuntime();

    const result = await checkCiv7GameUiFirstMeetResponse(
      { metPlayerId, response },
      runtime.target
    );

    expect(result).toEqual({
      valid: true,
      result: { Success: true, FailureReasons: [] },
      snapshot: firstMeetSnapshot(response),
    });
    expect(runtime.calls).toEqual([
      {
        kind: "check",
        playerId: localPlayerId,
        operationType: "RESPOND_DIPLOMATIC_FIRST_MEET",
        args: {
          Player1: localPlayerId,
          Player2: metPlayerId,
          Type: responseType,
        },
        queue: false,
      },
    ]);
  });

  test("copies native blocker identity instead of retaining volatile runtime objects", async () => {
    const runtime = firstMeetRuntime();

    const result = await checkCiv7GameUiFirstMeetResponse(
      { metPlayerId, response: "friendly" },
      runtime.target
    );
    runtime.rawNotificationId.owner = 9;
    runtime.rawNotification.Player = 8;

    expect(result.snapshot.blockingNotification).toEqual(
      firstMeetSnapshot("friendly").blockingNotification
    );
  });

  test("guards every expected snapshot field before native validation or dispatch", async () => {
    const changedTurn = firstMeetRuntime({ canEndTurn: true });
    await expect(
      sendCiv7GameUiFirstMeetResponse(
        {
          metPlayerId,
          response: "friendly",
          expected: firstMeetSnapshot("friendly"),
        },
        changedTurn.target
      )
    ).rejects.toMatchObject({
      name: "Civ7DirectControlError",
      code: "command-failed",
      dispatchStatus: "not-dispatched",
      message: "First-meet response admission evidence changed before dispatch.",
    });
    expect(changedTurn.calls).toEqual([]);

    const changedIdentity = firstMeetRuntime({ observedMetPlayerId: 4 });
    await expect(
      sendCiv7GameUiFirstMeetResponse(
        {
          metPlayerId,
          response: "friendly",
          expected: firstMeetSnapshot("friendly"),
        },
        changedIdentity.target
      )
    ).rejects.toMatchObject({
      dispatchStatus: "not-dispatched",
      message: "First-meet response admission evidence changed before dispatch.",
    });
    expect(changedIdentity.calls).toEqual([]);
  });

  test("preserves missing and malformed blocker evidence without inference", async () => {
    const missing = firstMeetRuntime({
      actionPanel: false,
      blocker: null,
    });

    await expect(
      checkCiv7GameUiFirstMeetResponse({ metPlayerId, response: "neutral" }, missing.target)
    ).resolves.toMatchObject({
      valid: true,
      snapshot: {
        canEndTurn: {
          ok: false,
          error: "The .action-panel component is unavailable.",
        },
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

    const malformedIdentity = firstMeetRuntime({ observedMetPlayerId: "3" });
    await expect(
      checkCiv7GameUiFirstMeetResponse(
        { metPlayerId, response: "unfriendly" },
        malformedIdentity.target
      )
    ).resolves.toMatchObject({
      valid: true,
      snapshot: {
        blockingNotification: {
          ok: false,
          error: "The blocking notification returned a non-integer met-player identity.",
        },
      },
    });

    const missingType = firstMeetRuntime({ notificationType: undefined });
    await expect(
      checkCiv7GameUiFirstMeetResponse({ metPlayerId, response: "unfriendly" }, missingType.target)
    ).resolves.toMatchObject({
      valid: true,
      snapshot: {
        blockingNotification: {
          ok: false,
          error: expect.stringContaining("unsupported blocker identity"),
        },
      },
    });
  });

  test("returns strict native validator blocks without sending", async () => {
    const runtime = firstMeetRuntime({
      canStartResult: { Success: false, FailureReasons: ["FIRST_MEET_BLOCKED"] },
    });

    const result = await sendCiv7GameUiFirstMeetResponse(
      {
        metPlayerId,
        response: "friendly",
        expected: firstMeetSnapshot("friendly"),
      },
      runtime.target
    );

    expect(result).toMatchObject({
      sent: false,
      validation: {
        valid: false,
        result: { Success: false, FailureReasons: ["FIRST_MEET_BLOCKED"] },
      },
    });
    expect(runtime.calls.filter((call) => call.kind === "send")).toEqual([]);
  });

  test("counts an invoked sendRequest returning false as dispatched and performs no UI choreography", async () => {
    const runtime = firstMeetRuntime({ sendResult: false });

    const result = await sendCiv7GameUiFirstMeetResponse(
      {
        metPlayerId,
        response: "friendly",
        expected: firstMeetSnapshot("friendly"),
      },
      runtime.target
    );

    expect(result).toEqual({
      sent: true,
      validation: {
        valid: true,
        result: { Success: true, FailureReasons: [] },
      },
      before: firstMeetSnapshot("friendly"),
      after: firstMeetSnapshot("friendly", {
        blocker: noneBlockerType,
        canEndTurn: true,
        notification: null,
      }),
    });
    expect(runtime.calls.filter((call) => call.kind === "send")).toEqual([
      {
        kind: "send",
        playerId: localPlayerId,
        operationType: "RESPOND_DIPLOMATIC_FIRST_MEET",
        args: {
          Player1: localPlayerId,
          Player2: metPlayerId,
          Type: responseTypes.friendly,
        },
      },
    ]);
    expect(runtime.forbiddenUiCalls).toBe(0);
  });

  test("labels failures before invocation as not-dispatched", async () => {
    const missingSender = firstMeetRuntime({ sendRequest: undefined });
    await expect(
      sendCiv7GameUiFirstMeetResponse(
        {
          metPlayerId,
          response: "friendly",
          expected: firstMeetSnapshot("friendly"),
        },
        missingSender.target
      )
    ).rejects.toMatchObject({
      name: "Civ7DirectControlError",
      code: "command-failed",
      dispatchStatus: "not-dispatched",
      message: "Game.PlayerOperations.sendRequest is unavailable.",
    });
    expect(missingSender.calls.filter((call) => call.kind === "send")).toEqual([]);

    const malformedValidation = firstMeetRuntime({ canStartResult: { Success: 1 } });
    await expect(
      sendCiv7GameUiFirstMeetResponse(
        {
          metPlayerId,
          response: "friendly",
          expected: firstMeetSnapshot("friendly"),
        },
        malformedValidation.target
      )
    ).rejects.toMatchObject({
      dispatchStatus: "not-dispatched",
      message: expect.stringContaining("non-boolean"),
    });
    expect(malformedValidation.calls.filter((call) => call.kind === "send")).toEqual([]);
  });

  test("labels a native invocation exception as dispatched without retrying", async () => {
    const runtime = firstMeetRuntime({
      sendError: new Error("native first-meet send failed"),
    });

    await expect(
      sendCiv7GameUiFirstMeetResponse(
        {
          metPlayerId,
          response: "friendly",
          expected: firstMeetSnapshot("friendly"),
        },
        runtime.target
      )
    ).rejects.toMatchObject({
      name: "Civ7DirectControlError",
      code: "command-failed",
      dispatchStatus: "dispatched",
      message: "native first-meet send failed",
    });
    expect(runtime.calls.filter((call) => call.kind === "send")).toHaveLength(1);
  });

  test("caches volatile input, enum, operation, args, and sender values before dispatch", async () => {
    const runtime = firstMeetRuntime({ volatileGetters: true });
    const inputReads = {
      expected: 0,
      metPlayerId: 0,
      response: 0,
    };
    const input = Object.create(null) as {
      metPlayerId: number;
      response: "friendly";
      expected: FirstMeetSnapshot;
    };
    Object.defineProperties(input, {
      metPlayerId: {
        enumerable: true,
        get: () => {
          inputReads.metPlayerId += 1;
          if (inputReads.metPlayerId > 1) throw new Error("metPlayerId was read more than once");
          return metPlayerId;
        },
      },
      response: {
        enumerable: true,
        get: () => {
          inputReads.response += 1;
          if (inputReads.response > 1) throw new Error("response was read more than once");
          return "friendly";
        },
      },
      expected: {
        enumerable: true,
        get: () => {
          inputReads.expected += 1;
          if (inputReads.expected > 1) throw new Error("expected was read more than once");
          return firstMeetSnapshot("friendly");
        },
      },
    });

    await expect(sendCiv7GameUiFirstMeetResponse(input, runtime.target)).resolves.toMatchObject({
      sent: true,
    });
    expect(inputReads).toEqual({ expected: 1, metPlayerId: 1, response: 1 });
    expect(runtime.volatileReads).toEqual({
      canStart: 1,
      operationType: 1,
      responseType: 2,
      sendRequest: 1,
    });
    expect(runtime.calls.filter((call) => call.kind === "send")).toHaveLength(1);
  });
});

type NativeCall = Readonly<{
  kind: "check" | "send";
  playerId: number;
  operationType: unknown;
  args: Readonly<{
    Player1: number;
    Player2: number;
    Type: number;
  }>;
  queue?: boolean;
}>;

function firstMeetRuntime(
  options: Readonly<{
    actionPanel?: boolean;
    blocker?: unknown;
    blockerLookup?: boolean;
    blockerRead?: boolean;
    canEndTurn?: boolean;
    canStartResult?: unknown;
    observedMetPlayerId?: unknown;
    noneBlockerType?: unknown;
    notificationFind?: boolean;
    notificationType?: unknown;
    sendError?: Error;
    sendRequest?: undefined;
    sendResult?: unknown;
    typeNameRead?: boolean;
    volatileGetters?: boolean;
  }> = {}
): {
  target: Civ7GameUiFirstMeetTarget;
  calls: NativeCall[];
  readonly forbiddenUiCalls: number;
  rawNotification: { Player: unknown; Type: unknown };
  rawNotificationId: { owner: number; id: number; type: number };
  volatileReads: {
    canStart: number;
    operationType: number;
    responseType: number;
    sendRequest: number;
  };
} {
  const calls: NativeCall[] = [];
  const volatileReads = {
    canStart: 0,
    operationType: 0,
    responseType: 0,
    sendRequest: 0,
  };
  const rawNotificationId = { ...notificationId };
  const rawNotification = {
    Player: options.observedMetPlayerId === undefined ? metPlayerId : options.observedMetPlayerId,
    Type: Object.prototype.hasOwnProperty.call(options, "notificationType")
      ? options.notificationType
      : blockerType,
  };
  let canEndTurn = options.canEndTurn ?? false;
  let blocker = Object.prototype.hasOwnProperty.call(options, "blocker")
    ? options.blocker
    : blockerType;
  let forbiddenUiCalls = 0;

  const canStart = (
    playerId: number,
    operationType: unknown,
    args: NativeCall["args"],
    queue?: boolean
  ): unknown => {
    calls.push({ kind: "check", playerId, operationType, args, queue });
    return Object.prototype.hasOwnProperty.call(options, "canStartResult")
      ? options.canStartResult
      : { Success: true, FailureReasons: [] };
  };
  const sendRequest = (
    playerId: number,
    operationType: unknown,
    args: NativeCall["args"]
  ): unknown => {
    calls.push({ kind: "send", playerId, operationType, args });
    if (options.sendError) throw options.sendError;
    canEndTurn = true;
    blocker = noneBlockerType;
    return options.sendResult;
  };

  const operations: Record<string, unknown> = {};
  defineRuntimeValue(
    operations,
    "canStart",
    canStart,
    options.volatileGetters,
    () => volatileReads.canStart++
  );
  if (!Object.prototype.hasOwnProperty.call(options, "sendRequest")) {
    defineRuntimeValue(
      operations,
      "sendRequest",
      sendRequest,
      options.volatileGetters,
      () => volatileReads.sendRequest++
    );
  }

  const operationTypes: Record<string, unknown> = {};
  defineRuntimeValue(
    operationTypes,
    "RESPOND_DIPLOMATIC_FIRST_MEET",
    "RESPOND_DIPLOMATIC_FIRST_MEET",
    options.volatileGetters,
    () => volatileReads.operationType++
  );

  const firstMeetTypes: Record<string, unknown> = {};
  for (const response of Object.keys(responseRuntimeKeys) as ResponseName[]) {
    defineRuntimeValue(
      firstMeetTypes,
      responseRuntimeKeys[response],
      responseTypes[response],
      options.volatileGetters,
      response === "friendly" ? () => volatileReads.responseType++ : undefined
    );
  }

  const target = {
    DiplomacyPlayerFirstMeets: firstMeetTypes,
    EndTurnBlockingTypes: {
      NONE: Object.prototype.hasOwnProperty.call(options, "noneBlockerType")
        ? options.noneBlockerType
        : noneBlockerType,
    },
    GameContext: { localPlayerID: localPlayerId },
    PlayerOperationTypes: operationTypes,
    document: {
      querySelector: (selector: string) =>
        selector === ".action-panel" && options.actionPanel !== false
          ? {
              maybeComponent: {
                canEndTurn: () => canEndTurn,
              },
            }
          : null,
    },
    Game: {
      Notifications: {
        activate: () => {
          forbiddenUiCalls += 1;
          throw new Error("Game.Notifications.activate must not be called");
        },
        getEndTurnBlockingType: options.blockerRead === false ? undefined : () => blocker,
        findEndTurnBlocking:
          options.blockerLookup === false
            ? undefined
            : () => (Object.is(blocker, noneBlockerType) ? null : rawNotificationId),
        find: options.notificationFind === false ? undefined : () => rawNotification,
        getTypeName: options.typeNameRead === false ? undefined : () => "NOTIFICATION_PLAYER_MET",
      },
      PlayerOperations: operations,
    },
    get DiplomacyManager() {
      forbiddenUiCalls += 1;
      throw new Error("DiplomacyManager must not be read");
    },
    get LeaderModelManager() {
      forbiddenUiCalls += 1;
      throw new Error("LeaderModelManager must not be read");
    },
  } as unknown as Civ7GameUiFirstMeetTarget;

  return {
    target,
    calls,
    get forbiddenUiCalls() {
      return forbiddenUiCalls;
    },
    rawNotification,
    rawNotificationId,
    volatileReads,
  };
}

function defineRuntimeValue(
  target: Record<string, unknown>,
  key: string,
  value: unknown,
  volatile: boolean | undefined,
  onRead?: () => void
): void {
  if (!volatile) {
    target[key] = value;
    return;
  }
  let reads = 0;
  Object.defineProperty(target, key, {
    enumerable: true,
    get: () => {
      reads += 1;
      onRead?.();
      if (reads > (key.startsWith("PLAYER_REALATIONSHIP") ? 2 : 1)) {
        throw new Error(`${key} was read too many times`);
      }
      return value;
    },
  });
}

function firstMeetSnapshot(
  response: ResponseName,
  options: Readonly<{
    blocker?: number | string;
    canEndTurn?: boolean;
    notification?: "present" | null;
    observedMetPlayerId?: number | null;
  }> = {}
): FirstMeetSnapshot {
  const blocker = options.blocker ?? blockerType;
  const notification = options.notification === undefined ? "present" : options.notification;
  return {
    localPlayerId,
    metPlayerId,
    response,
    responseType: responseTypes[response],
    noneBlockerType,
    canEndTurn: { ok: true, value: options.canEndTurn ?? false },
    blocker: { ok: true, value: blocker },
    blockingNotification: {
      ok: true,
      value:
        notification === null
          ? null
          : {
              id: notificationId,
              type: blockerType,
              typeName: "NOTIFICATION_PLAYER_MET",
              metPlayerId:
                options.observedMetPlayerId === undefined
                  ? metPlayerId
                  : options.observedMetPlayerId,
            },
    },
  };
}
