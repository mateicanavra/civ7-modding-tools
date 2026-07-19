import type { Civ7MapSummaryResult } from "@civ7/direct-control";
import type { FinalSurfaceParityReport } from "./live-parity.js";

const RUNTIME_IDENTITY_FIELDS = [
  "width",
  "height",
  "plotCount",
  "seed",
  "turn",
  "gameHash",
] as const;

type RuntimeIdentityField = (typeof RUNTIME_IDENTITY_FIELDS)[number];
type RuntimeIdentityValues = Readonly<Record<RuntimeIdentityField, number | undefined>>;
type VerificationReportIdentityInput = Readonly<{
  exactAuthorshipSummary?: unknown;
  exactAuthorshipEvidence?: unknown;
  live: unknown;
}>;

type VerificationRequestIdentitySources = Readonly<{
  exactAuthorshipSummary: string | undefined;
  exactAuthorshipEvidence: string | undefined;
  log: string | undefined;
}>;

/** Correlation evidence resolved from every request-id witness in a parity report. */
export type VerificationRequestIdentity =
  | Readonly<{
      requestId: string;
      status: "matched";
      blockedBy: readonly [];
      sources: VerificationRequestIdentitySources;
    }>
  | Readonly<{
      requestId: undefined;
      status: "blocked";
      blockedBy: readonly ["request-identity.missing" | "request-identity.conflict"];
      sources: VerificationRequestIdentitySources;
    }>;

/** Closed comparison of one saved runtime identity value with its current Civ7 observation. */
export type VerificationRuntimeIdentityComparison =
  | Readonly<{ status: "missing-saved"; saved: undefined; observed: number | undefined }>
  | Readonly<{ status: "missing-observed"; saved: number; observed: undefined }>
  | Readonly<{ status: "mismatch"; saved: number; observed: number }>
  | Readonly<{ status: "matched"; saved: number; observed: number }>;

type RuntimeIdentityBlocker =
  `runtime-identity.${RuntimeIdentityField}.${Exclude<VerificationRuntimeIdentityComparison["status"], "matched">}`;
type VerificationRuntimeIdentityEvidence = Readonly<{
  saved: RuntimeIdentityValues;
  observed: Readonly<Pick<Civ7MapSummaryResult, "host" | "port" | "state"> & RuntimeIdentityValues>;
  comparisons: Readonly<Record<RuntimeIdentityField, VerificationRuntimeIdentityComparison>>;
}>;

/** Runtime correlation evidence used to admit exact-live diagnostic probes. */
export type VerificationRuntimeIdentity =
  | (VerificationRuntimeIdentityEvidence &
      Readonly<{
        status: "matched";
        blockedBy: readonly [];
      }>)
  | (VerificationRuntimeIdentityEvidence &
      Readonly<{
        status: "blocked";
        blockedBy: readonly [RuntimeIdentityBlocker, ...RuntimeIdentityBlocker[]];
      }>);

/**
 * Extracts the parity report accepted by live verification commands without duplicating its schema.
 * Only the local/live envelope is checked here; the owning report producer remains authoritative.
 */
export function extractVerificationReport(payload: unknown): FinalSurfaceParityReport {
  if (!isRecord(payload)) throw new Error("Report payload must be an object");
  const report = isRecord(payload.report) ? payload.report : payload;
  if (!isRecord(report.local) || !isRecord(report.live)) {
    throw new Error("Expected final-surface parity report with local/live snapshots");
  }
  return report as FinalSurfaceParityReport;
}

/**
 * Resolves one request identity from all parity-report witnesses before any live acquisition occurs.
 * Missing or conflicting witnesses fail closed; repeated agreement remains one matched identity.
 */
export function resolveVerificationRequestIdentity(
  report: VerificationReportIdentityInput
): VerificationRequestIdentity {
  const summary = recordValue(report, "exactAuthorshipSummary");
  const packet = recordValue(report, "exactAuthorshipEvidence");
  const log = recordValue(packet, "log");
  const sources = Object.freeze({
    exactAuthorshipSummary: stringValue(recordValue(summary, "requestId")),
    exactAuthorshipEvidence: stringValue(recordValue(packet, "requestId")),
    log: stringValue(recordValue(log, "requestId")),
  });
  const values = Object.values(sources).filter((value): value is string => value !== undefined);
  const uniqueValues = [...new Set(values)].sort((left, right) => left.localeCompare(right));
  const [requestId] = uniqueValues;
  if (uniqueValues.length === 1 && requestId !== undefined) {
    return Object.freeze({ requestId, status: "matched", blockedBy: [] as const, sources });
  }
  const blocker =
    uniqueValues.length === 0 ? "request-identity.missing" : "request-identity.conflict";
  return Object.freeze({
    requestId: undefined,
    status: "blocked",
    blockedBy: [blocker] as const,
    sources,
  });
}

