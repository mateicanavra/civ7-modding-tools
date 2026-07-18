import type {
  NaturalWonderFootprintReadback,
  NaturalWonderFootprintReadbackStatus,
  NaturalWonderPlacementOutcome,
} from "@civ7/adapter";
import { CIV7_BROWSER_TABLES_V0, getNaturalWonderFootprintIndices } from "@civ7/map-policy";
import placement from "@mapgen/domain/placement";
import type { MapContext } from "@swooper/mapgen-core";
import type { DeepReadonly, Static } from "@swooper/mapgen-core/authoring";

type NaturalWonderPlan = Static<(typeof placement.ops.planNaturalWonders)["output"]>;

type StampNaturalWondersFromPlanArgs = {
  adapter: MapContext["adapter"];
  width: number;
  height: number;
  wonders: DeepReadonly<NaturalWonderPlan>;
  requestedCount?: number;
};

type NaturalWonderPlacementCoordinateDigest = {
  count: number;
  hash32: string;
};

type NaturalWonderPlacementCoordinateEvidence = {
  version: 1;
  placed: NaturalWonderPlacementCoordinateDigest;
  rejected: NaturalWonderPlacementCoordinateDigest;
};

type NaturalWonderPlacementCoordinateRow = {
  status: "placed" | "rejected";
  plotIndex: number;
  x: number;
  y: number;
  featureType: number;
  direction: number;
  elevation?: number;
  reason: string;
  observedFeatureType?: number;
  observedPlotIndex?: number;
  expectedFootprintReadback?: NaturalWonderFootprintReadback[];
  expectedFootprintReadbackStatus?: NaturalWonderFootprintReadbackStatus;
};

/**
 * Complete batch outcome published after natural-wonder commands and final feature observation.
 * Command rows explain one terminal outcome per planned placement;
 * `observedNaturalWonderPlotIndices` is the authoritative downstream exclusion surface,
 * including engine-oriented footprints and rejected residue from any attempted anchor.
 */
export type NaturalWonderStampingStats = {
  plannedCount: number;
  targetCount: number;
  placedCount: number;
  terrainAdjustedCount: number;
  skippedOutOfBoundsCount: number;
  rejectedCount: number;
  shortfallCount: number;
  rejectionExamples: string[];
  coordinateEvidence: NaturalWonderPlacementCoordinateEvidence;
  coordinateRows: NaturalWonderPlacementCoordinateRow[];
  observedNaturalWonderPlotIndices: number[];
};

type NaturalWonderPlacementRuntimeTelemetry = {
  version: 1;
  plannedCount: number;
  targetCount: number;
  placedCount: number;
  terrainAdjustedCount: number;
  skippedOutOfBoundsCount: number;
  rejectedCount: number;
  shortfallCount: number;
  rejectionExampleCount: number;
  rejectionExamples: string[];
  rejectedRows: NaturalWonderPlacementRuntimeRejectedRow[];
  coordinateEvidence: {
    version: 1;
    placedCount: number;
    placedHash32: string;
    rejectedCount?: number;
    rejectedHash32?: string;
  };
};

type NaturalWonderPlacementRuntimeRejectedRow = readonly [
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
  expectedFootprintReadbackStatus: NaturalWonderFootprintReadbackStatus | null,
];

const FEATURE_VALID_TERRAIN_TYPE_INDICES =
  CIV7_BROWSER_TABLES_V0.featureValidTerrainTypeIndices as Record<
    string,
    readonly number[] | undefined
  >;
const POLAR_WATER_ROWS = Math.max(0, CIV7_BROWSER_TABLES_V0.mapGlobals.polarWaterRows | 0);
const FEATURE_POLICIES = CIV7_BROWSER_TABLES_V0.featurePolicies as Record<
  string,
  | { placementClass?: string; naturalWonderTiles?: number; naturalWonderDirection?: number }
  | undefined
>;
const FNV1A_32_OFFSET = 0x811c9dc5;
const FNV1A_32_PRIME = 0x01000193;

