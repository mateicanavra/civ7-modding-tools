import { describe, expect, test, vi } from 'vitest';
import GamePlayDismissNotificationQueue from '../../src/commands/game/play/dismiss-notification-queue';
import GamePlayDismissNotification from '../../src/commands/game/play/dismiss-notification';
import GamePlayNotificationQueue from '../../src/commands/game/play/notification-queue';
import GamePlayNotifications from '../../src/commands/game/play/notifications';
import GamePlayPriorities from '../../src/commands/game/play/priorities';
import GamePlayPromotionReadiness from '../../src/commands/game/play/promotion-readiness';
import GamePlayReadyCity from '../../src/commands/game/play/ready-city';
import GamePlayReadyUnit from '../../src/commands/game/play/ready-unit';
import GamePlayRehydrate from '../../src/commands/game/play/rehydrate';
import GamePlaySettlementRecommendations from '../../src/commands/game/play/settlement-recommendations';
import GamePlayUnitMovePreview from '../../src/commands/game/play/unit-move-preview';
import { startFakeTunerServer } from './fixtures/tuner-socket-server';

describe('game play commands', () => {
  test('materializes diplomacy response options from the notification HUD', async () => {
    const server = await startTunerServer({ playNotificationMode: 'stale-diplomacy' });
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayNotifications.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayNotifications.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        view: {
          notifications: Array<{
            details?: {
              kind: string;
              actionId: number;
              options: Array<{ title: string; responseType: number; enabled: boolean; disabled: boolean; cli: string | null }>;
              enabledOptions: Array<{ responseType: number; cli: string | null }>;
              disabledOptions: Array<{ responseType: number; cli: string | null }>;
            };
          }>;
          hud: { nextDecision: { details?: unknown } };
        };
      };
      const details = payload.view.notifications[0].details;
      expect(details?.kind).toBe('diplomacy-response-options');
      expect(details?.actionId).toBe(8);
      expect(details?.options.map((option) => option.title)).toEqual(['Support', 'Accept', 'Reject']);
      expect(details?.disabledOptions[0].responseType).toBe(-1907089594);
      expect(details?.disabledOptions[0].cli).toBeNull();
      expect(details?.enabledOptions.map((option) => option.responseType)).toEqual([926305338, -1200641623]);
      expect(details?.enabledOptions[0].cli).toContain('game play respond-diplomacy --action-id 8 --response-type 926305338');
      expect(details?.enabledOptions[0].cli).toContain("--notification-id '{\"owner\":0,\"id\":19,\"type\":20}'");
      expect(payload.view.hud.nextDecision.details).toBeDefined();
      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('materializes technology choice options from the notification HUD', async () => {
    const server = await startTunerServer({ playNotificationMode: 'tech-choice' });
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayNotifications.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayNotifications.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        view: {
          notifications: Array<{
            details?: {
              kind: string;
              enabledOptions: Array<{ nodeType: number; name: string; cli: string | null; chooseValidation: { ok: boolean; value?: { Success?: boolean } } }>;
              disabledOptions: Array<{ nodeType: number; name: string; cli: string | null }>;
            };
          }>;
          hud: { nextDecision: { details?: unknown } };
        };
      };
      const details = payload.view.notifications[0].details;
      expect(details?.kind).toBe('technology-choice-options');
      expect(details?.enabledOptions.map((option) => option.name).sort()).toEqual(['Masonry', 'Sailing']);
      const masonry = details?.enabledOptions.find((option) => option.nodeType === -1255676052);
      expect(masonry?.chooseValidation.value?.Success).toBe(true);
      expect(masonry?.cli).toContain('game play choose-tech --player-id 0 --node -1255676052 --send');
      expect(masonry?.cli).not.toContain('--closeout');
      expect(details?.disabledOptions[0].name).toBe('Agriculture');
      expect(details?.disabledOptions[0].cli).toBeNull();
      expect(payload.view.hud.nextDecision.details).toBeDefined();
      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('materializes culture choice options from the notification HUD', async () => {
    const server = await startTunerServer({ playNotificationMode: 'culture-choice' });
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayNotifications.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayNotifications.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        view: {
          notifications: Array<{
            details?: {
              kind: string;
              availableNodeTypes: { ok: boolean; value?: number[] };
              enabledOptions: Array<{ nodeType: number; name: string; cli: string | null; chooseValidation: { ok: boolean; value?: { Success?: boolean } } }>;
              disabledOptions: Array<{ nodeType: number; name: string; cli: string | null }>;
              playerCulture?: unknown;
            };
          }>;
          hud: { nextDecision: { details?: unknown } };
        };
      };
      const details = payload.view.notifications[0].details;
      expect(details?.kind).toBe('culture-choice-options');
      expect(details?.playerCulture).toBeUndefined();
      expect(details?.availableNodeTypes.value).toContain(-869902342);
      expect(details?.enabledOptions.map((option) => option.name).sort()).toEqual(['Discipline', 'Ekklesia']);
      const ekklesia = details?.enabledOptions.find((option) => option.nodeType === -869902342);
      expect(ekklesia?.chooseValidation.value?.Success).toBe(true);
      expect(ekklesia?.cli).toContain('game play choose-culture --player-id 0 --node -869902342 --send --closeout');
      expect(details?.disabledOptions[0].name).toBe('Mysticism');
      expect(details?.disabledOptions[0].cli).toBeNull();
      expect(payload.view.hud.nextDecision.details).toBeDefined();
      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('materializes celebration choice options from the notification HUD', async () => {
    const server = await startTunerServer({ playNotificationMode: 'celebration-choice' });
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayNotifications.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayNotifications.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        view: {
          notifications: Array<{
            details?: {
              kind: string;
              goldenAgeDuration: { ok: boolean; value?: number };
              choices: { ok: boolean; value?: string[] };
              enabledOptions: Array<{ goldenAgeType: number; name: string; cli: string | null; validation: { ok: boolean; value?: { Success?: boolean } } }>;
              disabledOptions: Array<{ goldenAgeType: number; name: string; cli: string | null }>;
            };
          }>;
          hud: { nextDecision: { details?: unknown } };
        };
      };
      const details = payload.view.notifications[0].details;
      expect(details?.kind).toBe('celebration-choice-options');
      expect(details?.goldenAgeDuration.value).toBe(10);
      expect(details?.choices.value).toContain('GOLDEN_AGE_CLASSICAL_REPUBLIC_1');
      expect(details?.enabledOptions.map((option) => option.name).sort()).toEqual(['Cultural Celebration', 'Wonder Production Celebration']);
      const culture = details?.enabledOptions.find((option) => option.goldenAgeType === -340825966);
      expect(culture?.validation.value?.Success).toBe(true);
      expect(culture?.cli).toContain('game play choose-celebration --player-id 0 --golden-age-type -340825966 --send');
      expect(details?.disabledOptions).toEqual([]);
      expect(payload.view.hud.nextDecision.details).toBeDefined();
      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('materializes government choice options from the notification HUD', async () => {
    const server = await startTunerServer({ playNotificationMode: 'government-choice' });
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayNotifications.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayNotifications.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        view: {
          notifications: Array<{
            details?: {
              kind: string;
              action: number;
              startingGovernments: { ok: boolean; value?: Array<{ GovernmentType: number }> };
              enabledOptions: Array<{ governmentType: number; name: string; cli: string | null; validation: { ok: boolean; value?: { Success?: boolean } } }>;
              disabledOptions: Array<{ governmentType: number; name: string; cli: string | null }>;
            };
          }>;
          hud: { nextDecision: { details?: unknown } };
        };
      };
      const details = payload.view.notifications[0].details;
      expect(details?.kind).toBe('government-choice-options');
      expect(details?.action).toBe(-1326475004);
      expect(details?.startingGovernments.value?.length).toBe(3);
      expect(details?.enabledOptions.map((option) => option.name)).toEqual(['Classical Republic', 'Despotism', 'Oligarchy']);
      const republic = details?.enabledOptions.find((option) => option.governmentType === 0);
      expect(republic?.validation.value?.Success).toBe(true);
      expect(republic?.cli).toContain('game play choose-government --player-id 0 --government-type 0 --action -1326475004 --send');
      expect(details?.disabledOptions).toEqual([]);
      expect(payload.view.hud.nextDecision.details).toBeDefined();
      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('materializes narrative choice options from the notification HUD', async () => {
    const server = await startTunerServer({ playNotificationMode: 'narrative-choice' });
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayNotifications.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayNotifications.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        view: {
          notifications: Array<{
            target: { owner: number; id: number; type: number };
            details?: {
              kind: string;
              targetStoryId: { ok: boolean; value?: { owner: number; id: number; type: number } };
              storyLinks: { ok: boolean; value?: unknown[] };
              enabledOptions: Array<{ targetType: string; cli: string | null; validation: { ok: boolean; value?: { Success?: boolean } } }>;
              disabledOptions: Array<{ targetType: string; cli: string | null }>;
            };
          }>;
          hud: { nextDecision: { details?: unknown } };
        };
      };
      const notification = payload.view.notifications[0];
      const details = notification.details;
      expect(notification.target).toEqual({ owner: -1, id: -1, type: 0 });
      expect(details?.kind).toBe('narrative-choice-options');
      expect(details?.targetStoryId.value).toEqual({ owner: 0, id: 45, type: 35 });
      expect(details?.storyLinks.value).toEqual([]);
      expect(details?.enabledOptions[0].targetType).toBe('CLOSE');
      expect(details?.enabledOptions[0].validation.value?.Success).toBe(true);
      expect(details?.enabledOptions[0].cli).toContain('game play choose-narrative --player-id 0 --target-type CLOSE');
      expect(details?.disabledOptions).toEqual([]);
      expect(payload.view.hud.nextDecision.details).toBeDefined();
      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('materializes stale command-units reconciliation candidates from the notification HUD', async () => {
    const server = await startTunerServer({ playNotificationMode: 'stale-unit-command' });
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayNotifications.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayNotifications.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        view: {
          notifications: Array<{
            details?: {
              kind: string;
              staleReadyPointerSuspected: boolean;
              enabledCloseoutCandidates: Array<{ unitId: { owner: number; id: number; type: number }; operationType: string; cli: string | null }>;
            };
          }>;
          hud: { nextDecision: { details?: unknown } };
        };
      };
      const details = payload.view.notifications[0].details;
      expect(details?.kind).toBe('unit-command-reconciliation');
      expect(details?.staleReadyPointerSuspected).toBe(true);
      expect(details?.enabledCloseoutCandidates).toHaveLength(1);
      expect(details?.enabledCloseoutCandidates[0].unitId).toEqual({ owner: 0, id: 196609, type: 26 });
      expect(details?.enabledCloseoutCandidates[0].operationType).toBe('SKIP_TURN');
      expect(details?.enabledCloseoutCandidates[0].cli).toContain('game play operation --family unit --type SKIP_TURN');
      expect(details?.enabledCloseoutCandidates[0].cli).toContain("--unit-id '{\"owner\":0,\"id\":196609,\"type\":26}'");
      expect(payload.view.hud.nextDecision.details).toBeDefined();
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('reads materialized notifications without sending operations', async () => {
    const server = await startTunerServer();
    try {
      const { port } = server.address();
      await GamePlayNotifications.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--json',
      ]);

      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test('classifies invalid-target diplomatic agenda notices as informational closeouts', async () => {
    const server = await startTunerServer({ playNotificationMode: 'diplomatic-report' });
    try {
      const { port } = server.address();
      const writes: string[] = [];
      const log = vi.spyOn(GamePlayNotifications.prototype, 'log').mockImplementation((message?: string) => {
        if (message) writes.push(message);
      });
      try {
        await GamePlayNotifications.run([
          '--host',
          '127.0.0.1',
          '--port',
          String(port),
          '--json',
        ]);
      } finally {
        log.mockRestore();
      }

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        view: {
          hud: {
            nextDecision: {
              category: string;
              operationFamily: string;
              operationType: string;
              cli: string;
              notes: string[];
            };
          };
        };
      };
      expect(payload.view.hud.nextDecision.category).toBe('informational-notification');
      expect(payload.view.hud.nextDecision.operationFamily).toBe('app-ui-action');
      expect(payload.view.hud.nextDecision.operationType).toBe('Game.Notifications.dismiss');
      expect(payload.view.hud.nextDecision.cli).toBe('game play dismiss-notification');
      expect(payload.view.hud.nextDecision.notes.join(' ')).toContain('do not send RESPOND_DIPLOMATIC_ACTION');
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test('classifies valid diplomatic action reports without response options as reviewed closeouts', async () => {
    const server = await startTunerServer({ playNotificationMode: 'diplomatic-action-report' });
    try {
      const { port } = server.address();
      const writes: string[] = [];
      const log = vi.spyOn(GamePlayNotifications.prototype, 'log').mockImplementation((message?: string) => {
        if (message) writes.push(message);
      });
      try {
        await GamePlayNotifications.run([
          '--host',
          '127.0.0.1',
          '--port',
          String(port),
          '--json',
        ]);
      } finally {
        log.mockRestore();
      }

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        view: {
          notifications: Array<{
            target: { owner: number; id: number; type: number };
            details?: {
              kind: string;
              classification: string;
              actionId: number;
              responseOptionCount: number;
              enabledResponseOptionCount: number;
            };
          }>;
          hud: {
            nextDecision: {
              category: string;
              operationFamily: string;
              operationType: string;
              cli: string;
              notes: string[];
              details?: unknown;
            };
          };
        };
      };
      const notification = payload.view.notifications[0];
      expect(notification.target).toEqual({ owner: 2, id: 34, type: 34 });
      expect(notification.details?.kind).toBe('diplomatic-action-report');
      expect(notification.details?.classification).toBe('diplomatic-action-report-no-enabled-response-options');
      expect(notification.details?.actionId).toBe(34);
      expect(notification.details?.responseOptionCount).toBe(0);
      expect(notification.details?.enabledResponseOptionCount).toBe(0);
      expect(payload.view.hud.nextDecision.category).toBe('informational-notification');
      expect(payload.view.hud.nextDecision.operationFamily).toBe('app-ui-action');
      expect(payload.view.hud.nextDecision.operationType).toBe('Game.Notifications.dismiss');
      expect(payload.view.hud.nextDecision.cli).toBe('game play dismiss-notification');
      expect(payload.view.hud.nextDecision.notes.join(' ')).toContain('real diplomatic event id');
      expect(payload.view.hud.nextDecision.notes.join(' ')).toContain('reviewed report closeout');
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test('reads play priorities without sending operations', async () => {
    const server = await startTunerServer({ playNotificationMode: 'ready-unit' });
    try {
      const { port } = server.address();
      const writes: string[] = [];
      const log = vi.spyOn(GamePlayPriorities.prototype, 'log').mockImplementation((message?: string) => {
        if (message) writes.push(message);
      });
      try {
        await GamePlayPriorities.run([
          '--host',
          '127.0.0.1',
          '--port',
          String(port),
          '--json',
        ]);
      } finally {
        log.mockRestore();
      }

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        view: {
          priorities: Array<{ kind: string }>;
          readyUnit: { legalOperationScope: string; legalNoTargetOperationCount: number } | null;
          battlefield: { pointsOfInterest: unknown[] } | null;
        };
      };
      expect(payload.view.readyUnit?.legalOperationScope).toBe('no-target');
      expect(payload.view.readyUnit?.legalNoTargetOperationCount).toBeGreaterThan(0);
      expect(payload.view.battlefield?.pointsOfInterest.length).toBeGreaterThan(0);
      expect(payload.view.priorities.some((item) => item.kind === 'ready-unit')).toBe(true);
      expect(payload.view.priorities.some((item) => item.kind.startsWith('battlefield:'))).toBe(true);
      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
      expect(server.received.some((message) => message.includes('readReadyUnitView'))).toBe(true);
      expect(server.received.some((message) => message.includes('readBattlefieldScan'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test('does not treat partial HUD probe failures as clean end-turn proof', async () => {
    const server = await startTunerServer({ playNotificationMode: 'runtime-error' });
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayPriorities.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayPriorities.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--json',
        '--no-battlefield',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        view: {
          priorities: Array<{ kind: string; command?: string; evidence?: Array<{ field: string; error: string }> }>;
        };
      };
      const runtimeError = payload.view.priorities.find((item) => item.kind === 'runtime-state-error');
      expect(runtimeError?.command).toContain('game play rehydrate --json');
      expect(runtimeError?.evidence?.some((item) => item.field === 'blocker' && item.error.includes('Game is not defined'))).toBe(true);
      expect(payload.view.priorities.some((item) => item.kind === 'clean-read')).toBe(false);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('emits compact play priorities without raw evidence by request', async () => {
    const server = await startTunerServer({ playNotificationMode: 'runtime-error' });
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayPriorities.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayPriorities.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--json',
        '--compact',
        '--no-battlefield',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        contractVersion: string;
        command: string;
        summary: string;
        next: string | null;
        warnings: string[];
        omitted: Array<{ path: string }>;
        priorities: Array<{ kind: string; evidence?: unknown }>;
        view?: unknown;
      };
      expect(payload.contractVersion).toBe('play-agent-v0');
      expect(payload.command).toBe('game play priorities');
      expect(payload.summary).toContain('runtime-state-error');
      expect(payload.next).toContain('game play rehydrate --json');
      expect(payload.warnings.join(' ')).toContain('Core HUD probes failed');
      expect(payload.omitted.some((item) => item.path === 'priorities[].evidence')).toBe(true);
      expect(payload.priorities.some((item) => item.kind === 'clean-read')).toBe(false);
      expect(payload.priorities.every((item) => item.evidence === undefined)).toBe(true);
      expect(payload.view).toBeUndefined();
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('surfaces guarded end-turn send in compact clean-read priorities', async () => {
    const server = await startTunerServer({ playNotificationMode: 'clean-read' });
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayPriorities.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayPriorities.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--json',
        '--compact',
        '--no-battlefield',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        next: string | null;
        priorities: Array<{ kind: string; command?: string; reason: string }>;
      };
      const top = payload.priorities[0];
      expect(top.kind).toBe('clean-read');
      expect(top.command).toContain('game play end-turn --send');
      expect(top.command).toContain("--reason 'clean read: no HUD, ready-unit, ready-city, or battlefield priority surfaced'");
      expect(payload.next).toBe(top.command);
      expect(top.reason).toContain('rechecks blockers before sending');
      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendTurnComplete'))).toBe(false);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('surfaces unit-command reconciliation command in compact priorities', async () => {
    const server = await startTunerServer({ playNotificationMode: 'stale-unit-command' });
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayPriorities.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayPriorities.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--json',
        '--compact',
        '--no-battlefield',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        next: string | null;
        priorities: Array<{ kind: string; command?: string; reason: string }>;
      };
      const top = payload.priorities[0];
      expect(top.kind).toBe('hud:unit-command');
      expect(top.command).toContain('game play operation --family unit --type SKIP_TURN');
      expect(top.command).toContain("--unit-id '{\"owner\":0,\"id\":196609,\"type\":26}'");
      expect(payload.next).toBe(top.command);
      expect(top.reason).toContain('validator-backed operation candidate');
      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('surfaces exact recommended operation command in compact priorities', async () => {
    const server = await startTunerServer({ playNotificationMode: 'first-meet' });
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayPriorities.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayPriorities.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--json',
        '--compact',
        '--no-battlefield',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        next: string | null;
        priorities: Array<{ kind: string; command?: string; reason: string }>;
      };
      const top = payload.priorities[0];
      expect(top.kind).toBe('hud:first-meet-diplomacy');
      expect(top.command).toBe('game play respond-first-meet --player-id 0 --met-player-id 2 --response neutral');
      expect(payload.next).toBe(top.command);
      expect(top.reason).toContain('validator-backed operation candidate');
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('surfaces technology options command in compact priorities', async () => {
    const server = await startTunerServer({ playNotificationMode: 'tech-choice' });
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayPriorities.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayPriorities.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--json',
        '--compact',
        '--no-battlefield',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        next: string | null;
        priorities: Array<{ kind: string; command?: string; reason: string }>;
      };
      const top = payload.priorities[0];
      expect(top.kind).toBe('hud:technology-choice');
      expect(top.command).toBe('game play choose-tech --options --json');
      expect(payload.next).toBe(top.command);
      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('surfaces culture options command in compact priorities', async () => {
    const server = await startTunerServer({ playNotificationMode: 'culture-choice' });
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayPriorities.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayPriorities.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--json',
        '--compact',
        '--no-battlefield',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        next: string | null;
        priorities: Array<{ kind: string; command?: string; reason: string }>;
      };
      const top = payload.priorities[0];
      expect(top.kind).toBe('hud:culture-choice');
      expect(top.command).toBe('game play choose-culture --options --json');
      expect(payload.next).toBe(top.command);
      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('surfaces celebration options command in compact priorities', async () => {
    const server = await startTunerServer({ playNotificationMode: 'celebration-choice' });
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayPriorities.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayPriorities.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--json',
        '--compact',
        '--no-battlefield',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        next: string | null;
        priorities: Array<{ kind: string; command?: string; reason: string }>;
      };
      const top = payload.priorities[0];
      expect(top.kind).toBe('hud:celebration-choice');
      expect(top.command).toBe('game play choose-celebration --options --json');
      expect(payload.next).toBe(top.command);
      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('surfaces government options command in compact priorities', async () => {
    const server = await startTunerServer({ playNotificationMode: 'government-choice' });
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayPriorities.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayPriorities.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--json',
        '--compact',
        '--no-battlefield',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        next: string | null;
        priorities: Array<{ kind: string; command?: string; reason: string }>;
      };
      const top = payload.priorities[0];
      expect(top.kind).toBe('hud:government-choice');
      expect(top.command).toBe('game play choose-government --options --json');
      expect(payload.next).toBe(top.command);
      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('surfaces narrative options command in compact priorities', async () => {
    const server = await startTunerServer({ playNotificationMode: 'narrative-choice' });
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayPriorities.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayPriorities.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--json',
        '--compact',
        '--no-battlefield',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        next: string | null;
        priorities: Array<{ kind: string; command?: string; reason: string }>;
      };
      const top = payload.priorities[0];
      expect(top.kind).toBe('hud:narrative-choice');
      expect(top.command).toBe('game play choose-narrative --options --json');
      expect(payload.next).toBe(top.command);
      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('surfaces dismissal diagnostics for empty narrative choices in compact priorities', async () => {
    const server = await startTunerServer({ playNotificationMode: 'narrative-choice-empty' });
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayPriorities.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayPriorities.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--json',
        '--compact',
        '--no-battlefield',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        next: string | null;
        priorities: Array<{ kind: string; command?: string }>;
      };
      const top = payload.priorities[0];
      expect(top.kind).toBe('hud:narrative-choice');
      expect(top.command).toBe('game play dismiss-notification --target \'{"owner":0,"id":5,"type":20}\' --json');
      expect(payload.next).toBe(top.command);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('surfaces narrative options for visible panel choices in compact priorities', async () => {
    const server = await startTunerServer({ playNotificationMode: 'narrative-choice-visible-panel' });
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayPriorities.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayPriorities.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--json',
        '--compact',
        '--no-battlefield',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        next: string | null;
        priorities: Array<{ kind: string; command?: string }>;
      };
      const top = payload.priorities[0];
      expect(top.kind).toBe('hud:narrative-choice');
      expect(top.command).toBe('game play choose-narrative --options --json');
      expect(payload.next).toBe(top.command);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('surfaces tradition option reader in compact priorities', async () => {
    const server = await startTunerServer({ playNotificationMode: 'tradition-review' });
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayPriorities.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayPriorities.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--json',
        '--compact',
        '--no-battlefield',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        next: string | null;
        priorities: Array<{ kind: string; command?: string; reason: string }>;
      };
      const top = payload.priorities[0];
      expect(top.kind).toBe('hud:tradition-review');
      expect(top.command).toBe('game play traditions --compact --json');
      expect(payload.next).toBe(top.command);
      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('surfaces ready-city compact view for production-choice blockers', async () => {
    const server = await startTunerServer({ playNotificationMode: 'production-choice' });
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayPriorities.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayPriorities.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--json',
        '--compact',
        '--no-battlefield',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        next: string | null;
        priorities: Array<{ kind: string; command?: string; reason: string }>;
      };
      const top = payload.priorities[0];
      expect(top.kind).toBe('hud:production-choice');
      expect(top.command).toBe('game play ready-city --compact --json');
      expect(payload.next).toBe(top.command);
      expect(server.received.some((message) => message.includes('readReadyCityView'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('surfaces ready-city compact view for population-placement blockers', async () => {
    const server = await startTunerServer({ playNotificationMode: 'population-placement' });
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayPriorities.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayPriorities.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--json',
        '--compact',
        '--no-battlefield',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        next: string | null;
        priorities: Array<{ kind: string; command?: string; reason: string }>;
      };
      const top = payload.priorities[0];
      expect(top.kind).toBe('hud:population-placement');
      expect(top.command).toBe('game play ready-city --compact --json');
      expect(payload.next).toBe(top.command);
      expect(server.received.some((message) => message.includes('readReadyCityView'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('surfaces exact informational dismissal command in compact priorities', async () => {
    const server = await startTunerServer({ playNotificationMode: 'stale-informational' });
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayPriorities.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayPriorities.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--json',
        '--compact',
        '--no-battlefield',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        next: string | null;
        priorities: Array<{ kind: string; command?: string; reason: string }>;
      };
      const top = payload.priorities[0];
      expect(top.kind).toBe('hud:informational-notification');
      expect(top.command).toContain('game play dismiss-notification');
      expect(top.command).toContain("--target '{\"owner\":0,\"id\":89,\"type\":20}'");
      expect(top.command).toContain("<reviewed: notification-volcano-active>");
      expect(payload.next).toBe(top.command);
      expect(top.reason).toContain('live ComponentID');
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('routes unit-lost reports to reviewed dismissal in compact priorities', async () => {
    const server = await startTunerServer({ playNotificationMode: 'unit-lost-report' });
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayPriorities.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayPriorities.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--json',
        '--compact',
        '--no-battlefield',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        next: string | null;
        priorities: Array<{ kind: string; command?: string; reason: string }>;
      };
      const top = payload.priorities[0];
      expect(top.kind).toBe('hud:informational-notification');
      expect(top.command).toContain('game play dismiss-notification');
      expect(top.command).toContain("--target '{\"owner\":0,\"id\":34,\"type\":20}'");
      expect(top.command).toContain('<reviewed: notification-unit-lost>');
      expect(payload.next).toBe(top.command);
      expect(top.command).not.toMatch(/enemy|hostile|opponent/i);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('routes diplomatic action reports without response options to reviewed dismissal in compact priorities', async () => {
    const server = await startTunerServer({ playNotificationMode: 'diplomatic-action-report' });
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayPriorities.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayPriorities.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--json',
        '--compact',
        '--no-battlefield',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        next: string | null;
        priorities: Array<{ kind: string; command?: string; reason: string }>;
      };
      const top = payload.priorities[0];
      expect(top.kind).toBe('hud:informational-notification');
      expect(top.command).toContain('game play dismiss-notification');
      expect(top.command).toContain("--target '{\"owner\":0,\"id\":118,\"type\":20}'");
      expect(top.command).toContain('<reviewed: notification-diplomatic-action>');
      expect(payload.next).toBe(top.command);
      expect(top.reason).toContain('live ComponentID');
      expect(top.command).not.toContain('respond-diplomacy');
      expect(payload.next).not.toContain('respond-diplomacy');
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('classifies stale command-units with disabled candidates in compact priorities', async () => {
    const server = await startTunerServer({ playNotificationMode: 'stale-unit-command-disabled' });
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayPriorities.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayPriorities.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--json',
        '--compact',
        '--no-battlefield',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        next: string | null;
        decisionHud: { hasSentTurnComplete?: unknown };
        priorities: Array<{ kind: string; summary: string; command?: string; reason: string }>;
      };
      const top = payload.priorities[0];
      expect(top.kind).toBe('hud:unit-command-stale-expired');
      expect(top.summary).toContain('no ready unit');
      expect(top.command).toContain('game play end-turn --send');
      expect(payload.next).toBe(top.command);
      expect(top.reason).toContain('normal end-turn path once');
      expect(JSON.stringify(payload.decisionHud.hasSentTurnComplete)).toContain('false');
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('classifies stale command-units as pending after turn-complete was sent', async () => {
    const server = await startTunerServer({ playNotificationMode: 'stale-unit-command-pending' });
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayPriorities.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayPriorities.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--json',
        '--compact',
        '--no-battlefield',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        next: string | null;
        decisionHud: { hasSentTurnComplete?: unknown };
        priorities: Array<{ kind: string; summary: string; command?: string; reason: string }>;
      };
      const top = payload.priorities[0];
      expect(top.kind).toBe('hud:unit-command-stale-expired');
      expect(top.summary).toContain('turn-complete was sent');
      expect(top.command).toContain('game watch --count 3');
      expect(payload.next).toBe(top.command);
      expect(top.reason).toContain('turn-complete is already sent');
      expect(JSON.stringify(payload.decisionHud.hasSentTurnComplete)).toContain('true');
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('schedules notification queue without sending bulk dismissals', async () => {
    const server = await startTunerServer({ playNotificationMode: 'mixed-queue' });
    try {
      const { port } = server.address();
      const writes: string[] = [];
      const log = vi.spyOn(GamePlayNotificationQueue.prototype, 'log').mockImplementation((message?: string) => {
        if (message) writes.push(message);
      });
      try {
        await GamePlayNotificationQueue.run([
          '--host',
          '127.0.0.1',
          '--port',
          String(port),
          '--json',
        ]);
      } finally {
        log.mockRestore();
      }

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        view: {
          queueLength: number;
          schedule: Array<{ disposition: string; command: string | null; safeToBatch: boolean; isEndTurnBlocking: boolean }>;
        };
      };
      expect(payload.view.queueLength).toBe(3);
      expect(payload.view.schedule[0].isEndTurnBlocking).toBe(true);
      expect(payload.view.schedule[0].disposition).toBe('operate-with-live-inputs');
      expect(payload.view.schedule.some((step) => step.disposition === 'reviewed-dismissal-candidate')).toBe(true);
      expect(payload.view.schedule.some((step) => step.safeToBatch === true)).toBe(true);
      expect(payload.view.schedule.some((step) => step.command?.includes('dismiss-notification'))).toBe(true);
      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
      expect(server.received.some((message) => message.includes('readNotificationDismissal'))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test('schedules recommended operation commands from notification details', async () => {
    const server = await startTunerServer({ playNotificationMode: 'first-meet' });
    try {
      const { port } = server.address();
      const writes: string[] = [];
      const log = vi.spyOn(GamePlayNotificationQueue.prototype, 'log').mockImplementation((message?: string) => {
        if (message) writes.push(message);
      });
      try {
        await GamePlayNotificationQueue.run([
          '--host',
          '127.0.0.1',
          '--port',
          String(port),
          '--json',
        ]);
      } finally {
        log.mockRestore();
      }

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        view: {
          schedule: Array<{ category: string; command: string | null; disposition: string }>;
        };
      };
      const step = payload.view.schedule[0];
      expect(step.category).toBe('first-meet-diplomacy');
      expect(step.disposition).toBe('operate-with-live-inputs');
      expect(step.command).toBe('game play respond-first-meet --player-id 0 --met-player-id 2 --response neutral');
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test.each([
    ['tech-choice', 'NOTIFICATION_CHOOSE_TECH', 'game play choose-tech --options --json'],
    ['culture-choice', 'NOTIFICATION_CHOOSE_CULTURE_NODE', 'game play choose-culture --options --json'],
    ['celebration-choice', 'NOTIFICATION_CHOOSE_GOLDEN_AGE', 'game play choose-celebration --options --json'],
    ['government-choice', 'NOTIFICATION_CHOOSE_GOVERNMENT', 'game play choose-government --options --json'],
    ['narrative-choice', 'NOTIFICATION_CHOOSE_DISCOVERY_STORY_DIRECTION', 'game play choose-narrative --options --json'],
  ] as const)('routes %s notification queue entries to compact option readers', async (playNotificationMode, typeName, command) => {
    const server = await startTunerServer({ playNotificationMode });
    try {
      const { port } = server.address();
      const writes: string[] = [];
      const log = vi.spyOn(GamePlayNotificationQueue.prototype, 'log').mockImplementation((message?: string) => {
        if (message) writes.push(message);
      });
      try {
        await GamePlayNotificationQueue.run([
          '--host',
          '127.0.0.1',
          '--port',
          String(port),
          '--json',
        ]);
      } finally {
        log.mockRestore();
      }

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        view: {
          schedule: Array<{ typeName: string | null; command: string | null; disposition: string }>;
        };
      };
      const step = payload.view.schedule.find((item) => item.typeName === typeName);
      expect(step?.disposition).toBe('operate-with-live-inputs');
      expect(step?.command).toBe(command);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test('schedules legacy completion reports as reviewed dismissal candidates', async () => {
    const server = await startTunerServer({ playNotificationMode: 'legacy-completed' });
    try {
      const { port } = server.address();
      const writes: string[] = [];
      const log = vi.spyOn(GamePlayNotificationQueue.prototype, 'log').mockImplementation((message?: string) => {
        if (message) writes.push(message);
      });
      try {
        await GamePlayNotificationQueue.run([
          '--host',
          '127.0.0.1',
          '--port',
          String(port),
          '--json',
        ]);
      } finally {
        log.mockRestore();
      }

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        view: {
          schedule: Array<{ disposition: string; command: string | null; safeToBatch: boolean; typeName: string | null }>;
        };
      };
      const step = payload.view.schedule[0];
      expect(step.typeName).toBe('NOTIFICATION_LEGACY_COMPLETED');
      expect(step.disposition).toBe('reviewed-dismissal-candidate');
      expect(step.safeToBatch).toBe(true);
      expect(step.command).toContain('dismiss-notification');
      expect(step.command).toContain('<reviewed: notification-legacy-completed>');
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test('bulk dismisses only eligible informational queue items with approval', async () => {
    const dryRunServer = await startTunerServer({ playNotificationMode: 'mixed-queue' });
    try {
      const { port } = dryRunServer.address();
      const writes: string[] = [];
      const log = vi.spyOn(GamePlayDismissNotificationQueue.prototype, 'log').mockImplementation((message?: string) => {
        if (message) writes.push(message);
      });
      try {
        await GamePlayDismissNotificationQueue.run([
          '--host',
          '127.0.0.1',
          '--port',
          String(port),
          '--json',
        ]);
      } finally {
        log.mockRestore();
      }

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        view: { send: boolean; eligibleCount: number; selectedCount: number; excluded: unknown[]; results: unknown[] };
      };
      expect(payload.view.send).toBe(false);
      expect(payload.view.eligibleCount).toBe(1);
      expect(payload.view.selectedCount).toBe(1);
      expect(payload.view.excluded).toHaveLength(2);
      expect(payload.view.results).toHaveLength(0);
      expect(dryRunServer.received.some((message) => message.includes('readNotificationDismissal'))).toBe(false);
    } finally {
      await dryRunServer.close();
    }

    const sendServer = await startTunerServer({ playNotificationMode: 'mixed-queue' });
    try {
      const { port } = sendServer.address();
      const writes: string[] = [];
      const log = vi.spyOn(GamePlayDismissNotificationQueue.prototype, 'log').mockImplementation((message?: string) => {
        if (message) writes.push(message);
      });
      try {
        await GamePlayDismissNotificationQueue.run([
          '--host',
          '127.0.0.1',
          '--port',
          String(port),
          '--send',
          '--reason',
          'reviewed queue reports',
          '--json',
        ]);
      } finally {
        log.mockRestore();
      }

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        view: { send: boolean; eligibleCount: number; selectedCount: number; results: Array<{ sent: boolean; verified: boolean }> };
      };
      expect(payload.view.send).toBe(true);
      expect(payload.view.eligibleCount).toBe(1);
      expect(payload.view.selectedCount).toBe(1);
      expect(payload.view.results).toHaveLength(1);
      expect(payload.view.results[0].sent).toBe(true);
      expect(payload.view.results[0].verified).toBe(true);
      expect(sendServer.received.filter((message) => message.includes('readNotificationDismissal')).length).toBeGreaterThan(1);
      expect(sendServer.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      await sendServer.close();
    }
  });

  test('excludes front unit-lost reports from bulk dismissal', async () => {
    const server = await startTunerServer({ playNotificationMode: 'unit-lost-report' });
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayDismissNotificationQueue.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayDismissNotificationQueue.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        view: {
          eligibleCount: number;
          selectedCount: number;
          excluded: Array<{ typeName: string | null; reason: string }>;
          results: unknown[];
        };
      };
      expect(payload.view.eligibleCount).toBe(0);
      expect(payload.view.selectedCount).toBe(0);
      expect(payload.view.results).toHaveLength(0);
      expect(payload.view.excluded).toHaveLength(1);
      expect(payload.view.excluded[0]).toMatchObject({
        typeName: 'NOTIFICATION_UNIT_LOST',
        reason: 'front unit-loss reports require exact reviewed dismissal proof, not bulk dismissal',
      });
      expect(server.received.some((message) => message.includes('readNotificationDismissal'))).toBe(false);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('schedules unit-lost reports as reviewed dismissal candidates', async () => {
    const server = await startTunerServer({ playNotificationMode: 'unit-lost-report' });
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayNotificationQueue.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayNotificationQueue.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        view: {
          schedule: Array<{
            disposition: string;
            typeName: string;
            command: string | null;
            safeToBatch: boolean;
          }>;
        };
      };
      const step = payload.view.schedule[0];
      expect(step.disposition).toBe('reviewed-dismissal-candidate');
      expect(step.typeName).toBe('NOTIFICATION_UNIT_LOST');
      expect(step.command).toContain("game play dismiss-notification --target '{\"owner\":0,\"id\":34,\"type\":20}'");
      expect(step.command).toContain('<reviewed: notification-unit-lost>');
      expect(step.command).not.toMatch(/enemy|hostile|opponent/i);
      expect(step.safeToBatch).toBe(false);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('dismisses reviewed notifications only with explicit approval reason', async () => {
    await expect(GamePlayDismissNotification.run([
      '--target',
      '{"owner":0,"id":113,"type":20}',
      '--send',
      '--json',
    ])).rejects.toThrow(/requires --reason/);

    const server = await startTunerServer();
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
        '--target',
        '{"owner":0,"id":113,"type":20}',
        '--send',
        '--reason',
        'reviewed wonder completed notice',
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        result: {
          sent: boolean;
          verified: boolean;
          closeoutPath: string | null;
          result: {
            notificationTrainManager: { ok: boolean; attempted: boolean; path?: string };
            panelCloseControl: { ok: boolean; attempted: boolean; reason?: string };
          };
          verificationAttempts: unknown[];
        };
      };
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
      log.mockRestore();
      await server.close();
    }
  });

  test('does not verify dismissal from stale nonblocking front evidence', async () => {
    const server = await startTunerServer({ notificationDismissalMode: 'stale-nonblocking' });
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
        '--target',
        '{"owner":0,"id":113,"type":20}',
        '--send',
        '--reason',
        'reviewed culture tree reveal',
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        result: {
          sent: boolean;
          verified: boolean;
          result: {
            notificationTrainManager: { ok: boolean; attempted: boolean };
            panelCloseControl: { ok: boolean; attempted: boolean };
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
      };
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
      log.mockRestore();
      await server.close();
    }
  });

  test('does not verify dismissal from train absence while engine queue still fronts the target', async () => {
    const server = await startTunerServer({ notificationDismissalMode: 'engine-front-train-absent' });
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
        '--target',
        '{"owner":0,"id":113,"type":20}',
        '--send',
        '--reason',
        'reviewed unit lost report',
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        result: {
          sent: boolean;
          verified: boolean;
          after: {
            engineQueueContains: { ok: boolean; value: boolean };
            isEngineQueueFront: { ok: boolean; value: boolean };
            notificationTrainContains: { ok: boolean; value: boolean };
            isNotificationTrainFront: { ok: boolean; value: boolean };
          };
          verificationAttempts: unknown[];
        };
      };
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
      log.mockRestore();
      await server.close();
    }
  });

  test('does not verify dismissal from dismissed flag while engine queue still fronts the target', async () => {
    const server = await startTunerServer({ notificationDismissalMode: 'engine-front-dismissed' });
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
        '--target',
        '{"owner":0,"id":113,"type":20}',
        '--send',
        '--reason',
        'reviewed dismissed flag with stale engine-front report',
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        result: {
          sent: boolean;
          verified: boolean;
          after: {
            dismissed: boolean;
            engineQueueContains: { ok: boolean; value: boolean };
            isEngineQueueFront: { ok: boolean; value: boolean };
          };
          verificationAttempts: unknown[];
        };
      };
      expect(payload.result.sent).toBe(true);
      expect(payload.result.verified).toBe(false);
      expect(payload.result.after).toMatchObject({
        dismissed: true,
        engineQueueContains: { ok: true, value: true },
        isEngineQueueFront: { ok: true, value: true },
      });
      expect(payload.result.verificationAttempts.length).toBeGreaterThan(1);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('reads ready-unit tactical view without sending operations', async () => {
    const server = await startTunerServer();
    try {
      const { port } = server.address();
      await GamePlayReadyUnit.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--json',
      ]);

      expect(server.received.some((message) => message.includes('readReadyUnitView'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendRequest'))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test('reads official unit move preview with neutral relationship policy', async () => {
    const server = await startTunerServer();
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayUnitMovePreview.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayUnitMovePreview.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--unit-id',
        '{"owner":0,"id":65536,"type":26}',
        '--destination',
        '25,35',
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        view: {
          requestedDestination: { x: number; y: number };
          reachableMovement: { ok: true; value: ReadonlyArray<unknown> };
          queuedDestination: { ok: true; value: { x: number; y: number } };
          relationshipPolicy: { relationshipSource: string; relationshipProof: string; unprovenLabel: string; guidance: string };
        };
      };
      expect(payload.view.requestedDestination).toEqual({ x: 25, y: 35 });
      expect(payload.view.reachableMovement.value.length).toBeGreaterThan(0);
      expect(payload.view.queuedDestination.value).toEqual({ x: 25, y: 35 });
      expect(payload.view.relationshipPolicy.relationshipSource).toBe('not-classified');
      expect(payload.view.relationshipPolicy.relationshipProof).toBe('none');
      expect(payload.view.relationshipPolicy.unprovenLabel).toBe('relationship-unproven');
      expect(payload.view.relationshipPolicy.guidance).toMatch(/does not classify other-owner relationships/);
      expect(server.received.some((message) => message.includes('readUnitMovePreview'))).toBe(true);
      expect(server.received.some((message) => message.includes('getReachableMovement'))).toBe(true);
      expect(server.received.some((message) => message.includes('getQueuedOperationDestination'))).toBe(true);
      expect(server.received.some((message) => message.includes('getPathTo'))).toBe(true);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('emits compact official unit move preview by request', async () => {
    const server = await startTunerServer();
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayUnitMovePreview.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayUnitMovePreview.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--unit-id',
        '{"owner":0,"id":65536,"type":26}',
        '--destination',
        '25,35',
        '--compact',
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        contractVersion: string;
        command: string;
        summary: string;
        requestedDestination: { x: number; y: number };
        queuedDestination: { x: number; y: number } | null;
        reach: { movementPlotCount: number; targetPlotCount: number };
        candidates: {
          reachableMovement: Array<{ x: number; y: number; currentLocation: boolean; validateCli: string | null }>;
          reachableTargets: Array<{ x: number; y: number; validateCli: string | null }>;
          limit: number;
        };
        paths: { requested: { plotCount?: number } | null; queued: { plotCount?: number } | null };
        next: string | null;
        warnings: string[];
        relationshipProof: string;
        omitted: Array<{ path: string }>;
        view?: unknown;
      };
      expect(payload.contractVersion).toBe('play-agent-v0');
      expect(payload.command).toBe('game play unit-move-preview');
      expect(payload.summary).toContain('UNIT_GALLEY');
      expect(payload.requestedDestination).toEqual({ x: 25, y: 35 });
      expect(payload.queuedDestination).toEqual({ x: 25, y: 35 });
      expect(payload.reach.movementPlotCount).toBeGreaterThan(0);
      expect(payload.reach.targetPlotCount).toBeGreaterThanOrEqual(0);
      expect(payload.candidates.limit).toBe(12);
      expect(payload.candidates.reachableMovement[0]).toMatchObject({ x: 25, y: 35, currentLocation: false });
      expect(payload.candidates.reachableMovement[0].validateCli).toContain("game play unit-target --unit-id '{\"owner\":0,\"id\":65536,\"type\":26}' --x 25 --y 35 --json");
      expect(payload.candidates.reachableTargets[0]).toMatchObject({ x: 26, y: 35 });
      expect(payload.paths.requested?.plotCount).toBeGreaterThan(0);
      expect(payload.paths.queued?.plotCount).toBeGreaterThan(0);
      expect(payload.next).toContain('game play unit-target');
      expect(payload.relationshipProof).toBe('none');
      expect(payload.warnings.join(' ')).toContain('does not classify other-owner relationships');
      expect(payload.omitted.some((item) => item.path === 'view.reachableMovement')).toBe(true);
      expect(payload.view).toBeUndefined();
      expect(server.received.some((message) => message.includes('readUnitMovePreview'))).toBe(true);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('reads promotion readiness without sending promotion commands', async () => {
    const server = await startTunerServer();
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayPromotionReadiness.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayPromotionReadiness.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        view: { promotionReadiness: { ok: true; value: { canPurchase: boolean } } };
      };
      expect(payload.view.promotionReadiness.value.canPurchase).toBe(false);
      expect(server.received.some((message) => message.includes('readReadyUnitView'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendRequest'))).toBe(false);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('materializes restart rehydration continuity without sending operations', async () => {
    const server = await startTunerServer({ playNotificationMode: 'ready-unit' });
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayRehydrate.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayRehydrate.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--expected-turn',
        '97',
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        snapshot: {
          readyUnit: unknown;
          continuity: { status: string; warnings: string[] };
        };
      };
      expect(payload.snapshot.readyUnit).not.toBeNull();
      expect(payload.snapshot.continuity.status).toBe('mismatch');
      expect(payload.snapshot.continuity.warnings[0]).toMatch(/turn mismatch/);
      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
      expect(server.received.some((message) => message.includes('readReadyUnitView'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendRequest'))).toBe(false);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('reads ready-city decision view without sending operations', async () => {
    const server = await startTunerServer();
    try {
      const { port } = server.address();
      await GamePlayReadyCity.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--json',
      ]);

      expect(server.received.some((message) => message.includes('readReadyCityView'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendRequest'))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test('emits compact ready-city population and expansion yield candidates', async () => {
    const server = await startTunerServer();
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayReadyCity.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayReadyCity.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--compact',
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        contractVersion: string;
        command: string;
        summary: string;
        city: { name: string; buildQueue: unknown };
        productionCandidates: Array<{
          kind: string;
          typeName: string;
          name: string;
          cost: number;
          turns: number;
          productionBasis: { costSource: string; turnsSource: string };
          baseYieldSummary: { YIELD_PRODUCTION: number };
          valid: boolean;
          placementPlots: Array<{ x: number; y: number }>;
          cli: string;
        }>;
        populationPlacement: {
          yieldTypeOrder: string[];
          workablePlots: Array<{ yieldDelta: { YIELD_HAPPINESS: number; happiness?: number }; cli: string }>;
          expansionCandidates: Array<{
            constructibleName: string;
            yieldSource: string;
            yieldSummary: { YIELD_FOOD: number; YIELD_PRODUCTION: number; food?: number };
            terrainName: string;
            cli: string;
          }>;
        };
        next: string;
        warnings: string[];
        omitted: Array<{ path: string }>;
        view?: unknown;
      };
      expect(payload.contractVersion).toBe('play-agent-v0');
      expect(payload.command).toBe('game play ready-city');
      expect(payload.summary).toContain('Dur-Sharrukin');
      expect(payload.productionCandidates[0]).toMatchObject({
        kind: 'constructible',
        typeName: 'BUILDING_WALLS',
        name: 'LOC_BUILDING_WALLS_NAME',
        cost: 80,
        turns: 3,
        productionBasis: {
          costSource: 'city.Production.getConstructibleProductionCost(ConstructibleType)',
          turnsSource: 'city.BuildQueue.getTurnsLeft(type)',
        },
        baseYieldSummary: { YIELD_PRODUCTION: 1 },
        valid: true,
      });
      expect(payload.productionCandidates[0].placementPlots[0]).toMatchObject({ x: 22, y: 31 });
      expect(payload.productionCandidates[0].cli).toContain('game play build-production');
      expect(payload.populationPlacement.yieldTypeOrder).toContain('YIELD_DIPLOMACY');
      expect(payload.populationPlacement.workablePlots[0].yieldDelta.YIELD_HAPPINESS).toBe(2);
      expect(payload.populationPlacement.workablePlots[0].yieldDelta.happiness).toBeUndefined();
      expect(payload.populationPlacement.workablePlots[0].cli).toContain('assign-worker');
      expect(payload.populationPlacement.expansionCandidates[0].constructibleName).toBe('Walls');
      expect(payload.populationPlacement.expansionCandidates[0].yieldSource).toBe('GameplayMap.getYieldsWithCity(plotIndex, cityId)');
      expect(payload.populationPlacement.expansionCandidates[0].yieldSummary).toMatchObject({ YIELD_FOOD: 2, YIELD_PRODUCTION: 1 });
      expect(payload.populationPlacement.expansionCandidates[0].yieldSummary.food).toBeUndefined();
      expect(payload.populationPlacement.expansionCandidates[0].terrainName).toBe('Grassland');
      expect(payload.next).toContain('assign-worker');
      expect(payload.warnings.join(' ')).toContain('Read-only city dashboard');
      expect(payload.omitted.some((item) => item.path === 'view.productionCandidates[].result')).toBe(true);
      expect(payload.omitted.some((item) => item.path === 'view.populationPlacement.allPlacementInfo')).toBe(true);
      expect(payload.view).toBeUndefined();
      expect(server.received.some((message) => message.includes('readReadyCityView'))).toBe(true);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('reads settlement recommendations without sending operations', async () => {
    const server = await startTunerServer();
    try {
      const { port } = server.address();
      await GamePlaySettlementRecommendations.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--x',
        '15',
        '--y',
        '23',
        '--json',
      ]);

      expect(server.received.some((message) => message.includes('readSettlementRecommendations'))).toBe(true);
      expect(server.received.some((message) => message.includes('"locations":[{"x":15,"y":23}]'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendRequest'))).toBe(false);
    } finally {
      await server.close();
    }
  });

});

function expectPositiveRelationshipLabels(values: readonly string[]): void {
  const text = values.join('\n');
  expect(text).not.toMatch(/\bnon-friendly\b/i);
  expect(text).not.toMatch(/\benemy\b/i);
  expect(text).not.toMatch(/\bhostile\b/i);
  expect(text).not.toMatch(/\bopponent\b/i);
}

function expectOwnerOnlyContactLabels(values: readonly string[]): void {
  expectPositiveRelationshipLabels(values);
  expect(values.join('\n')).not.toMatch(/\bthreats?\b/i);
}

async function startTunerServer(options: {
  playNotificationMode?: 'town-focus' | 'production-choice' | 'population-placement' | 'tech-choice' | 'culture-choice' | 'celebration-choice' | 'government-choice' | 'narrative-choice' | 'narrative-choice-empty' | 'narrative-choice-visible-panel' | 'tradition-review' | 'stale-unit-command' | 'stale-unit-command-disabled' | 'stale-unit-command-pending' | 'stale-informational' | 'unit-lost-report' | 'legacy-completed' | 'diplomatic-report' | 'diplomatic-action-report' | 'first-meet' | 'ready-unit' | 'mixed-queue' | 'clean-read' | 'stale-diplomacy' | 'runtime-error';
  notificationDismissalMode?: 'verified' | 'stale-nonblocking' | 'engine-front-train-absent' | 'engine-front-dismissed';
} = {}) {
  let notificationDismissalSent = false;
  return startFakeTunerServer({
    handle({ message }) {
      if (message.includes('readPlayNotifications')) {
        return [JSON.stringify(playNotificationView(
          options.playNotificationMode,
        ))];
      }
      if (message.includes('DiplomacyPlayerFirstMeets')) {
        return [JSON.stringify({
          key: 'PLAYER_REALATIONSHIP_FIRSTMEET_NEUTRAL',
          value: 673478009,
        })];
      }
      if (message.includes('readUnitMovePreview')) {
        return [JSON.stringify(unitMovePreviewView())];
      }
      if (message.includes('readReadyUnitView')) {
        return [JSON.stringify(readyUnitView())];
      }
      if (message.includes('readReadyCityView')) {
        return [JSON.stringify(
          options.playNotificationMode === 'clean-read' ? cleanReadyCityView() : readyCityView(),
        )];
      }
      if (message.includes('readSettlementRecommendations')) {
        return [JSON.stringify(settlementRecommendationsView())];
      }
      if (message.includes('readTargetCandidates')) {
        return [JSON.stringify(targetCandidatesView())];
      }
      if (message.includes('readDestinationAnalysis')) {
        return [JSON.stringify(destinationAnalysisView())];
      }
      if (message.includes('readBattlefieldScan')) {
        return [JSON.stringify(battlefieldScanView())];
      }
      if (message.includes('readNotificationDismissal')) {
        const send = message.includes('"send":true');
        if (send) notificationDismissalSent = true;
        return [JSON.stringify(notificationDismissal(
          send,
          options.notificationDismissalMode ?? 'verified',
          notificationDismissalSent && !send,
        ))];
      }
      if (message.includes('return JSON.stringify(validateOperation')) {
        return [JSON.stringify(operationValidation(message))];
      }
      if (message.includes('return JSON.stringify(sendOperation')) {
        const unitFamily = message.includes('sendOperation("unit-operation"') || message.includes('sendOperation("unit-command"');
        return [JSON.stringify(unitFamily
          ? {
              sent: true,
              beforePostcondition: unitOperationPostconditionSnapshot({ owner: 0, id: 65536, type: 26 }),
              afterPostcondition: unitOperationPostconditionSnapshot({ owner: 0, id: 131072, type: 26 }),
            }
          : { sent: true })];
      }
      return undefined;
    },
  });
}

function playNotificationView(
  mode: 'town-focus' | 'production-choice' | 'population-placement' | 'tech-choice' | 'culture-choice' | 'celebration-choice' | 'government-choice' | 'narrative-choice' | 'narrative-choice-empty' | 'narrative-choice-visible-panel' | 'tradition-review' | 'stale-unit-command' | 'stale-unit-command-disabled' | 'stale-unit-command-pending' | 'stale-informational' | 'unit-lost-report' | 'legacy-completed' | 'diplomatic-report' | 'diplomatic-action-report' | 'first-meet' | 'ready-unit' | 'mixed-queue' | 'clean-read' | 'stale-diplomacy' | 'runtime-error' = 'town-focus',
) {
  if (mode === 'runtime-error') {
    const gameError = { ok: false as const, error: 'ReferenceError: Game is not defined' };
    return {
      localPlayerId: 0,
      turn: gameError,
      turnDate: gameError,
      hasSentTurnComplete: { ok: true, value: false },
      canEndTurn: { ok: true, value: false },
      blocker: gameError,
      blockingNotificationId: gameError,
      selectedUnitId: { ok: true, value: null },
      selectedCityId: { ok: true, value: null },
      firstReadyUnitId: { ok: true, value: null },
      notifications: [],
      decisions: [],
      hud: {
        nextDecision: null,
        decisionQueue: [],
      },
      limits: { maxNotifications: 25, truncated: false },
    };
  }
  if (mode === 'clean-read') {
    return {
      localPlayerId: 0,
      turn: { ok: true, value: 6 },
      turnDate: { ok: true, value: '3875 BCE' },
      hasSentTurnComplete: { ok: true, value: false },
      canEndTurn: { ok: true, value: false },
      blocker: { ok: true, value: 0 },
      blockingNotificationId: { ok: true, value: null },
      selectedUnitId: { ok: true, value: null },
      selectedCityId: { ok: true, value: null },
      firstReadyUnitId: { ok: true, value: null },
      notifications: [],
      decisions: [],
      hud: {
        nextDecision: null,
        decisionQueue: [],
      },
      limits: { maxNotifications: 25, truncated: false },
    };
  }
  if (mode === 'first-meet') {
    const decision = {
      category: 'first-meet-diplomacy',
      operationFamily: 'player-operation',
      operationType: 'RESPOND_DIPLOMATIC_FIRST_MEET',
      argsShape: '{ Player1, Player2, Type }',
      cli: 'game play respond-first-meet',
      requiredInputs: [
        { name: 'Player1', source: 'local player id', required: true },
        { name: 'Player2', source: 'met player id', required: true },
        { name: 'Type', source: 'chosen first-meet greeting', required: true },
      ],
      commonActions: [
        {
          label: 'send neutral first-meet greeting',
          cli: 'game play respond-first-meet --player-id 0 --met-player-id 2 --response neutral',
          operationFamily: 'player-operation',
          operationType: 'RESPOND_DIPLOMATIC_FIRST_MEET',
          argsShape: '{ Player1, Player2, Type }',
          when: 'after validating the greeting options from the live first-meet UI',
        },
      ],
      notes: ['First-meet greetings are real player operations, not notification dismissals.'],
      details: {
        kind: 'first-meet-diplomacy',
        player1: 0,
        player2: 2,
        responses: [
          {
            response: 'neutral',
            type: { ok: true, value: 673478009 },
            args: { Player1: 0, Player2: 2, Type: 673478009 },
            validation: { ok: true, value: { Success: true } },
          },
        ],
        recommendedResponse: 'neutral',
        recommendedCli: 'game play respond-first-meet --player-id 0 --met-player-id 2 --response neutral',
      },
    };
    const notification = {
      id: { owner: 0, id: 44, type: 20 },
      type: 44,
      typeName: 'NOTIFICATION_PLAYER_MET',
      groupType: null,
      summary: 'You have met Ashoka, World Renouncer of Mauryan Empire.',
      message: 'You have met a new Civilization',
      target: { owner: -1, id: -1, type: 0 },
      location: { x: 4, y: 2 },
      player: 2,
      canUserDismiss: false,
      expired: false,
      dismissed: false,
      isEndTurnBlocking: true,
      decision,
      details: decision.details,
    };
    return {
      localPlayerId: 0,
      turn: { ok: true, value: 27 },
      turnDate: { ok: true, value: '3350 BCE' },
      hasSentTurnComplete: { ok: true, value: false },
      canEndTurn: { ok: true, value: false },
      blocker: { ok: true, value: 523279636 },
      blockingNotificationId: { ok: true, value: notification.id },
      selectedUnitId: { ok: true, value: null },
      selectedCityId: { ok: true, value: null },
      firstReadyUnitId: { ok: true, value: null },
      notifications: [notification],
      decisions: [decision],
      hud: {
        nextDecision: {
          notificationId: notification.id,
          isEndTurnBlocking: true,
          typeName: notification.typeName,
          summary: notification.summary,
          message: notification.message,
          target: notification.target,
          location: notification.location,
          player: notification.player,
          details: notification.details,
          ...decision,
        },
        decisionQueue: [
          {
            notificationId: notification.id,
            isEndTurnBlocking: true,
            typeName: notification.typeName,
            summary: notification.summary,
            message: notification.message,
            target: notification.target,
            location: notification.location,
            player: notification.player,
            details: notification.details,
            ...decision,
          },
        ],
      },
      limits: { maxNotifications: 25, truncated: false },
    };
  }
  if (mode === 'mixed-queue') {
    const diplomacyDecision = {
      category: 'diplomacy-response',
      operationFamily: 'player-operation',
      operationType: 'RESPOND_DIPLOMATIC_ACTION',
      argsShape: '{ ID, Type }',
      cli: 'game play respond-diplomacy',
      requiredInputs: [
        { name: 'ID', source: 'live diplomatic action', required: true },
        { name: 'Type', source: 'chosen diplomatic response', required: true },
      ],
      commonActions: [
        {
          label: 'validate diplomacy response',
          cli: 'game play respond-diplomacy --player-id <id> --action-id <action-id> --response-type <response-type>',
          operationFamily: 'player-operation',
          operationType: 'RESPOND_DIPLOMATIC_ACTION',
          argsShape: '{ ID, Type }',
          when: 'after reading the action id and desired response type',
        },
      ],
      confidence: 'live-proof',
      notes: ['Use the diplomatic action id and response type from the live notification.'],
    };
    const informationalDecision = {
      category: 'informational-notification',
      operationFamily: 'app-ui-action',
      operationType: 'Game.Notifications.dismiss',
      argsShape: '{ notificationId }',
      cli: 'game play dismiss-notification',
      requiredInputs: [
        { name: 'Notification', source: 'notification ComponentID', required: true },
      ],
      commonActions: [
        {
          label: 'dismiss reviewed notification',
          cli: "game play dismiss-notification --target '<notification-id>' --send --reason '<why this was reviewed>'",
          operationFamily: 'app-ui-action',
          operationType: 'Game.Notifications.dismiss',
          argsShape: '{ notificationId }',
          when: 'after reviewing the report',
        },
      ],
      confidence: 'official-ui',
      notes: ['Default-handler report notification; review before closeout.'],
    };
    const commandUnitsDecision = {
      category: 'unit-command',
      operationFamily: 'unit-operation',
      operationType: 'SKIP_TURN',
      argsShape: 'selected/ready unit id plus operation-specific args',
      cli: 'game play operation --family unit',
      requiredInputs: [
        { name: 'Unit', source: 'selectedUnitId or firstReadyUnitId', required: true },
      ],
      commonActions: [
        {
          label: 'read ready-unit view',
          cli: 'game play ready-unit --json',
          argsShape: 'selected/first ready unit, legal operations, nearby occupied plots',
          when: 'before choosing a unit operation',
        },
      ],
      confidence: 'heuristic',
      notes: ['Read the selected or first ready unit before choosing skip, automate, move, or promote.'],
    };
    const notifications = [
      {
        id: { owner: 0, id: 577, type: 20 },
        type: 1,
        typeName: 'NOTIFICATION_DIPLOMATIC_RESPONSE_REQUIRED',
        groupType: null,
        summary: 'Lafayette has started a Diplomatic Action with you.',
        message: 'Respond to Diplomatic Action',
        target: { owner: 4, id: 80, type: 34 },
        location: { x: -9999, y: -9999 },
        canUserDismiss: false,
        expired: false,
        dismissed: false,
        isEndTurnBlocking: true,
        decision: diplomacyDecision,
      },
      {
        id: { owner: 0, id: 579, type: 20 },
        type: 2,
        typeName: 'NOTIFICATION_VOLCANO_ERUPTS_SEV2',
        groupType: null,
        summary: 'Laacher See has erupted.',
        message: 'Megacolossal Volcanic Eruption!',
        target: { owner: -1, id: -1, type: 0 },
        location: { x: 58, y: 36 },
        canUserDismiss: true,
        expired: false,
        dismissed: false,
        isEndTurnBlocking: false,
        decision: informationalDecision,
      },
      {
        id: { owner: 0, id: 583, type: 20 },
        type: 3,
        typeName: 'NOTIFICATION_COMMAND_UNITS',
        groupType: null,
        summary: 'Move a Unit or have it perform an operation.',
        message: 'Command Units',
        target: { owner: -1, id: -1, type: 0 },
        location: { x: -9999, y: -9999 },
        canUserDismiss: false,
        expired: false,
        dismissed: false,
        isEndTurnBlocking: false,
        decision: commandUnitsDecision,
      },
    ];
    const queue = [
      {
        notificationId: notifications[0].id,
        isEndTurnBlocking: true,
        typeName: notifications[0].typeName,
        summary: notifications[0].summary,
        message: notifications[0].message,
        target: notifications[0].target,
        location: notifications[0].location,
        player: null,
        ...diplomacyDecision,
      },
      {
        notificationId: notifications[1].id,
        isEndTurnBlocking: false,
        typeName: notifications[1].typeName,
        summary: notifications[1].summary,
        message: notifications[1].message,
        target: notifications[1].target,
        location: notifications[1].location,
        player: null,
        ...informationalDecision,
      },
      {
        notificationId: notifications[2].id,
        isEndTurnBlocking: false,
        typeName: notifications[2].typeName,
        summary: notifications[2].summary,
        message: notifications[2].message,
        target: notifications[2].target,
        location: notifications[2].location,
        player: null,
        ...commandUnitsDecision,
      },
    ];
    return {
      localPlayerId: 0,
      turn: { ok: true, value: 123 },
      turnDate: { ok: true, value: '1160 BCE' },
      hasSentTurnComplete: { ok: true, value: false },
      canEndTurn: { ok: true, value: false },
      blocker: { ok: true, value: 0 },
      blockingNotificationId: { ok: true, value: notifications[0].id },
      selectedUnitId: { ok: true, value: null },
      selectedCityId: { ok: true, value: null },
      firstReadyUnitId: { ok: true, value: { owner: 0, id: 1507331, type: 26 } },
      notifications,
      decisions: [diplomacyDecision, informationalDecision, commandUnitsDecision],
      hud: {
        nextDecision: queue[0],
        decisionQueue: queue,
      },
      limits: { maxNotifications: 25, truncated: false },
    };
  }
  if (mode === 'stale-diplomacy') {
    const diplomacyDecision = {
      category: 'diplomacy-response',
      operationFamily: 'player-operation',
      operationType: 'RESPOND_DIPLOMATIC_ACTION',
      argsShape: '{ ID, Type }',
      cli: 'game play respond-diplomacy',
      requiredInputs: [
        { name: 'ID', source: 'live diplomatic action', required: true },
        { name: 'Type', source: 'chosen diplomatic response', required: true },
      ],
      commonActions: [
        {
          label: 'choose diplomacy response',
          cli: 'game play respond-diplomacy --action-id <action-id> --response-type <response-type>',
          operationFamily: 'player-operation',
          operationType: 'RESPOND_DIPLOMATIC_ACTION',
          argsShape: '{ ID, Type }',
          when: 'after reading the live panel response options',
        },
      ],
      confidence: 'official-ui',
      notes: ['Visible response panel option; send mode must verify the notification no longer blocks turn completion.'],
    };
    const notificationId = { owner: 0, id: 19, type: 20 };
    const diplomacyResponseDetails = {
      kind: 'diplomacy-response-options',
      actionId: 8,
      notificationId,
      responseData: { ok: true, value: { responseList: [{ responseType: -1907089594 }, { responseType: 926305338 }, { responseType: -1200641623 }] } },
      eventData: { ok: true, value: { responseType: -1907089594, support: 2 } },
      options: [
        {
          responseType: -1907089594,
          title: 'Support',
          description: null,
          cost: null,
          icon: null,
          enabled: false,
          disabled: true,
          validation: { ok: true, value: { Success: false, FailureReasons: ['already selected'] } },
          cli: null,
        },
        {
          responseType: 926305338,
          title: 'Accept',
          description: null,
          cost: null,
          icon: null,
          enabled: true,
          disabled: false,
          validation: { ok: true, value: { Success: true } },
          cli: "game play respond-diplomacy --action-id 8 --response-type 926305338 --notification-id '{\"owner\":0,\"id\":19,\"type\":20}' --send --reason '<why this response was selected>'",
        },
        {
          responseType: -1200641623,
          title: 'Reject',
          description: null,
          cost: null,
          icon: null,
          enabled: true,
          disabled: false,
          validation: { ok: true, value: { Success: true } },
          cli: "game play respond-diplomacy --action-id 8 --response-type -1200641623 --notification-id '{\"owner\":0,\"id\":19,\"type\":20}' --send --reason '<why this response was selected>'",
        },
      ],
      enabledOptions: [
        {
          responseType: 926305338,
          title: 'Accept',
          description: null,
          cost: null,
          icon: null,
          enabled: true,
          disabled: false,
          validation: { ok: true, value: { Success: true } },
          cli: "game play respond-diplomacy --action-id 8 --response-type 926305338 --notification-id '{\"owner\":0,\"id\":19,\"type\":20}' --send --reason '<why this response was selected>'",
        },
        {
          responseType: -1200641623,
          title: 'Reject',
          description: null,
          cost: null,
          icon: null,
          enabled: true,
          disabled: false,
          validation: { ok: true, value: { Success: true } },
          cli: "game play respond-diplomacy --action-id 8 --response-type -1200641623 --notification-id '{\"owner\":0,\"id\":19,\"type\":20}' --send --reason '<why this response was selected>'",
        },
      ],
      disabledOptions: [
        {
          responseType: -1907089594,
          title: 'Support',
          description: null,
          cost: null,
          icon: null,
          enabled: false,
          disabled: true,
          validation: { ok: true, value: { Success: false, FailureReasons: ['already selected'] } },
          cli: null,
        },
      ],
      notes: [
        'Static fixture mirrors the CLI/HUD contract emitted by the App UI source-backed getResponseDataForUI option materializer.',
        'Use a returned enabled option as the single caller-level response; send mode performs UI closeout and notification postcondition checks.',
      ],
    };
    const notification = {
      id: notificationId,
      type: 96575931,
      typeName: 'NOTIFICATION_DIPLOMATIC_RESPONSE_REQUIRED',
      groupType: null,
      summary: 'Trung Trac has started a Diplomatic Action with you.',
      message: 'Respond to Diplomatic Action',
      target: { owner: 2, id: 8, type: 34 },
      location: { x: -9999, y: -9999 },
      canUserDismiss: false,
      expired: true,
      dismissed: false,
      isEndTurnBlocking: true,
      decision: diplomacyDecision,
      details: diplomacyResponseDetails,
    };
    return {
      localPlayerId: 0,
      turn: { ok: true, value: 8 },
      turnDate: { ok: true, value: '3825 BCE' },
      hasSentTurnComplete: { ok: true, value: false },
      canEndTurn: { ok: true, value: false },
      blocker: { ok: true, value: 0 },
      blockingNotificationId: { ok: true, value: notification.id },
      selectedUnitId: { ok: true, value: null },
      selectedCityId: { ok: true, value: null },
      firstReadyUnitId: { ok: true, value: null },
      notifications: [notification],
      decisions: [diplomacyDecision],
      hud: {
        nextDecision: {
          notificationId: notification.id,
          isEndTurnBlocking: true,
          typeName: notification.typeName,
          summary: notification.summary,
          message: notification.message,
          target: notification.target,
          location: notification.location,
          player: null,
          details: notification.details,
          ...diplomacyDecision,
        },
        decisionQueue: [
          {
            notificationId: notification.id,
            isEndTurnBlocking: true,
            typeName: notification.typeName,
            summary: notification.summary,
            message: notification.message,
            target: notification.target,
            location: notification.location,
            player: null,
            details: notification.details,
            ...diplomacyDecision,
          },
        ],
      },
      limits: { maxNotifications: 25, truncated: false },
    };
  }
  if (mode === 'production-choice' || mode === 'population-placement') {
    const production = mode === 'production-choice';
    const decision = production
      ? {
          category: 'production-choice',
          operationFamily: 'city-operation',
          operationType: 'BUILD',
          argsShape: '{ UnitType } or { ConstructibleType, X?, Y? } or { ProjectType }',
          cli: 'game play ready-city',
          requiredInputs: [
            { name: 'City', source: 'notification target or selected city', required: true },
            { name: 'Build item type', source: 'live production chooser', required: true },
          ],
          commonActions: [
            {
              label: 'read production candidates',
              cli: 'game play ready-city --compact --json',
              argsShape: 'city summary and validated production candidates',
              when: 'before choosing a production item',
            },
          ],
          confidence: 'live-proof',
          notes: ['Use live chooser data to decide the item kind.'],
        }
      : {
          category: 'population-placement',
          operationFamily: undefined,
          operationType: undefined,
          argsShape: 'ASSIGN_WORKER { Location, Amount: 1 } or city-command EXPAND placement args',
          cli: 'game play ready-city',
          requiredInputs: [
            { name: 'Location', source: 'chosen plot', required: true },
            { name: 'City', source: 'notification target or selected city', required: false },
          ],
          commonActions: [
            {
              label: 'read city placement candidates',
              cli: 'game play ready-city --compact --json',
              argsShape: 'workable plots and expansion candidates',
              when: 'before choosing assign-worker or expand-city',
            },
          ],
          confidence: 'official-ui',
          notes: ['Re-read candidates before choosing assign-worker or expand-city.'],
        };
    const notificationId = { owner: 0, id: production ? 71 : 72, type: 20 };
    const notification = {
      id: notificationId,
      type: production ? -99801 : -99802,
      typeName: production ? 'NOTIFICATION_CHOOSE_CITY_PRODUCTION' : 'NOTIFICATION_NEW_POPULATION',
      groupType: null,
      summary: production
        ? 'Production has completed in this City. Choose what we shall produce next.'
        : 'Your City is ready to claim and improve a new Rural tile, or assign a Specialist to a workable District.',
      message: production ? 'Choose Production' : 'New Population',
      target: { owner: 0, id: 131073, type: 1 },
      location: null,
      canUserDismiss: false,
      expired: false,
      dismissed: false,
      isEndTurnBlocking: true,
      decision,
    };
    return {
      localPlayerId: 0,
      turn: { ok: true, value: production ? 2 : 3 },
      turnDate: { ok: true, value: production ? '3975 BCE' : '3950 BCE' },
      hasSentTurnComplete: { ok: true, value: false },
      canEndTurn: { ok: true, value: false },
      blocker: { ok: true, value: production ? -513644209 : 0 },
      blockingNotificationId: { ok: true, value: notificationId },
      selectedUnitId: { ok: true, value: null },
      selectedCityId: { ok: true, value: null },
      firstReadyUnitId: { ok: true, value: null },
      notifications: [notification],
      decisions: [decision],
      hud: {
        nextDecision: {
          notificationId: notification.id,
          isEndTurnBlocking: true,
          typeName: notification.typeName,
          summary: notification.summary,
          message: notification.message,
          target: notification.target,
          location: notification.location,
          ...decision,
        },
        decisionQueue: [
          {
            notificationId: notification.id,
            isEndTurnBlocking: true,
            typeName: notification.typeName,
            summary: notification.summary,
            message: notification.message,
            target: notification.target,
            location: notification.location,
            ...decision,
          },
        ],
      },
      limits: { maxNotifications: 25, truncated: false },
    };
  }
  if (mode === 'narrative-choice' || mode === 'narrative-choice-empty' || mode === 'narrative-choice-visible-panel') {
    const narrativeDecision = {
      category: 'narrative-choice',
      operationFamily: 'player-operation',
      operationType: 'CHOOSE_NARRATIVE_STORY_DIRECTION',
      argsShape: '{ TargetType, Target, Action }',
      cli: 'game play choose-narrative',
      requiredInputs: [
        {
          name: 'Target',
          source: 'notification target or story UI targetStoryId',
          required: true,
          note: 'Usually the story ComponentID from the notification target.',
        },
        {
          name: 'TargetType',
          source: 'story option button',
          required: true,
          note: 'If no story links exist, official UI uses CLOSE as the option key.',
        },
        {
          name: 'Action',
          source: 'story option activation',
          required: true,
          note: 'Official narrative UI sends PlayerOperationParameters.Activate.',
        },
      ],
      commonActions: [
        {
          label: 'read narrative options',
          cli: 'game play choose-narrative --options --json',
          argsShape: 'enabled narrative buttons with validation and ready send templates',
          when: 'before choosing a narrative branch or closeout',
        },
      ],
      confidence: 'live-proof',
      notes: ['Use the option reader before sending; the notification target can be invalid because official narrative UI derives the target story from Players.Stories. If no pending story id is present, do not synthesize a narrative operation; inspect dismissal postcondition evidence separately.'],
    };
    const notificationId = { owner: 0, id: 5, type: 20 };
    const targetStoryId = { owner: 0, id: 45, type: 35 };
    const options = [
      {
        targetType: 'CLOSE',
        targetTypeName: 'CLOSE',
        target: targetStoryId,
        action: -1326475004,
        activation: 'CLOSE',
        name: 'Close',
        reward: '+10 Gold',
        imperative: null,
        cost: 0,
        canAfford: { ok: true, value: true },
        args: { TargetType: 'CLOSE', Target: targetStoryId, Action: -1326475004 },
        enabled: true,
        disabled: false,
        validation: { ok: true, value: { Success: true } },
        cli: "game play choose-narrative --player-id 0 --target-type CLOSE --target '{\"owner\":0,\"id\":45,\"type\":35}' --action -1326475004 --send --reason '<why this narrative closeout was selected>'",
        validateCli: "game play choose-narrative --player-id 0 --target-type CLOSE --target '{\"owner\":0,\"id\":45,\"type\":35}' --action -1326475004 --json",
      },
    ];
    const hasPendingStory = mode === 'narrative-choice';
    const hasVisiblePanel = mode === 'narrative-choice-visible-panel';
    const visibleTargetStoryId = { owner: 0, id: 25, type: 35 };
    const visibleOptions = [
      {
        source: 'visible-small-narrative-event',
        targetType: 'DISCOVERY_14001B',
        targetTypeName: 'DISCOVERY_14001B',
        target: visibleTargetStoryId,
        action: -1326475004,
        activation: 'VISIBLE_PANEL',
        name: 'Find work for the soldiers.',
        reward: '+15 Production to Washington, D.C..',
        imperative: '',
        cost: null,
        canAfford: { ok: true, value: true },
        args: { TargetType: 'DISCOVERY_14001B', Target: visibleTargetStoryId, Action: -1326475004 },
        enabled: true,
        disabled: false,
        validation: { ok: true, value: { Success: true } },
        cli: "game play choose-narrative --player-id 0 --target-type DISCOVERY_14001B --target '{\"owner\":0,\"id\":25,\"type\":35}' --action -1326475004 --send --reason '<why this visible narrative option was selected>'",
        validateCli: "game play choose-narrative --player-id 0 --target-type DISCOVERY_14001B --target '{\"owner\":0,\"id\":25,\"type\":35}' --action -1326475004 --json",
      },
      {
        source: 'visible-small-narrative-event',
        targetType: 'DISCOVERY_14001C',
        targetTypeName: 'DISCOVERY_14001C',
        target: visibleTargetStoryId,
        action: -1326475004,
        activation: 'VISIBLE_PANEL',
        name: 'Make plans to return home.',
        reward: '+75 Happiness toward the next Celebration.',
        imperative: '',
        cost: null,
        canAfford: { ok: true, value: true },
        args: { TargetType: 'DISCOVERY_14001C', Target: visibleTargetStoryId, Action: -1326475004 },
        enabled: true,
        disabled: false,
        validation: { ok: true, value: { Success: true } },
        cli: "game play choose-narrative --player-id 0 --target-type DISCOVERY_14001C --target '{\"owner\":0,\"id\":25,\"type\":35}' --action -1326475004 --send --reason '<why this visible narrative option was selected>'",
        validateCli: "game play choose-narrative --player-id 0 --target-type DISCOVERY_14001C --target '{\"owner\":0,\"id\":25,\"type\":35}' --action -1326475004 --json",
      },
    ];
    const surfacedOptions = hasPendingStory ? options : hasVisiblePanel ? visibleOptions : [];
    const hasMaterializedOptions = surfacedOptions.length > 0;
    const details = {
      kind: 'narrative-choice-options',
      classification: surfacedOptions.length > 0 ? 'narrative-choice-options' : 'narrative-choice-no-pending-story',
      notificationId,
      localPlayerId: 0,
      notificationOwner: 0,
      source: 'Players.Stories pending story id + GameInfo.NarrativeStory_Links + PlayerOperations.canStart',
      activateAction: -1326475004,
      targetStoryIdSource: 'Players.Stories.getFirstPendingDiscoveryLastMetID',
      pendingStoryId: { ok: true, value: null },
      pendingDiscoveryStoryId: { ok: true, value: hasPendingStory ? targetStoryId : null },
      targetStoryId: { ok: true, value: hasPendingStory ? targetStoryId : null },
      visiblePanel: {
        ok: true,
        value: hasVisiblePanel
          ? {
              panelType: 'SMALL-NARRATIVE-EVENT',
              componentType: 'SmallNarrativeEvent',
              targetStoryId: visibleTargetStoryId,
              storyType: 'DISCOVERY',
              options: visibleOptions.map((option) => ({
                targetType: option.targetType,
                name: option.name,
                reward: option.reward,
                actionText: option.imperative,
                icons: '[]',
                storyType: 'LIGHT',
              })),
            }
          : { panelType: null, componentType: null, targetStoryId: null, storyType: null, options: [] },
      },
      targetStory: { ok: true, value: hasPendingStory ? { id: 45, type: 'NARRATIVE_DISCOVERY_GOODY_HUT' } : null },
      storyDef: { ok: true, value: hasPendingStory ? { NarrativeStoryType: 'NARRATIVE_DISCOVERY_GOODY_HUT', UIActivation: 'DISCOVERY' } : null },
      storyLinks: { ok: true, value: [] },
      notificationTarget: { owner: -1, id: -1, type: 0 },
      options: surfacedOptions,
      enabledOptions: surfacedOptions,
      disabledOptions: [],
      dismissalDiagnosticCli: hasMaterializedOptions ? null : "game play dismiss-notification --target '{\"owner\":0,\"id\":5,\"type\":20}' --json",
      unprovenDismissalCli: hasMaterializedOptions ? null : "game play dismiss-notification --target '{\"owner\":0,\"id\":5,\"type\":20}' --send --reason '<reviewed: narrative notification has no pending story>'",
      notes: [
        'Static fixture mirrors the CLI/HUD contract emitted by the official story-model narrative choice materializer.',
      ],
    };
    const notification = {
      id: notificationId,
      type: -2084516792,
      typeName: 'NOTIFICATION_CHOOSE_DISCOVERY_STORY_DIRECTION',
      groupType: null,
      summary: 'Choose a selection from the Discovery.',
      message: 'Discovery Choice',
      target: { owner: -1, id: -1, type: 0 },
      location: { x: -9999, y: -9999 },
      canUserDismiss: true,
      expired: false,
      dismissed: false,
      isEndTurnBlocking: true,
      decision: narrativeDecision,
      details,
    };
    return {
      localPlayerId: 0,
      turn: { ok: true, value: 6 },
      turnDate: { ok: true, value: '3875 BCE' },
      hasSentTurnComplete: { ok: true, value: false },
      canEndTurn: { ok: true, value: false },
      blocker: { ok: true, value: -2084516792 },
      blockingNotificationId: { ok: true, value: notificationId },
      selectedUnitId: { ok: true, value: null },
      selectedCityId: { ok: true, value: null },
      firstReadyUnitId: { ok: true, value: null },
      notifications: [notification],
      decisions: [narrativeDecision],
      hud: {
        nextDecision: {
          notificationId: notification.id,
          isEndTurnBlocking: true,
          typeName: notification.typeName,
          summary: notification.summary,
          message: notification.message,
          target: notification.target,
          location: notification.location,
          details: notification.details,
          ...narrativeDecision,
        },
        decisionQueue: [
          {
            notificationId: notification.id,
            isEndTurnBlocking: true,
            typeName: notification.typeName,
            summary: notification.summary,
            message: notification.message,
            target: notification.target,
            location: notification.location,
            details: notification.details,
            ...narrativeDecision,
          },
        ],
      },
      limits: { maxNotifications: 25, truncated: false },
    };
  }
  if (mode === 'tech-choice') {
    const technologyDecision = {
      category: 'technology-choice',
      operationFamily: 'player-operation',
      operationType: 'SET_TECH_TREE_NODE',
      argsShape: '{ ProgressionTreeNodeType }',
      cli: 'game play choose-tech',
      requiredInputs: [
        {
          name: 'ProgressionTreeNodeType',
          source: 'live tech chooser/tree node',
          required: true,
          note: 'Use the runtime node type hash from GameInfo/progression tree data, not the row index or notification id.',
        },
      ],
      commonActions: [
        {
          label: 'read technology options',
          cli: 'game play choose-tech --options --json',
          argsShape: 'enabled tech nodes with validation and ready send templates',
          when: 'before choosing a technology node',
        },
      ],
      confidence: 'live-proof',
      notes: ['Read options from the live tech tree before sending; do not infer node ids from examples.'],
    };
    const notificationId = { owner: 0, id: 52, type: 20 };
    const optionRows = [
      { nodeType: -1255676052, nodeTypeName: 'NODE_TECH_AQ_MASONRY', name: 'Masonry', depth: 2, state: 3, turns: 2, cost: 137, enabled: true },
      { nodeType: -1558948215, nodeTypeName: 'NODE_TECH_AQ_SAILING', name: 'Sailing', depth: 1, state: 2, turns: 5, cost: 77, enabled: true },
      { nodeType: 510800721, nodeTypeName: 'NODE_TECH_AQ_AGRICULTURE', name: 'Agriculture', depth: 0, state: 5, turns: 1, cost: 0, enabled: false },
    ];
    const options = optionRows.map((row) => ({
      nodeType: row.nodeType,
      nodeTypeName: row.nodeTypeName,
      name: row.name,
      description: null,
      icon: null,
      treeType: -153498200,
      treeTypeName: 'TREE_TECHS_AQ',
      treeName: 'Technology',
      ageType: 'AGE_ANTIQUITY',
      depth: row.depth,
      state: row.state,
      progress: row.nodeType === -1255676052 ? 108 : 0,
      maxDepth: row.nodeType === -1255676052 ? 2 : 1,
      cost: { ok: true, value: row.cost },
      turns: { ok: true, value: row.turns },
      canEverUnlock: { ok: true, value: { isLocked: false } },
      chooseEnabled: row.enabled,
      targetEnabled: row.enabled,
      disabled: !row.enabled,
      chooseValidation: { ok: true, value: { Success: row.enabled } },
      targetValidation: { ok: true, value: { Success: row.enabled } },
      cli: row.enabled
        ? `game play choose-tech --player-id 0 --node ${row.nodeType} --send --reason '<why this technology was selected>'`
        : null,
      validateCli: `game play choose-tech --player-id 0 --node ${row.nodeType} --json`,
      targetCli: row.enabled
        ? `game play set-tech-target --player-id 0 --node ${row.nodeType} --send --reason '<why this technology target was selected>'`
        : null,
    }));
    const details = {
      kind: 'technology-choice-options',
      notificationId,
      localPlayerId: 0,
      source: 'GameInfo.ProgressionTrees + Game.ProgressionTrees + PlayerOperations.canStart',
      currentResearching: { ok: true, value: null },
      targetNode: { ok: true, value: null },
      techTrees: {
        ok: true,
        value: [{ treeType: -153498200, treeTypeName: 'TREE_TECHS_AQ', name: 'Technology', ageType: 'AGE_ANTIQUITY' }],
      },
      options,
      enabledOptions: options.filter((option) => option.chooseEnabled),
      disabledOptions: options.filter((option) => !option.chooseEnabled),
      notes: [
        'Static fixture mirrors the CLI/HUD contract emitted by the App UI source-backed technology choice materializer.',
      ],
    };
    const notification = {
      id: notificationId,
      type: -456,
      typeName: 'NOTIFICATION_CHOOSE_TECH',
      groupType: null,
      summary: 'Choose a Technology',
      message: 'Choose a new Technology to begin studying.',
      target: { owner: -1, id: -1, type: 0 },
      location: null,
      canUserDismiss: false,
      expired: false,
      dismissed: false,
      isEndTurnBlocking: true,
      decision: technologyDecision,
      details,
    };
    return {
      localPlayerId: 0,
      turn: { ok: true, value: 19 },
      turnDate: { ok: true, value: '3550 BCE' },
      hasSentTurnComplete: { ok: true, value: false },
      canEndTurn: { ok: true, value: false },
      blocker: { ok: true, value: -1255676052 },
      blockingNotificationId: { ok: true, value: notificationId },
      selectedUnitId: { ok: true, value: null },
      selectedCityId: { ok: true, value: null },
      firstReadyUnitId: { ok: true, value: null },
      notifications: [notification],
      decisions: [technologyDecision],
      hud: {
        nextDecision: {
          notificationId: notification.id,
          isEndTurnBlocking: true,
          typeName: notification.typeName,
          summary: notification.summary,
          message: notification.message,
          target: notification.target,
          location: notification.location,
          details: notification.details,
          ...technologyDecision,
        },
        decisionQueue: [
          {
            notificationId: notification.id,
            isEndTurnBlocking: true,
            typeName: notification.typeName,
            summary: notification.summary,
            message: notification.message,
            target: notification.target,
            location: notification.location,
            details: notification.details,
            ...technologyDecision,
          },
        ],
      },
      limits: { maxNotifications: 25, truncated: false },
    };
  }
  if (mode === 'culture-choice') {
    const cultureDecision = {
      category: 'culture-choice',
      operationFamily: 'player-operation',
      operationType: 'SET_CULTURE_TREE_NODE',
      argsShape: '{ ProgressionTreeNodeType }',
      cli: 'game play choose-culture',
      requiredInputs: [
        {
          name: 'ProgressionTreeNodeType',
          source: 'live culture chooser/tree node',
          required: true,
          note: 'Use the runtime node type hash from GameInfo/progression tree data, not the row index or notification id.',
        },
      ],
      commonActions: [
        {
          label: 'read culture options',
          cli: 'game play choose-culture --options --json',
          argsShape: 'enabled culture nodes with validation and ready send templates',
          when: 'before choosing a culture node',
        },
      ],
      confidence: 'live-proof',
      notes: ['Read options from the live culture chooser before sending; do not infer node ids from examples.'],
    };
    const notificationId = { owner: 0, id: 62, type: 20 };
    const optionRows = [
      { nodeType: -869902342, nodeTypeName: 'NODE_CIVIC_AQ_GREECE_EKKLESIA', name: 'Ekklesia', depth: 1, state: 2, turns: 4, cost: 105, enabled: true },
      { nodeType: -1404789184, nodeTypeName: 'NODE_CIVIC_AQ_MAIN_DISCIPLINE', name: 'Discipline', depth: 1, state: 2, turns: 3, cost: 80, enabled: true },
      { nodeType: 1643868894, nodeTypeName: 'NODE_CIVIC_AQ_MAIN_MYSTICISM', name: 'Mysticism', depth: 0, state: 5, turns: 1, cost: 0, enabled: false },
    ];
    const options = optionRows.map((row) => ({
      nodeType: row.nodeType,
      nodeTypeName: row.nodeTypeName,
      name: row.name,
      description: null,
      icon: null,
      treeType: row.nodeType === -869902342 ? -122334455 : -153498201,
      treeTypeName: row.nodeType === -869902342 ? 'TREE_CIVICS_AQ_GREECE' : 'TREE_CIVICS_AQ_MAIN',
      treeName: row.nodeType === -869902342 ? 'Greece' : 'Civics',
      ageType: 'AGE_ANTIQUITY',
      depth: row.depth,
      state: row.state,
      progress: row.nodeType === -869902342 ? 22 : 0,
      maxDepth: row.nodeType === -869902342 ? 2 : 1,
      cost: { ok: true, value: row.cost },
      turns: { ok: true, value: row.turns },
      canEverUnlock: { ok: true, value: { isLocked: false } },
      chooseEnabled: row.enabled,
      targetEnabled: row.enabled,
      disabled: !row.enabled,
      chooseValidation: { ok: true, value: { Success: row.enabled } },
      targetValidation: { ok: true, value: { Success: row.enabled } },
      cli: row.enabled
        ? `game play choose-culture --player-id 0 --node ${row.nodeType} --send --closeout --reason '<why this culture node was selected>'`
        : null,
      validateCli: `game play choose-culture --player-id 0 --node ${row.nodeType} --json`,
      targetCli: row.enabled
        ? `game play set-culture-target --player-id 0 --node ${row.nodeType} --send --reason '<why this culture target was selected>'`
        : null,
    }));
    const details = {
      kind: 'culture-choice-options',
      notificationId,
      localPlayerId: 0,
      source: 'Players.Culture.getAllAvailableNodeTypes + Game.ProgressionTrees + PlayerOperations.canStart',
      currentResearching: { ok: true, value: null },
      targetNode: { ok: true, value: null },
      availableNodeTypes: { ok: true, value: optionRows.map((row) => row.nodeType) },
      options,
      enabledOptions: options.filter((option) => option.chooseEnabled),
      disabledOptions: options.filter((option) => !option.chooseEnabled),
      notes: [
        'Static fixture mirrors the CLI/HUD contract emitted by the App UI source-backed culture choice materializer.',
      ],
    };
    const notification = {
      id: notificationId,
      type: -789,
      typeName: 'NOTIFICATION_CHOOSE_CULTURE_NODE',
      groupType: null,
      summary: 'Choose a Civic',
      message: 'Choose a new Civic to begin studying.',
      target: { owner: -1, id: -1, type: 0 },
      location: null,
      canUserDismiss: false,
      expired: false,
      dismissed: false,
      isEndTurnBlocking: true,
      decision: cultureDecision,
      details,
    };
    return {
      localPlayerId: 0,
      turn: { ok: true, value: 19 },
      turnDate: { ok: true, value: '3550 BCE' },
      hasSentTurnComplete: { ok: true, value: false },
      canEndTurn: { ok: true, value: false },
      blocker: { ok: true, value: -869902342 },
      blockingNotificationId: { ok: true, value: notificationId },
      selectedUnitId: { ok: true, value: null },
      selectedCityId: { ok: true, value: null },
      firstReadyUnitId: { ok: true, value: null },
      notifications: [notification],
      decisions: [cultureDecision],
      hud: {
        nextDecision: {
          notificationId: notification.id,
          isEndTurnBlocking: true,
          typeName: notification.typeName,
          summary: notification.summary,
          message: notification.message,
          target: notification.target,
          location: notification.location,
          details: notification.details,
          ...cultureDecision,
        },
        decisionQueue: [
          {
            notificationId: notification.id,
            isEndTurnBlocking: true,
            typeName: notification.typeName,
            summary: notification.summary,
            message: notification.message,
            target: notification.target,
            location: notification.location,
            details: notification.details,
            ...cultureDecision,
          },
        ],
      },
      limits: { maxNotifications: 25, truncated: false },
    };
  }
  if (mode === 'celebration-choice') {
    const celebrationDecision = {
      category: 'celebration-choice',
      operationFamily: 'player-operation',
      operationType: 'CHOOSE_GOLDEN_AGE',
      argsShape: '{ GoldenAgeType }',
      cli: 'game play choose-celebration',
      requiredInputs: [
        {
          name: 'GoldenAgeType',
          source: 'live celebration chooser option',
          required: true,
          note: 'Use the GoldenAgeType hash from choose-celebration --options, not old examples or visible row position.',
        },
      ],
      commonActions: [
        {
          label: 'read celebration options',
          cli: 'game play choose-celebration --options --json',
          argsShape: 'enabled celebration choices with validation and ready send templates',
          when: 'before choosing a celebration',
        },
      ],
      confidence: 'official-ui',
      notes: ['Read options from the live celebration chooser before sending; this blocker is not dismissible.'],
    };
    const notificationId = { owner: 0, id: 110, type: 20 };
    const optionRows = [
      {
        goldenAgeType: -340825966,
        goldenAgeTypeName: 'GOLDEN_AGE_CLASSICAL_REPUBLIC_1',
        name: 'Cultural Celebration',
        description: '+20% Culture for 10 turns.',
      },
      {
        goldenAgeType: 1923496232,
        goldenAgeTypeName: 'GOLDEN_AGE_CLASSICAL_REPUBLIC_2',
        name: 'Wonder Production Celebration',
        description: '+15% Production toward Wonders for 10 turns.',
      },
    ];
    const options = optionRows.map((row) => ({
      goldenAgeType: row.goldenAgeType,
      goldenAgeTypeName: row.goldenAgeTypeName,
      sourceChoice: row.goldenAgeTypeName,
      name: row.name,
      description: row.description,
      duration: 10,
      currentGovernmentType: 0,
      args: { GoldenAgeType: row.goldenAgeType },
      enabled: true,
      disabled: false,
      validation: { ok: true, value: { Success: true } },
      cli: `game play choose-celebration --player-id 0 --golden-age-type ${row.goldenAgeType} --send --reason '<why this celebration was selected>'`,
      validateCli: `game play choose-celebration --player-id 0 --golden-age-type ${row.goldenAgeType} --json`,
    }));
    const details = {
      kind: 'celebration-choice-options',
      notificationId,
      localPlayerId: 0,
      source: 'Players.Culture.getGoldenAgeChoices + GameInfo.GoldenAges + PlayerOperations.canStart',
      currentGovernmentType: { ok: true, value: 0 },
      goldenAgeDuration: { ok: true, value: 10 },
      choices: { ok: true, value: optionRows.map((row) => row.goldenAgeTypeName) },
      options,
      enabledOptions: options,
      disabledOptions: [],
      notes: [
        'Static fixture mirrors the CLI/HUD contract emitted by the App UI source-backed celebration choice materializer.',
      ],
    };
    const notification = {
      id: notificationId,
      type: -706533092,
      typeName: 'NOTIFICATION_CHOOSE_GOLDEN_AGE',
      groupType: null,
      summary: 'Your people want to Celebrate this glorious time.',
      message: 'Choose Celebration',
      target: { owner: -1, id: -1, type: 0 },
      location: null,
      canUserDismiss: false,
      expired: false,
      dismissed: false,
      isEndTurnBlocking: true,
      decision: celebrationDecision,
      details,
    };
    return {
      localPlayerId: 0,
      turn: { ok: true, value: 29 },
      turnDate: { ok: true, value: '3300 BCE' },
      hasSentTurnComplete: { ok: true, value: false },
      canEndTurn: { ok: true, value: false },
      blocker: { ok: true, value: 1783715360 },
      blockingNotificationId: { ok: true, value: notificationId },
      selectedUnitId: { ok: true, value: null },
      selectedCityId: { ok: true, value: null },
      firstReadyUnitId: { ok: true, value: null },
      notifications: [notification],
      decisions: [celebrationDecision],
      hud: {
        nextDecision: {
          notificationId: notification.id,
          isEndTurnBlocking: true,
          typeName: notification.typeName,
          summary: notification.summary,
          message: notification.message,
          target: notification.target,
          location: notification.location,
          details: notification.details,
          ...celebrationDecision,
        },
        decisionQueue: [
          {
            notificationId: notification.id,
            isEndTurnBlocking: true,
            typeName: notification.typeName,
            summary: notification.summary,
            message: notification.message,
            target: notification.target,
            location: notification.location,
            details: notification.details,
            ...celebrationDecision,
          },
        ],
      },
      limits: { maxNotifications: 25, truncated: false },
    };
  }
  if (mode === 'government-choice') {
    const action = -1326475004;
    const governmentDecision = {
      category: 'government-choice',
      operationFamily: 'player-operation',
      operationType: 'CHANGE_GOVERNMENT',
      argsShape: '{ GovernmentType, Action: Activate }',
      cli: 'game play choose-government',
      requiredInputs: [
        {
          name: 'GovernmentType',
          source: 'live government picker option',
          required: true,
          note: 'Use the government index from choose-government --options, not the visible row position.',
        },
      ],
      commonActions: [
        {
          label: 'read government options',
          cli: 'game play choose-government --options --json',
          argsShape: 'enabled starting governments with validation and ready send templates',
          when: 'before choosing a government',
        },
      ],
      confidence: 'official-ui',
      notes: ['Read options from the live government picker before sending; the option surface includes celebration effects for context.'],
    };
    const notificationId = { owner: 0, id: 40, type: 20 };
    const optionRows = [
      { governmentType: 0, governmentTypeName: 'GOVERNMENT_CLASSICAL_REPUBLIC', name: 'Classical Republic', celebration: 'Cultural Celebration' },
      { governmentType: 1, governmentTypeName: 'GOVERNMENT_DESPOTISM', name: 'Despotism', celebration: 'Military Celebration' },
      { governmentType: 2, governmentTypeName: 'GOVERNMENT_OLIGARCHY', name: 'Oligarchy', celebration: 'Scientific Celebration' },
    ];
    const options = optionRows.map((row) => ({
      governmentType: row.governmentType,
      governmentTypeName: row.governmentTypeName,
      name: row.name,
      description: `${row.name} description`,
      startingGovernmentType: row.governmentType,
      action,
      args: { GovernmentType: row.governmentType, Action: action },
      celebrationOptions: [
        {
          goldenAgeType: row.governmentType + 100,
          typeName: `GOLDEN_AGE_${row.governmentType}`,
          name: row.celebration,
          description: `${row.celebration} description`,
          duration: 10,
        },
      ],
      enabled: true,
      disabled: false,
      validation: { ok: true, value: { Success: true } },
      cli: `game play choose-government --player-id 0 --government-type ${row.governmentType} --action ${action} --send --reason '<why this government was selected>'`,
      validateCli: `game play choose-government --player-id 0 --government-type ${row.governmentType} --action ${action} --json`,
    }));
    const details = {
      kind: 'government-choice-options',
      notificationId,
      localPlayerId: 0,
      source: 'GameInfo.StartingGovernments + GameInfo.Governments + PlayerOperations.canStart',
      currentGovernmentType: { ok: true, value: null },
      startingGovernments: { ok: true, value: optionRows.map((row) => ({ GovernmentType: row.governmentType })) },
      action,
      goldenAgeDuration: { ok: true, value: 10 },
      options,
      enabledOptions: options,
      disabledOptions: [],
      notes: [
        'Static fixture mirrors the CLI/HUD contract emitted by the App UI source-backed government choice materializer.',
      ],
    };
    const notification = {
      id: notificationId,
      type: 111,
      typeName: 'NOTIFICATION_CHOOSE_GOVERNMENT',
      groupType: null,
      summary: 'Choose a Government',
      message: 'Choose a government.',
      target: { owner: -1, id: -1, type: 0 },
      location: null,
      canUserDismiss: false,
      expired: false,
      dismissed: false,
      isEndTurnBlocking: true,
      decision: governmentDecision,
      details,
    };
    return {
      localPlayerId: 0,
      turn: { ok: true, value: 10 },
      turnDate: { ok: true, value: '3775 BCE' },
      hasSentTurnComplete: { ok: true, value: false },
      canEndTurn: { ok: true, value: false },
      blocker: { ok: true, value: 0 },
      blockingNotificationId: { ok: true, value: notificationId },
      selectedUnitId: { ok: true, value: null },
      selectedCityId: { ok: true, value: null },
      firstReadyUnitId: { ok: true, value: null },
      notifications: [notification],
      decisions: [governmentDecision],
      hud: {
        nextDecision: {
          notificationId: notification.id,
          isEndTurnBlocking: true,
          typeName: notification.typeName,
          summary: notification.summary,
          message: notification.message,
          target: notification.target,
          location: notification.location,
          details: notification.details,
          ...governmentDecision,
        },
        decisionQueue: [
          {
            notificationId: notification.id,
            isEndTurnBlocking: true,
            typeName: notification.typeName,
            summary: notification.summary,
            message: notification.message,
            target: notification.target,
            location: notification.location,
            details: notification.details,
            ...governmentDecision,
          },
        ],
      },
      limits: { maxNotifications: 25, truncated: false },
    };
  }
  if (mode === 'tradition-review') {
    const traditionDecision = {
      category: 'tradition-review',
      operationFamily: 'player-operation',
      operationType: 'CHANGE_TRADITION',
      argsShape: '{ TraditionType, Action } then CONSIDER_ASSIGN_TRADITIONS {}',
      cli: 'game play traditions',
      requiredInputs: [
        {
          name: 'TraditionType',
          source: 'live tradition chooser',
          required: true,
          note: 'Pick the tradition enum that is being activated or deactivated.',
        },
        {
          name: 'Action',
          source: 'live tradition action',
          required: true,
          note: 'Use the activate/deactivate action enum from the tradition UI.',
        },
      ],
      commonActions: [
        {
          label: 'read tradition options',
          cli: 'game play traditions --compact --json',
          argsShape: 'active and available traditions with action templates',
          when: 'before choosing a tradition activation or deactivation',
        },
      ],
      confidence: 'live-proof',
      notes: ['Full slots may need deactivate, activate, then closeout; read the live tradition packet first.'],
    };
    const notificationId = { owner: 0, id: 92, type: 20 };
    const notification = {
      id: notificationId,
      type: 12345,
      typeName: 'NOTIFICATION_CONSIDER_TRADITIONS',
      groupType: null,
      summary: 'Review your Traditions',
      message: 'A new Tradition slot or Tradition option is available.',
      target: { owner: -1, id: -1, type: 0 },
      location: null,
      canUserDismiss: false,
      expired: false,
      dismissed: false,
      isEndTurnBlocking: true,
      decision: traditionDecision,
    };
    return {
      localPlayerId: 0,
      turn: { ok: true, value: 79 },
      turnDate: { ok: true, value: '2050 BCE' },
      hasSentTurnComplete: { ok: true, value: false },
      canEndTurn: { ok: true, value: false },
      blocker: { ok: true, value: 23669119 },
      blockingNotificationId: { ok: true, value: notificationId },
      selectedUnitId: { ok: true, value: null },
      selectedCityId: { ok: true, value: null },
      firstReadyUnitId: { ok: true, value: null },
      notifications: [notification],
      decisions: [traditionDecision],
      hud: {
        nextDecision: {
          notificationId: notification.id,
          isEndTurnBlocking: true,
          typeName: notification.typeName,
          summary: notification.summary,
          message: notification.message,
          target: notification.target,
          location: notification.location,
          ...traditionDecision,
        },
        decisionQueue: [
          {
            notificationId: notification.id,
            isEndTurnBlocking: true,
            typeName: notification.typeName,
            summary: notification.summary,
            message: notification.message,
            target: notification.target,
            location: notification.location,
            ...traditionDecision,
          },
        ],
      },
      limits: { maxNotifications: 25, truncated: false },
    };
  }
  if (mode === 'ready-unit') {
    const unitId = { owner: 0, id: 458752, type: 26 };
    return {
      localPlayerId: 0,
      turn: { ok: true, value: 80 },
      turnDate: { ok: true, value: '2025 BCE' },
      hasSentTurnComplete: { ok: true, value: false },
      canEndTurn: { ok: true, value: false },
      blocker: { ok: true, value: 0 },
      blockingNotificationId: { ok: true, value: null },
      selectedUnitId: { ok: true, value: null },
      selectedCityId: { ok: true, value: null },
      firstReadyUnitId: { ok: true, value: unitId },
      notifications: [],
      decisions: [],
      hud: {
        nextDecision: null,
        decisionQueue: [],
      },
      limits: { maxNotifications: 25, truncated: false },
    };
  }
  if (mode === 'stale-informational') {
    const informationalDecision = {
      category: 'informational-notification',
      operationFamily: 'app-ui-action',
      operationType: 'Game.Notifications.dismiss',
      argsShape: '{ notificationId }',
      cli: 'game play dismiss-notification',
      requiredInputs: [
        { name: 'Notification', source: 'notification ComponentID', required: true },
      ],
      commonActions: [
        {
          label: 'dismiss reviewed notification',
          cli: "game play dismiss-notification --target '<notification-id>' --send --reason '<why this was reviewed>'",
          operationFamily: 'app-ui-action',
          operationType: 'Game.Notifications.dismiss',
          argsShape: '{ notificationId }',
          when: 'after reviewing the report',
        },
      ],
      confidence: 'official-ui',
      notes: ['Default-handler report notification; review before closeout.'],
    };
    const informationalNotification = {
      id: { owner: 0, id: 89, type: 20 },
      type: -2086317463,
      typeName: 'NOTIFICATION_VOLCANO_ACTIVE',
      groupType: null,
      summary: 'Hasandagi has become active. Beware -- it can now erupt at any time!',
      message: 'Volcano Now Active',
      target: { owner: -1, id: -1, type: 0 },
      location: { x: 6, y: 27 },
      canUserDismiss: true,
      expired: false,
      dismissed: false,
      isEndTurnBlocking: true,
      decision: informationalDecision,
    };
    return {
      localPlayerId: 0,
      turn: { ok: true, value: 80 },
      turnDate: { ok: true, value: '2025 BCE' },
      hasSentTurnComplete: { ok: true, value: false },
      canEndTurn: { ok: true, value: false },
      blocker: { ok: true, value: 0 },
      blockingNotificationId: { ok: true, value: informationalNotification.id },
      selectedUnitId: { ok: true, value: null },
      selectedCityId: { ok: true, value: null },
      firstReadyUnitId: { ok: true, value: null },
      notifications: [informationalNotification],
      decisions: [informationalDecision],
      hud: {
        nextDecision: {
          notificationId: informationalNotification.id,
          isEndTurnBlocking: true,
          typeName: informationalNotification.typeName,
          summary: informationalNotification.summary,
          message: informationalNotification.message,
          target: informationalNotification.target,
          location: informationalNotification.location,
          ...informationalDecision,
        },
        decisionQueue: [
          {
            notificationId: informationalNotification.id,
            isEndTurnBlocking: true,
            typeName: informationalNotification.typeName,
            summary: informationalNotification.summary,
            message: informationalNotification.message,
            target: informationalNotification.target,
            location: informationalNotification.location,
            ...informationalDecision,
          },
        ],
      },
      limits: { maxNotifications: 25, truncated: false },
    };
  }
  if (mode === 'unit-lost-report') {
    const informationalDecision = {
      category: 'informational-notification',
      operationFamily: 'app-ui-action',
      operationType: 'Game.Notifications.dismiss',
      argsShape: '{ notificationId }',
      cli: 'game play dismiss-notification',
      requiredInputs: [
        { name: 'Notification', source: 'notification ComponentID', required: true },
      ],
      commonActions: [
        {
          label: 'dismiss reviewed notification',
          cli: "game play dismiss-notification --target '<notification-id>' --send --reason '<why this was reviewed>'",
          operationFamily: 'app-ui-action',
          operationType: 'Game.Notifications.dismiss',
          argsShape: '{ notificationId }',
          when: 'after reviewing the report',
        },
      ],
      confidence: 'official-ui',
      notes: ['Default-handler unit-loss report; review before closeout.'],
    };
    const informationalNotification = {
      id: { owner: 0, id: 34, type: 20 },
      type: -2086317464,
      typeName: 'NOTIFICATION_UNIT_LOST',
      groupType: null,
      summary: 'While defending, your Scout was destroyed by a Warrior from Samarkand (44 damage)!',
      message: 'Unit Lost',
      target: { owner: -1, id: -1, type: 0 },
      location: { x: 5, y: 18 },
      canUserDismiss: true,
      expired: false,
      dismissed: false,
      isEndTurnBlocking: true,
      decision: informationalDecision,
    };
    return {
      localPlayerId: 0,
      turn: { ok: true, value: 19 },
      turnDate: { ok: true, value: '3550 BCE' },
      hasSentTurnComplete: { ok: true, value: false },
      canEndTurn: { ok: true, value: false },
      blocker: { ok: true, value: 0 },
      blockingNotificationId: { ok: true, value: informationalNotification.id },
      selectedUnitId: { ok: true, value: null },
      selectedCityId: { ok: true, value: null },
      firstReadyUnitId: { ok: true, value: { owner: 0, id: 458754, type: 26 } },
      notifications: [informationalNotification],
      decisions: [informationalDecision],
      hud: {
        nextDecision: {
          notificationId: informationalNotification.id,
          isEndTurnBlocking: true,
          typeName: informationalNotification.typeName,
          summary: informationalNotification.summary,
          message: informationalNotification.message,
          target: informationalNotification.target,
          location: informationalNotification.location,
          ...informationalDecision,
        },
        decisionQueue: [
          {
            notificationId: informationalNotification.id,
            isEndTurnBlocking: true,
            typeName: informationalNotification.typeName,
            summary: informationalNotification.summary,
            message: informationalNotification.message,
            target: informationalNotification.target,
            location: informationalNotification.location,
            ...informationalDecision,
          },
        ],
      },
      limits: { maxNotifications: 25, truncated: false },
    };
  }
  if (mode === 'legacy-completed') {
    const informationalDecision = {
      category: 'informational-notification',
      operationFamily: 'app-ui-action',
      operationType: 'Game.Notifications.dismiss',
      argsShape: '{ notificationId }',
      cli: 'game play dismiss-notification',
      requiredInputs: [
        { name: 'Notification', source: 'notification ComponentID', required: true },
      ],
      commonActions: [
        {
          label: 'dismiss reviewed legacy completion report',
          cli: "game play dismiss-notification --target '<notification-id>' --send --reason '<why this legacy completion report was reviewed>'",
          operationFamily: 'app-ui-action',
          operationType: 'Game.Notifications.dismiss',
          argsShape: '{ notificationId }',
          when: 'after reviewing the completed legacy/triumph report for score context',
        },
        {
          label: 'read current legacy progress',
          cli: 'game play progress-dashboard --compact --json',
          operationFamily: 'read-only',
          operationType: 'progress-dashboard',
          argsShape: 'legacy path scores and age progress',
          when: 'when the report should be compared with local-player progress before dismissal',
        },
      ],
      confidence: 'official-ui',
      notes: ['Runtime legacy completion report; review score context before closeout.'],
    };
    const legacyNotification = {
      id: { owner: 0, id: 77, type: 20 },
      type: -667238339,
      typeName: 'NOTIFICATION_LEGACY_COMPLETED',
      groupType: null,
      summary: 'An unmet Player has completed the Triumph "Yokol-kab".',
      message: 'Triumph Completed',
      target: { owner: -1, id: -1, type: 0 },
      location: { x: -9999, y: -9999 },
      canUserDismiss: true,
      expired: false,
      dismissed: false,
      isEndTurnBlocking: false,
      decision: informationalDecision,
    };
    return {
      localPlayerId: 0,
      turn: { ok: true, value: 1 },
      turnDate: { ok: true, value: '4000 BCE' },
      hasSentTurnComplete: { ok: true, value: false },
      canEndTurn: { ok: true, value: false },
      blocker: { ok: true, value: -513644209 },
      blockingNotificationId: { ok: true, value: null },
      selectedUnitId: { ok: true, value: null },
      selectedCityId: { ok: true, value: null },
      firstReadyUnitId: { ok: true, value: null },
      notifications: [legacyNotification],
      decisions: [informationalDecision],
      hud: {
        nextDecision: null,
        decisionQueue: [
          {
            notificationId: legacyNotification.id,
            isEndTurnBlocking: false,
            typeName: legacyNotification.typeName,
            summary: legacyNotification.summary,
            message: legacyNotification.message,
            target: legacyNotification.target,
            location: legacyNotification.location,
            ...informationalDecision,
          },
        ],
      },
      limits: { maxNotifications: 25, truncated: false },
    };
  }
  if (mode === 'diplomatic-report') {
    const informationalDecision = {
      category: 'informational-notification',
      operationFamily: 'app-ui-action',
      operationType: 'Game.Notifications.dismiss',
      argsShape: '{ notificationId }',
      cli: 'game play dismiss-notification',
      requiredInputs: [
        { name: 'Notification', source: 'notification ComponentID', required: true },
      ],
      commonActions: [
        {
          label: 'dismiss reviewed diplomatic relationship notice',
          cli: "game play dismiss-notification --target '<notification-id>' --send --reason '<why this relationship/agenda report was reviewed>'",
          operationFamily: 'app-ui-action',
          operationType: 'Game.Notifications.dismiss',
          argsShape: '{ notificationId }',
          when: 'after reviewing the relationship/agenda context and confirming the notification target is not a valid diplomatic action id',
        },
      ],
      confidence: 'official-ui',
      notes: ['Agenda and relationship reports can arrive as NOTIFICATION_DIPLOMATIC_ACTION with an invalid target; do not send RESPOND_DIPLOMATIC_ACTION without a valid action id.'],
    };
    const notification = {
      id: { owner: 0, id: 644, type: 20 },
      type: 96575930,
      typeName: 'NOTIFICATION_DIPLOMATIC_ACTION',
      groupType: -1225125244,
      summary: 'The Agenda of Genghis Khan has changed your Relationship.',
      message: 'The Agenda of Genghis Khan has changed your Relationship.',
      target: { owner: -1, id: -1, type: 0 },
      location: { x: 19, y: 26 },
      canUserDismiss: true,
      expired: false,
      dismissed: false,
      isEndTurnBlocking: true,
      decision: informationalDecision,
    };
    return {
      localPlayerId: 0,
      turn: { ok: true, value: 133 },
      turnDate: { ok: true, value: '960 BCE' },
      hasSentTurnComplete: { ok: true, value: false },
      canEndTurn: { ok: true, value: false },
      blocker: { ok: true, value: 0 },
      blockingNotificationId: { ok: true, value: notification.id },
      selectedUnitId: { ok: true, value: null },
      selectedCityId: { ok: true, value: null },
      firstReadyUnitId: { ok: true, value: { owner: 0, id: 1572876, type: 26 } },
      notifications: [notification],
      decisions: [informationalDecision],
      hud: {
        nextDecision: {
          notificationId: notification.id,
          isEndTurnBlocking: true,
          typeName: notification.typeName,
          summary: notification.summary,
          message: notification.message,
          target: notification.target,
          location: notification.location,
          player: null,
          ...informationalDecision,
        },
        decisionQueue: [
          {
            notificationId: notification.id,
            isEndTurnBlocking: true,
            typeName: notification.typeName,
            summary: notification.summary,
            message: notification.message,
            target: notification.target,
            location: notification.location,
            player: null,
            ...informationalDecision,
          },
        ],
      },
      limits: { maxNotifications: 25, truncated: false },
    };
  }
  if (mode === 'diplomatic-action-report') {
    const notificationId = { owner: 0, id: 118, type: 20 };
    const details = {
      kind: 'diplomatic-action-report',
      classification: 'diplomatic-action-report-no-enabled-response-options',
      actionId: 34,
      notificationId,
      eventData: {
        ok: true,
        value: {
          actionTypeName: 'DIPLOMACY_ACTION_LAND_CLAIM',
          initialPlayer: 2,
          targetPlayer: -1,
          canOppose: true,
          gameTurnStart: 36,
          gameTurnEnd: 36,
          responseType: 920806707,
        },
      },
      responseData: { ok: true, value: { responseList: [] } },
      responseOptionCount: 0,
      enabledResponseOptionCount: 0,
      options: [],
      enabledOptions: [],
      disabledOptions: [],
      notes: [
        'NOTIFICATION_DIPLOMATIC_ACTION uses the official InvestigateDiplomaticAction handler. Its target can be a real diplomatic event id, but that alone is not proof of a response-required operation.',
        'When getResponseDataForUI(actionId).responseList is empty or no options validate, treat this as a reviewed diplomatic action report closeout, not RESPOND_DIPLOMATIC_ACTION.',
      ],
    };
    const informationalDecision = {
      category: 'informational-notification',
      operationFamily: 'app-ui-action',
      operationType: 'Game.Notifications.dismiss',
      argsShape: '{ notificationId }',
      cli: 'game play dismiss-notification',
      requiredInputs: [
        { name: 'Notification', source: 'notification ComponentID', required: true },
      ],
      commonActions: [
        {
          label: 'dismiss reviewed diplomatic action report',
          cli: "game play dismiss-notification --target '<notification-id>' --send --reason '<why this diplomatic report was reviewed>'",
          operationFamily: 'app-ui-action',
          operationType: 'Game.Notifications.dismiss',
          argsShape: '{ notificationId }',
          when: 'after reviewing the event data/location and confirming getResponseDataForUI exposes no enabled response option',
        },
      ],
      confidence: 'official-ui',
      notes: ['NOTIFICATION_DIPLOMATIC_ACTION can point at a real diplomatic event id, but empty/no-enabled getResponseDataForUI options make it a reviewed report closeout rather than RESPOND_DIPLOMATIC_ACTION.'],
    };
    const notification = {
      id: notificationId,
      type: 96575930,
      typeName: 'NOTIFICATION_DIPLOMATIC_ACTION',
      groupType: -1225125244,
      player: null,
      summary: 'Another Civilization settled a new Town nearby.',
      message: 'New Settlement Nearby',
      target: { owner: 2, id: 34, type: 34 },
      location: { x: 3, y: 46 },
      canUserDismiss: true,
      expired: false,
      dismissed: false,
      isEndTurnBlocking: true,
      decision: informationalDecision,
      details,
    };
    return {
      localPlayerId: 0,
      turn: { ok: true, value: 37 },
      turnDate: { ok: true, value: '3100 BCE' },
      hasSentTurnComplete: { ok: true, value: false },
      canEndTurn: { ok: true, value: false },
      blocker: { ok: true, value: 0 },
      blockingNotificationId: { ok: true, value: notification.id },
      selectedUnitId: { ok: true, value: null },
      selectedCityId: { ok: true, value: null },
      firstReadyUnitId: { ok: true, value: { owner: 0, id: 327682, type: 26 } },
      notifications: [notification],
      decisions: [informationalDecision],
      hud: {
        nextDecision: {
          notificationId: notification.id,
          isEndTurnBlocking: true,
          typeName: notification.typeName,
          summary: notification.summary,
          message: notification.message,
          target: notification.target,
          location: notification.location,
          player: notification.player,
          details,
          ...informationalDecision,
        },
        decisionQueue: [
          {
            notificationId: notification.id,
            isEndTurnBlocking: true,
            typeName: notification.typeName,
            summary: notification.summary,
            message: notification.message,
            target: notification.target,
            location: notification.location,
            player: notification.player,
            details,
            ...informationalDecision,
          },
        ],
      },
      limits: { maxNotifications: 25, truncated: false },
    };
  }
  if (mode === 'stale-unit-command' || mode === 'stale-unit-command-disabled' || mode === 'stale-unit-command-pending') {
    const hasEnabledCloseout = mode === 'stale-unit-command';
    const hasSentTurnComplete = mode === 'stale-unit-command-pending';
    const commandUnitsDecision = {
      category: 'unit-command',
      operationFamily: 'unit-operation',
      operationType: 'SKIP_TURN',
      argsShape: 'selected/ready unit id plus operation-specific args',
      cli: 'game play operation --family unit',
      requiredInputs: [
        { name: 'Unit', source: 'selectedUnitId or firstReadyUnitId', required: true },
        { name: 'Target plot', source: 'map coordinates', required: false },
      ],
      commonActions: [
        {
          label: 'read ready-unit view',
          cli: 'game play ready-unit --json',
          argsShape: 'selected/first ready unit, legal operations, nearby occupied plots',
          when: 'before choosing a unit operation',
        },
      ],
      confidence: 'heuristic',
      notes: ['Read the selected or first ready unit before choosing skip, automate, move, or promote.'],
    };
    const commandUnitsNotificationId = { owner: 0, id: 88, type: 20 };
    const closeoutUnitIds = hasEnabledCloseout
      ? [{ owner: 0, id: 196609, type: 26 }]
      : [
          { owner: 0, id: 131072, type: 26 },
          { owner: 0, id: 196609, type: 26 },
          { owner: 0, id: 262146, type: 26 },
        ];
    const closeoutCandidates = closeoutUnitIds.map((unitId, index) => {
      const enabled = hasEnabledCloseout;
      return {
        unitId,
        unit: {
          ok: true,
          value: {
            id: unitId,
            owner: 0,
            type: index === 1 ? 111 : 77,
            typeName: index === 1 ? 'UNIT_HOPLITE' : 'UNIT_SCOUT',
            name: index === 1 ? 'Hoplite' : 'Scout',
            location: index === 0 ? { x: 18, y: 30 } : index === 1 ? { x: 21, y: 26 } : { x: 16, y: 25 },
            movementMovesRemaining: 0,
            movementTurnsRemaining: 0,
            attacksRemaining: index === 1 ? 1 : 0,
            activity: index === 1 ? 'UNIT_ACTIVITY_FORTIFIED' : 'UNIT_ACTIVITY_AWAKE',
          },
        },
        operationFamily: 'unit-operation',
        operationType: 'SKIP_TURN',
        argsShape: '{}',
        enabled,
        validation: enabled
          ? { ok: true, value: { Success: true } }
          : { ok: true, value: { Success: false, FailureReasons: ['no movement remaining'] } },
        cli: enabled
          ? `game play operation --family unit --type SKIP_TURN --unit-id '${JSON.stringify(unitId)}' --send --reason '<why this unit has no better operation this turn>'`
          : null,
      };
    });
    const enabledCloseoutCandidates = closeoutCandidates.filter((candidate) => candidate.enabled);
    const commandUnitsDetails = {
      kind: 'unit-command-reconciliation',
      classification: hasEnabledCloseout ? 'unit-command-closeout-candidates' : 'unit-command-stale-expired',
      notificationId: commandUnitsNotificationId,
      blocker: { ok: true, value: 0 },
      hasSentTurnComplete: { ok: true, value: hasSentTurnComplete },
      selectedUnitId: { ok: true, value: null },
      firstReadyUnitId: { ok: true, value: null },
      unitScan: { ok: true, value: closeoutUnitIds },
      closeoutCandidates,
      enabledCloseoutCandidates,
      staleReadyPointerSuspected: hasEnabledCloseout,
      staleExpiredWithoutEnabledCloseout: !hasEnabledCloseout,
      repairCandidates: hasEnabledCloseout
        ? []
        : [
            hasSentTurnComplete
              ? {
                  kind: 'wait-for-turn-advance',
                  cli: 'game watch --count 3 --interval-ms 1000 --include-ready-unit --include-ready-city --jsonl',
                  proof: 'GameContext.hasSentTurnComplete is already true; wait/watch instead of repeating unit operations.',
                }
              : {
                  kind: 'send-turn-complete',
                  cli: "game play end-turn --send --reason '<stale COMMAND_UNITS has no selected/ready unit and no enabled validator-backed unit closeout>' --json",
                  proof: 'No selected/ready unit exists and every scanned unit closeout is disabled.',
                },
          ],
      notes: [
        'Static fixture mirrors the CLI/HUD contract emitted by the App UI source-backed COMMAND_UNITS reconciliation materializer.',
        'Use these candidates only as unit-command reconciliation; movement, attack, promotion, fortify, and automation require their own validators.',
      ],
    };
    const commandUnitsNotification = {
      id: commandUnitsNotificationId,
      type: -28491459,
      typeName: 'NOTIFICATION_COMMAND_UNITS',
      groupType: null,
      summary: 'Move a Unit or have it perform an operation.',
      message: 'Command Units',
      target: { owner: -1, id: -1, type: 0 },
      location: { x: -9999, y: -9999 },
      canUserDismiss: false,
      expired: true,
      dismissed: false,
      isEndTurnBlocking: true,
      decision: commandUnitsDecision,
      details: commandUnitsDetails,
    };
    return {
      localPlayerId: 0,
      turn: { ok: true, value: 80 },
      turnDate: { ok: true, value: '2025 BCE' },
      hasSentTurnComplete: { ok: true, value: hasSentTurnComplete },
      canEndTurn: { ok: true, value: false },
      blocker: { ok: true, value: 0 },
      blockingNotificationId: { ok: true, value: commandUnitsNotification.id },
      selectedUnitId: { ok: true, value: null },
      selectedCityId: { ok: true, value: null },
      firstReadyUnitId: { ok: true, value: null },
      notifications: [commandUnitsNotification],
      decisions: [commandUnitsDecision],
      hud: {
        nextDecision: {
          notificationId: commandUnitsNotification.id,
          isEndTurnBlocking: true,
          typeName: commandUnitsNotification.typeName,
          summary: commandUnitsNotification.summary,
          message: commandUnitsNotification.message,
          target: commandUnitsNotification.target,
          location: commandUnitsNotification.location,
          details: commandUnitsNotification.details,
          ...commandUnitsDecision,
        },
        decisionQueue: [
          {
            notificationId: commandUnitsNotification.id,
            isEndTurnBlocking: true,
            typeName: commandUnitsNotification.typeName,
            summary: commandUnitsNotification.summary,
            message: commandUnitsNotification.message,
            target: commandUnitsNotification.target,
            location: commandUnitsNotification.location,
            details: commandUnitsNotification.details,
            ...commandUnitsDecision,
          },
        ],
      },
      limits: { maxNotifications: 25, truncated: false },
    };
  }
  return {
    localPlayerId: 0,
    turn: { ok: true, value: 80 },
    turnDate: { ok: true, value: '2025 BCE' },
    hasSentTurnComplete: { ok: true, value: false },
    canEndTurn: { ok: true, value: false },
    blocker: { ok: true, value: -2026570723 },
    blockingNotificationId: { ok: true, value: { owner: 0, id: 42, type: 20 } },
    selectedUnitId: { ok: true, value: null },
    selectedCityId: { ok: true, value: { owner: 0, id: 131073, type: 1 } },
    firstReadyUnitId: { ok: true, value: null },
    notifications: [
      {
        id: { owner: 0, id: 42, type: 20 },
        type: -123,
        typeName: 'NOTIFICATION_CHOOSE_TOWN_PROJECT',
        groupType: null,
        summary: 'Choose Town Project',
        message: 'Choose a town focus project',
        target: { owner: 0, id: 131073, type: 1 },
        location: null,
        canUserDismiss: false,
        expired: false,
        dismissed: false,
        isEndTurnBlocking: true,
        decision: {
          category: 'town-focus',
          operationFamily: 'city-command',
          operationType: 'CHANGE_GROWTH_MODE',
          argsShape: '{ Type, ProjectType, City }',
          cli: 'game play set-town-focus',
          requiredInputs: [
            { name: 'City', source: 'notification target or selected city', required: true },
            { name: 'Type', source: 'live town focus option', required: true },
            { name: 'ProjectType', source: 'live town focus option', required: true },
          ],
          commonActions: [
            {
              label: 'set town focus and close review',
              cli: "game play set-town-focus --city-id '<city-id>' --growth-type <type> --project-type <project-type> --send --closeout --reason '<why this focus was selected>'",
              operationFamily: 'sequence',
              operationType: 'CHANGE_GROWTH_MODE then CONSIDER_TOWN_PROJECT',
              argsShape: '{ Type, ProjectType, City } then {}',
              when: 'when the selected focus should be applied and the blocker closed as one caller workflow',
            },
            {
              label: 'set town focus',
              cli: "game play set-town-focus --city-id '<city-id>' --growth-type <type> --project-type <project-type>",
              operationFamily: 'city-command',
              operationType: 'CHANGE_GROWTH_MODE',
              argsShape: '{ Type, ProjectType, City }',
              when: 'after selecting the focus from live options',
            },
          ],
          confidence: 'live-proof',
          notes: ['Town focus is not city-operation BUILD; use --closeout when one caller action should apply the focus and clear the review surface.'],
        },
      },
    ],
    decisions: [
      {
        category: 'town-focus',
        operationFamily: 'city-command',
        operationType: 'CHANGE_GROWTH_MODE',
        argsShape: '{ Type, ProjectType, City }',
        cli: 'game play set-town-focus',
        requiredInputs: [
          { name: 'City', source: 'notification target or selected city', required: true },
          { name: 'Type', source: 'live town focus option', required: true },
          { name: 'ProjectType', source: 'live town focus option', required: true },
        ],
        commonActions: [
          {
            label: 'set town focus and close review',
            cli: "game play set-town-focus --city-id '<city-id>' --growth-type <type> --project-type <project-type> --send --closeout --reason '<why this focus was selected>'",
            operationFamily: 'sequence',
            operationType: 'CHANGE_GROWTH_MODE then CONSIDER_TOWN_PROJECT',
            argsShape: '{ Type, ProjectType, City } then {}',
            when: 'when the selected focus should be applied and the blocker closed as one caller workflow',
          },
          {
            label: 'set town focus',
            cli: "game play set-town-focus --city-id '<city-id>' --growth-type <type> --project-type <project-type>",
            operationFamily: 'city-command',
            operationType: 'CHANGE_GROWTH_MODE',
            argsShape: '{ Type, ProjectType, City }',
            when: 'after selecting the focus from live options',
          },
        ],
        confidence: 'live-proof',
        notes: ['Town focus is not city-operation BUILD; use --closeout when one caller action should apply the focus and clear the review surface.'],
      },
    ],
    hud: {
      nextDecision: {
        notificationId: { owner: 0, id: 42, type: 20 },
        isEndTurnBlocking: true,
        typeName: 'NOTIFICATION_CHOOSE_TOWN_PROJECT',
        summary: 'Choose Town Project',
        message: 'Choose a town focus project',
        target: { owner: 0, id: 131073, type: 1 },
        location: null,
        category: 'town-focus',
        operationFamily: 'city-command',
        operationType: 'CHANGE_GROWTH_MODE',
        argsShape: '{ Type, ProjectType, City }',
        cli: 'game play set-town-focus',
        requiredInputs: [
          { name: 'City', source: 'notification target or selected city', required: true },
          { name: 'Type', source: 'live town focus option', required: true },
          { name: 'ProjectType', source: 'live town focus option', required: true },
        ],
        commonActions: [
          {
            label: 'set town focus and close review',
            cli: "game play set-town-focus --city-id '<city-id>' --growth-type <type> --project-type <project-type> --send --closeout --reason '<why this focus was selected>'",
            operationFamily: 'sequence',
            operationType: 'CHANGE_GROWTH_MODE then CONSIDER_TOWN_PROJECT',
            argsShape: '{ Type, ProjectType, City } then {}',
            when: 'when the selected focus should be applied and the blocker closed as one caller workflow',
          },
          {
            label: 'set town focus',
            cli: "game play set-town-focus --city-id '<city-id>' --growth-type <type> --project-type <project-type>",
            operationFamily: 'city-command',
            operationType: 'CHANGE_GROWTH_MODE',
            argsShape: '{ Type, ProjectType, City }',
            when: 'after selecting the focus from live options',
          },
        ],
        notes: ['Town focus is not city-operation BUILD; use --closeout when one caller action should apply the focus and clear the review surface.'],
      },
      decisionQueue: [
        {
          notificationId: { owner: 0, id: 42, type: 20 },
          isEndTurnBlocking: true,
          typeName: 'NOTIFICATION_CHOOSE_TOWN_PROJECT',
          summary: 'Choose Town Project',
          message: 'Choose a town focus project',
          target: { owner: 0, id: 131073, type: 1 },
          location: null,
          category: 'town-focus',
          operationFamily: 'city-command',
          operationType: 'CHANGE_GROWTH_MODE',
          argsShape: '{ Type, ProjectType, City }',
          cli: 'game play set-town-focus',
          requiredInputs: [
            { name: 'City', source: 'notification target or selected city', required: true },
            { name: 'Type', source: 'live town focus option', required: true },
            { name: 'ProjectType', source: 'live town focus option', required: true },
          ],
          commonActions: [
            {
              label: 'set town focus and close review',
              cli: "game play set-town-focus --city-id '<city-id>' --growth-type <type> --project-type <project-type> --send --closeout --reason '<why this focus was selected>'",
              operationFamily: 'sequence',
              operationType: 'CHANGE_GROWTH_MODE then CONSIDER_TOWN_PROJECT',
              argsShape: '{ Type, ProjectType, City } then {}',
              when: 'when the selected focus should be applied and the blocker closed as one caller workflow',
            },
            {
              label: 'set town focus',
              cli: "game play set-town-focus --city-id '<city-id>' --growth-type <type> --project-type <project-type>",
              operationFamily: 'city-command',
              operationType: 'CHANGE_GROWTH_MODE',
              argsShape: '{ Type, ProjectType, City }',
              when: 'after selecting the focus from live options',
            },
          ],
          notes: ['Town focus is not city-operation BUILD; use --closeout when one caller action should apply the focus and clear the review surface.'],
        },
      ],
    },
    limits: { maxNotifications: 25, truncated: false },
  };
}

function unitMovePreviewView() {
  const unitId = { owner: 0, id: 65536, type: 26 };
  return {
    localPlayerId: 0,
    requestedUnitId: unitId,
    selectedUnitId: { ok: true, value: unitId },
    firstReadyUnitId: { ok: true, value: unitId },
    unitId,
    unit: {
      ok: true,
      value: {
        id: unitId,
        owner: 0,
        type: 222,
        typeName: 'UNIT_GALLEY',
        location: { x: 24, y: 35 },
        movementMovesRemaining: 2,
        attacksRemaining: 1,
        damage: 0,
      },
    },
    reachableMovement: {
      ok: true,
      value: [
        { index: 2964, x: 24, y: 35 },
        { index: 2965, x: 25, y: 35 },
      ],
    },
    reachableZonesOfControl: { ok: true, value: [] },
    reachableTargets: { ok: true, value: [[{ index: 2966, x: 26, y: 35 }]] },
    queuedDestination: { ok: true, value: { x: 25, y: 35 } },
    queuedPath: {
      ok: true,
      value: {
        plots: [
          { index: 2964, x: 24, y: 35 },
          { index: 2965, x: 25, y: 35 },
        ],
        plotCount: 2,
        turns: 1,
        obstacles: [],
        rawKeys: ['obstacles', 'plots', 'turns'],
      },
    },
    requestedDestination: { x: 25, y: 35 },
    requestedPath: {
      ok: true,
      value: {
        plots: [
          { index: 2964, x: 24, y: 35 },
          { index: 2965, x: 25, y: 35 },
        ],
        plotCount: 2,
        turns: 1,
        obstacles: [],
        rawKeys: ['obstacles', 'plots', 'turns'],
      },
    },
    relationshipPolicy: {
      relationshipSource: 'not-classified',
      relationshipProof: 'none',
      unprovenLabel: 'relationship-unproven',
      guidance: 'This movement preview does not classify other-owner relationships. Use neutral labels unless an official relationship, team, diplomacy, independent-power, or war-state API supplies that proof.',
    },
    notes: ['Read-only official movement preview. It does not send MOVE_TO, reserve a path, or prove tactical safety.'],
  };
}

function readyUnitView() {
  const unitId = { owner: 0, id: 458752, type: 26 };
  return {
    localPlayerId: 0,
    requestedUnitId: null,
    selectedUnitId: { ok: true, value: null },
    firstReadyUnitId: { ok: true, value: unitId },
    unitId,
    unit: {
      ok: true,
      value: {
        id: unitId,
        owner: 0,
        type: 111,
        typeName: 'UNIT_ARMY_COMMANDER',
        location: { x: 22, y: 31 },
        movementMovesRemaining: 2,
        attacksRemaining: 0,
        damage: 0,
        hitPoints: 100,
      },
    },
    legalOperations: [
      {
        family: 'unit-operation',
        operationType: 'SKIP_TURN',
        enumValue: 1,
        valid: true,
        result: { Success: true },
      },
    ],
    promotionReadiness: {
      ok: true,
      value: {
        hasExperience: true,
        canPromote: false,
        promotionClass: 'PROMOTION_CLASS_LAND_COMMANDER',
        level: 2,
        experiencePoints: 19,
        experienceToNextLevel: 45,
        totalPromotionsEarned: 2,
        storedPromotionPoints: 0,
        storedCommendations: 0,
        canPurchase: false,
        availablePromotions: [],
        notes: ['PROMOTE can open the commander promotion UI even when no points are spendable.'],
      },
    },
    nearby: {
      ok: true,
      value: [
        {
          x: 22,
          y: 31,
          units: [{ id: unitId, owner: 0, typeName: 'UNIT_ARMY_COMMANDER' }],
        },
      ],
    },
    notes: ['Read-only ready-unit view. Use operation validation before any send.'],
  };
}

function readyCityView() {
  const cityId = { owner: 0, id: 131073, type: 1 };
  return {
    localPlayerId: 0,
    requestedCityId: null,
    selectedCityId: { ok: true, value: cityId },
    blockingCityId: { ok: true, value: cityId },
    cityId,
    city: {
      ok: true,
      value: {
        id: cityId,
        name: 'Dur-Sharrukin',
        population: 4,
        isTown: true,
        buildQueue: {
          currentProductionTypeHash: 713967338,
          productionProgress: 12,
          turnsLeft: 3,
        },
      },
    },
    legalOperations: [
      {
        family: 'city-operation',
        operationType: 'CONSIDER_TOWN_PROJECT',
        enumValue: 1,
        valid: true,
        result: { Success: true },
      },
    ],
    productionCandidates: {
      ok: true,
      value: [
        {
          kind: 'constructible',
          type: 713967338,
          typeName: 'BUILDING_WALLS',
          name: 'LOC_BUILDING_WALLS_NAME',
          args: { ConstructibleType: 713967338 },
          cost: 80,
          turns: 3,
          productionBasis: {
            cost: 80,
            turns: 3,
            showTurns: true,
            showCost: true,
            costSource: 'city.Production.getConstructibleProductionCost(ConstructibleType)',
            turnsSource: 'city.BuildQueue.getTurnsLeft(type)',
          },
          baseYieldSummary: { YIELD_PRODUCTION: 1 },
          valid: true,
          result: { Success: true, Plots: [1457] },
          placementPlots: [{ index: 1457, x: 22, y: 31 }],
          cli: "game play build-production --city-id '<city-id>' --constructible-type 713967338 --x <x> --y <y>",
        },
      ],
    },
    townFocusOptions: {
      ok: true,
      value: [
        {
          name: 'LOC_PROJECT_FISHING_TOWN_NAME',
          description: 'LOC_PROJECT_FISHING_TOWN_DESCRIPTION',
          args: { Type: -284569333, ProjectType: -548685232, City: 131073 },
          valid: true,
          result: { Success: true },
          cli: "game play set-town-focus --city-id '<city-id>' --growth-type -284569333 --project-type -548685232",
        },
      ],
    },
    populationPlacement: {
      ok: true,
      value: {
        isReadyToPlacePopulation: { ok: true, value: true },
        cityWorkerCap: { ok: true, value: 4 },
        yieldTypeOrder: [
          'YIELD_FOOD',
          'YIELD_PRODUCTION',
          'YIELD_GOLD',
          'YIELD_SCIENCE',
          'YIELD_CULTURE',
          'YIELD_HAPPINESS',
          'YIELD_DIPLOMACY',
        ],
        allPlacementInfo: { ok: true, value: [{ PlotIndex: 1457, IsBlocked: false }] },
        workablePlotIndexes: { ok: true, value: [1457] },
        blockedPlotIndexes: { ok: true, value: [] },
        workablePlots: {
          ok: true,
          value: [
            {
              index: 1457,
              x: 22,
              y: 31,
              isBlocked: false,
              currentYields: [0, 1, 0, 0, 0, 0, 0],
              nextYields: [0, 1, 0, 0, 0, 2, 0],
              currentYieldSummary: {
                YIELD_FOOD: 0,
                YIELD_PRODUCTION: 1,
                YIELD_GOLD: 0,
                YIELD_SCIENCE: 0,
                YIELD_CULTURE: 0,
                YIELD_HAPPINESS: 0,
                YIELD_DIPLOMACY: 0,
              },
              nextYieldSummary: {
                YIELD_FOOD: 0,
                YIELD_PRODUCTION: 1,
                YIELD_GOLD: 0,
                YIELD_SCIENCE: 0,
                YIELD_CULTURE: 0,
                YIELD_HAPPINESS: 2,
                YIELD_DIPLOMACY: 0,
              },
              yieldDelta: {
                YIELD_FOOD: 0,
                YIELD_PRODUCTION: 0,
                YIELD_GOLD: 0,
                YIELD_SCIENCE: 0,
                YIELD_CULTURE: 0,
                YIELD_HAPPINESS: 2,
                YIELD_DIPLOMACY: 0,
              },
              maintenance: null,
              placementInfo: { PlotIndex: 1457, IsBlocked: false },
              cli: 'game play assign-worker --player-id <id> --location 1457',
            },
          ],
        },
        expansionCandidates: {
          ok: true,
          value: [
            {
              index: 1458,
              x: 23,
              y: 31,
              constructibleType: 713967338,
              constructibleTypeName: 'BUILDING_WALLS',
              constructibleName: 'Walls',
              constructibleClass: 'BUILDING',
              constructibleDistrictType: 'DISTRICT_URBAN',
              plotFacts: {
                terrainName: 'Grassland',
                featureName: null,
                resourceName: 'Clay',
                yieldSource: 'GameplayMap.getYieldsWithCity(plotIndex, cityId)',
                yieldSummary: {
                  YIELD_FOOD: 2,
                  YIELD_PRODUCTION: 1,
                  YIELD_GOLD: 0,
                  YIELD_SCIENCE: 0,
                  YIELD_CULTURE: 0,
                  YIELD_HAPPINESS: 0,
                  YIELD_DIPLOMACY: 0,
                },
              },
              cli: "game play expand-city --city-id '<city-id>' --x 23 --y 31",
            },
          ],
        },
        expansionResult: {
          ok: true,
          value: { Success: true, Plots: [1458], ConstructibleTypes: [713967338] },
        },
        cliHints: [
          'game play assign-worker --player-id <id> --location <plot-index>',
          "game play expand-city --city-id '<city-id>' --x <x> --y <y>",
        ],
      },
    },
    notes: ['Read-only ready-city view. This view intentionally does not choose production.'],
  };
}

function cleanReadyCityView() {
  return {
    localPlayerId: 0,
    requestedCityId: null,
    selectedCityId: { ok: true, value: null },
    blockingCityId: { ok: true, value: null },
    cityId: null,
    city: { ok: true, value: null },
    legalOperations: [],
    productionCandidates: { ok: true, value: [] },
    townFocusOptions: { ok: true, value: [] },
    populationPlacement: { ok: true, value: null },
    notes: ['No ready city in clean-read fixture.'],
  };
}

function settlementRecommendationsView() {
  return {
    localPlayerId: 0,
    playerId: 0,
    count: 5,
    requestedLocations: [{ x: 15, y: 23 }],
    origins: [
      {
        kind: 'requested',
        location: { x: 15, y: 23 },
        plotIndex: { ok: true, value: 1927 },
      },
    ],
    recommendations: [
      {
        origin: {
          kind: 'requested',
          location: { x: 15, y: 23 },
          plotIndex: { ok: true, value: 1927 },
        },
        suggestions: {
          ok: true,
          value: [
            {
              location: { x: 20, y: 20 },
              plotIndex: { ok: true, value: 1660 },
              factors: [
                {
                  positive: true,
                  title: 'LOC_SETTLEMENT_RECOMMENDATION_TOTAL_YIELD',
                  description: 'LOC_SETTLEMENT_RECOMMENDATION_GOOD_TOTAL_YIELD',
                },
              ],
            },
          ],
        },
      },
    ],
    notes: ['Read-only settlement recommendation view. It wraps the official settlement lens API.'],
  };
}

function targetCandidatesView() {
  return {
    localPlayerId: 0,
    playerId: 0,
    origins: [{ x: 18, y: 20 }],
    unitRadius: 4,
    hiddenInfoPolicy: 'runtime-debug-summary; may include non-visible cities or units until paired with visibility reads',
    candidates: [
      {
        owner: 9,
        leaderName: { ok: true, value: 'Independent Power' },
        civilizationName: { ok: true, value: 'Independent' },
        isHuman: { ok: true, value: false },
        cityCount: 1,
        unitCount: 4,
        cities: [
          {
            id: { owner: 9, id: 589824, type: 1 },
            owner: 9,
            name: 'Independent City',
            location: { x: 13, y: 17 },
            population: 3,
            isTown: false,
            distance: 5,
            nearestOrigin: { x: 18, y: 20 },
            water: { ok: true, value: false },
          },
          {
            id: { owner: 9, id: 589825, type: 1 },
            owner: 9,
            name: 'Second Independent City',
            location: { x: 11, y: 22 },
            population: 2,
            isTown: true,
            distance: 7,
            nearestOrigin: { x: 18, y: 20 },
            water: { ok: true, value: false },
          },
        ],
        nearestCity: {
          id: { owner: 9, id: 589824, type: 1 },
          owner: 9,
          name: 'Independent City',
          location: { x: 13, y: 17 },
          population: 3,
          isTown: false,
        },
        nearestDistance: 5,
        nearbyUnits: [
          {
            id: { owner: 9, id: 196608, type: 26 },
            owner: 9,
            typeName: 'UNIT_WARRIOR',
            location: { x: 13, y: 16 },
            damage: 0,
            strength: 20,
          },
        ],
        nearbyUnitCount: 4,
        apparentStrength: 42,
        approach: {
          nearestOrigin: { x: 18, y: 20 },
          targetLocation: { x: 13, y: 17 },
          directGridDistance: 5,
          routeHint: 'near-low-density',
          routeKind: 'land',
          originWater: { ok: true, value: false },
          targetWater: { ok: true, value: false },
          waterSampleCount: 0,
          landSampleCount: 6,
          notes: [
            'Distance is a cheap grid heuristic for target ranking, not a pathfinder result.',
            'Route kind is sampled from endpoints and a straight grid line; it is not Civ pathfinding.',
          ],
        },
        reasons: ['nearest target distance 5', 'single known city target', 'low nearby unit density'],
      },
    ],
    relationshipLabelPolicy: {
      relationshipSource: 'not-classified',
      relationshipProof: 'none',
      unprovenLabel: 'relationship-unproven',
      guidance: 'Target candidates rank other owners from runtime city/unit summaries. They do not classify relationship, alliance, neutrality, suzerain, or war-target status without official relationship, team, diplomacy, independent-power, or war-state evidence.',
    },
    notes: [
      'Read-only strategic target shortlist. It ranks other-owner contacts; it does not choose or send war, movement, or attack operations.',
      'Relationship labels are not classified here. Treat other-owner candidates as relationship-unproven until an official relationship or operation validator proves more.',
    ],
  };
}

function battlefieldScanView() {
  const friendlyUnit = {
    id: { owner: 0, id: 458752, type: 26 },
    owner: 0,
    stance: 'friendly',
    relationshipProof: 'self',
    relationshipLabel: 'friendly',
    type: 111,
    typeName: 'UNIT_SLINGER',
    role: 'ranged',
    location: { x: 17, y: 20 },
    distance: 0,
    nearestOrigin: { x: 17, y: 20 },
    damage: 36,
    wounded: true,
    strength: 9.6,
    movementMovesRemaining: 2,
    attacksRemaining: 1,
  };
  const civilianUnit = {
    id: { owner: 0, id: 1441800, type: 26 },
    owner: 0,
    stance: 'friendly',
    relationshipProof: 'self',
    relationshipLabel: 'friendly',
    type: 333,
    typeName: 'UNIT_SETTLER',
    role: 'civilian',
    location: { x: 16, y: 18 },
    distance: 1,
    nearestOrigin: { x: 17, y: 20 },
    damage: 0,
    wounded: false,
    strength: 1,
    movementMovesRemaining: 2,
    attacksRemaining: 0,
  };
  const otherOwnerUnit = {
    id: { owner: 9, id: 196608, type: 26 },
    owner: 9,
    stance: 'other',
    relationshipProof: 'none',
    relationshipLabel: 'relationship-unproven',
    type: 222,
    typeName: 'UNIT_WARRIOR',
    role: 'melee',
    location: { x: 13, y: 17 },
    distance: 4,
    nearestOrigin: { x: 17, y: 20 },
    damage: 0,
    wounded: false,
    strength: 20,
    movementMovesRemaining: 2,
    attacksRemaining: 1,
  };
  const city = {
    id: { owner: 9, id: 589824, type: 1 },
    owner: 9,
    stance: 'other',
    relationshipProof: 'none',
    relationshipLabel: 'relationship-unproven',
    name: 'Independent City',
    location: { x: 13, y: 17 },
    distance: 4,
    nearestOrigin: { x: 17, y: 20 },
    population: 3,
    isTown: false,
  };
  return {
    localPlayerId: 0,
    playerId: 0,
    origins: [{ x: 17, y: 20 }],
    radius: 8,
    hiddenInfoPolicy: 'runtime-debug-summary; may include non-visible units or cities until paired with visibility/map reads',
    relationshipLabelPolicy: {
      relationshipSource: 'not-classified',
      relationshipProof: 'none',
      unprovenLabel: 'relationship-unproven',
      guidance: 'Battlefield scan can prove owner ids, proximity, role heuristics, and validator-independent pressure. It cannot classify relationship, alliance, neutrality, suzerain, or war-target status without official relationship, team, diplomacy, independent-power, or war-state evidence.',
    },
    units: [friendlyUnit, civilianUnit, otherOwnerUnit],
    cities: [city],
    owners: [
      {
        owner: 0,
        stance: 'friendly',
        relationshipProof: 'self',
        relationshipLabel: 'friendly',
        leaderName: { ok: true, value: 'Player' },
        civilizationName: { ok: true, value: 'Assyria' },
        unitCount: 2,
        cityCount: 0,
        roles: { ranged: 1, civilian: 1 },
        apparentStrength: 10.6,
        nearestUnit: friendlyUnit,
        nearestCity: null,
      },
      {
        owner: 9,
        stance: 'other',
        relationshipProof: 'none',
        relationshipLabel: 'relationship-unproven',
        leaderName: { ok: true, value: 'Independent Power' },
        civilizationName: { ok: true, value: 'Independent' },
        unitCount: 1,
        cityCount: 1,
        roles: { melee: 1 },
        apparentStrength: 20,
        nearestUnit: otherOwnerUnit,
        nearestCity: city,
      },
    ],
    pointsOfInterest: [
      {
        kind: 'wounded-friendly',
        severity: 'medium',
        location: friendlyUnit.location,
        summary: 'friendly wounded unit near scan origin',
        units: [friendlyUnit],
      },
      {
        kind: 'civilian-risk',
        severity: 'high',
        location: civilianUnit.location,
        summary: 'friendly civilian has other-owner contact within 4 tiles',
        units: [civilianUnit],
      },
      {
        kind: 'city-front',
        severity: 'medium',
        location: city.location,
        summary: 'nearest relationship-unproven city in scan radius',
        cities: [city],
      },
    ],
    notes: [
      'Read-only battlefield lens for tactical orientation. It does not path, move, attack, declare war, or validate operations.',
      'Owner mismatch is contact evidence, not relationship proof. Use neutral relationship-unproven language unless official relationship APIs prove more.',
    ],
  };
}

function destinationAnalysisView() {
  const otherOwnerUnit = {
    id: { owner: 9, id: 196608, type: 26 },
    owner: 9,
    stance: 'other',
    type: 222,
    typeName: 'UNIT_WARRIOR',
    role: 'melee',
    location: { x: 13, y: 17 },
    distance: 0,
    nearestOrigin: { x: 13, y: 17 },
    damage: 0,
    wounded: false,
    strength: 20,
    movementMovesRemaining: 2,
    attacksRemaining: 1,
    corridorDistance: 0,
    destinationDistance: 0,
  };
  const city = {
    id: { owner: 9, id: 589824, type: 1 },
    owner: 9,
    stance: 'other',
    name: 'Independent City',
    location: { x: 13, y: 17 },
    distance: 0,
    nearestOrigin: { x: 13, y: 17 },
    population: 3,
    isTown: false,
    destinationDistance: 0,
  };
  return {
    localPlayerId: 0,
    playerId: 0,
    origin: { x: 20, y: 14 },
    destination: { x: 13, y: 17 },
    corridorRadius: 2,
    destinationRadius: 4,
    hiddenInfoPolicy: 'runtime-debug-summary; may include non-visible units, cities, or plot state until paired with visibility/map reads',
    relationshipLabelPolicy: {
      relationshipSource: 'not-classified',
      relationshipProof: 'none',
      unprovenLabel: 'relationship-unproven',
      guidance: 'Battlefield scan can prove owner ids, proximity, role heuristics, and validator-independent pressure. It cannot classify relationship, alliance, neutrality, suzerain, or war-target status without official relationship, team, diplomacy, independent-power, or war-state evidence.',
    },
    corridor: {
      routeHint: 'straight-line-grid-corridor',
      directGridDistance: 7,
      sampleCount: 8,
      sampledPlots: [
        {
          location: { x: 20, y: 14 },
          valid: { ok: true, value: true },
          water: { ok: true, value: true },
        },
      ],
      units: [otherOwnerUnit],
      unitCount: 1,
    },
    destinationPressure: {
      units: [otherOwnerUnit],
      unitCount: 1,
      cities: [city],
      cityCount: 1,
      apparentOtherStrength: 20,
    },
    pointsOfInterest: [
      {
        kind: 'destination-pressure',
        severity: 'medium',
        location: otherOwnerUnit.location,
        summary: '1 other-owner units near destination',
        units: [otherOwnerUnit],
      },
    ],
    notes: ['Read-only destination lens for tactical planning. It does not move units, reserve paths, attack, or validate operations.'],
  };
}

function notificationDismissal(send: boolean, mode: 'verified' | 'stale-nonblocking' | 'engine-front-train-absent' | 'engine-front-dismissed' = 'verified', settled = false) {
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

function operationValidation(message: string) {
  const family = message.includes('validateOperation("unit-command"') || message.includes('sendOperation("unit-command"')
    ? 'unit-command'
    : message.includes('validateOperation("city-command"') || message.includes('sendOperation("city-command"')
    ? 'city-command'
    : message.includes('validateOperation("city-operation"') || message.includes('sendOperation("city-operation"')
    ? 'city-operation'
    : message.includes('validateOperation("player-operation"') || message.includes('sendOperation("player-operation"')
      ? 'player-operation'
      : 'unit-operation';
  const operationType = operationTypeFromMessage(message);
  return {
    host: '127.0.0.1',
    port: 0,
    state: { id: '1', name: 'Tuner', role: 'tuner' },
    family,
    operationType,
    enumValue: operationType,
    target: operationTarget(family),
    args: operationArgs(operationType),
    valid: true,
    result: { Success: true },
  };
}

function operationTypeFromMessage(message: string) {
  const validateIndex = message.lastIndexOf('validateOperation("');
  const sendIndex = message.lastIndexOf('sendOperation("');
  const callIndex = Math.max(validateIndex, sendIndex);
  const callSource = callIndex >= 0 ? message.slice(callIndex) : message;
  return callSource.match(/"operationType":"([^"]+)"/)?.[1] ?? 'SKIP_TURN';
}

function unitOperationPostconditionSnapshot(firstReadyUnitId: { owner: number; id: number; type: number }) {
  return {
    unit: {
      ok: true,
      value: {
        id: { owner: 0, id: 65536, type: 26 },
        location: { x: 22, y: 33 },
        movement: 2,
        activity: 'UNIT_ACTIVITY_AWAKE',
        damage: 0,
        attacks: 1,
      },
    },
    selectedUnitId: { ok: true, value: { owner: 0, id: 65536, type: 26 } },
    firstReadyUnitId: { ok: true, value: firstReadyUnitId },
    blocker: { ok: true, value: 0 },
  };
}

function operationTarget(family: string) {
  if (family === 'player-operation') return { playerId: 0 };
  if (family === 'city-operation' || family === 'city-command') return { cityId: { owner: 0, id: 65536, type: 25 } };
  return { unitId: { owner: 0, id: 65536, type: 26 } };
}

function operationArgs(operationType: string) {
  if (operationType === 'VIEWED_ADVISOR_WARNING') return { Target: { owner: 0, id: 12345, type: 99 } };
  if (operationType === 'SET_TECH_TREE_NODE') return { ProgressionTreeNodeType: -1255676052 };
  if (operationType === 'SET_TECH_TREE_TARGET_NODE') return { ProgressionTreeNodeType: -1255676052 };
  if (operationType === 'SET_CULTURE_TREE_NODE') return { ProgressionTreeNodeType: 115 };
  if (operationType === 'SET_CULTURE_TREE_TARGET_NODE') return { ProgressionTreeNodeType: -1677668973 };
  if (operationType === 'CHOOSE_GOLDEN_AGE') return { GoldenAgeType: -340825966 };
  if (operationType === 'CHANGE_GOVERNMENT') return { GovernmentType: 0, Action: -1326475004 };
  if (operationType === 'RESPOND_DIPLOMATIC_FIRST_MEET') return { Player1: 0, Player2: 2, Type: 673478009 };
  if (operationType === 'UNITCOMMAND_RESETTLE') return { X: 17, Y: 25 };
  if (operationType === 'UNITCOMMAND_UPGRADE') return {};
  return undefined;
}
