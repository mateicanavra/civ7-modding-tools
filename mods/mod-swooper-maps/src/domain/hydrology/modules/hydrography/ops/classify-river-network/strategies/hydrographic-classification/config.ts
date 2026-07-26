import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Exposes only the contributing-area gate for high-order confluences; the default of 64 suppresses
 * spurious order-three promotion on small networks. All other river classification thresholds
 * remain stable Hydrology policy.
 */
export default defineStrategy({
  id: "hydrographic-classification",
  config: Type.Object(
    {
      highOrderConfluenceUpstreamAreaMin: Type.Integer({
        minimum: 0,
        default: 64,
        description:
          "Minimum receiver upstream-area required before a >=2-tributary confluence may escalate stream-order proxy beyond order 2. Headwater (order 1->2) confluences ignore this floor; it suppresses spurious order-3 promotions on small networks where tiny equal-order branches merge.",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Hydrographic classification controls for deriving river hierarchy from confluences and contributing area.",
    }
  ),
});
