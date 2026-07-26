import { defineArtifact, type Static, Type } from "@swooper/mapgen-core/authoring/contracts";
import { fnv1a32StringHex } from "@swooper/mapgen-core/lib/hash";

const ResourcePlacementRejectionReasonSchema = Type.Union([
  Type.Literal("out-of-bounds"),
  Type.Literal("invalid-resource-type"),
  Type.Literal("cannot-have-resource"),
]);

const ResourcePlacementReasonSchema = Type.Union([
  Type.Literal("out-of-bounds"),
  Type.Literal("invalid-resource-type"),
  Type.Literal("cannot-have-resource"),
  Type.Literal("wrong-resource-type"),
]);

const resourcePlacementIdentityProperties = {
  plotIndex: Type.Integer(),
  x: Type.Integer(),
  y: Type.Integer(),
  resourceType: Type.Integer(),
};

/**
 * Exact structural mirror of `@civ7/adapter`'s status-discriminated
 * `ResourcePlacementOutcome`; impossible status/evidence combinations are not admitted.
 */
const ResourcePlacementOutcomeSchema = Type.Union(
  [
    Type.Object(
      {
        status: Type.Literal("placed"),
        ...resourcePlacementIdentityProperties,
        observedResourceType: Type.Integer(),
        reason: Type.Optional(
          Type.Never({
            description: "Placed outcomes cannot carry a rejection or mismatch reason.",
          })
        ),
      },
      {
        additionalProperties: false,
        description:
          "A resource intent whose Civ7 readback exactly matches the planned resource type.",
      }
    ),
    Type.Object(
      {
        status: Type.Literal("rejected"),
        ...resourcePlacementIdentityProperties,
        reason: ResourcePlacementRejectionReasonSchema,
        observedResourceType: Type.Optional(Type.Integer()),
      },
      {
        additionalProperties: false,
        description:
          "A normal Civ7 feasibility rejection with a typed legality reason and optional readback.",
      }
    ),
    Type.Object(
      {
        status: Type.Literal("mismatch"),
        ...resourcePlacementIdentityProperties,
        reason: Type.Literal("wrong-resource-type"),
        observedResourceType: Type.Integer(),
      },
      {
        additionalProperties: false,
        description:
          "A fail-hard Civ7 readback mismatch that identifies both planned and observed types.",
      }
    ),
  ],
  {
    description: "One typed reconciliation result for an authoritative resource placement intent.",
  }
);

const ResourcePlacementReasonCountSchema = Type.Object(
  {
    reason: ResourcePlacementReasonSchema,
    count: Type.Integer({ minimum: 0 }),
  },
  { additionalProperties: false }
);

const ResourcePlacementResourceSummarySchema = Type.Object(
  {
    resourceType: Type.Integer(),
    plannedCount: Type.Integer({ minimum: 0 }),
    placedCount: Type.Integer({ minimum: 0 }),
    rejectedCount: Type.Integer({ minimum: 0 }),
    mismatchCount: Type.Integer({ minimum: 0 }),
    reasons: Type.Array(ResourcePlacementReasonCountSchema),
  },
  { additionalProperties: false }
);

const ResourcePlacementCoordinateDigestSchema = Type.Object(
  {
    count: Type.Integer({ minimum: 0 }),
    hash32: Type.String({ pattern: "^[0-9a-f]{8}$" }),
  },
  { additionalProperties: false }
);

const ResourcePlacementCoordinateEvidenceSchema = Type.Object(
  {
    version: Type.Literal(1),
    placed: ResourcePlacementCoordinateDigestSchema,
    rejected: ResourcePlacementCoordinateDigestSchema,
    mismatch: ResourcePlacementCoordinateDigestSchema,
  },
  {
    additionalProperties: false,
    description:
      "Compact deterministic coordinate identity for typed resource placement outcomes, intended for exact-run log/artifact comparison.",
  }
);

const ResourcePlacementSummarySchema = Type.Object(
  {
    plannedCount: Type.Integer({ minimum: 0 }),
    placedCount: Type.Integer({ minimum: 0 }),
    rejectedCount: Type.Integer({ minimum: 0 }),
    mismatchCount: Type.Integer({ minimum: 0 }),
    coordinateEvidence: ResourcePlacementCoordinateEvidenceSchema,
    byResource: Type.Array(ResourcePlacementResourceSummarySchema),
    byReason: Type.Array(ResourcePlacementReasonCountSchema),
  },
  { additionalProperties: false }
);

