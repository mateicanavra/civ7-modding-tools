import type { NaturalWonderPlacementOutcome } from "@civ7/adapter";
import { artifacts as placementWonderArtifacts } from "@mapgen/domain/placement/modules/wonders/artifacts/index.js";
import {
  type ArtifactReadValueOf,
  createStep,
  type DeepReadonly,
} from "@swooper/mapgen-core/authoring";

import {
  measureStandardNaturalWonderPlacement,
  STANDARD_NATURAL_WONDER_PLACEMENT_METRIC_KEY,
  type StandardNaturalWonderPlacementMeasurements,
} from "../../../../metrics/families/placement/natural-wonder-placement.js";
import {
  emitStandardNaturalWonderPlacementExactLog,
  type StandardNaturalWonderPlacementExactLogCompatibility,
} from "../../../../parity/placement-exact-log.js";
import {
  buildPlacementPointBuffers,
  definePlacementVizCategoryMeta,
  PLACEMENT_TILE_SPACE_ID,
} from "../../viz.js";
import { config } from "./config.js";

type NaturalWonderPlan = ArtifactReadValueOf<typeof placementWonderArtifacts.naturalWonderPlan>;
type NaturalWonderPlacementRow = StandardNaturalWonderPlacementMeasurements["outcomes"][number];

type NaturalWonderEngine = Readonly<{
  placeNaturalWonder: (
    x: number,
    y: number,
    featureType: number,
    direction: number,
    elevation?: number
  ) => NaturalWonderPlacementOutcome;
}>;

const WONDER_OUTCOME_CATEGORIES = [
  { value: 1, label: "Placed", color: [34, 197, 94, 235] as [number, number, number, number] },
  { value: 3, label: "Rejected", color: [239, 68, 68, 235] as [number, number, number, number] },
] as const;

