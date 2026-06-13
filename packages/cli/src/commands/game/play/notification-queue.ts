import { createCiv7ControlOrpcServerClient } from "@civ7/control-orpc";
import { liveCiv7ControlOrpcDirectControlFacade } from "@civ7/control-orpc/runtime";
import { Command, Flags } from "@oclif/core";
import { buildDirectControlOptions } from "../../../utils/game-play-shared";

export default class GamePlayNotificationQueue extends Command {
  static id = "game play notification-queue";
  static summary = "Read and schedule the current notification decision queue";
  static description =
    "Builds a read-only queue plan for current Civ7 notifications, including guarded informational-dismissal candidates and operation/inspection steps.";

  static examples = [
    "<%= config.bin %> game play notification-queue --json",
    "<%= config.bin %> game play notification-queue --max 50",
  ];

  static flags = {
    host: Flags.string({
      description: "Civ7 tuner socket host",
    }),
    port: Flags.integer({
      description: "Civ7 tuner socket port",
    }),
    max: Flags.integer({
      description: "Maximum notifications to materialize",
      default: 50,
      min: 1,
      max: 100,
    }),
    "timeout-ms": Flags.integer({
      description: "Socket timeout",
      default: 45_000,
    }),
    json: Flags.boolean({
      description: "Emit machine-readable JSON",
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

    if (flags.json) {
      this.log(JSON.stringify({ ok: true, view: result }));
      return;
    }

    this.log(`Turn ${formatProbe(result.turn)} (${formatProbe(result.turnDate)})`);
    this.log(`Queue length: ${result.queueLength}; blocker: ${formatProbe(result.blocker)}`);
    for (const item of result.schedule) {
      const marker = item.isEndTurnBlocking ? "*" : "-";
      this.log(
        `${marker} #${item.step} [${item.priority}] ${item.disposition}: ${item.summary ?? item.message ?? item.typeName ?? item.category}`
      );
      this.log(`  category: ${item.category}`);
      if (item.nextStep) this.log(`  next: ${item.nextStep.label}`);
      this.log(`  why: ${item.reason}`);
      for (const guardrail of item.guardrails) this.log(`  guard: ${guardrail}`);
    }
  }
}

function formatProbe(value: unknown): string {
  if (value && typeof value === "object" && "ok" in value) {
    const probe = value as { ok: boolean; value?: unknown; error?: string };
    if (!probe.ok) return `<error: ${probe.error ?? "unknown"}>`;
    return formatValue(probe.value);
  }
  return formatValue(value);
}

function formatValue(value: unknown): string {
  return value == null || typeof value === "object" ? JSON.stringify(value) : String(value);
}
