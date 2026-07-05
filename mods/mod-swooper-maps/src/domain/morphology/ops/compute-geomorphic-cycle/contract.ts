import {
  defineOp,
  type Static,
  Type,
  TypedArraySchemas,
} from "@swooper/mapgen-core/authoring/contracts";

/**
 * Geomorphic cycle controls (fluvial incision + diffusion + deposition).
 */
export const GeomorphologyConfigSchema = Type.Object(
  {
    fluvial: Type.Object(
      {
        rate: Type.Number({
          description: "Controls fluvial terrain incision rate (0..1).",
          default: 0.15,
          minimum: 0,
          maximum: 1,
        }),
        m: Type.Number({
          description: "Controls stream power exponent for the discharge proxy in terrain erosion.",
          default: 0.5,
          minimum: 0,
          maximum: 4,
        }),
        n: Type.Number({
          description: "Controls stream power exponent for the slope proxy in terrain erosion.",
          default: 1.0,
          minimum: 0,
          maximum: 4,
        }),
      },
      {
        additionalProperties: false,
        description: "Controls fluvial incision used by terrain erosion.",
      }
    ),
    diffusion: Type.Object(
      {
        rate: Type.Number({
          description: "Controls hillslope terrain diffusion rate (0..1).",
          default: 0.2,
          minimum: 0,
          maximum: 1,
        }),
        talus: Type.Optional(
          Type.Number({
            description:
              "Controls optional talus threshold for terrain diffusion in normalized units.",
            default: 0.5,
            minimum: 0,
            maximum: 10,
          })
        ),
      },
      {
        additionalProperties: false,
        description: "Controls hillslope diffusion used by terrain erosion.",
      }
    ),
    deposition: Type.Object(
      {
        rate: Type.Number({
          description: "Controls sediment settling/transport rate for terrain deposition (0..1).",
          default: 0.1,
          minimum: 0,
          maximum: 1,
        }),
      },
      {
        additionalProperties: false,
        description: "Controls terrain deposition during the geomorphic cycle.",
      }
    ),
    eras: Type.Union([Type.Literal(1), Type.Literal(2), Type.Literal(3)], {
      description: "Controls number of geomorphic terrain eras to apply.",
      default: 2,
    }),
  },
  {
    additionalProperties: false,
    description: "Controls terrain incision, diffusion, deposition, and geomorphic era count.",
  }
);

export const WorldAgeSchema = Type.Union(
  [Type.Literal("young"), Type.Literal("mature"), Type.Literal("old")],
  {
    description: "Controls world age posture used to scale geomorphic terrain intensity.",
    default: "mature",
  }
);

export const GeomorphicCycleConfigSchema = Type.Object(
  {
    geomorphology: GeomorphologyConfigSchema,
    worldAge: WorldAgeSchema,
  },
  {
    additionalProperties: false,
    description: "Geomorphic cycle controls for terrain relaxation by world age.",
  }
);

export type GeomorphologyConfig = Static<typeof GeomorphologyConfigSchema>;

export type WorldAge = Static<typeof WorldAgeSchema>;

/**
 * Computes elevation and sediment deltas for a geomorphic relaxation pass.
 */
const ComputeGeomorphicCycleContract = defineOp({
  kind: "compute",
  id: "morphology/compute-geomorphic-cycle",
  input: Type.Object({
    width: Type.Integer({ minimum: 1, description: "Map width in tiles." }),
    height: Type.Integer({ minimum: 1, description: "Map height in tiles." }),
    elevation: TypedArraySchemas.i16({ description: "Elevation per tile (normalized units)." }),
    landMask: TypedArraySchemas.u8({ description: "Land mask per tile (1=land, 0=water)." }),
    flowDir: TypedArraySchemas.i32({ description: "Flow receiver index per tile (-1 for sinks)." }),
    flowAccum: TypedArraySchemas.f32({ description: "Flow accumulation per tile." }),
    erodibilityK: TypedArraySchemas.f32({ description: "Erodibility proxy per tile." }),
    sedimentDepth: TypedArraySchemas.f32({ description: "Sediment depth proxy per tile." }),
  }),
  output: Type.Object({
    elevationDelta: TypedArraySchemas.f32({
      description: "Elevation delta per tile to apply for geomorphic relaxation.",
    }),
    sedimentDelta: TypedArraySchemas.f32({
      description: "Sediment depth delta per tile to apply for geomorphic relaxation.",
    }),
  }),
  strategies: {
    default: GeomorphicCycleConfigSchema,
  },
});

export default ComputeGeomorphicCycleContract;
