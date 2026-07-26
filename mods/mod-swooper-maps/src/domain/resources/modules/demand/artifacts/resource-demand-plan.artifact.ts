import {
  type OfficialAgeType,
  type OfficialResourceType,
  resolveResourceRuntimeIds,
} from "@civ7/map-policy";
import { defineArtifact, Type } from "@swooper/mapgen-core/authoring/contracts";
import {
  AdmittedResourceDemandCandidateSchema,
  ExcludedResourceDemandCandidatesSchema,
  type ResourceDemand,
  type ResourceDemandSource,
} from "../model/atoms/resource-demand.schema.js";
import type { ResourceExpectationIdentity } from "../model/atoms/resource-expectation.schema.js";
import {
  EARTHLIKE_RESOURCE_EXPECTATIONS,
  RESOURCE_EXPECTATION_IDENTITY_BY_GROUP,
} from "../model/policy/earthlike-expectations.js";
import { RESOURCE_HABITAT_SIGNALS } from "../model/policy/habitat-eligibility.js";
import {
  getInitialMapResourcePolicyForType,
  INITIAL_MAP_RESOURCE_AUTHORING_AGE,
} from "../model/policy/initial-map-authoring.js";
import { resolveResourceRegionMinimumRequirement } from "../model/policy/resource-region-minimum.js";

type ReadonlyMask = {
  readonly length: number;
  readonly [index: number]: number | undefined;
};

type ExpectationIdentityLike = Readonly<ResourceExpectationIdentity>;

type SiteEvidenceSourceLike = Readonly<Omit<ResourceDemandSource, "habitatMask">> & {
  readonly habitatMask: ReadonlyMask;
};

type TerminalCandidateLike = {
  readonly source: ExpectationIdentityLike;
};

type AdmittedCandidateLike = TerminalCandidateLike & {
  readonly source: SiteEvidenceSourceLike;
  readonly demand: {
    readonly weight: number;
    readonly regionMinimumRequirement: ResourceDemand["regionMinimumRequirement"];
    readonly legalMask: ReadonlyMask;
    readonly intensity: ReadonlyMask;
    readonly legalTileCount: number;
    readonly eligibleTileCount: number;
  };
};

type IdentityExcludedCandidateLike = TerminalCandidateLike & {
  readonly reason:
    | { readonly kind: "expectation-blocked" }
    | {
        readonly kind: "age-policy";
        readonly status: "deferred-future-age";
        readonly age: string;
      };
};

type NoLegalSitesCandidateLike = TerminalCandidateLike & {
  readonly source: SiteEvidenceSourceLike;
  readonly reason: { readonly kind: "no-legal-sites"; readonly legalMask: ReadonlyMask };
};

const EXPECTATION_BY_TYPE = new Map(
  EARTHLIKE_RESOURCE_EXPECTATIONS.map((expectation) => [expectation.resourceType, expectation])
);
const EXPECTATION_ORDER_BY_TYPE = new Map(
  EARTHLIKE_RESOURCE_EXPECTATIONS.map((expectation, index) => [expectation.resourceType, index])
);
const RESOURCE_RUNTIME_IDS = resolveResourceRuntimeIds();

