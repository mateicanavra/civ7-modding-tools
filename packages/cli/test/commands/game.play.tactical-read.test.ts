import { describe, expect, test, vi } from 'vitest';
import GamePlayBattlefieldScan from '../../src/commands/game/play/battlefield-scan';
import GamePlayCivilianRouteTriage from '../../src/commands/game/play/civilian-route-triage';
import GamePlayDestinationAnalysis from '../../src/commands/game/play/destination-analysis';
import GamePlayFormationSnapshot from '../../src/commands/game/play/formation-snapshot';
import GamePlayFrontSummary from '../../src/commands/game/play/front-summary';
import GamePlayTargetCandidates from '../../src/commands/game/play/target-candidates';
import { type FakeTunerServer, startFakeTunerServer } from './fixtures/tuner-socket-server';
import { expectNormalPlayPayloadToOmitDebugInternals } from './game/play/normal-output-boundary';

describe('game play tactical read commands', () => {
  test('reads civilian route triage without sending operations', async () => {
    const server = await startTacticalReadTunerServer();
    try {
      const payload = await runJsonCommand(GamePlayCivilianRouteTriage, server, [
        '--x',
        '15',
        '--y',
        '23',
      ]) as {
        ok: true;
        view: {
          origin: { x: number; y: number } | null;
          destination: { x: number; y: number } | null;
          triage: { status: string; nextInspections: string[]; reasons: string[] };
        };
      };

      expect(payload.view.origin).toEqual({ x: 15, y: 23 });
      expect(payload.view.destination).toEqual({ x: 20, y: 20 });
      expect(payload.view.triage.status).toMatch(/hold|reroute|proceed|inspect/);
      expect(payload.view.triage.nextInspections.some((item) => item.includes('unit-target'))).toBe(true);
      expect(payload.view.triage.reasons.length).toBeGreaterThan(0);
      expectPositiveRelationshipLabels(payload.view.triage.reasons);
      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
      expect(server.received.some((message) => message.includes('readSettlementRecommendations'))).toBe(true);
      expect(server.received.some((message) => message.includes('readBattlefieldScan'))).toBe(true);
      expect(server.received.some((message) => message.includes('readDestinationAnalysis'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendRequest'))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test('reads target candidates without sending operations', async () => {
    const server = await startTacticalReadTunerServer();
    try {
      const payload = await runJsonCommand(GamePlayTargetCandidates, server, [
        '--origin',
        '18,20',
      ]) as {
        ok: true;
        view: {
          candidates: Array<{
            cities: unknown[];
            approach: { routeKind: string; waterSampleCount: number; landSampleCount: number };
          }>;
        };
      };

      expect(payload.view.candidates[0]?.cities).toHaveLength(2);
      expect(payload.view.candidates[0]?.approach.routeKind).toBe('land');
      expect(payload.view.candidates[0]?.approach.waterSampleCount).toBe(0);
      expect(payload.view.candidates[0]?.approach.landSampleCount).toBeGreaterThan(0);
      expect(server.received.some((message) => message.includes('readTargetCandidates'))).toBe(true);
      expect(server.received.some((message) => message.includes('"origins":[{"x":18,"y":20}]'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendRequest'))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test('reads front summary without sending operations', async () => {
    const server = await startTacticalReadTunerServer();
    try {
      const payload = await runJsonCommand(GamePlayFrontSummary, server, [
        '--origin',
        '18,20',
        '--target-x',
        '13',
        '--target-y',
        '17',
      ]) as {
        ok: true;
        view: {
          origin: { x: number; y: number } | null;
          target: { x: number; y: number } | null;
          summary: { posture: string; nextInspections: string[]; pressure: Array<{ source: string; summary?: string }>; risks: string[] };
        };
      };

      expect(payload.view.origin).toEqual({ x: 18, y: 20 });
      expect(payload.view.target).toEqual({ x: 13, y: 17 });
      expect(payload.view.summary.pressure.some((item) => item.source === 'battlefield')).toBe(true);
      expect(payload.view.summary.pressure.some((item) => item.source === 'destination')).toBe(true);
      expect(payload.view.summary.nextInspections.some((item) => item.includes('unit-target'))).toBe(true);
      expectPositiveRelationshipLabels([
        ...payload.view.summary.pressure.map((item) => item.summary ?? ''),
        ...payload.view.summary.risks,
      ]);
      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(false);
      expect(server.received.some((message) => message.includes('readTargetCandidates'))).toBe(true);
      expect(server.received.some((message) => message.includes('readBattlefieldScan'))).toBe(true);
      expect(server.received.some((message) => message.includes('readDestinationAnalysis'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendRequest'))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test('reads battlefield scan without sending operations', async () => {
    const server = await startTacticalReadTunerServer();
    try {
      const payload = await runJsonCommand(GamePlayBattlefieldScan, server, [
        '--origin',
        '17,20',
        '--radius',
        '8',
      ]) as {
        ok: true;
        view: {
          pointsOfInterest: Array<{ summary?: string; kind?: string }>;
        };
      };

      expectPositiveRelationshipLabels(payload.view.pointsOfInterest.map((item) => `${item.kind ?? ''}: ${item.summary ?? ''}`));
      expect(server.received.some((message) => message.includes('readBattlefieldScan'))).toBe(true);
      expect(server.received.some((message) => message.includes('"origins":[{"x":17,"y":20}]'))).toBe(true);
      expect(server.received.some((message) => message.includes('"radius":8'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendRequest'))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test('reads formation snapshot without sending operations', async () => {
    const server = await startTacticalReadTunerServer();
    try {
      const payload = await runJsonCommand(GamePlayFormationSnapshot, server, []) as {
        ok: true;
        view: {
          formation: {
            posture: string;
            relationshipLabelPolicy: {
              relationshipSource: string;
              relationshipProof: string;
              unprovenLabel: string;
            };
            headline: string;
            civilians: unknown[];
            screens: unknown[];
            otherOwnerContacts: unknown[];
            nearbyContacts: unknown[];
            reasons: string[];
            nextInspections: string[];
          };
        };
      };

      expect(payload.view.formation.posture).toBe('screen-civilian');
      expect(payload.view.formation.relationshipLabelPolicy).toMatchObject({
        relationshipSource: 'not-classified',
        relationshipProof: 'none',
        unprovenLabel: 'relationship-unproven',
      });
      expect(payload.view.formation.civilians).toHaveLength(1);
      expect(payload.view.formation.screens.length).toBeGreaterThan(0);
      expect(payload.view.formation.otherOwnerContacts.length).toBeGreaterThan(0);
      expect(payload.view.formation.nearbyContacts.length).toBeGreaterThan(0);
      expectOwnerOnlyContactLabels([
        payload.view.formation.headline,
        ...payload.view.formation.reasons,
        ...payload.view.formation.nextInspections,
      ]);
      expect(payload.view.formation.nextInspections).toContain('game play civilian-route-triage --x 16 --y 18 --json');
      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
      expect(server.received.some((message) => message.includes('readReadyUnitView'))).toBe(true);
      expect(server.received.some((message) => message.includes('readBattlefieldScan'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test('reads destination analysis without sending operations', async () => {
    const server = await startTacticalReadTunerServer();
    try {
      const payload = await runJsonCommand(GamePlayDestinationAnalysis, server, [
        '--origin',
        '20,14',
        '--destination',
        '13,17',
        '--corridor-radius',
        '2',
        '--destination-radius',
        '4',
      ]) as {
        ok: true;
        view: {
          relationshipLabelPolicy: {
            relationshipSource: string;
            relationshipProof: string;
            unprovenLabel: string;
          };
          pointsOfInterest: Array<{ summary?: string; kind?: string }>;
        };
      };

      expect(payload.view.relationshipLabelPolicy).toMatchObject({
        relationshipSource: 'not-classified',
        relationshipProof: 'none',
        unprovenLabel: 'relationship-unproven',
      });
      expectPositiveRelationshipLabels(payload.view.pointsOfInterest.map((item) => `${item.kind ?? ''}: ${item.summary ?? ''}`));
      expect(server.received.some((message) => message.includes('readDestinationAnalysis'))).toBe(true);
      expect(server.received.some((message) => message.includes('relationshipLabelPolicy: scan.relationshipLabelPolicy'))).toBe(true);
      expect(server.received.some((message) => message.includes('"origin":{"x":20,"y":14}'))).toBe(true);
      expect(server.received.some((message) => message.includes('"destination":{"x":13,"y":17}'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendRequest'))).toBe(false);
    } finally {
      await server.close();
    }
  });
});

type CommandClass = {
  run(args: string[]): Promise<unknown>;
  prototype: { log(message?: string): void };
};

async function runJsonCommand(command: CommandClass, server: FakeTunerServer, args: string[]) {
  const writes: string[] = [];
  const log = vi.spyOn(command.prototype, 'log').mockImplementation((message?: string) => {
    if (message) writes.push(message);
  });
  try {
    const { port } = server.address();
    await command.run(['--host', '127.0.0.1', '--port', String(port), ...args, '--json']);
    const payload = JSON.parse(writes.join('')) as { ok: boolean; [key: string]: unknown };
    expectNormalPlayPayloadToOmitDebugInternals(payload);
    return payload;
  } finally {
    log.mockRestore();
  }
}

async function startTacticalReadTunerServer(): Promise<FakeTunerServer> {
  return startFakeTunerServer({
    handle({ message }) {
      if (message.includes('readPlayNotifications')) {
        return [JSON.stringify(playNotificationView())];
      }
      if (message.includes('readReadyUnitView')) {
        return [JSON.stringify(readyUnitView())];
      }
      if (message.includes('readSettlementRecommendations')) {
        return [JSON.stringify(settlementRecommendationsView())];
      }
      if (message.includes('readTargetCandidates')) {
        return [JSON.stringify(targetCandidatesView())];
      }
      if (message.includes('readBattlefieldScan')) {
        return [JSON.stringify(battlefieldScanView())];
      }
      if (message.includes('readDestinationAnalysis')) {
        return [JSON.stringify(destinationAnalysisView())];
      }
      return undefined;
    },
  });
}

function playNotificationView() {
  const unitId = { owner: 0, id: 458752, type: 26 };
  return {
    localPlayerId: 0,
    turn: { ok: true, value: 75 },
    turnDate: { ok: true, value: '2150 BCE' },
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
    limits: { maxNotifications: 10, truncated: false },
  };
}

function readyUnitView() {
  const unitId = { owner: 0, id: 458752, type: 26 };
  return {
    localPlayerId: 0,
    requestedUnitId: unitId,
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
        location: { x: 17, y: 20 },
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
        promotionClass: 'PROMOTION_CLASS_LAND_COMMANDER',
        promotions: [],
        notes: ['PROMOTE can open the commander promotion UI even when no points are spendable.'],
      },
    },
    nearby: { ok: true, value: [] },
    notes: ['Read-only ready-unit fixture for tactical command tests.'],
  };
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
    notes: ['Read-only settlement recommendation fixture.'],
  };
}

function targetCandidatesView() {
  return {
    localPlayerId: 0,
    playerId: 0,
    origins: [{ x: 18, y: 20 }],
    unitRadius: 4,
    hiddenInfoPolicy: 'runtime-debug-summary; may include non-visible cities or units until paired with visibility reads',
    candidates: [
      {
        owner: 9,
        leaderName: { ok: true, value: 'Independent Power' },
        civilizationName: { ok: true, value: 'Independent' },
        isHuman: { ok: true, value: false },
        cityCount: 1,
        unitCount: 4,
        cities: [
          {
            id: { owner: 9, id: 589824, type: 1 },
            owner: 9,
            name: 'Independent City',
            location: { x: 13, y: 17 },
            population: 3,
            isTown: false,
            distance: 5,
            nearestOrigin: { x: 18, y: 20 },
            water: { ok: true, value: false },
          },
          {
            id: { owner: 9, id: 589825, type: 1 },
            owner: 9,
            name: 'Second Independent City',
            location: { x: 11, y: 22 },
            population: 2,
            isTown: true,
            distance: 7,
            nearestOrigin: { x: 18, y: 20 },
            water: { ok: true, value: false },
          },
        ],
        nearestCity: {
          id: { owner: 9, id: 589824, type: 1 },
          owner: 9,
          name: 'Independent City',
          location: { x: 13, y: 17 },
          population: 3,
          isTown: false,
        },
        nearestDistance: 5,
        nearbyUnits: [
          {
            id: { owner: 9, id: 196608, type: 26 },
            owner: 9,
            typeName: 'UNIT_WARRIOR',
            location: { x: 13, y: 16 },
            damage: 0,
            strength: 20,
          },
        ],
        nearbyUnitCount: 4,
        apparentStrength: 42,
        approach: {
          nearestOrigin: { x: 18, y: 20 },
          targetLocation: { x: 13, y: 17 },
          directGridDistance: 5,
          routeHint: 'near-low-density',
          routeKind: 'land',
          originWater: { ok: true, value: false },
          targetWater: { ok: true, value: false },
          waterSampleCount: 0,
          landSampleCount: 6,
          notes: [
            'Distance is a cheap grid heuristic for target ranking, not a pathfinder result.',
            'Route kind is sampled from endpoints and a straight grid line; it is not Civ pathfinding.',
          ],
        },
        reasons: ['nearest target distance 5', 'single known city target', 'low nearby unit density'],
      },
    ],
    relationshipLabelPolicy: {
      relationshipSource: 'not-classified',
      relationshipProof: 'none',
      unprovenLabel: 'relationship-unproven',
      guidance: 'Target candidates rank other owners from runtime city/unit summaries. They do not classify relationship, alliance, neutrality, suzerain, or war-target status without official relationship, team, diplomacy, independent-power, or war-state evidence.',
    },
    notes: [
      'Read-only strategic target shortlist. It ranks other-owner contacts; it does not choose or send war, movement, or attack operations.',
      'Relationship labels are not classified here. Treat other-owner candidates as relationship-unproven until an official relationship or operation validator proves more.',
    ],
  };
}

function battlefieldScanView() {
  const friendlyUnit = {
    id: { owner: 0, id: 458752, type: 26 },
    owner: 0,
    stance: 'friendly',
    relationshipProof: 'self',
    relationshipLabel: 'friendly',
    type: 111,
    typeName: 'UNIT_SLINGER',
    role: 'ranged',
    location: { x: 17, y: 20 },
    distance: 0,
    nearestOrigin: { x: 17, y: 20 },
    damage: 36,
    wounded: true,
    strength: 9.6,
    movementMovesRemaining: 2,
    attacksRemaining: 1,
  };
  const civilianUnit = {
    id: { owner: 0, id: 1441800, type: 26 },
    owner: 0,
    stance: 'friendly',
    relationshipProof: 'self',
    relationshipLabel: 'friendly',
    type: 333,
    typeName: 'UNIT_SETTLER',
    role: 'civilian',
    location: { x: 16, y: 18 },
    distance: 1,
    nearestOrigin: { x: 17, y: 20 },
    damage: 0,
    wounded: false,
    strength: 1,
    movementMovesRemaining: 2,
    attacksRemaining: 0,
  };
  const otherOwnerUnit = {
    id: { owner: 9, id: 196608, type: 26 },
    owner: 9,
    stance: 'other',
    relationshipProof: 'none',
    relationshipLabel: 'relationship-unproven',
    type: 222,
    typeName: 'UNIT_WARRIOR',
    role: 'melee',
    location: { x: 13, y: 17 },
    distance: 4,
    nearestOrigin: { x: 17, y: 20 },
    damage: 0,
    wounded: false,
    strength: 20,
    movementMovesRemaining: 2,
    attacksRemaining: 1,
  };
  const city = {
    id: { owner: 9, id: 589824, type: 1 },
    owner: 9,
    stance: 'other',
    relationshipProof: 'none',
    relationshipLabel: 'relationship-unproven',
    name: 'Independent City',
    location: { x: 13, y: 17 },
    distance: 4,
    nearestOrigin: { x: 17, y: 20 },
    population: 3,
    isTown: false,
  };
  return {
    localPlayerId: 0,
    playerId: 0,
    origins: [{ x: 17, y: 20 }],
    radius: 8,
    hiddenInfoPolicy: 'runtime-debug-summary; may include non-visible units or cities until paired with visibility/map reads',
    relationshipLabelPolicy: {
      relationshipSource: 'not-classified',
      relationshipProof: 'none',
      unprovenLabel: 'relationship-unproven',
      guidance: 'Battlefield scan can prove owner ids, proximity, role heuristics, and validator-independent pressure. It cannot classify relationship, alliance, neutrality, suzerain, or war-target status without official relationship, team, diplomacy, independent-power, or war-state evidence.',
    },
    units: [friendlyUnit, civilianUnit, otherOwnerUnit],
    cities: [city],
    owners: [
      {
        owner: 0,
        stance: 'friendly',
        relationshipProof: 'self',
        relationshipLabel: 'friendly',
        leaderName: { ok: true, value: 'Player' },
        civilizationName: { ok: true, value: 'Assyria' },
        unitCount: 2,
        cityCount: 0,
        roles: { ranged: 1, civilian: 1 },
        apparentStrength: 10.6,
        nearestUnit: friendlyUnit,
        nearestCity: null,
      },
      {
        owner: 9,
        stance: 'other',
        relationshipProof: 'none',
        relationshipLabel: 'relationship-unproven',
        leaderName: { ok: true, value: 'Independent Power' },
        civilizationName: { ok: true, value: 'Independent' },
        unitCount: 1,
        cityCount: 1,
        roles: { melee: 1 },
        apparentStrength: 20,
        nearestUnit: otherOwnerUnit,
        nearestCity: city,
      },
    ],
    pointsOfInterest: [
      {
        kind: 'wounded-friendly',
        severity: 'medium',
        location: friendlyUnit.location,
        summary: 'friendly wounded unit near scan origin',
        units: [friendlyUnit],
      },
      {
        kind: 'civilian-risk',
        severity: 'high',
        location: civilianUnit.location,
        summary: 'friendly civilian has other-owner contact within 4 tiles',
        units: [civilianUnit],
      },
      {
        kind: 'city-front',
        severity: 'medium',
        location: city.location,
        summary: 'nearest relationship-unproven city in scan radius',
        cities: [city],
      },
    ],
    notes: [
      'Read-only battlefield lens for tactical orientation. It does not path, move, attack, declare war, or validate operations.',
      'Owner mismatch is contact evidence, not relationship proof. Use neutral relationship-unproven language unless official relationship APIs prove more.',
    ],
  };
}

function destinationAnalysisView() {
  const otherOwnerUnit = {
    id: { owner: 9, id: 196608, type: 26 },
    owner: 9,
    stance: 'other',
    type: 222,
    typeName: 'UNIT_WARRIOR',
    role: 'melee',
    location: { x: 13, y: 17 },
    distance: 0,
    nearestOrigin: { x: 13, y: 17 },
    damage: 0,
    wounded: false,
    strength: 20,
    movementMovesRemaining: 2,
    attacksRemaining: 1,
    corridorDistance: 0,
    destinationDistance: 0,
  };
  const city = {
    id: { owner: 9, id: 589824, type: 1 },
    owner: 9,
    stance: 'other',
    name: 'Independent City',
    location: { x: 13, y: 17 },
    distance: 0,
    nearestOrigin: { x: 13, y: 17 },
    population: 3,
    isTown: false,
    destinationDistance: 0,
  };
  return {
    localPlayerId: 0,
    playerId: 0,
    origin: { x: 20, y: 14 },
    destination: { x: 13, y: 17 },
    corridorRadius: 2,
    destinationRadius: 4,
    hiddenInfoPolicy: 'runtime-debug-summary; may include non-visible units, cities, or plot state until paired with visibility/map reads',
    relationshipLabelPolicy: {
      relationshipSource: 'not-classified',
      relationshipProof: 'none',
      unprovenLabel: 'relationship-unproven',
      guidance: 'Battlefield scan can prove owner ids, proximity, role heuristics, and validator-independent pressure. It cannot classify relationship, alliance, neutrality, suzerain, or war-target status without official relationship, team, diplomacy, independent-power, or war-state evidence.',
    },
    corridor: {
      routeHint: 'straight-line-grid-corridor',
      directGridDistance: 7,
      sampleCount: 8,
      sampledPlots: [
        {
          location: { x: 20, y: 14 },
          valid: { ok: true, value: true },
          water: { ok: true, value: true },
        },
      ],
      units: [otherOwnerUnit],
      unitCount: 1,
    },
    destinationPressure: {
      units: [otherOwnerUnit],
      unitCount: 1,
      cities: [city],
      cityCount: 1,
      apparentOtherStrength: 20,
    },
    pointsOfInterest: [
      {
        kind: 'destination-pressure',
        severity: 'medium',
        location: otherOwnerUnit.location,
        summary: '1 other-owner units near destination',
        units: [otherOwnerUnit],
      },
    ],
    notes: ['Read-only destination lens for tactical planning. It does not move units, reserve paths, attack, or validate operations.'],
  };
}

function expectPositiveRelationshipLabels(values: readonly string[]): void {
  const text = values.join('\n');
  expect(text).not.toMatch(/\bnon-friendly\b/i);
  expect(text).not.toMatch(/\benemy\b/i);
  expect(text).not.toMatch(/\bhostile\b/i);
  expect(text).not.toMatch(/\bopponent\b/i);
}

function expectOwnerOnlyContactLabels(values: readonly string[]): void {
  expectPositiveRelationshipLabels(values);
  expect(values.join('\n')).not.toMatch(/\bthreats?\b/i);
}
