import { Type, TypedArraySchemas, defineArtifact } from "@swooper/mapgen-core/authoring";
import placement from "@mapgen/domain/placement";
import { PlacementInputsV1Schema } from "./placement-inputs.js";
import { PlacementOutputsV1Schema } from "./placement-outputs.js";

const PlacementEngineStateV1Schema = Type.Object(
  {
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    slotByTile: TypedArraySchemas.u8({
      description: "Requested landmass slot by tile at placement time (0=none,1=west,2=east).",
    }),
    engineLandMask: TypedArraySchemas.u8({
      description: "Engine land mask snapshot at end of placement (1=land,0=water).",
    }),
    slotCounts: Type.Object(
      {
        none: Type.Integer({ minimum: 0 }),
        west: Type.Integer({ minimum: 0 }),
        east: Type.Integer({ minimum: 0 }),
      },
      { additionalProperties: false }
    ),
    startsAssigned: Type.Integer({ minimum: 0 }),
    wondersPlanned: Type.Integer({ minimum: 0 }),
    wondersPlaced: Type.Integer({ minimum: 0 }),
    wondersError: Type.Optional(Type.String()),
    resourcesAttempted: Type.Boolean(),
    resourcesPlaced: Type.Integer({ minimum: 0 }),
    resourcesError: Type.Optional(Type.String()),
    discoveriesPlanned: Type.Integer({ minimum: 0 }),
    discoveriesPlaced: Type.Integer({ minimum: 0 }),
    discoveriesError: Type.Optional(Type.String()),
    waterDriftCount: Type.Integer({
      minimum: 0,
      description:
        "Mismatch count between physics landMask and engine landMask at placement completion.",
    }),
  },
  { additionalProperties: false }
);

const PlacementSurfacePreparationSchema = Type.Object(
  {
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    slotCounts: Type.Object(
      {
        none: Type.Integer({ minimum: 0 }),
        west: Type.Integer({ minimum: 0 }),
        east: Type.Integer({ minimum: 0 }),
      },
      { additionalProperties: false }
    ),
    acceptedLakeTileCount: Type.Integer({
      minimum: 0,
      description: "Lake tiles accepted by map-hydrology projection before placement maintenance.",
    }),
    finalLakeWaterDriftCount: Type.Integer({
      minimum: 0,
      description:
        "Accepted lake tiles that no longer read as water after final placement surface maintenance.",
    }),
    finalLakeClassificationDriftCount: Type.Integer({
      minimum: 0,
      description:
        "Accepted lake tiles that no longer read as Civ7 lake tiles after final placement surface maintenance.",
    }),
  },
  {
    additionalProperties: false,
    description:
      "Transactional placement preparation result. This exists so resource/start/discovery products depend on a named prepared engine surface instead of a broad placement monolith, while retaining final evidence that engine maintenance did not dry projected lakes.",
  }
);

const StartAssignmentArtifactSchema = Type.Object(
  {
    positions: Type.Array(Type.Integer()),
    assigned: Type.Integer({ minimum: 0 }),
    regionalAssigned: Type.Integer({ minimum: 0 }),
    openPoolAssigned: Type.Integer({ minimum: 0 }),
    openPoolUsed: Type.Boolean(),
    primaryAssigned: Type.Integer({ minimum: 0 }),
    islandClusterAssigned: Type.Integer({ minimum: 0 }),
    marginalAssigned: Type.Integer({ minimum: 0 }),
    desperationAssigned: Type.Integer({ minimum: 0 }),
    candidateCount: Type.Integer({ minimum: 0 }),
    rejectionCounts: Type.Array(
      Type.Object(
        {
          reason: Type.Union([
            Type.Literal("water"),
            Type.Literal("lake"),
            Type.Literal("single-tile-island"),
            Type.Literal("insufficient-landmass"),
            Type.Literal("insufficient-expansion"),
            Type.Literal("insufficient-island-cluster"),
          ]),
          count: Type.Integer({ minimum: 0 }),
        },
        { additionalProperties: false }
      )
    ),
    tierCounts: Type.Object(
      {
        primary: Type.Integer({ minimum: 0 }),
        islandCluster: Type.Integer({ minimum: 0 }),
        marginal: Type.Integer({ minimum: 0 }),
      },
      { additionalProperties: false }
    ),
  },
  {
    additionalProperties: false,
    description:
      "Verified player start assignment produced by the starts product step. Tier and fallback counts expose whether starts came from first-age viable land envelopes, intentional island clusters, or last-resort assignment.",
  }
);

