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
import GamePlayChooseCelebration from '../../src/commands/game/play/choose-celebration';
import GamePlayChooseCulture from '../../src/commands/game/play/choose-culture';
import GamePlayChooseNarrative from '../../src/commands/game/play/choose-narrative';
import GamePlayChooseTech from '../../src/commands/game/play/choose-tech';
import GamePlayConsiderAttributes from '../../src/commands/game/play/consider-attributes';
import GamePlayConsiderTownProject from '../../src/commands/game/play/consider-town-project';
import GamePlayConsiderTraditions from '../../src/commands/game/play/consider-traditions';
import GamePlayDestinationAnalysis from '../../src/commands/game/play/destination-analysis';
import GamePlayDismissNotification from '../../src/commands/game/play/dismiss-notification';
import GamePlayEndTurn from '../../src/commands/game/play/end-turn';
import GamePlayExpandCity from '../../src/commands/game/play/expand-city';
import GamePlayOperation from '../../src/commands/game/play/operation';
import GamePlayNotifications from '../../src/commands/game/play/notifications';
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

  test('wraps city unit production as BUILD with UnitType', async () => {
    const server = await startTunerServer();
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

      expect(server.received.some((message) => message.includes('BUILD'))).toBe(true);
      expect(server.received.some((message) => message.includes('"UnitType":1558890441'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation("city-operation"'))).toBe(true);
    } finally {
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

  test('lists live-play topic shortcuts without touching the game runtime', async () => {
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayTopics.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      await GamePlayTopics.run(['--family', 'rhq-ai', '--json']);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        topics: Array<{ family: string; commands: string[]; boundary: string }>;
      };
      expect(payload.topics).toHaveLength(1);
      expect(payload.topics[0].family).toBe('rhq-ai');
      expect(payload.topics[0].commands).toContain('game ai loaded-levers');
      expect(payload.topics[0].boundary).toMatch(/loaded GameInfo rows/);
    } finally {
      log.mockRestore();
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
        result: { sent: boolean; verified: boolean; verification: { status: string; reason: string } };
      };
      expect(payload.result.sent).toBe(true);
      expect(payload.result.verified).toBe(false);
      expect(payload.result.verification.status).toBe('no-state-change');
      expect(payload.result.verification.reason).toMatch(/re-read before repeating/);
      expect(server.received.some((message) => message.includes('"send":true'))).toBe(true);
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

  test('reads target candidates without sending operations', async () => {
    const server = await startTunerServer();
    try {
      const { port } = server.address();
      await GamePlayTargetCandidates.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--x',
        '18',
        '--y',
        '20',
        '--json',
      ]);

      expect(server.received.some((message) => message.includes('readTargetCandidates'))).toBe(true);
      expect(server.received.some((message) => message.includes('"origins":[{"x":18,"y":20}]'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendRequest'))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test('reads battlefield scan without sending operations', async () => {
    const server = await startTunerServer();
    try {
      const { port } = server.address();
      await GamePlayBattlefieldScan.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--x',
        '17',
        '--y',
        '20',
        '--radius',
        '8',
        '--json',
      ]);

      expect(server.received.some((message) => message.includes('readBattlefieldScan'))).toBe(true);
      expect(server.received.some((message) => message.includes('"origins":[{"x":17,"y":20}]'))).toBe(true);
      expect(server.received.some((message) => message.includes('"radius":8'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendRequest'))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test('reads destination analysis without sending operations', async () => {
    const server = await startTunerServer();
    try {
      const { port } = server.address();
      await GamePlayDestinationAnalysis.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--from-x',
        '20',
        '--from-y',
        '14',
        '--to-x',
        '13',
        '--to-y',
        '17',
        '--corridor-radius',
        '2',
        '--destination-radius',
        '4',
        '--json',
      ]);

      expect(server.received.some((message) => message.includes('readDestinationAnalysis'))).toBe(true);
      expect(server.received.some((message) => message.includes('"origin":{"x":20,"y":14}'))).toBe(true);
      expect(server.received.some((message) => message.includes('"destination":{"x":13,"y":17}'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendRequest'))).toBe(false);
    } finally {
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

async function startTunerServer(options: {
  canEndTurnBefore?: boolean;
  playNotificationMode?: 'town-focus' | 'stale-unit-command' | 'stale-informational' | 'ready-unit';
  unitTargetMode?: 'verified' | 'no-op-after-send';
} = {}) {
  const received: string[] = [];
  let turnCompleteSent = false;
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
          socket.write(encodeResponse(frame.listenerId, [JSON.stringify(unitTargetAction(frame.message.includes('"send":true'), options.unitTargetMode))]));
        } else if (frame.message.includes('readReadyUnitView')) {
          socket.write(encodeResponse(frame.listenerId, [JSON.stringify(readyUnitView())]));
        } else if (frame.message.includes('readReadyCityView')) {
          socket.write(encodeResponse(frame.listenerId, [JSON.stringify(readyCityView())]));
        } else if (frame.message.includes('readSettlementRecommendations')) {
          socket.write(encodeResponse(frame.listenerId, [JSON.stringify(settlementRecommendationsView())]));
        } else if (frame.message.includes('readTargetCandidates')) {
          socket.write(encodeResponse(frame.listenerId, [JSON.stringify(targetCandidatesView())]));
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
          socket.write(encodeResponse(frame.listenerId, [JSON.stringify({ sent: true })]));
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

function playNotificationView(mode: 'town-focus' | 'stale-unit-command' | 'stale-informational' | 'ready-unit' = 'town-focus') {
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
              label: 'set town focus',
              cli: "game play set-town-focus --city-id '<city-id>' --growth-type <type> --project-type <project-type>",
              operationFamily: 'city-command',
              operationType: 'CHANGE_GROWTH_MODE',
              argsShape: '{ Type, ProjectType, City }',
              when: 'after selecting the focus from live options',
            },
          ],
          confidence: 'live-proof',
          notes: ['Town focus is not city-operation BUILD; closeout may require CONSIDER_TOWN_PROJECT.'],
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
            label: 'set town focus',
            cli: "game play set-town-focus --city-id '<city-id>' --growth-type <type> --project-type <project-type>",
            operationFamily: 'city-command',
            operationType: 'CHANGE_GROWTH_MODE',
            argsShape: '{ Type, ProjectType, City }',
            when: 'after selecting the focus from live options',
          },
        ],
        confidence: 'live-proof',
        notes: ['Town focus is not city-operation BUILD; closeout may require CONSIDER_TOWN_PROJECT.'],
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
            label: 'set town focus',
            cli: "game play set-town-focus --city-id '<city-id>' --growth-type <type> --project-type <project-type>",
            operationFamily: 'city-command',
            operationType: 'CHANGE_GROWTH_MODE',
            argsShape: '{ Type, ProjectType, City }',
            when: 'after selecting the focus from live options',
          },
        ],
        notes: ['Town focus is not city-operation BUILD; closeout may require CONSIDER_TOWN_PROJECT.'],
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
              label: 'set town focus',
              cli: "game play set-town-focus --city-id '<city-id>' --growth-type <type> --project-type <project-type>",
              operationFamily: 'city-command',
              operationType: 'CHANGE_GROWTH_MODE',
              argsShape: '{ Type, ProjectType, City }',
              when: 'after selecting the focus from live options',
            },
          ],
          notes: ['Town focus is not city-operation BUILD; closeout may require CONSIDER_TOWN_PROJECT.'],
        },
      ],
    },
    limits: { maxNotifications: 25, truncated: false },
  };
}

function unitTargetAction(send: boolean, mode: 'verified' | 'no-op-after-send' = 'verified') {
  const unitId = { owner: 0, id: 65536, type: 26 };
  const beforeUnit = { ok: true, value: { id: unitId, location: { x: 22, y: 33 }, movementMovesRemaining: 2, attacksRemaining: 1 } };
  const beforeTargetUnits = { ok: true, value: [{ owner: 62, id: 123, type: 26 }] };
  const verified = send && mode === 'verified';
  return {
    unitId,
    target: { x: 23, y: 33, index: { ok: true, value: 1457 } },
    beforeUnit,
    beforeTargetUnits,
    candidates: [
      {
        family: 'unit-operation',
        operationType: 'UNITOPERATION_RANGE_ATTACK',
        args: { X: 23, Y: 33, Modifiers: 3 },
        valid: true,
        result: { Success: true, Plots: [1457] },
        targetInReturnedPlots: true,
      },
    ],
    selected: {
      family: 'unit-operation',
      operationType: 'UNITOPERATION_RANGE_ATTACK',
      args: { X: 23, Y: 33, Modifiers: 3 },
      valid: true,
      result: { Success: true, Plots: [1457] },
      targetInReturnedPlots: true,
    },
    sent: send,
    ...(send
      ? {
          sendResult: { accepted: true },
          afterUnit: verified
            ? { ok: true, value: { id: unitId, location: { x: 22, y: 33 }, movementMovesRemaining: 2, attacksRemaining: 0 } }
            : beforeUnit,
          afterTargetUnits: beforeTargetUnits,
          verified,
          verification: {
            status: verified ? 'verified' : 'no-state-change',
            unitChanged: verified,
            targetUnitsChanged: false,
            reason: verified
              ? 'unit or target-plot state changed after send'
              : 'send returned but unit and target-plot probes did not change; re-read before repeating',
          },
        }
      : {
          verification: {
            status: 'not-sent',
            unitChanged: false,
            targetUnitsChanged: false,
            reason: 'read-only target resolution; use --send with an approval reason to mutate',
          },
        }),
    notes: ['Selection follows the official right-click WorldInput target order.'],
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
          routeHint: 'near-low-density',
          notes: ['Distance is a cheap grid heuristic for target ranking, not a pathfinder result.'],
        },
        reasons: ['nearest target distance 5', 'single known city target', 'low nearby unit density'],
      },
    ],
    notes: ['Read-only strategic target shortlist. It ranks opponents; it does not choose or send war, movement, or attack operations.'],
  };
}

