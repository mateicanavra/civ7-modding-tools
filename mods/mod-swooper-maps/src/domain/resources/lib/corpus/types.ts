export type OfficialResourceType = `RESOURCE_${string}`;
export type OfficialAgeType = `AGE_${string}`;
export type OfficialResourceClassType = `RESOURCECLASS_${string}`;
export type OfficialYieldType = `YIELD_${string}`;
export type OfficialResourceTag = string;

export type ResourceRuntimeIdStatus = "unverified" | "verified" | "mismatch" | "blocked";
export type ResourcePlaceabilityStatus = "placeable" | "conditional" | "not-map-placed" | "unknown";
export type ResourceStrategyRequiredStatus = "required" | "not-required" | "blocked";

export type RuntimeEvidenceRef = {
  readonly source: string;
  readonly detail: string;
};

export type ResourceRuntimeId =
  | {
      readonly status: "unverified";
      readonly value: null;
      readonly evidence: readonly [];
      readonly rationale: string;
    }
  | {
      readonly status: "verified";
      readonly value: number;
      readonly evidence: readonly RuntimeEvidenceRef[];
      readonly verifiedResourceType: OfficialResourceType;
    }
  | {
      readonly status: "mismatch";
      readonly value: number;
      readonly expectedStaticResourceRowSlot: number;
      readonly observedResourceType: OfficialResourceType;
      readonly evidence: readonly RuntimeEvidenceRef[];
    }
  | {
      readonly status: "blocked";
      readonly value: null;
      readonly blocker: string;
      readonly nextProof: string;
    };

export type ResourceSourceRef = {
  readonly file: string;
  readonly table: string;
};

export type ResourceClassOverride = {
  readonly age: OfficialAgeType;
  readonly resourceClass: OfficialResourceClassType;
  readonly sourceFile: string;
};

export type ResourceYieldChange = {
  readonly YieldType: OfficialYieldType;
  readonly YieldChange: string;
};

export type ResourceDistributionFacts = {
  readonly adjacentToLand?: boolean;
  readonly lakeEligible?: boolean;
  readonly staple?: boolean;
  readonly minimumPerHemisphere?: number;
  readonly hemisphereUnique?: boolean;
  readonly bonusResourceSlots?: number;
  readonly unlocksCiv?: boolean;
  readonly tradeable?: boolean;
};

export type OfficialPlacementConstraintSummary = {
  readonly hasOfficialBiomeConstraints: boolean;
  readonly validBiomeConstraintCount: number;
  readonly sourceTables: readonly ResourceSourceRef[];
  readonly placementFlags: ResourceDistributionFacts;
};

export type ResourceDisposition<TStatus extends string> = {
  readonly status: TStatus;
  readonly rationale: string;
};

export type OfficialResourceCorpusEntry = {
  readonly resourceType: OfficialResourceType;
  readonly staticResourceRowSlot: number;
  readonly staticSource: ResourceSourceRef;
  readonly name: string;
  readonly tooltip: string;
  readonly baseClass: OfficialResourceClassType;
  readonly weight: number;
  readonly runtimeId: ResourceRuntimeId;
  readonly validAges: readonly OfficialAgeType[];
  readonly ageClassOverrides: readonly ResourceClassOverride[];
  readonly officialPlacementConstraints: OfficialPlacementConstraintSummary;
  readonly yieldChanges: readonly ResourceYieldChange[];
  readonly typeTags: readonly OfficialResourceTag[];
  readonly placeability: ResourceDisposition<ResourcePlaceabilityStatus>;
  readonly strategyRequired: ResourceDisposition<ResourceStrategyRequiredStatus>;
};

export type OfficialResourceCorpusArtifact = {
  readonly source: {
    readonly authority: "civ7-official-resources";
    readonly module: "base-standard";
    readonly order: "base-standard.modinfo Resources row order";
    readonly runtimeIdStatus: "unverified";
    readonly sourceFiles: readonly string[];
  };
  readonly resources: readonly OfficialResourceCorpusEntry[];
};
