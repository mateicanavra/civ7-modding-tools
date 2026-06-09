import { Command, Flags } from '@oclif/core';
import {
  type Civ7ComponentId,
  type Civ7NotificationDismissalResult,
  type Civ7PlayDecisionQueueItem,
  getCiv7PlayNotificationView,
  requestCiv7NotificationDismissal,
} from '@civ7/direct-control';
import {
  buildApproval,
  buildDirectControlOptions,
  requireSendReason,
} from '../../../utils/game-play-shared';

type DismissalCandidate = Readonly<{
  notificationId: Civ7ComponentId;
  category: string;
  typeName: string | null;
  summary: string | null;
  message: string | null;
  location: unknown;
  isEndTurnBlocking: boolean;
  reason: string;
}>;

type ExcludedNotification = Readonly<{
  notificationId: Civ7ComponentId | null;
  category: string;
  typeName: string | null;
  summary: string | null;
  isEndTurnBlocking: boolean;
  reason: string;
}>;

export default class GamePlayDismissNotificationQueue extends Command {
  static id = 'game play dismiss-notification-queue';
  static summary = 'Bulk dismiss reviewed informational notifications from the live queue';
  static description =
    'Dry-runs or sends App UI dismissals for notification-queue items classified as reviewed informational closeout candidates. It excludes operation-bearing and unclassified notifications.';

  static examples = [
    '<%= config.bin %> game play dismiss-notification-queue --json',
    '<%= config.bin %> game play dismiss-notification-queue --send --reason "reviewed low-risk reports" --json',
    '<%= config.bin %> game play dismiss-notification-queue --send --reason "reviewed reports" --max-dismissals 3',
  ];

