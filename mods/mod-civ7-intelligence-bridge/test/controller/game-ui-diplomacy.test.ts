import { describe, expect, test } from "vitest";

import type { Civ7GameUiRuntimeTarget } from "../../src/controller/game-ui";
import {
  type Civ7GameUiDiplomacyTarget,
  checkCiv7GameUiDiplomacyResponse,
  civ7GameUiDiplomacyResponseCheckAvailable,
  civ7GameUiDiplomacyResponseSendAvailable,
  sendCiv7GameUiDiplomacyResponse,
} from "../../src/controller/game-ui/diplomacy";

const localPlayerId = 0;
const actionId = 8_821;
const responseType = -1_713_616_684;
const alternateResponseType = 406_763_372;
const denounceMilitaryPresenceActionType = 729_061_548;
const rejectionResponseType = -308_560_490;
const eventActionType = -963_359_821;
const blockerType = 523_279_636;
const noneBlockerType = -1;
const notificationId = { owner: 0, id: 71, type: 20 };

type DiplomacySnapshot = Awaited<ReturnType<typeof checkCiv7GameUiDiplomacyResponse>>["snapshot"];

describe("game UI ordinary diplomacy response atoms", () => {
  test("advertises exact check and send capabilities independently", () => {
    const complete = diplomacyRuntime();
    const readOnly = diplomacyRuntime({ sendRequest: undefined });
    const missingActionPanel = diplomacyRuntime({ actionPanel: false });
    const missingDiplomacyReads = diplomacyRuntime({
      eventRead: false,
      responseRead: false,
    });
    const missingBlockerReads = diplomacyRuntime({
      blockerLookup: false,
      blockerRead: false,
      notificationFind: false,
      typeNameRead: false,
    });
    const missingActionType = diplomacyRuntime({ denounceActionType: undefined });
    const missingResponseType = diplomacyRuntime({ rejectionResponseType: undefined });
    const missingNoneBlocker = diplomacyRuntime({ noneBlockerType: null });

    expect(civ7GameUiDiplomacyResponseCheckAvailable(complete.target)).toBe(true);
    expect(civ7GameUiDiplomacyResponseSendAvailable(complete.target)).toBe(true);
    expect(civ7GameUiDiplomacyResponseCheckAvailable(readOnly.target)).toBe(true);
    expect(civ7GameUiDiplomacyResponseSendAvailable(readOnly.target)).toBe(false);
    expect(civ7GameUiDiplomacyResponseCheckAvailable(missingActionPanel.target)).toBe(true);
    expect(civ7GameUiDiplomacyResponseCheckAvailable(missingDiplomacyReads.target)).toBe(true);
    expect(civ7GameUiDiplomacyResponseCheckAvailable(missingBlockerReads.target)).toBe(true);
    expect(civ7GameUiDiplomacyResponseCheckAvailable(missingActionType.target)).toBe(false);
    expect(civ7GameUiDiplomacyResponseCheckAvailable(missingResponseType.target)).toBe(false);
    expect(civ7GameUiDiplomacyResponseCheckAvailable(missingNoneBlocker.target)).toBe(false);
  });

  test("checks the exact native operation and returns focused immutable evidence", async () => {
    const runtime = diplomacyRuntime();

    const result = await checkCiv7GameUiDiplomacyResponse(
      { actionId, responseType },
      runtime.target
    );
    runtime.rawResponseList[0].responseType = 0;
    runtime.rawNotificationId.owner = 9;
    runtime.rawNotification.Target.id = 99;

    expect(result).toEqual({
      valid: true,
      result: { Success: true, FailureReasons: [] },
      snapshot: diplomacySnapshot(),
    });
    expect(runtime.calls).toEqual([
      {
        kind: "check",
        playerId: localPlayerId,
        operationType: "RESPOND_DIPLOMATIC_ACTION",
        args: { ID: actionId, Type: responseType },
        queue: false,
      },
    ]);
  });

  test("guards the complete expected snapshot before validation or dispatch", async () => {
    const changedResponseData = diplomacyRuntime({
      offeredResponseTypes: [alternateResponseType],
    });
    await expect(
      sendCiv7GameUiDiplomacyResponse(
        { actionId, responseType, expected: diplomacySnapshot() },
        changedResponseData.target
      )
    ).rejects.toMatchObject({
      name: "Civ7DirectControlError",
      code: "command-failed",
      dispatchStatus: "not-dispatched",
      message: "Diplomacy response admission evidence changed before dispatch.",
    });
    expect(changedResponseData.calls).toEqual([]);

    const changedBlockerIdentity = diplomacyRuntime({ observedActionId: actionId + 1 });
    await expect(
      sendCiv7GameUiDiplomacyResponse(
        { actionId, responseType, expected: diplomacySnapshot() },
        changedBlockerIdentity.target
      )
    ).rejects.toMatchObject({
      dispatchStatus: "not-dispatched",
      message: "Diplomacy response admission evidence changed before dispatch.",
    });
    expect(changedBlockerIdentity.calls).toEqual([]);
  });

  test("preserves unavailable and malformed native evidence without inference", async () => {
    const missing = diplomacyRuntime({
      actionPanel: false,
      blocker: null,
      eventRead: false,
      responseRead: false,
    });

    await expect(
      checkCiv7GameUiDiplomacyResponse({ actionId, responseType }, missing.target)
    ).resolves.toMatchObject({
      valid: true,
      snapshot: {
        responseData: {
          ok: false,
          error: "Game.Diplomacy.getResponseDataForUI is unavailable.",
        },
        eventActionType: {
          ok: false,
          error: "Game.Diplomacy.getDiplomaticEventData is unavailable.",
        },
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

    const malformed = diplomacyRuntime({ observedActionId: "8821" });
    await expect(
      checkCiv7GameUiDiplomacyResponse({ actionId, responseType }, malformed.target)
    ).resolves.toMatchObject({
      valid: true,
      snapshot: {
        blockingNotification: {
          ok: true,
          value: {
            actionId: null,
          },
        },
      },
    });
  });

  test("returns strict native validator blocks without sending", async () => {
    const runtime = diplomacyRuntime({
      canStartResult: { Success: false, FailureReasons: ["DIPLOMACY_RESPONSE_BLOCKED"] },
    });

    const result = await sendCiv7GameUiDiplomacyResponse(
      { actionId, responseType, expected: diplomacySnapshot() },
      runtime.target
    );

    expect(result).toEqual({
      sent: false,
      validation: {
        valid: false,
        result: { Success: false, FailureReasons: ["DIPLOMACY_RESPONSE_BLOCKED"] },
      },
      before: diplomacySnapshot(),
      after: diplomacySnapshot(),
    });
    expect(runtime.calls.filter((call) => call.kind === "send")).toEqual([]);
  });

  test("counts an invoked sendRequest returning false as sent and performs no UI choreography", async () => {
    const runtime = diplomacyRuntime({ sendResult: false });

    const result = await sendCiv7GameUiDiplomacyResponse(
      { actionId, responseType, expected: diplomacySnapshot() },
      runtime.target
    );

    expect(result).toEqual({
      sent: true,
      validation: {
        valid: true,
        result: { Success: true, FailureReasons: [] },
      },
      before: diplomacySnapshot(),
      after: diplomacySnapshot({
        blocker: noneBlockerType,
        canEndTurn: true,
        notification: null,
      }),
    });
    expect(runtime.calls.filter((call) => call.kind === "send")).toEqual([
      {
        kind: "send",
        playerId: localPlayerId,
        operationType: "RESPOND_DIPLOMATIC_ACTION",
        args: { ID: actionId, Type: responseType },
      },
    ]);
    expect(runtime.forbiddenUiCalls).toBe(0);
  });

  test("distinguishes failures before and during the native invocation", async () => {
    const missingSender = diplomacyRuntime({ sendRequest: undefined });
    await expect(
      sendCiv7GameUiDiplomacyResponse(
        { actionId, responseType, expected: diplomacySnapshot() },
        missingSender.target
      )
    ).rejects.toMatchObject({
      name: "Civ7DirectControlError",
      code: "command-failed",
      dispatchStatus: "not-dispatched",
      message: "Game.PlayerOperations.sendRequest is unavailable.",
    });
    expect(missingSender.calls.filter((call) => call.kind === "send")).toEqual([]);

    const malformedValidation = diplomacyRuntime({ canStartResult: { Success: 1 } });
    await expect(
      sendCiv7GameUiDiplomacyResponse(
        { actionId, responseType, expected: diplomacySnapshot() },
        malformedValidation.target
      )
    ).rejects.toMatchObject({
      dispatchStatus: "not-dispatched",
      message: expect.stringContaining("non-boolean"),
    });
    expect(malformedValidation.calls.filter((call) => call.kind === "send")).toEqual([]);

    const nativeFailure = diplomacyRuntime({
      sendError: new Error("native diplomacy response send failed"),
    });
    await expect(
      sendCiv7GameUiDiplomacyResponse(
        { actionId, responseType, expected: diplomacySnapshot() },
        nativeFailure.target
      )
    ).rejects.toMatchObject({
      dispatchStatus: "dispatched",
      message: "native diplomacy response send failed",
    });
    expect(nativeFailure.calls.filter((call) => call.kind === "send")).toHaveLength(1);
  });

  test("caches volatile input, enum, operation, and sender values around dispatch", async () => {
    const runtime = diplomacyRuntime({ volatileGetters: true });
    const inputReads = {
      actionId: 0,
      expected: 0,
      responseType: 0,
    };
    const input = Object.create(null) as {
      actionId: number;
      responseType: number;
      expected: DiplomacySnapshot;
    };
    Object.defineProperties(input, {
      actionId: {
        enumerable: true,
        get: () => {
          inputReads.actionId += 1;
          if (inputReads.actionId > 1) throw new Error("actionId was read more than once");
          return actionId;
        },
      },
      responseType: {
        enumerable: true,
        get: () => {
          inputReads.responseType += 1;
          if (inputReads.responseType > 1) throw new Error("responseType was read more than once");
          return responseType;
        },
      },
      expected: {
        enumerable: true,
        get: () => {
          inputReads.expected += 1;
          if (inputReads.expected > 1) throw new Error("expected was read more than once");
          return diplomacySnapshot();
        },
      },
    });

    await expect(sendCiv7GameUiDiplomacyResponse(input, runtime.target)).resolves.toMatchObject({
      sent: true,
    });
    expect(inputReads).toEqual({ actionId: 1, expected: 1, responseType: 1 });
    expect(runtime.volatileReads).toEqual({
      actionType: 2,
      canStart: 1,
      operationType: 1,
      responseType: 2,
      sendRequest: 1,
    });
  });

  test("projects exact read and mutation capabilities through the controller facade", async () => {
    const { createCiv7GameUiControllerContextFactory } = await import(
      "../../src/controller/game-ui"
    );
    const complete = diplomacyRuntime();
    const context = await createCiv7GameUiControllerContextFactory({
      target: controllerTarget(complete.target),
    })();

    expect(context.controller).toEqual({
      supportedReadProcedures: expect.arrayContaining(["diplomacy.response.check"]),
      supportedMutationProcedures: expect.arrayContaining(["diplomacy.response.request"]),
    });
    await expect(
      context.directControl.checkCiv7DiplomacyResponse(
        { actionId, responseType },
        context.endpointDefaults
      )
    ).resolves.toMatchObject({
      valid: true,
      snapshot: {
        actionId,
        responseType,
      },
    });

    const readOnly = diplomacyRuntime({ sendRequest: undefined });
    const readOnlyContext = await createCiv7GameUiControllerContextFactory({
      target: controllerTarget(readOnly.target),
    })();
    expect(readOnlyContext.controller?.supportedReadProcedures).toContain(
      "diplomacy.response.check"
    );
    expect(readOnlyContext.controller?.supportedMutationProcedures).not.toContain(
      "diplomacy.response.request"
    );
  });
});

type NativeCall = Readonly<{
  kind: "check" | "send";
  playerId: number;
  operationType: unknown;
  args: Readonly<{ ID: number; Type: number }>;
  queue?: boolean;
}>;

function diplomacyRuntime(
  options: Readonly<{
    actionPanel?: boolean;
    blocker?: unknown;
    blockerLookup?: boolean;
    blockerRead?: boolean;
    canEndTurn?: boolean;
    canStartResult?: unknown;
    denounceActionType?: unknown;
    eventActionType?: unknown;
    eventRead?: boolean;
    noneBlockerType?: unknown;
    notificationFind?: boolean;
    notificationType?: unknown;
    observedActionId?: unknown;
    offeredResponseTypes?: readonly number[];
    rejectionResponseType?: unknown;
    responseRead?: boolean;
    sendError?: Error;
    sendRequest?: undefined;
    sendResult?: unknown;
    typeNameRead?: boolean;
    volatileGetters?: boolean;
  }> = {}
): {
  target: Civ7GameUiDiplomacyTarget;
  calls: NativeCall[];
  readonly forbiddenUiCalls: number;
  rawNotification: { Target: { id: unknown }; Type: unknown };
  rawNotificationId: { owner: number; id: number; type: number };
  rawResponseList: { responseType: number }[];
  volatileReads: {
    actionType: number;
    canStart: number;
    operationType: number;
    responseType: number;
    sendRequest: number;
  };
} {
  const calls: NativeCall[] = [];
  const volatileReads = {
    actionType: 0,
    canStart: 0,
    operationType: 0,
    responseType: 0,
    sendRequest: 0,
  };
  const rawNotificationId = { ...notificationId };
  const rawNotification = {
    Target: {
      id: Object.prototype.hasOwnProperty.call(options, "observedActionId")
        ? options.observedActionId
        : actionId,
    },
    Type: Object.prototype.hasOwnProperty.call(options, "notificationType")
      ? options.notificationType
      : blockerType,
  };
  const rawResponseList = (
    options.offeredResponseTypes ?? [responseType, alternateResponseType]
  ).map((offeredResponseType) => ({ responseType: offeredResponseType }));
  let canEndTurn = options.canEndTurn ?? false;
  let blocker = Object.prototype.hasOwnProperty.call(options, "blocker")
    ? options.blocker
    : blockerType;
  let notificationPresent = true;
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
    notificationPresent = false;
    return options.sendResult;
  };

  const operations: Record<string, unknown> = {};
  defineRuntimeValue(
    operations,
    "canStart",
    canStart,
    options.volatileGetters,
    1,
    () => volatileReads.canStart++
  );
  if (!Object.prototype.hasOwnProperty.call(options, "sendRequest")) {
    defineRuntimeValue(
      operations,
      "sendRequest",
      sendRequest,
      options.volatileGetters,
      1,
      () => volatileReads.sendRequest++
    );
  }

  const operationTypes: Record<string, unknown> = {};
  defineRuntimeValue(
    operationTypes,
    "RESPOND_DIPLOMATIC_ACTION",
    "RESPOND_DIPLOMATIC_ACTION",
    options.volatileGetters,
    1,
    () => volatileReads.operationType++
  );

  const actionTypes: Record<string, unknown> = {};
  defineRuntimeValue(
    actionTypes,
    "DIPLOMACY_ACTION_DENOUNCE_MILITARY_PRESENCE",
    Object.prototype.hasOwnProperty.call(options, "denounceActionType")
      ? options.denounceActionType
      : denounceMilitaryPresenceActionType,
    options.volatileGetters,
    2,
    () => volatileReads.actionType++
  );

  const responseTypes: Record<string, unknown> = {};
  defineRuntimeValue(
    responseTypes,
    "DIPLOMACY_RESPONSE_REJECT",
    Object.prototype.hasOwnProperty.call(options, "rejectionResponseType")
      ? options.rejectionResponseType
      : rejectionResponseType,
    options.volatileGetters,
    2,
    () => volatileReads.responseType++
  );

  const target = {
    DiplomacyActionTypes: actionTypes,
    DiplomaticResponseTypes: responseTypes,
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
      Diplomacy: {
        getResponseDataForUI:
          options.responseRead === false
            ? undefined
            : () => ({
                actionID: actionId,
                responseList: rawResponseList,
              }),
        getDiplomaticEventData:
          options.eventRead === false
            ? undefined
            : () => ({
                actionType: Object.prototype.hasOwnProperty.call(options, "eventActionType")
                  ? options.eventActionType
                  : eventActionType,
              }),
      },
      Notifications: {
        activate: () => {
          forbiddenUiCalls += 1;
          throw new Error("Game.Notifications.activate must not be called");
        },
        getEndTurnBlockingType: options.blockerRead === false ? undefined : () => blocker,
        findEndTurnBlocking:
          options.blockerLookup === false
            ? undefined
            : () =>
                notificationPresent && !Object.is(blocker, noneBlockerType)
                  ? rawNotificationId
                  : null,
        find:
          options.notificationFind === false
            ? undefined
            : () => (notificationPresent ? rawNotification : null),
        getTypeName:
          options.typeNameRead === false
            ? undefined
            : () => "NOTIFICATION_DIPLOMATIC_RESPONSE_REQUIRED",
      },
      PlayerOperations: operations,
    },
    get DiplomacyManager() {
      forbiddenUiCalls += 1;
      throw new Error("DiplomacyManager must not be read");
    },
    get InterfaceMode() {
      forbiddenUiCalls += 1;
      throw new Error("InterfaceMode must not be read");
    },
    get LeaderModelManager() {
      forbiddenUiCalls += 1;
      throw new Error("LeaderModelManager must not be read");
    },
  } as unknown as Civ7GameUiDiplomacyTarget;

  return {
    target,
    calls,
    get forbiddenUiCalls() {
      return forbiddenUiCalls;
    },
    rawNotification,
    rawNotificationId,
    rawResponseList,
    volatileReads,
  };
}

function controllerTarget(target: Civ7GameUiDiplomacyTarget): Civ7GameUiRuntimeTarget {
  return Object.assign(Object.create(target) as object, {
    UI: {
      ...target.UI,
      isInGame: () => true,
    },
    Players: {
      ...target.Players,
      getAliveHumanIds: () => [localPlayerId],
    },
  }) as Civ7GameUiRuntimeTarget;
}

function defineRuntimeValue(
  target: Record<string, unknown>,
  key: string,
  value: unknown,
  volatile: boolean | undefined,
  maxReads: number,
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
      if (reads > maxReads) throw new Error(`${key} was read too many times`);
      return value;
    },
  });
}

function diplomacySnapshot(
  options: Readonly<{
    blocker?: number | string;
    canEndTurn?: boolean;
    notification?: "present" | null;
    observedActionId?: number | null;
    offeredResponseTypes?: readonly number[];
  }> = {}
): DiplomacySnapshot {
  const blocker = options.blocker ?? blockerType;
  const notification = options.notification === undefined ? "present" : options.notification;
  return {
    localPlayerId,
    actionId,
    responseType,
    denounceMilitaryPresenceActionType,
    rejectionResponseType,
    noneBlockerType,
    responseData: {
      ok: true,
      value: {
        actionId,
        offeredResponseTypes: [
          ...(options.offeredResponseTypes ?? [responseType, alternateResponseType]),
        ],
      },
    },
    eventActionType: { ok: true, value: eventActionType },
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
              typeName: "NOTIFICATION_DIPLOMATIC_RESPONSE_REQUIRED",
              actionId:
                options.observedActionId === undefined ? actionId : options.observedActionId,
            },
    },
  };
}
