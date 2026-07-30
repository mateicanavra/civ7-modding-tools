import { getCiv7ReadyUnitView } from "@civ7/direct-control";
import { Command, Flags } from "@oclif/core";
import { buildDirectControlOptions, parseComponentId } from "../../../utils/game-play-shared";

export default class GamePlayPromotionReadiness extends Command {
  static id = "game play promotion-readiness";
  static summary = "Read promotion spend readiness for the selected or first ready unit";
  static description =
    "Returns the read-only promotion readiness slice from the live ready-unit view, including spendable points and validator-backed promotion args when present.";

  static examples = [
    "<%= config.bin %> game play promotion-readiness --json",
    '<%= config.bin %> game play promotion-readiness --unit-id \'{"owner":0,"id":917508,"type":26}\' --json',
  ];

  static flags = {
    host: Flags.string({
      description: "Civ7 tuner socket host",
    }),
    port: Flags.integer({
      description: "Civ7 tuner socket port",
    }),
    "unit-id": Flags.string({
      description:
        "Explicit unit ComponentID JSON. Defaults to selected unit, then first ready unit.",
    }),
    "max-operations": Flags.integer({
      description: "Maximum operation enum keys to probe in the underlying ready-unit view",
      default: 128,
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
    const { flags } = await this.parse(GamePlayPromotionReadiness);
    const view = await getCiv7ReadyUnitView(
      {
        unitId: flags["unit-id"] ? parseComponentId(flags["unit-id"], "unit-id") : undefined,
        radius: 0,
        maxOperations: flags["max-operations"],
      },
      buildDirectControlOptions(flags)
    );
    const payload = {
      unitId: view.unitId,
      unit: view.unit,
      promotionReadiness: view.promotionReadiness,
      legalPromoteOperation:
        view.legalOperations.find((candidate) => candidate.operationType === "PROMOTE") ?? null,
      notes: [
        "Read-only promotion readiness. Use availablePromotions args only as inputs to a future guarded promote-unit send.",
        "Visible PROMOTE can mean open the commander promotion UI, not that a promotion can be bought.",
      ],
    };

    if (flags.json) {
      this.log(JSON.stringify({ ok: true, view: payload }));
      return;
    }

    this.log(`Unit: ${formatValue(payload.unitId)}`);
    this.log(`Summary: ${formatProbe(payload.unit)}`);
    this.log(`Legal PROMOTE operation: ${formatValue(payload.legalPromoteOperation)}`);
    this.log(`Promotion readiness: ${formatProbe(payload.promotionReadiness)}`);
    for (const note of payload.notes) this.log(`Note: ${note}`);
  }
}

function formatProbe<T>(probe: { ok: true; value: T } | { ok: false; error: string }): string {
  if (!probe.ok) return `<error: ${probe.error}>`;
  return formatValue(probe.value);
}

function formatValue(value: unknown): string {
  return typeof value === "object" ? JSON.stringify(value) : String(value);
}
