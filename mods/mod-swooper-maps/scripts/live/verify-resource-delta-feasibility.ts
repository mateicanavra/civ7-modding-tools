#!/usr/bin/env bun

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import {
  type Civ7MapGridResult,
  type Civ7MapSummaryResult,
  type Civ7PlotSnapshotField,
  type Civ7ResourceBuilderDiagnosticsResult,
  type Civ7ResourcePlacementFeasibilityCellInput,
  type Civ7ResourcePlacementFeasibilityResult,
  type Civ7RuntimeProbe,
  getCiv7MapGrid,
  getCiv7MapSummary,
  getCiv7ResourceBuilderDiagnostics,
  getCiv7ResourcePlacementFeasibility,
} from "@civ7/direct-control";
import { hexDistanceOddQPeriodicX } from "@swooper/mapgen-core/lib/grid";
import {
  type FinalSurfaceParityReport,
  hashParityValue,
  stableParityReportStringify,
} from "../../src/dev/diagnostics/live-parity.js";
import {
  buildResourceDeltaFeasibilityContexts,
  buildResourceDeltaPlacementContexts,
  type ResourceDeltaFeasibilityContext,
} from "../../src/dev/diagnostics/surface-delta-context.js";

type Args = Readonly<{
  reportFile?: string;
  host?: string;
  port?: number;
  timeoutMs: number;
  maxCells: number;
  output?: string;
  help: boolean;
}>;

