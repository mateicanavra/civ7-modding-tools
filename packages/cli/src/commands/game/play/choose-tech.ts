import { Command, Flags } from '@oclif/core';
import { getCiv7PlayNotificationView } from '@civ7/direct-control';
import {
  buildApproval,
  buildDirectControlOptions,
  emitPlayResult,
  executePlayOperationSequence,
  requireSendReason,
  sendPlayOperation,
  validatePlayOperation,
} from '../../../utils/game-play-shared';

const SET_TECH_TREE_NODE = 'SET_TECH_TREE_NODE';
const SET_TECH_TREE_TARGET_NODE = 'SET_TECH_TREE_TARGET_NODE';
const PROGRESSION_TREE_NO_NODE = -1;

export default class GamePlayChooseTech extends Command {
  static id = 'game play choose-tech';
  static summary = 'Validate or choose a technology node';
  static description =
    'Wraps player-operation SET_TECH_TREE_NODE with the official ProgressionTreeNodeType argument.';

  static examples = [
    '<%= config.bin %> game play choose-tech --options --json',
    '<%= config.bin %> game play choose-tech --player-id 0 --node -1255676052 --json',
    '<%= config.bin %> game play choose-tech --player-id 0 --node -1255676052 --send --reason "choose Masonry after advisor warning" --json',
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
    const { flags } = await this.parse(GamePlayChooseTech);
    const options = buildDirectControlOptions(flags);
    if (flags.options) {
      if (flags.send) throw new Error('game play choose-tech --options is read-only; omit --send');
      const view = await getCiv7PlayNotificationView(options);
      const details = technologyChoiceDetails(view);
      const surfaces = details.map(compactTechnologyChoiceSurface);
      const enabledOptionCount = surfaces.reduce((count, surface) => count + surface.enabledOptions.length, 0);
      emitPlayResult(this.log.bind(this), flags.json, {
        command: 'game play choose-tech --options',
        surfaces,
        enabledOptionCount,
        disabledOptionCount: surfaces.reduce((count, surface) => count + surface.disabledOptionCount, 0),
        omitted: [
          { path: 'details[].options', reason: 'use game play notifications --json for raw option and validation evidence' },
          { path: 'details[].disabledOptions', reason: 'disabled nodes are counted here; use notifications --json when disabled-node evidence matters' },
          { path: 'details[].techTrees', reason: 'tree proof is summarized per enabled row' },
        ],
        notes: [
          'Options come from the live notification HUD materializer, which validates SET_TECH_TREE_NODE and SET_TECH_TREE_TARGET_NODE through official PlayerOperations checks.',
          'Use a returned enabled option cli for one caller-level technology selection, or validate a specific node before sending.',
        ],
      });
      return;
    }
    if (typeof flags['player-id'] !== 'number') {
      throw new Error('game play choose-tech requires --player-id unless --options is used');
    }
    if (typeof flags.node !== 'number') {
      throw new Error('game play choose-tech requires --node unless --options is used');
    }
    const reason = requireSendReason(flags.send, flags.reason, 'game play choose-tech');
    const input = {
      operationType: SET_TECH_TREE_NODE,
      playerId: flags['player-id'],
      args: {
        ProgressionTreeNodeType: flags.node,
      },
    };
    if (flags.send || flags.closeout) {
      const before = flags.send ? await getCiv7PlayNotificationView(options) : null;
      const result = await executePlayOperationSequence([
        {
          label: 'choose technology node',
          family: 'player-operation',
          input,
        },
        {
          label: 'clear technology chooser target',
          family: 'player-operation',
          input: {
            operationType: SET_TECH_TREE_TARGET_NODE,
            playerId: flags['player-id'],
            args: {
              ProgressionTreeNodeType: PROGRESSION_TREE_NO_NODE,
            },
          },
        },
      ], options, { send: flags.send, reason });

      if (flags.send && before) {
        const after = await waitForTechnologyChoicePostcondition(before, options);
        const postcondition = technologyChoicePostcondition(before, after);
        emitPlayResult(this.log.bind(this), flags.json, {
          ...result,
          verified: result.verified === true && postcondition.verified,
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
      ? await sendPlayOperation('player-operation', input, options, buildApproval(reason))
      : await validatePlayOperation('player-operation', input, options);

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
      chooseCli: option.cli,
      targetCli: option.targetCli,
      validateCli: option.validateCli,
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

async function waitForTechnologyChoicePostcondition(
  before: Awaited<ReturnType<typeof getCiv7PlayNotificationView>>,
  options: ReturnType<typeof buildDirectControlOptions>,
): Promise<Awaited<ReturnType<typeof getCiv7PlayNotificationView>>> {
  const startedAt = Date.now();
  const timeoutMs = Math.min(Math.max(options.timeoutMs ?? 3_000, 1_000), 6_000);
  let last = await getCiv7PlayNotificationView(options);
  while (Date.now() - startedAt <= timeoutMs) {
    const postcondition = technologyChoicePostcondition(before, last);
    if (postcondition.classification !== 'technology-choice-sticky-blocker') return last;
    await new Promise((resolve) => setTimeout(resolve, 250));
    last = await getCiv7PlayNotificationView(options);
  }
  return last;
}

function technologyChoicePostcondition(
  before: Awaited<ReturnType<typeof getCiv7PlayNotificationView>>,
  after: Awaited<ReturnType<typeof getCiv7PlayNotificationView>>,
): {
  classification:
    | 'turn-unblocked'
    | 'technology-choice-cleared'
    | 'technology-choice-transitioned'
    | 'technology-state-changed-blocker-still-live'
    | 'technology-choice-sticky-blocker';
  verified: boolean;
  reason: string;
} {
  if (probeValue(after.canEndTurn) === true) {
    return {
      classification: 'turn-unblocked',
      verified: true,
      reason: 'The technology choice workflow left the turn unblocked.',
    };
  }
  const beforeBlocker = findTechnologyChoiceNotification(before);
  const afterBlocker = findTechnologyChoiceNotification(after);
  if (beforeBlocker && !afterBlocker) {
    return {
      classification: 'technology-choice-cleared',
      verified: true,
      reason: 'The end-turn-blocking technology choice notification is no longer present.',
    };
  }
  if (beforeBlocker && afterBlocker && !sameNotificationId(beforeBlocker.id, afterBlocker.id)) {
    return {
      classification: 'technology-choice-transitioned',
      verified: true,
      reason: 'The end-turn-blocking technology choice notification changed after the selection.',
    };
  }
  if (beforeBlocker && afterBlocker && technologyChoiceDetailsChanged(beforeBlocker.details, afterBlocker.details)) {
    return {
      classification: 'technology-state-changed-blocker-still-live',
      verified: false,
      reason: 'The technology state changed, but the same technology choice notification still blocks turn flow.',
    };
  }
  return {
    classification: 'technology-choice-sticky-blocker',
    verified: false,
    reason: 'The technology choice workflow returned, but the same technology choice notification still blocks turn flow.',
  };
}

function findTechnologyChoiceNotification(
  view: Awaited<ReturnType<typeof getCiv7PlayNotificationView>>,
): { id?: unknown; details?: unknown } | null {
  return view.notifications.find((notification) => {
    const typeName = String(notification.typeName ?? '').toUpperCase();
    return notification.isEndTurnBlocking === true && typeName.includes('CHOOSE_TECH');
  }) ?? null;
}

function sameNotificationId(left: unknown, right: unknown): boolean {
  if (!isRecord(left) || !isRecord(right)) return left == null && right == null;
  return left.owner === right.owner && left.id === right.id && left.type === right.type;
}

function technologyChoiceDetailsChanged(left: unknown, right: unknown): boolean {
  if (!isRecord(left) || !isRecord(right)) return false;
  return stableJson(probeValue(left.currentResearching)) !== stableJson(probeValue(right.currentResearching))
    || stableJson(probeValue(left.targetNode)) !== stableJson(probeValue(right.targetNode));
}

function stableJson(value: unknown): string {
  return JSON.stringify(value, Object.keys(flattenKeys(value)).sort()) ?? String(value);
}

function flattenKeys(value: unknown, keys: Record<string, true> = {}): Record<string, true> {
  if (Array.isArray(value)) {
    for (const item of value) flattenKeys(item, keys);
    return keys;
  }
  if (!isRecord(value)) return keys;
  for (const [key, child] of Object.entries(value)) {
    keys[key] = true;
    flattenKeys(child, keys);
  }
  return keys;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