/** Registers the exact official resource corpus with one proven terminal demand disposition. */
export const artifact = defineArtifact({
  name: "resourceDemandPlan",
  id: "artifact:placement.resourceDemandPlan",
  schema: Type.Object(
    {
      width: Type.Integer({ minimum: 1 }),
      height: Type.Integer({ minimum: 1 }),
      age: Type.Literal(INITIAL_MAP_RESOURCE_AUTHORING_AGE),
      minimumAmountModifier: Type.Integer(),
      candidates: Type.Object(
        {
          admitted: Type.Array(AdmittedResourceDemandCandidateSchema),
          excluded: ExcludedResourceDemandCandidatesSchema,
        },
        {
          additionalProperties: false,
          description:
            "Exact official resource corpus partitioned into admitted demand and source-matched exclusion evidence.",
        }
      ),
    },
    {
      additionalProperties: false,
      description:
        "Complete terminal resource-demand authority before deterministic site selection.",
    }
  ),
  refine: (value, { dimensions, issues }) => {
    if (value.width !== dimensions.width || value.height !== dimensions.height) {
      issues.add(
        `resourceDemandPlan dimensions ${value.width}x${value.height} do not match execution dimensions ${dimensions.width}x${dimensions.height}.`
      );
    }

    const seen = new Set<string>();
    const registerCandidate = (candidate: TerminalCandidateLike): void => {
      const { source } = candidate;
      if (seen.has(source.resourceType)) {
        issues.add(`Resource demand source ${source.resourceType} appears more than once.`);
      }
      seen.add(source.resourceType);
      validateCanonicalIdentity(source, issues.add);
    };

    for (const candidate of value.candidates.admitted) {
      registerCandidate(candidate);
      validateCanonicalSiteEvidence(candidate.source, issues.add);
      validateAdmittedCandidate(candidate, value.age, issues.add);
    }
    for (const candidate of value.candidates.excluded.expectationBlocked) {
      registerCandidate(candidate);
      validateIdentityExclusion(candidate, value.age, issues.add);
    }
    for (const candidate of value.candidates.excluded.ageDeferred) {
      registerCandidate(candidate);
      validateIdentityExclusion(candidate, value.age, issues.add);
    }
    for (const candidate of value.candidates.excluded.noLegalSites) {
      registerCandidate(candidate);
      validateCanonicalSiteEvidence(candidate.source, issues.add);
      validateNoLegalSitesCandidate(candidate, value.age, issues.add);
    }
    validatePartitionOrder(
      "admitted",
      value.candidates.admitted.map((candidate) => candidate.source),
      issues.add
    );
    validatePartitionOrder(
      "expectationBlocked",
      value.candidates.excluded.expectationBlocked.map((candidate) => candidate.source),
      issues.add
    );
    validatePartitionOrder(
      "ageDeferred",
      value.candidates.excluded.ageDeferred.map((candidate) => candidate.source),
      issues.add
    );
    validatePartitionOrder(
      "noLegalSites",
      value.candidates.excluded.noLegalSites.map((candidate) => candidate.source),
      issues.add
    );

    const candidateCount =
      value.candidates.admitted.length +
      value.candidates.excluded.expectationBlocked.length +
      value.candidates.excluded.ageDeferred.length +
      value.candidates.excluded.noLegalSites.length;
    if (candidateCount !== EARTHLIKE_RESOURCE_EXPECTATIONS.length) {
      issues.add(
        `Resource demand ledger has ${candidateCount} candidates; expected exact official corpus size ${EARTHLIKE_RESOURCE_EXPECTATIONS.length}.`
      );
    }
    for (const expectation of EARTHLIKE_RESOURCE_EXPECTATIONS) {
      if (!seen.has(expectation.resourceType)) {
        issues.add(`Resource demand ledger is missing ${expectation.resourceType}.`);
      }
    }
  },
});

function validatePartitionOrder(
  partition: "admitted" | "expectationBlocked" | "ageDeferred" | "noLegalSites",
  sources: readonly ExpectationIdentityLike[],
  addIssue: (message: string) => void
): void {
  let previousOrder = -1;
  for (const source of sources) {
    const order = EXPECTATION_ORDER_BY_TYPE.get(source.resourceType as OfficialResourceType);
    if (order === undefined) continue;
    if (order <= previousOrder) {
      addIssue(
        `Resource demand ${partition} partition does not preserve canonical corpus order at ${source.resourceType}.`
      );
    }
    previousOrder = order;
  }
}

function validateCanonicalIdentity(
  source: ExpectationIdentityLike,
  addIssue: (message: string) => void
): void {
  const expectation = EXPECTATION_BY_TYPE.get(source.resourceType as OfficialResourceType);
  if (!expectation) {
    addIssue(
      `Resource demand source ${source.resourceType} is outside the canonical official expectation corpus.`
    );
    return;
  }

  if (source.groupId !== expectation.groupId) {
    addIssue(
      `Resource demand source ${source.resourceType} group ${source.groupId} does not match canonical group ${expectation.groupId}.`
    );
  }
  if (source.expectationStatus !== expectation.status) {
    addIssue(
      `Resource demand source ${source.resourceType} status ${source.expectationStatus} does not match canonical status ${expectation.status}.`
    );
  }
  validateCanonicalRange(source, expectation.expectedCountRange, addIssue);
}

