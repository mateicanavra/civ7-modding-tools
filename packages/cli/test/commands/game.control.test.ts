import { describe, expect, test } from 'vitest';
import { once } from 'node:events';
import { type AddressInfo, createServer } from 'node:net';
import GameExec from '../../src/commands/game/exec';
import GameHealth from '../../src/commands/game/health';
import GameInspect from '../../src/commands/game/inspect';

describe('game direct-control commands', () => {
  test('runs arbitrary JavaScript through the direct socket boundary', async () => {
    const server = await startTunerServer();
    try {
      const { port } = server.address();
      await GameExec.run(['1+1', '--host', '127.0.0.1', '--port', String(port), '--json']);

      expect(server.received).toEqual(['LSQ:', 'CMD:65535:1+1']);
    } finally {
      await server.close();
    }
  });

  test('reports direct-control health and available states', async () => {
    const server = await startTunerServer();
    try {
      const { port } = server.address();
      await GameHealth.run(['--host', '127.0.0.1', '--port', String(port), '--state', 'App UI', '--json']);

      expect(server.received).toEqual(['LSQ:']);
    } finally {
      await server.close();
    }
  });

  test('reports Tuner gameplay readiness', async () => {
    const server = await startTunerServer();
    try {
      const { port } = server.address();
      await GameHealth.run(['--host', '127.0.0.1', '--port', String(port), '--tuner', '--json']);

      expect(server.received).toEqual(['LSQ:', expect.stringContaining('CMD:1:(() =>')]);
    } finally {
      await server.close();
    }
  });

  test('inspects runtime API roots in a selected state', async () => {
    const server = await startTunerServer();
    try {
      const { port } = server.address();
      await GameInspect.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--state',
        'App UI',
        '--roots',
        'Network',
        '--json',
      ]);

      expect(server.received).toEqual(['LSQ:', expect.stringContaining('CMD:65535:(() =>')]);
    } finally {
      await server.close();
    }
  });

  test('prints the package-owned App UI snapshot', async () => {
    const server = await startTunerServer();
    try {
      const { port } = server.address();
      await GameInspect.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--app-ui-snapshot',
        '--json',
      ]);

      expect(server.received).toEqual(['LSQ:', expect.stringContaining('CMD:65535:(() =>')]);
    } finally {
      await server.close();
    }
  });
});

async function startTunerServer() {
  const received: string[] = [];
  const server = createServer((socket) => {
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
        } else if (frame.message.includes('Network.isInSession')) {
          socket.write(
            encodeResponse(frame.listenerId, [
              JSON.stringify({
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
              }),
            ])
          );
        } else if (frame.message.includes('evalOk: 1 + 1')) {
          socket.write(
            encodeResponse(frame.listenerId, [
              JSON.stringify({
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
              }),
            ])
          );
        } else if (frame.message.startsWith('CMD:65535:(() =>')) {
          socket.write(
            encodeResponse(frame.listenerId, [
              JSON.stringify([
                {
                  name: 'Network',
                  type: 'object',
                  exists: true,
                  ownKeys: ['isInSession'],
                  prototypeKeys: ['restartGame'],
                  enumerableKeys: ['isInSession', 'restartGame'],
                  methods: [
                    {
                      name: 'restartGame',
                      owner: 'prototype',
                      length: 0,
                      signature: 'function restartGame() { [native code] }',
                    },
                  ],
                },
              ]),
            ])
          );
        } else {
          socket.write(encodeResponse(frame.listenerId, ['2']));
        }
      }
    });
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  return {
    received,
    address: () => server.address() as AddressInfo,
    close: async () => {
      server.close();
      await once(server, 'close');
    },
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
  const bytesRead = 8 + messageLength;
  if (buffer.length < bytesRead) return null;
  return {
    listenerId: buffer.readUInt32LE(4),
    message: buffer.subarray(8, bytesRead).toString('utf8').replace(/\0$/, ''),
    bytesRead,
  };
}

function encodeResponse(listenerId: number, parts: string[]): Buffer {
  const messageBytes = Buffer.from(`${parts.join('\0')}\0`, 'utf8');
  const frame = Buffer.alloc(8 + messageBytes.length);
  frame.writeUInt32LE(messageBytes.length, 0);
  frame.writeUInt32LE(listenerId, 4);
  messageBytes.copy(frame, 8);
  return frame;
}
