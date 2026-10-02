import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/** Controls initial hillslope smoothing without channel or sediment processes. */
export default defineStrategy({
  id: "hillslope-diffusion",
  config: Type.Object(
    {
      geomorphology: Type.Object(
        {
          diffusion: Type.Object(
            {
              rate: Type.Number({
                description: "Controls hillslope terrain diffusion rate (0..1).",
                default: 0.2,
                minimum: 0,
                maximum: 1,
              }),
            },
            { additionalProperties: false, description: "Initial hillslope diffusion strength." }
          ),
          eras: Type.Union([Type.Literal(1), Type.Literal(2), Type.Literal(3)], {
            default: 2,
            description:
              "Number of initial hillslope diffusion passes, not physical geological time.",
          }),
        },
        {
          additionalProperties: false,
          description: "Initial hillslope shaping without channel erosion.",
        }
      ),
      worldAge: Type.Union([Type.Literal("young"), Type.Literal("mature"), Type.Literal("old")], {
        default: "mature",
        description: "World age posture scaling hillslope diffusion intensity.",
      }),
    },
    {
      additionalProperties: false,
      description: "Hillslope diffusion and authored world-age intensity.",
    }
  ),
});
