import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

/** Foundation plates artifact payload (tile-space plate tensors). */
export const Schema = Type.Object(
  {
    /** Plate id per tile. */
    id: TypedArraySchemas.i16({ description: "Plate id per tile." }),
    /** Boundary proximity per tile (0..255). */
    boundaryCloseness: TypedArraySchemas.u8({
      description: "Boundary proximity per tile (0..255).",
    }),
    /** Boundary type per tile (BOUNDARY_TYPE values). */
    boundaryType: TypedArraySchemas.u8({
      description: "Boundary type per tile (BOUNDARY_TYPE values).",
    }),
    /** Tectonic stress per tile (0..255). */
    tectonicStress: TypedArraySchemas.u8({ description: "Tectonic stress per tile (0..255)." }),
    /** Uplift potential per tile (0..255). */
    upliftPotential: TypedArraySchemas.u8({ description: "Uplift potential per tile (0..255)." }),
    /** Rift potential per tile (0..255). */
    riftPotential: TypedArraySchemas.u8({ description: "Rift potential per tile (0..255)." }),
    /** Shield stability per tile (0..255). */
    shieldStability: TypedArraySchemas.u8({ description: "Shield stability per tile (0..255)." }),
    /** Volcanism per tile (0..255). */
    volcanism: TypedArraySchemas.u8({ description: "Volcanism per tile (0..255)." }),
    /** Plate movement U component per tile (-127..127). */
    movementU: TypedArraySchemas.i8({
      description: "Plate movement U component per tile (-127..127).",
    }),
    /** Plate movement V component per tile (-127..127). */
    movementV: TypedArraySchemas.i8({
      description: "Plate movement V component per tile (-127..127).",
    }),
    /** Plate rotation per tile (-127..127). */
    rotation: TypedArraySchemas.i8({ description: "Plate rotation per tile (-127..127)." }),
  },
  { description: "Foundation plates artifact payload (tile-space plate tensors)." }
);

export const artifact = defineArtifact({
  name: "foundationPlates",
  id: "artifact:map.foundationPlates",
  schema: Schema,
});