const ResourceReconciliationShortfallSchema = Type.Object(
  {
    resourceType: Type.Integer({ minimum: 0 }),
    reason: ResourcePlacementRejectionReasonSchema,
    count: Type.Integer({ minimum: 0 }),
  },
  { additionalProperties: false }
);

const ResourceReconciliationSummarySchema = Type.Object(
  {
    plannedCount: Type.Integer({ minimum: 0 }),
    placedCount: Type.Integer({ minimum: 0 }),
    rejectedCount: Type.Integer({ minimum: 0 }),
    shortfalls: Type.Array(ResourceReconciliationShortfallSchema, {
      description:
        "Typed per-type engine-legality shortfalls. The plan type at the planned plot is never re-decided; rejections are recorded, not rescued.",
    }),
    byPhase: Type.Object(
      {
        rotation: Type.Integer({ minimum: 0 }),
        rangeFloor: Type.Integer({ minimum: 0 }),
        regionMinimum: Type.Integer({ minimum: 0 }),
        support: Type.Integer({
          minimum: 0,
          description:
            "Placed counts for support-pass ADDITIONS (S5). Support-driven moves keep their original planning phase; full per-adjustment provenance lives in the adjusted-plan artifact.",
        }),
      },
      {
        additionalProperties: false,
        description:
          "Placed counts by planning phase (joined from the adjusted resource plan intents).",
      }
    ),
    supportAdjustedPlacedCount: Type.Integer({
      minimum: 0,
      description:
        "How many placed outcomes came from support-adjusted intents (moves + adds), making the S5 provenance visible in the stamped outcomes (additive field).",
    }),
  },
  { additionalProperties: false }
);

type ResourcePlacementOutcomes = Readonly<{
  summary: Static<typeof ResourcePlacementSummarySchema>;
  reconciliation: Static<typeof ResourceReconciliationSummarySchema>;
  outcomes: readonly Static<typeof ResourcePlacementOutcomeSchema>[];
}>;

type ResourcePlacementOutcome = ResourcePlacementOutcomes["outcomes"][number];
type ResourcePlacementStatus = ResourcePlacementOutcome["status"];
type ResourcePlacementReason = Static<typeof ResourcePlacementReasonSchema>;
type ResourcePlacementReasonCount = Static<typeof ResourcePlacementReasonCountSchema>;
type ResourcePlacementResourceSummary = Readonly<
  Omit<Static<typeof ResourcePlacementResourceSummarySchema>, "reasons"> & {
    reasons: readonly ResourcePlacementReasonCount[];
  }
>;
type ResourceReconciliationShortfall = Static<typeof ResourceReconciliationShortfallSchema>;

const RESOURCE_PLACEMENT_STATUSES = ["placed", "rejected", "mismatch"] as const;

function deriveCoordinateDigest(
  outcomes: readonly ResourcePlacementOutcome[],
  status: ResourcePlacementStatus
): Static<typeof ResourcePlacementCoordinateDigestSchema> {
  const rows = outcomes
    .filter((outcome) => outcome.status === status)
    .slice()
    .sort((a, b) => {
      if (a.plotIndex !== b.plotIndex) return a.plotIndex - b.plotIndex;
      if (a.resourceType !== b.resourceType) return a.resourceType - b.resourceType;
      return (a.observedResourceType ?? -1) - (b.observedResourceType ?? -1);
    })
    .map((outcome) =>
      [
        outcome.status,
        outcome.plotIndex,
        outcome.x,
        outcome.y,
        outcome.resourceType,
        outcome.observedResourceType ?? -1,
        outcome.status === "placed" ? "placed" : outcome.reason,
      ].join(":")
    );
  return { count: rows.length, hash32: fnv1a32StringHex(rows.join("|")) };
}

/**
 * Reconstructs every aggregate that has outcome rows as its source of truth.
 * Artifact admission uses this independent derivation rather than accepting producer summaries.
 */
