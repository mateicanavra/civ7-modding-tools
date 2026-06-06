import { Command, Flags } from '@oclif/core';
import { createCiv7ControlOrpcServerClient } from '@civ7/control-orpc';
import { liveCiv7ControlOrpcDirectControlFacade } from '@civ7/control-orpc/runtime';
import {
  getCiv7PlayNotificationView,
} from '@civ7/direct-control';
import {
  buildDirectControlOptions,
  emitPlayResult,
  validatePlayOperation,
} from '../../../utils/game-play-shared';

const SET_TECH_TREE_NODE = 'SET_TECH_TREE_NODE';

type ProgressionOptionAction = {
  kind: 'choose-technology' | 'target-technology' | 'validate-technology-choice';
  label: string;
  parameters: Record<string, unknown>;
  readOnly: boolean;
  sendsMutation: boolean;
};

export default class GamePlayChooseTech extends Command {
  static id = 'game play choose-tech';
  static summary = 'Validate or choose a technology node';
  static description =
    'Validates technology choices as player operations, or sends them through the native control-oRPC progression procedure when --send is explicit.';

  static examples = [
    '<%= config.bin %> game play choose-tech --options --json',
    '<%= config.bin %> game play choose-tech --player-id 0 --node -1255676052 --json',
    '<%= config.bin %> game play choose-tech --node -1255676052 --send --json',
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
    node: Flags.integer({
      description: 'ProgressionTreeNodeType id from live GameInfo/progression tree reads',
    }),
    options: Flags.boolean({
      description: 'Read technology choice options from the live notification HUD without sending',
      default: false,
    }),
    send: Flags.boolean({
      description: 'Send SET_TECH_TREE_NODE after validator success',
      default: false,
    }),
    closeout: Flags.boolean({
      description: 'Compatibility no-op; send mode already clears the chooser target as one caller-level workflow',
      default: false,
      hidden: true,
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
    const { flags } = await this.parse(GamePlayChooseTech);
    const options = buildDirectControlOptions(flags);
    if (flags.options) {
      if (flags.send) throw new Error('game play choose-tech --options is read-only; omit --send');
      const view = await getCiv7PlayNotificationView(options);
      const details = technologyChoiceDetails(view);
      const surfaces = details.map(compactTechnologyChoiceSurface);
      const enabledOptionCount = surfaces.reduce((count, surface) => count + surface.enabledOptions.length, 0);
      emitPlayResult(this.log.bind(this), flags.json, {
        surface: 'technology-choice-options',
        surfaces,
        enabledOptionCount,
        disabledOptionCount: surfaces.reduce((count, surface) => count + surface.disabledOptionCount, 0),
        omitted: [
          { path: 'details[].options', reason: 'enabled rows carry semantic node fields and validation descriptors' },
          { path: 'details[].disabledOptions', reason: 'disabled nodes are counted but kept out of mutation action recommendations' },
          { path: 'details[].techTrees', reason: 'tree proof is summarized on enabled rows' },
        ],
        notes: [
          'Rows come from live HUD choices with official technology validation evidence.',
        ],
      });
      return;
    }
    if (typeof flags.node !== 'number') {
      throw new Error('game play choose-tech requires --node unless --options is used');
    }
    if (flags.send) {
      const result = await createCiv7ControlOrpcServerClient({
        directControl: liveCiv7ControlOrpcDirectControlFacade,
        endpointDefaults: options,
      }).progression.technology.choice.request({
        node: flags.node,
      });
      emitPlayResult(this.log.bind(this), flags.json, result);
      return;
    }
    if (typeof flags['player-id'] !== 'number') {
      throw new Error('game play choose-tech requires --player-id unless --options or --send is used');
    }
    const input = {
      operationType: SET_TECH_TREE_NODE,
      playerId: flags['player-id'],
      args: {
        ProgressionTreeNodeType: flags.node,
      },
    };
    const result = await validatePlayOperation('player-operation', input, options);

    emitPlayResult(this.log.bind(this), flags.json, result);
  }
}

function technologyChoiceDetails(view: Awaited<ReturnType<typeof getCiv7PlayNotificationView>>): Record<string, unknown>[] {
  const details = [
    ...view.notifications.map((notification) => notification.details),
    view.hud?.nextDecision?.details,
    ...((view.hud?.decisionQueue ?? []).map((decision) => decision.details)),
  ];
  const seen = new Set<string>();
  return details.filter((detail): detail is Record<string, unknown> => {
    if (!detail || typeof detail !== 'object') return false;
    const record = detail as Record<string, unknown>;
    if (record.kind !== 'technology-choice-options') return false;
    const key = JSON.stringify(record.notificationId ?? record.targetNode ?? record.currentResearching ?? record.localPlayerId);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function compactTechnologyChoiceSurface(details: Record<string, unknown>): {
  kind: 'technology-choice-options';
  notificationId: unknown;
  localPlayerId: unknown;
  currentResearching: unknown;
  targetNode: unknown;
  enabledOptions: Array<Record<string, unknown>>;
  enabledOptionCount: number;
  disabledOptionCount: number;
} {
  const enabledOptions = asArray(details.enabledOptions)
    .filter((option): option is Record<string, unknown> => Boolean(option && typeof option === 'object'))
    .map((option) => ({
      nodeType: option.nodeType,
      nodeTypeName: option.nodeTypeName,
      name: option.name,
      treeType: option.treeType,
      treeTypeName: option.treeTypeName,
      treeName: option.treeName,
      ageType: option.ageType,
      depth: option.depth,
      state: option.state,
      progress: option.progress,
      maxDepth: option.maxDepth,
      turns: probeValue(option.turns),
      cost: probeValue(option.cost),
      nextAction: progressionOptionAction('choose-technology', option),
      targetAction: progressionOptionAction('target-technology', option),
      validationAction: progressionOptionAction('validate-technology-choice', option),
    }));
  return {
    kind: 'technology-choice-options',
    notificationId: details.notificationId ?? null,
    localPlayerId: details.localPlayerId ?? null,
    currentResearching: probeValue(details.currentResearching),
    targetNode: probeValue(details.targetNode),
    enabledOptions,
    enabledOptionCount: enabledOptions.length,
    disabledOptionCount: asArray(details.disabledOptions).length,
  };
}

function progressionOptionAction(
  kind: ProgressionOptionAction['kind'],
  option: Record<string, unknown>,
): ProgressionOptionAction {
  const readOnly = kind === 'validate-technology-choice';
  return {
    kind,
    label: kind === 'choose-technology'
      ? 'Choose technology.'
      : kind === 'target-technology'
        ? 'Set technology target.'
        : 'Validate technology choice.',
    parameters: {
      node: option.nodeType,
      nodeTypeName: option.nodeTypeName,
    },
    readOnly,
    sendsMutation: !readOnly,
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
