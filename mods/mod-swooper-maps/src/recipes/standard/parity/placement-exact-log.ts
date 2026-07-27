import type { ResourceCatalogEntry } from "@civ7/adapter";
import { artifacts as placementWonderArtifacts } from "@mapgen/domain/placement/modules/wonders/artifacts/index.js";
import type { ArtifactValueOf, DeepReadonly } from "@swooper/mapgen-core/authoring";
import { fnv1a32StringHex } from "@swooper/mapgen-core/lib/hash";
import {
  type StandardNaturalWonderPlacementOutcome,
  summarizeNaturalWonderPlacementOutcomes,
} from "../metrics/families/placement/natural-wonder-placement.js";
import type { StandardNaturalWonderPlanInputMeasurements } from "../metrics/families/placement/natural-wonder-plan-input.js";
import type { StandardResourcePlacementMeasurements } from "../metrics/families/placement/resource-placement.js";
import type { StandardPlacementParityMeasurements } from "../metrics/families/placement-parity.js";
import type { StandardNaturalWonderPlanEvidence } from "./types.js";

type NaturalWonderPlan = ArtifactValueOf<typeof placementWonderArtifacts.naturalWonderPlan>;
type NaturalWonderPlacementCoordinateRow = StandardNaturalWonderPlacementOutcome;

type NaturalWonderPlanExactLogRow = readonly [
  status: "p",
  plotIndex: number,
  x: number,
  y: number,
  featureType: number,
  direction: number,
  elevation: number | null,
  priorityPpm: number | null,
];

type NaturalWonderPlacementExactLogRejectedRow = readonly [
  status: "r",
  plotIndex: number,
  x: number,
  y: number,
  featureType: number,
  direction: number,
  elevation: number | null,
  reason: string,
  observedFeatureType: number | null,
  observedPlotIndex: number | null,
  expectedFootprintReadbackStatus: NonNullable<
    Extract<
      NaturalWonderPlacementCoordinateRow,
      { status: "rejected"; reason: "readback-mismatch" }
    >["expectedFootprintReadbackStatus"]
  > | null,
];

type NaturalWonderPlacementExactLogPayload = Readonly<{
  version: 1;
  plannedCount: number;
  targetCount: number;
  placedCount: number;
  terrainAdjustedCount: number;
  skippedOutOfBoundsCount: number;
  rejectedCount: number;
  shortfallCount: number;
  rejectionExampleCount: number;
  rejectionExamples: readonly string[];
  rejectedRows: readonly NaturalWonderPlacementExactLogRejectedRow[];
  coordinateEvidence: Readonly<{
    version: 1;
    placedCount: number;
    placedHash32: string;
    rejectedCount?: number;
    rejectedHash32?: string;
  }>;
}>;

type PlacementExactLogMarker =
  | "NATURAL_WONDER_PLACEMENT_V1"
  | "NATURAL_WONDER_PLAN_INPUT_V2"
  | "NATURAL_WONDER_PLAN_V1"
  | "PLACEMENT_PARITY_V1"
  | "RESOURCE_PLACEMENT_V1";

/**
 * Compatibility input for the established NATURAL_WONDER_PLACEMENT_V1 wire.
 *
 * A successful chain retains its placed outcome. An exhausted fallback chain retains its first
 * rejection, rather than the terminal rejection used by the Standard placement measurement.
 */
export type StandardNaturalWonderPlacementExactLogCompatibility = Readonly<{
  requestedCount: number;
  retainedOutcomes: readonly StandardNaturalWonderPlacementOutcome[];
}>;

function emitPlacementExactLog(marker: PlacementExactLogMarker, payload: unknown): void {
  console.log(`[SWOOPER_MOD] ${marker} ${JSON.stringify(payload)}`);
}

/**
 * Projects completed resource-placement evidence into Studio's compact exact-log envelope.
 *
 * The projection intentionally omits empty rejection and mismatch channels so a full Civ7
 * catalog remains below the engine log's truncation budget.
 */