function deriveOutcomeAuthorities(outcomes: readonly ResourcePlacementOutcome[]): Readonly<{
  summary: Static<typeof ResourcePlacementSummarySchema>;
  shortfalls: readonly ResourceReconciliationShortfall[];
}> {
  let placedCount = 0;
  let rejectedCount = 0;
  let mismatchCount = 0;
  const byResource = new Map<
    number,
    {
      plannedCount: number;
      placedCount: number;
      rejectedCount: number;
      mismatchCount: number;
      reasons: Map<ResourcePlacementReason, number>;
    }
  >();
  const byReason = new Map<ResourcePlacementReason, number>();
  const shortfalls = new Map<
    string,
    {
      resourceType: number;
      reason: Static<typeof ResourcePlacementRejectionReasonSchema>;
      count: number;
    }
  >();

  for (const outcome of outcomes) {
    let resourceSummary = byResource.get(outcome.resourceType);
    if (resourceSummary === undefined) {
      resourceSummary = {
        plannedCount: 0,
        placedCount: 0,
        rejectedCount: 0,
        mismatchCount: 0,
        reasons: new Map(),
      };
      byResource.set(outcome.resourceType, resourceSummary);
    }
    resourceSummary.plannedCount += 1;

    if (outcome.status === "placed") {
      placedCount += 1;
      resourceSummary.placedCount += 1;
      continue;
    }

    if (outcome.status === "rejected") {
      rejectedCount += 1;
      resourceSummary.rejectedCount += 1;
      const key = `${outcome.resourceType}:${outcome.reason}`;
      const shortfall = shortfalls.get(key);
      if (shortfall === undefined) {
        shortfalls.set(key, {
          resourceType: outcome.resourceType,
          reason: outcome.reason,
          count: 1,
        });
      } else {
        shortfall.count += 1;
      }
    } else {
      mismatchCount += 1;
      resourceSummary.mismatchCount += 1;
    }

    resourceSummary.reasons.set(
      outcome.reason,
      (resourceSummary.reasons.get(outcome.reason) ?? 0) + 1
    );
    byReason.set(outcome.reason, (byReason.get(outcome.reason) ?? 0) + 1);
  }

  return {
    summary: {
      plannedCount: outcomes.length,
      placedCount,
      rejectedCount,
      mismatchCount,
      coordinateEvidence: {
        version: 1,
        placed: deriveCoordinateDigest(outcomes, "placed"),
        rejected: deriveCoordinateDigest(outcomes, "rejected"),
        mismatch: deriveCoordinateDigest(outcomes, "mismatch"),
      },
      byResource: Array.from(byResource.entries())
        .sort(([left], [right]) => left - right)
        .map(([resourceType, summary]) => ({
          resourceType,
          plannedCount: summary.plannedCount,
          placedCount: summary.placedCount,
          rejectedCount: summary.rejectedCount,
          mismatchCount: summary.mismatchCount,
          reasons: Array.from(summary.reasons.entries())
            .sort(([left], [right]) => left.localeCompare(right))
            .map(([reason, count]) => ({ reason, count })),
        })),
      byReason: Array.from(byReason.entries())
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([reason, count]) => ({ reason, count })),
    },
    shortfalls: Array.from(shortfalls.values()).sort(
      (left, right) =>
        left.resourceType - right.resourceType || left.reason.localeCompare(right.reason)
    ),
  };
}

function reasonCountsMatch(
  authored: readonly ResourcePlacementReasonCount[],
  derived: readonly ResourcePlacementReasonCount[]
): boolean {
  return (
    authored.length === derived.length &&
    authored.every(
      (row, index) => row.reason === derived[index]?.reason && row.count === derived[index]?.count
    )
  );
}

function resourceSummariesMatch(
  authored: readonly ResourcePlacementResourceSummary[],
  derived: readonly ResourcePlacementResourceSummary[]
): boolean {
  return (
    authored.length === derived.length &&
    authored.every((row, index) => {
      const expected = derived[index];
      return (
        expected !== undefined &&
        row.resourceType === expected.resourceType &&
        row.plannedCount === expected.plannedCount &&
        row.placedCount === expected.placedCount &&
        row.rejectedCount === expected.rejectedCount &&
        row.mismatchCount === expected.mismatchCount &&
        reasonCountsMatch(row.reasons, expected.reasons)
      );
    })
  );
}

function shortfallsMatch(
  authored: readonly ResourceReconciliationShortfall[],
  derived: readonly ResourceReconciliationShortfall[]
): boolean {
  return (
    authored.length === derived.length &&
    authored.every((row, index) => {
      const expected = derived[index];
      return (
        expected !== undefined &&
        row.resourceType === expected.resourceType &&
        row.reason === expected.reason &&
        row.count === expected.count
      );
    })
  );
}

