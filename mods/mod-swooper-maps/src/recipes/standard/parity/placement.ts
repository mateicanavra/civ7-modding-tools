import { CIV7_BROWSER_TABLES_V0 } from "@civ7/map-policy";
import { stableStringify } from "@swooper/mapgen-core";
import { hexDistanceOddQPeriodicX } from "@swooper/mapgen-core/lib/grid";
import type {
  StandardCoordinateDigest,
  StandardExactParityCapture,
  StandardExactProductEvidence,
  StandardLocalParityCapture,
  StandardNaturalWonderPlanEvidence,
  StandardNaturalWonderPlanInputEvidence,
  StandardNaturalWonderPlanInputRow,
  StandardNaturalWonderPlanRow,
  StandardOptionalCoordinateDigest,
  StandardParityComparison,
  StandardPlacementParityCounters,
  StandardResourcePlacementEvidence,
  StandardResourcePlacementRejectionRow,
} from "./types.js";

/** Bounded comparison of one natural-wonder anchor across exact and replayed plans. */
type StandardNaturalWonderPlanRowComparison = Readonly<{
  featureType: number;
  classification:
    | "exact-local-same-anchor"
    | "exact-local-anchor-diverged"
    | "exact-only"
    | "local-only";
  exact?: StandardNaturalWonderPlanRow;
  local?: StandardNaturalWonderPlanRow;
  distance?: number;
  elevationDelta?: number;
  priorityDeltaPpm?: number;
}>;

/** Natural-wonder plan comparison including anchor movement and scoring context. */
type StandardNaturalWonderPlanComparison = Readonly<{
  claim: StandardParityComparison;
  exact?: StandardNaturalWonderPlanEvidence;
  local: StandardLocalParityCapture["placement"]["naturalWonderPlanEvidence"];
  rowComparisons: ReadonlyArray<StandardNaturalWonderPlanRowComparison>;
}>;

/** Field-level input drift for one matched natural-wonder planning anchor. */
type StandardNaturalWonderPlanInputDelta = Readonly<
  Partial<{
    terrainType: Readonly<{ exact: number; local: number }>;
    biomeType: Readonly<{ exact: number; local: number }>;
    occupiedFeatureType: Readonly<{ exact: number; local: number }>;
    elevationDelta: number;
    aridityPpmDelta: number;
    riverClassDelta: number;
    lakeMaskDelta: number;
    blockedMaskDelta: number;
    landMaskDelta: number;
  }>
>;

/** Bounded comparison of one selected wonder and the surfaces that selected it. */
type StandardNaturalWonderPlanInputRowComparison = Readonly<{
  featureType: number;
  classification:
    | "exact-local-same-anchor-input-match"
    | "exact-local-same-anchor-input-drift"
    | "exact-local-anchor-diverged"
    | "exact-only"
    | "local-only";
  exact?: StandardNaturalWonderPlanInputRow;
  local?: StandardNaturalWonderPlanInputRow;
  distance?: number;
  inputDelta?: StandardNaturalWonderPlanInputDelta;
}>;

/** Exact-versus-replay comparison of the complete admitted natural-wonder planner request. */
type StandardNaturalWonderPlanInputComparison = Readonly<{
  claim: StandardParityComparison;
  exact?: StandardNaturalWonderPlanInputEvidence;
  local: StandardExactProductEvidence<StandardNaturalWonderPlanInputEvidence>;
  mismatchedPlannerFields: ReadonlyArray<string>;
  mismatchedDigestFields: ReadonlyArray<string>;
  rowComparisons: ReadonlyArray<StandardNaturalWonderPlanInputRowComparison>;
}>;