export function projectStandardResourcePlacementExactLog(
  runtimeCatalog: readonly ResourceCatalogEntry[],
  measurements: StandardResourcePlacementMeasurements
): Readonly<Record<string, unknown>> {
  const { summary, outcomes } = measurements;
  const runtimeByIndex = new Map(runtimeCatalog.map((row) => [row.index, row]));
  const plannedResourceTypes = summary.byResource.filter((row) => row.plannedCount > 0);
  const placedResourceTypes = summary.byResource.filter((row) => row.placedCount > 0);
  const rejectedResourceTypes = summary.byResource.filter((row) => row.rejectedCount > 0);
  const placedCounts = placedResourceTypes.map((row) => row.placedCount);
  const unmappedResourceTypes = summary.byResource.filter(
    (row) => row.placedCount > 0 && !runtimeByIndex.has(row.resourceType)
  );
  const rejectionRows = outcomes
    .filter((outcome) => outcome.status !== "placed")
    .slice(0, 8)
    .map((outcome) => ({
      status: outcome.status,
      resourceType: outcome.resourceType,
      resource: runtimeByIndex.get(outcome.resourceType)?.resourceType ?? null,
      plotIndex: outcome.plotIndex,
      x: outcome.x,
      y: outcome.y,
      reason: outcome.reason ?? null,
      ...(outcome.observedResourceType === undefined
        ? {}
        : {
            observedResourceType: outcome.observedResourceType,
            observedResource:
              runtimeByIndex.get(outcome.observedResourceType)?.resourceType ?? null,
          }),
    }));

  return {
    version: 1,
    plannedCount: summary.plannedCount,
    placedCount: summary.placedCount,
    rejectedCount: summary.rejectedCount,
    mismatchCount: 0,
    uniquePlannedTypes: plannedResourceTypes.length,
    uniquePlacedTypes: placedResourceTypes.length,
    minPlacedCountByType: placedCounts.length > 0 ? Math.min(...placedCounts) : 0,
    maxPlacedCountByType: placedCounts.length > 0 ? Math.max(...placedCounts) : 0,
    runtimeCatalogCount: runtimeCatalog.length,
    coordinateEvidence: {
      version: summary.coordinateEvidence.version,
      placedCount: summary.coordinateEvidence.placed.count,
      placedHash32: summary.coordinateEvidence.placed.hash32,
      ...(summary.coordinateEvidence.rejected.count > 0
        ? {
            rejectedCount: summary.coordinateEvidence.rejected.count,
            rejectedHash32: summary.coordinateEvidence.rejected.hash32,
          }
        : {}),
    },
    rejectedResourceTypes: rejectedResourceTypes.map((row) => row.resourceType),
    ...(rejectionRows.length === 0
      ? {}
      : { rejectionExampleCount: rejectionRows.length, rejectionRows }),
    ...(unmappedResourceTypes.length === 0
      ? {}
      : { unmappedPlacedResourceTypes: unmappedResourceTypes.map((row) => row.resourceType) }),
    reconciliation: {
      plannedCount: summary.plannedCount,
      placedCount: summary.placedCount,
      rejectedCount: summary.rejectedCount,
      byPhase: summary.byPhase,
      ...(summary.shortfalls.length > 0 ? { shortfalls: summary.shortfalls } : {}),
    },
    byReason: summary.byReason,
  };
}

/**
 * Emits resource-placement exact evidence when official runtime identities are available.
 *
 * An empty catalog remains silent because its numeric resource ids cannot be correlated to
 * stable Civ7 identities.
 */
export function emitStandardResourcePlacementExactLog(
  runtimeCatalog: readonly ResourceCatalogEntry[],
  measurements: StandardResourcePlacementMeasurements
): void {
  if (runtimeCatalog.length === 0) return;
  emitPlacementExactLog(
    "RESOURCE_PLACEMENT_V1",
    projectStandardResourcePlacementExactLog(runtimeCatalog, measurements)
  );
}

/**
 * Projects a bounded natural-wonder plan into the single row and digest model used by replay.
 *
 * Rows preserve authored plan order for inspection while the coordinate digest sorts its bounded
 * corpus so equivalent plans retain one deterministic identity.
 */
export function projectStandardNaturalWonderPlanEvidence(
  plan: DeepReadonly<NaturalWonderPlan>
): StandardNaturalWonderPlanEvidence {
  const rows = plan.placements.slice(0, 16).map((placement) => {
    const plotIndex = placement.plotIndex | 0;
    const y = (plotIndex / plan.width) | 0;
    const x = plotIndex - y * plan.width;
    return {
      plotIndex,
      x,
      y,
      featureType: placement.featureType | 0,
      direction: placement.direction | 0,
      elevation: normalizeInteger(placement.elevation),
      priorityPpm: normalizeOptionalPpm(placement.priority),
    };
  });
  const digestRows: NaturalWonderPlanExactLogRow[] = rows.map((row) => [
    "p",
    row.plotIndex,
    row.x,
    row.y,
    row.featureType,
    row.direction,
    row.elevation,
    row.priorityPpm,
  ]);

  return {
    version: 1,
    plannedCount: Math.max(0, plan.plannedCount | 0),
    coordinateDigest: {
      count: rows.length,
      hash32: fnv1a32StringHex(
        digestRows
          .slice()
          .sort((left, right) => {
            if (left[1] !== right[1]) return left[1] - right[1];
            if (left[4] !== right[4]) return left[4] - right[4];
            return left[5] - right[5];
          })
          .map((row) => row.join(":"))
          .join("|")
      ),
    },
    rows,
  };
}

/**
 * Emits the bounded natural-wonder plan rows and digest consumed by Studio exact parity.
 */
