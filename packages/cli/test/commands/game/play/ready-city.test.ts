import { describe, expect, test, vi } from 'vitest';
import GamePlayReadyCity from '../../../../src/commands/game/play/ready-city';
import { type FakeTunerServer, startFakeTunerServer } from '../../fixtures/tuner-socket-server';
import { expectNormalPlayPayloadToOmitDebugInternals } from './normal-output-boundary';

describe('game play ready-city command', () => {
  test('reads ready-city decision view without sending operations', async () => {
    const server = await startReadyCityTunerServer();
    try {
      const { port } = server.address();
      await GamePlayReadyCity.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--json',
      ]);

      expect(server.received.some((message) => message.includes('readReadyCityView'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendRequest'))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test('emits compact ready-city population and expansion yield candidates', async () => {
    const server = await startReadyCityTunerServer();
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayReadyCity.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayReadyCity.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--compact',
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        contractVersion: string;
        surface: string;
        summary: string;
        city: { name: string; buildQueue: unknown };
        productionCandidates: Array<{
          kind: string;
          typeName: string;
          name: string;
          cost: number;
          turns: number;
          productionBasis: { costSource: string; turnsSource: string };
          baseYieldSummary: { YIELD_PRODUCTION: number };
          valid: boolean;
          placementPlots: Array<{ x: number; y: number }>;
          nextAction: { kind: string; parameters: Record<string, unknown>; readOnly: boolean; sendsMutation: boolean };
        }>;
        populationPlacement: {
          yieldTypeOrder: string[];
          workablePlots: Array<{
            yieldDelta: { YIELD_HAPPINESS: number; happiness?: number };
            nextAction: { kind: string; parameters: { location: number; x: number; y: number }; sendsMutation: boolean };
          }>;
          expansionCandidates: Array<{
            constructibleName: string;
            yieldSource: string;
            yieldSummary: { YIELD_FOOD: number; YIELD_PRODUCTION: number; food?: number };
            terrainName: string;
            nextAction: { kind: string; parameters: { x: number; y: number }; sendsMutation: boolean };
          }>;
        };
        nextAction: { kind: string; parameters: { location: number }; sendsMutation: boolean };
        warnings: string[];
        omitted: Array<{ path: string }>;
        view?: unknown;
      };
      expect(payload.contractVersion).toBe('play-agent-v0');
      expect(payload.surface).toBe('ready-city');
      expect(payload.summary).toContain('Dur-Sharrukin');
      expect(payload.productionCandidates[0]).toMatchObject({
        kind: 'constructible',
        typeName: 'BUILDING_WALLS',
        name: 'LOC_BUILDING_WALLS_NAME',
        cost: 80,
        turns: 3,
        productionBasis: {
          costSource: 'city.Production.getConstructibleProductionCost(ConstructibleType)',
          turnsSource: 'city.BuildQueue.getTurnsLeft(type)',
        },
        baseYieldSummary: { YIELD_PRODUCTION: 1 },
        valid: true,
      });
      expect(payload.productionCandidates[0].placementPlots[0]).toMatchObject({ x: 22, y: 31 });
      expect(payload.productionCandidates[0].nextAction).toMatchObject({
        kind: 'choose-production',
        readOnly: false,
        sendsMutation: true,
      });
      expect(payload.populationPlacement.yieldTypeOrder).toContain('YIELD_DIPLOMACY');
      expect(payload.populationPlacement.workablePlots[0].yieldDelta.YIELD_HAPPINESS).toBe(2);
      expect(payload.populationPlacement.workablePlots[0].yieldDelta.happiness).toBeUndefined();
      expect(payload.populationPlacement.workablePlots[0].nextAction).toMatchObject({
        kind: 'assign-worker',
        parameters: {
          location: 1457,
          x: 22,
          y: 31,
        },
        sendsMutation: true,
      });
      expect(payload.populationPlacement.expansionCandidates[0].constructibleName).toBe('Walls');
      expect(payload.populationPlacement.expansionCandidates[0].yieldSource).toBe('GameplayMap.getYieldsWithCity(plotIndex, cityId)');
      expect(payload.populationPlacement.expansionCandidates[0].yieldSummary).toMatchObject({ YIELD_FOOD: 2, YIELD_PRODUCTION: 1 });
      expect(payload.populationPlacement.expansionCandidates[0].yieldSummary.food).toBeUndefined();
      expect(payload.populationPlacement.expansionCandidates[0].terrainName).toBe('Grassland');
      expect(payload.populationPlacement.expansionCandidates[0].nextAction).toMatchObject({
        kind: 'expand-city',
        parameters: {
          x: 23,
          y: 31,
        },
        sendsMutation: true,
      });
      expect(payload.nextAction).toMatchObject({
        kind: 'assign-worker',
        parameters: {
          location: 1457,
        },
        sendsMutation: true,
      });
      expect(JSON.stringify(payload)).not.toContain('game play ');
      expect(payload.warnings.join(' ')).toContain('Read-only city dashboard');
      expect(payload.omitted.some((item) => item.path === 'view.productionCandidates[].result')).toBe(true);
      expect(payload.omitted.some((item) => item.path === 'view.populationPlacement.allPlacementInfo')).toBe(true);
      expect(payload.view).toBeUndefined();
      expectNormalPlayPayloadToOmitDebugInternals(payload);
      expect(server.received.some((message) => message.includes('readReadyCityView'))).toBe(true);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('keeps invalid compact production candidates out of send-oriented next actions', async () => {
    const server = await startReadyCityTunerServer(invalidProductionOnlyReadyCityView());
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayReadyCity.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayReadyCity.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--compact',
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        productionCandidates: Array<{
          valid: boolean;
          nextAction: { kind: string; label: string; readOnly: boolean; sendsMutation: boolean };
        }>;
        populationPlacement: {
          workablePlots: Array<unknown>;
          expansionCandidates: Array<unknown>;
        } | null;
        nextAction: unknown;
      };

      expect(payload.productionCandidates[0]).toMatchObject({
        valid: false,
        nextAction: {
          kind: 'validate-production',
          label: 'Review this production candidate validation before treating it as actionable.',
          readOnly: true,
          sendsMutation: false,
        },
      });
      expect(payload.populationPlacement?.workablePlots).toEqual([]);
      expect(payload.populationPlacement?.expansionCandidates).toEqual([]);
      expect(payload.nextAction).toBeNull();
      expect(JSON.stringify(payload)).not.toContain('game play ');
      expect(JSON.stringify(payload)).not.toMatch(/considering a send|before any send|send-ready/i);
      expectNormalPlayPayloadToOmitDebugInternals(payload);
      expect(server.received.some((message) => message.includes('sendRequest'))).toBe(false);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });
});

async function startReadyCityTunerServer(view = readyCityView()): Promise<FakeTunerServer> {
  return startFakeTunerServer({
    handle({ message }) {
      if (message.includes('readReadyCityView')) {
        return [JSON.stringify(view)];
      }
      return undefined;
    },
  });
}

function invalidProductionOnlyReadyCityView() {
  const view = readyCityView();
  return {
    ...view,
    productionCandidates: {
      ok: true,
      value: view.productionCandidates.value.map((candidate) => ({
        ...candidate,
        valid: false,
        result: { Success: false, Reason: 'blocked by validator' },
        placementPlots: [],
      })),
    },
    populationPlacement: {
      ok: true,
      value: {
        ...view.populationPlacement.value,
        workablePlotIndexes: { ok: true, value: [] },
        workablePlots: { ok: true, value: [] },
        expansionCandidates: { ok: true, value: [] },
        expansionResult: { ok: true, value: { Success: false, Plots: [] } },
      },
    },
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
        buildQueue: {
          currentProductionTypeHash: 713967338,
          productionProgress: 12,
          turnsLeft: 3,
        },
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
    productionCandidates: {
      ok: true,
      value: [
        {
          kind: 'constructible',
          type: 713967338,
          typeName: 'BUILDING_WALLS',
          name: 'LOC_BUILDING_WALLS_NAME',
          args: { ConstructibleType: 713967338 },
          cost: 80,
          turns: 3,
          productionBasis: {
            cost: 80,
            turns: 3,
            showTurns: true,
            showCost: true,
            costSource: 'city.Production.getConstructibleProductionCost(ConstructibleType)',
            turnsSource: 'city.BuildQueue.getTurnsLeft(type)',
          },
          baseYieldSummary: { YIELD_PRODUCTION: 1 },
          valid: true,
          result: { Success: true, Plots: [1457] },
          placementPlots: [{ index: 1457, x: 22, y: 31 }],
        },
      ],
    },
    townFocusOptions: {
      ok: true,
      value: [
        {
          name: 'LOC_PROJECT_FISHING_TOWN_NAME',
          description: 'LOC_PROJECT_FISHING_TOWN_DESCRIPTION',
          args: { Type: -284569333, ProjectType: -548685232, City: 131073 },
          valid: true,
          result: { Success: true },
        },
      ],
    },
    populationPlacement: {
      ok: true,
      value: {
        isReadyToPlacePopulation: { ok: true, value: true },
        cityWorkerCap: { ok: true, value: 4 },
        yieldTypeOrder: [
          'YIELD_FOOD',
          'YIELD_PRODUCTION',
          'YIELD_GOLD',
          'YIELD_SCIENCE',
          'YIELD_CULTURE',
          'YIELD_HAPPINESS',
          'YIELD_DIPLOMACY',
        ],
        allPlacementInfo: { ok: true, value: [{ PlotIndex: 1457, IsBlocked: false }] },
        workablePlotIndexes: { ok: true, value: [1457] },
        blockedPlotIndexes: { ok: true, value: [] },
        workablePlots: {
          ok: true,
          value: [
            {
              index: 1457,
              x: 22,
              y: 31,
              isBlocked: false,
              currentYields: [0, 1, 0, 0, 0, 0, 0],
              nextYields: [0, 1, 0, 0, 0, 2, 0],
              currentYieldSummary: {
                YIELD_FOOD: 0,
                YIELD_PRODUCTION: 1,
                YIELD_GOLD: 0,
                YIELD_SCIENCE: 0,
                YIELD_CULTURE: 0,
                YIELD_HAPPINESS: 0,
                YIELD_DIPLOMACY: 0,
              },
              nextYieldSummary: {
                YIELD_FOOD: 0,
                YIELD_PRODUCTION: 1,
                YIELD_GOLD: 0,
                YIELD_SCIENCE: 0,
                YIELD_CULTURE: 0,
                YIELD_HAPPINESS: 2,
                YIELD_DIPLOMACY: 0,
              },
              yieldDelta: {
                YIELD_FOOD: 0,
                YIELD_PRODUCTION: 0,
                YIELD_GOLD: 0,
                YIELD_SCIENCE: 0,
                YIELD_CULTURE: 0,
                YIELD_HAPPINESS: 2,
                YIELD_DIPLOMACY: 0,
              },
              maintenance: null,
              placementInfo: { PlotIndex: 1457, IsBlocked: false },
            },
          ],
        },
        expansionCandidates: {
          ok: true,
          value: [
            {
              index: 1458,
              x: 23,
              y: 31,
              constructibleType: 713967338,
              constructibleTypeName: 'BUILDING_WALLS',
              constructibleName: 'Walls',
              constructibleClass: 'BUILDING',
              constructibleDistrictType: 'DISTRICT_URBAN',
              plotFacts: {
                terrainName: 'Grassland',
                featureName: null,
                resourceName: 'Clay',
                yieldSource: 'GameplayMap.getYieldsWithCity(plotIndex, cityId)',
                yieldSummary: {
                  YIELD_FOOD: 2,
                  YIELD_PRODUCTION: 1,
                  YIELD_GOLD: 0,
                  YIELD_SCIENCE: 0,
                  YIELD_CULTURE: 0,
                  YIELD_HAPPINESS: 0,
                  YIELD_DIPLOMACY: 0,
                },
              },
            },
          ],
        },
        expansionResult: {
          ok: true,
          value: { Success: true, Plots: [1458], ConstructibleTypes: [713967338] },
        },
        notes: [
          "For NEW_POPULATION, compare workablePlots against expansionCandidates; assign-worker and expand-city are different acquire-tile branches.",
        ],
      },
    },
    notes: ['Read-only ready-city view. This view intentionally does not choose production.'],
  };
}