/**
 * Compares saved parity identity evidence with one explicitly acquired Civ7 runtime summary.
 * Saved evidence uses runtime, initial-grid, then live-snapshot precedence; only finite probes count.
 */
export function compareVerificationRuntimeIdentity(
  report: VerificationReportIdentityInput,
  current: Civ7MapSummaryResult
): VerificationRuntimeIdentity {
  const saved = savedRuntimeIdentity(report);
  const observed = observedRuntimeIdentity(current);
  const comparisons = Object.freeze({
    width: compareIdentityValue(saved.width, observed.width),
    height: compareIdentityValue(saved.height, observed.height),
    plotCount: compareIdentityValue(saved.plotCount, observed.plotCount),
    seed: compareIdentityValue(saved.seed, observed.seed),
    turn: compareIdentityValue(saved.turn, observed.turn),
    gameHash: compareIdentityValue(saved.gameHash, observed.gameHash),
  });
  const blockedBy: RuntimeIdentityBlocker[] = [];
  for (const field of RUNTIME_IDENTITY_FIELDS) {
    const comparison = comparisons[field];
    if (comparison.status !== "matched") {
      blockedBy.push(`runtime-identity.${field}.${comparison.status}`);
    }
  }
  blockedBy.sort((left, right) => left.localeCompare(right));

  const firstBlocker = blockedBy[0];
  if (firstBlocker === undefined) {
    return Object.freeze({
      status: "matched",
      blockedBy: [] as const,
      saved,
      observed,
      comparisons,
    });
  }
  return Object.freeze({
    status: "blocked",
    blockedBy: [firstBlocker, ...blockedBy.slice(1)] as const,
    saved,
    observed,
    comparisons,
  });
}

function savedRuntimeIdentity(report: VerificationReportIdentityInput): RuntimeIdentityValues {
  const live = recordValue(report, "live");
  const evidence = recordValue(live, "evidence");
  const runtime = recordValue(evidence, "runtime");
  const fullGrid = recordValue(evidence, "fullGrid");
  const initialSummary = recordValue(fullGrid, "initialSummary");

  return Object.freeze({
    width:
      numberValue(recordValue(runtime, "width")) ??
      numberValue(recordValue(initialSummary, "width")) ??
      numberValue(recordValue(live, "width")),
    height:
      numberValue(recordValue(runtime, "height")) ??
      numberValue(recordValue(initialSummary, "height")) ??
      numberValue(recordValue(live, "height")),
    plotCount:
      numberValue(recordValue(runtime, "plotCount")) ??
      numberValue(recordValue(initialSummary, "plotCount")),
    seed:
      numberValue(recordValue(runtime, "seed")) ??
      numberValue(recordValue(initialSummary, "seed")) ??
      numberValue(recordValue(live, "seed")),
    turn:
      numberValue(recordValue(runtime, "turn")) ?? numberValue(recordValue(initialSummary, "turn")),
    gameHash:
      numberValue(recordValue(runtime, "gameHash")) ??
      numberValue(recordValue(initialSummary, "gameHash")),
  });
}

function observedRuntimeIdentity(
  summary: Civ7MapSummaryResult
): VerificationRuntimeIdentity["observed"] {
  return Object.freeze({
    host: summary.host,
    port: summary.port,
    state: summary.state,
    width: probeNumber(summary.map.width),
    height: probeNumber(summary.map.height),
    plotCount: probeNumber(summary.map.plotCount),
    seed: probeNumber(summary.map.randomSeed),
    turn: probeNumber(summary.game.turn),
    gameHash: probeNumber(summary.game.hash),
  });
}

function compareIdentityValue(
  saved: number | undefined,
  observed: number | undefined
): VerificationRuntimeIdentityComparison {
  if (saved === undefined) return { status: "missing-saved", saved, observed };
  if (observed === undefined) return { status: "missing-observed", saved, observed };
  if (saved !== observed) return { status: "mismatch", saved, observed };
  return { status: "matched", saved, observed };
}

function probeNumber(value: unknown): number | undefined {
  return isRecord(value) && value.ok === true ? numberValue(value.value) : undefined;
}

function numberValue(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function recordValue(value: unknown, key: string): unknown {
  return isRecord(value) ? value[key] : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
