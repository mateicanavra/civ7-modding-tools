import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";
export default defineStrategy({
  id: "body-aware",
  config: Type.Object(
    {
      highOrderConfluenceUpstreamAreaMin: Type.Integer({
        minimum: 0,
        maximum: 2147483647,
        default: 64,
        description:
          "Contributing-area gate for equal-order confluences above order two, including whole mixed bodies.",
      }),
    },
    {
      additionalProperties: false,
      description: "Classifies river topology using contracted lake bodies and contributing-area confluence rules.",
    }
  ),
});