function hash32Hex(input: string): string {
  let hash = FNV1A_32_OFFSET;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, FNV1A_32_PRIME);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function naturalWonderCoordinateDigest(
  rows: readonly NaturalWonderPlacementCoordinateRow[],
  status: NaturalWonderPlacementCoordinateRow["status"]
): NaturalWonderPlacementCoordinateDigest {
  const coordinateRows = rows
    .filter((row) => row.status === status)
    .slice()
    .sort((a, b) => {
      if (a.plotIndex !== b.plotIndex) return a.plotIndex - b.plotIndex;
      if (a.featureType !== b.featureType) return a.featureType - b.featureType;
      if (a.direction !== b.direction) return a.direction - b.direction;
      return a.reason.localeCompare(b.reason);
    })
    .map((row) => {
      const fields: Array<string | number> = [
        row.status,
        row.plotIndex,
        row.x,
        row.y,
        row.featureType,
        row.direction,
        row.reason,
      ];
      if (row.observedPlotIndex !== undefined) fields.push(`observedPlot=${row.observedPlotIndex}`);
      if (row.observedFeatureType !== undefined)
        fields.push(`observedFeature=${row.observedFeatureType}`);
      const footprint = formatExpectedFootprintReadback(row.expectedFootprintReadback);
      if (footprint !== undefined) fields.push(`footprint=${footprint}`);
      const readbackStatus = resolveExpectedFootprintReadbackStatus(
        row.featureType,
        row.expectedFootprintReadback,
        row.expectedFootprintReadbackStatus
      );
      if (readbackStatus !== undefined) fields.push(`readback=${readbackStatus}`);
      return fields.join(":");
    });
  return { count: coordinateRows.length, hash32: hash32Hex(coordinateRows.join("|")) };
}

function formatExpectedFootprintReadback(
  readback: readonly NaturalWonderFootprintReadback[] | undefined
): string | undefined {
  if (!Array.isArray(readback) || readback.length === 0) return undefined;
  return readback.map((row) => `${row.plotIndex | 0}:${row.observedFeatureType | 0}`).join(",");
}

function resolveExpectedFootprintReadbackStatus(
  featureType: number,
  readback: readonly NaturalWonderFootprintReadback[] | undefined,
  explicitStatus?: NaturalWonderFootprintReadbackStatus
): NaturalWonderFootprintReadbackStatus | undefined {
  if (explicitStatus !== undefined) return explicitStatus;
  if (!Array.isArray(readback) || readback.length === 0) return undefined;
  const matchingCells = readback.filter(
    (cell) => (cell.observedFeatureType | 0) === (featureType | 0)
  ).length;
  if (matchingCells === readback.length) return undefined;
  return matchingCells === 0 ? "empty-expected-footprint" : "partial-expected-footprint";
}

function formatNaturalWonderRejectionExample(args: {
  featureType: number;
  plotIndex: number;
  direction: number;
  elevation?: number;
  reason: string;
  observedPlotIndex?: number;
  observedFeatureType?: number;
  expectedFootprintReadback?: readonly NaturalWonderFootprintReadback[];
  expectedFootprintReadbackStatus?: NaturalWonderFootprintReadbackStatus;
}): string {
  const footprint = formatExpectedFootprintReadback(args.expectedFootprintReadback);
  const readbackStatus = resolveExpectedFootprintReadbackStatus(
    args.featureType,
    args.expectedFootprintReadback,
    args.expectedFootprintReadbackStatus
  );
  return [
    `feature=${args.featureType}`,
    `plot=${args.plotIndex}`,
    `direction=${args.direction}`,
    ...(args.elevation === undefined ? [] : [`elevation=${Math.trunc(args.elevation)}`]),
    `reason=${args.reason}`,
    ...(args.observedPlotIndex === undefined ? [] : [`observedPlot=${args.observedPlotIndex}`]),
    ...(args.observedFeatureType === undefined
      ? []
      : [`observedFeature=${args.observedFeatureType}`]),
    ...(footprint === undefined ? [] : [`footprint=${footprint}`]),
    ...(readbackStatus === undefined ? [] : [`readback=${readbackStatus}`]),
  ].join(" ");
}