function admitNaturalWonderPlacementOutcome(
  expected: Readonly<{
    plotIndex: number;
    x: number;
    y: number;
    featureType: number;
    direction: number;
    elevation: number;
  }>,
  outcome: NaturalWonderPlacementOutcome
): NaturalWonderPlacementRow {
  const runtimeStatus = (outcome as { readonly status?: unknown }).status;
  if (runtimeStatus !== "placed" && runtimeStatus !== "rejected") {
    throw new Error(
      `[Placement] Natural-wonder adapter returned unknown outcome status ${String(
        runtimeStatus
      )} at plot ${expected.plotIndex}.`
    );
  }
  if (outcome.status === "placed" && !Number.isFinite(outcome.elevation)) {
    throw new Error(
      `[Placement] Natural-wonder adapter returned placed outcome without finite elevation ` +
        `at plot ${expected.plotIndex}.`
    );
  }

  const elevationDrifted =
    outcome.elevation !== undefined && outcome.elevation !== expected.elevation;
  if (
    outcome.plotIndex !== expected.plotIndex ||
    outcome.x !== expected.x ||
    outcome.y !== expected.y ||
    outcome.featureType !== expected.featureType ||
    outcome.direction !== expected.direction ||
    elevationDrifted
  ) {
    throw new Error(
      `[Placement] Natural-wonder placement outcome drifted from planner identity: ` +
        `expected feature ${expected.featureType} at plot ${expected.plotIndex} ` +
        `(${expected.x},${expected.y}) direction ${expected.direction} elevation ${expected.elevation}; ` +
        `received feature ${outcome.featureType} at plot ${outcome.plotIndex} ` +
        `(${outcome.x},${outcome.y}) direction ${outcome.direction} ` +
        `elevation ${String(outcome.elevation)}.`
    );
  }
  if (outcome.status === "placed") {
    return Object.freeze({
      status: "placed",
      plotIndex: outcome.plotIndex,
      x: outcome.x,
      y: outcome.y,
      featureType: outcome.featureType,
      direction: outcome.direction,
      elevation: Math.trunc(outcome.elevation),
    });
  }
  const reason = outcome.reason;
  if (reason === "out-of-bounds") {
    throw new Error(
      `[Placement] Natural-wonder adapter rejected admitted in-bounds plot ${expected.plotIndex} as out of bounds.`
    );
  }

  if (
    reason !== "unsupported-footprint" &&
    reason !== "set-feature-false" &&
    reason !== "can-have-feature-param-false" &&
    reason !== "readback-mismatch"
  ) {
    throw new Error(
      `[Placement] Natural-wonder adapter returned unknown rejection reason ${String(reason)}.`
    );
  }

  const hasObservedFeatureType = outcome.observedFeatureType !== undefined;
  const hasObservedPlotIndex = outcome.observedPlotIndex !== undefined;
  if (hasObservedFeatureType !== hasObservedPlotIndex) {
    throw new Error(
      `[Placement] Natural-wonder adapter returned incomplete observed rejection identity for ` +
        `${reason} at plot ${expected.plotIndex}.`
    );
  }
  if (
    reason !== "readback-mismatch" &&
    (outcome.expectedFootprintReadback !== undefined ||
      outcome.expectedFootprintReadbackStatus !== undefined)
  ) {
    throw new Error(
      `[Placement] Natural-wonder adapter attached footprint readback evidence to non-readback ` +
        `rejection ${reason} at plot ${expected.plotIndex}.`
    );
  }

  const rejectedIdentity = {
    status: "rejected",
    plotIndex: outcome.plotIndex,
    x: outcome.x,
    y: outcome.y,
    featureType: outcome.featureType,
    direction: outcome.direction,
    ...(outcome.elevation === undefined ? {} : { elevation: Math.trunc(outcome.elevation) }),
  } as const;

  if (reason === "unsupported-footprint" || reason === "set-feature-false") {
    if (hasObservedFeatureType) {
      throw new Error(
        `[Placement] Natural-wonder adapter attached observed rejection identity to ${reason} ` +
          `at plot ${expected.plotIndex}.`
      );
    }
    return reason === "unsupported-footprint"
      ? Object.freeze({ ...rejectedIdentity, reason: "unsupported-footprint" as const })
      : Object.freeze({ ...rejectedIdentity, reason: "set-feature-false" as const });
  }

  if (reason === "can-have-feature-param-false") {
    if (outcome.observedFeatureType !== undefined && outcome.observedPlotIndex !== undefined) {
      return Object.freeze({
        ...rejectedIdentity,
        reason: "can-have-feature-param-false" as const,
        observedFeatureType: outcome.observedFeatureType,
        observedPlotIndex: outcome.observedPlotIndex,
      });
    }
    return Object.freeze({
      ...rejectedIdentity,
      reason: "can-have-feature-param-false" as const,
    });
  }

  if (
    outcome.elevation === undefined ||
    outcome.observedFeatureType === undefined ||
    outcome.observedPlotIndex === undefined ||
    !Array.isArray(outcome.expectedFootprintReadback) ||
    outcome.expectedFootprintReadback.length === 0 ||
    outcome.expectedFootprintReadbackStatus === undefined
  ) {
    throw new Error(
      `[Placement] Natural-wonder adapter returned readback mismatch without complete footprint ` +
        `evidence at plot ${expected.plotIndex}.`
    );
  }

  const observedPairMatchesEvidence = outcome.expectedFootprintReadback.some(
    (cell) =>
      cell.plotIndex === outcome.observedPlotIndex &&
      cell.observedFeatureType === outcome.observedFeatureType
  );
  if (!observedPairMatchesEvidence || outcome.observedFeatureType === outcome.featureType) {
    throw new Error(
      `[Placement] Natural-wonder adapter returned readback mismatch whose observed cell ` +
        `contradicts its footprint evidence at plot ${expected.plotIndex}.`
    );
  }

  const matchingFootprintCells = outcome.expectedFootprintReadback.filter(
    (cell) => cell.observedFeatureType === outcome.featureType
  ).length;
  const derivedReadbackStatus =
    matchingFootprintCells === 0 ? "empty-expected-footprint" : "partial-expected-footprint";
  if (
    matchingFootprintCells === outcome.expectedFootprintReadback.length ||
    outcome.expectedFootprintReadbackStatus !== derivedReadbackStatus
  ) {
    throw new Error(
      `[Placement] Natural-wonder adapter returned readback mismatch with contradictory footprint ` +
        `status at plot ${expected.plotIndex}.`
    );
  }

  return Object.freeze({
    ...rejectedIdentity,
    elevation: Math.trunc(outcome.elevation),
    reason: "readback-mismatch",
    observedFeatureType: outcome.observedFeatureType,
    observedPlotIndex: outcome.observedPlotIndex,
    expectedFootprintReadback: Object.freeze(
      outcome.expectedFootprintReadback.map((cell) => Object.freeze({ ...cell }))
    ),
    expectedFootprintReadbackStatus: outcome.expectedFootprintReadbackStatus,
  });
}

