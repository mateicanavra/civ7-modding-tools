import { once } from 'node:events';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { type AddressInfo, createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, test, vi } from 'vitest';
import GamePlayAssignWorker from '../../src/commands/game/play/assign-worker';
import GamePlayAdvisorWarning from '../../src/commands/game/play/advisor-warning';
import GamePlayBattlefieldScan from '../../src/commands/game/play/battlefield-scan';
import GamePlayBuildProduction from '../../src/commands/game/play/build-production';
import GamePlayBuildUnit from '../../src/commands/game/play/build-unit';
import GamePlayBuyAttribute from '../../src/commands/game/play/buy-attribute';
import GamePlayChangeTradition from '../../src/commands/game/play/change-tradition';
import GamePlayCivilianRouteTriage from '../../src/commands/game/play/civilian-route-triage';
import GamePlayChooseCelebration from '../../src/commands/game/play/choose-celebration';
import GamePlayChooseCulture from '../../src/commands/game/play/choose-culture';
import GamePlayChooseNarrative from '../../src/commands/game/play/choose-narrative';
import GamePlayChooseTech from '../../src/commands/game/play/choose-tech';
import GamePlayConsiderAttributes from '../../src/commands/game/play/consider-attributes';
import GamePlayConsiderTownProject from '../../src/commands/game/play/consider-town-project';
import GamePlayConsiderTraditions from '../../src/commands/game/play/consider-traditions';
import GamePlayDestinationAnalysis from '../../src/commands/game/play/destination-analysis';
import GamePlayDismissNotificationQueue from '../../src/commands/game/play/dismiss-notification-queue';
import GamePlayDismissNotification from '../../src/commands/game/play/dismiss-notification';
import GamePlayEndTurn from '../../src/commands/game/play/end-turn';
import GamePlayExpandCity from '../../src/commands/game/play/expand-city';
import GamePlayFormationSnapshot from '../../src/commands/game/play/formation-snapshot';
import GamePlayFrontSummary from '../../src/commands/game/play/front-summary';
import GamePlayOperation from '../../src/commands/game/play/operation';
import GamePlayNotificationQueue from '../../src/commands/game/play/notification-queue';
import GamePlayNotifications from '../../src/commands/game/play/notifications';
import GamePlayPriorities from '../../src/commands/game/play/priorities';
import GamePlayProgressDashboard from '../../src/commands/game/play/progress-dashboard';
import GamePlayPromotionReadiness from '../../src/commands/game/play/promotion-readiness';
import GamePlayReadyCity from '../../src/commands/game/play/ready-city';
import GamePlayReadyUnit from '../../src/commands/game/play/ready-unit';
import GamePlayRehydrate from '../../src/commands/game/play/rehydrate';
import GamePlayResettleUnit from '../../src/commands/game/play/resettle-unit';
import GamePlayRespondDiplomacy from '../../src/commands/game/play/respond-diplomacy';
import GamePlayRespondFirstMeet from '../../src/commands/game/play/respond-first-meet';
import GamePlaySetCultureTarget from '../../src/commands/game/play/set-culture-target';
import GamePlaySetTechTarget from '../../src/commands/game/play/set-tech-target';
import GamePlaySetTownFocus from '../../src/commands/game/play/set-town-focus';
import GamePlaySettlementRecommendations from '../../src/commands/game/play/settlement-recommendations';
import GamePlayTargetCandidates from '../../src/commands/game/play/target-candidates';
import GamePlayTopics from '../../src/commands/game/play/topics';
import GamePlayTraditions from '../../src/commands/game/play/traditions';
import GamePlayUnitMovePreview from '../../src/commands/game/play/unit-move-preview';
import GamePlayUnitTarget from '../../src/commands/game/play/unit-target';
import GamePlayUpgradeUnit from '../../src/commands/game/play/upgrade-unit';
import GameWatch from '../../src/commands/game/watch';

