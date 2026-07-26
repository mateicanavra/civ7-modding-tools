import type {
  NaturalWonderFootprintReadback,
  NaturalWonderFootprintReadbackStatus,
  NaturalWonderPlacementOutcome,
} from "@civ7/adapter";
import { artifacts as placementWonderArtifacts } from "@mapgen/domain/placement/modules/wonders/artifacts/index.js";
import {
  type ArtifactReadValueOf,
  type ArtifactValueOf,
  createStep,
  type DeepReadonly,
} from "@swooper/mapgen-core/authoring";
import { fnv1a32StringHex } from "@swooper/mapgen-core/lib/hash";

import {
  buildPlacementPointBuffers,
  definePlacementVizCategoryMeta,
  PLACEMENT_TILE_SPACE_ID,
} from "../../viz.js";
import { config } from "./config.js";

type NaturalWonderPlan = ArtifactReadValueOf<typeof placementWonderArtifacts.naturalWonderPlan>;
type NaturalWonderStampingStats = ArtifactValueOf<
  typeof placementWonderArtifacts.naturalWonderPlacement
>;

type NaturalWonderEngine = Readonly<{
  getFeatureType: (x: number, y: number) => number;
  placeNaturalWonder: (
    x: number,
    y: number,
    featureType: number,
    direction: number,
    elevation?: number
  ) => NaturalWonderPlacementOutcome;
}>;

