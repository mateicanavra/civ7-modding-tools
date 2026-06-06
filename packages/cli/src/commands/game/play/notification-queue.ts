import { Command, Flags } from '@oclif/core';
import {
  type Civ7PlayDecisionInput,
  type Civ7PlayDecisionQueueItem,
  getCiv7PlayNotificationView,
} from '@civ7/direct-control';
import {
  buildDirectControlOptions,
  recommendedCliFromDecisionDetails,
} from '../../../utils/game-play-shared';

type QueueDisposition =
  | 'operate-with-live-inputs'
  | 'reviewed-dismissal-candidate'
  | 'inspect-ready-unit'
  | 'inspect-handler'
  | 'review-only';

type QueueStep = Readonly<{
  step: number;
  priority: number;
  disposition: QueueDisposition;
  notificationId: Civ7PlayDecisionQueueItem['notificationId'];
  isEndTurnBlocking: boolean;
  category: string;
  typeName: string | null;
  summary: string | null;
  message: string | null;
  location: unknown;
  target: unknown;
  operationFamily?: Civ7PlayDecisionQueueItem['operationFamily'];
  operationType?: string;
  requiredInputs: ReadonlyArray<Civ7PlayDecisionInput>;
  command: string | null;
  safeToBatch: boolean;
  reason: string;
  guardrails: ReadonlyArray<string>;
}>;

export default class GamePlayNotificationQueue extends Command {
  static id = 'game play notification-queue';
  static summary = 'Read and schedule the current notification decision queue';
  static description =
    'Builds a read-only queue plan for current Civ7 notifications, including guarded informational-dismissal candidates and operation/inspection steps.';

  static examples = [
    '<%= config.bin %> game play notification-queue --json',
    '<%= config.bin %> game play notification-queue --max 50',
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
    const { flags } = await this.parse(GamePlayNotificationQueue);
    const options = buildDirectControlOptions(flags);
    const view = await getCiv7PlayNotificationView({
      ...options,
      maxNotifications: flags.max,
    });
    const schedule = buildNotificationSchedule(view.hud.decisionQueue);
    const output = {
      localPlayerId: view.localPlayerId,
      turn: view.turn,
      turnDate: view.turnDate,
      blocker: view.blocker,
      blockingNotificationId: view.blockingNotificationId,
      canEndTurn: view.canEndTurn,
      limits: view.limits,
      queueLength: view.hud.decisionQueue.length,
      schedule,
      notes: [
        'Read-only notification queue scheduler; it does not dismiss notifications or send player/unit/city operations.',
        'Informational dismissal candidates still require summary/location review and item-level context before any validator-backed send.',
        'Operation steps are templates. Re-read live inputs and use the specialized validator-backed command before sending.',
      ],
    };

    if (flags.json) {
      this.log(JSON.stringify({ ok: true, view: output }));
      return;
    }

    this.log(`Turn ${formatProbe(output.turn)} (${formatProbe(output.turnDate)})`);
    this.log(`Queue length: ${output.queueLength}; blocker: ${formatProbe(output.blocker)}`);
    for (const item of schedule) {
      const marker = item.isEndTurnBlocking ? '*' : '-';
      this.log(`${marker} #${item.step} [${item.priority}] ${item.disposition}: ${item.summary ?? item.message ?? item.typeName ?? item.category}`);
      this.log(`  category: ${item.category}`);
      if (item.command) this.log(`  next: ${item.command}`);
      this.log(`  why: ${item.reason}`);
      for (const guardrail of item.guardrails) this.log(`  guard: ${guardrail}`);
    }
  }
}

function buildNotificationSchedule(queue: ReadonlyArray<Civ7PlayDecisionQueueItem>): QueueStep[] {
  return queue
    .map((item, index) => buildQueueStep(item, index + 1))
    .sort((left, right) => right.priority - left.priority || left.step - right.step)
    .map((item, index) => ({ ...item, step: index + 1 }));
}

function buildQueueStep(item: Civ7PlayDecisionQueueItem, originalStep: number): QueueStep {
  const disposition = dispositionFor(item);
  const command = commandFor(item, disposition);
  const requiredInputs = item.requiredInputs.filter((input) => input.required);
  const isDismissalCandidate = disposition === 'reviewed-dismissal-candidate';
  const safeToBatch = isDismissalCandidate && isBatchSafeDismissalCandidate(item);
  const guardrails = guardrailsFor(item, disposition, requiredInputs);
  return {
    step: originalStep,
    priority: priorityFor(item, disposition),
    disposition,
    notificationId: item.notificationId,
    isEndTurnBlocking: item.isEndTurnBlocking,
    category: item.category,
    typeName: item.typeName,
    summary: item.summary,
    message: item.message,
    location: item.location,
    target: item.target,
    operationFamily: item.operationFamily,
    operationType: item.operationType,
    requiredInputs,
    command,
    safeToBatch,
    reason: reasonFor(item, disposition),
    guardrails: isDismissalCandidate
      ? [
          'Review the message and location first; this schedule only provides a guarded command template.',
          ...guardrails,
        ]
      : guardrails,
  };
}

function dispositionFor(item: Civ7PlayDecisionQueueItem): QueueDisposition {
  if (item.category === 'informational-notification' && item.operationFamily === 'app-ui-action') {
    return 'reviewed-dismissal-candidate';
  }
  if (item.category === 'unit-command') return 'inspect-ready-unit';
  if (item.operationFamily || item.cli) return 'operate-with-live-inputs';
  if (item.category === 'notification' || item.category === 'blocking-notification') return 'inspect-handler';
  return 'review-only';
}

function isBatchSafeDismissalCandidate(item: Civ7PlayDecisionQueueItem): boolean {
  if (!item.isEndTurnBlocking) return true;
  if (item.typeName === 'NOTIFICATION_UNIT_LOST') return false;
  return true;
}

