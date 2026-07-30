import type { NaturalWonderFootprintReadback } from "@civ7/adapter";
import { fnv1a32StringHex } from "@swooper/mapgen-core/lib/hash";
import type { ReadonlyDeep } from "type-fest";
import { type Static, Type } from "typebox";

const HASH32_PATTERN = "^[0-9a-f]{8}$";

const NaturalWonderFootprintReadbackStatusSchema = Type.Union(
  [Type.Literal("empty-expected-footprint"), Type.Literal("partial-expected-footprint")],
  {
    description:
      "Degree to which Civ7 retained the expected wonder footprint after a rejected mutation.",
  }
);

const NaturalWonderFootprintReadbackSchema = Type.Object(
  {
    plotIndex: Type.Integer({
      minimum: 0,
      description: "Linear map index inspected during strict wonder-footprint readback.",
    }),
    observedFeatureType: Type.Integer({
      description: "Civ7 feature identity observed at the inspected footprint cell.",
    }),
  },
  {
    additionalProperties: false,
    description: "One cell of adapter-owned natural-wonder footprint readback evidence.",
  }
);

const NaturalWonderPlacementIdentityProperties = {
  plotIndex: Type.Integer({
    minimum: 0,
    description: "Linear map index of the planner-selected anchor attempted by the adapter.",
  }),
  x: Type.Integer({
    minimum: 0,
    description: "Zero-based map column of the attempted anchor.",
  }),
  y: Type.Integer({
    minimum: 0,
    description: "Zero-based map row of the attempted anchor.",
  }),
  featureType: Type.Integer({
    minimum: 0,
    description: "Official Civ7 natural-wonder feature identity retained from the plan.",
  }),
  direction: Type.Integer({
    description: "Civ7 footprint orientation retained from the natural-wonder plan.",
  }),
};

const OptionalNaturalWonderPlacementElevation = Type.Optional(
  Type.Integer({
    description: "Resolved Civ7 elevation when the adapter progressed far enough to acquire it.",
  })
);

const NaturalWonderPlacementObservedPairProperties = {
  observedFeatureType: Type.Integer({
    description: "Feature identity observed at the first cell that explained the rejection.",
  }),
  observedPlotIndex: Type.Integer({
    minimum: 0,
    description: "First footprint cell whose readback explained the rejection.",
  }),
};

const NaturalWonderPlacementOutcomeSchema = Type.Union(
  [
    Type.Object(
      {
        status: Type.Literal("placed"),
        ...NaturalWonderPlacementIdentityProperties,
        elevation: Type.Integer({
          description: "Civ7 elevation applied to the successfully materialized wonder.",
        }),
      },
      {
        additionalProperties: false,
        description: "A planned natural wonder whose full expected footprint passed Civ7 readback.",
      }
    ),
    Type.Object(
      {
        status: Type.Literal("rejected"),
        ...NaturalWonderPlacementIdentityProperties,
        elevation: OptionalNaturalWonderPlacementElevation,
        reason: Type.Literal("unsupported-footprint"),
      },
      {
        additionalProperties: false,
        description: "Civ7 has no supported footprint for the requested natural wonder.",
      }
    ),
    Type.Object(
      {
        status: Type.Literal("rejected"),
        ...NaturalWonderPlacementIdentityProperties,
        elevation: OptionalNaturalWonderPlacementElevation,
        reason: Type.Literal("set-feature-false"),
      },
      {
        additionalProperties: false,
        description: "Civ7 refused the feature mutation without producing readback evidence.",
      }
    ),
    Type.Object(
      {
        status: Type.Literal("rejected"),
        ...NaturalWonderPlacementIdentityProperties,
        elevation: OptionalNaturalWonderPlacementElevation,
        reason: Type.Literal("can-have-feature-param-false"),
      },
      {
        additionalProperties: false,
        description: "Civ7 rejected the requested feature parameters without a failing-cell pair.",
      }
    ),
    Type.Object(
      {
        status: Type.Literal("rejected"),
        ...NaturalWonderPlacementIdentityProperties,
        elevation: OptionalNaturalWonderPlacementElevation,
        reason: Type.Literal("can-have-feature-param-false"),
        ...NaturalWonderPlacementObservedPairProperties,
      },
      {
        additionalProperties: false,
        description:
          "Civ7 rejected the requested feature parameters and identified one failing footprint cell.",
      }
    ),
    Type.Object(
      {
        status: Type.Literal("rejected"),
        ...NaturalWonderPlacementIdentityProperties,
        elevation: Type.Integer({
          description: "Civ7 elevation applied before strict footprint readback failed.",
        }),
        reason: Type.Literal("readback-mismatch"),
        ...NaturalWonderPlacementObservedPairProperties,
        expectedFootprintReadback: Type.Array(NaturalWonderFootprintReadbackSchema, {
          minItems: 1,
          description:
            "Complete nonempty expected-footprint readback retained after strict verification failed.",
        }),
        expectedFootprintReadbackStatus: NaturalWonderFootprintReadbackStatusSchema,
      },
      {
        additionalProperties: false,
        description:
          "Civ7 mutated the feature surface but strict expected-footprint readback did not close.",
      }
    ),
  ],
  {
    description:
      "One terminal natural-wonder outcome admitted against its planner identity and reason-specific adapter evidence.",
  }
);

