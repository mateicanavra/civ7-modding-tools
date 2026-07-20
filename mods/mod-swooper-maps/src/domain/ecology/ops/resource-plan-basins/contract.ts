import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

/** Shared authored resource-family controls used by each basin-planning strategy. */
const ResourceBasinPlanConfigSchema = Type.Object(
  {
    resources: Type.Array(
      Type.Object(
        {
          id: Type.String({ description: "Resource identifier to plan into ecological basins." }),
          target: Type.Integer({
            minimum: 1,
            maximum: 1_000,
            default: 6,
            description: "Target number of basins for this resource.",
          }),
          fertilityBias: Type.Number({
            minimum: 0,
            maximum: 2,
            default: 1,
            description: "Scales the influence of soil fertility on basin suitability.",
          }),
          moistureBias: Type.Number({
            minimum: 0,
            maximum: 2,
            default: 1,
            description: "Scales the influence of moisture on basin suitability.",
          }),
          spacing: Type.Integer({
            minimum: 1,
            maximum: 512,
            default: 4,
            description: "Minimum tile spacing between basins for this resource.",
          }),
        },
        { description: "Planning controls for one resource basin family." }
      ),
      {
        default: [],
        description: "Resource basin families to plan from ecological suitability.",
      }
    ),
  },
  { description: "Controls resource-basin targets, biases, and spacing." }
);

/** Contract for grouping admitted ecological suitability into per-resource basin plans. */
const ResourcePlanBasinsContract = defineOp({
  kind: "plan",
  id: "ecology/resources/plan-basins",
  input: Type.Object({
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    landMask: TypedArraySchemas.u8({ description: "Land mask (1 = land, 0 = water)." }),
    fertility: TypedArraySchemas.f32({ description: "Fertility field (0..1)." }),
    soilType: TypedArraySchemas.u8({ description: "Soil palette indices." }),
    rainfall: TypedArraySchemas.u8({ description: "Rainfall per tile (0..255)." }),
    humidity: TypedArraySchemas.u8({ description: "Humidity per tile (0..255)." }),
  }),
  output: Type.Object({
    basins: Type.Array(
      Type.Object({
        resourceId: Type.String(),
        plots: Type.Array(Type.Integer({ minimum: 0 })),
        intensity: Type.Array(Type.Number({ minimum: 0, maximum: 1 })),
        confidence: Type.Number({ minimum: 0, maximum: 1 }),
      })
    ),
  }),
  defaultStrategy: "balanced",
  strategies: {
    balanced: ResourceBasinPlanConfigSchema,
    "hydro-fluvial": ResourceBasinPlanConfigSchema,
    mixed: ResourceBasinPlanConfigSchema,
  },
});

export default ResourcePlanBasinsContract;
