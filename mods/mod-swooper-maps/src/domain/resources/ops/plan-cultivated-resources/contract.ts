import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { ResourceExpectedCountRangeSchema } from "../../model/schemas/expected-count-range.schema.js";
import { ResourceSymbolSchema } from "../../model/schemas/resource-family.schema.js";

const CultivatedLaneIdSchema = Type.Union([
  Type.Literal("alluvial-irrigated"),
  Type.Literal("arid-oasis-resin"),
  Type.Literal("marine-dye"),
  Type.Literal("temperate-field-orchard"),
  Type.Literal("humid-tropical-plantation"),
  Type.Literal("highland-medicinal"),
  Type.Literal("wetland-paddy"),
  Type.Literal("blocked-no-valid-biome"),
]);

const CultivatedExpectationSchema = Type.Object(
  {
    resourceType: ResourceSymbolSchema,
    groupId: Type.Literal("cultivated-plantation-medicinal"),
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
      "Cultivated rows projected from artifact:resources.earthlikeExpectations. The op consumes only the family-owned symbolic expectation fields.",
  }
);

const CultivatedPlanRowSchema = Type.Object(
  {
    resourceType: ResourceSymbolSchema,
    laneId: CultivatedLaneIdSchema,
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
 * Admits warning-only cultivated demand planning from earthlike expectations and named
 * agriculture/habitat signals. It assigns family-owned lanes and reports evidence gaps without
 * selecting concrete sites.
 */
const PlanCultivatedResourcesContract = defineOp({
  kind: "plan",
  id: "resources/plan-cultivated-resources",
  input: Type.Object(
    {
      width: Type.Integer({ minimum: 1 }),
      height: Type.Integer({ minimum: 1 }),
      expectations: Type.Array(CultivatedExpectationSchema),
      warmAlluvialMask: Type.Optional(
        TypedArraySchemas.u8({ description: "Warm alluvial, irrigated, or fertile lowland mask." })
      ),
      floodplainOrRiverMask: Type.Optional(
        TypedArraySchemas.u8({
          description: "Floodplain, river, delta, or irrigation signal mask.",
        })
      ),
      warmGrassPlainsMask: Type.Optional(
        TypedArraySchemas.u8({ description: "Warm grassland or plains crop suitability mask." })
      ),
      oasisOrDesertWaterMask: Type.Optional(
        TypedArraySchemas.u8({ description: "Oasis, groundwater, or desert water-source mask." })
      ),
      aridDryWoodlandMask: Type.Optional(
        TypedArraySchemas.u8({
          description: "Arid woodland, desert edge, or dry resin habitat mask.",
        })
      ),
      coastalMarineMask: Type.Optional(
        TypedArraySchemas.u8({
          description: "Warm coast, island, or marine biological dye lane mask.",
        })
      ),
      humidTropicalForestMask: Type.Optional(
        TypedArraySchemas.u8({
          description: "Humid tropical forest, rainforest, or shaded plantation mask.",
        })
      ),
      wetTropicsMask: Type.Optional(
        TypedArraySchemas.u8({ description: "Wet tropical or monsoonal crop belt mask." })
      ),
      highlandOrReliefMask: Type.Optional(
        TypedArraySchemas.u8({
          description: "Highland, hill, relief, or montane plantation signal mask.",
        })
      ),
      temperateDryPlainsMask: Type.Optional(
        TypedArraySchemas.u8({ description: "Temperate or subtropical dry plains crop mask." })
      ),
      savannaForestMask: Type.Optional(
        TypedArraySchemas.u8({ description: "Savanna, forest, or warm drained tobacco-like mask." })
      ),
      tropicalFruitMask: Type.Optional(
        TypedArraySchemas.u8({ description: "Tropical or subtropical frost-free fruit belt mask." })
      ),
      wetlandPaddyMask: Type.Optional(
        TypedArraySchemas.u8({
          description: "Wetland, marsh, mangrove, paddy, or monsoon lowland mask.",
        })
      ),
      coolTemperatePlainsMask: Type.Optional(
        TypedArraySchemas.u8({
          description: "Cool-temperate or mild subtropical well-drained plains mask.",
        })
      ),
      coldMask: Type.Optional(
        TypedArraySchemas.u8({ description: "Cold or frost-limited suppression mask." })
      ),
      aridWithoutWaterMask: Type.Optional(
        TypedArraySchemas.u8({ description: "Arid-without-water suppression mask." })
      ),
      waterloggedMask: Type.Optional(
        TypedArraySchemas.u8({ description: "Waterlogged or excessive-rain suppression mask." })
      ),
    },
    { additionalProperties: false }
  ),
  output: Type.Object(
    {
      groupId: Type.Literal("cultivated-plantation-medicinal"),
      proofStatus: Type.Literal("warning-only"),
      plans: Type.Array(CultivatedPlanRowSchema),
      missingResourceTypes: Type.Array(ResourceSymbolSchema),
    },
    { additionalProperties: false }
  ),
  strategies: {
    default: Type.Object({}, { additionalProperties: false }),
  },
});

export default PlanCultivatedResourcesContract;
