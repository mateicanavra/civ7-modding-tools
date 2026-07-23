import type { TectonicEraFields } from "../../../model/atoms/tectonic-era-fields.schema.js";

type CurrentTectonics = Readonly<{
  boundaryType: Uint8Array;
  upliftPotential: Uint8Array;
  riftPotential: Uint8Array;
  shearStress: Uint8Array;
  volcanism: Uint8Array;
  fracture: Uint8Array;
  cumulativeUplift: Uint8Array;
}>;
/**
 * Combines the newest reconstructed era with cumulative uplift into present-day tectonic evidence.
 * It deliberately preserves the admitted buffers; the pipeline's write-once artifact boundary owns
 * evidence immutability rather than this projection performing redundant copies.
 */
export function buildTectonicsCurrent(params: {
  newestEra: TectonicEraFields;
  upliftTotal: Uint8Array;
}): CurrentTectonics {
  return {
    boundaryType: params.newestEra.boundaryType,
    upliftPotential: params.newestEra.upliftPotential,
    riftPotential: params.newestEra.riftPotential,
    shearStress: params.newestEra.shearStress,
    volcanism: params.newestEra.volcanism,
    fracture: params.newestEra.fracture,
    cumulativeUplift: params.upliftTotal,
  };
}