const NaturalWonderPlacementCoordinateDigestSchema = Type.Object(
  {
    count: Type.Integer({
      minimum: 0,
      description: "Number of terminal outcomes represented by this digest.",
    }),
    hash32: Type.String({
      pattern: HASH32_PATTERN,
      description:
        "Order-independent FNV-1a identity of anchor, feature, orientation, and rejection readback.",
    }),
  },
  {
    additionalProperties: false,
    description: "Compact deterministic identity for one natural-wonder outcome channel.",
  }
);

const NaturalWonderPlacementSummarySchema = Type.Object(
  {
    requestedCount: Type.Integer({
      minimum: 0,
      description: "Natural-wonder count requested by the admitted Civ7 map-size setup.",
    }),
    plannedCount: Type.Integer({
      minimum: 0,
      description: "Number of bounded natural-wonder intents presented to materialization.",
    }),
    placedCount: Type.Integer({
      minimum: 0,
      description: "Number of planned wonders whose complete footprint passed Civ7 readback.",
    }),
    rejectedCount: Type.Integer({
      minimum: 0,
      description:
        "Number of planned wonders rejected after exhausting their deterministic fallback anchors.",
    }),
    shortfallCount: Type.Integer({
      minimum: 0,
      description: "Requested wonders for which the planner produced no materialization intent.",
    }),
    rejectionExamples: Type.Array(Type.String(), {
      description:
        "Bounded human-readable rejection evidence retained for live diagnosis without replaying adapter calls.",
    }),
    coordinateEvidence: Type.Object(
      {
        version: Type.Literal(1, {
          description: "Schema version for natural-wonder coordinate evidence.",
        }),
        placed: NaturalWonderPlacementCoordinateDigestSchema,
        rejected: NaturalWonderPlacementCoordinateDigestSchema,
      },
      {
        additionalProperties: false,
        description:
          "Stable coordinate identities for successful and rejected natural-wonder materialization.",
      }
    ),
  },
  {
    additionalProperties: false,
    description:
      "Single derived authority for terminal natural-wonder counts, shortfall, and exact evidence.",
  }
);

/** Immutable Standard measurement of natural-wonder intent reconciled with Civ7 outcomes. */
export const StandardNaturalWonderPlacementMeasurementsSchema = Type.Object(
  {
    version: Type.Literal(1, {
      description: "Schema version for Standard natural-wonder placement measurements.",
    }),
    summary: NaturalWonderPlacementSummarySchema,
    outcomes: Type.Array(NaturalWonderPlacementOutcomeSchema, {
      description:
        "One admitted terminal outcome per planned wonder, after ordered fallback resolution.",
    }),
  },
  {
    additionalProperties: false,
    description:
      "JSON-safe terminal recipe evidence for one completed Standard natural-wonder materialization pass.",
  }
);

/** Terminal recipe measurements retained from one completed natural-wonder materialization pass. */
export type StandardNaturalWonderPlacementMeasurements = ReadonlyDeep<
  Static<typeof StandardNaturalWonderPlacementMeasurementsSchema>
>;

/** Stable metric projection key for Standard natural-wonder placement evidence. */
export const STANDARD_NATURAL_WONDER_PLACEMENT_METRIC_KEY =
  "placement.naturalWonderPlacement" as const;

/** One reason-specific terminal outcome retained by the Standard placement measurement. */
export type StandardNaturalWonderPlacementOutcome =
  StandardNaturalWonderPlacementMeasurements["outcomes"][number];

/**
 * Closes admitted outcome rows into immutable deterministic evidence without assigning
 * terminal-measurement semantics to the resulting summary.
 *
 * The materializer owns adapter identity and fallback behavior. This projection owns only
 * immutable copies and summaries derived from those already-admitted outcome rows.
 */
export function summarizeNaturalWonderPlacementOutcomes(
  input: Readonly<{
    requestedCount: number;
    outcomes: readonly StandardNaturalWonderPlacementOutcome[];
  }>
): Readonly<Pick<StandardNaturalWonderPlacementMeasurements, "summary" | "outcomes">> {
  const outcomes = Object.freeze(input.outcomes.map(cloneOutcome));
  const placedCount = outcomes.filter((outcome) => outcome.status === "placed").length;
  const rejectedCount = outcomes.length - placedCount;
  const summary = Object.freeze({
    requestedCount: input.requestedCount,
    plannedCount: outcomes.length,
    placedCount,
    rejectedCount,
    shortfallCount: Math.max(0, input.requestedCount - outcomes.length),
    rejectionExamples: Object.freeze(
      outcomes
        .filter((outcome) => outcome.status === "rejected")
        .slice(0, 8)
        .map(formatRejectionExample)
    ),
    coordinateEvidence: Object.freeze({
      version: 1 as const,
      placed: coordinateDigest(outcomes, "placed"),
      rejected: coordinateDigest(outcomes, "rejected"),
    }),
  });
  return Object.freeze({ summary, outcomes });
}

