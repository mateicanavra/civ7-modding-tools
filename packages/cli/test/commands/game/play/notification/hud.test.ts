import { describe, expect, test, vi } from 'vitest';
import GamePlayNotifications from '../../../../../src/commands/game/play/notifications';
import { expectNormalPlayPayloadToOmitDebugInternals } from '../normal-output-boundary';
import { type FakeTunerServer, startFakeTunerServer } from '../../../fixtures/tuner-socket-server';

type NotificationHudMode =
  | 'default'
  | 'stale-diplomacy'
  | 'tech-choice'
  | 'culture-choice'
  | 'celebration-choice'
  | 'government-choice'
  | 'narrative-choice'
  | 'stale-unit-command'
  | 'diplomatic-report'
  | 'diplomatic-action-report';

describe('game play notifications command', () => {
  test('materializes diplomacy response options from the notification HUD', async () => {
    const { payload, server } = await runNotificationHud('stale-diplomacy');
    try {
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
      await server.close();
    }
  });

  test('materializes technology choice options from the notification HUD', async () => {
    const { payload, server } = await runNotificationHud('tech-choice');
    try {
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
      await server.close();
    }
  });

  test('materializes culture choice options from the notification HUD', async () => {
    const { payload, server } = await runNotificationHud('culture-choice');
    try {
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
      await server.close();
    }
  });

  test('materializes celebration choice options from the notification HUD', async () => {
    const { payload, server } = await runNotificationHud('celebration-choice');
    try {
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
      await server.close();
    }
  });

  test('materializes government choice options from the notification HUD', async () => {
    const { payload, server } = await runNotificationHud('government-choice');
    try {
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
      await server.close();
    }
  });

  test('materializes narrative choice options from the notification HUD', async () => {
    const { payload, server } = await runNotificationHud('narrative-choice');
    try {
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
      await server.close();
    }
  });

  test('materializes stale command-units reconciliation candidates from the notification HUD', async () => {
    const { payload, server } = await runNotificationHud('stale-unit-command');
    try {
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
      await server.close();
    }
  });

  test('reads materialized notifications without sending operations', async () => {
    const { server } = await runNotificationHud();
    try {
      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test('classifies invalid-target diplomatic agenda notices as informational closeouts', async () => {
    const { payload, server } = await runNotificationHud('diplomatic-report');
    try {
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
    const { payload, server } = await runNotificationHud('diplomatic-action-report');
    try {
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
});

async function runNotificationHud(mode: NotificationHudMode = 'default') {
  const server = await startNotificationHudTunerServer(mode);
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
          actionId?: number;
          classification?: string;
          responseOptionCount?: number;
          enabledResponseOptionCount?: number;
          playerCulture?: unknown;
          targetStoryId?: { ok: boolean; value?: { owner: number; id: number; type: number } | null };
          storyLinks?: { ok: boolean; value?: unknown[] };
          availableNodeTypes?: { ok: boolean; value?: number[] };
          goldenAgeDuration?: { ok: boolean; value?: number };
          choices?: { ok: boolean; value?: string[] };
          startingGovernments?: { ok: boolean; value?: Array<{ GovernmentType: number }> };
          action?: number;
          options?: Array<{ title?: string; responseType?: number; enabled?: boolean; disabled?: boolean; cli: string | null }>;
          enabledOptions?: Array<Record<string, unknown>>;
          disabledOptions?: Array<Record<string, unknown>>;
          enabledCloseoutCandidates?: Array<{ unitId: { owner: number; id: number; type: number }; operationType: string; cli: string | null }>;
          staleReadyPointerSuspected?: boolean;
        };
      }>;
      hud: {
        nextDecision: {
          category: string;
          operationFamily?: string;
          operationType?: string;
          cli?: string | null;
          notes: string[];
          details?: unknown;
        };
      };
    };
  };
  expectNormalPlayPayloadToOmitDebugInternals(payload);

  return {
    payload,
    server,
  };
}

async function startNotificationHudTunerServer(mode: NotificationHudMode): Promise<FakeTunerServer> {
  return startFakeTunerServer({
    handle({ message }) {
      if (message.includes('readPlayNotifications')) {
        return [JSON.stringify(notificationHudView(mode))];
      }
      return undefined;
    },
  });
}

function notificationHudView(mode: NotificationHudMode) {
  switch (mode) {
    case 'stale-diplomacy':
      return staleDiplomacyHudView();
    case 'tech-choice':
      return techChoiceHudView();
    case 'culture-choice':
      return cultureChoiceHudView();
    case 'celebration-choice':
      return celebrationChoiceHudView();
    case 'government-choice':
      return governmentChoiceHudView();
    case 'narrative-choice':
      return narrativeChoiceHudView();
    case 'stale-unit-command':
      return staleUnitCommandHudView();
    case 'diplomatic-report':
      return diplomaticReportHudView();
    case 'diplomatic-action-report':
      return diplomaticActionReportHudView();
    default:
      return defaultHudView();
  }
}

function defaultHudView() {
  return {
    localPlayerId: 0,
    turn: { ok: true as const, value: 80 },
    turnDate: { ok: true as const, value: '2025 BCE' },
    hasSentTurnComplete: { ok: true as const, value: false },
    canEndTurn: { ok: true as const, value: false },
    blocker: { ok: true as const, value: -2026570723 },
    blockingNotificationId: { ok: true as const, value: { owner: 0, id: 42, type: 20 } },
    selectedUnitId: { ok: true as const, value: null },
    selectedCityId: { ok: true as const, value: { owner: 0, id: 131073, type: 1 } },
    firstReadyUnitId: { ok: true as const, value: null },
    notifications: [
      {
        id: { owner: 0, id: 42, type: 20 },
        typeName: 'NOTIFICATION_CHOOSE_TOWN_PROJECT',
        summary: 'Choose Town Project',
        message: 'Choose a town focus project',
        target: { owner: 0, id: 131073, type: 1 },
        location: null,
        isEndTurnBlocking: true,
        decision: notificationDecision({
          category: 'town-focus',
          operationFamily: 'city-command',
          operationType: 'CHANGE_GROWTH_MODE',
          cli: 'game play set-town-focus',
          notes: ['Town focus is a read-only default fixture for non-HUD extraction coverage.'],
        }),
      },
    ],
    decisions: [],
    hud: {
      nextDecision: null,
      decisionQueue: [],
    },
    limits: { maxNotifications: 25, truncated: false },
  };
}

function staleDiplomacyHudView() {
  const notificationId = { owner: 0, id: 19, type: 20 };
  const details = {
    kind: 'diplomacy-response-options',
    actionId: 8,
    options: [
      { responseType: -1907089594, title: 'Support', enabled: false, disabled: true, cli: null },
      {
        responseType: 926305338,
        title: 'Accept',
        enabled: true,
        disabled: false,
        cli: "game play respond-diplomacy --action-id 8 --response-type 926305338 --notification-id '{\"owner\":0,\"id\":19,\"type\":20}' --send --reason '<why this response was selected>'",
      },
      {
        responseType: -1200641623,
        title: 'Reject',
        enabled: true,
        disabled: false,
        cli: "game play respond-diplomacy --action-id 8 --response-type -1200641623 --notification-id '{\"owner\":0,\"id\":19,\"type\":20}' --send --reason '<why this response was selected>'",
      },
    ],
    enabledOptions: [
      {
        responseType: 926305338,
        title: 'Accept',
        cli: "game play respond-diplomacy --action-id 8 --response-type 926305338 --notification-id '{\"owner\":0,\"id\":19,\"type\":20}' --send --reason '<why this response was selected>'",
      },
      {
        responseType: -1200641623,
        title: 'Reject',
        cli: "game play respond-diplomacy --action-id 8 --response-type -1200641623 --notification-id '{\"owner\":0,\"id\":19,\"type\":20}' --send --reason '<why this response was selected>'",
      },
    ],
    disabledOptions: [
      { responseType: -1907089594, title: 'Support', cli: null },
    ],
  };
  return singleNotificationHudView({
    turn: 8,
    turnDate: '3825 BCE',
    blocker: 0,
    notification: {
      id: notificationId,
      typeName: 'NOTIFICATION_DIPLOMATIC_RESPONSE_REQUIRED',
      summary: 'Trung Trac has started a Diplomatic Action with you.',
      message: 'Respond to Diplomatic Action',
      target: { owner: 2, id: 8, type: 34 },
      location: { x: -9999, y: -9999 },
      isEndTurnBlocking: true,
      decision: notificationDecision({
        category: 'diplomacy-response',
        operationFamily: 'player-operation',
        operationType: 'RESPOND_DIPLOMATIC_ACTION',
        cli: 'game play respond-diplomacy',
      }),
      details,
    },
  });
}

function techChoiceHudView() {
  const notificationId = { owner: 0, id: 52, type: 20 };
  const details = {
    kind: 'technology-choice-options',
    enabledOptions: [
      {
        nodeType: -1255676052,
        name: 'Masonry',
        cli: "game play choose-tech --player-id 0 --node -1255676052 --send --reason '<why this technology was selected>'",
        chooseValidation: { ok: true as const, value: { Success: true } },
      },
      {
        nodeType: -1558948215,
        name: 'Sailing',
        cli: "game play choose-tech --player-id 0 --node -1558948215 --send --reason '<why this technology was selected>'",
        chooseValidation: { ok: true as const, value: { Success: true } },
      },
    ],
    disabledOptions: [
      { nodeType: 510800721, name: 'Agriculture', cli: null },
    ],
  };
  return singleNotificationHudView({
    turn: 19,
    turnDate: '3550 BCE',
    blocker: -1255676052,
    notification: {
      id: notificationId,
      typeName: 'NOTIFICATION_CHOOSE_TECH',
      summary: 'Choose a Technology',
      message: 'Choose a new Technology to begin studying.',
      target: { owner: -1, id: -1, type: 0 },
      location: null,
      isEndTurnBlocking: true,
      decision: notificationDecision({
        category: 'technology-choice',
        operationFamily: 'player-operation',
        operationType: 'SET_TECH_TREE_NODE',
        cli: 'game play choose-tech',
      }),
      details,
    },
  });
}

function cultureChoiceHudView() {
  const notificationId = { owner: 0, id: 62, type: 20 };
  const details = {
    kind: 'culture-choice-options',
    availableNodeTypes: { ok: true as const, value: [-869902342, -1404789184, 1643868894] },
    enabledOptions: [
      {
        nodeType: -869902342,
        name: 'Ekklesia',
        cli: "game play choose-culture --player-id 0 --node -869902342 --send --closeout --reason '<why this culture node was selected>'",
        chooseValidation: { ok: true as const, value: { Success: true } },
      },
      {
        nodeType: -1404789184,
        name: 'Discipline',
        cli: "game play choose-culture --player-id 0 --node -1404789184 --send --closeout --reason '<why this culture node was selected>'",
        chooseValidation: { ok: true as const, value: { Success: true } },
      },
    ],
    disabledOptions: [
      { nodeType: 1643868894, name: 'Mysticism', cli: null },
    ],
  };
  return singleNotificationHudView({
    turn: 19,
    turnDate: '3550 BCE',
    blocker: -869902342,
    notification: {
      id: notificationId,
      typeName: 'NOTIFICATION_CHOOSE_CULTURE_NODE',
      summary: 'Choose a Civic',
      message: 'Choose a new Civic to begin studying.',
      target: { owner: -1, id: -1, type: 0 },
      location: null,
      isEndTurnBlocking: true,
      decision: notificationDecision({
        category: 'culture-choice',
        operationFamily: 'player-operation',
        operationType: 'SET_CULTURE_TREE_NODE',
        cli: 'game play choose-culture',
      }),
      details,
    },
  });
}

function celebrationChoiceHudView() {
  const notificationId = { owner: 0, id: 110, type: 20 };
  const details = {
    kind: 'celebration-choice-options',
    goldenAgeDuration: { ok: true as const, value: 10 },
    choices: { ok: true as const, value: ['GOLDEN_AGE_CLASSICAL_REPUBLIC_1', 'GOLDEN_AGE_CLASSICAL_REPUBLIC_2'] },
    enabledOptions: [
      {
        goldenAgeType: -340825966,
        name: 'Cultural Celebration',
        cli: "game play choose-celebration --player-id 0 --golden-age-type -340825966 --send --reason '<why this celebration was selected>'",
        validation: { ok: true as const, value: { Success: true } },
      },
      {
        goldenAgeType: 1923496232,
        name: 'Wonder Production Celebration',
        cli: "game play choose-celebration --player-id 0 --golden-age-type 1923496232 --send --reason '<why this celebration was selected>'",
        validation: { ok: true as const, value: { Success: true } },
      },
    ],
    disabledOptions: [],
  };
  return singleNotificationHudView({
    turn: 29,
    turnDate: '3300 BCE',
    blocker: 1783715360,
    notification: {
      id: notificationId,
      typeName: 'NOTIFICATION_CHOOSE_GOLDEN_AGE',
      summary: 'Your people want to Celebrate this glorious time.',
      message: 'Choose Celebration',
      target: { owner: -1, id: -1, type: 0 },
      location: null,
      isEndTurnBlocking: true,
      decision: notificationDecision({
        category: 'celebration-choice',
        operationFamily: 'player-operation',
        operationType: 'CHOOSE_GOLDEN_AGE',
        cli: 'game play choose-celebration',
      }),
      details,
    },
  });
}

function governmentChoiceHudView() {
  const notificationId = { owner: 0, id: 40, type: 20 };
  const details = {
    kind: 'government-choice-options',
    action: -1326475004,
    startingGovernments: { ok: true as const, value: [{ GovernmentType: 0 }, { GovernmentType: 1 }, { GovernmentType: 2 }] },
    enabledOptions: [
      {
        governmentType: 0,
        name: 'Classical Republic',
        cli: "game play choose-government --player-id 0 --government-type 0 --action -1326475004 --send --reason '<why this government was selected>'",
        validation: { ok: true as const, value: { Success: true } },
      },
      {
        governmentType: 1,
        name: 'Despotism',
        cli: "game play choose-government --player-id 0 --government-type 1 --action -1326475004 --send --reason '<why this government was selected>'",
        validation: { ok: true as const, value: { Success: true } },
      },
      {
        governmentType: 2,
        name: 'Oligarchy',
        cli: "game play choose-government --player-id 0 --government-type 2 --action -1326475004 --send --reason '<why this government was selected>'",
        validation: { ok: true as const, value: { Success: true } },
      },
    ],
    disabledOptions: [],
  };
  return singleNotificationHudView({
    turn: 10,
    turnDate: '3775 BCE',
    blocker: 0,
    notification: {
      id: notificationId,
      typeName: 'NOTIFICATION_CHOOSE_GOVERNMENT',
      summary: 'Choose a Government',
      message: 'Choose a government.',
      target: { owner: -1, id: -1, type: 0 },
      location: null,
      isEndTurnBlocking: true,
      decision: notificationDecision({
        category: 'government-choice',
        operationFamily: 'player-operation',
        operationType: 'CHANGE_GOVERNMENT',
        cli: 'game play choose-government',
      }),
      details,
    },
  });
}

function narrativeChoiceHudView() {
  const notificationId = { owner: 0, id: 5, type: 20 };
  const details = {
    kind: 'narrative-choice-options',
    targetStoryId: { ok: true as const, value: { owner: 0, id: 45, type: 35 } },
    storyLinks: { ok: true as const, value: [] },
    enabledOptions: [
      {
        targetType: 'CLOSE',
        cli: "game play choose-narrative --player-id 0 --target-type CLOSE --target '{\"owner\":0,\"id\":45,\"type\":35}' --action -1326475004 --send --reason '<why this narrative closeout was selected>'",
        validation: { ok: true as const, value: { Success: true } },
      },
    ],
    disabledOptions: [],
  };
  return singleNotificationHudView({
    turn: 6,
    turnDate: '3875 BCE',
    blocker: -2084516792,
    notification: {
      id: notificationId,
      typeName: 'NOTIFICATION_CHOOSE_DISCOVERY_STORY_DIRECTION',
      summary: 'Choose a selection from the Discovery.',
      message: 'Discovery Choice',
      target: { owner: -1, id: -1, type: 0 },
      location: { x: -9999, y: -9999 },
      isEndTurnBlocking: true,
      decision: notificationDecision({
        category: 'narrative-choice',
        operationFamily: 'player-operation',
        operationType: 'CHOOSE_NARRATIVE_STORY_DIRECTION',
        cli: 'game play choose-narrative',
      }),
      details,
    },
  });
}

function staleUnitCommandHudView() {
  const notificationId = { owner: 0, id: 88, type: 20 };
  const details = {
    kind: 'unit-command-reconciliation',
    staleReadyPointerSuspected: true,
    enabledCloseoutCandidates: [
      {
        unitId: { owner: 0, id: 196609, type: 26 },
        operationType: 'SKIP_TURN',
        cli: "game play operation --family unit --type SKIP_TURN --unit-id '{\"owner\":0,\"id\":196609,\"type\":26}' --send --reason '<why this unit has no better operation this turn>'",
      },
    ],
  };
  return singleNotificationHudView({
    turn: 80,
    turnDate: '2025 BCE',
    blocker: 0,
    notification: {
      id: notificationId,
      typeName: 'NOTIFICATION_COMMAND_UNITS',
      summary: 'Move a Unit or have it perform an operation.',
      message: 'Command Units',
      target: { owner: -1, id: -1, type: 0 },
      location: { x: -9999, y: -9999 },
      isEndTurnBlocking: true,
      decision: notificationDecision({
        category: 'unit-command',
        operationFamily: 'unit-operation',
        operationType: 'SKIP_TURN',
        cli: 'game play operation --family unit',
      }),
      details,
    },
  });
}

function diplomaticReportHudView() {
  return singleNotificationHudView({
    turn: 133,
    turnDate: '960 BCE',
    blocker: 0,
    firstReadyUnitId: { owner: 0, id: 1572876, type: 26 },
    notification: {
      id: { owner: 0, id: 644, type: 20 },
      typeName: 'NOTIFICATION_DIPLOMATIC_ACTION',
      summary: 'The Agenda of Genghis Khan has changed your Relationship.',
      message: 'The Agenda of Genghis Khan has changed your Relationship.',
      target: { owner: -1, id: -1, type: 0 },
      location: { x: 19, y: 26 },
      isEndTurnBlocking: true,
      decision: notificationDecision({
        category: 'informational-notification',
        operationFamily: 'app-ui-action',
        operationType: 'Game.Notifications.dismiss',
        cli: 'game play dismiss-notification',
        notes: ['Agenda and relationship reports can arrive as NOTIFICATION_DIPLOMATIC_ACTION with an invalid target; do not send RESPOND_DIPLOMATIC_ACTION without a valid action id.'],
      }),
    },
  });
}

function diplomaticActionReportHudView() {
  const notificationId = { owner: 0, id: 118, type: 20 };
  const details = {
    kind: 'diplomatic-action-report',
    classification: 'diplomatic-action-report-no-enabled-response-options',
    actionId: 34,
    responseOptionCount: 0,
    enabledResponseOptionCount: 0,
  };
  return singleNotificationHudView({
    turn: 37,
    turnDate: '3100 BCE',
    blocker: 0,
    firstReadyUnitId: { owner: 0, id: 327682, type: 26 },
    notification: {
      id: notificationId,
      typeName: 'NOTIFICATION_DIPLOMATIC_ACTION',
      summary: 'Another Civilization settled a new Town nearby.',
      message: 'New Settlement Nearby',
      target: { owner: 2, id: 34, type: 34 },
      location: { x: 3, y: 46 },
      isEndTurnBlocking: true,
      decision: notificationDecision({
        category: 'informational-notification',
        operationFamily: 'app-ui-action',
        operationType: 'Game.Notifications.dismiss',
        cli: 'game play dismiss-notification',
        notes: ['NOTIFICATION_DIPLOMATIC_ACTION can point at a real diplomatic event id, but empty/no-enabled getResponseDataForUI options make it a reviewed report closeout rather than RESPOND_DIPLOMATIC_ACTION.'],
      }),
      details,
    },
  });
}

function singleNotificationHudView(input: {
  turn: number;
  turnDate: string;
  blocker: number;
  notification: {
    id: { owner: number; id: number; type: number };
    typeName: string;
    summary: string;
    message: string;
    target: { owner: number; id: number; type: number };
    location: unknown;
    isEndTurnBlocking: boolean;
    decision: ReturnType<typeof notificationDecision>;
    details?: unknown;
  };
  firstReadyUnitId?: { owner: number; id: number; type: number } | null;
}) {
  const queueItem = {
    notificationId: input.notification.id,
    isEndTurnBlocking: input.notification.isEndTurnBlocking,
    typeName: input.notification.typeName,
    summary: input.notification.summary,
    message: input.notification.message,
    target: input.notification.target,
    location: input.notification.location,
    details: input.notification.details,
    ...input.notification.decision,
  };
  return {
    localPlayerId: 0,
    turn: { ok: true as const, value: input.turn },
    turnDate: { ok: true as const, value: input.turnDate },
    hasSentTurnComplete: { ok: true as const, value: false },
    canEndTurn: { ok: true as const, value: false },
    blocker: { ok: true as const, value: input.blocker },
    blockingNotificationId: { ok: true as const, value: input.notification.id },
    selectedUnitId: { ok: true as const, value: null },
    selectedCityId: { ok: true as const, value: null },
    firstReadyUnitId: { ok: true as const, value: input.firstReadyUnitId ?? null },
    notifications: [
      {
        id: input.notification.id,
        typeName: input.notification.typeName,
        summary: input.notification.summary,
        message: input.notification.message,
        target: input.notification.target,
        location: input.notification.location,
        isEndTurnBlocking: input.notification.isEndTurnBlocking,
        decision: input.notification.decision,
        details: input.notification.details,
      },
    ],
    decisions: [input.notification.decision],
    hud: {
      nextDecision: queueItem,
      decisionQueue: [queueItem],
    },
    limits: { maxNotifications: 25, truncated: false },
  };
}

function notificationDecision(input: {
  category: string;
  operationFamily: string;
  operationType: string;
  cli: string;
  notes?: string[];
}) {
  return {
    category: input.category,
    operationFamily: input.operationFamily,
    operationType: input.operationType,
    argsShape: '{}',
    cli: input.cli,
    requiredInputs: [],
    commonActions: [],
    confidence: 'test-only',
    notes: input.notes ?? [],
  };
}