function commandFor(item: Civ7PlayDecisionQueueItem, disposition: QueueDisposition): string | null {
  if (disposition === 'reviewed-dismissal-candidate' && item.notificationId) {
    return `game play dismiss-notification --target '${JSON.stringify(item.notificationId)}' --send`;
  }
  const recommendedDetailCommand = recommendedCliFromDecisionDetails((item as { details?: unknown }).details);
  if (recommendedDetailCommand) return recommendedDetailCommand;
  const decisionCommand = commandFromDecision(item);
  if (decisionCommand) return decisionCommand;
  const detailCommand = commandFromDecisionDetails(item);
  if (detailCommand) return detailCommand;
  if (disposition === 'inspect-ready-unit') {
    return 'game play ready-unit --json; game play unit-target --unit-id \'<unit-id>\' --x <x> --y <y> --json';
  }
  return item.cli ?? null;
}

function priorityFor(item: Civ7PlayDecisionQueueItem, disposition: QueueDisposition): number {
  if (item.isEndTurnBlocking) return 100;
  if (disposition === 'operate-with-live-inputs') return 70;
  if (disposition === 'inspect-ready-unit') return 65;
  if (disposition === 'inspect-handler') return 50;
  if (disposition === 'reviewed-dismissal-candidate') return 35;
  return 20;
}

function reasonFor(item: Civ7PlayDecisionQueueItem, disposition: QueueDisposition): string {
  if (item.isEndTurnBlocking) return 'End-turn blocker; resolve or consciously defer before broad tactical planning.';
  if (disposition === 'reviewed-dismissal-candidate') {
    return 'Default-handler informational notification; useful for context, but closeout should follow explicit review.';
  }
  if (disposition === 'inspect-ready-unit') return 'Unit command notification needs the current ready unit and target-specific validators.';
  if (disposition === 'operate-with-live-inputs') return 'Known operation family; required live inputs must be read from the current surface before send.';
  if (disposition === 'inspect-handler') return 'Unclassified notification; inspect official handler or live UI before choosing any operation.';
  return 'Queue context item; keep for strategy or tactics but do not mutate from this schedule alone.';
}

function guardrailsFor(
  item: Civ7PlayDecisionQueueItem,
  disposition: QueueDisposition,
  requiredInputs: ReadonlyArray<Civ7PlayDecisionInput>,
): string[] {
  const guardrails: string[] = [];
  if (requiredInputs.length > 0 && disposition !== 'reviewed-dismissal-candidate') {
    guardrails.push(`Read required live inputs first: ${requiredInputs.map((input) => input.name).join(', ')}.`);
  }
  if (item.location && typeof item.location === 'object') {
    guardrails.push('Use the reported location as tactical context, not as proof of a valid operation target.');
  }
  if (disposition === 'operate-with-live-inputs') {
    guardrails.push('Validate with the specialized command before sending; this schedule does not prove the args.');
  }
  if (disposition === 'inspect-handler') {
    guardrails.push('Do not dismiss unclassified notifications in bulk.');
  }
  return guardrails;
}

function reasonSlug(item: Civ7PlayDecisionQueueItem): string {
  const text = String(item.typeName ?? item.summary ?? item.category)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return text || 'notification-reviewed';
}

function commandFromDecision(item: Civ7PlayDecisionQueueItem): string | null {
  if (item.category === 'production-choice' || item.category === 'population-placement') {
    return 'game play ready-city --compact --json';
  }
  if (item.category === 'tradition-review') {
    return 'game play traditions --compact --json';
  }
  return null;
}

function commandFromDecisionDetails(item: Civ7PlayDecisionQueueItem): string | null {
  const details = (item as { details?: unknown }).details;
  if (!details || typeof details !== 'object') return null;
  const record = details as Record<string, unknown>;
  if (record.kind === 'technology-choice-options') {
    return hasEnabledOptions(record) ? 'game play choose-tech --options --json' : null;
  }
  if (record.kind === 'culture-choice-options') {
    return hasEnabledOptions(record) ? 'game play choose-culture --options --json' : null;
  }
  if (record.kind === 'celebration-choice-options') {
    return hasEnabledOptions(record) ? 'game play choose-celebration --options --json' : null;
  }
  if (record.kind === 'government-choice-options') {
    return hasEnabledOptions(record) ? 'game play choose-government --options --json' : null;
  }
  if (record.kind === 'narrative-choice-options') {
    if (hasEnabledOptions(record)) return 'game play choose-narrative --options --json';
    return typeof record.dismissalDiagnosticCli === 'string' && record.dismissalDiagnosticCli.length > 0
      ? record.dismissalDiagnosticCli
      : 'game play choose-narrative --options --json';
  }
  if (record.kind === 'unit-command-reconciliation' && record.staleReadyPointerSuspected === true) {
    const candidate = asRecords(record.enabledCloseoutCandidates).find((entry) => typeof entry.cli === 'string' && entry.cli.length > 0);
    return typeof candidate?.cli === 'string' ? candidate.cli : null;
  }
  return null;
}

function hasEnabledOptions(record: Record<string, unknown>): boolean {
  return asRecords(record.enabledOptions).length > 0;
}

function asRecords(value: unknown): Array<Record<string, unknown>> {
  return Array.isArray(value) ? value.filter((entry): entry is Record<string, unknown> => entry !== null && typeof entry === 'object') : [];
}

function formatProbe<T>(probe: { ok: true; value: T } | { ok: false; error: string }): string {
  if (!probe.ok) return `<error: ${probe.error}>`;
  return typeof probe.value === 'object' ? JSON.stringify(probe.value) : String(probe.value);
}
