import { describe, expect, test } from "vitest";

import {
  type Civ7GameUiRuntimeTarget,
  createCiv7GameUiControllerContextFactory,
} from "../../src/controller/game-ui";
import {
  type Civ7GameUiAdvisorWarningTarget,
  checkCiv7GameUiAdvisorWarningViewed,
  civ7GameUiAdvisorWarningViewedCheckAvailable,
  civ7GameUiAdvisorWarningViewedSendAvailable,
  sendCiv7GameUiAdvisorWarningViewed,
} from "../../src/controller/game-ui/advisor-warning";

const localPlayerId = 0;
const notificationTarget = { owner: 0, id: 61, type: 20 };
const notificationTypeName = "NOTIFICATION_ADVISOR_WARNING_SCIENCE";

describe("game UI advisor-warning viewed atoms", () => {
  test("advertises check and send only when their exact native APIs exist", () => {
    const checkOnly = advisorWarningRuntime({ sendRequest: undefined });
    expect(civ7GameUiAdvisorWarningViewedCheckAvailable(checkOnly.target)).toBe(true);
    expect(civ7GameUiAdvisorWarningViewedSendAvailable(checkOnly.target)).toBe(false);

    const missingQueueRead = advisorWarningRuntime();
    if (missingQueueRead.target.Game?.Notifications != null) {
      missingQueueRead.target.Game.Notifications.getIdsForPlayer = undefined;
    }
    expect(civ7GameUiAdvisorWarningViewedCheckAvailable(missingQueueRead.target)).toBe(false);
    expect(civ7GameUiAdvisorWarningViewedSendAvailable(missingQueueRead.target)).toBe(false);

    const complete = advisorWarningRuntime();
    expect(civ7GameUiAdvisorWarningViewedCheckAvailable(complete.target)).toBe(true);
    expect(civ7GameUiAdvisorWarningViewedSendAvailable(complete.target)).toBe(true);
  });

  test("projects exact read and mutation capabilities through the controller facade", async () => {
    const runtime = advisorWarningRuntime();
    const target = {
      ...runtime.target,
      UI: { isInGame: () => true },
      Players: { getAliveHumanIds: () => [localPlayerId] },
    } as Civ7GameUiRuntimeTarget;
    const context = await createCiv7GameUiControllerContextFactory({ target })();

    expect(context.controller).toMatchObject({
      supportedReadProcedures: ["notifications.advisorWarning.viewed.check"],
      supportedMutationProcedures: ["notifications.advisorWarning.viewed.request"],
    });
    await expect(
      context.directControl.checkCiv7AdvisorWarningViewed({ target: notificationTarget }, {})
    ).resolves.toEqual({
      valid: true,
      result: { Success: true, Reasons: [] },
      snapshot: advisorWarningSnapshot(),
    });
  });

  test("checks the ambient player, exact enum, Target args, false queue, and strict Success", async () => {
    const runtime = advisorWarningRuntime();
    const rawTarget = Object.assign(Object.create(null), notificationTarget);

    const result = await checkCiv7GameUiAdvisorWarningViewed({ target: rawTarget }, runtime.target);

    expect(result).toEqual({
      valid: true,
      result: { Success: true, Reasons: [] },
      snapshot: advisorWarningSnapshot(),
    });
    expect(runtime.calls).toEqual([
      {
        kind: "check",
        playerId: localPlayerId,
        operationType: "VIEWED_ADVISOR_WARNING",
        args: { Target: rawTarget },
        queue: false,
      },
    ]);
    expect(runtime.calls[0]?.args.Target).toBe(rawTarget);
  });

  test("returns validator-blocked evidence without sending", async () => {
    const runtime = advisorWarningRuntime({
      canStartResult: { Success: false, Reasons: ["warning unavailable"] },
    });

    const result = await sendCiv7GameUiAdvisorWarningViewed(
      {
        target: notificationTarget,
        expected: advisorWarningSnapshot(),
      },
      runtime.target
    );

    expect(result).toEqual({
      sent: false,
      validation: {
        valid: false,
        result: { Success: false, Reasons: ["warning unavailable"] },
      },
      before: advisorWarningSnapshot(),
      after: advisorWarningSnapshot(),
    });
    expect(runtime.calls.filter((call) => call.kind === "send")).toEqual([]);
  });

  test("guards the complete fresh snapshot before validation or dispatch", async () => {
    const runtime = advisorWarningRuntime({ activeQueue: false });

    await expect(
      sendCiv7GameUiAdvisorWarningViewed(
        {
          target: notificationTarget,
          expected: advisorWarningSnapshot(),
        },
        runtime.target
      )
    ).rejects.toMatchObject({
      name: "Civ7DirectControlError",
      code: "command-failed",
      dispatchStatus: "not-dispatched",
      message: "Advisor-warning admission evidence changed before dispatch.",
    });
    expect(runtime.calls).toEqual([]);
  });

  test("sends at most once and snapshots raw notification clearance evidence", async () => {
    const runtime = advisorWarningRuntime();
    const rawTarget = Object.assign(Object.create(null), notificationTarget);

    const result = await sendCiv7GameUiAdvisorWarningViewed(
      {
        target: rawTarget,
        expected: advisorWarningSnapshot(),
      },
      runtime.target
    );

    expect(result).toEqual({
      sent: true,
      validation: {
        valid: true,
        result: { Success: true, Reasons: [] },
      },
      before: advisorWarningSnapshot(),
      after: advisorWarningSnapshot({
        activeQueue: false,
        exists: false,
        typeName: null,
      }),
    });
    expect(runtime.calls.filter((call) => call.kind === "send")).toEqual([
      {
        kind: "send",
        playerId: localPlayerId,
        operationType: "VIEWED_ADVISOR_WARNING",
        args: { Target: rawTarget },
      },
    ]);
    expect(runtime.calls.at(-1)?.args.Target).toBe(rawTarget);
    expectSemanticPolicyAbsent(result);
  });

  test("labels malformed validation as not-dispatched and send exceptions as dispatched", async () => {
    const malformed = advisorWarningRuntime({ canStartResult: { Success: 1 } });
    await expect(
      checkCiv7GameUiAdvisorWarningViewed({ target: notificationTarget }, malformed.target)
    ).rejects.toMatchObject({
      name: "Civ7DirectControlError",
      dispatchStatus: "not-dispatched",
      message: "Game.PlayerOperations.canStart returned a non-boolean Success field.",
    });
    expect(malformed.calls.filter((call) => call.kind === "send")).toEqual([]);

    const unavailable = advisorWarningRuntime({ sendRequest: undefined });
    await expect(
      sendCiv7GameUiAdvisorWarningViewed(
        {
          target: notificationTarget,
          expected: advisorWarningSnapshot(),
        },
        unavailable.target
      )
    ).rejects.toMatchObject({
      name: "Civ7DirectControlError",
      code: "command-failed",
      dispatchStatus: "not-dispatched",
      message: "Game.PlayerOperations.sendRequest is unavailable.",
    });
    expect(unavailable.calls.filter((call) => call.kind === "send")).toEqual([]);

    const throwing = advisorWarningRuntime({
      sendError: new Error("native advisor-warning send failed"),
    });
    await expect(
      sendCiv7GameUiAdvisorWarningViewed(
        {
          target: notificationTarget,
          expected: advisorWarningSnapshot(),
        },
        throwing.target
      )
    ).rejects.toMatchObject({
      name: "Civ7DirectControlError",
      code: "command-failed",
      dispatchStatus: "dispatched",
      message: "native advisor-warning send failed",
    });
    expect(throwing.calls.filter((call) => call.kind === "send")).toHaveLength(1);
  });

  test("preserves unavailable active-queue evidence as a failed probe", async () => {
    const runtime = advisorWarningRuntime({ activeQueue: null });

    await expect(
      checkCiv7GameUiAdvisorWarningViewed({ target: notificationTarget }, runtime.target)
    ).resolves.toMatchObject({
      snapshot: {
        activeQueue: {
          ok: false,
          error: "Game.Notifications.getIdsForPlayer returned a non-array value.",
        },
      },
    });
  });
});

