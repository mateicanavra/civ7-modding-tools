import { once } from 'node:events';
import { type AddressInfo, createServer, type Socket } from 'node:net';
import { describe, expect, test, vi } from 'vitest';
import GamePlayRespondFirstMeet from '../../src/commands/game/play/respond-first-meet';

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
        '--reason',
        'test neutral first-meet response',
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
        '--reason',
        'test sticky first-meet response',
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

type FirstMeetTunerServer = {
  received: string[];
  address(): AddressInfo;
  close(): Promise<void>;
};

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
  const received: string[] = [];
  const sockets = new Set<Socket>();
  let firstMeetSent = false;
  const server = createServer((socket) => {
    sockets.add(socket);
    socket.on('close', () => sockets.delete(socket));
    let buffer = Buffer.alloc(0);
    socket.on('data', (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
      for (;;) {
        const frame = parseRequest(buffer);
        if (!frame) return;
        buffer = buffer.subarray(frame.bytesRead);
        received.push(frame.message);
        if (frame.message === 'LSQ:') {
          socket.write(encodeResponse(frame.listenerId, ['65535', 'App UI', '1', 'Tuner']));
        } else if (frame.message.includes('readPlayNotifications')) {
          const mode = firstMeetSent && (options.firstMeetMode ?? 'cleared') === 'cleared' ? 'ready-unit' : 'first-meet';
          socket.write(encodeResponse(frame.listenerId, [JSON.stringify(firstMeetNotificationView(mode))]));
        } else if (frame.message.includes('DiplomacyPlayerFirstMeets')) {
          socket.write(encodeResponse(frame.listenerId, [JSON.stringify({
            key: 'PLAYER_REALATIONSHIP_FIRSTMEET_NEUTRAL',
            value: 673478009,
          })]));
        } else if (frame.message.includes('return JSON.stringify(validateOperation')) {
          socket.write(encodeResponse(frame.listenerId, [JSON.stringify({
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
          })]));
        } else if (frame.message.includes('return JSON.stringify(sendOperation')) {
          firstMeetSent = true;
          socket.write(encodeResponse(frame.listenerId, [JSON.stringify({ sent: true })]));
        } else {
          socket.write(encodeResponse(frame.listenerId, [JSON.stringify(null)]));
        }
      }
    });
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address.bind(server);
  const close = server.close.bind(server);
  return {
    received,
    address(): AddressInfo {
      return address() as AddressInfo;
    },
    async close() {
      for (const socket of sockets) socket.destroy();
      await new Promise<void>((resolve, reject) => {
        close((error) => error ? reject(error) : resolve());
      });
    },
  };
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

function parseRequest(buffer: Buffer):
  | {
      listenerId: number;
      message: string;
      bytesRead: number;
    }
  | null {
  if (buffer.length < 8) return null;
  const messageLength = buffer.readUInt32LE(0);
  const listenerId = buffer.readUInt32LE(4);
  const end = 8 + messageLength;
  if (buffer.length < end) return null;
  return {
    listenerId,
    message: buffer.subarray(8, end).toString('utf8').replace(/\0$/, ''),
    bytesRead: end,
  };
}

function encodeResponse(listenerId: number, lines: string[]): Buffer {
  const payload = Buffer.from(`${lines.join('\0')}\0`, 'utf8');
  const out = Buffer.alloc(8 + payload.length);
  out.writeUInt32LE(payload.length, 0);
  out.writeUInt32LE(listenerId, 4);
  payload.copy(out, 8);
  return out;
}
