import { describe, expect, test, vi } from 'vitest';
import GamePlayRehydrate from '../../src/commands/game/play/rehydrate';
import { expectNormalPlayPayloadToOmitDebugInternals } from './game/play/normal-output-boundary';
import { type FakeTunerServer, startFakeTunerServer } from './fixtures/tuner-socket-server';

describe('game play rehydrate command', () => {
  test('materializes restart rehydration continuity without sending operations', async () => {
    const server = await startRehydrateTunerServer();
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayRehydrate.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayRehydrate.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--expected-turn',
        '97',
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        snapshot: {
          readyUnit: unknown;
          continuity: { status: string; warnings: string[] };
        };
      };
      expectNormalPlayPayloadToOmitDebugInternals(payload);
      expect(payload.snapshot.readyUnit).not.toBeNull();
      expect(payload.snapshot.continuity.status).toBe('mismatch');
      expect(payload.snapshot.continuity.warnings[0]).toMatch(/turn mismatch/);
      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
      expect(server.received.some((message) => message.includes('readReadyUnitView'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendRequest'))).toBe(false);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });
});

async function startRehydrateTunerServer(): Promise<FakeTunerServer> {
  return startFakeTunerServer({
    handle({ message }) {
      if (message.includes('readPlayNotifications')) {
        return [JSON.stringify(playNotificationView())];
      }
      if (message.includes('readReadyUnitView')) {
        return [JSON.stringify(readyUnitView())];
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
    notes: ['Read-only ready-unit view. Use operation validation before any send.'],
  };
}
