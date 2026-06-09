import { describe, expect, test, vi } from 'vitest';
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

  test('sends end-turn only with send enabled', async () => {
    const server = await startEndTurnTunerServer();
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayEndTurn.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayEndTurn.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--send',
        '--json',
      ]);

      expect(server.received).toContain('CMD:65535:GameContext.sendTurnComplete()');
      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        result: {
          sent: true;
          status: string;
          postcondition: { classification: string };
          nextSteps: Array<{ kind: string; source: string }>;
        };
      };
      expect(payload).toMatchObject({
        ok: true,
        result: {
          sent: true,
          status: 'sent-confirmed',
          postcondition: {
            classification: 'turn-advanced',
          },
          nextSteps: [{
            kind: 'refresh-attention',
            source: 'turn.complete.request',
          }],
        },
      });
      expect(JSON.stringify(payload)).not.toContain('"host"');
      expect(JSON.stringify(payload)).not.toContain('"port"');
      expect(JSON.stringify(payload)).not.toContain('"state"');
      expect(JSON.stringify(payload)).not.toContain('"command"');
      expect(JSON.stringify(payload)).not.toContain('"verified"');
      expect(JSON.stringify(payload)).not.toContain('GameContext.sendTurnComplete');
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('blocks end-turn when the HUD still has an end-turn blocking notification', async () => {
    const server = await startEndTurnTunerServer({ canEndTurnBefore: false });
    try {
      const { port } = server.address();
      const payload = await runGamePlayEndTurnJson([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--send',
        '--json',
      ]);

      expectBlockedTurnCompletionPayload(payload);
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
      const payload = await runGamePlayEndTurnJson([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--send',
        '--json',
      ]);

      expectBlockedTurnCompletionPayload(payload);
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
      const payload = await runGamePlayEndTurnJson([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--send',
        '--json',
      ]);

      expectBlockedTurnCompletionPayload(payload);
      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
      expect(server.received).not.toContain('CMD:65535:GameContext.sendTurnComplete()');
    } finally {
      await server.close();
    }
  });
});

async function runGamePlayEndTurnJson(args: string[]) {
  const writes: string[] = [];
  const log = vi.spyOn(GamePlayEndTurn.prototype, 'log').mockImplementation((message?: string) => {
    if (message) writes.push(message);
  });
  try {
    await GamePlayEndTurn.run(args);
    return JSON.parse(writes.join('')) as {
      ok: true;
      result: {
        sent: boolean;
        status: string;
        after: unknown;
        postcondition: {
          classification: string;
          outcome: string;
          confidence: string;
          noRepeatAfterUnverified: boolean;
        };
        nextSteps: Array<{ kind: string; source: string }>;
      };
    };
  } finally {
    log.mockRestore();
  }
}

function expectBlockedTurnCompletionPayload(
  payload: Awaited<ReturnType<typeof runGamePlayEndTurnJson>>,
) {
  expect(payload).toMatchObject({
    ok: true,
    result: {
      sent: false,
      status: 'not-sent',
      after: null,
      postcondition: {
        classification: 'turn-completion-blocked',
        outcome: 'not-sent',
        confidence: 'unverified',
        noRepeatAfterUnverified: true,
      },
      nextSteps: [
        {
          kind: 'inspect-turn-completion',
          source: 'turn.complete.request',
        },
        {
          kind: 'do-not-repeat',
          source: 'turn.complete.request',
        },
      ],
    },
  });
  const serialized = JSON.stringify(payload);
  expect(serialized).not.toContain('"host"');
  expect(serialized).not.toContain('"port"');
  expect(serialized).not.toContain('"state"');
  expect(serialized).not.toContain('"command"');
  expect(serialized).not.toContain('"verified"');
  expect(serialized).not.toContain('GameContext.sendTurnComplete');
}

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
      if (message.includes('Network.isInSession')) {
        return [JSON.stringify(appUiSnapshot())];
      }
      if (message.includes('evalOk') && message.includes('GameplayMap.getGridWidth')) {
        return [JSON.stringify(tunerHealthSnapshot())];
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
              cli: "game play end-turn --send --json",
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

function appUiSnapshot() {
  return {
    network: {
      isInSession: { ok: true, value: true },
      numPlayers: { ok: true, value: 1 },
      hostPlayerId: { ok: true, value: 0 },
      isConnectedToNetwork: { ok: true, value: true },
      isAuthenticated: { ok: true, value: false },
      isLoggedIn: { ok: true, value: true },
    },
    autoplay: {
      isActive: false,
      turns: -1,
      isPaused: false,
      isPausedOrPending: false,
      observeAsPlayer: -1,
      returnAsPlayer: -1,
    },
    game: {
      turn: 1,
      age: 0,
      maxTurns: 0,
      turnDate: { ok: true, value: '4000 BCE' },
      hash: { ok: true, value: 0 },
    },
    ui: {
      inGame: { ok: true, value: true },
      inShell: { ok: true, value: false },
      inLoading: { ok: true, value: false },
      loadingState: { ok: true, value: 6 },
      loadingStateName: 'WaitingForUIReady',
      canBeginGame: { ok: true, value: true },
      canNotifyUIReady: 'function',
      skipStartButton: { ok: true, value: false },
      automationActive: { ok: true, value: false },
    },
    gameContext: {
      localPlayerID: 0,
      localObserverID: 0,
      hasRequestedPause: { ok: true, value: false },
    },
    players: {
      maxPlayers: 64,
      aliveIds: { ok: true, value: [0] },
      aliveHumanIds: { ok: true, value: [0] },
      numAliveHumans: { ok: true, value: 1 },
    },
    map: {
      width: { ok: true, value: 84 },
      height: { ok: true, value: 54 },
      plotCount: { ok: true, value: 4536 },
      mapSize: { ok: true, value: 0 },
      randomSeed: { ok: true, value: 1 },
    },
  };
}

function tunerHealthSnapshot() {
  return {
    evalOk: 2,
    ready: true,
    globals: {
      Game: 'object',
      Autoplay: 'object',
      GameplayMap: 'object',
      Players: 'object',
      Network: 'undefined',
    },
    turn: { ok: true, value: 1 },
    turnDate: { ok: true, value: '4000 BCE' },
    width: { ok: true, value: 84 },
    height: { ok: true, value: 54 },
    aliveIds: { ok: true, value: [0] },
    aliveHumanIds: { ok: true, value: [0] },
    autoplayActive: { ok: true, value: false },
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
