import { describe, expect, test, vi } from 'vitest';
import GamePlayPriorities from '../../../../src/commands/game/play/priorities';
import { type FakeTunerServer, startFakeTunerServer } from '../../fixtures/tuner-socket-server';

type PriorityHudMode =
  | 'ready-unit'
  | 'runtime-error'
  | 'clean-read'
  | 'stale-unit-command'
  | 'stale-unit-command-disabled'
  | 'stale-unit-command-pending'
  | 'first-meet'
  | 'tech-choice'
  | 'culture-choice'
  | 'celebration-choice'
  | 'government-choice'
  | 'narrative-choice'
  | 'narrative-choice-empty'
  | 'narrative-choice-visible-panel'
  | 'tradition-review'
  | 'production-choice'
  | 'population-placement'
  | 'stale-informational'
  | 'unit-lost-report'
  | 'diplomatic-action-report';

describe('game play priorities command', () => {
  test('reads play priorities without sending operations', async () => {
    const { payload, server } = await runPriorities('ready-unit', { compact: false, battlefield: true });
    try {
      const view = payload.view as {
        priorities: Array<{ kind: string }>;
        readyUnit: { legalOperationScope: string; legalNoTargetOperationCount: number } | null;
        battlefield: { pointsOfInterest: unknown[] } | null;
      };
      expect(view.readyUnit?.legalOperationScope).toBe('no-target');
      expect(view.readyUnit?.legalNoTargetOperationCount).toBeGreaterThan(0);
      expect(view.battlefield?.pointsOfInterest.length).toBeGreaterThan(0);
      expect(view.priorities.some((item) => item.kind === 'ready-unit')).toBe(true);
      expect(view.priorities.some((item) => item.kind.startsWith('battlefield:'))).toBe(true);
      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
      expect(server.received.some((message) => message.includes('readReadyUnitView'))).toBe(true);
      expect(server.received.some((message) => message.includes('readBattlefieldScan'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test('does not treat partial HUD probe failures as clean end-turn proof', async () => {
    const { payload, server } = await runPriorities('runtime-error', { compact: false });
    try {
      const view = payload.view as {
        priorities: Array<{ kind: string; command?: string; evidence?: Array<{ field: string; error: string }> }>;
      };
      const runtimeError = view.priorities.find((item) => item.kind === 'runtime-state-error');
      expect(runtimeError?.command).toContain('game play rehydrate --json');
      expect(runtimeError?.evidence?.some((item) => item.field === 'blocker' && item.error.includes('Game is not defined'))).toBe(true);
      expect(view.priorities.some((item) => item.kind === 'clean-read')).toBe(false);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test('emits compact play priorities without raw evidence by request', async () => {
    const { payload, server } = await runPriorities('runtime-error');
    try {
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
      await server.close();
    }
  });

  test('surfaces guarded end-turn send in compact clean-read priorities', async () => {
    const { payload, server } = await runPriorities('clean-read');
    try {
      const top = payload.priorities[0];
      expect(top.kind).toBe('clean-read');
      expect(top.command).toContain('game play end-turn --send');
      expect(top.command).toContain("--reason 'clean read: no HUD, ready-unit, ready-city, or battlefield priority surfaced'");
      expect(payload.next).toBe(top.command);
      expect(top.reason).toContain('rechecks blockers before sending');
      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendTurnComplete'))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test('surfaces unit-command reconciliation command in compact priorities', async () => {
    const { payload, server } = await runPriorities('stale-unit-command');
    try {
      const top = payload.priorities[0];
      expect(top.kind).toBe('hud:unit-command');
      expect(top.command).toContain('game play operation --family unit --type SKIP_TURN');
      expect(top.command).toContain("--unit-id '{\"owner\":0,\"id\":196609,\"type\":26}'");
      expect(payload.next).toBe(top.command);
      expect(top.reason).toContain('validator-backed operation candidate');
      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test('surfaces exact recommended operation command in compact priorities', async () => {
    const { payload, server } = await runPriorities('first-meet');
    try {
      const top = payload.priorities[0];
      expect(top.kind).toBe('hud:first-meet-diplomacy');
      expect(top.command).toBe('game play respond-first-meet --player-id 0 --met-player-id 2 --response neutral');
      expect(payload.next).toBe(top.command);
      expect(top.reason).toContain('validator-backed operation candidate');
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test('surfaces technology options command in compact priorities', async () => {
    const { payload, server } = await runPriorities('tech-choice');
    try {
      const top = payload.priorities[0];
      expect(top.kind).toBe('hud:technology-choice');
      expect(top.command).toBe('game play choose-tech --options --json');
      expect(payload.next).toBe(top.command);
      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test('surfaces culture options command in compact priorities', async () => {
    const { payload, server } = await runPriorities('culture-choice');
    try {
      const top = payload.priorities[0];
      expect(top.kind).toBe('hud:culture-choice');
      expect(top.command).toBe('game play choose-culture --options --json');
      expect(payload.next).toBe(top.command);
      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test('surfaces celebration options command in compact priorities', async () => {
    const { payload, server } = await runPriorities('celebration-choice');
    try {
      const top = payload.priorities[0];
      expect(top.kind).toBe('hud:celebration-choice');
      expect(top.command).toBe('game play choose-celebration --options --json');
      expect(payload.next).toBe(top.command);
      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test('surfaces government options command in compact priorities', async () => {
    const { payload, server } = await runPriorities('government-choice');
    try {
      const top = payload.priorities[0];
      expect(top.kind).toBe('hud:government-choice');
      expect(top.command).toBe('game play choose-government --options --json');
      expect(payload.next).toBe(top.command);
      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test('surfaces narrative options command in compact priorities', async () => {
    const { payload, server } = await runPriorities('narrative-choice');
    try {
      const top = payload.priorities[0];
      expect(top.kind).toBe('hud:narrative-choice');
      expect(top.command).toBe('game play choose-narrative --options --json');
      expect(payload.next).toBe(top.command);
      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test('surfaces dismissal diagnostics for empty narrative choices in compact priorities', async () => {
    const { payload, server } = await runPriorities('narrative-choice-empty');
    try {
      const top = payload.priorities[0];
      expect(top.kind).toBe('hud:narrative-choice');
      expect(top.command).toBe('game play dismiss-notification --target \'{"owner":0,"id":5,"type":20}\' --json');
      expect(payload.next).toBe(top.command);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test('surfaces narrative options for visible panel choices in compact priorities', async () => {
    const { payload, server } = await runPriorities('narrative-choice-visible-panel');
    try {
      const top = payload.priorities[0];
      expect(top.kind).toBe('hud:narrative-choice');
      expect(top.command).toBe('game play choose-narrative --options --json');
      expect(payload.next).toBe(top.command);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test('surfaces tradition option reader in compact priorities', async () => {
    const { payload, server } = await runPriorities('tradition-review');
    try {
      const top = payload.priorities[0];
      expect(top.kind).toBe('hud:tradition-review');
      expect(top.command).toBe('game play traditions --compact --json');
      expect(payload.next).toBe(top.command);
      expect(server.received.some((message) => message.includes('readPlayNotifications'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test('surfaces ready-city compact view for production-choice blockers', async () => {
    const { payload, server } = await runPriorities('production-choice');
    try {
      const top = payload.priorities[0];
      expect(top.kind).toBe('hud:production-choice');
      expect(top.command).toBe('game play ready-city --compact --json');
      expect(payload.next).toBe(top.command);
      expect(server.received.some((message) => message.includes('readReadyCityView'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test('surfaces ready-city compact view for population-placement blockers', async () => {
    const { payload, server } = await runPriorities('population-placement');
    try {
      const top = payload.priorities[0];
      expect(top.kind).toBe('hud:population-placement');
      expect(top.command).toBe('game play ready-city --compact --json');
      expect(payload.next).toBe(top.command);
      expect(server.received.some((message) => message.includes('readReadyCityView'))).toBe(true);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test('surfaces exact informational dismissal command in compact priorities', async () => {
    const { payload, server } = await runPriorities('stale-informational');
    try {
      const top = payload.priorities[0];
      expect(top.kind).toBe('hud:informational-notification');
      expect(top.command).toContain('game play dismiss-notification');
      expect(top.command).toContain("--target '{\"owner\":0,\"id\":89,\"type\":20}'");
      expect(top.command).toContain('<reviewed: notification-volcano-active>');
      expect(payload.next).toBe(top.command);
      expect(top.reason).toContain('live ComponentID');
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test('routes unit-lost reports to reviewed dismissal in compact priorities', async () => {
    const { payload, server } = await runPriorities('unit-lost-report');
    try {
      const top = payload.priorities[0];
      expect(top.kind).toBe('hud:informational-notification');
      expect(top.command).toContain('game play dismiss-notification');
      expect(top.command).toContain("--target '{\"owner\":0,\"id\":34,\"type\":20}'");
      expect(top.command).toContain('<reviewed: notification-unit-lost>');
      expect(payload.next).toBe(top.command);
      expect(top.command).not.toMatch(/enemy|hostile|opponent/i);
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test('routes diplomatic action reports without response options to reviewed dismissal in compact priorities', async () => {
    const { payload, server } = await runPriorities('diplomatic-action-report');
    try {
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
      await server.close();
    }
  });

  test('classifies stale command-units with disabled candidates in compact priorities', async () => {
    const { payload, server } = await runPriorities('stale-unit-command-disabled');
    try {
      const top = payload.priorities[0];
      expect(top.kind).toBe('hud:unit-command-stale-expired');
      expect(top.summary).toContain('no ready unit');
      expect(top.command).toContain('game play end-turn --send');
      expect(payload.next).toBe(top.command);
      expect(top.reason).toContain('normal end-turn path once');
      expect(JSON.stringify(payload.decisionHud.hasSentTurnComplete)).toContain('false');
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test('classifies stale command-units as pending after turn-complete was sent', async () => {
    const { payload, server } = await runPriorities('stale-unit-command-pending');
    try {
      const top = payload.priorities[0];
      expect(top.kind).toBe('hud:unit-command-stale-expired');
      expect(top.summary).toContain('turn-complete was sent');
      expect(top.command).toContain('game watch --count 3');
      expect(payload.next).toBe(top.command);
      expect(top.reason).toContain('turn-complete is already sent');
      expect(JSON.stringify(payload.decisionHud.hasSentTurnComplete)).toContain('true');
      expect(server.received.some((message) => message.includes('sendOperation('))).toBe(false);
    } finally {
      await server.close();
    }
  });
});

async function runPriorities(
  mode: PriorityHudMode,
  options: { compact?: boolean; battlefield?: boolean } = {},
): Promise<{
  payload: {
    contractVersion?: string;
    command?: string;
    summary?: string;
    next?: string | null;
    warnings: string[];
    omitted: Array<{ path: string }>;
    priorities: Array<{ kind: string; command?: string; reason: string; summary: string; evidence?: unknown }>;
    decisionHud: { hasSentTurnComplete?: unknown };
    view?: unknown;
  };
  server: FakeTunerServer;
}> {
  const server = await startPrioritiesTunerServer(mode);
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
      ...(options.compact === false ? [] : ['--compact']),
      ...(options.battlefield ? [] : ['--no-battlefield']),
    ]);
  } finally {
    log.mockRestore();
  }
  return { payload: JSON.parse(writes.join('')), server };
}

async function startPrioritiesTunerServer(mode: PriorityHudMode): Promise<FakeTunerServer> {
  return startFakeTunerServer({
    handle({ message }) {
      if (message.includes('readPlayNotifications')) return [JSON.stringify(priorityHudView(mode))];
      if (message.includes('readReadyUnitView')) return [JSON.stringify(readyUnitView())];
      if (message.includes('readReadyCityView')) {
        return [JSON.stringify(mode === 'clean-read' ? noReadyCityView() : readyCityView())];
      }
      if (message.includes('readBattlefieldScan')) return [JSON.stringify(battlefieldScanView())];
      return undefined;
    },
  });
}

function priorityHudView(mode: PriorityHudMode) {
  if (mode === 'runtime-error') return runtimeErrorHudView();
  if (mode === 'clean-read') return basePriorityHudView({ firstReadyUnitId: null, nextDecision: null });
  if (mode === 'ready-unit') {
    return basePriorityHudView({ firstReadyUnitId: { owner: 0, id: 458752, type: 26 }, nextDecision: null });
  }
  if (mode === 'stale-unit-command' || mode === 'stale-unit-command-disabled' || mode === 'stale-unit-command-pending') {
    return decisionHudView(commandUnitsDecision(mode));
  }
  return decisionHudView(decisionForMode(mode));
}

function runtimeErrorHudView() {
  const gameError = { ok: false as const, error: 'ReferenceError: Game is not defined' };
  return {
    ...basePriorityHudView({ firstReadyUnitId: null, nextDecision: null }),
    turn: gameError,
    turnDate: gameError,
    blocker: gameError,
    blockingNotificationId: gameError,
  };
}

function decisionForMode(mode: Exclude<PriorityHudMode, 'ready-unit' | 'runtime-error' | 'clean-read' | 'stale-unit-command' | 'stale-unit-command-disabled' | 'stale-unit-command-pending'>) {
  const choiceDetails = (kind: string, enabledOptions: unknown[] = [{}]) => ({ kind, enabledOptions });
  switch (mode) {
    case 'first-meet':
      return priorityDecision({
        id: { owner: 0, id: 44, type: 20 },
        category: 'first-meet-diplomacy',
        operationFamily: 'player-operation',
        operationType: 'RESPOND_DIPLOMATIC_FIRST_MEET',
        typeName: 'NOTIFICATION_PLAYER_MET',
        summary: 'You have met Ashoka, World Renouncer of Mauryan Empire.',
        details: {
          kind: 'first-meet-diplomacy',
          recommendedCli: 'game play respond-first-meet --player-id 0 --met-player-id 2 --response neutral',
        },
      });
    case 'tech-choice':
      return priorityDecision({
        id: { owner: 0, id: 52, type: 20 },
        category: 'technology-choice',
        operationFamily: 'player-operation',
        operationType: 'SET_TECH_TREE_NODE',
        typeName: 'NOTIFICATION_CHOOSE_TECH',
        summary: 'Choose a Technology',
        details: choiceDetails('technology-choice-options'),
      });
    case 'culture-choice':
      return priorityDecision({
        id: { owner: 0, id: 62, type: 20 },
        category: 'culture-choice',
        operationFamily: 'player-operation',
        operationType: 'SET_CULTURE_TREE_NODE',
        typeName: 'NOTIFICATION_CHOOSE_CULTURE_NODE',
        summary: 'Choose a Civic',
        details: choiceDetails('culture-choice-options'),
      });
    case 'celebration-choice':
      return priorityDecision({
        id: { owner: 0, id: 110, type: 20 },
        category: 'celebration-choice',
        operationFamily: 'player-operation',
        operationType: 'CHOOSE_GOLDEN_AGE',
        typeName: 'NOTIFICATION_CHOOSE_GOLDEN_AGE',
        summary: 'Choose Celebration',
        details: choiceDetails('celebration-choice-options'),
      });
    case 'government-choice':
      return priorityDecision({
        id: { owner: 0, id: 40, type: 20 },
        category: 'government-choice',
        operationFamily: 'player-operation',
        operationType: 'CHANGE_GOVERNMENT',
        typeName: 'NOTIFICATION_CHOOSE_GOVERNMENT',
        summary: 'Choose a Government',
        details: choiceDetails('government-choice-options'),
      });
    case 'narrative-choice':
      return narrativeDecision([{}]);
    case 'narrative-choice-empty':
      return narrativeDecision([]);
    case 'narrative-choice-visible-panel':
      return narrativeDecision([{ source: 'visible-small-narrative-event' }]);
    case 'tradition-review':
      return priorityDecision({
        id: { owner: 0, id: 92, type: 20 },
        category: 'tradition-review',
        operationFamily: 'player-operation',
        operationType: 'CHANGE_TRADITION',
        typeName: 'NOTIFICATION_CONSIDER_TRADITIONS',
        summary: 'Review your Traditions',
      });
    case 'production-choice':
      return cityBlockerDecision({
        id: { owner: 0, id: 71, type: 20 },
        category: 'production-choice',
        typeName: 'NOTIFICATION_CHOOSE_CITY_PRODUCTION',
        summary: 'Production has completed in this City. Choose what we shall produce next.',
      });
    case 'population-placement':
      return cityBlockerDecision({
        id: { owner: 0, id: 72, type: 20 },
        category: 'population-placement',
        typeName: 'NOTIFICATION_NEW_POPULATION',
        summary: 'Your City is ready to claim and improve a new Rural tile, or assign a Specialist to a workable District.',
      });
    case 'stale-informational':
      return informationalDecision({
        id: { owner: 0, id: 89, type: 20 },
        typeName: 'NOTIFICATION_VOLCANO_ACTIVE',
        summary: 'Hasandagi has become active and can now erupt at any time.',
      });
    case 'unit-lost-report':
      return informationalDecision({
        id: { owner: 0, id: 34, type: 20 },
        typeName: 'NOTIFICATION_UNIT_LOST',
        summary: 'While defending, your Scout was destroyed by a Warrior from Samarkand (44 damage)!',
        firstReadyUnitId: { owner: 0, id: 458754, type: 26 },
      });
    case 'diplomatic-action-report':
      return informationalDecision({
        id: { owner: 0, id: 118, type: 20 },
        typeName: 'NOTIFICATION_DIPLOMATIC_ACTION',
        summary: 'Another Civilization settled a new Town nearby.',
        target: { owner: 2, id: 34, type: 34 },
        firstReadyUnitId: { owner: 0, id: 327682, type: 26 },
        details: {
          kind: 'diplomatic-action-report',
          classification: 'diplomatic-action-report-no-enabled-response-options',
          responseOptionCount: 0,
          enabledResponseOptionCount: 0,
        },
      });
  }
}

function narrativeDecision(enabledOptions: unknown[]) {
  return priorityDecision({
    id: { owner: 0, id: 5, type: 20 },
    category: 'narrative-choice',
    operationFamily: 'player-operation',
    operationType: 'CHOOSE_NARRATIVE_STORY_DIRECTION',
    typeName: 'NOTIFICATION_CHOOSE_DISCOVERY_STORY_DIRECTION',
    summary: 'Choose a selection from the Discovery.',
    details: {
      kind: 'narrative-choice-options',
      enabledOptions,
      dismissalDiagnosticCli: enabledOptions.length > 0
        ? null
        : "game play dismiss-notification --target '{\"owner\":0,\"id\":5,\"type\":20}' --json",
    },
  });
}

function cityBlockerDecision(input: {
  id: { owner: number; id: number; type: number };
  category: 'production-choice' | 'population-placement';
  typeName: string;
  summary: string;
}) {
  return priorityDecision({
    ...input,
    operationFamily: input.category === 'production-choice' ? 'city-operation' : undefined,
    operationType: input.category === 'production-choice' ? 'BUILD' : undefined,
    cli: 'game play ready-city',
    target: { owner: 0, id: 131073, type: 1 },
  });
}

function informationalDecision(input: {
  id: { owner: number; id: number; type: number };
  typeName: string;
  summary: string;
  target?: { owner: number; id: number; type: number };
  firstReadyUnitId?: { owner: number; id: number; type: number };
  details?: unknown;
}) {
  return priorityDecision({
    id: input.id,
    category: 'informational-notification',
    operationFamily: 'app-ui-action',
    operationType: 'Game.Notifications.dismiss',
    typeName: input.typeName,
    summary: input.summary,
    cli: 'game play dismiss-notification',
    target: input.target,
    firstReadyUnitId: input.firstReadyUnitId,
    details: input.details,
  });
}

function commandUnitsDecision(mode: 'stale-unit-command' | 'stale-unit-command-disabled' | 'stale-unit-command-pending') {
  const unitId = { owner: 0, id: 196609, type: 26 };
  const enabled = mode === 'stale-unit-command';
  const hasSentTurnComplete = mode === 'stale-unit-command-pending';
  return priorityDecision({
    id: { owner: 0, id: 88, type: 20 },
    category: 'unit-command',
    operationFamily: 'unit-operation',
    operationType: 'SKIP_TURN',
    typeName: 'NOTIFICATION_COMMAND_UNITS',
    summary: 'Move a Unit or have it perform an operation.',
    cli: 'game play operation --family unit',
    details: {
      kind: 'unit-command-reconciliation',
      classification: enabled ? 'unit-command-closeout-candidates' : 'unit-command-stale-expired',
      hasSentTurnComplete: { ok: true, value: hasSentTurnComplete },
      selectedUnitId: { ok: true, value: null },
      firstReadyUnitId: { ok: true, value: null },
      staleReadyPointerSuspected: enabled,
      staleExpiredWithoutEnabledCloseout: !enabled,
      enabledCloseoutCandidates: enabled
        ? [
            {
              unitId,
              operationType: 'SKIP_TURN',
              cli: `game play operation --family unit --type SKIP_TURN --unit-id '${JSON.stringify(unitId)}' --send --reason '<why this unit has no better operation this turn>'`,
            },
          ]
        : [],
      repairCandidates: enabled
        ? []
        : [
            hasSentTurnComplete
              ? {
                  kind: 'wait-for-turn-advance',
                  cli: 'game watch --count 3 --interval-ms 1000 --include-ready-unit --include-ready-city --jsonl',
                }
              : {
                  kind: 'send-turn-complete',
                  cli: "game play end-turn --send --reason '<stale COMMAND_UNITS has no selected/ready unit and no enabled validator-backed unit closeout>' --json",
                },
          ],
    },
  });
}

function priorityDecision(input: {
  id: { owner: number; id: number; type: number };
  category: string;
  operationFamily?: string;
  operationType?: string;
  typeName: string;
  summary: string;
  message?: string;
  cli?: string;
  target?: { owner: number; id: number; type: number };
  firstReadyUnitId?: { owner: number; id: number; type: number };
  details?: unknown;
}) {
  const nextDecision = {
    notificationId: input.id,
    isEndTurnBlocking: true,
    typeName: input.typeName,
    summary: input.summary,
    message: input.message ?? input.summary,
    target: input.target ?? { owner: -1, id: -1, type: 0 },
    location: null,
    category: input.category,
    operationFamily: input.operationFamily,
    operationType: input.operationType,
    cli: input.cli ?? commandForCategory(input.category),
    details: input.details,
  };
  return basePriorityHudView({
    firstReadyUnitId: input.firstReadyUnitId ?? null,
    blocker: input.category === 'clean-read' ? 0 : 1,
    blockingNotificationId: input.id,
    nextDecision,
  });
}

function basePriorityHudView(input: {
  firstReadyUnitId: { owner: number; id: number; type: number } | null;
  nextDecision: unknown;
  blocker?: number;
  blockingNotificationId?: unknown;
}) {
  const nextDecision = input.nextDecision;
  return {
    localPlayerId: 0,
    turn: { ok: true as const, value: 80 },
    turnDate: { ok: true as const, value: '2025 BCE' },
    hasSentTurnComplete: { ok: true as const, value: false },
    canEndTurn: { ok: true as const, value: false },
    blocker: { ok: true as const, value: input.blocker ?? 0 },
    blockingNotificationId: { ok: true as const, value: input.blockingNotificationId ?? null },
    selectedUnitId: { ok: true as const, value: null },
    selectedCityId: { ok: true as const, value: null },
    firstReadyUnitId: { ok: true as const, value: input.firstReadyUnitId },
    notifications: [],
    decisions: [],
    hud: {
      nextDecision,
      decisionQueue: nextDecision ? [nextDecision] : [],
    },
    limits: { maxNotifications: 25, truncated: false },
  };
}

function decisionHudView(view: ReturnType<typeof basePriorityHudView>) {
  return view;
}

function commandForCategory(category: string) {
  if (category === 'first-meet-diplomacy') return 'game play respond-first-meet';
  if (category === 'technology-choice') return 'game play choose-tech';
  if (category === 'culture-choice') return 'game play choose-culture';
  if (category === 'celebration-choice') return 'game play choose-celebration';
  if (category === 'government-choice') return 'game play choose-government';
  if (category === 'narrative-choice') return 'game play choose-narrative';
  if (category === 'tradition-review') return 'game play traditions';
  return 'game play operation --family unit';
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
    promotionReadiness: { ok: true, value: { canPromote: false } },
    nearby: { ok: true, value: [] },
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
    city: { ok: true, value: { id: cityId, name: 'Dur-Sharrukin', population: 4, isTown: true } },
    legalOperations: [
      {
        family: 'city-operation',
        operationType: 'CONSIDER_TOWN_PROJECT',
        enumValue: 1,
        valid: true,
        result: { Success: true },
      },
    ],
    productionCandidates: { ok: true, value: [{ kind: 'constructible', typeName: 'BUILDING_WALLS' }] },
    townFocusOptions: { ok: true, value: [{ name: 'LOC_PROJECT_FISHING_TOWN_NAME' }] },
    populationPlacement: { ok: true, value: { isReadyToPlacePopulation: { ok: true, value: true } } },
    notes: ['Read-only ready-city view. This view intentionally does not choose production.'],
  };
}

function noReadyCityView() {
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

function battlefieldScanView() {
  const otherOwnerUnit = {
    id: { owner: 9, id: 196608, type: 26 },
    owner: 9,
    stance: 'other',
    relationshipProof: 'none',
    relationshipLabel: 'relationship-unproven',
    typeName: 'UNIT_WARRIOR',
    location: { x: 13, y: 17 },
    distance: 4,
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
  };
  return {
    localPlayerId: 0,
    playerId: 0,
    origins: [{ x: 22, y: 31 }],
    radius: 8,
    hiddenInfoPolicy: 'runtime-debug-summary; may include non-visible units or cities until paired with visibility/map reads',
    relationshipLabelPolicy: {
      relationshipSource: 'not-classified',
      relationshipProof: 'none',
      unprovenLabel: 'relationship-unproven',
    },
    units: [otherOwnerUnit],
    cities: [city],
    owners: [
      {
        owner: 9,
        stance: 'other',
        relationshipProof: 'none',
        relationshipLabel: 'relationship-unproven',
        unitCount: 1,
        cityCount: 1,
      },
    ],
    pointsOfInterest: [
      {
        kind: 'civilian-risk',
        severity: 'high',
        location: { x: 16, y: 18 },
        summary: 'friendly civilian has other-owner contact within 4 tiles',
        units: [otherOwnerUnit],
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
      'Read-only battlefield lens for tactical orientation. It does not path, move, attack, or validate operations.',
      'Owner mismatch is contact evidence, not relationship proof. Use relationship-unproven language until official relationship APIs prove more.',
    ],
  };
}
