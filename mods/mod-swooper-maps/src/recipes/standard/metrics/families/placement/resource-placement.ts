import { fnv1a32StringHex } from "@swooper/mapgen-core/lib/hash";
import type { ReadonlyDeep } from "type-fest";
import { type Static, Type } from "typebox";

const HASH32_PATTERN = "^[0-9a-f]{8}$";

const ResourcePlacementPhaseSchema = Type.Union(
  [
    Type.Literal("rotation"),
    Type.Literal("range-floor"),
    Type.Literal("region-minimum"),
    Type.Literal("support"),
  ],
  {
    description:
      "Resource-planning phase that produced the intent reconciled with this Civ7 outcome.",
  }
);

const ResourcePlacementRejectionReasonSchema = Type.Union(
  [
    Type.Literal("out-of-bounds"),
    Type.Literal("invalid-resource-type"),
    Type.Literal("cannot-have-resource"),
  ],
  {
    description:
      "Engine-owned feasibility reason that prevented a planned resource from being stamped.",
  }
);

const ResourcePlacementIdentityProperties = {
  plotIndex: Type.Integer({
    minimum: 0,
    description: "Linear map index of the adjusted resource intent.",
  }),
  x: Type.Integer({
    minimum: 0,
    description: "Zero-based map column derived from the adjusted resource intent.",
  }),
  y: Type.Integer({
    minimum: 0,
    description: "Zero-based map row derived from the adjusted resource intent.",
  }),
  resourceType: Type.Integer({
    minimum: 0,
    description: "Official Civ7 runtime resource identity requested by the adjusted plan.",
  }),
  phase: ResourcePlacementPhaseSchema,
};

const ResourcePlacementOutcomeRowSchema = Type.Union(
  [
    Type.Object(
      {
        status: Type.Literal("placed"),
        ...ResourcePlacementIdentityProperties,
      },
      {
        additionalProperties: false,
        description:
          "A planned resource whose Civ7 placement readback matched its requested runtime identity.",
      }
    ),
    Type.Object(
      {
        status: Type.Literal("rejected"),
        ...ResourcePlacementIdentityProperties,
        reason: ResourcePlacementRejectionReasonSchema,
        observedResourceType: Type.Optional(
          Type.Integer({
            description:
              "Civ7 runtime resource identity observed while explaining the rejection, when available.",
          })
        ),
      },
      {
        additionalProperties: false,
        description:
          "A planned resource Civ7 rejected without relocation or resource-type substitution.",
      }
    ),
  ],
  {
    description: "One terminal, JSON-safe reconciliation row paired with its adjusted-plan phase.",
  }
);

const ResourcePlacementReasonCountSchema = Type.Object(
  {
    reason: ResourcePlacementRejectionReasonSchema,
    count: Type.Integer({
      minimum: 1,
      description: "Number of rejected intents carrying this engine feasibility reason.",
    }),
  },
  {
    additionalProperties: false,
    description: "Canonical rejection count for one Civ7 feasibility reason.",
  }
);

const ResourcePlacementResourceSummarySchema = Type.Object(
  {
    resourceType: Type.Integer({
      minimum: 0,
      description: "Official Civ7 runtime resource identity summarized by this row.",
    }),
    plannedCount: Type.Integer({
      minimum: 1,
      description: "Number of adjusted intents that requested this resource identity.",
    }),
    placedCount: Type.Integer({
      minimum: 0,
      description: "Number of this resource identity successfully stamped by Civ7.",
    }),
    rejectedCount: Type.Integer({
      minimum: 0,
      description: "Number of this resource identity rejected by Civ7.",
    }),
    reasons: Type.Array(ResourcePlacementReasonCountSchema, {
      description: "Canonical rejection-reason counts for this resource identity.",
    }),
  },
  {
    additionalProperties: false,
    description: "Per-resource reconciliation totals derived from terminal placement outcome rows.",
  }
);

const ResourcePlacementCoordinateDigestSchema = Type.Object(
  {
    count: Type.Integer({
      minimum: 0,
      description: "Number of outcome rows represented by the digest.",
    }),
    hash32: Type.String({
      pattern: HASH32_PATTERN,
      description:
        "Order-independent FNV-1a identity of status, coordinates, requested type, and rejection evidence.",
    }),
  },
  {
    additionalProperties: false,
    description: "Compact deterministic identity for one resource placement outcome channel.",
  }
);

const ResourcePlacementShortfallSchema = Type.Object(
  {
    resourceType: Type.Integer({
      minimum: 0,
      description: "Official Civ7 runtime resource identity whose placement was rejected.",
    }),
    reason: ResourcePlacementRejectionReasonSchema,
    count: Type.Integer({
      minimum: 1,
      description:
        "Number of planned placements lost for this resource identity and feasibility reason.",
    }),
  },
  {
    additionalProperties: false,
    description: "Typed product shortfall caused by Civ7 rejecting an admitted resource intent.",
  }
);

