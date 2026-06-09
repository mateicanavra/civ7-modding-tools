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
          '--node',
          '20',
          '--send',
          '--closeout',
          '--json',
        ]);
      } finally {
        log.mockRestore();
      }

      const payload = JSON.parse(writes.join('')) as { ok: true; result: { mode: string; stepCount: number; status: string; steps: Array<{ result: unknown }> } };
      expect(payload.result.mode).toBe('send');
      expect(payload.result.stepCount).toBe(2);
      expect(payload.result.status).toBe('sent-unverified');
      expect(payload.result.steps).toHaveLength(2);
      expect(server.received.filter((message) => message.includes('sendOperation("player-operation"')).length).toBe(2);
      expect(server.received.some((message) => message.includes('BUY_ATTRIBUTE_TREE_NODE'))).toBe(true);
      expect(server.received.some((message) => message.includes('CONSIDER_ASSIGN_ATTRIBUTE'))).toBe(true);
      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
      expect(JSON.stringify(payload)).toContain('"playerId":0');
      expect(JSON.stringify(payload)).not.toContain('"verified"');
      expectSemanticProgressionPlayerChoiceOmitsRawRuntimeDetails(payload.result);
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
          '--tradition-type',
          '-331546976',
          '--action',
          '-1326475004',
          '--send',
          '--closeout',
          '--json',
        ]);
      } finally {
        log.mockRestore();
      }

      const payload = JSON.parse(writes.join('')) as { ok: true; result: { mode: string; stepCount: number; status: string; steps: Array<{ result: unknown }> } };
      expect(payload.result.mode).toBe('send');
      expect(payload.result.stepCount).toBe(2);
      expect(payload.result.status).toBe('sent-unverified');
      expect(payload.result.steps).toHaveLength(2);
      expect(server.received.filter((message) => message.includes('sendOperation("player-operation"')).length).toBe(2);
      expect(server.received.some((message) => message.includes('CHANGE_TRADITION'))).toBe(true);
      expect(server.received.some((message) => message.includes('CONSIDER_ASSIGN_TRADITIONS'))).toBe(true);
      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
      expect(JSON.stringify(payload)).toContain('"playerId":0');
      expect(JSON.stringify(payload)).not.toContain('"verified"');
      expectSemanticProgressionPlayerChoiceOmitsRawRuntimeDetails(payload.result);
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

  test('sends attribute review closeout through progression oRPC without caller player id', async () => {
    const server = await startAttributeTraditionTunerServer();
    try {
      const { port } = server.address();
      const writes: string[] = [];
      const log = vi.spyOn(GamePlayConsiderAttributes.prototype, 'log').mockImplementation((message?: string) => {
        if (message) writes.push(message);
      });
      try {
        await GamePlayConsiderAttributes.run([
          '--host',
          '127.0.0.1',
          '--port',
          String(port),
          '--send',
          '--json',
        ]);
      } finally {
        log.mockRestore();
      }

      const payload = JSON.parse(writes.join('')) as { ok: true; result: Record<string, unknown> };
      expect(payload.result.playerId).toBe(0);
      expect(payload.result.sent).toBe(true);
      expect(payload.result.status).toBe('sent-unverified');
      expect(JSON.stringify(payload.result)).not.toContain('"verified"');
      expectSemanticProgressionPlayerChoiceOmitsRawRuntimeDetails(payload.result);
      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
      expect(server.received.some((message) => message.includes('CONSIDER_ASSIGN_ATTRIBUTE'))).toBe(true);
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

  test('sends tradition review closeout through progression oRPC without caller player id', async () => {
    const server = await startAttributeTraditionTunerServer();
    try {
      const { port } = server.address();
      const writes: string[] = [];
      const log = vi.spyOn(GamePlayConsiderTraditions.prototype, 'log').mockImplementation((message?: string) => {
        if (message) writes.push(message);
      });
      try {
        await GamePlayConsiderTraditions.run([
          '--host',
          '127.0.0.1',
          '--port',
          String(port),
          '--send',
          '--json',
        ]);
      } finally {
        log.mockRestore();
      }

      const payload = JSON.parse(writes.join('')) as { ok: true; result: Record<string, unknown> };
      expect(payload.result.playerId).toBe(0);
      expect(payload.result.sent).toBe(true);
      expect(payload.result.status).toBe('sent-unverified');
      expect(JSON.stringify(payload.result)).not.toContain('"verified"');
      expectSemanticProgressionPlayerChoiceOmitsRawRuntimeDetails(payload.result);
      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
      expect(server.received.some((message) => message.includes('CONSIDER_ASSIGN_TRADITIONS'))).toBe(true);
    } finally {
      await server.close();
    }
  });
});

async function startAttributeTraditionTunerServer(): Promise<FakeTunerServer> {
  return startFakeTunerServer({
    handle({ message }) {
      if (message.includes('Network.isInSession')) {
        return [JSON.stringify(appUiSnapshot())];
      }
      if (message.includes('evalOk') && message.includes('GameplayMap.getGridWidth')) {
        return [JSON.stringify(tunerHealthSnapshot())];
      }
      if (message.includes('readPlayNotifications')) {
        return [JSON.stringify(playNotificationView())];
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

function expectSemanticProgressionPlayerChoiceOmitsRawRuntimeDetails(result: unknown) {
  const json = JSON.stringify(result);
  expect(json).not.toContain('"operation"');
  expect(json).not.toContain('"command"');
  expect(json).not.toContain('"payload"');
  expect(json).not.toContain('"before"');
  expect(json).not.toContain('"after"');
  expect(json).not.toContain('"state"');
  expect(json).not.toContain('"host"');
  expect(json).not.toContain('"port"');
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

function playNotificationView() {
  return {
    ok: true,
    localPlayerId: 0,
    turn: 42,
    canEndTurn: { ok: true, value: false },
    blocker: { kind: 'none' },
    notifications: [],
    current: null,
    recommendations: [],
    nextSteps: [],
    limits: { maxNotifications: 25, truncated: false },
    diagnostics: [],
    priorities: [],
    semanticEnvelope: {
      blockers: [],
      decisions: [],
      actions: [],
      nextSteps: [],
    },
  };
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
