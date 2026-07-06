import type { Artifact as FoundationTectonics } from "../../../artifacts/current-tectonics.artifact.js";
import type { Artifact as FoundationTectonicEraFieldsInternalList } from "../../../artifacts/tectonic-era-fields.artifact.js";

type FoundationTectonicEraFieldsInternal = FoundationTectonicEraFieldsInternalList[number];

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
