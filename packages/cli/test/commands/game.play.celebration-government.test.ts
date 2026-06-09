import { describe, expect, test, vi } from 'vitest';
import GamePlayChooseCelebration from '../../src/commands/game/play/choose-celebration';
import GamePlayChooseGovernment from '../../src/commands/game/play/choose-government';
import { expectNormalPlayPayloadToOmitDebugInternals } from './game/play/normal-output-boundary';
import { type FakeTunerServer, startFakeTunerServer } from './fixtures/tuner-socket-server';

describe('game play celebration and government commands', () => {
  test('wraps celebration choice as CHOOSE_GOLDEN_AGE', async () => {
    const server = await startCelebrationGovernmentTunerServer();
    try {
      const { port } = server.address();
      await runCommand(GamePlayChooseCelebration, [
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

  test('routes celebration sends through government oRPC with local-player evidence', async () => {
    const server = await startCelebrationGovernmentTunerServer();
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
        '--golden-age-type',
        '-340825966',
        '--send',
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        result: GovernmentChoiceSendResult;
      };
      expect(payload.result).toMatchObject({
        playerId: 0,
        goldenAgeType: -340825966,
        sent: true,
        status: 'sent-unverified',
        validation: {
          beforeValid: true,
          afterValid: true,
        },
        postcondition: {
          classification: 'pending-runtime-proof',
          outcome: 'unknown',
          confidence: 'pending-runtime-proof',
          confirmed: false,
          noRepeatAfterUnverified: true,
        },
      });
      expect(payload.result.nextSteps[0]).toMatchObject({
        kind: 'do-not-repeat',
        source: 'government.celebration.choice.request',
      });
      expectSemanticGovernmentChoiceOmitsRawRuntimeDetails(payload.result);
      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
      expect(server.received.some((message) => message.includes('CHOOSE_GOLDEN_AGE'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation("player-operation"'))).toBe(true);
      expect(server.received.some((message) => message.includes('"playerId":0'))).toBe(true);
      expect(server.received.some((message) => message.includes('"playerId":2'))).toBe(false);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('reads celebration choice options without requiring a golden age type', async () => {
    const server = await startCelebrationGovernmentTunerServer({ playNotificationMode: 'celebration-choice' });
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
          surface: string;
          enabledOptionCount: number;
          disabledOptionCount: number;
          omitted: Array<{ path: string; reason: string }>;
          surfaces: Array<{
            kind: string;
            enabledOptions: Array<{
              goldenAgeType: number;
              name: string;
              nextAction: { kind: string; parameters: { goldenAgeType: number }; sendsMutation: boolean };
              validationAction: { kind: string; parameters: { goldenAgeType: number }; readOnly: boolean };
              duration: number;
            }>;
            options?: unknown;
            disabledOptions?: unknown;
          }>;
          details?: unknown;
        };
      };
      expectNormalPlayPayloadToOmitDebugInternals(payload);
      expect(payload.result.surface).toBe('celebration-choice-options');
      expect(payload.result.enabledOptionCount).toBe(2);
      expect(payload.result.disabledOptionCount).toBe(0);
      expect(payload.result.details).toBeUndefined();
      expect(payload.result.surfaces[0].kind).toBe('celebration-choice-options');
      expect(payload.result.surfaces[0].options).toBeUndefined();
      expect(payload.result.surfaces[0].disabledOptions).toBeUndefined();
      const culture = payload.result.surfaces[0].enabledOptions.find((option) => option.goldenAgeType === -340825966);
      expect(culture?.name).toBe('Cultural Celebration');
      expect(culture?.duration).toBe(10);
      expect(culture?.nextAction).toMatchObject({
        kind: 'choose-celebration',
        parameters: { goldenAgeType: -340825966 },
        sendsMutation: true,
      });
      expect(culture?.validationAction).toMatchObject({
        kind: 'validate-celebration-choice',
        parameters: { goldenAgeType: -340825966 },
        readOnly: true,
      });
      expect(JSON.stringify(payload)).not.toContain('game play ');
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
    const server = await startCelebrationGovernmentTunerServer();
    try {
      const { port } = server.address();
      await runCommand(GamePlayChooseGovernment, [
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

  test('routes government sends through government oRPC with local-player evidence', async () => {
    const server = await startCelebrationGovernmentTunerServer();
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
        '--government-type',
        '0',
        '--send',
        '--json',
      ]);

      const payload = JSON.parse(writes.join('')) as {
        ok: true;
        result: GovernmentChoiceSendResult;
      };
      expect(payload.result).toMatchObject({
        playerId: 0,
        governmentType: 0,
        action: -1326475004,
        sent: true,
        status: 'sent-unverified',
        validation: {
          beforeValid: true,
          afterValid: true,
        },
        postcondition: {
          classification: 'pending-runtime-proof',
          outcome: 'unknown',
          confidence: 'pending-runtime-proof',
          confirmed: false,
          noRepeatAfterUnverified: true,
        },
      });
      expect(payload.result.nextSteps[0]).toMatchObject({
        kind: 'do-not-repeat',
        source: 'government.choice.request',
      });
      expectSemanticGovernmentChoiceOmitsRawRuntimeDetails(payload.result);
      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
      expect(server.received.some((message) => message.includes('CHANGE_GOVERNMENT'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation("player-operation"'))).toBe(true);
      expect(server.received.some((message) => message.includes('"playerId":0'))).toBe(true);
      expect(server.received.some((message) => message.includes('"playerId":2'))).toBe(false);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });

  test('reads government choice options without requiring a government type', async () => {
    const server = await startCelebrationGovernmentTunerServer({ playNotificationMode: 'government-choice' });
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
          surface: string;
          enabledOptionCount: number;
          disabledOptionCount: number;
          omitted: Array<{ path: string; reason: string }>;
          surfaces: Array<{
            kind: string;
            enabledOptions: Array<{
              governmentType: number;
              name: string;
              nextAction: { kind: string; parameters: { governmentType: number; action: number }; sendsMutation: boolean };
              validationAction: { kind: string; parameters: { governmentType: number; action: number }; readOnly: boolean };
              celebrationOptions: Array<{ name: string }>;
            }>;
            options?: unknown;
            disabledOptions?: unknown;
          }>;
          details?: unknown;
        };
      };
      expectNormalPlayPayloadToOmitDebugInternals(payload);
      expect(payload.result.surface).toBe('government-choice-options');
      expect(payload.result.enabledOptionCount).toBe(3);
      expect(payload.result.disabledOptionCount).toBe(0);
      expect(payload.result.details).toBeUndefined();
      expect(payload.result.surfaces[0].kind).toBe('government-choice-options');
      expect(payload.result.surfaces[0].options).toBeUndefined();
      expect(payload.result.surfaces[0].disabledOptions).toBeUndefined();
      const republic = payload.result.surfaces[0].enabledOptions.find((option) => option.governmentType === 0);
      expect(republic?.name).toBe('Classical Republic');
      expect(republic?.nextAction).toMatchObject({
        kind: 'choose-government',
        parameters: {
          governmentType: 0,
          action: -1326475004,
        },
        sendsMutation: true,
      });
      expect(republic?.validationAction).toMatchObject({
        kind: 'validate-government-choice',
        parameters: {
          governmentType: 0,
          action: -1326475004,
        },
        readOnly: true,
      });
      expect(republic?.celebrationOptions[0].name).toBe('Cultural Celebration');
      expect(JSON.stringify(payload)).not.toContain('game play ');
      expect(payload.result.omitted.map((item) => item.path)).toContain('details[].options');
      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
      expect(server.received.some((message) => message.includes('sendRequest('))).toBe(false);
    } finally {
      log.mockRestore();
      await server.close();
    }
  });
});

type CelebrationGovernmentTunerServer = FakeTunerServer;

type GovernmentChoiceSendResult = {
  playerId: number;
  governmentType?: number;
  action?: number;
  goldenAgeType?: number;
  sent: boolean;
  status: string;
  validation: {
    beforeValid: boolean;
    afterValid: boolean;
  };
  postcondition: {
    classification: string;
    outcome: string;
    confidence: string;
    confirmed: boolean;
    noRepeatAfterUnverified: boolean;
  };
  nextSteps: Array<{
    kind: string;
    source: string;
    label: string;
  }>;
};

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

async function startCelebrationGovernmentTunerServer(options: {
  playNotificationMode?: 'celebration-choice' | 'government-choice';
} = {}): Promise<CelebrationGovernmentTunerServer> {
  return startFakeTunerServer({
    handle({ message }) {
      if (message.includes('Network.isInSession')) {
        return [JSON.stringify(appUiSnapshot())];
      }
      if (message.includes('evalOk') && message.includes('GameplayMap.getGridWidth')) {
        return [JSON.stringify(tunerHealthSnapshot())];
      }
      if (message.includes('return JSON.stringify(validateOperation')) {
        return [JSON.stringify(operationValidation(message))];
      }
      if (message.includes('readPlayNotifications')) {
        return [JSON.stringify(playNotificationView(options.playNotificationMode ?? 'celebration-choice'))];
      }
      if (message.includes('return JSON.stringify(sendOperation')) {
        return [JSON.stringify({ sent: true })];
      }
      return undefined;
    },
  });
}

function expectSemanticGovernmentChoiceOmitsRawRuntimeDetails(result: unknown) {
  const serialized = JSON.stringify(result);
  expect(serialized).not.toContain('"host"');
  expect(serialized).not.toContain('"port"');
  expect(serialized).not.toContain('"state"');
  expect(serialized).not.toContain('"session"');
  expect(serialized).not.toContain('"rawCommand"');
  expect(serialized).not.toContain('"command"');
  expect(serialized).not.toContain('"operation"');
  expect(serialized).not.toContain('"verified"');
  expect(serialized).not.toContain('"before"');
  expect(serialized).not.toContain('"after"');
  expect(serialized).not.toContain('Game.PlayerOperations');
  expect(serialized).not.toContain('CHANGE_GOVERNMENT');
  expect(serialized).not.toContain('CHOOSE_GOLDEN_AGE');
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
    args: operationArgs(operationType),
    valid: true,
    result: { Success: true },
  };
}

function operationTypeFromMessage(message: string) {
  const callIndex = message.lastIndexOf('validateOperation("');
  const callSource = callIndex >= 0 ? message.slice(callIndex) : message;
  return callSource.match(/"operationType":"([^"]+)"/)?.[1] ?? 'CHOOSE_GOLDEN_AGE';
}

function operationArgs(operationType: string) {
  if (operationType === 'CHANGE_GOVERNMENT') return { GovernmentType: 0, Action: -1326475004 };
  return { GoldenAgeType: -340825966 };
}

function appUiSnapshot() {
  return {
    state: { id: '65535', name: 'App UI' },
    schemaVersion: 'civ7-app-ui-snapshot.v1',
    gameContext: {
      localPlayerID: 0,
      localObserverID: 0,
      hasRequestedPause: { ok: true, value: false },
    },
    ui: {
      inGame: { ok: true, value: true },
      inShell: { ok: true, value: false },
      inLoading: { ok: true, value: false },
      canBeginGame: { ok: true, value: false },
    },
    errors: [],
  };
}

function tunerHealthSnapshot() {
  return {
    evalOk: 2,
    ready: true,
    globals: {
      hasGame: true,
      hasPlayers: true,
      hasGameInfo: true,
      hasUI: true,
      hasNetwork: true,
      hasGameplayMap: true,
      hasPlayerOperations: true,
      hasUnitCommands: true,
      hasCityCommands: true,
      gridWidth: { ok: true, value: 80 },
    },
  };
}

function playNotificationView(mode: 'celebration-choice' | 'government-choice') {
  return mode === 'government-choice' ? governmentChoiceView() : celebrationChoiceView();
}

function celebrationChoiceView() {
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
    cli: `game play choose-celebration --golden-age-type ${row.goldenAgeType} --send`,
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
  };
  return playNotificationViewForDetails({
    notificationId,
    type: -706533092,
    typeName: 'NOTIFICATION_CHOOSE_GOLDEN_AGE',
    summary: 'Your people want to Celebrate this glorious time.',
    message: 'Choose Celebration',
    details,
  });
}

function governmentChoiceView() {
  const action = -1326475004;
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
    cli: `game play choose-government --government-type ${row.governmentType} --action ${action} --send`,
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
  };
  return playNotificationViewForDetails({
    notificationId,
    type: 111,
    typeName: 'NOTIFICATION_CHOOSE_GOVERNMENT',
    summary: 'Choose a Government',
    message: 'Choose a government.',
    details,
  });
}

function playNotificationViewForDetails(input: {
  notificationId: { owner: number; id: number; type: number };
  type: number;
  typeName: string;
  summary: string;
  message: string;
  details: Record<string, unknown>;
}) {
  const notification = {
    id: input.notificationId,
    type: input.type,
    typeName: input.typeName,
    groupType: null,
    summary: input.summary,
    message: input.message,
    target: { owner: -1, id: -1, type: 0 },
    location: null,
    canUserDismiss: false,
    expired: false,
    dismissed: false,
    isEndTurnBlocking: true,
    details: input.details,
  };
  return {
    localPlayerId: 0,
    turn: { ok: true, value: 29 },
    turnDate: { ok: true, value: '3300 BCE' },
    hasSentTurnComplete: { ok: true, value: false },
    canEndTurn: { ok: true, value: false },
    blocker: { ok: true, value: 1783715360 },
    blockingNotificationId: { ok: true, value: input.notificationId },
    selectedUnitId: { ok: true, value: null },
    selectedCityId: { ok: true, value: null },
    firstReadyUnitId: { ok: true, value: null },
    notifications: [notification],
    decisions: [],
    hud: {
      nextDecision: notification,
      decisionQueue: [notification],
    },
    limits: { maxNotifications: 25, truncated: false },
  };
}