/** Resource placement comparison with digest mismatches and bounded rejection context. */
type StandardResourcePlacementComparison = Readonly<{
  claim: StandardParityComparison;
  exact?: StandardResourcePlacementEvidence;
  local: Readonly<{
    placed: StandardCoordinateDigest;
    rejected: StandardCoordinateDigest;
    mismatch: StandardCoordinateDigest;
  }>;
  mismatchedFields: ReadonlyArray<"placed" | "rejected" | "mismatch">;
  rejectionContexts: ReadonlyArray<StandardResourcePlacementRejectionContext>;
}>;

/** Exact-versus-replay comparison of the single terminal placement observation. */
type StandardTerminalPlacementParityComparison = Readonly<{
  claim: StandardParityComparison;
  local: StandardPlacementParityCounters;
  exact?: StandardPlacementParityCounters;
  mismatchedFields: ReadonlyArray<keyof StandardPlacementParityCounters>;
}>;

/** Replayed plan and outcome context for one exact resource rejection witness. */
type StandardResourcePlacementRejectionContext = Readonly<{
  exact: StandardResourcePlacementRejectionRow;
  local: Readonly<{
    surfaceResourceType: number | null;
    planIntent?: Readonly<{
      resourceType: number;
      resourceTypeName: string;
      phase: string;
      family: string;
      laneId: string;
      inHabitat: boolean;
    }>;
    outcome?: Readonly<{
      status: "placed" | "rejected" | "mismatch";
      resourceType: number;
      observedResourceType?: number;
      reason?: string;
    }>;
  }>;
}>;

/** Standard Placement parity across terminal surfaces, wonders, their inputs, and resources. */
export type StandardPlacementParityComparison = Readonly<{
  terminalParity: StandardTerminalPlacementParityComparison;
  naturalWonderPlan: StandardNaturalWonderPlanComparison;
  naturalWonderPlanInput: StandardNaturalWonderPlanInputComparison;
  resourcePlacement: StandardResourcePlacementComparison;
}>;

/** Compares exact and replayed Standard Placement terminal state, plans, inputs, and outcomes. */
export function compareStandardPlacement(
  exact: StandardExactParityCapture,
  local: StandardLocalParityCapture
): StandardPlacementParityComparison {
  return {
    terminalParity: compareTerminalPlacementParity(exact, local),
    naturalWonderPlan: compareNaturalWonderPlan(exact, local),
    naturalWonderPlanInput: compareNaturalWonderPlanInput(exact, local),
    resourcePlacement: compareResourcePlacement(exact, local),
  };
}

function compareTerminalPlacementParity(
  exact: StandardExactParityCapture,
  local: StandardLocalParityCapture
): StandardTerminalPlacementParityComparison {
  const localCounters = local.placement.terminalParity;
  if (exact.placementParity.status === "missing") {
    return {
      claim: {
        status: "unresolved",
        reason: "Exact-authorship evidence lacks terminal placement-parity counters.",
        evidenceLinks: [exact.placementParity.evidenceLink],
      },
      local: localCounters,
      mismatchedFields: [],
    };
  }
  const exactCounters = exact.placementParity.value;
  const fields = [
    "waterDriftCount",
    "acceptedLakeTileCount",
    "finalLakeWaterDriftCount",
    "finalLakeClassificationDriftCount",
  ] as const satisfies readonly (keyof StandardPlacementParityCounters)[];
  const mismatchedFields = fields.filter((field) => localCounters[field] !== exactCounters[field]);
  if (mismatchedFields.length > 0) {
    return {
      claim: {
        status: "fail",
        reason: "Exact and local terminal placement-parity counters diverge.",
        evidenceLinks: mismatchedFields.map((field) => `placement-parity.${field}`),
      },
      local: localCounters,
      exact: exactCounters,
      mismatchedFields,
    };
  }
  if (
    localCounters.waterDriftCount !== 0 ||
    localCounters.finalLakeWaterDriftCount !== 0 ||
    localCounters.finalLakeClassificationDriftCount !== 0
  ) {
    return {
      claim: {
        status: "fail",
        reason: "Terminal counters agree, but the final water surface or accepted lakes drifted.",
        evidenceLinks: ["placement-parity.drift"],
      },
      local: localCounters,
      exact: exactCounters,
      mismatchedFields: [],
    };
  }
  return {
    claim: {
      status: "pass",
      reason: "Exact and local terminal placement counters match with zero final water drift.",
      evidenceLinks: ["placement-parity"],
    },
    local: localCounters,
    exact: exactCounters,
    mismatchedFields: [],
  };
}

