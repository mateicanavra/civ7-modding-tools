import { Command, Flags } from '@oclif/core';
import {
  buildApproval,
  buildDirectControlOptions,
  emitPlayResult,
  requireSendReason,
  sendPlayOperation,
  validatePlayOperation,
} from '../../../utils/game-play-shared';
import {
  executeCiv7AppUiCommand,
  getCiv7PlayNotificationView,
  type Civ7DirectControlOptions,
} from '@civ7/direct-control';

const RESPOND_DIPLOMATIC_FIRST_MEET = 'RESPOND_DIPLOMATIC_FIRST_MEET';
const FIRST_MEET_RESPONSE_KEYS = {
  friendly: 'PLAYER_REALATIONSHIP_FIRSTMEET_FRIENDLY',
  neutral: 'PLAYER_REALATIONSHIP_FIRSTMEET_NEUTRAL',
  unfriendly: 'PLAYER_REALATIONSHIP_FIRSTMEET_UNFRIENDLY',
} as const;

type FirstMeetResponse = keyof typeof FIRST_MEET_RESPONSE_KEYS;

export default class GamePlayRespondFirstMeet extends Command {
  static id = 'game play respond-first-meet';
  static summary = 'Validate or send a first-meet diplomacy greeting';
  static description =
    'Wraps player-operation RESPOND_DIPLOMATIC_FIRST_MEET with the two player ids and first-meet greeting Type from the live first-meet UI.';

  static examples = [
    '<%= config.bin %> game play respond-first-meet --player-id 0 --met-player-id 2 --response neutral --json',
    '<%= config.bin %> game play respond-first-meet --player-id 0 --met-player-id 2 --response neutral --send --reason "neutral first-meet greeting" --json',
  ];

