import { describe, expect, test, vi } from 'vitest';
import GamePlayProgressDashboard from '../../src/commands/game/play/progress-dashboard';
import GamePlayTraditions from '../../src/commands/game/play/traditions';
import { type FakeTunerServer, startFakeTunerServer } from './fixtures/tuner-socket-server';

describe('game play progression reads', () => {
  test('reads live tradition slots and action hints', async () => {
    const server = await startProgressionReadTunerServer();
    try {
      const { port } = server.address();
      const writes: string[] = [];
      const log = vi.spyOn(GamePlayTraditions.prototype, 'log').mockImplementation((message?: string) => {
        if (message) writes.push(message);
      });
      try {
        await GamePlayTraditions.run([
          '--host',
          '127.0.0.1',
          '--port',
          String(port),
          '--player-id',
          '0',
          '--json',
        ]);
      } finally {
        log.mockRestore();
      }

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        view: {
          slots: { active: number; available: number };
          actions: { activate: number; deactivate: number };
          active: Array<{ id: number; name: string }>;
          available: Array<{ id: number; actionHints: Array<{ cli: string }> }>;
          recommendedCli: string[];
        };
      };
      expect(payload.view.slots.active).toBe(1);
      expect(payload.view.slots.available).toBe(1);
      expect(payload.view.actions.activate).toBe(-1326475004);
      expect(payload.view.actions.deactivate).toBe(1318334332);
      expect(payload.view.active[0].name).toBe('Honor');
      expect(payload.view.available[0].actionHints[0].cli).toContain('game play change-tradition');
      expect(payload.view.recommendedCli[0]).toContain('--tradition-type 90243567');
      expect(server.received.some((message) => message.includes('readTraditionsView'))).toBe(true);
    } finally {
      await server.close();
    }
  });

  test('emits compact tradition option surface', async () => {
    const server = await startProgressionReadTunerServer();
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayTraditions.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayTraditions.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--player-id',
        '0',
        '--compact',
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        command: string;
        active: Array<{ id: number; name: string; sendCloseoutCli: string | null }>;
        available: Array<{ id: number; name: string; validationSuccess: boolean; sendCloseoutCli: string | null; validateCli: string | null }>;
        enabledAvailableCount: number;
        disabledAvailableCount: number;
        omitted: Array<{ path: string }>;
        traditions?: unknown;
      };
      expect(payload.command).toBe('game play traditions');
      expect(payload.traditions).toBeUndefined();
      expect(payload.active[0]).toMatchObject({
        id: -331546976,
        name: 'Honor',
        sendCloseoutCli: null,
      });
      expect(payload.available[0]).toMatchObject({
        id: 90243567,
        name: 'Oratory',
        validationSuccess: true,
      });
      expect(payload.available[0].validateCli).toContain('game play change-tradition --player-id 0 --tradition-type 90243567 --action -1326475004 --json');
      expect(payload.available[0].sendCloseoutCli).toContain('game play change-tradition --player-id 0 --tradition-type 90243567 --action -1326475004 --send --closeout');
      expect(payload.enabledAvailableCount).toBe(1);
      expect(payload.disabledAvailableCount).toBe(0);
      expect(payload.omitted.map((item) => item.path)).toContain('view.traditions');
      expect(payload.omitted.map((item) => item.path)).toContain('tradition.actionHints[].validation');
      expect(server.received.some((message) => message.includes('readTraditionsView'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
      expect(server.received.some((message) => message.includes('sendRequest('))).toBe(false);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('emits compact progress dashboard from official runtime progress sources', async () => {
    const server = await startProgressionReadTunerServer();
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayProgressDashboard.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayProgressDashboard.run([
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
        command: string;
        summary: string;
        age: { ageType: string; ageProgressPercent: number };
        legacyPaths: Array<{ classType: string; score: number; finalRequiredPathPoints: number; progressPercent: number; nextMilestone: string }>;
        triumphs: { count: number };
        proof: { sources: string[] };
        warnings: string[];
        omitted: Array<{ path: string }>;
        view?: unknown;
      };
      expect(payload.contractVersion).toBe('play-agent-v0');
      expect(payload.command).toBe('game play progress-dashboard');
      expect(payload.summary).toContain('AGE_ANTIQUITY progress');
      expect(payload.age.ageType).toBe('AGE_ANTIQUITY');
      expect(payload.age.ageProgressPercent).toBe(2.1);
      expect(payload.legacyPaths).toHaveLength(4);
      expect(payload.legacyPaths.find((path) => path.classType === 'culture')?.nextMilestone).toContain('ANTIQUITY_CULTURE_MILESTONE_1');
      expect(payload.legacyPaths.find((path) => path.classType === 'science')?.progressPercent).toBe(10);
      expect(payload.triumphs.count).toBe(0);
      expect(payload.proof.sources).toContain('player.LegacyPaths.getScore');
      expect(payload.warnings.join(' ')).toContain('VictoryManager is module-local');
      expect(payload.omitted.some((item) => item.path === 'view.legacyPaths[].milestones')).toBe(true);
      expect(payload.view).toBeUndefined();
      expect(server.received.some((message) => message.includes('readProgressDashboard'))).toBe(true);
      expect(server.received.some((message) => message.includes('getHistoricalLegacyPointCountForTeam'))).toBe(true);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });
});

async function startProgressionReadTunerServer(): Promise<FakeTunerServer> {
  return startFakeTunerServer({
    handle({ message }) {
      if (message.includes('readTraditionsView')) {
        return [JSON.stringify(traditionsView())];
      }
      if (message.includes('readProgressDashboard')) {
        return [JSON.stringify(progressDashboardView())];
      }
      return undefined;
    },
  });
}

function traditionsView() {
  const activate = -1326475004;
  const deactivate = 1318334332;
  const available = {
    id: 90243567,
    type: 'TRADITION_ORATORY',
    name: 'Oratory',
    description: 'Culture-facing policy.',
    ageType: null,
    cultureSlotType: null,
    traitType: null,
    isCrisis: false,
    active: false,
    unlocked: true,
    recentUnlock: true,
    actionHints: [
      {
        kind: 'activate',
        action: activate,
        operationType: 'CHANGE_TRADITION',
        args: { TraditionType: 90243567, Action: activate },
        validation: { ok: true, value: { Success: true } },
        cli: `game play change-tradition --player-id 0 --tradition-type 90243567 --action ${activate}`,
      },
    ],
  };
  const active = {
    id: -331546976,
    type: 'TRADITION_HONOR',
    name: 'Honor',
    description: 'Combat-facing policy.',
    ageType: null,
    cultureSlotType: null,
    traitType: null,
    isCrisis: false,
    active: true,
    unlocked: true,
    recentUnlock: false,
    actionHints: [
      {
        kind: 'deactivate',
        action: deactivate,
        operationType: 'CHANGE_TRADITION',
        args: { TraditionType: -331546976, Action: deactivate },
        validation: { ok: true, value: { Success: true } },
        cli: `game play change-tradition --player-id 0 --tradition-type -331546976 --action ${deactivate}`,
      },
    ],
  };
  return {
    playerId: 0,
    turn: { ok: true, value: 92 },
    turnDate: { ok: true, value: '1780 BCE' },
    governmentType: { ok: true, value: 101 },
    government: {
      type: 'GOVERNMENT_CHIEFDOM',
      name: 'Chiefdom',
    },
    slots: {
      total: { ok: true, value: 1 },
      normal: { ok: true, value: 1 },
      crisis: { ok: true, value: 0 },
      active: 1,
      unlocked: 2,
      available: 1,
      open: 0,
    },
    actions: { activate, deactivate },
    active: [active],
    available: [available],
    recentUnlocks: [available],
    traditions: [active, available],
    recommendedCli: [available.actionHints[0].cli],
    hiddenInfoPolicy: 'player-culture-runtime',
    notes: ['Read-only traditions view; it does not send CHANGE_TRADITION or CONSIDER_ASSIGN_TRADITIONS.'],
  };
}

function progressDashboardView() {
  const milestone = (type: string, path: string, required: number, finalMilestone: boolean, complete = false) => ({
    ageProgressionMilestoneType: type,
    legacyPathType: path,
    requiredPathPoints: required,
    finalMilestone,
    progressionPoints: { ok: true, value: finalMilestone ? 10 : 5 },
    complete: { ok: true, value: complete },
    reachedByScore: false,
  });
  const legacyPath = (
    legacyPathType: string,
    legacyPathClassType: string,
    score: number,
    finalRequiredPathPoints: number,
    nextRequired: number,
  ) => ({
    legacyPathType,
    legacyPathClassType,
    ageType: 'AGE_ANTIQUITY',
    name: legacyPathType.replace('LEGACY_PATH_ANTIQUITY_', 'Antiquity '),
    description: null,
    enabledByDefault: true,
    enabledForPlayer: null,
    score: { ok: true, value: score },
    finalRequiredPathPoints,
    nextMilestone: milestone(`${legacyPathType.replace('LEGACY_PATH_', '')}_MILESTONE_1`, legacyPathType, nextRequired, false),
    milestones: [
      milestone(`${legacyPathType.replace('LEGACY_PATH_', '')}_MILESTONE_1`, legacyPathType, nextRequired, false),
      milestone(`${legacyPathType.replace('LEGACY_PATH_', '')}_MILESTONE_3`, legacyPathType, finalRequiredPathPoints, true),
    ],
  });
  return {
    localPlayerId: 0,
    playerId: 0,
    turn: { ok: true, value: 5 },
    turnDate: { ok: true, value: '3900 BCE' },
    age: {
      hash: 2077444219,
      ageType: 'AGE_ANTIQUITY',
      name: 'Antiquity Age',
      chronologyIndex: 0,
      isFinalAge: { ok: true, value: false },
      isSingleAge: { ok: true, value: false },
      isExtendedGame: { ok: true, value: false },
      isAgeOver: { ok: true, value: false },
      currentAgeProgressionPoints: { ok: true, value: 3 },
      maxAgeProgressionPoints: { ok: true, value: 140 },
      primaryAgeProgression: { ok: true, value: -2084768148 },
    },
    player: {
      team: 0,
      historicalLegacyPointCountForTeam: { ok: true, value: 0 },
    },
    legacyPaths: [
      legacyPath('LEGACY_PATH_ANTIQUITY_CULTURE', 'LEGACY_PATH_CLASS_CULTURE', 0, 7, 2),
      legacyPath('LEGACY_PATH_ANTIQUITY_MILITARY', 'LEGACY_PATH_CLASS_MILITARY', 0, 12, 6),
      legacyPath('LEGACY_PATH_ANTIQUITY_SCIENCE', 'LEGACY_PATH_CLASS_SCIENCE', 1, 10, 3),
      legacyPath('LEGACY_PATH_ANTIQUITY_ECONOMIC', 'LEGACY_PATH_CLASS_ECONOMIC', 0, 20, 7),
    ],
    victories: {
      rows: [
        { victoryType: 'VICTORY_DOMINATION', victoryClassType: 'VICTORY_CLASS_DOMINATION', name: 'Domination', description: null },
        { victoryType: 'VICTORY_SCORE', victoryClassType: 'VICTORY_CLASS_SCORE', name: 'Score', description: null },
      ],
    },
    triumphs: {
      count: 0,
      rows: [],
      source: 'runtime-gameinfo',
    },
    proof: {
      victoryManagerGlobal: { ok: true, value: 'undefined' },
      sources: [
        'GameInfo.LegacyPaths',
        'player.LegacyPaths.getScore',
        'GameInfo.AgeProgressionMilestones',
        'Game.AgeProgressManager',
        'GameInfo.Victories',
        'GameInfo.Triumphs',
      ],
    },
    hiddenInfoPolicy: 'local-player-runtime-progress',
    notes: ['Read-only progress dashboard; it does not choose technologies, civics, productions, policies, or victory strategy.'],
  };
}
