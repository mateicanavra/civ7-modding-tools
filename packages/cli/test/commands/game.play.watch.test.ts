import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, test, vi } from 'vitest';
import GameWatch from '../../src/commands/game/watch';
import { type FakeTunerServer, startFakeTunerServer } from './fixtures/tuner-socket-server';
import { expectNormalPlayPayloadToOmitDebugInternals } from './game/play/normal-output-boundary';

describe('game watch command', () => {
  test('watches live play as JSONL without sending operations', async () => {
    const server = await startWatchTunerServer();
    const writes: string[] = [];
    const log = vi.spyOn(GameWatch.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GameWatch.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--count',
        '2',
        '--interval-ms',
        '1',
        '--include-ready-unit',
        '--include-ready-city',
        '--jsonl',
      ]);

      const observations = writes.map((line) => JSON.parse(line)) as Array<{
        ok: boolean;
        schema: string;
        mode: string;
        wrapper: string;
        firstReadyUnitId: unknown;
        readyUnit: {
          legalOperationScope: string;
          legalNoTargetOperationCount: number;
          legalOperationCount: number;
        } | null;
        readyCity: unknown;
      }>;
      expect(observations).toHaveLength(2);
      for (const observation of observations) expectNormalPlayPayloadToOmitDebugInternals(observation);
      expect(observations[0].schema).toBe('civ7-watcher-observation.v1');
      expect(observations[0].mode).toBe('human-turn-watch');
      expect(observations[0].wrapper).toBe('getCiv7PlayNotificationView+getCiv7ReadyUnitView+getCiv7ReadyCityView');
      expect(observations[0]).not.toHaveProperty('cli');
      expect(JSON.stringify(observations[0])).not.toContain('game watch');
      expect(observations[0].ok).toBe(true);
      expect(observations[0].firstReadyUnitId).toEqual({ owner: 0, id: 458752, type: 26 });
      expect(observations[0].readyUnit).not.toBeNull();
      expect(observations[0].readyUnit?.legalOperationScope).toBe('no-target');
      expect(observations[0].readyUnit?.legalNoTargetOperationCount).toBe(observations[0].readyUnit?.legalOperationCount);
      expect(observations[0].readyCity).not.toBeNull();
      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
      expect(server.received.some((message) => message.includes('readReadyUnitView'))).toBe(true);
      expect(server.received.some((message) => message.includes('readReadyCityView'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendRequest'))).toBe(false);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('appends watch observations to an artifact file', async () => {
    const server = await startWatchTunerServer();
    const tempDir = await mkdtemp(join(tmpdir(), 'civ7-watch-'));
    const artifact = join(tempDir, 'watcher.jsonl');
    try {
      const { port } = server.address();
      await GameWatch.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--count',
        '2',
        '--interval-ms',
        '1',
        '--artifact',
        artifact,
        '--json',
      ]);

      const lines = (await readFile(artifact, 'utf8')).trim().split('\n');
      expect(lines).toHaveLength(2);
      for (const line of lines) expectNormalPlayPayloadToOmitDebugInternals(JSON.parse(line));
      expect(JSON.parse(lines[0])).toMatchObject({
        schema: 'civ7-watcher-observation.v1',
        ok: true,
        stateRole: 'app-ui',
      });
      expect(JSON.parse(lines[0])).not.toHaveProperty('cli');
      expect(lines[0]).not.toContain('game watch');
      expect(server.received.some((message) => message.includes('sendRequest'))).toBe(false);
    } finally {
      await rm(tempDir, { force: true, recursive: true });
      await server.close();
    }
  });
});

async function startWatchTunerServer(): Promise<FakeTunerServer> {
  return startFakeTunerServer({
    handle({ message }) {
      if (message.includes('readPlayNotifications')) {
        return [JSON.stringify(playNotificationView())];
      }
      if (message.includes('readReadyUnitView')) {
        return [JSON.stringify(readyUnitView())];
      }
      if (message.includes('readReadyCityView')) {
        return [JSON.stringify(readyCityView())];
      }
      return undefined;
    },
  });
}

function playNotificationView() {
  const unitId = { owner: 0, id: 458752, type: 26 };
  return {
    localPlayerId: 0,
    turn: { ok: true, value: 80 },
    turnDate: { ok: true, value: '2025 BCE' },
    hasSentTurnComplete: { ok: true, value: false },
    canEndTurn: { ok: true, value: false },
    blocker: { ok: true, value: 0 },
    blockingNotificationId: { ok: true, value: null },
    selectedUnitId: { ok: true, value: null },
    selectedCityId: { ok: true, value: null },
    firstReadyUnitId: { ok: true, value: unitId },
    notifications: [],
    decisions: [],
    hud: {
      nextDecision: null,
      decisionQueue: [],
    },
    limits: { maxNotifications: 25, truncated: false },
  };
}

function readyUnitView() {
  const unitId = { owner: 0, id: 458752, type: 26 };
  return {
    localPlayerId: 0,
    requestedUnitId: null,
    selectedUnitId: { ok: true, value: null },
    firstReadyUnitId: { ok: true, value: unitId },
    unitId,
    unit: {
      ok: true,
      value: {
        id: unitId,
        owner: 0,
        type: 111,
        typeName: 'UNIT_ARMY_COMMANDER',
        location: { x: 22, y: 31 },
        movementMovesRemaining: 2,
        attacksRemaining: 0,
        damage: 0,
        hitPoints: 100,
      },
    },
    legalOperations: [
      {
        family: 'unit-operation',
        operationType: 'SKIP_TURN',
        enumValue: 1,
        valid: true,
        result: { Success: true },
      },
    ],
    promotionReadiness: {
      ok: true,
      value: {
        canPurchase: false,
        availablePromotions: [],
      },
    },
    nearby: { ok: true, value: [] },
    notes: ['Read-only ready-unit view. Use operation validation before mutation.'],
  };
}

function readyCityView() {
  const cityId = { owner: 0, id: 131073, type: 1 };
  return {
    localPlayerId: 0,
    requestedCityId: null,
    selectedCityId: { ok: true, value: cityId },
    blockingCityId: { ok: true, value: cityId },
    cityId,
    city: {
      ok: true,
      value: {
        id: cityId,
        name: 'Dur-Sharrukin',
        population: 4,
        isTown: true,
      },
    },
    legalOperations: [
      {
        family: 'city-operation',
        operationType: 'CONSIDER_TOWN_PROJECT',
        enumValue: 1,
        valid: true,
        result: { Success: true },
      },
    ],
    productionCandidates: { ok: true, value: [] },
    townFocusOptions: { ok: true, value: [] },
    populationPlacement: { ok: true, value: null },
    notes: ['Read-only ready-city view.'],
  };
}
