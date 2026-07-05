import type { InitialMapResourceAuthoringStatus } from "../../policy/initial-map-authoring.js";
import type {
  OfficialAgeType,
  OfficialPlacementConstraintSummary,
  OfficialResourceType,
} from "@civ7/map-policy";

export type ResourceExpectationGroupId =
  | "aquatic-coastal-navigable-river"
  | "cultivated-plantation-medicinal"
  | "terrestrial-animal-forest-wild"
  | "geological-mineral-gemstone-industrial";

export type ResourceExpectationStatus = "expected" | "conditional" | "blocked";
export type ResourceExpectationRangeEvidence = "source-backed" | "inference-backed" | "blocked";
export type ResourceExpectationEvidenceStrength = "official" | "external" | "inferred";

export type ResourceExpectedCountRange = {
  readonly baseline: "standard-earthlike-map";
  readonly min: number;
  readonly target: number;
  readonly max: number;
  readonly evidence: ResourceExpectationRangeEvidence;
};

export type ResourceExpectationEvidence = {
  readonly legality: ResourceExpectationEvidenceStrength;
  readonly habitat: ResourceExpectationEvidenceStrength;
  readonly range: ResourceExpectationEvidenceStrength;
};

export type ResourceInitialMapAuthoringPolicyRef = {
  readonly authoringAge: OfficialAgeType;
  readonly status: InitialMapResourceAuthoringStatus;
  readonly rationale: string;
};

export type EarthlikeResourceExpectation = {
  readonly resourceType: OfficialResourceType;
  readonly groupId: ResourceExpectationGroupId;
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
  readonly signalRequirements: readonly string[];
  readonly caveats: readonly string[];
};

export type EarthlikeResourceExpectationsArtifact = {
  readonly source: {
    readonly authority: "resource-earthlike-expectations";
    readonly artifactId: "artifact:resources.earthlikeExpectations";
    readonly baseline: "standard-earthlike-map";
    readonly hardCountGateEvidence: "runtime-calibrated";
  };
  readonly resources: readonly EarthlikeResourceExpectation[];
};
