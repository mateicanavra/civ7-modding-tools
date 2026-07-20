import { defineOp, Type } from "@swooper/mapgen-core/authoring/contracts";

const MapInfoSchema = Type.Object(
  {
    NumNaturalWonders: Type.Optional(Type.Number()),
  },
  { additionalProperties: true }
);

/**
 * Defines the boundary for deriving a natural-wonder target from Civ7 map-size metadata. The
 * default strategy owns numeric normalization; candidate choice and realized stamps remain later
 * responsibilities.
 */
const PlanWondersContract = defineOp({
  kind: "plan",
  id: "placement/plan-wonders",
  input: Type.Object({
    mapInfo: MapInfoSchema,
  }),
  output: Type.Object(
    {
      wondersCount: Type.Integer({ minimum: 0 }),
    },
    {
      description:
        "Nonnegative natural-wonder target from Civ7 map-size metadata; candidate planning consumes this count, while later stamping reports the realized placements.",
    }
  ),
  strategies: {
    default: Type.Object({}),
  },
});

export default PlanWondersContract;