/**
 * Registers typed reconciliation between authoritative resource intents and
 * Civ7 stamping outcomes without reselecting resource type or fallback plots.
 */
export const artifact = defineArtifact({
  name: "resourcePlacementOutcomes",
  id: "artifact:placement.resourcePlacementOutcomes",
  schema: Type.Object(
    {
      summary: ResourcePlacementSummarySchema,
      reconciliation: ResourceReconciliationSummarySchema,
      outcomes: Type.Array(ResourcePlacementOutcomeSchema),
    },
    {
      additionalProperties: false,
      description:
        "Typed resource-intent reconciliation in which Civ7 stamping records rejections without changing planned resource identity or choosing fallback plots.",
    }
  ),
  refine: (value, { issues }) => {
    const derived = deriveOutcomeAuthorities(value.outcomes);
    const countKeys = ["plannedCount", "placedCount", "rejectedCount", "mismatchCount"] as const;
    for (const key of countKeys) {
      if (value.summary[key] !== derived.summary[key]) {
        issues.add(
          `summary.${key} ${value.summary[key]} != outcomes-derived ${derived.summary[key]}.`
        );
      }
    }

    for (const status of RESOURCE_PLACEMENT_STATUSES) {
      const authoredDigest = value.summary.coordinateEvidence[status];
      const derivedDigest = derived.summary.coordinateEvidence[status];
      if (authoredDigest.count !== derivedDigest.count) {
        issues.add(
          `summary.coordinateEvidence.${status}.count ${authoredDigest.count} != outcomes-derived ${derivedDigest.count}.`
        );
      }
      if (authoredDigest.hash32 !== derivedDigest.hash32) {
        issues.add(
          `summary.coordinateEvidence.${status}.hash32 ${authoredDigest.hash32} != outcomes-derived ${derivedDigest.hash32}.`
        );
      }
    }

    if (!reasonCountsMatch(value.summary.byReason, derived.summary.byReason)) {
      issues.add("summary.byReason must exactly match canonical outcomes-derived reason counts.");
    }
    if (!resourceSummariesMatch(value.summary.byResource, derived.summary.byResource)) {
      issues.add(
        "summary.byResource must exactly match canonical outcomes-derived per-resource counts and reasons."
      );
    }

    if (derived.summary.mismatchCount > 0) {
      issues.add(
        `outcomes contain ${derived.summary.mismatchCount} fail-hard mismatch row(s); mismatch outcomes must never be published.`
      );
    }

    const { reconciliation } = value;
    const reconciliationCounts = {
      plannedCount: derived.summary.plannedCount,
      placedCount: derived.summary.placedCount,
      rejectedCount: derived.summary.rejectedCount,
    };
    for (const key of ["plannedCount", "placedCount", "rejectedCount"] as const) {
      if (reconciliation[key] !== reconciliationCounts[key]) {
        issues.add(
          `reconciliation.${key} ${reconciliation[key]} != outcomes-derived ${reconciliationCounts[key]}.`
        );
      }
    }

    if (!shortfallsMatch(reconciliation.shortfalls, derived.shortfalls)) {
      issues.add(
        "reconciliation.shortfalls must exactly match canonical rejected-outcome resource/reason counts."
      );
    }

    const phasePlacedCount =
      reconciliation.byPhase.rotation +
      reconciliation.byPhase.rangeFloor +
      reconciliation.byPhase.regionMinimum +
      reconciliation.byPhase.support;
    if (phasePlacedCount !== derived.summary.placedCount) {
      issues.add(
        `reconciliation.byPhase total ${phasePlacedCount} != outcomes-derived placedCount ${derived.summary.placedCount}.`
      );
    }
    if (reconciliation.supportAdjustedPlacedCount > derived.summary.placedCount) {
      issues.add(
        `reconciliation.supportAdjustedPlacedCount ${reconciliation.supportAdjustedPlacedCount} exceeds outcomes-derived placedCount ${derived.summary.placedCount}.`
      );
    }
    if (reconciliation.byPhase.support > reconciliation.supportAdjustedPlacedCount) {
      issues.add(
        `reconciliation.byPhase.support ${reconciliation.byPhase.support} exceeds supportAdjustedPlacedCount ${reconciliation.supportAdjustedPlacedCount}.`
      );
    }
  },
});
