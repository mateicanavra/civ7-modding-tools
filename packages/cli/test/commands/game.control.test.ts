import { describe, expect, test, vi } from 'vitest';
import { once } from 'node:events';
import { type AddressInfo, createServer } from 'node:net';
import GameExec from '../../src/commands/game/exec';
import GameHealth from '../../src/commands/game/health';
import GameInspect from '../../src/commands/game/inspect';
import GameStatus from '../../src/commands/game/status';
import GameMap from '../../src/commands/game/map';
import GameGameInfo from '../../src/commands/game/gameinfo';
import GameAiLoadedLevers from '../../src/commands/game/ai/loaded-levers';
import GameOperation from '../../src/commands/game/operation';

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
    const writes: string[] = [];
    const log = vi.spyOn(GameHealth.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GameHealth.run(['--host', '127.0.0.1', '--port', String(port), '--state', 'App UI', '--json']);

      expect(server.received).toEqual(['LSQ:']);
      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        health: {
          ok: true;
          status: string;
          host: string;
          port: number;
          states: Array<{ id: string; name: string }>;
          selectedState: { id: string; name: string };
        };
      };
      expect(payload.ok).toBe(true);
      expect(payload.health).toMatchObject({
        ok: true,
        status: 'ready',
        host: '127.0.0.1',
        port,
        selectedState: { id: '65535', name: 'App UI' },
      });
      expect(payload.health.states).toEqual([
        { id: '65535', name: 'App UI' },
        { id: '1', name: 'Tuner' },
      ]);
    } finally {
      log.mockRestore();
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

  test('reports structured tuner socket diagnostics when disconnected', async () => {
    const port = await findUnusedPort();
    const writes: string[] = [];
    const log = vi.spyOn(GameHealth.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      await GameHealth.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--timeout-ms',
        '200',
        '--tuner',
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: boolean;
        health: {
          ready: boolean;
          status: string;
          host: string;
          port: number;
          error: { code?: string; message: string };
          recoveryHints: string[];
        };
      };
      expect(payload.ok).toBe(false);
      expect(payload.health.ready).toBe(false);
      expect(payload.health.status).toBe('unavailable');
      expect(payload.health.host).toBe('127.0.0.1');
      expect(payload.health.port).toBe(port);
      expect(payload.health.error.code).toBe('all-hosts-unavailable');
      expect(payload.health.error.message).toContain('Unable to reach Civ7 tuner socket');
      expect(payload.health.recoveryHints.join(' ')).toContain(`lsof -nP -iTCP:${port}`);
      expect(payload.health.recoveryHints.join(' ')).toContain('CIV7_TUNER_HOST');
    } finally {
      log.mockRestore();
    }
  });

  test('reports tuner socket unavailability in non-json output', async () => {
    const port = await findUnusedPort();

    await expect(GameHealth.run([
      '--host',
      '127.0.0.1',
      '--port',
      String(port),
      '--timeout-ms',
      '200',
      '--tuner',
    ])).rejects.toThrow(/Civ7 tuner unavailable: Unable to reach Civ7 tuner socket/);
  });

  test('inspects runtime API roots in a selected state', async () => {
    const server = await startTunerServer();
    const writes: string[] = [];
    const log = vi.spyOn(GameInspect.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
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
      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        inspection: {
          host: string;
          port: number;
          state: { id: string; name: string };
          roots: Array<{
            name: string;
            ownKeys: string[];
            prototypeKeys: string[];
            enumerableKeys: string[];
            methods: Array<{
              name: string;
              owner: string;
              length: number;
              signature: string;
            }>;
          }>;
        };
      };
      expect(payload.inspection).toMatchObject({
        host: '127.0.0.1',
        port,
        state: { id: '65535', name: 'App UI' },
      });
      expect(payload.inspection.roots[0]).toMatchObject({
        name: 'Network',
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
      });
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('prints the package-owned App UI snapshot', async () => {
    const server = await startTunerServer();
    const writes: string[] = [];
    const log = vi.spyOn(GameInspect.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
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
      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        snapshot: {
          host: string;
          port: number;
          state: { id: string; name: string };
          snapshot: {
            network: {
              isInSession: { ok: true; value: boolean };
              hostPlayerId: { ok: true; value: number };
            };
            game: {
              turn: number;
              turnDate: { ok: true; value: string };
            };
            ui: {
              inGame: { ok: true; value: boolean };
              loadingStateName: string;
              canNotifyUIReady: string;
            };
            gameContext: { localPlayerID: number; localObserverID: number };
            players: {
              aliveIds: { ok: true; value: number[] };
              aliveHumanIds: { ok: true; value: number[] };
            };
            map: {
              width: { ok: true; value: number };
              height: { ok: true; value: number };
              plotCount: { ok: true; value: number };
            };
          };
        };
      };
      expect(payload).toMatchObject({
        ok: true,
        snapshot: {
          host: '127.0.0.1',
          port,
          state: { id: '65535', name: 'App UI' },
        },
      });
      expect(payload.snapshot.snapshot).toMatchObject({
        network: {
          isInSession: { ok: true, value: true },
          hostPlayerId: { ok: true, value: 0 },
        },
        game: {
          turn: 1,
          turnDate: { ok: true, value: '4000 BCE' },
        },
        ui: {
          inGame: { ok: true, value: true },
          loadingStateName: 'WaitingForUIReady',
          canNotifyUIReady: 'function',
        },
        gameContext: { localPlayerID: 0, localObserverID: 0 },
        players: {
          aliveIds: { ok: true, value: [0] },
          aliveHumanIds: { ok: true, value: [0] },
        },
        map: {
          width: { ok: true, value: 84 },
          height: { ok: true, value: 54 },
          plotCount: { ok: true, value: 4536 },
        },
      });
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('reports composed playable status', async () => {
    const server = await startTunerServer();
    const writes: string[] = [];
    const log = vi.spyOn(GameStatus.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GameStatus.run(['--host', '127.0.0.1', '--port', String(port), '--json']);

      expect(server.received).toEqual([
        'LSQ:',
        expect.stringContaining('CMD:65535:(() =>'),
        'LSQ:',
        expect.stringContaining('CMD:1:(() =>'),
      ]);
      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        status: {
          host: string;
          port: number;
          playable: true;
          readiness: string;
          errors: string[];
          appUi: {
            host: string;
            port: number;
            state: { id: string; name: string };
            snapshot: {
              network: { isInSession: { ok: true; value: boolean } };
              ui: { loadingStateName: string; canBeginGame: { ok: true; value: boolean } };
              gameContext: { localPlayerID: number };
              players: { aliveHumanIds: { ok: true; value: number[] } };
              map: { width: { ok: true; value: number }; height: { ok: true; value: number } };
            };
          };
          tuner: {
            host: string;
            port: number;
            state: { id: string; name: string };
            ready: true;
            snapshot: {
              ready: true;
              globals: Record<string, string>;
              turnDate: { ok: true; value: string };
            };
          };
        };
      };
      expect(payload).toMatchObject({
        ok: true,
        status: {
          host: '127.0.0.1',
          port,
          playable: true,
          readiness: 'tuner-ready',
          errors: [],
        },
      });
      expect(payload.status.appUi).toMatchObject({
        host: '127.0.0.1',
        port,
        state: { id: '65535', name: 'App UI' },
      });
      expect(payload.status.appUi.snapshot).toMatchObject({
        network: { isInSession: { ok: true, value: true } },
        ui: { loadingStateName: 'WaitingForUIReady', canBeginGame: { ok: true, value: true } },
        gameContext: { localPlayerID: 0 },
        players: { aliveHumanIds: { ok: true, value: [0] } },
        map: { width: { ok: true, value: 84 }, height: { ok: true, value: 54 } },
      });
      expect(payload.status.tuner).toMatchObject({
        host: '127.0.0.1',
        port,
        state: { id: '1', name: 'Tuner' },
        ready: true,
        snapshot: {
          ready: true,
          globals: { Game: 'object', Network: 'undefined' },
          turnDate: { ok: true, value: '4000 BCE' },
        },
      });
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('reads bounded map and GameInfo surfaces', async () => {
    const server = await startTunerServer();
    try {
      const { port } = server.address();
      await GameMap.run(['--host', '127.0.0.1', '--port', String(port), '--plot', '3,4', '--player-id', '0', '--json']);
      await GameGameInfo.run(['Resources', '--host', '127.0.0.1', '--port', String(port), '--limit', '2', '--json']);

      expect(server.received.some((message) => message.includes('readPlotSnapshot'))).toBe(true);
      expect(server.received.some((message) => message.includes('GameInfo[input.table]'))).toBe(true);
    } finally {
      await server.close();
    }
  });

  test('samples loaded AI levers through bounded GameInfo reads', async () => {
    const server = await startTunerServer();
    try {
      const { port } = server.address();
      await GameAiLoadedLevers.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--family',
        'rhq',
        '--limit-per-table',
        '2',
        '--json',
      ]);

      expect(server.received.some((message) => message.includes('"table":"AiOperationDefs"'))).toBe(true);
      expect(server.received.some((message) => message.includes('"table":"AllowedOperations"'))).toBe(true);
      expect(server.received.some((message) => message.includes('"table":"AiFavoredItems"'))).toBe(true);
      expect(server.received.some((message) => message.includes('"equals":"PSEUDOYIELD_NEW_CITY"'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation'))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test('validates operation commands through the canonical package boundary', async () => {
    const server = await startTunerServer();
    try {
      const { port } = server.address();
      await GameOperation.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--family',
        'unit-operation',
        '--operation-type',
        'SKIP_TURN',
        '--unit-id',
        '{"owner":0,"id":65536,"type":26}',
        '--json',
      ]);

      expect(server.received.some((message) => message.includes('return JSON.stringify(validateOperation'))).toBe(true);
      expect(server.received.some((message) => message.includes('return JSON.stringify(sendOperation'))).toBe(false);
    } finally {
      await server.close();
    }
  });
});

async function findUnusedPort(): Promise<number> {
  const server = createServer();
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = (server.address() as AddressInfo).port;
  server.close();
  await once(server, 'close');
  return port;
}

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
        } else if (frame.message.includes('readPlotSnapshot')) {
          socket.write(
            encodeResponse(frame.listenerId, [
              JSON.stringify({
                location: { x: 3, y: 4, index: { ok: true, value: 339 } },
                revealedState: { ok: true, value: 1 },
                visible: { ok: true, value: true },
                hiddenInfoPolicy: 'visibility-filtered',
                facts: {
                  terrain: { ok: true, value: 4 },
                  resource: { ok: true, value: -1 },
                  revealedState: { ok: true, value: 1 },
                  visible: { ok: true, value: true },
                },
              }),
            ])
          );
        } else if (frame.message.includes('GameInfo[input.table]')) {
          const table = gameInfoTableFromCommand(frame.message) ?? 'Resources';
          socket.write(
            encodeResponse(frame.listenerId, [
              JSON.stringify({
                table,
                source: 'GameInfo',
                rows: [sampleGameInfoRow(table)],
                limit: 2,
                offset: 0,
                total: { ok: true, value: 1 },
                omittedUnknown: false,
              }),
            ])
          );
        } else if (frame.message.includes('return JSON.stringify(validateOperation')) {
          socket.write(
            encodeResponse(frame.listenerId, [
              JSON.stringify({
                family: 'unit-operation',
                operationType: 'SKIP_TURN',
                enumValue: 'SKIP_TURN',
                target: { unitId: { owner: 0, id: 65536, type: 26 } },
                valid: true,
                result: { Success: true },
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

function gameInfoTableFromCommand(message: string): string | null {
  return message.match(/"table":"([^"]+)"/)?.[1] ?? null;
}

function sampleGameInfoRow(table: string): Record<string, unknown> {
  switch (table) {
    case 'Resources':
      return { ResourceType: 'RESOURCE_COTTON' };
    case 'AiOperationDefs':
      return { OperationName: 'NAVAL_CITY_ATTACK', BehaviorTree: 'Naval City Attack', TargetType: 'CITY' };
    case 'AllowedOperations':
      return { ListType: 'BaseOperations', OperationDef: 'NAVAL_CITY_ATTACK' };
    case 'AIUnitPrioritizedActions':
      return { UnitType: 'UNIT_BOMBER', OperationType: 'UNITOPERATION_AIR_ATTACK' };
    case 'AiFavoredItems':
      return { ListType: 'Test PseudoYield Biases', Item: 'PSEUDOYIELD_NEW_CITY', Value: 50 };
    case 'PseudoYields':
      return { PseudoYieldType: 'PSEUDOYIELD_REPAIR_BONUS', DefaultValue: 10000 };
    case 'BehaviorTrees':
      return { TreeName: 'Naval City Attack' };
    case 'TreeData':
      return { TreeName: 'Naval City Attack', NodeId: 1, Name: 'Create Units' };
    default:
      return { RowType: table };
  }
}
