import { Command, Flags } from '@oclif/core';
import { createCiv7ControlOrpcServerClient } from '@civ7/control-orpc';
import { liveCiv7ControlOrpcDirectControlFacade } from '@civ7/control-orpc/runtime';
import { getCiv7PlayNotificationView } from '@civ7/direct-control';
import {
  buildApproval,
  buildDirectControlOptions,
  emitPlayResult,
  parseComponentId,
  requireSendReason,
  validatePlayOperation,
} from '../../../utils/game-play-shared';

const CHOOSE_NARRATIVE_STORY_DIRECTION = 'CHOOSE_NARRATIVE_STORY_DIRECTION';

export default class GamePlayChooseNarrative extends Command {
  static id = 'game play choose-narrative';
  static summary = 'Validate or choose a narrative story direction';
  static description =
    'Validates narrative story direction choices as player operations, or sends them through the native control-oRPC narrative procedure when --send and --reason are explicit.';

  static examples = [
    '<%= config.bin %> game play choose-narrative --options --json',
    '<%= config.bin %> game play choose-narrative --player-id 0 --target-type TOT_30001B --target \'{"owner":0,"id":45,"type":35}\' --action -1326475004 --json',
    '<%= config.bin %> game play choose-narrative --player-id 0 --target-type TOT_30001B --target \'{"owner":0,"id":45,"type":35}\' --action -1326475004 --send --reason "choose first valid story branch" --json',
  ];

