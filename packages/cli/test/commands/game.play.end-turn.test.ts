import { describe, expect, test } from 'vitest';
import GamePlayEndTurn from '../../src/commands/game/play/end-turn';
import { type FakeTunerServer, startFakeTunerServer } from './fixtures/tuner-socket-server';

describe('game play end-turn command', () => {
  test('checks end-turn status without sending turn complete', async () => {
    const server = await startEndTurnTunerServer();
    try {
      const { port } = server.address();
      await GamePlayEndTurn.run(['--host', '127.0.0.1', '--port', String(port), '--json']);

      expect(server.received.some((message) => message.includes('canEndTurn'))).toBe(true);
      expect(server.received).not.toContain('CMD:65535:GameContext.sendTurnComplete()');
    } finally {
      await server.close();
    }
  });

  test('sends end-turn only with explicit approval reason', async () => {
    await expect(GamePlayEndTurn.run(['--send', '--json'])).rejects.toThrow(/requires --reason/);

    const server = await startEndTurnTunerServer();
    try {
      const { port } = server.address();
      await GamePlayEndTurn.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--send',
        '--reason',
        'test approved end-turn',
        '--json',
      ]);

      expect(server.received).toContain('CMD:65535:GameContext.sendTurnComplete()');
    } finally {
      await server.close();
    }
  });

  test('blocks end-turn when the HUD still has an end-turn blocking notification', async () => {
    const server = await startEndTurnTunerServer({ canEndTurnBefore: false });
    try {
      const { port } = server.address();
      await expect(GamePlayEndTurn.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--send',
        '--reason',
        'test approved end-turn',
        '--json',
      ])).rejects.toThrow(/blocked by current game state/);

      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
      expect(server.received).not.toContain('CMD:65535:GameContext.sendTurnComplete()');
    } finally {
      await server.close();
    }
  });

  test('blocks raw end-turn fallback when stale command-units has a validator-backed closeout', async () => {
    const server = await startEndTurnTunerServer({
      canEndTurnBefore: false,
      playNotificationMode: 'stale-unit-command',
    });
    try {
      const { port } = server.address();
      await expect(GamePlayEndTurn.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--send',
        '--reason',
        'test blocked because a unit closeout exists',
        '--json',
      ])).rejects.toThrow(/blocked by current game state/);

      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
      expect(server.received).not.toContain('CMD:65535:GameContext.sendTurnComplete()');
    } finally {
      await server.close();
    }
  });

  test('allows end-turn fallback for stale command-units only when no closeout is enabled', async () => {
    const server = await startEndTurnTunerServer({
      canEndTurnBefore: false,
      playNotificationMode: 'stale-unit-command-disabled',
    });
    try {
      const { port } = server.address();
      await GamePlayEndTurn.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--send',
        '--reason',
        'test approved stale expired command-units end-turn',
        '--json',
      ]);

      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
      expect(server.received).toContain('CMD:65535:GameContext.sendTurnComplete()');
    } finally {
      await server.close();
    }
  });

  test('allows end-turn fallback for reviewed informational blockers after App UI enum is clean', async () => {
    const server = await startEndTurnTunerServer({
      canEndTurnBefore: false,
      playNotificationMode: 'stale-informational',
    });
    try {
      const { port } = server.address();
      await GamePlayEndTurn.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--send',
        '--reason',
        'test approved reviewed report end-turn',
        '--json',
      ]);

      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
      expect(server.received).toContain('CMD:65535:GameContext.sendTurnComplete()');
    } finally {
      await server.close();
    }
  });

  test('blocks end-turn fallback for still-front unit-lost reports', async () => {
    const server = await startEndTurnTunerServer({
      canEndTurnBefore: false,
      playNotificationMode: 'unit-lost-report',
    });
    try {
      const { port } = server.address();
      await expect(GamePlayEndTurn.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--send',
        '--reason',
        'test blocked unit-lost report end-turn',
        '--json',
      ])).rejects.toThrow(/blocked by current game state/);

      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
      expect(server.received).not.toContain('CMD:65535:GameContext.sendTurnComplete()');
    } finally {
      await server.close();
    }
  });
});

