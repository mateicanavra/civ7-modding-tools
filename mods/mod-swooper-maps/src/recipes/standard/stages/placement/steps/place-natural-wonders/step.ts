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
  if (outcome.status === "rejected" && outcome.reason === "out-of-bounds") {
    throw new Error(
      `[Placement] Natural-wonder adapter rejected admitted in-bounds plot ${plotIndex} as out of bounds.`
    );
  }
  return outcome;
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
 * The causal plan remains a domain artifact. The adapter owns outcome identity and readback
 * admission; this step preserves deterministic primary/fallback behavior and emits terminal
 * reconciliation as recipe evidence. Current feature occupancy remains adapter state and is read
 * fresh by later consumers.
 */
export const PlaceNaturalWondersStep = createStep(config, {
  run: (context, _stepConfig, _ops, deps) => {
    const naturalWonderPlan = deps.artifacts.naturalWonderPlan.read();
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
  metrics: ({ observation }) => ({
    [STANDARD_NATURAL_WONDER_PLACEMENT_METRIC_KEY]: observation,
  }),
  viz: ({ observation, dimensions }) => {
    const rows = observation.outcomes.map((outcome) => ({
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