  static flags = {
    host: Flags.string({
      description: 'Civ7 tuner socket host',
    }),
    port: Flags.integer({
      description: 'Civ7 tuner socket port',
    }),
    'player-id': Flags.integer({
      description: 'Local player id',
      required: true,
    }),
    'met-player-id': Flags.integer({
      description: 'Other player id from the live first-meet notification or diplomacy panel',
      required: true,
    }),
    'response-type': Flags.integer({
      description: 'First-meet response Type enum value from the live first-meet UI',
      exclusive: ['response'],
    }),
    response: Flags.string({
      description: 'Resolve a named first-meet greeting through the live App UI enum',
      options: ['friendly', 'neutral', 'unfriendly'],
      exclusive: ['response-type'],
    }),
    send: Flags.boolean({
      description: 'Send RESPOND_DIPLOMATIC_FIRST_MEET after validator success',
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
    const { flags } = await this.parse(GamePlayRespondFirstMeet);
    const reason = requireSendReason(flags.send, flags.reason, 'game play respond-first-meet');
    const options = buildDirectControlOptions(flags);
    const responseType = flags['response-type'] ?? await resolveFirstMeetResponseType(flags.response as FirstMeetResponse | undefined, options);
    const input = {
      operationType: RESPOND_DIPLOMATIC_FIRST_MEET,
      playerId: flags['player-id'],
      args: {
        Player1: flags['player-id'],
        Player2: flags['met-player-id'],
        Type: responseType,
      },
    };
    const before = flags.send ? await getCiv7PlayNotificationView(options) : null;
    const result = flags.send
      ? await sendPlayOperation('player-operation', input, options, buildApproval(reason))
      : await validatePlayOperation('player-operation', input, options);

    if (flags.send && before) {
      const after = await waitForFirstMeetPostcondition(before, options, flags['met-player-id']);
      const postcondition = firstMeetPostcondition(before, after, flags['met-player-id']);
      emitPlayResult(this.log.bind(this), flags.json, {
        ...result,
        verified: operationSent(result) && postcondition.verified,
        before,
        after,
        postcondition,
      });
      return;
    }

    emitPlayResult(this.log.bind(this), flags.json, result);
  }
}

async function waitForFirstMeetPostcondition(
  before: Awaited<ReturnType<typeof getCiv7PlayNotificationView>>,
  options: Civ7DirectControlOptions,
  metPlayerId: number,
): Promise<Awaited<ReturnType<typeof getCiv7PlayNotificationView>>> {
  const startedAt = Date.now();
  const timeoutMs = Math.min(Math.max(options.timeoutMs ?? 3_000, 1_000), 6_000);
  let last = await getCiv7PlayNotificationView(options);
  while (Date.now() - startedAt <= timeoutMs) {
    const postcondition = firstMeetPostcondition(before, last, metPlayerId);
    if (postcondition.classification !== 'first-meet-sticky-blocker') return last;
    await new Promise((resolve) => setTimeout(resolve, 250));
    last = await getCiv7PlayNotificationView(options);
  }
  return last;
}

function firstMeetPostcondition(
  before: Awaited<ReturnType<typeof getCiv7PlayNotificationView>>,
  after: Awaited<ReturnType<typeof getCiv7PlayNotificationView>>,
  metPlayerId: number,
): {
  classification:
    | 'turn-unblocked'
    | 'first-meet-cleared'
    | 'first-meet-blocker-transitioned'
    | 'first-meet-sticky-blocker'
    | 'first-meet-blocker-unmatched';
  verified: boolean;
  reason: string;
} {
  if (probeValue(after.canEndTurn) === true) {
    return {
      classification: 'turn-unblocked',
      verified: true,
      reason: 'The first-meet response left the turn unblocked.',
    };
  }
  const beforeBlocker = findFirstMeetNotification(before, metPlayerId);
  if (!beforeBlocker) {
    return {
      classification: 'first-meet-blocker-unmatched',
      verified: false,
      reason: 'No matching end-turn-blocking first-meet notification was captured before the send.',
    };
  }
  const afterBlocker = findFirstMeetNotification(after, metPlayerId);
  if (!afterBlocker) {
    return {
      classification: 'first-meet-cleared',
      verified: true,
      reason: 'The matching first-meet notification is no longer end-turn-blocking.',
    };
  }
  if (!sameNotificationId(beforeBlocker.id, afterBlocker.id)) {
    return {
      classification: 'first-meet-blocker-transitioned',
      verified: false,
      reason: 'A matching first-meet blocker changed identity after the response but still blocks turn flow.',
    };
  }
  return {
    classification: 'first-meet-sticky-blocker',
    verified: false,
    reason: 'The first-meet operation returned, but the same first-meet notification still blocks turn flow.',
  };
}

function findFirstMeetNotification(
  view: Awaited<ReturnType<typeof getCiv7PlayNotificationView>>,
  metPlayerId: number,
): { id?: unknown } | null {
  return view.notifications.find((notification) => {
    const typeName = String(notification.typeName ?? '').toUpperCase();
    if (notification.isEndTurnBlocking !== true || !typeName.includes('PLAYER_MET')) return false;
    const player = notificationPlayerId(notification);
    return player === null || player === metPlayerId;
  }) ?? null;
}

function notificationPlayerId(value: unknown): number | null {
  if (!isRecord(value)) return null;
  if (typeof value.player === 'number') return value.player;
  const details = value.details;
  if (isRecord(details) && typeof details.player2 === 'number') return details.player2;
  const decision = value.decision;
  if (isRecord(decision) && typeof decision.player === 'number') return decision.player;
  return null;
}

function sameNotificationId(left: unknown, right: unknown): boolean {
  if (!isRecord(left) || !isRecord(right)) return left == null && right == null;
  return left.owner === right.owner && left.id === right.id && left.type === right.type;
}

function operationSent(value: unknown): boolean {
  return isRecord(value) && value.sent === true;
}

async function resolveFirstMeetResponseType(
  response: FirstMeetResponse | undefined,
  options: Civ7DirectControlOptions,
): Promise<number> {
  if (!response) {
    throw new Error('game play respond-first-meet requires either --response-type or --response');
  }
  const key = FIRST_MEET_RESPONSE_KEYS[response];
  const result = await executeCiv7AppUiCommand({
    ...options,
    command: `JSON.stringify((() => {
      const key = ${JSON.stringify(key)};
      const value =
        (typeof DiplomacyPlayerFirstMeets !== 'undefined' ? DiplomacyPlayerFirstMeets?.[key] : undefined)
        ?? (typeof GameInfo !== 'undefined' ? GameInfo?.Types?.lookup?.(key)?.Hash : undefined)
        ?? null;
      return { key, value };
    })())`,
  });
  const payloadText = result.output.find((part) => part.trim().startsWith('{'));
  if (!payloadText) {
    throw new Error(`Could not resolve first-meet response enum ${key}: empty App UI response`);
  }
  const payload = JSON.parse(payloadText) as { value?: unknown };
  if (typeof payload.value !== 'number') {
    throw new Error(`Could not resolve first-meet response enum ${key}: ${String(payload.value)}`);
  }
  return payload.value;
}

function probeValue(value: unknown): unknown {
  if (isRecord(value) && 'ok' in value) {
    return value.ok === true ? value.value ?? null : null;
  }
  return value ?? null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
