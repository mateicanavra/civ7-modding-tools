#!/usr/bin/env bun

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import {
  getCiv7MapGrid,
  getCiv7MapSummary,
  getCiv7ResourcePlacementFeasibility,
  type Civ7MapGridResult,
  type Civ7PlotSnapshotField,
  type Civ7MapSummaryResult,
  type Civ7ResourcePlacementFeasibilityResult,
  type Civ7RuntimeProbe,
} from "../../packages/civ7-direct-control/src/index.ts";
import {
  hashParityValue,
  stableParityProofStringify,
  type FinalSurfaceParityProof,
} from "../../mods/mod-swooper-maps/src/dev/diagnostics/live-parity.ts";
import {
  buildResourceDeltaFeasibilityContexts,
  buildResourceDeltaPlacementContexts,
  type ResourceDeltaFeasibilityContext,
} from "../../mods/mod-swooper-maps/src/dev/diagnostics/surface-delta-context.ts";

type Args = Readonly<{
  proofFile?: string;
  host?: string;
  port?: number;
  timeoutMs: number;
  maxCells: number;
  output?: string;
  help: boolean;
}>;

const usage = `Usage:
  bun scripts/civ7-direct-control/verify-resource-delta-feasibility.ts --proof-file <final-surface-proof.json>

Options:
  --host <host>       Civ7 tuner host
  --port <port>       Civ7 tuner port
  --timeout-ms <ms>   Direct-control timeout (default: 45000)
  --max-cells <n>     Safety cap for resource delta cells (default: 256)
  --output <path>     Write full proof JSON to path
`;

const LIVE_RESOURCE_CONTEXT_FIELDS = [
  "terrain",
  "biome",
  "feature",
  "resource",
  "climate",
  "hydrology",
  "areaRegion",
  "tags",
  "owner",
] as const satisfies ReadonlyArray<Civ7PlotSnapshotField>;

function parseArgs(argv: string[]): Args {
  const args: {
    proofFile?: string;
    host?: string;
    port?: number;
    timeoutMs: number;
    maxCells: number;
    output?: string;
    help: boolean;
  } = {
    timeoutMs: 45_000,
    maxCells: 256,
    help: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const value = () => {
      const next = argv[index + 1];
      if (!next || next.startsWith("--")) throw new Error(`Missing value for ${arg}`);
      index += 1;
      return next;
    };
    switch (arg) {
      case "--help":
      case "-h":
        args.help = true;
        break;
      case "--proof-file":
        args.proofFile = value();
        break;
      case "--host":
        args.host = value();
        break;
      case "--port":
        args.port = parseInteger(value(), arg);
        break;
      case "--timeout-ms":
        args.timeoutMs = parseInteger(value(), arg);
        break;
      case "--max-cells":
        args.maxCells = parseInteger(value(), arg);
        break;
      case "--output":
        args.output = value();
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return args;
}

function parseInteger(value: string, label: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) throw new Error(`${label} must be an integer: ${value}`);
  return parsed;
}

async function main(): Promise<number> {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage);
    return 0;
  }
  if (!args.proofFile) throw new Error("Expected --proof-file");

  const proof = extractFinalSurfaceParityProof(JSON.parse(readFileSync(args.proofFile, "utf8")));
  const requestIdentity = resolveRequestIdentity(proof);
  if (requestIdentity.blockedBy.length > 0) {
    const outputWithoutHash = {
      ok: false,
      status: "blocked" as const,
      requestId: requestIdentity.requestId,
      sourceProofHash: hashParityValue(proof),
      blockedBy: requestIdentity.blockedBy,
      requestIdentity,
    };
    const output = {
      ...outputWithoutHash,
      proofHash: hashParityValue(outputWithoutHash),
    };
    writeOutput(args.output, output);
    console.log(stableParityProofStringify(output));
    return 2;
  }

  const runtimeIdentity = await readAndCompareRuntimeIdentity(proof, args);
  if (runtimeIdentity.blockedBy.length > 0) {
    const outputWithoutHash = {
      ok: false,
      status: "blocked" as const,
      requestId: requestIdentity.requestId,
      sourceProofHash: hashParityValue(proof),
      blockedBy: runtimeIdentity.blockedBy,
      requestIdentity,
      runtimeIdentity,
    };
    const output = {
      ...outputWithoutHash,
      proofHash: hashParityValue(outputWithoutHash),
    };
    writeOutput(args.output, output);
    console.log(stableParityProofStringify(output));
    return 2;
  }

  const deltaRows = buildResourceDeltaPlacementContexts({ local: proof.local, live: proof.live });
  if (deltaRows.length === 0) throw new Error("Expected at least one resource delta row");
  if (deltaRows.length > args.maxCells) {
    throw new Error(`Resource delta row count ${deltaRows.length} exceeds --max-cells ${args.maxCells}`);
  }

  const livePlotContext = await getCiv7MapGrid(
    {
      locations: deltaRows.map((row) => ({ x: row.x, y: row.y })),
      fields: LIVE_RESOURCE_CONTEXT_FIELDS,
      maxPlots: args.maxCells,
    },
    { host: args.host, port: args.port, timeoutMs: args.timeoutMs }
  );
  const cells = deltaRows.map((row) => ({
    x: row.x,
    y: row.y,
    resourceTypes: uniqueNumbers([row.localResource.value, row.liveResource.value]),
  }));

  const [strict, ignoreWeight] = await Promise.all([
    getCiv7ResourcePlacementFeasibility(
      { cells, maxCells: args.maxCells, ignoreWeight: false },
      { host: args.host, port: args.port, timeoutMs: args.timeoutMs }
    ),
    getCiv7ResourcePlacementFeasibility(
      { cells, maxCells: args.maxCells, ignoreWeight: true },
      { host: args.host, port: args.port, timeoutMs: args.timeoutMs }
    ),
  ]);

  const outputWithoutHash = {
    ok: true,
    requestId: requestIdentity.requestId,
    sourceProofHash: hashParityValue(proof),
    requestIdentity,
    runtimeIdentity,
    rowCount: deltaRows.length,
    livePlotContext: summarizeLivePlotContext(livePlotContext),
    strict: summarizeFeasibilityProof(proof, strict),
    ignoreWeight: summarizeFeasibilityProof(proof, ignoreWeight),
  };
  const output = {
    ...outputWithoutHash,
    proofHash: hashParityValue(outputWithoutHash),
  };
  writeOutput(args.output, output);
  console.log(stableParityProofStringify(output));
  return 0;
}

