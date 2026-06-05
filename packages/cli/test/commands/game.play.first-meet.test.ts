import { describe, expect, test, vi } from 'vitest';
import GamePlayRespondFirstMeet from '../../src/commands/game/play/respond-first-meet';
import { type FakeTunerServer, startFakeTunerServer } from './fixtures/tuner-socket-server';

describe('game play first-meet diplomacy command', () => {
  test('wraps first-meet diplomacy as RESPOND_DIPLOMATIC_FIRST_MEET', async () => {
    const server = await startFirstMeetTunerServer();
    try {
      const { port } = server.address();
      await runCommand(GamePlayRespondFirstMeet, [
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--player-id',
        '0',
        '--met-player-id',
        '2',
        '--response',
        'neutral',
        '--json',
      ]);

      expect(server.received.some((message) => message.includes('RESPOND_DIPLOMATIC_FIRST_MEET'))).toBe(true);
      expect(server.received.some((message) => message.includes('"Player1":0'))).toBe(true);
      expect(server.received.some((message) => message.includes('"Player2":2'))).toBe(true);
      expect(server.received.some((message) => message.includes('"Type":673478009'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test('reports first-meet notification postconditions after send', async () => {
    const server = await startFirstMeetTunerServer();
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayRespondFirstMeet.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayRespondFirstMeet.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--player-id',
        '0',
        '--met-player-id',
        '2',
        '--response',
        'neutral',
        '--send',
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        result: {
          sent: boolean;
          verified: boolean;
          postcondition: { classification: string; verified: boolean };
        };
      };
      expect(payload.result.sent).toBe(true);
      expect(payload.result.verified).toBe(true);
      expect(payload.result.postcondition.verified).toBe(true);
      expect(payload.result.postcondition.classification).toBe('first-meet-cleared');
      expect(server.received.some((message) => message.includes('RESPOND_DIPLOMATIC_FIRST_MEET'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation("player-operation"'))).toBe(true);
      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('does not verify first-meet sends while the same blocker remains live', async () => {
    const server = await startFirstMeetTunerServer({ firstMeetMode: 'sticky' });
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayRespondFirstMeet.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayRespondFirstMeet.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--player-id',
        '0',
        '--met-player-id',
        '2',
        '--response',
        'neutral',
        '--send',
        '--timeout-ms',
        '1000',
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        result: {
          sent: boolean;
          verified: boolean;
          postcondition: { classification: string; verified: boolean; reason: string };
        };
      };
      expect(payload.result.sent).toBe(true);
      expect(payload.result.verified).toBe(false);
      expect(payload.result.postcondition.verified).toBe(false);
      expect(payload.result.postcondition.classification).toBe('first-meet-sticky-blocker');
      expect(payload.result.postcondition.reason).toContain('same first-meet notification still blocks');
      expect(server.received.some((message) => message.includes('sendOperation("player-operation"'))).toBe(true);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });
});

type FirstMeetTunerServer = FakeTunerServer;

type CommandClass = {
  run(args: string[]): Promise<unknown>;
  prototype: { log(message?: string): void };
};

async function runCommand(command: CommandClass, args: string[]) {
  const log = vi.spyOn(command.prototype, 'log').mockImplementation(() => {});
  try {
    await command.run(args);
  } finally {
    log.mockRestore();
  }
}

async function startFirstMeetTunerServer(options: { firstMeetMode?: 'cleared' | 'sticky' } = {}): Promise<FirstMeetTunerServer> {
  let firstMeetSent = false;
  return startFakeTunerServer({
    handle({ message }) {
      if (message.includes('readPlayNotifications')) {
        const mode = firstMeetSent && (options.firstMeetMode ?? 'cleared') === 'cleared' ? 'ready-unit' : 'first-meet';
        return [JSON.stringify(firstMeetNotificationView(mode))];
      }
      if (message.includes('DiplomacyPlayerFirstMeets')) {
        return [JSON.stringify({
          key: 'PLAYER_REALATIONSHIP_FIRSTMEET_NEUTRAL',
          value: 673478009,
        })];
      }
      if (message.includes('return JSON.stringify(validateOperation')) {
        return [JSON.stringify({
          host: '127.0.0.1',
          port: 0,
          state: { id: '1', name: 'Tuner', role: 'tuner' },
          family: 'player-operation',
          operationType: 'RESPOND_DIPLOMATIC_FIRST_MEET',
          enumValue: 'RESPOND_DIPLOMATIC_FIRST_MEET',
          target: { playerId: 0 },
          args: { Player1: 0, Player2: 2, Type: 673478009 },
          valid: true,
          result: { Success: true },
        })];
      }
      if (message.includes('return JSON.stringify(sendOperation')) {
        firstMeetSent = true;
        return [JSON.stringify({ sent: true })];
      }
      return undefined;
    },
  });
}

function firstMeetNotificationView(mode: 'first-meet' | 'ready-unit') {
  if (mode === 'ready-unit') {
    return {
      localPlayerId: 0,
      turn: { ok: true, value: 27 },
      turnDate: { ok: true, value: '3350 BCE' },
      hasSentTurnComplete: { ok: true, value: false },
      canEndTurn: { ok: true, value: false },
      blocker: { ok: true, value: 0 },
      blockingNotificationId: { ok: true, value: null },
      selectedUnitId: { ok: true, value: null },
      selectedCityId: { ok: true, value: null },
      firstReadyUnitId: { ok: true, value: null },
      notifications: [],
      decisions: [],
      hud: { nextDecision: null, decisionQueue: [] },
      limits: { maxNotifications: 25, truncated: false },
    };
  }
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
