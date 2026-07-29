import { describe, expect, test } from "vitest";

import {
  type Civ7GameUiRuntimeTarget,
  createCiv7GameUiControllerContextFactory,
} from "../../src/controller/game-ui";
import {
  type Civ7GameUiNarrativeTarget,
  checkCiv7GameUiNarrativeChoice,
  civ7GameUiNarrativeChoiceCheckAvailable,
  civ7GameUiNarrativeChoiceSendAvailable,
  sendCiv7GameUiNarrativeChoice,
} from "../../src/controller/game-ui/narrative";

const localPlayerId = 0;
const activateAction = -1_326_475_004;
const narrativeBlocker = -504_330_292;
const notificationId = { owner: 0, id: 5, type: 20 };
const narrativeTarget = { owner: 0, id: 45, type: 35 };
const targetType = "NARRATIVE_DISCOVERY_CHOICE_B";

describe("game UI narrative-choice atoms", () => {
  test("advertises exact check and send capabilities independently", () => {
    const checkOnly = narrativeRuntime({ sendRequest: undefined });

    expect(civ7GameUiNarrativeChoiceCheckAvailable(checkOnly.target)).toBe(true);
    expect(civ7GameUiNarrativeChoiceSendAvailable(checkOnly.target)).toBe(false);

    const complete = narrativeRuntime();
    expect(civ7GameUiNarrativeChoiceCheckAvailable(complete.target)).toBe(true);
    expect(civ7GameUiNarrativeChoiceSendAvailable(complete.target)).toBe(true);
  });

  test("projects the exact atoms and procedure capabilities through the controller facade", async () => {
    const runtime = narrativeRuntime();
    const target = {
      ...runtime.target,
      UI: { isInGame: () => true },
      Players: { getAliveHumanIds: () => [localPlayerId] },
    } as Civ7GameUiRuntimeTarget;
    const context = await createCiv7GameUiControllerContextFactory({ target })();

    expect(context.controller).toMatchObject({
      supportedReadProcedures: ["narrative.choice.check"],
      supportedMutationProcedures: ["narrative.choice.request"],
    });
    await expect(
      context.directControl.checkCiv7NarrativeChoice({ targetType, target: narrativeTarget }, {})
    ).resolves.toEqual({
      valid: true,
      result: { Success: true, Reasons: [] },
      snapshot: narrativeSnapshot(),
    });
  });

  test("checks with ambient player, fixed Activate, exact Success, and raw target identity", async () => {
    const runtime = narrativeRuntime();
    const rawTarget = Object.assign(Object.create(null), narrativeTarget);

    const result = await checkCiv7GameUiNarrativeChoice(
      { targetType, target: rawTarget },
      runtime.target
    );

    expect(result).toEqual({
      valid: true,
      result: { Success: true, Reasons: [] },
      snapshot: narrativeSnapshot(),
    });
    expect(runtime.calls).toHaveLength(1);
    expect(runtime.calls[0]).toMatchObject({
      kind: "check",
      playerId: localPlayerId,
      operationType: "CHOOSE_NARRATIVE_STORY_DIRECTION",
      queue: false,
      args: {
        TargetType: targetType,
        Action: activateAction,
      },
    });
    expect(runtime.calls[0]?.args?.Target).toBe(rawTarget);
    expectSemanticPolicyAbsent(result);
  });

  test.each([
    false,
    undefined,
  ])("counts an invoked sendRequest returning %j as dispatched", async (sendResult) => {
    const runtime = narrativeRuntime({ sendResult });
    const rawTarget = Object.assign(Object.create(null), narrativeTarget);

    const result = await sendCiv7GameUiNarrativeChoice(
      {
        targetType,
        target: rawTarget,
        expected: narrativeSnapshot({ canEndTurn: true }),
      },
      runtime.target
    );

    expect(result).toEqual({
      sent: true,
      validation: { valid: true, result: { Success: true, Reasons: [] } },
      before: narrativeSnapshot(),
      after: narrativeSnapshot({
        canEndTurn: true,
        blocker: 0,
        blockerTypeName: null,
      }),
    });
    expect(runtime.calls.filter((call) => call.kind === "send")).toHaveLength(1);
    expect(runtime.calls.at(-1)?.args?.Target).toBe(rawTarget);
    expect(runtime.lookupIds).toEqual([runtime.rawNotificationId, runtime.rawNotificationId]);
    expect(runtime.blockerQueries).toEqual([narrativeBlocker, 0]);
    expectSemanticPolicyAbsent(result);
  });

  test("preserves a live notification paired with blocker type zero", async () => {
    const runtime = narrativeRuntime({ zeroBlockerHasLiveId: true });

    const result = await sendCiv7GameUiNarrativeChoice(
      {
        targetType,
        target: narrativeTarget,
        expected: narrativeSnapshot(),
      },
      runtime.target
    );

    expect(result.after).toEqual({
      localPlayerId,
      activateAction,
      canEndTurn: { ok: true, value: true },
      blocker: { ok: true, value: 0 },
      blockingNotification: {
        ok: true,
        value: {
          id: notificationId,
          type: 0,
          typeName: null,
          target: narrativeTarget,
        },
      },
    });
    expect(runtime.blockerQueries).toEqual([narrativeBlocker, 0]);
    expect(runtime.lookupIds).toEqual([
      runtime.rawNotificationId,
      runtime.rawNotificationId,
      runtime.rawNotificationId,
      runtime.rawNotificationId,
    ]);
  });

  test.each([
    null,
    {},
    "0",
    1.5,
  ])("keeps malformed post-send blocker evidence unresolved after dispatch: %j", async (postSendBlocker) => {
    const runtime = narrativeRuntime({ postSendBlocker });

    const result = await sendCiv7GameUiNarrativeChoice(
      {
        targetType,
        target: narrativeTarget,
        expected: narrativeSnapshot(),
      },
      runtime.target
    );

    expect(result).toMatchObject({
      sent: true,
      before: narrativeSnapshot(),
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
    expect(runtime.calls.filter((call) => call.kind === "send")).toHaveLength(1);
    expect(runtime.lookupIds).toEqual([runtime.rawNotificationId, runtime.rawNotificationId]);
    expect(runtime.blockerQueries).toEqual([narrativeBlocker]);
  });

  test("retains a supported live string blocker identity after dispatch", async () => {
    const postSendBlocker = "NOTIFICATION_CHOOSE_NARRATIVE_STORY_DIRECTION";
    const runtime = narrativeRuntime({ postSendBlocker });

    const result = await sendCiv7GameUiNarrativeChoice(
      {
        targetType,
        target: narrativeTarget,
        expected: narrativeSnapshot(),
      },
      runtime.target
    );

    expect(result.after).toMatchObject({
      blocker: { ok: true, value: postSendBlocker },
      blockingNotification: {
        ok: true,
        value: {
          id: notificationId,
          type: postSendBlocker,
          typeName: null,
          target: narrativeTarget,
        },
      },
    });
    expect(runtime.blockerQueries).toEqual([narrativeBlocker, postSendBlocker]);
    expect(runtime.lookupIds).toEqual([
      runtime.rawNotificationId,
      runtime.rawNotificationId,
      runtime.rawNotificationId,
      runtime.rawNotificationId,
    ]);
  });

  test("compares only fresh admission evidence before native validation and send", async () => {
    const changed = narrativeRuntime();

    await expect(
      sendCiv7GameUiNarrativeChoice(
        {
          targetType,
          target: narrativeTarget,
          expected: narrativeSnapshot({ blocker: 0, blockerTypeName: null }),
        },
        changed.target
      )
    ).rejects.toMatchObject({
      name: "Civ7DirectControlError",
      code: "command-failed",
      dispatchStatus: "not-dispatched",
      message: "Narrative choice admission evidence changed before dispatch.",
    });
    expect(changed.calls).toEqual([]);

    const postconditionOnlyChanged = narrativeRuntime();
    await expect(
      sendCiv7GameUiNarrativeChoice(
        {
          targetType,
          target: narrativeTarget,
          expected: narrativeSnapshot({ canEndTurn: true }),
        },
        postconditionOnlyChanged.target
      )
    ).resolves.toMatchObject({ sent: true });
  });

  test("uses only the native Success field as admission authority", async () => {
    const blocked = narrativeRuntime({
      canStartResult: { Success: false, Reasons: ["blocked"] },
    });

    await expect(
      sendCiv7GameUiNarrativeChoice(
        {
          targetType,
          target: narrativeTarget,
          expected: narrativeSnapshot(),
        },
        blocked.target
      )
    ).resolves.toMatchObject({
      sent: false,
      validation: {
        valid: false,
        result: { Success: false, Reasons: ["blocked"] },
      },
    });
    expect(blocked.calls.filter((call) => call.kind === "send")).toEqual([]);

    const unofficial = narrativeRuntime({ canStartResult: { success: true } });
    await expect(
      sendCiv7GameUiNarrativeChoice(
        {
          targetType,
          target: narrativeTarget,
          expected: narrativeSnapshot(),
        },
        unofficial.target
      )
    ).rejects.toMatchObject({
      name: "Civ7DirectControlError",
      dispatchStatus: "not-dispatched",
    });
    expect(unofficial.calls.filter((call) => call.kind === "send")).toEqual([]);
  });

  test("classifies a send exception after invocation as dispatched", async () => {
    const runtime = narrativeRuntime({ sendError: new Error("narrative send failed") });

    await expect(
      sendCiv7GameUiNarrativeChoice(
        {
          targetType,
          target: narrativeTarget,
          expected: narrativeSnapshot(),
        },
        runtime.target
      )
    ).rejects.toMatchObject({
      name: "Civ7DirectControlError",
      code: "command-failed",
      dispatchStatus: "dispatched",
      message: "narrative send failed",
    });
    expect(runtime.calls.filter((call) => call.kind === "send")).toHaveLength(1);
  });
});

type NativeCall = {
  kind: "check" | "send";
  playerId: number;
  operationType: unknown;
  args: {
    TargetType: string;
    Target: unknown;
    Action: number;
  };
  queue?: boolean;
};

function narrativeRuntime(
  options: {
    canStartResult?: unknown;
    postSendBlocker?: unknown;
    sendError?: Error;
    sendRequest?: undefined;
    sendResult?: unknown;
    zeroBlockerHasLiveId?: boolean;
  } = {}
): {
  target: Civ7GameUiNarrativeTarget;
  blockerQueries: unknown[];
  calls: NativeCall[];
  lookupIds: unknown[];
  rawNotificationId: typeof notificationId;
} {
  const calls: NativeCall[] = [];
  const blockerQueries: unknown[] = [];
  const lookupIds: unknown[] = [];
  const rawNotificationId = Object.assign(Object.create(null), notificationId);
  let blockerLive = true;
  let blocker: unknown = narrativeBlocker;
  const sendRequest =
    "sendRequest" in options
      ? undefined
      : (playerId: number, operationType: unknown, args: NativeCall["args"]): unknown => {
          calls.push({ kind: "send", playerId, operationType, args });
          if (options.sendError) throw options.sendError;
          blockerLive = false;
          blocker = Object.prototype.hasOwnProperty.call(options, "postSendBlocker")
            ? options.postSendBlocker
            : 0;
          return options.sendResult;
        };
  return {
    blockerQueries,
    calls,
    lookupIds,
    rawNotificationId,
    target: {
      GameContext: { localPlayerID: localPlayerId },
      PlayerOperationParameters: { Activate: activateAction },
      PlayerOperationTypes: {
        CHOOSE_NARRATIVE_STORY_DIRECTION: "CHOOSE_NARRATIVE_STORY_DIRECTION",
      },
      canEndTurn: () => !blockerLive,
      Game: {
        Notifications: {
          getEndTurnBlockingType: () => blocker,
          findEndTurnBlocking: (_playerId, blockerType) => {
            blockerQueries.push(blockerType);
            return blocker === 0 && !options.zeroBlockerHasLiveId ? null : rawNotificationId;
          },
          find: (id) => {
            lookupIds.push(id);
            return { Target: narrativeTarget };
          },
          getType: (id) => {
            lookupIds.push(id);
            return blocker;
          },
          getTypeName: (type) =>
            type === narrativeBlocker ? "NOTIFICATION_CHOOSE_NARRATIVE_STORY_DIRECTION" : null,
        },
        PlayerOperations: {
          canStart: (playerId, operationType, args, queue) => {
            calls.push({
              kind: "check",
              playerId,
              operationType,
              args,
              queue,
            });
            return Object.prototype.hasOwnProperty.call(options, "canStartResult")
              ? options.canStartResult
              : { Success: true, Reasons: [] };
          },
          sendRequest,
        },
      },
    },
  };
}

function narrativeSnapshot(
  options: { canEndTurn?: boolean; blocker?: number; blockerTypeName?: string | null } = {}
) {
  const blocker = options.blocker ?? narrativeBlocker;
  const blockerTypeName =
    options.blockerTypeName === undefined
      ? "NOTIFICATION_CHOOSE_NARRATIVE_STORY_DIRECTION"
      : options.blockerTypeName;
  return {
    localPlayerId,
    activateAction,
    canEndTurn: { ok: true as const, value: options.canEndTurn ?? false },
    blocker: { ok: true as const, value: blocker },
    blockingNotification: {
      ok: true as const,
      value:
        blockerTypeName === null
          ? null
          : {
              id: notificationId,
              type: blocker,
              typeName: blockerTypeName,
              target: narrativeTarget,
            },
    },
  };
}

function expectSemanticPolicyAbsent(result: unknown): void {
  const serialized = JSON.stringify(result);
  expect(serialized).not.toContain("postcondition");
  expect(serialized).not.toContain("verified");
  expect(serialized).not.toContain("NarrativePopupManager");
  expect(serialized).not.toContain("panel");
  expect(serialized).not.toContain("popup");
}
