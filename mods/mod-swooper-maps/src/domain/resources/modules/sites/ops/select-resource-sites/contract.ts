import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import {
  ResourcePlanPerTypeSchema,
  ResourcePlanRegionMinimumSchema,
  ResourcePlanSettingsSchema,
} from "../../../../model/atoms/resource-plan-evidence.schema.js";
import { ResourcePlanIntentSchema } from "../../../../model/atoms/resource-site-intent.schema.js";
import { ResourceDemandRowSchema } from "../../../demand/model/atoms/resource-demand.schema.js";
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
      demands: Type.Array(ResourceDemandRowSchema),
    },
    { additionalProperties: false }
  ),
  output: Type.Object(
    {
      width: Type.Integer({ minimum: 1 }),
      height: Type.Integer({ minimum: 1 }),
      seed: Type.Integer(),
      plannedCount: Type.Integer({ minimum: 0 }),
      rotationCount: Type.Integer({ minimum: 0 }),
      rangeFloorCount: Type.Integer({ minimum: 0 }),
      regionMinimumCount: Type.Integer({ minimum: 0 }),
      siteSpacingTiles: Type.Integer({ minimum: 0 }),
      equitySkippedSiteCount: Type.Integer({ minimum: 0 }),
      intents: Type.Array(ResourcePlanIntentSchema),
      perType: Type.Array(ResourcePlanPerTypeSchema),
      regionMinimums: Type.Array(ResourcePlanRegionMinimumSchema),
      settings: ResourcePlanSettingsSchema,
    },
    {
      additionalProperties: false,
      description:
        "Deterministic resource-site plan with symbolic intents, per-type counts, regional obligations, and the settings that produced them.",
    }
  ),
  strategies: [blueNoiseRotationDefinition],
});

export default SelectResourceSitesContract;
