import { Command, Flags } from '@oclif/core';
import {
  cultureChoicePostcondition,
  findCultureChoiceNotification,
  getCiv7PlayNotificationView,
  requestCiv7CultureChoiceCloseout,
} from '@civ7/direct-control';
import {
  buildDirectControlOptions,
  emitPlayResult,
  executePlayOperationSequence,
  sendPlayOperation,
  validatePlayOperation,
} from '../../../utils/game-play-shared';

const SET_CULTURE_TREE_NODE = 'SET_CULTURE_TREE_NODE';
const SET_CULTURE_TREE_TARGET_NODE = 'SET_CULTURE_TREE_TARGET_NODE';
const PROGRESSION_TREE_NO_NODE = -1;

export default class GamePlayChooseCulture extends Command {
  static id = 'game play choose-culture';
  static summary = 'Validate or choose a culture tree node';
  static description =
    'Wraps player-operation SET_CULTURE_TREE_NODE with the official ProgressionTreeNodeType argument.';

  static examples = [
    '<%= config.bin %> game play choose-culture --options --json',
    '<%= config.bin %> game play choose-culture --player-id 0 --node 115 --json',
    '<%= config.bin %> game play choose-culture --player-id 0 --node 115 --send --json',
    '<%= config.bin %> game play choose-culture --player-id 0 --node -1677668973 --send --closeout --json',
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
      description: 'Read culture choice options from the live notification HUD without sending',
      default: false,
    }),
    send: Flags.boolean({
      description: 'Send SET_CULTURE_TREE_NODE after validator success',
      default: false,
    }),
    closeout: Flags.boolean({
      description: 'Also clear the chooser target node as part of the same caller-level workflow',
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
    const { flags } = await this.parse(GamePlayChooseCulture);
    const options = buildDirectControlOptions(flags);
    if (flags.options) {
      if (flags.send) throw new Error('game play choose-culture --options is read-only; omit --send');
      const view = await getCiv7PlayNotificationView(options);
      const details = cultureChoiceDetails(view);
      const surfaces = details.map(compactCultureChoiceSurface);
      emitPlayResult(this.log.bind(this), flags.json, {
        command: 'game play choose-culture --options',
        surfaces,
        enabledOptionCount: surfaces.reduce((count, surface) => count + surface.enabledOptions.length, 0),
        disabledOptionCount: surfaces.reduce((count, surface) => count + surface.disabledOptionCount, 0),
        omitted: [
          { path: 'details[].options', reason: 'use game play notifications --json for raw option and validation evidence' },
          { path: 'details[].disabledOptions', reason: 'disabled nodes are counted here; use notifications --json when disabled-node evidence matters' },
          { path: 'details[].availableNodeTypes', reason: 'official culture chooser source nodes are summarized per enabled row' },
        ],
        notes: [
          'Options come from the live notification HUD materializer, which validates SET_CULTURE_TREE_NODE and SET_CULTURE_TREE_TARGET_NODE through official PlayerOperations checks.',
          'Use a returned enabled option cli for one caller-level chooser closeout workflow, or validate a specific node before sending.',
        ],
      });
      return;
    }
    if (typeof flags['player-id'] !== 'number') {
      throw new Error('game play choose-culture requires --player-id unless --options is used');
    }
    if (typeof flags.node !== 'number') {
      throw new Error('game play choose-culture requires --node unless --options is used');
    }    const input = {
      operationType: SET_CULTURE_TREE_NODE,
      playerId: flags['player-id'],
      args: {
        ProgressionTreeNodeType: flags.node,
      },
    };
    if (flags.closeout) {
      const before = flags.send ? await getCiv7PlayNotificationView(options) : null;
      const result = flags.send
        ? await cultureChoiceAppUiCloseoutResult({
          playerId: flags['player-id'],
          node: flags.node,
          notificationId: before ? findCultureChoiceNotification(before)?.id : undefined,
        }, options)
        : await executePlayOperationSequence([
          {
            label: 'choose culture node',
            family: 'player-operation',
            input,
          },
          {
            label: 'clear culture chooser target',
            family: 'player-operation',
            input: {
              operationType: SET_CULTURE_TREE_TARGET_NODE,
              playerId: flags['player-id'],
              args: {
                ProgressionTreeNodeType: PROGRESSION_TREE_NO_NODE,
              },
            },
          },
        ], options, { send: flags.send });

      if (flags.send && before) {
        const after = await waitForCultureChoicePostcondition(before, options);
        const postcondition = cultureChoicePostcondition(before, after);
        const operationSent = closeoutOperationSent(result);
        emitPlayResult(this.log.bind(this), flags.json, {
          ...result,
          verified: operationSent && postcondition.verified,
          before,
          after,
          postcondition,
        });
        return;
      }

      emitPlayResult(this.log.bind(this), flags.json, result);
      return;
    }

    const result = flags.send
      ? await sendPlayOperation('player-operation', input, options)
      : await validatePlayOperation('player-operation', input, options);

    emitPlayResult(this.log.bind(this), flags.json, result);
  }
}