const AdvancedStartAssignmentArtifactSchema = Type.Object(
  {
    fertilityRecalculated: Type.Boolean(),
    advancedStartsAssigned: Type.Boolean(),
  },
  {
    additionalProperties: false,
    description:
      "Engine-owned advanced-start assignment evidence after all placement products materialize.",
  }
);

const NaturalWonderPlacementArtifactSchema = Type.Object(
  {
    plannedCount: Type.Integer({ minimum: 0 }),
    placedCount: Type.Integer({ minimum: 0 }),
    skippedOutOfBoundsCount: Type.Integer({ minimum: 0 }),
    rejectedCount: Type.Integer({ minimum: 0 }),
  },
  {
    additionalProperties: false,
    description:
      "Verified natural-wonder stamping result. This is a product contract because failed or partial stamping aborts the placement pipeline.",
  }
);

const ResourcePlacementOutcomeSchema = Type.Object(
  {
    status: Type.Union([
      Type.Literal("placed"),
      Type.Literal("rejected"),
      Type.Literal("mismatch"),
    ]),
    plotIndex: Type.Integer(),
    x: Type.Integer(),
    y: Type.Integer(),
    resourceType: Type.Integer(),
    observedResourceType: Type.Optional(Type.Integer()),
    reason: Type.Optional(
      Type.Union([
        Type.Literal("out-of-bounds"),
        Type.Literal("invalid-resource-type"),
        Type.Literal("cannot-have-resource"),
        Type.Literal("wrong-resource-type"),
      ])
    ),
  },
  { additionalProperties: false }
);

const DiscoveryPlacementOutcomeSchema = Type.Object(
  {
    status: Type.Union([Type.Literal("placed"), Type.Literal("rejected")]),
    plotIndex: Type.Integer(),
    x: Type.Integer(),
    y: Type.Integer(),
    discoveryVisualType: Type.Integer(),
    discoveryActivationType: Type.Integer(),
    reason: Type.Optional(
      Type.Union([
        Type.Literal("out-of-bounds"),
        Type.Literal("invalid-discovery-type"),
        Type.Literal("adapter-rejected"),
      ])
    ),
  },
  { additionalProperties: false }
);

const PlacementOutcomeSummarySchema = Type.Object(
  {
    plannedCount: Type.Integer({ minimum: 0 }),
    placedCount: Type.Integer({ minimum: 0 }),
    rejectedCount: Type.Integer({ minimum: 0 }),
    mismatchCount: Type.Integer({ minimum: 0 }),
  },
  { additionalProperties: false }
);

