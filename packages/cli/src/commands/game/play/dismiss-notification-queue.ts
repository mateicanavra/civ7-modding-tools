import { createCiv7ControlOrpcServerClient } from "@civ7/control-orpc";
import { liveCiv7ControlOrpcDirectControlFacade } from "@civ7/control-orpc/runtime";
import { Command, Flags } from "@oclif/core";
import { buildDirectControlOptions } from "../../../utils/game-play-shared";

export default class GamePlayDismissNotificationQueue extends Command {
  static id = "game play dismiss-notification-queue";
  static summary = "Bulk dismiss reviewed informational notifications from the live queue";
  static description =
    "Dry-runs or sends App UI dismissals for notification-queue items classified as reviewed informational closeout candidates. It excludes operation-bearing and unclassified notifications.";

  static examples = [
    "<%= config.bin %> game play dismiss-notification-queue --json",
    "<%= config.bin %> game play dismiss-notification-queue --send --json",
    "<%= config.bin %> game play dismiss-notification-queue --send --max-dismissals 3",
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
    "max-dismissals": Flags.integer({
      description: "Maximum eligible notifications to dismiss in one send run",
      default: 10,
      min: 1,
      max: 25,
    }),
    send: Flags.boolean({
      description: "Dismiss all eligible informational closeout candidates, up to --max-dismissals",
      default: false,
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
    const { flags } = await this.parse(GamePlayDismissNotificationQueue);
    const client = createCiv7ControlOrpcServerClient({
      directControl: liveCiv7ControlOrpcDirectControlFacade,
      endpointDefaults: buildDirectControlOptions(flags),
    });
    const view = await client.notifications.queue.dismiss.request({
      maxNotifications: flags.max,
      maxDismissals: flags["max-dismissals"],
      send: flags.send,
    });

    if (flags.json) {
      this.log(JSON.stringify({ ok: true, view }));
      return;
    }

    this.log(`Turn ${formatProbe(view.turn)} (${formatProbe(view.turnDate)})`);
    this.log(
      `Eligible: ${view.eligibleCount}; selected: ${view.selectedCount}; send: ${view.sent}; status: ${view.status}`
    );
    for (const candidate of view.candidates) {
      this.log(
        `- ${formatId(candidate.notificationId)} ${candidate.typeName ?? candidate.category}: ${candidate.summary ?? candidate.message ?? ""}`
      );
      this.log(`  why: ${candidate.reason}`);
    }
    if (view.excluded.length > 0) this.log(`Excluded: ${view.excluded.length}`);
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

function formatId(id: unknown): string {
  return JSON.stringify(id);
}

function formatValue(value: unknown): string {
  return value == null || typeof value === "object" ? JSON.stringify(value) : String(value);
}
