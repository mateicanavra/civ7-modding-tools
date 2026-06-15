import type { RunInGameExactAuthorshipProof as PublicRunInGameExactAuthorshipProof } from "@civ7/studio-server";

type RunInGameDetailedResourcePlacementRejectionRow = Readonly<{
  status: "rejected" | "mismatch";
  resourceType: number;
  resource?: string;
  plotIndex: number;
  x: number;
  y: number;
  reason?: string;
  observedResourceType?: number;
  observedResource?: string;
  assignmentPhase?: string;
  assignmentOrder?: number;
  initialResourceType?: number;
  preferredResourceType?: number | null;
  perTypeCountBefore?: number;
  legalPlotCountForResource?: number;
  targetMinPerType?: number;
}>;

type RunInGameDetailedNaturalWonderPlacementCoordinateRow = Readonly<{
  status: "placed" | "rejected";
  featureType: number;
  plotIndex: number;
  x: number;
  y: number;
  direction: number;
  elevation?: number;
  reason: string;
  observedFeatureType?: number;
  observedPlotIndex?: number;
  expectedFootprintReadback?: ReadonlyArray<
    Readonly<{
      plotIndex: number;
      observedFeatureType: number;
    }>
  >;
  expectedFootprintReadbackStatus?: "empty-expected-footprint" | "partial-expected-footprint";
}>;

type RunInGameDetailedNaturalWonderPlanRow = Readonly<{
  plotIndex: number;
  x: number;
  y: number;
  featureType: number;
  direction: number;
  elevation?: number;
  priorityPpm?: number;
}>;

type RunInGameDetailedNaturalWonderPlanInputRow = Readonly<{
  plotIndex: number;
  x: number;
  y: number;
  featureType: number;
  terrainType: number;
  biomeType: number;
  occupiedFeatureType: number;
  elevation: number;
  aridityPpm: number;
  riverClass: number;
  lakeMask: number;
  blockedMask: number;
  landMask: number;
}>;

type RunInGameDetailedNaturalWonderPlanInputSurfaceDigests = Readonly<{
  version: number;
  plotCount: number;
  landMaskHash32: string;
  elevationHash32: string;
  aridityPpmHash32: string;
  riverClassHash32: string;
  lakeMaskHash32: string;
  blockedMaskHash32: string;
  terrainTypeHash32: string;
  biomeTypeHash32: string;
  featureTypeHash32: string;
}>;

export type RunInGameDetailedProofLog = Readonly<{
  logPath?: string;
  observedAt?: string;
  requestId: string;
  configHash: string;
  envelopeHash: string;
  seed: number;
  mapSize?: string;
  dimensions: Readonly<{ width: number; height: number }>;
  proofPayload: unknown;
  completionPayload: unknown;
  featureApply?: Readonly<{
    marker: "FEATURE_APPLY_V1";
    payload: unknown;
    stats?: Readonly<{
      attempted: number;
      applied: number;
      rejected: number;
      rejectedCanHaveFeature: number;
      attemptedByFeature?: Readonly<Record<string, number>>;
      appliedByFeature?: Readonly<Record<string, number>>;
      rejectedCanHaveFeatureByFeature?: Readonly<Record<string, number>>;
    }>;
  }>;
  placementSurfacePreparation?: Readonly<{
    marker: "PLACEMENT_SURFACE_PREPARATION_V1";
    payload: unknown;
    acceptedLakeTileCount: number;
    finalLakeWaterDriftCount: number;
    finalLakeClassificationDriftCount: number;
  }>;
  resourcePlacement?: Readonly<{
    marker: "RESOURCE_PLACEMENT_V1";
    payload: unknown;
    stats?: Readonly<{
      version: number;
      plannedCount: number;
      placedCount: number;
      rejectedCount: number;
      mismatchCount: number;
      rejectionExampleCount?: number;
      rejectionExamples?: ReadonlyArray<string>;
      rejectionRows?: ReadonlyArray<RunInGameDetailedResourcePlacementRejectionRow>;
    }>;
    coordinateProof?: Readonly<{
      version: number;
      placed: Readonly<{ count: number; hash32: string }>;
      rejected?: Readonly<{ count: number; hash32: string }>;
      mismatch?: Readonly<{ count: number; hash32: string }>;
    }>;
  }>;
  naturalWonderPlan?: Readonly<{
    marker: "NATURAL_WONDER_PLAN_V1";
    payload: unknown;
    stats?: Readonly<{
      version: number;
      wondersCount: number;
      targetCount: number;
      plannedCount: number;
    }>;
    coordinateProof?: Readonly<{
      version: number;
      planned: Readonly<{ count: number; hash32: string }>;
    }>;
    planRows?: ReadonlyArray<RunInGameDetailedNaturalWonderPlanRow>;
  }>;
  naturalWonderPlanInput?: Readonly<{
    marker: "NATURAL_WONDER_PLAN_INPUT_V1";
    payload: unknown;
    stats?: Readonly<{
      version: number;
      plannedCount: number;
      rowCount: number;
    }>;
    surfaceDigests?: RunInGameDetailedNaturalWonderPlanInputSurfaceDigests;
    inputRows?: ReadonlyArray<RunInGameDetailedNaturalWonderPlanInputRow>;
  }>;
  naturalWonderPlacement?: Readonly<{
    marker: "NATURAL_WONDER_PLACEMENT_V1";
    payload: unknown;
    stats?: Readonly<{
      version: number;
      plannedCount: number;
      targetCount: number;
      placedCount: number;
      terrainAdjustedCount: number;
      skippedOutOfBoundsCount: number;
      rejectedCount: number;
      shortfallCount: number;
      rejectionExampleCount?: number;
      rejectionExamples?: ReadonlyArray<string>;
    }>;
    coordinateProof?: Readonly<{
      version: number;
      placed: Readonly<{ count: number; hash32: string }>;
      rejected?: Readonly<{ count: number; hash32: string }>;
    }>;
    coordinateRows?: ReadonlyArray<RunInGameDetailedNaturalWonderPlacementCoordinateRow>;
  }>;
  matched: ReadonlyArray<string>;
}>;

export type RunInGameDetailedExactAuthorshipProof = Omit<
  PublicRunInGameExactAuthorshipProof,
  "log"
> &
  Readonly<{
    log?: RunInGameDetailedProofLog;
  }>;
