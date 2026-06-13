import type { FoundationTectonicEraFieldsInternal } from "../../../lib/tectonics/internal-contract.js";
import type { FoundationTectonics } from "../../../lib/tectonics/schemas.js";

export function buildTectonicsCurrent(params: {
  newestEra: FoundationTectonicEraFieldsInternal;
  upliftTotal: Uint8Array;
}): FoundationTectonics {
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
