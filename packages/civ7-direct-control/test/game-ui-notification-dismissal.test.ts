import { describe, expect, test } from "vitest";

import {
  requestCiv7GameUiNotificationDismissal,
  type Civ7GameUiNotificationDismissalTarget,
} from "../src/play/notifications/game-ui-dismissal";
import { notificationDismissalProofPostcondition } from "../src/proof/notification-dismissal-proof-policy";

describe("game UI notification dismissal runtime", () => {
  test("dismisses a notification through game UI globals with confirmed proof", async () => {
    const notificationId = { owner: 0, id: 113, type: 20 };
    const result = await requestCiv7GameUiNotificationDismissal(
      { notificationId },
      gameUiNotificationTarget(notificationId),
    );

    expect(result).toMatchObject({
      host: "game-ui",
      port: 0,
      state: { id: "game-ui", name: "Game UI" },
      notificationId,
      sent: true,
      verified: true,
      canDismiss: true,
      before: {
        exists: true,
        canUserDismiss: true,
        engineQueueContains: { ok: true, value: true },
      },
      after: {
        exists: false,
        engineQueueContains: { ok: true, value: false },
      },
      postcondition: {
        classification: "notification-disappeared",
      },
    });
    expect(notificationDismissalProofPostcondition(result, undefined)).toMatchObject({
      classification: "notification-disappeared",
      confidence: "confirmed",
      noRepeatAfterUnverified: false,
    });
  });

  test("keeps missing notification dismissals not-sent and no-repeat guarded", async () => {
    const notificationId = { owner: 0, id: 113, type: 20 };
    const result = await requestCiv7GameUiNotificationDismissal(
      { notificationId },
      gameUiNotificationTarget(notificationId, { exists: false }),
    );

    expect(result).toMatchObject({
      notificationId,
      sent: false,
      verified: false,
      canDismiss: false,
      before: { exists: false },
      after: { exists: false },
      postcondition: {
        classification: "not-sent",
      },
    });
    expect(notificationDismissalProofPostcondition(result, undefined)).toMatchObject({
      classification: "not-sent",
      confidence: "unverified",
      noRepeatAfterUnverified: true,
    });
  });
});

function gameUiNotificationTarget(
  notificationId: { owner: number; id: number; type: number },
  options: { exists?: boolean } = {},
): Civ7GameUiNotificationDismissalTarget {
  let exists = options.exists ?? true;
  const notification = {
    Type: notificationId.type,
    Summary: "Wonder Completed",
    Message: "Wonder Completed",
    Target: { owner: -1, id: -1, type: 0 },
    Location: { x: -9999, y: -9999 },
    CanUserDismiss: true,
    Expired: false,
    Dismissed: false,
    BlocksTurnAdvancement: true,
  };

  return {
    GameContext: { localPlayerID: 0 },
    Game: {
      Notifications: {
        find: () => exists ? notification : null,
        getType: () => notificationId.type,
        getTypeName: () => "NOTIFICATION_WONDER_COMPLETED",
        getSummary: () => "Wonder Completed",
        getMessage: () => "Wonder Completed",
        getBlocksTurnAdvancement: () => true,
        getEndTurnBlockingType: () => notificationId.type,
        findEndTurnBlocking: () => exists ? notificationId : null,
        getIdsForPlayer: () => exists ? [notificationId] : [],
      },
    },
    NotificationModel: {
      QueryBy: { Priority: 2 },
      manager: {
        dismiss: () => {
          exists = false;
          return true;
        },
        findPlayer: () => ({
          getTypesBy: () => exists
            ? [{ notifications: [notificationId] }]
            : [],
        }),
      },
    },
  };
}
