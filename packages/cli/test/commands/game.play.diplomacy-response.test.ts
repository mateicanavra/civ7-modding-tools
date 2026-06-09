import { once } from 'node:events';
import { type AddressInfo, createServer, type Socket } from 'node:net';
import { describe, expect, test, vi } from 'vitest';
import GamePlayRespondDiplomacy from '../../src/commands/game/play/respond-diplomacy';

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
        result: {
          sent: boolean;
          verified: boolean;
          payload: { playerId: number; notificationId: { id: number }; uiCloseout: { requested: boolean } };
          postcondition: { classification: string; reason: string };
        };
      };
      expect(payload.result.sent).toBe(true);
      expect(payload.result.verified).toBe(true);
      expect(payload.result.payload.playerId).toBe(0);
      expect(payload.result.payload.notificationId.id).toBe(19);
      expect(payload.result.payload.uiCloseout.requested).toBe(true);
      expect(payload.result.postcondition.classification).toBe('turn-unblocked');
      expect(payload.result.postcondition.reason).toContain('turn unblocked');
      expect(server.received.some((message) => message.includes('sendDiplomacyResponseCloseout'))).toBe(true);
      expect(server.received.some((message) => message.includes('GameContext.localPlayerID'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation("player-operation"'))).toBe(false);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });
});

type DiplomacyResponseTunerServer = {
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

async function startDiplomacyResponseTunerServer(options: {
  playNotificationMode?: 'stale-diplomacy';
} = {}): Promise<DiplomacyResponseTunerServer> {
  const received: string[] = [];
  const sockets = new Set<Socket>();
  let diplomacyCloseoutObserved = false;
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
          socket.write(encodeResponse(frame.listenerId, [JSON.stringify(playNotificationView(
            options.playNotificationMode ?? 'stale-diplomacy',
            diplomacyCloseoutObserved,
          ))]));
        } else if (frame.message.includes('sendDiplomacyResponseCloseout')) {
          diplomacyCloseoutObserved = true;
          socket.write(encodeResponse(frame.listenerId, [JSON.stringify(diplomacyResponseCloseout())]));
        } else if (frame.message.includes('return JSON.stringify(validateOperation')) {
          socket.write(encodeResponse(frame.listenerId, [JSON.stringify(operationValidation(frame.message))]));
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

function parseRequest(buffer: Buffer): { listenerId: number; message: string; bytesRead: number } | null {
  if (buffer.length < 8) return null;
  const messageLength = buffer.readUInt32LE(0);
  const bytesRead = 8 + messageLength;
  if (buffer.length < bytesRead) return null;
  return {
    listenerId: buffer.readUInt32LE(4),
    message: buffer.subarray(8, bytesRead).toString('utf8').replace(/\0$/, ''),
    bytesRead,
  };
}

function encodeResponse(listenerId: number, values: string[]) {
  const messageBytes = Buffer.from(`${values.join('\0')}\0`, 'utf8');
  const frame = Buffer.alloc(8 + messageBytes.length);
  frame.writeUInt32LE(messageBytes.length, 0);
  frame.writeUInt32LE(listenerId, 4);
  messageBytes.copy(frame, 8);
  return frame;
}