function naturalWonderCoordinateEvidence(
  rows: readonly NaturalWonderPlacementCoordinateRow[]
): NaturalWonderPlacementCoordinateEvidence {
  return {
    version: 1,
    placed: naturalWonderCoordinateDigest(rows, "placed"),
    rejected: naturalWonderCoordinateDigest(rows, "rejected"),
  };
}

function getValidTerrainTypesForFeature(featureType: number): readonly number[] {
  const terrainTypes = FEATURE_VALID_TERRAIN_TYPE_INDICES[String(featureType | 0)];
  return Array.isArray(terrainTypes) ? terrainTypes : [];
}

/**
 * Reads the final feature surface once and returns every plot occupied by a
 * natural-wonder feature that this materialization attempted. Final surface
 * evidence, rather than command-local footprint inference, preserves engine
 * relocations, self-oriented footprints, and residue from rejected mutations.
 */
function observeNaturalWonderPlotIndices(
  adapter: MapContext["adapter"],
  width: number,
  height: number,
  attemptedFeatureTypes: ReadonlySet<number>
): number[] {
  if (attemptedFeatureTypes.size === 0) return [];
  const observedPlotIndices: number[] = [];
  for (let plotIndex = 0; plotIndex < width * height; plotIndex += 1) {
    const y = Math.trunc(plotIndex / width);
    const x = plotIndex - y * width;
    if (attemptedFeatureTypes.has(adapter.getFeatureType(x, y) | 0)) {
      observedPlotIndices.push(plotIndex);
    }
  }
  return observedPlotIndices;
}

function ensureFeatureValidTerrain(
  adapter: MapContext["adapter"],
  x: number,
  y: number,
  height: number,
  featureType: number
): "unchanged" | "adjusted" | "blocked" {
  const validTerrainTypes = getValidTerrainTypesForFeature(featureType);
  if (validTerrainTypes.length === 0) return "blocked";
  if (y < POLAR_WATER_ROWS || y >= height - POLAR_WATER_ROWS) return "blocked";

  const currentTerrain = adapter.getTerrainType(x, y) | 0;
  if (validTerrainTypes.includes(currentTerrain)) return "unchanged";

  const targetTerrain = validTerrainTypes[0];
  if (!Number.isFinite(targetTerrain) || targetTerrain < 0) return "blocked";

  adapter.setTerrainType(x, y, targetTerrain | 0);
  return "adjusted";
}

type NaturalWonderAnchorAttemptPlaced = {
  status: "placed";
  terrainAdjusted: number;
  coordinateRow: NaturalWonderPlacementCoordinateRow;
};
type NaturalWonderAnchorAttemptRejected = {
  status: "rejected";
  terrainAdjusted: number;
  coordinateRow: NaturalWonderPlacementCoordinateRow;
  rejectionDetail: string;
};
type NaturalWonderAnchorAttempt =
  | NaturalWonderAnchorAttemptPlaced
  | NaturalWonderAnchorAttemptRejected;

/**
 * Candidate anchor list for one planned wonder: the primary plot followed by the
 * planner's sanitized, de-duplicated, in-bounds `fallbackPlotIndices`. The
 * materialize step tries these in order so a single engine refusal at the
 * planner's first choice does not drop an otherwise-placeable wonder.
 */
function buildNaturalWonderAnchorCandidates(
  primaryPlotIndex: number,
  fallbackPlotIndices: readonly number[] | undefined,
  width: number,
  height: number
): number[] {
  const size = width * height;
  const anchors: number[] = [primaryPlotIndex];
  const seen = new Set<number>([primaryPlotIndex]);
  if (Array.isArray(fallbackPlotIndices)) {
    for (const raw of fallbackPlotIndices) {
      if (!Number.isFinite(raw)) continue;
      const idx = Math.trunc(raw);
      if (idx < 0 || idx >= size || seen.has(idx)) continue;
      seen.add(idx);
      anchors.push(idx);
    }
  }
  return anchors;
}

