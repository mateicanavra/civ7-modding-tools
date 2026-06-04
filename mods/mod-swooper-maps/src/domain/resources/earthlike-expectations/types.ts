import type {
  OfficialAgeType,
  OfficialPlacementConstraintSummary,
  OfficialResourceType,
  ResourceRuntimeIdStatus,
} from "../corpus/types.js";
import type { InitialMapResourceAuthoringStatus } from "../initial-map-authoring-policy.js";

export type ResourceExpectationGroupId =
  | "aquatic-coastal-navigable-river"
  | "cultivated-plantation-medicinal"
  | "terrestrial-animal-forest-wild"
  | "geological-mineral-gemstone-industrial";

export type ResourceExpectationStatus = "expected" | "conditional" | "blocked";
export type ResourceExpectationRangeEvidence =
  | "source-backed"
  | "inference-backed"
  | "blocked";
export type ResourceExpectationEvidenceStrength =
  | "official"
  | "external"
  | "inferred";

export type ResourceExpectedCountRange = {
  readonly baseline: "standard-earthlike-map";
  readonly min: number;
  readonly target: number;
  readonly max: number;
  readonly evidence: ResourceExpectationRangeEvidence;
};

export type ResourceExpectationCorpusRef = {
  readonly resourceType: OfficialResourceType;
  readonly staticResourceRowSlot: number;
  readonly runtimeIdStatus: Extract<ResourceRuntimeIdStatus, "unverified">;
};

export type ResourceExpectationEvidence = {
  readonly legality: ResourceExpectationEvidenceStrength;
  readonly habitat: ResourceExpectationEvidenceStrength;
  readonly range: ResourceExpectationEvidenceStrength;
};

export type ResourceInitialMapAuthoringPolicyRef = {
  readonly authoringAge: "AGE_ANTIQUITY";
  readonly status: InitialMapResourceAuthoringStatus;
  readonly rationale: string;
};

export type EarthlikeResourceExpectation = {
  readonly resourceType: OfficialResourceType;
  readonly groupId: ResourceExpectationGroupId;
  readonly corpusRef: ResourceExpectationCorpusRef;
  readonly status: ResourceExpectationStatus;
  readonly initialMapAuthoring: ResourceInitialMapAuthoringPolicyRef;
  readonly eligibleAges: readonly OfficialAgeType[];
  readonly officialConstraintSummary: OfficialPlacementConstraintSummary;
  readonly earthlikePredicate: string;
  readonly expectedCountRange: ResourceExpectedCountRange;
  readonly conditionMultipliers: readonly string[];
  readonly scarcityClass: string;
  readonly operationObligation: string;
  readonly statsProof: string;
  readonly evidenceStrength: ResourceExpectationEvidence;
  readonly proxyRequirements: readonly string[];
  readonly caveats: readonly string[];
};

export type EarthlikeResourceExpectationsArtifact = {
  readonly source: {
    readonly authority: "resource-earthlike-expectations";
    readonly corpusArtifactId: "artifact:resources.corpus";
    readonly artifactId: "artifact:resources.earthlikeExpectations";
    readonly baseline: "standard-earthlike-map";
    readonly runtimeIdStatus: "unverified";
    readonly hardCountGateEvidence: "runtime-calibrated";
  };
  readonly resources: readonly EarthlikeResourceExpectation[];
};
