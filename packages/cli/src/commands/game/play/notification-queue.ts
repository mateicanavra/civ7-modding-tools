import { Command, Flags } from '@oclif/core';
import {
  createCiv7ControlOrpcServerClient,
  type Civ7NotificationQueueResult,
} from '@civ7/control-orpc';
import { liveCiv7ControlOrpcDirectControlFacade } from '@civ7/control-orpc/runtime';
import {
  buildDirectControlOptions,
} from '../../../utils/game-play-shared';

type QueueStep = Civ7NotificationQueueResult['schedule'][number] & {
  command: string | null;
};
type QueueView = Omit<Civ7NotificationQueueResult, 'schedule'> & {
  schedule: QueueStep[];
};

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
    const client = createCiv7ControlOrpcServerClient({
      directControl: liveCiv7ControlOrpcDirectControlFacade,
      endpointDefaults: buildDirectControlOptions(flags),
    });
    const result = await client.notifications.queue.current({
      maxNotifications: flags.max,
    });
    const view = buildCliQueueView(result);

    if (flags.json) {
      this.log(JSON.stringify({ ok: true, view }));
      return;
    }

    this.log(`Turn ${formatProbe(view.turn)} (${formatProbe(view.turnDate)})`);
    this.log(`Queue length: ${view.queueLength}; blocker: ${formatProbe(view.blocker)}`);
    for (const item of view.schedule) {
      const marker = item.isEndTurnBlocking ? '*' : '-';
      this.log(`${marker} #${item.step} [${item.priority}] ${item.disposition}: ${item.summary ?? item.message ?? item.typeName ?? item.category}`);
      this.log(`  category: ${item.category}`);
      if (item.command) this.log(`  next: ${item.command}`);
      this.log(`  why: ${item.reason}`);
      for (const guardrail of item.guardrails) this.log(`  guard: ${guardrail}`);
    }
  }
}

function buildCliQueueView(result: Civ7NotificationQueueResult): QueueView {
  return {
    ...result,
    schedule: result.schedule.map((step) => ({
      ...step,
      command: commandForStep(step),
    })),
  };
}

function commandForStep(step: Civ7NotificationQueueResult['schedule'][number]): string | null {
  const nextStep = step.nextStep;
  if (nextStep == null) return null;
  switch (nextStep.kind) {
    case 'dismiss-notification':
      return step.notificationId == null
        ? null
        : `game play dismiss-notification --target '${JSON.stringify(step.notificationId)}' --send`;
    case 'inspect-ready-unit':
      return 'game play ready-unit --json; game play unit-target --unit-id \'<unit-id>\' --x <x> --y <y> --json';
    case 'inspect-ready-city':
      return 'game play ready-city --compact --json';
    case 'inspect-progression':
      return progressionCommand(step.category);
    case 'inspect-decision':
      return decisionCommand(step.category);
    case 'validate-operation':
      return validateOperationCommand(step);
    case 'inspect-notification':
      return 'game play notifications --json';
    case 'observe':
      return 'game play priorities --compact --json';
  }
}

function progressionCommand(category: string): string {
  if (category === 'technology-choice') return 'game play choose-tech --options --json';
  if (category === 'culture-choice') return 'game play choose-culture --options --json';
  if (category === 'tradition-review') return 'game play traditions --compact --json';
  return 'game play priorities --compact --json';
}

function decisionCommand(category: string): string {
  if (category === 'celebration-choice') return 'game play choose-celebration --options --json';
  if (category === 'government-choice') return 'game play choose-government --options --json';
  if (category === 'narrative-choice') return 'game play choose-narrative --options --json';
  if (category === 'first-meet-diplomacy') return 'game play respond-first-meet --json';
  if (category === 'diplomacy-response') return 'game play respond-diplomacy --json';
  return 'game play priorities --compact --json';
}

function validateOperationCommand(step: Civ7NotificationQueueResult['schedule'][number]): string {
  if (step.category === 'technology-choice' || step.operationType === 'SET_TECH_TREE_NODE') {
    return 'game play choose-tech --options --json';
  }
  if (step.category === 'culture-choice' || step.operationType === 'SET_CULTURE_TREE_NODE') {
    return 'game play choose-culture --options --json';
  }
  if (step.category === 'celebration-choice') return 'game play choose-celebration --options --json';
  if (step.category === 'government-choice') return 'game play choose-government --options --json';
  if (step.category === 'narrative-choice') return 'game play choose-narrative --options --json';
  if (step.category === 'first-meet-diplomacy') return 'game play respond-first-meet --json';
  if (step.category === 'diplomacy-response') return 'game play respond-diplomacy --json';
  if (step.category === 'production-choice' || step.category === 'population-placement') {
    return 'game play ready-city --compact --json';
  }
  return 'game play priorities --compact --json';
}

function formatProbe(value: unknown): string {
  if (value && typeof value === 'object' && 'ok' in value) {
    const probe = value as { ok: boolean; value?: unknown; error?: string };
    if (!probe.ok) return `<error: ${probe.error ?? 'unknown'}>`;
    return formatValue(probe.value);
  }
  return formatValue(value);
}

function formatValue(value: unknown): string {
  return value == null || typeof value === 'object' ? JSON.stringify(value) : String(value);
}