const ResourcePlacementReasonCountSchema = Type.Object(
  {
    reason: Type.Union([
      Type.Literal("out-of-bounds"),
      Type.Literal("invalid-resource-type"),
      Type.Literal("cannot-have-resource"),
      Type.Literal("wrong-resource-type"),
    ]),
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

const ResourcePlacementSummarySchema = Type.Object(
  {
    plannedCount: Type.Integer({ minimum: 0 }),
    placedCount: Type.Integer({ minimum: 0 }),
    rejectedCount: Type.Integer({ minimum: 0 }),
    mismatchCount: Type.Integer({ minimum: 0 }),
    byResource: Type.Array(ResourcePlacementResourceSummarySchema),
    byReason: Type.Array(ResourcePlacementReasonCountSchema),
  },
  { additionalProperties: false }
);

const ResourceAssignmentResourceSummarySchema = Type.Object(
  {
    resourceType: Type.Integer(),
    legalPlotCount: Type.Integer({ minimum: 0 }),
    plannedCount: Type.Integer({ minimum: 0 }),
    assignedCount: Type.Integer({ minimum: 0 }),
    reassignedOutCount: Type.Integer({ minimum: 0 }),
    reassignedInCount: Type.Integer({ minimum: 0 }),
    unassignedCount: Type.Integer({ minimum: 0 }),
  },
  { additionalProperties: false }
);

const ResourceAssignmentSummarySchema = Type.Object(
  {
    requestedPlannedCount: Type.Integer({ minimum: 0 }),
    assignedCount: Type.Integer({ minimum: 0 }),
    minSpacingTiles: Type.Integer({ minimum: 0 }),
    spacingBlockedCount: Type.Integer({ minimum: 0 }),
    reassignedCount: Type.Integer({ minimum: 0 }),
    unassignedPreferredCount: Type.Integer({ minimum: 0 }),
    candidateResourceTypes: Type.Array(Type.Integer({ minimum: 0 })),
    legalCandidateResourceTypes: Type.Array(Type.Integer({ minimum: 0 })),
    unassignableResourceTypes: Type.Array(Type.Integer({ minimum: 0 })),
    byPreferredResource: Type.Array(ResourceAssignmentResourceSummarySchema),
  },
  { additionalProperties: false }
);

const ResourceAssignmentTraceSchema = Type.Object(
  {
    plotIndex: Type.Integer(),
    x: Type.Integer(),
    y: Type.Integer(),
    resourceType: Type.Integer(),
    initialResourceType: Type.Integer(),
    preferredResourceType: Type.Union([Type.Integer(), Type.Null()]),
    assignmentPhase: Type.Union([
      Type.Literal("scarce-floor"),
      Type.Literal("strict-spacing"),
      Type.Literal("relaxed-spacing"),
    ]),
    reassignedByRebalance: Type.Boolean(),
    assignmentOrder: Type.Integer({ minimum: 0 }),
    perTypeCountBefore: Type.Integer({ minimum: 0 }),
    legalPlotCountForResource: Type.Integer({ minimum: 0 }),
    targetMinPerType: Type.Integer({ minimum: 0 }),
  },
  {
    additionalProperties: false,
    description:
      "Diagnostic trace for the local resource assignment pass that selected each resource intent before adapter materialization.",
  }
);

const ResourcePlacementOutcomesArtifactSchema = Type.Object(
  {
    summary: ResourcePlacementSummarySchema,
    assignment: ResourceAssignmentSummarySchema,
    assignmentTrace: Type.Array(ResourceAssignmentTraceSchema),
    outcomes: Type.Array(ResourcePlacementOutcomeSchema),
  },
  {
    additionalProperties: false,
    description:
      "Typed resource intent reconciliation. Rejections are allowed only with named reasons; mismatches are fail-hard.",
  }
);

const DiscoveryPlacementOutcomesArtifactSchema = Type.Object(
  {
    summary: PlacementOutcomeSummarySchema,
    outcomes: Type.Array(DiscoveryPlacementOutcomeSchema),
  },
  {
    additionalProperties: false,
    description:
      "Typed discovery intent reconciliation. Rejections are allowed only with named reasons.",
  }
);

export const placementArtifacts = {
  placementInputs: defineArtifact({
    name: "placementInputs",
    id: "artifact:placementInputs",
    schema: PlacementInputsV1Schema,
  }),
  resourcePlan: defineArtifact({
    name: "resourcePlan",
    id: "artifact:placement.resourcePlan",
    schema: placement.ops.planResources.output,
  }),
  naturalWonderPlan: defineArtifact({
    name: "naturalWonderPlan",
    id: "artifact:placement.naturalWonderPlan",
    schema: placement.ops.planNaturalWonders.output,
  }),
  naturalWonderPlacement: defineArtifact({
    name: "naturalWonderPlacement",
    id: "artifact:placement.naturalWonderPlacement",
    schema: NaturalWonderPlacementArtifactSchema,
  }),
  placementSurfacePreparation: defineArtifact({
    name: "placementSurfacePreparation",
    id: "artifact:placement.surfacePreparation",
    schema: PlacementSurfacePreparationSchema,
  }),
  resourcePlacementOutcomes: defineArtifact({
    name: "resourcePlacementOutcomes",
    id: "artifact:placement.resourcePlacementOutcomes",
    schema: ResourcePlacementOutcomesArtifactSchema,
  }),
  discoveryPlacementOutcomes: defineArtifact({
    name: "discoveryPlacementOutcomes",
    id: "artifact:placement.discoveryPlacementOutcomes",
    schema: DiscoveryPlacementOutcomesArtifactSchema,
  }),
  startAssignment: defineArtifact({
    name: "startAssignment",
    id: "artifact:placement.startAssignment",
    schema: StartAssignmentArtifactSchema,
  }),
  advancedStartAssignment: defineArtifact({
    name: "advancedStartAssignment",
    id: "artifact:placement.advancedStartAssignment",
    schema: AdvancedStartAssignmentArtifactSchema,
  }),
  discoveryPlan: defineArtifact({
    name: "discoveryPlan",
    id: "artifact:placement.discoveryPlan",
    schema: placement.ops.planDiscoveries.output,
  }),
  placementOutputs: defineArtifact({
    name: "placementOutputs",
    id: "artifact:placementOutputs",
    schema: PlacementOutputsV1Schema,
  }),
  engineState: defineArtifact({
    name: "engineState",
    id: "artifact:placementEngineState",
    schema: PlacementEngineStateV1Schema,
  }),
} as const;
