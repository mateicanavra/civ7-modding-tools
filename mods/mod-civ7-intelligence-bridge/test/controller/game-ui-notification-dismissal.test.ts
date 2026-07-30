import { describe, expect, test } from "vitest";

import {
  type Civ7GameUiNotificationDismissalTarget,
  checkCiv7GameUiNotificationDismissal,
  civ7GameUiNotificationDismissalCheckAvailable,
  civ7GameUiNotificationDismissalSendAvailable,
  sendCiv7GameUiNotificationDismissal,
} from "../../src/controller/game-ui/notification-dismissal";

const notificationId = { owner: 0, id: 113, type: 20 };

describe("game UI notification dismissal atoms", () => {
  test("advertises exact native check and send capabilities independently", () => {
    const checkOnly = notificationRuntime({ dismiss: undefined });

    expect(civ7GameUiNotificationDismissalCheckAvailable(checkOnly.target)).toBe(true);
    expect(civ7GameUiNotificationDismissalSendAvailable(checkOnly.target)).toBe(false);

    const complete = notificationRuntime();
    expect(civ7GameUiNotificationDismissalCheckAvailable(complete.target)).toBe(true);
    expect(civ7GameUiNotificationDismissalSendAvailable(complete.target)).toBe(true);
  });

  test("checks native notification evidence without dispatching", async () => {
    const runtime = notificationRuntime();

    await expect(
      checkCiv7GameUiNotificationDismissal({ notificationId }, runtime.target)
    ).resolves.toEqual({
      snapshot: notificationSnapshot(),
    });
    expect(runtime.dismissCalls).toBe(0);
    expect(runtime.canUserDismissIds).toEqual([notificationId]);
  });

  test("preserves missing or malformed evidence as failed probes", async () => {
    const runtime = notificationRuntime({
      activeQueue: null,
      canUserDismiss: "yes",
      dismissed: undefined,
    });

    const result = await checkCiv7GameUiNotificationDismissal({ notificationId }, runtime.target);

    expect(result.snapshot).toMatchObject({
      notificationId,
      localPlayerId: 0,
      exists: true,
      typeName: "NOTIFICATION_WONDER_COMPLETED",
      activeQueue: {
        ok: false,
        error: "Game.Notifications.getIdsForPlayer returned a non-array value.",
      },
      canUserDismiss: {
        ok: false,
        error: "Game.Notifications.canUserDismissNotification returned a non-boolean value.",
      },
      dismissed: {
        ok: false,
        error: "Notification.Dismissed is unavailable.",
      },
    });
  });

  test("dismisses exactly once after the admitted snapshot still matches", async () => {
    const runtime = notificationRuntime();

    const result = await sendCiv7GameUiNotificationDismissal(
      { expected: notificationSnapshot() },
      runtime.target
    );

    expect(result).toEqual({
      sent: true,
      before: notificationSnapshot(),
      after: notificationSnapshot({
        activeQueue: false,
        dismissed: true,
      }),
    });
    expect(runtime.dismissCalls).toBe(1);
    expect(runtime.dismissIds).toEqual([notificationId]);
  });

  test("does not make optional dismissed evidence an admission prerequisite", async () => {
    const runtime = notificationRuntime({ dismissed: undefined });
    const check = await checkCiv7GameUiNotificationDismissal({ notificationId }, runtime.target);

    await expect(
      sendCiv7GameUiNotificationDismissal({ expected: check.snapshot }, runtime.target)
    ).resolves.toMatchObject({
      sent: true,
      before: {
        dismissed: { ok: false },
      },
    });
    expect(runtime.dismissCalls).toBe(1);
  });

  test("refuses changed or native-blocked evidence before dispatch", async () => {
    const changed = notificationRuntime({ canUserDismiss: false });
    await expect(
      sendCiv7GameUiNotificationDismissal({ expected: notificationSnapshot() }, changed.target)
    ).rejects.toMatchObject({
      name: "Civ7DirectControlError",
      code: "command-failed",
      dispatchStatus: "not-dispatched",
      message: "Notification dismissal admission evidence changed or is unavailable.",
    });
    expect(changed.dismissCalls).toBe(0);

    const unowned = notificationRuntime({ localPlayerId: 1 });
    await expect(
      sendCiv7GameUiNotificationDismissal(
        {
          expected: notificationSnapshot({ localPlayerId: 1 }),
        },
        unowned.target
      )
    ).rejects.toMatchObject({
      name: "Civ7DirectControlError",
      dispatchStatus: "not-dispatched",
      message: "Native notification dismissal admission is not currently satisfied.",
    });
    expect(unowned.dismissCalls).toBe(0);
  });

  test("labels a native dismiss exception as dispatched without retrying", async () => {
    const runtime = notificationRuntime({
      dismissError: new Error("native notification dismiss failed"),
    });

    await expect(
      sendCiv7GameUiNotificationDismissal({ expected: notificationSnapshot() }, runtime.target)
    ).rejects.toMatchObject({
      name: "Civ7DirectControlError",
      code: "command-failed",
      dispatchStatus: "dispatched",
      message: "native notification dismiss failed",
    });
    expect(runtime.dismissCalls).toBe(1);
  });
});

