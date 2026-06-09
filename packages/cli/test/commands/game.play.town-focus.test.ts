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
          '--json',
        ]);
      } finally {
        log.mockRestore();
      }

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        result: {
          mode: string;
          stepCount: number;
          status: string;
          steps: Array<{ result: Record<string, unknown> }>;
        };
      };
      expect(payload.result.mode).toBe('send');
      expect(payload.result.stepCount).toBe(2);
      expect(payload.result.status).toBe('sent-unverified');
      expect(payload.result.steps).toHaveLength(2);
      expect(payload.result.steps[0].result.status).toBe('sent-unverified');
      expect(payload.result.steps[0].result.cityId).toEqual({ owner: 0, id: 131073, type: 1 });
      expect(payload.result.steps[0].result.growthType).toBe(-284569333);
      expect(payload.result.steps[0].result.projectType).toBe(-548685232);
      expect(payload.result.steps[1].result.status).toBe('sent-unverified');
      expectSemanticTownFocusOmitsRawRuntimeDetails(payload.result);
      expect(server.received.filter((message) => message.includes('sendOperation(')).length).toBe(2);
      expect(server.received.some((message) => message.includes('sendOperation("city-command"'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation("city-operation"'))).toBe(true);
      expect(server.received.some((message) => message.includes('CHANGE_GROWTH_MODE'))).toBe(true);
      expect(server.received.some((message) => message.includes('CONSIDER_TOWN_PROJECT'))).toBe(true);
      expect(server.received.some((message) => message.includes('Network.isInSession'))).toBe(true);
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

  test('sends town project review through city town-focus oRPC', async () => {
    const server = await startTownFocusTunerServer();
    try {
      const { port } = server.address();
      const writes: string[] = [];
      const log = vi.spyOn(GamePlayConsiderTownProject.prototype, 'log').mockImplementation((message?: string) => {
        if (message) writes.push(message);
      });
      try {
        await GamePlayConsiderTownProject.run([
          '--host',
          '127.0.0.1',
          '--port',
          String(port),
          '--city-id',
          '{"owner":0,"id":131073,"type":1}',
          '--send',
          '--json',
        ]);
      } finally {
        log.mockRestore();
      }

      const payload = JSON.parse(writes.join('')) as { ok: true; result: Record<string, unknown> };
      expect(payload.result.cityId).toEqual({ owner: 0, id: 131073, type: 1 });
      expect(payload.result.sent).toBe(true);
      expect(payload.result.status).toBe('sent-unverified');
      expectSemanticTownFocusOmitsRawRuntimeDetails(payload.result);
      expect(server.received.some((message) => message.includes('Network.isInSession'))).toBe(true);
      expect(server.received.some((message) => message.includes('CONSIDER_TOWN_PROJECT'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation("city-operation"'))).toBe(true);
    } finally {
      await server.close();
    }
  });
});

async function startTownFocusTunerServer(): Promise<FakeTunerServer> {
  return startFakeTunerServer({
    handle({ message }) {
      if (message.includes('Network.isInSession')) {
        return [JSON.stringify(appUiSnapshot())];
      }
      if (message.includes('evalOk') && message.includes('GameplayMap.getGridWidth')) {
        return [JSON.stringify(tunerHealthSnapshot())];
      }
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

function expectSemanticTownFocusOmitsRawRuntimeDetails(result: unknown) {
  const json = JSON.stringify(result);
  expect(json).not.toContain('"operation"');
  expect(json).not.toContain('"command"');
  expect(json).not.toContain('"payload"');
  expect(json).not.toContain('"before"');
  expect(json).not.toContain('"after"');
  expect(json).not.toContain('"state"');
  expect(json).not.toContain('"host"');
  expect(json).not.toContain('"port"');
  expect(json).not.toContain('"verified"');
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
      turn: 42,
      age: 0,
      maxTurns: 0,
      turnDate: { ok: true, value: '3550 BCE' },
      hash: { ok: true, value: 0 },
    },
    ui: {
      inGame: { ok: true, value: true },
      inShell: { ok: true, value: false },
      inLoading: { ok: true, value: false },
      loadingState: { ok: true, value: 6 },
      loadingStateName: 'WaitingForUIReady',
      canBeginGame: { ok: true, value: false },
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
    turn: { ok: true, value: 42 },
    turnDate: { ok: true, value: '3550 BCE' },
    width: { ok: true, value: 84 },
    height: { ok: true, value: 54 },
    aliveIds: { ok: true, value: [0] },
    aliveHumanIds: { ok: true, value: [0] },
    autoplayActive: { ok: true, value: false },
  };
}
