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
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        result: ProductionChoiceSendResult;
      };
      expect(payload.result.sent).toBe(true);
      expect(payload.result.status).toBe('sent-confirmed');
      expect(payload.result.cityId).toEqual({ owner: 0, id: 65536, type: 1 });
      expect(payload.result.args).toEqual({ ConstructibleType: 713967338, X: 22, Y: 31 });
      expect(payload.result.validation).toEqual({ beforeValid: true, afterValid: true });
      expect(payload.result.postcondition).toMatchObject({
        classification: 'production-choice-cleared',
        outcome: 'cleared',
        confidence: 'confirmed',
        confirmed: true,
        noRepeatAfterUnverified: false,
        productionStateChanged: true,
        blockerStillLive: false,
      });
      expect(payload.result.nextSteps[0]).toMatchObject({
        kind: 'refresh-attention',
        source: 'city.production.choice.request',
      });
      expectSemanticProductionChoiceOmitsRawRuntimeDetails(payload.result);
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
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        result: ProductionChoiceSendResult;
      };
      expect(payload.result.sent).toBe(true);
      expect(payload.result.status).toBe('sent-unverified');
      expect(payload.result.postcondition).toMatchObject({
        classification: 'production-state-changed-blocker-still-live',
        outcome: 'still-blocked',
        confidence: 'unverified',
        confirmed: false,
        noRepeatAfterUnverified: true,
        productionStateChanged: true,
        blockerStillLive: true,
      });
      expect(payload.result.postcondition.reason).toContain('production-choice notification still blocks');
      expect(payload.result.nextSteps[0]).toMatchObject({
        kind: 'do-not-repeat',
        source: 'city.production.choice.request',
      });
      expectSemanticProductionChoiceOmitsRawRuntimeDetails(payload.result);
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

type ProductionChoiceSendResult = {
  cityId: { owner: number; id: number; type: number };
  args: Record<string, number>;
  sent: boolean;
  status: string;
  validation: { beforeValid: boolean; afterValid: boolean };
  postcondition: {
    classification: string;
    reason: string;
    outcome: string;
    confidence: string;
    confirmed: boolean;
    noRepeatAfterUnverified: boolean;
    productionStateChanged: boolean | null;
    blockerStillLive: boolean | null;
  };
  nextSteps: Array<{ kind: string; source: string; label: string }>;
};

function expectSemanticProductionChoiceOmitsRawRuntimeDetails(result: unknown) {
  const serialized = JSON.stringify(result);
  expect(serialized).not.toContain('"host"');
  expect(serialized).not.toContain('"port"');
  expect(serialized).not.toContain('"state"');
  expect(serialized).not.toContain('"session"');
  expect(serialized).not.toContain('"rawCommand"');
  expect(serialized).not.toContain('"command"');
  expect(serialized).not.toContain('"payload"');
  expect(serialized).not.toContain('"sendResult"');
  expect(serialized).not.toContain('"verified"');
  expect(serialized).not.toContain('"beforeProductionPostcondition"');
  expect(serialized).not.toContain('"afterProductionPostcondition"');
  expect(serialized).not.toContain('"productionPostcondition"');
  expect(serialized).not.toContain('"ui"');
  expect(serialized).not.toContain('Game.CityOperations');
  expect(serialized).not.toContain('UI?.Player?.selectCity');
  expect(serialized).not.toContain('InterfaceMode?.switchToDefault');
}

type ProductionTunerServer = FakeTunerServer;

async function startProductionTunerServer(options: {
  productionPostconditionMode?: 'cleared' | 'blocker-still-live';
} = {}): Promise<ProductionTunerServer> {
  let productionChoiceSent = false;
  return startFakeTunerServer({
    handle({ message }) {
      if (message.includes('Network.isInSession')) {
        return [JSON.stringify(appUiSnapshot())];
      }
      if (message.includes('evalOk') && message.includes('GameplayMap.getGridWidth')) {
        return [JSON.stringify(tunerHealthSnapshot())];
      }
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

function appUiSnapshot() {
  return {
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
  };
}

function tunerHealthSnapshot() {
  return {
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
  };
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
