import { Type, TypedArraySchemas, defineArtifact } from "@swooper/mapgen-core/authoring";
import placement from "@mapgen/domain/placement";
import resources from "@mapgen/domain/resources";
import { PlacementInputsV1Schema } from "./placement-inputs.js";
import { PlacementOutputsV1Schema } from "./placement-outputs.js";

const ResourceFamilySchema = Type.Union([
  Type.Literal("aquatic"),
  Type.Literal("cultivated"),
  Type.Literal("terrestrial"),
  Type.Literal("geological"),
]);

const ResourceDemandSummaryRowSchema = Type.Object(
  {
    resourceType: Type.String({ pattern: "^RESOURCE_[A-Z0-9_]+$" }),
    resourceTypeId: Type.Integer({ minimum: 0 }),
    family: ResourceFamilySchema,
    laneId: Type.String(),
    laneKind: Type.Union([Type.Literal("land"), Type.Literal("water")]),
    weight: Type.Number({ minimum: 1 }),
    minimumPerHemisphere: Type.Integer({ minimum: 0 }),
    requiredForAge: Type.Boolean(),
    targetCount: Type.Integer({ minimum: 0 }),
    minCount: Type.Integer({ minimum: 0 }),
    maxCount: Type.Integer({ minimum: 0 }),
    habitatTileCount: Type.Integer({ minimum: 0 }),
    legalTileCount: Type.Integer({ minimum: 0 }),
    eligibleTileCount: Type.Integer({ minimum: 0 }),
  },
  { additionalProperties: false }
);

const ResourceDemandPlanArtifactSchema = Type.Object(
  {
    age: Type.String({ pattern: "^AGE_[A-Z_]+$" }),
    runtimeIdResolution: Type.Object(
      {
        status: Type.Literal("verified"),
        checkedCount: Type.Integer({ minimum: 0 }),
      },
      { additionalProperties: false }
    ),
    minimumAmountModifier: Type.Integer(),
    groups: resources.ops.planResourceGroups.output,
    demands: Type.Array(ResourceDemandSummaryRowSchema),
    excluded: Type.Array(
      Type.Object(
        {
          resourceType: Type.String(),
          reason: Type.String(),
        },
        { additionalProperties: false }
      )
    ),
  },
  {
    additionalProperties: false,
    description:
      "Per-type resource demand/eligibility plan from the domain/resources family planners: symbolic group rollup plus proven-runtime-id demand rows (weight, range gates, region-minimum facts) feeding site selection.",
  }
);

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

const PlanStartsOutputSchema = placement.ops.planStarts.output;

