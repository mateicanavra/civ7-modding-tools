import { setTimeout as sleep } from "node:timers/promises";
import { appendFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { Command, Flags } from "@oclif/core";
import {
  getCiv7PlayNotificationView,
  getCiv7ReadyCityView,
  getCiv7ReadyUnitView,
} from "@civ7/direct-control";

export default class GameWatch extends Command {
  static id = "game watch";
  static summary = "Passively watch live Civ7 play with timing and stale-read markers";
  static description =
    "Polls the read-only play notification HUD, optionally composes the current ready-unit view, and emits observer records for human-aware live support.";

  static examples = [
    "<%= config.bin %> game watch --count 5 --jsonl",
    "<%= config.bin %> game watch --count 5 --artifact watcher.jsonl",
    "<%= config.bin %> game watch --count 0 --interval-ms 5000 --jsonl",
    "<%= config.bin %> game watch --include-ready-unit --count 3 --json",
    "<%= config.bin %> game watch --include-ready-city --count 3 --json",
  ];

  static flags = {
    host: Flags.string({
      description: "Civ7 tuner socket host",
    }),
    port: Flags.integer({
      description: "Civ7 tuner socket port",
    }),
    count: Flags.integer({
      description: "Number of observations to collect. Use 0 to watch until interrupted.",
      default: 1,
    }),
    "interval-ms": Flags.integer({
      description: "Delay between observations",
      default: 3_000,
    }),
    "timeout-ms": Flags.integer({
      description: "Socket timeout per observation",
      default: 10_000,
    }),
    "max-notifications": Flags.integer({
      description: "Maximum notifications to materialize per HUD read",
      default: 25,
    }),
    "include-ready-unit": Flags.boolean({
      description: "Also read the current ready-unit view when the HUD exposes a first-ready unit",
      default: false,
    }),
    "include-ready-city": Flags.boolean({
      description:
        "Also read the selected or blocker-target city view for city/population blockers",
      default: false,
    }),
    "human-aware": Flags.boolean({
      description: "Use conservative stale-risk labels for passive human-turn watching",
      default: true,
      allowNo: true,
    }),
    "slow-ms": Flags.integer({
      description: "Mark observations at or above this duration as slow reads",
      default: 2_000,
    }),
    "stale-ms": Flags.integer({
      description: "Mark observations at or above this duration as stale-risk reads",
      default: 5_000,
    }),
    artifact: Flags.string({
      description: "Append JSONL observations to this file",
    }),
    jsonl: Flags.boolean({
      description: "Emit one JSON observation per line",
      default: false,
    }),
    json: Flags.boolean({
      description: "Emit one JSON object containing all collected observations",
      default: false,
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(GameWatch);
    const observations = [];
    const total = Math.max(0, flags.count);
    let index = 0;

    while (total === 0 || index < total) {
      const observation = await this.readObservation(index + 1, flags);
      observations.push(observation);
      if (flags.artifact) await appendObservation(flags.artifact, observation);

      if (flags.jsonl) this.log(JSON.stringify(observation));
      else if (!flags.json) this.log(formatObservation(observation));

      index += 1;
      if (total !== 0 && index >= total) break;
      await sleep(Math.max(0, flags["interval-ms"]));
    }

    if (flags.json) {
      this.log(
        JSON.stringify({ ok: observations.every((observation) => observation.ok), observations })
      );
    }
  }

  private async readObservation(index: number, flags: WatchFlags): Promise<WatchObservation> {
    const startedAt = new Date().toISOString();
    const start = performance.now();
    try {
      const hud = await getCiv7PlayNotificationView({
        host: flags.host,
        port: flags.port,
        timeoutMs: flags["timeout-ms"],
        maxNotifications: flags["max-notifications"],
      });
      const firstReadyUnitId = probeValue(hud.firstReadyUnitId);
      const readyUnit =
        flags["include-ready-unit"] && firstReadyUnitId
          ? await getCiv7ReadyUnitView(
              {
                unitId: firstReadyUnitId,
                radius: 1,
                maxOperations: 96,
              },
              {
                host: flags.host,
                port: flags.port,
                timeoutMs: flags["timeout-ms"],
              }
            )
          : null;
      const readyCity = flags["include-ready-city"]
        ? await getCiv7ReadyCityView(
            {
              maxOperations: 96,
            },
            {
              host: flags.host,
              port: flags.port,
              timeoutMs: flags["timeout-ms"],
            }
          )
        : null;
      const durationMs = Math.round(performance.now() - start);

      return {
        schema: "civ7-watcher-observation.v1",
        index,
        mode: flags["human-aware"] ? "human-turn-watch" : "watch",
        risk: "read",
        wrapper: buildWrapper(flags, firstReadyUnitId),
        stateRole: "app-ui",
        timeoutMs: flags["timeout-ms"],
        startedAt,
        durationMs,
        ok: true,
        error: null,
        errorCode: null,
        staleGuard: staleGuard(durationMs, flags["slow-ms"], flags["stale-ms"]),
        turn: probeValue(hud.turn),
        turnDate: probeValue(hud.turnDate),
        loadingStateName: null,
        localPlayerId: hud.localPlayerId,
        blocker: probeValue(hud.blocker),
        blockingNotificationId: probeValue(hud.blockingNotificationId),
        selectedUnitId: probeValue(hud.selectedUnitId),
        selectedCityId: probeValue(hud.selectedCityId),
        firstReadyUnitId,
        nextDecision: summarizeNextDecision(hud.hud?.nextDecision ?? null),
        notificationCount: hud.notifications.length,
        tunerReady: null,
        responseBytes: Buffer.byteLength(JSON.stringify({ hud, readyUnit, readyCity }), "utf8"),
        readyUnit: readyUnit
          ? {
              unitId: readyUnit.unitId,
              unit: readyUnit.unit.ok ? readyUnit.unit.value : null,
              unitError: readyUnit.unit.ok ? null : readyUnit.unit.error,
              legalOperationScope: "no-target",
              legalNoTargetOperationCount: readyUnit.legalOperations.length,
              legalOperationCount: readyUnit.legalOperations.length,
              promotionReadiness: readyUnit.promotionReadiness,
            }
          : null,
        readyCity: readyCity
          ? {
              cityId: readyCity.cityId,
              city: readyCity.city.ok ? readyCity.city.value : null,
              cityError: readyCity.city.ok ? null : readyCity.city.error,
              legalOperationCount: readyCity.legalOperations.length,
              productionCandidateCount: readyCity.productionCandidates.ok
                ? readyCity.productionCandidates.value.length
                : null,
              townFocusOptionCount: readyCity.townFocusOptions.ok
                ? readyCity.townFocusOptions.value.length
                : null,
              populationPlacement: readyCity.populationPlacement,
            }
          : null,
        notes: flags["human-aware"]
          ? [
              "Observer read only; no OS foreground-focus causality claimed. Re-read before mutating after slow or stale-risk observations.",
            ]
          : [],
      };
    } catch (error) {
      const durationMs = Math.round(performance.now() - start);
      return {
        schema: "civ7-watcher-observation.v1",
        index,
        mode: flags["human-aware"] ? "human-turn-watch" : "watch",
        risk: "read",
        wrapper: "getCiv7PlayNotificationView",
        stateRole: "app-ui",
        timeoutMs: flags["timeout-ms"],
        startedAt,
        durationMs,
        ok: false,
        error: error instanceof Error ? error.message : String(error),
        errorCode: "read-failed",
        staleGuard: "error",
        turn: null,
        turnDate: null,
        loadingStateName: null,
        localPlayerId: null,
        blocker: null,
        blockingNotificationId: null,
        selectedUnitId: null,
        selectedCityId: null,
        firstReadyUnitId: null,
        nextDecision: null,
        notificationCount: 0,
        tunerReady: null,
        responseBytes: 0,
        readyUnit: null,
        readyCity: null,
        notes: [
          "Read failed; after restart or reconnect, run game play rehydrate before mutating.",
        ],
      };
    }
  }
}

type WatchFlags = Readonly<{
  host?: string;
  port?: number;
  count: number;
  "interval-ms": number;
  "timeout-ms": number;
  "max-notifications": number;
  "include-ready-unit": boolean;
  "include-ready-city": boolean;
  "human-aware": boolean;
  "slow-ms": number;
  "stale-ms": number;
  artifact?: string;
  jsonl: boolean;
  json: boolean;
}>;

type WatchObservation = Readonly<{
  schema: "civ7-watcher-observation.v1";
  index: number;
  mode: "human-turn-watch" | "watch";
  risk: "read";
  wrapper: string;
  stateRole: "app-ui";
  timeoutMs: number;
  startedAt: string;
  durationMs: number;
  ok: boolean;
  error: string | null;
  errorCode: string | null;
  staleGuard: "fresh" | "slow-read" | "stale-risk" | "error";
  turn: unknown;
  turnDate: unknown;
  loadingStateName: string | null;
  localPlayerId: number | null;
  blocker: unknown;
  blockingNotificationId: unknown;
  selectedUnitId: unknown;
  selectedCityId: unknown;
  firstReadyUnitId: unknown;
  nextDecision: unknown;
  notificationCount: number;
  tunerReady: boolean | null;
  responseBytes: number;
  readyUnit: unknown;
  readyCity: unknown;
  notes: ReadonlyArray<string>;
}>;

function probeValue<T>(probe: { ok: true; value: T } | { ok: false; error: string }): T | null {
  return probe.ok ? probe.value : null;
}

function staleGuard(
  durationMs: number,
  slowMs: number,
  staleMs: number
): WatchObservation["staleGuard"] {
  if (durationMs >= staleMs) return "stale-risk";
  if (durationMs >= slowMs) return "slow-read";
  return "fresh";
}

function summarizeNextDecision(
  decision: Record<string, unknown> | null
): Record<string, unknown> | null {
  if (!decision) return null;
  return {
    notificationId: decision.notificationId ?? null,
    typeName: decision.typeName ?? null,
    category: decision.category ?? null,
    summary: decision.summary ?? null,
    operationFamily: decision.operationFamily ?? null,
    operationType: decision.operationType ?? null,
  };
}

function buildWrapper(flags: WatchFlags, firstReadyUnitId: unknown): string {
  const wrappers = ["getCiv7PlayNotificationView"];
  if (flags["include-ready-unit"] && firstReadyUnitId) wrappers.push("getCiv7ReadyUnitView");
  if (flags["include-ready-city"]) wrappers.push("getCiv7ReadyCityView");
  return wrappers.join("+");
}

async function appendObservation(path: string, observation: WatchObservation): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await appendFile(path, `${JSON.stringify(observation)}\n`, "utf8");
}

function formatObservation(observation: WatchObservation): string {
  const decision =
    observation.nextDecision && typeof observation.nextDecision === "object"
      ? (observation.nextDecision as Record<string, unknown>)
      : null;
  const decisionText = decision
    ? `${decision.category ?? "<unknown>"}: ${decision.summary ?? decision.typeName ?? "<no summary>"}`
    : "<none>";
  return [
    `#${observation.index} ${observation.ok ? "ok" : "error"} ${observation.durationMs}ms ${observation.staleGuard}`,
    `turn=${observation.turn ?? "<unknown>"}`,
    `blocker=${JSON.stringify(observation.blocker)}`,
    `ready=${JSON.stringify(observation.firstReadyUnitId)}`,
    `decision=${decisionText}`,
  ].join(" ");
}