function compareNaturalWonderPlan(
  exact: StandardExactParityCapture,
  local: StandardLocalParityCapture
): StandardNaturalWonderPlanComparison {
  const localEvidence = local.placement.naturalWonderPlanEvidence;
  if (exact.naturalWonderPlan.status === "missing") {
    return {
      claim: {
        status: "unresolved",
        reason: "Exact-authorship evidence lacks the natural-wonder plan.",
        evidenceLinks: [exact.naturalWonderPlan.evidenceLink],
      },
      local: localEvidence,
      rowComparisons: [],
    };
  }
  const exactEvidence = exact.naturalWonderPlan.value;
  const rowComparisons = compareNaturalWonderPlanRows(
    exactEvidence.rows,
    localEvidence.rows,
    local.surface.dimensions.width
  );
  const digestMatches =
    exactEvidence.coordinateDigest.count === localEvidence.coordinateDigest.count &&
    exactEvidence.coordinateDigest.hash32 === localEvidence.coordinateDigest.hash32;
  const rowsMatch = rowComparisons.every((row) => row.classification === "exact-local-same-anchor");
  const plannedCountMatches = exactEvidence.plannedCount === localEvidence.plannedCount;
  const claim: StandardParityComparison =
    digestMatches && rowsMatch && plannedCountMatches
      ? {
          status: "pass",
          reason: "Exact and local natural-wonder plans have identical authored coordinates.",
          evidenceLinks: ["natural-wonder-plan"],
        }
      : {
          status: "fail",
          reason: "Exact and local natural-wonder plans diverge.",
          evidenceLinks: ["natural-wonder-plan.mismatch"],
        };
  return {
    claim,
    exact: exactEvidence,
    local: localEvidence,
    rowComparisons,
  };
}

function compareNaturalWonderPlanRows(
  exactRows: readonly StandardNaturalWonderPlanRow[],
  localRows: readonly StandardNaturalWonderPlanRow[],
  width: number
): StandardNaturalWonderPlanRowComparison[] {
  const exactByFeature = new Map(exactRows.map((row) => [row.featureType, row] as const));
  const localByFeature = new Map(localRows.map((row) => [row.featureType, row] as const));
  const featureTypes = [...new Set([...exactByFeature.keys(), ...localByFeature.keys()])].sort(
    (left, right) => left - right
  );
  return featureTypes.map((featureType) => {
    const exact = exactByFeature.get(featureType);
    const local = localByFeature.get(featureType);
    if (exact === undefined) {
      return { featureType, classification: "local-only", local };
    }
    if (local === undefined) {
      return { featureType, classification: "exact-only", exact };
    }
    return {
      featureType,
      classification:
        exact.plotIndex === local.plotIndex && exact.direction === local.direction
          ? "exact-local-same-anchor"
          : "exact-local-anchor-diverged",
      exact,
      local,
      distance: hexDistanceOddQPeriodicX(exact.plotIndex, local.plotIndex, width),
      ...(exact.elevation === null || local.elevation === null
        ? {}
        : { elevationDelta: exact.elevation - local.elevation }),
      ...(exact.priorityPpm === null || local.priorityPpm === null
        ? {}
        : { priorityDeltaPpm: exact.priorityPpm - local.priorityPpm }),
    };
  });
}

