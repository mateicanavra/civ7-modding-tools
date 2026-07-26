import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/** Declares authored configuration for the `tectonic-potential` implementation of `morphology/compute-landmask`. */
export default defineStrategy({
  id: "tectonic-potential",
  config: Type.Object(
    {
      continentPotentialGrain: Type.Integer({
        default: 4,
        minimum: 1,
        maximum: 64,
        description:
          "Controls coarse grain (hex bin size) used to low-pass map continent potential before thresholding.",
      }),
      continentPotentialBlurSteps: Type.Integer({
        default: 4,
        minimum: 0,
        maximum: 16,
        description:
          "Controls hex-neighborhood blur passes applied after coarse-grain continent averaging.",
      }),
      keepLandComponentFraction: Type.Number({
        default: 0.985,
        minimum: 0.5,
        maximum: 1,
        description:
          "Controls fraction of land tiles to keep by retaining the largest connected map components.",
      }),
      cratonStepsPerEra: Type.Integer({
        default: 2,
        minimum: 0,
        maximum: 8,
        description:
          "Controls craton-growth simulation steps per tectonic era (0 disables rift-driven growth).",
      }),
      cratonNucleationScale: Type.Number({
        default: 0.9,
        minimum: 0,
        maximum: 3,
        description:
          "Controls rift/fracture-driven craton nucleation rate for map continent stability.",
      }),
      cratonDiffusion: Type.Number({
        default: 0.25,
        minimum: 0,
        maximum: 1,
        description:
          "Controls per-step craton mass diffusion that merges/advects continent seeds over time.",
      }),
      cratonAdvection: Type.Number({
        default: 0.15,
        minimum: 0,
        maximum: 1,
        description:
          "Per-step advection rate moving craton mass along plate movement vectors (approximates drift).",
      }),
      cratonHalfSaturation: Type.Number({
        default: 0.35,
        minimum: 0.01,
        maximum: 10,
        description:
          "Controls half-saturation used to normalize craton mass into 0..1 without hard clamping.",
      }),
      cratonPotentialWeight: Type.Number({
        default: 0.12,
        minimum: 0,
        maximum: 1,
        description:
          "Controls weight of rift/fracture-driven craton mass in the final continent potential.",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Continent-potential scale, smoothing, connectivity, and craton-memory controls used to derive land from crust truth and provenance stability.",
    }
  ),
});
