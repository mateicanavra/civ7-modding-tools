import { Command, Flags } from '@oclif/core';
import { getCiv7PlayNotificationView } from '@civ7/direct-control';
import {
  buildDirectControlOptions,
  emitPlayResult,
  sendPlayOperation,
  validatePlayOperation,
} from '../../../utils/game-play-shared';

const CHANGE_GOVERNMENT = 'CHANGE_GOVERNMENT';

export default class GamePlayChooseGovernment extends Command {
  static id = 'game play choose-government';
  static summary = 'Validate or choose a government';
  static description =
    'Wraps player-operation CHANGE_GOVERNMENT with the official GovernmentType and Activate action from the live government picker.';

  static examples = [
    '<%= config.bin %> game play choose-government --options --json',
    '<%= config.bin %> game play choose-government --player-id 0 --government-type 0 --json',
    '<%= config.bin %> game play choose-government --player-id 0 --government-type 0 --send --json',
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
    'government-type': Flags.integer({
      description: 'GovernmentType index from the live government picker options',
    }),
    action: Flags.integer({
      description: 'PlayerOperationParameters action. Defaults to Activate.',
    }),
    options: Flags.boolean({
      description: 'Read government choice options from the live notification HUD without sending',
      default: false,
    }),
    send: Flags.boolean({
      description: 'Send CHANGE_GOVERNMENT after validator success',
      default: false,
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
    const { flags } = await this.parse(GamePlayChooseGovernment);
    const options = buildDirectControlOptions(flags);
    if (flags.options) {
      if (flags.send) throw new Error('game play choose-government --options is read-only; omit --send');
      const view = await getCiv7PlayNotificationView(options);
      const details = governmentChoiceDetails(view);
      const surfaces = details.map(compactGovernmentChoiceSurface);
      emitPlayResult(this.log.bind(this), flags.json, {
        command: 'game play choose-government --options',
        surfaces,
        enabledOptionCount: surfaces.reduce((count, surface) => count + surface.enabledOptions.length, 0),
        disabledOptionCount: surfaces.reduce((count, surface) => count + surface.disabledOptionCount, 0),
        omitted: [
          { path: 'details[].options', reason: 'use game play notifications --json for raw option and validation evidence' },
          { path: 'details[].disabledOptions', reason: 'disabled governments are counted here; use notifications --json when disabled-option evidence matters' },
        ],
        notes: [
          'Options come from the live notification HUD materializer, which mirrors the official government picker and validates CHANGE_GOVERNMENT through PlayerOperations.',
          'Use a returned enabled option cli as the single caller-level government choice.',
        ],
      });
      return;
    }
    if (typeof flags['player-id'] !== 'number') {
      throw new Error('game play choose-government requires --player-id unless --options is used');
    }
    if (typeof flags['government-type'] !== 'number') {
      throw new Error('game play choose-government requires --government-type unless --options is used');
    }    const input = {
      operationType: CHANGE_GOVERNMENT,
      playerId: flags['player-id'],
      args: {
        GovernmentType: flags['government-type'],
        Action: flags.action ?? -1326475004,
      },
    };
    const result = flags.send
      ? await sendPlayOperation('player-operation', input, options)
      : await validatePlayOperation('player-operation', input, options);

    emitPlayResult(this.log.bind(this), flags.json, result);
  }
}

function governmentChoiceDetails(view: Awaited<ReturnType<typeof getCiv7PlayNotificationView>>): Record<string, unknown>[] {
  const details = [
    ...view.notifications.map((notification) => notification.details),
    view.hud?.nextDecision?.details,
    ...((view.hud?.decisionQueue ?? []).map((decision) => decision.details)),
  ];
  const seen = new Set<string>();
  return details.filter((detail): detail is Record<string, unknown> => {
    if (!detail || typeof detail !== 'object') return false;
    const record = detail as Record<string, unknown>;
    if (record.kind !== 'government-choice-options') return false;
    const key = JSON.stringify(record.notificationId ?? record.currentGovernmentType ?? record.localPlayerId);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function compactGovernmentChoiceSurface(details: Record<string, unknown>): {
  kind: 'government-choice-options';
  notificationId: unknown;
  localPlayerId: unknown;
  currentGovernmentType: unknown;
  action: unknown;
  enabledOptions: Array<Record<string, unknown>>;
  enabledOptionCount: number;
  disabledOptionCount: number;
} {
  const enabledOptions = asArray(details.enabledOptions)
    .filter((option): option is Record<string, unknown> => Boolean(option && typeof option === 'object'))
    .map((option) => ({
      governmentType: option.governmentType,
      governmentTypeName: option.governmentTypeName,
      name: option.name,
      description: option.description,
      action: option.action,
      celebrationOptions: option.celebrationOptions,
      chooseCli: option.cli,
      validateCli: option.validateCli,
    }));
  return {
    kind: 'government-choice-options',
    notificationId: details.notificationId ?? null,
    localPlayerId: details.localPlayerId ?? null,
    currentGovernmentType: probeValue(details.currentGovernmentType),
    action: details.action ?? null,
    enabledOptions,
    enabledOptionCount: enabledOptions.length,
    disabledOptionCount: asArray(details.disabledOptions).length,
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