function compareNaturalWonderPlanInput(
  exact: StandardExactParityCapture,
  local: StandardLocalParityCapture
): StandardNaturalWonderPlanInputComparison {
  const localEvidence = local.placement.naturalWonderPlanInput;
  if (localEvidence.status === "missing") {
    return {
      claim: {
        status: "unresolved",
        reason: "The Standard replay did not expose typed natural-wonder planning-input evidence.",
        evidenceLinks: [localEvidence.evidenceLink],
      },
      local: localEvidence,
      mismatchedPlannerFields: [],
      mismatchedDigestFields: [],
      rowComparisons: [],
    };
  }
  if (exact.naturalWonderPlanInput.status === "missing") {
    return {
      claim: {
        status: "unresolved",
        reason: "Exact-authorship evidence lacks natural-wonder planning inputs.",
        evidenceLinks: [exact.naturalWonderPlanInput.evidenceLink],
      },
      local: localEvidence,
      mismatchedPlannerFields: [],
      mismatchedDigestFields: [],
      rowComparisons: [],
    };
  }
  const exactEvidence = exact.naturalWonderPlanInput.value;
  const localValue = localEvidence.value;
  const mismatchedPlannerFields = mismatchedCanonicalFields(
    exactEvidence.plannerInput,
    localValue.plannerInput
  );
  const mismatchedDigestFields = mismatchedCanonicalFields(
    exactEvidence.plannerInput.surfaceDigests,
    localValue.plannerInput.surfaceDigests
  );
  const rowComparisons = compareNaturalWonderPlanInputRows(
    exactEvidence.rows,
    localValue.rows,
    local.surface.dimensions.width
  );
  const rowsMatch = stableStringify(exactEvidence.rows) === stableStringify(localValue.rows);
  const plannedCountMatches = exactEvidence.plannedCount === localValue.plannedCount;
  const measurementMatches = stableStringify(exactEvidence) === stableStringify(localValue);
  const claim: StandardParityComparison = measurementMatches
    ? {
        status: "pass",
        reason:
          "Exact and local natural-wonder evidence identifies the same complete admitted planner request and selected anchors.",
        evidenceLinks: ["natural-wonder-plan-input"],
      }
    : {
        status: "fail",
        reason:
          "Exact and local natural-wonder evidence identifies different planner requests or selected anchors.",
        evidenceLinks: [
          "natural-wonder-plan-input.measurement",
          ...mismatchedPlannerFields.map((field) => `natural-wonder-plan-input.planner.${field}`),
          ...(mismatchedDigestFields.length > 0
            ? mismatchedDigestFields.map(
                (field) => `natural-wonder-plan-input.surface-digests.${field}`
              )
            : []),
          ...(!rowsMatch ? ["natural-wonder-plan-input.rows"] : []),
          ...(!plannedCountMatches ? ["natural-wonder-plan-input.planned-count"] : []),
        ],
      };
  return {
    claim,
    exact: exactEvidence,
    local: localEvidence,
    mismatchedPlannerFields,
    mismatchedDigestFields,
    rowComparisons,
  };
}

function compareNaturalWonderPlanInputRows(
  exactRows: readonly StandardNaturalWonderPlanInputRow[],
  localRows: readonly StandardNaturalWonderPlanInputRow[],
  width: number
): StandardNaturalWonderPlanInputRowComparison[] {
  const exactByFeature = new Map(exactRows.map((row) => [row.featureType, row] as const));
  const localByFeature = new Map(localRows.map((row) => [row.featureType, row] as const));
  const featureTypes = [...new Set([...exactByFeature.keys(), ...localByFeature.keys()])].sort(
    (left, right) => left - right
  );
  return featureTypes.map((featureType) => {
    const exact = exactByFeature.get(featureType);
    const local = localByFeature.get(featureType);
    if (exact === undefined) {
      return { featureType, classification: "local-only", local };
    }
    if (local === undefined) {
      return { featureType, classification: "exact-only", exact };
    }
    const sameAnchor = exact.plotIndex === local.plotIndex;
    const inputsMatch = stableStringify(exact) === stableStringify(local);
    const inputDelta = naturalWonderInputDelta(exact, local);
    return {
      featureType,
      classification: sameAnchor
        ? inputsMatch
          ? "exact-local-same-anchor-input-match"
          : "exact-local-same-anchor-input-drift"
        : "exact-local-anchor-diverged",
      exact,
      local,
      distance: hexDistanceOddQPeriodicX(exact.plotIndex, local.plotIndex, width),
      ...(Object.keys(inputDelta).length === 0 ? {} : { inputDelta }),
    };
  });
}

