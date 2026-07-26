import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import {
  ResourceFamilySchema,
  ResourceSymbolSchema,
} from "../../../../model/atoms/resource-family.schema.js";
import {
  ResourceLaneKindSchema,
  ResourceSitePlanSchema,
} from "../../../../model/atoms/resource-site-plan.schema.js";
import { ResourceRegionMinimumRequirementSchema } from "../../model/atoms/region-minimum-requirement.schema.js";
import blueNoiseRotationDefinition from "./strategies/blue-noise-rotation/config.js";

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
      cardinality: ["width", "height"],
      description: "Habitat lane eligibility (1=in-lane).",
    }),
    legalMask: TypedArraySchemas.u8({
      cardinality: ["width", "height"],
      description: "Per-resource policy legality from Resource_ValidPlacements rows (1=legal).",
    }),
    intensity: TypedArraySchemas.f32({
      cardinality: ["width", "height"],
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
  strategies: [blueNoiseRotationDefinition],
});

export default SelectResourceSitesContract;
