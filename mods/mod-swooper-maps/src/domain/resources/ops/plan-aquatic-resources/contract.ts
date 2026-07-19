import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { ResourceExpectedCountRangeSchema } from "../../model/schemas/expected-count-range.schema.js";
import { ResourceSymbolSchema } from "../../model/schemas/resource-family.schema.js";

const AquaticExpectationSchema = Type.Object(
  {
    resourceType: ResourceSymbolSchema,
    groupId: Type.Literal("aquatic-coastal-navigable-river"),
    status: Type.Union([
      Type.Literal("expected"),
      Type.Literal("conditional"),
      Type.Literal("blocked"),
    ]),
    earthlikePredicate: Type.String(),
    expectedCountRange: ResourceExpectedCountRangeSchema,
    conditionMultipliers: Type.Array(Type.String()),
    signalRequirements: Type.Array(Type.String()),
    caveats: Type.Array(Type.String()),
  },
  {
    additionalProperties: false,
    description:
      "Aquatic rows projected from artifact:resources.earthlikeExpectations. The op consumes only the family-owned symbolic expectation fields.",
  }
);

const AquaticPlanRowSchema = Type.Object(
  {
    resourceType: ResourceSymbolSchema,
    status: Type.Union([
      Type.Literal("planned"),
      Type.Literal("blocked"),
      Type.Literal("missing-expectation"),
      Type.Literal("missing-signal"),
    ]),
    eligibilityStatus: Type.Union([
      Type.Literal("observed"),
      Type.Literal("missing-signal"),
      Type.Literal("missing-expectation"),
      Type.Literal("blocked"),
    ]),
    expectedCountRange: ResourceExpectedCountRangeSchema,
    targetIntentCount: Type.Integer({ minimum: 0 }),
    eligibleTileCount: Type.Integer({ minimum: 0 }),
    rangeStatus: Type.Union([
      Type.Literal("within-range"),
      Type.Literal("below-range"),
      Type.Literal("above-range"),
      Type.Literal("not-gated"),
    ]),
    proofStatus: Type.Literal("warning-only"),
    earthlikePredicate: Type.String(),
    conditionMultipliers: Type.Array(Type.String()),
    signalRequirements: Type.Array(Type.String()),
    signalFields: Type.Array(Type.String()),
    blockers: Type.Array(Type.String()),
    caveats: Type.Array(Type.String()),
  },
  { additionalProperties: false }
);

/**
 * Admits warning-only aquatic demand planning from earthlike expectation rows and named
 * water-habitat signals. It reports target counts, eligibility, missing evidence, and blockers
 * but selects no concrete sites.
 */
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
        TypedArraySchemas.u8({ description: "Navigable-river mouth or floodplain signal mask." })
      ),
      lakeMask: Type.Optional(
        TypedArraySchemas.u8({ description: "Lake mask to suppress marine resources." })
      ),
      iceMask: Type.Optional(
        TypedArraySchemas.u8({
          description: "Ice-covered water mask to suppress warm/coastal resources.",
        })
      ),
    },
    { additionalProperties: false }
  ),
  output: Type.Object(
    {
      groupId: Type.Literal("aquatic-coastal-navigable-river"),
      proofStatus: Type.Literal("warning-only"),
      plans: Type.Array(AquaticPlanRowSchema),
      missingResourceTypes: Type.Array(ResourceSymbolSchema),
    },
    { additionalProperties: false }
  ),
  defaultStrategy: "default",
  strategies: {
    default: Type.Object({}, { additionalProperties: false }),
  },
});

export default PlanAquaticResourcesContract;
