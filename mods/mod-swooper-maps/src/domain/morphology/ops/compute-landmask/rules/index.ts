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
  crustType: Uint8Array;
  crustBaseElevation: Float32Array;
  crustAge: Uint8Array;
  provenanceOriginEra: Uint8Array;
  provenanceDriftDistance: Uint8Array;
} {
  const { width, height } = input;
  const size = Math.max(0, (width | 0) * (height | 0));
  const elevation = input.elevation as Int16Array;
  const boundaryCloseness = input.boundaryCloseness as Uint8Array;
  const crustType = input.crustType as Uint8Array;
  const crustBaseElevation = input.crustBaseElevation as Float32Array;
  const crustAge = input.crustAge as Uint8Array;
  const provenanceOriginEra = input.provenanceOriginEra as Uint8Array;
  const provenanceDriftDistance = input.provenanceDriftDistance as Uint8Array;

  if (
    elevation.length !== size ||
    boundaryCloseness.length !== size ||
    crustType.length !== size ||
    crustBaseElevation.length !== size ||
    crustAge.length !== size ||
    provenanceOriginEra.length !== size ||
    provenanceDriftDistance.length !== size
  ) {
    throw new Error("[Landmask] Input tensors must match width*height.");
  }

  return {
    size,
    elevation,
    boundaryCloseness,
    crustType,
    crustBaseElevation,
    crustAge,
    provenanceOriginEra,
    provenanceDriftDistance,
  };
}
