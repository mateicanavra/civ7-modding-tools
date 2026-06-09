import { describe, expect, test, vi } from 'vitest';
import GamePlayRespondDiplomacy from '../../src/commands/game/play/respond-diplomacy';
import { type FakeTunerServer, startFakeTunerServer } from './fixtures/tuner-socket-server';

describe('game play diplomacy response commands', () => {
  test('wraps diplomacy response as RESPOND_DIPLOMATIC_ACTION', async () => {
    const server = await startDiplomacyResponseTunerServer();
    try {
      const { port } = server.address();
      await runCommand(GamePlayRespondDiplomacy, [
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--player-id',
        '0',
        '--action-id',
        '56',
        '--response-type',
        '-1907089594',
        '--json',
      ]);

      expect(server.received.some((message) => message.includes('RESPOND_DIPLOMATIC_ACTION'))).toBe(true);
      expect(server.received.some((message) => message.includes('"ID":56'))).toBe(true);
      expect(server.received.some((message) => message.includes('"Type":-1907089594'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test('validates diplomacy responses as a dry-run player operation', async () => {
    const server = await startDiplomacyResponseTunerServer();
    try {
      const { port } = server.address();
      await runCommand(GamePlayRespondDiplomacy, [
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--player-id',
        '0',
        '--action-id',
        '8',
        '--response-type',
        '926305338',
        '--json',
      ]);

      expect(server.received.some((message) => message.includes('validateOperation("player-operation"'))).toBe(true);
      expect(server.received.some((message) => message.includes('RESPOND_DIPLOMATIC_ACTION'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendDiplomacyResponseCloseout'))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test('sends diplomacy responses through the App UI closeout path', async () => {
    const server = await startDiplomacyResponseTunerServer({ playNotificationMode: 'stale-diplomacy' });
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayRespondDiplomacy.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayRespondDiplomacy.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--player-id',
        '2',
        '--action-id',
        '8',
        '--response-type',
        '926305338',
        '--notification-id',
        '{"owner":0,"id":19,"type":20}',
        '--send',
        '--reason',
        'test diplomacy response closeout',
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        result: DiplomacyResponseSendResult;
      };
      expect(payload.result.sent).toBe(true);
      expect(payload.result.status).toBe('sent-confirmed');
      expect(payload.result.playerId).toBe(0);
      expect(payload.result.actionId).toBe(8);
      expect(payload.result.responseType).toBe(926305338);
      expect(payload.result.notificationId).toEqual({ owner: 0, id: 19, type: 20 });
      expect(payload.result.validation).toEqual({ beforeValid: true, afterValid: true });
      expect(payload.result.postcondition.classification).toBe('turn-unblocked');
      expect(payload.result.postcondition.reason).toContain('turn unblocked');
      expect(payload.result.postcondition).toMatchObject({
        outcome: 'cleared',
        confidence: 'confirmed',
        confirmed: true,
        noRepeatAfterUnverified: false,
      });
      expect(payload.result.nextSteps[0]).toMatchObject({
        kind: 'refresh-attention',
        source: 'diplomacy.response.request',
      });
      expectSemanticDiplomacyResponseOmitsRawRuntimeDetails(payload.result);
      expect(server.received.some((message) => message.includes('sendDiplomacyResponseCloseout'))).toBe(true);
      expect(server.received.some((message) => message.includes('GameContext.localPlayerID'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation("player-operation"'))).toBe(false);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });
});

type DiplomacyResponseTunerServer = FakeTunerServer;

type CommandClass = {
  run(args: string[]): Promise<unknown>;
  prototype: { log(message?: string): void };
};

type DiplomacyResponseSendResult = {
  playerId: number;
  actionId: number;
  responseType: number;
  notificationId?: { owner: number; id: number; type: number };
  sent: boolean;
  status: string;
  validation: { beforeValid: boolean; afterValid: boolean };
  postcondition: {
    classification: string;
    reason: string;
    outcome: string;
    confidence: string;
    confirmed: boolean;
    noRepeatAfterUnverified: boolean;
  };
  nextSteps: Array<{ kind: string; source: string; label: string }>;
};

function expectSemanticDiplomacyResponseOmitsRawRuntimeDetails(result: unknown) {
  const serialized = JSON.stringify(result);
  expect(serialized).not.toContain('"host"');
  expect(serialized).not.toContain('"port"');
  expect(serialized).not.toContain('"state"');
  expect(serialized).not.toContain('"session"');
  expect(serialized).not.toContain('"rawCommand"');
  expect(serialized).not.toContain('"command"');
  expect(serialized).not.toContain('"payload"');
  expect(serialized).not.toContain('"verified"');
  expect(serialized).not.toContain('"uiCloseout"');
  expect(serialized).not.toContain('"diplomacyState"');
  expect(serialized).not.toContain('"activationResult"');
  expect(serialized).not.toContain('Game.PlayerOperations');
  expect(serialized).not.toContain('sendDiplomacyResponseCloseout');
}

async function runCommand(command: CommandClass, args: string[]) {
  const log = vi.spyOn(command.prototype, 'log').mockImplementation(() => {});
  try {
    await command.run(args);
  } finally {
    log.mockRestore();
  }
}

async function startDiplomacyResponseTunerServer(options: {
  playNotificationMode?: 'stale-diplomacy';
} = {}): Promise<DiplomacyResponseTunerServer> {
  let diplomacyCloseoutObserved = false;
  return startFakeTunerServer({
    handle({ message }) {
      if (message.includes('Network.isInSession')) {
        return [JSON.stringify(appUiSnapshot())];
      }
      if (message.includes('evalOk') && message.includes('GameplayMap.getGridWidth')) {
        return [JSON.stringify(tunerHealthSnapshot())];
      }
      if (message.includes('readPlayNotifications')) {
        return [JSON.stringify(playNotificationView(
          options.playNotificationMode ?? 'stale-diplomacy',
          diplomacyCloseoutObserved,
        ))];
      }
      if (message.includes('sendDiplomacyResponseCloseout')) {
        diplomacyCloseoutObserved = true;
        return [JSON.stringify(diplomacyResponseCloseout())];
      }
      if (message.includes('return JSON.stringify(validateOperation')) {
        return [JSON.stringify(operationValidation(message))];
      }
      return undefined;
    },
  });
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

function operationValidation(message: string) {
  return {
    host: '127.0.0.1',
    port: 0,
    state: { id: '1', name: 'Tuner', role: 'tuner' },
    family: 'player-operation',
    operationType: 'RESPOND_DIPLOMATIC_ACTION',
    enumValue: 'RESPOND_DIPLOMATIC_ACTION',
    target: { playerId: 0 },
    args: message.includes('"ID":8') || message.includes('actionId:8')
      ? { ID: 8, Type: 926305338 }
      : { ID: 56, Type: -1907089594 },
    valid: true,
    result: { Success: true },
  };
}

function diplomacyResponseCloseout() {
  const notificationId = { owner: 0, id: 19, type: 20 };
  return {
    localPlayerId: 0,
    playerId: 0,
    actionId: 8,
    responseType: 926305338,
    args: { ID: 8, Type: 926305338 },
    notificationId,
    discoveredNotification: { ok: true, value: notificationId },
    activated: true,
    activationResult: {
      ok: true,
      value: {
        found: true,
        target: { owner: 2, id: 8, type: 34 },
        activated: true,
        currentProjectReactionDataActionID: 8,
      },
    },
    canStart: { ok: true, value: { Success: true } },
    sent: true,
    sendResult: { ok: true, value: true },
    uiCloseout: {
      requested: true,
      acknowledgeStarted: { ok: true, value: undefined },
      closeCurrentDiplomacyProject: { ok: true, value: undefined },
      hide: { ok: true, value: undefined },
    },
    diplomacyState: {
      before: {
        currentProjectReactionDataActionID: 8,
        currentProjectReactionRequestActionID: 8,
        interfaceMode: { ok: true, value: 'INTERFACEMODE_DIPLOMACY_PROJECT_REACTION' },
      },
      after: {
        currentProjectReactionDataActionID: null,
        currentProjectReactionRequestActionID: null,
        interfaceMode: { ok: true, value: 'INTERFACEMODE_DEFAULT' },
      },
    },
    notes: ['This follows the official response-panel path more closely than a raw player-operation send.'],
  };
}

function playNotificationView(mode: 'stale-diplomacy', diplomacyCloseoutObserved = false) {
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
    confidence: 'official-ui',
    notes: ['Visible response panel option; send mode must verify the notification no longer blocks turn completion.'],
  };
  const notificationId = { owner: 0, id: 19, type: 20 };
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
    isEndTurnBlocking: !diplomacyCloseoutObserved,
    decision: diplomacyDecision,
    details: {
      kind: 'diplomacy-response-options',
      actionId: 8,
      notificationId,
      enabledOptions: [
        {
          responseType: 926305338,
          title: 'Accept',
          enabled: true,
          disabled: false,
          validation: { ok: true, value: { Success: true } },
          cli: "game play respond-diplomacy --action-id 8 --response-type 926305338 --notification-id '{\"owner\":0,\"id\":19,\"type\":20}' --send --reason '<why this response was selected>'",
        },
      ],
      disabledOptions: [],
    },
  };
  return {
    localPlayerId: 0,
    turn: { ok: true, value: 8 },
    turnDate: { ok: true, value: '3825 BCE' },
    hasSentTurnComplete: { ok: true, value: false },
    canEndTurn: { ok: true, value: diplomacyCloseoutObserved },
    blocker: { ok: true, value: 0 },
    blockingNotificationId: { ok: true, value: diplomacyCloseoutObserved ? null : notification.id },
    selectedUnitId: { ok: true, value: null },
    selectedCityId: { ok: true, value: null },
    firstReadyUnitId: { ok: true, value: null },
    notifications: diplomacyCloseoutObserved ? [] : [notification],
    decisions: diplomacyCloseoutObserved ? [] : [diplomacyDecision],
    hud: {
      nextDecision: diplomacyCloseoutObserved
        ? null
        : {
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
      decisionQueue: diplomacyCloseoutObserved ? [] : [
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
