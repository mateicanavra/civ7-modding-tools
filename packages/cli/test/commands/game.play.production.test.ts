import { describe, expect, test, vi } from 'vitest';
import GamePlayBuildProduction from '../../src/commands/game/play/build-production';
import GamePlayBuildUnit from '../../src/commands/game/play/build-unit';
import { type FakeTunerServer, startFakeTunerServer } from './fixtures/tuner-socket-server';

describe('game play production commands', () => {
  test('wraps city unit production as BUILD with UnitType', async () => {
    const server = await startProductionTunerServer();
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayBuildUnit.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayBuildUnit.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--city-id',
        '{"owner":0,"id":65536,"type":25}',
        '--unit-type',
        '1558890441',
        '--send',
        '--reason',
        'test unit production',
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as { ok: true; result: { populationPostcondition?: unknown } };
      expect(payload.result.populationPostcondition).toBeUndefined();
      expect(server.received.some((message) => message.includes('BUILD'))).toBe(true);
      expect(server.received.some((message) => message.includes('"UnitType":1558890441'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation("city-operation"'))).toBe(true);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('wraps placement-sensitive constructible production as BUILD with coordinates', async () => {
    const server = await startProductionTunerServer();
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayBuildProduction.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayBuildProduction.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--city-id',
        '{"owner":0,"id":65536,"type":1}',
        '--constructible-type',
        '713967338',
        '--x',
        '22',
        '--y',
        '31',
        '--send',
        '--reason',
        'test constructible production placement',
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        result: {
          sent: boolean;
          verified: boolean;
          productionPostcondition: { classification: string };
          payload: { ui: { cityActivation: { ok: boolean }; interfaceClose: { ok: boolean } } };
        };
      };
      expect(payload.result.sent).toBe(true);
      expect(payload.result.verified).toBe(true);
      expect(payload.result.productionPostcondition.classification).toBe('production-choice-cleared');
      expect(payload.result.payload.ui.cityActivation.ok).toBe(true);
      expect(payload.result.payload.ui.interfaceClose.ok).toBe(true);
      expect(server.received.some((message) => message.includes('BUILD'))).toBe(true);
      expect(server.received.some((message) => message.includes('"ConstructibleType":713967338'))).toBe(true);
      expect(server.received.some((message) => message.includes('"X":22'))).toBe(true);
      expect(server.received.some((message) => message.includes('"Y":31'))).toBe(true);
      expect(server.received.some((message) => message.includes('readProductionChoice'))).toBe(true);
      expect(server.received.some((message) => message.includes('UI?.Player?.selectCity'))).toBe(true);
      expect(server.received.some((message) => message.includes('InterfaceMode?.switchToDefault'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation("city-operation"'))).toBe(false);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('reports sticky production-choice blockers after BUILD sends', async () => {
    const server = await startProductionTunerServer({ productionPostconditionMode: 'blocker-still-live' });
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayBuildProduction.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayBuildProduction.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--city-id',
        '{"owner":0,"id":65536,"type":25}',
        '--unit-type',
        '1558890441',
        '--send',
        '--reason',
        'test production closeout',
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        result: {
          verified: boolean;
          productionPostcondition: {
            classification: string;
            productionStateChanged: boolean;
            blockerStillLive: boolean;
            reason: string;
          };
        };
      };
      expect(payload.result.verified).toBe(false);
      expect(payload.result.productionPostcondition).toMatchObject({
        classification: 'production-state-changed-blocker-still-live',
        productionStateChanged: true,
        blockerStillLive: true,
      });
      expect(payload.result.productionPostcondition.reason).toContain('production-choice notification still blocks');
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('requires exactly one production item kind', async () => {
    await expect(GamePlayBuildProduction.run([
      '--city-id',
      '{"owner":0,"id":65536,"type":1}',
      '--json',
    ])).rejects.toThrow(/requires exactly one/);
  });
});

type ProductionTunerServer = FakeTunerServer;

async function startProductionTunerServer(options: {
  productionPostconditionMode?: 'cleared' | 'blocker-still-live';
} = {}): Promise<ProductionTunerServer> {
  let productionChoiceSent = false;
  return startFakeTunerServer({
    handle({ message }) {
      if (message.includes('readProductionChoice')) {
        const send = message.includes('"send":true');
        if (send) productionChoiceSent = true;
        return [JSON.stringify(productionChoicePayload(
          send,
          options.productionPostconditionMode ?? 'cleared',
          productionChoiceSent && !send,
        ))];
      }
      if (message.includes('return JSON.stringify(sendOperation')) {
        return [JSON.stringify({
          sent: true,
          beforeProductionPostcondition: productionPostconditionSnapshot('before', options.productionPostconditionMode ?? 'cleared'),
          afterProductionPostcondition: productionPostconditionSnapshot('after', options.productionPostconditionMode ?? 'cleared'),
        })];
      }
      if (message.includes('return JSON.stringify(validateOperation')) {
        return [JSON.stringify(operationValidation(message))];
      }
      return undefined;
    },
  });
}

function operationValidation(message: string) {
  return {
    host: '127.0.0.1',
    port: 0,
    state: { id: '1', name: 'Tuner', role: 'tuner' },
    family: 'city-operation',
    operationType: 'BUILD',
    enumValue: 'BUILD',
    target: { cityId: { owner: 0, id: 65536, type: 25 } },
    args: operationArgs(message),
    valid: true,
    result: { Success: true },
  };
}

function operationArgs(message = '') {
  if (message.includes('ConstructibleType')) {
    return { ConstructibleType: 713967338, X: 22, Y: 31 };
  }
  if (message.includes('ProjectType')) return { ProjectType: 12345 };
  return { UnitType: 1558890441 };
}

function productionPostconditionSnapshot(
  phase: 'before' | 'after',
  mode: 'cleared' | 'blocker-still-live',
) {
  const cityId = { owner: 0, id: 65536, type: 25 };
  const notification = {
    id: { owner: 0, id: 6, type: 20 },
    type: 1090224621,
    typeName: 'NOTIFICATION_CHOOSE_CITY_PRODUCTION',
    target: cityId,
    matchesCity: true,
    canUserDismiss: false,
    expired: true,
    dismissed: false,
  };
  return {
    cityId,
    city: {
      ok: true,
      value: {
        id: cityId,
        population: 3,
        isTown: false,
        location: { x: 26, y: 36 },
      },
    },
    buildQueue: {
      ok: true,
      value: {
        currentProductionTypeHash: phase === 'before' ? 713967338 : 1558890441,
        previousProductionTypeHash: 0,
        productionProgress: phase === 'before' ? 12 : 0,
        turnsLeftForRequestedItem: phase === 'before' ? -1 : 4,
        queueLength: 1,
      },
    },
    selectedCityId: { ok: true, value: phase === 'before' ? cityId : null },
    blocker: { ok: true, value: mode === 'cleared' && phase === 'after' ? 0 : 1090224621 },
    canEndTurn: { ok: true, value: mode === 'cleared' && phase === 'after' },
    blockingProductionNotification: {
      ok: true,
      value: mode === 'blocker-still-live' || phase === 'before' ? notification : null,
    },
  };
}

function productionChoicePayload(
  send: boolean,
  mode: 'cleared' | 'blocker-still-live',
  settled = false,
) {
  const cityId = { owner: 0, id: 65536, type: 25 };
  const before = productionPostconditionSnapshot('before', mode);
  const after = productionPostconditionSnapshot(settled || send ? 'after' : 'before', mode);
  return {
    cityId,
    args: { UnitType: 1558890441 },
    beforeValidation: { ok: true, value: { Success: true } },
    afterValidation: { ok: true, value: { Success: true } },
    sent: send,
    sendResult: send ? { ok: true, value: true } : { ok: false, skipped: true, reason: 'send not requested' },
    beforeProductionPostcondition: before,
    afterProductionPostcondition: after,
    ui: {
      cityActivation: send ? { ok: true, value: { selectedCityId: cityId } } : { ok: false, skipped: true, reason: 'read-only production choice status' },
      interfaceClose: send ? { ok: true, value: { selectedCityId: null, interfaceMode: 'INTERFACEMODE_DEFAULT' } } : { ok: false, skipped: true, reason: 'send not requested' },
    },
    notes: ['This mirrors the official production chooser path.'],
  };
}
