import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import strategyDefinition from "./strategies/tectonic-potential/config.js";

/**
 * Derives a coherent land mask, elevation field, and bathymetry from Foundation truth.
 */
const ComputeLandmaskContract = defineOp({
  kind: "compute",
  id: "morphology/compute-landmask",
  input: Type.Object({
    width: Type.Integer({ minimum: 1, description: "Map width in tiles." }),
    height: Type.Integer({ minimum: 1, description: "Map height in tiles." }),
    elevation: TypedArraySchemas.i16({ description: "Elevation per tile (normalized units)." }),
    seaLevel: Type.Number({ description: "Sea level threshold." }),
    boundaryCloseness: TypedArraySchemas.u8({
      description: "Boundary proximity per tile (0..255).",
    }),
    boundaryType: TypedArraySchemas.u8({
      description: "Boundary type per tile (1=conv,2=div,3=trans).",
    }),
    upliftPotential: TypedArraySchemas.u8({
      description: "Uplift potential per tile (0..255).",
    }),
    riftPotential: TypedArraySchemas.u8({
      description: "Rift potential per tile (0..255).",
    }),
    tectonicStress: TypedArraySchemas.u8({
      description: "Tectonic stress per tile (0..255).",
    }),
    crustType: TypedArraySchemas.u8({
      description: "Foundation crust type per tile (0=oceanic, 1=continental).",
    }),
    crustMaturity: TypedArraySchemas.f32({
      description: "Foundation crust maturity per tile (0..1).",
    }),
    crustThickness: TypedArraySchemas.f32({
      description: "Foundation crust thickness proxy per tile (0..1).",
    }),
    crustDamage: TypedArraySchemas.u8({
      description: "Foundation crust damage per tile (0..255).",
    }),
    crustBaseElevation: TypedArraySchemas.f32({
      description: "Foundation crust base elevation proxy per tile (0..1).",
    }),
    crustStrength: TypedArraySchemas.f32({
      description: "Foundation crust strength proxy per tile (0..1).",
    }),
    crustAge: TypedArraySchemas.u8({
      description: "Foundation crust age bucket per tile (0..255).",
    }),
    provenanceOriginEra: TypedArraySchemas.u8({
      description: "Foundation provenance origin era per tile (0..eraCount-1).",
    }),
    provenanceDriftDistance: TypedArraySchemas.u8({
      description: "Foundation provenance drift distance bucket per tile (0..255).",
    }),
    riftPotentialByEra: Type.Array(TypedArraySchemas.u8({ cardinality: ["width", "height"] }), {
      description:
        "Rift potential per tile (0..255) for each tectonic era (oldest..newest). Used for time-stepped rift-driven craton growth.",
    }),
    fractureTotal: TypedArraySchemas.u8({
      description: "Accumulated fracture total per tile (0..255) from Foundation history rollups.",
    }),
    upliftTotal: TypedArraySchemas.u8({
      description: "Accumulated uplift total per tile (0..255) from Foundation history rollups.",
    }),
    volcanismTotal: TypedArraySchemas.u8({
      description: "Accumulated volcanism total per tile (0..255) from Foundation history rollups.",
    }),
    upliftRecentFraction: TypedArraySchemas.u8({
      description: "Fraction of uplift attributable to recent eras per tile (0..255).",
    }),
    lastActiveEra: TypedArraySchemas.u8({
      description: "Most recent active era per tile (0..eraCount-1) or 255 when inactive.",
    }),
    movementU: TypedArraySchemas.i8({
      description: "Plate movement U component per tile (-127..127) from Foundation plate tensors.",
    }),
    movementV: TypedArraySchemas.i8({
      description: "Plate movement V component per tile (-127..127) from Foundation plate tensors.",
    }),
  }),
  output: Type.Object({
    landMask: TypedArraySchemas.u8({
      description: "Reconciled land mask per tile (1=land, 0=water).",
    }),
    elevation: TypedArraySchemas.i16({
      description:
        "Reconciled elevation: land is above sea level and water is at or below sea level.",
    }),
    seaLevel: Type.Number({
      description: "Sea-level datum used to reconcile surface class, elevation, and bathymetry.",
    }),
    bathymetry: TypedArraySchemas.i16({
      description: "Reconciled bathymetry: 0 on land and elevation minus sea level in water.",
    }),
  }),
  strategies: [strategyDefinition],
});

export default ComputeLandmaskContract;