describe('game play commands', () => {
  test('checks end-turn status without sending turn complete', async () => {
    const server = await startTunerServer();
    try {
      const { port } = server.address();
      await GamePlayEndTurn.run(['--host', '127.0.0.1', '--port', String(port), '--json']);

      expect(server.received.some((message) => message.includes('canEndTurn'))).toBe(true);
      expect(server.received).not.toContain('CMD:65535:GameContext.sendTurnComplete()');
    } finally {
      await server.close();
    }
  });

  test('sends end-turn only with explicit approval reason', async () => {
    await expect(GamePlayEndTurn.run(['--send', '--json'])).rejects.toThrow(/requires --reason/);

    const server = await startTunerServer();
    try {
      const { port } = server.address();
      await GamePlayEndTurn.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--send',
        '--reason',
        'test approved end-turn',
        '--json',
      ]);

      expect(server.received).toContain('CMD:65535:GameContext.sendTurnComplete()');
    } finally {
      await server.close();
    }
  });

  test('blocks end-turn when the HUD still has an end-turn blocking notification', async () => {
    const server = await startTunerServer({ canEndTurnBefore: false });
    try {
      const { port } = server.address();
      await expect(GamePlayEndTurn.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--send',
        '--reason',
        'test approved end-turn',
        '--json',
      ])).rejects.toThrow(/blocked by current game state/);

      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
      expect(server.received).not.toContain('CMD:65535:GameContext.sendTurnComplete()');
    } finally {
      await server.close();
    }
  });

  test('allows end-turn fallback for stale command-units after readiness is clean', async () => {
    const server = await startTunerServer({
      canEndTurnBefore: false,
      playNotificationMode: 'stale-unit-command',
    });
    try {
      const { port } = server.address();
      await GamePlayEndTurn.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--send',
        '--reason',
        'test approved clean unit queue end-turn',
        '--json',
      ]);

      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
      expect(server.received).toContain('CMD:65535:GameContext.sendTurnComplete()');
    } finally {
      await server.close();
    }
  });

  test('allows end-turn fallback for reviewed informational blockers after App UI enum is clean', async () => {
    const server = await startTunerServer({
      canEndTurnBefore: false,
      playNotificationMode: 'stale-informational',
    });
    try {
      const { port } = server.address();
      await GamePlayEndTurn.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--send',
        '--reason',
        'test approved reviewed report end-turn',
        '--json',
      ]);

      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
      expect(server.received).toContain('CMD:65535:GameContext.sendTurnComplete()');
    } finally {
      await server.close();
    }
  });

  test('validates friendlier operation family aliases without sending', async () => {
    const server = await startTunerServer();
    try {
      const { port } = server.address();
      await GamePlayOperation.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--family',
        'unit',
        '--type',
        'SKIP_TURN',
        '--unit-id',
        '{"owner":0,"id":65536,"type":26}',
        '--json',
      ]);

      expect(server.received.some((message) => message.includes('validateOperation("unit-operation"'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test('sends approved unit operations through direct-control once', async () => {
    const server = await startTunerServer();
    try {
      const { port } = server.address();
      await GamePlayOperation.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--family',
        'unit',
        '--type',
        'SKIP_TURN',
        '--unit-id',
        '{"owner":0,"id":65536,"type":26}',
        '--send',
        '--reason',
        'test approved unit queue operation',
        '--json',
      ]);

      expect(server.received.some((message) => message.includes('sendOperation("unit-operation"'))).toBe(true);
      expect(server.received.filter((message) => message.includes('return JSON.stringify(sendOperation'))).toHaveLength(1);
    } finally {
      await server.close();
    }
  });

  test('wraps advisor warning acknowledgement as an approved player operation', async () => {
    const server = await startTunerServer();
    try {
      const { port } = server.address();
      await GamePlayAdvisorWarning.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--player-id',
        '0',
        '--target',
        '{"owner":0,"id":12345,"type":99}',
        '--send',
        '--reason',
        'test advisor acknowledgement',
        '--json',
      ]);

      expect(server.received.some((message) => message.includes('VIEWED_ADVISOR_WARNING'))).toBe(true);
      expect(server.received.some((message) => message.includes('"Target":{"owner":0,"id":12345,"type":99}'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation("player-operation"'))).toBe(true);
    } finally {
      await server.close();
    }
  });

  test('wraps population resettle as a unit command with target coordinates', async () => {
    const server = await startTunerServer();
    try {
      const { port } = server.address();
      await GamePlayResettleUnit.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--unit-id',
        '{"owner":0,"id":1703951,"type":26}',
        '--x',
        '17',
        '--y',
        '25',
        '--json',
      ]);

      expect(server.received.some((message) => message.includes('validateOperation("unit-command"'))).toBe(true);
      expect(server.received.some((message) => message.includes('UNITCOMMAND_RESETTLE'))).toBe(true);
      expect(server.received.some((message) => message.includes('"X":17'))).toBe(true);
      expect(server.received.some((message) => message.includes('"Y":25'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test('wraps unit upgrade as an approved unit command', async () => {
    const server = await startTunerServer();
    try {
      const { port } = server.address();
      await GamePlayUpgradeUnit.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--unit-id',
        '{"owner":0,"id":1769488,"type":26}',
        '--send',
        '--reason',
        'test approved unit upgrade',
        '--json',
      ]);

      expect(server.received.some((message) => message.includes('UNITCOMMAND_UPGRADE'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation("unit-command"'))).toBe(true);
    } finally {
      await server.close();
    }
  });

  test('wraps technology choice as SET_TECH_TREE_NODE', async () => {
    const server = await startTunerServer();
    try {
      const { port } = server.address();
      await GamePlayChooseTech.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--player-id',
        '0',
        '--node',
        '-1255676052',
        '--json',
      ]);

      expect(server.received.some((message) => message.includes('SET_TECH_TREE_NODE'))).toBe(true);
      expect(server.received.some((message) => message.includes('"ProgressionTreeNodeType":-1255676052'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test('wraps technology target as SET_TECH_TREE_TARGET_NODE', async () => {
    const server = await startTunerServer();
    try {
      const { port } = server.address();
      await GamePlaySetTechTarget.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--player-id',
        '0',
        '--node',
        '-1255676052',
        '--json',
      ]);

      expect(server.received.some((message) => message.includes('SET_TECH_TREE_TARGET_NODE'))).toBe(true);
      expect(server.received.some((message) => message.includes('"ProgressionTreeNodeType":-1255676052'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test('chooses technology and sets target as one caller workflow', async () => {
    const server = await startTunerServer();
    try {
      const { port } = server.address();
      const writes: string[] = [];
      const log = vi.spyOn(GamePlayChooseTech.prototype, 'log').mockImplementation((message?: string) => {
        if (message) writes.push(message);
      });
      try {
        await GamePlayChooseTech.run([
          '--host',
          '127.0.0.1',
          '--port',
          String(port),
          '--player-id',
          '0',
          '--node',
          '-1255676052',
          '--send',
          '--closeout',
          '--reason',
          'test technology target closeout',
          '--json',
        ]);
      } finally {
        log.mockRestore();
      }

      const payload = JSON.parse(writes.join('')) as { ok: true; result: { mode: string; stepCount: number; verified: boolean } };
      expect(payload.result.mode).toBe('send');
      expect(payload.result.stepCount).toBe(2);
      expect(payload.result.verified).toBe(true);
      expect(server.received.filter((message) => message.includes('sendOperation("player-operation"')).length).toBe(2);
      expect(server.received.some((message) => message.includes('SET_TECH_TREE_NODE'))).toBe(true);
      expect(server.received.some((message) => message.includes('SET_TECH_TREE_TARGET_NODE'))).toBe(true);
    } finally {
      await server.close();
    }
  });

  test('wraps growth worker assignment as ASSIGN_WORKER', async () => {
    const server = await startTunerServer();
    try {
      const { port } = server.address();
      await GamePlayAssignWorker.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--player-id',
        '0',
        '--location',
        '2543',
        '--amount',
        '1',
        '--json',
      ]);

      expect(server.received.some((message) => message.includes('ASSIGN_WORKER'))).toBe(true);
      expect(server.received.some((message) => message.includes('"Location":2543'))).toBe(true);
      expect(server.received.some((message) => message.includes('"Amount":1'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test('reports population postconditions for sent worker assignments', async () => {
    const server = await startTunerServer();
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayAssignWorker.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayAssignWorker.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--player-id',
        '0',
        '--location',
        '2543',
        '--send',
        '--reason',
        'test population worker placement',
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        result: {
          verified: boolean;
          populationPostcondition: {
            classification: string;
            readyCleared: boolean;
            placementStateChanged: boolean;
            reason: string;
          };
        };
      };
      expect(payload.result.verified).toBe(true);
      expect(payload.result.populationPostcondition.classification).toBe('population-ready-cleared');
      expect(payload.result.populationPostcondition.readyCleared).toBe(true);
      expect(payload.result.populationPostcondition.placementStateChanged).toBe(true);
      expect(payload.result.populationPostcondition.reason).toMatch(/Growth\.isReadyToPlacePopulation cleared/);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('wraps city unit production as BUILD with UnitType', async () => {
    const server = await startTunerServer();
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayBuildUnit.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayBuildUnit.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--city-id',
        '{"owner":0,"id":65536,"type":25}',
        '--unit-type',
        '1558890441',
        '--send',
        '--reason',
        'test unit production',
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as { ok: true; result: { populationPostcondition?: unknown } };
      expect(payload.result.populationPostcondition).toBeUndefined();
      expect(server.received.some((message) => message.includes('BUILD'))).toBe(true);
      expect(server.received.some((message) => message.includes('"UnitType":1558890441'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation("city-operation"'))).toBe(true);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('wraps placement-sensitive constructible production as BUILD with coordinates', async () => {
    const server = await startTunerServer();
    try {
      const { port } = server.address();
      await GamePlayBuildProduction.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--city-id',
        '{"owner":0,"id":65536,"type":1}',
        '--constructible-type',
        '713967338',
        '--x',
        '22',
        '--y',
        '31',
        '--send',
        '--reason',
        'test constructible production placement',
        '--json',
      ]);

      expect(server.received.some((message) => message.includes('BUILD'))).toBe(true);
      expect(server.received.some((message) => message.includes('"ConstructibleType":713967338'))).toBe(true);
      expect(server.received.some((message) => message.includes('"X":22'))).toBe(true);
      expect(server.received.some((message) => message.includes('"Y":31'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation("city-operation"'))).toBe(true);
    } finally {
      await server.close();
    }
  });

  test('requires exactly one production item kind', async () => {
    await expect(GamePlayBuildProduction.run([
      '--city-id',
      '{"owner":0,"id":65536,"type":1}',
      '--json',
    ])).rejects.toThrow(/requires exactly one/);
  });

  test('wraps culture choice as SET_CULTURE_TREE_NODE', async () => {
    const server = await startTunerServer();
    try {
      const { port } = server.address();
      await GamePlayChooseCulture.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--player-id',
        '0',
        '--node',
        '115',
        '--json',
      ]);

      expect(server.received.some((message) => message.includes('SET_CULTURE_TREE_NODE'))).toBe(true);
      expect(server.received.some((message) => message.includes('"ProgressionTreeNodeType":115'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test('wraps celebration choice as CHOOSE_GOLDEN_AGE', async () => {
    const server = await startTunerServer();
    try {
      const { port } = server.address();
      await GamePlayChooseCelebration.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--player-id',
        '0',
        '--golden-age-type',
        '-340825966',
        '--json',
      ]);

      expect(server.received.some((message) => message.includes('CHOOSE_GOLDEN_AGE'))).toBe(true);
      expect(server.received.some((message) => message.includes('"GoldenAgeType":-340825966'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test('wraps culture target as SET_CULTURE_TREE_TARGET_NODE', async () => {
    const server = await startTunerServer();
    try {
      const { port } = server.address();
      await GamePlaySetCultureTarget.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--player-id',
        '0',
        '--node',
        '-1677668973',
        '--send',
        '--reason',
        'test culture target closeout',
        '--json',
      ]);

      expect(server.received.some((message) => message.includes('SET_CULTURE_TREE_TARGET_NODE'))).toBe(true);
      expect(server.received.some((message) => message.includes('"ProgressionTreeNodeType":-1677668973'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation("player-operation"'))).toBe(true);
    } finally {
      await server.close();
    }
  });

  test('chooses culture and sets target as one caller workflow', async () => {
    const server = await startTunerServer();
    try {
      const { port } = server.address();
      const writes: string[] = [];
      const log = vi.spyOn(GamePlayChooseCulture.prototype, 'log').mockImplementation((message?: string) => {
        if (message) writes.push(message);
      });
      try {
        await GamePlayChooseCulture.run([
          '--host',
          '127.0.0.1',
          '--port',
          String(port),
          '--player-id',
          '0',
          '--node',
          '-1677668973',
          '--send',
          '--closeout',
          '--reason',
          'test culture target closeout',
          '--json',
        ]);
      } finally {
        log.mockRestore();
      }

      const payload = JSON.parse(writes.join('')) as { ok: true; result: { mode: string; stepCount: number; verified: boolean } };
      expect(payload.result.mode).toBe('send');
      expect(payload.result.stepCount).toBe(2);
      expect(payload.result.verified).toBe(true);
      expect(server.received.filter((message) => message.includes('sendOperation("player-operation"')).length).toBe(2);
      expect(server.received.some((message) => message.includes('SET_CULTURE_TREE_NODE'))).toBe(true);
      expect(server.received.some((message) => message.includes('SET_CULTURE_TREE_TARGET_NODE'))).toBe(true);
    } finally {
      await server.close();
    }
  });

  test('wraps diplomacy response as RESPOND_DIPLOMATIC_ACTION', async () => {
    const server = await startTunerServer();
    try {
      const { port } = server.address();
      await GamePlayRespondDiplomacy.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--player-id',
        '0',
        '--action-id',
        '56',
        '--response-type',
        '-1907089594',
        '--json',
      ]);

      expect(server.received.some((message) => message.includes('RESPOND_DIPLOMATIC_ACTION'))).toBe(true);
      expect(server.received.some((message) => message.includes('"ID":56'))).toBe(true);
      expect(server.received.some((message) => message.includes('"Type":-1907089594'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test('wraps first-meet diplomacy as RESPOND_DIPLOMATIC_FIRST_MEET', async () => {
    const server = await startTunerServer();
    try {
      const { port } = server.address();
      await GamePlayRespondFirstMeet.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--player-id',
        '0',
        '--met-player-id',
        '2',
        '--response',
        'neutral',
        '--json',
      ]);

      expect(server.received.some((message) => message.includes('RESPOND_DIPLOMATIC_FIRST_MEET'))).toBe(true);
      expect(server.received.some((message) => message.includes('"Player1":0'))).toBe(true);
      expect(server.received.some((message) => message.includes('"Player2":2'))).toBe(true);
      expect(server.received.some((message) => message.includes('"Type":673478009'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test('wraps narrative story direction choice', async () => {
    const server = await startTunerServer();
    try {
      const { port } = server.address();
      await GamePlayChooseNarrative.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--player-id',
        '0',
        '--target-type',
        'TOT_30001B',
        '--target',
        '{"owner":0,"id":45,"type":35}',
        '--action',
        '-1326475004',
        '--json',
      ]);

      expect(server.received.some((message) => message.includes('CHOOSE_NARRATIVE_STORY_DIRECTION'))).toBe(true);
      expect(server.received.some((message) => message.includes('"TargetType":"TOT_30001B"'))).toBe(true);
      expect(server.received.some((message) => message.includes('"Target":{"owner":0,"id":45,"type":35}'))).toBe(true);
      expect(server.received.some((message) => message.includes('"Action":-1326475004'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test('wraps attribute purchase as BUY_ATTRIBUTE_TREE_NODE', async () => {
    const server = await startTunerServer();
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
    const server = await startTunerServer();
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
          '--player-id',
          '0',
          '--node',
          '20',
          '--send',
          '--closeout',
          '--reason',
          'test attribute purchase closeout',
          '--json',
        ]);
      } finally {
        log.mockRestore();
      }

      const payload = JSON.parse(writes.join('')) as { ok: true; result: { mode: string; stepCount: number; verified: boolean } };
      expect(payload.result.mode).toBe('send');
      expect(payload.result.stepCount).toBe(2);
      expect(payload.result.verified).toBe(true);
      expect(server.received.filter((message) => message.includes('sendOperation("player-operation"')).length).toBe(2);
      expect(server.received.some((message) => message.includes('BUY_ATTRIBUTE_TREE_NODE'))).toBe(true);
      expect(server.received.some((message) => message.includes('CONSIDER_ASSIGN_ATTRIBUTE'))).toBe(true);
    } finally {
      await server.close();
    }
  });

  test('wraps tradition swaps as CHANGE_TRADITION', async () => {
    const server = await startTunerServer();
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
    const server = await startTunerServer();
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
          '--player-id',
          '0',
          '--tradition-type',
          '-331546976',
          '--action',
          '-1326475004',
          '--send',
          '--closeout',
          '--reason',
          'test tradition change closeout',
          '--json',
        ]);
      } finally {
        log.mockRestore();
      }

      const payload = JSON.parse(writes.join('')) as { ok: true; result: { mode: string; stepCount: number; verified: boolean } };
      expect(payload.result.mode).toBe('send');
      expect(payload.result.stepCount).toBe(2);
      expect(payload.result.verified).toBe(true);
      expect(server.received.filter((message) => message.includes('sendOperation("player-operation"')).length).toBe(2);
      expect(server.received.some((message) => message.includes('CHANGE_TRADITION'))).toBe(true);
      expect(server.received.some((message) => message.includes('CONSIDER_ASSIGN_TRADITIONS'))).toBe(true);
    } finally {
      await server.close();
    }
  });

  test('reads live tradition slots and action hints', async () => {
    const server = await startTunerServer();
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

  test('emits compact progress dashboard from official runtime progress sources', async () => {
    const server = await startTunerServer();
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

  test('wraps attribute review closeout as CONSIDER_ASSIGN_ATTRIBUTE', async () => {
    const server = await startTunerServer();
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

  test('wraps tradition review closeout as CONSIDER_ASSIGN_TRADITIONS', async () => {
    const server = await startTunerServer();
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

  test('wraps town focus as city-command CHANGE_GROWTH_MODE', async () => {
    const server = await startTunerServer();
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
    const server = await startTunerServer();
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
          '--reason',
          'test town focus closeout',
          '--json',
        ]);
      } finally {
        log.mockRestore();
      }

      const payload = JSON.parse(writes.join('')) as { ok: true; result: { mode: string; stepCount: number; verified: boolean } };
      expect(payload.result.mode).toBe('send');
      expect(payload.result.stepCount).toBe(2);
      expect(payload.result.verified).toBe(true);
      expect(server.received.filter((message) => message.includes('sendOperation(')).length).toBe(2);
      expect(server.received.some((message) => message.includes('sendOperation("city-command"'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation("city-operation"'))).toBe(true);
      expect(server.received.some((message) => message.includes('CHANGE_GROWTH_MODE'))).toBe(true);
      expect(server.received.some((message) => message.includes('CONSIDER_TOWN_PROJECT'))).toBe(true);
    } finally {
      await server.close();
    }
  });

  test('wraps town project review closeout as CONSIDER_TOWN_PROJECT', async () => {
    const server = await startTunerServer();
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

  test('wraps city expansion placement as city-command EXPAND', async () => {
    const server = await startTunerServer();
    try {
      const { port } = server.address();
      await GamePlayExpandCity.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--city-id',
        '{"owner":0,"id":196610,"type":1}',
        '--x',
        '16',
        '--y',
        '19',
        '--json',
      ]);

      expect(server.received.some((message) => message.includes('validateOperation("city-command"'))).toBe(true);
      expect(server.received.some((message) => message.includes('EXPAND'))).toBe(true);
      expect(server.received.some((message) => message.includes('"X":16'))).toBe(true);
      expect(server.received.some((message) => message.includes('"Y":19'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test('reports population postconditions for sent city expansions', async () => {
    const server = await startTunerServer();
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayExpandCity.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayExpandCity.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--city-id',
        '{"owner":0,"id":196610,"type":1}',
        '--x',
        '16',
        '--y',
        '19',
        '--send',
        '--reason',
        'test population expansion placement',
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        result: {
          verified: boolean;
          populationPostcondition: {
            classification: string;
            readyCleared: boolean;
            placementStateChanged: boolean;
            reason: string;
          };
        };
      };
      expect(payload.result.verified).toBe(true);
      expect(payload.result.populationPostcondition.classification).toBe('population-ready-cleared');
      expect(payload.result.populationPostcondition.readyCleared).toBe(true);
      expect(payload.result.populationPostcondition.placementStateChanged).toBe(true);
      expect(payload.result.populationPostcondition.reason).toMatch(/Growth\.isReadyToPlacePopulation cleared/);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('reads materialized notifications without sending operations', async () => {
    const server = await startTunerServer();
    try {
      const { port } = server.address();
      await GamePlayNotifications.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--json',
      ]);

      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test('classifies invalid-target diplomatic agenda notices as informational closeouts', async () => {
    const server = await startTunerServer({ playNotificationMode: 'diplomatic-report' });
    try {
      const { port } = server.address();
      const writes: string[] = [];
      const log = vi.spyOn(GamePlayNotifications.prototype, 'log').mockImplementation((message?: string) => {
        if (message) writes.push(message);
      });
      try {
        await GamePlayNotifications.run([
          '--host',
          '127.0.0.1',
          '--port',
          String(port),
          '--json',
        ]);
      } finally {
        log.mockRestore();
      }

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        view: {
          hud: {
            nextDecision: {
              category: string;
              operationFamily: string;
              operationType: string;
              cli: string;
              notes: string[];
            };
          };
        };
      };
      expect(payload.view.hud.nextDecision.category).toBe('informational-notification');
      expect(payload.view.hud.nextDecision.operationFamily).toBe('app-ui-action');
      expect(payload.view.hud.nextDecision.operationType).toBe('Game.Notifications.dismiss');
      expect(payload.view.hud.nextDecision.cli).toBe('game play dismiss-notification');
      expect(payload.view.hud.nextDecision.notes.join(' ')).toContain('do not send RESPOND_DIPLOMATIC_ACTION');
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test('reads play priorities without sending operations', async () => {
    const server = await startTunerServer({ playNotificationMode: 'ready-unit' });
    try {
      const { port } = server.address();
      const writes: string[] = [];
      const log = vi.spyOn(GamePlayPriorities.prototype, 'log').mockImplementation((message?: string) => {
        if (message) writes.push(message);
      });
      try {
        await GamePlayPriorities.run([
          '--host',
          '127.0.0.1',
          '--port',
          String(port),
          '--json',
        ]);
      } finally {
        log.mockRestore();
      }

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        view: {
          priorities: Array<{ kind: string }>;
          readyUnit: { legalOperationScope: string; legalNoTargetOperationCount: number } | null;
          battlefield: { pointsOfInterest: unknown[] } | null;
        };
      };
      expect(payload.view.readyUnit?.legalOperationScope).toBe('no-target');
      expect(payload.view.readyUnit?.legalNoTargetOperationCount).toBeGreaterThan(0);
      expect(payload.view.battlefield?.pointsOfInterest.length).toBeGreaterThan(0);
      expect(payload.view.priorities.some((item) => item.kind === 'ready-unit')).toBe(true);
      expect(payload.view.priorities.some((item) => item.kind.startsWith('battlefield:'))).toBe(true);
      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
      expect(server.received.some((message) => message.includes('readReadyUnitView'))).toBe(true);
      expect(server.received.some((message) => message.includes('readBattlefieldScan'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test('does not treat partial HUD probe failures as clean end-turn proof', async () => {
    const server = await startTunerServer({ playNotificationMode: 'runtime-error' });
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayPriorities.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayPriorities.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--json',
        '--no-battlefield',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        view: {
          priorities: Array<{ kind: string; command?: string; evidence?: Array<{ field: string; error: string }> }>;
        };
      };
      const runtimeError = payload.view.priorities.find((item) => item.kind === 'runtime-state-error');
      expect(runtimeError?.command).toContain('game play rehydrate --json');
      expect(runtimeError?.evidence?.some((item) => item.field === 'blocker' && item.error.includes('Game is not defined'))).toBe(true);
      expect(payload.view.priorities.some((item) => item.kind === 'clean-read')).toBe(false);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('emits compact play priorities without raw evidence by request', async () => {
    const server = await startTunerServer({ playNotificationMode: 'runtime-error' });
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayPriorities.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayPriorities.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--json',
        '--compact',
        '--no-battlefield',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        contractVersion: string;
        command: string;
        summary: string;
        next: string | null;
        warnings: string[];
        omitted: Array<{ path: string }>;
        priorities: Array<{ kind: string; evidence?: unknown }>;
        view?: unknown;
      };
      expect(payload.contractVersion).toBe('play-agent-v0');
      expect(payload.command).toBe('game play priorities');
      expect(payload.summary).toContain('runtime-state-error');
      expect(payload.next).toContain('game play rehydrate --json');
      expect(payload.warnings.join(' ')).toContain('Core HUD probes failed');
      expect(payload.omitted.some((item) => item.path === 'priorities[].evidence')).toBe(true);
      expect(payload.priorities.some((item) => item.kind === 'clean-read')).toBe(false);
      expect(payload.priorities.every((item) => item.evidence === undefined)).toBe(true);
      expect(payload.view).toBeUndefined();
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('lists live-play topic shortcuts without touching the game runtime', async () => {
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayTopics.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      await GamePlayTopics.run(['--family', 'rhq-ai', '--json']);
      await GamePlayTopics.run(['--family', 'pubsub', '--json']);

      const [rhqPayload, eventPayload] = writes.map((write) => JSON.parse(write) as {
        ok: true;
        topics: Array<{ family: string; commands: string[]; boundary: string }>;
      });
      expect(rhqPayload.topics).toHaveLength(1);
      expect(rhqPayload.topics[0].family).toBe('rhq-ai');
      expect(rhqPayload.topics[0].commands).toContain('game ai loaded-levers');
      expect(rhqPayload.topics[0].boundary).toMatch(/loaded GameInfo rows/);
      expect(eventPayload.topics).toHaveLength(1);
      expect(eventPayload.topics[0].family).toBe('evented-stream');
      expect(eventPayload.topics[0].commands).toContain('future: game play stream');
      expect(eventPayload.topics[0].boundary).toMatch(/direct-control snapshots/);
    } finally {
      log.mockRestore();
    }
  });

  test('schedules notification queue without sending bulk dismissals', async () => {
    const server = await startTunerServer({ playNotificationMode: 'mixed-queue' });
    try {
      const { port } = server.address();
      const writes: string[] = [];
      const log = vi.spyOn(GamePlayNotificationQueue.prototype, 'log').mockImplementation((message?: string) => {
        if (message) writes.push(message);
      });
      try {
        await GamePlayNotificationQueue.run([
          '--host',
          '127.0.0.1',
          '--port',
          String(port),
          '--json',
        ]);
      } finally {
        log.mockRestore();
      }

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        view: {
          queueLength: number;
          schedule: Array<{ disposition: string; command: string | null; safeToBatch: boolean; isEndTurnBlocking: boolean }>;
        };
      };
      expect(payload.view.queueLength).toBe(3);
      expect(payload.view.schedule[0].isEndTurnBlocking).toBe(true);
      expect(payload.view.schedule[0].disposition).toBe('operate-with-live-inputs');
      expect(payload.view.schedule.some((step) => step.disposition === 'reviewed-dismissal-candidate')).toBe(true);
      expect(payload.view.schedule.some((step) => step.safeToBatch === true)).toBe(true);
      expect(payload.view.schedule.some((step) => step.command?.includes('dismiss-notification'))).toBe(true);
      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
      expect(server.received.some((message) => message.includes('readNotificationDismissal'))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test('bulk dismisses only eligible informational queue items with approval', async () => {
    const dryRunServer = await startTunerServer({ playNotificationMode: 'mixed-queue' });
    try {
      const { port } = dryRunServer.address();
      const writes: string[] = [];
      const log = vi.spyOn(GamePlayDismissNotificationQueue.prototype, 'log').mockImplementation((message?: string) => {
        if (message) writes.push(message);
      });
      try {
        await GamePlayDismissNotificationQueue.run([
          '--host',
          '127.0.0.1',
          '--port',
          String(port),
          '--json',
        ]);
      } finally {
        log.mockRestore();
      }

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        view: { send: boolean; eligibleCount: number; selectedCount: number; excluded: unknown[]; results: unknown[] };
      };
      expect(payload.view.send).toBe(false);
      expect(payload.view.eligibleCount).toBe(1);
      expect(payload.view.selectedCount).toBe(1);
      expect(payload.view.excluded).toHaveLength(2);
      expect(payload.view.results).toHaveLength(0);
      expect(dryRunServer.received.some((message) => message.includes('readNotificationDismissal'))).toBe(false);
    } finally {
      await dryRunServer.close();
    }

    const sendServer = await startTunerServer({ playNotificationMode: 'mixed-queue' });
    try {
      const { port } = sendServer.address();
      const writes: string[] = [];
      const log = vi.spyOn(GamePlayDismissNotificationQueue.prototype, 'log').mockImplementation((message?: string) => {
        if (message) writes.push(message);
      });
      try {
        await GamePlayDismissNotificationQueue.run([
          '--host',
          '127.0.0.1',
          '--port',
          String(port),
          '--send',
          '--reason',
          'reviewed queue reports',
          '--json',
        ]);
      } finally {
        log.mockRestore();
      }

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        view: { send: boolean; eligibleCount: number; selectedCount: number; results: Array<{ sent: boolean; verified: boolean }> };
      };
      expect(payload.view.send).toBe(true);
      expect(payload.view.eligibleCount).toBe(1);
      expect(payload.view.selectedCount).toBe(1);
      expect(payload.view.results).toHaveLength(1);
      expect(payload.view.results[0].sent).toBe(true);
      expect(payload.view.results[0].verified).toBe(true);
      expect(sendServer.received.filter((message) => message.includes('readNotificationDismissal')).length).toBe(1);
      expect(sendServer.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      await sendServer.close();
    }
  });

  test('dismisses reviewed notifications only with explicit approval reason', async () => {
    await expect(GamePlayDismissNotification.run([
      '--target',
      '{"owner":0,"id":113,"type":20}',
      '--send',
      '--json',
    ])).rejects.toThrow(/requires --reason/);

    const server = await startTunerServer();
    try {
      const { port } = server.address();
      await GamePlayDismissNotification.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--target',
        '{"owner":0,"id":113,"type":20}',
        '--send',
        '--reason',
        'reviewed wonder completed notice',
        '--json',
      ]);

      expect(server.received.some((message) => message.includes('readNotificationDismissal'))).toBe(true);
      expect(server.received.some((message) => message.includes('"send":true'))).toBe(true);
    } finally {
      await server.close();
    }
  });

  test('resolves unit target actions without sending by default', async () => {
    const server = await startTunerServer();
    try {
      const { port } = server.address();
      await GamePlayUnitTarget.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--unit-id',
        '{"owner":0,"id":65536,"type":26}',
        '--x',
        '23',
        '--y',
        '33',
        '--json',
      ]);

      expect(server.received.some((message) => message.includes('readUnitTargetAction'))).toBe(true);
      expect(server.received.some((message) => message.includes('operationType.replace(/^UNITOPERATION_/'))).toBe(true);
      expect(server.received.some((message) => message.includes('"send":true'))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test('surfaces sent unit-target no-ops as postcondition misses', async () => {
    const server = await startTunerServer({ unitTargetMode: 'no-op-after-send' });
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayUnitTarget.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayUnitTarget.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--unit-id',
        '{"owner":0,"id":65536,"type":26}',
        '--x',
        '23',
        '--y',
        '33',
        '--send',
        '--reason',
        'test postcondition miss',
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        result: { sent: boolean; verified: boolean; verification: { status: string; classification: string; reason: string } };
      };
      expect(payload.result.sent).toBe(true);
      expect(payload.result.verified).toBe(false);
      expect(payload.result.verification.status).toBe('no-state-change');
      expect(payload.result.verification.classification).toBe('no-state-change');
      expect(payload.result.verification.reason).toMatch(/re-read .*before repeating/);
      expect(server.received.some((message) => message.includes('"send":true'))).toBe(true);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('stabilizes delayed unit-target postconditions before returning', async () => {
    const server = await startTunerServer({ unitTargetMode: 'delayed-after-send' });
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayUnitTarget.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayUnitTarget.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--unit-id',
        '{"owner":0,"id":65536,"type":26}',
        '--x',
        '23',
        '--y',
        '33',
        '--send',
        '--reason',
        'test delayed postcondition',
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        result: { sent: boolean; verified: boolean; verification: { status: string; classification: string; source: string; attempts: number; reason: string } };
      };
      expect(payload.result.sent).toBe(true);
      expect(payload.result.verified).toBe(true);
      expect(payload.result.verification.status).toBe('verified');
      expect(payload.result.verification.classification).toBe('unit-state-changed');
      expect(payload.result.verification.source).toBe('bounded-poll');
      expect(payload.result.verification.attempts).toBeGreaterThan(0);
      expect(payload.result.verification.reason).toMatch(/bounded post-send polling/);
      expect(server.received.filter((message) => message.includes('readUnitTargetAction')).length).toBeGreaterThan(1);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('classifies sent MOVE_TO short landings as path shortfalls', async () => {
    const server = await startTunerServer({ unitTargetMode: 'path-shortfall' });
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayUnitTarget.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayUnitTarget.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--unit-id',
        '{"owner":0,"id":65536,"type":26}',
        '--x',
        '23',
        '--y',
        '33',
        '--send',
        '--reason',
        'test movement path shortfall',
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        result: {
          verified: boolean;
          verification: {
            status: string;
            classification: string;
            destinationReached: boolean;
            requestedLocation: { x: number; y: number };
            landedLocation: { x: number; y: number };
            reason: string;
          };
        };
      };
      expect(payload.result.verified).toBe(true);
      expect(payload.result.verification.status).toBe('verified');
      expect(payload.result.verification.classification).toBe('path-shortfall');
      expect(payload.result.verification.destinationReached).toBe(false);
      expect(payload.result.verification.requestedLocation).toEqual({ x: 23, y: 33 });
      expect(payload.result.verification.landedLocation).toEqual({ x: 22, y: 34 });
      expect(payload.result.verification.reason).toMatch(/landed short/);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('reads ready-unit tactical view without sending operations', async () => {
    const server = await startTunerServer();
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

  test('reads official unit move preview with neutral relationship policy', async () => {
    const server = await startTunerServer();
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayUnitMovePreview.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayUnitMovePreview.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--unit-id',
        '{"owner":0,"id":65536,"type":26}',
        '--destination',
        '25,35',
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        view: {
          requestedDestination: { x: number; y: number };
          reachableMovement: { ok: true; value: ReadonlyArray<unknown> };
          queuedDestination: { ok: true; value: { x: number; y: number } };
          relationshipPolicy: { relationshipSource: string; relationshipProof: string; unprovenLabel: string; guidance: string };
        };
      };
      expect(payload.view.requestedDestination).toEqual({ x: 25, y: 35 });
      expect(payload.view.reachableMovement.value.length).toBeGreaterThan(0);
      expect(payload.view.queuedDestination.value).toEqual({ x: 25, y: 35 });
      expect(payload.view.relationshipPolicy.relationshipSource).toBe('not-classified');
      expect(payload.view.relationshipPolicy.relationshipProof).toBe('none');
      expect(payload.view.relationshipPolicy.unprovenLabel).toBe('relationship-unproven');
      expect(payload.view.relationshipPolicy.guidance).toMatch(/does not classify other-owner relationships/);
      expect(server.received.some((message) => message.includes('readUnitMovePreview'))).toBe(true);
      expect(server.received.some((message) => message.includes('getReachableMovement'))).toBe(true);
      expect(server.received.some((message) => message.includes('getQueuedOperationDestination'))).toBe(true);
      expect(server.received.some((message) => message.includes('getPathTo'))).toBe(true);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('emits compact official unit move preview by request', async () => {
    const server = await startTunerServer();
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayUnitMovePreview.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayUnitMovePreview.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--unit-id',
        '{"owner":0,"id":65536,"type":26}',
        '--destination',
        '25,35',
        '--compact',
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        contractVersion: string;
        command: string;
        summary: string;
        requestedDestination: { x: number; y: number };
        queuedDestination: { x: number; y: number } | null;
        reach: { movementPlotCount: number; targetPlotCount: number };
        paths: { requested: { plotCount?: number } | null; queued: { plotCount?: number } | null };
        next: string | null;
        warnings: string[];
        relationshipProof: string;
        omitted: Array<{ path: string }>;
        view?: unknown;
      };
      expect(payload.contractVersion).toBe('play-agent-v0');
      expect(payload.command).toBe('game play unit-move-preview');
      expect(payload.summary).toContain('UNIT_GALLEY');
      expect(payload.requestedDestination).toEqual({ x: 25, y: 35 });
      expect(payload.queuedDestination).toEqual({ x: 25, y: 35 });
      expect(payload.reach.movementPlotCount).toBeGreaterThan(0);
      expect(payload.reach.targetPlotCount).toBeGreaterThanOrEqual(0);
      expect(payload.paths.requested?.plotCount).toBeGreaterThan(0);
      expect(payload.paths.queued?.plotCount).toBeGreaterThan(0);
      expect(payload.next).toContain('game play unit-target');
      expect(payload.relationshipProof).toBe('none');
      expect(payload.warnings.join(' ')).toContain('does not classify other-owner relationships');
      expect(payload.omitted.some((item) => item.path === 'view.reachableMovement')).toBe(true);
      expect(payload.view).toBeUndefined();
      expect(server.received.some((message) => message.includes('readUnitMovePreview'))).toBe(true);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('reads promotion readiness without sending promotion commands', async () => {
    const server = await startTunerServer();
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

  test('materializes restart rehydration continuity without sending operations', async () => {
    const server = await startTunerServer({ playNotificationMode: 'ready-unit' });
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

  test('reads ready-city decision view without sending operations', async () => {
    const server = await startTunerServer();
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

  test('reads settlement recommendations without sending operations', async () => {
    const server = await startTunerServer();
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

  test('reads civilian route triage without sending operations', async () => {
    const server = await startTunerServer({ playNotificationMode: 'ready-unit' });
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayCivilianRouteTriage.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayCivilianRouteTriage.run([
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

      const payload = JSON.parse(writes.join('')) as {
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
      log.mockRestore();
      await server.close();
    }
  });

  test('reads target candidates without sending operations', async () => {
    const server = await startTunerServer();
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayTargetCandidates.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayTargetCandidates.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--origin',
        '18,20',
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
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
      log.mockRestore();
      await server.close();
    }
  });

  test('reads front summary without sending operations', async () => {
    const server = await startTunerServer({ playNotificationMode: 'ready-unit' });
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayFrontSummary.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayFrontSummary.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--origin',
        '18,20',
        '--target-x',
        '13',
        '--target-y',
        '17',
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
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
      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
      expect(server.received.some((message) => message.includes('readTargetCandidates'))).toBe(true);
      expect(server.received.some((message) => message.includes('readBattlefieldScan'))).toBe(true);
      expect(server.received.some((message) => message.includes('readDestinationAnalysis'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendRequest'))).toBe(false);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('reads battlefield scan without sending operations', async () => {
    const server = await startTunerServer();
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayBattlefieldScan.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayBattlefieldScan.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--origin',
        '17,20',
        '--radius',
        '8',
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
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
      log.mockRestore();
      await server.close();
    }
  });

  test('reads formation snapshot without sending operations', async () => {
    const server = await startTunerServer({ playNotificationMode: 'ready-unit' });
    try {
      const { port } = server.address();
      const writes: string[] = [];
      const log = vi.spyOn(GamePlayFormationSnapshot.prototype, 'log').mockImplementation((message?: string) => {
        if (message) writes.push(message);
      });
      try {
        await GamePlayFormationSnapshot.run([
          '--host',
          '127.0.0.1',
          '--port',
          String(port),
          '--json',
        ]);
      } finally {
        log.mockRestore();
      }

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        view: {
          formation: {
            posture: string;
            headline: string;
            civilians: unknown[];
            screens: unknown[];
            otherOwnerContacts: unknown[];
            nearbyContacts: unknown[];
            threats: unknown[];
            reasons: string[];
            nextInspections: string[];
          };
        };
      };
      expect(payload.view.formation.posture).toBe('screen-civilian');
      expect(payload.view.formation.civilians).toHaveLength(1);
      expect(payload.view.formation.screens.length).toBeGreaterThan(0);
      expect(payload.view.formation.otherOwnerContacts.length).toBeGreaterThan(0);
      expect(payload.view.formation.nearbyContacts.length).toBeGreaterThan(0);
      expect(payload.view.formation.threats).toEqual(payload.view.formation.nearbyContacts);
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
    const server = await startTunerServer();
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayDestinationAnalysis.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayDestinationAnalysis.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--origin',
        '20,14',
        '--destination',
        '13,17',
        '--corridor-radius',
        '2',
        '--destination-radius',
        '4',
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
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
      log.mockRestore();
      await server.close();
    }
  });

  test('watches live play as JSONL without sending operations', async () => {
    const server = await startTunerServer({ playNotificationMode: 'ready-unit' });
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
      expect(observations[0].schema).toBe('civ7-watcher-observation.v1');
      expect(observations[0].mode).toBe('human-turn-watch');
      expect(observations[0].wrapper).toBe('getCiv7PlayNotificationView+getCiv7ReadyUnitView+getCiv7ReadyCityView');
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
    const server = await startTunerServer({ playNotificationMode: 'ready-unit' });
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
      expect(JSON.parse(lines[0])).toMatchObject({
        schema: 'civ7-watcher-observation.v1',
        ok: true,
        stateRole: 'app-ui',
      });
      expect(server.received.some((message) => message.includes('sendRequest'))).toBe(false);
    } finally {
      await rm(tempDir, { force: true, recursive: true });
      await server.close();
    }
  });
});

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

async function startTunerServer(options: {
  canEndTurnBefore?: boolean;
  playNotificationMode?: 'town-focus' | 'stale-unit-command' | 'stale-informational' | 'diplomatic-report' | 'ready-unit' | 'mixed-queue' | 'runtime-error';
  unitTargetMode?: 'verified' | 'no-op-after-send' | 'path-shortfall' | 'delayed-after-send';
} = {}) {
  const received: string[] = [];
  let turnCompleteSent = false;
  let unitTargetSendObserved = false;
  const server = createServer((socket) => {
    let buffer = Buffer.alloc(0);
    socket.on('data', (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
      for (;;) {
        const frame = parseRequest(buffer);
        if (!frame) return;
        buffer = buffer.subarray(frame.bytesRead);
        received.push(frame.message);
        if (frame.message === 'LSQ:') {
          socket.write(encodeResponse(frame.listenerId, ['65535', 'App UI', '1', 'Tuner']));
        } else if (frame.message.includes('readPlayNotifications')) {
          socket.write(encodeResponse(frame.listenerId, [JSON.stringify(playNotificationView(options.playNotificationMode))]));
        } else if (frame.message.includes('DiplomacyPlayerFirstMeets')) {
          socket.write(encodeResponse(frame.listenerId, [JSON.stringify({
            key: 'PLAYER_REALATIONSHIP_FIRSTMEET_NEUTRAL',
            value: 673478009,
          })]));
        } else if (frame.message.includes('readUnitTargetAction')) {
          const send = frame.message.includes('"send":true');
          if (send) unitTargetSendObserved = true;
          const mode = options.unitTargetMode === 'delayed-after-send' && unitTargetSendObserved && !send
            ? 'delayed-observed'
            : options.unitTargetMode;
          socket.write(encodeResponse(frame.listenerId, [JSON.stringify(unitTargetAction(send, mode))]));
        } else if (frame.message.includes('readUnitMovePreview')) {
          socket.write(encodeResponse(frame.listenerId, [JSON.stringify(unitMovePreviewView())]));
        } else if (frame.message.includes('readReadyUnitView')) {
          socket.write(encodeResponse(frame.listenerId, [JSON.stringify(readyUnitView())]));
        } else if (frame.message.includes('readReadyCityView')) {
          socket.write(encodeResponse(frame.listenerId, [JSON.stringify(readyCityView())]));
        } else if (frame.message.includes('readSettlementRecommendations')) {
          socket.write(encodeResponse(frame.listenerId, [JSON.stringify(settlementRecommendationsView())]));
        } else if (frame.message.includes('readTargetCandidates')) {
          socket.write(encodeResponse(frame.listenerId, [JSON.stringify(targetCandidatesView())]));
        } else if (frame.message.includes('readTraditionsView')) {
          socket.write(encodeResponse(frame.listenerId, [JSON.stringify(traditionsView())]));
        } else if (frame.message.includes('readProgressDashboard')) {
          socket.write(encodeResponse(frame.listenerId, [JSON.stringify(progressDashboardView())]));
        } else if (frame.message.includes('readDestinationAnalysis')) {
          socket.write(encodeResponse(frame.listenerId, [JSON.stringify(destinationAnalysisView())]));
        } else if (frame.message.includes('readBattlefieldScan')) {
          socket.write(encodeResponse(frame.listenerId, [JSON.stringify(battlefieldScanView())]));
        } else if (frame.message.includes('readNotificationDismissal')) {
          socket.write(encodeResponse(frame.listenerId, [JSON.stringify(notificationDismissal(frame.message.includes('"send":true')))]));
        } else if (frame.message.includes('hasSentTurnComplete')) {
          socket.write(encodeResponse(frame.listenerId, [JSON.stringify(turnCompletionStatus(turnCompleteSent, options.canEndTurnBefore ?? true))]));
        } else if (frame.message === 'CMD:65535:GameContext.sendTurnComplete()') {
          turnCompleteSent = true;
          socket.write(encodeResponse(frame.listenerId, ['true']));
        } else if (frame.message.includes('return JSON.stringify(validateOperation')) {
          socket.write(encodeResponse(frame.listenerId, [JSON.stringify(operationValidation(frame.message))]));
        } else if (frame.message.includes('return JSON.stringify(sendOperation')) {
          const unitFamily = frame.message.includes('sendOperation("unit-operation"') || frame.message.includes('sendOperation("unit-command"');
          const operationType = operationTypeFromMessage(frame.message);
          const populationFamily = operationType === 'ASSIGN_WORKER' || operationType === 'EXPAND';
          socket.write(encodeResponse(frame.listenerId, [JSON.stringify(unitFamily
            ? {
                sent: true,
                beforePostcondition: unitOperationPostconditionSnapshot({ owner: 0, id: 65536, type: 26 }),
                afterPostcondition: unitOperationPostconditionSnapshot({ owner: 0, id: 131072, type: 26 }),
              }
            : populationFamily
              ? {
                  sent: true,
                  beforePopulationPostcondition: populationPlacementPostconditionSnapshot(true),
                  afterPopulationPostcondition: populationPlacementPostconditionSnapshot(false),
                }
              : { sent: true })]));
        } else {
          socket.write(encodeResponse(frame.listenerId, ['null']));
        }
      }
    });
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  return {
    received,
    address: () => server.address() as AddressInfo,
    close: async () => {
      server.close();
      await once(server, 'close');
    },
  };
}

function playNotificationView(
  mode: 'town-focus' | 'stale-unit-command' | 'stale-informational' | 'diplomatic-report' | 'ready-unit' | 'mixed-queue' | 'runtime-error' = 'town-focus',
) {
  if (mode === 'runtime-error') {
    const gameError = { ok: false as const, error: 'ReferenceError: Game is not defined' };
    return {
      localPlayerId: 0,
      turn: gameError,
      turnDate: gameError,
      hasSentTurnComplete: { ok: true, value: false },
      canEndTurn: { ok: true, value: false },
      blocker: gameError,
      blockingNotificationId: gameError,
      selectedUnitId: { ok: true, value: null },
      selectedCityId: { ok: true, value: null },
      firstReadyUnitId: { ok: true, value: null },
      notifications: [],
      decisions: [],
      hud: {
        nextDecision: null,
        decisionQueue: [],
      },
      limits: { maxNotifications: 25, truncated: false },
    };
  }
  if (mode === 'mixed-queue') {
    const diplomacyDecision = {
      category: 'diplomacy-response',
      operationFamily: 'player-operation',
      operationType: 'RESPOND_DIPLOMATIC_ACTION',
      argsShape: '{ ID, Type }',
      cli: 'game play respond-diplomacy',
      requiredInputs: [
        { name: 'ID', source: 'live diplomatic action', required: true },
        { name: 'Type', source: 'chosen diplomatic response', required: true },
      ],
      commonActions: [
        {
          label: 'validate diplomacy response',
          cli: 'game play respond-diplomacy --player-id <id> --action-id <action-id> --response-type <response-type>',
          operationFamily: 'player-operation',
          operationType: 'RESPOND_DIPLOMATIC_ACTION',
          argsShape: '{ ID, Type }',
          when: 'after reading the action id and desired response type',
        },
      ],
      confidence: 'live-proof',
      notes: ['Use the diplomatic action id and response type from the live notification.'],
    };
    const informationalDecision = {
      category: 'informational-notification',
      operationFamily: 'app-ui-action',
      operationType: 'Game.Notifications.dismiss',
      argsShape: '{ notificationId }',
      cli: 'game play dismiss-notification',
      requiredInputs: [
        { name: 'Notification', source: 'notification ComponentID', required: true },
      ],
      commonActions: [
        {
          label: 'dismiss reviewed notification',
          cli: "game play dismiss-notification --target '<notification-id>' --send --reason '<why this was reviewed>'",
          operationFamily: 'app-ui-action',
          operationType: 'Game.Notifications.dismiss',
          argsShape: '{ notificationId }',
          when: 'after reviewing the report',
        },
      ],
      confidence: 'official-ui',
      notes: ['Default-handler report notification; review before closeout.'],
    };
    const commandUnitsDecision = {
      category: 'unit-command',
      operationFamily: 'unit-operation',
      operationType: 'SKIP_TURN',
      argsShape: 'selected/ready unit id plus operation-specific args',
      cli: 'game play operation --family unit',
      requiredInputs: [
        { name: 'Unit', source: 'selectedUnitId or firstReadyUnitId', required: true },
      ],
      commonActions: [
        {
          label: 'read ready-unit view',
          cli: 'game play ready-unit --json',
          argsShape: 'selected/first ready unit, legal operations, nearby occupied plots',
          when: 'before choosing a unit operation',
        },
      ],
      confidence: 'heuristic',
      notes: ['Read the selected or first ready unit before choosing skip, automate, move, or promote.'],
    };
    const notifications = [
      {
        id: { owner: 0, id: 577, type: 20 },
        type: 1,
        typeName: 'NOTIFICATION_DIPLOMATIC_RESPONSE_REQUIRED',
        groupType: null,
        summary: 'Lafayette has started a Diplomatic Action with you.',
        message: 'Respond to Diplomatic Action',
        target: { owner: 4, id: 80, type: 34 },
        location: { x: -9999, y: -9999 },
        canUserDismiss: false,
        expired: false,
        dismissed: false,
        isEndTurnBlocking: true,
        decision: diplomacyDecision,
      },
      {
        id: { owner: 0, id: 579, type: 20 },
        type: 2,
        typeName: 'NOTIFICATION_VOLCANO_ERUPTS_SEV2',
        groupType: null,
        summary: 'Laacher See has erupted.',
        message: 'Megacolossal Volcanic Eruption!',
        target: { owner: -1, id: -1, type: 0 },
        location: { x: 58, y: 36 },
        canUserDismiss: true,
        expired: false,
        dismissed: false,
        isEndTurnBlocking: false,
        decision: informationalDecision,
      },
      {
        id: { owner: 0, id: 583, type: 20 },
        type: 3,
        typeName: 'NOTIFICATION_COMMAND_UNITS',
        groupType: null,
        summary: 'Move a Unit or have it perform an operation.',
        message: 'Command Units',
        target: { owner: -1, id: -1, type: 0 },
        location: { x: -9999, y: -9999 },
        canUserDismiss: false,
        expired: false,
        dismissed: false,
        isEndTurnBlocking: false,
        decision: commandUnitsDecision,
      },
    ];
    const queue = [
      {
        notificationId: notifications[0].id,
        isEndTurnBlocking: true,
        typeName: notifications[0].typeName,
        summary: notifications[0].summary,
        message: notifications[0].message,
        target: notifications[0].target,
        location: notifications[0].location,
        player: null,
        ...diplomacyDecision,
      },
      {
        notificationId: notifications[1].id,
        isEndTurnBlocking: false,
        typeName: notifications[1].typeName,
        summary: notifications[1].summary,
        message: notifications[1].message,
        target: notifications[1].target,
        location: notifications[1].location,
        player: null,
        ...informationalDecision,
      },
      {
        notificationId: notifications[2].id,
        isEndTurnBlocking: false,
        typeName: notifications[2].typeName,
        summary: notifications[2].summary,
        message: notifications[2].message,
        target: notifications[2].target,
        location: notifications[2].location,
        player: null,
        ...commandUnitsDecision,
      },
    ];
    return {
      localPlayerId: 0,
      turn: { ok: true, value: 123 },
      turnDate: { ok: true, value: '1160 BCE' },
      hasSentTurnComplete: { ok: true, value: false },
      canEndTurn: { ok: true, value: false },
      blocker: { ok: true, value: 0 },
      blockingNotificationId: { ok: true, value: notifications[0].id },
      selectedUnitId: { ok: true, value: null },
      selectedCityId: { ok: true, value: null },
      firstReadyUnitId: { ok: true, value: { owner: 0, id: 1507331, type: 26 } },
      notifications,
      decisions: [diplomacyDecision, informationalDecision, commandUnitsDecision],
      hud: {
        nextDecision: queue[0],
        decisionQueue: queue,
      },
      limits: { maxNotifications: 25, truncated: false },
    };
  }
  if (mode === 'ready-unit') {
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
  if (mode === 'stale-informational') {
    const informationalDecision = {
      category: 'informational-notification',
      operationFamily: 'app-ui-action',
      operationType: 'Game.Notifications.dismiss',
      argsShape: '{ notificationId }',
      cli: 'game play dismiss-notification',
      requiredInputs: [
        { name: 'Notification', source: 'notification ComponentID', required: true },
      ],
      commonActions: [
        {
          label: 'dismiss reviewed notification',
          cli: "game play dismiss-notification --target '<notification-id>' --send --reason '<why this was reviewed>'",
          operationFamily: 'app-ui-action',
          operationType: 'Game.Notifications.dismiss',
          argsShape: '{ notificationId }',
          when: 'after reviewing the report',
        },
      ],
      confidence: 'official-ui',
      notes: ['Default-handler report notification; review before closeout.'],
    };
    const informationalNotification = {
      id: { owner: 0, id: 89, type: 20 },
      type: -2086317463,
      typeName: 'NOTIFICATION_VOLCANO_ACTIVE',
      groupType: null,
      summary: 'Hasandagi has become active. Beware -- it can now erupt at any time!',
      message: 'Volcano Now Active',
      target: { owner: -1, id: -1, type: 0 },
      location: { x: 6, y: 27 },
      canUserDismiss: true,
      expired: false,
      dismissed: false,
      isEndTurnBlocking: true,
      decision: informationalDecision,
    };
    return {
      localPlayerId: 0,
      turn: { ok: true, value: 80 },
      turnDate: { ok: true, value: '2025 BCE' },
      hasSentTurnComplete: { ok: true, value: false },
      canEndTurn: { ok: true, value: false },
      blocker: { ok: true, value: 0 },
      blockingNotificationId: { ok: true, value: informationalNotification.id },
      selectedUnitId: { ok: true, value: null },
      selectedCityId: { ok: true, value: null },
      firstReadyUnitId: { ok: true, value: null },
      notifications: [informationalNotification],
      decisions: [informationalDecision],
      hud: {
        nextDecision: {
          notificationId: informationalNotification.id,
          isEndTurnBlocking: true,
          typeName: informationalNotification.typeName,
          summary: informationalNotification.summary,
          message: informationalNotification.message,
          target: informationalNotification.target,
          location: informationalNotification.location,
          ...informationalDecision,
        },
        decisionQueue: [
          {
            notificationId: informationalNotification.id,
            isEndTurnBlocking: true,
            typeName: informationalNotification.typeName,
            summary: informationalNotification.summary,
            message: informationalNotification.message,
            target: informationalNotification.target,
            location: informationalNotification.location,
            ...informationalDecision,
          },
        ],
      },
      limits: { maxNotifications: 25, truncated: false },
    };
  }
  if (mode === 'diplomatic-report') {
    const informationalDecision = {
      category: 'informational-notification',
      operationFamily: 'app-ui-action',
      operationType: 'Game.Notifications.dismiss',
      argsShape: '{ notificationId }',
      cli: 'game play dismiss-notification',
      requiredInputs: [
        { name: 'Notification', source: 'notification ComponentID', required: true },
      ],
      commonActions: [
        {
          label: 'dismiss reviewed diplomatic relationship notice',
          cli: "game play dismiss-notification --target '<notification-id>' --send --reason '<why this relationship/agenda report was reviewed>'",
          operationFamily: 'app-ui-action',
          operationType: 'Game.Notifications.dismiss',
          argsShape: '{ notificationId }',
          when: 'after reviewing the relationship/agenda context and confirming the notification target is not a valid diplomatic action id',
        },
      ],
      confidence: 'official-ui',
      notes: ['Agenda and relationship reports can arrive as NOTIFICATION_DIPLOMATIC_ACTION with an invalid target; do not send RESPOND_DIPLOMATIC_ACTION without a valid action id.'],
    };
    const notification = {
      id: { owner: 0, id: 644, type: 20 },
      type: 96575930,
      typeName: 'NOTIFICATION_DIPLOMATIC_ACTION',
      groupType: -1225125244,
      summary: 'The Agenda of Genghis Khan has changed your Relationship.',
      message: 'The Agenda of Genghis Khan has changed your Relationship.',
      target: { owner: -1, id: -1, type: 0 },
      location: { x: 19, y: 26 },
      canUserDismiss: true,
      expired: false,
      dismissed: false,
      isEndTurnBlocking: true,
      decision: informationalDecision,
    };
    return {
      localPlayerId: 0,
      turn: { ok: true, value: 133 },
      turnDate: { ok: true, value: '960 BCE' },
      hasSentTurnComplete: { ok: true, value: false },
      canEndTurn: { ok: true, value: false },
      blocker: { ok: true, value: 0 },
      blockingNotificationId: { ok: true, value: notification.id },
      selectedUnitId: { ok: true, value: null },
      selectedCityId: { ok: true, value: null },
      firstReadyUnitId: { ok: true, value: { owner: 0, id: 1572876, type: 26 } },
      notifications: [notification],
      decisions: [informationalDecision],
      hud: {
        nextDecision: {
          notificationId: notification.id,
          isEndTurnBlocking: true,
          typeName: notification.typeName,
          summary: notification.summary,
          message: notification.message,
          target: notification.target,
          location: notification.location,
          player: null,
          ...informationalDecision,
        },
        decisionQueue: [
          {
            notificationId: notification.id,
            isEndTurnBlocking: true,
            typeName: notification.typeName,
            summary: notification.summary,
            message: notification.message,
            target: notification.target,
            location: notification.location,
            player: null,
            ...informationalDecision,
          },
        ],
      },
      limits: { maxNotifications: 25, truncated: false },
    };
  }
  if (mode === 'stale-unit-command') {
    const commandUnitsDecision = {
      category: 'unit-command',
      operationFamily: 'unit-operation',
      operationType: 'SKIP_TURN',
      argsShape: 'selected/ready unit id plus operation-specific args',
      cli: 'game play operation --family unit',
      requiredInputs: [
        { name: 'Unit', source: 'selectedUnitId or firstReadyUnitId', required: true },
        { name: 'Target plot', source: 'map coordinates', required: false },
      ],
      commonActions: [
        {
          label: 'read ready-unit view',
          cli: 'game play ready-unit --json',
          argsShape: 'selected/first ready unit, legal operations, nearby occupied plots',
          when: 'before choosing a unit operation',
        },
      ],
      confidence: 'heuristic',
      notes: ['Read the selected or first ready unit before choosing skip, automate, move, or promote.'],
    };
    const commandUnitsNotification = {
      id: { owner: 0, id: 88, type: 20 },
      type: -28491459,
      typeName: 'NOTIFICATION_COMMAND_UNITS',
      groupType: null,
      summary: 'Move a Unit or have it perform an operation.',
      message: 'Command Units',
      target: { owner: -1, id: -1, type: 0 },
      location: { x: -9999, y: -9999 },
      canUserDismiss: false,
      expired: true,
      dismissed: false,
      isEndTurnBlocking: true,
      decision: commandUnitsDecision,
    };
    return {
      localPlayerId: 0,
      turn: { ok: true, value: 80 },
      turnDate: { ok: true, value: '2025 BCE' },
      hasSentTurnComplete: { ok: true, value: false },
      canEndTurn: { ok: true, value: false },
      blocker: { ok: true, value: 0 },
      blockingNotificationId: { ok: true, value: commandUnitsNotification.id },
      selectedUnitId: { ok: true, value: null },
      selectedCityId: { ok: true, value: null },
      firstReadyUnitId: { ok: true, value: null },
      notifications: [commandUnitsNotification],
      decisions: [commandUnitsDecision],
      hud: {
        nextDecision: {
          notificationId: commandUnitsNotification.id,
          isEndTurnBlocking: true,
          typeName: commandUnitsNotification.typeName,
          summary: commandUnitsNotification.summary,
          message: commandUnitsNotification.message,
          target: commandUnitsNotification.target,
          location: commandUnitsNotification.location,
          ...commandUnitsDecision,
        },
        decisionQueue: [
          {
            notificationId: commandUnitsNotification.id,
            isEndTurnBlocking: true,
            typeName: commandUnitsNotification.typeName,
            summary: commandUnitsNotification.summary,
            message: commandUnitsNotification.message,
            target: commandUnitsNotification.target,
            location: commandUnitsNotification.location,
            ...commandUnitsDecision,
          },
        ],
      },
      limits: { maxNotifications: 25, truncated: false },
    };
  }
  return {
    localPlayerId: 0,
    turn: { ok: true, value: 80 },
    turnDate: { ok: true, value: '2025 BCE' },
    hasSentTurnComplete: { ok: true, value: false },
    canEndTurn: { ok: true, value: false },
    blocker: { ok: true, value: -2026570723 },
    blockingNotificationId: { ok: true, value: { owner: 0, id: 42, type: 20 } },
    selectedUnitId: { ok: true, value: null },
    selectedCityId: { ok: true, value: { owner: 0, id: 131073, type: 1 } },
    firstReadyUnitId: { ok: true, value: null },
    notifications: [
      {
        id: { owner: 0, id: 42, type: 20 },
        type: -123,
        typeName: 'NOTIFICATION_CHOOSE_TOWN_PROJECT',
        groupType: null,
        summary: 'Choose Town Project',
        message: 'Choose a town focus project',
        target: { owner: 0, id: 131073, type: 1 },
        location: null,
        canUserDismiss: false,
        expired: false,
        dismissed: false,
        isEndTurnBlocking: true,
        decision: {
          category: 'town-focus',
          operationFamily: 'city-command',
          operationType: 'CHANGE_GROWTH_MODE',
          argsShape: '{ Type, ProjectType, City }',
          cli: 'game play set-town-focus',
          requiredInputs: [
            { name: 'City', source: 'notification target or selected city', required: true },
            { name: 'Type', source: 'live town focus option', required: true },
            { name: 'ProjectType', source: 'live town focus option', required: true },
          ],
          commonActions: [
            {
              label: 'set town focus and close review',
              cli: "game play set-town-focus --city-id '<city-id>' --growth-type <type> --project-type <project-type> --send --closeout --reason '<why this focus was selected>'",
              operationFamily: 'sequence',
              operationType: 'CHANGE_GROWTH_MODE then CONSIDER_TOWN_PROJECT',
              argsShape: '{ Type, ProjectType, City } then {}',
              when: 'when the selected focus should be applied and the blocker closed as one caller workflow',
            },
            {
              label: 'set town focus',
              cli: "game play set-town-focus --city-id '<city-id>' --growth-type <type> --project-type <project-type>",
              operationFamily: 'city-command',
              operationType: 'CHANGE_GROWTH_MODE',
              argsShape: '{ Type, ProjectType, City }',
              when: 'after selecting the focus from live options',
            },
          ],
          confidence: 'live-proof',
          notes: ['Town focus is not city-operation BUILD; use --closeout when one caller action should apply the focus and clear the review surface.'],
        },
      },
    ],
    decisions: [
      {
        category: 'town-focus',
        operationFamily: 'city-command',
        operationType: 'CHANGE_GROWTH_MODE',
        argsShape: '{ Type, ProjectType, City }',
        cli: 'game play set-town-focus',
        requiredInputs: [
          { name: 'City', source: 'notification target or selected city', required: true },
          { name: 'Type', source: 'live town focus option', required: true },
          { name: 'ProjectType', source: 'live town focus option', required: true },
        ],
        commonActions: [
          {
            label: 'set town focus and close review',
            cli: "game play set-town-focus --city-id '<city-id>' --growth-type <type> --project-type <project-type> --send --closeout --reason '<why this focus was selected>'",
            operationFamily: 'sequence',
            operationType: 'CHANGE_GROWTH_MODE then CONSIDER_TOWN_PROJECT',
            argsShape: '{ Type, ProjectType, City } then {}',
            when: 'when the selected focus should be applied and the blocker closed as one caller workflow',
          },
          {
            label: 'set town focus',
            cli: "game play set-town-focus --city-id '<city-id>' --growth-type <type> --project-type <project-type>",
            operationFamily: 'city-command',
            operationType: 'CHANGE_GROWTH_MODE',
            argsShape: '{ Type, ProjectType, City }',
            when: 'after selecting the focus from live options',
          },
        ],
        confidence: 'live-proof',
        notes: ['Town focus is not city-operation BUILD; use --closeout when one caller action should apply the focus and clear the review surface.'],
      },
    ],
    hud: {
      nextDecision: {
        notificationId: { owner: 0, id: 42, type: 20 },
        isEndTurnBlocking: true,
        typeName: 'NOTIFICATION_CHOOSE_TOWN_PROJECT',
        summary: 'Choose Town Project',
        message: 'Choose a town focus project',
        target: { owner: 0, id: 131073, type: 1 },
        location: null,
        category: 'town-focus',
        operationFamily: 'city-command',
        operationType: 'CHANGE_GROWTH_MODE',
        argsShape: '{ Type, ProjectType, City }',
        cli: 'game play set-town-focus',
        requiredInputs: [
          { name: 'City', source: 'notification target or selected city', required: true },
          { name: 'Type', source: 'live town focus option', required: true },
          { name: 'ProjectType', source: 'live town focus option', required: true },
        ],
        commonActions: [
          {
            label: 'set town focus and close review',
            cli: "game play set-town-focus --city-id '<city-id>' --growth-type <type> --project-type <project-type> --send --closeout --reason '<why this focus was selected>'",
            operationFamily: 'sequence',
            operationType: 'CHANGE_GROWTH_MODE then CONSIDER_TOWN_PROJECT',
            argsShape: '{ Type, ProjectType, City } then {}',
            when: 'when the selected focus should be applied and the blocker closed as one caller workflow',
          },
          {
            label: 'set town focus',
            cli: "game play set-town-focus --city-id '<city-id>' --growth-type <type> --project-type <project-type>",
            operationFamily: 'city-command',
            operationType: 'CHANGE_GROWTH_MODE',
            argsShape: '{ Type, ProjectType, City }',
            when: 'after selecting the focus from live options',
          },
        ],
        notes: ['Town focus is not city-operation BUILD; use --closeout when one caller action should apply the focus and clear the review surface.'],
      },
      decisionQueue: [
        {
          notificationId: { owner: 0, id: 42, type: 20 },
          isEndTurnBlocking: true,
          typeName: 'NOTIFICATION_CHOOSE_TOWN_PROJECT',
          summary: 'Choose Town Project',
          message: 'Choose a town focus project',
          target: { owner: 0, id: 131073, type: 1 },
          location: null,
          category: 'town-focus',
          operationFamily: 'city-command',
          operationType: 'CHANGE_GROWTH_MODE',
          argsShape: '{ Type, ProjectType, City }',
          cli: 'game play set-town-focus',
          requiredInputs: [
            { name: 'City', source: 'notification target or selected city', required: true },
            { name: 'Type', source: 'live town focus option', required: true },
            { name: 'ProjectType', source: 'live town focus option', required: true },
          ],
          commonActions: [
            {
              label: 'set town focus and close review',
              cli: "game play set-town-focus --city-id '<city-id>' --growth-type <type> --project-type <project-type> --send --closeout --reason '<why this focus was selected>'",
              operationFamily: 'sequence',
              operationType: 'CHANGE_GROWTH_MODE then CONSIDER_TOWN_PROJECT',
              argsShape: '{ Type, ProjectType, City } then {}',
              when: 'when the selected focus should be applied and the blocker closed as one caller workflow',
            },
            {
              label: 'set town focus',
              cli: "game play set-town-focus --city-id '<city-id>' --growth-type <type> --project-type <project-type>",
              operationFamily: 'city-command',
              operationType: 'CHANGE_GROWTH_MODE',
              argsShape: '{ Type, ProjectType, City }',
              when: 'after selecting the focus from live options',
            },
          ],
          notes: ['Town focus is not city-operation BUILD; use --closeout when one caller action should apply the focus and clear the review surface.'],
        },
      ],
    },
    limits: { maxNotifications: 25, truncated: false },
  };
}

function unitTargetAction(send: boolean, mode: 'verified' | 'no-op-after-send' | 'path-shortfall' | 'delayed-after-send' | 'delayed-observed' = 'verified') {
  const unitId = { owner: 0, id: 65536, type: 26 };
  const beforeUnit = { ok: true, value: { id: unitId, location: { x: 22, y: 33 }, movementMovesRemaining: 2, attacksRemaining: 1 } };
  const delayedObservedUnit = { ok: true, value: { id: unitId, location: { x: 22, y: 33 }, movementMovesRemaining: 2, attacksRemaining: 0 } };
  const beforeTargetUnits = { ok: true, value: [{ owner: 62, id: 123, type: 26 }] };
  const verified = send && mode === 'verified';
  const pathShortfall = send && mode === 'path-shortfall';
  const delayedObserved = !send && mode === 'delayed-observed';
  const selected = mode === 'path-shortfall'
    ? {
        family: 'unit-operation',
        operationType: 'MOVE_TO',
        args: { X: 23, Y: 33, Modifiers: 3 },
        valid: true,
        result: { Success: true, Plots: [1457] },
        targetInReturnedPlots: true,
      }
    : {
        family: 'unit-operation',
        operationType: 'UNITOPERATION_RANGE_ATTACK',
        args: { X: 23, Y: 33, Modifiers: 3 },
        valid: true,
        result: { Success: true, Plots: [1457] },
        targetInReturnedPlots: true,
      };
  return {
    unitId,
    target: { x: 23, y: 33, index: { ok: true, value: 1457 } },
    beforeUnit: delayedObserved ? delayedObservedUnit : beforeUnit,
    beforeTargetUnits,
    candidates: [selected],
    selected,
    sent: send,
    ...(send
      ? {
          sendResult: { accepted: true },
          afterUnit: verified || pathShortfall
            ? {
                ok: true,
                value: {
                  id: unitId,
                  location: pathShortfall ? { x: 22, y: 34 } : { x: 22, y: 33 },
                  movementMovesRemaining: pathShortfall ? 0 : 2,
                  attacksRemaining: verified ? 0 : 1,
                },
              }
            : beforeUnit,
          afterTargetUnits: beforeTargetUnits,
          verified: verified || pathShortfall,
          verification: {
            status: verified || pathShortfall ? 'verified' : 'no-state-change',
            classification: pathShortfall ? 'path-shortfall' : verified ? 'unit-state-changed' : 'no-state-change',
            unitChanged: verified || pathShortfall,
            targetUnitsChanged: false,
            destinationReached: pathShortfall ? false : null,
            requestedLocation: { x: 23, y: 33 },
            landedLocation: pathShortfall ? { x: 22, y: 34 } : { x: 22, y: 33 },
            reason: pathShortfall
              ? 'unit moved, but landed short of the requested target tile; re-read before issuing a follow-up move'
              : verified
                ? 'unit state changed after send'
              : 'send returned but unit and target-plot probes did not change; re-read before repeating',
          },
        }
      : {
          verification: {
            status: 'not-sent',
            classification: 'not-sent',
            unitChanged: false,
            targetUnitsChanged: false,
            destinationReached: null,
            requestedLocation: { x: 23, y: 33 },
            landedLocation: { x: 22, y: 33 },
            reason: 'read-only target resolution; use --send with an approval reason to mutate',
          },
        }),
    notes: ['Selection follows the official right-click WorldInput target order.'],
  };
}

function unitMovePreviewView() {
  const unitId = { owner: 0, id: 65536, type: 26 };
  return {
    localPlayerId: 0,
    requestedUnitId: unitId,
    selectedUnitId: { ok: true, value: unitId },
    firstReadyUnitId: { ok: true, value: unitId },
    unitId,
    unit: {
      ok: true,
      value: {
        id: unitId,
        owner: 0,
        type: 222,
        typeName: 'UNIT_GALLEY',
        location: { x: 24, y: 35 },
        movementMovesRemaining: 2,
        attacksRemaining: 1,
        damage: 0,
      },
    },
    reachableMovement: {
      ok: true,
      value: [
        { index: 2964, x: 24, y: 35 },
        { index: 2965, x: 25, y: 35 },
      ],
    },
    reachableZonesOfControl: { ok: true, value: [] },
    reachableTargets: { ok: true, value: [[{ index: 2966, x: 26, y: 35 }]] },
    queuedDestination: { ok: true, value: { x: 25, y: 35 } },
    queuedPath: {
      ok: true,
      value: {
        plots: [
          { index: 2964, x: 24, y: 35 },
          { index: 2965, x: 25, y: 35 },
        ],
        plotCount: 2,
        turns: 1,
        obstacles: [],
        rawKeys: ['obstacles', 'plots', 'turns'],
      },
    },
    requestedDestination: { x: 25, y: 35 },
    requestedPath: {
      ok: true,
      value: {
        plots: [
          { index: 2964, x: 24, y: 35 },
          { index: 2965, x: 25, y: 35 },
        ],
        plotCount: 2,
        turns: 1,
        obstacles: [],
        rawKeys: ['obstacles', 'plots', 'turns'],
      },
    },
    relationshipPolicy: {
      relationshipSource: 'not-classified',
      relationshipProof: 'none',
      unprovenLabel: 'relationship-unproven',
      guidance: 'This movement preview does not classify other-owner relationships. Use neutral labels unless an official relationship, team, diplomacy, independent-power, or war-state API supplies that proof.',
    },
    notes: ['Read-only official movement preview. It does not send MOVE_TO, reserve a path, or prove tactical safety.'],
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
    productionCandidates: {
      ok: true,
      value: [
        {
          kind: 'constructible',
          type: 713967338,
          typeName: 'BUILDING_WALLS',
          name: 'LOC_BUILDING_WALLS_NAME',
          args: { ConstructibleType: 713967338 },
          valid: true,
          result: { Success: true, Plots: [1457] },
          placementPlots: [{ index: 1457, x: 22, y: 31 }],
          cli: "game play build-production --city-id '<city-id>' --constructible-type 713967338 --x <x> --y <y>",
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
          cli: "game play set-town-focus --city-id '<city-id>' --growth-type -284569333 --project-type -548685232",
        },
      ],
    },
    populationPlacement: {
      ok: true,
      value: {
        isReadyToPlacePopulation: { ok: true, value: true },
        cityWorkerCap: { ok: true, value: 4 },
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
              maintenance: null,
              placementInfo: { PlotIndex: 1457, IsBlocked: false },
              cli: 'game play assign-worker --player-id <id> --location 1457',
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
              constructibleName: 'LOC_BUILDING_WALLS_NAME',
              cli: "game play expand-city --city-id '<city-id>' --x 23 --y 31",
            },
          ],
        },
        expansionResult: {
          ok: true,
          value: { Success: true, Plots: [1458], ConstructibleTypes: [713967338] },
        },
        cliHints: [
          'game play assign-worker --player-id <id> --location <plot-index>',
          "game play expand-city --city-id '<city-id>' --x <x> --y <y>",
        ],
      },
    },
    notes: ['Read-only ready-city view. This view intentionally does not choose production.'],
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
    notes: ['Read-only settlement recommendation view. It wraps the official settlement lens API.'],
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

function notificationDismissal(send: boolean) {
  const notificationId = { owner: 0, id: 113, type: 20 };
  const before = {
    id: notificationId,
    exists: true,
    type: 2091697919,
    typeName: 'NOTIFICATION_WONDER_COMPLETED',
    summary: 'An unmet player has finished constructing the World Wonder Great Stele.',
    message: 'Wonder Completed',
    target: { owner: -1, id: -1, type: 0 },
    location: { x: -9999, y: -9999 },
    canUserDismiss: true,
    expired: false,
    dismissed: false,
    blocksTurnAdvancement: { ok: true, value: true },
    endTurnBlockingType: { ok: true, value: 2091697919 },
    isEndTurnBlocking: { ok: true, value: true },
  };
  return {
    notificationId,
    before,
    after: send
      ? {
          ...before,
          dismissed: true,
          blocksTurnAdvancement: { ok: true, value: false },
          endTurnBlockingType: { ok: true, value: 0 },
          isEndTurnBlocking: { ok: true, value: false },
        }
      : null,
    canDismiss: true,
    sent: send,
    result: send ? true : null,
    verified: send,
    notes: ['This is an App UI notification action, not a gameplay operation family.'],
  };
}

function turnCompletionStatus(sent: boolean, canEndTurnBefore = true) {
  return {
    host: '127.0.0.1',
    port: 0,
    state: { id: '65535', name: 'App UI', role: 'app-ui' },
    localPlayerId: 0,
    turn: { ok: true, value: sent ? 2 : 1 },
    turnDate: { ok: true, value: '4000 BCE' },
    hasSentTurnComplete: { ok: true, value: sent },
    canEndTurn: { ok: true, value: sent ? false : canEndTurnBefore },
    blocker: { ok: true, value: 0 },
    firstReadyUnitId: { ok: true, value: null },
  };
}

function operationValidation(message: string) {
  const family = message.includes('validateOperation("unit-command"') || message.includes('sendOperation("unit-command"')
    ? 'unit-command'
    : message.includes('validateOperation("city-command"') || message.includes('sendOperation("city-command"')
    ? 'city-command'
    : message.includes('validateOperation("city-operation"') || message.includes('sendOperation("city-operation"')
    ? 'city-operation'
    : message.includes('validateOperation("player-operation"') || message.includes('sendOperation("player-operation"')
      ? 'player-operation'
      : 'unit-operation';
  const operationType = operationTypeFromMessage(message);
  return {
    host: '127.0.0.1',
    port: 0,
    state: { id: '1', name: 'Tuner', role: 'tuner' },
    family,
    operationType,
    enumValue: operationType,
    target: operationTarget(family),
    args: operationArgs(operationType, message),
    valid: true,
    result: { Success: true },
  };
}

function operationTypeFromMessage(message: string) {
  const validateIndex = message.lastIndexOf('validateOperation("');
  const sendIndex = message.lastIndexOf('sendOperation("');
  const callIndex = Math.max(validateIndex, sendIndex);
  const callSource = callIndex >= 0 ? message.slice(callIndex) : message;
  return callSource.match(/"operationType":"([^"]+)"/)?.[1] ?? 'SKIP_TURN';
}

function unitOperationPostconditionSnapshot(firstReadyUnitId: { owner: number; id: number; type: number }) {
  return {
    unit: {
      ok: true,
      value: {
        id: { owner: 0, id: 65536, type: 26 },
        location: { x: 22, y: 33 },
        movement: 2,
        activity: 'UNIT_ACTIVITY_AWAKE',
        damage: 0,
        attacks: 1,
      },
    },
    selectedUnitId: { ok: true, value: { owner: 0, id: 65536, type: 26 } },
    firstReadyUnitId: { ok: true, value: firstReadyUnitId },
    blocker: { ok: true, value: 0 },
  };
}

function populationPlacementPostconditionSnapshot(isReadyToPlacePopulation: boolean) {
  return {
    cityId: { owner: 0, id: 196610, type: 1 },
    city: {
      ok: true,
      value: {
        id: { owner: 0, id: 196610, type: 1 },
        population: isReadyToPlacePopulation ? 4 : 5,
        isTown: true,
        location: { x: 20, y: 20 },
      },
    },
    isReadyToPlacePopulation: { ok: true, value: isReadyToPlacePopulation },
    cityWorkerCap: { ok: true, value: isReadyToPlacePopulation ? 4 : 5 },
    workablePlotIndexes: { ok: true, value: isReadyToPlacePopulation ? [2543, 2544] : [2543, 2544, 2545] },
    blockedPlotIndexes: { ok: true, value: isReadyToPlacePopulation ? [2545] : [] },
    expansionPlotIndexes: { ok: true, value: isReadyToPlacePopulation ? [1660] : [1661] },
  };
}

function operationTarget(family: string) {
  if (family === 'player-operation') return { playerId: 0 };
  if (family === 'city-operation' || family === 'city-command') return { cityId: { owner: 0, id: 65536, type: 25 } };
  return { unitId: { owner: 0, id: 65536, type: 26 } };
}

function operationArgs(operationType: string, message = '') {
  if (operationType === 'VIEWED_ADVISOR_WARNING') return { Target: { owner: 0, id: 12345, type: 99 } };
  if (operationType === 'SET_TECH_TREE_NODE') return { ProgressionTreeNodeType: -1255676052 };
  if (operationType === 'SET_TECH_TREE_TARGET_NODE') return { ProgressionTreeNodeType: -1255676052 };
  if (operationType === 'SET_CULTURE_TREE_NODE') return { ProgressionTreeNodeType: 115 };
  if (operationType === 'SET_CULTURE_TREE_TARGET_NODE') return { ProgressionTreeNodeType: -1677668973 };
  if (operationType === 'CHOOSE_GOLDEN_AGE') return { GoldenAgeType: -340825966 };
  if (operationType === 'RESPOND_DIPLOMATIC_ACTION') return { ID: 56, Type: -1907089594 };
  if (operationType === 'RESPOND_DIPLOMATIC_FIRST_MEET') return { Player1: 0, Player2: 2, Type: 673478009 };
  if (operationType === 'CHOOSE_NARRATIVE_STORY_DIRECTION') {
    return {
      TargetType: 'TOT_30001B',
      Target: { owner: 0, id: 45, type: 35 },
      Action: -1326475004,
    };
  }
  if (operationType === 'BUY_ATTRIBUTE_TREE_NODE') return { ProgressionTreeNodeType: 20 };
  if (operationType === 'CHANGE_TRADITION') return { TraditionType: -331546976, Action: -1326475004 };
  if (operationType === 'CONSIDER_ASSIGN_ATTRIBUTE') return {};
  if (operationType === 'CONSIDER_ASSIGN_TRADITIONS') return {};
  if (operationType === 'CHANGE_GROWTH_MODE') return { Type: -284569333, ProjectType: -548685232, City: 131073 };
  if (operationType === 'CONSIDER_TOWN_PROJECT') return {};
  if (operationType === 'EXPAND') return { X: 16, Y: 19 };
  if (operationType === 'ASSIGN_WORKER') return { Location: 2543, Amount: 1 };
  if (operationType === 'UNITCOMMAND_RESETTLE') return { X: 17, Y: 25 };
  if (operationType === 'UNITCOMMAND_UPGRADE') return {};
  if (operationType === 'BUILD' && message.includes('ConstructibleType')) {
    return { ConstructibleType: 713967338, X: 22, Y: 31 };
  }
  if (operationType === 'BUILD' && message.includes('ProjectType')) return { ProjectType: 12345 };
  if (operationType === 'BUILD') return { UnitType: 1558890441 };
  return undefined;
}

function parseRequest(buffer: Buffer):
  | {
      listenerId: number;
      message: string;
      bytesRead: number;
    }
  | null {
  if (buffer.length < 8) return null;
  const messageLength = buffer.readUInt32LE(0);
  const bytesRead = 8 + messageLength;
  if (buffer.length < bytesRead) return null;
  return {
    listenerId: buffer.readUInt32LE(4),
    message: buffer.subarray(8, bytesRead).toString('utf8').replace(/\0$/, ''),
    bytesRead,
  };
}

function encodeResponse(listenerId: number, parts: string[]): Buffer {
  const messageBytes = Buffer.from(`${parts.join('\0')}\0`, 'utf8');
  const frame = Buffer.alloc(8 + messageBytes.length);
  frame.writeUInt32LE(messageBytes.length, 0);
  frame.writeUInt32LE(listenerId, 4);
  messageBytes.copy(frame, 8);
  return frame;
}