function validateCanonicalSiteEvidence(
  source: SiteEvidenceSourceLike,
  addIssue: (message: string) => void
): void {
  const expectation = EXPECTATION_BY_TYPE.get(source.resourceType as OfficialResourceType);
  if (!expectation) return;
  const expectedIdentity = RESOURCE_EXPECTATION_IDENTITY_BY_GROUP[expectation.groupId];
  const signal = RESOURCE_HABITAT_SIGNALS.get(expectation.resourceType);
  if (!signal) {
    addIssue(`Resource demand source ${source.resourceType} has no canonical habitat signal.`);
  } else {
    if (signal.family !== expectedIdentity.family) {
      addIssue(
        `Canonical habitat signal ${source.resourceType} family ${signal.family} disagrees with expectation group ${expectation.groupId}; expected ${expectedIdentity.family}.`
      );
    }
    if (source.family !== signal.family) {
      addIssue(
        `Resource demand source ${source.resourceType} family ${source.family} does not match canonical family ${signal.family}.`
      );
    }
    if (source.laneId !== signal.laneId) {
      addIssue(
        `Resource demand source ${source.resourceType} lane ${source.laneId} does not match canonical lane ${signal.laneId}.`
      );
    }
  }
  if (signal && source.laneKind !== signal.laneKind) {
    addIssue(
      `Resource demand source ${source.resourceType} lane kind ${source.laneKind} does not match canonical lane kind ${signal.laneKind}.`
    );
  }

  const habitatTileCount = countBinaryMask(
    source.resourceType,
    "habitatMask",
    source.habitatMask,
    addIssue
  );
  if (source.habitatTileCount !== habitatTileCount) {
    addIssue(
      `Resource demand source ${source.resourceType} habitatTileCount ${source.habitatTileCount} does not match habitatMask count ${habitatTileCount}.`
    );
  }
  const expectedTarget = Math.min(
    expectation.expectedCountRange.max,
    habitatTileCount,
    expectation.expectedCountRange.target
  );
  if (source.targetIntentCount !== expectedTarget) {
    addIssue(
      `Resource demand source ${source.resourceType} target ${source.targetIntentCount} does not match canonical habitat-derived target ${expectedTarget}.`
    );
  }
}

function validateCanonicalRange(
  source: ExpectationIdentityLike,
  expected: ExpectationIdentityLike["expectedCountRange"],
  addIssue: (message: string) => void
): void {
  const observed = source.expectedCountRange;
  if (
    observed.baseline !== expected.baseline ||
    observed.min !== expected.min ||
    observed.target !== expected.target ||
    observed.max !== expected.max ||
    observed.evidence !== expected.evidence
  ) {
    addIssue(
      `Resource demand source ${source.resourceType} range ${formatRange(observed)} does not match canonical range ${formatRange(expected)}.`
    );
  }
}

function validateAdmittedCandidate(
  candidate: AdmittedCandidateLike,
  age: typeof INITIAL_MAP_RESOURCE_AUTHORING_AGE,
  addIssue: (message: string) => void
): void {
  const { source, demand } = candidate;
  validateExpectedAge(source.resourceType, age, "eligible", addIssue);
  validateCanonicalDemandPolicy(source.resourceType, age, demand, addIssue);
  const legalTileCount = countBinaryMask(
    source.resourceType,
    "legalMask",
    demand.legalMask,
    addIssue
  );
  if (demand.legalTileCount !== legalTileCount) {
    addIssue(
      `Demand ${source.resourceType} legalTileCount ${demand.legalTileCount} does not match legalMask count ${legalTileCount}.`
    );
  }
  if (legalTileCount === 0) {
    addIssue(
      `Demand ${source.resourceType} has no legal site; it must carry the no-legal-sites disposition.`
    );
  }

  let eligibleTileCount = 0;
  for (let index = 0; index < source.habitatMask.length; index += 1) {
    if (source.habitatMask[index] !== 0 && demand.legalMask[index] !== 0) {
      eligibleTileCount += 1;
    }
  }
  if (demand.eligibleTileCount !== eligibleTileCount) {
    addIssue(
      `Demand ${source.resourceType} eligibleTileCount ${demand.eligibleTileCount} does not match habitat/legal intersection count ${eligibleTileCount}.`
    );
  }
  validateUnitIntensity(source.resourceType, demand.intensity, addIssue);
}

function validateCanonicalDemandPolicy(
  resourceType: string,
  age: typeof INITIAL_MAP_RESOURCE_AUTHORING_AGE,
  demand: AdmittedCandidateLike["demand"],
  addIssue: (message: string) => void
): void {
  const resolved = RESOURCE_RUNTIME_IDS.byType.get(resourceType as OfficialResourceType);
  if (!resolved) {
    addIssue(`Demand ${resourceType} has no canonical runtime resource policy.`);
    return;
  }

  const expectedWeight = Math.max(1, resolved.weight);
  if (demand.weight !== expectedWeight) {
    addIssue(
      `Demand ${resourceType} weight ${demand.weight} does not match canonical weight ${expectedWeight}.`
    );
  }

  const requirement = demand.regionMinimumRequirement;
  const officialMinimum = resolved.minimumPerHemisphere;
  if (officialMinimum === 0) {
    if (requirement.kind !== "not-applicable") {
      addIssue(
        `Demand ${resourceType} regional minimum is ${requirement.kind}; canonical minimum 0 requires not-applicable.`
      );
    }
    return;
  }

  if (requirement.kind === "not-applicable") {
    addIssue(
      `Demand ${resourceType} regional minimum is not-applicable; canonical minimum is ${officialMinimum}.`
    );
    return;
  }
  if (requirement.minimumPerHemisphere !== officialMinimum) {
    addIssue(
      `Demand ${resourceType} regional minimum ${requirement.minimumPerHemisphere} does not match canonical minimum ${officialMinimum}.`
    );
  }

  if (requirement.source === "engine") return;
  const canonicalStaticRequirement = resolveResourceRegionMinimumRequirement({
    resourceType: resourceType as OfficialResourceType,
    age,
    minimumPerHemisphere: officialMinimum,
    observedRequiredForAge: null,
  });
  if (!sameStaticRegionMinimumRequirement(requirement, canonicalStaticRequirement)) {
    addIssue(
      `Demand ${resourceType} static regional-minimum disposition does not match canonical fallback policy.`
    );
  }
}

