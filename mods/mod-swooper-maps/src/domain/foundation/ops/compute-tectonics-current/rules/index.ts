import type { Static } from "@swooper/mapgen-core/authoring/contracts";

type FoundationTectonics = Static<
  typeof import("../../../artifacts/current-tectonics.artifact.js").artifact.schema
>;
type FoundationTectonicEraFieldsInternalList = Static<
  typeof import("../../../artifacts/tectonic-era-fields.artifact.js").artifact.schema
>;

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