type EndTurnNotificationMode =
  | 'blocking-choice'
  | 'stale-unit-command'
  | 'stale-unit-command-disabled'
  | 'stale-informational'
  | 'unit-lost-report';

async function startEndTurnTunerServer(options: {
  canEndTurnBefore?: boolean;
  playNotificationMode?: EndTurnNotificationMode;
} = {}): Promise<FakeTunerServer> {
  let turnCompleteSent = false;
  return startFakeTunerServer({
    handle({ message }) {
      if (message.includes('readPlayNotifications')) {
        return [JSON.stringify(endTurnNotificationView(options.playNotificationMode ?? 'blocking-choice'))];
      }
      if (message.includes('hasSentTurnComplete')) {
        return [JSON.stringify(turnCompletionStatus(turnCompleteSent, options.canEndTurnBefore ?? true))];
      }
      if (message === 'CMD:65535:GameContext.sendTurnComplete()') {
        turnCompleteSent = true;
        return ['true'];
      }
      return undefined;
    },
  });
}

function endTurnNotificationView(mode: EndTurnNotificationMode) {
  if (mode === 'stale-informational') {
    const decision = {
      category: 'informational-notification',
      operationFamily: 'app-ui-action',
      operationType: 'Game.Notifications.dismiss',
      argsShape: '{ notificationId }',
      cli: 'game play dismiss-notification',
      requiredInputs: [{ name: 'Notification', source: 'notification ComponentID', required: true }],
      commonActions: [],
      confidence: 'official-ui',
      notes: ['Default-handler report notification; review before closeout.'],
    };
    const notification = {
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
      decision,
    };
    return notificationView({ notification, decision, firstReadyUnitId: null });
  }
  if (mode === 'unit-lost-report') {
    const decision = {
      category: 'informational-notification',
      operationFamily: 'app-ui-action',
      operationType: 'Game.Notifications.dismiss',
      argsShape: '{ notificationId }',
      cli: 'game play dismiss-notification',
      requiredInputs: [{ name: 'Notification', source: 'notification ComponentID', required: true }],
      commonActions: [],
      confidence: 'official-ui',
      notes: ['Default-handler unit-loss report; review before closeout.'],
    };
    const notification = {
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
      decision,
    };
    return notificationView({ notification, decision, firstReadyUnitId: { owner: 0, id: 458754, type: 26 } });
  }
  if (mode === 'stale-unit-command' || mode === 'stale-unit-command-disabled') {
    const hasEnabledCloseout = mode === 'stale-unit-command';
    const notificationId = { owner: 0, id: 88, type: 20 };
    const enabledCloseoutCandidates = hasEnabledCloseout
      ? [{
          unitId: { owner: 0, id: 196609, type: 26 },
          operationFamily: 'unit-operation',
          operationType: 'SKIP_TURN',
          argsShape: '{}',
          enabled: true,
          validation: { ok: true, value: { Success: true } },
          cli: 'game play operation --family unit --type SKIP_TURN',
        }]
      : [];
    const decision = {
      category: 'unit-command',
      operationFamily: 'unit-operation',
      operationType: 'SKIP_TURN',
      argsShape: 'selected/ready unit id plus operation-specific args',
      cli: 'game play operation --family unit',
      requiredInputs: [
        { name: 'Unit', source: 'selectedUnitId or firstReadyUnitId', required: true },
      ],
      commonActions: [],
      confidence: 'heuristic',
      notes: ['Read the selected or first ready unit before choosing skip, automate, move, or promote.'],
    };
    const notification = {
      id: notificationId,
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
      decision,
      details: {
        kind: 'unit-command-reconciliation',
        classification: hasEnabledCloseout ? 'unit-command-closeout-candidates' : 'unit-command-stale-expired',
        notificationId,
        blocker: { ok: true, value: 0 },
        hasSentTurnComplete: { ok: true, value: false },
        selectedUnitId: { ok: true, value: null },
        firstReadyUnitId: { ok: true, value: null },
        unitScan: { ok: true, value: [{ owner: 0, id: 196609, type: 26 }] },
        closeoutCandidates: enabledCloseoutCandidates,
        enabledCloseoutCandidates,
        staleReadyPointerSuspected: hasEnabledCloseout,
        staleExpiredWithoutEnabledCloseout: !hasEnabledCloseout,
        repairCandidates: hasEnabledCloseout
          ? []
          : [{
              kind: 'send-turn-complete',
              cli: "game play end-turn --send --reason '<stale COMMAND_UNITS has no selected/ready unit and no enabled validator-backed unit closeout>' --json",
              proof: 'No selected/ready unit exists and every scanned unit closeout is disabled.',
            }],
        notes: ['End-turn fallback fixture for COMMAND_UNITS reconciliation.'],
      },
    };
    return notificationView({ notification, decision, firstReadyUnitId: null });
  }

  const decision = {
    category: 'town-focus',
    operationFamily: 'city-command',
    operationType: 'CHANGE_GROWTH_MODE',
    argsShape: '{ Type, ProjectType, City }',
    cli: 'game play set-town-focus',
    requiredInputs: [{ name: 'City', source: 'notification target or selected city', required: true }],
    commonActions: [],
    confidence: 'official-ui',
    notes: ['Blocking town focus fixture for end-turn guard tests.'],
  };
  const notification = {
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
    decision,
  };
  return notificationView({ notification, decision, selectedCityId: { owner: 0, id: 131073, type: 1 }, firstReadyUnitId: null });
}

