import { describe, expect, test, vi } from 'vitest';
import GamePlayConsiderTownProject from '../../src/commands/game/play/consider-town-project';
import GamePlaySetTownFocus from '../../src/commands/game/play/set-town-focus';
import { type FakeTunerServer, startFakeTunerServer } from './fixtures/tuner-socket-server';

describe('game play town focus commands', () => {
  test('wraps town focus as city-command CHANGE_GROWTH_MODE', async () => {
    const server = await startTownFocusTunerServer();
    try {
      const { port } = server.address();
      await GamePlaySetTownFocus.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--city-id',
        '{"owner":0,"id":131073,"type":1}',
        '--growth-type',
        '-284569333',
        '--project-type',
        '-548685232',
        '--json',
      ]);

      expect(server.received.some((message) => message.includes('validateOperation("city-command"'))).toBe(true);
      expect(server.received.some((message) => message.includes('CHANGE_GROWTH_MODE'))).toBe(true);
      expect(server.received.some((message) => message.includes('"Type":-284569333'))).toBe(true);
      expect(server.received.some((message) => message.includes('"ProjectType":-548685232'))).toBe(true);
      expect(server.received.some((message) => message.includes('"City":131073'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test('sets town focus and closes town project review as one caller workflow', async () => {
    const server = await startTownFocusTunerServer();
    try {
      const { port } = server.address();
      const writes: string[] = [];
      const log = vi.spyOn(GamePlaySetTownFocus.prototype, 'log').mockImplementation((message?: string) => {
        if (message) writes.push(message);
      });
      try {
        await GamePlaySetTownFocus.run([
          '--host',
          '127.0.0.1',
          '--port',
          String(port),
          '--city-id',
          '{"owner":0,"id":131073,"type":1}',
          '--growth-type',
          '-284569333',
          '--project-type',
          '-548685232',
          '--send',
          '--closeout',
          '--reason',
          'test town focus closeout',
          '--json',
        ]);
      } finally {
        log.mockRestore();
      }

      const payload = JSON.parse(writes.join('')) as { ok: true; result: { mode: string; stepCount: number; verified: boolean } };
      expect(payload.result.mode).toBe('send');
      expect(payload.result.stepCount).toBe(2);
      expect(payload.result.verified).toBe(true);
      expect(server.received.filter((message) => message.includes('sendOperation(')).length).toBe(2);
      expect(server.received.some((message) => message.includes('sendOperation("city-command"'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation("city-operation"'))).toBe(true);
      expect(server.received.some((message) => message.includes('CHANGE_GROWTH_MODE'))).toBe(true);
      expect(server.received.some((message) => message.includes('CONSIDER_TOWN_PROJECT'))).toBe(true);
    } finally {
      await server.close();
    }
  });

  test('wraps town project review closeout as CONSIDER_TOWN_PROJECT', async () => {
    const server = await startTownFocusTunerServer();
    try {
      const { port } = server.address();
      await GamePlayConsiderTownProject.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--city-id',
        '{"owner":0,"id":131073,"type":1}',
        '--json',
      ]);

      expect(server.received.some((message) => message.includes('validateOperation("city-operation"'))).toBe(true);
      expect(server.received.some((message) => message.includes('CONSIDER_TOWN_PROJECT'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      await server.close();
    }
  });
});

async function startTownFocusTunerServer(): Promise<FakeTunerServer> {
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
  const family = operationType === 'CHANGE_GROWTH_MODE' ? 'city-command' : 'city-operation';
  return {
    host: '127.0.0.1',
    port: 0,
    state: { id: '1', name: 'Tuner', role: 'tuner' },
    family,
    operationType,
    enumValue: operationType,
    target: { cityId: { owner: 0, id: 65536, type: 25 } },
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
  return callSource.match(/"operationType":"([^"]+)"/)?.[1] ?? 'CHANGE_GROWTH_MODE';
}

function operationArgs(operationType: string) {
  if (operationType === 'CHANGE_GROWTH_MODE') return { Type: -284569333, ProjectType: -548685232, City: 131073 };
  if (operationType === 'CONSIDER_TOWN_PROJECT') return {};
  return undefined;
}