function extractFinalSurfaceParityProof(payload: unknown): FinalSurfaceParityProof {
  if (!isRecord(payload)) throw new Error("Proof payload must be an object");
  const proof = isRecord(payload.proof) ? payload.proof : payload;
  if (!isRecord(proof.local) || !isRecord(proof.live)) {
    throw new Error("Expected final-surface parity proof with local/live snapshots");
  }
  return proof as FinalSurfaceParityProof;
}

function resolveRequestIdentity(proof: FinalSurfaceParityProof) {
  const packet = isRecord(proof.exactAuthorshipPacket) ? proof.exactAuthorshipPacket : {};
  const sourceSnapshot = isRecord(packet.sourceSnapshot) ? packet.sourceSnapshot : {};
  const log = isRecord(packet.log) ? packet.log : {};
  const sources = {
    exactAuthorshipSummary: stringValue(proof.exactAuthorshipSummary.requestId),
    exactAuthorshipPacket: stringValue(packet.requestId),
    sourceSnapshot: stringValue(sourceSnapshot.requestId),
    log: stringValue(log.requestId),
  };
  const values = Object.values(sources).filter((value): value is string => value !== undefined);
  const uniqueValues = [...new Set(values)].sort((left, right) => left.localeCompare(right));
  const blockedBy =
    uniqueValues.length === 0
      ? ["request-identity.missing"]
      : uniqueValues.length > 1
        ? ["request-identity.conflict"]
        : [];
  return {
    requestId: uniqueValues.length === 1 ? uniqueValues[0] : undefined,
    status: blockedBy.length === 0 ? "matched" as const : "blocked" as const,
    blockedBy,
    sources,
  };
}

async function readAndCompareRuntimeIdentity(
  proof: FinalSurfaceParityProof,
  args: Pick<Args, "host" | "port" | "timeoutMs">
) {
  const current = await getCiv7MapSummary({
    host: args.host,
    port: args.port,
    timeoutMs: args.timeoutMs,
  });
  const saved = savedRuntimeIdentity(proof);
  const observed = observedRuntimeIdentity(current);
  const comparisons = {
    width: compareIdentityValue(saved.width, observed.width),
    height: compareIdentityValue(saved.height, observed.height),
    plotCount: compareIdentityValue(saved.plotCount, observed.plotCount),
    seed: compareIdentityValue(saved.seed, observed.seed),
    turn: compareIdentityValue(saved.turn, observed.turn),
    gameHash: compareIdentityValue(saved.gameHash, observed.gameHash),
  };
  const blockedBy = Object.entries(comparisons)
    .filter(([, comparison]) => comparison.status !== "matched")
    .map(([key, comparison]) => `runtime-identity.${key}.${comparison.status}`)
    .sort((left, right) => left.localeCompare(right));

  return {
    status: blockedBy.length === 0 ? "matched" as const : "blocked" as const,
    blockedBy,
    saved,
    observed,
    comparisons,
  };
}

