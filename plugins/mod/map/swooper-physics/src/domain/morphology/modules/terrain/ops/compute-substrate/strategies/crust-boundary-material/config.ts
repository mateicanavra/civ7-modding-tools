import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Controls the crust-type baselines and tectonic modifiers that produce erodibility and sediment
 * evidence for the downstream geomorphic cycle. Age reduces erodibility but increases sediment;
 * uplift, rifting, and boundary effects are additive, and outputs are nonnegative but not capped at 1.
 */
export default defineStrategy({
  id: "crust-boundary-material",
  config: Type.Object(
    {
      continentalBaseErodibility: Type.Number({
        description:
          "Controls baseline erodibility for continental crust tiles used by terrain incision.",
        default: 0.45,
        minimum: 0,
        maximum: 1,
      }),
      oceanicBaseErodibility: Type.Number({
        description:
          "Controls baseline erodibility for oceanic crust tiles used by terrain incision.",
        default: 0.35,
        minimum: 0,
        maximum: 1,
      }),
      continentalBaseSediment: Type.Number({
        description: "Controls baseline sediment depth proxy for continental crust tiles.",
        default: 0.15,
        minimum: 0,
        maximum: 1,
      }),
      oceanicBaseSediment: Type.Number({
        description: "Controls baseline sediment depth proxy for oceanic crust tiles.",
        default: 0.25,
        minimum: 0,
        maximum: 1,
      }),
      ageErodibilityReduction: Type.Number({
        description:
          "Controls how strongly crust age reduces erodibility in terrain substrates (0..1).",
        default: 0.25,
        minimum: 0,
        maximum: 1,
      }),
      ageSedimentBoost: Type.Number({
        description:
          "Controls how strongly crust age raises sediment depth in terrain substrates (0..1).",
        default: 0.15,
        minimum: 0,
        maximum: 1,
      }),
      upliftErodibilityBoost: Type.Number({
        description: "Controls uplift-driven erodibility boost for rugged terrain substrates.",
        default: 0.3,
        minimum: 0,
        maximum: 4,
      }),
      riftSedimentBoost: Type.Number({
        description: "Controls rift-driven sediment depth boost for terrain substrates.",
        default: 0.2,
        minimum: 0,
        maximum: 4,
      }),
      convergentBoundaryErodibilityBoost: Type.Number({
        description:
          "Controls convergent-boundary erodibility boost from boundary closeness (0..1).",
        default: 0.12,
        minimum: 0,
        maximum: 4,
      }),
      divergentBoundaryErodibilityBoost: Type.Number({
        description:
          "Controls divergent-boundary erodibility boost from boundary closeness (0..1).",
        default: 0.18,
        minimum: 0,
        maximum: 4,
      }),
      transformBoundaryErodibilityBoost: Type.Number({
        description:
          "Controls transform-boundary erodibility boost from boundary closeness (0..1).",
        default: 0.08,
        minimum: 0,
        maximum: 4,
      }),
      convergentBoundarySedimentBoost: Type.Number({
        description: "Controls convergent-boundary sediment boost from boundary closeness (0..1).",
        default: 0.05,
        minimum: 0,
        maximum: 4,
      }),
      divergentBoundarySedimentBoost: Type.Number({
        description: "Controls divergent-boundary sediment boost from boundary closeness (0..1).",
        default: 0.1,
        minimum: 0,
        maximum: 4,
      }),
      transformBoundarySedimentBoost: Type.Number({
        description: "Controls transform-boundary sediment boost from boundary closeness (0..1).",
        default: 0.03,
        minimum: 0,
        maximum: 4,
      }),
    },
    {
      additionalProperties: false,
      description:
        "Crust-type baselines and tectonic-age, uplift, rift, and boundary modifiers used to derive erodibility and sediment fields.",
    }
  ),
});
