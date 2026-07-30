import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Semantic identity and authored controls for potential-gradient mantle forcing.
 * Forcing input and output remain owned by the shared operation contract.
 */
export default defineStrategy({
  id: "potential-gradient",
  config: Type.Object(
    {
      velocityScale: Type.Number({
        default: 1,
        minimum: 0,
        maximum: 5,
        description:
          "Controls the velocity strength applied to mantle-gradient forcing before plate motion fitting.",
      }),
      rotationScale: Type.Number({
        default: 0.2,
        minimum: 0,
        maximum: 2,
        description:
          "Controls the rotational shear component mixed into the mantle forcing velocity field.",
      }),
      stressNorm: Type.Number({
        default: 1,
        minimum: 1e-3,
        maximum: 10,
        description:
          "Sets the normalization factor for stress proxy values consumed by crust and tectonics.",
      }),
      curvatureWeight: Type.Number({
        default: 0.35,
        minimum: 0,
        maximum: 2,
        description: "Controls how strongly potential curvature contributes to mantle stress.",
      }),
      upwellingThreshold: Type.Number({
        default: 0.35,
        minimum: 0,
        maximum: 1,
        description:
          "Sets the normalized local-maximum threshold used to classify upwelling cells.",
      }),
      downwellingThreshold: Type.Number({
        default: 0.35,
        minimum: 0,
        maximum: 1,
        description:
          "Sets the normalized local-minimum threshold used to classify downwelling cells.",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Gradient, rotation, stress, and extrema controls for deriving mantle forcing from potential.",
    }
  ),
});