/**
 * Attempts to stamp one natural wonder at a single anchor: recomputes the
 * parity-aware footprint for THIS anchor, runs the occupancy + valid-terrain
 * pre-check, calls `adapter.placeNaturalWonder`, and verifies strict readback.
 * Returns a `placed`/`rejected` discriminated result plus the terrain
 * adjustments performed (real map mutations, counted even when the attempt is
 * later superseded). The engine is the final legality authority — this is the
 * per-anchor unit the retry loop iterates over.
 */
function attemptStampNaturalWonderAtAnchor(args: {
  adapter: MapContext["adapter"];
  anchorPlotIndex: number;
  width: number;
  height: number;
  featureType: number;
  direction: number;
  plannedElevation: number | undefined;
  rawElevation: number | undefined;
}): NaturalWonderAnchorAttempt {
  const { adapter, width, height, featureType, direction, plannedElevation, rawElevation } = args;
  const plotIndex = args.anchorPlotIndex;
  const y = (plotIndex / width) | 0;
  const x = plotIndex - y * width;
  let terrainAdjusted = 0;
  const footprint = getNaturalWonderFootprintIndices({
    x,
    y,
    width,
    height,
    policy: FEATURE_POLICIES[String(featureType)],
    direction,
  });
  if (!footprint) {
    return {
      status: "rejected",
      terrainAdjusted,
      rejectionDetail: `feature=${featureType} plot=${plotIndex} reason=unsupported-footprint`,
      coordinateRow: {
        status: "rejected",
        plotIndex,
        x,
        y,
        featureType,
        direction,
        ...(plannedElevation === undefined ? {} : { elevation: plannedElevation }),
        reason: "unsupported-footprint",
      },
    };
  }
  for (const footprintPlotIndex of footprint) {
    const fy = (footprintPlotIndex / width) | 0;
    const fx = footprintPlotIndex - fy * width;
    if ((adapter.getFeatureType(fx, fy) | 0) !== (adapter.NO_FEATURE | 0)) {
      const reason = `occupied:${footprintPlotIndex}`;
      return {
        status: "rejected",
        terrainAdjusted,
        rejectionDetail: `feature=${featureType} plot=${plotIndex} reason=${reason}`,
        coordinateRow: {
          status: "rejected",
          plotIndex,
          x,
          y,
          featureType,
          direction,
          ...(plannedElevation === undefined ? {} : { elevation: plannedElevation }),
          reason,
        },
      };
    }
    const terrainStatus = ensureFeatureValidTerrain(adapter, fx, fy, height, featureType);
    if (terrainStatus === "blocked") {
      const reason = `terrain-policy:${footprintPlotIndex}`;
      return {
        status: "rejected",
        terrainAdjusted,
        rejectionDetail: `feature=${featureType} plot=${plotIndex} reason=${reason}`,
        coordinateRow: {
          status: "rejected",
          plotIndex,
          x,
          y,
          featureType,
          direction,
          ...(plannedElevation === undefined ? {} : { elevation: plannedElevation }),
          reason,
        },
      };
    }
    if (terrainStatus === "adjusted") terrainAdjusted += 1;
  }
  const outcome: NaturalWonderPlacementOutcome = adapter.placeNaturalWonder(
    x,
    y,
    featureType,
    direction,
    rawElevation
  );
  if (outcome.status === "rejected") {
    return {
      status: "rejected",
      terrainAdjusted,
      rejectionDetail: formatNaturalWonderRejectionExample({
        featureType,
        plotIndex,
        direction,
        elevation: outcome.elevation,
        reason: outcome.reason,
        observedPlotIndex: outcome.observedPlotIndex,
        observedFeatureType: outcome.observedFeatureType,
        expectedFootprintReadback: outcome.expectedFootprintReadback,
        expectedFootprintReadbackStatus: outcome.expectedFootprintReadbackStatus,
      }),
      coordinateRow: {
        status: "rejected",
        plotIndex,
        x,
        y,
        featureType,
        direction,
        ...(outcome.elevation === undefined ? {} : { elevation: Math.trunc(outcome.elevation) }),
        reason: outcome.reason,
        ...(outcome.observedPlotIndex === undefined
          ? {}
          : { observedPlotIndex: outcome.observedPlotIndex }),
        ...(outcome.observedFeatureType === undefined
          ? {}
          : { observedFeatureType: outcome.observedFeatureType }),
        ...(outcome.expectedFootprintReadback === undefined
          ? {}
          : { expectedFootprintReadback: outcome.expectedFootprintReadback }),
        ...(outcome.expectedFootprintReadbackStatus === undefined
          ? {}
          : { expectedFootprintReadbackStatus: outcome.expectedFootprintReadbackStatus }),
      },
    };
  }
  let readbackMismatch = false;
  for (const footprintPlotIndex of footprint) {
    const fy = (footprintPlotIndex / width) | 0;
    const fx = footprintPlotIndex - fy * width;
    if ((adapter.getFeatureType(fx, fy) | 0) !== featureType) {
      readbackMismatch = true;
      break;
    }
  }
  if (readbackMismatch) {
    return {
      status: "rejected",
      terrainAdjusted,
      rejectionDetail: `feature=${featureType} plot=${plotIndex} reason=readback-mismatch`,
      coordinateRow: {
        status: "rejected",
        plotIndex,
        x,
        y,
        featureType,
        direction,
        ...(outcome.elevation === undefined ? {} : { elevation: Math.trunc(outcome.elevation) }),
        reason: "readback-mismatch",
      },
    };
  }
  return {
    status: "placed",
    terrainAdjusted,
    coordinateRow: {
      status: "placed",
      plotIndex,
      x,
      y,
      featureType,
      direction,
      ...(outcome.elevation === undefined ? {} : { elevation: Math.trunc(outcome.elevation) }),
      reason: "placed",
    },
  };
}