type NativeCall = Readonly<{
  kind: "check" | "send";
  playerId: number;
  operationType: unknown;
  args: Readonly<{ Target: unknown }>;
  queue?: boolean;
}>;

function advisorWarningRuntime(
  options: Readonly<{
    activeQueue?: unknown;
    canStartResult?: unknown;
    exists?: boolean;
    sendError?: Error;
    sendRequest?: undefined;
  }> = {}
): {
  target: Civ7GameUiAdvisorWarningTarget;
  calls: NativeCall[];
} {
  const calls: NativeCall[] = [];
  let activeQueue = options.activeQueue === undefined ? true : options.activeQueue;
  let exists = options.exists ?? true;

  const target: Civ7GameUiAdvisorWarningTarget = {
    GameContext: { localPlayerID: localPlayerId },
    Game: {
      Notifications: {
        find: () => (exists ? {} : null),
        getType: () => notificationTarget.type,
        getTypeName: () => notificationTypeName,
        getIdsForPlayer: () =>
          activeQueue === true ? [notificationTarget] : activeQueue === false ? [] : activeQueue,
      },
      PlayerOperations: {
        canStart: (playerId, operationType, args, queue) => {
          calls.push({ kind: "check", playerId, operationType, args, queue });
          return options.canStartResult ?? { Success: true, Reasons: [] };
        },
        ...("sendRequest" in options
          ? {}
          : {
              sendRequest: (playerId, operationType, args) => {
                calls.push({ kind: "send", playerId, operationType, args });
                if (options.sendError) throw options.sendError;
                activeQueue = false;
                exists = false;
              },
            }),
      },
    },
    PlayerOperationTypes: {
      VIEWED_ADVISOR_WARNING: "VIEWED_ADVISOR_WARNING",
    },
  };
  return { target, calls };
}

function advisorWarningSnapshot(
  options: Readonly<{
    activeQueue?: boolean;
    exists?: boolean;
    typeName?: string | null;
  }> = {}
) {
  return {
    target: notificationTarget,
    localPlayerId,
    exists: options.exists ?? true,
    typeName: options.typeName === undefined ? notificationTypeName : options.typeName,
    activeQueue: { ok: true as const, value: options.activeQueue ?? true },
  };
}

function expectSemanticPolicyAbsent(value: unknown): void {
  expect(JSON.stringify(value)).not.toMatch(
    /classification|confirmed|confidence|noRepeat|nextSteps|dismiss|poll/i
  );
}
