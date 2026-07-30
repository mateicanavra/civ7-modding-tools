import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Semantic identity and authored controls for the Poisson source-field mantle model.
 * Potential-field input and output remain owned by the shared operation contract.
 */
export default defineStrategy({
  id: "poisson-source-field",
  config: Type.Object(
    {
      plumeCount: Type.Integer({
        default: 6,
        minimum: 0,
        maximum: 32,
        description: "Upwelling source count placed deterministically across the mantle mesh.",
      }),
      downwellingCount: Type.Integer({
        default: 6,
        minimum: 0,
        maximum: 32,
        description: "Downwelling source count placed deterministically across the mantle mesh.",
      }),
      plumeRadius: Type.Number({
        default: 0.18,
        minimum: 0.05,
        maximum: 1,
        description: "Controls the mesh-distance radius of each upwelling source.",
      }),
      downwellingRadius: Type.Number({
        default: 0.18,
        minimum: 0.05,
        maximum: 1,
        description: "Controls the mesh-distance radius of each downwelling source.",
      }),
      plumeAmplitude: Type.Number({
        default: 1,
        minimum: 0,
        maximum: 10,
        description: "Sets the positive potential amplitude applied by each upwelling source.",
      }),
      downwellingAmplitude: Type.Number({
        default: -1,
        minimum: -10,
        maximum: 0,
        description: "Sets the negative potential amplitude applied by each downwelling source.",
      }),
      smoothingIterations: Type.Integer({
        default: 2,
        minimum: 0,
        maximum: 4,
        description:
          "Controls how many Laplacian smoothing iterations diffuse the generated mantle potential.",
      }),
      smoothingAlpha: Type.Number({
        default: 0.35,
        minimum: 0,
        maximum: 1,
        description: "Sets the diffusion fraction applied during each mantle smoothing pass.",
      }),
      minSeparationScale: Type.Number({
        default: 0.85,
        minimum: 0,
        maximum: 2,
        description:
          "Scales the minimum distance between signed mantle sources relative to their radii.",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Signed mantle source population and diffusion controls for the Poisson source-field strategy.",
    }
  ),
});
