import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

const CultivatedResourceTypeSchema = Type.Union([
  Type.Literal("RESOURCE_COTTON"),
  Type.Literal("RESOURCE_DATES"),
  Type.Literal("RESOURCE_DYES"),
  Type.Literal("RESOURCE_INCENSE"),
  Type.Literal("RESOURCE_SILK"),
  Type.Literal("RESOURCE_WINE"),
  Type.Literal("RESOURCE_COCOA"),
  Type.Literal("RESOURCE_SPICES"),
  Type.Literal("RESOURCE_SUGAR"),
  Type.Literal("RESOURCE_TEA"),
  Type.Literal("RESOURCE_COFFEE"),
  Type.Literal("RESOURCE_TOBACCO"),
  Type.Literal("RESOURCE_CITRUS"),
  Type.Literal("RESOURCE_QUININE"),
  Type.Literal("RESOURCE_MANGOS"),
  Type.Literal("RESOURCE_RICE"),
  Type.Literal("RESOURCE_CLOVES"),
  Type.Literal("RESOURCE_FLAX"),
]);

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

const CultivatedExpectationSchema = Type.Object(
  {
    resourceType: CultivatedResourceTypeSchema,
    groupId: Type.Literal("cultivated-plantation-medicinal"),
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
      "Cultivated rows projected from artifact:resources.earthlikeExpectations. Extra source fields may travel with the row, but the op only consumes symbolic expectations.",
  }
);

const CultivatedPlanRowSchema = Type.Object(
  {
    resourceType: CultivatedResourceTypeSchema,
    laneId: CultivatedLaneIdSchema,
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
        TypedArraySchemas.u8({ description: "Floodplain, river, delta, or irrigation proxy mask." })
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
          description: "Highland, hill, relief, or montane plantation proxy mask.",
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
      runtimeIdStatus: Type.Literal("unverified"),
      proofStatus: Type.Literal("warning-only"),
      plans: Type.Array(CultivatedPlanRowSchema),
      missingResourceTypes: Type.Array(CultivatedResourceTypeSchema),
    },
    { additionalProperties: false }
  ),
  strategies: {
    default: Type.Object({}, { additionalProperties: false }),
  },
});

export default PlanCultivatedResourcesContract;