const StartAssignmentArtifactSchema = Type.Object(
  {
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    positions: Type.Array(Type.Integer({ minimum: -1 }), {
      description: "Chosen plot per seat index (-1 = unseated, recorded as degraded data).",
    }),
    seats: PlanStartsOutputSchema.properties.seats,
    fairnessReport: PlanStartsOutputSchema.properties.fairnessReport,
    status: PlanStartsOutputSchema.properties.status,
    assigned: Type.Integer({ minimum: 0 }),
    unseatedCount: Type.Integer({ minimum: 0 }),
    rungCounts: Type.Object(
      {
        regional: Type.Integer({ minimum: 0 }),
        openPool: Type.Integer({ minimum: 0 }),
        qualityRelaxed: Type.Integer({ minimum: 0 }),
        spacingRelaxed: Type.Integer({ minimum: 0 }),
      },
      {
        additionalProperties: false,
        description:
          "Seated count per fallback ladder rung (regional → open-pool → quality-relaxed → spacing-relaxed). Non-regional rungs are surfaced as warnings when they fire.",
      }
    ),
    primaryAssigned: Type.Integer({ minimum: 0 }),
    islandClusterAssigned: Type.Integer({ minimum: 0 }),
    marginalAssigned: Type.Integer({ minimum: 0 }),
    noneAssigned: Type.Integer({ minimum: 0 }),
    candidateCount: Type.Integer({ minimum: 0 }),
    rejectionCounts: PlanStartsOutputSchema.properties.rejectionCounts,
    tierCounts: PlanStartsOutputSchema.properties.tierCounts,
    inputCoverage: PlanStartsOutputSchema.properties.inputCoverage,
  },
  {
    additionalProperties: false,
    description:
      "Verified player start assignment produced by the starts product step: per-player StartRecord[] (component vectors, rung, status, achieved spacing, imputed flags), the fairness report (worst-pair gap, relaxations, swaps), and rung/tier aggregates. Selection authority lives in the plan-starts op; this artifact is the stamped record.",
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

const NaturalWonderPlacementCoordinateDigestSchema = Type.Object(
  {
    count: Type.Integer({ minimum: 0 }),
    hash32: Type.String({ pattern: "^[0-9a-f]{8}$" }),
  },
  { additionalProperties: false }
);

const NaturalWonderPlacementCoordinateProofSchema = Type.Object(
  {
    version: Type.Literal(1),
    placed: NaturalWonderPlacementCoordinateDigestSchema,
    rejected: NaturalWonderPlacementCoordinateDigestSchema,
  },
  {
    additionalProperties: false,
    description:
      "Compact deterministic coordinate identity for natural-wonder placement outcomes, intended for exact-run log/artifact comparison.",
  }
);

const NaturalWonderFootprintReadbackSchema = Type.Object(
  {
    plotIndex: Type.Integer({ minimum: 0 }),
    observedFeatureType: Type.Integer(),
  },
  { additionalProperties: false }
);

const NaturalWonderPlacementCoordinateRowSchema = Type.Object(
  {
    status: Type.Union([Type.Literal("placed"), Type.Literal("rejected")]),
    plotIndex: Type.Integer({ minimum: 0 }),
    x: Type.Integer(),
    y: Type.Integer(),
    featureType: Type.Integer(),
    direction: Type.Integer(),
    elevation: Type.Optional(Type.Integer()),
    reason: Type.String(),
    observedFeatureType: Type.Optional(Type.Integer()),
    observedPlotIndex: Type.Optional(Type.Integer({ minimum: 0 })),
    expectedFootprintReadback: Type.Optional(Type.Array(NaturalWonderFootprintReadbackSchema)),
    expectedFootprintReadbackStatus: Type.Optional(
      Type.Union([
        Type.Literal("empty-expected-footprint"),
        Type.Literal("partial-expected-footprint"),
      ])
    ),
  },
  {
    additionalProperties: false,
    description:
      "Bounded natural-wonder placement row identity for exact/local proof comparison.",
  }
);

const NaturalWonderPlacementArtifactSchema = Type.Object(
  {
    plannedCount: Type.Integer({ minimum: 0 }),
    targetCount: Type.Integer({ minimum: 0 }),
    placedCount: Type.Integer({ minimum: 0 }),
    terrainAdjustedCount: Type.Integer({ minimum: 0 }),
    skippedOutOfBoundsCount: Type.Integer({ minimum: 0 }),
    rejectedCount: Type.Integer({ minimum: 0 }),
    shortfallCount: Type.Integer({ minimum: 0 }),
    rejectionExamples: Type.Array(Type.String()),
    coordinateProof: NaturalWonderPlacementCoordinateProofSchema,
    coordinateRows: Type.Array(NaturalWonderPlacementCoordinateRowSchema),
  },
  {
    additionalProperties: false,
    description:
      "Measured natural-wonder stamping result. Corrupt plans fail before this artifact, while shortfalls and legality rejections are recorded as placement outcomes.",
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

const ResourcePlacementCoordinateDigestSchema = Type.Object(
  {
    count: Type.Integer({ minimum: 0 }),
    hash32: Type.String({ pattern: "^[0-9a-f]{8}$" }),
  },
  { additionalProperties: false }
);

const ResourcePlacementCoordinateProofSchema = Type.Object(
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
    coordinateProof: ResourcePlacementCoordinateProofSchema,
    byResource: Type.Array(ResourcePlacementResourceSummarySchema),
    byReason: Type.Array(ResourcePlacementReasonCountSchema),
  },
  { additionalProperties: false }
);

const ResourceReconciliationShortfallSchema = Type.Object(
  {
    resourceType: Type.Integer({ minimum: 0 }),
    reason: Type.Union([
      Type.Literal("out-of-bounds"),
      Type.Literal("invalid-resource-type"),
      Type.Literal("cannot-have-resource"),
    ]),
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
      },
      {
        additionalProperties: false,
        description: "Placed counts by planning phase (joined from the resource plan intents).",
      }
    ),
  },
  { additionalProperties: false }
);

const ResourcePlacementOutcomesArtifactSchema = Type.Object(
  {
    summary: ResourcePlacementSummarySchema,
    reconciliation: ResourceReconciliationSummarySchema,
    outcomes: Type.Array(ResourcePlacementOutcomeSchema),
  },
  {
    additionalProperties: false,
    description:
      "Typed resource intent reconciliation (D4): the plan is authority; the materializer stamps intents and records typed rejections. No type re-decision, no whole-map fallback; mismatches are fail-hard.",
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
  resourceDemandPlan: defineArtifact({
    name: "resourceDemandPlan",
    id: "artifact:placement.resourceDemandPlan",
    schema: ResourceDemandPlanArtifactSchema,
  }),
  resourcePlan: defineArtifact({
    name: "resourcePlan",
    id: "artifact:placement.resourcePlan",
    schema: resources.ops.selectResourceSites.output,
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
