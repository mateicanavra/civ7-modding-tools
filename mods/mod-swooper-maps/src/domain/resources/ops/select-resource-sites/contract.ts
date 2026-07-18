import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { ResourceRegionMinimumRequirementSchema } from "../../model/schemas/region-minimum-requirement.schema.js";
import {
  ResourceFamilySchema,
  ResourceSymbolSchema,
} from "../../model/schemas/resource-family.schema.js";
import {
  ResourceAffinityRuleSchema,
  ResourceLaneKindSchema,
  ResourceSitePlanSchema,
} from "../../model/schemas/resource-site-plan.schema.js";

/**
 * Resource site selection (placement-realignment S3 step 3).
 *
 * Emits typed per-plot resource intents (D4 plan-authority shape) from
 * per-type demand rows (weight, expectedCountRange gates, habitat + policy
 * legality masks). Selection is inhomogeneous-Poisson/blue-noise: a
 * deterministic hash-ordered site stream with a cross-type spacing floor,
 * thinned by habitat intensity (aggregation above the floor comes from
 * intensity, never from sub-floor clustering), with the official weight
 * DEFICIT rotation deciding the type at each shared site (pick max running
 * weight, subtract weight on placement → frequency ∝ 1/Weight among
 * co-eligible types). Range-floor and per-landmass-region minimum passes run
 * after rotation with typed provenance; shortfalls are recorded, never
 * silently rescued.
 */

const DemandRowSchema = Type.Object(
  {
    resourceType: ResourceSymbolSchema,
    family: ResourceFamilySchema,
    laneId: Type.String(),
    laneKind: ResourceLaneKindSchema,
    weight: Type.Number({
      minimum: 1,
      description: "Official GameInfo.Resources Weight (deficit-rotation denominator).",
    }),
    targetCount: Type.Integer({ minimum: 0 }),
    minCount: Type.Integer({ minimum: 0 }),
    maxCount: Type.Integer({ minimum: 0 }),
    regionMinimumRequirement: ResourceRegionMinimumRequirementSchema,
    habitatMask: TypedArraySchemas.u8({
      shape: null,
      description: "Habitat lane eligibility (1=in-lane).",
    }),
    legalMask: TypedArraySchemas.u8({
      shape: null,
      description: "Per-resource policy legality from Resource_ValidPlacements rows (1=legal).",
    }),
    intensity: TypedArraySchemas.f32({
      shape: null,
      description: "Habitat intensity (0..1) modulating site acceptance within the lane.",
    }),
  },
  { additionalProperties: false }
);

/**
 * Admits deterministic concrete site selection from typed per-resource demands, habitat/policy
 * masks, landmass regions, and one seed. Its output carries intent provenance, range/region
 * shortfalls, spacing floors, and pair settings: exclusion gates destinations while affinity is
 * a best-effort scoring bias.
 */
const SelectResourceSitesContract = defineOp({
  kind: "plan",
  id: "resources/select-resource-sites",
  input: Type.Object(
    {
      width: Type.Integer({ minimum: 1 }),
      height: Type.Integer({ minimum: 1 }),
      seed: Type.Integer({ description: "Deterministic seed (from setup.mapSeed)." }),
      landMask: TypedArraySchemas.u8({ description: "Land mask per tile (1=land)." }),
      lakeMask: TypedArraySchemas.u8({ description: "Lake mask per tile (1=lake)." }),
      landmassIdByTile: TypedArraySchemas.i32({
        description: "Landmass id per tile (-1 for water).",
      }),
      landmassTileCounts: Type.Array(Type.Integer({ minimum: 0 }), {
        description: "Tile count per landmass id (index-aligned).",
      }),
      regionSlotByTile: TypedArraySchemas.u8({
        description: "Landmass region slot per tile (0=none, 1=west, 2=east).",
      }),
      minimumAmountModifier: Type.Integer({
        description:
          "MapResourceMinimumAmountModifier amount for the active map type/size (added to MinimumPerHemisphere).",
      }),
      demands: Type.Array(DemandRowSchema),
    },
    { additionalProperties: false }
  ),
  output: ResourceSitePlanSchema,
  strategies: {
    default: Type.Object(
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
  },
});

export default SelectResourceSitesContract;