function validateIdentityExclusion(
  candidate: IdentityExcludedCandidateLike,
  age: typeof INITIAL_MAP_RESOURCE_AUTHORING_AGE,
  addIssue: (message: string) => void
): void {
  const { source, reason } = candidate;
  const expectation = EXPECTATION_BY_TYPE.get(source.resourceType as OfficialResourceType);
  if (!expectation) return;

  switch (reason.kind) {
    case "expectation-blocked":
      if (expectation.status !== "blocked") {
        addIssue(
          `Expectation-blocked disposition ${source.resourceType} requires canonical blocked status.`
        );
      }
      return;
    case "age-policy":
      if (reason.age !== age) {
        addIssue(
          `Age-policy disposition ${source.resourceType} records ${reason.age} but artifact age is ${age}.`
        );
      }
      validateExpectedAge(source.resourceType, age, reason.status, addIssue);
      return;
  }
}

function validateNoLegalSitesCandidate(
  candidate: NoLegalSitesCandidateLike,
  age: typeof INITIAL_MAP_RESOURCE_AUTHORING_AGE,
  addIssue: (message: string) => void
): void {
  const { source, reason } = candidate;
  validateExpectedAge(source.resourceType, age, "eligible", addIssue);
  const legalTileCount = countBinaryMask(
    source.resourceType,
    "reason.legalMask",
    reason.legalMask,
    addIssue
  );
  if (legalTileCount !== 0) {
    addIssue(
      `No-legal-sites disposition ${source.resourceType} retains ${legalTileCount} legal tiles.`
    );
  }
}

function validateUnitIntensity(
  resourceType: string,
  intensity: ReadonlyMask,
  addIssue: (message: string) => void
): void {
  for (let index = 0; index < intensity.length; index += 1) {
    const value = intensity[index]!;
    if (!Number.isFinite(value) || value < 0 || value > 1) {
      addIssue(
        `Demand ${resourceType} intensity[${index}] is ${value}; intensity must be finite and within [0, 1].`
      );
    }
  }
}

function sameStaticRegionMinimumRequirement(
  observed: ResourceDemand["regionMinimumRequirement"],
  expected: ResourceDemand["regionMinimumRequirement"]
): boolean {
  if (observed.kind !== expected.kind) return false;
  if (observed.kind === "not-applicable" || expected.kind === "not-applicable") return true;
  if (observed.minimumPerHemisphere !== expected.minimumPerHemisphere) return false;
  if (observed.source !== expected.source) return false;
  if (observed.source !== "static-unconditional" || expected.source !== "static-unconditional") {
    return true;
  }
  return (
    observed.basis.length === expected.basis.length &&
    observed.basis.every((value, index) => value === expected.basis[index])
  );
}

function validateExpectedAge(
  resourceType: string,
  age: OfficialAgeType,
  expectedStatus: "eligible" | "deferred-future-age",
  addIssue: (message: string) => void
): void {
  const policy = getInitialMapResourcePolicyForType(resourceType as OfficialResourceType, age);
  const observedStatus = policy?.status ?? "missing";
  if (observedStatus !== expectedStatus) {
    addIssue(
      `Resource demand ${resourceType} requires age-policy status ${expectedStatus} for ${age}; received ${observedStatus}.`
    );
  }
}

function countBinaryMask(
  resourceType: string,
  label: string,
  mask: ReadonlyMask,
  addIssue: (message: string) => void
): number {
  let count = 0;
  for (let index = 0; index < mask.length; index += 1) {
    const value = mask[index]!;
    if (value !== 0 && value !== 1) {
      addIssue(
        `Resource demand ${resourceType} ${label}[${index}] is ${value}; masks admit only 0 or 1.`
      );
    }
    if (value !== 0) count += 1;
  }
  return count;
}

function formatRange(range: ExpectationIdentityLike["expectedCountRange"]): string {
  return `${range.baseline}:${range.min}/${range.target}/${range.max}:${range.evidence}`;
}