function naturalWonderInputDelta(
  exact: StandardNaturalWonderPlanInputRow,
  local: StandardNaturalWonderPlanInputRow
): StandardNaturalWonderPlanInputDelta {
  return {
    ...(exact.terrainType === local.terrainType
      ? {}
      : {
          terrainType: { exact: exact.terrainType, local: local.terrainType },
        }),
    ...(exact.biomeType === local.biomeType
      ? {}
      : { biomeType: { exact: exact.biomeType, local: local.biomeType } }),
    ...(exact.occupiedFeatureType === local.occupiedFeatureType
      ? {}
      : {
          occupiedFeatureType: {
            exact: exact.occupiedFeatureType,
            local: local.occupiedFeatureType,
          },
        }),
    ...(exact.elevation === local.elevation
      ? {}
      : { elevationDelta: exact.elevation - local.elevation }),
    ...(exact.aridityPpm === local.aridityPpm
      ? {}
      : { aridityPpmDelta: exact.aridityPpm - local.aridityPpm }),
    ...(exact.riverClass === local.riverClass
      ? {}
      : { riverClassDelta: exact.riverClass - local.riverClass }),
    ...(exact.lakeMask === local.lakeMask
      ? {}
      : { lakeMaskDelta: exact.lakeMask - local.lakeMask }),
    ...(exact.blockedMask === local.blockedMask
      ? {}
      : { blockedMaskDelta: exact.blockedMask - local.blockedMask }),
    ...(exact.landMask === local.landMask
      ? {}
      : { landMaskDelta: exact.landMask - local.landMask }),
  };
}

function mismatchedCanonicalFields(exact: object, local: object): string[] {
  const exactFields = new Map<string, unknown>(Object.entries(exact));
  const localFields = new Map<string, unknown>(Object.entries(local));
  const fields = [...new Set([...exactFields.keys(), ...localFields.keys()])];
  return fields
    .filter(
      (field) =>
        !exactFields.has(field) ||
        !localFields.has(field) ||
        stableStringify(exactFields.get(field)) !== stableStringify(localFields.get(field))
    )
    .sort((left, right) => left.localeCompare(right));
}

