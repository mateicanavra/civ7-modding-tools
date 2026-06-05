import { describe, expect, test, vi } from 'vitest';
import GamePlayAdvisorWarning from '../../src/commands/game/play/advisor-warning';
import GamePlayOperation from '../../src/commands/game/play/operation';
import GamePlayResettleUnit from '../../src/commands/game/play/resettle-unit';
import GamePlayUpgradeUnit from '../../src/commands/game/play/upgrade-unit';
import { type FakeTunerServer, startFakeTunerServer } from './fixtures/tuner-socket-server';

describe('game play operation wrapper commands', () => {
  test('validates friendlier operation family aliases without sending', async () => {
    const server = await startOperationTunerServer();
    try {
      const { port } = server.address();
      await runCommand(GamePlayOperation, [
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--family',
        'unit',
        '--type',
        'SKIP_TURN',
        '--unit-id',
        '{"owner":0,"id":65536,"type":26}',
        '--json',
      ]);

      expect(server.received.some((message) => message.includes('validateOperation("unit-operation"'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test('sends unit operations through direct-control once', async () => {
    const server = await startOperationTunerServer();
    try {
      const { port } = server.address();
      await runCommand(GamePlayOperation, [
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--family',
        'unit',
        '--type',
        'SKIP_TURN',
        '--unit-id',
        '{"owner":0,"id":65536,"type":26}',
        '--send',
        '--json',
      ]);

      expect(server.received.some((message) => message.includes('sendOperation("unit-operation"'))).toBe(true);
      expect(server.received.filter((message) => message.includes('return JSON.stringify(sendOperation'))).toHaveLength(1);
    } finally {
      await server.close();
    }
  });

  test('wraps advisor warning acknowledgement as an player operation', async () => {
    const server = await startOperationTunerServer();
    try {
      const { port } = server.address();
      await runCommand(GamePlayAdvisorWarning, [
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--player-id',
        '0',
        '--target',
        '{"owner":0,"id":12345,"type":99}',
        '--send',
        '--json',
      ]);

      expect(server.received.some((message) => message.includes('VIEWED_ADVISOR_WARNING'))).toBe(true);
      expect(server.received.some((message) => message.includes('"Target":{"owner":0,"id":12345,"type":99}'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation("player-operation"'))).toBe(true);
    } finally {
      await server.close();
    }
  });

  test('wraps population resettle as a unit command with target coordinates', async () => {
    const server = await startOperationTunerServer();
    try {
      const { port } = server.address();
      await runCommand(GamePlayResettleUnit, [
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--unit-id',
        '{"owner":0,"id":1703951,"type":26}',
        '--x',
        '17',
        '--y',
        '25',
        '--json',
      ]);

      expect(server.received.some((message) => message.includes('validateOperation("unit-command"'))).toBe(true);
      expect(server.received.some((message) => message.includes('UNITCOMMAND_RESETTLE'))).toBe(true);
      expect(server.received.some((message) => message.includes('"X":17'))).toBe(true);
      expect(server.received.some((message) => message.includes('"Y":25'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test('wraps unit upgrade as an unit command', async () => {
    const server = await startOperationTunerServer();
    try {
      const { port } = server.address();
      await runCommand(GamePlayUpgradeUnit, [
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--unit-id',
        '{"owner":0,"id":1769488,"type":26}',
        '--send',
        '--json',
      ]);

      expect(server.received.some((message) => message.includes('UNITCOMMAND_UPGRADE'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation("unit-command"'))).toBe(true);
    } finally {
      await server.close();
    }
  });
});

type OperationTunerServer = FakeTunerServer;

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

async function startOperationTunerServer(): Promise<OperationTunerServer> {
  return startFakeTunerServer({
    handle({ message }) {
      if (message.includes('return JSON.stringify(validateOperation')) {
        return [JSON.stringify(operationValidation(message))];
      }
      if (message.includes('return JSON.stringify(sendOperation')) {
        return [JSON.stringify(operationSend(message))];
      }
      return undefined;
    },
  });
}

function operationSend(message: string) {
  const family = operationFamily(message);
  return family === 'unit-operation' || family === 'unit-command'
    ? {
        sent: true,
        beforePostcondition: unitOperationPostconditionSnapshot({ owner: 0, id: 65536, type: 26 }),
        afterPostcondition: unitOperationPostconditionSnapshot({ owner: 0, id: 131072, type: 26 }),
      }
    : { sent: true };
}

function operationValidation(message: string) {
  const family = operationFamily(message);
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

function operationFamily(message: string) {
  if (message.includes('validateOperation("unit-command"') || message.includes('sendOperation("unit-command"')) {
    return 'unit-command';
  }
  if (message.includes('validateOperation("player-operation"') || message.includes('sendOperation("player-operation"')) {
    return 'player-operation';
  }
  return 'unit-operation';
}

function operationTypeFromMessage(message: string) {
  const validateIndex = message.lastIndexOf('validateOperation("');
  const sendIndex = message.lastIndexOf('sendOperation("');
  const callIndex = Math.max(validateIndex, sendIndex);
  const callSource = callIndex >= 0 ? message.slice(callIndex) : message;
  return callSource.match(/"operationType":"([^"]+)"/)?.[1] ?? 'SKIP_TURN';
}

function operationTarget(family: string) {
  if (family === 'player-operation') return { playerId: 0 };
  return { unitId: { owner: 0, id: 65536, type: 26 } };
}

function operationArgs(operationType: string) {
  if (operationType === 'VIEWED_ADVISOR_WARNING') return { Target: { owner: 0, id: 12345, type: 99 } };
  if (operationType === 'UNITCOMMAND_RESETTLE') return { X: 17, Y: 25 };
  if (operationType === 'UNITCOMMAND_UPGRADE') return {};
  return undefined;
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