  static flags = {
    host: Flags.string({
      description: 'Civ7 tuner socket host',
    }),
    port: Flags.integer({
      description: 'Civ7 tuner socket port',
    }),
    max: Flags.integer({
      description: 'Maximum notifications to materialize',
      default: 50,
      min: 1,
      max: 100,
    }),
    'max-dismissals': Flags.integer({
      description: 'Maximum eligible notifications to dismiss in one send run',
      default: 10,
      min: 1,
      max: 25,
    }),
    send: Flags.boolean({
      description: 'Dismiss all eligible informational closeout candidates, up to --max-dismissals',
      default: false,
    }),
    reason: Flags.string({
      description: 'Required approval reason for --send; applied with item summaries in the result',
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
    const { flags } = await this.parse(GamePlayDismissNotificationQueue);
    const reason = requireSendReason(flags.send, flags.reason, 'game play dismiss-notification-queue');
    const options = buildDirectControlOptions(flags);
    const hud = await getCiv7PlayNotificationView({
      ...options,
      maxNotifications: flags.max,
    });
    const { candidates, excluded } = classifyQueue(hud.hud.decisionQueue);
    const selected = candidates.slice(0, flags['max-dismissals']);
    const omittedEligibleCount = Math.max(0, candidates.length - selected.length);
    const results: Civ7NotificationDismissalResult[] = [];

    if (flags.send) {
      for (const candidate of selected) {
        results.push(await requestCiv7NotificationDismissal(
          { notificationId: candidate.notificationId },
          options,
          buildApproval(`${reason}; ${candidate.reason}`),
        ));
      }
    }

    const view = {
      localPlayerId: hud.localPlayerId,
      turn: hud.turn,
      turnDate: hud.turnDate,
      blocker: hud.blocker,
      blockingNotificationId: hud.blockingNotificationId,
      canEndTurn: hud.canEndTurn,
      queueLength: hud.hud.decisionQueue.length,
      send: flags.send,
      maxDismissals: flags['max-dismissals'],
      eligibleCount: candidates.length,
      selectedCount: selected.length,
      omittedEligibleCount,
      candidates: selected,
      excluded,
      results,
      verified: flags.send ? results.every((result) => result.verified) : false,
      notes: [
        flags.send
          ? 'Bulk dismissal sent only for eligible informational closeout candidates selected from a fresh HUD queue read.'
          : 'Dry run only. Add --send and --reason to dismiss eligible informational closeout candidates.',
        'Operation-bearing, unit-command, production, diplomacy, narrative, progression, population, and unclassified notifications are excluded.',
        'A completed App UI call is not counted as aggregate verified unless each item proves dismissal from post-send notification identity/queue/front evidence.',
        'Re-read the queue after this command before making further decisions.',
      ],
    };

    if (flags.json) {
      this.log(JSON.stringify({ ok: true, view }));
      return;
    }

    this.log(`Turn ${formatProbe(view.turn)} (${formatProbe(view.turnDate)})`);
    this.log(`Eligible: ${view.eligibleCount}; selected: ${view.selectedCount}; send: ${view.send}`);
    for (const candidate of selected) {
      this.log(`- ${formatId(candidate.notificationId)} ${candidate.typeName ?? candidate.category}: ${candidate.summary ?? candidate.message ?? ''}`);
      this.log(`  why: ${candidate.reason}`);
    }
    if (excluded.length > 0) this.log(`Excluded: ${excluded.length}`);
  }
}

function classifyQueue(queue: ReadonlyArray<Civ7PlayDecisionQueueItem>): {
  candidates: DismissalCandidate[];
  excluded: ExcludedNotification[];
} {
  const candidates: DismissalCandidate[] = [];
  const excluded: ExcludedNotification[] = [];
  for (const item of queue) {
    if (isBulkDismissalCandidate(item)) {
      candidates.push({
        notificationId: item.notificationId,
        category: item.category,
        typeName: item.typeName,
        summary: item.summary,
        message: item.message,
        location: item.location,
        isEndTurnBlocking: item.isEndTurnBlocking,
        reason: `${item.typeName ?? item.category} reviewed as informational closeout`,
      });
      continue;
    }
    excluded.push({
      notificationId: item.notificationId,
      category: item.category,
      typeName: item.typeName,
      summary: item.summary,
      isEndTurnBlocking: item.isEndTurnBlocking,
      reason: exclusionReason(item),
    });
  }
  return { candidates, excluded };
}

function isBulkDismissalCandidate(item: Civ7PlayDecisionQueueItem): item is Civ7PlayDecisionQueueItem & { notificationId: Civ7ComponentId } {
  return item.notificationId != null
    && item.category === 'informational-notification'
    && item.operationFamily === 'app-ui-action'
    && item.operationType === 'Game.Notifications.dismiss'
    && !isFrontUnitLostReport(item);
}

function exclusionReason(item: Civ7PlayDecisionQueueItem): string {
  if (!item.notificationId) return 'missing notification id';
  if (isFrontUnitLostReport(item)) return 'front unit-loss reports require exact reviewed dismissal proof, not bulk dismissal';
  if (item.category === 'unit-command') return 'unit command requires ready-unit inspection';
  if (item.operationFamily && item.operationFamily !== 'app-ui-action') return 'gameplay operation requires live inputs and validator-backed command';
  if (item.category === 'notification' || item.category === 'blocking-notification') return 'unclassified notification needs handler evidence first';
  if (item.category === 'informational-notification') return 'informational item is not exposed as App UI dismissal by the live HUD';
  return 'not an informational closeout candidate';
}

function isFrontUnitLostReport(item: Civ7PlayDecisionQueueItem): boolean {
  return item.isEndTurnBlocking === true && item.typeName === 'NOTIFICATION_UNIT_LOST';
}

function formatProbe<T>(probe: { ok: true; value: T } | { ok: false; error: string }): string {
  if (!probe.ok) return `<error: ${probe.error}>`;
  return typeof probe.value === 'object' ? JSON.stringify(probe.value) : String(probe.value);
}

function formatId(id: Civ7ComponentId): string {
  return JSON.stringify(id);
}
