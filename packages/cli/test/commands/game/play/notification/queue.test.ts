import { describe, expect, test, vi } from 'vitest';
import GamePlayNotificationQueue from '../../../../../src/commands/game/play/notification-queue';
import { expectNormalPlayPayloadToOmitDebugInternals } from '../normal-output-boundary';
import { type FakeTunerServer, startFakeTunerServer } from '../../../fixtures/tuner-socket-server';

type QueueMode =
  | 'mixed-queue'
  | 'first-meet'
  | 'tech-choice'
  | 'culture-choice'
  | 'celebration-choice'
  | 'government-choice'
  | 'narrative-choice'
  | 'legacy-completed'
  | 'unit-lost-report';

describe('game play notification queue command', () => {
  test('schedules notification queue without sending bulk dismissals', async () => {
    const { payload, server } = await runNotificationQueue('mixed-queue');
    try {
      expect(payload.view.queueLength).toBe(3);
      expect(payload.view.schedule[0].isEndTurnBlocking).toBe(true);
      expect(payload.view.schedule[0].disposition).toBe('operate-with-live-inputs');
      expect(payload.view.schedule.some((step) => step.disposition === 'reviewed-dismissal-candidate')).toBe(true);
      expect(payload.view.schedule.some((step) => step.safeToBatch === true)).toBe(true);
      expect(payload.view.schedule.some((step) => step.command?.includes('dismiss-notification'))).toBe(true);
      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
      expect(server.received.some((message) => message.includes('readNotificationDismissal'))).toBe(false);
      expect(payload.view.notes.join('\n')).toContain('item-level context');
      expect(payload.view.notes.join('\n')).not.toMatch(/\breason\b/i);
    } finally {
      await server.close();
    }
  });

  test('schedules recommended operation commands from notification details', async () => {
    const { payload, server } = await runNotificationQueue('first-meet');
    try {
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
  ] as const)('routes %s notification queue entries to compact option readers', async (mode, typeName, command) => {
    const { payload, server } = await runNotificationQueue(mode);
    try {
      const step = payload.view.schedule.find((item) => item.typeName === typeName);
      expect(step?.disposition).toBe('operate-with-live-inputs');
      expect(step?.command).toBe(command);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test('schedules legacy completion reports as reviewed dismissal candidates', async () => {
    const { payload, server } = await runNotificationQueue('legacy-completed');
    try {
      const step = payload.view.schedule[0];
      expect(step.typeName).toBe('NOTIFICATION_LEGACY_COMPLETED');
      expect(step.disposition).toBe('reviewed-dismissal-candidate');
      expect(step.safeToBatch).toBe(true);
      expect(step.command).toContain('dismiss-notification');      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test('schedules unit-lost reports as reviewed dismissal candidates', async () => {
    const { payload, server } = await runNotificationQueue('unit-lost-report');
    try {
      const step = payload.view.schedule[0];
      expect(step.disposition).toBe('reviewed-dismissal-candidate');
      expect(step.typeName).toBe('NOTIFICATION_UNIT_LOST');
      expect(step.command).toContain("game play dismiss-notification --target '{\"owner\":0,\"id\":34,\"type\":20}'");      expect(step.command).not.toMatch(/enemy|hostile|opponent/i);
      expect(step.safeToBatch).toBe(false);
    } finally {
      await server.close();
    }
  });
});

async function runNotificationQueue(mode: QueueMode) {
  const server = await startNotificationQueueTunerServer(mode);
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
  } finally {
    log.mockRestore();
  }

  const payload = JSON.parse(writes.join('')) as {
    ok: true;
    view: {
      queueLength: number;
      schedule: Array<{
        category: string;
        command: string | null;
        disposition: string;
        isEndTurnBlocking: boolean;
        safeToBatch: boolean;
        typeName: string | null;
      }>;
      notes: string[];
    };
  };
  expectNormalPlayPayloadToOmitDebugInternals(payload);

  return {
    payload,
    server,
  };
}

async function startNotificationQueueTunerServer(mode: QueueMode): Promise<FakeTunerServer> {
  return startFakeTunerServer({
    handle({ message }) {
      if (message.includes('readPlayNotifications')) {
        return [JSON.stringify(notificationQueueView(mode))];
      }
      return undefined;
    },
  });
}

function notificationQueueView(mode: QueueMode) {
  const decisionQueue = decisionQueueFor(mode);
  return {
    localPlayerId: 0,
    turn: { ok: true, value: 123 },
    turnDate: { ok: true, value: '1160 BCE' },
    blocker: { ok: true, value: decisionQueue.some((item) => item.isEndTurnBlocking) ? 1 : 0 },
    blockingNotificationId: { ok: true, value: decisionQueue.find((item) => item.isEndTurnBlocking)?.notificationId ?? null },
    canEndTurn: { ok: true, value: false },
    limits: { maxNotifications: 50, truncated: false },
    hud: {
      nextDecision: decisionQueue.find((item) => item.isEndTurnBlocking) ?? null,
      decisionQueue,
    },
  };
}

function decisionQueueFor(mode: QueueMode) {
  if (mode === 'mixed-queue') {
    return [
      operationDecision({
        notificationId: { owner: 0, id: 577, type: 20 },
        typeName: 'NOTIFICATION_DIPLOMATIC_RESPONSE_REQUIRED',
        summary: 'Lafayette has started a Diplomatic Action with you.',
        category: 'diplomacy-response',
        operationType: 'RESPOND_DIPLOMATIC_ACTION',
        cli: 'game play respond-diplomacy',
        requiredInputs: [{ name: 'ID', source: 'live diplomatic action', required: true }],
        isEndTurnBlocking: true,
      }),
      informationalDecision({
        notificationId: { owner: 0, id: 579, type: 20 },
        typeName: 'NOTIFICATION_VOLCANO_ERUPTS_SEV2',
        summary: 'Laacher See has erupted.',
        location: { x: 58, y: 36 },
        isEndTurnBlocking: false,
      }),
      {
        notificationId: { owner: 0, id: 583, type: 20 },
        isEndTurnBlocking: false,
        typeName: 'NOTIFICATION_COMMAND_UNITS',
        summary: 'Move a Unit or have it perform an operation.',
        message: 'Command Units',
        target: { owner: -1, id: -1, type: 0 },
        location: { x: -9999, y: -9999 },
        category: 'unit-command',
        operationFamily: 'unit-operation',
        operationType: 'SKIP_TURN',
        requiredInputs: [{ name: 'Unit', source: 'selectedUnitId or firstReadyUnitId', required: true }],
        cli: 'game play operation --family unit',
      },
    ];
  }

  if (mode === 'first-meet') {
    return [
      operationDecision({
        notificationId: { owner: 0, id: 44, type: 20 },
        typeName: 'NOTIFICATION_PLAYER_MET',
        summary: 'You have met Ashoka, World Renouncer of Mauryan Empire.',
        category: 'first-meet-diplomacy',
        operationType: 'RESPOND_DIPLOMATIC_FIRST_MEET',
        cli: 'game play respond-first-meet',
        isEndTurnBlocking: true,
        details: {
          kind: 'first-meet-diplomacy',
          recommendedCli: 'game play respond-first-meet --player-id 0 --met-player-id 2 --response neutral',
        },
      }),
    ];
  }

  if (mode === 'legacy-completed') {
    return [
      informationalDecision({
        notificationId: { owner: 0, id: 77, type: 20 },
        typeName: 'NOTIFICATION_LEGACY_COMPLETED',
        summary: 'An unmet Player has completed the Triumph "Yokol-kab".',
        message: 'Triumph Completed',
        isEndTurnBlocking: false,
      }),
    ];
  }

  if (mode === 'unit-lost-report') {
    return [
      informationalDecision({
        notificationId: { owner: 0, id: 34, type: 20 },
        typeName: 'NOTIFICATION_UNIT_LOST',
        summary: 'While defending, your Scout was destroyed by a Warrior from Samarkand (44 damage)!',
        message: 'Unit Lost',
        location: { x: 5, y: 18 },
        isEndTurnBlocking: true,
      }),
    ];
  }

  return [
    operationDecision({
      notificationId: { owner: 0, id: optionModeId(mode), type: 20 },
      typeName: optionModeTypeName(mode),
      summary: optionModeSummary(mode),
      category: optionModeCategory(mode),
      operationType: optionModeOperation(mode),
      cli: optionModeCli(mode),
      isEndTurnBlocking: true,
      details: {
        kind: optionModeDetailsKind(mode),
        enabledOptions: [{}],
      },
    }),
  ];
}

function operationDecision(input: {
  notificationId: { owner: number; id: number; type: number };
  typeName: string;
  summary: string;
  category: string;
  operationType: string;
  cli: string;
  requiredInputs?: Array<{ name: string; source: string; required: boolean }>;
  isEndTurnBlocking: boolean;
  details?: unknown;
}) {
  return {
    notificationId: input.notificationId,
    isEndTurnBlocking: input.isEndTurnBlocking,
    typeName: input.typeName,
    summary: input.summary,
    message: input.summary,
    target: { owner: -1, id: -1, type: 0 },
    location: null,
    category: input.category,
    operationFamily: 'player-operation',
    operationType: input.operationType,
    requiredInputs: input.requiredInputs ?? [],
    cli: input.cli,
    details: input.details,
  };
}

function informationalDecision(input: {
  notificationId: { owner: number; id: number; type: number };
  typeName: string;
  summary: string;
  message?: string;
  location?: unknown;
  isEndTurnBlocking: boolean;
}) {
  return {
    notificationId: input.notificationId,
    isEndTurnBlocking: input.isEndTurnBlocking,
    typeName: input.typeName,
    summary: input.summary,
    message: input.message ?? input.summary,
    target: { owner: -1, id: -1, type: 0 },
    location: input.location ?? null,
    category: 'informational-notification',
    operationFamily: 'app-ui-action',
    operationType: 'Game.Notifications.dismiss',
    requiredInputs: [{ name: 'Notification', source: 'notification ComponentID', required: true }],
    cli: 'game play dismiss-notification',
  };
}

function optionModeId(mode: Exclude<QueueMode, 'mixed-queue' | 'first-meet' | 'legacy-completed' | 'unit-lost-report'>): number {
  return {
    'tech-choice': 52,
    'culture-choice': 62,
    'celebration-choice': 110,
    'government-choice': 40,
    'narrative-choice': 5,
  }[mode];
}

function optionModeTypeName(mode: Exclude<QueueMode, 'mixed-queue' | 'first-meet' | 'legacy-completed' | 'unit-lost-report'>): string {
  return {
    'tech-choice': 'NOTIFICATION_CHOOSE_TECH',
    'culture-choice': 'NOTIFICATION_CHOOSE_CULTURE_NODE',
    'celebration-choice': 'NOTIFICATION_CHOOSE_GOLDEN_AGE',
    'government-choice': 'NOTIFICATION_CHOOSE_GOVERNMENT',
    'narrative-choice': 'NOTIFICATION_CHOOSE_DISCOVERY_STORY_DIRECTION',
  }[mode];
}

function optionModeSummary(mode: Exclude<QueueMode, 'mixed-queue' | 'first-meet' | 'legacy-completed' | 'unit-lost-report'>): string {
  return {
    'tech-choice': 'Choose a Technology',
    'culture-choice': 'Choose a Civic',
    'celebration-choice': 'Choose Celebration',
    'government-choice': 'Choose a Government',
    'narrative-choice': 'Discovery Choice',
  }[mode];
}

function optionModeCategory(mode: Exclude<QueueMode, 'mixed-queue' | 'first-meet' | 'legacy-completed' | 'unit-lost-report'>): string {
  return {
    'tech-choice': 'technology-choice',
    'culture-choice': 'culture-choice',
    'celebration-choice': 'celebration-choice',
    'government-choice': 'government-choice',
    'narrative-choice': 'narrative-choice',
  }[mode];
}

function optionModeOperation(mode: Exclude<QueueMode, 'mixed-queue' | 'first-meet' | 'legacy-completed' | 'unit-lost-report'>): string {
  return {
    'tech-choice': 'SET_TECH_TREE_NODE',
    'culture-choice': 'SET_CULTURE_TREE_NODE',
    'celebration-choice': 'CHOOSE_GOLDEN_AGE',
    'government-choice': 'CHANGE_GOVERNMENT',
    'narrative-choice': 'CHOOSE_NARRATIVE_STORY_DIRECTION',
  }[mode];
}

function optionModeCli(mode: Exclude<QueueMode, 'mixed-queue' | 'first-meet' | 'legacy-completed' | 'unit-lost-report'>): string {
  return {
    'tech-choice': 'game play choose-tech',
    'culture-choice': 'game play choose-culture',
    'celebration-choice': 'game play choose-celebration',
    'government-choice': 'game play choose-government',
    'narrative-choice': 'game play choose-narrative',
  }[mode];
}

function optionModeDetailsKind(mode: Exclude<QueueMode, 'mixed-queue' | 'first-meet' | 'legacy-completed' | 'unit-lost-report'>): string {
  return {
    'tech-choice': 'technology-choice-options',
    'culture-choice': 'culture-choice-options',
    'celebration-choice': 'celebration-choice-options',
    'government-choice': 'government-choice-options',
    'narrative-choice': 'narrative-choice-options',
  }[mode];
}
