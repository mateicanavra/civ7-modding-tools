import { describe, expect, test, vi } from 'vitest';
import GamePlayAssignWorker from '../../src/commands/game/play/assign-worker';
import GamePlayExpandCity from '../../src/commands/game/play/expand-city';
import { type FakeTunerServer, startFakeTunerServer } from './fixtures/tuner-socket-server';

describe('game play population placement commands', () => {
  test('wraps growth worker assignment as ASSIGN_WORKER', async () => {
    const server = await startPopulationPlacementTunerServer();
    try {
      const { port } = server.address();
      await GamePlayAssignWorker.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--player-id',
        '0',
        '--location',
        '2543',
        '--amount',
        '1',
        '--json',
      ]);

      expect(server.received.some((message) => message.includes('ASSIGN_WORKER'))).toBe(true);
      expect(server.received.some((message) => message.includes('"Location":2543'))).toBe(true);
      expect(server.received.some((message) => message.includes('"Amount":1'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test('reports population postconditions for sent worker assignments', async () => {
    const server = await startPopulationPlacementTunerServer();
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayAssignWorker.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayAssignWorker.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--player-id',
        '0',
        '--location',
        '2543',
        '--send',
        '--reason',
        'test population worker placement',
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        result: {
          verified: boolean;
          populationPostcondition: {
            classification: string;
            readyCleared: boolean;
            placementStateChanged: boolean;
            reason: string;
          };
        };
      };
      expect(payload.result.verified).toBe(true);
      expect(payload.result.populationPostcondition.classification).toBe('population-ready-cleared');
      expect(payload.result.populationPostcondition.readyCleared).toBe(true);
      expect(payload.result.populationPostcondition.placementStateChanged).toBe(true);
      expect(payload.result.populationPostcondition.reason).toMatch(/Growth\.isReadyToPlacePopulation cleared/);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('wraps city expansion placement as city-command EXPAND', async () => {
    const server = await startPopulationPlacementTunerServer();
    try {
      const { port } = server.address();
      await GamePlayExpandCity.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--city-id',
        '{"owner":0,"id":196610,"type":1}',
        '--x',
        '16',
        '--y',
        '19',
        '--json',
      ]);

      expect(server.received.some((message) => message.includes('validateOperation("city-command"'))).toBe(true);
      expect(server.received.some((message) => message.includes('EXPAND'))).toBe(true);
      expect(server.received.some((message) => message.includes('"X":16'))).toBe(true);
      expect(server.received.some((message) => message.includes('"Y":19'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test('reports population postconditions for sent city expansions', async () => {
    const server = await startPopulationPlacementTunerServer();
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayExpandCity.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayExpandCity.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--city-id',
        '{"owner":0,"id":196610,"type":1}',
        '--x',
        '16',
        '--y',
        '19',
        '--send',
        '--reason',
        'test population expansion placement',
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        result: {
          verified: boolean;
          populationPostcondition: {
            classification: string;
            readyCleared: boolean;
            placementStateChanged: boolean;
            reason: string;
          };
        };
      };
      expect(payload.result.verified).toBe(true);
      expect(payload.result.populationPostcondition.classification).toBe('population-ready-cleared');
      expect(payload.result.populationPostcondition.readyCleared).toBe(true);
      expect(payload.result.populationPostcondition.placementStateChanged).toBe(true);
      expect(payload.result.populationPostcondition.reason).toMatch(/Growth\.isReadyToPlacePopulation cleared/);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });
});

async function startPopulationPlacementTunerServer(): Promise<FakeTunerServer> {
  return startFakeTunerServer({
    handle({ message }) {
      if (message.includes('return JSON.stringify(validateOperation')) {
        return [JSON.stringify(operationValidation(message))];
      }
      if (message.includes('return JSON.stringify(sendOperation')) {
        return [JSON.stringify({
          sent: true,
          beforePopulationPostcondition: populationPlacementPostconditionSnapshot(true),
          afterPopulationPostcondition: populationPlacementPostconditionSnapshot(false),
        })];
      }
      return undefined;
    },
  });
}

function operationValidation(message: string) {
  const operationType = operationTypeFromMessage(message);
  const family = operationType === 'EXPAND' ? 'city-command' : 'player-operation';
  return {
    host: '127.0.0.1',
    port: 0,
    state: { id: '1', name: 'Tuner', role: 'tuner' },
    family,
    operationType,
    enumValue: operationType,
    target: family === 'city-command'
      ? { cityId: { owner: 0, id: 65536, type: 25 } }
      : { playerId: 0 },
    args: operationType === 'EXPAND'
      ? { X: 16, Y: 19 }
      : { Location: 2543, Amount: 1 },
    valid: true,
    result: { Success: true },
  };
}

function operationTypeFromMessage(message: string) {
  const validateIndex = message.lastIndexOf('validateOperation("');
  const sendIndex = message.lastIndexOf('sendOperation("');
  const callIndex = Math.max(validateIndex, sendIndex);
  const callSource = callIndex >= 0 ? message.slice(callIndex) : message;
  return callSource.match(/"operationType":"([^"]+)"/)?.[1] ?? 'ASSIGN_WORKER';
}

function populationPlacementPostconditionSnapshot(isReadyToPlacePopulation: boolean) {
  return {
    cityId: { owner: 0, id: 196610, type: 1 },
    city: {
      ok: true,
      value: {
        id: { owner: 0, id: 196610, type: 1 },
        population: isReadyToPlacePopulation ? 4 : 5,
        isTown: true,
        location: { x: 20, y: 20 },
      },
    },
    isReadyToPlacePopulation: { ok: true, value: isReadyToPlacePopulation },
    cityWorkerCap: { ok: true, value: isReadyToPlacePopulation ? 4 : 5 },
    workablePlotIndexes: { ok: true, value: isReadyToPlacePopulation ? [2543, 2544] : [2543, 2544, 2545] },
    blockedPlotIndexes: { ok: true, value: isReadyToPlacePopulation ? [2545] : [] },
    expansionPlotIndexes: { ok: true, value: isReadyToPlacePopulation ? [1660] : [1661] },
  };
}