function attemptNaturalWonderAnchor(args: {
  engine: NaturalWonderEngine;
  anchorPlotIndex: number;
  width: number;
  featureType: number;
  direction: number;
  elevation: number;
}): NaturalWonderPlacementRow {
  const { anchorPlotIndex: plotIndex, direction, elevation, engine, featureType, width } = args;
  const y = Math.trunc(plotIndex / width);
  const x = plotIndex - y * width;
  const outcome = engine.placeNaturalWonder(x, y, featureType, direction, elevation);
  return admitNaturalWonderPlacementOutcome(
    { plotIndex, x, y, featureType, direction, elevation },
    outcome
  );
}

function materializeNaturalWonders(args: {
  engine: NaturalWonderEngine;
  width: number;
  plan: DeepReadonly<NaturalWonderPlan>;
}): Readonly<{
  measurements: StandardNaturalWonderPlacementMeasurements;
  exactLogCompatibility: StandardNaturalWonderPlacementExactLogCompatibility;
}> {
  const terminalOutcomes: NaturalWonderPlacementRow[] = [];
  const exactLogOutcomes: NaturalWonderPlacementRow[] = [];

  for (const placement of args.plan.placements) {
    const candidates = [
      { plotIndex: placement.plotIndex, elevation: placement.elevation },
      ...(placement.fallbacks ?? []),
    ];
    let terminalRejection: Extract<NaturalWonderPlacementRow, { status: "rejected" }> | undefined;
    let firstRejection: Extract<NaturalWonderPlacementRow, { status: "rejected" }> | undefined;
    let placed: Extract<NaturalWonderPlacementRow, { status: "placed" }> | undefined;

    for (const candidate of candidates) {
      const outcome = attemptNaturalWonderAnchor({
        engine: args.engine,
        anchorPlotIndex: candidate.plotIndex,
        width: args.width,
        featureType: placement.featureType,
        direction: placement.direction,
        elevation: candidate.elevation,
      });
      if (outcome.status === "placed") {
        placed = outcome;
        break;
      }
      firstRejection ??= outcome;
      terminalRejection = outcome;
    }

    if (placed) {
      terminalOutcomes.push(placed);
      exactLogOutcomes.push(placed);
      continue;
    }
    if (!firstRejection || !terminalRejection) {
      throw new Error(
        `[Placement] Natural-wonder plan ${placement.featureType} at ${placement.plotIndex} produced no adapter outcome.`
      );
    }
    terminalOutcomes.push(terminalRejection);
    exactLogOutcomes.push(firstRejection);
  }

  const measurements = measureStandardNaturalWonderPlacement({
    requestedCount: args.plan.wondersCount,
    outcomes: terminalOutcomes,
  });
  const exactLogCompatibility = Object.freeze({
    requestedCount: args.plan.wondersCount,
    // V1 exact telemetry intentionally preserves the first failed candidate for
    // historical row and digest compatibility; the terminal measurement does not.
    retainedOutcomes: Object.freeze(exactLogOutcomes),
  }) satisfies StandardNaturalWonderPlacementExactLogCompatibility;
  return Object.freeze({
    measurements,
    exactLogCompatibility,
  });
}

/**
 * Materializes planned natural wonders through Civ7 once per ordered candidate chain.
 *
 * The causal plan remains a domain artifact. This step admits adapter identity, preserves
 * deterministic primary/fallback behavior, and emits terminal reconciliation as recipe evidence;
 * current feature occupancy remains adapter state and is read fresh by later consumers.
 */
export const PlaceNaturalWondersStep = createStep(config, {
  run: (context, _stepConfig, _ops, deps) => {
    const naturalWonderPlan = deps.artifacts.naturalWonderPlan.read(context);
    const { exactLogCompatibility, measurements } = materializeNaturalWonders({
      engine: {
        placeNaturalWonder: (
          x: number,
          y: number,
          featureType: number,
          direction: number,
          elevation?: number
        ) => deps.engine.placeNaturalWonder(context, x, y, featureType, direction, elevation),
      },
      width: context.setup.dimensions.width,
      plan: naturalWonderPlan,
    });

    emitStandardNaturalWonderPlacementExactLog(exactLogCompatibility);
    return measurements;
  },
  metrics: ({ result }) => ({
    [STANDARD_NATURAL_WONDER_PLACEMENT_METRIC_KEY]: result,
  }),
  viz: ({ result, dimensions }) => {
    const rows = result.outcomes.map((outcome) => ({
      plotIndex: outcome.plotIndex,
      value: outcome.status === "rejected" ? 3 : 1,
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
              "Planned wonder anchors after deterministic fallback resolution: placed or rejected. Typed rejection and footprint readback evidence lives in the Standard placement metric.",
          }
        ),
      },
    ];
  },
});
