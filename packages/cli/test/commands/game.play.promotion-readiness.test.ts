import { describe, expect, test, vi } from 'vitest';
import GamePlayPromotionReadiness from '../../src/commands/game/play/promotion-readiness';
import { type FakeTunerServer, startFakeTunerServer } from './fixtures/tuner-socket-server';

describe('game play promotion readiness command', () => {
  test('reads promotion readiness without sending promotion commands', async () => {
    const server = await startPromotionReadinessTunerServer();
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayPromotionReadiness.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayPromotionReadiness.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        view: { promotionReadiness: { ok: true; value: { canPurchase: boolean } } };
      };
      expect(payload.view.promotionReadiness.value.canPurchase).toBe(false);
      expect(server.received.some((message) => message.includes('readReadyUnitView'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendRequest'))).toBe(false);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });
});

async function startPromotionReadinessTunerServer(): Promise<FakeTunerServer> {
  return startFakeTunerServer({
    handle({ message }) {
      if (message.includes('readReadyUnitView')) {
        return [JSON.stringify(readyUnitView())];
      }
      return undefined;
    },
  });
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
        hasExperience: true,
        canPromote: false,
        promotionClass: 'PROMOTION_CLASS_LAND_COMMANDER',
        level: 2,
        experiencePoints: 19,
        experienceToNextLevel: 45,
        totalPromotionsEarned: 2,
        storedPromotionPoints: 0,
        storedCommendations: 0,
        canPurchase: false,
        availablePromotions: [],
        notes: ['PROMOTE can open the commander promotion UI even when no points are spendable.'],
      },
    },
    nearby: { ok: true, value: [] },
    notes: ['Read-only ready-unit view. Use operation validation before any send.'],
  };
}