export function emitStandardNaturalWonderPlanExactLog(plan: DeepReadonly<NaturalWonderPlan>): void {
  const evidence = projectStandardNaturalWonderPlanEvidence(plan);
  const planRows: NaturalWonderPlanExactLogRow[] = evidence.rows.map((row) => [
    "p",
    row.plotIndex,
    row.x,
    row.y,
    row.featureType,
    row.direction,
    row.elevation,
    row.priorityPpm,
  ]);
  emitPlacementExactLog("NATURAL_WONDER_PLAN_V1", {
    version: 1,
    wondersCount: Math.max(0, plan.wondersCount | 0),
    targetCount: Math.max(0, plan.targetCount | 0),
    plannedCount: evidence.plannedCount,
    planRows,
    coordinateEvidence: {
      version: 1,
      plannedCount: evidence.coordinateDigest.count,
      plannedHash32: evidence.coordinateDigest.hash32,
    },
  });
}

/**
 * Emits the admitted natural-wonder planner-input measurement without a second wire model.
 */
export function emitStandardNaturalWonderPlanInputExactLog(
  measurements: StandardNaturalWonderPlanInputMeasurements
): void {
  emitPlacementExactLog("NATURAL_WONDER_PLAN_INPUT_V2", measurements);
}

function projectNaturalWonderPlacementExactLog(
  compatibility: DeepReadonly<StandardNaturalWonderPlacementExactLogCompatibility>
): NaturalWonderPlacementExactLogPayload {
  const placement = summarizeNaturalWonderPlacementOutcomes({
    requestedCount: compatibility.requestedCount,
    outcomes: compatibility.retainedOutcomes,
  });
  const rejectedRows: NaturalWonderPlacementExactLogRejectedRow[] = placement.outcomes
    .filter((row) => row.status === "rejected")
    .map(projectNaturalWonderPlacementRejectedRow);

  const { summary } = placement;
  return {
    version: 1,
    plannedCount: summary.plannedCount,
    targetCount: summary.requestedCount,
    placedCount: summary.placedCount,
    terrainAdjustedCount: 0,
    skippedOutOfBoundsCount: 0,
    rejectedCount: summary.rejectedCount,
    shortfallCount: summary.shortfallCount,
    rejectionExampleCount: summary.rejectionExamples.length,
    rejectionExamples: [...summary.rejectionExamples],
    rejectedRows,
    coordinateEvidence: {
      version: summary.coordinateEvidence.version,
      placedCount: summary.coordinateEvidence.placed.count,
      placedHash32: summary.coordinateEvidence.placed.hash32,
      ...(summary.coordinateEvidence.rejected.count > 0
        ? {
            rejectedCount: summary.coordinateEvidence.rejected.count,
            rejectedHash32: summary.coordinateEvidence.rejected.hash32,
          }
        : {}),
    },
  };
}

/**
 * Emits natural-wonder materialization evidence while keeping placed coordinates digest-only.
 *
 * Rejected rows remain individually inspectable; a placed coordinate cannot be inferred from this
 * line because the placed channel intentionally exposes only its count and FNV-1a digest.
 */
export function emitStandardNaturalWonderPlacementExactLog(
  compatibility: DeepReadonly<StandardNaturalWonderPlacementExactLogCompatibility>
): void {
  emitPlacementExactLog(
    "NATURAL_WONDER_PLACEMENT_V1",
    projectNaturalWonderPlacementExactLog(compatibility)
  );
}

function projectNaturalWonderPlacementRejectedRow(
  row: Extract<NaturalWonderPlacementCoordinateRow, { status: "rejected" }>
): NaturalWonderPlacementExactLogRejectedRow {
  const observedPair =
    row.reason === "readback-mismatch" ||
    (row.reason === "can-have-feature-param-false" && "observedPlotIndex" in row)
      ? ([row.observedFeatureType, row.observedPlotIndex] as const)
      : ([null, null] as const);
  return [
    "r",
    row.plotIndex,
    row.x,
    row.y,
    row.featureType,
    row.direction,
    row.elevation ?? null,
    row.reason,
    observedPair[0],
    observedPair[1],
    row.reason === "readback-mismatch" ? row.expectedFootprintReadbackStatus : null,
  ];
}

/**
 * Emits the terminal Placement surface counters measured after every materialization step.
 */
export function emitStandardPlacementParityExactLog(
  measurements: StandardPlacementParityMeasurements
): void {
  emitPlacementExactLog("PLACEMENT_PARITY_V1", measurements);
}

function normalizeInteger(value: unknown): number | null {
  return Number.isFinite(value) ? Math.trunc(value as number) : null;
}

function normalizeOptionalPpm(value: unknown): number | null {
  if (!Number.isFinite(value)) return null;
  return Math.max(0, Math.min(1_000_000, Math.round((value as number) * 1_000_000)));
}
