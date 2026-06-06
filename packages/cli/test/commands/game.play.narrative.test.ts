import { describe, expect, test, vi } from 'vitest';
import GamePlayChooseNarrative from '../../src/commands/game/play/choose-narrative';
import { type FakeTunerServer, startFakeTunerServer } from './fixtures/tuner-socket-server';

describe('game play narrative commands', () => {
  test('wraps narrative story direction choice', async () => {
    const server = await startNarrativeTunerServer();
    try {
      const { port } = server.address();
      await runCommand(GamePlayChooseNarrative, [
        '--host',
        '127.0.0.1',
        '--port',
        String(port),
        '--player-id',
        '2',
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
    const server = await startNarrativeTunerServer({ playNotificationMode: 'narrative-choice-visible-panel' });
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
        '--target-type',
        'DISCOVERY_14001B',
        '--target',
        '{"owner":0,"id":25,"type":35}',
        '--action',
        '-1326475004',
        '--send',
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        result: NarrativeChoiceSendResult;
      };
      expect(payload.result.sent).toBe(true);
      expect(payload.result.status).toBe('sent-confirmed');
      expect(payload.result.playerId).toBe(0);
      expect(payload.result.targetType).toBe('DISCOVERY_14001B');
      expect(payload.result.target).toEqual({ owner: 0, id: 25, type: 35 });
      expect(payload.result.action).toBe(-1326475004);
      expect(payload.result.validation).toEqual({ beforeValid: true, afterValid: true });
      expect(payload.result.postcondition.classification).toBe('narrative-blocker-cleared');
      expect(payload.result.postcondition).toMatchObject({
        outcome: 'cleared',
        confidence: 'confirmed',
        confirmed: true,
        noRepeatAfterUnverified: false,
      });
      expect(payload.result.nextSteps[0]).toMatchObject({
        kind: 'refresh-attention',
        source: 'narrative.choice.request',
      });
      expectSemanticNarrativeChoiceOmitsRawRuntimeDetails(payload.result);
      expect(server.received.some((message) => message.includes('sendNarrativeChoice'))).toBe(true);
      expect(server.received.some((message) => message.includes('NarrativePopupManager.closePopup'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation("player-operation"'))).toBe(false);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('does not verify narrative sends when blocker and panel remain live', async () => {
    const server = await startNarrativeTunerServer({
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
        '--target-type',
        'DISCOVERY_14001C',
        '--target',
        '{"owner":0,"id":25,"type":35}',
        '--action',
        '-1326475004',
        '--timeout-ms',
        '1000',
        '--send',
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        result: NarrativeChoiceSendResult;
      };
      expect(payload.result.sent).toBe(true);
      expect(payload.result.status).toBe('sent-unverified');
      expect(payload.result.postcondition.classification).toBe('no-state-change');
      expect(payload.result.postcondition.reason).toContain('same narrative blocker remained live');
      expect(payload.result.postcondition).toMatchObject({
        outcome: 'no-state-change',
        confidence: 'unverified',
        confirmed: false,
        noRepeatAfterUnverified: true,
      });
      expect(payload.result.nextSteps[0]).toMatchObject({
        kind: 'do-not-repeat',
        source: 'narrative.choice.request',
      });
      expectSemanticNarrativeChoiceOmitsRawRuntimeDetails(payload.result);
      expect(server.received.some((message) => message.includes('sendNarrativeChoice'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation("player-operation"'))).toBe(false);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('does not verify narrative sends when panel closes but same blocker remains live', async () => {
    const server = await startNarrativeTunerServer({
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
        '--target-type',
        'DISCOVERY_14001C',
        '--target',
        '{"owner":0,"id":25,"type":35}',
        '--action',
        '-1326475004',
        '--timeout-ms',
        '1000',
        '--send',
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        result: NarrativeChoiceSendResult;
      };
      expect(payload.result.sent).toBe(true);
      expect(payload.result.status).toBe('sent-unverified');
      expect(payload.result.postcondition.classification).toBe('no-state-change');
      expect(payload.result.postcondition.reason).toContain('same narrative blocker remained live');
      expect(payload.result.postcondition.noRepeatAfterUnverified).toBe(true);
      expectSemanticNarrativeChoiceOmitsRawRuntimeDetails(payload.result);
      expect(server.received.some((message) => message.includes('sendNarrativeChoice'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation("player-operation"'))).toBe(false);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('reads narrative choice options without requiring target inputs', async () => {
    const server = await startNarrativeTunerServer({ playNotificationMode: 'narrative-choice' });
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
      expect(payload.result.surfaces[0].enabledOptions[0].chooseCli).toContain('game play choose-narrative --target-type CLOSE');
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
    const server = await startNarrativeTunerServer({ playNotificationMode: 'narrative-choice-empty' });
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
        'game play dismiss-notification --target \'{"owner":0,"id":5,"type":20}\' --send',
      );
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('reads visible narrative panel options when story model pending ids are empty', async () => {
    const server = await startNarrativeTunerServer({ playNotificationMode: 'narrative-choice-visible-panel' });
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
});

type NarrativeTunerServer = FakeTunerServer;

type CommandClass = {
  run(args: string[]): Promise<unknown>;
  prototype: { log(message?: string): void };
};

type NarrativeChoiceSendResult = {
  playerId: number;
  targetType: string;
  target: { owner: number; id: number; type?: number };
  action: number;
  sent: boolean;
  status: string;
  validation: { beforeValid: boolean; afterValid: boolean };
  postcondition: {
    classification: string;
    reason: string;
    outcome: string;
    confidence: string;
    confirmed: boolean;
    noRepeatAfterUnverified: boolean;
  };
  nextSteps: Array<{ kind: string; source: string; label: string }>;
};

function expectSemanticNarrativeChoiceOmitsRawRuntimeDetails(result: unknown) {
  const serialized = JSON.stringify(result);
  expect(serialized).not.toContain('"host"');
  expect(serialized).not.toContain('"port"');
  expect(serialized).not.toContain('"state"');
  expect(serialized).not.toContain('"session"');
  expect(serialized).not.toContain('"rawCommand"');
  expect(serialized).not.toContain('"command"');
  expect(serialized).not.toContain('"payload"');
  expect(serialized).not.toContain('"verified"');
  expect(serialized).not.toContain('"ui"');
  expect(serialized).not.toContain('"sendResult"');
  expect(serialized).not.toContain('"panelClose"');
  expect(serialized).not.toContain('"popupClose"');
  expect(serialized).not.toContain('Game.PlayerOperations');
  expect(serialized).not.toContain('sendNarrativeChoice');
}

type PlayNotificationMode = 'narrative-choice' | 'narrative-choice-empty' | 'narrative-choice-visible-panel' | 'ready-unit';
type NarrativeChoiceMode = 'panel-cleared' | 'panel-cleared-blocker-live' | 'stale';

async function runCommand(command: CommandClass, args: string[]) {
  const log = vi.spyOn(command.prototype, 'log').mockImplementation(() => {});
  try {
    await command.run(args);
  } finally {
    log.mockRestore();
  }
}

async function startNarrativeTunerServer(options: {
  playNotificationMode?: PlayNotificationMode;
  narrativeChoiceMode?: NarrativeChoiceMode;
} = {}): Promise<NarrativeTunerServer> {
  let narrativeChoiceSent = false;
  return startFakeTunerServer({
    handle({ message }) {
      if (message.includes('Network.isInSession')) {
        return [JSON.stringify(appUiSnapshot())];
      }
      if (message.includes('evalOk') && message.includes('GameplayMap.getGridWidth')) {
        return [JSON.stringify(tunerHealthSnapshot())];
      }
      if (message.includes('readPlayNotifications')) {
        const playMode = options.playNotificationMode === 'narrative-choice-visible-panel'
          && narrativeChoiceSent
          && (options.narrativeChoiceMode ?? 'panel-cleared') === 'panel-cleared'
          ? 'ready-unit'
          : options.playNotificationMode ?? 'narrative-choice';
        return [JSON.stringify(playNotificationView(playMode))];
      }
      if (message.includes('sendNarrativeChoice')) {
        narrativeChoiceSent = true;
        return [JSON.stringify(narrativeChoicePayload(options.narrativeChoiceMode ?? 'panel-cleared'))];
      }
      if (message.includes('return JSON.stringify(validateOperation')) {
        return [JSON.stringify(operationValidation())];
      }
      return undefined;
    },
  });
}

function appUiSnapshot() {
  return {
    network: {
      isInSession: { ok: true, value: true },
      numPlayers: { ok: true, value: 1 },
      hostPlayerId: { ok: true, value: 0 },
      isConnectedToNetwork: { ok: true, value: true },
      isAuthenticated: { ok: true, value: false },
      isLoggedIn: { ok: true, value: true },
    },
    autoplay: {
      isActive: false,
      turns: -1,
      isPaused: false,
      isPausedOrPending: false,
      observeAsPlayer: -1,
      returnAsPlayer: -1,
    },
    game: {
      turn: 8,
      age: 0,
      maxTurns: 0,
      turnDate: { ok: true, value: '3825 BCE' },
      hash: { ok: true, value: 0 },
    },
    ui: {
      inGame: { ok: true, value: true },
      inShell: { ok: true, value: false },
      inLoading: { ok: true, value: false },
      loadingState: { ok: true, value: 6 },
      loadingStateName: 'WaitingForUIReady',
      canBeginGame: { ok: true, value: true },
      canNotifyUIReady: 'function',
      skipStartButton: { ok: true, value: false },
      automationActive: { ok: true, value: false },
    },
    gameContext: {
      localPlayerID: 0,
      localObserverID: 0,
      hasRequestedPause: { ok: true, value: false },
    },
    players: {
      maxPlayers: 64,
      aliveIds: { ok: true, value: [0] },
      aliveHumanIds: { ok: true, value: [0] },
      numAliveHumans: { ok: true, value: 1 },
    },
    map: {
      width: { ok: true, value: 84 },
      height: { ok: true, value: 54 },
      plotCount: { ok: true, value: 4536 },
      mapSize: { ok: true, value: 0 },
      randomSeed: { ok: true, value: 1 },
    },
  };
}

function tunerHealthSnapshot() {
  return {
    evalOk: 2,
    ready: true,
    globals: {
      Game: 'object',
      Autoplay: 'object',
      GameplayMap: 'object',
      Players: 'object',
      Network: 'undefined',
    },
    turn: { ok: true, value: 8 },
    turnDate: { ok: true, value: '3825 BCE' },
    width: { ok: true, value: 84 },
    height: { ok: true, value: 54 },
    aliveIds: { ok: true, value: [0] },
    aliveHumanIds: { ok: true, value: [0] },
    autoplayActive: { ok: true, value: false },
  };
}

function playNotificationView(mode: PlayNotificationMode = 'narrative-choice') {
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
      hud: { nextDecision: null, decisionQueue: [] },
      limits: { maxNotifications: 25, truncated: false },
    };
  }

  const narrativeDecision = {
    category: 'narrative-choice',
    operationFamily: 'player-operation',
    operationType: 'CHOOSE_NARRATIVE_STORY_DIRECTION',
    argsShape: '{ TargetType, Target, Action }',
    cli: 'game play choose-narrative',
    requiredInputs: [
      {
        name: 'TargetType',
        source: 'live narrative option target type',
        required: true,
        note: 'Official narrative UI sends PlayerOperationParameters.TargetType.',
      },
      {
        name: 'Target',
        source: 'live narrative target story id',
        required: true,
        note: 'Use the story id surfaced by game play choose-narrative --options when available.',
      },
      {
        name: 'Action',
        source: 'live narrative option action',
        required: true,
        note: 'Official narrative UI sends PlayerOperationParameters.Activate.',
      },
    ],
    confidence: 'official-ui',
    followUps: [
      {
        label: 'read narrative options',
        cli: 'game play choose-narrative --options --json',
        argsShape: 'enabled narrative buttons with validation and ready send templates',
        when: 'before choosing a narrative branch or closeout',
      },
    ],
    guardrails: [
      'Do not synthesize TargetType/Target/Action from stale notification ids.',
      'If options are empty, inspect dismissal diagnostics instead of sending a narrative operation.',
    ],
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
      cli: "game play choose-narrative --target-type CLOSE --target '{\"owner\":0,\"id\":45,\"type\":35}' --action -1326475004 --send",
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
      cli: "game play choose-narrative --target-type DISCOVERY_14001B --target '{\"owner\":0,\"id\":25,\"type\":35}' --action -1326475004 --send",
      validateCli: "game play choose-narrative --player-id 0 --target-type DISCOVERY_14001B --target '{\"owner\":0,\"id\":25,\"type\":35}' --action -1326475004 --json",
    },
    {
      source: 'visible-small-narrative-event',
      targetType: 'DISCOVERY_14001C',
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
      cli: "game play choose-narrative --target-type DISCOVERY_14001C --target '{\"owner\":0,\"id\":25,\"type\":35}' --action -1326475004 --send",
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
    omitted: [
      {
        path: 'details[].storyLinks',
        reason: 'omitted from compact CLI output; use raw notification-queue/notifications diagnostics if required',
      },
      {
        path: 'details[].options',
        reason: 'flattened into enabledOptions/disabledOptions',
      },
      {
        path: 'details[].disabledOptions',
        reason: 'flattened into enabledOptions/disabledOptions',
      },
    ],
    dismissalDiagnosticCli: hasMaterializedOptions ? null : "game play dismiss-notification --target '{\"owner\":0,\"id\":5,\"type\":20}' --json",
    unprovenDismissalCli: hasMaterializedOptions ? null : "game play dismiss-notification --target '{\"owner\":0,\"id\":5,\"type\":20}' --send",
    notes: [
      'Static fixture mirrors the CLI/HUD contract emitted by the official story-model narrative choice materializer.',
    ],
  };
  const notification = {
    id: notificationId,
    type: -504330292,
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
    turn: { ok: true, value: 8 },
    turnDate: { ok: true, value: '3825 BCE' },
    hasSentTurnComplete: { ok: true, value: false },
    canEndTurn: { ok: true, value: false },
    blocker: { ok: true, value: -504330292 },
    blockingNotificationId: { ok: true, value: notificationId },
    selectedUnitId: { ok: true, value: null },
    selectedCityId: { ok: true, value: null },
    firstReadyUnitId: { ok: true, value: null },
    notifications: [notification],
    decisions: [narrativeDecision],
    hud: {
      nextDecision: {
        notificationId,
        isEndTurnBlocking: true,
        typeName: notification.typeName,
        summary: notification.summary,
        message: notification.message,
        target: notification.target,
        location: notification.location,
        player: null,
        details,
        ...narrativeDecision,
      },
      decisionQueue: [
        {
          notificationId,
          isEndTurnBlocking: true,
          typeName: notification.typeName,
          summary: notification.summary,
          message: notification.message,
          target: notification.target,
          location: notification.location,
          player: null,
          details,
          ...narrativeDecision,
        },
      ],
    },
    limits: { maxNotifications: 25, truncated: false },
  };
}

function narrativeChoicePayload(mode: NarrativeChoiceMode = 'panel-cleared') {
  const target = { owner: 0, id: 25, type: 35 };
  const beforePanel = {
    matchingPanelCount: 1,
    panels: [
      {
        index: 0,
        panelType: 'SMALL-NARRATIVE-EVENT',
        targetStoryId: target,
        isActive: true,
        isVisible: true,
      },
    ],
  };
  const afterPanel = mode === 'stale'
    ? beforePanel
    : {
        matchingPanelCount: 0,
        panels: [],
      };
  return {
    localPlayerId: 0,
    playerId: 0,
    operationType: 'CHOOSE_NARRATIVE_STORY_DIRECTION',
    args: {
      TargetType: 'DISCOVERY_14001B',
      Target: target,
      Action: -1326475004,
    },
    canStart: { ok: true, value: { Success: true } },
    sent: true,
    sendResult: { ok: true, value: true },
    ui: {
      before: beforePanel,
      panelClose: mode === 'stale'
        ? { ok: true, value: { attempted: 1, results: [{ panelType: 'SMALL-NARRATIVE-EVENT', closed: false }] } }
        : { ok: true, value: { attempted: 1, results: [{ panelType: 'SMALL-NARRATIVE-EVENT', closed: true }] } },
      popupClose: { ok: true, value: { available: true } },
      after: afterPanel,
    },
    notes: [
      'This mirrors the official narrative button handler: CHOOSE_NARRATIVE_STORY_DIRECTION, NarrativePopupManager.closePopup, and visible narrative panel close.',
    ],
  };
}

function operationValidation() {
  return {
    host: '127.0.0.1',
    port: 0,
    state: { id: '1', name: 'Tuner', role: 'tuner' },
    family: 'player-operation',
    operationType: 'CHOOSE_NARRATIVE_STORY_DIRECTION',
    enumValue: 'CHOOSE_NARRATIVE_STORY_DIRECTION',
    target: { playerId: 0 },
    args: {
      TargetType: 'TOT_30001B',
      Target: { owner: 0, id: 45, type: 35 },
      Action: -1326475004,
    },
    valid: true,
    result: { Success: true },
  };
}
