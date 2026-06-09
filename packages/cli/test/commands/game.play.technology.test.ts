import { describe, expect, test, vi } from 'vitest';
import GamePlayChooseTech from '../../src/commands/game/play/choose-tech';
import GamePlaySetTechTarget from '../../src/commands/game/play/set-tech-target';
import { expectNormalPlayPayloadToOmitDebugInternals } from './game/play/normal-output-boundary';
import { type FakeTunerServer, startFakeTunerServer } from './fixtures/tuner-socket-server';

describe('game play technology commands', () => {
  test('wraps technology choice as SET_TECH_TREE_NODE', async () => {
    const server = await startTechnologyTunerServer();
    try {
      const { port } = server.address();
      await runCommand(GamePlayChooseTech, [
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
    const server = await startTechnologyTunerServer({ playNotificationMode: 'tech-choice' });
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
      expectNormalPlayPayloadToOmitDebugInternals(payload);
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
    const server = await startTechnologyTunerServer();
    try {
      const { port } = server.address();
      await runCommand(GamePlaySetTechTarget, [
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
    const server = await startTechnologyTunerServer({ playNotificationMode: 'tech-choice' });
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
    const server = await startTechnologyTunerServer({
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
    const server = await startTechnologyTunerServer({
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
});

type TechnologyTunerServer = FakeTunerServer;

type CommandClass = {
  run(args: string[]): Promise<unknown>;
  prototype: { log(message?: string): void };
};

async function runCommand(command: CommandClass, args: string[]) {
  const log = vi.spyOn(command.prototype, 'log').mockImplementation(() => {});
  try {
    await command.run(args);
  } finally {
    log.mockRestore();
  }
}

async function startTechnologyTunerServer(options: {
  playNotificationMode?: 'tech-choice';
  technologyChoiceMode?: 'cleared' | 'sticky' | 'state-changed';
} = {}): Promise<TechnologyTunerServer> {
  let technologyChoiceSent = false;
  return startFakeTunerServer({
    handle({ message }) {
      if (message.includes('readPlayNotifications')) {
        const playMode = options.playNotificationMode === 'tech-choice'
          && technologyChoiceSent
          && (options.technologyChoiceMode ?? 'cleared') === 'cleared'
          ? 'ready-unit'
          : options.playNotificationMode ?? 'ready-unit';
        return [JSON.stringify(playNotificationView(
          playMode,
          technologyChoiceSent && options.technologyChoiceMode === 'state-changed',
        ))];
      }
      if (message.includes('sendTechnologyChoiceCloseout')) {
        technologyChoiceSent = true;
        return [JSON.stringify(technologyChoiceCloseout())];
      }
      if (message.includes('return JSON.stringify(validateOperation')) {
        return [JSON.stringify(operationValidation(message))];
      }
      return undefined;
    },
  });
}

function operationValidation(message: string) {
  const operationType = operationTypeFromMessage(message);
  return {
    host: '127.0.0.1',
    port: 0,
    state: { id: '1', name: 'Tuner', role: 'tuner' },
    family: 'player-operation',
    operationType,
    enumValue: operationType,
    target: { playerId: 0 },
    args: { ProgressionTreeNodeType: -1255676052 },
    valid: true,
    result: { Success: true },
  };
}

function operationTypeFromMessage(message: string) {
  const callIndex = message.lastIndexOf('validateOperation("');
  const callSource = callIndex >= 0 ? message.slice(callIndex) : message;
  return callSource.match(/"operationType":"([^"]+)"/)?.[1] ?? 'SET_TECH_TREE_NODE';
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

function playNotificationView(mode: 'tech-choice' | 'ready-unit', technologyStateChanged = false) {
  if (mode === 'ready-unit') {
    return {
      localPlayerId: 0,
      turn: { ok: true, value: 19 },
      turnDate: { ok: true, value: '3550 BCE' },
      hasSentTurnComplete: { ok: true, value: false },
      canEndTurn: { ok: true, value: false },
      blocker: { ok: true, value: 23669119 },
      blockingNotificationId: { ok: true, value: { owner: 0, id: 42, type: 20 } },
      selectedUnitId: { ok: true, value: null },
      selectedCityId: { ok: true, value: null },
      firstReadyUnitId: { ok: true, value: { owner: 0, id: 131072, type: 26 } },
      notifications: [],
      decisions: [],
      hud: { nextDecision: null, decisionQueue: [] },
      limits: { maxNotifications: 25, truncated: false },
    };
  }

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
