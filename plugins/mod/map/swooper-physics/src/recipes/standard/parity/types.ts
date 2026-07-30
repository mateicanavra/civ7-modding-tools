import type { Civ7StandardMapSizeId } from "@civ7/map-policy";
import type { DeepReadonly, RunInGameExactAuthorshipEvidence } from "@civ7/studio-contract";
import { artifacts as resourceSupportArtifacts } from "../../../domain/resources/modules/support/artifacts/index.js";
import type { ArtifactReadValueOf } from "@swooper/mapgen-core/authoring";
import type { STANDARD_INITIAL_SETUP, StandardInitialSetup } from "../initial-setup.js";
import type { StandardFeatureProjectionMeasurements } from "../metrics/families/ecology-projection.js";
import type { StandardLakeProjectionMeasurements } from "../metrics/families/hydrology/lake-projection.js";
import type { StandardNaturalWonderPlanInputMeasurements } from "../metrics/families/placement/natural-wonder-plan-input.js";
import type { StandardResourcePlacementMeasurements } from "../metrics/families/placement/resource-placement.js";
import type { StandardPlacementParityMeasurements } from "../metrics/families/placement-parity.js";

/** Final Civ7 map surfaces whose exact values define Standard product parity. */
export const STANDARD_PARITY_SURFACE_KEYS = ["terrain", "biome", "feature", "resource"] as const;

/** Stable identity of one final Standard surface compared across replay and Civ7. */
export type StandardParitySurfaceKey = (typeof STANDARD_PARITY_SURFACE_KEYS)[number];

/** Row-major numeric surface that retains missing live observations as null evidence. */
export type StandardParityGrid = Readonly<{
  width: number;
  height: number;
  values: ReadonlyArray<number | null>;
}>;

/** Complete set of final product surfaces captured from one Standard execution. */
export type StandardFinalSurfaceCapture = Readonly<{
  dimensions: Readonly<{ width: number; height: number }>;
  grids: Readonly<Record<StandardParitySurfaceKey, StandardParityGrid>>;
}>;

/** Replay-owned river plan and adapter capability evidence needed for live comparison. */
export type StandardRiverProjectionCapture = Readonly<{
  plannedMinor: StandardParityGrid;
  plannedMajor: StandardParityGrid;
  projectedNavigableTerrain: StandardParityGrid;
  minorRiverStamping:
    | Readonly<{ status: "supported" }>
    | Readonly<{ status: "unsupported"; reason: string }>
    | Readonly<{ status: "unresolved"; reason: string }>;
}>;

/** Civ7-observed river surfaces and native-object evidence from one stable read window. */
type StandardLiveRiverCapture = Readonly<{
  terrainNavigableRiver: StandardParityGrid;
  riverType: StandardParityGrid;
  river: StandardParityGrid;
  navigableRiver: StandardParityGrid;
  minorRiver: StandardParityGrid;
  nativeObjects:
    | Readonly<{ status: "present"; count: number; sampleCount: number }>
    | Readonly<{ status: "unavailable"; blockedBy: ReadonlyArray<string> }>;
}>;

type ResourcePlanAdjusted = ArtifactReadValueOf<
  typeof resourceSupportArtifacts.resourcePlanAdjusted
>;

/** Bounded, JSON-safe natural-wonder anchor evidence emitted by the shipped recipe. */
export type StandardNaturalWonderPlanRow = Readonly<{
  plotIndex: number;
  x: number;
  y: number;
  featureType: number;
  direction: number;
  elevation: number | null;
  priorityPpm: number | null;
}>;

/** Deterministic replay projection of the immutable natural-wonder plan. */
export type StandardNaturalWonderPlanEvidence = Readonly<{
  version: 1;
  plannedCount: number;
  coordinateDigest: StandardCoordinateDigest;
  rows: ReadonlyArray<StandardNaturalWonderPlanRow>;
}>;

/** One bounded anchor observation from the shared natural-wonder planning-input measurement. */
export type StandardNaturalWonderPlanInputRow =
  StandardNaturalWonderPlanInputMeasurements["rows"][number];

/** Complete causal planner request and selected-anchor evidence compared across executions. */
export type StandardNaturalWonderPlanInputEvidence =
  DeepReadonly<StandardNaturalWonderPlanInputMeasurements>;

/** Coordinate count and order-independent hash used to correlate placement outcomes. */
export type StandardCoordinateDigest = Readonly<{
  count: number;
  hash32: string;
}>;

/** Exact evidence may omit zero-count channels while preserving that omission explicitly. */
export type StandardOptionalCoordinateDigest =
  | Readonly<{ status: "present"; digest: StandardCoordinateDigest }>
  | Readonly<{ status: "implicit-empty" }>
  | Readonly<{ status: "missing"; evidenceLink: string }>;

/** Exact resource placement evidence compared against replayed plan outcomes. */
export type StandardResourcePlacementEvidence = Readonly<{
  version: 1;
  placed: StandardCoordinateDigest;
  rejected: StandardOptionalCoordinateDigest;
  mismatch: StandardOptionalCoordinateDigest;
  rejectionRows: ReadonlyArray<StandardResourcePlacementRejectionRow>;
}>;

