import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

const GeomorphologyConfigSchema = Type.Object(
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

const WorldAgeSchema = Type.Union(
  [Type.Literal("young"), Type.Literal("mature"), Type.Literal("old")],
  {
    description: "Controls world age posture used to scale geomorphic terrain intensity.",
    default: "mature",
  }
);

/**
 * Controls the coupled incision, hillslope diffusion, and sediment transport applied per era.
 * World age scales every process rate and additional eras compound their effects, while the
 * implementation preserves the admitted land/water identity across the evolved surface.
 */
export default defineStrategy({
  id: "stream-power-diffusion",
  config: Type.Object(
    {
      geomorphology: GeomorphologyConfigSchema,
      worldAge: WorldAgeSchema,
    },
    {
      additionalProperties: false,
      description:
        "Per-era stream-power incision, hillslope diffusion, and sediment transport rates. World age scales all three processes, and the cycle preserves the admitted land/water mask.",
    }
  ),
});