const usage = `Usage:
  nx run mod-swooper-maps:verify:operational -- --mode resource-delta-feasibility --report-file <final-surface-parity-report.json>

Options:
  --host <host>       Civ7 tuner host
  --port <port>       Civ7 tuner port
  --timeout-ms <ms>   Direct-control timeout (default: 45000)
  --max-cells <n>     Safety cap for resource delta cells (default: 256)
  --output <path>     Write full report JSON to path
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

const RESOURCE_BUILDER_DIAGNOSTIC_BATCH_SIZE = 8;

function parseArgs(argv: string[]): Args {
  const args: {
    reportFile?: string;
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
      case "--report-file":
        args.reportFile = value();
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
  if (!args.reportFile) throw new Error("Expected --report-file");

  const report = extractFinalSurfaceParityReport(JSON.parse(readFileSync(args.reportFile, "utf8")));
  const requestIdentity = resolveRequestIdentity(report);
  if (requestIdentity.blockedBy.length > 0) {
    const outputWithoutHash = {
      ok: false,
      status: "blocked" as const,
      requestId: requestIdentity.requestId,
      sourceReportHash: hashParityValue(report),
      blockedBy: requestIdentity.blockedBy,
      requestIdentity,
    };
    const output = {
      ...outputWithoutHash,
      reportHash: hashParityValue(outputWithoutHash),
    };
    writeOutput(args.output, output);
    console.log(stableParityReportStringify(output));
    return 2;
  }

  const runtimeIdentity = await readAndCompareRuntimeIdentity(report, args);
  if (runtimeIdentity.blockedBy.length > 0) {
    const outputWithoutHash = {
      ok: false,
      status: "blocked" as const,
      requestId: requestIdentity.requestId,
      sourceReportHash: hashParityValue(report),
      blockedBy: runtimeIdentity.blockedBy,
      requestIdentity,
      runtimeIdentity,
    };
    const output = {
      ...outputWithoutHash,
      reportHash: hashParityValue(outputWithoutHash),
    };
    writeOutput(args.output, output);
    console.log(stableParityReportStringify(output));
    return 2;
  }

  const deltaRows = buildResourceDeltaPlacementContexts({ local: report.local, live: report.live });
  if (deltaRows.length === 0) throw new Error("Expected at least one resource delta row");
  if (deltaRows.length > args.maxCells) {
    throw new Error(
      `Resource delta row count ${deltaRows.length} exceeds --max-cells ${args.maxCells}`
    );
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
  const ignoreWeightVerification = summarizeFeasibilityVerification(report, ignoreWeight);
  const resourceBuilderDiagnosticCells = cellsForResourceBuilderDiagnostics(
    ignoreWeightVerification.rows
  );
  const resourceBuilderDiagnosticResourceTypes = resourceTypesForResourceBuilderDiagnostics(
    ignoreWeightVerification.rows
  );
  const resourceBuilderDiagnostics =
    resourceBuilderDiagnosticCells.length > 0
      ? await getResourceBuilderDiagnosticsBatched(
          {
            cells: resourceBuilderDiagnosticCells,
            resourceTypes: resourceBuilderDiagnosticResourceTypes,
            maxCells: args.maxCells,
          },
          { host: args.host, port: args.port, timeoutMs: args.timeoutMs }
        )
      : null;
  const resourceBuilderDiagnosticsSummary =
    resourceBuilderDiagnostics === null
      ? null
      : summarizeResourceBuilderDiagnostics(resourceBuilderDiagnostics);
  const resourceBuilderSubclassification =
    resourceBuilderDiagnosticsSummary === null
      ? null
      : summarizeResourceBuilderSubclassification(
          ignoreWeightVerification.rows,
          resourceBuilderDiagnosticsSummary
        );

  const outputWithoutHash = {
    ok: true,
    requestId: requestIdentity.requestId,
    sourceReportHash: hashParityValue(report),
    requestIdentity,
    runtimeIdentity,
    rowCount: deltaRows.length,
    livePlotContext: summarizeLivePlotContext(livePlotContext),
    resourceBuilderDiagnostics: resourceBuilderDiagnosticsSummary,
    resourceBuilderSubclassification,
    resourceDistributionContext: summarizeResourceDistributionContext(
      report,
      ignoreWeightVerification.rows,
      resourceBuilderDiagnosticsSummary
    ),
    resourcePositionContext: summarizeResourcePositionContext(
      report,
      ignoreWeightVerification.rows
    ),
    localMaterializationContext: summarizeLocalMaterializationContext(
      report,
      ignoreWeightVerification.rows
    ),
    assignmentClassSummary: summarizeAssignmentClasses(ignoreWeightVerification.rows),
    strict: summarizeFeasibilityVerification(report, strict),
    ignoreWeight: ignoreWeightVerification,
  };
  const output = {
    ...outputWithoutHash,
    reportHash: hashParityValue(outputWithoutHash),
  };
  writeOutput(args.output, output);
  console.log(stableParityReportStringify(output));
  return 0;
}

async function getResourceBuilderDiagnosticsBatched(
  input: {
    cells: ReadonlyArray<Civ7ResourcePlacementFeasibilityCellInput>;
    resourceTypes: ReadonlyArray<number>;
    maxCells: number;
  },
  options: Pick<Args, "host" | "port" | "timeoutMs">
): Promise<Civ7ResourceBuilderDiagnosticsResult> {
  const cells = input.cells.slice(0, input.maxCells);
  const batches = chunk(cells, RESOURCE_BUILDER_DIAGNOSTIC_BATCH_SIZE);
  const results: Civ7ResourceBuilderDiagnosticsResult[] = [];
  for (const batch of batches) {
    results.push(
      await getCiv7ResourceBuilderDiagnostics(
        {
          cells: batch,
          resourceTypes: input.resourceTypes,
          maxCells: batch.length,
        },
        options
      )
    );
  }
  const first = results[0];
  if (!first) throw new Error("Expected at least one ResourceBuilder diagnostics batch");
  const resourcesByType = new Map<
    number,
    Civ7ResourceBuilderDiagnosticsResult["resources"][number]
  >();
  for (const result of results) {
    for (const resource of result.resources) {
      resourcesByType.set(resource.resourceType, resource);
    }
  }
  return {
    host: first.host,
    port: first.port,
    state: first.state,
    cellCount: input.cells.length,
    omittedCells:
      Math.max(0, input.cells.length - cells.length) +
      results.reduce((sum, result) => sum + result.omittedCells, 0),
    resources: [...resourcesByType.values()].sort(
      (left, right) => left.resourceType - right.resourceType
    ),
    cells: results.flatMap((result) => result.cells),
  };
}

function extractFinalSurfaceParityReport(payload: unknown): FinalSurfaceParityReport {
  if (!isRecord(payload)) throw new Error("Report payload must be an object");
  const report = isRecord(payload.report) ? payload.report : payload;
  if (!isRecord(report.local) || !isRecord(report.live)) {
    throw new Error("Expected final-surface parity report with local/live snapshots");
  }
  return report as FinalSurfaceParityReport;
}

function resolveRequestIdentity(report: FinalSurfaceParityReport) {
  const packet = report.exactAuthorshipEvidence;
  const sources = {
    exactAuthorshipSummary: stringValue(report.exactAuthorshipSummary.requestId),
    exactAuthorshipEvidence: packet?.requestId,
    log: packet?.log.requestId,
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
    status: blockedBy.length === 0 ? ("matched" as const) : ("blocked" as const),
    blockedBy,
    sources,
  };
}

async function readAndCompareRuntimeIdentity(
  report: FinalSurfaceParityReport,
  args: Pick<Args, "host" | "port" | "timeoutMs">
) {
  const current = await getCiv7MapSummary({
    host: args.host,
    port: args.port,
    timeoutMs: args.timeoutMs,
  });
  const saved = savedRuntimeIdentity(report);
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
    status: blockedBy.length === 0 ? ("matched" as const) : ("blocked" as const),
    blockedBy,
    saved,
    observed,
    comparisons,
  };
}

function savedRuntimeIdentity(report: FinalSurfaceParityReport) {
  const evidence = isRecord(report.live.evidence) ? report.live.evidence : {};
  const runtime = isRecord(evidence.runtime) ? evidence.runtime : {};
  const fullGrid = isRecord(evidence.fullGrid) ? evidence.fullGrid : {};
  const initialSummary = isRecord(fullGrid.initialSummary) ? fullGrid.initialSummary : {};
  return {
    width: numberValue(runtime.width) ?? numberValue(initialSummary.width) ?? report.live.width,
    height: numberValue(runtime.height) ?? numberValue(initialSummary.height) ?? report.live.height,
    plotCount: numberValue(runtime.plotCount) ?? numberValue(initialSummary.plotCount),
    seed: numberValue(runtime.seed) ?? numberValue(initialSummary.seed) ?? report.live.seed,
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

function summarizeFeasibilityVerification(
  report: Pick<FinalSurfaceParityReport, "local" | "live">,
  readback: Civ7ResourcePlacementFeasibilityResult
) {
  const rows = buildResourceDeltaFeasibilityContexts(
    { local: report.local, live: report.live },
    readback
  );
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
    (row) =>
      row.feasibilityClass === "local-overaccepted-live-empty" && row.localResource.value !== null
  );
  const cellsByLocation = new Map(
    diagnostics.cells.map((cell) => [`${cell.location.x},${cell.location.y}`, cell] as const)
  );
  const resourcesByType = new Map(
    diagnostics.resources.map((resource) => [resource.resourceType, resource] as const)
  );
  const classifiedRows = focusedRows.map((row) => {
    const localResourceType = row.localResource.value as number;
    const cell = cellsByLocation.get(`${row.x},${row.y}`);
    const cellResource = cell?.resources[String(localResourceType)];
    const resource = resourcesByType.get(localResourceType);
    const cutResourceTypes = cutResourceTypeNames(cellResource?.bestMapResourceCuts);
    const cutIncludesLocal = cutIncludesResource(
      cellResource?.bestMapResourceCuts,
      localResourceType
    );
    const strict = probeBoolean(cellResource?.canHaveResource.strict);
    const ignoreWeight = probeBoolean(cellResource?.canHaveResource.ignoreWeight);
    const assignmentPhase = row.planIntent?.phase ?? null;
    const officialPolicy = summarizeResourcePolicy(resource);
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
      planIntent: row.planIntent,
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
        officialMinimumPerHemisphere: officialMinimum,
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

function summarizeResourceDistributionContext(
  report: Pick<FinalSurfaceParityReport, "local">,
  rows: ReadonlyArray<ResourceDeltaFeasibilityContext>,
  diagnostics: ResourceBuilderDiagnosticsSummary | null
) {
  const assignmentSummary = readLocalAssignmentSummary(report.local.evidence);
  const assignmentByResource = new Map(
    assignmentSummary.byPreferredResource.map(
      (resource) => [resource.resourceType, resource] as const
    )
  );
  const resourcesByType = new Map(
    (diagnostics?.resources ?? []).map((resource) => [resource.resourceType, resource] as const)
  );
  const locallyAssignedRows = rows.filter(
    (row) => row.planIntent !== null && row.localResource.value !== null
  );
  const groups = new Map<
    number,
    {
      resourceType: number;
      resourceSymbol: string;
      deltaRowCount: number;
      feasibilityClassCounts: Record<string, number>;
      assignmentPhaseCounts: Record<string, number>;
      minAssignmentOrder: number | null;
      maxAssignmentOrder: number | null;
    }
  >();

  for (const row of locallyAssignedRows) {
    const resourceType = row.localResource.value;
    if (resourceType === null) continue;
    let group = groups.get(resourceType);
    if (!group) {
      group = {
        resourceType,
        resourceSymbol: row.localResource.symbol,
        deltaRowCount: 0,
        feasibilityClassCounts: {},
        assignmentPhaseCounts: {},
        minAssignmentOrder: null,
        maxAssignmentOrder: null,
      };
      groups.set(resourceType, group);
    }
    group.deltaRowCount += 1;
    incrementCount(group.feasibilityClassCounts, row.feasibilityClass);
    const phase = row.planIntent?.phase ?? "missing";
    incrementCount(group.assignmentPhaseCounts, phase);
    const assignmentOrder = row.planIntent?.order;
    if (typeof assignmentOrder === "number" && Number.isFinite(assignmentOrder)) {
      group.minAssignmentOrder =
        group.minAssignmentOrder === null
          ? assignmentOrder
          : Math.min(group.minAssignmentOrder, assignmentOrder);
      group.maxAssignmentOrder =
        group.maxAssignmentOrder === null
          ? assignmentOrder
          : Math.max(group.maxAssignmentOrder, assignmentOrder);
    }
  }

  const resourceRows = [...groups.values()]
    .sort((left, right) => left.resourceSymbol.localeCompare(right.resourceSymbol))
    .map((group) => {
      const assignment = assignmentByResource.get(group.resourceType);
      const builder = resourcesByType.get(group.resourceType);
      const officialPolicy = summarizeResourcePolicy(builder);
      const builderCount = probeNumberLike(builder?.count);
      const assignedCount = assignment?.assignedCount ?? null;
      const officialMinimum = officialPolicy.minimumPerHemisphere;
      return {
        resourceType: group.resourceType,
        resourceSymbol: group.resourceSymbol,
        deltaRowCount: group.deltaRowCount,
        feasibilityClassCounts: sortCountRecord(group.feasibilityClassCounts),
        assignmentPhaseCounts: sortCountRecord(group.assignmentPhaseCounts),
        assignmentOrder: {
          min: group.minAssignmentOrder,
          max: group.maxAssignmentOrder,
        },
        localAssignment: assignment ?? null,
        resourceBuilder: {
          count: builderCount,
          officialPolicy,
        },
        comparisons: {
          assignedMinusResourceBuilderCount:
            assignedCount !== null && builderCount !== null ? assignedCount - builderCount : null,
          assignedCountMinusOfficialMinimum:
            assignedCount !== null && officialMinimum !== null
              ? assignedCount - officialMinimum
              : null,
        },
      };
    });

  return {
    evidenceBoundary:
      "Diagnostic context only: ResourceBuilder counts are current post-materialization readback and do not authorize repair without source-owner classification.",
    localAssignedDeltaRowCount: locallyAssignedRows.length,
    resourceTypeCount: resourceRows.length,
    resourceTypesWithAssignedCountGreaterThanBuilderCount: resourceRows.filter(
      (row) =>
        row.comparisons.assignedMinusResourceBuilderCount !== null &&
        row.comparisons.assignedMinusResourceBuilderCount > 0
    ).length,
    rows: resourceRows,
  };
}

function summarizeResourcePositionContext(
  report: Pick<FinalSurfaceParityReport, "local">,
  rows: ReadonlyArray<ResourceDeltaFeasibilityContext>
) {
  const localAssignedRows = rows.filter(
    (row) => row.planIntent !== null && row.localResource.value !== null
  );
  const liveRowsByResource = new Map<number, ResourceDeltaFeasibilityContext[]>();
  for (const row of rows) {
    const resourceType = row.liveResource.value;
    if (resourceType === null || row.localResource.value === resourceType) continue;
    const bucket = liveRowsByResource.get(resourceType) ?? [];
    bucket.push(row);
    liveRowsByResource.set(resourceType, bucket);
  }

  const matchedLivePlotIndexes = new Set<number>();
  const matchedRows = localAssignedRows.map((row) => {
    const resourceType = row.localResource.value as number;
    const candidates = (liveRowsByResource.get(resourceType) ?? []).filter(
      (candidate) => !matchedLivePlotIndexes.has(candidate.plotIndex)
    );
    const match = nearestResourceDeltaMatch(row, candidates, report.local.width);
    if (match !== null) matchedLivePlotIndexes.add(match.row.plotIndex);
    return {
      local: {
        x: row.x,
        y: row.y,
        plotIndex: row.plotIndex,
        resourceSymbol: row.localResource.symbol,
        feasibilityClass: row.feasibilityClass,
        assignmentPhase: row.planIntent?.phase ?? null,
        assignmentOrder: row.planIntent?.order ?? null,
      },
      matchedLive:
        match === null
          ? null
          : {
              x: match.row.x,
              y: match.row.y,
              plotIndex: match.row.plotIndex,
              distance: match.distance,
              evidenceClass: match.row.evidenceClass,
              feasibilityClass: match.row.feasibilityClass,
              localResourceSymbol: match.row.localResource.symbol,
              liveResourceSymbol: match.row.liveResource.symbol,
            },
    };
  });
  const unmatchedRows = matchedRows.filter((row) => row.matchedLive === null);
  const matchedDistances = matchedRows.flatMap((row) =>
    row.matchedLive === null ? [] : [row.matchedLive.distance]
  );

  return {
    evidenceBoundary:
      "Diagnostic context only: nearest same-resource live delta matching is a positional classifier and does not prove Civ placement authorship or authorize repair without source-owner classification.",
    localAssignedDeltaRowCount: localAssignedRows.length,
    matchedSameResourceLiveDeltaRowCount: matchedRows.length - unmatchedRows.length,
    unmatchedLocalAssignedDeltaRowCount: unmatchedRows.length,
    distanceSummary: summarizeDistances(matchedDistances),
    matchClassCounts: countBy(matchedRows, (row) =>
      row.matchedLive === null
        ? `${row.local.feasibilityClass}->unmatched`
        : `${row.local.feasibilityClass}->${row.matchedLive.feasibilityClass}`
    ),
    targetEvidenceClassCounts: countBy(
      matchedRows.filter((row) => row.matchedLive !== null),
      (row) => row.matchedLive?.evidenceClass ?? "unmatched"
    ),
    rows: matchedRows,
  };
}

function summarizeLocalMaterializationContext(
  report: Pick<FinalSurfaceParityReport, "local">,
  rows: ReadonlyArray<ResourceDeltaFeasibilityContext>
) {
  const outcomes = readLocalResourcePlacementOutcomes(report.local.evidence);
  const localResourceValues = report.local.surfaces.resource.values;
  const deltaPlotIndexes = new Set(rows.map((row) => row.plotIndex));
  const placedOutcomes = outcomes.filter((outcome) => outcome.status === "placed");
  const placedRows = placedOutcomes.map((outcome) => {
    const finalLocalValue = normalizeResourceSurfaceValue(localResourceValues[outcome.plotIndex]);
    const matchesFinalSurface = finalLocalValue === outcome.observedResourceType;
    return {
      plotIndex: outcome.plotIndex,
      x: outcome.x,
      y: outcome.y,
      resourceType: outcome.resourceType,
      observedResourceType: outcome.observedResourceType,
      finalLocalResourceType: finalLocalValue,
      matchesFinalSurface,
      inResourceDeltaSet: deltaPlotIndexes.has(outcome.plotIndex),
    };
  });
  const mismatches = placedRows.filter((row) => !row.matchesFinalSurface);
  const deltaRows = placedRows.filter((row) => row.inResourceDeltaSet);
  const deltaMismatches = deltaRows.filter((row) => !row.matchesFinalSurface);

  return {
    evidenceBoundary:
      "Diagnostic context only: local typed placement outcomes are compared to the local final resource surface; this does not prove live Civ final-surface authorship.",
    placedOutcomeCount: placedRows.length,
    placedOutcomesMatchingLocalFinalSurface: placedRows.length - mismatches.length,
    placedOutcomesMismatchingLocalFinalSurface: mismatches.length,
    localAuthoredDeltaPlacedOutcomeCount: deltaRows.length,
    localAuthoredDeltaOutcomesMatchingLocalFinalSurface: deltaRows.length - deltaMismatches.length,
    localAuthoredDeltaOutcomesMismatchingLocalFinalSurface: deltaMismatches.length,
    mismatchRows: mismatches.slice(0, 20),
  };
}

function readLocalResourcePlacementOutcomes(evidence: unknown): ReadonlyArray<{
  status: string;
  plotIndex: number;
  x: number;
  y: number;
  resourceType: number;
  observedResourceType: number | null;
}> {
  const record = isRecord(evidence) ? evidence : {};
  const resourcePlacementOutcomes = isRecord(record.resourcePlacementOutcomes)
    ? record.resourcePlacementOutcomes
    : {};
  const outcomes = Array.isArray(resourcePlacementOutcomes.outcomes)
    ? resourcePlacementOutcomes.outcomes
    : [];
  return outcomes.flatMap((outcome) => {
    if (!isRecord(outcome)) return [];
    const status = stringValue(outcome.status);
    const plotIndex = numberValue(outcome.plotIndex);
    const x = numberValue(outcome.x);
    const y = numberValue(outcome.y);
    const resourceType = numberValue(outcome.resourceType);
    const observedResourceType = nullableNumberValue(outcome.observedResourceType);
    if (
      status === undefined ||
      plotIndex === undefined ||
      x === undefined ||
      y === undefined ||
      resourceType === undefined
    ) {
      return [];
    }
    return [
      {
        status,
        plotIndex,
        x,
        y,
        resourceType,
        observedResourceType,
      },
    ];
  });
}

function normalizeResourceSurfaceValue(value: unknown): number | null {
  const number = numberValue(value);
  return number === undefined || number < 0 ? null : number;
}

function nearestResourceDeltaMatch(
  row: ResourceDeltaFeasibilityContext,
  candidates: ReadonlyArray<ResourceDeltaFeasibilityContext>,
  width: number
): { row: ResourceDeltaFeasibilityContext; distance: number } | null {
  let best: { row: ResourceDeltaFeasibilityContext; distance: number } | null = null;
  for (const candidate of candidates) {
    const distance = hexDistanceOddQPeriodicX(row.plotIndex, candidate.plotIndex, width);
    if (
      best === null ||
      distance < best.distance ||
      (distance === best.distance && candidate.plotIndex < best.row.plotIndex)
    ) {
      best = { row: candidate, distance };
    }
  }
  return best;
}

function summarizeDistances(distances: ReadonlyArray<number>) {
  const sorted = [...distances].sort((left, right) => left - right);
  const quantile = (fraction: number): number | null => {
    if (sorted.length === 0) return null;
    const index = Math.min(
      sorted.length - 1,
      Math.max(0, Math.floor((sorted.length - 1) * fraction))
    );
    return sorted[index];
  };
  return {
    count: sorted.length,
    min: sorted[0] ?? null,
    p50: quantile(0.5),
    p90: quantile(0.9),
    max: sorted[sorted.length - 1] ?? null,
    buckets: {
      "0-2": sorted.filter((distance) => distance <= 2).length,
      "3-5": sorted.filter((distance) => distance >= 3 && distance <= 5).length,
      "6-10": sorted.filter((distance) => distance >= 6 && distance <= 10).length,
      "11+": sorted.filter((distance) => distance >= 11).length,
    },
  };
}

function readLocalAssignmentSummary(evidence: unknown): {
  byPreferredResource: ReadonlyArray<{
    resourceType: number;
    legalPlotCount: number;
    plannedCount: number;
    assignedCount: number;
    reassignedOutCount: number;
    reassignedInCount: number;
    unassignedCount: number;
  }>;
} {
  const record = isRecord(evidence) ? evidence : {};
  const resourcePlacementOutcomes = isRecord(record.resourcePlacementOutcomes)
    ? record.resourcePlacementOutcomes
    : {};
  const assignment = isRecord(resourcePlacementOutcomes.assignment)
    ? resourcePlacementOutcomes.assignment
    : {};
  const byPreferredResource = Array.isArray(assignment.byPreferredResource)
    ? assignment.byPreferredResource
    : [];
  return {
    byPreferredResource: byPreferredResource.flatMap((row) => {
      if (!isRecord(row)) return [];
      const resourceType = numberValue(row.resourceType);
      const legalPlotCount = numberValue(row.legalPlotCount);
      const plannedCount = numberValue(row.plannedCount);
      const assignedCount = numberValue(row.assignedCount);
      const reassignedOutCount = numberValue(row.reassignedOutCount);
      const reassignedInCount = numberValue(row.reassignedInCount);
      const unassignedCount = numberValue(row.unassignedCount);
      if (
        resourceType === undefined ||
        legalPlotCount === undefined ||
        plannedCount === undefined ||
        assignedCount === undefined ||
        reassignedOutCount === undefined ||
        reassignedInCount === undefined ||
        unassignedCount === undefined
      ) {
        return [];
      }
      return [
        {
          resourceType,
          legalPlotCount,
          plannedCount,
          assignedCount,
          reassignedOutCount,
          reassignedInCount,
          unassignedCount,
        },
      ];
    }),
  };
}

function summarizeAssignmentClasses(rows: ReadonlyArray<ResourceDeltaFeasibilityContext>) {
  const locallyAssignedRows = rows.filter((row) => row.planIntent !== null);
  const classAndPhaseRows = locallyAssignedRows.map((row) => ({
    feasibilityClass: row.feasibilityClass,
    evidenceClass: row.evidenceClass,
    assignmentPhase: row.planIntent?.phase ?? "missing",
    resourceSymbol: row.localResource.symbol,
    assignmentOrder: row.planIntent?.order ?? null,
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
      (row) => `${row.feasibilityClass}|${row.assignmentPhase}`
    ),
    classPhaseResources: summarizeClassPhaseResources(classAndPhaseRows),
  };
}

function summarizeClassPhaseResources(
  rows: ReadonlyArray<{
    feasibilityClass: string;
    assignmentPhase: string;
    resourceSymbol: string;
    assignmentOrder: number | null;
  }>
) {
  const groups = new Map<
    string,
    {
      feasibilityClass: string;
      assignmentPhase: string;
      count: number;
      resources: Set<string>;
      minAssignmentOrder: number | null;
      maxAssignmentOrder: number | null;
    }
  >();
  for (const row of rows) {
    const key = `${row.feasibilityClass}|${row.assignmentPhase}`;
    let group = groups.get(key);
    if (!group) {
      group = {
        feasibilityClass: row.feasibilityClass,
        assignmentPhase: row.assignmentPhase,
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
        group.minAssignmentOrder === null
          ? row.assignmentOrder
          : Math.min(group.minAssignmentOrder, row.assignmentOrder);
      group.maxAssignmentOrder =
        group.maxAssignmentOrder === null
          ? row.assignmentOrder
          : Math.max(group.maxAssignmentOrder, row.assignmentOrder);
    }
  }
  return [...groups.values()]
    .sort((left, right) => {
      const classDelta = left.feasibilityClass.localeCompare(right.feasibilityClass);
      if (classDelta !== 0) return classDelta;
      return left.assignmentPhase.localeCompare(right.assignmentPhase);
    })
    .map((group) => ({
      feasibilityClass: group.feasibilityClass,
      assignmentPhase: group.assignmentPhase,
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
  if (input.cutIncludesLocal === true && input.ignoreWeight === false)
    return "scarce-floor-cut-included-rejected";
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
  probe:
    | Civ7RuntimeProbe<ReadonlyArray<{ resourceTypeName?: string; resourceType?: number }>>
    | undefined
): ReadonlyArray<string> | null {
  if (!probe?.ok || !Array.isArray(probe.value)) return null;
  return probe.value.map(
    (resource) => resource.resourceTypeName ?? String(resource.resourceType ?? "unknown")
  );
}

function probeBoolean(probe: Civ7RuntimeProbe<boolean> | undefined): boolean | null {
  if (!probe?.ok || typeof probe.value !== "boolean") return null;
  return probe.value;
}

function probeNumberLike(probe: Civ7RuntimeProbe<number> | undefined): number | null {
  if (!probe?.ok || typeof probe.value !== "number" || !Number.isFinite(probe.value)) return null;
  return probe.value;
}

function summarizeResourcePolicy(
  resource: Civ7ResourceBuilderDiagnosticsResult["resources"][number] | undefined
) {
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
    .filter(
      (row) =>
        row.feasibilityClass === "local-overaccepted-live-empty" && row.localResource.value !== null
    )
    .map((row) => ({
      x: row.x,
      y: row.y,
      resourceTypes: [row.localResource.value as number],
    }));
}

function resourceTypesForResourceBuilderDiagnostics(
  rows: ReadonlyArray<ResourceDeltaFeasibilityContext>
): ReadonlyArray<number> {
  return uniqueNumbers(
    rows.filter((row) => row.planIntent !== null).map((row) => row.localResource.value)
  );
}

function feasibilityValue(
  probe: ResourceDeltaFeasibilityContext["localFeasibleInCiv"]
): "true" | "false" | "not-applicable" | "missing" {
  if (probe === null) return "not-applicable";
  if (!probe.ok || probe.value === null) return "missing";
  return probe.value ? "true" : "false";
}

function countBy<T>(
  items: ReadonlyArray<T>,
  keyFor: (item: T) => string
): Readonly<Record<string, number>> {
  const counts: Record<string, number> = {};
  for (const item of items) {
    const key = keyFor(item);
    incrementCount(counts, key);
  }
  return sortCountRecord(counts);
}

function incrementCount(counts: Record<string, number>, key: string): void {
  counts[key] = (counts[key] ?? 0) + 1;
}

function sortCountRecord(
  counts: Readonly<Record<string, number>>
): Readonly<Record<string, number>> {
  return Object.fromEntries(
    Object.entries(counts).sort(([left], [right]) => left.localeCompare(right))
  );
}

function uniqueNumbers(values: ReadonlyArray<number | null>): number[] {
  return [...new Set(values.filter((value): value is number => value !== null))];
}

function numberValue(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function nullableNumberValue(value: unknown): number | null {
  if (value === null) return null;
  return numberValue(value) ?? null;
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

function chunk<T>(values: ReadonlyArray<T>, size: number): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < values.length; index += size) {
    chunks.push(values.slice(index, index + size));
  }
  return chunks;
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
      console.error(
        JSON.stringify(
          { ok: false, error: error instanceof Error ? error.message : String(error) },
          null,
          2
        )
      );
      process.exitCode = 1;
    });
}