function compareResourcePlacement(
  exact: StandardExactParityCapture,
  local: StandardLocalParityCapture
): StandardResourcePlacementComparison {
  const localEvidence = local.placement.resourcePlacement.coordinateEvidence;
  const localDigests = {
    placed: localEvidence.placed,
    rejected: localEvidence.rejected,
    mismatch: localEvidence.mismatch,
  };
  if (exact.resourcePlacement.status === "missing") {
    return {
      claim: {
        status: "unresolved",
        reason: "Exact-authorship evidence lacks resource placement coordinates.",
        evidenceLinks: [exact.resourcePlacement.evidenceLink],
      },
      local: localDigests,
      mismatchedFields: [],
      rejectionContexts: [],
    };
  }
  const exactEvidence = exact.resourcePlacement.value;
  const mismatchedFields: Array<"placed" | "rejected" | "mismatch"> = [];
  const unresolvedLinks: string[] = [];
  if (!digestsMatch(localDigests.placed, exactEvidence.placed)) {
    mismatchedFields.push("placed");
  }
  compareOptionalDigest(
    localDigests.rejected,
    exactEvidence.rejected,
    "rejected",
    mismatchedFields,
    unresolvedLinks
  );
  compareOptionalDigest(
    localDigests.mismatch,
    exactEvidence.mismatch,
    "mismatch",
    mismatchedFields,
    unresolvedLinks
  );
  const failureLinks = mismatchedFields.map((field) => `resource-placement.${field}`);
  return {
    claim:
      unresolvedLinks.length > 0
        ? {
            status: "unresolved",
            reason:
              failureLinks.length > 0
                ? "Known resource placement coordinates diverge, and other exact coordinate channels are missing."
                : "Exact-authorship evidence omits one or more resource placement coordinate channels.",
            evidenceLinks: [...failureLinks, ...unresolvedLinks],
            failureLinks,
            unresolvedLinks,
          }
        : mismatchedFields.length === 0
          ? {
              status: "pass",
              reason: "Exact and local resource placement coordinate evidence matches.",
              evidenceLinks: ["resource-placement"],
            }
          : {
              status: "fail",
              reason: "Exact and local resource placement coordinate evidence diverges.",
              evidenceLinks: failureLinks,
            },
    exact: exactEvidence,
    local: localDigests,
    mismatchedFields,
    rejectionContexts: resourceRejectionContexts(exactEvidence.rejectionRows, local),
  };
}

function resourceRejectionContexts(
  rows: readonly StandardResourcePlacementRejectionRow[],
  local: StandardLocalParityCapture
): StandardResourcePlacementRejectionContext[] {
  const planByPlot = new Map(
    local.placement.resourcePlanIntents.map((intent) => [intent.plotIndex, intent] as const)
  );
  const outcomeByPlot = new Map(
    local.placement.resourcePlacement.outcomes.map(
      (outcome) => [outcome.plotIndex, outcome] as const
    )
  );
  return rows.map((exact) => {
    const intent = planByPlot.get(exact.plotIndex);
    const outcome = outcomeByPlot.get(exact.plotIndex);
    const resourceType = intent === undefined ? undefined : resourceTypeId(intent.resourceType);
    return {
      exact,
      local: {
        surfaceResourceType: local.surface.grids.resource.values[exact.plotIndex] ?? null,
        ...(intent === undefined || resourceType === undefined
          ? {}
          : {
              planIntent: {
                resourceType,
                resourceTypeName: intent.resourceType,
                phase: intent.phase,
                family: intent.family,
                laneId: intent.laneId,
                inHabitat: intent.inHabitat,
              },
            }),
        ...(outcome === undefined
          ? {}
          : {
              outcome: {
                status: outcome.status,
                resourceType: outcome.resourceType,
                ...(!("observedResourceType" in outcome) ||
                outcome.observedResourceType === undefined
                  ? {}
                  : { observedResourceType: outcome.observedResourceType }),
                ...(outcome.status === "placed" ? {} : { reason: outcome.reason }),
              },
            }),
      },
    };
  });
}

function digestsMatch(local: StandardCoordinateDigest, exact: StandardCoordinateDigest): boolean {
  return local.count === exact.count && local.hash32 === exact.hash32;
}

function compareOptionalDigest(
  local: StandardCoordinateDigest,
  exact: StandardOptionalCoordinateDigest,
  field: "rejected" | "mismatch",
  mismatchedFields: Array<"placed" | "rejected" | "mismatch">,
  unresolvedLinks: string[]
): void {
  if (exact.status === "missing") {
    unresolvedLinks.push(exact.evidenceLink);
    return;
  }
  const matches =
    exact.status === "implicit-empty" ? local.count === 0 : digestsMatch(local, exact.digest);
  if (!matches) mismatchedFields.push(field);
}

function resourceTypeId(symbol: string): number | undefined {
  const id = (CIV7_BROWSER_TABLES_V0.resourceTypes as Readonly<Record<string, number>>)[symbol];
  return typeof id === "number" && Number.isFinite(id) ? id : undefined;
}