/**
 * Materializes natural-wonder intent as the product owned by
 * `place-natural-wonders`.
 *
 * Natural wonders are not a final-placement side effect anymore: the planner
 * publishes deterministic intent, this step applies it once, and downstream
 * steps consume the published evidence. Corrupt plans still fail hard, but
 * adapter legality shortfalls are measured as placement outcomes instead of
 * killing otherwise playable map generation.
 */
export function stampNaturalWondersFromPlan({
  adapter,
  width,
  height,
  wonders,
  requestedCount,
}: StampNaturalWondersFromPlanArgs): NaturalWonderStampingStats {
  if (wonders.width !== width || wonders.height !== height) {
    throw new Error(
      `[Placement] Natural wonder plan dimensions ${wonders.width}x${wonders.height} do not match map ${width}x${height}.`
    );
  }
  const plannedCount = wonders.placements.length;
  const declaredPlannedCount = Math.max(0, wonders.plannedCount | 0);
  const targetCount = Math.max(0, wonders.targetCount | 0);
  if (declaredPlannedCount !== plannedCount) {
    throw new Error(
      `[Placement] Natural wonder plan metadata mismatch (plannedCount=${declaredPlannedCount}, placements=${plannedCount}).`
    );
  }
  const requested = Math.max(
    0,
    Number.isFinite(requestedCount) ? (requestedCount as number) | 0 : targetCount
  );
  const effectiveTargetCount = Math.max(targetCount, requested);
  const shortfallCount = Math.max(0, effectiveTargetCount - plannedCount);

  let placedCount = 0;
  let terrainAdjustedCount = 0;
  let skippedOutOfBoundsCount = 0;
  let rejectedCount = 0;
  const rejectionDetails: string[] = [];
  const coordinateRows: NaturalWonderPlacementCoordinateRow[] = [];
  const attemptedFeatureTypes = new Set<number>();

  for (const placementPlan of wonders.placements) {
    if (!Number.isFinite(placementPlan.plotIndex)) {
      throw new Error(
        `[Placement] Natural wonder placement has invalid plotIndex (${String(placementPlan.plotIndex)}).`
      );
    }
    const plotIndex = placementPlan.plotIndex | 0;
    if (plotIndex < 0 || plotIndex >= width * height) {
      skippedOutOfBoundsCount += 1;
      rejectionDetails.push(
        `feature=${placementPlan.featureType} plot=${plotIndex} reason=out-of-bounds`
      );
      coordinateRows.push({
        status: "rejected",
        plotIndex,
        x: -1,
        y: -1,
        featureType: Number.isFinite(placementPlan.featureType)
          ? Math.trunc(placementPlan.featureType)
          : -1,
        direction: Number.isFinite(placementPlan.direction)
          ? Math.trunc(placementPlan.direction)
          : -1,
        ...(Number.isFinite(placementPlan.elevation)
          ? { elevation: Math.trunc(placementPlan.elevation) }
          : {}),
        reason: "out-of-bounds",
      });
      continue;
    }

    if (!Number.isFinite(placementPlan.featureType) || !Number.isFinite(placementPlan.direction)) {
      throw new Error(
        `[Placement] Natural wonder placement at plot ${plotIndex} has invalid feature metadata (featureType=${String(placementPlan.featureType)}, direction=${String(placementPlan.direction)}).`
      );
    }
    if (placementPlan.elevation !== undefined && !Number.isFinite(placementPlan.elevation)) {
      throw new Error(
        `[Placement] Natural wonder placement at plot ${plotIndex} has invalid elevation (${String(placementPlan.elevation)}).`
      );
    }

    const featureType = Math.trunc(placementPlan.featureType);
    const direction = Math.trunc(placementPlan.direction);
    attemptedFeatureTypes.add(featureType);
    const plannedElevation = Number.isFinite(placementPlan.elevation)
      ? Math.trunc(placementPlan.elevation)
      : undefined;
    // Retry across the planner's primary anchor and its fallbacks until the
    // engine accepts one. canHaveFeatureParam-true does NOT guarantee
    // setFeatureType-success, so the planner publishes next-best anchors and the
    // engine remains the final legality authority. Every attempt recomputes its
    // own parity-aware footprint + occupancy/terrain pre-check; if all fail, the
    // PRIMARY anchor's failure is recorded (one outcome row per placement).
    //
    // ensureFeatureValidTerrain may stamp valid terrain on an attempted anchor
    // before placement, so a failed primary followed by a placed fallback can
    // leave the primary's terrain adjusted. In practice this is inert: the
    // planner only emits anchors whose footprint already passed validTerrainTypes
    // (the same Feature_ValidTerrains source), so the pre-check returns
    // "unchanged" and performs no mutation. terrainAdjustedCount counts every
    // real mutation honestly (placed or superseded), matching the prior
    // single-anchor accounting on the no-fallback path.
    const rawElevation = Number.isFinite(placementPlan.elevation)
      ? (placementPlan.elevation as number)
      : undefined;
    const anchorCandidates = buildNaturalWonderAnchorCandidates(
      plotIndex,
      placementPlan.fallbackPlotIndices,
      width,
      height
    );
    let placedAttempt: NaturalWonderAnchorAttemptPlaced | null = null;
    let firstRejection: NaturalWonderAnchorAttemptRejected | null = null;
    for (const anchorPlotIndex of anchorCandidates) {
      const attempt = attemptStampNaturalWonderAtAnchor({
        adapter,
        anchorPlotIndex,
        width,
        height,
        featureType,
        direction,
        plannedElevation,
        rawElevation,
      });
      terrainAdjustedCount += attempt.terrainAdjusted;
      if (attempt.status === "placed") {
        placedAttempt = attempt;
        break;
      }
      if (!firstRejection) firstRejection = attempt;
    }
    if (placedAttempt) {
      placedCount += 1;
      coordinateRows.push(placedAttempt.coordinateRow);
      continue;
    }
    const rejection = firstRejection!;
    rejectedCount += 1;
    rejectionDetails.push(rejection.rejectionDetail);
    coordinateRows.push(rejection.coordinateRow);
  }

  return {
    plannedCount,
    targetCount: effectiveTargetCount,
    placedCount,
    terrainAdjustedCount,
    skippedOutOfBoundsCount,
    rejectedCount,
    shortfallCount,
    rejectionExamples: rejectionDetails.slice(0, 8),
    coordinateEvidence: naturalWonderCoordinateEvidence(coordinateRows),
    coordinateRows,
    observedNaturalWonderPlotIndices: observeNaturalWonderPlotIndices(
      adapter,
      width,
      height,
      attemptedFeatureTypes
    ),
  };
}

