import { Type, type Static } from "@swooper/mapgen-core/authoring";

/**
 * Geomorphic cycle controls (fluvial incision + diffusion + deposition).
 */
export const GeomorphologyConfigSchema = Type.Object({
  fluvial: Type.Object({
    rate: Type.Number({
      description: "Fluvial incision rate (0..1).",
      default: 0.15,
      minimum: 0,
      maximum: 1,
    }),
    m: Type.Number({
      description: "Stream power exponent m for discharge proxy (flowAccum normalized by max).",
      default: 0.5,
    }),
    n: Type.Number({
      description: "Stream power exponent n for slope proxy (drop-to-receiver normalized by max).",
      default: 1.0,
    }),
  }),
  diffusion: Type.Object({
    rate: Type.Number({
      description: "Hillslope diffusion rate (0..1).",
      default: 0.2,
      minimum: 0,
      maximum: 1,
    }),
    talus: Type.Optional(
      Type.Number({
        description: "Optional talus threshold (normalized units).",
        default: 0.5,
        minimum: 0,
      })
    ),
  }),
  deposition: Type.Object({
    rate: Type.Number({
      description:
        "Sediment settling/transport rate (0..1). Deposits where stream power is low and transports where stream power is high.",
      default: 0.1,
      minimum: 0,
      maximum: 1,
    }),
  }),
  eras: Type.Union([Type.Literal(1), Type.Literal(2), Type.Literal(3)], {
    description: "Number of geomorphic eras to apply.",
    default: 2,
  }),
});

export const WorldAgeSchema = Type.Union(
  [Type.Literal("young"), Type.Literal("mature"), Type.Literal("old")],
  {
    description: "World age posture used to scale geomorphic intensity.",
    default: "mature",
  }
);

export const GeomorphicCycleConfigSchema = Type.Object(
  {
    geomorphology: GeomorphologyConfigSchema,
    worldAge: WorldAgeSchema,
  },
  {
    description: "Geomorphic relaxation configuration by world age.",
  }
);

export type GeomorphologyConfig = Static<typeof GeomorphologyConfigSchema>;

export type WorldAge = Static<typeof WorldAgeSchema>;
