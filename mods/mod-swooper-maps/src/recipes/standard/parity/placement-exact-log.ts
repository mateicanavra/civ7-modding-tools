import type { ResourceCatalogEntry } from "@civ7/adapter";
import { artifacts as placementWonderArtifacts } from "@mapgen/domain/placement/modules/wonders/artifacts/index.js";
import { artifacts as resourceSiteArtifacts } from "@mapgen/domain/resources/modules/sites/artifacts/index.js";
import type { ArtifactValueOf, DeepReadonly } from "@swooper/mapgen-core/authoring";
import { fnv1a32StringHex } from "@swooper/mapgen-core/lib/hash";

import type { StandardNaturalWonderPlanInputMeasurements } from "../metrics/families/placement/natural-wonder-plan-input.js";
import type { StandardPlacementParityMeasurements } from "../metrics/families/placement-parity.js";
import type { StandardNaturalWonderPlanEvidence } from "./types.js";

type NaturalWonderPlan = ArtifactValueOf<typeof placementWonderArtifacts.naturalWonderPlan>;
type NaturalWonderPlacement = ArtifactValueOf<
  typeof placementWonderArtifacts.naturalWonderPlacement
>;
type NaturalWonderPlacementCoordinateRow = NaturalWonderPlacement["coordinateRows"][number];
type ResourcePlacementOutcomes = ArtifactValueOf<
  typeof resourceSiteArtifacts.resourcePlacementOutcomes
>;

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
    NaturalWonderPlacementCoordinateRow["expectedFootprintReadbackStatus"]
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
  placementOutcomes: DeepReadonly<ResourcePlacementOutcomes>
): Readonly<Record<string, unknown>> {
  const { summary, reconciliation, outcomes } = placementOutcomes;
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
    mismatchCount: summary.mismatchCount,
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
      ...(summary.coordinateEvidence.mismatch.count > 0
        ? {
            mismatchCount: summary.coordinateEvidence.mismatch.count,
            mismatchHash32: summary.coordinateEvidence.mismatch.hash32,
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
      plannedCount: reconciliation.plannedCount,
      placedCount: reconciliation.placedCount,
      rejectedCount: reconciliation.rejectedCount,
      byPhase: reconciliation.byPhase,
      ...(reconciliation.shortfalls.length > 0 ? { shortfalls: reconciliation.shortfalls } : {}),
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
  placementOutcomes: DeepReadonly<ResourcePlacementOutcomes>
): void {
  if (runtimeCatalog.length === 0) return;
  emitPlacementExactLog(
    "RESOURCE_PLACEMENT_V1",
    projectStandardResourcePlacementExactLog(runtimeCatalog, placementOutcomes)
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
  placement: DeepReadonly<NaturalWonderPlacement>
): NaturalWonderPlacementExactLogPayload {
  const rejectedRows: NaturalWonderPlacementExactLogRejectedRow[] = placement.coordinateRows
    .filter((row) => row.status === "rejected")
    .map((row) => [
      "r",
      row.plotIndex,
      row.x,
      row.y,
      row.featureType,
      row.direction,
      row.elevation ?? null,
      row.reason,
      row.observedFeatureType ?? null,
      row.observedPlotIndex ?? null,
      row.expectedFootprintReadbackStatus ?? null,
    ]);

  return {
    version: 1,
    plannedCount: placement.plannedCount,
    targetCount: placement.targetCount,
    placedCount: placement.placedCount,
    terrainAdjustedCount: placement.terrainAdjustedCount,
    skippedOutOfBoundsCount: placement.skippedOutOfBoundsCount,
    rejectedCount: placement.rejectedCount,
    shortfallCount: placement.shortfallCount,
    rejectionExampleCount: placement.rejectionExamples.length,
    rejectionExamples: [...placement.rejectionExamples],
    rejectedRows,
    coordinateEvidence: {
      version: placement.coordinateEvidence.version,
      placedCount: placement.coordinateEvidence.placed.count,
      placedHash32: placement.coordinateEvidence.placed.hash32,
      ...(placement.coordinateEvidence.rejected.count > 0
        ? {
            rejectedCount: placement.coordinateEvidence.rejected.count,
            rejectedHash32: placement.coordinateEvidence.rejected.hash32,
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
  placement: DeepReadonly<NaturalWonderPlacement>
): void {
  emitPlacementExactLog(
    "NATURAL_WONDER_PLACEMENT_V1",
    projectNaturalWonderPlacementExactLog(placement)
  );
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