  static flags = {
    host: Flags.string({
      description: 'Civ7 tuner socket host',
    }),
    port: Flags.integer({
      description: 'Civ7 tuner socket port',
    }),
    'player-id': Flags.integer({
      description: 'Player id',
    }),
    'target-type': Flags.string({
      description: 'Narrative TargetType value from the live story direction UI',
    }),
    target: Flags.string({
      description: 'Narrative Target ComponentID JSON',
    }),
    action: Flags.integer({
      description: 'Narrative action enum value from the live story direction UI',
    }),
    options: Flags.boolean({
      description: 'Read narrative choice options from the live notification HUD without sending',
      default: false,
    }),
    send: Flags.boolean({
      description: 'Send CHOOSE_NARRATIVE_STORY_DIRECTION after validator success',
      default: false,
    }),
    reason: Flags.string({
      description: 'Required approval reason for --send',
    }),
    'timeout-ms': Flags.integer({
      description: 'Socket timeout',
      default: 45_000,
    }),
    json: Flags.boolean({
      description: 'Emit machine-readable JSON',
      default: false,
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(GamePlayChooseNarrative);
    const options = buildDirectControlOptions(flags);
    if (flags.options) {
      if (flags.send) throw new Error('game play choose-narrative --options is read-only; omit --send');
      const view = await getCiv7PlayNotificationView(options);
      const details = narrativeChoiceDetails(view);
      const surfaces = details.map(compactNarrativeChoiceSurface);
      emitPlayResult(this.log.bind(this), flags.json, {
        command: 'game play choose-narrative --options',
        surfaces,
        enabledOptionCount: surfaces.reduce((count, surface) => count + surface.enabledOptions.length, 0),
        disabledOptionCount: surfaces.reduce((count, surface) => count + surface.disabledOptionCount, 0),
        omitted: [
          { path: 'details[].options', reason: 'use game play notifications --json for raw option and validation evidence' },
          { path: 'details[].disabledOptions', reason: 'disabled narrative buttons are counted here; use notifications --json when disabled-option evidence matters' },
          { path: 'details[].storyLinks', reason: 'official story-link rows are summarized per enabled row' },
        ],
        notes: [
          'Options come from the live notification HUD materializer, which mirrors official narrative popup buttons and validates CHOOSE_NARRATIVE_STORY_DIRECTION through PlayerOperations.',
          'Use a returned enabled option cli as the single caller-level narrative choice.',
        ],
      });
      return;
    }
    if (typeof flags['player-id'] !== 'number') {
      throw new Error('game play choose-narrative requires --player-id unless --options is used');
    }
    if (!flags['target-type']) {
      throw new Error('game play choose-narrative requires --target-type unless --options is used');
    }
    if (!flags.target) {
      throw new Error('game play choose-narrative requires --target unless --options is used');
    }
    if (typeof flags.action !== 'number') {
      throw new Error('game play choose-narrative requires --action unless --options is used');
    }
    const reason = requireSendReason(flags.send, flags.reason, 'game play choose-narrative');
    const target = parseComponentId(flags.target, 'target');
    const input = {
      operationType: CHOOSE_NARRATIVE_STORY_DIRECTION,
      playerId: flags['player-id'],
      args: {
        TargetType: flags['target-type'],
        Target: target,
        Action: flags.action,
      },
    };
    const result = flags.send
      ? await createCiv7ControlOrpcServerClient({
          directControl: liveCiv7ControlOrpcDirectControlFacade,
          endpointDefaults: options,
          approval: buildApproval(reason),
        }).narrative.choice.request({
          playerId: flags['player-id'],
          targetType: flags['target-type'],
          target,
          action: flags.action,
        })
      : await validatePlayOperation('player-operation', input, options);

    emitPlayResult(this.log.bind(this), flags.json, result);
  }
}

function narrativeChoiceDetails(view: Awaited<ReturnType<typeof getCiv7PlayNotificationView>>): Record<string, unknown>[] {
  const details = [
    ...view.notifications.map((notification) => notification.details),
    view.hud?.nextDecision?.details,
    ...((view.hud?.decisionQueue ?? []).map((decision) => decision.details)),
  ];
  const seen = new Set<string>();
  return details.filter((detail): detail is Record<string, unknown> => {
    if (!detail || typeof detail !== 'object') return false;
    const record = detail as Record<string, unknown>;
    if (record.kind !== 'narrative-choice-options') return false;
    const key = JSON.stringify(record.notificationId ?? record.targetStoryId ?? record.localPlayerId);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function compactNarrativeChoiceSurface(details: Record<string, unknown>): {
  kind: 'narrative-choice-options';
  classification: unknown;
  notificationId: unknown;
  localPlayerId: unknown;
  notificationOwner: unknown;
  targetStoryIdSource: unknown;
  pendingStoryId: unknown;
  pendingDiscoveryStoryId: unknown;
  targetStoryId: unknown;
  visiblePanelTargetStoryId: unknown;
  enabledOptions: Array<Record<string, unknown>>;
  enabledOptionCount: number;
  disabledOptionCount: number;
  dismissalDiagnosticCli: unknown;
  unprovenDismissalCli: unknown;
  notes: unknown;
} {
  const visiblePanel = probeValue(details.visiblePanel);
  const visiblePanelRecord = visiblePanel && typeof visiblePanel === 'object'
    ? visiblePanel as Record<string, unknown>
    : null;
  const enabledOptions = asArray(details.enabledOptions)
    .filter((option): option is Record<string, unknown> => Boolean(option && typeof option === 'object'))
    .map((option) => ({
      source: option.source,
      targetType: option.targetType,
      targetTypeName: option.targetTypeName,
      target: option.target,
      action: option.action,
      activation: option.activation,
      name: option.name,
      reward: option.reward,
      imperative: option.imperative,
      cost: option.cost,
      chooseCli: option.cli,
      validateCli: option.validateCli,
    }));
  return {
    kind: 'narrative-choice-options',
    classification: details.classification ?? null,
    notificationId: details.notificationId ?? null,
    localPlayerId: details.localPlayerId ?? null,
    notificationOwner: details.notificationOwner ?? null,
    targetStoryIdSource: details.targetStoryIdSource ?? null,
    pendingStoryId: probeValue(details.pendingStoryId),
    pendingDiscoveryStoryId: probeValue(details.pendingDiscoveryStoryId),
    targetStoryId: probeValue(details.targetStoryId),
    visiblePanelTargetStoryId: probeValue(visiblePanelRecord?.targetStoryId),
    enabledOptions,
    enabledOptionCount: enabledOptions.length,
    disabledOptionCount: asArray(details.disabledOptions).length,
    dismissalDiagnosticCli: typeof details.dismissalDiagnosticCli === 'string' ? details.dismissalDiagnosticCli : null,
    unprovenDismissalCli: typeof details.unprovenDismissalCli === 'string' ? details.unprovenDismissalCli : null,
    notes: asArray(details.notes),
  };
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function probeValue(value: unknown): unknown {
  if (value && typeof value === 'object' && 'ok' in value) {
    const probe = value as { ok?: unknown; value?: unknown };
    return probe.ok === true ? probe.value ?? null : null;
  }
  return value ?? null;
}