function notificationView(input: {
  notification: {
    id: unknown;
    typeName: string;
    summary: string;
    message: string;
    target: unknown;
    location: unknown;
    details?: unknown;
  };
  decision: Record<string, unknown>;
  selectedCityId?: unknown;
  firstReadyUnitId: unknown;
}) {
  const { notification, decision } = input;
  const queueItem = {
    notificationId: notification.id,
    isEndTurnBlocking: true,
    typeName: notification.typeName,
    summary: notification.summary,
    message: notification.message,
    target: notification.target,
    location: notification.location,
    details: notification.details,
    ...decision,
  };
  return {
    localPlayerId: 0,
    turn: { ok: true, value: 80 },
    turnDate: { ok: true, value: '2025 BCE' },
    hasSentTurnComplete: { ok: true, value: false },
    canEndTurn: { ok: true, value: false },
    blocker: { ok: true, value: 0 },
    blockingNotificationId: { ok: true, value: notification.id },
    selectedUnitId: { ok: true, value: null },
    selectedCityId: { ok: true, value: input.selectedCityId ?? null },
    firstReadyUnitId: { ok: true, value: input.firstReadyUnitId },
    notifications: [notification],
    decisions: [decision],
    hud: {
      nextDecision: queueItem,
      decisionQueue: [queueItem],
    },
    limits: { maxNotifications: 25, truncated: false },
  };
}

function turnCompletionStatus(sent: boolean, canEndTurnBefore = true) {
  return {
    host: '127.0.0.1',
    port: 0,
    state: { id: '65535', name: 'App UI', role: 'app-ui' },
    localPlayerId: 0,
    turn: { ok: true, value: sent ? 2 : 1 },
    turnDate: { ok: true, value: '4000 BCE' },
    hasSentTurnComplete: { ok: true, value: sent },
    canEndTurn: { ok: true, value: sent ? false : canEndTurnBefore },
    blocker: { ok: true, value: 0 },
    firstReadyUnitId: { ok: true, value: null },
  };
}
