import { Command, Flags } from '@oclif/core';
import { createCiv7ControlOrpcServerClient } from '@civ7/control-orpc';
import { liveCiv7ControlOrpcDirectControlFacade } from '@civ7/control-orpc/runtime';
import { getCiv7PlayNotificationView } from '@civ7/direct-control';
import {
  buildDirectControlOptions,
  emitPlayResult,
  validatePlayOperation,
} from '../../../utils/game-play-shared';

const CHOOSE_GOLDEN_AGE = 'CHOOSE_GOLDEN_AGE';

export default class GamePlayChooseCelebration extends Command {
  static id = 'game play choose-celebration';
  static summary = 'Validate or choose a celebration bonus';
  static description =
    'Wraps player-operation CHOOSE_GOLDEN_AGE with the GoldenAgeType hash from the live celebration chooser.';

  static examples = [
    '<%= config.bin %> game play choose-celebration --options --json',
    '<%= config.bin %> game play choose-celebration --player-id 0 --golden-age-type -340825966 --json',
    '<%= config.bin %> game play choose-celebration --golden-age-type -340825966 --send --json',
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
    'golden-age-type': Flags.integer({
      description: 'GoldenAgeType hash from the live celebration chooser',
    }),
    options: Flags.boolean({
      description: 'Read celebration choice options from the live notification HUD without sending',
      default: false,
    }),
    send: Flags.boolean({
      description: 'Send CHOOSE_GOLDEN_AGE after validator success',
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
    const { flags } = await this.parse(GamePlayChooseCelebration);
    const options = buildDirectControlOptions(flags);
    if (flags.options) {
      if (flags.send) throw new Error('game play choose-celebration --options is read-only; omit --send');
      const view = await getCiv7PlayNotificationView(options);
      const details = celebrationChoiceDetails(view);
      const surfaces = details.map(compactCelebrationChoiceSurface);
      emitPlayResult(this.log.bind(this), flags.json, {
        command: 'game play choose-celebration --options',
        surfaces,
        enabledOptionCount: surfaces.reduce((count, surface) => count + surface.enabledOptions.length, 0),
        disabledOptionCount: surfaces.reduce((count, surface) => count + surface.disabledOptionCount, 0),
        omitted: [
          { path: 'details[].options', reason: 'use game play notifications --json for raw option and validation evidence' },
          { path: 'details[].disabledOptions', reason: 'disabled choices are counted here; use notifications --json when disabled-choice evidence matters' },
          { path: 'details[].choices', reason: 'official chooser source choices are summarized per enabled row' },
        ],
        notes: [
          'Options come from the live notification HUD materializer, which mirrors the official celebration chooser and validates CHOOSE_GOLDEN_AGE through PlayerOperations.',
          'Use a returned enabled option cli as the single caller-level celebration choice.',
        ],
      });
      return;
    }
    if (typeof flags['golden-age-type'] !== 'number') {
      throw new Error('game play choose-celebration requires --golden-age-type unless --options is used');
    }
    if (flags.send) {
      const result = await createCiv7ControlOrpcServerClient({
        directControl: liveCiv7ControlOrpcDirectControlFacade,
        endpointDefaults: options,
      }).government.celebration.choice.request({
        goldenAgeType: flags['golden-age-type'],
      });
      emitPlayResult(this.log.bind(this), flags.json, result);
      return;
    }
    if (typeof flags['player-id'] !== 'number') {
      throw new Error('game play choose-celebration requires --player-id unless --options is used');
    }
    const input = {
      operationType: CHOOSE_GOLDEN_AGE,
      playerId: flags['player-id'],
      args: {
        GoldenAgeType: flags['golden-age-type'],
      },
    };
    const result = await validatePlayOperation('player-operation', input, options);

    emitPlayResult(this.log.bind(this), flags.json, result);
  }
}

function celebrationChoiceDetails(view: Awaited<ReturnType<typeof getCiv7PlayNotificationView>>): Record<string, unknown>[] {
  const details = [
    ...view.notifications.map((notification) => notification.details),
    view.hud?.nextDecision?.details,
    ...((view.hud?.decisionQueue ?? []).map((decision) => decision.details)),
  ];
  const seen = new Set<string>();
  return details.filter((detail): detail is Record<string, unknown> => {
    if (!detail || typeof detail !== 'object') return false;
    const record = detail as Record<string, unknown>;
    if (record.kind !== 'celebration-choice-options') return false;
    const key = JSON.stringify(record.notificationId ?? record.currentGovernmentType ?? record.localPlayerId);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function compactCelebrationChoiceSurface(details: Record<string, unknown>): {
  kind: 'celebration-choice-options';
  notificationId: unknown;
  localPlayerId: unknown;
  currentGovernmentType: unknown;
  goldenAgeDuration: unknown;
  enabledOptions: Array<Record<string, unknown>>;
  enabledOptionCount: number;
  disabledOptionCount: number;
} {
  const enabledOptions = asArray(details.enabledOptions)
    .filter((option): option is Record<string, unknown> => Boolean(option && typeof option === 'object'))
    .map((option) => ({
      goldenAgeType: option.goldenAgeType,
      goldenAgeTypeName: option.goldenAgeTypeName,
      name: option.name,
      description: option.description,
      duration: option.duration,
      chooseCli: celebrationChoiceSendCli(option),
      validateCli: option.validateCli,
    }));
  return {
    kind: 'celebration-choice-options',
    notificationId: details.notificationId ?? null,
    localPlayerId: details.localPlayerId ?? null,
    currentGovernmentType: probeValue(details.currentGovernmentType),
    goldenAgeDuration: probeValue(details.goldenAgeDuration),
    enabledOptions,
    enabledOptionCount: enabledOptions.length,
    disabledOptionCount: asArray(details.disabledOptions).length,
  };
}

function celebrationChoiceSendCli(option: Record<string, unknown>): string | null {
  if (typeof option.goldenAgeType !== 'number') return null;
  return `game play choose-celebration --golden-age-type ${option.goldenAgeType} --send`;
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