type StampNaturalWondersFromPlanArgs = {
  engine: NaturalWonderEngine;
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
  return { count: coordinateRows.length, hash32: fnv1a32StringHex(coordinateRows.join("|")) };
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

/**
 * Reads the final feature surface once and returns every plot occupied by a
 * natural-wonder feature that this materialization attempted. Final surface
 * evidence, rather than command-local footprint inference, preserves engine
 * oriented footprints and residue from rejected mutations.
 */
function observeNaturalWonderPlotIndices(
  engine: Pick<NaturalWonderEngine, "getFeatureType">,
  width: number,
  height: number,
  attemptedFeatureTypes: ReadonlySet<number>
): number[] {
  if (attemptedFeatureTypes.size === 0) return [];
  const observedPlotIndices: number[] = [];
  for (let plotIndex = 0; plotIndex < width * height; plotIndex += 1) {
    const y = Math.trunc(plotIndex / width);
    const x = plotIndex - y * width;
    if (attemptedFeatureTypes.has(engine.getFeatureType(x, y) | 0)) {
      observedPlotIndices.push(plotIndex);
    }
  }
  return observedPlotIndices;
}

type NaturalWonderAnchorAttemptPlaced = {
  status: "placed";
  coordinateRow: NaturalWonderPlacementCoordinateRow;
};
type NaturalWonderAnchorAttemptRejected = {
  status: "rejected";
  coordinateRow: NaturalWonderPlacementCoordinateRow;
  rejectionDetail: string;
};
type NaturalWonderAnchorAttempt =
  | NaturalWonderAnchorAttemptPlaced
  | NaturalWonderAnchorAttemptRejected;

/**
 * Candidate anchor list for one admitted wonder plan: the primary plot followed
 * by the planner's bounded, unique `fallbackPlotIndices`. The
 * materialize step tries these in order so a single engine refusal at the
 * planner's first choice does not drop an otherwise-placeable wonder.
 */
function buildNaturalWonderAnchorCandidates(
  primaryPlotIndex: number,
  fallbackPlotIndices: readonly number[] | undefined
): number[] {
  return [primaryPlotIndex, ...(fallbackPlotIndices ?? [])];
}

/**
 * Attempts one planned anchor through the adapter-owned natural-wonder boundary.
 *
 * The adapter owns footprint resolution, legality, mutation, and strict readback;
 * this function only projects its typed outcome into recipe reconciliation evidence.
 */
function attemptStampNaturalWonderAtAnchor(args: {
  engine: NaturalWonderEngine;
  anchorPlotIndex: number;
  width: number;
  featureType: number;
  direction: number;
  elevation: number | undefined;
}): NaturalWonderAnchorAttempt {
  const { engine, width, featureType, direction, elevation } = args;
  const plotIndex = args.anchorPlotIndex;
  const y = (plotIndex / width) | 0;
  const x = plotIndex - y * width;
  const outcome: NaturalWonderPlacementOutcome = engine.placeNaturalWonder(
    x,
    y,
    featureType,
    direction,
    elevation
  );
  if (outcome.status === "rejected") {
    return {
      status: "rejected",
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
        plotIndex: outcome.plotIndex,
        x: outcome.x,
        y: outcome.y,
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
  return {
    status: "placed",
    coordinateRow: {
      status: "placed",
      plotIndex: outcome.plotIndex,
      x: outcome.x,
      y: outcome.y,
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
function stampNaturalWondersFromPlan({
  engine,
  width,
  height,
  wonders,
  requestedCount,
}: StampNaturalWondersFromPlanArgs): NaturalWonderStampingStats {
  const plannedCount = wonders.placements.length;
  const targetCount = wonders.targetCount;
  const requested = requestedCount ?? targetCount;
  const effectiveTargetCount = Math.max(targetCount, requested);
  const shortfallCount = Math.max(0, effectiveTargetCount - plannedCount);

  let placedCount = 0;
  const terrainAdjustedCount = 0;
  const skippedOutOfBoundsCount = 0;
  let rejectedCount = 0;
  const rejectionDetails: string[] = [];
  const coordinateRows: NaturalWonderPlacementCoordinateRow[] = [];
  const attemptedFeatureTypes = new Set<number>();

  for (const placementPlan of wonders.placements) {
    const plotIndex = placementPlan.plotIndex;
    const featureType = placementPlan.featureType;
    const direction = placementPlan.direction;
    attemptedFeatureTypes.add(featureType);
    // Retry across the planner's primary anchor and its fallbacks until the
    // adapter accepts one. The adapter owns footprint, legality, mutation, and
    // readback for every candidate; this recipe retains only ordered fallback
    // policy and one terminal evidence row per planned wonder.
    const anchorCandidates = buildNaturalWonderAnchorCandidates(
      plotIndex,
      placementPlan.fallbackPlotIndices
    );
    let placedAttempt: NaturalWonderAnchorAttemptPlaced | null = null;
    let firstRejection: NaturalWonderAnchorAttemptRejected | null = null;
    for (const anchorPlotIndex of anchorCandidates) {
      const attempt = attemptStampNaturalWonderAtAnchor({
        engine,
        anchorPlotIndex,
        width,
        featureType,
        direction,
        elevation: placementPlan.elevation,
      });
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
      engine,
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
function buildNaturalWonderPlacementRuntimeTelemetry(
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
function logNaturalWonderPlacementRuntimeTelemetry(
  stats: DeepReadonly<NaturalWonderStampingStats>
): void {
  console.log(
    `[SWOOPER_MOD] NATURAL_WONDER_PLACEMENT_V1 ${JSON.stringify(
      buildNaturalWonderPlacementRuntimeTelemetry(stats)
    )}`
  );
}

const WONDER_OUTCOME_CATEGORIES = [
  { value: 1, label: "Placed", color: [34, 197, 94, 235] as [number, number, number, number] },
  { value: 3, label: "Rejected", color: [239, 68, 68, 235] as [number, number, number, number] },
] as const;

/**
 * Stamps planned natural wonders and records fallback outcomes, rejections,
 * and shortfalls as reconciliation evidence rather than aborting optional misses.
 */
export const PlaceNaturalWondersStep = createStep(config, {
  run: (context, _stepConfig, _ops, deps) => {
    const naturalWonderPlan = deps.artifacts.naturalWonderPlan.read(context);
    const { width, height } = context.setup.dimensions;
    const engine = {
      getFeatureType: (x: number, y: number) => deps.engine.getFeatureType(context, x, y),
      placeNaturalWonder: (
        x: number,
        y: number,
        featureType: number,
        direction: number,
        elevation?: number
      ) => deps.engine.placeNaturalWonder(context, x, y, featureType, direction, elevation),
    };

    const stamping = stampNaturalWondersFromPlan({
      engine,
      width,
      height,
      wonders: naturalWonderPlan,
      requestedCount: naturalWonderPlan.wondersCount,
    });

    deps.artifacts.naturalWonderPlacement.publish(context, stamping);
    logNaturalWonderPlacementRuntimeTelemetry(stamping);
    return stamping.coordinateRows;
  },
  viz: ({ result: coordinateRows, dimensions }) => {
    const rows = coordinateRows.map((row) => ({
      plotIndex: row.plotIndex,
      value: row.status === "rejected" ? 3 : 1,
    }));
    const { positions, values } = buildPlacementPointBuffers(rows, dimensions.width);
    return [
      {
        kind: "points",
        dataTypeKey: "placement.wonders.outcome",
        spaceId: PLACEMENT_TILE_SPACE_ID,
        positions,
        values: { format: "u16", values },
        meta: definePlacementVizCategoryMeta(
          "placement.wonders.outcome",
          WONDER_OUTCOME_CATEGORIES,
          {
            label: "Natural Wonder Outcomes",
            description:
              "Planned wonder anchors after stamping: placed or rejected. Per-row reasons and footprint readbacks live in the naturalWonderPlacement artifact.",
          }
        ),
      },
    ];
  },
});
