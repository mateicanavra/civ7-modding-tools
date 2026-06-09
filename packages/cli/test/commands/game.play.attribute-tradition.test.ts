import { describe, expect, test, vi } from 'vitest';
import GamePlayBuyAttribute from '../../src/commands/game/play/buy-attribute';
import GamePlayChangeTradition from '../../src/commands/game/play/change-tradition';
import GamePlayConsiderAttributes from '../../src/commands/game/play/consider-attributes';
import GamePlayConsiderTraditions from '../../src/commands/game/play/consider-traditions';
import { type FakeTunerServer, startFakeTunerServer } from './fixtures/tuner-socket-server';

describe('game play attribute and tradition commands', () => {
  test('wraps attribute purchase as BUY_ATTRIBUTE_TREE_NODE', async () => {
    const server = await startAttributeTraditionTunerServer();
    try {
      const { port } = server.address();
      await GamePlayBuyAttribute.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--player-id',
        '0',
        '--node',
        '20',
        '--json',
      ]);

      expect(server.received.some((message) => message.includes('BUY_ATTRIBUTE_TREE_NODE'))).toBe(true);
      expect(server.received.some((message) => message.includes('"ProgressionTreeNodeType":20'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test('buys attribute and closes assignment review as one caller workflow', async () => {
    const server = await startAttributeTraditionTunerServer();
    try {
      const { port } = server.address();
      const writes: string[] = [];
      const log = vi.spyOn(GamePlayBuyAttribute.prototype, 'log').mockImplementation((message?: string) => {
        if (message) writes.push(message);
      });
      try {
        await GamePlayBuyAttribute.run([
          '--host',
          '127.0.0.1',
          '--port',
          String(port),
          '--player-id',
          '0',
          '--node',
          '20',
          '--send',
          '--closeout',
          '--reason',
          'test attribute purchase closeout',
          '--json',
        ]);
      } finally {
        log.mockRestore();
      }

      const payload = JSON.parse(writes.join('')) as { ok: true; result: { mode: string; stepCount: number; verified: boolean } };
      expect(payload.result.mode).toBe('send');
      expect(payload.result.stepCount).toBe(2);
      expect(payload.result.verified).toBe(true);
      expect(server.received.filter((message) => message.includes('sendOperation("player-operation"')).length).toBe(2);
      expect(server.received.some((message) => message.includes('BUY_ATTRIBUTE_TREE_NODE'))).toBe(true);
      expect(server.received.some((message) => message.includes('CONSIDER_ASSIGN_ATTRIBUTE'))).toBe(true);
    } finally {
      await server.close();
    }
  });

  test('wraps tradition swaps as CHANGE_TRADITION', async () => {
    const server = await startAttributeTraditionTunerServer();
    try {
      const { port } = server.address();
      await GamePlayChangeTradition.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--player-id',
        '0',
        '--tradition-type',
        '-331546976',
        '--action',
        '-1326475004',
        '--json',
      ]);

      expect(server.received.some((message) => message.includes('CHANGE_TRADITION'))).toBe(true);
      expect(server.received.some((message) => message.includes('"TraditionType":-331546976'))).toBe(true);
      expect(server.received.some((message) => message.includes('"Action":-1326475004'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test('changes tradition and closes assignment review as one caller workflow', async () => {
    const server = await startAttributeTraditionTunerServer();
    try {
      const { port } = server.address();
      const writes: string[] = [];
      const log = vi.spyOn(GamePlayChangeTradition.prototype, 'log').mockImplementation((message?: string) => {
        if (message) writes.push(message);
      });
      try {
        await GamePlayChangeTradition.run([
          '--host',
          '127.0.0.1',
          '--port',
          String(port),
          '--player-id',
          '0',
          '--tradition-type',
          '-331546976',
          '--action',
          '-1326475004',
          '--send',
          '--closeout',
          '--reason',
          'test tradition change closeout',
          '--json',
        ]);
      } finally {
        log.mockRestore();
      }

      const payload = JSON.parse(writes.join('')) as { ok: true; result: { mode: string; stepCount: number; verified: boolean } };
      expect(payload.result.mode).toBe('send');
      expect(payload.result.stepCount).toBe(2);
      expect(payload.result.verified).toBe(true);
      expect(server.received.filter((message) => message.includes('sendOperation("player-operation"')).length).toBe(2);
      expect(server.received.some((message) => message.includes('CHANGE_TRADITION'))).toBe(true);
      expect(server.received.some((message) => message.includes('CONSIDER_ASSIGN_TRADITIONS'))).toBe(true);
    } finally {
      await server.close();
    }
  });

  test('wraps attribute review closeout as CONSIDER_ASSIGN_ATTRIBUTE', async () => {
    const server = await startAttributeTraditionTunerServer();
    try {
      const { port } = server.address();
      await GamePlayConsiderAttributes.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--player-id',
        '0',
        '--json',
      ]);

      expect(server.received.some((message) => message.includes('CONSIDER_ASSIGN_ATTRIBUTE'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test('wraps tradition review closeout as CONSIDER_ASSIGN_TRADITIONS', async () => {
    const server = await startAttributeTraditionTunerServer();
    try {
      const { port } = server.address();
      await GamePlayConsiderTraditions.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--player-id',
        '0',
        '--json',
      ]);

      expect(server.received.some((message) => message.includes('CONSIDER_ASSIGN_TRADITIONS'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      await server.close();
    }
  });
});

async function startAttributeTraditionTunerServer(): Promise<FakeTunerServer> {
  return startFakeTunerServer({
    handle({ message }) {
      if (message.includes('return JSON.stringify(validateOperation')) {
        return [JSON.stringify(operationValidation(message))];
      }
      if (message.includes('return JSON.stringify(sendOperation')) {
        return [JSON.stringify({ sent: true })];
      }
      return undefined;
    },
  });
}

function operationValidation(message: string) {
  const operationType = operationTypeFromMessage(message);
  return {
    host: '127.0.0.1',
    port: 0,
    state: { id: '1', name: 'Tuner', role: 'tuner' },
    family: 'player-operation',
    operationType,
    enumValue: operationType,
    target: { playerId: 0 },
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
  return callSource.match(/"operationType":"([^"]+)"/)?.[1] ?? 'BUY_ATTRIBUTE_TREE_NODE';
}

function operationArgs(operationType: string) {
  if (operationType === 'BUY_ATTRIBUTE_TREE_NODE') return { ProgressionTreeNodeType: 20 };
  if (operationType === 'CHANGE_TRADITION') return { TraditionType: -331546976, Action: -1326475004 };
  if (operationType === 'CONSIDER_ASSIGN_ATTRIBUTE') return {};
  if (operationType === 'CONSIDER_ASSIGN_TRADITIONS') return {};
  return undefined;
}
