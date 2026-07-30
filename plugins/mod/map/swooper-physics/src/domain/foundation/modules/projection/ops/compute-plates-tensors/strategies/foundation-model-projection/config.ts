import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Semantic identity and authored controls for projecting the Foundation model into tile tensors.
 * Projection input and output remain owned by the shared operation contract.
 */
export default defineStrategy({
  id: "foundation-model-projection",
  config: Type.Object(
    {
      boundaryInfluenceDistance: Type.Integer({
        default: 5,
        minimum: 1,
        maximum: 32,
        description:
          "Sets the tile-distance radius over which projected plate boundaries influence nearby tiles.",
      }),
      boundaryDecay: Type.Number({
        default: 0.55,
        minimum: 0.05,
        maximum: 1,
        description:
          "Sets the exponential decay of projected boundary influence across successive tile rings.",
      }),
      movementScale: Type.Number({
        default: 100,
        minimum: 1,
        maximum: 200,
        description:
          "Scales mesh-space plate velocity into the signed eight-bit tile movement fields.",
      }),
      rotationScale: Type.Number({
        default: 100,
        minimum: 1,
        maximum: 200,
        description:
          "Scales mesh-space plate rotation into the signed eight-bit tile rotation field.",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Boundary influence and motion quantization controls for projecting Foundation evidence into tile space.",
    }
  ),
});
