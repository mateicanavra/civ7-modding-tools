#!/usr/bin/env bun

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import {
  getCiv7MapGrid,
  getCiv7MapSummary,
  getCiv7ResourceBuilderDiagnostics,
  getCiv7ResourcePlacementFeasibility,
  type Civ7MapGridResult,
  type Civ7PlotSnapshotField,
  type Civ7MapSummaryResult,
  type Civ7ResourceBuilderDiagnosticsResult,
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
  const ignoreWeightProof = summarizeFeasibilityProof(proof, ignoreWeight);
  const focusedCells = cellsForResourceBuilderDiagnostics(ignoreWeightProof.rows);
  const resourceBuilderDiagnostics =
    focusedCells.length > 0
      ? await getCiv7ResourceBuilderDiagnostics(
          { cells: focusedCells, maxCells: args.maxCells },
          { host: args.host, port: args.port, timeoutMs: args.timeoutMs }
        )
      : null;
  const resourceBuilderDiagnosticsSummary =
    resourceBuilderDiagnostics === null ? null : summarizeResourceBuilderDiagnostics(resourceBuilderDiagnostics);
  const resourceBuilderSubclassification =
    resourceBuilderDiagnosticsSummary === null
      ? null
      : summarizeResourceBuilderSubclassification(ignoreWeightProof.rows, resourceBuilderDiagnosticsSummary);

  const outputWithoutHash = {
    ok: true,
    requestId: requestIdentity.requestId,
    sourceProofHash: hashParityValue(proof),
    requestIdentity,
    runtimeIdentity,
    rowCount: deltaRows.length,
    livePlotContext: summarizeLivePlotContext(livePlotContext),
    resourceBuilderDiagnostics: resourceBuilderDiagnosticsSummary,
    resourceBuilderSubclassification,
    assignmentClassSummary: summarizeAssignmentClasses(ignoreWeightProof.rows),
    strict: summarizeFeasibilityProof(proof, strict),
    ignoreWeight: ignoreWeightProof,
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

function summarizeResourceBuilderDiagnostics(readback: Civ7ResourceBuilderDiagnosticsResult) {
  return {
    readback: {
      host: readback.host,
      port: readback.port,
      state: readback.state,
      cellCount: readback.cellCount,
      omittedCells: readback.omittedCells,
    },
    resources: readback.resources,
    cells: readback.cells,
  };
}

type ResourceBuilderDiagnosticsSummary = ReturnType<typeof summarizeResourceBuilderDiagnostics>;

function summarizeResourceBuilderSubclassification(
  rows: ReadonlyArray<ResourceDeltaFeasibilityContext>,
  diagnostics: ResourceBuilderDiagnosticsSummary
) {
  const focusedRows = rows.filter(
    (row) => row.feasibilityClass === "local-overaccepted-live-empty" && row.localResource.value !== null
  );
  const cellsByLocation = new Map(
    diagnostics.cells.map((cell) => [`${cell.location.x},${cell.location.y}`, cell] as const)
  );
  const resourcesByType = new Map(diagnostics.resources.map((resource) => [resource.resourceType, resource] as const));
  const classifiedRows = focusedRows.map((row) => {
    const localResourceType = row.localResource.value as number;
    const cell = cellsByLocation.get(`${row.x},${row.y}`);
    const cellResource = cell?.resources[String(localResourceType)];
    const resource = resourcesByType.get(localResourceType);
    const cutResourceTypes = cutResourceTypeNames(cellResource?.bestMapResourceCuts);
    const cutIncludesLocal = cutIncludesResource(cellResource?.bestMapResourceCuts, localResourceType);
    const strict = probeBoolean(cellResource?.canHaveResource.strict);
    const ignoreWeight = probeBoolean(cellResource?.canHaveResource.ignoreWeight);
    const assignmentPhase = row.assignmentTrace?.assignmentPhase ?? null;
    const officialPolicy = summarizeResourcePolicy(resource);
    const targetMinPerType = row.assignmentTrace?.targetMinPerType ?? null;
    const officialMinimum = officialPolicy.minimumPerHemisphere;
    const classification = classifyResourceBuilderFocusedRow({
      assignmentPhase,
      cutIncludesLocal,
      ignoreWeight,
      hasCellDiagnostics: cellResource !== undefined,
    });

    return {
      x: row.x,
      y: row.y,
      plotIndex: row.plotIndex,
      localResource: row.localResource,
      plannedPreferredResourceSymbol: row.plannedPreferredResourceSymbol,
      feasibilityClass: row.feasibilityClass,
      assignmentTrace: row.assignmentTrace,
      resourceBuilder: {
        canHaveResource: {
          strict,
          ignoreWeight,
        },
        cutIncludesLocal,
        cutResourceTypes,
        count: probeNumberLike(resource?.count),
        landmass: probeNumberLike(resource?.landmass),
        resourceLandmassAtCell: probeNumberLike(cellResource?.resourceLandmassAtCell),
        validForAge: probeBoolean(resource?.validForAge),
        requiredForAge: probeBoolean(resource?.requiredForAge),
        ignoringWeightForRiverPlacement: probeBoolean(resource?.ignoringWeightForRiverPlacement),
        officialPolicy,
        localScarceFloor: {
          targetMinPerType,
          officialMinimumPerHemisphere: officialMinimum,
          targetExceedsOfficialMinimum:
            targetMinPerType !== null && officialMinimum !== null ? targetMinPerType > officialMinimum : null,
          targetMinusOfficialMinimum:
            targetMinPerType !== null && officialMinimum !== null ? targetMinPerType - officialMinimum : null,
        },
      },
      subclassification: classification,
    };
  });

  return {
    readback: diagnostics.readback,
    focusedRowCount: focusedRows.length,
    classCounts: countBy(classifiedRows, (row) => row.subclassification),
    rows: classifiedRows,
  };
}

function summarizeAssignmentClasses(rows: ReadonlyArray<ResourceDeltaFeasibilityContext>) {
  const locallyAssignedRows = rows.filter((row) => row.assignmentTrace !== null);
  const classAndPhaseRows = locallyAssignedRows.map((row) => ({
    feasibilityClass: row.feasibilityClass,
    evidenceClass: row.evidenceClass,
    assignmentPhase: row.assignmentTrace?.assignmentPhase ?? "missing",
    targetMinPerType: row.assignmentTrace?.targetMinPerType ?? null,
    resourceSymbol: row.localResource.symbol,
    assignmentOrder: row.assignmentTrace?.assignmentOrder ?? null,
  }));
  const scarceFloorRows = classAndPhaseRows.filter((row) => row.assignmentPhase === "scarce-floor");
  return {
    localAssignedDeltaRowCount: locallyAssignedRows.length,
    scarceFloorLocalAssignedDeltaRowCount: scarceFloorRows.length,
    scarceFloorLocalAssignedDeltaShare:
      locallyAssignedRows.length > 0 ? scarceFloorRows.length / locallyAssignedRows.length : null,
    classCounts: countBy(rows, (row) => row.feasibilityClass),
    classPhaseCounts: countBy(
      classAndPhaseRows,
      (row) => `${row.feasibilityClass}|${row.assignmentPhase}|target:${row.targetMinPerType ?? "missing"}`
    ),
    classPhaseResources: summarizeClassPhaseResources(classAndPhaseRows),
  };
}

function summarizeClassPhaseResources(
  rows: ReadonlyArray<{
    feasibilityClass: string;
    assignmentPhase: string;
    targetMinPerType: number | null;
    resourceSymbol: string;
    assignmentOrder: number | null;
  }>
) {
  const groups = new Map<
    string,
    {
      feasibilityClass: string;
      assignmentPhase: string;
      targetMinPerType: number | null;
      count: number;
      resources: Set<string>;
      minAssignmentOrder: number | null;
      maxAssignmentOrder: number | null;
    }
  >();
  for (const row of rows) {
    const key = `${row.feasibilityClass}|${row.assignmentPhase}|target:${row.targetMinPerType ?? "missing"}`;
    let group = groups.get(key);
    if (!group) {
      group = {
        feasibilityClass: row.feasibilityClass,
        assignmentPhase: row.assignmentPhase,
        targetMinPerType: row.targetMinPerType,
        count: 0,
        resources: new Set<string>(),
        minAssignmentOrder: null,
        maxAssignmentOrder: null,
      };
      groups.set(key, group);
    }
    group.count += 1;
    group.resources.add(row.resourceSymbol);
    if (row.assignmentOrder !== null) {
      group.minAssignmentOrder =
        group.minAssignmentOrder === null ? row.assignmentOrder : Math.min(group.minAssignmentOrder, row.assignmentOrder);
      group.maxAssignmentOrder =
        group.maxAssignmentOrder === null ? row.assignmentOrder : Math.max(group.maxAssignmentOrder, row.assignmentOrder);
    }
  }
  return [...groups.values()]
    .sort((left, right) => {
      const classDelta = left.feasibilityClass.localeCompare(right.feasibilityClass);
      if (classDelta !== 0) return classDelta;
      const phaseDelta = left.assignmentPhase.localeCompare(right.assignmentPhase);
      if (phaseDelta !== 0) return phaseDelta;
      return (left.targetMinPerType ?? -1) - (right.targetMinPerType ?? -1);
    })
    .map((group) => ({
      feasibilityClass: group.feasibilityClass,
      assignmentPhase: group.assignmentPhase,
      targetMinPerType: group.targetMinPerType,
      count: group.count,
      minAssignmentOrder: group.minAssignmentOrder,
      maxAssignmentOrder: group.maxAssignmentOrder,
      resources: [...group.resources].sort((left, right) => left.localeCompare(right)),
    }));
}

function classifyResourceBuilderFocusedRow(input: {
  assignmentPhase: string | null;
  cutIncludesLocal: boolean | null;
  ignoreWeight: boolean | null;
  hasCellDiagnostics: boolean;
}):
  | "scarce-floor-cut-excluded"
  | "scarce-floor-cut-included-rejected"
  | "scarce-floor-resource-builder-evidence-missing"
  | "local-overaccepted-non-scarce-floor" {
  if (!input.hasCellDiagnostics) return "scarce-floor-resource-builder-evidence-missing";
  if (input.assignmentPhase !== "scarce-floor") return "local-overaccepted-non-scarce-floor";
  if (input.cutIncludesLocal === false) return "scarce-floor-cut-excluded";
  if (input.cutIncludesLocal === true && input.ignoreWeight === false) return "scarce-floor-cut-included-rejected";
  return "scarce-floor-resource-builder-evidence-missing";
}

function cutIncludesResource(
  probe: Civ7RuntimeProbe<ReadonlyArray<{ resourceType?: number }>> | undefined,
  resourceType: number
): boolean | null {
  if (!probe?.ok || !Array.isArray(probe.value)) return null;
  return probe.value.some((resource) => resource.resourceType === resourceType);
}

function cutResourceTypeNames(
  probe: Civ7RuntimeProbe<ReadonlyArray<{ resourceTypeName?: string; resourceType?: number }>> | undefined
): ReadonlyArray<string> | null {
  if (!probe?.ok || !Array.isArray(probe.value)) return null;
  return probe.value.map((resource) => resource.resourceTypeName ?? String(resource.resourceType ?? "unknown"));
}

function probeBoolean(probe: Civ7RuntimeProbe<boolean> | undefined): boolean | null {
  if (!probe?.ok || typeof probe.value !== "boolean") return null;
  return probe.value;
}

function probeNumberLike(probe: Civ7RuntimeProbe<number> | undefined): number | null {
  if (!probe?.ok || typeof probe.value !== "number" || !Number.isFinite(probe.value)) return null;
  return probe.value;
}

function summarizeResourcePolicy(resource: Civ7ResourceBuilderDiagnosticsResult["resources"][number] | undefined) {
  const row = resource?.row.ok === true && isRecord(resource.row.value) ? resource.row.value : {};
  return {
    resourceType: stringValue(row.ResourceType),
    resourceClassType: stringValue(row.ResourceClassType),
    weight: numberValue(row.Weight) ?? null,
    minimumPerHemisphere: numberValue(row.MinimumPerHemisphere) ?? null,
    adjacentToLand: booleanValue(row.AdjacentToLand),
    lakeEligible: booleanValue(row.LakeEligible),
    requiresRiver: booleanValue(row.RequiresRiver),
    noRiver: booleanValue(row.NoRiver),
    clumped: booleanValue(row.Clumped),
    hemisphereUnique: booleanValue(row.HemisphereUnique),
    staple: booleanValue(row.Staple),
    requiredForAge: probeBoolean(resource?.requiredForAge),
    validForAge: probeBoolean(resource?.validForAge),
  };
}

function booleanValue(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

function cellsForResourceBuilderDiagnostics(
  rows: ReadonlyArray<ResourceDeltaFeasibilityContext>
): ReadonlyArray<{ x: number; y: number; resourceTypes: ReadonlyArray<number> }> {
  return rows
    .filter((row) => row.feasibilityClass === "local-overaccepted-live-empty" && row.localResource.value !== null)
    .map((row) => ({
      x: row.x,
      y: row.y,
      resourceTypes: [row.localResource.value as number],
    }));
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
