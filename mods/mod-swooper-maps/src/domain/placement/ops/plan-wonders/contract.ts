import { Type, defineOp } from "@swooper/mapgen-core/authoring";

const MapInfoSchema = Type.Object(
  {
    NumNaturalWonders: Type.Optional(Type.Number()),
  },
  { additionalProperties: true }
);

const PlanWondersContract = defineOp({
  kind: "plan",
  id: "placement/plan-wonders",
  input: Type.Object({
    mapInfo: MapInfoSchema,
  }),
  output: Type.Object({
    wondersCount: Type.Integer({ minimum: 0 }),
  }),
  strategies: {
    default: Type.Object({}),
  },
});

export default PlanWondersContract;