function notificationRuntime(
  options: Readonly<{
    activeQueue?: unknown;
    canUserDismiss?: unknown;
    dismiss?: undefined;
    dismissed?: unknown;
    dismissError?: Error;
    exists?: boolean;
    localPlayerId?: number;
  }> = {}
): {
  target: Civ7GameUiNotificationDismissalTarget;
  readonly canUserDismissIds: readonly unknown[];
  readonly dismissCalls: number;
  readonly dismissIds: readonly unknown[];
} {
  const canUserDismissIds: unknown[] = [];
  const dismissIds: unknown[] = [];
  let activeQueue = options.activeQueue === undefined ? true : options.activeQueue;
  let dismissed = "dismissed" in options ? options.dismissed : false;
  const notification = {
    Dismissed: dismissed,
  };
  let dismissCalls = 0;

  const target: Civ7GameUiNotificationDismissalTarget = {
    GameContext: {
      localPlayerID: options.localPlayerId ?? 0,
    },
    Game: {
      Notifications: {
        find: () => (options.exists === false ? null : notification),
        getType: () => notificationId.type,
        getTypeName: () => "NOTIFICATION_WONDER_COMPLETED",
        getIdsForPlayer: () =>
          activeQueue === true ? [notificationId] : activeQueue === false ? [] : activeQueue,
        canUserDismissNotification: (id) => {
          canUserDismissIds.push(id);
          return options.canUserDismiss ?? true;
        },
        ...("dismiss" in options
          ? {}
          : {
              dismiss: (id) => {
                dismissCalls += 1;
                dismissIds.push(id);
                if (options.dismissError) throw options.dismissError;
                activeQueue = false;
                dismissed = true;
                notification.Dismissed = dismissed;
              },
            }),
      },
    },
  };

  return {
    target,
    canUserDismissIds,
    get dismissCalls() {
      return dismissCalls;
    },
    dismissIds,
  };
}

function notificationSnapshot(
  options: Readonly<{
    activeQueue?: boolean;
    canUserDismiss?: boolean;
    dismissed?: boolean;
    exists?: boolean;
    localPlayerId?: number;
    typeName?: string | null;
  }> = {}
) {
  return {
    notificationId,
    localPlayerId: options.localPlayerId ?? 0,
    exists: options.exists ?? true,
    typeName: options.typeName ?? "NOTIFICATION_WONDER_COMPLETED",
    activeQueue: { ok: true as const, value: options.activeQueue ?? true },
    canUserDismiss: { ok: true as const, value: options.canUserDismiss ?? true },
    dismissed: { ok: true as const, value: options.dismissed ?? false },
  };
}
