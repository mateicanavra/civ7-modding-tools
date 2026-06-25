import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Reconciles the heightfield with a freshly-carved coastline.
 *
 * Coast carving turns some land into water (the coast ring), so land/water,
 * elevation, and bathymetry must be brought back into a consistent state:
 *  - carved coast tiles become water; every other tile keeps its carved class;
 *  - land below sea level is lifted to a minimal land elevation, water above
 *    sea level is dropped to sea level (so elevation agrees with the class);
 *  - bathymetry is re-derived as min(0, elevation - seaLevel) on water, 0 on land.
 *
 * This is the pure core of the side effect that the carving step performs on the
 * shared heightfield. The op returns NEW {landMask, elevation, bathymetry} arrays
 * and never mutates its inputs; the step is the only place allowed to copy the
 * result back into the shared `context.buffers.heightfield` + topography buffers.
 */
const ReconcileHeightfieldFromCoastContract = defineOp({
  kind: "compute",
  id: "morphology/reconcile-heightfield-from-coast",
  input: Type.Object({
    width: Type.Integer({ minimum: 1, description: "Map width in tiles." }),
    height: Type.Integer({ minimum: 1, description: "Map height in tiles." }),
    landMask: TypedArraySchemas.u8({
      description:
        "Carved candidate land mask (1=land, 0=water) before coast tiles are subtracted.",
    }),
    coastMask: TypedArraySchemas.u8({
      description: "Mask (1/0): water tiles carved as coast; these are forced to water.",
    }),
    elevation: TypedArraySchemas.i16({
      description: "Current elevation per tile (integer engine units). Read-only; never mutated.",
    }),
    seaLevel: Type.Number({
      description: "Global sea-level threshold in the same datum/units as elevation.",
    }),
  }),
  output: Type.Object({
    landMask: TypedArraySchemas.u8({
      description: "Reconciled land mask (1=land, 0=water) after subtracting carved coast.",
    }),
    elevation: TypedArraySchemas.i16({
      description:
        "Reconciled elevation: land lifted to >= seaLevel+1, water clamped to <= seaLevel.",
    }),
    bathymetry: TypedArraySchemas.i16({
      description: "Reconciled bathymetry: 0 on land; min(0, elevation - seaLevel) in water.",
    }),
  }),
  strategies: {
    default: Type.Object(
      {},
      {
        additionalProperties: false,
        description: "Parameter-free heightfield reconciliation from the carved coastline.",
      }
    ),
  },
});

export default ReconcileHeightfieldFromCoastContract;
