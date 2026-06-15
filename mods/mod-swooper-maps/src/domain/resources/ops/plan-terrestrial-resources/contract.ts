import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

const TerrestrialResourceTypeSchema = Type.Union([
  Type.Literal("RESOURCE_CAMELS"),
  Type.Literal("RESOURCE_HIDES"),
  Type.Literal("RESOURCE_HORSES"),
  Type.Literal("RESOURCE_WOOL"),
  Type.Literal("RESOURCE_IVORY"),
  Type.Literal("RESOURCE_FURS"),
  Type.Literal("RESOURCE_TRUFFLES"),
  Type.Literal("RESOURCE_RUBBER"),
  Type.Literal("RESOURCE_HARDWOOD"),
  Type.Literal("RESOURCE_WILD_GAME"),
  Type.Literal("RESOURCE_LLAMAS"),
]);

const TerrestrialLaneIdSchema = Type.Union([
  Type.Literal("arid-rangeland"),
  Type.Literal("open-grazing"),
  Type.Literal("highland-pastoral"),
  Type.Literal("savanna-megafauna"),
  Type.Literal("cold-boreal-furs"),
  Type.Literal("woodland-host"),
  Type.Literal("tropical-forest-product"),
  Type.Literal("diverse-wild-habitat"),
  Type.Literal("tropical-highland-pastoral"),
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

const TerrestrialExpectationSchema = Type.Object(
  {
    resourceType: TerrestrialResourceTypeSchema,
    groupId: Type.Literal("terrestrial-animal-forest-wild"),
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
      "Terrestrial rows projected from artifact:resources.earthlikeExpectations. Extra source fields may travel with the row, but the op only consumes symbolic expectations.",
  }
);

const TerrestrialPlanRowSchema = Type.Object(
  {
    resourceType: TerrestrialResourceTypeSchema,
    laneId: TerrestrialLaneIdSchema,
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

const PlanTerrestrialResourcesContract = defineOp({
  kind: "plan",
  id: "resources/plan-terrestrial-resources",
  input: Type.Object(
    {
      width: Type.Integer({ minimum: 1 }),
      height: Type.Integer({ minimum: 1 }),
      expectations: Type.Array(TerrestrialExpectationSchema),
      aridRangelandMask: Type.Optional(
        TypedArraySchemas.u8({
          description: "Arid plains, desert rangeland, or dryland corridor mask.",
        })
      ),
      openGrassPlainsMask: Type.Optional(
        TypedArraySchemas.u8({
          description: "Open grassland, plains, steppe, or low-tree-cover mask.",
        })
      ),
      tundraColdEdgeMask: Type.Optional(
        TypedArraySchemas.u8({ description: "Tundra, cold edge, or cold open habitat mask." })
      ),
      hillHighlandMask: Type.Optional(
        TypedArraySchemas.u8({ description: "Hill, highland, or pastoral relief mask." })
      ),
      savannaWateringHoleMask: Type.Optional(
        TypedArraySchemas.u8({
          description: "Savanna, wooded savanna, watering-hole, or desert-edge mask.",
        })
      ),
      tropicalForestEdgeMask: Type.Optional(
        TypedArraySchemas.u8({
          description: "Tropical forest-edge or wooded savanna megafauna proxy mask.",
        })
      ),
      taigaBorealForestMask: Type.Optional(
        TypedArraySchemas.u8({
          description: "Taiga, tundra-bog, boreal forest, or cold woodland mask.",
        })
      ),
      moistWoodlandEdgeMask: Type.Optional(
        TypedArraySchemas.u8({ description: "Moist woodland edge or host-tree proxy mask." })
      ),
      tropicalForestMask: Type.Optional(
        TypedArraySchemas.u8({
          description: "Humid tropical forest, rainforest, mangrove, or hardwood mask.",
        })
      ),
      diverseWildHabitatMask: Type.Optional(
        TypedArraySchemas.u8({
          description:
            "Mixed natural habitat, marsh edge, forest/grass mosaic, or low-cultivation mask.",
        })
      ),
      tropicalHighlandMask: Type.Optional(
        TypedArraySchemas.u8({ description: "Tropical hill/highland pastoral candidate mask." })
      ),
      coldMask: Type.Optional(
        TypedArraySchemas.u8({
          description: "Cold suppression mask where the resource is frost-limited.",
        })
      ),
      aridWithoutWaterMask: Type.Optional(
        TypedArraySchemas.u8({ description: "Arid-without-water suppression mask." })
      ),
      denseForestMask: Type.Optional(
        TypedArraySchemas.u8({
          description: "Dense forest suppression mask for open-grazing resources.",
        })
      ),
      cultivatedPressureMask: Type.Optional(
        TypedArraySchemas.u8({
          description: "Cultivation or monoculture pressure suppression mask.",
        })
      ),
    },
    { additionalProperties: false }
  ),
  output: Type.Object(
    {
      groupId: Type.Literal("terrestrial-animal-forest-wild"),
      runtimeIdStatus: Type.Literal("unverified"),
      proofStatus: Type.Literal("warning-only"),
      plans: Type.Array(TerrestrialPlanRowSchema),
      missingResourceTypes: Type.Array(TerrestrialResourceTypeSchema),
    },
    { additionalProperties: false }
  ),
  strategies: {
    default: Type.Object({}, { additionalProperties: false }),
  },
});

export default PlanTerrestrialResourcesContract;
