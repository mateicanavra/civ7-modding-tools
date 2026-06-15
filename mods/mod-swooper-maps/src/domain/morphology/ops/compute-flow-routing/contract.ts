import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

const RoutingConfigSchema = Type.Object(
  {},
  {
    description: "Routing configuration (currently no tunable knobs).",
  }
);

/**
 * Computes Morphology's geomorphic routing proxy from elevation and land mask.
 *
 * This op supports terrain shaping consumers such as erosion and rough-land
 * planning. Hydrology owns canonical drainage routing, discharge, rivers, and
 * lake intent.
 */
const ComputeFlowRoutingContract = defineOp({
  kind: "compute",
  id: "morphology/compute-flow-routing",
  input: Type.Object({
    width: Type.Integer({ minimum: 1, description: "Map width in tiles." }),
    height: Type.Integer({ minimum: 1, description: "Map height in tiles." }),
    elevation: TypedArraySchemas.i16({ description: "Elevation per tile (normalized units)." }),
    landMask: TypedArraySchemas.u8({ description: "Land mask per tile (1=land, 0=water)." }),
  }),
  output: Type.Object({
    flowDir: TypedArraySchemas.i32({
      description: "Steepest-descent receiver index per tile (or -1 for sinks/edges).",
    }),
    flowAccum: TypedArraySchemas.f32({ description: "Drainage area proxy per tile." }),
    basinId: TypedArraySchemas.i32({
      description: "Optional basin identifier per tile (or -1 when unassigned).",
    }),
  }),
  strategies: {
    default: RoutingConfigSchema,
  },
});

export default ComputeFlowRoutingContract;
