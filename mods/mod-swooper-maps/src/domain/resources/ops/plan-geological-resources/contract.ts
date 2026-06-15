import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

const GeologicalResourceTypeSchema = Type.Union([
  Type.Literal("RESOURCE_GOLD"),
  Type.Literal("RESOURCE_GOLD_DISTANT_LANDS"),
  Type.Literal("RESOURCE_SILVER"),
  Type.Literal("RESOURCE_SILVER_DISTANT_LANDS"),
  Type.Literal("RESOURCE_GYPSUM"),
  Type.Literal("RESOURCE_JADE"),
  Type.Literal("RESOURCE_KAOLIN"),
  Type.Literal("RESOURCE_MARBLE"),
  Type.Literal("RESOURCE_IRON"),
  Type.Literal("RESOURCE_SALT"),
  Type.Literal("RESOURCE_LAPIS_LAZULI"),
  Type.Literal("RESOURCE_NITER"),
  Type.Literal("RESOURCE_COAL"),
  Type.Literal("RESOURCE_NICKEL"),
  Type.Literal("RESOURCE_OIL"),
  Type.Literal("RESOURCE_CLAY"),
  Type.Literal("RESOURCE_LIMESTONE"),
  Type.Literal("RESOURCE_TIN"),
  Type.Literal("RESOURCE_PITCH"),
  Type.Literal("RESOURCE_RUBIES"),
]);

const GeologicalLaneIdSchema = Type.Union([
  Type.Literal("orogenic-hydrothermal"),
  Type.Literal("blocked-derivative"),
  Type.Literal("evaporite-sedimentary"),
  Type.Literal("ultramafic-metamorphic"),
  Type.Literal("weathering-clay"),
  Type.Literal("carbonate-metamorphic"),
  Type.Literal("craton-orogen"),
  Type.Literal("closed-basin-salt"),
  Type.Literal("blocked-no-valid-biome"),
  Type.Literal("arid-nitrate"),
  Type.Literal("sedimentary-fuel"),
  Type.Literal("wet-alluvial-clay"),
  Type.Literal("carbonate-industrial"),
  Type.Literal("granite-orogen-placer"),
  Type.Literal("hydrocarbon-seep"),
  Type.Literal("ruby-metamorphic"),
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

const GeologicalExpectationSchema = Type.Object(
  {
    resourceType: GeologicalResourceTypeSchema,
    groupId: Type.Literal("geological-mineral-gemstone-industrial"),
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
      "Geological rows projected from artifact:resources.earthlikeExpectations. Extra source fields may travel with the row, but the op only consumes symbolic expectations.",
  }
);

const GeologicalPlanRowSchema = Type.Object(
  {
    resourceType: GeologicalResourceTypeSchema,
    laneId: GeologicalLaneIdSchema,
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

const PlanGeologicalResourcesContract = defineOp({
  kind: "plan",
  id: "resources/plan-geological-resources",
  input: Type.Object(
    {
      width: Type.Integer({ minimum: 1 }),
      height: Type.Integer({ minimum: 1 }),
      expectations: Type.Array(GeologicalExpectationSchema),
      orogenyMask: Type.Optional(
        TypedArraySchemas.u8({ description: "Orogenic or hydrothermal belt mask." })
      ),
      alluvialPlacerMask: Type.Optional(
        TypedArraySchemas.u8({ description: "Alluvial placer or mineralized drainage mask." })
      ),
      tundraDesertHillMask: Type.Optional(
        TypedArraySchemas.u8({ description: "Tundra/desert hill exposure mask." })
      ),
      evaporiteBasinMask: Type.Optional(
        TypedArraySchemas.u8({ description: "Evaporite basin, playa, or salt-pan mask." })
      ),
      sedimentaryBasinMask: Type.Optional(
        TypedArraySchemas.u8({ description: "Sedimentary basin mask." })
      ),
      ultramaficMask: Type.Optional(
        TypedArraySchemas.u8({ description: "Ultramafic, serpentinite, or jade-host proxy mask." })
      ),
      weatheringClayFlatMask: Type.Optional(
        TypedArraySchemas.u8({ description: "Weathering, clay-flat, or kaolinized terrain mask." })
      ),
      carbonateBeltMask: Type.Optional(
        TypedArraySchemas.u8({ description: "Carbonate belt, limestone, or marble source mask." })
      ),
      cratonMask: Type.Optional(
        TypedArraySchemas.u8({ description: "Craton, BIF, or stable shield proxy mask." })
      ),
      closedBasinMask: Type.Optional(
        TypedArraySchemas.u8({ description: "Closed basin or arid basin mask." })
      ),
      aridSoilMask: Type.Optional(
        TypedArraySchemas.u8({ description: "Arid soil or nitrate soil proxy mask." })
      ),
      forestWetlandBasinMask: Type.Optional(
        TypedArraySchemas.u8({
          description: "Ancient swamp, forest, wetland, or peat basin proxy mask.",
        })
      ),
      hydrocarbonBasinMask: Type.Optional(
        TypedArraySchemas.u8({
          description: "Hydrocarbon, petroleum system, or tar-sand basin mask.",
        })
      ),
      wetAlluvialMask: Type.Optional(
        TypedArraySchemas.u8({
          description: "Wet alluvial, water-contact, or floodplain sediment mask.",
        })
      ),
      graniteBeltMask: Type.Optional(
        TypedArraySchemas.u8({ description: "Granite, greisen, or cassiterite source mask." })
      ),
      oilAdjacencyMask: Type.Optional(
        TypedArraySchemas.u8({
          description: "Near-oil, bitumen seep, or asphaltum adjacency mask.",
        })
      ),
      metamorphicBeltMask: Type.Optional(
        TypedArraySchemas.u8({ description: "Metamorphic, marble-hosted, or corundum belt mask." })
      ),
      collisionBeltMask: Type.Optional(
        TypedArraySchemas.u8({
          description: "Collision belt or tropical metamorphic gemstone source mask.",
        })
      ),
      flatNonGeologicMask: Type.Optional(
        TypedArraySchemas.u8({ description: "Flat or non-geologic suppression mask." })
      ),
      wetSuppressionMask: Type.Optional(
        TypedArraySchemas.u8({
          description: "Wet-climate suppression mask for evaporite/arid resources.",
        })
      ),
      humidSuppressionMask: Type.Optional(
        TypedArraySchemas.u8({
          description: "Humid suppression mask for salt/niter/arid resources.",
        })
      ),
      offshoreMask: Type.Optional(
        TypedArraySchemas.u8({
          description: "Offshore suppression mask until offshore resources are authorized.",
        })
      ),
      igneousTerrainMask: Type.Optional(
        TypedArraySchemas.u8({
          description: "Igneous terrain suppression mask for carbonate resources.",
        })
      ),
    },
    { additionalProperties: false }
  ),
  output: Type.Object(
    {
      groupId: Type.Literal("geological-mineral-gemstone-industrial"),
      runtimeIdStatus: Type.Literal("unverified"),
      proofStatus: Type.Literal("warning-only"),
      plans: Type.Array(GeologicalPlanRowSchema),
      missingResourceTypes: Type.Array(GeologicalResourceTypeSchema),
    },
    { additionalProperties: false }
  ),
  strategies: {
    default: Type.Object({}, { additionalProperties: false }),
  },
});

export default PlanGeologicalResourcesContract;
