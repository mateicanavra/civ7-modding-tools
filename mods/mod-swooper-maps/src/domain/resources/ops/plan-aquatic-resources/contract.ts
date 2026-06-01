import { Type, TypedArraySchemas, defineOp } from "@swooper/mapgen-core/authoring";

const AquaticResourceTypeSchema = Type.Union([
  Type.Literal("RESOURCE_FISH"),
  Type.Literal("RESOURCE_PEARLS"),
  Type.Literal("RESOURCE_WHALES"),
  Type.Literal("RESOURCE_CRABS"),
  Type.Literal("RESOURCE_COWRIE"),
  Type.Literal("RESOURCE_TURTLES"),
]);

const ExpectedCountRangeSchema = Type.Object(
  {
    baseline: Type.Literal("standard-earthlike-map"),
    min: Type.Integer({ minimum: 0 }),
    target: Type.Integer({ minimum: 0 }),
    max: Type.Integer({ minimum: 0 }),
    evidence: Type.Union([
      Type.Literal("source-backed"),
      Type.Literal("inference-backed"),
      Type.Literal("blocked"),
    ]),
  },
  { additionalProperties: false }
);

const AquaticExpectationSchema = Type.Object(
  {
    resourceType: AquaticResourceTypeSchema,
    groupId: Type.Literal("aquatic-coastal-navigable-river"),
    status: Type.Union([
      Type.Literal("expected"),
      Type.Literal("conditional"),
      Type.Literal("blocked"),
    ]),
    earthlikePredicate: Type.String(),
    expectedCountRange: ExpectedCountRangeSchema,
    conditionMultipliers: Type.Array(Type.String()),
    proxyRequirements: Type.Array(Type.String()),
    caveats: Type.Array(Type.String()),
  },
  {
    additionalProperties: true,
    description:
      "Aquatic rows projected from artifact:resources.earthlikeExpectations. Extra source fields may travel with the row, but the op only consumes symbolic expectations.",
  }
);

const AquaticPlanRowSchema = Type.Object(
  {
    resourceType: AquaticResourceTypeSchema,
    status: Type.Union([
      Type.Literal("planned"),
      Type.Literal("blocked"),
      Type.Literal("missing-expectation"),
      Type.Literal("proxy-gap"),
    ]),
    eligibilityStatus: Type.Union([
      Type.Literal("observed"),
      Type.Literal("proxy-incomplete"),
      Type.Literal("missing-expectation"),
      Type.Literal("blocked"),
    ]),
    expectedCountRange: ExpectedCountRangeSchema,
    targetIntentCount: Type.Integer({ minimum: 0 }),
    eligibleTileCount: Type.Integer({ minimum: 0 }),
    rangeStatus: Type.Union([
      Type.Literal("within-range"),
      Type.Literal("below-range"),
      Type.Literal("above-range"),
      Type.Literal("not-gated"),
    ]),
    proofStatus: Type.Literal("warning-only"),
    runtimeIdStatus: Type.Literal("unverified"),
    earthlikePredicate: Type.String(),
    conditionMultipliers: Type.Array(Type.String()),
    proxyRequirements: Type.Array(Type.String()),
    signalFields: Type.Array(Type.String()),
    blockers: Type.Array(Type.String()),
    caveats: Type.Array(Type.String()),
  },
  { additionalProperties: false }
);

const PlanAquaticResourcesContract = defineOp({
  kind: "plan",
  id: "resources/plan-aquatic-resources",
  input: Type.Object(
    {
      width: Type.Integer({ minimum: 1 }),
      height: Type.Integer({ minimum: 1 }),
      expectations: Type.Array(AquaticExpectationSchema),
      coastalWaterMask: Type.Optional(
        TypedArraySchemas.u8({ description: "Coastal water eligibility mask." })
      ),
      shelfMask: Type.Optional(
        TypedArraySchemas.u8({ description: "Continental shelf or shallow shelf mask." })
      ),
      warmShallowWaterMask: Type.Optional(
        TypedArraySchemas.u8({ description: "Warm shallow water or tropical shelf mask." })
      ),
      coldProductiveWaterMask: Type.Optional(
        TypedArraySchemas.u8({ description: "Cold or temperate productive shelf/upwelling mask." })
      ),
      reefOrProtectedShallowsMask: Type.Optional(
        TypedArraySchemas.u8({ description: "Reef, lagoon, bay, or protected shallows mask." })
      ),
      estuaryMask: Type.Optional(
        TypedArraySchemas.u8({ description: "Estuary, delta, brackish bay, or river-mouth mask." })
      ),
      navigableRiverMouthMask: Type.Optional(
        TypedArraySchemas.u8({ description: "Navigable-river mouth or floodplain proxy mask." })
      ),
      lakeMask: Type.Optional(
        TypedArraySchemas.u8({ description: "Lake mask to suppress marine resources." })
      ),
      iceMask: Type.Optional(
        TypedArraySchemas.u8({ description: "Ice-covered water mask to suppress warm/coastal resources." })
      ),
    },
    { additionalProperties: false }
  ),
  output: Type.Object(
    {
      groupId: Type.Literal("aquatic-coastal-navigable-river"),
      runtimeIdStatus: Type.Literal("unverified"),
      proofStatus: Type.Literal("warning-only"),
      plans: Type.Array(AquaticPlanRowSchema),
      missingResourceTypes: Type.Array(AquaticResourceTypeSchema),
    },
    { additionalProperties: false }
  ),
  strategies: {
    default: Type.Object({}, { additionalProperties: false }),
  },
});

export default PlanAquaticResourcesContract;
