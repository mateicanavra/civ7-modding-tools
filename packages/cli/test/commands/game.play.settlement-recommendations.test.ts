import { describe, expect, test } from 'vitest';
import GamePlaySettlementRecommendations from '../../src/commands/game/play/settlement-recommendations';
import { type FakeTunerServer, startFakeTunerServer } from './fixtures/tuner-socket-server';

describe('game play settlement recommendations command', () => {
  test('reads settlement recommendations without sending operations', async () => {
    const server = await startSettlementRecommendationsTunerServer();
    try {
      const { port } = server.address();
      await GamePlaySettlementRecommendations.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--x',
        '15',
        '--y',
        '23',
        '--json',
      ]);

      expect(server.received.some((message) => message.includes('readSettlementRecommendations'))).toBe(true);
      expect(server.received.some((message) => message.includes('"locations":[{"x":15,"y":23}]'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendRequest'))).toBe(false);
    } finally {
      await server.close();
    }
  });
});

async function startSettlementRecommendationsTunerServer(): Promise<FakeTunerServer> {
  return startFakeTunerServer({
    handle({ message }) {
      if (message.includes('readSettlementRecommendations')) {
        return [JSON.stringify(settlementRecommendationsView())];
      }
      return undefined;
    },
  });
}

function settlementRecommendationsView() {
  return {
    localPlayerId: 0,
    playerId: 0,
    count: 5,
    requestedLocations: [{ x: 15, y: 23 }],
    origins: [
      {
        kind: 'requested',
        location: { x: 15, y: 23 },
        plotIndex: { ok: true, value: 1927 },
      },
    ],
    recommendations: [
      {
        origin: {
          kind: 'requested',
          location: { x: 15, y: 23 },
          plotIndex: { ok: true, value: 1927 },
        },
        suggestions: {
          ok: true,
          value: [
            {
              location: { x: 20, y: 20 },
              plotIndex: { ok: true, value: 1660 },
              factors: [
                {
                  positive: true,
                  title: 'LOC_SETTLEMENT_RECOMMENDATION_TOTAL_YIELD',
                  description: 'LOC_SETTLEMENT_RECOMMENDATION_GOOD_TOTAL_YIELD',
                },
              ],
            },
          ],
        },
      },
    ],
    notes: ['Read-only settlement recommendation view. It wraps the official settlement lens API.'],
  };
}
