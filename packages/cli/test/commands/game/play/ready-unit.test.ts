import { describe, expect, test } from 'vitest';
import GamePlayReadyUnit from '../../../../src/commands/game/play/ready-unit';
import { type FakeTunerServer, startFakeTunerServer } from '../../fixtures/tuner-socket-server';

describe('game play ready-unit command', () => {
  test('reads ready-unit tactical view without sending operations', async () => {
    const server = await startReadyUnitTunerServer();
    try {
      const { port } = server.address();
      await GamePlayReadyUnit.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--json',
      ]);

      expect(server.received.some((message) => message.includes('readReadyUnitView'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendRequest'))).toBe(false);
    } finally {
      await server.close();
    }
  });
});

async function startReadyUnitTunerServer(): Promise<FakeTunerServer> {
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
    nearby: {
      ok: true,
      value: [
        {
          x: 22,
          y: 31,
          units: [{ id: unitId, owner: 0, typeName: 'UNIT_ARMY_COMMANDER' }],
        },
      ],
    },
    notes: ['Read-only ready-unit view. Use operation validation before any send.'],
  };
}
