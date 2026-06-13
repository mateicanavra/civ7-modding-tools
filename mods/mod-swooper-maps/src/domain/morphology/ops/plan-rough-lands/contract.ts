import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring";

import { MountainsConfigSchema } from "../mountains-shared/config.js";

/**
 * Plans non-foothill hill terrain from inherited relief surfaces.
 *
 * Ridges own mountain spines and foothills own ridge skirts. This op owns the
 * broader eroded/uplifted rough-land footprint: rolling uplands, old highlands,
 * plateau rims, basin margins, rift shoulders, and escarpments.
 */
const PlanRoughLandsContract = defineOp({
  kind: "plan",
  id: "morphology/plan-rough-lands",
  input: Type.Object({
    width: Type.Integer({ minimum: 1, description: "Map width in tiles." }),
    height: Type.Integer({ minimum: 1, description: "Map height in tiles." }),
    landMask: TypedArraySchemas.u8({ description: "Land mask per tile (1=land, 0=water)." }),
    mountainMask: TypedArraySchemas.u8({
      description: "Mask (1/0): mountain tiles to exclude from rough-land hills.",
    }),
    mountainRegionMask: TypedArraySchemas.u8({
      description:
        "Mask (1/0): mountain-region footprint used to score internal highlands, passes, and valley margins.",
    }),
    mountainRegionIdByTile: TypedArraySchemas.i32({
      description: "Per-tile mountain-region id (-1 outside mountain-region footprint).",
    }),
    foothillMask: TypedArraySchemas.u8({
      description: "Mask (1/0): ridge-skirt hill tiles to exclude from rough-land hills.",
    }),
    elevation: TypedArraySchemas.i16({ description: "Post-erosion Morphology elevation." }),
    seaLevel: Type.Number({ description: "Morphology sea level datum." }),
    boundaryCloseness: TypedArraySchemas.u8({
      description: "Boundary proximity per tile (0..255).",
    }),
    boundaryType: TypedArraySchemas.u8({
      description: "Boundary type per tile (BOUNDARY_TYPE values).",
    }),
    upliftPotential: TypedArraySchemas.u8({ description: "Uplift potential per tile (0..255)." }),
    riftPotential: TypedArraySchemas.u8({ description: "Rift potential per tile (0..255)." }),
    tectonicStress: TypedArraySchemas.u8({ description: "Tectonic stress per tile (0..255)." }),
    beltAge: TypedArraySchemas.u8({
      description: "Normalized belt age proxy per tile (0..255). 0=youngest, 255=oldest.",
    }),
    erodibilityK: TypedArraySchemas.f32({
      description: "Substrate erodibility / resistance proxy.",
    }),
    sedimentDepth: TypedArraySchemas.f32({
      description: "Loose sediment thickness proxy.",
    }),
    flowAccum: TypedArraySchemas.f32({ description: "Drainage accumulation proxy." }),
    distanceToCoast: TypedArraySchemas.u16({ description: "Hex distance to nearest coast." }),
    fractalRoughLand: TypedArraySchemas.i16({
      description:
        "Fractal roughness texture used as a minor score term and clustering/tie-break signal for rough-land patches.",
    }),
  }),
  output: Type.Object({
    hillMask: TypedArraySchemas.u8({
      description: "Mask (1/0): non-foothill rough-land hill tiles, excluding mountains.",
    }),
    roughnessPotential: TypedArraySchemas.u8({
      description: "Diagnostic rough-land potential (0..255) before capped selection.",
    }),
  }),
  strategies: {
    default: MountainsConfigSchema,
  },
});

export default PlanRoughLandsContract;