const ResourcePlacementSummarySchema = Type.Object(
  {
    plannedCount: Type.Integer({
      minimum: 0,
      description: "Number of adjusted resource intents presented to Civ7.",
    }),
    placedCount: Type.Integer({
      minimum: 0,
      description: "Number of adjusted resource intents successfully stamped by Civ7.",
    }),
    rejectedCount: Type.Integer({
      minimum: 0,
      description: "Number of adjusted resource intents Civ7 rejected without fallback.",
    }),
    coordinateEvidence: Type.Object(
      {
        version: Type.Literal(1, {
          description: "Schema version for resource placement coordinate evidence.",
        }),
        placed: ResourcePlacementCoordinateDigestSchema,
        rejected: ResourcePlacementCoordinateDigestSchema,
      },
      {
        additionalProperties: false,
        description:
          "Stable coordinate identities for successful and rejected resource placements.",
      }
    ),
    byResource: Type.Array(ResourcePlacementResourceSummarySchema, {
      description: "Canonical runtime-resource totals ordered by numeric Civ7 resource identity.",
    }),
    byReason: Type.Array(ResourcePlacementReasonCountSchema, {
      description: "Canonical global rejection totals ordered by feasibility reason.",
    }),
    shortfalls: Type.Array(ResourcePlacementShortfallSchema, {
      description: "Canonical per-resource feasibility deficits retained for product diagnosis.",
    }),
    byPhase: Type.Object(
      {
        rotation: Type.Integer({
          minimum: 0,
          description: "Successfully placed intents selected by deficit rotation.",
        }),
        rangeFloor: Type.Integer({
          minimum: 0,
          description: "Successfully placed intents selected by range-floor repair.",
        }),
        regionMinimum: Type.Integer({
          minimum: 0,
          description: "Successfully placed intents selected by region-minimum repair.",
        }),
        support: Type.Integer({
          minimum: 0,
          description: "Successfully placed intents added by the start-support pass.",
        }),
      },
      {
        additionalProperties: false,
        description:
          "Successful placement totals joined to the planning phase of each adjusted intent.",
      }
    ),
  },
  {
    additionalProperties: false,
    description:
      "Single derived authority for terminal resource placement counts, digests, and shortfalls.",
  }
);

/**
 * Closed Standard measurement of resource intents reconciled with Civ7 placement outcomes.
 *
 * Mismatch is deliberately absent: wrong-type readback fails the product boundary before
 * terminal evidence can be admitted.
 */
export const StandardResourcePlacementMeasurementsSchema = Type.Object(
  {
    version: Type.Literal(1, {
      description: "Schema version for Standard resource placement measurements.",
    }),
    summary: ResourcePlacementSummarySchema,
    outcomes: Type.Array(ResourcePlacementOutcomeRowSchema, {
      description:
        "Adjusted resource intents paired one-to-one with their successful or rejected Civ7 outcomes.",
    }),
  },
  {
    additionalProperties: false,
    description:
      "Immutable JSON-safe product evidence for one completed Standard resource materialization pass.",
  }
);

/** Product measurements retained from one successful Standard resource materialization pass. */
export type StandardResourcePlacementMeasurements = ReadonlyDeep<
  Static<typeof StandardResourcePlacementMeasurementsSchema>
>;

/** Stable metric projection key for Standard resource placement evidence. */
export const STANDARD_RESOURCE_PLACEMENT_METRIC_KEY = "placement.resourcePlacement" as const;

type ResourcePlacementPhase = Static<typeof ResourcePlacementPhaseSchema>;
type ResourcePlacementRejectionReason = Static<typeof ResourcePlacementRejectionReasonSchema>;
type ResourcePlacementOutcomeRow = StandardResourcePlacementMeasurements["outcomes"][number];

type MutableResourceSummary = {
  plannedCount: number;
  placedCount: number;
  rejectedCount: number;
  reasons: Map<ResourcePlacementRejectionReason, number>;
};

/**
 * Closes materializer-admitted placement rows into one deterministic product measurement.
 *
 * The materializer owns engine outcome identity and wrong-type admission. This projection owns
 * only immutable evidence and summaries derived from those already-closed placed/rejected rows.
 */
export function measureStandardResourcePlacement(
  outcomes: StandardResourcePlacementMeasurements["outcomes"]
): StandardResourcePlacementMeasurements {
  const normalizedOutcomes = Object.freeze(
    outcomes.map((outcome): ResourcePlacementOutcomeRow => {
      if (outcome.status === "placed") {
        return Object.freeze({
          ...outcome,
        });
      }
      return Object.freeze({
        ...outcome,
        ...(outcome.observedResourceType === undefined
          ? {}
          : { observedResourceType: outcome.observedResourceType }),
      });
    })
  );

  const summary = deriveSummary(normalizedOutcomes);
  return Object.freeze({
    version: 1,
    summary,
    outcomes: normalizedOutcomes,
  });
}

