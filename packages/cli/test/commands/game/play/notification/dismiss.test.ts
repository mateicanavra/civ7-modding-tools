import { describe, expect, test, vi } from 'vitest';
import GamePlayDismissNotification from '../../../../../src/commands/game/play/dismiss-notification';
import { type FakeTunerServer, startFakeTunerServer } from '../../../fixtures/tuner-socket-server';

type DismissNotificationMode =
  | 'verified'
  | 'stale-nonblocking'
  | 'engine-front-train-absent'
  | 'engine-front-dismissed';

describe('game play dismiss-notification command', () => {
  test('dismisses reviewed notifications only with explicit approval reason', async () => {
    await expect(GamePlayDismissNotification.run([
      '--target',
      '{"owner":0,"id":113,"type":20}',
      '--send',
      '--json',
    ])).rejects.toThrow(/requires --reason/);

    const { payload, server } = await runDismissNotification('verified', [
      '--target',
      '{"owner":0,"id":113,"type":20}',
      '--send',
      '--reason',
      'reviewed wonder completed notice',
    ]);
    try {
      expect(payload.result.sent).toBe(true);
      expect(payload.result.verified).toBe(true);
      expect(payload.result.closeoutPath).toBe('NotificationModel.manager.dismiss');
      expect(payload.result.result.notificationTrainManager.ok).toBe(true);
      expect(payload.result.result.notificationTrainManager.attempted).toBe(true);
      expect(payload.result.result.panelCloseControl.attempted).toBe(false);
      expect(payload.result.result.panelCloseControl.reason).toMatch(/active end-turn blocker/);
      expect(payload.result.verificationAttempts.length).toBeGreaterThan(1);
      expect(server.received.some((message) => message.includes('readNotificationDismissal'))).toBe(true);
      expect(server.received.some((message) => message.includes('"send":true'))).toBe(true);
      expect(server.received.some((message) => message.includes('NotificationModel.manager'))).toBe(true);
    } finally {
      await server.close();
    }
  });

  test('does not verify dismissal from stale nonblocking front evidence', async () => {
    const { payload, server } = await runDismissNotification('stale-nonblocking', [
      '--target',
      '{"owner":0,"id":113,"type":20}',
      '--send',
      '--reason',
      'reviewed culture tree reveal',
    ]);
    try {
      expect(payload.result.sent).toBe(true);
      expect(payload.result.verified).toBe(false);
      expect(payload.result.result.notificationTrainManager).toMatchObject({ ok: true, attempted: true });
      expect(payload.result.result.panelCloseControl).toMatchObject({ ok: true, attempted: true });
      expect(payload.result.after).toMatchObject({
        exists: true,
        dismissed: false,
        isEndTurnBlocking: { ok: true, value: false },
        engineQueueContains: { ok: true, value: true },
        isEngineQueueFront: { ok: true, value: true },
        notificationTrainContains: { ok: true, value: true },
        isNotificationTrainFront: { ok: true, value: true },
      });
      expect(payload.result.verificationAttempts.length).toBeGreaterThan(1);
    } finally {
      await server.close();
    }
  });

  test('does not verify dismissal from train absence while engine queue still fronts the target', async () => {
    const { payload, server } = await runDismissNotification('engine-front-train-absent', [
      '--target',
      '{"owner":0,"id":113,"type":20}',
      '--send',
      '--reason',
      'reviewed unit lost report',
    ]);
    try {
      expect(payload.result.sent).toBe(true);
      expect(payload.result.verified).toBe(false);
      expect(payload.result.after).toMatchObject({
        engineQueueContains: { ok: true, value: true },
        isEngineQueueFront: { ok: true, value: true },
        notificationTrainContains: { ok: true, value: false },
        isNotificationTrainFront: { ok: true, value: false },
      });
      expect(payload.result.verificationAttempts.length).toBeGreaterThan(1);
    } finally {
      await server.close();
    }
  });

  test('does not verify dismissal from dismissed flag while engine queue still fronts the target', async () => {
    const { payload, server } = await runDismissNotification('engine-front-dismissed', [
      '--target',
      '{"owner":0,"id":113,"type":20}',
      '--send',
      '--reason',
      'reviewed dismissed flag with stale engine-front report',
    ]);
    try {
      expect(payload.result.sent).toBe(true);
      expect(payload.result.verified).toBe(false);
      expect(payload.result.after).toMatchObject({
        dismissed: true,
        engineQueueContains: { ok: true, value: true },
        isEngineQueueFront: { ok: true, value: true },
      });
      expect(payload.result.verificationAttempts.length).toBeGreaterThan(1);
    } finally {
      await server.close();
    }
  });
});

async function runDismissNotification(mode: DismissNotificationMode, extraArgs: readonly string[]) {
  const server = await startDismissNotificationTunerServer(mode);
  const writes: string[] = [];
  const log = vi.spyOn(GamePlayDismissNotification.prototype, 'log').mockImplementation((message?: string) => {
    if (message) writes.push(message);
  });
  try {
    const { port } = server.address();
    await GamePlayDismissNotification.run([
      '--host',
      '127.0.0.1',
      '--port',
      String(port),
      ...extraArgs,
      '--json',
    ]);
  } finally {
    log.mockRestore();
  }

  return {
    payload: JSON.parse(writes.join('')) as {
      ok: true;
      result: {
        sent: boolean;
        verified: boolean;
        closeoutPath: string | null;
        result: {
          notificationTrainManager: { ok: boolean; attempted: boolean; path?: string };
          panelCloseControl: { ok: boolean; attempted: boolean; reason?: string };
        };
        after: {
          exists: boolean;
          dismissed: boolean;
          isEndTurnBlocking: { ok: boolean; value: boolean };
          engineQueueContains: { ok: boolean; value: boolean };
          isEngineQueueFront: { ok: boolean; value: boolean };
          notificationTrainContains: { ok: boolean; value: boolean };
          isNotificationTrainFront: { ok: boolean; value: boolean };
        };
        verificationAttempts: unknown[];
      };
    },
    server,
  };
}

