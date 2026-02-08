import type { ComputeLandmaskTypes } from "../types.js";

/**
 * Ensures landmask inputs match the expected map size.
 */
export function validateLandmaskInputs(
  input: ComputeLandmaskTypes["input"]
): {
  size: number;
  elevation: Int16Array;
  boundaryCloseness: Uint8Array;
  boundaryType: Uint8Array;
  upliftPotential: Uint8Array;
  riftPotential: Uint8Array;
  tectonicStress: Uint8Array;
  crustType: Uint8Array;
  crustMaturity: Float32Array;
  crustThickness: Float32Array;
  crustDamage: Uint8Array;
  crustBaseElevation: Float32Array;
  crustStrength: Float32Array;
  crustAge: Uint8Array;
  provenanceOriginEra: Uint8Array;
  provenanceDriftDistance: Uint8Array;
  riftPotentialByEra: Uint8Array[];
  fractureTotal: Uint8Array;
  upliftTotal: Uint8Array;
  volcanismTotal: Uint8Array;
  upliftRecentFraction: Uint8Array;
  lastActiveEra: Uint8Array;
  movementU: Int8Array;
  movementV: Int8Array;
} {
  const { width, height } = input;
  const size = Math.max(0, (width | 0) * (height | 0));
  const elevation = input.elevation as Int16Array;
  const boundaryCloseness = input.boundaryCloseness as Uint8Array;
  const boundaryType = input.boundaryType as Uint8Array;
  const upliftPotential = input.upliftPotential as Uint8Array;
  const riftPotential = input.riftPotential as Uint8Array;
  const tectonicStress = input.tectonicStress as Uint8Array;
  const crustType = input.crustType as Uint8Array;
  const crustMaturity = input.crustMaturity as Float32Array;
  const crustThickness = input.crustThickness as Float32Array;
  const crustDamage = input.crustDamage as Uint8Array;
  const crustBaseElevation = input.crustBaseElevation as Float32Array;
  const crustStrength = input.crustStrength as Float32Array;
  const crustAge = input.crustAge as Uint8Array;
  const provenanceOriginEra = input.provenanceOriginEra as Uint8Array;
  const provenanceDriftDistance = input.provenanceDriftDistance as Uint8Array;
  const riftPotentialByEra = input.riftPotentialByEra as Uint8Array[];
  const fractureTotal = input.fractureTotal as Uint8Array;
  const upliftTotal = input.upliftTotal as Uint8Array;
  const volcanismTotal = input.volcanismTotal as Uint8Array;
  const upliftRecentFraction = input.upliftRecentFraction as Uint8Array;
  const lastActiveEra = input.lastActiveEra as Uint8Array;
  const movementU = input.movementU as Int8Array;
  const movementV = input.movementV as Int8Array;

  if (
    elevation.length !== size ||
    boundaryCloseness.length !== size ||
    boundaryType.length !== size ||
    upliftPotential.length !== size ||
    riftPotential.length !== size ||
    tectonicStress.length !== size ||
    crustType.length !== size ||
    crustMaturity.length !== size ||
    crustThickness.length !== size ||
    crustDamage.length !== size ||
    crustBaseElevation.length !== size ||
    crustStrength.length !== size ||
    crustAge.length !== size ||
    provenanceOriginEra.length !== size ||
    provenanceDriftDistance.length !== size ||
    fractureTotal.length !== size ||
    upliftTotal.length !== size ||
    volcanismTotal.length !== size ||
    upliftRecentFraction.length !== size ||
    lastActiveEra.length !== size ||
    movementU.length !== size ||
    movementV.length !== size
  ) {
    throw new Error("[Landmask] Input tensors must match width*height.");
  }

  if (!Array.isArray(riftPotentialByEra) || riftPotentialByEra.length <= 0) {
    throw new Error("[Landmask] Expected riftPotentialByEra to be a non-empty array.");
  }
  for (let e = 0; e < riftPotentialByEra.length; e++) {
    const era = riftPotentialByEra[e];
    if (!(era instanceof Uint8Array)) {
      throw new Error(`[Landmask] Expected riftPotentialByEra[${e}] to be Uint8Array.`);
    }
    if (era.length !== size) {
      throw new Error(`[Landmask] Expected riftPotentialByEra[${e}] length ${size}.`);
    }
  }

  return {
    size,
    elevation,
    boundaryCloseness,
    boundaryType,
    upliftPotential,
    riftPotential,
    tectonicStress,
    crustType,
    crustMaturity,
    crustThickness,
    crustDamage,
    crustBaseElevation,
    crustStrength,
    crustAge,
    provenanceOriginEra,
    provenanceDriftDistance,
    riftPotentialByEra,
    fractureTotal,
    upliftTotal,
    volcanismTotal,
    upliftRecentFraction,
    lastActiveEra,
    movementU,
    movementV,
  };
}