function deriveSummary(
  outcomes: readonly ResourcePlacementOutcomeRow[]
): StandardResourcePlacementMeasurements["summary"] {
  let placedCount = 0;
  let rejectedCount = 0;
  const byResource = new Map<number, MutableResourceSummary>();
  const byReason = new Map<ResourcePlacementRejectionReason, number>();
  const shortfalls = new Map<
    string,
    { resourceType: number; reason: ResourcePlacementRejectionReason; count: number }
  >();
  const byPhase = { rotation: 0, rangeFloor: 0, regionMinimum: 0, support: 0 };

  for (const outcome of outcomes) {
    let resourceSummary = byResource.get(outcome.resourceType);
    if (!resourceSummary) {
      resourceSummary = {
        plannedCount: 0,
        placedCount: 0,
        rejectedCount: 0,
        reasons: new Map(),
      };
      byResource.set(outcome.resourceType, resourceSummary);
    }
    resourceSummary.plannedCount += 1;

    if (outcome.status === "placed") {
      placedCount += 1;
      resourceSummary.placedCount += 1;
      incrementPhase(byPhase, outcome.phase);
      continue;
    }

    rejectedCount += 1;
    resourceSummary.rejectedCount += 1;
    increment(resourceSummary.reasons, outcome.reason);
    increment(byReason, outcome.reason);
    const shortfallKey = `${outcome.resourceType}:${outcome.reason}`;
    const shortfall = shortfalls.get(shortfallKey);
    if (shortfall) {
      shortfall.count += 1;
    } else {
      shortfalls.set(shortfallKey, {
        resourceType: outcome.resourceType,
        reason: outcome.reason,
        count: 1,
      });
    }
  }

  return Object.freeze({
    plannedCount: outcomes.length,
    placedCount,
    rejectedCount,
    coordinateEvidence: Object.freeze({
      version: 1,
      placed: coordinateDigest(outcomes, "placed"),
      rejected: coordinateDigest(outcomes, "rejected"),
    }),
    byResource: Object.freeze(
      Array.from(byResource.entries())
        .sort(([left], [right]) => left - right)
        .map(([resourceType, counts]) =>
          Object.freeze({
            resourceType,
            plannedCount: counts.plannedCount,
            placedCount: counts.placedCount,
            rejectedCount: counts.rejectedCount,
            reasons: Object.freeze(
              Array.from(counts.reasons.entries())
                .sort(([left], [right]) => left.localeCompare(right))
                .map(([reason, count]) => Object.freeze({ reason, count }))
            ),
          })
        )
    ),
    byReason: Object.freeze(
      Array.from(byReason.entries())
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([reason, count]) => Object.freeze({ reason, count }))
    ),
    shortfalls: Object.freeze(
      Array.from(shortfalls.values())
        .sort(
          (left, right) =>
            left.resourceType - right.resourceType || left.reason.localeCompare(right.reason)
        )
        .map((shortfall) => Object.freeze({ ...shortfall }))
    ),
    byPhase: Object.freeze(byPhase),
  });
}

function coordinateDigest(
  outcomes: readonly ResourcePlacementOutcomeRow[],
  status: ResourcePlacementOutcomeRow["status"]
): StandardResourcePlacementMeasurements["summary"]["coordinateEvidence"]["placed"] {
  const rows = outcomes
    .filter((outcome) => outcome.status === status)
    .slice()
    .sort((left, right) => {
      if (left.plotIndex !== right.plotIndex) return left.plotIndex - right.plotIndex;
      if (left.resourceType !== right.resourceType) return left.resourceType - right.resourceType;
      return observedResourceType(left) - observedResourceType(right);
    })
    .map((outcome) =>
      [
        outcome.status,
        outcome.plotIndex,
        outcome.x,
        outcome.y,
        outcome.resourceType,
        observedResourceType(outcome),
        outcome.status === "placed" ? "placed" : outcome.reason,
      ].join(":")
    );
  return Object.freeze({
    count: rows.length,
    hash32: fnv1a32StringHex(rows.join("|")),
  });
}

function observedResourceType(outcome: ResourcePlacementOutcomeRow): number {
  return outcome.status === "placed" ? outcome.resourceType : (outcome.observedResourceType ?? -1);
}

function increment(
  counts: Map<ResourcePlacementRejectionReason, number>,
  reason: ResourcePlacementRejectionReason
): void {
  counts.set(reason, (counts.get(reason) ?? 0) + 1);
}

function incrementPhase(
  counts: { rotation: number; rangeFloor: number; regionMinimum: number; support: number },
  phase: ResourcePlacementPhase
): void {
  switch (phase) {
    case "rotation":
      counts.rotation += 1;
      return;
    case "range-floor":
      counts.rangeFloor += 1;
      return;
    case "region-minimum":
      counts.regionMinimum += 1;
      return;
    case "support":
      counts.support += 1;
  }
}
