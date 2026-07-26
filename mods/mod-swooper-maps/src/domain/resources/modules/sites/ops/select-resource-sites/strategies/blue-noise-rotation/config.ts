import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";
import { ResourceAffinityRuleSchema } from "../../../../../../model/atoms/resource-affinity-rule.schema.js";

/**
 * Tunes deterministic blue-noise selection while preserving per-type ranges, spacing floors,
 * regional obligations, and the exclusion-versus-affinity distinction.
 */
export default defineStrategy({
  id: "blue-noise-rotation",
  config: Type.Object(
    {
      density: Type.Number({
        minimum: 0.5,
        maximum: 1.5,
        default: 1,
        description:
          "Scales per-type targets toward expectedCountRange max (>1) or min (<1); always clamped to [min,max], so authored ranges hold at every legal value.",
      }),
      sparsity: Type.Number({
        minimum: 0,
        maximum: 1,
        default: 0,
        description:
          "Pulls per-type targets toward expectedCountRange.min and scales per-type spacing floors up by (1+sparsity). At 1, global density is at the minimum the ranges allow.",
      }),
      rarityFidelity: Type.Number({
        minimum: 0,
        maximum: 1,
        default: 1,
        description:
          "Exponent on official Weight in the deficit rotation. 1 reproduces official 1/Weight stratification among co-eligible types; 0 makes co-eligible types rotate evenly.",
      }),
      siteSpacingTiles: Type.Integer({
        minimum: 1,
        maximum: 6,
        default: 3,
        description:
          "Cross-type blue-noise floor between candidate sites (official Poisson average spacing is 3). Never decays during selection.",
      }),
      perTypeSpacingFloorScale: Type.Number({
        minimum: 0.5,
        maximum: 3,
        default: 1,
        description:
          "Scales the per-type same-type spacing floors (3 for common types with target >= 12, 4 otherwise).",
      }),
      equityMaxDensityRatio: Type.Number({
        minimum: 1,
        maximum: 4,
        default: 1.8,
        description:
          "Per-landmass density ceiling relative to the mean across qualifying landmasses (>=10% of land); rotation skips sites on landmasses above the ceiling.",
      }),
      familyDensity: Type.Object(
        {
          aquatic: Type.Number({
            minimum: 0,
            maximum: 2,
            default: 1,
            description: "Density multiplier for aquatic resource targets.",
          }),
          cultivated: Type.Number({
            minimum: 0,
            maximum: 2,
            default: 1,
            description: "Density multiplier for cultivated resource targets.",
          }),
          terrestrial: Type.Number({
            minimum: 0,
            maximum: 2,
            default: 1,
            description: "Density multiplier for terrestrial resource targets.",
          }),
          geological: Type.Number({
            minimum: 0,
            maximum: 2,
            default: 1,
            description: "Density multiplier for geological resource targets.",
          }),
        },
        {
          additionalProperties: false,
          description: "Per-family density overrides multiplying targets before range clamping.",
        }
      ),
      affinityRules: Type.Array(ResourceAffinityRuleSchema, {
        default: [],
        description:
          "Resource-resource affinity/exclusion rules (E3.4). Exclusion makes a type ineligible within radius of the partner; affinity biases the rotation toward it.",
      }),
    },
    { additionalProperties: false }
  ),
});
