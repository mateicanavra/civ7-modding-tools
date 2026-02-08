import { Type, TypedArraySchemas, defineOp } from "@swooper/mapgen-core/authoring";

import { MountainsConfigSchema } from "../../config.js";

/**
 * Plans foothill (hill) masks adjacent to ridges/mountain corridors.
 *
 * This op intentionally consumes the ridge (mountain) mask so hills remain a distinct,
 * non-overlapping class.
 */
const PlanFoothillsContract = defineOp({
  kind: "plan",
  id: "morphology/plan-foothills",
  input: Type.Object({
    width: Type.Integer({ minimum: 1, description: "Map width in tiles." }),
    height: Type.Integer({ minimum: 1, description: "Map height in tiles." }),
    landMask: TypedArraySchemas.u8({ description: "Land mask per tile (1=land, 0=water)." }),
    mountainMask: TypedArraySchemas.u8({ description: "Mask (1/0): mountain tiles to exclude from hills." }),
    boundaryCloseness: TypedArraySchemas.u8({ description: "Boundary proximity per tile (0..255)." }),
    boundaryType: TypedArraySchemas.u8({ description: "Boundary type per tile (BOUNDARY_TYPE values)." }),
    upliftPotential: TypedArraySchemas.u8({ description: "Uplift potential per tile (0..255)." }),
    riftPotential: TypedArraySchemas.u8({ description: "Rift potential per tile (0..255)." }),
    tectonicStress: TypedArraySchemas.u8({ description: "Tectonic stress per tile (0..255)." }),
    fractalHill: TypedArraySchemas.i16({ description: "Fractal noise for hill scores." }),
  }),
  output: Type.Object({
    hillMask: TypedArraySchemas.u8({ description: "Mask (1/0): hill tiles (excluding mountains)." }),
  }),
  strategies: {
    default: MountainsConfigSchema,
  },
});

export default PlanFoothillsContract;

