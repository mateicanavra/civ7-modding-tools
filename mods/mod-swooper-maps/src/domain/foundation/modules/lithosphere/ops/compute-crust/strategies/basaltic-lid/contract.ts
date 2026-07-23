import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Semantic identity and authored controls for basaltic-lid crust initialization.
 * Crust input and output remain owned by the shared operation contract.
 */
export default defineStrategy({
  id: "basaltic-lid",
  config: Type.Object(
    {
      basalticThickness01: Type.Number({
        default: 0.25,
        minimum: 0,
        maximum: 1,
        description:
          "Sets the initial basaltic-lid thickness that drives lithosphere buoyancy and strength.",
      }),
      yieldStrength01: Type.Number({
        default: 0.55,
        minimum: 0,
        maximum: 1,
        description:
          "Controls initial lithosphere yield strength before mantle coupling and rift weakening.",
      }),
      mantleCoupling01: Type.Number({
        default: 0.6,
        minimum: 0,
        maximum: 1,
        description: "Controls how strongly mantle forcing scales initial lithosphere strength.",
      }),
      riftWeakening01: Type.Number({
        default: 0.35,
        minimum: 0,
        maximum: 1,
        description:
          "Controls how strongly divergent mantle forcing seeds damage in the initial crust.",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Initial basaltic-lid thickness, strength, mantle coupling, and rift-damage controls.",
    }
  ),
});