function buildNaturalWonderRuntimeRejectedRows(
  rows: DeepReadonly<NaturalWonderPlacementCoordinateRow[]>
): NaturalWonderPlacementRuntimeRejectedRow[] {
  return rows
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
}

/**
 * Projects stamping stats into the emitted `NATURAL_WONDER_PLACEMENT_V1`
 * telemetry payload.
 *
 * PRECISION CAVEAT (load-bearing for evidence claims): the payload exposes
 * per-row coordinates ONLY for REJECTED rows (`rejectedRows`). Placed wonders are
 * summarized as an opaque `coordinateEvidence.placedHash32` (FNV-1a 32) plus a
 * count — no individual placed coordinate. So a wonder's placed status is derived
 * as `planned − rejected`, and a specific placed coordinate or its row parity is
 * NOT directly provable from telemetry. The rejected-digest fields are omitted
 * entirely when there are no rejected rows (keeps clean-run hashes stable).
 */
export function buildNaturalWonderPlacementRuntimeTelemetry(
  stats: DeepReadonly<NaturalWonderStampingStats>
): NaturalWonderPlacementRuntimeTelemetry {
  return {
    version: 1,
    plannedCount: stats.plannedCount,
    targetCount: stats.targetCount,
    placedCount: stats.placedCount,
    terrainAdjustedCount: stats.terrainAdjustedCount,
    skippedOutOfBoundsCount: stats.skippedOutOfBoundsCount,
    rejectedCount: stats.rejectedCount,
    shortfallCount: stats.shortfallCount,
    rejectionExampleCount: stats.rejectionExamples.length,
    rejectionExamples: [...stats.rejectionExamples],
    rejectedRows: buildNaturalWonderRuntimeRejectedRows(stats.coordinateRows),
    coordinateEvidence: {
      version: stats.coordinateEvidence.version,
      placedCount: stats.coordinateEvidence.placed.count,
      placedHash32: stats.coordinateEvidence.placed.hash32,
      ...(stats.coordinateEvidence.rejected.count > 0
        ? {
            rejectedCount: stats.coordinateEvidence.rejected.count,
            rejectedHash32: stats.coordinateEvidence.rejected.hash32,
          }
        : {}),
    },
  };
}

/**
 * Emits the `NATURAL_WONDER_PLACEMENT_V1` line to the engine log (the
 * `[SWOOPER_MOD]`-prefixed channel that live-evidence tooling scrapes). The single
 * runtime sink for placement evidence; see
 * {@link buildNaturalWonderPlacementRuntimeTelemetry} for the payload's
 * placed-vs-rejected precision caveat.
 */
export function logNaturalWonderPlacementRuntimeTelemetry(
  stats: DeepReadonly<NaturalWonderStampingStats>
): void {
  console.log(
    `[SWOOPER_MOD] NATURAL_WONDER_PLACEMENT_V1 ${JSON.stringify(
      buildNaturalWonderPlacementRuntimeTelemetry(stats)
    )}`
  );
}
