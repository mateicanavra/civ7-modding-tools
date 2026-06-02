import { once } from 'node:events';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { type AddressInfo, createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, test, vi } from 'vitest';
import GamePlayAssignWorker from '../../src/commands/game/play/assign-worker';
import GamePlayBattlefieldScan from '../../src/commands/game/play/battlefield-scan';
import GamePlayBuildProduction from '../../src/commands/game/play/build-production';
import GamePlayBuildUnit from '../../src/commands/game/play/build-unit';
import GamePlayBuyAttribute from '../../src/commands/game/play/buy-attribute';
import GamePlayChangeTradition from '../../src/commands/game/play/change-tradition';
import GamePlayCivilianRouteTriage from '../../src/commands/game/play/civilian-route-triage';
import GamePlayChooseCelebration from '../../src/commands/game/play/choose-celebration';
import GamePlayChooseCulture from '../../src/commands/game/play/choose-culture';
import GamePlayChooseGovernment from '../../src/commands/game/play/choose-government';
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
import GamePlayNotificationQueue from '../../src/commands/game/play/notification-queue';
import GamePlayNotifications from '../../src/commands/game/play/notifications';
import GamePlayPriorities from '../../src/commands/game/play/priorities';
import GamePlayProgressDashboard from '../../src/commands/game/play/progress-dashboard';
import GamePlayPromotionReadiness from '../../src/commands/game/play/promotion-readiness';
import GamePlayReadyCity from '../../src/commands/game/play/ready-city';
import GamePlayReadyUnit from '../../src/commands/game/play/ready-unit';
import GamePlayRehydrate from '../../src/commands/game/play/rehydrate';
import GamePlayRespondDiplomacy from '../../src/commands/game/play/respond-diplomacy';
import GamePlaySetCultureTarget from '../../src/commands/game/play/set-culture-target';
import GamePlaySetTechTarget from '../../src/commands/game/play/set-tech-target';
import GamePlaySetTownFocus from '../../src/commands/game/play/set-town-focus';
import GamePlaySettlementRecommendations from '../../src/commands/game/play/settlement-recommendations';
import GamePlayTargetCandidates from '../../src/commands/game/play/target-candidates';
import GamePlayTopics from '../../src/commands/game/play/topics';
import GamePlayTraditions from '../../src/commands/game/play/traditions';
import GamePlayUnitMovePreview from '../../src/commands/game/play/unit-move-preview';
import GamePlayUnitTarget from '../../src/commands/game/play/unit-target';
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

  test('blocks raw end-turn fallback when stale command-units has a validator-backed closeout', async () => {
    const server = await startTunerServer({
      canEndTurnBefore: false,
      playNotificationMode: 'stale-unit-command',
    });
    try {
      const { port } = server.address();
      await expect(GamePlayEndTurn.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--send',
        '--reason',
        'test blocked because a unit closeout exists',
        '--json',
      ])).rejects.toThrow(/blocked by current game state/);

      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
      expect(server.received).not.toContain('CMD:65535:GameContext.sendTurnComplete()');
    } finally {
      await server.close();
    }
  });

  test('allows end-turn fallback for stale command-units only when no closeout is enabled', async () => {
    const server = await startTunerServer({
      canEndTurnBefore: false,
      playNotificationMode: 'stale-unit-command-disabled',
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
        'test approved stale expired command-units end-turn',
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

  test('blocks end-turn fallback for still-front unit-lost reports', async () => {
    const server = await startTunerServer({
      canEndTurnBefore: false,
      playNotificationMode: 'unit-lost-report',
    });
    try {
      const { port } = server.address();
      await expect(GamePlayEndTurn.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--send',
        '--reason',
        'test blocked unit-lost report end-turn',
        '--json',
      ])).rejects.toThrow(/blocked by current game state/);

      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
      expect(server.received).not.toContain('CMD:65535:GameContext.sendTurnComplete()');
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

  test('reads technology choice options without requiring a node', async () => {
    const server = await startTunerServer({ playNotificationMode: 'tech-choice' });
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayChooseTech.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayChooseTech.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--options',
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        result: {
          enabledOptionCount: number;
          disabledOptionCount: number;
          omitted: Array<{ path: string; reason: string }>;
          surfaces: Array<{
            kind: string;
            enabledOptions: Array<{ nodeType: number; name: string; chooseCli: string | null; turns: number | null; cost: number | null }>;
            options?: unknown;
            disabledOptions?: unknown;
          }>;
          details?: unknown;
        };
      };
      expect(payload.result.enabledOptionCount).toBe(2);
      expect(payload.result.disabledOptionCount).toBe(1);
      expect(payload.result.details).toBeUndefined();
      expect(payload.result.surfaces[0].kind).toBe('technology-choice-options');
      expect(payload.result.surfaces[0].options).toBeUndefined();
      expect(payload.result.surfaces[0].disabledOptions).toBeUndefined();
      const masonry = payload.result.surfaces[0].enabledOptions.find((option) => option.nodeType === -1255676052);
      expect(masonry?.name).toBe('Masonry');
      expect(masonry?.chooseCli).toContain('game play choose-tech --player-id 0 --node -1255676052 --send');
      expect(masonry?.chooseCli).not.toContain('--closeout');
      expect(masonry?.turns).toBe(2);
      expect(masonry?.cost).toBe(137);
      expect(payload.result.omitted.map((item) => item.path)).toContain('details[].options');
      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
      expect(server.received.some((message) => message.includes('sendRequest('))).toBe(false);
    } finally {
      log.mockRestore();
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
    const server = await startTunerServer({ playNotificationMode: 'tech-choice' });
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
          '--reason',
          'test technology target selection',
          '--json',
        ]);
      } finally {
        log.mockRestore();
      }

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        result: {
          mode: string;
          stepCount: number;
          verified: boolean;
          postcondition: { classification: string; verified: boolean };
        };
      };
      expect(payload.result.mode).toBe('send');
      expect(payload.result.stepCount).toBe(2);
      expect(payload.result.verified).toBe(true);
      expect(payload.result.postcondition.classification).toBe('technology-choice-cleared');
      expect(payload.result.postcondition.verified).toBe(true);
      expect(server.received.some((message) => message.includes('sendTechnologyChoiceCloseout'))).toBe(true);
      expect(server.received.some((message) => message.includes('Game.Notifications.activate'))).toBe(true);
      expect(server.received.some((message) => message.includes('SET_TECH_TREE_NODE'))).toBe(true);
      expect(server.received.some((message) => message.includes('SET_TECH_TREE_TARGET_NODE'))).toBe(true);
      expect(server.received.some((message) => message.includes('ProgressionTreeNodeTypes.NO_NODE'))).toBe(true);
    } finally {
      await server.close();
    }
  });

  test('reports sticky technology blockers after the chooser sequence returns', async () => {
    const server = await startTunerServer({
      playNotificationMode: 'tech-choice',
      technologyChoiceMode: 'sticky',
    });
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayChooseTech.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
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
        '--send',
        '--timeout-ms',
        '1000',
        '--reason',
        'test sticky technology target selection',
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        result: {
          mode: string;
          stepCount: number;
          verified: boolean;
          postcondition: { classification: string; verified: boolean; reason: string };
        };
      };
      expect(payload.result.mode).toBe('send');
      expect(payload.result.stepCount).toBe(2);
      expect(payload.result.verified).toBe(false);
      expect(payload.result.postcondition.verified).toBe(false);
      expect(payload.result.postcondition.classification).toBe('technology-choice-sticky-blocker');
      expect(payload.result.postcondition.reason).toContain('same technology choice notification still blocks');
      expect(server.received.some((message) => message.includes('sendTechnologyChoiceCloseout'))).toBe(true);
      expect(server.received.some((message) => message.includes('Game.Notifications.activate'))).toBe(true);
      expect(server.received.some((message) => message.includes('SET_TECH_TREE_NODE'))).toBe(true);
      expect(server.received.some((message) => message.includes('SET_TECH_TREE_TARGET_NODE'))).toBe(true);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('reports technology state changes without treating a live blocker as cleared', async () => {
    const server = await startTunerServer({
      playNotificationMode: 'tech-choice',
      technologyChoiceMode: 'state-changed',
    });
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayChooseTech.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
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
        '--send',
        '--timeout-ms',
        '1000',
        '--reason',
        'test technology state changed but blocker persisted',
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        result: {
          mode: string;
          stepCount: number;
          verified: boolean;
          postcondition: { classification: string; verified: boolean; reason: string };
        };
      };
      expect(payload.result.mode).toBe('send');
      expect(payload.result.stepCount).toBe(2);
      expect(payload.result.verified).toBe(false);
      expect(payload.result.postcondition.verified).toBe(false);
      expect(payload.result.postcondition.classification).toBe('technology-state-changed-blocker-still-live');
      expect(payload.result.postcondition.reason).toContain('state changed');
      expect(payload.result.postcondition.reason).toContain('still blocks');
      expect(server.received.some((message) => message.includes('sendTechnologyChoiceCloseout'))).toBe(true);
      expect(server.received.some((message) => message.includes('Game.Notifications.activate'))).toBe(true);
      expect(server.received.some((message) => message.includes('SET_TECH_TREE_NODE'))).toBe(true);
      expect(server.received.some((message) => message.includes('SET_TECH_TREE_TARGET_NODE'))).toBe(true);
    } finally {
      log.mockRestore();
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
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayBuildProduction.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
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

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        result: {
          sent: boolean;
          verified: boolean;
          productionPostcondition: { classification: string };
          payload: { ui: { cityActivation: { ok: boolean }; interfaceClose: { ok: boolean } } };
        };
      };
      expect(payload.result.sent).toBe(true);
      expect(payload.result.verified).toBe(true);
      expect(payload.result.productionPostcondition.classification).toBe('production-choice-cleared');
      expect(payload.result.payload.ui.cityActivation.ok).toBe(true);
      expect(payload.result.payload.ui.interfaceClose.ok).toBe(true);
      expect(server.received.some((message) => message.includes('BUILD'))).toBe(true);
      expect(server.received.some((message) => message.includes('"ConstructibleType":713967338'))).toBe(true);
      expect(server.received.some((message) => message.includes('"X":22'))).toBe(true);
      expect(server.received.some((message) => message.includes('"Y":31'))).toBe(true);
      expect(server.received.some((message) => message.includes('readProductionChoice'))).toBe(true);
      expect(server.received.some((message) => message.includes('UI?.Player?.selectCity'))).toBe(true);
      expect(server.received.some((message) => message.includes('InterfaceMode?.switchToDefault'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation("city-operation"'))).toBe(false);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('reports sticky production-choice blockers after BUILD sends', async () => {
    const server = await startTunerServer({ productionPostconditionMode: 'blocker-still-live' });
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayBuildProduction.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayBuildProduction.run([
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
        'test production closeout',
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        result: {
          verified: boolean;
          productionPostcondition: {
            classification: string;
            productionStateChanged: boolean;
            blockerStillLive: boolean;
            reason: string;
          };
        };
      };
      expect(payload.result.verified).toBe(false);
      expect(payload.result.productionPostcondition).toMatchObject({
        classification: 'production-state-changed-blocker-still-live',
        productionStateChanged: true,
        blockerStillLive: true,
      });
      expect(payload.result.productionPostcondition.reason).toContain('production-choice notification still blocks');
    } finally {
      log.mockRestore();
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

  test('reads culture choice options without requiring a node', async () => {
    const server = await startTunerServer({ playNotificationMode: 'culture-choice' });
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayChooseCulture.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayChooseCulture.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--options',
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        result: {
          enabledOptionCount: number;
          disabledOptionCount: number;
          omitted: Array<{ path: string; reason: string }>;
          surfaces: Array<{
            kind: string;
            enabledOptions: Array<{ nodeType: number; name: string; chooseCli: string | null; turns: number | null; cost: number | null }>;
            options?: unknown;
            disabledOptions?: unknown;
          }>;
          details?: unknown;
        };
      };
      expect(payload.result.enabledOptionCount).toBe(2);
      expect(payload.result.disabledOptionCount).toBe(1);
      expect(payload.result.details).toBeUndefined();
      expect(payload.result.surfaces[0].kind).toBe('culture-choice-options');
      expect(payload.result.surfaces[0].options).toBeUndefined();
      expect(payload.result.surfaces[0].disabledOptions).toBeUndefined();
      const ekklesia = payload.result.surfaces[0].enabledOptions.find((option) => option.nodeType === -869902342);
      expect(ekklesia?.name).toBe('Ekklesia');
      expect(ekklesia?.chooseCli).toContain('game play choose-culture --player-id 0 --node -869902342 --send --closeout');
      expect(ekklesia?.turns).toBe(4);
      expect(ekklesia?.cost).toBe(105);
      expect(payload.result.omitted.map((item) => item.path)).toContain('details[].options');
      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
      expect(server.received.some((message) => message.includes('sendRequest('))).toBe(false);
    } finally {
      log.mockRestore();
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

  test('reads celebration choice options without requiring a golden age type', async () => {
    const server = await startTunerServer({ playNotificationMode: 'celebration-choice' });
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayChooseCelebration.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayChooseCelebration.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--options',
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        result: {
          enabledOptionCount: number;
          disabledOptionCount: number;
          omitted: Array<{ path: string; reason: string }>;
          surfaces: Array<{
            kind: string;
            enabledOptions: Array<{ goldenAgeType: number; name: string; chooseCli: string | null; duration: number }>;
            options?: unknown;
            disabledOptions?: unknown;
          }>;
          details?: unknown;
        };
      };
      expect(payload.result.enabledOptionCount).toBe(2);
      expect(payload.result.disabledOptionCount).toBe(0);
      expect(payload.result.details).toBeUndefined();
      expect(payload.result.surfaces[0].kind).toBe('celebration-choice-options');
      expect(payload.result.surfaces[0].options).toBeUndefined();
      expect(payload.result.surfaces[0].disabledOptions).toBeUndefined();
      const culture = payload.result.surfaces[0].enabledOptions.find((option) => option.goldenAgeType === -340825966);
      expect(culture?.name).toBe('Cultural Celebration');
      expect(culture?.duration).toBe(10);
      expect(culture?.chooseCli).toContain('game play choose-celebration --player-id 0 --golden-age-type -340825966 --send');
      expect(payload.result.omitted.map((item) => item.path)).toContain('details[].options');
      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
      expect(server.received.some((message) => message.includes('sendRequest('))).toBe(false);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('wraps government choice as CHANGE_GOVERNMENT', async () => {
    const server = await startTunerServer();
    try {
      const { port } = server.address();
      await GamePlayChooseGovernment.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--player-id',
        '0',
        '--government-type',
        '0',
        '--json',
      ]);

      expect(server.received.some((message) => message.includes('CHANGE_GOVERNMENT'))).toBe(true);
      expect(server.received.some((message) => message.includes('"GovernmentType":0'))).toBe(true);
      expect(server.received.some((message) => message.includes('"Action":-1326475004'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test('reads government choice options without requiring a government type', async () => {
    const server = await startTunerServer({ playNotificationMode: 'government-choice' });
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayChooseGovernment.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayChooseGovernment.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--options',
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        result: {
          enabledOptionCount: number;
          disabledOptionCount: number;
          omitted: Array<{ path: string; reason: string }>;
          surfaces: Array<{
            kind: string;
            enabledOptions: Array<{ governmentType: number; name: string; chooseCli: string | null; celebrationOptions: Array<{ name: string }> }>;
            options?: unknown;
            disabledOptions?: unknown;
          }>;
          details?: unknown;
        };
      };
      expect(payload.result.enabledOptionCount).toBe(3);
      expect(payload.result.disabledOptionCount).toBe(0);
      expect(payload.result.details).toBeUndefined();
      expect(payload.result.surfaces[0].kind).toBe('government-choice-options');
      expect(payload.result.surfaces[0].options).toBeUndefined();
      expect(payload.result.surfaces[0].disabledOptions).toBeUndefined();
      const republic = payload.result.surfaces[0].enabledOptions.find((option) => option.governmentType === 0);
      expect(republic?.name).toBe('Classical Republic');
      expect(republic?.chooseCli).toContain('game play choose-government --player-id 0 --government-type 0 --action -1326475004 --send');
      expect(republic?.celebrationOptions[0].name).toBe('Cultural Celebration');
      expect(payload.result.omitted.map((item) => item.path)).toContain('details[].options');
      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
      expect(server.received.some((message) => message.includes('sendRequest('))).toBe(false);
    } finally {
      log.mockRestore();
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
    const server = await startTunerServer({ playNotificationMode: 'culture-choice' });
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
      expect(server.received.some((message) => message.includes('sendCultureChoiceCloseout'))).toBe(true);
      expect(server.received.some((message) => message.includes('Game.Notifications.activate'))).toBe(true);
      expect(server.received.some((message) => message.includes('SET_CULTURE_TREE_NODE'))).toBe(true);
      expect(server.received.some((message) => message.includes('SET_CULTURE_TREE_TARGET_NODE'))).toBe(true);
      expect(server.received.some((message) => message.includes('ProgressionTreeNodeTypes.NO_NODE'))).toBe(true);
    } finally {
      await server.close();
    }
  });

  test('reports sticky culture blockers after the chooser sequence returns', async () => {
    const server = await startTunerServer({
      playNotificationMode: 'culture-choice',
      cultureChoiceMode: 'sticky',
    });
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayChooseCulture.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
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
        '-1404789184',
        '--send',
        '--closeout',
        '--timeout-ms',
        '1000',
        '--reason',
        'test sticky culture target selection',
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        result: {
          mode: string;
          stepCount: number;
          verified: boolean;
          postcondition: { classification: string; verified: boolean; reason: string };
        };
      };
      expect(payload.result.mode).toBe('send');
      expect(payload.result.stepCount).toBe(2);
      expect(payload.result.verified).toBe(false);
      expect(payload.result.postcondition.verified).toBe(false);
      expect(payload.result.postcondition.classification).toBe('culture-choice-sticky-blocker');
      expect(payload.result.postcondition.reason).toContain('same culture choice notification still blocks');
      expect(server.received.some((message) => message.includes('sendCultureChoiceCloseout'))).toBe(true);
      expect(server.received.some((message) => message.includes('Game.Notifications.activate'))).toBe(true);
      expect(server.received.some((message) => message.includes('SET_CULTURE_TREE_NODE'))).toBe(true);
      expect(server.received.some((message) => message.includes('SET_CULTURE_TREE_TARGET_NODE'))).toBe(true);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('reports culture state changes without treating a live blocker as cleared', async () => {
    const server = await startTunerServer({
      playNotificationMode: 'culture-choice',
      cultureChoiceMode: 'state-changed',
    });
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayChooseCulture.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
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
        '-1404789184',
        '--send',
        '--closeout',
        '--timeout-ms',
        '1000',
        '--reason',
        'test culture state changed but blocker persisted',
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        result: {
          mode: string;
          stepCount: number;
          verified: boolean;
          postcondition: { classification: string; verified: boolean; reason: string };
        };
      };
      expect(payload.result.mode).toBe('send');
      expect(payload.result.stepCount).toBe(2);
      expect(payload.result.verified).toBe(false);
      expect(payload.result.postcondition.verified).toBe(false);
      expect(payload.result.postcondition.classification).toBe('culture-state-changed-blocker-still-live');
      expect(payload.result.postcondition.reason).toContain('state changed');
      expect(payload.result.postcondition.reason).toContain('still blocks');
      expect(server.received.some((message) => message.includes('sendCultureChoiceCloseout'))).toBe(true);
      expect(server.received.some((message) => message.includes('Game.Notifications.activate'))).toBe(true);
      expect(server.received.some((message) => message.includes('SET_CULTURE_TREE_NODE'))).toBe(true);
      expect(server.received.some((message) => message.includes('SET_CULTURE_TREE_TARGET_NODE'))).toBe(true);
    } finally {
      log.mockRestore();
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

  test('chooses narrative direction as one native send plus UI close operation', async () => {
    const server = await startTunerServer({ playNotificationMode: 'narrative-choice-visible-panel' });
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayChooseNarrative.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
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
        'DISCOVERY_14001B',
        '--target',
        '{"owner":0,"id":25,"type":35}',
        '--action',
        '-1326475004',
        '--send',
        '--reason',
        'choose production reward branch',
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        result: {
          sent: boolean;
          verified: boolean;
          postcondition: { classification: string };
          payload: { ui: { panelClose: unknown; popupClose: unknown } };
        };
      };
      expect(payload.result.sent).toBe(true);
      expect(payload.result.verified).toBe(true);
      expect(payload.result.postcondition.classification).toBe('narrative-blocker-cleared');
      expect(payload.result.payload.ui.panelClose).toEqual({ ok: true, value: { attempted: 1, results: [{ panelType: 'SMALL-NARRATIVE-EVENT', closed: true }] } });
      expect(payload.result.payload.ui.popupClose).toEqual({ ok: true, value: { available: true } });
      expect(server.received.some((message) => message.includes('sendNarrativeChoice'))).toBe(true);
      expect(server.received.some((message) => message.includes('NarrativePopupManager.closePopup'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation("player-operation"'))).toBe(false);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('does not verify narrative sends when blocker and panel remain live', async () => {
    const server = await startTunerServer({
      playNotificationMode: 'narrative-choice-visible-panel',
      narrativeChoiceMode: 'stale',
    });
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayChooseNarrative.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
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
        'DISCOVERY_14001C',
        '--target',
        '{"owner":0,"id":25,"type":35}',
        '--action',
        '-1326475004',
        '--timeout-ms',
        '1000',
        '--send',
        '--reason',
        'choose happiness reward branch',
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        result: {
          sent: boolean;
          verified: boolean;
          postcondition: { classification: string; reason: string };
        };
      };
      expect(payload.result.sent).toBe(true);
      expect(payload.result.verified).toBe(false);
      expect(payload.result.postcondition.classification).toBe('no-state-change');
      expect(payload.result.postcondition.reason).toContain('same narrative blocker remained live');
      expect(server.received.some((message) => message.includes('sendNarrativeChoice'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation("player-operation"'))).toBe(false);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('does not verify narrative sends when panel closes but same blocker remains live', async () => {
    const server = await startTunerServer({
      playNotificationMode: 'narrative-choice-visible-panel',
      narrativeChoiceMode: 'panel-cleared-blocker-live',
    });
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayChooseNarrative.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
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
        'DISCOVERY_14001C',
        '--target',
        '{"owner":0,"id":25,"type":35}',
        '--action',
        '-1326475004',
        '--timeout-ms',
        '1000',
        '--send',
        '--reason',
        'choose happiness reward branch',
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        result: {
          sent: boolean;
          verified: boolean;
          postcondition: { classification: string; reason: string };
          payload: { ui: { after: { matchingPanelCount: number } } };
        };
      };
      expect(payload.result.sent).toBe(true);
      expect(payload.result.payload.ui.after.matchingPanelCount).toBe(0);
      expect(payload.result.verified).toBe(false);
      expect(payload.result.postcondition.classification).toBe('no-state-change');
      expect(payload.result.postcondition.reason).toContain('same narrative blocker remained live');
      expect(server.received.some((message) => message.includes('sendNarrativeChoice'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation("player-operation"'))).toBe(false);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('reads narrative choice options without requiring target inputs', async () => {
    const server = await startTunerServer({ playNotificationMode: 'narrative-choice' });
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayChooseNarrative.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayChooseNarrative.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--options',
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        result: {
          enabledOptionCount: number;
          disabledOptionCount: number;
          omitted: Array<{ path: string; reason: string }>;
          surfaces: Array<{
            kind: string;
            targetStoryId: { owner: number; id: number; type: number } | null;
            enabledOptions: Array<{ targetType: string; name: string; chooseCli: string | null; validateCli: string | null }>;
            options?: unknown;
            disabledOptions?: unknown;
          }>;
          details?: unknown;
        };
      };
      expect(payload.result.enabledOptionCount).toBe(1);
      expect(payload.result.disabledOptionCount).toBe(0);
      expect(payload.result.details).toBeUndefined();
      expect(payload.result.surfaces[0].kind).toBe('narrative-choice-options');
      expect(payload.result.surfaces[0].options).toBeUndefined();
      expect(payload.result.surfaces[0].disabledOptions).toBeUndefined();
      expect(payload.result.surfaces[0].targetStoryId).toEqual({ owner: 0, id: 45, type: 35 });
      expect(payload.result.surfaces[0].enabledOptions[0].targetType).toBe('CLOSE');
      expect(payload.result.surfaces[0].enabledOptions[0].chooseCli).toContain('game play choose-narrative --player-id 0 --target-type CLOSE');
      expect(payload.result.surfaces[0].enabledOptions[0].validateCli).toContain('--action -1326475004 --json');
      expect(payload.result.omitted.map((item) => item.path)).toContain('details[].storyLinks');
      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('reports empty narrative choices as unproven dismissal diagnostics', async () => {
    const server = await startTunerServer({ playNotificationMode: 'narrative-choice-empty' });
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayChooseNarrative.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayChooseNarrative.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--options',
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        result: {
          enabledOptionCount: number;
          surfaces: Array<{
            classification: string;
            targetStoryId: unknown;
            enabledOptions: unknown[];
            dismissalDiagnosticCli: string | null;
            unprovenDismissalCli: string | null;
          }>;
        };
      };
      expect(payload.result.enabledOptionCount).toBe(0);
      expect(payload.result.surfaces[0].classification).toBe('narrative-choice-no-pending-story');
      expect(payload.result.surfaces[0].targetStoryId).toBeNull();
      expect(payload.result.surfaces[0].enabledOptions).toEqual([]);
      expect(payload.result.surfaces[0].dismissalDiagnosticCli).toBe(
        'game play dismiss-notification --target \'{"owner":0,"id":5,"type":20}\' --json',
      );
      expect(payload.result.surfaces[0].unprovenDismissalCli).toBe(
        'game play dismiss-notification --target \'{"owner":0,"id":5,"type":20}\' --send --reason \'<reviewed: narrative notification has no pending story>\'',
      );
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('reads visible narrative panel options when story model pending ids are empty', async () => {
    const server = await startTunerServer({ playNotificationMode: 'narrative-choice-visible-panel' });
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayChooseNarrative.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayChooseNarrative.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--options',
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        result: {
          enabledOptionCount: number;
          surfaces: Array<{
            classification: string;
            targetStoryId: unknown;
            visiblePanelTargetStoryId: { owner: number; id: number; type: number } | null;
            enabledOptions: Array<{ targetType: string; target: { owner: number; id: number; type: number }; chooseCli: string | null }>;
            dismissalDiagnosticCli: string | null;
          }>;
        };
      };
      expect(payload.result.enabledOptionCount).toBe(2);
      expect(payload.result.surfaces[0].classification).toBe('narrative-choice-options');
      expect(payload.result.surfaces[0].targetStoryId).toBeNull();
      expect(payload.result.surfaces[0].visiblePanelTargetStoryId).toEqual({ owner: 0, id: 25, type: 35 });
      expect(payload.result.surfaces[0].enabledOptions.map((option) => option.targetType)).toEqual([
        'DISCOVERY_14001B',
        'DISCOVERY_14001C',
      ]);
      expect(payload.result.surfaces[0].enabledOptions[0].chooseCli).toContain("--target '{\"owner\":0,\"id\":25,\"type\":35}'");
      expect(payload.result.surfaces[0].dismissalDiagnosticCli).toBeNull();
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('validates diplomacy responses as a dry-run player operation', async () => {
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
        '8',
        '--response-type',
        '926305338',
        '--json',
      ]);

      expect(server.received.some((message) => message.includes('validateOperation("player-operation"'))).toBe(true);
      expect(server.received.some((message) => message.includes('RESPOND_DIPLOMATIC_ACTION'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendDiplomacyResponseCloseout'))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test('sends diplomacy responses through the App UI closeout path', async () => {
    const server = await startTunerServer({ playNotificationMode: 'stale-diplomacy' });
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayRespondDiplomacy.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayRespondDiplomacy.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--player-id',
        '2',
        '--action-id',
        '8',
        '--response-type',
        '926305338',
        '--notification-id',
        '{"owner":0,"id":19,"type":20}',
        '--send',
        '--reason',
        'test diplomacy response closeout',
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        result: {
          sent: boolean;
          verified: boolean;
          payload: { playerId: number; notificationId: { id: number }; uiCloseout: { requested: boolean } };
          postcondition: { classification: string; reason: string };
        };
      };
      expect(payload.result.sent).toBe(true);
      expect(payload.result.verified).toBe(true);
      expect(payload.result.payload.playerId).toBe(0);
      expect(payload.result.payload.notificationId.id).toBe(19);
      expect(payload.result.payload.uiCloseout.requested).toBe(true);
      expect(payload.result.postcondition.classification).toBe('turn-unblocked');
      expect(payload.result.postcondition.reason).toContain('turn unblocked');
      expect(server.received.some((message) => message.includes('sendDiplomacyResponseCloseout'))).toBe(true);
      expect(server.received.some((message) => message.includes('GameContext.localPlayerID'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation("player-operation"'))).toBe(false);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('materializes diplomacy response options from the notification HUD', async () => {
    const server = await startTunerServer({ playNotificationMode: 'stale-diplomacy' });
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayNotifications.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayNotifications.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        view: {
          notifications: Array<{
            details?: {
              kind: string;
              actionId: number;
              options: Array<{ title: string; responseType: number; enabled: boolean; disabled: boolean; cli: string | null }>;
              enabledOptions: Array<{ responseType: number; cli: string | null }>;
              disabledOptions: Array<{ responseType: number; cli: string | null }>;
            };
          }>;
          hud: { nextDecision: { details?: unknown } };
        };
      };
      const details = payload.view.notifications[0].details;
      expect(details?.kind).toBe('diplomacy-response-options');
      expect(details?.actionId).toBe(8);
      expect(details?.options.map((option) => option.title)).toEqual(['Support', 'Accept', 'Reject']);
      expect(details?.disabledOptions[0].responseType).toBe(-1907089594);
      expect(details?.disabledOptions[0].cli).toBeNull();
      expect(details?.enabledOptions.map((option) => option.responseType)).toEqual([926305338, -1200641623]);
      expect(details?.enabledOptions[0].cli).toContain('game play respond-diplomacy --action-id 8 --response-type 926305338');
      expect(details?.enabledOptions[0].cli).toContain("--notification-id '{\"owner\":0,\"id\":19,\"type\":20}'");
      expect(payload.view.hud.nextDecision.details).toBeDefined();
      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('materializes technology choice options from the notification HUD', async () => {
    const server = await startTunerServer({ playNotificationMode: 'tech-choice' });
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayNotifications.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayNotifications.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        view: {
          notifications: Array<{
            details?: {
              kind: string;
              enabledOptions: Array<{ nodeType: number; name: string; cli: string | null; chooseValidation: { ok: boolean; value?: { Success?: boolean } } }>;
              disabledOptions: Array<{ nodeType: number; name: string; cli: string | null }>;
            };
          }>;
          hud: { nextDecision: { details?: unknown } };
        };
      };
      const details = payload.view.notifications[0].details;
      expect(details?.kind).toBe('technology-choice-options');
      expect(details?.enabledOptions.map((option) => option.name).sort()).toEqual(['Masonry', 'Sailing']);
      const masonry = details?.enabledOptions.find((option) => option.nodeType === -1255676052);
      expect(masonry?.chooseValidation.value?.Success).toBe(true);
      expect(masonry?.cli).toContain('game play choose-tech --player-id 0 --node -1255676052 --send');
      expect(masonry?.cli).not.toContain('--closeout');
      expect(details?.disabledOptions[0].name).toBe('Agriculture');
      expect(details?.disabledOptions[0].cli).toBeNull();
      expect(payload.view.hud.nextDecision.details).toBeDefined();
      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('materializes culture choice options from the notification HUD', async () => {
    const server = await startTunerServer({ playNotificationMode: 'culture-choice' });
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayNotifications.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayNotifications.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        view: {
          notifications: Array<{
            details?: {
              kind: string;
              availableNodeTypes: { ok: boolean; value?: number[] };
              enabledOptions: Array<{ nodeType: number; name: string; cli: string | null; chooseValidation: { ok: boolean; value?: { Success?: boolean } } }>;
              disabledOptions: Array<{ nodeType: number; name: string; cli: string | null }>;
              playerCulture?: unknown;
            };
          }>;
          hud: { nextDecision: { details?: unknown } };
        };
      };
      const details = payload.view.notifications[0].details;
      expect(details?.kind).toBe('culture-choice-options');
      expect(details?.playerCulture).toBeUndefined();
      expect(details?.availableNodeTypes.value).toContain(-869902342);
      expect(details?.enabledOptions.map((option) => option.name).sort()).toEqual(['Discipline', 'Ekklesia']);
      const ekklesia = details?.enabledOptions.find((option) => option.nodeType === -869902342);
      expect(ekklesia?.chooseValidation.value?.Success).toBe(true);
      expect(ekklesia?.cli).toContain('game play choose-culture --player-id 0 --node -869902342 --send --closeout');
      expect(details?.disabledOptions[0].name).toBe('Mysticism');
      expect(details?.disabledOptions[0].cli).toBeNull();
      expect(payload.view.hud.nextDecision.details).toBeDefined();
      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('materializes celebration choice options from the notification HUD', async () => {
    const server = await startTunerServer({ playNotificationMode: 'celebration-choice' });
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayNotifications.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayNotifications.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        view: {
          notifications: Array<{
            details?: {
              kind: string;
              goldenAgeDuration: { ok: boolean; value?: number };
              choices: { ok: boolean; value?: string[] };
              enabledOptions: Array<{ goldenAgeType: number; name: string; cli: string | null; validation: { ok: boolean; value?: { Success?: boolean } } }>;
              disabledOptions: Array<{ goldenAgeType: number; name: string; cli: string | null }>;
            };
          }>;
          hud: { nextDecision: { details?: unknown } };
        };
      };
      const details = payload.view.notifications[0].details;
      expect(details?.kind).toBe('celebration-choice-options');
      expect(details?.goldenAgeDuration.value).toBe(10);
      expect(details?.choices.value).toContain('GOLDEN_AGE_CLASSICAL_REPUBLIC_1');
      expect(details?.enabledOptions.map((option) => option.name).sort()).toEqual(['Cultural Celebration', 'Wonder Production Celebration']);
      const culture = details?.enabledOptions.find((option) => option.goldenAgeType === -340825966);
      expect(culture?.validation.value?.Success).toBe(true);
      expect(culture?.cli).toContain('game play choose-celebration --player-id 0 --golden-age-type -340825966 --send');
      expect(details?.disabledOptions).toEqual([]);
      expect(payload.view.hud.nextDecision.details).toBeDefined();
      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('materializes government choice options from the notification HUD', async () => {
    const server = await startTunerServer({ playNotificationMode: 'government-choice' });
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayNotifications.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayNotifications.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        view: {
          notifications: Array<{
            details?: {
              kind: string;
              action: number;
              startingGovernments: { ok: boolean; value?: Array<{ GovernmentType: number }> };
              enabledOptions: Array<{ governmentType: number; name: string; cli: string | null; validation: { ok: boolean; value?: { Success?: boolean } } }>;
              disabledOptions: Array<{ governmentType: number; name: string; cli: string | null }>;
            };
          }>;
          hud: { nextDecision: { details?: unknown } };
        };
      };
      const details = payload.view.notifications[0].details;
      expect(details?.kind).toBe('government-choice-options');
      expect(details?.action).toBe(-1326475004);
      expect(details?.startingGovernments.value?.length).toBe(3);
      expect(details?.enabledOptions.map((option) => option.name)).toEqual(['Classical Republic', 'Despotism', 'Oligarchy']);
      const republic = details?.enabledOptions.find((option) => option.governmentType === 0);
      expect(republic?.validation.value?.Success).toBe(true);
      expect(republic?.cli).toContain('game play choose-government --player-id 0 --government-type 0 --action -1326475004 --send');
      expect(details?.disabledOptions).toEqual([]);
      expect(payload.view.hud.nextDecision.details).toBeDefined();
      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('materializes narrative choice options from the notification HUD', async () => {
    const server = await startTunerServer({ playNotificationMode: 'narrative-choice' });
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayNotifications.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayNotifications.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        view: {
          notifications: Array<{
            target: { owner: number; id: number; type: number };
            details?: {
              kind: string;
              targetStoryId: { ok: boolean; value?: { owner: number; id: number; type: number } };
              storyLinks: { ok: boolean; value?: unknown[] };
              enabledOptions: Array<{ targetType: string; cli: string | null; validation: { ok: boolean; value?: { Success?: boolean } } }>;
              disabledOptions: Array<{ targetType: string; cli: string | null }>;
            };
          }>;
          hud: { nextDecision: { details?: unknown } };
        };
      };
      const notification = payload.view.notifications[0];
      const details = notification.details;
      expect(notification.target).toEqual({ owner: -1, id: -1, type: 0 });
      expect(details?.kind).toBe('narrative-choice-options');
      expect(details?.targetStoryId.value).toEqual({ owner: 0, id: 45, type: 35 });
      expect(details?.storyLinks.value).toEqual([]);
      expect(details?.enabledOptions[0].targetType).toBe('CLOSE');
      expect(details?.enabledOptions[0].validation.value?.Success).toBe(true);
      expect(details?.enabledOptions[0].cli).toContain('game play choose-narrative --player-id 0 --target-type CLOSE');
      expect(details?.disabledOptions).toEqual([]);
      expect(payload.view.hud.nextDecision.details).toBeDefined();
      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('materializes stale command-units reconciliation candidates from the notification HUD', async () => {
    const server = await startTunerServer({ playNotificationMode: 'stale-unit-command' });
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayNotifications.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayNotifications.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        view: {
          notifications: Array<{
            details?: {
              kind: string;
              staleReadyPointerSuspected: boolean;
              enabledCloseoutCandidates: Array<{ unitId: { owner: number; id: number; type: number }; operationType: string; cli: string | null }>;
            };
          }>;
          hud: { nextDecision: { details?: unknown } };
        };
      };
      const details = payload.view.notifications[0].details;
      expect(details?.kind).toBe('unit-command-reconciliation');
      expect(details?.staleReadyPointerSuspected).toBe(true);
      expect(details?.enabledCloseoutCandidates).toHaveLength(1);
      expect(details?.enabledCloseoutCandidates[0].unitId).toEqual({ owner: 0, id: 196609, type: 26 });
      expect(details?.enabledCloseoutCandidates[0].operationType).toBe('SKIP_TURN');
      expect(details?.enabledCloseoutCandidates[0].cli).toContain('game play operation --family unit --type SKIP_TURN');
      expect(details?.enabledCloseoutCandidates[0].cli).toContain("--unit-id '{\"owner\":0,\"id\":196609,\"type\":26}'");
      expect(payload.view.hud.nextDecision.details).toBeDefined();
    } finally {
      log.mockRestore();
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

  test('emits compact tradition option surface', async () => {
    const server = await startTunerServer();
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

  test('classifies valid diplomatic action reports without response options as reviewed closeouts', async () => {
    const server = await startTunerServer({ playNotificationMode: 'diplomatic-action-report' });
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
          notifications: Array<{
            target: { owner: number; id: number; type: number };
            details?: {
              kind: string;
              classification: string;
              actionId: number;
              responseOptionCount: number;
              enabledResponseOptionCount: number;
            };
          }>;
          hud: {
            nextDecision: {
              category: string;
              operationFamily: string;
              operationType: string;
              cli: string;
              notes: string[];
              details?: unknown;
            };
          };
        };
      };
      const notification = payload.view.notifications[0];
      expect(notification.target).toEqual({ owner: 2, id: 34, type: 34 });
      expect(notification.details?.kind).toBe('diplomatic-action-report');
      expect(notification.details?.classification).toBe('diplomatic-action-report-no-enabled-response-options');
      expect(notification.details?.actionId).toBe(34);
      expect(notification.details?.responseOptionCount).toBe(0);
      expect(notification.details?.enabledResponseOptionCount).toBe(0);
      expect(payload.view.hud.nextDecision.category).toBe('informational-notification');
      expect(payload.view.hud.nextDecision.operationFamily).toBe('app-ui-action');
      expect(payload.view.hud.nextDecision.operationType).toBe('Game.Notifications.dismiss');
      expect(payload.view.hud.nextDecision.cli).toBe('game play dismiss-notification');
      expect(payload.view.hud.nextDecision.notes.join(' ')).toContain('real diplomatic event id');
      expect(payload.view.hud.nextDecision.notes.join(' ')).toContain('reviewed report closeout');
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

  test('surfaces guarded end-turn send in compact clean-read priorities', async () => {
    const server = await startTunerServer({ playNotificationMode: 'clean-read' });
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
        next: string | null;
        priorities: Array<{ kind: string; command?: string; reason: string }>;
      };
      const top = payload.priorities[0];
      expect(top.kind).toBe('clean-read');
      expect(top.command).toContain('game play end-turn --send');
      expect(top.command).toContain("--reason 'clean read: no HUD, ready-unit, ready-city, or battlefield priority surfaced'");
      expect(payload.next).toBe(top.command);
      expect(top.reason).toContain('rechecks blockers before sending');
      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendTurnComplete'))).toBe(false);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('surfaces unit-command reconciliation command in compact priorities', async () => {
    const server = await startTunerServer({ playNotificationMode: 'stale-unit-command' });
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
        next: string | null;
        priorities: Array<{ kind: string; command?: string; reason: string }>;
      };
      const top = payload.priorities[0];
      expect(top.kind).toBe('hud:unit-command');
      expect(top.command).toContain('game play operation --family unit --type SKIP_TURN');
      expect(top.command).toContain("--unit-id '{\"owner\":0,\"id\":196609,\"type\":26}'");
      expect(payload.next).toBe(top.command);
      expect(top.reason).toContain('validator-backed operation candidate');
      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('surfaces exact recommended operation command in compact priorities', async () => {
    const server = await startTunerServer({ playNotificationMode: 'first-meet' });
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
        next: string | null;
        priorities: Array<{ kind: string; command?: string; reason: string }>;
      };
      const top = payload.priorities[0];
      expect(top.kind).toBe('hud:first-meet-diplomacy');
      expect(top.command).toBe('game play respond-first-meet --player-id 0 --met-player-id 2 --response neutral');
      expect(payload.next).toBe(top.command);
      expect(top.reason).toContain('validator-backed operation candidate');
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('surfaces technology options command in compact priorities', async () => {
    const server = await startTunerServer({ playNotificationMode: 'tech-choice' });
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
        next: string | null;
        priorities: Array<{ kind: string; command?: string; reason: string }>;
      };
      const top = payload.priorities[0];
      expect(top.kind).toBe('hud:technology-choice');
      expect(top.command).toBe('game play choose-tech --options --json');
      expect(payload.next).toBe(top.command);
      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('surfaces culture options command in compact priorities', async () => {
    const server = await startTunerServer({ playNotificationMode: 'culture-choice' });
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
        next: string | null;
        priorities: Array<{ kind: string; command?: string; reason: string }>;
      };
      const top = payload.priorities[0];
      expect(top.kind).toBe('hud:culture-choice');
      expect(top.command).toBe('game play choose-culture --options --json');
      expect(payload.next).toBe(top.command);
      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('surfaces celebration options command in compact priorities', async () => {
    const server = await startTunerServer({ playNotificationMode: 'celebration-choice' });
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
        next: string | null;
        priorities: Array<{ kind: string; command?: string; reason: string }>;
      };
      const top = payload.priorities[0];
      expect(top.kind).toBe('hud:celebration-choice');
      expect(top.command).toBe('game play choose-celebration --options --json');
      expect(payload.next).toBe(top.command);
      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('surfaces government options command in compact priorities', async () => {
    const server = await startTunerServer({ playNotificationMode: 'government-choice' });
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
        next: string | null;
        priorities: Array<{ kind: string; command?: string; reason: string }>;
      };
      const top = payload.priorities[0];
      expect(top.kind).toBe('hud:government-choice');
      expect(top.command).toBe('game play choose-government --options --json');
      expect(payload.next).toBe(top.command);
      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('surfaces narrative options command in compact priorities', async () => {
    const server = await startTunerServer({ playNotificationMode: 'narrative-choice' });
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
        next: string | null;
        priorities: Array<{ kind: string; command?: string; reason: string }>;
      };
      const top = payload.priorities[0];
      expect(top.kind).toBe('hud:narrative-choice');
      expect(top.command).toBe('game play choose-narrative --options --json');
      expect(payload.next).toBe(top.command);
      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('surfaces dismissal diagnostics for empty narrative choices in compact priorities', async () => {
    const server = await startTunerServer({ playNotificationMode: 'narrative-choice-empty' });
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
        next: string | null;
        priorities: Array<{ kind: string; command?: string }>;
      };
      const top = payload.priorities[0];
      expect(top.kind).toBe('hud:narrative-choice');
      expect(top.command).toBe('game play dismiss-notification --target \'{"owner":0,"id":5,"type":20}\' --json');
      expect(payload.next).toBe(top.command);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('surfaces narrative options for visible panel choices in compact priorities', async () => {
    const server = await startTunerServer({ playNotificationMode: 'narrative-choice-visible-panel' });
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
        next: string | null;
        priorities: Array<{ kind: string; command?: string }>;
      };
      const top = payload.priorities[0];
      expect(top.kind).toBe('hud:narrative-choice');
      expect(top.command).toBe('game play choose-narrative --options --json');
      expect(payload.next).toBe(top.command);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('surfaces tradition option reader in compact priorities', async () => {
    const server = await startTunerServer({ playNotificationMode: 'tradition-review' });
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
        next: string | null;
        priorities: Array<{ kind: string; command?: string; reason: string }>;
      };
      const top = payload.priorities[0];
      expect(top.kind).toBe('hud:tradition-review');
      expect(top.command).toBe('game play traditions --compact --json');
      expect(payload.next).toBe(top.command);
      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('surfaces ready-city compact view for production-choice blockers', async () => {
    const server = await startTunerServer({ playNotificationMode: 'production-choice' });
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
        next: string | null;
        priorities: Array<{ kind: string; command?: string; reason: string }>;
      };
      const top = payload.priorities[0];
      expect(top.kind).toBe('hud:production-choice');
      expect(top.command).toBe('game play ready-city --compact --json');
      expect(payload.next).toBe(top.command);
      expect(server.received.some((message) => message.includes('readReadyCityView'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('surfaces ready-city compact view for population-placement blockers', async () => {
    const server = await startTunerServer({ playNotificationMode: 'population-placement' });
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
        next: string | null;
        priorities: Array<{ kind: string; command?: string; reason: string }>;
      };
      const top = payload.priorities[0];
      expect(top.kind).toBe('hud:population-placement');
      expect(top.command).toBe('game play ready-city --compact --json');
      expect(payload.next).toBe(top.command);
      expect(server.received.some((message) => message.includes('readReadyCityView'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('surfaces exact informational dismissal command in compact priorities', async () => {
    const server = await startTunerServer({ playNotificationMode: 'stale-informational' });
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
        next: string | null;
        priorities: Array<{ kind: string; command?: string; reason: string }>;
      };
      const top = payload.priorities[0];
      expect(top.kind).toBe('hud:informational-notification');
      expect(top.command).toContain('game play dismiss-notification');
      expect(top.command).toContain("--target '{\"owner\":0,\"id\":89,\"type\":20}'");
      expect(top.command).toContain("<reviewed: notification-volcano-active>");
      expect(payload.next).toBe(top.command);
      expect(top.reason).toContain('live ComponentID');
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('routes unit-lost reports to reviewed dismissal in compact priorities', async () => {
    const server = await startTunerServer({ playNotificationMode: 'unit-lost-report' });
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
        next: string | null;
        priorities: Array<{ kind: string; command?: string; reason: string }>;
      };
      const top = payload.priorities[0];
      expect(top.kind).toBe('hud:informational-notification');
      expect(top.command).toContain('game play dismiss-notification');
      expect(top.command).toContain("--target '{\"owner\":0,\"id\":34,\"type\":20}'");
      expect(top.command).toContain('<reviewed: notification-unit-lost>');
      expect(payload.next).toBe(top.command);
      expect(top.command).not.toMatch(/enemy|hostile|opponent/i);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('routes diplomatic action reports without response options to reviewed dismissal in compact priorities', async () => {
    const server = await startTunerServer({ playNotificationMode: 'diplomatic-action-report' });
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
        next: string | null;
        priorities: Array<{ kind: string; command?: string; reason: string }>;
      };
      const top = payload.priorities[0];
      expect(top.kind).toBe('hud:informational-notification');
      expect(top.command).toContain('game play dismiss-notification');
      expect(top.command).toContain("--target '{\"owner\":0,\"id\":118,\"type\":20}'");
      expect(top.command).toContain('<reviewed: notification-diplomatic-action>');
      expect(payload.next).toBe(top.command);
      expect(top.reason).toContain('live ComponentID');
      expect(top.command).not.toContain('respond-diplomacy');
      expect(payload.next).not.toContain('respond-diplomacy');
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('classifies stale command-units with disabled candidates in compact priorities', async () => {
    const server = await startTunerServer({ playNotificationMode: 'stale-unit-command-disabled' });
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
        next: string | null;
        decisionHud: { hasSentTurnComplete?: unknown };
        priorities: Array<{ kind: string; summary: string; command?: string; reason: string }>;
      };
      const top = payload.priorities[0];
      expect(top.kind).toBe('hud:unit-command-stale-expired');
      expect(top.summary).toContain('no ready unit');
      expect(top.command).toContain('game play end-turn --send');
      expect(payload.next).toBe(top.command);
      expect(top.reason).toContain('normal end-turn path once');
      expect(JSON.stringify(payload.decisionHud.hasSentTurnComplete)).toContain('false');
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('classifies stale command-units as pending after turn-complete was sent', async () => {
    const server = await startTunerServer({ playNotificationMode: 'stale-unit-command-pending' });
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
        next: string | null;
        decisionHud: { hasSentTurnComplete?: unknown };
        priorities: Array<{ kind: string; summary: string; command?: string; reason: string }>;
      };
      const top = payload.priorities[0];
      expect(top.kind).toBe('hud:unit-command-stale-expired');
      expect(top.summary).toContain('turn-complete was sent');
      expect(top.command).toContain('game watch --count 3');
      expect(payload.next).toBe(top.command);
      expect(top.reason).toContain('turn-complete is already sent');
      expect(JSON.stringify(payload.decisionHud.hasSentTurnComplete)).toContain('true');
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

  test('schedules recommended operation commands from notification details', async () => {
    const server = await startTunerServer({ playNotificationMode: 'first-meet' });
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
          schedule: Array<{ category: string; command: string | null; disposition: string }>;
        };
      };
      const step = payload.view.schedule[0];
      expect(step.category).toBe('first-meet-diplomacy');
      expect(step.disposition).toBe('operate-with-live-inputs');
      expect(step.command).toBe('game play respond-first-meet --player-id 0 --met-player-id 2 --response neutral');
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test.each([
    ['tech-choice', 'NOTIFICATION_CHOOSE_TECH', 'game play choose-tech --options --json'],
    ['culture-choice', 'NOTIFICATION_CHOOSE_CULTURE_NODE', 'game play choose-culture --options --json'],
    ['celebration-choice', 'NOTIFICATION_CHOOSE_GOLDEN_AGE', 'game play choose-celebration --options --json'],
    ['government-choice', 'NOTIFICATION_CHOOSE_GOVERNMENT', 'game play choose-government --options --json'],
    ['narrative-choice', 'NOTIFICATION_CHOOSE_DISCOVERY_STORY_DIRECTION', 'game play choose-narrative --options --json'],
  ] as const)('routes %s notification queue entries to compact option readers', async (playNotificationMode, typeName, command) => {
    const server = await startTunerServer({ playNotificationMode });
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
          schedule: Array<{ typeName: string | null; command: string | null; disposition: string }>;
        };
      };
      const step = payload.view.schedule.find((item) => item.typeName === typeName);
      expect(step?.disposition).toBe('operate-with-live-inputs');
      expect(step?.command).toBe(command);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test('schedules legacy completion reports as reviewed dismissal candidates', async () => {
    const server = await startTunerServer({ playNotificationMode: 'legacy-completed' });
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
          schedule: Array<{ disposition: string; command: string | null; safeToBatch: boolean; typeName: string | null }>;
        };
      };
      const step = payload.view.schedule[0];
      expect(step.typeName).toBe('NOTIFICATION_LEGACY_COMPLETED');
      expect(step.disposition).toBe('reviewed-dismissal-candidate');
      expect(step.safeToBatch).toBe(true);
      expect(step.command).toContain('dismiss-notification');
      expect(step.command).toContain('<reviewed: notification-legacy-completed>');
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
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
      expect(sendServer.received.filter((message) => message.includes('readNotificationDismissal')).length).toBeGreaterThan(1);
      expect(sendServer.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      await sendServer.close();
    }
  });

  test('excludes front unit-lost reports from bulk dismissal', async () => {
    const server = await startTunerServer({ playNotificationMode: 'unit-lost-report' });
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayDismissNotificationQueue.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayDismissNotificationQueue.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        view: {
          eligibleCount: number;
          selectedCount: number;
          excluded: Array<{ typeName: string | null; reason: string }>;
          results: unknown[];
        };
      };
      expect(payload.view.eligibleCount).toBe(0);
      expect(payload.view.selectedCount).toBe(0);
      expect(payload.view.results).toHaveLength(0);
      expect(payload.view.excluded).toHaveLength(1);
      expect(payload.view.excluded[0]).toMatchObject({
        typeName: 'NOTIFICATION_UNIT_LOST',
        reason: 'front unit-loss reports require exact reviewed dismissal proof, not bulk dismissal',
      });
      expect(server.received.some((message) => message.includes('readNotificationDismissal'))).toBe(false);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('schedules unit-lost reports as reviewed dismissal candidates', async () => {
    const server = await startTunerServer({ playNotificationMode: 'unit-lost-report' });
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayNotificationQueue.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
    try {
      const { port } = server.address();
      await GamePlayNotificationQueue.run([
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        view: {
          schedule: Array<{
            disposition: string;
            typeName: string;
            command: string | null;
            safeToBatch: boolean;
          }>;
        };
      };
      const step = payload.view.schedule[0];
      expect(step.disposition).toBe('reviewed-dismissal-candidate');
      expect(step.typeName).toBe('NOTIFICATION_UNIT_LOST');
      expect(step.command).toContain("game play dismiss-notification --target '{\"owner\":0,\"id\":34,\"type\":20}'");
      expect(step.command).toContain('<reviewed: notification-unit-lost>');
      expect(step.command).not.toMatch(/enemy|hostile|opponent/i);
      expect(step.safeToBatch).toBe(false);
    } finally {
      log.mockRestore();
      await server.close();
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
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayDismissNotification.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
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

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        result: {
          sent: boolean;
          verified: boolean;
          closeoutPath: string | null;
          result: {
            notificationTrainManager: { ok: boolean; attempted: boolean; path?: string };
            panelCloseControl: { ok: boolean; attempted: boolean; reason?: string };
          };
          verificationAttempts: unknown[];
        };
      };
      expect(payload.result.sent).toBe(true);
      expect(payload.result.verified).toBe(true);
      expect(payload.result.closeoutPath).toBe('NotificationModel.manager.dismiss');
      expect(payload.result.result.notificationTrainManager.ok).toBe(true);
      expect(payload.result.result.notificationTrainManager.attempted).toBe(true);
      expect(payload.result.result.panelCloseControl.attempted).toBe(false);
      expect(payload.result.result.panelCloseControl.reason).toMatch(/active end-turn blocker/);
      expect(payload.result.verificationAttempts.length).toBeGreaterThan(1);
      expect(server.received.some((message) => message.includes('readNotificationDismissal'))).toBe(true);
      expect(server.received.some((message) => message.includes('"send":true'))).toBe(true);
      expect(server.received.some((message) => message.includes('NotificationModel.manager'))).toBe(true);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('does not verify dismissal from stale nonblocking front evidence', async () => {
    const server = await startTunerServer({ notificationDismissalMode: 'stale-nonblocking' });
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayDismissNotification.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
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
        'reviewed culture tree reveal',
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        result: {
          sent: boolean;
          verified: boolean;
          result: {
            notificationTrainManager: { ok: boolean; attempted: boolean };
            panelCloseControl: { ok: boolean; attempted: boolean };
          };
          after: {
            exists: boolean;
            dismissed: boolean;
            isEndTurnBlocking: { ok: boolean; value: boolean };
            engineQueueContains: { ok: boolean; value: boolean };
            isEngineQueueFront: { ok: boolean; value: boolean };
            notificationTrainContains: { ok: boolean; value: boolean };
            isNotificationTrainFront: { ok: boolean; value: boolean };
          };
          verificationAttempts: unknown[];
        };
      };
      expect(payload.result.sent).toBe(true);
      expect(payload.result.verified).toBe(false);
      expect(payload.result.result.notificationTrainManager).toMatchObject({ ok: true, attempted: true });
      expect(payload.result.result.panelCloseControl).toMatchObject({ ok: true, attempted: true });
      expect(payload.result.after).toMatchObject({
        exists: true,
        dismissed: false,
        isEndTurnBlocking: { ok: true, value: false },
        engineQueueContains: { ok: true, value: true },
        isEngineQueueFront: { ok: true, value: true },
        notificationTrainContains: { ok: true, value: true },
        isNotificationTrainFront: { ok: true, value: true },
      });
      expect(payload.result.verificationAttempts.length).toBeGreaterThan(1);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('does not verify dismissal from train absence while engine queue still fronts the target', async () => {
    const server = await startTunerServer({ notificationDismissalMode: 'engine-front-train-absent' });
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayDismissNotification.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
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
        'reviewed unit lost report',
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        result: {
          sent: boolean;
          verified: boolean;
          after: {
            engineQueueContains: { ok: boolean; value: boolean };
            isEngineQueueFront: { ok: boolean; value: boolean };
            notificationTrainContains: { ok: boolean; value: boolean };
            isNotificationTrainFront: { ok: boolean; value: boolean };
          };
          verificationAttempts: unknown[];
        };
      };
      expect(payload.result.sent).toBe(true);
      expect(payload.result.verified).toBe(false);
      expect(payload.result.after).toMatchObject({
        engineQueueContains: { ok: true, value: true },
        isEngineQueueFront: { ok: true, value: true },
        notificationTrainContains: { ok: true, value: false },
        isNotificationTrainFront: { ok: true, value: false },
      });
      expect(payload.result.verificationAttempts.length).toBeGreaterThan(1);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('does not verify dismissal from dismissed flag while engine queue still fronts the target', async () => {
    const server = await startTunerServer({ notificationDismissalMode: 'engine-front-dismissed' });
    const writes: string[] = [];
    const log = vi.spyOn(GamePlayDismissNotification.prototype, 'log').mockImplementation((message?: string) => {
      if (message) writes.push(message);
    });
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
        'reviewed dismissed flag with stale engine-front report',
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        result: {
          sent: boolean;
          verified: boolean;
          after: {
            dismissed: boolean;
            engineQueueContains: { ok: boolean; value: boolean };
            isEngineQueueFront: { ok: boolean; value: boolean };
          };
          verificationAttempts: unknown[];
        };
      };
      expect(payload.result.sent).toBe(true);
      expect(payload.result.verified).toBe(false);
      expect(payload.result.after).toMatchObject({
        dismissed: true,
        engineQueueContains: { ok: true, value: true },
        isEngineQueueFront: { ok: true, value: true },
      });
      expect(payload.result.verificationAttempts.length).toBeGreaterThan(1);
    } finally {
      log.mockRestore();
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
        candidates: {
          reachableMovement: Array<{ x: number; y: number; currentLocation: boolean; validateCli: string | null }>;
          reachableTargets: Array<{ x: number; y: number; validateCli: string | null }>;
          limit: number;
        };
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
      expect(payload.candidates.limit).toBe(12);
      expect(payload.candidates.reachableMovement[0]).toMatchObject({ x: 25, y: 35, currentLocation: false });
      expect(payload.candidates.reachableMovement[0].validateCli).toContain("game play unit-target --unit-id '{\"owner\":0,\"id\":65536,\"type\":26}' --x 25 --y 35 --json");
      expect(payload.candidates.reachableTargets[0]).toMatchObject({ x: 26, y: 35 });
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

  test('emits compact ready-city population and expansion yield candidates', async () => {
    const server = await startTunerServer();
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
        command: string;
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
          cli: string;
        }>;
        populationPlacement: {
          yieldTypeOrder: string[];
          workablePlots: Array<{ yieldDelta: { YIELD_HAPPINESS: number; happiness?: number }; cli: string }>;
          expansionCandidates: Array<{
            constructibleName: string;
            yieldSource: string;
            yieldSummary: { YIELD_FOOD: number; YIELD_PRODUCTION: number; food?: number };
            terrainName: string;
            cli: string;
          }>;
        };
        next: string;
        warnings: string[];
        omitted: Array<{ path: string }>;
        view?: unknown;
      };
      expect(payload.contractVersion).toBe('play-agent-v0');
      expect(payload.command).toBe('game play ready-city');
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
      expect(payload.productionCandidates[0].cli).toContain('game play build-production');
      expect(payload.populationPlacement.yieldTypeOrder).toContain('YIELD_DIPLOMACY');
      expect(payload.populationPlacement.workablePlots[0].yieldDelta.YIELD_HAPPINESS).toBe(2);
      expect(payload.populationPlacement.workablePlots[0].yieldDelta.happiness).toBeUndefined();
      expect(payload.populationPlacement.workablePlots[0].cli).toContain('assign-worker');
      expect(payload.populationPlacement.expansionCandidates[0].constructibleName).toBe('Walls');
      expect(payload.populationPlacement.expansionCandidates[0].yieldSource).toBe('GameplayMap.getYieldsWithCity(plotIndex, cityId)');
      expect(payload.populationPlacement.expansionCandidates[0].yieldSummary).toMatchObject({ YIELD_FOOD: 2, YIELD_PRODUCTION: 1 });
      expect(payload.populationPlacement.expansionCandidates[0].yieldSummary.food).toBeUndefined();
      expect(payload.populationPlacement.expansionCandidates[0].terrainName).toBe('Grassland');
      expect(payload.next).toContain('assign-worker');
      expect(payload.warnings.join(' ')).toContain('Read-only city dashboard');
      expect(payload.omitted.some((item) => item.path === 'view.productionCandidates[].result')).toBe(true);
      expect(payload.omitted.some((item) => item.path === 'view.populationPlacement.allPlacementInfo')).toBe(true);
      expect(payload.view).toBeUndefined();
      expect(server.received.some((message) => message.includes('readReadyCityView'))).toBe(true);
    } finally {
      log.mockRestore();
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
  playNotificationMode?: 'town-focus' | 'production-choice' | 'population-placement' | 'tech-choice' | 'culture-choice' | 'celebration-choice' | 'government-choice' | 'narrative-choice' | 'narrative-choice-empty' | 'narrative-choice-visible-panel' | 'tradition-review' | 'stale-unit-command' | 'stale-unit-command-disabled' | 'stale-unit-command-pending' | 'stale-informational' | 'unit-lost-report' | 'legacy-completed' | 'diplomatic-report' | 'diplomatic-action-report' | 'first-meet' | 'ready-unit' | 'mixed-queue' | 'clean-read' | 'stale-diplomacy' | 'runtime-error';
  unitTargetMode?: 'verified' | 'no-op-after-send' | 'path-shortfall' | 'delayed-after-send';
  notificationDismissalMode?: 'verified' | 'stale-nonblocking' | 'engine-front-train-absent' | 'engine-front-dismissed';
  productionPostconditionMode?: 'cleared' | 'blocker-still-live';
  narrativeChoiceMode?: 'panel-cleared' | 'panel-cleared-blocker-live' | 'stale';
  technologyChoiceMode?: 'cleared' | 'sticky' | 'state-changed';
  cultureChoiceMode?: 'cleared' | 'sticky' | 'state-changed';
} = {}) {
  const received: string[] = [];
  let turnCompleteSent = false;
  let unitTargetSendObserved = false;
  let narrativeChoiceSent = false;
  let technologyChoiceSent = false;
  let cultureChoiceSent = false;
  let diplomacyCloseoutObserved = false;
  let notificationDismissalSent = false;
  let productionChoiceSent = false;
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
          const playMode = options.playNotificationMode === 'tech-choice'
            && technologyChoiceSent
            && (options.technologyChoiceMode ?? 'cleared') === 'cleared'
            ? 'ready-unit'
            : options.playNotificationMode === 'culture-choice'
            && cultureChoiceSent
            && (options.cultureChoiceMode ?? 'cleared') === 'cleared'
            ? 'ready-unit'
            : options.playNotificationMode === 'narrative-choice-visible-panel'
            && narrativeChoiceSent
            && (options.narrativeChoiceMode ?? 'panel-cleared') === 'panel-cleared'
            ? 'ready-unit'
            : options.playNotificationMode;
          socket.write(encodeResponse(frame.listenerId, [JSON.stringify(playNotificationView(
            playMode,
            diplomacyCloseoutObserved,
            technologyChoiceSent && options.technologyChoiceMode === 'state-changed',
            cultureChoiceSent && options.cultureChoiceMode === 'state-changed',
          ))]));
        } else if (frame.message.includes('sendDiplomacyResponseCloseout')) {
          diplomacyCloseoutObserved = true;
          socket.write(encodeResponse(frame.listenerId, [JSON.stringify(diplomacyResponseCloseout())]));
        } else if (frame.message.includes('sendTechnologyChoiceCloseout')) {
          technologyChoiceSent = true;
          socket.write(encodeResponse(frame.listenerId, [JSON.stringify(technologyChoiceCloseout())]));
        } else if (frame.message.includes('sendCultureChoiceCloseout')) {
          cultureChoiceSent = true;
          socket.write(encodeResponse(frame.listenerId, [JSON.stringify(cultureChoiceCloseout())]));
        } else if (frame.message.includes('sendNarrativeChoice')) {
          narrativeChoiceSent = true;
          socket.write(encodeResponse(frame.listenerId, [JSON.stringify(narrativeChoicePayload(options.narrativeChoiceMode ?? 'panel-cleared'))]));
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
          socket.write(encodeResponse(frame.listenerId, [JSON.stringify(
            options.playNotificationMode === 'clean-read' ? cleanReadyCityView() : readyCityView(),
          )]));
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
          const send = frame.message.includes('"send":true');
          if (send) notificationDismissalSent = true;
          socket.write(encodeResponse(frame.listenerId, [JSON.stringify(notificationDismissal(
            send,
            options.notificationDismissalMode ?? 'verified',
            notificationDismissalSent && !send,
          ))]));
        } else if (frame.message.includes('readProductionChoice')) {
          const send = frame.message.includes('"send":true');
          if (send) productionChoiceSent = true;
          socket.write(encodeResponse(frame.listenerId, [JSON.stringify(productionChoicePayload(
            send,
            options.productionPostconditionMode ?? 'cleared',
            productionChoiceSent && !send,
          ))]));
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
          const productionFamily = frame.message.includes('sendOperation("city-operation"') && operationType === 'BUILD';
          if (operationType === 'SET_TECH_TREE_NODE' || operationType === 'SET_TECH_TREE_TARGET_NODE') {
            technologyChoiceSent = true;
          }
          if (operationType === 'SET_CULTURE_TREE_NODE' || operationType === 'SET_CULTURE_TREE_TARGET_NODE') {
            cultureChoiceSent = true;
          }
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
                : productionFamily
                  ? {
                      sent: true,
                      beforeProductionPostcondition: productionPostconditionSnapshot('before', options.productionPostconditionMode ?? 'cleared'),
                      afterProductionPostcondition: productionPostconditionSnapshot('after', options.productionPostconditionMode ?? 'cleared'),
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
  mode: 'town-focus' | 'production-choice' | 'population-placement' | 'tech-choice' | 'culture-choice' | 'celebration-choice' | 'government-choice' | 'narrative-choice' | 'narrative-choice-empty' | 'narrative-choice-visible-panel' | 'tradition-review' | 'stale-unit-command' | 'stale-unit-command-disabled' | 'stale-unit-command-pending' | 'stale-informational' | 'unit-lost-report' | 'legacy-completed' | 'diplomatic-report' | 'diplomatic-action-report' | 'first-meet' | 'ready-unit' | 'mixed-queue' | 'clean-read' | 'stale-diplomacy' | 'runtime-error' = 'town-focus',
  diplomacyCloseoutObserved = false,
  technologyStateChanged = false,
  cultureStateChanged = false,
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
  if (mode === 'clean-read') {
    return {
      localPlayerId: 0,
      turn: { ok: true, value: 6 },
      turnDate: { ok: true, value: '3875 BCE' },
      hasSentTurnComplete: { ok: true, value: false },
      canEndTurn: { ok: true, value: false },
      blocker: { ok: true, value: 0 },
      blockingNotificationId: { ok: true, value: null },
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
  if (mode === 'first-meet') {
    const decision = {
      category: 'first-meet-diplomacy',
      operationFamily: 'player-operation',
      operationType: 'RESPOND_DIPLOMATIC_FIRST_MEET',
      argsShape: '{ Player1, Player2, Type }',
      cli: 'game play respond-first-meet',
      requiredInputs: [
        { name: 'Player1', source: 'local player id', required: true },
        { name: 'Player2', source: 'met player id', required: true },
        { name: 'Type', source: 'chosen first-meet greeting', required: true },
      ],
      commonActions: [
        {
          label: 'send neutral first-meet greeting',
          cli: 'game play respond-first-meet --player-id 0 --met-player-id 2 --response neutral',
          operationFamily: 'player-operation',
          operationType: 'RESPOND_DIPLOMATIC_FIRST_MEET',
          argsShape: '{ Player1, Player2, Type }',
          when: 'after validating the greeting options from the live first-meet UI',
        },
      ],
      notes: ['First-meet greetings are real player operations, not notification dismissals.'],
      details: {
        kind: 'first-meet-diplomacy',
        player1: 0,
        player2: 2,
        responses: [
          {
            response: 'neutral',
            type: { ok: true, value: 673478009 },
            args: { Player1: 0, Player2: 2, Type: 673478009 },
            validation: { ok: true, value: { Success: true } },
          },
        ],
        recommendedResponse: 'neutral',
        recommendedCli: 'game play respond-first-meet --player-id 0 --met-player-id 2 --response neutral',
      },
    };
    const notification = {
      id: { owner: 0, id: 44, type: 20 },
      type: 44,
      typeName: 'NOTIFICATION_PLAYER_MET',
      groupType: null,
      summary: 'You have met Ashoka, World Renouncer of Mauryan Empire.',
      message: 'You have met a new Civilization',
      target: { owner: -1, id: -1, type: 0 },
      location: { x: 4, y: 2 },
      player: 2,
      canUserDismiss: false,
      expired: false,
      dismissed: false,
      isEndTurnBlocking: true,
      decision,
      details: decision.details,
    };
    return {
      localPlayerId: 0,
      turn: { ok: true, value: 27 },
      turnDate: { ok: true, value: '3350 BCE' },
      hasSentTurnComplete: { ok: true, value: false },
      canEndTurn: { ok: true, value: false },
      blocker: { ok: true, value: 523279636 },
      blockingNotificationId: { ok: true, value: notification.id },
      selectedUnitId: { ok: true, value: null },
      selectedCityId: { ok: true, value: null },
      firstReadyUnitId: { ok: true, value: null },
      notifications: [notification],
      decisions: [decision],
      hud: {
        nextDecision: {
          notificationId: notification.id,
          isEndTurnBlocking: true,
          typeName: notification.typeName,
          summary: notification.summary,
          message: notification.message,
          target: notification.target,
          location: notification.location,
          player: notification.player,
          details: notification.details,
          ...decision,
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
            player: notification.player,
            details: notification.details,
            ...decision,
          },
        ],
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
  if (mode === 'stale-diplomacy') {
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
          label: 'choose diplomacy response',
          cli: 'game play respond-diplomacy --action-id <action-id> --response-type <response-type>',
          operationFamily: 'player-operation',
          operationType: 'RESPOND_DIPLOMATIC_ACTION',
          argsShape: '{ ID, Type }',
          when: 'after reading the live panel response options',
        },
      ],
      confidence: 'official-ui',
      notes: ['Visible response panel option; send mode must verify the notification no longer blocks turn completion.'],
    };
    const notificationId = { owner: 0, id: 19, type: 20 };
    const diplomacyResponseDetails = {
      kind: 'diplomacy-response-options',
      actionId: 8,
      notificationId,
      responseData: { ok: true, value: { responseList: [{ responseType: -1907089594 }, { responseType: 926305338 }, { responseType: -1200641623 }] } },
      eventData: { ok: true, value: { responseType: -1907089594, support: 2 } },
      options: [
        {
          responseType: -1907089594,
          title: 'Support',
          description: null,
          cost: null,
          icon: null,
          enabled: false,
          disabled: true,
          validation: { ok: true, value: { Success: false, FailureReasons: ['already selected'] } },
          cli: null,
        },
        {
          responseType: 926305338,
          title: 'Accept',
          description: null,
          cost: null,
          icon: null,
          enabled: true,
          disabled: false,
          validation: { ok: true, value: { Success: true } },
          cli: "game play respond-diplomacy --action-id 8 --response-type 926305338 --notification-id '{\"owner\":0,\"id\":19,\"type\":20}' --send --reason '<why this response was selected>'",
        },
        {
          responseType: -1200641623,
          title: 'Reject',
          description: null,
          cost: null,
          icon: null,
          enabled: true,
          disabled: false,
          validation: { ok: true, value: { Success: true } },
          cli: "game play respond-diplomacy --action-id 8 --response-type -1200641623 --notification-id '{\"owner\":0,\"id\":19,\"type\":20}' --send --reason '<why this response was selected>'",
        },
      ],
      enabledOptions: [
        {
          responseType: 926305338,
          title: 'Accept',
          description: null,
          cost: null,
          icon: null,
          enabled: true,
          disabled: false,
          validation: { ok: true, value: { Success: true } },
          cli: "game play respond-diplomacy --action-id 8 --response-type 926305338 --notification-id '{\"owner\":0,\"id\":19,\"type\":20}' --send --reason '<why this response was selected>'",
        },
        {
          responseType: -1200641623,
          title: 'Reject',
          description: null,
          cost: null,
          icon: null,
          enabled: true,
          disabled: false,
          validation: { ok: true, value: { Success: true } },
          cli: "game play respond-diplomacy --action-id 8 --response-type -1200641623 --notification-id '{\"owner\":0,\"id\":19,\"type\":20}' --send --reason '<why this response was selected>'",
        },
      ],
      disabledOptions: [
        {
          responseType: -1907089594,
          title: 'Support',
          description: null,
          cost: null,
          icon: null,
          enabled: false,
          disabled: true,
          validation: { ok: true, value: { Success: false, FailureReasons: ['already selected'] } },
          cli: null,
        },
      ],
      notes: [
        'Static fixture mirrors the CLI/HUD contract emitted by the App UI source-backed getResponseDataForUI option materializer.',
        'Use a returned enabled option as the single caller-level response; send mode performs UI closeout and notification postcondition checks.',
      ],
    };
    const notification = {
      id: notificationId,
      type: 96575931,
      typeName: 'NOTIFICATION_DIPLOMATIC_RESPONSE_REQUIRED',
      groupType: null,
      summary: 'Trung Trac has started a Diplomatic Action with you.',
      message: 'Respond to Diplomatic Action',
      target: { owner: 2, id: 8, type: 34 },
      location: { x: -9999, y: -9999 },
      canUserDismiss: false,
      expired: true,
      dismissed: false,
      isEndTurnBlocking: !diplomacyCloseoutObserved,
      decision: diplomacyDecision,
      details: diplomacyResponseDetails,
    };
    return {
      localPlayerId: 0,
      turn: { ok: true, value: 8 },
      turnDate: { ok: true, value: '3825 BCE' },
      hasSentTurnComplete: { ok: true, value: false },
      canEndTurn: { ok: true, value: diplomacyCloseoutObserved },
      blocker: { ok: true, value: 0 },
      blockingNotificationId: { ok: true, value: diplomacyCloseoutObserved ? null : notification.id },
      selectedUnitId: { ok: true, value: null },
      selectedCityId: { ok: true, value: null },
      firstReadyUnitId: { ok: true, value: null },
      notifications: diplomacyCloseoutObserved ? [] : [notification],
      decisions: diplomacyCloseoutObserved ? [] : [diplomacyDecision],
      hud: {
        nextDecision: diplomacyCloseoutObserved
          ? null
          : {
              notificationId: notification.id,
              isEndTurnBlocking: true,
              typeName: notification.typeName,
              summary: notification.summary,
              message: notification.message,
              target: notification.target,
              location: notification.location,
              player: null,
              details: notification.details,
              ...diplomacyDecision,
            },
        decisionQueue: diplomacyCloseoutObserved
          ? []
          : [
              {
                notificationId: notification.id,
                isEndTurnBlocking: true,
                typeName: notification.typeName,
                summary: notification.summary,
                message: notification.message,
                target: notification.target,
                location: notification.location,
                player: null,
                details: notification.details,
                ...diplomacyDecision,
              },
            ],
      },
      limits: { maxNotifications: 25, truncated: false },
    };
  }
  if (mode === 'production-choice' || mode === 'population-placement') {
    const production = mode === 'production-choice';
    const decision = production
      ? {
          category: 'production-choice',
          operationFamily: 'city-operation',
          operationType: 'BUILD',
          argsShape: '{ UnitType } or { ConstructibleType, X?, Y? } or { ProjectType }',
          cli: 'game play ready-city',
          requiredInputs: [
            { name: 'City', source: 'notification target or selected city', required: true },
            { name: 'Build item type', source: 'live production chooser', required: true },
          ],
          commonActions: [
            {
              label: 'read production candidates',
              cli: 'game play ready-city --compact --json',
              argsShape: 'city summary and validated production candidates',
              when: 'before choosing a production item',
            },
          ],
          confidence: 'live-proof',
          notes: ['Use live chooser data to decide the item kind.'],
        }
      : {
          category: 'population-placement',
          operationFamily: undefined,
          operationType: undefined,
          argsShape: 'ASSIGN_WORKER { Location, Amount: 1 } or city-command EXPAND placement args',
          cli: 'game play ready-city',
          requiredInputs: [
            { name: 'Location', source: 'chosen plot', required: true },
            { name: 'City', source: 'notification target or selected city', required: false },
          ],
          commonActions: [
            {
              label: 'read city placement candidates',
              cli: 'game play ready-city --compact --json',
              argsShape: 'workable plots and expansion candidates',
              when: 'before choosing assign-worker or expand-city',
            },
          ],
          confidence: 'official-ui',
          notes: ['Re-read candidates before choosing assign-worker or expand-city.'],
        };
    const notificationId = { owner: 0, id: production ? 71 : 72, type: 20 };
    const notification = {
      id: notificationId,
      type: production ? -99801 : -99802,
      typeName: production ? 'NOTIFICATION_CHOOSE_CITY_PRODUCTION' : 'NOTIFICATION_NEW_POPULATION',
      groupType: null,
      summary: production
        ? 'Production has completed in this City. Choose what we shall produce next.'
        : 'Your City is ready to claim and improve a new Rural tile, or assign a Specialist to a workable District.',
      message: production ? 'Choose Production' : 'New Population',
      target: { owner: 0, id: 131073, type: 1 },
      location: null,
      canUserDismiss: false,
      expired: false,
      dismissed: false,
      isEndTurnBlocking: true,
      decision,
    };
    return {
      localPlayerId: 0,
      turn: { ok: true, value: production ? 2 : 3 },
      turnDate: { ok: true, value: production ? '3975 BCE' : '3950 BCE' },
      hasSentTurnComplete: { ok: true, value: false },
      canEndTurn: { ok: true, value: false },
      blocker: { ok: true, value: production ? -513644209 : 0 },
      blockingNotificationId: { ok: true, value: notificationId },
      selectedUnitId: { ok: true, value: null },
      selectedCityId: { ok: true, value: null },
      firstReadyUnitId: { ok: true, value: null },
      notifications: [notification],
      decisions: [decision],
      hud: {
        nextDecision: {
          notificationId: notification.id,
          isEndTurnBlocking: true,
          typeName: notification.typeName,
          summary: notification.summary,
          message: notification.message,
          target: notification.target,
          location: notification.location,
          ...decision,
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
            ...decision,
          },
        ],
      },
      limits: { maxNotifications: 25, truncated: false },
    };
  }
  if (mode === 'narrative-choice' || mode === 'narrative-choice-empty' || mode === 'narrative-choice-visible-panel') {
    const narrativeDecision = {
      category: 'narrative-choice',
      operationFamily: 'player-operation',
      operationType: 'CHOOSE_NARRATIVE_STORY_DIRECTION',
      argsShape: '{ TargetType, Target, Action }',
      cli: 'game play choose-narrative',
      requiredInputs: [
        {
          name: 'Target',
          source: 'notification target or story UI targetStoryId',
          required: true,
          note: 'Usually the story ComponentID from the notification target.',
        },
        {
          name: 'TargetType',
          source: 'story option button',
          required: true,
          note: 'If no story links exist, official UI uses CLOSE as the option key.',
        },
        {
          name: 'Action',
          source: 'story option activation',
          required: true,
          note: 'Official narrative UI sends PlayerOperationParameters.Activate.',
        },
      ],
      commonActions: [
        {
          label: 'read narrative options',
          cli: 'game play choose-narrative --options --json',
          argsShape: 'enabled narrative buttons with validation and ready send templates',
          when: 'before choosing a narrative branch or closeout',
        },
      ],
      confidence: 'live-proof',
      notes: ['Use the option reader before sending; the notification target can be invalid because official narrative UI derives the target story from Players.Stories. If no pending story id is present, do not synthesize a narrative operation; inspect dismissal postcondition evidence separately.'],
    };
    const notificationId = { owner: 0, id: 5, type: 20 };
    const targetStoryId = { owner: 0, id: 45, type: 35 };
    const options = [
      {
        targetType: 'CLOSE',
        targetTypeName: 'CLOSE',
        target: targetStoryId,
        action: -1326475004,
        activation: 'CLOSE',
        name: 'Close',
        reward: '+10 Gold',
        imperative: null,
        cost: 0,
        canAfford: { ok: true, value: true },
        args: { TargetType: 'CLOSE', Target: targetStoryId, Action: -1326475004 },
        enabled: true,
        disabled: false,
        validation: { ok: true, value: { Success: true } },
        cli: "game play choose-narrative --player-id 0 --target-type CLOSE --target '{\"owner\":0,\"id\":45,\"type\":35}' --action -1326475004 --send --reason '<why this narrative closeout was selected>'",
        validateCli: "game play choose-narrative --player-id 0 --target-type CLOSE --target '{\"owner\":0,\"id\":45,\"type\":35}' --action -1326475004 --json",
      },
    ];
    const hasPendingStory = mode === 'narrative-choice';
    const hasVisiblePanel = mode === 'narrative-choice-visible-panel';
    const visibleTargetStoryId = { owner: 0, id: 25, type: 35 };
    const visibleOptions = [
      {
        source: 'visible-small-narrative-event',
        targetType: 'DISCOVERY_14001B',
        targetTypeName: 'DISCOVERY_14001B',
        target: visibleTargetStoryId,
        action: -1326475004,
        activation: 'VISIBLE_PANEL',
        name: 'Find work for the soldiers.',
        reward: '+15 Production to Washington, D.C..',
        imperative: '',
        cost: null,
        canAfford: { ok: true, value: true },
        args: { TargetType: 'DISCOVERY_14001B', Target: visibleTargetStoryId, Action: -1326475004 },
        enabled: true,
        disabled: false,
        validation: { ok: true, value: { Success: true } },
        cli: "game play choose-narrative --player-id 0 --target-type DISCOVERY_14001B --target '{\"owner\":0,\"id\":25,\"type\":35}' --action -1326475004 --send --reason '<why this visible narrative option was selected>'",
        validateCli: "game play choose-narrative --player-id 0 --target-type DISCOVERY_14001B --target '{\"owner\":0,\"id\":25,\"type\":35}' --action -1326475004 --json",
      },
      {
        source: 'visible-small-narrative-event',
        targetType: 'DISCOVERY_14001C',
        targetTypeName: 'DISCOVERY_14001C',
        target: visibleTargetStoryId,
        action: -1326475004,
        activation: 'VISIBLE_PANEL',
        name: 'Make plans to return home.',
        reward: '+75 Happiness toward the next Celebration.',
        imperative: '',
        cost: null,
        canAfford: { ok: true, value: true },
        args: { TargetType: 'DISCOVERY_14001C', Target: visibleTargetStoryId, Action: -1326475004 },
        enabled: true,
        disabled: false,
        validation: { ok: true, value: { Success: true } },
        cli: "game play choose-narrative --player-id 0 --target-type DISCOVERY_14001C --target '{\"owner\":0,\"id\":25,\"type\":35}' --action -1326475004 --send --reason '<why this visible narrative option was selected>'",
        validateCli: "game play choose-narrative --player-id 0 --target-type DISCOVERY_14001C --target '{\"owner\":0,\"id\":25,\"type\":35}' --action -1326475004 --json",
      },
    ];
    const surfacedOptions = hasPendingStory ? options : hasVisiblePanel ? visibleOptions : [];
    const hasMaterializedOptions = surfacedOptions.length > 0;
    const details = {
      kind: 'narrative-choice-options',
      classification: surfacedOptions.length > 0 ? 'narrative-choice-options' : 'narrative-choice-no-pending-story',
      notificationId,
      localPlayerId: 0,
      notificationOwner: 0,
      source: 'Players.Stories pending story id + GameInfo.NarrativeStory_Links + PlayerOperations.canStart',
      activateAction: -1326475004,
      targetStoryIdSource: 'Players.Stories.getFirstPendingDiscoveryLastMetID',
      pendingStoryId: { ok: true, value: null },
      pendingDiscoveryStoryId: { ok: true, value: hasPendingStory ? targetStoryId : null },
      targetStoryId: { ok: true, value: hasPendingStory ? targetStoryId : null },
      visiblePanel: {
        ok: true,
        value: hasVisiblePanel
          ? {
              panelType: 'SMALL-NARRATIVE-EVENT',
              componentType: 'SmallNarrativeEvent',
              targetStoryId: visibleTargetStoryId,
              storyType: 'DISCOVERY',
              options: visibleOptions.map((option) => ({
                targetType: option.targetType,
                name: option.name,
                reward: option.reward,
                actionText: option.imperative,
                icons: '[]',
                storyType: 'LIGHT',
              })),
            }
          : { panelType: null, componentType: null, targetStoryId: null, storyType: null, options: [] },
      },
      targetStory: { ok: true, value: hasPendingStory ? { id: 45, type: 'NARRATIVE_DISCOVERY_GOODY_HUT' } : null },
      storyDef: { ok: true, value: hasPendingStory ? { NarrativeStoryType: 'NARRATIVE_DISCOVERY_GOODY_HUT', UIActivation: 'DISCOVERY' } : null },
      storyLinks: { ok: true, value: [] },
      notificationTarget: { owner: -1, id: -1, type: 0 },
      options: surfacedOptions,
      enabledOptions: surfacedOptions,
      disabledOptions: [],
      dismissalDiagnosticCli: hasMaterializedOptions ? null : "game play dismiss-notification --target '{\"owner\":0,\"id\":5,\"type\":20}' --json",
      unprovenDismissalCli: hasMaterializedOptions ? null : "game play dismiss-notification --target '{\"owner\":0,\"id\":5,\"type\":20}' --send --reason '<reviewed: narrative notification has no pending story>'",
      notes: [
        'Static fixture mirrors the CLI/HUD contract emitted by the official story-model narrative choice materializer.',
      ],
    };
    const notification = {
      id: notificationId,
      type: -2084516792,
      typeName: 'NOTIFICATION_CHOOSE_DISCOVERY_STORY_DIRECTION',
      groupType: null,
      summary: 'Choose a selection from the Discovery.',
      message: 'Discovery Choice',
      target: { owner: -1, id: -1, type: 0 },
      location: { x: -9999, y: -9999 },
      canUserDismiss: true,
      expired: false,
      dismissed: false,
      isEndTurnBlocking: true,
      decision: narrativeDecision,
      details,
    };
    return {
      localPlayerId: 0,
      turn: { ok: true, value: 6 },
      turnDate: { ok: true, value: '3875 BCE' },
      hasSentTurnComplete: { ok: true, value: false },
      canEndTurn: { ok: true, value: false },
      blocker: { ok: true, value: -2084516792 },
      blockingNotificationId: { ok: true, value: notificationId },
      selectedUnitId: { ok: true, value: null },
      selectedCityId: { ok: true, value: null },
      firstReadyUnitId: { ok: true, value: null },
      notifications: [notification],
      decisions: [narrativeDecision],
      hud: {
        nextDecision: {
          notificationId: notification.id,
          isEndTurnBlocking: true,
          typeName: notification.typeName,
          summary: notification.summary,
          message: notification.message,
          target: notification.target,
          location: notification.location,
          details: notification.details,
          ...narrativeDecision,
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
            details: notification.details,
            ...narrativeDecision,
          },
        ],
      },
      limits: { maxNotifications: 25, truncated: false },
    };
  }
  if (mode === 'tech-choice') {
    const technologyDecision = {
      category: 'technology-choice',
      operationFamily: 'player-operation',
      operationType: 'SET_TECH_TREE_NODE',
      argsShape: '{ ProgressionTreeNodeType }',
      cli: 'game play choose-tech',
      requiredInputs: [
        {
          name: 'ProgressionTreeNodeType',
          source: 'live tech chooser/tree node',
          required: true,
          note: 'Use the runtime node type hash from GameInfo/progression tree data, not the row index or notification id.',
        },
      ],
      commonActions: [
        {
          label: 'read technology options',
          cli: 'game play choose-tech --options --json',
          argsShape: 'enabled tech nodes with validation and ready send templates',
          when: 'before choosing a technology node',
        },
      ],
      confidence: 'live-proof',
      notes: ['Read options from the live tech tree before sending; do not infer node ids from examples.'],
    };
    const notificationId = { owner: 0, id: 52, type: 20 };
    const optionRows = [
      { nodeType: -1255676052, nodeTypeName: 'NODE_TECH_AQ_MASONRY', name: 'Masonry', depth: 2, state: 3, turns: 2, cost: 137, enabled: true },
      { nodeType: -1558948215, nodeTypeName: 'NODE_TECH_AQ_SAILING', name: 'Sailing', depth: 1, state: 2, turns: 5, cost: 77, enabled: true },
      { nodeType: 510800721, nodeTypeName: 'NODE_TECH_AQ_AGRICULTURE', name: 'Agriculture', depth: 0, state: 5, turns: 1, cost: 0, enabled: false },
    ];
    const options = optionRows.map((row) => ({
      nodeType: row.nodeType,
      nodeTypeName: row.nodeTypeName,
      name: row.name,
      description: null,
      icon: null,
      treeType: -153498200,
      treeTypeName: 'TREE_TECHS_AQ',
      treeName: 'Technology',
      ageType: 'AGE_ANTIQUITY',
      depth: row.depth,
      state: row.state,
      progress: row.nodeType === -1255676052 ? 108 : 0,
      maxDepth: row.nodeType === -1255676052 ? 2 : 1,
      cost: { ok: true, value: row.cost },
      turns: { ok: true, value: row.turns },
      canEverUnlock: { ok: true, value: { isLocked: false } },
      chooseEnabled: row.enabled,
      targetEnabled: row.enabled,
      disabled: !row.enabled,
      chooseValidation: { ok: true, value: { Success: row.enabled } },
      targetValidation: { ok: true, value: { Success: row.enabled } },
      cli: row.enabled
        ? `game play choose-tech --player-id 0 --node ${row.nodeType} --send --reason '<why this technology was selected>'`
        : null,
      validateCli: `game play choose-tech --player-id 0 --node ${row.nodeType} --json`,
      targetCli: row.enabled
        ? `game play set-tech-target --player-id 0 --node ${row.nodeType} --send --reason '<why this technology target was selected>'`
        : null,
    }));
    const details = {
      kind: 'technology-choice-options',
      notificationId,
      localPlayerId: 0,
      source: 'GameInfo.ProgressionTrees + Game.ProgressionTrees + PlayerOperations.canStart',
      currentResearching: { ok: true, value: technologyStateChanged ? -1255676052 : null },
      targetNode: { ok: true, value: technologyStateChanged ? -1 : null },
      techTrees: {
        ok: true,
        value: [{ treeType: -153498200, treeTypeName: 'TREE_TECHS_AQ', name: 'Technology', ageType: 'AGE_ANTIQUITY' }],
      },
      options,
      enabledOptions: options.filter((option) => option.chooseEnabled),
      disabledOptions: options.filter((option) => !option.chooseEnabled),
      notes: [
        'Static fixture mirrors the CLI/HUD contract emitted by the App UI source-backed technology choice materializer.',
      ],
    };
    const notification = {
      id: notificationId,
      type: -456,
      typeName: 'NOTIFICATION_CHOOSE_TECH',
      groupType: null,
      summary: 'Choose a Technology',
      message: 'Choose a new Technology to begin studying.',
      target: { owner: -1, id: -1, type: 0 },
      location: null,
      canUserDismiss: false,
      expired: false,
      dismissed: false,
      isEndTurnBlocking: true,
      decision: technologyDecision,
      details,
    };
    return {
      localPlayerId: 0,
      turn: { ok: true, value: 19 },
      turnDate: { ok: true, value: '3550 BCE' },
      hasSentTurnComplete: { ok: true, value: false },
      canEndTurn: { ok: true, value: false },
      blocker: { ok: true, value: -1255676052 },
      blockingNotificationId: { ok: true, value: notificationId },
      selectedUnitId: { ok: true, value: null },
      selectedCityId: { ok: true, value: null },
      firstReadyUnitId: { ok: true, value: null },
      notifications: [notification],
      decisions: [technologyDecision],
      hud: {
        nextDecision: {
          notificationId: notification.id,
          isEndTurnBlocking: true,
          typeName: notification.typeName,
          summary: notification.summary,
          message: notification.message,
          target: notification.target,
          location: notification.location,
          details: notification.details,
          ...technologyDecision,
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
            details: notification.details,
            ...technologyDecision,
          },
        ],
      },
      limits: { maxNotifications: 25, truncated: false },
    };
  }
  if (mode === 'culture-choice') {
    const cultureDecision = {
      category: 'culture-choice',
      operationFamily: 'player-operation',
      operationType: 'SET_CULTURE_TREE_NODE',
      argsShape: '{ ProgressionTreeNodeType }',
      cli: 'game play choose-culture',
      requiredInputs: [
        {
          name: 'ProgressionTreeNodeType',
          source: 'live culture chooser/tree node',
          required: true,
          note: 'Use the runtime node type hash from GameInfo/progression tree data, not the row index or notification id.',
        },
      ],
      commonActions: [
        {
          label: 'read culture options',
          cli: 'game play choose-culture --options --json',
          argsShape: 'enabled culture nodes with validation and ready send templates',
          when: 'before choosing a culture node',
        },
      ],
      confidence: 'live-proof',
      notes: ['Read options from the live culture chooser before sending; do not infer node ids from examples.'],
    };
    const notificationId = { owner: 0, id: 62, type: 20 };
    const optionRows = [
      { nodeType: -869902342, nodeTypeName: 'NODE_CIVIC_AQ_GREECE_EKKLESIA', name: 'Ekklesia', depth: 1, state: 2, turns: 4, cost: 105, enabled: true },
      { nodeType: -1404789184, nodeTypeName: 'NODE_CIVIC_AQ_MAIN_DISCIPLINE', name: 'Discipline', depth: 1, state: 2, turns: 3, cost: 80, enabled: true },
      { nodeType: 1643868894, nodeTypeName: 'NODE_CIVIC_AQ_MAIN_MYSTICISM', name: 'Mysticism', depth: 0, state: 5, turns: 1, cost: 0, enabled: false },
    ];
    const options = optionRows.map((row) => ({
      nodeType: row.nodeType,
      nodeTypeName: row.nodeTypeName,
      name: row.name,
      description: null,
      icon: null,
      treeType: row.nodeType === -869902342 ? -122334455 : -153498201,
      treeTypeName: row.nodeType === -869902342 ? 'TREE_CIVICS_AQ_GREECE' : 'TREE_CIVICS_AQ_MAIN',
      treeName: row.nodeType === -869902342 ? 'Greece' : 'Civics',
      ageType: 'AGE_ANTIQUITY',
      depth: row.depth,
      state: row.state,
      progress: row.nodeType === -869902342 ? 22 : 0,
      maxDepth: row.nodeType === -869902342 ? 2 : 1,
      cost: { ok: true, value: row.cost },
      turns: { ok: true, value: row.turns },
      canEverUnlock: { ok: true, value: { isLocked: false } },
      chooseEnabled: row.enabled,
      targetEnabled: row.enabled,
      disabled: !row.enabled,
      chooseValidation: { ok: true, value: { Success: row.enabled } },
      targetValidation: { ok: true, value: { Success: row.enabled } },
      cli: row.enabled
        ? `game play choose-culture --player-id 0 --node ${row.nodeType} --send --closeout --reason '<why this culture node was selected>'`
        : null,
      validateCli: `game play choose-culture --player-id 0 --node ${row.nodeType} --json`,
      targetCli: row.enabled
        ? `game play set-culture-target --player-id 0 --node ${row.nodeType} --send --reason '<why this culture target was selected>'`
        : null,
    }));
    const details = {
      kind: 'culture-choice-options',
      notificationId,
      localPlayerId: 0,
      source: 'Players.Culture.getAllAvailableNodeTypes + Game.ProgressionTrees + PlayerOperations.canStart',
      currentResearching: { ok: true, value: cultureStateChanged ? -1404789184 : null },
      targetNode: { ok: true, value: cultureStateChanged ? -1 : null },
      availableNodeTypes: { ok: true, value: optionRows.map((row) => row.nodeType) },
      options,
      enabledOptions: options.filter((option) => option.chooseEnabled),
      disabledOptions: options.filter((option) => !option.chooseEnabled),
      notes: [
        'Static fixture mirrors the CLI/HUD contract emitted by the App UI source-backed culture choice materializer.',
      ],
    };
    const notification = {
      id: notificationId,
      type: -789,
      typeName: 'NOTIFICATION_CHOOSE_CULTURE_NODE',
      groupType: null,
      summary: 'Choose a Civic',
      message: 'Choose a new Civic to begin studying.',
      target: { owner: -1, id: -1, type: 0 },
      location: null,
      canUserDismiss: false,
      expired: false,
      dismissed: false,
      isEndTurnBlocking: true,
      decision: cultureDecision,
      details,
    };
    return {
      localPlayerId: 0,
      turn: { ok: true, value: 19 },
      turnDate: { ok: true, value: '3550 BCE' },
      hasSentTurnComplete: { ok: true, value: false },
      canEndTurn: { ok: true, value: false },
      blocker: { ok: true, value: -869902342 },
      blockingNotificationId: { ok: true, value: notificationId },
      selectedUnitId: { ok: true, value: null },
      selectedCityId: { ok: true, value: null },
      firstReadyUnitId: { ok: true, value: null },
      notifications: [notification],
      decisions: [cultureDecision],
      hud: {
        nextDecision: {
          notificationId: notification.id,
          isEndTurnBlocking: true,
          typeName: notification.typeName,
          summary: notification.summary,
          message: notification.message,
          target: notification.target,
          location: notification.location,
          details: notification.details,
          ...cultureDecision,
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
            details: notification.details,
            ...cultureDecision,
          },
        ],
      },
      limits: { maxNotifications: 25, truncated: false },
    };
  }
  if (mode === 'celebration-choice') {
    const celebrationDecision = {
      category: 'celebration-choice',
      operationFamily: 'player-operation',
      operationType: 'CHOOSE_GOLDEN_AGE',
      argsShape: '{ GoldenAgeType }',
      cli: 'game play choose-celebration',
      requiredInputs: [
        {
          name: 'GoldenAgeType',
          source: 'live celebration chooser option',
          required: true,
          note: 'Use the GoldenAgeType hash from choose-celebration --options, not old examples or visible row position.',
        },
      ],
      commonActions: [
        {
          label: 'read celebration options',
          cli: 'game play choose-celebration --options --json',
          argsShape: 'enabled celebration choices with validation and ready send templates',
          when: 'before choosing a celebration',
        },
      ],
      confidence: 'official-ui',
      notes: ['Read options from the live celebration chooser before sending; this blocker is not dismissible.'],
    };
    const notificationId = { owner: 0, id: 110, type: 20 };
    const optionRows = [
      {
        goldenAgeType: -340825966,
        goldenAgeTypeName: 'GOLDEN_AGE_CLASSICAL_REPUBLIC_1',
        name: 'Cultural Celebration',
        description: '+20% Culture for 10 turns.',
      },
      {
        goldenAgeType: 1923496232,
        goldenAgeTypeName: 'GOLDEN_AGE_CLASSICAL_REPUBLIC_2',
        name: 'Wonder Production Celebration',
        description: '+15% Production toward Wonders for 10 turns.',
      },
    ];
    const options = optionRows.map((row) => ({
      goldenAgeType: row.goldenAgeType,
      goldenAgeTypeName: row.goldenAgeTypeName,
      sourceChoice: row.goldenAgeTypeName,
      name: row.name,
      description: row.description,
      duration: 10,
      currentGovernmentType: 0,
      args: { GoldenAgeType: row.goldenAgeType },
      enabled: true,
      disabled: false,
      validation: { ok: true, value: { Success: true } },
      cli: `game play choose-celebration --player-id 0 --golden-age-type ${row.goldenAgeType} --send --reason '<why this celebration was selected>'`,
      validateCli: `game play choose-celebration --player-id 0 --golden-age-type ${row.goldenAgeType} --json`,
    }));
    const details = {
      kind: 'celebration-choice-options',
      notificationId,
      localPlayerId: 0,
      source: 'Players.Culture.getGoldenAgeChoices + GameInfo.GoldenAges + PlayerOperations.canStart',
      currentGovernmentType: { ok: true, value: 0 },
      goldenAgeDuration: { ok: true, value: 10 },
      choices: { ok: true, value: optionRows.map((row) => row.goldenAgeTypeName) },
      options,
      enabledOptions: options,
      disabledOptions: [],
      notes: [
        'Static fixture mirrors the CLI/HUD contract emitted by the App UI source-backed celebration choice materializer.',
      ],
    };
    const notification = {
      id: notificationId,
      type: -706533092,
      typeName: 'NOTIFICATION_CHOOSE_GOLDEN_AGE',
      groupType: null,
      summary: 'Your people want to Celebrate this glorious time.',
      message: 'Choose Celebration',
      target: { owner: -1, id: -1, type: 0 },
      location: null,
      canUserDismiss: false,
      expired: false,
      dismissed: false,
      isEndTurnBlocking: true,
      decision: celebrationDecision,
      details,
    };
    return {
      localPlayerId: 0,
      turn: { ok: true, value: 29 },
      turnDate: { ok: true, value: '3300 BCE' },
      hasSentTurnComplete: { ok: true, value: false },
      canEndTurn: { ok: true, value: false },
      blocker: { ok: true, value: 1783715360 },
      blockingNotificationId: { ok: true, value: notificationId },
      selectedUnitId: { ok: true, value: null },
      selectedCityId: { ok: true, value: null },
      firstReadyUnitId: { ok: true, value: null },
      notifications: [notification],
      decisions: [celebrationDecision],
      hud: {
        nextDecision: {
          notificationId: notification.id,
          isEndTurnBlocking: true,
          typeName: notification.typeName,
          summary: notification.summary,
          message: notification.message,
          target: notification.target,
          location: notification.location,
          details: notification.details,
          ...celebrationDecision,
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
            details: notification.details,
            ...celebrationDecision,
          },
        ],
      },
      limits: { maxNotifications: 25, truncated: false },
    };
  }
  if (mode === 'government-choice') {
    const action = -1326475004;
    const governmentDecision = {
      category: 'government-choice',
      operationFamily: 'player-operation',
      operationType: 'CHANGE_GOVERNMENT',
      argsShape: '{ GovernmentType, Action: Activate }',
      cli: 'game play choose-government',
      requiredInputs: [
        {
          name: 'GovernmentType',
          source: 'live government picker option',
          required: true,
          note: 'Use the government index from choose-government --options, not the visible row position.',
        },
      ],
      commonActions: [
        {
          label: 'read government options',
          cli: 'game play choose-government --options --json',
          argsShape: 'enabled starting governments with validation and ready send templates',
          when: 'before choosing a government',
        },
      ],
      confidence: 'official-ui',
      notes: ['Read options from the live government picker before sending; the option surface includes celebration effects for context.'],
    };
    const notificationId = { owner: 0, id: 40, type: 20 };
    const optionRows = [
      { governmentType: 0, governmentTypeName: 'GOVERNMENT_CLASSICAL_REPUBLIC', name: 'Classical Republic', celebration: 'Cultural Celebration' },
      { governmentType: 1, governmentTypeName: 'GOVERNMENT_DESPOTISM', name: 'Despotism', celebration: 'Military Celebration' },
      { governmentType: 2, governmentTypeName: 'GOVERNMENT_OLIGARCHY', name: 'Oligarchy', celebration: 'Scientific Celebration' },
    ];
    const options = optionRows.map((row) => ({
      governmentType: row.governmentType,
      governmentTypeName: row.governmentTypeName,
      name: row.name,
      description: `${row.name} description`,
      startingGovernmentType: row.governmentType,
      action,
      args: { GovernmentType: row.governmentType, Action: action },
      celebrationOptions: [
        {
          goldenAgeType: row.governmentType + 100,
          typeName: `GOLDEN_AGE_${row.governmentType}`,
          name: row.celebration,
          description: `${row.celebration} description`,
          duration: 10,
        },
      ],
      enabled: true,
      disabled: false,
      validation: { ok: true, value: { Success: true } },
      cli: `game play choose-government --player-id 0 --government-type ${row.governmentType} --action ${action} --send --reason '<why this government was selected>'`,
      validateCli: `game play choose-government --player-id 0 --government-type ${row.governmentType} --action ${action} --json`,
    }));
    const details = {
      kind: 'government-choice-options',
      notificationId,
      localPlayerId: 0,
      source: 'GameInfo.StartingGovernments + GameInfo.Governments + PlayerOperations.canStart',
      currentGovernmentType: { ok: true, value: null },
      startingGovernments: { ok: true, value: optionRows.map((row) => ({ GovernmentType: row.governmentType })) },
      action,
      goldenAgeDuration: { ok: true, value: 10 },
      options,
      enabledOptions: options,
      disabledOptions: [],
      notes: [
        'Static fixture mirrors the CLI/HUD contract emitted by the App UI source-backed government choice materializer.',
      ],
    };
    const notification = {
      id: notificationId,
      type: 111,
      typeName: 'NOTIFICATION_CHOOSE_GOVERNMENT',
      groupType: null,
      summary: 'Choose a Government',
      message: 'Choose a government.',
      target: { owner: -1, id: -1, type: 0 },
      location: null,
      canUserDismiss: false,
      expired: false,
      dismissed: false,
      isEndTurnBlocking: true,
      decision: governmentDecision,
      details,
    };
    return {
      localPlayerId: 0,
      turn: { ok: true, value: 10 },
      turnDate: { ok: true, value: '3775 BCE' },
      hasSentTurnComplete: { ok: true, value: false },
      canEndTurn: { ok: true, value: false },
      blocker: { ok: true, value: 0 },
      blockingNotificationId: { ok: true, value: notificationId },
      selectedUnitId: { ok: true, value: null },
      selectedCityId: { ok: true, value: null },
      firstReadyUnitId: { ok: true, value: null },
      notifications: [notification],
      decisions: [governmentDecision],
      hud: {
        nextDecision: {
          notificationId: notification.id,
          isEndTurnBlocking: true,
          typeName: notification.typeName,
          summary: notification.summary,
          message: notification.message,
          target: notification.target,
          location: notification.location,
          details: notification.details,
          ...governmentDecision,
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
            details: notification.details,
            ...governmentDecision,
          },
        ],
      },
      limits: { maxNotifications: 25, truncated: false },
    };
  }
  if (mode === 'tradition-review') {
    const traditionDecision = {
      category: 'tradition-review',
      operationFamily: 'player-operation',
      operationType: 'CHANGE_TRADITION',
      argsShape: '{ TraditionType, Action } then CONSIDER_ASSIGN_TRADITIONS {}',
      cli: 'game play traditions',
      requiredInputs: [
        {
          name: 'TraditionType',
          source: 'live tradition chooser',
          required: true,
          note: 'Pick the tradition enum that is being activated or deactivated.',
        },
        {
          name: 'Action',
          source: 'live tradition action',
          required: true,
          note: 'Use the activate/deactivate action enum from the tradition UI.',
        },
      ],
      commonActions: [
        {
          label: 'read tradition options',
          cli: 'game play traditions --compact --json',
          argsShape: 'active and available traditions with action templates',
          when: 'before choosing a tradition activation or deactivation',
        },
      ],
      confidence: 'live-proof',
      notes: ['Full slots may need deactivate, activate, then closeout; read the live tradition packet first.'],
    };
    const notificationId = { owner: 0, id: 92, type: 20 };
    const notification = {
      id: notificationId,
      type: 12345,
      typeName: 'NOTIFICATION_CONSIDER_TRADITIONS',
      groupType: null,
      summary: 'Review your Traditions',
      message: 'A new Tradition slot or Tradition option is available.',
      target: { owner: -1, id: -1, type: 0 },
      location: null,
      canUserDismiss: false,
      expired: false,
      dismissed: false,
      isEndTurnBlocking: true,
      decision: traditionDecision,
    };
    return {
      localPlayerId: 0,
      turn: { ok: true, value: 79 },
      turnDate: { ok: true, value: '2050 BCE' },
      hasSentTurnComplete: { ok: true, value: false },
      canEndTurn: { ok: true, value: false },
      blocker: { ok: true, value: 23669119 },
      blockingNotificationId: { ok: true, value: notificationId },
      selectedUnitId: { ok: true, value: null },
      selectedCityId: { ok: true, value: null },
      firstReadyUnitId: { ok: true, value: null },
      notifications: [notification],
      decisions: [traditionDecision],
      hud: {
        nextDecision: {
          notificationId: notification.id,
          isEndTurnBlocking: true,
          typeName: notification.typeName,
          summary: notification.summary,
          message: notification.message,
          target: notification.target,
          location: notification.location,
          ...traditionDecision,
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
            ...traditionDecision,
          },
        ],
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
  if (mode === 'unit-lost-report') {
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
      notes: ['Default-handler unit-loss report; review before closeout.'],
    };
    const informationalNotification = {
      id: { owner: 0, id: 34, type: 20 },
      type: -2086317464,
      typeName: 'NOTIFICATION_UNIT_LOST',
      groupType: null,
      summary: 'While defending, your Scout was destroyed by a Warrior from Samarkand (44 damage)!',
      message: 'Unit Lost',
      target: { owner: -1, id: -1, type: 0 },
      location: { x: 5, y: 18 },
      canUserDismiss: true,
      expired: false,
      dismissed: false,
      isEndTurnBlocking: true,
      decision: informationalDecision,
    };
    return {
      localPlayerId: 0,
      turn: { ok: true, value: 19 },
      turnDate: { ok: true, value: '3550 BCE' },
      hasSentTurnComplete: { ok: true, value: false },
      canEndTurn: { ok: true, value: false },
      blocker: { ok: true, value: 0 },
      blockingNotificationId: { ok: true, value: informationalNotification.id },
      selectedUnitId: { ok: true, value: null },
      selectedCityId: { ok: true, value: null },
      firstReadyUnitId: { ok: true, value: { owner: 0, id: 458754, type: 26 } },
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
  if (mode === 'legacy-completed') {
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
          label: 'dismiss reviewed legacy completion report',
          cli: "game play dismiss-notification --target '<notification-id>' --send --reason '<why this legacy completion report was reviewed>'",
          operationFamily: 'app-ui-action',
          operationType: 'Game.Notifications.dismiss',
          argsShape: '{ notificationId }',
          when: 'after reviewing the completed legacy/triumph report for score context',
        },
        {
          label: 'read current legacy progress',
          cli: 'game play progress-dashboard --compact --json',
          operationFamily: 'read-only',
          operationType: 'progress-dashboard',
          argsShape: 'legacy path scores and age progress',
          when: 'when the report should be compared with local-player progress before dismissal',
        },
      ],
      confidence: 'official-ui',
      notes: ['Runtime legacy completion report; review score context before closeout.'],
    };
    const legacyNotification = {
      id: { owner: 0, id: 77, type: 20 },
      type: -667238339,
      typeName: 'NOTIFICATION_LEGACY_COMPLETED',
      groupType: null,
      summary: 'An unmet Player has completed the Triumph "Yokol-kab".',
      message: 'Triumph Completed',
      target: { owner: -1, id: -1, type: 0 },
      location: { x: -9999, y: -9999 },
      canUserDismiss: true,
      expired: false,
      dismissed: false,
      isEndTurnBlocking: false,
      decision: informationalDecision,
    };
    return {
      localPlayerId: 0,
      turn: { ok: true, value: 1 },
      turnDate: { ok: true, value: '4000 BCE' },
      hasSentTurnComplete: { ok: true, value: false },
      canEndTurn: { ok: true, value: false },
      blocker: { ok: true, value: -513644209 },
      blockingNotificationId: { ok: true, value: null },
      selectedUnitId: { ok: true, value: null },
      selectedCityId: { ok: true, value: null },
      firstReadyUnitId: { ok: true, value: null },
      notifications: [legacyNotification],
      decisions: [informationalDecision],
      hud: {
        nextDecision: null,
        decisionQueue: [
          {
            notificationId: legacyNotification.id,
            isEndTurnBlocking: false,
            typeName: legacyNotification.typeName,
            summary: legacyNotification.summary,
            message: legacyNotification.message,
            target: legacyNotification.target,
            location: legacyNotification.location,
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
  if (mode === 'diplomatic-action-report') {
    const notificationId = { owner: 0, id: 118, type: 20 };
    const details = {
      kind: 'diplomatic-action-report',
      classification: 'diplomatic-action-report-no-enabled-response-options',
      actionId: 34,
      notificationId,
      eventData: {
        ok: true,
        value: {
          actionTypeName: 'DIPLOMACY_ACTION_LAND_CLAIM',
          initialPlayer: 2,
          targetPlayer: -1,
          canOppose: true,
          gameTurnStart: 36,
          gameTurnEnd: 36,
          responseType: 920806707,
        },
      },
      responseData: { ok: true, value: { responseList: [] } },
      responseOptionCount: 0,
      enabledResponseOptionCount: 0,
      options: [],
      enabledOptions: [],
      disabledOptions: [],
      notes: [
        'NOTIFICATION_DIPLOMATIC_ACTION uses the official InvestigateDiplomaticAction handler. Its target can be a real diplomatic event id, but that alone is not proof of a response-required operation.',
        'When getResponseDataForUI(actionId).responseList is empty or no options validate, treat this as a reviewed diplomatic action report closeout, not RESPOND_DIPLOMATIC_ACTION.',
      ],
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
          label: 'dismiss reviewed diplomatic action report',
          cli: "game play dismiss-notification --target '<notification-id>' --send --reason '<why this diplomatic report was reviewed>'",
          operationFamily: 'app-ui-action',
          operationType: 'Game.Notifications.dismiss',
          argsShape: '{ notificationId }',
          when: 'after reviewing the event data/location and confirming getResponseDataForUI exposes no enabled response option',
        },
      ],
      confidence: 'official-ui',
      notes: ['NOTIFICATION_DIPLOMATIC_ACTION can point at a real diplomatic event id, but empty/no-enabled getResponseDataForUI options make it a reviewed report closeout rather than RESPOND_DIPLOMATIC_ACTION.'],
    };
    const notification = {
      id: notificationId,
      type: 96575930,
      typeName: 'NOTIFICATION_DIPLOMATIC_ACTION',
      groupType: -1225125244,
      player: null,
      summary: 'Another Civilization settled a new Town nearby.',
      message: 'New Settlement Nearby',
      target: { owner: 2, id: 34, type: 34 },
      location: { x: 3, y: 46 },
      canUserDismiss: true,
      expired: false,
      dismissed: false,
      isEndTurnBlocking: true,
      decision: informationalDecision,
      details,
    };
    return {
      localPlayerId: 0,
      turn: { ok: true, value: 37 },
      turnDate: { ok: true, value: '3100 BCE' },
      hasSentTurnComplete: { ok: true, value: false },
      canEndTurn: { ok: true, value: false },
      blocker: { ok: true, value: 0 },
      blockingNotificationId: { ok: true, value: notification.id },
      selectedUnitId: { ok: true, value: null },
      selectedCityId: { ok: true, value: null },
      firstReadyUnitId: { ok: true, value: { owner: 0, id: 327682, type: 26 } },
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
          player: notification.player,
          details,
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
            player: notification.player,
            details,
            ...informationalDecision,
          },
        ],
      },
      limits: { maxNotifications: 25, truncated: false },
    };
  }
  if (mode === 'stale-unit-command' || mode === 'stale-unit-command-disabled' || mode === 'stale-unit-command-pending') {
    const hasEnabledCloseout = mode === 'stale-unit-command';
    const hasSentTurnComplete = mode === 'stale-unit-command-pending';
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
    const commandUnitsNotificationId = { owner: 0, id: 88, type: 20 };
    const closeoutUnitIds = hasEnabledCloseout
      ? [{ owner: 0, id: 196609, type: 26 }]
      : [
          { owner: 0, id: 131072, type: 26 },
          { owner: 0, id: 196609, type: 26 },
          { owner: 0, id: 262146, type: 26 },
        ];
    const closeoutCandidates = closeoutUnitIds.map((unitId, index) => {
      const enabled = hasEnabledCloseout;
      return {
        unitId,
        unit: {
          ok: true,
          value: {
            id: unitId,
            owner: 0,
            type: index === 1 ? 111 : 77,
            typeName: index === 1 ? 'UNIT_HOPLITE' : 'UNIT_SCOUT',
            name: index === 1 ? 'Hoplite' : 'Scout',
            location: index === 0 ? { x: 18, y: 30 } : index === 1 ? { x: 21, y: 26 } : { x: 16, y: 25 },
            movementMovesRemaining: 0,
            movementTurnsRemaining: 0,
            attacksRemaining: index === 1 ? 1 : 0,
            activity: index === 1 ? 'UNIT_ACTIVITY_FORTIFIED' : 'UNIT_ACTIVITY_AWAKE',
          },
        },
        operationFamily: 'unit-operation',
        operationType: 'SKIP_TURN',
        argsShape: '{}',
        enabled,
        validation: enabled
          ? { ok: true, value: { Success: true } }
          : { ok: true, value: { Success: false, FailureReasons: ['no movement remaining'] } },
        cli: enabled
          ? `game play operation --family unit --type SKIP_TURN --unit-id '${JSON.stringify(unitId)}' --send --reason '<why this unit has no better operation this turn>'`
          : null,
      };
    });
    const enabledCloseoutCandidates = closeoutCandidates.filter((candidate) => candidate.enabled);
    const commandUnitsDetails = {
      kind: 'unit-command-reconciliation',
      classification: hasEnabledCloseout ? 'unit-command-closeout-candidates' : 'unit-command-stale-expired',
      notificationId: commandUnitsNotificationId,
      blocker: { ok: true, value: 0 },
      hasSentTurnComplete: { ok: true, value: hasSentTurnComplete },
      selectedUnitId: { ok: true, value: null },
      firstReadyUnitId: { ok: true, value: null },
      unitScan: { ok: true, value: closeoutUnitIds },
      closeoutCandidates,
      enabledCloseoutCandidates,
      staleReadyPointerSuspected: hasEnabledCloseout,
      staleExpiredWithoutEnabledCloseout: !hasEnabledCloseout,
      repairCandidates: hasEnabledCloseout
        ? []
        : [
            hasSentTurnComplete
              ? {
                  kind: 'wait-for-turn-advance',
                  cli: 'game watch --count 3 --interval-ms 1000 --include-ready-unit --include-ready-city --jsonl',
                  proof: 'GameContext.hasSentTurnComplete is already true; wait/watch instead of repeating unit operations.',
                }
              : {
                  kind: 'send-turn-complete',
                  cli: "game play end-turn --send --reason '<stale COMMAND_UNITS has no selected/ready unit and no enabled validator-backed unit closeout>' --json",
                  proof: 'No selected/ready unit exists and every scanned unit closeout is disabled.',
                },
          ],
      notes: [
        'Static fixture mirrors the CLI/HUD contract emitted by the App UI source-backed COMMAND_UNITS reconciliation materializer.',
        'Use these candidates only as unit-command reconciliation; movement, attack, promotion, fortify, and automation require their own validators.',
      ],
    };
    const commandUnitsNotification = {
      id: commandUnitsNotificationId,
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
      details: commandUnitsDetails,
    };
    return {
      localPlayerId: 0,
      turn: { ok: true, value: 80 },
      turnDate: { ok: true, value: '2025 BCE' },
      hasSentTurnComplete: { ok: true, value: hasSentTurnComplete },
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
          details: commandUnitsNotification.details,
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
            details: commandUnitsNotification.details,
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

function cleanReadyCityView() {
  return {
    localPlayerId: 0,
    requestedCityId: null,
    selectedCityId: { ok: true, value: null },
    blockingCityId: { ok: true, value: null },
    cityId: null,
    city: { ok: true, value: null },
    legalOperations: [],
    productionCandidates: { ok: true, value: [] },
    townFocusOptions: { ok: true, value: [] },
    populationPlacement: { ok: true, value: null },
    notes: ['No ready city in clean-read fixture.'],
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

function notificationDismissal(send: boolean, mode: 'verified' | 'stale-nonblocking' | 'engine-front-train-absent' | 'engine-front-dismissed' = 'verified', settled = false) {
  const notificationId = { owner: 0, id: 113, type: 20 };
  const isStaleNonblocking = mode === 'stale-nonblocking';
  const isEngineFrontTrainAbsent = mode === 'engine-front-train-absent';
  const before = {
    id: notificationId,
    exists: true,
    type: isStaleNonblocking ? -2117069996 : 2091697919,
    typeName: isStaleNonblocking ? 'NOTIFICATION_CULTURE_TREE_REVEALED' : 'NOTIFICATION_WONDER_COMPLETED',
    summary: isStaleNonblocking
      ? 'A new culture tree has been revealed.'
      : 'An unmet player has finished constructing the World Wonder Great Stele.',
    message: isStaleNonblocking ? 'Culture Tree Revealed' : 'Wonder Completed',
    target: { owner: -1, id: -1, type: 0 },
    location: { x: -9999, y: -9999 },
    canUserDismiss: true,
    expired: false,
    dismissed: false,
    blocksTurnAdvancement: { ok: true, value: !isStaleNonblocking },
    endTurnBlockingType: { ok: true, value: isStaleNonblocking ? 0 : 2091697919 },
    isEndTurnBlocking: { ok: true, value: !isStaleNonblocking },
    engineQueueCount: { ok: true, value: 1 },
    engineQueueContains: { ok: true, value: true },
    engineQueueFirstId: { ok: true, value: notificationId },
    isEngineQueueFront: { ok: true, value: true },
    notificationTrainCount: { ok: true, value: isEngineFrontTrainAbsent ? 0 : 1 },
    notificationTrainContains: { ok: true, value: !isEngineFrontTrainAbsent },
    notificationTrainFirstId: { ok: true, value: isEngineFrontTrainAbsent ? null : notificationId },
    isNotificationTrainFront: { ok: true, value: !isEngineFrontTrainAbsent },
  };
  const dismissed = isStaleNonblocking
    ? before
    : isEngineFrontTrainAbsent
      ? before
    : {
        ...before,
        exists: false,
        dismissed: true,
        blocksTurnAdvancement: { ok: true, value: false },
        endTurnBlockingType: { ok: true, value: 0 },
        isEndTurnBlocking: { ok: true, value: false },
        engineQueueCount: { ok: true, value: 0 },
        engineQueueContains: { ok: true, value: false },
        engineQueueFirstId: { ok: true, value: null },
        isEngineQueueFront: { ok: true, value: false },
        notificationTrainCount: { ok: true, value: 0 },
        notificationTrainContains: { ok: true, value: false },
        notificationTrainFirstId: { ok: true, value: null },
        isNotificationTrainFront: { ok: true, value: false },
      };
  const engineFrontDismissed = {
    ...before,
    dismissed: true,
  };
  const current = settled && !send
    ? mode === 'engine-front-dismissed'
      ? engineFrontDismissed
      : dismissed
    : before;
  return {
    notificationId,
    before: current,
    after: send ? before : null,
    canDismiss: true,
    sent: send,
    closeoutPath: send
      ? isStaleNonblocking
        ? 'NotificationModel.manager.dismiss+Game.Notifications.dismiss'
        : 'NotificationModel.manager.dismiss'
      : null,
    result: send
      ? {
          notificationTrainManager: {
            ok: true,
            attempted: true,
            available: true,
            path: 'NotificationModel.manager.dismiss',
          },
          panelCloseControl: isStaleNonblocking
            ? {
                ok: true,
                attempted: true,
                available: true,
                path: 'Game.Notifications.dismiss',
                value: false,
              }
            : {
                ok: false,
                attempted: false,
                available: false,
                path: 'Game.Notifications.dismiss',
                reason: 'official panel close control does not dismiss the active end-turn blocker',
              },
        }
      : null,
    verificationAttempts: send ? [before] : [],
    verified: false,
    notes: [
      'This is an App UI notification action, not a gameplay operation family.',
      'Send mode records both official actor routes: notification-train manager dismissal and the visible panel close-control dismissal when that route is available for this item.',
      'Verification is identity-based: disappeared, dismissed, removed from the engine queue or notification train, or moved off a front position it occupied before send. Non-blocking status alone is not proof.',
      'The embedded App UI action records immediate route evidence. The direct-control wrapper performs final verification across separate App UI reads so frame-driven queues can advance.',
    ],
  };
}

function diplomacyResponseCloseout() {
  const notificationId = { owner: 0, id: 19, type: 20 };
  return {
    localPlayerId: 0,
    playerId: 0,
    actionId: 8,
    responseType: 926305338,
    args: { ID: 8, Type: 926305338 },
    notificationId,
    discoveredNotification: { ok: true, value: notificationId },
    activated: true,
    activationResult: {
      ok: true,
      value: {
        found: true,
        target: { owner: 2, id: 8, type: 34 },
        activated: true,
        currentProjectReactionDataActionID: 8,
      },
    },
    canStart: { ok: true, value: { Success: true } },
    sent: true,
    sendResult: { ok: true, value: true },
    uiCloseout: {
      requested: true,
      acknowledgeStarted: { ok: true, value: undefined },
      closeCurrentDiplomacyProject: { ok: true, value: undefined },
      hide: { ok: true, value: undefined },
    },
    diplomacyState: {
      before: {
        currentProjectReactionDataActionID: 8,
        currentProjectReactionRequestActionID: 8,
        interfaceMode: { ok: true, value: 'INTERFACEMODE_DIPLOMACY_PROJECT_REACTION' },
      },
      after: {
        currentProjectReactionDataActionID: null,
        currentProjectReactionRequestActionID: null,
        interfaceMode: { ok: true, value: 'INTERFACEMODE_DEFAULT' },
      },
    },
    notes: ['This follows the official response-panel path more closely than a raw player-operation send.'],
  };
}

function technologyChoiceCloseout() {
  return {
    localPlayerId: 0,
    playerId: 0,
    node: -1255676052,
    notificationId: { owner: 0, id: 52, type: 20 },
    beforeTechnology: {
      currentResearching: { ok: true, value: null },
      targetNode: { ok: true, value: null },
    },
    activationResult: { ok: true, value: true },
    canChoose: { ok: true, value: { Success: true } },
    chooseResult: { ok: true, value: true },
    canClearTarget: { ok: true, value: { Success: true } },
    clearTargetResult: { ok: true, value: true },
    afterTechnology: {
      currentResearching: { ok: true, value: -1255676052 },
      targetNode: { ok: true, value: -1 },
    },
    sent: true,
    notes: [
      'This uses the App UI owner for technology chooser closeout; notification re-read remains the caller-level verifier.',
    ],
  };
}

function cultureChoiceCloseout() {
  return {
    localPlayerId: 0,
    playerId: 0,
    node: -1404789184,
    notificationId: { owner: 0, id: 62, type: 20 },
    beforeCulture: {
      currentResearching: { ok: true, value: null },
      targetNode: { ok: true, value: null },
      availableNodeTypes: { ok: true, value: [-869902342, -1404789184, 1643868894] },
    },
    activationResult: { ok: true, value: true },
    canChoose: { ok: true, value: { Success: true } },
    chooseResult: { ok: true, value: true },
    canClearTarget: { ok: true, value: { Success: true } },
    clearTargetResult: { ok: true, value: true },
    afterCulture: {
      currentResearching: { ok: true, value: -1404789184 },
      targetNode: { ok: true, value: -1 },
      availableNodeTypes: { ok: true, value: [-869902342, -1404789184, 1643868894] },
    },
    sent: true,
    notes: [
      'This uses the App UI owner for culture chooser closeout; notification re-read remains the caller-level verifier.',
    ],
  };
}

function narrativeChoicePayload(mode: 'panel-cleared' | 'panel-cleared-blocker-live' | 'stale' = 'panel-cleared') {
  const target = { owner: 0, id: 25, type: 35 };
  const beforePanel = {
    panelCount: 1,
    panels: [
      {
        panelType: 'SMALL-NARRATIVE-EVENT',
        componentType: 'SmallNarrativeEvent',
        targetStoryId: target,
        storyType: 'DISCOVERY',
        choiceKeys: ['DISCOVERY_14001B', 'DISCOVERY_14001C'],
      },
    ],
    matchingPanelCount: 1,
    matchingPanels: [
      {
        panelType: 'SMALL-NARRATIVE-EVENT',
        componentType: 'SmallNarrativeEvent',
        targetStoryId: target,
        storyType: 'DISCOVERY',
        choiceKeys: ['DISCOVERY_14001B', 'DISCOVERY_14001C'],
      },
    ],
    popupShowing: { ok: true, value: true },
    currentNarrativeData: { ok: true, value: { storyID: 25, type: 2, playerID: 0 } },
  };
  const afterPanel = mode === 'stale'
    ? beforePanel
    : {
        panelCount: 0,
        panels: [],
        matchingPanelCount: 0,
        matchingPanels: [],
        popupShowing: { ok: true, value: false },
        currentNarrativeData: { ok: true, value: null },
      };
  return {
    localPlayerId: 0,
    playerId: 0,
    args: { TargetType: 'DISCOVERY_14001B', Target: target, Action: -1326475004 },
    canStart: { ok: true, value: { Success: true } },
    sent: true,
    sendResult: { ok: true, value: true },
    ui: {
      before: beforePanel,
      after: afterPanel,
      panelClose: mode === 'stale'
        ? { ok: true, value: { attempted: 1, results: [{ panelType: 'SMALL-NARRATIVE-EVENT', closed: false }] } }
        : { ok: true, value: { attempted: 1, results: [{ panelType: 'SMALL-NARRATIVE-EVENT', closed: true }] } },
      popupClose: { ok: true, value: { available: true } },
    },
    notes: [
      'This mirrors the official narrative button handler: CHOOSE_NARRATIVE_STORY_DIRECTION, NarrativePopupManager.closePopup, and visible narrative panel close.',
    ],
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

function productionPostconditionSnapshot(
  phase: 'before' | 'after',
  mode: 'cleared' | 'blocker-still-live',
) {
  const cityId = { owner: 0, id: 65536, type: 25 };
  const notification = {
    id: { owner: 0, id: 6, type: 20 },
    type: 1090224621,
    typeName: 'NOTIFICATION_CHOOSE_CITY_PRODUCTION',
    target: cityId,
    matchesCity: true,
    canUserDismiss: false,
    expired: true,
    dismissed: false,
  };
  return {
    cityId,
    city: {
      ok: true,
      value: {
        id: cityId,
        population: 3,
        isTown: false,
        location: { x: 26, y: 36 },
      },
    },
    buildQueue: {
      ok: true,
      value: {
        currentProductionTypeHash: phase === 'before' ? 713967338 : 1558890441,
        previousProductionTypeHash: 0,
        productionProgress: phase === 'before' ? 12 : 0,
        turnsLeftForRequestedItem: phase === 'before' ? -1 : 4,
        queueLength: 1,
      },
    },
    selectedCityId: { ok: true, value: phase === 'before' ? cityId : null },
    blocker: { ok: true, value: mode === 'cleared' && phase === 'after' ? 0 : 1090224621 },
    canEndTurn: { ok: true, value: mode === 'cleared' && phase === 'after' },
    blockingProductionNotification: {
      ok: true,
      value: mode === 'blocker-still-live' || phase === 'before' ? notification : null,
    },
  };
}

function productionChoicePayload(
  send: boolean,
  mode: 'cleared' | 'blocker-still-live',
  settled = false,
) {
  const cityId = { owner: 0, id: 65536, type: 25 };
  const before = productionPostconditionSnapshot('before', mode);
  const after = productionPostconditionSnapshot(settled || send ? 'after' : 'before', mode);
  return {
    cityId,
    args: { UnitType: 1558890441 },
    beforeValidation: { ok: true, value: { Success: true } },
    afterValidation: { ok: true, value: { Success: true } },
    sent: send,
    sendResult: send ? { ok: true, value: true } : { ok: false, skipped: true, reason: 'send not requested' },
    beforeProductionPostcondition: before,
    afterProductionPostcondition: after,
    ui: {
      cityActivation: send ? { ok: true, value: { selectedCityId: cityId } } : { ok: false, skipped: true, reason: 'read-only production choice status' },
      interfaceClose: send ? { ok: true, value: { selectedCityId: null, interfaceMode: 'INTERFACEMODE_DEFAULT' } } : { ok: false, skipped: true, reason: 'send not requested' },
    },
    notes: ['This mirrors the official production chooser path.'],
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
  if (operationType === 'CHANGE_GOVERNMENT') return { GovernmentType: 0, Action: -1326475004 };
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
