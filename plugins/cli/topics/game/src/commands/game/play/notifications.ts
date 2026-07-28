import {
  type Civ7PlayDecisionAction,
  type Civ7PlayDecisionInput,
  getCiv7PlayNotificationView,
} from "@civ7/direct-control";
import { Command, Flags } from "@oclif/core";

export default class GamePlayNotifications extends Command {
  static id = "game play notifications";
  static summary = "Read live play blockers with operation hints";
  static description =
    "Returns a read-only play-facing view of current notifications, blocker state, selected entities, and likely operation families.";

  static examples = [
    "<%= config.bin %> game play notifications --json",
    "<%= config.bin %> game play notifications --max 10",
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
      default: 25,
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
    const { flags } = await this.parse(GamePlayNotifications);
    const view = await getCiv7PlayNotificationView({
      host: flags.host,
      port: flags.port,
      timeoutMs: flags["timeout-ms"],
      maxNotifications: flags.max,
    });

    if (flags.json) {
      this.log(JSON.stringify({ ok: true, view: projectNotificationJsonView(view) }));
      return;
    }

    this.log(`Turn ${formatProbe(view.turn)} (${formatProbe(view.turnDate)})`);
    this.log(`End turn: ${formatProbe(view.canEndTurn)}; blocker: ${formatProbe(view.blocker)}`);
    this.log(`Blocking notification: ${formatProbe(view.blockingNotificationId)}`);
    this.log(
      `Selected unit: ${formatProbe(view.selectedUnitId)}; first ready unit: ${formatProbe(view.firstReadyUnitId)}`
    );
    this.log(`Selected city: ${formatProbe(view.selectedCityId)}`);

    if (view.hud?.nextDecision) {
      this.log("");
      this.log("Decision HUD");
      for (const item of view.hud.decisionQueue) {
        const marker = item.isEndTurnBlocking ? "*" : "-";
        this.log(
          `${marker} ${item.category}: ${item.summary ?? item.message ?? item.typeName ?? "<unknown notification>"}`
        );
        this.log(`  action: ${item.category}`);
        if (item.operationFamily || item.operationType) {
          this.log(
            `  operation: ${[item.operationFamily, item.operationType].filter(Boolean).join(" ")}`
          );
        }
        if (item.argsShape) this.log(`  args: ${item.argsShape}`);
        if (item.target !== null && item.target !== undefined)
          this.log(`  target: ${formatValue(item.target)}`);
        if (item.location !== null && item.location !== undefined)
          this.log(`  location: ${formatValue(item.location)}`);
        logInputs(this.log.bind(this), item.requiredInputs);
        logActions(this.log.bind(this), item.commonActions);
        for (const note of item.notes) this.log(`  note: ${note}`);
      }
    }

    this.log("");
    this.log("Notifications");
    for (const notification of view.notifications) {
      const marker = notification.isEndTurnBlocking ? "*" : "-";
      this.log(
        `${marker} ${notification.typeName ?? notification.type ?? "<unknown notification>"}: ${notification.summary ?? notification.message ?? ""}`
      );
      this.log(`  decision: ${notification.decision.category}`);
      if (notification.decision.operationFamily && notification.decision.operationType) {
        this.log(
          `  operation: ${notification.decision.operationFamily} ${notification.decision.operationType}`
        );
      }
      if (notification.decision.argsShape) this.log(`  args: ${notification.decision.argsShape}`);
      this.log(`  action: ${notification.decision.category}`);
      logInputs(this.log.bind(this), notification.decision.requiredInputs);
      for (const note of notification.decision.notes) this.log(`  note: ${note}`);
    }
  }
}

function formatProbe<T>(probe: { ok: true; value: T } | { ok: false; error: string }): string {
  if (!probe.ok) return `<error: ${probe.error}>`;
  return formatValue(probe.value);
}

function projectNotificationJsonView(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(projectNotificationJsonView);
  if (!value || typeof value !== "object") return value;

  const output: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) {
    if (key === "cli") continue;
    output[key] = projectNotificationJsonView(item);
  }
  return output;
}

function formatValue(value: unknown): string {
  return typeof value === "object" ? JSON.stringify(value) : String(value);
}

function logInputs(
  log: (message: string) => void,
  inputs: ReadonlyArray<Civ7PlayDecisionInput>
): void {
  if (inputs.length === 0) return;
  log(`  inputs:`);
  for (const input of inputs) {
    const marker = input.required ? "required" : "optional";
    const note = input.note ? `; ${input.note}` : "";
    log(`    - ${input.name} (${marker}) from ${input.source}${note}`);
  }
}

function logActions(
  log: (message: string) => void,
  actions: ReadonlyArray<Civ7PlayDecisionAction>
): void {
  if (actions.length === 0) return;
  log(`  actions:`);
  for (const action of actions) {
    log(`    - ${action.label}: ${action.when}`);
  }
}