async function startDismissNotificationTunerServer(mode: DismissNotificationMode): Promise<FakeTunerServer> {
  let notificationDismissalSent = false;
  return startFakeTunerServer({
    handle({ message }) {
      if (message.includes('readNotificationDismissal')) {
        const send = message.includes('"send":true');
        if (send) notificationDismissalSent = true;
        return [JSON.stringify(notificationDismissal(send, mode, notificationDismissalSent && !send))];
      }
      return undefined;
    },
  });
}

function notificationDismissal(send: boolean, mode: DismissNotificationMode = 'verified', settled = false) {
  const notificationId = { owner: 0, id: 113, type: 20 };
  const isStaleNonblocking = mode === 'stale-nonblocking';
  const isEngineFrontTrainAbsent = mode === 'engine-front-train-absent';
  const before = {
    id: notificationId,
    exists: true,
    type: isStaleNonblocking ? -2117069996 : 2091697919,
    typeName: isStaleNonblocking ? 'NOTIFICATION_CULTURE_TREE_REVEALED' : 'NOTIFICATION_WONDER_COMPLETED',
    summary: isStaleNonblocking
      ? 'A new culture tree has been revealed.'
      : 'An unmet player has finished constructing the World Wonder Great Stele.',
    message: isStaleNonblocking ? 'Culture Tree Revealed' : 'Wonder Completed',
    target: { owner: -1, id: -1, type: 0 },
    location: { x: -9999, y: -9999 },
    canUserDismiss: true,
    expired: false,
    dismissed: false,
    blocksTurnAdvancement: { ok: true, value: !isStaleNonblocking },
    endTurnBlockingType: { ok: true, value: isStaleNonblocking ? 0 : 2091697919 },
    isEndTurnBlocking: { ok: true, value: !isStaleNonblocking },
    engineQueueCount: { ok: true, value: 1 },
    engineQueueContains: { ok: true, value: true },
    engineQueueFirstId: { ok: true, value: notificationId },
    isEngineQueueFront: { ok: true, value: true },
    notificationTrainCount: { ok: true, value: isEngineFrontTrainAbsent ? 0 : 1 },
    notificationTrainContains: { ok: true, value: !isEngineFrontTrainAbsent },
    notificationTrainFirstId: { ok: true, value: isEngineFrontTrainAbsent ? null : notificationId },
    isNotificationTrainFront: { ok: true, value: !isEngineFrontTrainAbsent },
  };
  const dismissed = isStaleNonblocking
    ? before
    : isEngineFrontTrainAbsent
      ? before
      : {
          ...before,
          exists: false,
          dismissed: true,
          blocksTurnAdvancement: { ok: true, value: false },
          endTurnBlockingType: { ok: true, value: 0 },
          isEndTurnBlocking: { ok: true, value: false },
          engineQueueCount: { ok: true, value: 0 },
          engineQueueContains: { ok: true, value: false },
          engineQueueFirstId: { ok: true, value: null },
          isEngineQueueFront: { ok: true, value: false },
          notificationTrainCount: { ok: true, value: 0 },
          notificationTrainContains: { ok: true, value: false },
          notificationTrainFirstId: { ok: true, value: null },
          isNotificationTrainFront: { ok: true, value: false },
        };
  const engineFrontDismissed = {
    ...before,
    dismissed: true,
  };
  const current = settled && !send
    ? mode === 'engine-front-dismissed'
      ? engineFrontDismissed
      : dismissed
    : before;
  return {
    notificationId,
    before: current,
    after: send ? before : null,
    canDismiss: true,
    sent: send,
    closeoutPath: send
      ? isStaleNonblocking
        ? 'NotificationModel.manager.dismiss+Game.Notifications.dismiss'
        : 'NotificationModel.manager.dismiss'
      : null,
    result: send
      ? {
          notificationTrainManager: {
            ok: true,
            attempted: true,
            available: true,
            path: 'NotificationModel.manager.dismiss',
          },
          panelCloseControl: isStaleNonblocking
            ? {
                ok: true,
                attempted: true,
                available: true,
                path: 'Game.Notifications.dismiss',
                value: false,
              }
            : {
                ok: false,
                attempted: false,
                available: false,
                path: 'Game.Notifications.dismiss',
                reason: 'official panel close control does not dismiss the active end-turn blocker',
              },
        }
      : null,
    verificationAttempts: send ? [before] : [],
    verified: false,
    notes: [
      'This is an App UI notification action, not a gameplay operation family.',
      'Send mode records both official actor routes: notification-train manager dismissal and the visible panel close-control dismissal when that route is available for this item.',
      'Verification is identity-based: disappeared, dismissed, removed from the engine queue or notification train, or moved off a front position it occupied before send. Non-blocking status alone is not proof.',
      'The embedded App UI action records immediate route evidence. The direct-control wrapper performs final verification across separate App UI reads so frame-driven queues can advance.',
    ],
  };
}