function cultureChoiceDetails(view: Awaited<ReturnType<typeof getCiv7PlayNotificationView>>): Record<string, unknown>[] {
  const details = [
    ...view.notifications.map((notification) => notification.details),
    view.hud?.nextDecision?.details,
    ...((view.hud?.decisionQueue ?? []).map((decision) => decision.details)),
  ];
  const seen = new Set<string>();
  return details.filter((detail): detail is Record<string, unknown> => {
    if (!detail || typeof detail !== 'object') return false;
    const record = detail as Record<string, unknown>;
    if (record.kind !== 'culture-choice-options') return false;
    const key = JSON.stringify(record.notificationId ?? record.targetNode ?? record.currentResearching ?? record.localPlayerId);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function compactCultureChoiceSurface(details: Record<string, unknown>): {
  kind: 'culture-choice-options';
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
      chooseCli: option.cli,
      targetCli: option.targetCli,
      validateCli: option.validateCli,
    }));
  return {
    kind: 'culture-choice-options',
    notificationId: details.notificationId ?? null,
    localPlayerId: details.localPlayerId ?? null,
    currentResearching: probeValue(details.currentResearching),
    targetNode: probeValue(details.targetNode),
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

async function cultureChoiceAppUiCloseoutResult(
  input: { playerId: number; node: number; notificationId?: unknown },
  options: ReturnType<typeof buildDirectControlOptions>,
) {
  const result = await requestCiv7CultureChoiceCloseout({
    playerId: input.playerId,
    node: input.node,
    notificationId: isComponentId(input.notificationId) ? input.notificationId : undefined,
  }, options);
  const payload = isRecord(result.payload) ? result.payload : {};
  return {
    mode: 'send',
    stepCount: 2,
    operationSent: result.sent,
    steps: [
      {
        label: 'choose culture node',
        family: 'player-operation',
        operationType: SET_CULTURE_TREE_NODE,
        result: {
          canStart: payload.canChoose ?? null,
          send: payload.chooseResult ?? null,
        },
      },
      {
        label: 'clear culture chooser target',
        family: 'player-operation',
        operationType: SET_CULTURE_TREE_TARGET_NODE,
        result: {
          canStart: payload.canClearTarget ?? null,
          send: payload.clearTargetResult ?? null,
        },
      },
    ],
    appUiCloseout: result,
    notes: [
      'Executed in App UI as the culture chooser owner: optional notification activation, culture node choice, then target-node closeout.',
      'Postcondition verification still comes from the caller-level notification re-read.',
    ],
  };
}

async function waitForCultureChoicePostcondition(
  before: Awaited<ReturnType<typeof getCiv7PlayNotificationView>>,
  options: ReturnType<typeof buildDirectControlOptions>,
): Promise<Awaited<ReturnType<typeof getCiv7PlayNotificationView>>> {
  const startedAt = Date.now();
  const timeoutMs = Math.min(Math.max(options.timeoutMs ?? 3_000, 1_000), 6_000);
  let last = await getCiv7PlayNotificationView(options);
  while (Date.now() - startedAt <= timeoutMs) {
    const postcondition = cultureChoicePostcondition(before, last);
    if (postcondition.classification !== 'culture-choice-sticky-blocker') return last;
    await new Promise((resolve) => setTimeout(resolve, 250));
    last = await getCiv7PlayNotificationView(options);
  }
  return last;
}

function isComponentId(value: unknown): value is { owner: number; id: number; type?: number } {
  return isRecord(value)
    && typeof value.owner === 'number'
    && typeof value.id === 'number'
    && (value.type === undefined || typeof value.type === 'number');
}

function closeoutOperationSent(value: unknown): boolean {
  return isRecord(value) && value.operationSent === true;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
