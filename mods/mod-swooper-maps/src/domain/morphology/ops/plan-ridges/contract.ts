import { Type, TypedArraySchemas, defineOp } from "@swooper/mapgen-core/authoring";

import { MountainsConfigSchema } from "../../config.js";

/**
 * Plans ridge (mountain) masks and diagnostic driver surfaces from tectonic belt drivers.
 *
 * This op is intentionally limited to ridges/mountains. Foothills (hills) are planned by a separate op
 * to keep concerns and downstream composition explicit.
 */
const PlanRidgesContract = defineOp({
  kind: "plan",
  id: "morphology/plan-ridges",
  input: Type.Object({
    width: Type.Integer({ minimum: 1, description: "Map width in tiles." }),
    height: Type.Integer({ minimum: 1, description: "Map height in tiles." }),
    landMask: TypedArraySchemas.u8({ description: "Land mask per tile (1=land, 0=water)." }),
    boundaryCloseness: TypedArraySchemas.u8({ description: "Boundary proximity per tile (0..255)." }),
    boundaryType: TypedArraySchemas.u8({ description: "Boundary type per tile (BOUNDARY_TYPE values)." }),
    upliftPotential: TypedArraySchemas.u8({ description: "Uplift potential per tile (0..255)." }),
    riftPotential: TypedArraySchemas.u8({ description: "Rift potential per tile (0..255)." }),
    tectonicStress: TypedArraySchemas.u8({ description: "Tectonic stress per tile (0..255)." }),
    fractalMountain: TypedArraySchemas.i16({ description: "Fractal noise for mountain scores." }),
  }),
  output: Type.Object({
    mountainMask: TypedArraySchemas.u8({ description: "Mask (1/0): mountain tiles." }),
    orogenyPotential01: TypedArraySchemas.u8({
      description: "Orogeny potential per tile (0..255). Diagnostic driver surface (physics-gated).",
    }),
    fracture01: TypedArraySchemas.u8({
      description: "Fracture proxy per tile (0..255). Diagnostic driver surface (physics-gated).",
    }),
  }),
  strategies: {
    default: MountainsConfigSchema,
  },
});

export default PlanRidgesContract;