function savedRuntimeIdentity(proof: FinalSurfaceParityProof) {
  const evidence = isRecord(proof.live.evidence) ? proof.live.evidence : {};
  const runtime = isRecord(evidence.runtime) ? evidence.runtime : {};
  const fullGrid = isRecord(evidence.fullGrid) ? evidence.fullGrid : {};
  const initialSummary = isRecord(fullGrid.initialSummary) ? fullGrid.initialSummary : {};
  return {
    width: numberValue(runtime.width) ?? numberValue(initialSummary.width) ?? proof.live.width,
    height: numberValue(runtime.height) ?? numberValue(initialSummary.height) ?? proof.live.height,
    plotCount: numberValue(runtime.plotCount) ?? numberValue(initialSummary.plotCount),
    seed: numberValue(runtime.seed) ?? numberValue(initialSummary.seed) ?? proof.live.seed,
    turn: numberValue(runtime.turn) ?? numberValue(initialSummary.turn),
    gameHash: numberValue(runtime.gameHash) ?? numberValue(initialSummary.gameHash),
  };
}

function observedRuntimeIdentity(summary: Civ7MapSummaryResult) {
  return {
    host: summary.host,
    port: summary.port,
    state: summary.state,
    width: probeNumber(summary.map.width),
    height: probeNumber(summary.map.height),
    plotCount: probeNumber(summary.map.plotCount),
    seed: probeNumber(summary.map.randomSeed),
    turn: probeNumber(summary.game.turn),
    gameHash: probeNumber(summary.game.hash),
  };
}

function compareIdentityValue(saved: number | undefined, observed: number | undefined) {
  if (saved === undefined) return { status: "missing-saved" as const, saved, observed };
  if (observed === undefined) return { status: "missing-observed" as const, saved, observed };
  if (saved !== observed) return { status: "mismatch" as const, saved, observed };
  return { status: "matched" as const, saved, observed };
}

function summarizeFeasibilityProof(
  proof: Pick<FinalSurfaceParityProof, "local" | "live">,
  readback: Civ7ResourcePlacementFeasibilityResult
) {
  const rows = buildResourceDeltaFeasibilityContexts({ local: proof.local, live: proof.live }, readback);
  return {
    readback: {
      host: readback.host,
      port: readback.port,
      state: readback.state,
      cellCount: readback.cellCount,
      omittedCells: readback.omittedCells,
      ignoreWeight: readback.ignoreWeight,
    },
    classCounts: countBy(rows, (row) => row.feasibilityClass),
    evidenceAndFeasibilityCounts: countBy(
      rows,
      (row) =>
        `${row.evidenceClass}|local:${feasibilityValue(row.localFeasibleInCiv)}|live:${feasibilityValue(row.liveFeasibleInCiv)}`
    ),
    rows,
  };
}

function summarizeLivePlotContext(readback: Civ7MapGridResult) {
  return {
    readback: {
      host: readback.host,
      port: readback.port,
      state: readback.state,
      fields: readback.fields,
      plotCount: readback.plotCount,
      omitted: readback.omitted,
      hiddenInfoPolicy: readback.hiddenInfoPolicy,
    },
    rows: readback.plots.map((plot) => ({
      location: plot.location,
      hiddenInfoPolicy: plot.hiddenInfoPolicy,
      facts: plot.facts,
    })),
  };
}

function feasibilityValue(
  probe: ResourceDeltaFeasibilityContext["localFeasibleInCiv"]
): "true" | "false" | "not-applicable" | "missing" {
  if (probe === null) return "not-applicable";
  if (!probe.ok || probe.value === null) return "missing";
  return probe.value ? "true" : "false";
}

function countBy<T>(items: ReadonlyArray<T>, keyFor: (item: T) => string): Readonly<Record<string, number>> {
  const counts: Record<string, number> = {};
  for (const item of items) {
    const key = keyFor(item);
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return Object.fromEntries(Object.entries(counts).sort(([left], [right]) => left.localeCompare(right)));
}

function uniqueNumbers(values: ReadonlyArray<number | null>): number[] {
  return [...new Set(values.filter((value): value is number => value !== null))];
}

function numberValue(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function probeNumber(value: Civ7RuntimeProbe<number>): number | undefined {
  return value.ok === true && typeof value.value === "number" && Number.isFinite(value.value)
    ? value.value
    : undefined;
}

function writeOutput(path: string | undefined, output: unknown): void {
  if (!path) return;
  const absolute = resolve(path);
  mkdirSync(dirname(absolute), { recursive: true });
  writeFileSync(absolute, JSON.stringify(output, null, 2));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

if (import.meta.main) {
  main()
    .then((code) => {
      process.exitCode = code;
    })
    .catch((error) => {
      console.error(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : String(error) }, null, 2));
      process.exitCode = 1;
    });
}