/**
 * Closes admitted natural-wonder outcomes into one deterministic terminal measurement.
 */
export function measureStandardNaturalWonderPlacement(
  input: Readonly<{
    requestedCount: number;
    outcomes: readonly StandardNaturalWonderPlacementOutcome[];
  }>
): StandardNaturalWonderPlacementMeasurements {
  const { summary, outcomes } = summarizeNaturalWonderPlacementOutcomes(input);
  return Object.freeze({ version: 1, summary, outcomes });
}

function cloneOutcome(
  outcome: StandardNaturalWonderPlacementOutcome
): StandardNaturalWonderPlacementOutcome {
  if (outcome.status === "placed") return Object.freeze({ ...outcome });
  if (outcome.reason !== "readback-mismatch") return Object.freeze({ ...outcome });
  return Object.freeze({
    ...outcome,
    expectedFootprintReadback: Object.freeze(
      outcome.expectedFootprintReadback.map((row) => Object.freeze({ ...row }))
    ),
  });
}

function coordinateDigest(
  outcomes: readonly StandardNaturalWonderPlacementOutcome[],
  status: StandardNaturalWonderPlacementOutcome["status"]
): StandardNaturalWonderPlacementMeasurements["summary"]["coordinateEvidence"]["placed"] {
  const rows = outcomes
    .filter((outcome) => outcome.status === status)
    .map((outcome) => ({
      outcome,
      serializedIdentity: serializeCoordinateIdentity(outcome),
    }))
    .sort((left, right) => {
      if (left.outcome.plotIndex !== right.outcome.plotIndex) {
        return left.outcome.plotIndex - right.outcome.plotIndex;
      }
      if (left.outcome.featureType !== right.outcome.featureType) {
        return left.outcome.featureType - right.outcome.featureType;
      }
      if (left.outcome.direction !== right.outcome.direction) {
        return left.outcome.direction - right.outcome.direction;
      }
      const reasonOrder = outcomeReason(left.outcome).localeCompare(outcomeReason(right.outcome));
      return reasonOrder || left.serializedIdentity.localeCompare(right.serializedIdentity);
    })
    .map(({ serializedIdentity }) => serializedIdentity);
  return Object.freeze({
    count: rows.length,
    hash32: fnv1a32StringHex(rows.join("|")),
  });
}

function formatRejectionExample(
  outcome: Extract<StandardNaturalWonderPlacementOutcome, { status: "rejected" }>
): string {
  return [
    `feature=${outcome.featureType}`,
    `plot=${outcome.plotIndex}`,
    `direction=${outcome.direction}`,
    ...(outcome.elevation === undefined ? [] : [`elevation=${Math.trunc(outcome.elevation)}`]),
    `reason=${outcome.reason}`,
    ...rejectionEvidenceFields(outcome),
  ].join(" ");
}

function serializeCoordinateIdentity(outcome: StandardNaturalWonderPlacementOutcome): string {
  return [
    outcome.status,
    outcome.plotIndex,
    outcome.x,
    outcome.y,
    outcome.featureType,
    outcome.direction,
    outcomeReason(outcome),
    ...(outcome.status === "rejected" ? rejectionEvidenceFields(outcome) : []),
  ].join(":");
}

function outcomeReason(outcome: StandardNaturalWonderPlacementOutcome): string {
  return outcome.status === "placed" ? "placed" : outcome.reason;
}

function rejectionEvidenceFields(
  outcome: Extract<StandardNaturalWonderPlacementOutcome, { status: "rejected" }>
): string[] {
  if (outcome.reason === "can-have-feature-param-false") {
    return "observedPlotIndex" in outcome
      ? [
          `observedPlot=${outcome.observedPlotIndex}`,
          `observedFeature=${outcome.observedFeatureType}`,
        ]
      : [];
  }
  if (outcome.reason !== "readback-mismatch") return [];
  return [
    `observedPlot=${outcome.observedPlotIndex}`,
    `observedFeature=${outcome.observedFeatureType}`,
    `footprint=${formatExpectedFootprintReadback(outcome.expectedFootprintReadback)}`,
    `readback=${outcome.expectedFootprintReadbackStatus}`,
  ];
}

function formatExpectedFootprintReadback(
  readback: readonly NaturalWonderFootprintReadback[]
): string {
  return readback.map((row) => `${row.plotIndex | 0}:${row.observedFeatureType | 0}`).join(",");
}