/** Bounded rejection witness retained when a resource intent cannot materialize exactly. */
export type StandardResourcePlacementRejectionRow = Readonly<{
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

/** Terminal surface counters derived from one post-placement engine observation. */
export type StandardPlacementParityCounters = DeepReadonly<StandardPlacementParityMeasurements>;

/** Floodplain application counters projected from the shared feature measurement. */
export type StandardFloodplainApplyCounters = Readonly<{
  attemptedFloodplainFeatureCount: number;
  appliedFloodplainFeatureCount: number;
  rejectedFloodplainFeatureCount: number;
}>;

/** Product evidence that stays missing rather than being synthesized from a weaker source. */
export type StandardExactProductEvidence<T> =
  | Readonly<{ status: "present"; value: T }>
  | Readonly<{ status: "missing"; evidenceLink: string }>;

/** Closed outcome of one product evidence claim. */
type StandardParityComparisonStatus = "pass" | "fail" | "unresolved" | "not-applicable";

/** One evidence-backed parity claim with stable links for report consumers. */
export type StandardParityComparison = Readonly<{
  status: StandardParityComparisonStatus;
  reason: string;
  evidenceLinks: ReadonlyArray<string>;
  failureLinks?: ReadonlyArray<string>;
  unresolvedLinks?: ReadonlyArray<string>;
}>;

/** Exact-authorship packet after the public contract proves every required launch link. */
export type CompleteExactAuthorshipEvidence = Extract<
  DeepReadonly<RunInGameExactAuthorshipEvidence>,
  { readonly status: "complete" }
>;

/** Exact admitted Standard setup and behavior fingerprint captured from the executed recipe plan. */
export type StandardExactRecipePlanEvidence = Readonly<{
  recipeId: "standard";
  planFingerprint: string;
  initialSetup: Readonly<{
    definitionId: typeof STANDARD_INITIAL_SETUP.id;
    value: StandardInitialSetup;
  }>;
}>;

/** Recipe-plan projections retained from both exact Standard lifecycle markers. */
export type StandardExactRecipePlanPayloads = Readonly<{
  evidence: StandardExactProductEvidence<StandardExactRecipePlanEvidence>;
  completion: StandardExactProductEvidence<StandardExactRecipePlanEvidence>;
}>;

/** Complete exact authorship plus Standard-specific product evidence admitted from its log. */
export type StandardExactParityCapture = Readonly<{
  authorship: CompleteExactAuthorshipEvidence;
  recipePlan: StandardExactRecipePlanPayloads;
  placementParity: StandardExactProductEvidence<StandardPlacementParityCounters>;
  floodplains: StandardExactProductEvidence<StandardFloodplainApplyCounters>;
  naturalWonderPlan: StandardExactProductEvidence<StandardNaturalWonderPlanEvidence>;
  naturalWonderPlanInput: StandardExactProductEvidence<StandardNaturalWonderPlanInputEvidence>;
  resourcePlacement: StandardExactProductEvidence<StandardResourcePlacementEvidence>;
}>;

/** Deterministic local replay evidence derived from one frozen Standard launch envelope. */
export type StandardLocalParityCapture = Readonly<{
  source: "standard-replay";
  identity: Readonly<{
    planFingerprint: string;
    mapSeed: number;
    gameSeed: number;
    mapSize: Civ7StandardMapSizeId;
    aliveMajorPlayerIds: readonly number[];
    canonicalConfigDigest: string;
    launchEnvelopeDigest: string;
  }>;
  surface: StandardFinalSurfaceCapture;
  hydrology: Readonly<{
    rivers: StandardRiverProjectionCapture;
    lakeProjection: StandardLakeProjectionMeasurements;
    featureProjection: StandardFeatureProjectionMeasurements;
  }>;
  placement: Readonly<{
    terminalParity: StandardPlacementParityCounters;
    naturalWonderPlanEvidence: StandardNaturalWonderPlanEvidence;
    naturalWonderPlanInput: StandardExactProductEvidence<StandardNaturalWonderPlanInputEvidence>;
    resourcePlanIntents: DeepReadonly<ResourcePlanAdjusted["intents"]>;
    resourcePlacement: Readonly<{
      coordinateEvidence: DeepReadonly<
        StandardResourcePlacementMeasurements["summary"]["coordinateEvidence"]
      > &
        Readonly<{ mismatch: StandardCoordinateDigest }>;
      outcomes: DeepReadonly<StandardResourcePlacementMeasurements["outcomes"]>;
    }>;
  }>;
}>;

/** Typed live Civ7 surface evidence observed within one stable Direct Control read window. */
export type StandardLiveParityCapture = Readonly<{
  source: "live-civ7";
  identity: Readonly<{
    wireConnectionEpoch: number;
    mapSeed: number;
    turn: number;
  }>;
  surface: StandardFinalSurfaceCapture;
  fullGrid: Readonly<{
    plotCount: number;
    observedPlotCount: number;
    missingPlotIndices: ReadonlyArray<number>;
    identityStable: true;
  }>;
  hydrology: Readonly<{
    rivers: StandardLiveRiverCapture;
  }>;
}>;