function battlefieldScanView() {
  const friendlyUnit = {
    id: { owner: 0, id: 458752, type: 26 },
    owner: 0,
    stance: 'friendly',
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
  const opponentUnit = {
    id: { owner: 9, id: 196608, type: 26 },
    owner: 9,
    stance: 'other',
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
    units: [friendlyUnit, opponentUnit],
    cities: [city],
    owners: [
      {
        owner: 0,
        stance: 'friendly',
        leaderName: { ok: true, value: 'Player' },
        civilizationName: { ok: true, value: 'Assyria' },
        unitCount: 1,
        cityCount: 0,
        roles: { ranged: 1 },
        apparentStrength: 9.6,
        nearestUnit: friendlyUnit,
        nearestCity: null,
      },
      {
        owner: 9,
        stance: 'other',
        leaderName: { ok: true, value: 'Independent Power' },
        civilizationName: { ok: true, value: 'Independent' },
        unitCount: 1,
        cityCount: 1,
        roles: { melee: 1 },
        apparentStrength: 20,
        nearestUnit: opponentUnit,
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
        kind: 'city-front',
        severity: 'medium',
        location: city.location,
        summary: 'nearest non-friendly city in scan radius',
        cities: [city],
      },
    ],
    notes: ['Read-only battlefield lens for tactical orientation. It does not path, move, attack, declare war, or validate operations.'],
  };
}

function destinationAnalysisView() {
  const opponentUnit = {
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
      units: [opponentUnit],
      unitCount: 1,
    },
    destinationPressure: {
      units: [opponentUnit],
      unitCount: 1,
      cities: [city],
      cityCount: 1,
      apparentOtherStrength: 20,
    },
    pointsOfInterest: [
      {
        kind: 'destination-pressure',
        severity: 'medium',
        location: opponentUnit.location,
        summary: '1 non-friendly units near destination',
        units: [opponentUnit],
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
  const operationType = message.includes('VIEWED_ADVISOR_WARNING')
    ? 'VIEWED_ADVISOR_WARNING'
    : message.includes('SET_TECH_TREE_NODE')
      ? 'SET_TECH_TREE_NODE'
      : message.includes('SET_TECH_TREE_TARGET_NODE')
        ? 'SET_TECH_TREE_TARGET_NODE'
        : message.includes('SET_CULTURE_TREE_NODE')
          ? 'SET_CULTURE_TREE_NODE'
          : message.includes('SET_CULTURE_TREE_TARGET_NODE')
            ? 'SET_CULTURE_TREE_TARGET_NODE'
            : message.includes('CHOOSE_GOLDEN_AGE')
              ? 'CHOOSE_GOLDEN_AGE'
              : message.includes('RESPOND_DIPLOMATIC_ACTION')
                ? 'RESPOND_DIPLOMATIC_ACTION'
                : message.includes('RESPOND_DIPLOMATIC_FIRST_MEET')
                  ? 'RESPOND_DIPLOMATIC_FIRST_MEET'
                  : message.includes('CHOOSE_NARRATIVE_STORY_DIRECTION')
                    ? 'CHOOSE_NARRATIVE_STORY_DIRECTION'
                    : message.includes('BUY_ATTRIBUTE_TREE_NODE')
                      ? 'BUY_ATTRIBUTE_TREE_NODE'
                      : message.includes('CHANGE_TRADITION')
                        ? 'CHANGE_TRADITION'
                        : message.includes('CONSIDER_ASSIGN_ATTRIBUTE')
                          ? 'CONSIDER_ASSIGN_ATTRIBUTE'
                          : message.includes('CONSIDER_ASSIGN_TRADITIONS')
                            ? 'CONSIDER_ASSIGN_TRADITIONS'
                            : message.includes('CHANGE_GROWTH_MODE')
                              ? 'CHANGE_GROWTH_MODE'
                              : message.includes('CONSIDER_TOWN_PROJECT')
                                ? 'CONSIDER_TOWN_PROJECT'
                                : message.includes('EXPAND')
                                  ? 'EXPAND'
                                  : message.includes('ASSIGN_WORKER')
                                    ? 'ASSIGN_WORKER'
                                    : message.includes('UNITCOMMAND_RESETTLE')
                                      ? 'UNITCOMMAND_RESETTLE'
                                      : message.includes('UNITCOMMAND_UPGRADE')
                                        ? 'UNITCOMMAND_UPGRADE'
                                        : message.includes('BUILD')
                                          ? 'BUILD'
                                          : 'SKIP_TURN';
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
